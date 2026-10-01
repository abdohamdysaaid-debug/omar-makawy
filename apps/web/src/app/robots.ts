import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://omarmakawy.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/student/wallet', '/cart', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
