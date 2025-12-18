interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

/**
 * Simple loading spinner component
 * Can be used inline or in full-page layouts
 */
export function LoadingSpinner({ size = 'md', color = 'blue-600' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  return (
    <div className={`animate-spin rounded-full border-b-2 border-${color} ${sizeClasses[size]}`}></div>
  );
}

interface LoadingStateProps {
  message?: string;
  submessage?: string;
}

/**
 * Full-page loading state with centered spinner
 * Used when entire page is loading
 */
export function LoadingState({ message = 'Loading...', submessage = 'Please wait' }: LoadingStateProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <h2 className="text-2xl font-bold text-gray-900 mt-4 mb-2">{message}</h2>
        <p className="text-gray-600">{submessage}</p>
      </div>
    </div>
  );
}
