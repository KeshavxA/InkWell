'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Clock, MousePointer2, FileText } from 'lucide-react';

const data = [
  { name: 'Mon', views: 400, posts: 2 },
  { name: 'Tue', views: 300, posts: 1 },
  { name: 'Wed', views: 600, posts: 0 },
  { name: 'Thu', views: 800, posts: 3 },
  { name: 'Fri', views: 500, posts: 1 },
  { name: 'Sat', views: 900, posts: 0 },
  { name: 'Sun', views: 1200, posts: 2 },
];

export default function WritingAnalytics() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 transition-all">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Performance Hub</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Track your writing growth and engagement</p>
        </div>
        <div className="hidden sm:flex gap-2">
          <div className="flex items-center gap-1 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-bold">
            <TrendingUp className="w-3 h-3" />
            +12% this week
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Avg. Read Time', value: '4.2m', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Total Views', value: '2.8k', icon: MousePointer2, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
          { label: 'Post Count', value: '14', icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Engagement', value: '8.4%', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg} p-4 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all`}>
            <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
            <div className="text-xl font-black text-slate-900 dark:text-white">{stat.value}</div>
            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
              dy={10}
            />
            <YAxis hide />
            <Tooltip
              cursor={{ fill: 'transparent' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-900 text-white p-3 rounded-xl shadow-2xl border border-slate-800 text-xs font-bold">
                      <p className="">{`${payload[0].value} views`}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="views" radius={[6, 6, 6, 6]} barSize={32}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={index === data.length - 1 ? '#4f46e5' : '#e2e8f0'} 
                  className={index === data.length - 1 ? '' : 'dark:fill-slate-800'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
