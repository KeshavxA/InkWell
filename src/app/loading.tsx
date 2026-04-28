import { Loader2 } from 'lucide-react';

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
        <p className="text-indigo-900 font-medium animate-pulse">Loading InkWell...</p>
      </div>
    </div>
  );
}
