'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSupabase } from '@/components/SupabaseProvider';
import { createClient } from '@/lib/supabase/client';
import { FileText, Plus, ArrowRight, Sparkles, LayoutDashboard, History } from 'lucide-react';
import { motion } from 'framer-motion';
import AIStudio from '@/components/dashboard/AIStudio';
import WritingAnalytics from '@/components/dashboard/WritingAnalytics';

export default function DashboardHomePage() {
  const { user, role } = useSupabase();
  const [totalPosts, setTotalPosts] = useState<number>(0);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  
  const supabase = createClient();

  useEffect(() => {
    async function fetchStats() {
      if (!user) return;
      
      try {
        let postsQuery = supabase.from('posts').select('*', { count: 'exact', head: true });
        if (role !== 'admin') {
          postsQuery = postsQuery.eq('author_id', user.id);
        }
        const { count: postsCount } = await postsQuery;
        setTotalPosts(postsCount ?? 0);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoadingStats(false);
      }
    }

    fetchStats();
  }, [user, role, supabase]);

  if (!user) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-12"
    >
      {/* Premium Hero Section */}
      <motion.div 
        variants={itemVariants}
        className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 dark:bg-black p-8 md:p-12 text-white shadow-2xl"
      >
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-indigo-600/20 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-purple-600/20 blur-[100px] rounded-full" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold mb-6 tracking-wider uppercase">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              InkWell Professional Studio
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 leading-tight">
              Welcome back, <span className="text-indigo-400">{user.user_metadata?.full_name || user.email?.split('@')[0]}</span>
            </h1>
            <p className="text-slate-400 text-lg md:text-xl font-medium max-w-lg">
              {role === 'admin' 
                ? "Commander center: overseeing the entire InkWell ecosystem." 
                : "Your personal laboratory for digital storytelling and content creation."}
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <Link 
              href="/dashboard/posts/create"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black transition-all transform hover:-translate-y-1 shadow-lg shadow-indigo-600/20 group"
            >
              <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
              New Masterpiece
            </Link>
            <div className="flex items-center gap-4 px-6 py-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
              <div className="text-center border-r border-white/10 pr-4">
                <div className="text-2xl font-black">{isLoadingStats ? '...' : totalPosts}</div>
                <div className="text-[10px] uppercase font-bold text-slate-500">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-indigo-400 capitalize">{role || 'User'}</div>
                <div className="text-[10px] uppercase font-bold text-slate-500">Tier</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - AI Studio */}
        <motion.div variants={itemVariants} className="lg:col-span-7">
          <AIStudio />
        </motion.div>

        {/* Right Column - Stats & Quick Links */}
        <motion.div variants={itemVariants} className="lg:col-span-5 space-y-8">
          <WritingAnalytics />
          
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-indigo-600" />
              Navigation
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <Link 
                href="/dashboard/posts"
                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all border border-transparent hover:border-indigo-100 group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                    <History className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-indigo-600" />
                  </div>
                  <span className="font-bold text-slate-700 dark:text-slate-200">Manage Posts</span>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/dashboard/profile"
                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all border border-transparent hover:border-emerald-100 group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                    <FileText className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-emerald-600" />
                  </div>
                  <span className="font-bold text-slate-700 dark:text-slate-200">User Profile</span>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
