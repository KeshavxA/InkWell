'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSupabase } from '@/components/SupabaseProvider';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { Edit, Trash2, Eye, Plus, Loader2, FileText, Search } from 'lucide-react';
import toast from 'react-hot-toast';

interface Post {
  id: string;
  title: string;
  summary: string;
  created_at: string;
  [key: string]: unknown;
}

export default function MyPostsPage() {
  const { user, role } = useSupabase();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const supabase = createClient();
  const POSTS_PER_PAGE = 10;

  const fetchPosts = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      let query = supabase
        .from('posts')
        .select('*', { count: 'exact' });

      // Admin sees all, author sees their own
      if (role !== 'admin') {
        query = query.eq('author_id', user.id);
      }

      // Search filter
      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      // Pagination
      const from = (page - 1) * POSTS_PER_PAGE;
      const to = from + POSTS_PER_PAGE - 1;
      
      query = query.order('created_at', { ascending: false }).range(from, to);

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      setPosts((data || []) as Post[]);
      if (count) {
        setTotalPages(Math.ceil(count / POSTS_PER_PAGE));
      } else {
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, role, page, searchQuery]);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      return;
    }

    setIsDeleting(id);
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Post deleted successfully');
      setPosts(posts.filter(post => post.id !== id));
    } catch (error) {
      console.error('Delete error', error);
      toast.error('Failed to delete post');
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex sm:items-center justify-between flex-col sm:flex-row gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Posts</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {role === 'admin' ? 'Manage all blog posts across the platform' : 'Manage your personal blog posts'}
          </p>
        </div>
        {(role === 'author' || role === 'admin') && (
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow sm:max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl leading-5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all shadow-sm"
                placeholder="Search your posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Link
              href="/dashboard/posts/create"
              className="inline-flex items-center px-6 py-2.5 border border-transparent rounded-full shadow-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:-translate-y-0.5"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              New Post
            </Link>
          </div>
        )}
      </div>
 
      <div className="bg-white dark:bg-slate-900 shadow-sm rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        {isLoading ? (
          <div className="p-12 pl-12 flex justify-center w-full">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center p-16">
            <FileText className="mx-auto h-12 w-12 text-slate-200 dark:text-slate-800 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No posts yet</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">Get started on your writing journey by creating your first post.</p>
            <div className="mt-8">
              <Link
                href="/dashboard/posts/create"
                className="inline-flex items-center px-8 py-3 border border-transparent shadow-lg text-sm font-bold rounded-full text-white bg-indigo-600 hover:bg-indigo-700 transition-all transform hover:-translate-y-0.5"
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Create First Post
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
                <thead className="bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Title
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">
                      Summary
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-50 dark:divide-slate-800">
                  {posts.map((post) => (
                    <tr key={post.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-xs">{post.title}</div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-xs lg:max-w-md">
                          {post.summary || 'No summary available.'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {format(new Date(post.created_at), 'MMM d, yyyy')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-3">
                          <Link href={`/blog/${post.id}`} className="text-gray-400 hover:text-indigo-600 transition-colors" title="View">
                            <Eye className="w-5 h-5" />
                          </Link>
                          <Link href={`/dashboard/posts/${post.id}/edit`} className="text-gray-400 hover:text-emerald-600 transition-colors" title="Edit">
                            <Edit className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(post.id, post.title)}
                            disabled={isDeleting === post.id}
                            className="text-gray-400 hover:text-red-600 transition-colors focus:outline-none disabled:opacity-50"
                            title="Delete"
                          >
                            {isDeleting === post.id ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Trash2 className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Showing <span className="font-bold text-slate-900 dark:text-white">{(page - 1) * POSTS_PER_PAGE + 1}</span> to{' '}
                      <span className="font-bold text-slate-900 dark:text-white">
                        {Math.min(page * POSTS_PER_PAGE, posts.length + (page - 1) * POSTS_PER_PAGE)}
                      </span>{' '}
                      of results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-xl shadow-sm space-x-2" aria-label="Pagination">
                      <button
                        onClick={() => setPage(page => Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="relative inline-flex items-center px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-30 transition-all shadow-sm"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setPage(page => Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                        className="relative inline-flex items-center px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-30 transition-all shadow-sm"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
