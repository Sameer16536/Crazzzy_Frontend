import { LegalLayout } from '@/components/legal-layout'

export default function CookiesPage() {
  return (
    <LegalLayout 
      title="Cookie Policy"
      lastUpdated="May 2026"
    >
      <section className="space-y-6">
        <p>
          This Cookie Policy explains how <strong>Crazzzy Store</strong> uses cookies and similar technologies to recognize you when you visit our website at Crazzzy.in. It explains what these technologies are and why we use them, as well as your rights to control our use of them.
        </p>

        <div className="space-y-8 mt-12">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground underline decoration-primary decoration-2 underline-offset-4 tracking-tight uppercase">What are cookies?</h2>
            <p>
              Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground underline decoration-primary decoration-2 underline-offset-4 tracking-tight uppercase">Why do we use cookies?</h2>
            <p>We use first-party and third-party cookies for several reasons:</p>
            <ul className="list-disc pl-5 space-y-4">
              <li>
                <strong className="text-foreground">Essential Cookies:</strong> These cookies are strictly necessary to provide you with services available through our website and to use some of its features, such as access to secure areas or your shopping cart.
              </li>
              <li>
                <strong className="text-foreground">Performance and Functionality Cookies:</strong> These cookies are used to enhance the performance and functionality of our website but are non-essential to their use. However, without these cookies, certain functionality (like videos) may become unavailable.
              </li>
              <li>
                <strong className="text-foreground">Analytics and Customization Cookies:</strong> These cookies collect information that is used either in aggregate form to help us understand how our website is being used or how effective our marketing campaigns are, or to help us customize our website for you.
              </li>
              <li>
                <strong className="text-foreground">Advertising Cookies:</strong> These cookies are used to make advertising messages more relevant to you. They perform functions like preventing the same ad from continuously reappearing, ensuring that ads are properly displayed for advertisers, and in some cases selecting advertisements that are based on your interests.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground underline decoration-primary decoration-2 underline-offset-4 tracking-tight uppercase">How can I control cookies?</h2>
            <p>
              You have the right to decide whether to accept or reject cookies. You can set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website though your access to some functionality and areas of our website may be restricted.
            </p>
            <p>
              As the means by which you can refuse cookies through your web browser controls vary from browser to browser, you should visit your browser&apos;s help menu for more information.
            </p>
          </section>

          <section className="space-y-4 pt-12 border-t border-border/20">
            <p>
              We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal, or regulatory reasons.
            </p>
            <p>
              If you have any questions about our use of cookies or other technologies, please email us at <a href="mailto:support@crazzzy.in" className="text-primary hover:underline">support@crazzzy.in</a>.
            </p>
          </section>
        </div>
      </section>
    </LegalLayout>
  )
}
