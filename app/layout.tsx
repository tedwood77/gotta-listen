import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/navbar"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AdPolicyBanner } from "@/components/ad-policy-banner"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Gotta Listen - Share Your Music",
  description:
    "Connect with friends through music. Share your favorite tracks, discover new music, and build playlists together.",
  keywords: "music, social, sharing, playlists, friends, discover",
  authors: [{ name: "Gotta Listen" }],
  openGraph: {
    title: "Gotta Listen - Share Your Music",
    description:
      "Connect with friends through music. Share your favorite tracks, discover new music, and build playlists together.",
    type: "website",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6988793191718332"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto px-4 py-8">{children}</main>
            <AdPolicyBanner />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
