"use client"

import { useState } from "react"
import Link from "next/link"

export default function Footer() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState("idle") // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus("loading")
    setErrorMsg("")

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error || "Something went wrong")
        setStatus("error")
        return
      }

      setStatus("success")
    } catch {
      setErrorMsg("Something went wrong")
      setStatus("error")
    }
  }

  return (
    <footer className="bg-black border-t border-white/10">
      <div className="max-w-6xl mx-auto px-6 lg:px-12 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16">
          {/* Left — Brand + Description */}
          <div>
            <Link href="/" className="text-white font-black text-xl tracking-tight uppercase italic hover:text-[#FFD700] transition-colors">
              FUTURECAST.FM
            </Link>
            <p className="mt-4 text-white/60 text-sm leading-relaxed max-w-md">
              FUTURECAST.FM IS ABOUT THE FUTURES WE&apos;RE BUILDING. THE ONES WORTH FIGHTING FOR. AND YOUR ROLE IN MAKING THEM REAL.
            </p>

            <div className="flex gap-4 mt-6">
              <a href="https://open.spotify.com/show/6wIovqmNb69xqXgAibZCox" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-[#1DB954] transition-colors" aria-label="Spotify">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                </svg>
              </a>
              <a href="https://podcasts.apple.com/us/podcast/future-cast-fm/id1869250765" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-[#9B4DCA] transition-colors" aria-label="Apple Podcasts">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5.34 0A5.328 5.328 0 000 5.34v13.32A5.328 5.328 0 005.34 24h13.32A5.328 5.328 0 0024 18.66V5.34A5.328 5.328 0 0018.66 0H5.34zm6.525 2.568c2.336 0 4.448.902 6.056 2.587 1.224 1.272 1.912 2.619 2.264 4.392.12.59-.166.738-.648.616-.482-.121-.735-.324-.855-.912-.311-1.516-.87-2.648-1.871-3.73-1.345-1.442-3.02-2.177-4.946-2.177-1.927 0-3.603.735-4.946 2.177-1.002 1.082-1.56 2.214-1.872 3.73-.12.588-.373.791-.855.912-.482.122-.768-.027-.648-.616.352-1.773 1.04-3.12 2.264-4.392 1.608-1.685 3.72-2.587 6.057-2.587zm-.009 3.762c1.632 0 3.088.64 4.264 1.87.867.909 1.373 1.882 1.629 3.2.09.482-.196.694-.59.602-.393-.092-.62-.262-.71-.743-.196-1.003-.58-1.767-1.226-2.447-.88-.925-1.993-1.39-3.367-1.39-1.373 0-2.487.465-3.367 1.39-.646.68-1.03 1.444-1.226 2.447-.09.481-.317.651-.71.743-.394.092-.68-.12-.59-.601.256-1.319.762-2.292 1.629-3.2 1.176-1.231 2.632-1.871 4.264-1.871zm-.042 3.837c.965 0 1.79.353 2.461 1.06.5.523.788 1.072.948 1.857.067.336-.116.521-.433.453-.316-.067-.493-.22-.56-.556-.122-.588-.316-.993-.658-1.35-.48-.502-1.066-.754-1.758-.754-.692 0-1.278.252-1.758.754-.342.357-.536.762-.658 1.35-.067.336-.244.489-.56.556-.317.068-.5-.117-.433-.453.16-.785.448-1.334.948-1.857.67-.707 1.496-1.06 2.461-1.06zm.008 3.682a1.918 1.918 0 011.924 1.924c0 .605-.283 1.35-.792 2.16-.503.8-1.132 1.612-1.132 1.612s-.629-.812-1.132-1.612c-.509-.81-.792-1.555-.792-2.16a1.918 1.918 0 011.924-1.924z" />
                </svg>
              </a>
              <a href="https://www.youtube.com/playlist?list=PLXb6nVg2XJgduzQM0mSQaccFwPx1VkXIa" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-[#FF0000] transition-colors" aria-label="YouTube">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Right — Subscribe Form */}
          <div>
            <h3 className="text-lg font-black uppercase italic text-[#FFD700] mb-4">
              STAY IN THE LOOP
            </h3>

            {status === "success" ? (
              <p className="text-white/70 text-sm">You&apos;re in. Welcome to the future.</p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#FFD700] transition-colors"
                />
                <input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#FFD700] transition-colors"
                />

                {status === "error" && (
                  <p className="text-red-400 text-sm">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full bg-[#FFD700] text-black font-black uppercase italic py-3 rounded-lg text-sm hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                >
                  {status === "loading" ? "SUBSCRIBING..." : "SUBSCRIBE"}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 text-center">
          <p className="text-white/30 text-xs">
            &copy; {new Date().getFullYear()} FUTURECAST.FM. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
