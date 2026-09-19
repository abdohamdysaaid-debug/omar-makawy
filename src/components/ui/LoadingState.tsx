import React from 'react';

interface LoadingStateProps {
  fullPage?: boolean;
}

export default function LoadingState({ fullPage = false }: LoadingStateProps) {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin"></div>
      <p className="text-gray-500 dark:text-gray-400 font-cairo animate-pulse">جاري التحميل...</p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        {content}
      </div>
    );
  }

  return (
    <div className="py-12 flex items-center justify-center w-full">
      {content}
    </div>
  );
}
