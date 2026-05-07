import { LegalLayout } from '@/components/legal-layout'

export default function RefundPage() {
  return (
    <LegalLayout 
      title="Refund & Cancellation"
      lastUpdated="May 2026"
    >
      <section className="space-y-6">
        <p>
          At <strong>Crazzzy Store</strong>, we strive to ensure you are 100% satisfied with your purchase. If you have any issues with your order, we are here to help.
        </p>

        <div className="space-y-8 mt-12">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground underline decoration-primary decoration-2 underline-offset-4 tracking-tight uppercase">Cancellation Policy</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Orders can be cancelled <strong>within 24 hours</strong> of placement or before they are dispatched, whichever is earlier.</li>
              <li>Once an order has been dispatched, it cannot be cancelled.</li>
              <li>To cancel your order, please contact us immediately at <a href="mailto:support@crazzzy.in" className="text-primary hover:underline">support@crazzzy.in</a> with your Order ID.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground underline decoration-primary decoration-2 underline-offset-4 tracking-tight uppercase">Returns & Exchanges</h2>
            <p>We only accept returns or exchanges in the following cases:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>The product received is damaged or defective.</li>
              <li>The wrong product was delivered.</li>
            </ul>
            <p className="bg-muted/30 p-4 rounded-lg border border-border/20 text-sm italic">
              <strong>Note:</strong> Since our products (posters, metal posters, etc.) are often made-to-order or handled with care, we do not accept returns for "change of mind" once the product is delivered in good condition.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground underline decoration-primary decoration-2 underline-offset-4 tracking-tight uppercase">Refund Process</h2>
            <div className="space-y-4">
              <p>If you receive a damaged or incorrect item:</p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Notify us within <strong>48 hours</strong> of delivery.</li>
                <li>Provide clear photos/videos of the damaged or incorrect product along with the packaging.</li>
                <li>Once your request is approved, we will either send a replacement or initiate a refund to your original payment method.</li>
              </ol>
              <p>
                Refunds typically take <strong>5-7 business days</strong> to reflect in your account once initiated.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground underline decoration-primary decoration-2 underline-offset-4 tracking-tight uppercase">Non-Refundable Items</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Gift cards.</li>
              <li>Items on clearance or final sale.</li>
              <li>Products damaged due to customer mishandling.</li>
            </ul>
          </section>

          <section className="space-y-4 pt-12 border-t border-border/20">
            <p>
              For any further assistance, please reach out to our support team at: <br />
              <a href="mailto:support@crazzzy.in" className="text-primary hover:underline font-mono">support@crazzzy.in</a>
            </p>
          </section>
        </div>
      </section>
    </LegalLayout>
  )
}
