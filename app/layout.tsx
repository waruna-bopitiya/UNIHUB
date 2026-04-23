import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'  // <-- Add this import
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kuppi.site'
const siteName = 'Kuppi Site'
const siteDescription =
  'Kuppi Site is a peer-to-peer learning platform for university students to ask questions, join study groups, share resources, and learn together.'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} | Peer-to-Peer Learning Platform`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    'Kuppi Site',
    'student learning platform',
    'peer-to-peer learning',
    'university study groups',
    'online tutoring',
    'study resources',
    'academic community',
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  generator: 'v0.app',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName,
    title: `${siteName} | Peer-to-Peer Learning Platform`,
    description: siteDescription,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteName} | Peer-to-Peer Learning Platform`,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/icon',
    apple: '/apple-icon',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('theme') === null) {
                  localStorage.setItem('theme', 'dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          storageKey="theme"
        >
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
        </ThemeProvider>
      </body>
    </html>
  )
}