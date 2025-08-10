import type React from "react"
import "./globals.css"
import "./shadcn-fallback.css"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Tailored Apply — AI Resume & Cover Letter Generator",
  description: "Tailor your resume and cover letter to any company in minutes. Private, fast, and ATS-friendly.",
  metadataBase: new URL("https://example.com"),
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Suspense fallback={<div>Loading...</div>}>
            <div className="relative flex min-h-screen flex-col">
              <SiteHeader />
              <main className="flex-1">{children}</main>
              <footer className="border-t">
                <div className="container mx-auto flex flex-col items-center justify-between gap-2 px-4 py-6 text-sm md:flex-row">
                  <p className="text-muted-foreground">
                    {"© "} {new Date().getFullYear()} Tailored Apply. All rights reserved.
                  </p>
                  <div className="flex items-center gap-4">
                    <Link href="/" className="hover:underline">
                      Home
                    </Link>
                    <Link href="/history" className="hover:underline">
                      History
                    </Link>
                  </div>
                </div>
              </footer>
            </div>
          </Suspense>
          <Toaster richColors position="top-center" />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
