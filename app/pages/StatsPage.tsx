import React from 'react';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import { UserProgress } from '@/types';
import { Task } from '@/types';

export interface StatsPageProps {
  progress: UserProgress;
  allTasks: Task[];
}

const StatsPage: React.FC<StatsPageProps> = ({ progress, allTasks }) => {
  const totalPossible = 30 * allTasks.length;
  const totalDone = (Object.values(progress) as number[][]).reduce((acc, curr) => acc + curr.length, 0);
  const overallPercent = totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0;

  return (
    <div className="p-4 pb-24 animate-fadeIn">
      <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
        <ChartBarIcon className="w-6 h-6 text-emerald-600" />
        کارنامه رمضان
      </h2>
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 mb-6 text-center">
        <div className="relative inline-flex items-center justify-center mb-6">
          <svg className="w-40 h-40 transform -rotate-90">
            <circle cx="80" cy="80" r="72" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-50" />
            <circle cx="80" cy="80" r="72" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={452} strokeDashoffset={452 - (452 * overallPercent) / 100} className="text-emerald-500 transition-all duration-1000" strokeLinecap="round" />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-4xl font-black text-slate-800">{overallPercent}%</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">تکمیل شده</span>
          </div>
        </div>
        <h3 className="text-lg font-bold text-slate-700">کل ماه مبارک</h3>
        <p className="text-slate-500 text-sm mt-2 font-medium">
          شما تا کنون <span className="text-emerald-600 font-bold">{totalDone}</span> عمل عبادی را ثبت کرده‌اید.
        </p>
      </div>
      <div className="space-y-[16px]">
        <h4 className="font-black text-slate-800 px-2 text-sm">استمرار در اعمال</h4>
        {allTasks.map(t => {
          const count = (Object.values(progress) as number[][]).filter(p => p.includes(t.id)).length;
          const perc = 30 > 0 ? (count / 30) * 100 : 0;
          return (
            <div key={t.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex justify-between text-sm mb-3">
                <span className="font-bold text-slate-700 flex items-center gap-2">
                  <span>{t.icon}</span>
                  {t.title}
                </span>
                <span className="text-emerald-600 font-bold">{count} روز</span>
              </div>
              <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${perc}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatsPage;
