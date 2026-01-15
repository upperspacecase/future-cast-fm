"use client"

import { useState } from "react"
import { ArrowRight } from "lucide-react"

// Placeholder data when no episodes exist
const placeholderEpisodes = [
    {
        title: "COMING SOON: OUR FIRST EPISODE",
        description: "Stay tuned for our upcoming conversations about optimistic futures. Subscribe to be notified when we launch!",
        image: "/podcast-placeholder.jpg",
        pubDate: new Date(),
    },
]

// Format duration from seconds or HH:MM:SS to readable format
function formatDuration(duration) {
    if (!duration) return "";

    // If already in HH:MM:SS or MM:SS format
    if (typeof duration === "string" && duration.includes(":")) {
        const parts = duration.split(":").map(Number);
        if (parts.length === 3) {
            const [hours, minutes] = parts;
            if (hours > 0) return `${hours}h ${minutes}m`;
            return `${minutes}m`;
        }
        if (parts.length === 2) {
            const [minutes] = parts;
            return `${minutes}m`;
        }
        return duration;
    }

    // If in seconds
    const totalSeconds = parseInt(duration, 10);
    if (isNaN(totalSeconds)) return duration;

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}

// Format date to readable format
function formatDate(date) {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function EpisodeCard({ episode }) {
    const [expanded, setExpanded] = useState(false);
    const shouldTruncate = episode.description?.length > 200;

    return (
        <article className="group flex flex-col md:flex-row gap-6 md:gap-8">
            {/* Episode thumbnail - no play button */}
            <div className="relative w-full md:w-72 lg:w-80 flex-shrink-0 aspect-video overflow-hidden rounded-lg bg-white/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={episode.image}
                    alt={episode.title}
                    className="object-cover w-full h-full"
                />
            </div>

            {/* Episode content */}
            <div className="flex flex-col flex-1 min-w-0">
                {/* Date and Duration */}
                <div className="flex items-center gap-3 text-white/50 text-sm mb-2">
                    {episode.pubDate && (
                        <span>{formatDate(episode.pubDate)}</span>
                    )}
                    {episode.duration && (
                        <>
                            <span>•</span>
                            <span>{formatDuration(episode.duration)}</span>
                        </>
                    )}
                </div>

                <h3 className="text-xl md:text-2xl lg:text-3xl font-black uppercase text-white mb-4 leading-tight tracking-tight">
                    {episode.title}
                </h3>

                <p className="text-white/70 text-sm md:text-base leading-relaxed mb-6">
                    {expanded || !shouldTruncate
                        ? episode.description
                        : `${episode.description?.slice(0, 200)}... `}
                    {shouldTruncate && (
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="text-[#FFD700] hover:underline font-medium ml-1"
                        >
                            {expanded ? "show less" : "read more"}
                        </button>
                    )}
                </p>

                <div className="flex items-center justify-between mt-auto">
                    <a
                        href={episode.audioUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-[#FFD700] font-black uppercase text-sm tracking-wide hover:gap-3 transition-all"
                    >
                        LISTEN NOW
                        <ArrowRight className="w-4 h-4" />
                    </a>

                    {/* Platform icons */}
                    <div className="flex items-center gap-2">
                        {/* Spotify - Green */}
                        <a
                            href="https://open.spotify.com/show/6wIovqmNb69xqXgAibZCox"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-9 h-9 rounded-full bg-[#1DB954] hover:scale-110 transition-transform flex items-center justify-center"
                            aria-label="Listen on Spotify"
                        >
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                            </svg>
                        </a>
                        {/* Apple Podcasts - Purple */}
                        <a
                            href="https://podcasts.apple.com/us/podcast/future-cast-fm/id1869250765"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-9 h-9 rounded-full bg-[#9B4DCA] hover:scale-110 transition-transform flex items-center justify-center"
                            aria-label="Listen on Apple Podcasts"
                        >
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M5.34 0A5.328 5.328 0 000 5.34v13.32A5.328 5.328 0 005.34 24h13.32A5.328 5.328 0 0024 18.66V5.34A5.328 5.328 0 0018.66 0H5.34zm6.525 2.568c2.336 0 4.448.902 6.056 2.587 1.224 1.272 1.912 2.619 2.264 4.392.12.59-.166.738-.648.616-.482-.121-.735-.324-.855-.912-.311-1.516-.87-2.648-1.871-3.73-1.345-1.442-3.02-2.177-4.946-2.177-1.927 0-3.603.735-4.946 2.177-1.002 1.082-1.56 2.214-1.872 3.73-.12.588-.373.791-.855.912-.482.122-.768-.027-.648-.616.352-1.773 1.04-3.12 2.264-4.392 1.608-1.685 3.72-2.587 6.057-2.587zm-.009 3.762c1.632 0 3.088.64 4.264 1.87.867.909 1.373 1.882 1.629 3.2.09.482-.196.694-.59.602-.393-.092-.62-.262-.71-.743-.196-1.003-.58-1.767-1.226-2.447-.88-.925-1.993-1.39-3.367-1.39-1.373 0-2.487.465-3.367 1.39-.646.68-1.03 1.444-1.226 2.447-.09.481-.317.651-.71.743-.394.092-.68-.12-.59-.601.256-1.319.762-2.292 1.629-3.2 1.176-1.231 2.632-1.871 4.264-1.871zm-.042 3.837c.965 0 1.79.353 2.461 1.06.5.523.788 1.072.948 1.857.067.336-.116.521-.433.453-.316-.067-.493-.22-.56-.556-.122-.588-.316-.993-.658-1.35-.48-.502-1.066-.754-1.758-.754-.692 0-1.278.252-1.758.754-.342.357-.536.762-.658 1.35-.067.336-.244.489-.56.556-.317.068-.5-.117-.433-.453.16-.785.448-1.334.948-1.857.67-.707 1.496-1.06 2.461-1.06zm.008 3.682a1.918 1.918 0 011.924 1.924c0 .605-.283 1.35-.792 2.16-.503.8-1.132 1.612-1.132 1.612s-.629-.812-1.132-1.612c-.509-.81-.792-1.555-.792-2.16a1.918 1.918 0 011.924-1.924z" />
                            </svg>
                        </a>
                        {/* YouTube - Red */}
                        <a
                            href="https://www.youtube.com/playlist?list=PLXb6nVg2XJgduzQM0mSQaccFwPx1VkXIa"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-9 h-9 rounded-full bg-[#FF0000] hover:scale-110 transition-transform flex items-center justify-center"
                            aria-label="Watch on YouTube"
                        >
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </article>
    );
}

export function Episodes({ episodes = [] }) {
    const displayEpisodes = episodes.length > 0 ? episodes : placeholderEpisodes;

    return (
        <section id="episodes" className="py-20 md:py-32 px-6 lg:px-12 bg-black">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase italic text-white mb-16">
                    EPISODES
                </h2>

                <div className="space-y-16">
                    {displayEpisodes.map((episode, index) => (
                        <EpisodeCard key={index} episode={episode} />
                    ))}
                </div>
            </div>
        </section>
    )
}
