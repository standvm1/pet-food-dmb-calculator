interface AdSlotProps {
  id?: string;
  label?: string;
  size?: 'banner' | 'rectangle' | 'leaderboard';
}

// Placeholder for future Google AdSense or display ad integration.
// Replace the inner content with your ad tag script when ready.
export default function AdSlot({ id = 'ad-slot', label = 'Advertisement', size = 'banner' }: AdSlotProps) {
  const dimensions: Record<string, string> = {
    banner: 'h-16',
    rectangle: 'h-64',
    leaderboard: 'h-24',
  };

  return (
    <div id={id} className={`w-full ${dimensions[size]} bg-gray-50 border border-dashed border-gray-200 rounded-xl flex items-center justify-center`}>
      <span className="text-xs text-gray-300 uppercase tracking-widest">{label}</span>
    </div>
  );
}
