/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from 'next/link';
import { createServerClient } from '@/lib/supabase/server';
import { format } from 'date-fns';
import { ArrowRight, BookOpen } from 'lucide-react';
import PostCard from '@/components/ui/PostCard';

export default async function HomePage() {
  const supabase = await createServerClient();
  
  // Fetch latest 3 posts
  const { data: latestPosts } = await supabase
    .from('posts')
    .select(`
      id, title, summary, created_at, featured_image,
      users:author_id(full_name)
    `)
    .order('created_at', { ascending: false })
    .limit(3);

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-900/50 mt-10 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 p-8 sm:p-12 lg:p-16">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-slate-900 opacity-50 z-0"></div>
        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
          <BookOpen className="w-16 h-16 text-indigo-600 dark:text-indigo-400 mx-auto" />
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">InkWell</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
            A premium blogging platform where ideas flow freely. Read breathtaking stories, discover new insights, and join a thriving community of writers.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/blog"
              className="w-full sm:w-auto px-8 py-3.5 bg-gray-900 dark:bg-indigo-600 hover:bg-gray-800 dark:hover:bg-indigo-700 text-white font-medium rounded-full transition-all shadow-md hover:shadow-lg flex items-center justify-center"
            >
              Start Reading
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 bg-white dark:bg-transparent border border-gray-300 dark:border-slate-700 hover:border-gray-400 dark:hover:border-slate-500 text-gray-700 dark:text-slate-300 font-medium rounded-full transition-all flex items-center justify-center"
            >
              Become an Author
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Posts Section */}
      <section className="pb-16 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8 px-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Latest Discoveries</h2>
          <Link href="/blog" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors flex items-center">
            View all <ArrowRight className="ml-1 w-4 h-4" />
          </Link>
        </div>
        
        {latestPosts && latestPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestPosts.map((post: any) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
            <h3 className="text-lg font-medium text-gray-900">No posts yet</h3>
            <p className="text-gray-500 mt-2">Check back later for incredible stories.</p>
          </div>
        )}
      </section>
    </div>
  );
}
