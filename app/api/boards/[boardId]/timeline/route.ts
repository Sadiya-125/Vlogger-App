import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/boards/[boardId]/timeline - Get timeline for a board
export async function GET(
  req: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    const { boardId } = await params

    // Fetch timeline days with pins
    const timelineDays = await prisma.timelineDay.findMany({
      where: { boardId },
      include: {
        pins: {
          include: {
            pin: {
              include: {
                images: { take: 1 },
                user: {
                  select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        dayNumber: 'asc',
      },
    })

    return NextResponse.json(timelineDays)
  } catch (error) {
    console.error('[TIMELINE_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
