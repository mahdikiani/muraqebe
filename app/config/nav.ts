import type { ComponentType } from 'react';
import {
  CheckCircleIcon,
  CalendarIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  BookOpenIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

export interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'امروز', icon: CheckCircleIcon },
  { to: '/calendar', label: 'تقویم', icon: CalendarIcon },
  { to: '/courses', label: 'جلسات', icon: BookOpenIcon },
  { to: '/stats', label: 'گزارش', icon: ChartBarIcon },
  { to: '/settings', label: 'تنظیمات', icon: Cog6ToothIcon },
];
