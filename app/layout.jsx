import { Archivo_Black, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _archivoBlack = Archivo_Black({ subsets: ["latin"], weight: "400", variable: "--font-archivo" })
const _inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata = {
  title: "FUTURECAST.FM",
  description: "FutureCast.fm is about the futures we're building. The ones worth fighting for. And your role in making them real.",
  metadataBase: new URL('https://futurecast.fm'),
  openGraph: {
    title: 'FUTURECAST.FM',
    description: "FutureCast.fm is about the futures we're building. The ones worth fighting for. And your role in making them real.",
    url: 'https://futurecast.fm',
    siteName: 'FUTURECAST.FM',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FUTURECAST.FM',
    description: "FutureCast.fm is about the futures we're building. The ones worth fighting for. And your role in making them real.",
  },
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
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
