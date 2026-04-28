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
    <div className="flex flex-col md:flex-row min-h-[80vh] gap-6">
      {/* Sidebar */}
      <aside className="w-full md:w-64 flex-shrink-0">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-6">
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={clsx(
                    isActive
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600',
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors'
                  )}
                >
                  <item.icon
                    className={clsx(
                      isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600',
                      'flex-shrink-0 -ml-1 mr-3 h-5 w-5 transition-colors'
                    )}
                    aria-hidden="true"
                  />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
            
            {role === 'admin' && (
              <div className="pt-4 mt-4 border-t border-gray-200">
                <Link
                  href="/dashboard/admin"
                  className={clsx(
                    pathname.startsWith('/dashboard/admin')
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700',
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors'
                  )}
                >
                  <ShieldAlert
                    className={clsx(
                      pathname.startsWith('/dashboard/admin') ? 'text-purple-700' : 'text-gray-400 group-hover:text-purple-700',
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
