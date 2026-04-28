/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from 'next/link';
import { createServerClient } from '@/lib/supabase/server';
import { format } from 'date-fns';
import { ArrowRight, BookOpen } from 'lucide-react';
export default async function HomePage() {
  const supabase = createServerClient();
  
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
      <section className="relative overflow-hidden bg-white mt-10 rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-12 lg:p-16">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-white opacity-50 z-0"></div>
        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
          <BookOpen className="w-16 h-16 text-indigo-600 mx-auto" />
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">InkWell</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
            A premium blogging platform where ideas flow freely. Read breathtaking stories, discover new insights, and join a thriving community of writers.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/blog"
              className="w-full sm:w-auto px-8 py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-full transition-all shadow-md hover:shadow-lg flex items-center justify-center"
            >
              Start Reading
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-full transition-all flex items-center justify-center"
            >
              Become an Author
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Posts Section */}
      <section className="pb-16 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8 px-2">
          <h2 className="text-2xl font-bold text-gray-900">Latest Discoveries</h2>
          <Link href="/blog" className="text-indigo-600 font-medium hover:text-indigo-800 flex items-center">
            View all <ArrowRight className="ml-1 w-4 h-4" />
          </Link>
        </div>
        
        {latestPosts && latestPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestPosts.map((post: any) => (
              <Link key={post.id} href={`/blog/${post.id}`} className="group block h-full">
                <article className="flex flex-col h-full bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden transform hover:-translate-y-1">
                  <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                    {post.featured_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={post.featured_image} 
                        alt={post.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                        <BookOpen className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center text-xs text-gray-500 mb-3 space-x-2">
                      <span className="font-semibold text-indigo-600">{post.users?.full_name || 'Guest'}</span>
                      <span>•</span>
                      <time>{format(new Date(post.created_at), 'MMM d, yyyy')}</time>
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
