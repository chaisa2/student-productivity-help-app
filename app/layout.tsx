import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "StudyFlow - Student Productivity App",
  description:
    "A comprehensive productivity app for students with focus timer, todo list, habit tracker, calendar, and AI chatbot.",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="antialiased">
      <body className="min-h-screen bg-background font-sans">{children}</body>
    </html>
  )
}
