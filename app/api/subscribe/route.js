import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Subscriber from "@/models/Subscriber";

export async function POST(req) {
  try {
    const { name, email } = await req.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    await connectMongo();

    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "You're already subscribed!" },
        { status: 409 }
      );
    }

    await Subscriber.create({ name, email });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Subscribe error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
