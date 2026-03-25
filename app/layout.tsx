import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'  // <-- Add this import
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'UniHub - Peer-to-Peer Learning Platform',
  description: 'Connect with tutors, join study groups, and learn together. UniHub is a peer-to-peer learning platform for university students featuring live streaming, study materials, and collaborative learning.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        {children}
        {/* Toast notifications container */}
        <Toaster 
          position="top-center"
          richColors
          closeButton
          toastOptions={{
            duration: 3000,
            style: {
              fontSize: '14px',
              padding: '12px 16px',
            },
          }}
        />
        <Analytics />
      </body>
    </html>
  )
}