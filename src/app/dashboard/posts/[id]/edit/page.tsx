'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/components/SupabaseProvider';
import { Loader2, Image as ImageIcon, Sparkles, AlertCircle, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

import TiptapEditor from '@/components/ui/TiptapEditor';

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const postId = resolvedParams.id;
  
  const { user, role, isLoading: isAuthLoading } = useSupabase();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [commentsEnabled, setCommentsEnabled] = useState(true);
  
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<string>('');

  const fetchPostData = async () => {
    try {
      const res = await fetch(`/api/posts/${postId}`);
      if (!res.ok) {
        if (res.status === 403 || res.status === 404) {
          toast.error('Post not found or unauthorized');
          router.push('/dashboard/posts');
        } else {
          throw new Error('Failed to load post data');
        }
        return;
      }
      
      const { post } = await res.json();
      setTitle(post.title || '');
      setFeaturedImage(post.featured_image || '');
      setContent(post.content || '');
      setSummary(post.summary || '');
      // If the DB supports it, we'd load commentsEnabled here
      
    } catch (error: unknown) {
      if (error instanceof Error) {
         toast.error(error.message);
      }
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoading) {
      if (!user) {
        toast.error('Please log in');
        router.push('/login');
      } else if (role !== 'author' && role !== 'admin') {
        toast.error('Unauthorized');
        router.push('/dashboard');
      } else {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchPostData();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, role, isAuthLoading, postId, router]);

  const handleRegenerateSummary = async () => {
    if (!title || !content || content === '' || content === '<p></p>') {
      toast.error('Title and content are required to generate a summary');
      return;
    }

    if (!window.confirm('Do you want to run the AI again? This will overwrite your current summary in the editor below.')) {
      return;
    }

    setIsRegenerating(true);
    
    try {
      const summaryRes = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body: content }),
      });

      if (!summaryRes.ok) {
        const errorData = await summaryRes.json();
        throw new Error(errorData.error || 'Failed to generate summary');
      }

      const { summary: newSummary } = await summaryRes.json();
      setSummary(newSummary);
      toast.success('Summary regenerated successfully!');
    } catch (error: unknown) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !content || content === '' || content === '<p></p>') {
      toast.error('Title and content are required');
      return;
    }

    setIsSubmitting(true);
    setLoadingStatus('Saving post modifications...');
    
    try {
      const postRes = await fetch(`/api/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          featured_image: featuredImage,
          content,
          summary,
          comments_enabled: commentsEnabled
        }),
      });

      if (!postRes.ok) {
        const errorData = await postRes.json();
        throw new Error(errorData.error || 'Failed to update post');
      }

      toast.success('Post updated successfully!');
      router.push('/dashboard/posts');
      router.refresh();
      
    } catch (error: unknown) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      setIsSubmitting(false);
      setLoadingStatus('');
    }
  };

  if (isAuthLoading || isInitializing) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-8 tracking-tight">Edit Post</h1>
      
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
              />
            </div>
            {featuredImage && (
              <div className="mt-4 relative h-64 w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
                <img src={featuredImage} alt="Featured preview" className="object-cover w-full h-full" />
              </div>
            )}
          </div>

          <div className="space-y-2.5">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 mb-2">
              AI Summary
            </label>
            <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 p-6 rounded-3xl flex flex-col space-y-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center text-indigo-700 dark:text-indigo-400 font-bold">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Current Summary
                </div>
                <button
                  type="button"
                  onClick={handleRegenerateSummary}
                  disabled={isRegenerating || isSubmitting}
                  className="inline-flex items-center px-4 py-2 border border-indigo-200 dark:border-indigo-800 text-xs font-bold rounded-full shadow-sm text-indigo-700 dark:text-indigo-400 bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-slate-800 focus:outline-none transition-all disabled:opacity-50"
                >
                  {isRegenerating ? (
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  )}
                  Regenerate AI Summary
                </button>
              </div>
              
              <textarea
                rows={4}
                value={summary}
                required
                onChange={(e) => setSummary(e.target.value)}
                className="w-full px-5 py-4 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm text-indigo-900 dark:text-indigo-100 bg-white dark:bg-slate-950 transition-all outline-none"
              />
              
              <div className="flex items-start text-[11px] text-indigo-400 dark:text-indigo-500">
                <AlertCircle className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                <p>Re-generating will cost additional API usage points. Standard edits can just be typed directly into the box.</p>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 mb-2">
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
          </div>
        </div>

        <div className="flex justify-between items-center pt-4">
          <button
            type="button"
            onClick={() => router.push('/dashboard/posts')}
            className="inline-flex items-center px-8 py-3.5 border border-slate-200 dark:border-slate-800 text-sm font-bold rounded-full text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isRegenerating}
            className="inline-flex items-center px-10 py-4 border border-transparent text-base font-bold rounded-full shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {loadingStatus}
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
