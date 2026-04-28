import { createServerClient } from '@/lib/supabase/server';
import { format } from 'date-fns';
import { notFound } from 'next/navigation';
import { Sparkles, Calendar, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import CommentsClient from '@/components/CommentsClient';

export default async function SinglePostPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const id = params?.id;
  
  if (!id) notFound();

  const supabase = createServerClient();

  // Fetch the post
  const { data: post, error } = await supabase
    .from('posts')
    .select(`
      *,
      users:author_id(full_name)
    `)
    .eq('id', id)
    .single();

  if (error || !post) {
    notFound();
  }

  // Fetch the comments
  const { data: comments } = await supabase
    .from('comments')
    .select(`
      *,
      users:author_id(full_name)
    `)
    .eq('post_id', id)
    .order('created_at', { ascending: false });

  return (
    <article className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Back button */}
      <Link href="/blog" className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 mb-8 transition-colors">
        <ArrowLeft className="mr-2 w-4 h-4" />
        Back to all posts
      </Link>

      {/* Header */}
      <header className="mb-10 text-center">
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight mb-6">
          {post.title}
        </h1>
        
        <div className="flex items-center justify-center space-x-6 text-gray-500">
          <div className="flex items-center">
            <User className="w-5 h-5 mr-2 text-indigo-500" />
            <span className="font-medium text-gray-900">{post.users?.full_name || 'Guest'}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-indigo-500" />
            <time dateTime={post.created_at}>
              {format(new Date(post.created_at), 'MMMM d, yyyy')}
            </time>
          </div>
        </div>
      </header>

      {/* Featured Image */}
      {post.featured_image && (
        <div className="relative w-full h-[400px] sm:h-[500px] rounded-3xl overflow-hidden mb-12 shadow-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={post.featured_image} 
            alt={post.title}
            className="object-cover w-full h-full"
          />
        </div>
      )}

      {/* AI Summary Highlight Card */}
      {post.summary && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-8 rounded-3xl mb-12 border border-indigo-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-indigo-500 to-purple-500"></div>
          <div className="flex items-center text-indigo-700 font-bold mb-4">
            <Sparkles className="w-5 h-5 mr-2" />
            <span>AI Summary</span>
          </div>
          <p className="text-indigo-900 leading-relaxed text-lg">
            {post.summary}
          </p>
        </div>
      )}

      {/* Body Content */}
      <div 
        className="prose prose-lg prose-indigo max-w-none text-gray-800"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Comments Section */}
      <CommentsClient postId={post.id} initialComments={comments || []} />
    </article>
  );
}
