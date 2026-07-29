'use client';
import { useTranslations } from 'next-intl';
import { whatsappHref } from '@/lib/wa';

type Props = {
  reference: string;
  url: string;
  className?: string;
  onClick?: () => void;
};

export function WhatsappCta({ reference, url, className, onClick }: Props) {
  const t = useTranslations();
  const prefill = t('listing.waPrefill', { ref: reference, url });
  return (
    <a
      href={whatsappHref(prefill)}
      target="_blank"
      rel="noopener"
      onClick={() => {
        onClick?.();
        // fire GA4/Meta pixel events if configured
        if (typeof window !== 'undefined') {
          // @ts-expect-error - injected globals
          window.gtag?.('event', 'lead_whatsapp_click', { listing_ref: reference });
          // @ts-expect-error - injected globals
          window.fbq?.('trackCustom', 'LeadWhatsappClick', { listing_ref: reference });
        }
      }}
      className={
        (className ?? '') +
        ' inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-2 font-medium'
      }
    >
      <span aria-hidden>💬</span>
      {t('cta.whatsapp')}
    </a>
  );
}
