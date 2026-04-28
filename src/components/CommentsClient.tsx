/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useSupabase } from './SupabaseProvider';
import { format } from 'date-fns';
import { MessageSquare, Send, Loader2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function CommentsClient({ postId, initialComments }: { postId: string, initialComments: any[] }) {
  const { user, role } = useSupabase();
  const [comments, setComments] = useState<any[]>(initialComments);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId, comment_text: content.trim() })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to post comment');
      }

      const { data } = await res.json();
      setComments([data, ...comments]);
      setContent('');
      toast.success('Comment added!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      const res = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete comment');
      }
      setComments(comments.filter(c => c.id !== commentId));
      toast.success('Comment deleted');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="mt-16 pt-10 border-t border-gray-200">
      <div className="flex items-center mb-8">
        <MessageSquare className="w-6 h-6 text-gray-400 mr-2" />
        <h2 className="text-2xl font-bold text-gray-900">Comments ({comments.length})</h2>
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="mb-12 bg-gray-50 p-6 rounded-2xl border border-gray-100">
          <label htmlFor="comment" className="sr-only">Your comment</label>
          <textarea
            id="comment"
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            placeholder="Share your thoughts on this story..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Post Comment
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-12 bg-indigo-50 p-6 rounded-2xl border border-indigo-100 text-center">
          <p className="text-indigo-800 mb-4 font-medium">Join the conversation!</p>
          <Link
            href="/login"
            className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Login to comment
          </Link>
        </div>
      )}

      <div className="space-y-6">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                  {(comment.users?.full_name || 'G')[0].toUpperCase()}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 inline-block mr-2">
                      {comment.users?.full_name || 'Guest User'}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {format(new Date(comment.created_at), 'MMM d, yyyy • h:mm a')}
                    </span>
                  </div>
                  {user && (user.id === comment.author_id || role === 'admin') && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
                      title="Delete comment"
                      aria-label="Delete comment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-gray-700 text-sm whitespace-pre-wrap">{comment.content}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-8">No comments yet. Be the first to share your thoughts!</p>
        )}
      </div>
    </div>
  );
}
