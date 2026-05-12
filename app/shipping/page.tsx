import { LegalLayout } from '@/components/legal-layout'

export default function ShippingPage() {
  return (
    <LegalLayout 
      title="Shipping Policy"
      lastUpdated="May 2026"
    >
      <section className="space-y-6">
        <p>
          We are committed to delivering your favorite pop culture products safely and on time. Please read our shipping policy carefully to understand how we handle your orders.
        </p>

        <div className="space-y-8 mt-12">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground underline decoration-primary decoration-2 underline-offset-4 tracking-tight uppercase">Order Processing Time</h2>
            <p>
              Orders are typically processed and prepared within <strong>2-3 business days</strong> after payment confirmation.
            </p>
            <p className="text-sm text-muted-foreground italic">
              *Processing time may vary during high order volume periods or special product launches.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground underline decoration-primary decoration-2 underline-offset-4 tracking-tight uppercase">Shipping Timelines (India)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-border bg-muted/20">
                <h3 className="font-bold text-primary uppercase text-xs tracking-widest mb-2">Express Shipping</h3>
                <p className="text-2xl font-black italic tracking-tighter text-foreground">4-5 BUSINESS DAYS</p>
              </div>
              <div className="p-4 rounded-xl border border-border bg-muted/20">
                <h3 className="font-bold text-primary uppercase text-xs tracking-widest mb-2">Standard Shipping</h3>
                <p className="text-2xl font-black italic tracking-tighter text-foreground">8-10 BUSINESS DAYS</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Delivery timelines are estimates and may vary depending on your location and external factors (weather, courier delays, etc.).
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground underline decoration-primary decoration-2 underline-offset-4 tracking-tight uppercase">Shipping Charges</h2>
            <p>
              We offer <strong>Free Shipping</strong> on all orders above <strong>₹999</strong> across India. For orders below this value, a standard shipping fee will be calculated at checkout.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground underline decoration-primary decoration-2 underline-offset-4 tracking-tight uppercase">Payment & COD Policy</h2>
            <p>
              Please note that we currently <strong>do not offer Cash on Delivery (COD)</strong>. We only accept prepaid orders through our secure payment gateway (Razorpay), which supports UPI, Credit/Debit Cards, Net Banking, and Wallets.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground underline decoration-primary decoration-2 underline-offset-4 tracking-tight uppercase">Tracking Your Order</h2>
            <p>
              Once your order is dispatched, you will receive a shipping confirmation email and/or SMS with a <strong>Tracking ID</strong>. You can use this ID on our partner courier website to monitor your shipment's progress.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground underline decoration-primary decoration-2 underline-offset-4 tracking-tight uppercase">International Shipping</h2>
            <p>
              Currently, we primarily ship within India. However, international shipping can be arranged upon request. Please contact us at <a href="mailto:support@crazzzy.in" className="text-primary hover:underline font-mono">support@crazzzy.in</a> for a custom shipping quote.
            </p>
            <p className="text-sm text-muted-foreground italic">
              *Note: Customs duties, taxes, or additional international charges are the responsibility of the customer.
            </p>
          </section>

          <section className="space-y-4 pt-12 border-t border-border/20 text-center">
            <p>
              Questions about your delivery? We're here to help! <br />
              <a href="mailto:support@crazzzy.in" className="text-primary hover:underline font-mono text-lg font-bold">support@crazzzy.in</a>
            </p>
          </section>
        </div>
      </section>
    </LegalLayout>
  )
}
