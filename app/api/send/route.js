import { NextResponse } from "next/server";
import { verifyAdmin } from "@/libs/firebaseAdmin";
import connectMongo from "@/libs/mongoose";
import Guest from "@/models/Guest";
import { sendEmail } from "@/libs/resend";
import { generateOutreachEmail } from "@/lib/emailTemplate";

export async function POST(req) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { guestId } = await req.json();

    if (!guestId) {
      return NextResponse.json(
        { error: "Guest ID is required" },
        { status: 400 }
      );
    }

    await connectMongo();

    const guest = await Guest.findById(guestId);
    if (!guest) {
      return NextResponse.json(
        { error: "Guest not found" },
        { status: 404 }
      );
    }

    if (guest.status !== "discovered" && guest.status !== "rejected") {
      return NextResponse.json(
        { error: `Guest already has status: ${guest.status}` },
        { status: 400 }
      );
    }

    const { html, text } = generateOutreachEmail(guest.id, guest.name);

    const result = await sendEmail({
      to: guest.email,
      subject: "Want to come on the pod?",
      html,
      text,
      replyTo: "tay@futurecast.fm",
    });

    guest.status = "emailed";
    guest.resendMessageId = result.id;
    guest.emailSentAt = new Date();
    await guest.save();

    return NextResponse.json({
      success: true,
      messageId: result.id,
      guest: guest.toJSON(),
    });
  } catch (error) {
    console.error("Send error:", error);
    return NextResponse.json(
      { error: "Failed to send email: " + error.message },
      { status: 500 }
    );
  }
}
