'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSupabase } from '@/components/SupabaseProvider';
import { createClient } from '@/lib/supabase/client';
import { FileText, MessageSquare, Plus, ArrowRight } from 'lucide-react';
import clsx from 'clsx';

export default function DashboardHomePage() {
  const { user, role } = useSupabase();
  const [totalPosts, setTotalPosts] = useState<number>(0);
  const [totalComments, setTotalComments] = useState<number>(0);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  
  const supabase = createClient();

  useEffect(() => {
    async function fetchStats() {
      if (!user) return;
      
      try {
        // Fetch posts count
        let postsQuery = supabase.from('posts').select('*', { count: 'exact', head: true });
        
        // If not admin, only count their own posts
        if (role !== 'admin') {
          postsQuery = postsQuery.eq('author_id', user.id);
        }
        
        const { count: postsCount } = await postsQuery;
        setTotalPosts(postsCount ?? 0);

        // Simulated comments count (since we don't have a comments table defined yet)
        setTotalComments(0);
        
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoadingStats(false);
      }
    }

    fetchStats();
  }, [user, role, supabase]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Welcome back, {user.user_metadata?.full_name || user.email?.split('@')[0]}!
            </h1>
            <p className="text-gray-500 mt-2">
              {role === 'admin' 
                ? "You have full control over the platform's content and users." 
                : "Here is what is happening with your InkWell account today."}
            </p>
          </div>
          <div className="hidden sm:block">
            <span className={clsx(
              "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
              role === 'admin' ? "bg-purple-100 text-purple-800" :
              role === 'author' ? "bg-indigo-100 text-indigo-800" :
              "bg-gray-100 text-gray-800"
            )}>
              {role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Viewer'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600">
              <FileText className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Total Posts</h2>
              <div className="text-2xl font-bold text-gray-900">
                {isLoadingStats ? '...' : totalPosts}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Total Comments</h2>
              <div className="text-2xl font-bold text-gray-900">
                {isLoadingStats ? '...' : totalComments}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link 
          href="/dashboard/posts/create"
          className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-indigo-300 transition-all group"
        >
          <div className="flex items-center">
            <div className="bg-indigo-50 p-2 rounded-full text-indigo-600 group-hover:bg-indigo-100 transition-colors">
              <Plus className="h-5 w-5" />
            </div>
            <span className="ml-3 font-medium text-gray-900">Create New Post</span>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
        </Link>
        
        <Link 
          href={role === 'admin' ? "/dashboard/posts" : "/dashboard/posts"}
          className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-indigo-300 transition-all group"
        >
          <div className="flex items-center">
            <div className="bg-gray-50 p-2 rounded-full text-gray-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
              <FileText className="h-5 w-5" />
            </div>
            <span className="ml-3 font-medium text-gray-900">
              {role === 'admin' ? 'Manage All Posts' : 'View My Posts'}
            </span>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
        </Link>
      </div>
    </div>
  );
}
