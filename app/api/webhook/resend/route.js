import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Guest from "@/models/Guest";

export async function POST(req) {
  try {
    const body = await req.json();
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json(
        { error: "Invalid webhook payload" },
        { status: 400 }
      );
    }

    await connectMongo();

    const messageId = data.email_id;
    if (!messageId) {
      return NextResponse.json({ received: true });
    }

    const guest = await Guest.findOne({ resendMessageId: messageId });
    if (!guest) {
      return NextResponse.json({ received: true });
    }

    switch (type) {
      case "email.opened":
        if (!guest.emailOpenedAt) {
          guest.emailOpenedAt = new Date();
          // Only advance status if still at "emailed"
          if (guest.status === "emailed") {
            guest.status = "opened";
          }
        }
        break;

      case "email.clicked":
        if (!guest.emailClickedAt) {
          guest.emailClickedAt = new Date();
          if (
            guest.status === "emailed" ||
            guest.status === "opened"
          ) {
            guest.status = "clicked";
          }
        }
        break;

      case "email.bounced":
        guest.status = "rejected";
        break;

      case "email.delivered":
        // Just log, don't change status
        break;

      default:
        break;
    }

    await guest.save();

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Resend webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
