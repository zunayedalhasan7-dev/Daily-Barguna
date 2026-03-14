import React, { useEffect, useState, useRef } from "react";
import { newsService, RamadanTimer as RamadanTimerType } from "../services/newsService";
import { Moon, Sun, Clock, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function RamadanTimer() {
  const [timer, setTimer] = useState<RamadanTimerType | null>(null);
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
        // Removed alert as it's forbidden in iframes
      } else if (now.getMinutes() !== minutes) {
        setHasPlayed(false);
      }
    };

    const interval = setInterval(checkTime, 1000);
    return () => clearInterval(interval);
  }, [isAlertEnabled, timer, hasPlayed]);

  if (!timer || !timer.isActive) return null;

  const stopAudio = () => {
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    setIsPlaying(false);
    setHasPlayed(true); // Prevent auto-play from triggering again
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-emerald-50 dark:bg-gradient-to-r dark:from-emerald-900 dark:to-teal-900 text-emerald-900 dark:text-white py-3 border-b border-emerald-200 dark:border-emerald-800"
    >
      <audio 
        ref={audioRef} 
        src="https://www.islamcan.com/audio/adhan/azan1.mp3" 
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-12">
        <div className="flex items-center gap-2">
          <Moon className="text-emerald-600 dark:text-emerald-400" size={16} />
          <span className="text-xs sm:text-sm font-medium text-emerald-800 dark:text-emerald-100">সেহরির শেষ সময়:</span>
          <span className="text-base sm:text-lg font-bold font-serif">{timer.sehriTime}</span>
        </div>
        <div className="hidden sm:block h-4 w-px bg-emerald-300 dark:bg-emerald-700"></div>
        <div className="flex items-center gap-2">
          <Sun className="text-orange-600 dark:text-orange-400" size={16} />
          <span className="text-xs sm:text-sm font-medium text-emerald-800 dark:text-emerald-100">ইফতারের সময়:</span>
          <span className="text-base sm:text-lg font-bold font-serif">{timer.iftarTime}</span>
        </div>
        {isPlaying && (
          <button 
            onClick={stopAudio}
            className="text-xs bg-red-600 dark:bg-red-800 text-white hover:bg-red-700 px-3 py-1 rounded-full transition-colors flex items-center gap-1"
          >
            <VolumeX size={14} />
            আজান বন্ধ করুন
          </button>
        )}
        {!isAlertEnabled && (
          <button 
            onClick={() => {
              audioRef.current?.play().then(() => {
                audioRef.current?.pause();
                audioRef.current!.currentTime = 0;
                setIsAlertEnabled(true);
              }).catch(err => {
                console.error("Audio unlock error:", err);
                setIsAlertEnabled(true); // Still enable even if unlock fails
              });
            }}
            className="text-xs bg-emerald-600 dark:bg-emerald-700 text-white hover:bg-emerald-700 dark:hover:bg-emerald-600 px-3 py-1 rounded-full transition-colors flex items-center gap-1"
          >
            <Volume2 size={14} />
            ইফতার এলার্ট চালু করুন
          </button>
        )}
      </div>
    </motion.div>
  );
}
