import { LegalLayout } from '@/components/legal-layout'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function FAQsPage() {
  const faqCategories = [
    {
      title: "Orders & Payments",
      items: [
        {
          q: "How can I track my order?",
          a: "Once your order is dispatched, you will receive an email with a tracking link. You can also track it directly on our 'Track Order' page using your Order ID."
        },
        {
          q: "What payment methods do you accept?",
          a: "We accept all major credit/debit cards, UPI (PhonePe, Google Pay, etc.), Net Banking, and popular mobile wallets. All payments are processed through secure gateways."
        },
        {
          q: "Can I cancel my order?",
          a: "Yes, you can cancel your order within 24 hours of placement or before it's dispatched. Please email support@crazzzy.in with your Order ID to request a cancellation."
        }
      ]
    },
    {
      title: "Shipping & Delivery",
      items: [
        {
          q: "How long does delivery take?",
          a: "Express shipping usually takes 4-5 business days, while standard shipping takes 8-10 business days across India."
        },
        {
          q: "Do you ship internationally?",
          a: "Currently, we primarily ship within India. For international enquiries, please contact us at support@crazzzy.in for custom shipping arrangements."
        },
        {
          q: "Are there any shipping charges?",
          a: "Shipping charges are calculated at checkout based on your location and order weight. We often provide Free Shipping on orders above a specific value."
        }
      ]
    },
    {
      title: "Returns & Refunds",
      items: [
        {
          q: "What is your return policy?",
          a: "We accept returns only for damaged, defective, or incorrect products. Please notify us within 48 hours of delivery with photos of the product and packaging."
        },
        {
          q: "How long does it take to get a refund?",
          a: "Once approved, refunds are initiated immediately and usually take 5-7 business days to reflect in your original payment method."
        }
      ]
    },
    {
      title: "Product Information",
      items: [
        {
          q: "What materials are the posters made of?",
          a: "Our standard posters are printed on high-quality 300GSM matte finish paper. Metal posters are crafted from durable, rust-resistant metal with premium high-definition prints."
        },
        {
          q: "Are the products authentic pop culture merchandise?",
          a: "Yes! We curate and design premium, artist-inspired merchandise that celebrates the best of pop culture."
        }
      ]
    }
  ]

  return (
    <LegalLayout 
      title="Frequently Asked Questions"
    >
      <div className="space-y-12">
        {faqCategories.map((category, idx) => (
          <section key={idx} className="space-y-6">
            <h2 className="text-2xl font-black text-foreground tracking-tight uppercase border-b border-primary/20 pb-2">
              {category.title}
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {category.items.map((item, i) => (
                <AccordionItem key={i} value={`item-${idx}-${i}`} className="border-border/50">
                  <AccordionTrigger className="text-left font-bold hover:text-primary transition-colors py-4 text-lg">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-6 text-base">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ))}

        <section className="mt-16 p-8 bg-muted/20 border border-border/50 rounded-2xl text-center space-y-4">
          <h3 className="text-xl font-bold text-foreground uppercase tracking-tight">Still have questions?</h3>
          <p className="text-muted-foreground">
            Our support team is here to help you 24/7.
          </p>
          <div className="pt-4">
            <a 
              href="mailto:support@crazzzy.in" 
              className="inline-block px-8 py-3 bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs hover:bg-primary/90 transition-all active:scale-95"
            >
              Contact Support
            </a>
          </div>
        </section>
      </div>
    </LegalLayout>
  )
}
