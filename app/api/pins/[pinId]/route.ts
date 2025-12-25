import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/pins/[pinId]
export async function GET(
  req: Request,
  { params }: { params: Promise<{ pinId: string }> }
) {
  try {
    const { pinId } = await params;
    const pin = await prisma.pin.findUnique({
      where: { id: pinId },
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
        comments: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                imageUrl: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        likes: true,
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    })

    if (!pin) {
      return new NextResponse('Pin not found', { status: 404 })
    }

    return NextResponse.json(pin)
  } catch (error) {
    console.error('[PIN_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// PATCH /api/pins/[pinId]
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ pinId: string }> }
) {
  try {
    const { pinId } = await params;
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

    // Check ownership
    const existingPin = await prisma.pin.findUnique({
      where: { id: pinId },
    })

    if (!existingPin || existingPin.userId !== user.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { isVisited, ...updateData } = body

    const pin = await prisma.pin.update({
      where: { id: pinId },
      data: {
        ...updateData,
        ...(typeof isVisited === 'boolean' && { isVisited }),
      },
      include: {
        images: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    })

    return NextResponse.json(pin)
  } catch (error) {
    console.error('[PIN_PATCH]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// DELETE /api/pins/[pinId]
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ pinId: string }> }
) {
  try {
    const { pinId } = await params;
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

    const existingPin = await prisma.pin.findUnique({
      where: { id: pinId },
    })

    if (!existingPin || existingPin.userId !== user.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    await prisma.pin.delete({
      where: { id: pinId },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[PIN_DELETE]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
