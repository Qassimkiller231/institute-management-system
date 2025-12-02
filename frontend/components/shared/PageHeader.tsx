'use client';

import { useRouter } from 'next/navigation';

interface PageHeaderProps {
  title: string;
  description?: string;
  backUrl?: string;
  backLabel?: string;
  actions?: React.ReactNode;
  gradient?: 'indigo' | 'blue' | 'green' | 'purple';
}

export default function PageHeader({
  title,
  description,
  backUrl,
  backLabel = '← Back',
  actions,
  gradient = 'indigo',
}: PageHeaderProps) {
  const router = useRouter();

  const gradientClasses = {
    indigo: 'from-indigo-600 to-purple-600',
    blue: 'from-blue-600 to-indigo-600',
    green: 'from-green-600 to-teal-600',
    purple: 'from-purple-600 to-pink-600',
  };

  return (
    <div className={`bg-gradient-to-r ${gradientClasses[gradient]} text-white py-8 px-6`}>
      <div className="max-w-7xl mx-auto">
        {backUrl && (
          <button
            onClick={() => router.push(backUrl)}
            className="mb-4 text-white/80 hover:text-white flex items-center gap-2 transition"
          >
            {backLabel}
          </button>
        )}
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">{title}</h1>
            {description && (
              <p className="text-white/80 text-lg">{description}</p>
            )}
          </div>
          
          {actions && (
            <div className="flex items-center gap-4">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}