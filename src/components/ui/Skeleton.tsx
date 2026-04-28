import { BookOpen } from 'lucide-react';

export default function Skeleton() {
  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
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
  );
}
