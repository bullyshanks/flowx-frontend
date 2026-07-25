'use client';

// Registers push notifications for logged-in customers on the public site.
// Vendor/rider/admin portals each do their own equivalent registration in
// their own layout (they already gate on auth there) — this is just the
// customer-facing counterpart, mounted once in the root layout. Guests are
// skipped entirely: no account means no possible subscriber.

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { registerPush } from '@/lib/push';

export default function PushRegistrar() {
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (user?.role === 'CUSTOMER') registerPush();
  }, [user]);

  return null;
}
