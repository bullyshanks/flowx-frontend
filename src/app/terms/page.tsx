import { LegalPage, LegalSection } from '@/components/LegalPage';

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="July 2026">
      <LegalSection title="Ordering">
        <p>
          Orders are placed for delivery within a FlowX-serviced zone in Karachi. Product
          quantities are subject to each product&apos;s minimum order requirement, shown at
          checkout. We reserve the right to cancel an order if no vendor or rider is available to
          fulfil it in your zone.
        </p>
      </LegalSection>
      <LegalSection title="Payment">
        <p>
          We accept Cash on Delivery, JazzCash, Easypaisa, bank transfer, and card payment.
          Online/wallet payments are verified manually against the receipt you provide before your
          order is confirmed — please allow time for this during business hours.
        </p>
      </LegalSection>
      <LegalSection title="Delivery">
        <p>
          Delivery timing depends on vendor and rider availability in your zone. You&apos;ll
          receive an order ID by SMS to track your order&apos;s status at any time on our{' '}
          <a href="/track" className="text-cyan2 hover:underline">
            Track Order
          </a>{' '}
          page.
        </p>
      </LegalSection>
      <LegalSection title="Vendors & riders">
        <p>
          Vendors and riders operate as independent partners approved by FlowX after a KYC
          review. Accounts found violating our zone, quality, or conduct standards may be
          suspended or rejected.
        </p>
      </LegalSection>
      <LegalSection title="Changes">
        <p>
          We may update these terms from time to time. Continued use of FlowX after a change means
          you accept the updated terms.
        </p>
      </LegalSection>
      <LegalSection title="Contact">
        <p>
          Questions? WhatsApp us at +92 315 8374442 or email{' '}
          <a href="mailto:orders@flowx.pk" className="text-cyan2 hover:underline">
            orders@flowx.pk
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
