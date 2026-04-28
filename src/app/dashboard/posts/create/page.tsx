'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/components/SupabaseProvider';
import TiptapEditor from '@/components/ui/TiptapEditor';
import { Loader2, Image as ImageIcon, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreatePostPage() {
  const { user, role, isLoading } = useSupabase();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [content, setContent] = useState('');
  const [commentsEnabled, setCommentsEnabled] = useState(true);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<string>('');

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        toast.error('Please log in to create a post');
        router.push('/login');
      } else if (role !== 'author' && role !== 'admin') {
        toast.error('You do not have permission to create posts');
        router.push('/dashboard');
      }
    }
  }, [user, role, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !content || content === '' || content === '<p></p>') {
      toast.error('Title and content are required');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 1. Generate AI Summary
      setLoadingStatus('Generating AI summary...');
      const summaryRes = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body: content }),
      });

      let summary = '';
      if (!summaryRes.ok) {
        const errorData = await summaryRes.json();
        const errorMsg = errorData.error || 'AI Summary failed';
        console.warn('AI Summary generation failed:', errorMsg);
        toast.error(`${errorMsg}. Saving post with fallback text.`, { icon: '🤖' });
        summary = 'An AI summary could not be generated for this post.';
      } else {
        const summaryData = await summaryRes.json();
        summary = summaryData.summary;
      }

      // 2. Insert into Supabase
      setLoadingStatus('Publishing post...');
      const postRes = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          featured_image: featuredImage,
          content,
          summary,
          author_id: user?.id,
          comments_enabled: commentsEnabled // Optional: ensures we follow the requirement
        }),
      });

      if (!postRes.ok) {
        const errorData = await postRes.json();
        throw new Error(errorData.error || 'Failed to publish post');
      }

      // 3. Success
      toast.success('Post created successfully!');
      router.push('/dashboard');
      router.refresh();
      
    } catch (err: unknown) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
      setLoadingStatus('');
    }
  };

  if (isLoading || (!user) || (role !== 'author' && role !== 'admin')) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-8 tracking-tight">Create New Post</h1>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-8 transition-colors">
          <div className="space-y-2.5">
            <label htmlFor="title" className="block text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
              Post Title
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-5 py-4 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 transition-all outline-none text-lg font-medium"
              placeholder="A catchy title for your amazing post"
            />
          </div>

          <div className="space-y-2.5">
            <label htmlFor="featuredImage" className="block text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
              Featured Image URL
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <ImageIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="featuredImage"
                type="url"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                className="w-full pl-12 pr-5 py-4 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 transition-all outline-none"
                placeholder="https://images.unsplash.com/photo-..."
              />
            </div>
            {featuredImage && (
              <div className="mt-4 relative h-64 w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
                <img src={featuredImage} alt="Featured preview" className="object-cover w-full h-full" />
              </div>
            )}
          </div>

          <div className="space-y-2.5">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
              Post Content
            </label>
            <TiptapEditor content={content} onChange={setContent} />
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-center cursor-pointer group">
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={commentsEnabled}
                  onChange={() => setCommentsEnabled(!commentsEnabled)}
                />
                <div className={`block w-12 h-7 rounded-full transition-colors ${commentsEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                <div className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform ${commentsEnabled ? 'transform translate-x-5' : ''}`}></div>
              </div>
              <div className="ml-4 text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                Enable Comments Section
              </div>
              <MessageSquare className="ml-2 w-4 h-4 text-slate-400" />
            </label>
            <p className="mt-2 text-xs text-slate-400 dark:text-slate-500 ml-16">Allow readers to share their thoughts and engage with your story.</p>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-8 py-3.5 border border-transparent text-base font-bold rounded-full shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {loadingStatus}
              </>
            ) : (
              'Publish Post'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

