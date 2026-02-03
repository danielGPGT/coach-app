import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'LiftKit',
  description: 'Strength coaching platform'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
<ClerkProvider>
      <html lang='en' suppressHydrationWarning>
        <body
          className={`${outfit.variable} antialiased font-sans`}
          suppressHydrationWarning
        >
          <ThemeProvider>
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
