import type { Metadata } from 'next' // Tab logo deployment trigger
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from '@/components/providers'
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

import { Footer } from '@/components/footer'

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const theme = cookieStore.get('theme')?.value === 'light' ? 'light' : 'dark'

  return (
    <html lang="en" suppressHydrationWarning className={theme === 'dark' ? 'dark' : undefined}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
                document.addEventListener('contextmenu', (e) => e.preventDefault());
                document.documentElement.classList.add('production-mode');
              }
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <Providers>
          {children}
          <Footer />
        </Providers>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
