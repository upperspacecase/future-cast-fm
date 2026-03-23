"use client"

import { useState } from "react"

export function About() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState("idle")
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
    <section id="about" className="py-20 md:py-32 px-6 lg:px-12 bg-black">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-black uppercase italic leading-tight text-white mb-8">
          FutureCast is a series of long conversations about how we navigate being human in a world that&apos;s accelerating faster than humans naturally move. Together, we&apos;re figuring it out as we go. In work, art, relationships, and the most interesting to me - areas we often don&apos;t have language for yet.
        </h2>

        {status === "success" ? (
          <p className="text-[#FFD700] font-black uppercase italic text-lg">YOU&apos;RE IN. WELCOME TO THE FUTURE.</p>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-3 mt-10">
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
    </section>
  )
}
