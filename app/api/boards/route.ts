import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/boards - Create a new board
export async function POST(req: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return new NextResponse('User not found', { status: 404 })
    }

    const body = await req.json()
    const {
      name,
      description,
      subtitle,
      category,
      tripCategory,
      visibility,
      layoutMode,
      themeColor,
      coverImage,
      autoGenCover,
      hashtags,
    } = body

    // Create board and log activity
    const board = await prisma.$transaction(async (tx) => {
      const newBoard = await tx.board.create({
        data: {
          name,
          description,
          subtitle,
          category: category || 'DREAM',
          tripCategory,
          visibility: visibility || 'PRIVATE',
          layoutMode: layoutMode || 'MASONRY',
          themeColor: themeColor || 'TRAVEL_BLUE',
          coverImage,
          autoGenCover: autoGenCover || false,
          hashtags: hashtags || [],
          userId: user.id,
        },
        include: {
          pins: {
            take: 3,
            include: {
              pin: {
                include: {
                  images: {
                    take: 1,
                  },
                },
              },
            },
          },
          _count: {
            select: {
              pins: true,
              followers: true,
              likes: true,
            },
          },
        },
      })

      // Log board creation activity
      await tx.boardActivityLog.create({
        data: {
          boardId: newBoard.id,
          userId: user.id,
          activityType: 'CREATED',
          metadata: JSON.stringify({
            boardName: newBoard.name,
            category: newBoard.category,
          }),
        },
      })

      return newBoard
    })

    return NextResponse.json(board)
  } catch (error) {
    console.error('[BOARDS_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// GET /api/boards - Get user's boards
export async function GET(req: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return new NextResponse('User not found', { status: 404 })
    }

    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const visibility = searchParams.get('visibility')
    const sortBy = searchParams.get('sortBy') || 'recent' // recent, popular, trending

    // Build where clause
    const whereClause: any = {
      userId: user.id,
      ...(category && { category: category as any }),
      ...(visibility && { visibility: visibility as any }),
    }

    // Add trending filter (created in the last 7 days)
    if (sortBy === 'trending') {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      whereClause.createdAt = { gte: sevenDaysAgo }
    }

    // Determine orderBy based on sortBy parameter
    let orderBy: any = { createdAt: 'desc' } // Default: recent

    if (sortBy === 'popular') {
      // For popular, we'll sort in application code after fetching
      // because we need to calculate total engagement (likes + comments)
      orderBy = { createdAt: 'desc' }
    }

    const boards = await prisma.board.findMany({
      where: whereClause,
      include: {
        pins: {
          take: 3,
          include: {
            pin: {
              include: {
                images: {
                  take: 1,
                },
              },
            },
          },
        },
        _count: {
          select: {
            pins: true,
            followers: true,
            likes: true,
            comments: true,
          },
        },
      },
      orderBy,
    })

    // Sort by popularity if requested (likes + comments)
    if (sortBy === 'popular') {
      boards.sort((a, b) => {
        const aEngagement = a._count.likes + a._count.comments
        const bEngagement = b._count.likes + b._count.comments
        return bEngagement - aEngagement
      })
    }

    // Sort by trending if requested (recent posts with high engagement)
    if (sortBy === 'trending') {
      boards.sort((a, b) => {
        const aEngagement = a._count.likes + a._count.comments
        const bEngagement = b._count.likes + b._count.comments
        return bEngagement - aEngagement
      })
    }

    return NextResponse.json(boards)
  } catch (error) {
    console.error('[BOARDS_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
