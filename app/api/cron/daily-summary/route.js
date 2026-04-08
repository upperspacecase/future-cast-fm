import { NextResponse } from "next/server";
import { Resend } from "resend";
import connectMongo from "@/libs/mongoose";
import Guest from "@/models/Guest";
import Episode from "@/models/Episode";
import Booking from "@/models/Booking";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

const GOAL = 100;
const YEAR = 2026;

export async function GET(req) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectMongo();

    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Pipeline stats
    const allGuests = await Guest.find();
    const newDiscovered = allGuests.filter(
      (g) => g.createdAt >= yesterday
    ).length;
    const newEmailed = allGuests.filter(
      (g) => g.emailSentAt && g.emailSentAt >= yesterday
    ).length;
    const newOpened = allGuests.filter(
      (g) => g.emailOpenedAt && g.emailOpenedAt >= yesterday
    ).length;
    const newScheduled = allGuests.filter(
      (g) => g.scheduledAt && g.scheduledAt >= yesterday
    ).length;

    const totalByStatus = {};
    for (const g of allGuests) {
      totalByStatus[g.status] = (totalByStatus[g.status] || 0) + 1;
    }

    const totalEmailed = allGuests.filter((g) => g.resendMessageId).length;
    const totalOpened = allGuests.filter((g) => g.emailOpenedAt).length;
    const openRate =
      totalEmailed > 0 ? Math.round((totalOpened / totalEmailed) * 100) : 0;

    // Episode stats
    const allEpisodes = await Episode.find();
    const published = allEpisodes.filter(
      (e) => e.status === "published"
    ).length;
    const recorded = allEpisodes.filter(
      (e) => e.status === "recorded" || e.status === "edited" || e.status === "published"
    ).length;
    const daysLeft = Math.ceil(
      (new Date(`${YEAR}-12-31`) - now) / (1000 * 60 * 60 * 24)
    );
    const remaining = GOAL - published;
    const perWeekNeeded =
      daysLeft > 0 ? (remaining / (daysLeft / 7)).toFixed(1) : "N/A";

    // Upcoming bookings
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingBookings = await Booking.find({
      date: { $gte: now, $lte: nextWeek },
    }).sort({ date: 1 });

    // Guests awaiting action (discovered but not emailed)
    const awaitingAction = allGuests.filter(
      (g) => g.status === "discovered"
    ).length;

    // Build email
    const upcomingList = upcomingBookings.length > 0
      ? upcomingBookings
          .map((b) => {
            const d = b.date.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            });
            return `  - ${b.guestName} — ${d}`;
          })
          .join("\n")
      : "  None this week";

    const text = `FUTURECAST.FM — DAILY SUMMARY

YESTERDAY
  New discovered: ${newDiscovered}
  Emails sent: ${newEmailed}
  Emails opened: ${newOpened}
  New bookings: ${newScheduled}

PIPELINE
  Discovered: ${totalByStatus.discovered || 0}
  Emailed: ${totalByStatus.emailed || 0}
  Opened: ${totalByStatus.opened || 0}
  Clicked: ${totalByStatus.clicked || 0}
  Accepted: ${totalByStatus.accepted || 0}
  Scheduled: ${totalByStatus.scheduled || 0}
  Recorded: ${totalByStatus.recorded || 0}
  Open rate: ${openRate}%

EPISODE TRACKER
  Published: ${published} / ${GOAL}
  Recorded (total): ${recorded}
  Remaining: ${remaining}
  Days left in ${YEAR}: ${daysLeft}
  Need ${perWeekNeeded} per week to hit goal

UPCOMING RECORDINGS
${upcomingList}

NEXT ACTIONS
  ${awaitingAction > 0 ? `${awaitingAction} guests ready to email` : "No guests waiting to email"}
  ${upcomingBookings.length > 0 ? `${upcomingBookings.length} recording(s) this week` : "No recordings this week"}

---
View dashboard: https://futurecast.fm/dashboard`;

    const html = `<div style="font-family:Arial,sans-serif;padding:20px;max-width:560px;margin:0 auto;color:#1a1a1a;font-size:14px;line-height:1.8;">
<p style="font-weight:bold;font-size:12px;letter-spacing:2px;color:#b8860b;margin:0 0 16px 0;">FUTURECAST.FM — DAILY SUMMARY</p>

<p style="font-weight:bold;margin:16px 0 8px 0;">YESTERDAY</p>
<table style="font-size:14px;"><tr><td style="padding:2px 16px 2px 0;color:#666;">New discovered</td><td style="font-weight:bold;">${newDiscovered}</td></tr><tr><td style="padding:2px 16px 2px 0;color:#666;">Emails sent</td><td style="font-weight:bold;">${newEmailed}</td></tr><tr><td style="padding:2px 16px 2px 0;color:#666;">Emails opened</td><td style="font-weight:bold;">${newOpened}</td></tr><tr><td style="padding:2px 16px 2px 0;color:#666;">New bookings</td><td style="font-weight:bold;">${newScheduled}</td></tr></table>

<p style="font-weight:bold;margin:16px 0 8px 0;">EPISODE TRACKER</p>
<p style="margin:0;font-size:24px;font-weight:bold;">${published} <span style="color:#999;font-size:14px;">/ ${GOAL}</span></p>
<p style="margin:4px 0 0 0;color:#666;font-size:13px;">${remaining} remaining — need ${perWeekNeeded}/week — ${daysLeft} days left</p>

<p style="font-weight:bold;margin:16px 0 8px 0;">UPCOMING RECORDINGS</p>
${upcomingBookings.length > 0 ? upcomingBookings.map((b) => `<p style="margin:2px 0;"><strong>${b.guestName}</strong> — ${b.date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</p>`).join("") : `<p style="color:#999;">None this week</p>`}

<p style="font-weight:bold;margin:16px 0 8px 0;">NEXT ACTIONS</p>
${awaitingAction > 0 ? `<p style="margin:2px 0;">${awaitingAction} guests ready to email</p>` : ""}
${upcomingBookings.length > 0 ? `<p style="margin:2px 0;">${upcomingBookings.length} recording(s) this week</p>` : ""}

<p style="margin:24px 0 0 0;"><a href="https://futurecast.fm/dashboard" style="color:#2563eb;font-weight:bold;">Open Dashboard</a></p>

<p style="margin:24px 0 0 0;color:#999;font-size:12px;">FutureCast.fm</p>
</div>`;

    await getResend().emails.send({
      from: "FutureCast.fm <noreply@futurecast.fm>",
      to: "taytoddpattison@gmail.com",
      subject: `FutureCast Daily — ${published}/${GOAL} episodes`,
      html,
      text,
    });

    return NextResponse.json({
      success: true,
      summary: {
        newDiscovered,
        newEmailed,
        newOpened,
        newScheduled,
        published,
        remaining,
        openRate,
      },
    });
  } catch (error) {
    console.error("Daily summary error:", error);
    return NextResponse.json(
      { error: "Failed to send summary: " + error.message },
      { status: 500 }
    );
  }
}
