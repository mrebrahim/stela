import type { MetadataRoute } from 'next';
import { createPublicClient } from '@/lib/supabase/public';
import { env } from '@/lib/env';
import { locales } from '@/i18n/config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createPublicClient();
  const { data: projects } = await supabase.from('projects').select('slug').eq('is_active', true);
  const { data: listings } = await supabase.from('listings').select('slug, updated_at').eq('status', 'published');

  const urls: MetadataRoute.Sitemap = [];
  for (const locale of locales) {
    urls.push({ url: `${env.SITE_URL}/${locale}`, changeFrequency: 'daily', priority: 1 });
    urls.push({ url: `${env.SITE_URL}/${locale}/buy`, changeFrequency: 'hourly', priority: 0.9 });
    urls.push({ url: `${env.SITE_URL}/${locale}/rent`, changeFrequency: 'hourly', priority: 0.9 });
    (projects ?? []).forEach((p) => {
      urls.push({ url: `${env.SITE_URL}/${locale}/projects/${p.slug}`, changeFrequency: 'daily', priority: 0.8 });
    });
    (listings ?? []).forEach((l) => {
      urls.push({
        url: `${env.SITE_URL}/${locale}/listings/${l.slug}`,
        lastModified: l.updated_at,
        changeFrequency: 'weekly',
        priority: 0.7
      });
    });
  }
  return urls;
}
