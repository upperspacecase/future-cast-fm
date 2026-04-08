import connectMongo from "@/libs/mongoose";
import Guest from "@/models/Guest";
import { notFound } from "next/navigation";
import ScheduleClient from "./ScheduleClient";

export async function generateMetadata() {
  return {
    title: "Book Your Recording - FUTURECAST.FM",
    description: "Pick a time to record your FutureCast.fm episode.",
  };
}

export default async function SchedulePage({ params }) {
  const { guestId } = await params;

  // Validate ObjectId format before querying
  if (!guestId.match(/^[0-9a-fA-F]{24}$/)) {
    notFound();
  }

  await connectMongo();

  const guest = await Guest.findById(guestId);
  if (!guest) {
    notFound();
  }

  // Mark as accepted if they came from email click
  if (
    guest.status === "clicked" ||
    guest.status === "opened" ||
    guest.status === "emailed"
  ) {
    guest.status = "accepted";
    guest.acceptedAt = new Date();
    await guest.save();
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs text-[#FACC15] tracking-[0.2em] font-bold italic mb-4">
            FUTURECAST.FM
          </p>
          <h1 className="text-4xl font-black italic text-[#FACC15] leading-[0.95] tracking-tight mb-4">
            PICK YOUR TIME
          </h1>
          <p className="text-white/70 text-sm italic uppercase font-bold">
            {guest.name} — choose a recording slot below
          </p>
        </div>

        <ScheduleClient
          guestId={guest._id.toString()}
          guestName={guest.name}
          guestEmail={guest.email}
        />

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-white/40 text-xs italic tracking-widest">
            TAY &middot; FUTURECAST.FM
          </p>
        </div>
      </div>
    </div>
  );
}
