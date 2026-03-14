import { useEffect, useRef, useState } from "react";
import { newsService, RamadanTimer } from "../services/newsService";

export default function RamadanAzanPlayer() {
  const [ramadanData, setRamadanData] = useState<RamadanTimer | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const data = await newsService.getRamadanTimer();
      setRamadanData(data);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!ramadanData || !ramadanData.isActive) return;

    const checkIftarTime = () => {
      const now = new Date();
      const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
        if (currentTimeStr === ramadanData.iftarTime && !hasPlayed) {
          if (!audioRef.current) {
            audioRef.current = new Audio("https://www.islamcan.com/audio/adhan/azan1.mp3");
            audioRef.current.onended = () => setIsPlaying(false);
          }
        
        audioRef.current.play().then(() => setIsPlaying(true)).catch(e => {
          console.error("আজান প্লে করতে সমস্যা হয়েছে। ব্রাউজারে একবার ক্লিক করে আবার চেষ্টা করুন।", e);
        });
        setHasPlayed(true);
      } else if (currentTimeStr !== ramadanData.iftarTime) {
        setHasPlayed(false);
      }
    };

    const interval = setInterval(checkIftarTime, 10000); // Check every 10 seconds
    return () => {
      clearInterval(interval);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [ramadanData, hasPlayed]);

  if (!isPlaying) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => {
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlaying(false);
          }
        }}
        className="bg-red-600 text-white px-4 py-2 rounded-full shadow-lg font-bold hover:bg-red-700 transition-colors"
      >
        আজান বন্ধ করুন
      </button>
    </div>
  );
}
