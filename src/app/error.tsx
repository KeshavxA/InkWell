'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="text-center bg-white p-8 rounded-3xl shadow-sm border border-red-100 max-w-lg w-full">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-3">Something went wrong!</h2>
        <p className="text-gray-600 mb-8">
          We encountered an unexpected error while loading this page. Our team has been notified.
        </p>
        <button
          onClick={() => reset()}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors w-full justify-center"
        >
          <RefreshCcw className="w-5 h-5 mr-2" />
          Try again
        </button>
      </div>
    </div>
  );
}
