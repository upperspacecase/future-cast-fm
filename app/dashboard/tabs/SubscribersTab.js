"use client";

import { useState, useEffect } from "react";
import { authFetch } from "@/libs/authFetch";

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function SubscribersTab() {
  const [subscribers, setSubscribers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await authFetch("/api/admin/subscribers");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (cancelled) return;
        setSubscribers(data.subscribers || []);
        setTotal(data.total || 0);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <p className="text-[#FACC15] italic font-bold animate-pulse text-center py-12">
        LOADING SUBSCRIBERS...
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-red-400 italic font-bold text-center py-12">
        Failed to load: {error}
      </p>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:max-w-xs gap-2 mb-6">
        <div className="bg-black border border-[#FACC15]/15 rounded-lg p-3 text-center">
          <p className="text-xl font-black italic text-[#FACC15]">{total}</p>
          <p className="text-[9px] text-white/30 tracking-widest italic">
            TOTAL SUBSCRIBERS
          </p>
        </div>
      </div>

      {subscribers.length === 0 ? (
        <p className="text-white/40 italic text-center py-12">
          No subscribers yet.
        </p>
      ) : (
        <div className="border border-[#FACC15]/15 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.02]">
              <tr className="text-left text-[10px] font-bold italic uppercase tracking-wider text-white/40">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3 text-right">Subscribed</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s) => (
                <tr
                  key={s.id}
                  className="border-t border-white/5 hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-3 text-white">{s.name}</td>
                  <td className="px-4 py-3 text-white/70">{s.email}</td>
                  <td className="px-4 py-3 text-white/50 text-right">
                    {formatDate(s.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
