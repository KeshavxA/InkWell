/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/components/SupabaseProvider';
import { format } from 'date-fns';
import { Trash2, Edit, Loader2, ShieldAlert, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import clsx from 'clsx';

export default function AdminDashboardPage() {
  const { user, role, isLoading } = useSupabase();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'posts' | 'comments' | 'users'>('posts');
  
  const [posts, setPosts] = useState<Record<string, any>[]>([]);
  const [comments, setComments] = useState<Record<string, any>[]>([]);
  const [users, setUsers] = useState<Record<string, any>[]>([]);
  
  const [isFetching, setIsFetching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Protect page
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
      } else if (role !== 'admin') {
        router.push('/dashboard');
        toast.error('Unauthorized access. Admin privileges required.');
      }
    }
  }, [user, role, isLoading, router]);

  const fetchData = async (tab: string) => {
    setIsFetching(true);
    try {
      const res = await fetch(`/api/admin?type=${tab}`);
      if (!res.ok) throw new Error('Failed to fetch data');
      const json = await res.json();
      
      if (tab === 'posts') setPosts(json.data || []);
      else if (tab === 'users') setUsers(json.data || []);
      else if (tab === 'comments') setComments(json.data || []);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || 'Error fetching data');
      }
      console.error(error);
    } finally {
      setIsFetching(false);
    }
  };

  // Fetch data
  useEffect(() => {
    if (role === 'admin') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchData(activeTab);
    }
  }, [activeTab, role]);

  const handleDeletePost = async (id: string, title: string) => {
    if (!window.confirm(`Delete post "${title}" completely?`)) return;
    try {
      const res = await fetch(`/api/admin?type=posts&id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete post');
      toast.success('Post deleted successfully');
      setPosts(posts.filter(p => p.id !== id));
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteComment = async (id: string) => {
    if (!window.confirm(`Delete this comment?`)) return;
    try {
      const res = await fetch(`/api/admin?type=comments&id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete comment');
      toast.success('Comment deleted successfully');
      setComments(comments.filter(c => c.id !== id));
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/admin`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (!res.ok) throw new Error('Failed to update role');
      toast.success('Role updated successfully');
      setUsers(users.map(u => (u.id === userId ? { ...u, role: newRole } : u)));
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (isLoading || role !== 'admin') {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const filteredPosts = posts.filter(post =>
    post.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <ShieldAlert className="w-8 h-8 text-purple-600 mr-3" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-500 text-sm">System administration and oversight</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['posts', 'comments', 'users'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as typeof activeTab)}
              className={clsx(
                activeTab === tab
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors'
              )}
            >
              All {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        {isFetching ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* --- POSTS TAB --- */}
            {activeTab === 'posts' && (
              <>
                <div className="p-4 border-b border-gray-200">
                  <div className="relative rounded-md shadow-sm max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="focus:ring-purple-500 focus:border-purple-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border px-3"
                      placeholder="Filter posts by title..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPosts.length === 0 ? (
                      <tr><td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">No posts found.</td></tr>
                    ) : filteredPosts.map((post) => (
                      <tr key={post.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 truncate max-w-xs">{post.title}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{post.users?.full_name || 'Unknown'}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{format(new Date(post.created_at || new Date()), 'MMM d, yyyy')}</td>
                        <td className="px-6 py-4 text-right text-sm font-medium space-x-3">
                          <Link href={`/dashboard/posts/${post.id}/edit`} className="text-gray-400 hover:text-emerald-600 inline-block align-middle"><Edit className="w-5 h-5" /></Link>
                          <button onClick={() => handleDeletePost(post.id, post.title)} className="text-gray-400 hover:text-red-600 inline-block align-middle"><Trash2 className="w-5 h-5" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {/* --- COMMENTS TAB --- */}
            {activeTab === 'comments' && (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Post</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {comments.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No comments found.</td></tr>
                  ) : comments.map((comment) => (
                    <tr key={comment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{comment.content}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{comment.users?.full_name || 'Unknown'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">{comment.posts?.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{format(new Date(comment.created_at || new Date()), 'MMM d, yy')}</td>
                      <td className="px-6 py-4 text-right text-sm">
                        <button onClick={() => handleDeleteComment(comment.id)} className="text-gray-400 hover:text-red-600"><Trash2 className="w-5 h-5" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* --- USERS TAB --- */}
            {activeTab === 'users' && (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Join Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{u.full_name || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <select
                          value={u.role || 'viewer'}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="mt-1 block pl-3 pr-10 py-1 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md border"
                          disabled={!user || u.id === user.id}
                        >
                          <option value="viewer">Viewer</option>
                          <option value="author">Author</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {u.created_at ? format(new Date(u.created_at), 'MMM d, yyyy') : 'Unknown'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
