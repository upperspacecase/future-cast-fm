import { NextResponse } from "next/server";
import { verifyAdmin } from "@/libs/firebaseAdmin";
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

export async function POST(req) {
  try {
    const { guestId, date, guestTimezone } = await req.json();

    if (!guestId || !date || !guestTimezone) {
      return NextResponse.json(
        { error: "Guest ID, date, and timezone are required" },
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

    // Check the slot is still available
    const slotDate = new Date(date);
    const existingBooking = await Booking.findOne({ date: slotDate });
    if (existingBooking) {
      return NextResponse.json(
        { error: "This time slot is no longer available" },
        { status: 409 }
      );
    }

    // Verify this slot matches an availability rule
    const dayOfWeek = slotDate.getUTCDay();
    const availability = await Availability.findOne({
      dayOfWeek,
      active: true,
    });
    if (!availability) {
      return NextResponse.json(
        { error: "No availability for this day" },
        { status: 400 }
      );
    }

    const hostTimezone = availability.timezone || "America/Los_Angeles";

    // Create booking
    const booking = await Booking.create({
      guestId: guest._id,
      guestName: guest.name,
      guestEmail: guest.email,
      date: slotDate,
      guestTimezone,
      hostTimezone,
    });

    // Update guest status
    guest.status = "scheduled";
    guest.acceptedAt = guest.acceptedAt || new Date();
    guest.scheduledAt = new Date();
    guest.bookingId = booking._id;
    await guest.save();

    // Format date for emails
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
      guestName: guest.name,
      guestEmail: guest.email,
      hostEmail: "tay@futurecast.fm",
      start: slotDate,
      durationMinutes: 60,
    });

    const icsBuffer = Buffer.from(icsContent, "utf-8");

    // Send confirmation to guest
    const guestEmail = generateConfirmationEmail({
      guestName: guest.name,
      dateFormatted: guestFormatted,
      guestTimezone,
      hostTimezone,
      isHost: false,
    });

    await getResend().emails.send({
      from: "Tay at FutureCast.fm <tay@futurecast.fm>",
      to: guest.email,
      subject: "Can't wait to speak - FutureCast.fm",
      html: guestEmail.html,
      text: guestEmail.text,
      attachments: [
        {
          filename: "futurecast-recording.ics",
          content: icsBuffer,
        },
      ],
    });

    // Send notification to host
    const hostEmail = generateConfirmationEmail({
      guestName: guest.name,
      dateFormatted: hostFormatted,
      guestTimezone,
      hostTimezone,
      isHost: true,
    });

    await getResend().emails.send({
      from: "FutureCast.fm <noreply@futurecast.fm>",
      to: "tay@futurecast.fm",
      subject: `New booking: ${guest.name}`,
      html: hostEmail.html,
      text: hostEmail.text,
      attachments: [
        {
          filename: "futurecast-recording.ics",
          content: icsBuffer,
        },
      ],
    });

    return NextResponse.json({
      success: true,
      booking: booking.toJSON(),
    });
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json(
      { error: "Booking failed: " + error.message },
      { status: 500 }
    );
  }
}

// DELETE: Cancel a booking (admin only)
export async function DELETE(req) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { bookingId } = await req.json();

    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    await connectMongo();

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Revert guest status back to clicked
    if (booking.guestId) {
      const guest = await Guest.findById(booking.guestId);
      if (guest && (guest.status === "scheduled" || guest.status === "accepted")) {
        guest.status = "clicked";
        guest.scheduledAt = undefined;
        guest.acceptedAt = undefined;
        guest.bookingId = undefined;
        await guest.save();
      }
    }

    await Booking.findByIdAndDelete(bookingId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cancel booking error:", error);
    return NextResponse.json(
      { error: "Failed to cancel booking: " + error.message },
      { status: 500 }
    );
  }
}
