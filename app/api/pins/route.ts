import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/pins - Get all pins (public feed)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const cursor = searchParams.get('cursor')
    const limit = parseInt(searchParams.get('limit') || '20')
    const category = searchParams.get('category')
    const userId = searchParams.get('userId')
    const sortBy = searchParams.get('sortBy') || 'recent' // recent, popular, trending
    const q = searchParams.get('q') // search query

    // Build where clause
    const whereClause: any = {
      ...(category && { category }),
      ...(userId && { userId }),
    }

    // Add trending filter (created in the last 7 days)
    if (sortBy === 'trending') {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      whereClause.createdAt = { gte: sevenDaysAgo }
    }

    // Add search filter if query provided
    if (q) {
      whereClause.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { location: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } },
      ]
    }

    const pins = await prisma.pin.findMany({
      take: limit + 1,
      ...(cursor && {
        skip: 1,
        cursor: {
          id: cursor,
        },
      }),
      where: whereClause,
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
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Sort by popularity if requested (likes + comments)
    if (sortBy === 'popular') {
      pins.sort((a, b) => {
        const aEngagement = a._count.likes + a._count.comments
        const bEngagement = b._count.likes + b._count.comments
        return bEngagement - aEngagement
      })
    }

    // Sort by trending if requested (recent posts with high engagement)
    if (sortBy === 'trending') {
      pins.sort((a, b) => {
        const aEngagement = a._count.likes + a._count.comments
        const bEngagement = b._count.likes + b._count.comments
        return bEngagement - aEngagement
      })
    }

    let nextCursor: string | undefined = undefined
    if (pins.length > limit) {
      const nextItem = pins.pop()
      nextCursor = nextItem!.id
    }

    return NextResponse.json({
      pins,
      nextCursor,
    })
  } catch (error) {
    console.error('[PINS_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// POST /api/pins - Create a new pin
export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth()

    if (!clerkId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { clerkId },
    })

    if (!user) {
      // Auto-create user from Clerk session
      const { clerkClient } = await import('@clerk/nextjs/server')
      const client = await clerkClient()
      const clerkUser = await client.users.getUser(clerkId)

      user = await prisma.user.create({
        data: {
          clerkId,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          username: clerkUser.username || clerkUser.id,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          imageUrl: clerkUser.imageUrl,
        },
      })
    }

    const body = await req.json()
    const { title, description, location, latitude, longitude, category, costLevel, bestTimeToVisit, userNotes, boardId, tags, imageUrls } = body

    // Create pin with images and tags in a transaction
    const pin = await prisma.$transaction(async (tx) => {
      // Create the pin
      const newPin = await tx.pin.create({
        data: {
          title,
          description,
          location,
          latitude,
          longitude,
          category,
          costLevel,
          bestTimeToVisit,
          userNotes,
          userId: user.id,
        },
      })

      // Create images
      if (imageUrls && imageUrls.length > 0) {
        await tx.image.createMany({
          data: imageUrls.map((url: string) => ({
            url,
            pinId: newPin.id,
          })),
        })
      }

      // Handle tags
      if (tags && tags.length > 0) {
        for (const tagName of tags) {
          // Find or create tag
          const tag = await tx.tag.upsert({
            where: { name: tagName },
            create: { name: tagName },
            update: {},
          })

          // Link tag to pin
          await tx.tagOnPin.create({
            data: {
              pinId: newPin.id,
              tagId: tag.id,
            },
          })
        }
      }

      // Add pin to board if boardId is provided
      if (boardId) {
        await tx.boardPinRelation.create({
          data: {
            boardId,
            pinId: newPin.id,
          },
        })
      }

      // Return full pin with relations
      return tx.pin.findUnique({
        where: { id: newPin.id },
        include: {
          images: true,
          tags: {
            include: {
              tag: true,
            },
          },
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              imageUrl: true,
            },
          },
        },
      })
    })

    return NextResponse.json(pin)
  } catch (error) {
    console.error('[PINS_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
