import React from 'react';
import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from '@/config/nav';

const BottomNav: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/90 backdrop-blur-lg border-t border-slate-100 flex justify-around p-4 z-50 rounded-t-[2.5rem] shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center p-2 rounded-2xl transition-all ${isActive ? 'text-emerald-600' : 'text-slate-400'}`
          }
        >
          {({ isActive }) => (
            <>
              <Icon className={isActive ? 'w-6 h-6 stroke-[2.5px]' : 'w-6 h-6'} />
              <span className="text-[10px] mt-1.5 font-black">{label}</span>
              {isActive && <div className="w-1 h-1 bg-emerald-600 rounded-full mt-1" />}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
