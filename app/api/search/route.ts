import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get("q")
    const type = searchParams.get("type") || "all" // all, pins, users, boards, tags

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] })
    }

    const results: any = {
      pins: [],
      users: [],
      boards: [],
      tags: [],
    }

    // Search Pins
    if (type === "all" || type === "pins") {
      results.pins = await prisma.pin.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { location: { contains: query, mode: "insensitive" } },
          ],
        },
        include: {
          images: { take: 1 },
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              imageUrl: true,
            },
          },
          tags: { include: { tag: true } },
          _count: { select: { likes: true, comments: true } },
        },
        take: 10,
        orderBy: { createdAt: "desc" },
      })
    }

    // Search Users
    if (type === "all" || type === "users") {
      results.users = await prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: query, mode: "insensitive" } },
            { firstName: { contains: query, mode: "insensitive" } },
            { lastName: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          imageUrl: true,
          bio: true,
          _count: {
            select: {
              pins: true,
              followers: true,
            },
          },
        },
        take: 5,
      })
    }

    // Search Boards
    if (type === "all" || type === "boards") {
      results.boards = await prisma.board.findMany({
        where: {
          AND: [
            { visibility: "PUBLIC" },
            {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
              ],
            },
          ],
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: { select: { pins: true, followers: true, likes: true } },
          pins: {
            take: 3,
            include: {
              pin: {
                include: {
                  images: { take: 1 },
                },
              },
            },
          },
        },
        take: 5,
      })
    }

    // Search Tags
    if (type === "all" || type === "tags") {
      results.tags = await prisma.tag.findMany({
        where: {
          name: { contains: query, mode: "insensitive" },
        },
        include: {
          _count: { select: { pins: true } },
        },
        take: 10,
        orderBy: { pins: { _count: "desc" } },
      })
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error("[SEARCH_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
