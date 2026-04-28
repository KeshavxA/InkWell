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
        <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
        <p className="text-gray-500 mt-2">Manage your account settings and credentials</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Account Details Badge */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center text-indigo-600 mb-4 border-4 border-white shadow-md">
              <User className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">{fullName || 'User'}</h2>
            
            <div className={clsx(
              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-6",
              role === 'admin' ? "bg-purple-100 text-purple-800" :
              role === 'author' ? "bg-indigo-100 text-indigo-800" :
              "bg-gray-100 text-gray-800"
            )}>
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              {role?.toUpperCase() || 'VIEWER'}
            </div>

            <div className="w-full space-y-3 text-sm text-gray-600 text-left">
              <div className="flex items-center p-2 rounded-lg bg-gray-50">
                <Mail className="w-4 h-4 mr-3 text-gray-400" />
                <span className="truncate">{user?.email}</span>
              </div>
              <div className="flex items-center p-2 rounded-lg bg-gray-50">
                <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                <span>Joined {user?.created_at ? format(new Date(user.created_at), 'MMM yyyy') : 'Unknown'}</span>
              </div>
              {(role === 'author' || role === 'admin') && (
                <div className="flex items-center p-2 rounded-lg bg-indigo-50 text-indigo-700">
                  <FileText className="w-4 h-4 mr-3 text-indigo-400" />
                  <span className="font-semibold">{postCount}</span>
                  <span className="ml-1">Posts Written</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Edit Forms */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Edit Profile Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Personal Information</h3>
            </div>
            <div className="p-6">
              <form onSubmit={handleUpdateName} className="space-y-4">
                <div>
                  <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isUpdatingName || !fullName.trim()}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                  >
                    {isUpdatingName ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Profile
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Edit Password Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
                <Lock className="w-5 h-5 mr-2 text-gray-500" />
                Security
              </h3>
            </div>
            <div className="p-6">
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="new_password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="At least 6 characters"
                  />
                </div>
                <div>
                  <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirm_password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isUpdatingPassword || !newPassword || newPassword !== confirmPassword}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
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
