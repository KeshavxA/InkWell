import clsx from 'clsx';
import { ShieldCheck } from 'lucide-react';

export default function Badge({ role }: { role: string | null | undefined }) {
  const safeRole = role || 'viewer';
  
  return (
    <div className={clsx(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
      safeRole === 'admin' ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" :
      safeRole === 'author' ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300" :
      "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
    )}>
      <ShieldCheck className="w-3.5 h-3.5 mr-1" />
      {safeRole.toUpperCase()}
    </div>
  );
}
