import clsx from 'clsx';
import { ShieldCheck } from 'lucide-react';

export default function Badge({ role }: { role: string | null | undefined }) {
  const safeRole = role || 'viewer';
  
  return (
    <div className={clsx(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
      safeRole === 'admin' ? "bg-red-100 text-red-800" :
      safeRole === 'author' ? "bg-blue-100 text-blue-800" :
      "bg-gray-100 text-gray-800"
    )}>
      <ShieldCheck className="w-3.5 h-3.5 mr-1" />
      {safeRole.toUpperCase()}
    </div>
  );
}
