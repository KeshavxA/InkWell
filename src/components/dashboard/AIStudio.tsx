'use client';

import { useState } from 'react';
import { Sparkles, Send, Loader2, Lightbulb, PenTool, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function AIStudio() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [mode, setMode] = useState<'ideas' | 'outline' | 'seo'>('ideas');

  const handleGenerate = async () => {
    if (!prompt) {
      toast.error('Please enter a topic or prompt');
      return;
    }

    setIsGenerating(true);
    setResult(null);

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, mode }),
      });

      const data = await response.json();

      if (data.error) throw new Error(data.error);
      
      setResult(data.result);
      toast.success('AI magic complete!');
    } catch (error: any) {
      console.error('AI Error:', error);
      toast.error(error.message || 'Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all">
      <div className="p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-600 rounded-xl">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">AI Content Studio</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Collaborate with Gemini to craft your next masterpiece</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: 'ideas', label: 'Fresh Ideas', icon: Lightbulb },
            { id: 'outline', label: 'Content Outline', icon: PenTool },
            { id: 'seo', label: 'SEO Optimizer', icon: Search },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setMode(item.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                mode === item.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              mode === 'ideas' ? "What topic should I write about? (e.g. AI in healthcare)" :
              mode === 'outline' ? "Enter your blog title to get a full outline..." :
              "Paste your content or title to optimize for search..."
            }
            className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400 resize-none"
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt}
            className="absolute bottom-4 right-4 p-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-8 p-6 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  AI Suggested Output
                </h3>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(result);
                    toast.success('Copied to clipboard!');
                  }}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Copy All
                </button>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {result}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
