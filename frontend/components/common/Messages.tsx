interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
}

/**
 * Reusable error message component
 * Shows red error box with optional dismiss button
 */
export function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
      <span className="font-medium">{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-700 hover:text-red-900 font-bold ml-4"
        >
          ×
        </button>
      )}
    </div>
  );
}

interface SuccessMessageProps {
  message: string;
  onDismiss?: () => void;
}

/**
 * Reusable success message component
 * Shows green success box with optional dismiss button
 */
export function SuccessMessage({ message, onDismiss }: SuccessMessageProps) {
  if (!message) return null;

  return (
    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
      <span className="font-medium">{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-green-700 hover:text-green-900 font-bold ml-4"
        >
          ×
        </button>
      )}
    </div>
  );
}
