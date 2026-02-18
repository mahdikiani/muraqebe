import React, { useMemo } from 'react';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { RAMADAN_DAYS } from '@/constants';
import type { UserProgress } from '@/types';

const WEEKDAY_SHORT = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'] as const;
const WEEKDAY_TO_COL: Record<string, number> = {
  'شنبه': 0,
  'یکشنبه': 1,
  'دوشنبه': 2,
  'سه\u200cشنبه': 3,
  'چهارشنبه': 4,
  'پنجشنبه': 5,
  'جمعه': 6,
};

export interface CalendarProps {
  progress: UserProgress;
  totalTasks: number;
  selectedDay: number;
  todayRamadanDay: number | null;
  onSelectDay: (dayIndex: number) => void;
  onGoToToday: () => void;
}

const Calendar: React.FC<CalendarProps> = ({
  progress,
  totalTasks,
  selectedDay,
  todayRamadanDay,
  onSelectDay,
  onGoToToday,
}) => {
  const dayByCol = useMemo(() => {
    const grid: (number | null)[][] = [];
    const cols = 7;
    const dayToCol = (dayIndex: number) => {
      const day = RAMADAN_DAYS.find(d => d.dayIndex === dayIndex);
      return day ? WEEKDAY_TO_COL[day.weekday] ?? 0 : 0;
    };
    
    let row: (number | null)[] = Array(cols).fill(null);
    let lastCol = -1;
    
    for (let d = 1; d <= 30; d++) {
      const col = dayToCol(d);
      if (col <= lastCol) {
        grid.push(row);
        row = Array(cols).fill(null);
      }
      row[col] = d;
      lastCol = col;
    }
    grid.push(row);
    return grid;
  }, []);

  return (
    <div className="p-4 pb-24 animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
          <CalendarIcon className="w-6 h-6 text-emerald-600" />
          تقویم مراقبه
        </h2>
        <button
          type="button"
          onClick={onGoToToday}
          className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full"
        >
          {todayRamadanDay != null ? 'امروز' : 'روز ۱'}
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {WEEKDAY_SHORT.map((label, i) => (
          <div key={i} className="text-center text-[10px] font-bold text-slate-400 py-0.5">
            {label}
          </div>
        ))}
        {dayByCol.map((row, ri) =>
          row.map((dayIndex, ci) => {
            if (dayIndex === null) return <div key={`e-${ri}-${ci}`} />;
            const dayInfo = RAMADAN_DAYS.find(d => d.dayIndex === dayIndex);
            const jalaliDay = dayInfo?.solarDate?.split(/\s/)[0] ?? '';
            const dayProg = (progress[dayIndex] as number[] | undefined)?.length ?? 0;
            const isDone = dayProg === totalTasks;
            const isSelected = selectedDay === dayIndex;
            return (
              <button
                key={dayIndex}
                type="button"
                onClick={() => onSelectDay(dayIndex)}
                className={`flex flex-col items-center justify-center aspect-square min-w-0 rounded-lg transition-all relative ${isSelected ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-100' : dayProg > 0 ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-white border border-slate-100 text-slate-400'}`}
              >
                <span className="text-sm font-black leading-none">{dayIndex}</span>
                {jalaliDay && (
                  <span className={`text-[9px] mt-0.5 opacity-70 ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                    {jalaliDay}
                  </span>
                )}
                {dayProg > 0 && (
                  <div className="absolute top-0.5 right-0.5">
                    <div className={`w-1 h-1 rounded-full ${isDone ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Calendar;
