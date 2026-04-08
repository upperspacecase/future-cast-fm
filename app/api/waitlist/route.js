import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Waitlist from "@/models/Waitlist";

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    await connectMongo();

    const existing = await Waitlist.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "You're already on the waitlist!" },
        { status: 409 }
      );
    }

    await Waitlist.create({ email, source: "i-want-this" });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Waitlist error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
