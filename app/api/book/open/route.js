import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Guest from "@/models/Guest";
import Booking from "@/models/Booking";
import Availability from "@/models/Availability";
import { generateICS } from "@/lib/ics";
import { generateConfirmationEmail } from "@/lib/confirmationEmail";
import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

// POST: Open booking — anyone with the link can book (no guestId required)
export async function POST(req) {
  try {
    const { name, email, date, guestTimezone } = await req.json();

    if (!name || !email || !date || !guestTimezone) {
      return NextResponse.json(
        { error: "Name, email, date, and timezone are required" },
        { status: 400 }
      );
    }

    await connectMongo();

    const slotDate = new Date(date);

    // Check slot is available
    const existingBooking = await Booking.findOne({ date: slotDate });
    if (existingBooking) {
      return NextResponse.json(
        { error: "This time slot is no longer available" },
        { status: 409 }
      );
    }

    // Find or create guest
    let guest = await Guest.findOne({ email: email.toLowerCase() });
    if (!guest) {
      guest = await Guest.create({
        name,
        email: email.toLowerCase(),
        podcastName: "Direct booking",
        aiScore: 0,
        aiReason: "Booked via open link",
        status: "scheduled",
        acceptedAt: new Date(),
        scheduledAt: new Date(),
      });
    } else {
      guest.status = "scheduled";
      guest.acceptedAt = guest.acceptedAt || new Date();
      guest.scheduledAt = new Date();
    }

    // Get host timezone
    const availability = await Availability.findOne({ active: true });
    const hostTimezone = availability?.timezone || "America/Los_Angeles";

    // Create booking
    const booking = await Booking.create({
      guestId: guest._id,
      guestName: name,
      guestEmail: email.toLowerCase(),
      date: slotDate,
      guestTimezone,
      hostTimezone,
    });

    guest.bookingId = booking._id;
    await guest.save();

    // Format dates
    const guestFormatted = slotDate.toLocaleString("en-US", {
      timeZone: guestTimezone,
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
    const hostFormatted = slotDate.toLocaleString("en-US", {
      timeZone: hostTimezone,
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

    // Generate .ics
    const icsContent = await generateICS({
      guestName: name,
      guestEmail: email,
      hostEmail: "tay@futurecast.fm",
      start: slotDate,
      durationMinutes: 60,
    });
    const icsBuffer = Buffer.from(icsContent, "utf-8");

    // Send confirmation to guest
    const guestEmail = generateConfirmationEmail({
      guestName: name,
      dateFormatted: guestFormatted,
      guestTimezone,
      hostTimezone,
      isHost: false,
    });

    await getResend().emails.send({
      from: "Tay at FutureCast.fm <tay@futurecast.fm>",
      to: email,
      subject: "Can't wait to speak - FutureCast.fm",
      html: guestEmail.html,
      text: guestEmail.text,
      attachments: [
        { filename: "futurecast-recording.ics", content: icsBuffer },
      ],
    });

    // Send notification to host
    const hostEmailContent = generateConfirmationEmail({
      guestName: name,
      dateFormatted: hostFormatted,
      guestTimezone,
      hostTimezone,
      isHost: true,
    });

    await getResend().emails.send({
      from: "FutureCast.fm <noreply@futurecast.fm>",
      to: "tay@futurecast.fm",
      subject: `New booking: ${name}`,
      html: hostEmailContent.html,
      text: hostEmailContent.text,
      attachments: [
        { filename: "futurecast-recording.ics", content: icsBuffer },
      ],
    });

    return NextResponse.json({
      success: true,
      booking: booking.toJSON(),
    });
  } catch (error) {
    console.error("Open booking error:", error);
    return NextResponse.json(
      { error: "Booking failed: " + error.message },
      { status: 500 }
    );
  }
}
