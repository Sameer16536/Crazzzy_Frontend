import { LegalLayout } from '@/components/legal-layout'

export default function TermsPage() {
  return (
    <LegalLayout 
      title="Terms & Conditions"
      lastUpdated="May 2026"
    >
      <section className="space-y-6">
        <p>
          Welcome to <strong>Crazzzy Store</strong> (Crazzzy.in). We are an online store offering premium pop culture merchandise including posters, metal posters, collectibles, keychains, diaries, calendars, and more.
        </p>
        <p>
          These Terms & Conditions govern your use of our website and services. By accessing or using Crazzzy.in, you agree to comply with and be bound by these terms. If you do not agree, please do not use our website.
        </p>

        <div className="space-y-8 mt-12">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">1. Acceptance of Terms</h2>
            <p>
              By using Crazzzy.in, you agree to these Terms & Conditions and our Privacy Policy. If you do not agree with any part of these terms, you should discontinue use of the website immediately.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">2. Use of Website</h2>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground underline decoration-primary decoration-2 underline-offset-4">Eligibility</h3>
              <p>
                You must be at least 16 years old to use our website. By placing an order, you confirm that you meet this age requirement and have the legal capacity to enter into a binding agreement.
              </p>
              
              <h3 className="text-lg font-semibold text-foreground underline decoration-primary decoration-2 underline-offset-4">Prohibited Activities</h3>
              <p>You agree not to:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Use the website for unlawful, fraudulent, or harmful activities.</li>
                <li>Attempt to interfere with website security or functionality.</li>
                <li>Misuse our content, images, or brand materials without permission.</li>
              </ul>
              <p>Crazzzy.in reserves the right to restrict or terminate access if misuse is detected.</p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">3. Orders & Payments</h2>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground underline decoration-primary decoration-2 underline-offset-4">Order Processing</h3>
              <p>
                Orders are processed only after successful payment confirmation. We reserve the right to cancel or refuse any order at our discretion (for example, in cases of pricing errors, suspected fraud, or stock unavailability).
              </p>
              
              <h3 className="text-lg font-semibold text-foreground underline decoration-primary decoration-2 underline-offset-4">Payment Methods</h3>
              <p>
                All payments must be completed at checkout using the available payment options displayed on the website. Orders will not be processed until payment is successfully received.
              </p>
            </div>
          </section>

          <section className="space-y-4 pt-12 border-t border-border/20">
            <p>
              By continuing to use Crazzzy.in, you acknowledge that you have read, understood, and agreed to these Terms & Conditions.
            </p>
            <p>
              For any questions regarding these terms, please contact us at: <br />
              <a href="mailto:support@crazzzy.in" className="text-primary hover:underline font-mono">support@crazzzy.in</a>
            </p>
          </section>
        </div>
      </section>
    </LegalLayout>
  )
}
