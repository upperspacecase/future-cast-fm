"use client"

import { useState, useEffect } from "react"

export function SubscribePopup() {
  const [show, setShow] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState("idle") // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    const dismissed = sessionStorage.getItem("fc-popup-dismissed")
    if (dismissed) return

    const visits = parseInt(localStorage.getItem("fc-visits") || "0", 10) + 1
    localStorage.setItem("fc-visits", String(visits))

    if (visits >= 2) {
      const timer = setTimeout(() => setShow(true), 10000)
      return () => clearTimeout(timer)
    }
  }, [])

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
      sessionStorage.setItem("fc-popup-dismissed", "1")
    } catch {
      setErrorMsg("Something went wrong")
      setStatus("error")
    }
  }

  const handleClose = () => {
    setShow(false)
    sessionStorage.setItem("fc-popup-dismissed", "1")
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-black border border-[#FFD700]/30 rounded-xl p-8 md:p-10 max-w-md w-full shadow-2xl">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {status === "success" ? (
          <div className="text-center py-4">
            <h3 className="text-2xl font-black uppercase italic text-[#FFD700] mb-3">
              YOU&apos;RE IN.
            </h3>
            <p className="text-white/70 text-sm">Welcome to the future.</p>
          </div>
        ) : (
          <>
            <h3 className="text-2xl md:text-3xl font-black uppercase italic text-[#FFD700] mb-6 text-center">
              STAY IN THE LOOP
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#FFD700] transition-colors"
              />
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#FFD700] transition-colors"
              />

              {status === "error" && (
                <p className="text-red-400 text-sm text-center">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-[#FFD700] text-black font-black uppercase italic py-3 rounded-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
              >
                {status === "loading" ? "SUBSCRIBING..." : "SUBSCRIBE"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
