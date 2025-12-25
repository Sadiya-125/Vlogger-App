import { MapExplorer } from "@/components/map/map-explorer"
import { Header } from "@/components/layout/header"
import { prisma } from "@/lib/prisma"

export default async function ExplorePage() {
  // Fetch pins with location data
  const pins = await prisma.pin.findMany({
    where: {
      AND: [
        { latitude: { not: null } },
        { longitude: { not: null } },
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
      <MapExplorer pins={pins} />
    </div>
  )
}
