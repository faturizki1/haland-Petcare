import type { Metadata } from "next"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

export const metadata: Metadata = {
  title: "VetCare - Klinik Hewan",
  description: "Sistem manajemen klinik hewan all-in-one",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}