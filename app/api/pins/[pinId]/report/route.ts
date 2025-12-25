import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/pins/[pinId]/report - Report a pin
export async function POST(
  req: Request,
  { params }: { params: Promise<{ pinId: string }> }
) {
  try {
    const { pinId } = await params;
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const body = await req.json();
    const { reason } = body;

    // Check if already reported
    const existingReport = await prisma.report.findUnique({
      where: {
        userId_pinId: {
          userId: user.id,
          pinId,
        },
      },
    });

    if (existingReport) {
      return NextResponse.json({
        reported: true,
        message: "You Have Already Reported this Pin",
      });
    }

    // Create report
    await prisma.report.create({
      data: {
        userId: user.id,
        pinId,
        reason: reason || null,
      },
    });

    // Get updated report count
    const reportCount = await prisma.report.count({
      where: { pinId },
    });

    return NextResponse.json({
      reported: true,
      reportCount,
      message: "Pin reported successfully",
    });
  } catch (error) {
    console.error("[PIN_REPORT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// GET /api/pins/[pinId]/report - Get report count for a pin
export async function GET(
  req: Request,
  { params }: { params: Promise<{ pinId: string }> }
) {
  try {
    const { pinId } = await params;

    const reportCount = await prisma.report.count({
      where: { pinId },
    });

    return NextResponse.json({ reportCount });
  } catch (error) {
    console.error("[PIN_REPORT_GET]", error);
    return NextResponse.json({ reportCount: 0 });
  }
}
