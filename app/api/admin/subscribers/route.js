import { NextResponse } from "next/server";
import { verifyAdmin } from "@/libs/firebaseAdmin";
import connectMongo from "@/libs/mongoose";
import Subscriber from "@/models/Subscriber";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    await connectMongo();

    const subscribers = await Subscriber.find()
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      total: subscribers.length,
      subscribers: subscribers.map((s) => ({
        id: String(s._id),
        name: s.name,
        email: s.email,
        createdAt: s.createdAt,
      })),
    });
  } catch (error) {
    console.error("Admin subscribers fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscribers" },
      { status: 500 }
    );
  }
}
