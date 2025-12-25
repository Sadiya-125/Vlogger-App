import { Skeleton } from "@/components/ui/skeleton"

export function PinSkeleton() {
  // Random height between 300-500px for masonry effect
  const height = 300 + Math.floor(Math.random() * 200)

  return (
    <div
      className="break-inside-avoid mb-4 block"
      style={{ height: `${height}px` }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[18px] bg-card shadow-md">
        <Skeleton className="w-full h-full" />
      </div>
    </div>
  )
}

export function PinGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <PinSkeleton key={index} />
      ))}
    </div>
  )
}
