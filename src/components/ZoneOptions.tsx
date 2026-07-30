import type { Zone } from '@/types';

/**
 * <option> list for a customer-facing area picker.
 *
 * Zones with no approved vendor are shown but disabled: hiding them would
 * leave someone in DHA wondering why their area is missing from a site that
 * lists it in the footer, and "not available yet" is the honest answer.
 *
 * Only for ordering. Vendor and rider signup must keep every zone selectable —
 * signing up in an uncovered area is exactly how it becomes covered, and
 * disabling those would make the gap permanent.
 */
export default function ZoneOptions({ zones }: { zones: Zone[] }) {
  return (
    <>
      {zones.map((z) => {
        const unavailable = z.isServiceable === false;
        return (
          <option key={z.id} value={z.id} disabled={unavailable} className="bg-navy2">
            {z.name}
            {unavailable ? ' — not available yet' : ''}
          </option>
        );
      })}
    </>
  );
}
