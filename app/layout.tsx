import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from '@/components/providers'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'
import { cookies } from 'next/headers'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Crazzzy Store — Curated for Your Kind.',
  description: 'Discover exclusive posters, anime figures, perfumes, die-cast cars and premium decorative pieces. Crazzzy Store curates the finest aesthetic collectibles.',
  generator: 'next.js',
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const theme = cookieStore.get('theme')?.value === 'light' ? 'light' : 'dark'

  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#d4af37',
          colorBackground: '#0c0c0c',
          colorInputBackground: '#181818',
          colorInputText: '#f0f0eb',
          colorText: '#f0f0eb',
          colorTextSecondary: '#888888',
          colorNeutral: '#2a2a2a',
          borderRadius: '0px',
          fontFamily: '"Syne", "Inter Tight", sans-serif',
          fontSize: '14px',
        },
      }}
    >
      <html lang="en" suppressHydrationWarning className={theme === 'dark' ? 'dark' : undefined}>
        <body className="font-sans antialiased">
          <Providers>
            {children}
          </Providers>
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </body>
      </html>
    </ClerkProvider>
  )
}
