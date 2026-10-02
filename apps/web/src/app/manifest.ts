import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'منصة مستر عمر مكاوي | Mr. Omar Meckawy Platform',
    short_name: 'منصة مستر عمر مكاوي',
    description:
      'منصة مستر عمر مكاوي التعليمية لتقديم كورسات ومحاضرات وباقات اللغة الإنجليزية للطلاب بمحتوى تعليمي منظم حسب الصف الدراسي.',
    start_url: '/',
    display: 'standalone',
    background_color: '#020d08',
    theme_color: '#0d6e4f',
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
