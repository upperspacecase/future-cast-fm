"use client";

import { useState } from "react";
import PipelineTab from "./tabs/PipelineTab";
import PodcastTab from "./tabs/PodcastTab";
import AvailabilityTab from "./tabs/AvailabilityTab";
import DiscoverTab from "./tabs/DiscoverTab";

const TABS = [
  { id: "pipeline", label: "PIPELINE" },
  { id: "podcast", label: "PODCAST" },
  { id: "availability", label: "AVAILABILITY" },
  { id: "discover", label: "DISCOVER" },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("pipeline");

  return (
    <div className="min-h-screen bg-black">
      {/* Header + Tabs */}
      <div className="border-b border-[#FACC15]/10 px-6 lg:px-8">
        <div className="flex items-center justify-between pt-6 pb-4">
          <div>
            <p className="text-xs text-[#FACC15] tracking-[0.2em] font-bold italic">
              FUTURECAST.FM
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-xs font-bold italic uppercase tracking-wider transition-all border-b-2 ${
                activeTab === tab.id
                  ? "border-[#FACC15] text-[#FACC15]"
                  : "border-transparent text-white/30 hover:text-white/60"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6 lg:p-8">
        {activeTab === "pipeline" && <PipelineTab />}
        {activeTab === "podcast" && <PodcastTab />}
        {activeTab === "availability" && <AvailabilityTab />}
        {activeTab === "discover" && <DiscoverTab />}
      </div>
    </div>
  );
}
