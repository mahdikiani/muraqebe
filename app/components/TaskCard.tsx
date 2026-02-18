import React, { useState, useRef } from 'react';
import { ArrowTopRightOnSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

export interface TaskCardTask {
  id: number;
  title: string;
  description?: string;
  icon?: string;
  url?: string;
  urlByDay?: string[];
}

export interface TaskCardProps {
  task: TaskCardTask;
  taskUrl: string | undefined;
  isCompleted: boolean;
  isCustom: boolean;
  onToggle: () => void;
  onDelete: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  taskUrl,
  isCompleted,
  isCustom,
  onToggle,
  onDelete,
}) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const touchStartX = useRef(0);

  const handleSwipeEnd = () => {
    if (swipeOffset < -80) {
      onDelete();
    }
    setSwipeOffset(0);
  };

  return (
    <div className="rounded-3xl overflow-hidden relative" dir="ltr">
      <div
        className="absolute inset-y-0 right-0 w-24 flex items-center justify-center bg-red-500 text-white text-xs font-bold z-0"
        aria-hidden
      >
        {isCustom ? 'حذف' : 'پنهان'}
      </div>
      <div
        className="relative z-10 transition-transform"
        style={{ transform: `translateX(${swipeOffset}px)` }}
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX;
          setSwipeOffset(0);
        }}
        onTouchMove={(e) => {
          const dx = e.touches[0].clientX - touchStartX.current;
          setSwipeOffset(Math.max(-120, Math.min(0, dx)));
        }}
        onTouchEnd={handleSwipeEnd}
        onTouchCancel={handleSwipeEnd}
      >
        <div
          dir="rtl"
          onClick={onToggle}
          className={`flex items-center gap-4 p-5 rounded-3xl border-2 cursor-pointer ${isCompleted ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-white border-slate-100 shadow-sm active:scale-98'}`}
        >
          <div className={`text-2xl w-12 h-12 flex items-center justify-center rounded-2xl shrink-0 ${isCompleted ? 'bg-emerald-100' : 'bg-slate-50'}`}>
            {task.icon ?? '📌'}
          </div>
          <div className="flex-1">
            <h3 className={`font-bold text-base ${isCompleted ? 'text-emerald-900' : 'text-slate-800'}`}>{task.title}</h3>
            {task.description && <p className="text-xs text-slate-500 mt-1">{task.description}</p>}
          </div>
          {taskUrl && (
            <a
              href={taskUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="w-10 h-10 flex items-center justify-center text-emerald-600 hover:bg-emerald-100 rounded-full transition-colors border border-emerald-100 shadow-sm"
              title="مشاهده منبع"
            >
              <ArrowTopRightOnSquareIcon className="w-5 h-5" />
            </a>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
            title={isCustom ? 'حذف از لیست شخصی' : 'پنهان کردن از لیست'}
            aria-label="حذف"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
          <div className="mr-2">
            {isCompleted ? <CheckCircleSolid className="w-8 h-8 text-emerald-500" /> : <div className="w-8 h-8 rounded-full border-2 border-slate-200" />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
