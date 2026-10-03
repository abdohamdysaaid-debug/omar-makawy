import type { Metadata } from 'next';
import { packages } from '@/data/mock';
import PackageDetailsClient from '@/components/packages/PackageDetailsClient';

export function generateStaticParams() {
  return packages.map((pkg) => ({
    id: String(pkg.id),
  }));
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const pkg = packages.find((p) => String(p.id) === params.id);
  const pkgTitle = pkg?.title || 'باقة تعليمية';
  const title = `${pkgTitle} | مستر عمر مكاوي`;
  const description = pkg?.description || 'باقة تعليمية شاملة مع مستر عمر مكاوي على منصة مستر عمر مكاوي.';

  return {
    title: {
      absolute: title,
    },
    description,
    alternates: {
      canonical: `/packages/${params.id}/`,
    },
    openGraph: {
      title,
      description,
      url: `https://omarmeckawy.com/packages/${params.id}/`,
      siteName: 'منصة مستر عمر مكاوي',
    },
  };
}

export default function PackageDetailsPage({ params }: { params: { id: string } }) {
  return <PackageDetailsClient packageId={params.id} />;
}
