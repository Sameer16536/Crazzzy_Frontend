'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Mail, Instagram, Facebook, Youtube, Twitter, MapPin } from 'lucide-react'
import { usePathname } from 'next/navigation'

export function Footer() {
  const pathname = usePathname()

  // Do not render footer on admin or checkout pages
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/checkout')) {
    return null
  }

  return (
    <footer className="bg-background border-t border-border/20 py-20 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]">
        <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand */}
          <motion.div
            className="space-y-6 lg:col-span-2"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative w-56 sm:w-64 h-16 flex items-center justify-center overflow-hidden">
              <Image
                src="/logo-light.png"
                alt="Crazzzy Collectibles"
                fill
                className="object-contain mix-blend-multiply dark:invert dark:mix-blend-screen scale-[2.5]"
              />
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
              Curating premium aesthetic pieces for modern spaces. New‑age meets vintage in every collection.
            </p>
          </motion.div>

          {/* Resources */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3 className="text-xs font-mono text-muted-foreground tracking-[0.2em] uppercase">Resources</h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: 'Track Order', href: '/track' },
                { label: 'Support', href: '/contact' },
                { label: 'Shipping Info', href: '/shipping' },
                { label: 'FAQs', href: '/faqs' },
                { label: 'Returns', href: '/refund-policy' },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-muted-foreground hover:text-primary transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Legal */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-xs font-mono text-muted-foreground tracking-[0.2em] uppercase">Legal</h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: 'Terms & Conditions', href: '/terms' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Refund Policy', href: '/refund-policy' },
                { label: 'Cookies', href: '/cookies' },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-muted-foreground hover:text-primary transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Connect */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="text-xs font-mono text-muted-foreground tracking-[0.2em] uppercase">Connect</h3>
            <div className="flex gap-2 flex-wrap">
              {[
                { icon: Facebook, label: 'Facebook' },
                { icon: Instagram, label: 'Instagram' },
                { icon: Youtube, label: 'YouTube' },
                { icon: Twitter, label: 'Twitter' },
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  className="p-2.5 bg-muted hover:bg-primary/20 transition-colors group cursor-interactive"
                  title={label}
                  aria-label={label}
                >
                  <Icon size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                </a>
              ))}
            </div>

            <div className="space-y-2 pt-2 border-t border-border/20">
              <div className="flex gap-2 items-center">
                <Mail size={14} className="text-primary flex-shrink-0" />
                <a href="mailto:storecrazzzy@gmail.com" className="text-muted-foreground hover:text-primary transition-colors text-sm font-mono">
                  storecrazzzy@gmail.com
                </a>
              </div>
              <div className="flex gap-2 items-start">
                <MapPin size={14} className="text-primary flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Unit no 5,6,7, Kopar, Sector 8,<br />
                  Ulwe, Navi Mumbai,<br />
                  Maharashtra 410206
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border/20 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-xs font-mono">
            © {new Date().getFullYear()} CRAZZZY STORE. Curating the extraordinary.
          </p>
          <span className="text-xs text-muted-foreground font-mono">India 🇮🇳</span>
        </div>
      </div>
    </footer>
  )
}
