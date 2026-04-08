import { NextResponse } from "next/server";
import { auth } from "@/libs/auth";
import connectMongo from "@/libs/mongoose";
import Guest from "@/models/Guest";

// GET: Fetch all guests with optional status filter
export async function GET(req) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    await connectMongo();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const query = status ? { status } : {};
    const guests = await Guest.find(query).sort({ createdAt: -1 });

    // Compute stats
    const all = await Guest.find();
    const total = all.length;
    const emailed = all.filter(
      (g) => g.status !== "discovered" && g.status !== "rejected"
    ).length;
    const opened = all.filter((g) => g.emailOpenedAt).length;
    const clicked = all.filter((g) => g.emailClickedAt).length;
    const bounced = all.filter(
      (g) => g.status === "rejected" && g.resendMessageId
    ).length;
    const scheduled = all.filter(
      (g) => g.status === "scheduled" || g.status === "recorded"
    ).length;

    return NextResponse.json({
      guests,
      stats: {
        total,
        emailed,
        opened,
        clicked,
        bounced,
        scheduled,
        openRate: emailed > 0 ? Math.round((opened / emailed) * 100) : 0,
        clickRate: emailed > 0 ? Math.round((clicked / emailed) * 100) : 0,
        bounceRate: emailed > 0 ? Math.round((bounced / emailed) * 100) : 0,
      },
    });
  } catch (error) {
    console.error("Guests fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch guests" },
      { status: 500 }
    );
  }
}

// PATCH: Update guest status
export async function PATCH(req) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { guestId, status } = await req.json();

    if (!guestId || !status) {
      return NextResponse.json(
        { error: "Guest ID and status are required" },
        { status: 400 }
      );
    }

    await connectMongo();

    const guest = await Guest.findByIdAndUpdate(
      guestId,
      { status },
      { new: true }
    );

    if (!guest) {
      return NextResponse.json(
        { error: "Guest not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, guest });
  } catch (error) {
    console.error("Guest update error:", error);
    return NextResponse.json(
      { error: "Failed to update guest" },
      { status: 500 }
    );
  }
}
