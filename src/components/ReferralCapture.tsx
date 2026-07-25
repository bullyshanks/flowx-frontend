'use client';

// Captures a ?ref=<code> query param on ANY page (shared referral links point
// at the homepage, not just /login) and stashes it in localStorage so the
// login page can pick it up even if the user lands here first, browses a
// bit, and only logs in later. Mounted once in the root layout.

import { useEffect } from 'react';

export const REFERRAL_STORAGE_KEY = 'flowx_referral_code';

export default function ReferralCapture() {
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get('ref');
    if (ref) localStorage.setItem(REFERRAL_STORAGE_KEY, ref);
  }, []);

  return null;
}
