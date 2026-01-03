"use client"

export function About() {
    return (
        <section id="about" className="py-20 md:py-32 px-6 lg:px-12 bg-black">
            <div className="max-w-4xl">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-black uppercase italic leading-tight text-white mb-8">
                    <span className="text-[#FFD700]">FUTURECAST.FM</span> IS ABOUT THE FUTURES WE&apos;RE BUILDING. THE ONES WORTH FIGHTING FOR. AND YOUR ROLE IN MAKING THEM REAL.
                </h2>
                <div className="text-white/60 text-base md:text-lg leading-relaxed space-y-4">
                    <p>
                        Not pundits. Not commentators. The ones in the arena.
                    </p>
                    <p>
                        Scientists who ignore what&apos;s &ldquo;realistic.&rdquo; Founders betting everything on ideas that sound crazy until they work. Artists rewriting the rules.
                    </p>
                    <p>
                        We ask the questions nobody else asks. We skip the rehearsed answers.
                    </p>
                    <p>
                        And we figure out—together—what all of this actually means for the rest of us.
                    </p>
                </div>
            </div>
        </section>
    )
}
