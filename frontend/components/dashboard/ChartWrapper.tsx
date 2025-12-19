import { ReactNode } from 'react';

interface ChartWrapperProps {
    title: string;
    children: ReactNode;
    active?: boolean;
    onClose?: () => void;
}

export default function ChartWrapper({ title, children, active = true, onClose }: ChartWrapperProps) {
    if (!active) return null;

    return (
        <div className="bg-white rounded-lg shadow p-6 h-[400px] flex flex-col relative group">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove widget"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                )}
            </div>
            <div className="flex-1 w-full min-h-0">
                {children}
            </div>
        </div>
    );
}
