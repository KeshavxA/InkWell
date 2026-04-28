'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSupabase } from '@/components/SupabaseProvider';
import { 
  LayoutDashboard, 
  FileText, 
  PenTool, 
  ShieldAlert,
  Loader2,
  User
} from 'lucide-react';
import clsx from 'clsx';

const navigation = [
  { name: 'Dashboard Home', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Posts', href: '/dashboard/posts', icon: FileText },
  { name: 'Create Post', href: '/dashboard/posts/create', icon: PenTool },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role, isLoading } = useSupabase();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-[80vh] gap-8">
      {/* Sidebar */}
      <aside className="w-full md:w-64 flex-shrink-0">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 sticky top-24 transition-colors">
          <nav className="space-y-1.5">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={clsx(
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium',
                    'group flex items-center px-4 py-3 text-sm rounded-xl transition-all'
                  )}
                >
                  <item.icon
                    className={clsx(
                      isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400',
                      'flex-shrink-0 -ml-1 mr-3 h-5 w-5 transition-colors'
                    )}
                    aria-hidden="true"
                  />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
            
            {role === 'admin' && (
              <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-800">
                <Link
                  href="/dashboard/admin"
                  className={clsx(
                    pathname.startsWith('/dashboard/admin')
                      ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-700 dark:hover:text-purple-400 font-medium',
                    'group flex items-center px-4 py-3 text-sm rounded-xl transition-all'
                  )}
                >
                  <ShieldAlert
                    className={clsx(
                      pathname.startsWith('/dashboard/admin') ? 'text-purple-700 dark:text-purple-400' : 'text-slate-400 group-hover:text-purple-700 dark:group-hover:text-purple-400',
                      'flex-shrink-0 -ml-1 mr-3 h-5 w-5 transition-colors'
                    )}
                    aria-hidden="true"
                  />
                  <span className="truncate">Admin Panel</span>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}
