import React from 'react';
import Calendar from '@/components/Calendar';
import { UserProgress } from '@/types';

export interface CalendarPageProps {
    progress: UserProgress;
    totalTasks: number;
    selectedDay: number;
    todayRamadanDay: number | null;
    onSelectDay: (dayIndex: number) => void;
    onGoToToday: () => void;
}

const CalendarPage: React.FC<CalendarPageProps> = ({
    progress,
    totalTasks,
    selectedDay,
    todayRamadanDay,
    onSelectDay,
    onGoToToday,
}) => {
    return (
        <Calendar
            progress={progress}
            totalTasks={totalTasks}
            selectedDay={selectedDay}
            todayRamadanDay={todayRamadanDay}
            onSelectDay={onSelectDay}
            onGoToToday={onGoToToday}
        />
    );
};

export default CalendarPage;
