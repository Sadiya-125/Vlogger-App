import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/pins/[pinId]/save - Check if user saved the pin
export async function GET(
  req: Request,
  { params }: { params: Promise<{ pinId: string }> }
) {
  try {
    const { pinId } = await params;
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ saved: false })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return NextResponse.json({ saved: false })
    }

    const savedPin = await prisma.savedPin.findUnique({
      where: {
        userId_pinId: {
          userId: user.id,
          pinId,
        },
      },
    })

    return NextResponse.json({ saved: !!savedPin })
  } catch (error) {
    console.error('[PIN_SAVE_GET]', error)
    return NextResponse.json({ saved: false })
  }
}

// POST /api/pins/[pinId]/save - Toggle save
export async function POST(
  req: Request,
  { params }: { params: Promise<{ pinId: string }> }
) {
  try {
    const { pinId } = await params;
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      // Auto-create user from Clerk session
      const { clerkClient } = await import('@clerk/nextjs/server')
      const client = await clerkClient()
      const clerkUser = await client.users.getUser(userId)

      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          username: clerkUser.username || clerkUser.id,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          imageUrl: clerkUser.imageUrl,
        },
      })
    }

    // Check if already saved
    const existingSave = await prisma.savedPin.findUnique({
      where: {
        userId_pinId: {
          userId: user.id,
          pinId,
        },
      },
    })

    if (existingSave) {
      // Unsave
      await prisma.savedPin.delete({
        where: {
          id: existingSave.id,
        },
      })

      return NextResponse.json({ saved: false })
    } else {
      // Save
      await prisma.savedPin.create({
        data: {
          userId: user.id,
          pinId,
        },
      })

      return NextResponse.json({ saved: true })
    }
  } catch (error) {
    console.error('[PIN_SAVE]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
