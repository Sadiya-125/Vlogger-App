import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { prisma } from "@/lib/prisma";
import { PinDetailClient } from "@/components/pins/pin-detail-client";

interface PinPageProps {
  params: Promise<{
    pinId: string;
  }>;
}

export default async function PinPage({ params }: PinPageProps) {
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
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
  });

  if (!pin) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <PinDetailClient pin={pin} />
    </div>
  );
}
