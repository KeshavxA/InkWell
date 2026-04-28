'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/components/SupabaseProvider';
import { Loader2, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

// Dynamically import ReactQuill to prevent SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function CreatePostPage() {
  const { user, role, isLoading } = useSupabase();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [content, setContent] = useState('');
  
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
    
    if (!title || !content || content === '<p><br></p>') {
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

      if (!summaryRes.ok) {
        const errorData = await summaryRes.json();
        throw new Error(errorData.error || 'Failed to generate summary');
      }

      const { summary } = await summaryRes.json();

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

  // Prevent flashing content while checking authorization
  if (isLoading || (!user) || (role !== 'author' && role !== 'admin')) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Post</h1>
      
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
            placeholder="A catchy title for your amazing post"
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
              placeholder="https://example.com/image.jpg"
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
          <label className="block text-sm font-medium text-gray-700">
            Content
          </label>
          <div className="bg-white border rounded-md">
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              className="h-64 mb-12"
              placeholder="Write your story here..."
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
