/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useSupabase } from './SupabaseProvider';
import { format } from 'date-fns';
import { MessageSquare, Send, Loader2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import ConfirmModal from './ui/ConfirmModal';

export default function CommentsClient({ postId, initialComments }: { postId: string, initialComments: any[] }) {
  const { user, role } = useSupabase();
  const [comments, setComments] = useState<any[]>(initialComments);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const MAX_CHARS = 500;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || content.length > MAX_CHARS) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId, content: content.trim() })
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

  const handleReply = (authorName: string) => {
    setContent(`@${authorName} `);
    const textarea = document.getElementById('comment');
    textarea?.focus();
  };

  const handleDeleteConfirm = async () => {
    if (!commentToDelete) return;
    
    try {
      const res = await fetch(`/api/comments/${commentToDelete}`, { method: 'DELETE' });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete comment');
      }
      setComments(comments.filter(c => c.id !== commentToDelete));
      toast.success('Comment deleted');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setCommentToDelete(null);
    }
  };

  return (
    <div className="mt-16 pt-10 border-t border-slate-200 dark:border-slate-800 transition-colors">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <MessageSquare className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mr-2" />
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Comments ({comments.length})</h2>
        </div>
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="mb-12 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all focus-within:ring-2 focus-within:ring-indigo-500/10 dark:focus-within:ring-indigo-400/10 focus-within:border-indigo-500 dark:focus-within:border-indigo-400">
          <div className="relative">
            <textarea
              id="comment"
              rows={3}
              className="w-full px-0 py-1 border-none focus:ring-0 text-slate-700 dark:text-slate-200 bg-transparent placeholder-slate-400 dark:placeholder-slate-500 resize-none outline-none text-base"
              placeholder="Share your thoughts on this story..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={MAX_CHARS}
            />
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className={`text-xs font-medium ${content.length >= MAX_CHARS ? 'text-red-500' : 'text-slate-400'}`}>
                {content.length} / {MAX_CHARS} characters
              </span>
              <button
                type="submit"
                disabled={isSubmitting || !content.trim() || content.length > MAX_CHARS}
                className="inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-bold rounded-full shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Post Comment
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-12 bg-indigo-50 dark:bg-indigo-900/10 p-8 rounded-3xl border border-indigo-100 dark:border-indigo-900/30 text-center transition-colors">
          <h3 className="text-indigo-900 dark:text-indigo-300 font-bold mb-2">Join the conversation</h3>
          <p className="text-indigo-700/70 dark:text-indigo-400/70 mb-6 text-sm">Sign in to share your thoughts and reply to others.</p>
          <Link
            href="/login"
            className="inline-flex items-center px-8 py-3 border border-transparent text-sm font-bold rounded-full shadow-md text-white bg-indigo-600 hover:bg-indigo-700 transition-all transform hover:-translate-y-0.5"
          >
            Login to comment
          </Link>
        </div>
      )}

      <div className="space-y-8">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="group flex space-x-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black border-2 border-white shadow-sm text-lg">
                  {(comment.users?.full_name || 'G')[0].toUpperCase()}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-800 group-hover:border-slate-200 dark:group-hover:border-slate-700 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white mr-2">
                        {comment.users?.full_name || 'Guest User'}
                      </h3>
                      <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        {format(new Date(comment.created_at), 'MMM d, yyyy • h:mm a')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {user && (
                        <button
                          onClick={() => handleReply(comment.users?.full_name || 'Guest')}
                          className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-2 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                          title="Reply"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {user && (user.id === comment.author_id || role === 'admin') && (
                        <button
                          onClick={() => setCommentToDelete(comment.id)}
                          className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30"
                          title="Delete comment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-[15px] leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-slate-50/50 dark:bg-slate-900/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 transition-colors">
            <MessageSquare className="mx-auto h-10 w-10 text-slate-200 dark:text-slate-800 mb-4" />
            <h3 className="text-slate-400 dark:text-slate-600 font-medium">No comments yet.</h3>
            <p className="text-slate-400 dark:text-slate-600 text-sm mt-1">Be the first to share your thoughts!</p>
          </div>
        )}
      </div>

      <ConfirmModal 
        isOpen={!!commentToDelete}
        title="Delete Comment"
        message="Are you sure you want to permanently delete this comment? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setCommentToDelete(null)}
      />
    </div>
  );
}

