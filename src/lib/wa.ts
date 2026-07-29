import { env } from './env';

export function whatsappHref(prefill: string) {
  const encoded = encodeURIComponent(prefill);
  return `https://wa.me/${env.WA_NUMBER}?text=${encoded}`;
}
