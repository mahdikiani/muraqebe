import React, { useState, useEffect } from 'react';
import { PrayerTimes as PrayerTimesType } from '@/types';
import { getRamadanDayTimestamp } from '@/lib/dateUtils';
import { CITIES } from '@/constants';

export interface PrayerTimesProps {
  city: string;
  day: number;
  /** 'card' = today header card, 'strip' = compact strip. */
  variant?: 'card' | 'strip';
}

const OWGHAT_TOKEN = '500847:6995f3ac53687';

function getCityNameById(id: string): string {
  const found = CITIES.find((c) => c.id === id);
  return found?.name ?? 'تهران';
}

interface OneApiOwghatResult {
    city: string;
    azan_sobh: string;
    toloe_aftab: string;
    azan_zohre: string;
    ghorob_aftab: string;
    azan_maghreb: string;
    nime_shabe_sharie: string;
}

interface OneApiOwghatResponse {
    status: number;
    result?: OneApiOwghatResult;
}

const formatTime = (time: string | undefined): string => {
    if (!time) return '--:--';
    // Format: HH:MM:SS or HH:MM
    const parts = time.split(':');
    if (parts.length >= 2) {
        return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
    }
    return time;
};

const PrayerTimes: React.FC<PrayerTimesProps> = ({ city, day, variant = 'card' }) => {
    const [prayerTimes, setPrayerTimes] = useState<PrayerTimesType | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPrayerTimes = async () => {
            setLoading(true);
            setError(null);

            try {
                const cityName = getCityNameById(city);
                const timestamp = getRamadanDayTimestamp(day);
                const url = `https://one-api.ir/owghat/?action=timestamp&token=${encodeURIComponent(OWGHAT_TOKEN)}&city=${encodeURIComponent(cityName)}&timestamp=${timestamp}&en_num=true`;
                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error('Failed to fetch prayer times');
                }

                const data: OneApiOwghatResponse = await response.json();

                if (data.status !== 200 || !data.result) {
                    throw new Error(data.result ? 'Invalid response' : 'No result');
                }

                const r = data.result;
                setPrayerTimes({
                    imsak: r.azan_sobh,
                    fajr: r.azan_sobh,
                    sunrise: r.toloe_aftab,
                    noon: r.azan_zohre,
                    sunset: r.ghorob_aftab,
                    maghrib: r.azan_maghreb,
                    midnight: r.nime_shabe_sharie,
                });
            } catch (err) {
                setError('خطا در دریافت اوقات شرعی');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (city && day) {
            fetchPrayerTimes();
        }
    }, [city, day]);

    if (variant === 'strip') {
        if (loading) {
            return (
                <div className="bg-amber-400 rounded-xl px-4 py-2.5 flex items-center justify-center gap-4 text-white">
                    <span className="text-sm font-bold">در حال دریافت...</span>
                </div>
            );
        }
        if (error || !prayerTimes) {
            return (
                <div className="bg-amber-400 rounded-xl px-4 py-2.5 flex items-center justify-center text-white text-sm">
                    {error || '—'}
                </div>
            );
        }
        return (
            <div className="bg-amber-400 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-white">
                <span className="text-sm font-bold">اذان صبح: {formatTime(prayerTimes.fajr)}</span>
                <span className="text-sm font-bold">اذان ظهر: {formatTime(prayerTimes.noon)}</span>
                <span className="text-sm font-bold">اذان مغرب: {formatTime(prayerTimes.maghrib)}</span>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 shadow-sm border border-emerald-100">
                <div className="flex items-center justify-center gap-2 text-emerald-600 text-sm">
                    <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                    <span>در حال دریافت...</span>
                </div>
            </div>
        );
    }

    if (error || !prayerTimes) {
        return (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 shadow-sm border border-red-100">
                <p className="text-red-500 text-xs text-center">{error || 'اطلاعاتی موجود نیست'}</p>
            </div>
        );
    }

    return (
        <div className="bg-amber-200/80 backdrop-blur-sm rounded-3xl p-3 shadow-sm border border-emerald-100">
            <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1">
                <div className="flex flex-row gap-1 items-center min-w-[60px]">
                    <span className="text-[10px] font-bold text-slate-600">اذان صبح: </span>
                    <span className="text-sm text-slate-500">{formatTime(prayerTimes.fajr)}</span>
                </div>
                {/* <div className="flex flex-col items-center min-w-[50px]">
                    <span className="text-[10px] text-slate-500">طلوع آفتاب</span>
                    <span className="text-sm font-bold text-amber-500">{formatTime(prayerTimes.sunrise)}</span>
                </div> */}
                <div className="flex flex-row gap-1 items-center min-w-[60px]">
                    <span className="text-[10px] font-bold text-slate-600">اذان ظهر: </span>
                    <span className="text-sm text-slate-500">{formatTime(prayerTimes.noon)}</span>
                </div>
                {/* <div className="flex flex-col items-center min-w-[50px]">
                    <span className="text-[10px] text-slate-500">غروب آفتاب</span>
                    <span className="text-sm font-bold text-amber-600">{formatTime(prayerTimes.sunset)}</span>
                </div> */}
                <div className="flex flex-row gap-1 items-center min-w-[60px]">
                    <span className="text-[10px] font-bold text-slate-600">اذان مغرب: </span>
                    <span className="text-sm text-slate-500">{formatTime(prayerTimes.maghrib)}</span>
                </div>
            </div>
        </div>
    );
};

export default PrayerTimes;
