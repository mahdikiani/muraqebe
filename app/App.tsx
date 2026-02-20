import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { RAMADAN_DAYS, SESSIONS, TASKS, CITIES } from '@/constants';
import { getTodayRamadanDay, getRamadanStatus } from '@/lib/dateUtils';
import { AppProvider, useApp } from '@/context/AppContext';
import { TodayPage, CalendarPage, StatsPage, SettingsPage, CoursesPage } from '@/pages';
import IntroModal from '@/components/modals/IntroModal';
import NameEditModal from '@/components/modals/NameEditModal';
import AddCustomTaskModal from '@/components/modals/AddCustomTaskModal';
import BottomNav from '@/components/ui/BottomNav';

function AppContent() {
  const navigate = useNavigate();
  const app = useApp();
  const [showIntro, setShowIntro] = useState(false);
  const [introDismissed, setIntroDismissed] = useState(false);
  const [showNamePopup, setShowNamePopup] = useState(false);
  const [showAddCustomTask, setShowAddCustomTask] = useState(false);

  const todayRamadanDay = getTodayRamadanDay();
  const ramadanStatus = getRamadanStatus();
  const currentDayData = RAMADAN_DAYS.find((d) => d.dayIndex === app.selectedDay);

  const showIntroModal = showIntro || (app.storageEmptyOnLoad === true && !introDismissed);
  const closeIntro = () => {
    setShowIntro(false);
    setIntroDismissed(true);
  };

  const handleReset = () => {
    if (confirm('آیا مطمئن هستید که می‌خواهید تمام اطلاعات ثبت شده را پاک کنید؟')) {
      app.resetAll();
      navigate('/');
      setShowIntro(true);
    }
  };

  const handleAddCustomTask = (title: string, description: string, url: string, icon: string) => {
    app.addCustomTask(title, description, url, icon);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 relative overflow-hidden flex flex-col">
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route
            path="/"
            element={
              <TodayPage
                city={app.settings.city}
                selectedDay={app.selectedDay}
                setSelectedDay={app.setSelectedDay}
                progress={app.progress}
                userProfile={app.userProfile}
                customTasks={app.customTasks}
                hiddenTaskIds={app.hiddenTaskIds}
                allTasks={app.allTasks}
                currentDayData={currentDayData}
                todayRamadanDay={todayRamadanDay}
                ramadanStatus={ramadanStatus}
                onToggleTask={app.toggleTask}
                onRemoveCustomTask={app.removeCustomTask}
                onHideBuiltInTask={app.hideBuiltInTask}
                onShowAddCustomTask={() => setShowAddCustomTask(true)}
                onEditProfile={() => setShowNamePopup(true)}
              />
            }
          />
          <Route
            path="/calendar"
            element={
              <CalendarPage
                progress={app.progress}
                totalTasks={app.allTasks.length}
                selectedDay={app.selectedDay}
                todayRamadanDay={todayRamadanDay}
                onSelectDay={(dayIndex) => {
                  app.setSelectedDay(dayIndex);
                  navigate('/');
                }}
                onGoToToday={() => app.setSelectedDay(todayRamadanDay ?? 1)}
              />
            }
          />
          <Route path="/stats" element={<StatsPage progress={app.progress} allTasks={app.allTasks} />} />
          <Route
            path="/settings"
            element={
              <SettingsPage
                userProfile={app.userProfile}
                setUserProfile={app.setUserProfile}
                settings={app.settings}
                setSettings={app.setSettings}
                customTasks={app.customTasks}
                removeCustomTask={app.removeCustomTask}
                hiddenTaskIds={app.hiddenTaskIds}
                unhideBuiltInTask={app.unhideBuiltInTask}
                tasks={TASKS}
                cities={CITIES}
                onShowAddCustomTask={() => setShowAddCustomTask(true)}
                onReset={handleReset}
                onRequestNotifications={app.requestNotifications}
              />
            }
          />
          <Route path="/courses" element={<CoursesPage sessions={SESSIONS} />} />
        </Routes>
      </main>

      <IntroModal open={showIntroModal} onClose={closeIntro} />
      <NameEditModal
        open={showNamePopup}
        onClose={() => setShowNamePopup(false)}
        userProfile={app.userProfile}
        onSave={(name) => app.setUserProfile((p) => ({ ...p, name }))}
      />
      <AddCustomTaskModal
        open={showAddCustomTask}
        onClose={() => setShowAddCustomTask(false)}
        onAdd={handleAddCustomTask}
      />

      <BottomNav />
    </div>
  );
}

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
