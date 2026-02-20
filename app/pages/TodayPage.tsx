import React from 'react';
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  SparklesIcon,
  ExclamationCircleIcon,
  PlusCircleIcon,
} from '@heroicons/react/24/outline';
import TaskCard from '@/components/TaskCard';
import PrayerTimes from '@/components/PrayerTimes';
import { Task, UserProgress, UserProfile, CustomTask, RamadanDay } from '@/types';
import { getTodaySolarDateString } from '@/lib/dateUtils';
import { CUSTOM_TASK_ID_START } from '@/constants';

export interface TodayPageProps {
    city: string;
    selectedDay: number;
    setSelectedDay: (day: number) => void;
    progress: UserProgress;
    userProfile: UserProfile;
    customTasks: CustomTask[];
    hiddenTaskIds: number[];
    allTasks: Task[];
    currentDayData?: RamadanDay;
    todayRamadanDay: number | null;
    ramadanStatus: 'before' | 'during' | 'after';
    onToggleTask: (dayIdx: number, taskId: number) => void;
    onRemoveCustomTask: (id: number) => void;
    onHideBuiltInTask: (id: number) => void;
    onShowAddCustomTask: () => void;
    onEditProfile?: () => void;
}

const TodayPage: React.FC<TodayPageProps> = ({
    city,
    selectedDay,
    setSelectedDay,
    progress,
    userProfile,
    customTasks,
    hiddenTaskIds,
    allTasks,
    currentDayData,
    todayRamadanDay,
    ramadanStatus,
    onToggleTask,
    onRemoveCustomTask,
    onHideBuiltInTask,
    onShowAddCustomTask,
    onEditProfile,
}) => {
    const completedCount = progress[selectedDay]?.length || 0;
    const progressPercent = allTasks.length ? Math.round((completedCount / allTasks.length) * 100) : 0;

    return (
        <div className="animate-fadeIn">
            <div className="bg-emerald-600 text-white p-6 rounded-b-[2.5rem] shadow-xl mb-6 relative overflow-hidden">
                <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl" />
                <div className="relative z-10">
                        <PrayerTimes city={city} day={selectedDay} />
                    <div className="flex  justify-between items-start mb-4">
                    </div>
                    <div className="flex justify-between items-end gap-3">
                        <div className="flex items-center gap-2 shrink-0">


                        </div>
                        <div className="min-w-0 flex-1 flex flex-col gap-2">
                            <h1 className="text-2xl font-black flex items-center gap-2 flex-wrap">
                                روز {selectedDay} رمضان
                                {selectedDay === 1 && <SparklesIcon className="w-6 h-6 text-amber-300" />}
                            </h1>
                            <div className="flex flex-row items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedDay(d => (d === 1 ? 30 : d - 1))}
                                    className="w-6 h-6 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center border border-white/20 transition-colors shrink-0"
                                    title={selectedDay === 1 ? '۲۹ شعبان' : `روز قبل (${selectedDay - 1} رمضان)`}
                                    aria-label={selectedDay === 1 ? '۲۹ شعبان' : `روز ${selectedDay - 1} رمضان`}
                                >
                                    <ChevronRightIcon className="w-4 h-4" />
                                </button>
                                <p className="text-emerald-100 mt-0 ">{`${currentDayData?.weekday} ${getTodaySolarDateString()}`}</p>
                                <button
                                    type="button"
                                    onClick={() => setSelectedDay(d => (d === 30 ? 1 : d + 1))}
                                    className="w-6 h-6 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center border border-white/20 transition-colors shrink-0"
                                    title={selectedDay === 30 ? '۱ شوال' : `روز بعد (${selectedDay + 1} رمضان)`}
                                    aria-label={selectedDay === 30 ? '۱ شوال' : `روز ${selectedDay + 1} رمضان`}
                                >
                                    <ChevronLeftIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="bg-white text-amber-400 w-20 h-16 rounded-2xl flex flex-row items-center justify-center gap-0.5 shadow-lg ring-4 ring-emerald-500/30 shrink-0">
                            <span className="text-2xl font-black mt-1">{progressPercent}</span>
                            <span className="text-sm font-bold mt-0.5">%</span>
                        </div>
                    </div>
                </div>
                {currentDayData?.event && (
                    <div className="mt-6 bg-amber-400/20 p-3 rounded-2xl border border-amber-400/30 text-sm flex items-center gap-3 backdrop-blur-sm animate-pulse">
                        <ExclamationCircleIcon className="w-5 h-5 text-amber-300 shrink-0" />
                        <span className="font-bold text-amber-50">{currentDayData.event}</span>
                    </div>
                )}
            </div>
            <div className="px-4 pb-24 space-y-[10px]">
                {allTasks.map(task => {
                    const isCustom = task.id >= CUSTOM_TASK_ID_START;
                    const isCompleted = (progress[selectedDay] as number[] || []).includes(task.id);
                    let taskUrl = 'urlByDay' in task && task.urlByDay ? task.urlByDay[selectedDay - 1] : (task as { url?: string }).url;
                    if (task.id === 1) taskUrl = `https://tanzil.net/#juz-${selectedDay}`;
                    return (
                        <TaskCard
                            key={task.id}
                            task={task}
                            taskUrl={taskUrl}
                            isCompleted={isCompleted}
                            isCustom={isCustom}
                            onToggle={() => onToggleTask(selectedDay, task.id)}
                            onDelete={() => {
                                if (isCustom) onRemoveCustomTask(task.id);
                                else onHideBuiltInTask(task.id);
                            }}
                        />
                    );
                })}
                <button
                    type="button"
                    onClick={onShowAddCustomTask}
                    className="flex items-center gap-4 p-5 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 text-slate-500 hover:border-emerald-200 hover:bg-emerald-50/50 hover:text-emerald-600 transition-all w-full"
                >
                    <div className="text-2xl w-12 h-12 flex items-center justify-center rounded-2xl shrink-0 bg-white border border-slate-100">
                        <PlusCircleIcon className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-sm">افزودن مورد روزانهٔ شخصی</span>
                </button>
            </div>
        </div>
    );
};

export default TodayPage;
