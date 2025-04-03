import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ClientWalletProvider } from "@/components/wallet-provider"


const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "GAIA - Your AI Assistant",
  description: "Chat with GAIA to discover insights and get assistance",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <ClientWalletProvider>
            {children}
          </ClientWalletProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
