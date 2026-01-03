import { Archivo_Black, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _archivoBlack = Archivo_Black({ subsets: ["latin"], weight: "400", variable: "--font-archivo" })
const _inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata = {
  title: "FutureCast.fm - Exploring Optimistic Futures",
  description: "A podcast exploring optimistic futures across technology, society, environment, and innovation.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children
}) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
