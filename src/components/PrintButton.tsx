import { Printer } from 'lucide-react';

interface Props {
  label?: string;
  className?: string;
}

export default function PrintButton({ label = 'Save as PDF', className = '' }: Props) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={`no-print inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-gray-600 border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 px-4 py-2 rounded-xl transition-colors ${className}`}
    >
      <Printer className="w-4 h-4" />
      {label}
    </button>
  );
}
