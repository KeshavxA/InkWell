/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServerClient } from '@/lib/supabase/server';
import { format } from 'date-fns';
import Link from 'next/link';
import { ArrowRight, BookOpen, Clock } from 'lucide-react';
import BlogSearch from '@/components/BlogSearch';

export const dynamic = 'force-dynamic';

export default async function BlogListPage(props: {
  searchParams: Promise<{ query?: string; page?: string }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const page = Number(searchParams?.page) || 1;
  const POSTS_PER_PAGE = 6;
  
  const supabase = createServerClient();
  
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
        <h1 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tight mb-4">
          The <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">InkWell</span> Blog
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
          Explore our collection of articles, insights, and stories from thought leaders and creatives.
        </p>
        <BlogSearch />
      </div>

      {posts && posts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {posts.map((post: any) => (
              <Link key={post.id} href={`/blog/${post.id}`} className="group block h-full">
                <article className="flex flex-col h-full bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden transform hover:-translate-y-1">
                  <div className="relative h-56 w-full bg-gray-100 overflow-hidden">
                    {post.featured_image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img 
                        src={post.featured_image} 
                        alt={post.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gradient-to-br from-gray-50 to-gray-100">
                        <BookOpen className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center text-xs text-gray-500 mb-3 space-x-3">
                      <span className="font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                        {post.users?.full_name || 'Guest'}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {format(new Date(post.created_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-grow">
                      {post.summary}
                    </p>
                    <div className="mt-auto flex items-center text-indigo-600 font-medium text-sm">
                      Read story <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-12">
              <nav className="inline-flex rounded-md shadow-sm" aria-label="Pagination">
                <Link
                  href={`/blog?page=${Math.max(1, page - 1)}${query ? `&query=${query}` : ''}`}
                  className={`relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    page === 1 ? 'text-gray-300 pointer-events-none' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </Link>
                <div className="hidden sm:inline-flex relative items-center px-4 py-2 border-t border-b border-gray-300 bg-white text-sm font-medium text-gray-700">
                  Page {page} of {totalPages}
                </div>
                <Link
                  href={`/blog?page=${Math.min(totalPages, page + 1)}${query ? `&query=${query}` : ''}`}
                  className={`relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    page === totalPages ? 'text-gray-300 pointer-events-none' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Next
                </Link>
              </nav>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
          <BookOpen className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No posts found</h3>
          <p className="text-gray-500">
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
