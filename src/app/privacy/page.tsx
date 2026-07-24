import { LegalPage, LegalSection } from '@/components/LegalPage';

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="July 2026">
      <LegalSection title="What we collect">
        <p>
          When you place an order or register as a vendor or rider, we collect your name, phone
          number, delivery address, and (for vendors and riders) CNIC and verification photos for
          KYC. If you pay by JazzCash, Easypaisa, bank transfer, or card, we ask for a screenshot
          of the payment receipt to verify it manually — we don&apos;t store card numbers or
          account credentials.
        </p>
      </LegalSection>
      <LegalSection title="How we use it">
        <p>
          Your phone number and address are used to fulfil and deliver your order, send order
          status updates via SMS, and route your order to the vendor and rider in your zone.
          Vendor/rider KYC documents are used only for account approval and are visible to our
          admin team.
        </p>
      </LegalSection>
      <LegalSection title="Who we share it with">
        <p>
          The vendor and rider assigned to your order can see your name, phone number, and
          delivery address so they can fulfil and deliver it. We don&apos;t sell or share your
          data with anyone outside FlowX.
        </p>
      </LegalSection>
      <LegalSection title="Guest orders">
        <p>
          You don&apos;t need an account to order from FlowX. Guest order details are kept only
          for order history, support, and delivery record-keeping.
        </p>
      </LegalSection>
      <LegalSection title="Contact">
        <p>
          Questions about your data? Reach us at{' '}
          <a href="mailto:orders@flowx.pk" className="text-cyan2 hover:underline">
            orders@flowx.pk
          </a>{' '}
          or WhatsApp us at +92 315 8374442.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
