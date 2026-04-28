import { BookOpen } from 'lucide-react';

export default function BlogLoading() {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16 animate-pulse">
        <div className="h-12 bg-gray-200 rounded-lg w-64 mx-auto mb-4"></div>
        <div className="h-6 bg-gray-100 rounded-lg w-96 mx-auto mb-8"></div>
        <div className="h-12 bg-gray-100 rounded-full max-w-md mx-auto mb-10"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
            <div className="h-56 w-full bg-gray-200 flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-gray-300" />
            </div>
            <div className="p-6 flex flex-col flex-grow space-y-4">
              <div className="flex space-x-3">
                <div className="h-6 w-24 bg-indigo-100 rounded-full"></div>
                <div className="h-6 w-24 bg-gray-100 rounded-full"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-100 rounded w-full"></div>
                <div className="h-4 bg-gray-100 rounded w-full"></div>
                <div className="h-4 bg-gray-100 rounded w-2/3"></div>
              </div>
              <div className="mt-auto pt-4">
                <div className="h-4 bg-indigo-50 rounded w-24"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
