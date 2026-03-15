import React, { useEffect, useState, useRef } from "react";
import { newsService, RamadanTimer as RamadanTimerType } from "../services/newsService";
import { Moon, Sun, Clock, Volume2, VolumeX } from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "../context/LanguageContext";

export default function RamadanTimer() {
  const { t, language } = useLanguage();
  const [timer, setTimer] = useState<RamadanTimerType | null>(null);
  const [countdown, setCountdown] = useState<string>("");
  const [isAlertEnabled, setIsAlertEnabled] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchTimer = async () => {
      try {
        const data = await newsService.getRamadanTimer();
        setTimer(data);
      } catch (error) {
        console.error("Failed to fetch Ramadan timer:", error);
      }
    };
    fetchTimer();
  }, []);

  useEffect(() => {
    if (!timer) return;

    const interval = setInterval(() => {
      const now = new Date();
      const sehriDate = parseTime(timer.sehriTime, now);
      const iftarDate = parseTime(timer.iftarTime, now);

      let targetDate: Date;
      let label: string;

      if (now < sehriDate) {
        targetDate = sehriDate;
        label = t('ramadan.sehri_end');
      } else if (now < iftarDate) {
        targetDate = iftarDate;
        label = t('ramadan.iftar_time');
      } else {
        // Next day's sehri
        targetDate = new Date(sehriDate.getTime() + 24 * 60 * 60 * 1000);
        label = t('ramadan.sehri_end');
      }

      const diff = targetDate.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown(`${label}: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, t]);

  useEffect(() => {
    if (!isAlertEnabled || !timer) return;

    const checkTime = () => {
      const now = new Date();
      const [time, modifier] = timer.iftarTime.split(" ");
      let [hours, minutes] = time.split(":").map(Number);

      if (modifier === "PM" && hours !== 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;

      if (now.getHours() === hours && now.getMinutes() === minutes && !hasPlayed) {
        audioRef.current?.play().catch(err => console.error("Audio play error:", err));
        setHasPlayed(true);
      } else if (now.getMinutes() !== minutes) {
        setHasPlayed(false);
      }
    };

    const interval = setInterval(checkTime, 1000);
    return () => clearInterval(interval);
  }, [isAlertEnabled, timer, hasPlayed]);

  const parseTime = (timeStr: string, referenceDate: Date) => {
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;
    
    const date = new Date(referenceDate);
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const stopAudio = () => {
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    setIsPlaying(false);
    setHasPlayed(true);
  };

  const formatTime = (timeStr: string) => {
    if (language === 'en') return timeStr;
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    let converted = timeStr.replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
    converted = converted.replace('AM', 'ভোর');
    converted = converted.replace('PM', 'সন্ধ্যা');
    return converted;
  };

  if (!timer || !timer.isActive) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-emerald-50 dark:bg-gradient-to-r dark:from-emerald-900 dark:to-teal-900 text-emerald-900 dark:text-white py-2 border-b border-emerald-200 dark:border-emerald-800"
    >
      <audio 
        ref={audioRef} 
        src="https://www.islamcan.com/audio/adhan/azan1.mp3" 
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-1">
        <div className="flex items-center gap-2 text-sm font-bold font-serif">
          <Clock className="text-emerald-600 dark:text-emerald-400" size={16} />
          {countdown}
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <div className="flex items-center gap-1">
            <Moon className="text-emerald-600 dark:text-emerald-400" size={12} />
            <span className="font-medium">{t('ramadan.sehri_end')}:</span>
            <span className="font-bold">{formatTime(timer.sehriTime)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Sun className="text-orange-600 dark:text-orange-400" size={12} />
            <span className="font-medium">{t('ramadan.iftar_time')}:</span>
            <span className="font-bold">{formatTime(timer.iftarTime)}</span>
          </div>
        </div>
        <div className="mt-1">
          {isPlaying && (
            <button onClick={stopAudio} className="bg-red-600 text-white px-3 py-1 rounded-full flex items-center gap-1 text-[10px]">
              <VolumeX size={12} /> {t('ramadan.stop_azan')}
            </button>
          )}
          {!isAlertEnabled && !isPlaying && (
            <button 
              onClick={() => {
                audioRef.current?.play().then(() => {
                  audioRef.current?.pause();
                  audioRef.current!.currentTime = 0;
                  setIsAlertEnabled(true);
                }).catch(err => {
                  console.error("Audio unlock error:", err);
                  setIsAlertEnabled(true);
                });
              }}
              className="bg-emerald-600 text-white px-3 py-1 rounded-full flex items-center gap-1 text-[10px]"
            >
              <Volume2 size={12} /> {t('ramadan.enable_alert')}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
