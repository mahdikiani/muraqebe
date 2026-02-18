import { Task, RamadanDay, Session, City } from './types';

/** Minimum id for user-created daily tasks (avoids clash with built-in task ids). */
export const CUSTOM_TASK_ID_START = 1000;

const MAFATIH_SUFFIX = 'کلیات-مفاتیح-الجنان-با-ترجمه-استاد-حسین-انصاریان';
const DAILY_DUA_SLUGS = [
  'اول', 'دوم', 'سوم', 'چهارم', 'پنجم', 'ششم', 'هفتم', 'هشتم', 'نهم', 'دهم',
  'یازدهم', 'دوازدهم', 'سیزدهم', 'چهاردهم', 'پانزدهم', 'شانزدهم', 'هفدهم', 'هجدهم', 'نوزدهم', 'بیستم',
  'بیست-و-یکم', 'بیست-و-دوم', 'بیست-و-سوم', 'بیست-و-چهارم', 'بیست-و-پنجم', 'بیست-و-ششم', 'بیست-و-هفتم', 'بیست-و-هشتم', 'بیست-و-نهم', 'سی\u200cام',
];
const DAILY_DUA_URLS: string[] = DAILY_DUA_SLUGS.map((slug, i) =>
  `https://erfan.ir/mafatih${613 + i}/${encodeURIComponent('دعای-روز-' + slug + '-ماه-رمضان-' + MAFATIH_SUFFIX)}`
);

export const TASKS: Task[] = [
  { id: 0, title: 'دعای هر روز ماه رمضان', icon: '📿', urlByDay: DAILY_DUA_URLS },
  { id: 1, title: 'تلاوت قرآن (جزء روز)', url: 'https://tanzil.net', icon: '📖' },
  { id: 2, title: 'دعاهای بعد از نماز', url: 'https://erfan.ir/mafatih109', icon: '🕌' },
  { id: 3, title: 'صدقه روزانه', url: 'https://payping.ir/d/jGLa', icon: '🪙' },
  { id: 4, title: 'دعای افطار و امام زمان', url: 'https://erfan.ir/mafatih1000', icon: '🤲' },
  { id: 5, title: 'دعای ابوحمزه ثمالی', url: 'https://erfan.ir/mafatih116/', icon: '⚖️' },
  { id: 6, title: 'دعای افتتاح', url: 'https://erfan.ir/mafatih111/', icon: '📜' },
  { id: 7, title: 'کثرت صلوات', description: '۱۰۰ صلوات', icon: '📿' },
  // { id: 8, title: 'نماز شب', url: 'https://erfan.ir/mafatih387/', icon: '🌙' },
  // { id: 9, title: 'سوره قدر (افطار و سحر)', url: 'https://tanzil.net/#97:1', icon: '✨' },
  // { id: 10, title: 'مواسات و همدلی', description: 'افطاری دادن و کمک به مستضعفین', icon: '🤝' },
  // { id: 13, title: 'سوره دخان', url: 'https://tanzil.net/#44:1', icon: '🗞️' },
  // { id: 11, title: 'غسل شب‌های فرد', description: 'غسل مستحبی شب‌های فرد و دهه‌ی آخر ماه رمضان', icon: '💧' },
  // { id: 12, title: 'نماز ماه رمضان', description: 'دو رکعت نماز با ۳ سوره توحید', icon: '🛐' },
  // { id: 14, title: 'اعمال صبح و شام', url: 'https://erfan.ir/mafatih120/', icon: '☀️' },
];

