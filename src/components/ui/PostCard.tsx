import Link from 'next/link';
import { format } from 'date-fns';
import { BookOpen, Clock, ArrowRight } from 'lucide-react';

/* eslint-disable @typescript-eslint/no-explicit-any */

interface PostCardProps {
  post: any;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <Link href={`/blog/${post.id}`} className="group block h-full">
      <article className="flex flex-col h-full bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden transform hover:-translate-y-1">
        <div className="relative h-56 w-full bg-gray-100 overflow-hidden">
          {post.featured_image ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img 
              src={post.featured_image} 
              alt={post.title}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gradient-to-br from-gray-50 to-gray-100">
              <BookOpen className="w-12 h-12" />
            </div>
          )}
        </div>
        <div className="p-6 flex flex-col flex-grow">
          <div className="flex items-center text-xs text-gray-500 mb-3 space-x-3">
            <span className="font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
              {post.users?.full_name || 'Guest'}
            </span>
            <span className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {post.created_at ? format(new Date(post.created_at), 'MMM d, yyyy') : 'Unknown'}
            </span>
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
  );
}
