import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/tags - Get popular tags for suggestions
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q')

    if (query) {
      // Search tags
      const tags = await prisma.tag.findMany({
        where: {
          name: {
            contains: query,
            mode: 'insensitive',
          },
        },
        take: 10,
        orderBy: {
          pins: {
            _count: 'desc',
          },
        },
      })

      return NextResponse.json(tags.map(t => t.name))
    }

    // Get popular tags
    const tags = await prisma.tag.findMany({
      take: 20,
      orderBy: {
        pins: {
          _count: 'desc',
        },
      },
    })

    return NextResponse.json(tags.map(t => t.name))
  } catch (error) {
    console.error('[TAGS_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
