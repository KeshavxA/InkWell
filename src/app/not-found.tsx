import Link from 'next/link';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <FileQuestion className="mx-auto h-24 w-24 text-indigo-200" />
        <h1 className="mt-6 text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">404</h1>
        <h2 className="mt-2 text-2xl font-bold text-gray-900 tracking-tight">Page not found</h2>
        <p className="mt-4 text-base text-gray-500 max-w-md mx-auto">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. The content might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
