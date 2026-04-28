import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  baseUrl: string;
  query?: string;
}

export default function Pagination({ page, totalPages, baseUrl, query }: PaginationProps) {
  if (totalPages <= 1) return null;
  
  const queryParam = query ? `&query=${encodeURIComponent(query)}` : '';
  
  const getPageLink = (p: number) => `${baseUrl}?page=${p}${queryParam}`;

  // Generate page numbers to show
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 || 
      i === totalPages || 
      (i >= page - 1 && i <= page + 1)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }
  
  return (
    <div className="flex justify-center mt-16">
      <nav className="inline-flex items-center space-x-2" aria-label="Pagination">
        <Link
          href={getPageLink(Math.max(1, page - 1))}
          className={`p-2 rounded-full border transition-all ${
            page === 1 
              ? 'text-slate-300 border-slate-100 pointer-events-none' 
              : 'text-slate-600 border-slate-200 hover:border-indigo-600 hover:text-indigo-600 bg-white shadow-sm'
          }`}
        >
          <ChevronLeft size={20} />
        </Link>

        <div className="flex items-center space-x-1">
          {pages.map((p, idx) => (
            p === '...' ? (
              <span key={`dots-${idx}`} className="px-3 py-2 text-slate-400">...</span>
            ) : (
              <Link
                key={p}
                href={getPageLink(p as number)}
                className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold transition-all ${
                  page === p
                    ? 'bg-indigo-600 text-white shadow-indigo-200 shadow-lg'
                    : 'text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200'
                }`}
              >
                {p}
              </Link>
            )
          ))}
        </div>

        <Link
          href={getPageLink(Math.min(totalPages, page + 1))}
          className={`p-2 rounded-full border transition-all ${
            page === totalPages 
              ? 'text-slate-300 border-slate-100 pointer-events-none' 
              : 'text-slate-600 border-slate-200 hover:border-indigo-600 hover:text-indigo-600 bg-white shadow-sm'
          }`}
        >
          <ChevronRight size={20} />
        </Link>
      </nav>
    </div>
  );
}