export const RAMADAN_DAYS: RamadanDay[] = [
  { dayIndex: 1, weekday: 'پنجشنبه', hijriDate: 1, solarDate: '30 بهمن' },
  { dayIndex: 2, weekday: 'جمعه', hijriDate: 2, solarDate: '1 اسفند' },
  { dayIndex: 3, weekday: 'شنبه', hijriDate: 3, solarDate: '2 اسفند' },
  { dayIndex: 4, weekday: 'یکشنبه', hijriDate: 4, solarDate: '3 اسفند' },
  { dayIndex: 5, weekday: 'دوشنبه', hijriDate: 5, solarDate: '4 اسفند' },
  { dayIndex: 6, weekday: 'سه‌شنبه', hijriDate: 6, solarDate: '5 اسفند' },
  { dayIndex: 7, weekday: 'چهارشنبه', hijriDate: 7, solarDate: '6 اسفند', event: 'رحلت حضرت ابوطالب (ع)' },
  { dayIndex: 8, weekday: 'پنجشنبه', hijriDate: 8, solarDate: '7 اسفند' },
  { dayIndex: 9, weekday: 'جمعه', hijriDate: 9, solarDate: '8 اسفند' },
  { dayIndex: 10, weekday: 'شنبه', hijriDate: 10, solarDate: '9 اسفند', event: 'رحلت حضرت خدیجه (س)' },
  { dayIndex: 11, weekday: 'یکشنبه', hijriDate: 11, solarDate: '10 اسفند' },
  { dayIndex: 12, weekday: 'دوشنبه', hijriDate: 12, solarDate: '11 اسفند' },
  { dayIndex: 13, weekday: 'سه‌شنبه', hijriDate: 13, solarDate: '12 اسفند' },
  { dayIndex: 14, weekday: 'چهارشنبه', hijriDate: 14, solarDate: '13 اسفند' },
  { dayIndex: 15, weekday: 'پنجشنبه', hijriDate: 15, solarDate: '14 اسفند', event: 'ولادت امام حسن مجتبی (ع)' },
  { dayIndex: 16, weekday: 'جمعه', hijriDate: 16, solarDate: '15 اسفند' },
  { dayIndex: 17, weekday: 'شنبه', hijriDate: 17, solarDate: '16 اسفند' },
  { dayIndex: 18, weekday: 'یکشنبه', hijriDate: 18, solarDate: '17 اسفند' },
  { dayIndex: 19, weekday: 'دوشنبه', hijriDate: 19, solarDate: '18 اسفند', event: 'ضربت خوردن امام علی (ع)' },
  { dayIndex: 20, weekday: 'سه‌شنبه', hijriDate: 20, solarDate: '19 اسفند' },
  { dayIndex: 21, weekday: 'چهارشنبه', hijriDate: 21, solarDate: '20 اسفند', event: 'شهادت حضرت امیرالمؤمنین (ع) / شب قدر' },
  { dayIndex: 22, weekday: 'پنجشنبه', hijriDate: 22, solarDate: '21 اسفند' },
  { dayIndex: 23, weekday: 'جمعه', hijriDate: 23, solarDate: '22 اسفند', event: 'شب بیست و سوم / شب قدر و روز قدس' },
  { dayIndex: 24, weekday: 'شنبه', hijriDate: 24, solarDate: '23 اسفند' },
  { dayIndex: 25, weekday: 'یکشنبه', hijriDate: 25, solarDate: '24 اسفند' },
  { dayIndex: 26, weekday: 'دوشنبه', hijriDate: 26, solarDate: '25 اسفند' },
  { dayIndex: 27, weekday: 'سه‌شنبه', hijriDate: 27, solarDate: '26 اسفند' },
  { dayIndex: 28, weekday: 'چهارشنبه', hijriDate: 28, solarDate: '27 اسفند' },
  { dayIndex: 29, weekday: 'پنجشنبه', hijriDate: 29, solarDate: '28 اسفند' },
  { dayIndex: 30, weekday: 'جمعه', hijriDate: 30, solarDate: '29 اسفند', event: 'شب عید فطر' },
];

export const SESSIONS: Session[] = [
  {
    id: 1,
    title: 'چهارمین دوره معرفتی قرآنی ملکوت',
    description: '«بازخوانی معارف قرآن برای زندگی دینی»',
    teachers: 'آیت الله #تحریری و حجج اسلام #حاج_ابوالقاسم، #امینی_خواه، #علوی، #صبوحی، #انصاریان و ...',
    time: 'ساعت ۱۴:۳۰ الی ۱۵:۳۰ و ۲۲ الی ۲۳',
    location: 'به صورت مجازی در اسکای روم',
    contact: 'شماره تماس: ۰۹۹۶۱۷۲۱۶۵۶\\nنام کاربری: @admin_imam_alrahmah',
    url: 'https://ble.ir/imam_alrahmah',
    icon: '❇️',
    image: '/malakoot.jpg',
  },
];

export const CITIES: City[] = [
  { id: 'tehran', name: 'تهران' },
  { id: 'mashhad', name: 'مشهد' },
  { id: 'isfahan', name: 'اصفهان' },
  { id: 'shiraz', name: 'شیراز' },
  { id: 'tabriz', name: 'تبریز' },
  { id: 'karaj', name: 'کرج' },
  { id: 'qom', name: 'قم' },
  { id: 'ahvaz', name: 'اهواز' },
  { id: 'kerman', name: 'کرمان' },
  { id: 'rasht', name: 'رشت' },
  { id: 'zanjan', name: 'زنجان' },
  { id: 'hamadan', name: 'همدان' },
  { id: 'kermanshah', name: 'کرمانشاه' },
  { id: 'sari', name: 'ساری' },
  { id: 'gorgan', name: 'گرگان' },
  { id: 'yazd', name: 'یزد' },
  { id: 'kashan', name: 'کاشان' },
  { id: 'ardabil', name: 'اردبیل' },
  { id: 'qazvin', name: 'قزوین' },
  { id: 'lorestan', name: 'لرستان' },
  { id: 'bushehr', name: 'بوشهر' },
  { id: 'kohgiluyeh', name: 'کهگیلویه و بویراحمد' },
  { id: 'zabol', name: 'زابل' },
  { id: 'sabzevar', name: 'سبزوار' },
  { id: 'neyshabur', name: 'نیشابور' },
];
