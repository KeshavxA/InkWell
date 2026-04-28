'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/components/SupabaseProvider';
import { Loader2, Image as ImageIcon, Sparkles, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const postId = resolvedParams.id;
  
  const { user, role, isLoading: isAuthLoading } = useSupabase();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  
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
    if (!title || !content || content === '<p><br></p>') {
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
    
    if (!title || !content || content === '<p><br></p>') {
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
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Post</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Post Title
          </label>
          <input
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="featuredImage" className="block text-sm font-medium text-gray-700">
            Featured Image URL
          </label>
          <div className="flex space-x-3">
            <input
              id="featuredImage"
              type="url"
              value={featuredImage}
              onChange={(e) => setFeaturedImage(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          {featuredImage ? (
            <div className="mt-4 relative h-48 w-full max-w-sm rounded-md overflow-hidden bg-gray-100 border border-gray-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={featuredImage} alt="Featured preview" className="object-cover w-full h-full" />
            </div>
          ) : (
            <div className="mt-4 h-48 w-full max-w-sm rounded-md border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 text-gray-400">
              <div className="text-center flex flex-col items-center">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-300" />
                <span className="mt-2 block text-sm font-medium">Image Preview</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            AI Summary
          </label>
          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg flex flex-col space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center text-indigo-700 font-semibold mb-2">
                <Sparkles className="w-4 h-4 mr-2" />
                Current Summary
              </div>
              <button
                type="button"
                onClick={handleRegenerateSummary}
                disabled={isRegenerating || isSubmitting}
                className="inline-flex items-center px-3 py-1.5 border border-indigo-200 text-xs font-medium rounded-md shadow-sm text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none transition-colors disabled:opacity-50"
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
              className="w-full px-3 py-2 border border-indigo-200 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm text-indigo-900 bg-white"
            />
            
            <div className="flex items-start text-xs text-indigo-500 mt-2">
              <AlertCircle className="w-4 h-4 mr-1.5 flex-shrink-0" />
              <p>Re-generating will cost additional API usage points. Standard edits can just be typed directly into the box.</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Content
          </label>
          <div className="bg-white border rounded-md">
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              className="h-64 mb-12"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-between">
          <button
            type="button"
            onClick={() => router.push('/dashboard/posts')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isRegenerating}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
