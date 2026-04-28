'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSupabase } from './SupabaseProvider';
import { Menu, X, User as UserIcon, LogOut, LayoutDashboard, Settings, ShieldAlert } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, role, isLoading } = useSupabase();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <nav className="bg-white dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-black text-slate-900 dark:text-white font-serif tracking-tighter">
                InkWell
              </Link>
            </div>
            <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
              <Link
                href="/"
                className="border-transparent text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
              >
                Home
              </Link>
              <Link
                href="/blog"
                className="border-transparent text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
              >
                Blog
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {!isLoading && (
              user ? (
                <div className="flex items-center space-x-6">
                  {role === 'admin' && (
                    <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50">
                      Admin
                    </span>
                  )}
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-bold rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-all hover:shadow-indigo-500/20"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                  
                  <div className="relative ml-3">
                    <div>
                      <button
                        type="button"
                        className="flex text-sm border-2 border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                      >
                        <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400">
                          <UserIcon className="w-5 h-5" />
                        </div>
                      </button>
                    </div>

                    {isProfileDropdownOpen && (
                      <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-2xl shadow-xl py-2 bg-white dark:bg-slate-900 ring-1 ring-black/5 dark:ring-white/10 focus:outline-none z-50 border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-100">
                        <div className="px-4 py-2 border-b border-slate-50 dark:border-slate-800 mb-1">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Account</p>
                        </div>
                        <Link
                          href="/profile"
                          className="block px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center transition-colors"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <Settings className="w-4 h-4 mr-3 text-slate-400" />
                          Profile Settings
                        </Link>
                        {role === 'admin' && (
                          <Link
                            href="/dashboard/admin"
                            className="block px-4 py-2.5 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 flex items-center transition-colors"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <ShieldAlert className="w-4 h-4 mr-3" />
                            Admin Panel
                          </Link>
                        )}
                        <div className="my-1 border-t border-slate-50 dark:border-slate-800"></div>
                        <button
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            handleLogout();
                          }}
                          className="block w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center transition-colors"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-6">
                  <Link
                    href="/login"
                    className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-semibold transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-bold rounded-full text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-indigo-500/20 transition-all"
                  >
                    Get Started
                  </Link>
                </div>
              )
            )}
          </div>
          
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/"
              className="bg-gray-50 border-black text-black block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            >
              Home
            </Link>
            <Link
              href="/blog"
              className="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            >
              Blog
            </Link>
          </div>
          {!isLoading && (
            <div className="pt-4 pb-3 border-t border-gray-200">
              {user ? (
                <>
                  <div className="flex items-center px-4 mb-3 justify-between">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                        <UserIcon className="w-6 h-6" />
                      </div>
                      <div className="ml-3">
                        <div className="text-base font-medium text-gray-800">
                          {user.user_metadata?.username || user.email}
                        </div>
                      </div>
                    </div>
                    {role === 'admin' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="mt-3 space-y-1">
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                    >
                      Dashboard
                    </Link>
                    {role === 'admin' && (
                      <Link
                        href="/dashboard/admin"
                        className="block px-4 py-2 text-base font-medium text-purple-600 hover:text-purple-800 hover:bg-purple-50"
                      >
                        Admin Panel
                      </Link>
                    )}
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => handleLogout()}
                      className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="mt-3 space-y-1">
                  <Link
                    href="/login"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
