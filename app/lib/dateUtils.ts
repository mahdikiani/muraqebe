/**
 * Gregorian to Jalali (Shamsi) conversion – accurate algorithm.
 * Based on jalaali-js algorithm (https://github.com/jalaali/jalaali-js).
 * Ramadan in constants: day 1 = 30 Bahman (month 11), days 2–30 = 1–29 Esfand (month 12).
 */

type JDate = { jy: number; jm: number; jd: number };

export function g2j(gy: number, gm: number, gd: number): JDate {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];

  let jy = gy <= 1600 ? 0 : 979;
  gy = gy <= 1600 ? gy - 621 : gy - 1600;

  const gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) -
    80 +
    gd +
    g_d_m[gm - 1];

  jy += 33 * Math.floor(days / 12053);
  days %= 12053;

  jy += 4 * Math.floor(days / 1461);
  days %= 1461;

  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }

  const jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  const jd = 1 + (days < 186 ? (days % 31) : ((days - 186) % 30));

  return { jy, jm, jd };
}

/** Jalali (Shamsi) to Gregorian. From jalaali-js. */
export function j2g(jy: number, jm: number, jd: number): { gy: number; gm: number; gd: number } {
  const sal_a = jy > 979 ? jy - 979 : jy - 621;
  let days =
    365 * sal_a +
    Math.floor(sal_a / 33) * 8 +
    Math.floor(((sal_a % 33) + 3) / 4) +
    78 +
    (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186) +
    jd;
  let gy = 1600 + 400 * Math.floor(days / 146097);
  days %= 146097;
  if (days >= 36525) {
    gy += 100 * Math.floor((days - 1) / 36525);
    days = (days - 1) % 36525;
  }
  gy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    gy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  const gm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  const gd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return { gy, gm, gd };
}

/** Unix timestamp (seconds) for the start of the given Ramadan day (1–30) in local time. Uses current Jalali year. */
export function getRamadanDayTimestamp(dayIndex: number): number {
  const now = new Date();
  const { jy } = g2j(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const jm = dayIndex === 1 ? 11 : 12;
  const jd = dayIndex === 1 ? 30 : dayIndex - 1;
  const { gy, gm, gd } = j2g(jy, jm, jd);
  const date = new Date(gy, gm - 1, gd);
  return Math.floor(date.getTime() / 1000);
}

/** Returns Ramadan day index 1–30 if today is in the Ramadan window (30 Bahman – 29 Esfand), else null. */
export function getTodayRamadanDay(): number | null {
  const now = new Date();
  const { jm, jd } = g2j(now.getFullYear(), now.getMonth() + 1, now.getDate());
  if (jm === 11 && jd === 30) return 1;
  if (jm === 12 && jd >= 1 && jd <= 29) return jd + 1;
  return null;
}

/** Whether we are before, during, or after the Ramadan window (30 Bahman – 29 Esfand). */
export function getRamadanStatus(): 'before' | 'during' | 'after' {
  const now = new Date();
  const { jm, jd } = g2j(now.getFullYear(), now.getMonth() + 1, now.getDate());
  if (jm === 11 && jd === 30) return 'during';
  if (jm === 12 && jd >= 1 && jd <= 29) return 'during';
  if (jm === 11 && jd < 30) return 'before';
  return 'after'; // jm === 12 && jd > 29, or other months
}

const PERSIAN_WEEKDAYS = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'];
const PERSIAN_MONTH_NAMES = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];

/** Weekday name for today in Persian (based on local date). */
export function getTodayWeekdayPersian(): string {
  const day = new Date().getDay(); // 0=Sun, 1=Mon, ...
  return PERSIAN_WEEKDAYS[day];
}

/** Today's Jalali date string e.g. "29 بهمن". */
export function getTodaySolarDateString(): string {
  const now = new Date();
  const { jm, jd } = g2j(now.getFullYear(), now.getMonth() + 1, now.getDate());
  return `${jd} ${PERSIAN_MONTH_NAMES[jm - 1]}`;
}

/** Days until first day of Ramadan (30 Bahman). Only valid when status is 'before'; assumes we're in Bahman (jm=11). */
export function getDaysUntilRamadan(): number {
  const now = new Date();
  const { jm, jd } = g2j(now.getFullYear(), now.getMonth() + 1, now.getDate());
  if (jm === 11 && jd < 30) return 30 - jd;
  return 0;
}
