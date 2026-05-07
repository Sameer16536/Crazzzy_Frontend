import { LegalLayout } from '@/components/legal-layout'

export default function PrivacyPage() {
  return (
    <LegalLayout 
      title="Privacy Policy"
      lastUpdated="May 2026"
    >
      <section className="space-y-6">
        <p>
          At <strong>Crazzzy Store</strong>, we value your privacy and are committed to protecting your personal information. This Privacy Policy outlines how we collect, use, and safeguard your data when you visit Crazzzy.in.
        </p>

        <div className="space-y-8 mt-12">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">1. Information We Collect</h2>
            <p>
              We collect information that you provide to us directly, such as when you create an account, place an order, or contact our support team. This may include:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Name and contact information (email address, phone number).</li>
              <li>Shipping and billing addresses.</li>
              <li>Payment information (processed securely through our payment gateways).</li>
              <li>Order history and preferences.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">2. How We Use Your Information</h2>
            <p>We use the collected information to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Process and fulfill your orders.</li>
              <li>Communicate with you regarding your orders or inquiries.</li>
              <li>Improve our website, products, and customer service.</li>
              <li>Send promotional emails or newsletters (you can opt-out at any time).</li>
              <li>Prevent fraudulent activities and ensure website security.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">3. Information Sharing</h2>
            <p>
              We do not sell or rent your personal information to third parties. We may share your data with trusted service providers who assist us in operating our website, conducting our business, or servicing you (e.g., shipping partners, payment processors), provided they agree to keep this information confidential.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">4. Data Security</h2>
            <p>
              We implement a variety of security measures to maintain the safety of your personal information. Your sensitive data is transmitted via Secure Socket Layer (SSL) technology and encrypted into our payment gateway providers' database.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">5. Your Rights</h2>
            <p>
              You have the right to access, correct, or delete your personal information. If you wish to exercise these rights, please contact us at <a href="mailto:support@crazzzy.in" className="text-primary hover:underline">support@crazzzy.in</a>.
            </p>
          </section>

          <section className="space-y-4 pt-12 border-t border-border/20">
            <p>
              By using Crazzzy.in, you consent to our Privacy Policy. We may update this policy from time to time, and any changes will be posted on this page.
            </p>
          </section>
        </div>
      </section>
    </LegalLayout>
  )
}
