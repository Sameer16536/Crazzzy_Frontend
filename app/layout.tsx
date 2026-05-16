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
  description: 'Shop exclusive high-quality posters, authentic anime figures, premium perfumes, die-cast cars, and limited edition aesthetic collectibles. Crazzzy Store is the ultimate destination for premium wall art and home decor.',
  keywords: [
    'Posters', 'Wall Art', 'Anime Figures', 'Collectibles', 'Premium Perfumes', 
    'Die-cast Cars', 'Streetwear', 'Home Decor', 'Aesthetic Decor', 'Crazzzy Store',
    'Limited Edition', 'Pop Culture', 'Gaming Gear', 'Designer Toys'
  ],
  authors: [{ name: 'Crazzzy Store' }],
  creator: 'Crazzzy Store',
  publisher: 'Crazzzy Store',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      {
        url: '/main-icon.png',
        type: 'image/png',
      },
    ],
    apple: '/main-icon.png',
  },
  openGraph: {
    title: 'Crazzzy Store — Curated for Your Kind.',
    description: 'Shop exclusive high-quality posters, authentic anime figures, and premium aesthetic collectibles.',
    url: 'https://www.crazzzy.in',
    siteName: 'Crazzzy Store',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Crazzzy Store — Curated for Your Kind.',
    description: 'Shop exclusive high-quality posters and premium aesthetic collectibles.',
    creator: '@crazzzy_store',
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
