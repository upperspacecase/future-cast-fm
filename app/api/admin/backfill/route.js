import { NextResponse } from "next/server";
import { verifyAdmin } from "@/libs/firebaseAdmin";
import connectMongo from "@/libs/mongoose";
import Guest from "@/models/Guest";

// POST: Backfill guest statuses from Resend API
// Useful when webhooks weren't configured and events were missed
export async function POST(req) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    await connectMongo();

    // Get all guests with a resendMessageId
    const guests = await Guest.find({ resendMessageId: { $exists: true, $ne: null } });

    const log = [];

    for (const guest of guests) {
      try {
        const res = await fetch(
          `https://api.resend.com/emails/${guest.resendMessageId}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            },
          }
        );

        if (!res.ok) {
          log.push({ email: guest.email, error: `Resend API ${res.status}` });
          continue;
        }

        const data = await res.json();
        const event = data.data?.last_event || data.last_event;
        let updated = false;

        if (event === "bounced") {
          if (guest.status !== "rejected") {
            guest.status = "rejected";
            updated = true;
          }
        } else if (event === "clicked") {
          if (!guest.emailClickedAt) guest.emailClickedAt = new Date();
          if (!guest.emailOpenedAt) guest.emailOpenedAt = new Date();
          if (["emailed", "opened", "accepted"].includes(guest.status)) {
            guest.status = "clicked";
            updated = true;
          }
        } else if (event === "opened") {
          if (!guest.emailOpenedAt) guest.emailOpenedAt = new Date();
          if (guest.status === "emailed") {
            guest.status = "opened";
            updated = true;
          }
        }

        if (updated) {
          await guest.save();
          log.push({ email: guest.email, status: guest.status, event });
        } else {
          log.push({ email: guest.email, status: guest.status, event, noChange: true });
        }
      } catch (err) {
        log.push({ email: guest.email, error: err.message });
      }
    }

    return NextResponse.json({ success: true, updated: log.filter((l) => !l.noChange && !l.error).length, log });
  } catch (error) {
    console.error("Backfill error:", error);
    return NextResponse.json(
      { error: "Backfill failed: " + error.message },
      { status: 500 }
    );
  }
}
