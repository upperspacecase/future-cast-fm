import OpenScheduleClient from "./OpenScheduleClient";

export const metadata = {
  title: "Book a Recording - FUTURECAST.FM",
  description: "Pick a time to record with Tay on FutureCast.fm.",
};

export default function OpenSchedulePage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
      <div className="max-w-lg w-full">
        <div className="mb-8">
          <p className="text-xs text-[#FACC15] tracking-[0.2em] font-bold italic mb-4">
            FUTURECAST.FM
          </p>
          <h1 className="text-4xl font-black italic text-[#FACC15] leading-[0.95] tracking-tight mb-4">
            PICK YOUR TIME
          </h1>
          <p className="text-white/70 text-sm italic uppercase font-bold">
            Choose a recording slot below
          </p>
        </div>

        <OpenScheduleClient />

        <div className="mt-12 text-center">
          <p className="text-white/40 text-xs italic tracking-widest">
            TAY &middot; FUTURECAST.FM
          </p>
        </div>
      </div>
    </div>
  );
}
