import { MapExplorer } from "@/components/map/map-explorer"
import { Header } from "@/components/layout/header"
import { prisma } from "@/lib/prisma"

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;

  // Build where clause with tag filter if provided
  const whereClause: any = {
    AND: [
      { latitude: { not: null } },
      { longitude: { not: null } },
    ],
  };

  // Add tag filter if tag query parameter is provided
  if (tag) {
    whereClause.tags = {
      some: {
        tag: {
          name: tag,
        },
      },
    };
  }

  // Fetch pins with location data
  const pins = await prisma.pin.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
        },
      },
      images: {
        take: 1,
      },
      tags: {
        include: {
          tag: true,
        },
      },
    },
    take: 100,
  })

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <MapExplorer pins={pins} filterTag={tag} />
    </div>
  )
}
