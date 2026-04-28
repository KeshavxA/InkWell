import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Sparkles className="w-8 h-8 text-indigo-500" />
            <span className="text-3xl font-bold text-white tracking-tight">InkWell</span>
          </Link>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
