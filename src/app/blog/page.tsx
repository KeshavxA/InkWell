/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServerClient } from '@/lib/supabase/server';
import { BookOpen } from 'lucide-react';
import Link from 'next/link';
import BlogSearch from '@/components/BlogSearch';
import PostCard from '@/components/ui/PostCard';
import Pagination from '@/components/ui/Pagination';

export const dynamic = 'force-dynamic';

export default async function BlogListPage(props: {
  searchParams: Promise<{ query?: string; page?: string }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const page = Number(searchParams?.page) || 1;
  const POSTS_PER_PAGE = 6;
  
  const supabase = await createServerClient();
  
  let supabaseQuery = supabase
    .from('posts')
    .select(`
      id, title, summary, created_at, featured_image,
      users:author_id(full_name)
    `, { count: 'exact' });

  if (query) {
    supabaseQuery = supabaseQuery.ilike('title', `%${query}%`);
  }

  const from = (page - 1) * POSTS_PER_PAGE;
  const to = from + POSTS_PER_PAGE - 1;

  const { data: posts, count } = await supabaseQuery
    .order('created_at', { ascending: false })
    .range(from, to);

  const totalPages = count ? Math.ceil(count / POSTS_PER_PAGE) : 1;

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
          The <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">InkWell</span> Blog
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
          Explore our collection of articles, insights, and stories from thought leaders and creatives.
        </p>
        <BlogSearch />
      </div>

      {posts && posts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {posts.map((post: any) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          <Pagination 
            page={page} 
            totalPages={totalPages} 
            baseUrl="/blog" 
            query={query} 
          />
        </>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
          <BookOpen className="mx-auto h-12 w-12 text-slate-200 dark:text-slate-800 mb-4" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No posts found</h3>
          <p className="text-slate-500 dark:text-slate-400">
            {query ? `We couldn't find any posts matching "${query}".` : 'Our library is currently empty. Check back soon!'}
          </p>
          {query && (
            <Link href="/blog" className="mt-6 inline-block text-indigo-600 font-medium hover:text-indigo-800 transition-colors">
              Clear search
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
