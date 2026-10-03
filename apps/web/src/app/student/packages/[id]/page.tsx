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

  return {
    title: {
      absolute: title,
    },
    description: 'محتوى ومحاضرات الباقة التعليمية على منصة مستر عمر مكاوي.',
  };
}

export default function StudentPackageDetailsPage({ params }: { params: { id: string } }) {
  return <PackageDetailsClient packageId={params.id} />;
}
