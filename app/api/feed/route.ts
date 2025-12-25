import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

export async function GET(req: Request) {
  try {
    const { userId } = await auth()
    const { searchParams } = new URL(req.url)

    // Pagination
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    // Filters
    const category = searchParams.get("category")
    const costLevel = searchParams.get("costLevel")
    const tag = searchParams.get("tag")
    const location = searchParams.get("location")
    const sortBy = searchParams.get("sortBy") || "recent" // recent, popular, trending

    // Build where clause
    const where: Prisma.PinWhereInput = {
      AND: [],
    }

    if (category) {
      where.category = category
    }

    if (costLevel) {
      where.costLevel = costLevel as any
    }

    if (tag) {
      where.tags = {
        some: {
          tag: {
            name: {
              equals: tag,
              mode: "insensitive",
            },
          },
        },
      }
    }

    if (location) {
      where.location = {
        contains: location,
        mode: "insensitive",
      }
    }

    // Personalization: Get user's context if authenticated
    let user = null
    let followedUserIds: string[] = []
    let savedPinIds: string[] = []

    if (userId) {
      user = await prisma.user.findUnique({
        where: { clerkId: userId },
        include: {
          following: {
            select: { followingId: true },
          },
          likes: {
            select: { pinId: true },
          },
        },
      })

      if (user) {
        followedUserIds = user.following.map((f) => f.followingId)
        savedPinIds = user.likes.map((l) => l.pinId)
      }
    }

    // Determine sort order
    let orderBy: Prisma.PinOrderByWithRelationInput[] = []

    switch (sortBy) {
      case "popular":
        orderBy = [{ likes: { _count: "desc" } }, { createdAt: "desc" }]
        break
      case "trending":
        // Trending: most likes in last 7 days
        where.createdAt = {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        }
        orderBy = [{ likes: { _count: "desc" } }, { createdAt: "desc" }]
        break
      case "recent":
      default:
        orderBy = [{ createdAt: "desc" }]
        break
    }

    // Fetch pins
    const [pins, totalCount] = await Promise.all([
      prisma.pin.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              imageUrl: true,
            },
          },
          images: true,
          tags: {
            include: {
              tag: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.pin.count({ where }),
    ])

    // Add personalization metadata to each pin
    const enhancedPins = pins.map((pin) => ({
      ...pin,
      isLiked: savedPinIds.includes(pin.id),
      isFromFollowedUser: followedUserIds.includes(pin.userId),
    }))

    // Calculate personalized ranking score if user is authenticated
    if (user && sortBy === "recent") {
      enhancedPins.sort((a, b) => {
        let scoreA = 0
        let scoreB = 0

        // Boost from followed users
        if (a.isFromFollowedUser) scoreA += 10
        if (b.isFromFollowedUser) scoreB += 10

        // Boost from liked pins (similar content)
        if (a.isLiked) scoreA += 5
        if (b.isLiked) scoreB += 5

        // Boost from popular pins
        scoreA += Math.log(a._count.likes + 1)
        scoreB += Math.log(b._count.likes + 1)

        // Recent pins get higher score
        const hoursSinceA =
          (Date.now() - new Date(a.createdAt).getTime()) / (1000 * 60 * 60)
        const hoursSinceB =
          (Date.now() - new Date(b.createdAt).getTime()) / (1000 * 60 * 60)

        scoreA += Math.max(0, 24 - hoursSinceA) / 10
        scoreB += Math.max(0, 24 - hoursSinceB) / 10

        return scoreB - scoreA
      })
    }

    return NextResponse.json({
      pins: enhancedPins,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + pins.length < totalCount,
      },
    })
  } catch (error) {
    console.error("[FEED_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
