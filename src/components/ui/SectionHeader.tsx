import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
}

export default function SectionHeader({ title, subtitle, centered = false }: SectionHeaderProps) {
  return (
    <div className={`mb-8 ${centered ? 'text-center' : 'text-start'}`}>
      <h2 className="text-3xl font-bold font-cairo text-gray-900 dark:text-white mb-2 relative inline-block">
        {title}
        <span className="absolute -bottom-2 start-0 w-1/2 h-1 bg-brand-500 rounded-full"></span>
      </h2>
      {subtitle && (
        <p className="mt-4 text-gray-600 dark:text-gray-400 font-cairo">
          {subtitle}
        </p>
      )}
    </div>
  );
}
