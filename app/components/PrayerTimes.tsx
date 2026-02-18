import React, { useState, useEffect } from 'react';
import { PrayerTimes as PrayerTimesType } from '@/types';

interface PrayerTimesProps {
    city: string;
    day: number;
}

// Aviny API city codes mapping
const CITY_CODES: { [key: string]: string } = {
    tehran: '1',
    isfahan: '2',
    urumiyeh: '3',
    arak: '4',
    ahvaz: '5',
    tabriz: '6',
    bandarabbas: '7',
    shiraz: '8',
    karaj: '9',
    qazvin: '10',
    qom: '11',
    zahedan: '12',
    mashhad: '13',
    yazd: '14',
    bojnourd: '15',
    rasht: '16',
    sari: '17',
    gorgan: '18',
    kerman: '19',
    bushehr: '20',
    kermanshah: '21',
    sanandaj: '22',
    mahabad: '23',
    hamedan: '24',
    zanjan: '25',
    ardabil: '27',
    semnan: '29',
    ilam: '30',
    shahrekord: '31',
    yasuj: '32',
};

interface AvinyResponse {
    CityName: string;
    CountryName: string;
    Today: string;
    TodayQamari: string;
    Imsaak: string;
    Sunrise: string;
    Noon: string;
    Sunset: string;
    Maghreb: string;
    Midnight: string;
    CityLName: string;
    CountryLName: string;
    TimeZone: string;
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

const PrayerTimes: React.FC<PrayerTimesProps> = ({ city, day }) => {
    const [prayerTimes, setPrayerTimes] = useState<PrayerTimesType | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPrayerTimes = async () => {
            setLoading(true);
            setError(null);

            try {
                const cityCode = CITY_CODES[city] || '1';
                const response = await fetch(`https://prayer.aviny.com/api/prayertimes/${cityCode}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch prayer times');
                }

                const data: AvinyResponse = await response.json();

                setPrayerTimes({
                    imsak: data.Imsaak,
                    fajr: data.Imsaak,
                    sunrise: data.Sunrise,
                    noon: data.Noon,
                    sunset: data.Sunset,
                    maghrib: data.Maghreb,
                    midnight: data.Midnight,
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
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 shadow-sm border border-emerald-100">
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
                <div className="flex flex-col items-center min-w-[50px]">
                    <span className="text-[10px] text-slate-500">اذان صبح</span>
                    <span className="text-sm font-bold text-emerald-600">{formatTime(prayerTimes.fajr)}</span>
                </div>
                <div className="flex flex-col items-center min-w-[50px]">
                    <span className="text-[10px] text-slate-500">طلوع آفتاب</span>
                    <span className="text-sm font-bold text-amber-500">{formatTime(prayerTimes.sunrise)}</span>
                </div>
                <div className="flex flex-col items-center min-w-[50px]">
                    <span className="text-[10px] text-slate-500">اذان ظهر</span>
                    <span className="text-sm font-bold text-orange-500">{formatTime(prayerTimes.noon)}</span>
                </div>
                <div className="flex flex-col items-center min-w-[50px]">
                    <span className="text-[10px] text-slate-500">غروب آفتاب</span>
                    <span className="text-sm font-bold text-amber-600">{formatTime(prayerTimes.sunset)}</span>
                </div>
                <div className="flex flex-col items-center min-w-[50px]">
                    <span className="text-[10px] text-slate-500">اذان مغرب</span>
                    <span className="text-sm font-bold text-indigo-600">{formatTime(prayerTimes.maghrib)}</span>
                </div>
                <div className="flex flex-col items-center min-w-[50px]">
                    <span className="text-[10px] text-slate-500">نیمه‌شب</span>
                    <span className="text-sm font-bold text-slate-600">{formatTime(prayerTimes.midnight)}</span>
                </div>
            </div>
        </div>
    );
};

export default PrayerTimes;
