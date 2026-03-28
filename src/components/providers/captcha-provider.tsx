'use client';

import React from 'react';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

export function CaptchaProvider({ children }: { children: React.ReactNode }) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  React.useEffect(() => {
    if (!siteKey) {
      // console.warn('reCAPTCHA site key is missing in CaptchaProvider. If you just added it to .env, please restart your dev server.');
    }
  }, [siteKey]);

  if (!siteKey) {
    return <>{children}</>;
  }

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={siteKey}
      scriptProps={{
        async: true,
        defer: true,
        appendTo: 'head',
        nonce: undefined,
      }}
    >
      {children}
    </GoogleReCaptchaProvider>
  );
}
