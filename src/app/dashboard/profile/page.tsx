/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/components/SupabaseProvider';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { User, Lock, Save, Loader2, ShieldCheck, Mail, Calendar, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function ProfilePage() {
  const { user, role, isLoading: isAuthLoading } = useSupabase();
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [postCount, setPostCount] = useState(0);

  const [isUpdatingName, setIsUpdatingName] = useState(false);
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      // Fetch full name from public.users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', user?.id)
        .single();
        
      if (userError) throw userError;
      if (userData?.full_name) setFullName(userData.full_name);

      // Fetch posts count if author or admin
      if (role === 'author' || role === 'admin') {
        const { count, error: countError } = await supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .eq('author_id', user?.id);
          
        if (countError) throw countError;
        setPostCount(count || 0);
      }
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoading && user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchProfileData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAuthLoading]);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    setIsUpdatingName(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName.trim() })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update name');
      }

      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success('Password updated successfully');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (isAuthLoading || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Your Profile</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Manage your account settings, credentials, and identity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Account Details Badge */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 flex flex-col items-center text-center transition-colors">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6 border-4 border-white dark:border-slate-800 shadow-md">
              <User className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">{fullName || 'User'}</h2>
            
            <div className={clsx(
              "inline-flex items-center px-4 py-1 rounded-full text-[10px] font-black mb-8 tracking-widest",
              role === 'admin' ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50" :
              role === 'author' ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50" :
              "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
            )}>
              <ShieldCheck className="w-3 h-3 mr-1.5" />
              {role?.toUpperCase() || 'VIEWER'}
            </div>

            <div className="w-full space-y-2.5 text-sm text-slate-600 dark:text-slate-400 text-left">
              <div className="flex items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/50">
                <Mail className="w-4 h-4 mr-3 text-slate-400" />
                <span className="truncate font-medium">{user?.email}</span>
              </div>
              <div className="flex items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/50">
                <Calendar className="w-4 h-4 mr-3 text-slate-400" />
                <span className="font-medium">Joined {user?.created_at ? format(new Date(user.created_at), 'MMM yyyy') : 'Unknown'}</span>
              </div>
              {(role === 'author' || role === 'admin') && (
                <div className="flex items-center p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30">
                  <FileText className="w-4 h-4 mr-3 text-indigo-400 dark:text-indigo-500" />
                  <span className="font-bold text-base mr-1">{postCount}</span>
                  <span className="text-xs font-bold uppercase tracking-wider opacity-70">Posts Written</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Edit Forms */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Edit Profile Form */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
            <div className="px-8 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Personal Information</h3>
            </div>
            <div className="p-8">
              <form onSubmit={handleUpdateName} className="space-y-6">
                <div>
                  <label htmlFor="full_name" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-5 py-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium"
                  />
                </div>
                
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isUpdatingName || !fullName.trim()}
                    className="inline-flex items-center px-8 py-3.5 border border-transparent text-sm font-bold rounded-full shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all transform hover:-translate-y-0.5"
                  >
                    {isUpdatingName ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Profile Changes
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Edit Password Form */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
            <div className="px-8 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
                <Lock className="w-5 h-5 mr-3 text-slate-400" />
                Security & Password
              </h3>
            </div>
            <div className="p-8">
              <form onSubmit={handleUpdatePassword} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="new_password" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      id="new_password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-5 py-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium"
                      placeholder="Min. 6 characters"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirm_password" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      id="confirm_password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-5 py-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium"
                    />
                  </div>
                </div>
                
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isUpdatingPassword || !newPassword || newPassword !== confirmPassword}
                    className="inline-flex items-center px-8 py-3.5 border border-slate-200 dark:border-slate-700 shadow-sm text-sm font-bold rounded-full text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none transition-all disabled:opacity-30 transform hover:-translate-y-0.5"
                  >
                    {isUpdatingPassword ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Lock className="w-4 h-4 mr-2" />
                    )}
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
