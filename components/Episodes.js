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

export function Episodes({ episodes = [] }) {
    const displayEpisodes = episodes.length > 0 ? episodes : placeholderEpisodes;

    return (
        <section id="episodes" className="py-20 md:py-32 px-6 lg:px-12 bg-black">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase italic text-white mb-16">
                    {episodes.length > 0 ? "MOST POPULAR EPISODES" : "EPISODES"}
                </h2>

                <div className="space-y-16">
                    {displayEpisodes.map((episode, index) => (
                        <article key={index} className="group flex flex-col md:flex-row gap-6 md:gap-8">
                            {/* Episode thumbnail with play button */}
                            <div className="relative w-full md:w-72 lg:w-80 flex-shrink-0 aspect-video overflow-hidden rounded-lg bg-white/5">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={episode.image}
                                    alt={episode.title}
                                    className="object-cover w-full h-full"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <button className="w-14 h-14 rounded-full bg-[#FFD700] hover:scale-110 transition-transform flex items-center justify-center shadow-lg">
                                        <svg className="w-5 h-5 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Episode content */}
                            <div className="flex flex-col flex-1 min-w-0">
                                <h3 className="text-xl md:text-2xl lg:text-3xl font-black uppercase text-white mb-4 leading-tight tracking-tight">
                                    {episode.title}
                                </h3>

                                <p className="text-white/70 text-sm md:text-base leading-relaxed mb-6">
                                    {episode.description?.slice(0, 200)}
                                    {episode.description?.length > 200 ? "... " : " "}
                                    {episode.description?.length > 200 && (
                                        <button className="text-[#FFD700] hover:underline font-medium">
                                            read more
                                        </button>
                                    )}
                                </p>

                                <div className="flex items-center justify-between mt-auto">
                                    <button className="flex items-center gap-2 text-[#FFD700] font-black uppercase text-sm tracking-wide hover:gap-3 transition-all">
                                        WATCH EPISODE
                                        <ArrowRight className="w-4 h-4" />
                                    </button>

                                    {/* Platform icons */}
                                    <div className="flex items-center gap-2">
                                        {/* Apple Podcasts - Purple */}
                                        <a
                                            href="#"
                                            className="w-9 h-9 rounded-full bg-[#9B4DCA] hover:scale-110 transition-transform flex items-center justify-center"
                                            aria-label="Listen on Apple Podcasts"
                                        >
                                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.483 0-.237-.009-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                                            </svg>
                                        </a>
                                        {/* Spotify - Green */}
                                        <a
                                            href="#"
                                            className="w-9 h-9 rounded-full bg-[#1DB954] hover:scale-110 transition-transform flex items-center justify-center"
                                            aria-label="Listen on Spotify"
                                        >
                                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                                            </svg>
                                        </a>
                                        {/* YouTube - Red */}
                                        <a
                                            href="#"
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
                    ))}
                </div>
            </div>
        </section>
    )
}
