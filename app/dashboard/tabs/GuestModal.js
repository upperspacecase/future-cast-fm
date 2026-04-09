"use client";

const STATUS_LABELS = {
  discovered: "DISCOVERED",
  emailed: "EMAILED",
  opened: "OPENED",
  clicked: "CLICKED",
  accepted: "ACCEPTED",
  scheduled: "SCHEDULED",
  recorded: "RECORDED",
  rejected: "REJECTED",
};

const STATUS_COLORS = {
  discovered: "bg-white/10 text-white/70",
  emailed: "bg-blue-500/20 text-blue-400",
  opened: "bg-purple-500/20 text-purple-400",
  clicked: "bg-[#FACC15]/20 text-[#FACC15]",
  accepted: "bg-green-500/20 text-green-400",
  scheduled: "bg-green-600/20 text-green-300",
  recorded: "bg-emerald-500/20 text-emerald-400",
  rejected: "bg-red-500/20 text-red-400",
};

function formatDate(d) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function GuestModal({ guest, onClose, onSend, onDelete, onStatusChange, sendingId }) {
  if (!guest) return null;

  const id = guest.id || guest._id;

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-black border border-[#FACC15]/30 rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-[0_0_60px_rgba(250,204,21,0.1)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-white/10">
          <div>
            <h2 className="text-xl font-black italic text-white">
              {guest.name}
            </h2>
            <p className="text-white/40 text-sm">{guest.email}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white text-xl leading-none"
          >
            x
          </button>
        </div>

        {/* Status */}
        <div className="px-5 py-3 border-b border-white/5">
          <span
            className={`inline-block px-3 py-1 rounded text-xs font-bold italic uppercase tracking-wider ${
              STATUS_COLORS[guest.status] || "text-white/50"
            }`}
          >
            {STATUS_LABELS[guest.status] || guest.status}
          </span>
        </div>

        {/* Details */}
        <div className="p-5 space-y-4">
          {/* Podcast info */}
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">
              PODCAST
            </p>
            <p className="text-white font-bold text-sm">{guest.podcastName}</p>
            {guest.podcastDescription && (
              <p className="text-white/40 text-xs mt-1 line-clamp-3">
                {guest.podcastDescription}
              </p>
            )}
            {guest.podcastUrl && (
              <a
                href={guest.podcastUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#FACC15]/60 text-xs hover:text-[#FACC15] mt-1 inline-block"
              >
                View on Apple Podcasts
              </a>
            )}
          </div>

          {/* AI Score */}
          <div className="flex gap-6">
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">
                AI SCORE
              </p>
              <p className="text-[#FACC15] font-black italic text-2xl">
                {guest.aiScore}
              </p>
            </div>
            {guest.genres?.length > 0 && (
              <div>
                <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">
                  GENRES
                </p>
                <p className="text-white/50 text-xs">
                  {guest.genres.join(", ")}
                </p>
              </div>
            )}
          </div>

          {/* AI Reason */}
          {guest.aiReason && (
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">
                AI REASONING
              </p>
              <p className="text-white/60 text-sm italic">{guest.aiReason}</p>
            </div>
          )}

          {/* Timeline */}
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">
              TIMELINE
            </p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-white/40">Discovered</span>
                <span className="text-white/60">{formatDate(guest.createdAt)}</span>
              </div>
              {guest.emailSentAt && (
                <div className="flex justify-between">
                  <span className="text-white/40">Emailed</span>
                  <span className="text-white/60">{formatDate(guest.emailSentAt)}</span>
                </div>
              )}
              {guest.emailOpenedAt && (
                <div className="flex justify-between">
                  <span className="text-white/40">Opened</span>
                  <span className="text-white/60">{formatDate(guest.emailOpenedAt)}</span>
                </div>
              )}
              {guest.emailClickedAt && (
                <div className="flex justify-between">
                  <span className="text-white/40">Clicked</span>
                  <span className="text-white/60">{formatDate(guest.emailClickedAt)}</span>
                </div>
              )}
              {guest.acceptedAt && (
                <div className="flex justify-between">
                  <span className="text-white/40">Accepted</span>
                  <span className="text-white/60">{formatDate(guest.acceptedAt)}</span>
                </div>
              )}
              {guest.scheduledAt && (
                <div className="flex justify-between">
                  <span className="text-white/40">Scheduled</span>
                  <span className="text-white/60">{formatDate(guest.scheduledAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-5 border-t border-white/10 flex gap-2 flex-wrap">
          {guest.status === "discovered" && (
            <button
              onClick={() => onSend(id)}
              disabled={sendingId === id}
              className="px-4 py-2 bg-[#FACC15] text-black rounded-lg text-xs font-bold italic uppercase disabled:opacity-50"
            >
              {sendingId === id ? "SENDING..." : "SEND EMAIL"}
            </button>
          )}
          {guest.status === "scheduled" && (
            <button
              onClick={() => onStatusChange(id, "recorded")}
              className="px-4 py-2 border border-green-500/30 text-green-400 rounded-lg text-xs font-bold italic uppercase hover:bg-green-500/10"
            >
              MARK RECORDED
            </button>
          )}
          <button
            onClick={() => {
              onDelete(id);
              onClose();
            }}
            className="px-4 py-2 border border-red-500/20 text-red-400/50 rounded-lg text-xs font-bold italic uppercase hover:text-red-400 hover:border-red-500/40"
          >
            DELETE
          </button>
        </div>
      </div>
    </div>
  );
}
