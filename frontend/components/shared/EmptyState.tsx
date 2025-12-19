'use client';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon = '📭',
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  // ========================================
  // RENDER FUNCTIONS
  // ========================================

  const renderIcon = () => (
    <div className="text-6xl mb-4">{icon}</div>
  );

  const renderDescription = () => !description ? null : (
    <p className="text-gray-600 mb-6">{description}</p>
  );

  const renderAction = () => !actionLabel || !onAction ? null : (
    <button onClick={onAction} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">{actionLabel}</button>
  );

  return (
    <div className="bg-white rounded-lg shadow p-12 text-center">
      {renderIcon()}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      {renderDescription()}
      {renderAction()}
    </div>
  );
}