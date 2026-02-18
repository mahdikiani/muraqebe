/**
 * Gregorian to Jalali (Shamsi) conversion – based on Kazimierz M. Borkowski algorithm.
 * Ramadan in constants: day 1 = 30 Bahman (month 11), days 2–30 = 1–29 Esfand (month 12).
 */

function g2j(gy: number, gm: number, gd: number): { jy: number; jm: number; jd: number } {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  const jy = gy <= 1600 ? 0 : 979;
  gy -= gy <= 1600 ? 621 : 1600;
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) -
    80 +
    gd +
    g_d_m[gm - 1];
  const jy2 = Math.floor(days / 12053);
  days %= 12053;
  let jy1 = Math.floor(days / 366);
  if (jy1 >= 1) days -= 366 * jy1;
  const monthDays = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
  let jm = 0;
  let jd = 0;
  for (let i = 0; i < 12; i++) {
    const v = monthDays[i];
    if (days < v) {
      jm = i + 1;
      jd = days + 1;
      break;
    }
    days -= v;
  }
  return { jy: jy + jy2 + jy1, jm, jd };
}

/** Returns Ramadan day index 1–30 if today is in the Ramadan window (30 Bahman – 29 Esfand), else null. */
export function getTodayRamadanDay(): number | null {
  const now = new Date();
  const { jm, jd } = g2j(now.getFullYear(), now.getMonth() + 1, now.getDate());
  if (jm === 11 && jd === 30) return 1;
  if (jm === 12 && jd >= 1 && jd <= 29) return jd + 1;
  return null;
}
