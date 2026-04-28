import Link from 'next/link';

interface PaginationProps {
  page: number;
  totalPages: number;
  baseUrl: string;
  query?: string;
}

export default function Pagination({ page, totalPages, baseUrl, query }: PaginationProps) {
  if (totalPages <= 1) return null;
  
  const queryParam = query ? `&query=${encodeURIComponent(query)}` : '';
  
  return (
    <div className="flex justify-center mt-12">
      <nav className="inline-flex rounded-md shadow-sm" aria-label="Pagination">
        <Link
          href={`${baseUrl}?page=${Math.max(1, page - 1)}${queryParam}`}
          className={`relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
            page === 1 ? 'text-gray-300 pointer-events-none' : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          Previous
        </Link>
        <div className="hidden sm:inline-flex relative items-center px-4 py-2 border-t border-b border-gray-300 bg-white text-sm font-medium text-gray-700">
          Page {page} of {totalPages}
        </div>
        <Link
          href={`${baseUrl}?page=${Math.min(totalPages, page + 1)}${queryParam}`}
          className={`relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
            page === totalPages ? 'text-gray-300 pointer-events-none' : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          Next
        </Link>
      </nav>
    </div>
  );
}
