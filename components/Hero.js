"use client"

import { useState } from "react"
import Link from "next/link"

export function Hero() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black"
    >
      {/* Background image */}
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/podcast-studio.jpg"
          alt="Podcast studio"
          className="object-cover w-full h-full opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
      </div>

      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 px-6 lg:px-12 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-white font-black text-xl tracking-tight uppercase italic hover:text-[#FFD700] transition-colors">
            FUTURECAST.FM
          </Link>

          {/* Hamburger Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white hover:text-[#FFD700] transition-colors"
            aria-label="Toggle menu"
          >
            <div className="space-y-1.5">
              <div className={`w-7 h-0.5 bg-current transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}></div>
              <div className={`w-7 h-0.5 bg-current transition-all ${menuOpen ? 'opacity-0' : ''}`}></div>
              <div className={`w-7 h-0.5 bg-current transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}></div>
            </div>
          </button>
        </div>

        {/* Slide-out Menu */}
        <div className={`fixed top-0 right-0 h-full w-72 bg-black/95 backdrop-blur-md transform transition-transform duration-300 ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-8 pt-24">
            <a
              href="#about"
              onClick={() => setMenuOpen(false)}
              className="block text-2xl font-black uppercase italic text-white hover:text-[#FFD700] transition-colors mb-6"
            >
              ABOUT
            </a>
            <a
              href="#episodes"
              onClick={() => setMenuOpen(false)}
              className="block text-2xl font-black uppercase italic text-white hover:text-[#FFD700] transition-colors mb-6"
            >
              EPISODES
            </a>
            <a
              href="#subscribe"
              onClick={() => setMenuOpen(false)}
              className="block text-2xl font-black uppercase italic text-white hover:text-[#FFD700] transition-colors"
            >
              SUBSCRIBE
            </a>
          </div>
        </div>

        {/* Overlay */}
        {menuOpen && (
          <div
            className="fixed inset-0 bg-black/50 -z-10"
            onClick={() => setMenuOpen(false)}
          />
        )}
      </nav>

      {/* Main title */}
      <div className="relative z-10 text-center px-6">
        <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-black uppercase italic leading-[0.85] tracking-tight text-[#FFD700]">
          FUTURE
          <br />
          CAST
        </h1>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white text-center">
        <span className="text-sm tracking-[0.3em] uppercase mb-2 block">Scroll</span>
        <svg className="w-5 h-5 mx-auto animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  )
}
