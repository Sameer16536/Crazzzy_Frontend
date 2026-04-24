/**
 * Contact Page
 * Contact form and store information for Crazzzy Store
 */

'use client'

import { Navbar } from '@/components/navbar'
import { motion } from 'framer-motion'
import { Mail, MapPin, MessageSquare, Send } from 'lucide-react'
import Link from 'next/link'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16" />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="space-y-4 mb-16"
        >
          <h1 className="text-5xl sm:text-6xl font-black text-foreground">
            Get in Touch
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl">
            Have a question about your order, a wholesale enquiry, or just want to say hello?
            We&apos;d love to hear from you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="space-y-8"
          >
            <div className="flex gap-4 items-start">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Mail size={22} className="text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-foreground mb-1">Email Us</h3>
                <a href="mailto:info@crazzzy.com" className="text-muted-foreground hover:text-primary transition-colors">
                  info@crazzzy.com
                </a>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="p-3 bg-primary/10 rounded-xl">
                <MapPin size={22} className="text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-foreground mb-1">Location</h3>
                <p className="text-muted-foreground">India 🇮🇳</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="p-3 bg-primary/10 rounded-xl">
                <MessageSquare size={22} className="text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-foreground mb-1">Response Time</h3>
                <p className="text-muted-foreground">We usually reply within 24–48 hours.</p>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.form
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="space-y-5"
            onSubmit={(e) => e.preventDefault()}
          >
            <div>
              <label htmlFor="contact-name" className="block text-sm font-semibold text-foreground mb-2">
                Name
              </label>
              <input
                id="contact-name"
                type="text"
                placeholder="Your name"
                className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="block text-sm font-semibold text-foreground mb-2">
                Email
              </label>
              <input
                id="contact-email"
                type="email"
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              />
            </div>
            <div>
              <label htmlFor="contact-message" className="block text-sm font-semibold text-foreground mb-2">
                Message
              </label>
              <textarea
                id="contact-message"
                rows={5}
                placeholder="What's on your mind?"
                className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 cursor-interactive"
            >
              <Send size={18} />
              Send Message
            </button>
          </motion.form>
        </div>

        <div className="mt-16 pt-8 border-t border-border/30 text-center">
          <Link href="/" className="text-muted-foreground hover:text-primary transition-colors text-sm">
            ← Back to Home
          </Link>
        </div>
      </section>
    </div>
  )
}
