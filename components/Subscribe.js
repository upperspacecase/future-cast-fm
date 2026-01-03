"use client"

const platforms = [
    {
        name: "Apple Podcasts",
        icon: (
            <svg className="w-6 h-6 text-[#9B4DCA]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.483 0-.237-.009-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
        ),
        href: "#",
    },
    {
        name: "YouTube",
        icon: (
            <svg className="w-6 h-6 text-[#FF0000]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
        ),
        href: "#",
    },
    {
        name: "Spotify",
        icon: (
            <svg className="w-6 h-6 text-[#1DB954]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
        ),
        href: "#",
    },
    {
        name: "Google Podcasts",
        icon: (
            <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#0066D9" d="M12 8V0l-2 2v4l2 2z" />
                <path fill="#4285F4" d="M12 16v8l2-2v-4l-2-2z" />
                <path fill="#EA4335" d="M16 12l4 4V8l-4 4z" />
                <path fill="#34A853" d="M8 12L4 8v8l4-4z" />
                <path fill="#FAB908" d="M12 12l4-4h-8l4 4z" />
                <path fill="#E94235" d="M12 12l-4 4h8l-4-4z" />
            </svg>
        ),
        href: "#",
    },
]

export function Subscribe() {
    return (
        <section id="subscribe" className="py-20 md:py-32 px-6 lg:px-12 bg-[#FFD700]">
            <div className="max-w-5xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase italic text-black mb-12">
                    SUBSCRIBE NOW ON YOUR FAVOURITE PLATFORM
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {platforms.map((platform) => (
                        <a
                            key={platform.name}
                            href={platform.href}
                            className="flex items-center justify-center gap-3 bg-white rounded-xl px-6 py-4 hover:scale-105 transition-transform shadow-lg"
                        >
                            {platform.icon}
                            <span className="font-semibold text-black text-sm md:text-base">
                                {platform.name}
                            </span>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    )
}
