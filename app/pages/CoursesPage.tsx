import React from 'react';
import { BookOpenIcon } from '@heroicons/react/24/outline';
import { Session } from '@/types';

export interface CoursesPageProps {
  sessions: Session[];
}

const CoursesPage: React.FC<CoursesPageProps> = ({ sessions }) => {
  return (
    <div className="p-4 pb-24">
      {sessions.length > 0 ? (
        sessions.map((session) => (
          <div key={session.id} className="bg-white rounded-3xl p-5 mb-4 shadow-sm border-2 border-slate-100">
            {session.image && (
              <img
                src={session.image}
                alt={session.title}
                className="w-full h-48 object-cover rounded-2xl mb-4"
              />
            )}
            <div className="flex items-start gap-4">
              <div className="text-3xl w-14 h-14 flex items-center justify-center rounded-2xl bg-emerald-50 shrink-0">
                {session.icon ?? '📚'}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-base text-slate-800">{session.title}</h3>
                <p className="text-xs text-emerald-600 mt-1 font-bold">{session.description}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p className="flex items-start gap-2">
                <span className="text-slate-400">👤</span>
                <span>{session.teachers}</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-slate-400">🕐</span>
                <span>{session.time}</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-slate-400">📍</span>
                <span>{session.location}</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-slate-400">📞</span>
                <span className="whitespace-pre-line">{session.contact}</span>
              </p>
            </div>
            {session.url && (
              <a
                href={session.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-center block transition-colors"
              >
                مشاهده کانال ✅
              </a>
            )}
          </div>
        ))
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <BookOpenIcon className="w-16 h-16 text-slate-300 mb-4" />
          <p className="text-slate-500 font-bold text-lg">جلسه‌ای اضافه نشده</p>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
