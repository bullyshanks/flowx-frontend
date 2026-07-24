import { LegalPage, LegalSection } from '@/components/LegalPage';

export default function RefundPage() {
  return (
    <LegalPage title="Refund Policy" updated="July 2026">
      <LegalSection title="Cancelling before delivery">
        <p>
          If your order hasn&apos;t been picked up for delivery yet, contact us on WhatsApp at
          +92 315 8374442 with your order ID and we&apos;ll cancel it. For Cash on Delivery
          orders, no payment has been collected yet so there&apos;s nothing to refund. For
          JazzCash/Easypaisa/bank/card orders paid in advance, we&apos;ll refund the amount back
          to the same account.
        </p>
      </LegalSection>
      <LegalSection title="Issues after delivery">
        <p>
          If your delivery arrived damaged, incomplete, or incorrect, contact us within 24 hours
          of delivery with your order ID and, where possible, a photo. We&apos;ll review it and
          arrange a replacement or refund.
        </p>
      </LegalSection>
      <LegalSection title="How refunds are paid">
        <p>
          Refunds are processed manually by our team — for Cash on Delivery orders this is a bank
          transfer or JazzCash/Easypaisa payout to you; for orders paid online, it&apos;s returned
          to the same method. Refunds are typically processed within 3–5 business days of
          approval.
        </p>
      </LegalSection>
      <LegalSection title="Request a refund">
        <p>
          Refunds aren&apos;t self-service yet — message us on WhatsApp at +92 315 8374442 or
          email{' '}
          <a href="mailto:orders@flowx.pk" className="text-cyan2 hover:underline">
            orders@flowx.pk
          </a>{' '}
          with your order ID and we&apos;ll take care of it.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
