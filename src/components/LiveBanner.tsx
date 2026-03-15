import React, { useEffect, useState } from "react";
import { newsService, LiveStatus } from "../services/newsService";
import { Radio, ExternalLink, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "../context/LanguageContext";

export default function LiveBanner() {
  const { t } = useLanguage();
  const [status, setStatus] = useState<LiveStatus>({ isLive: false });
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const checkLive = async () => {
      try {
        const data = await newsService.checkParliamentLive();
        setStatus(data);
      } catch (error) {
        console.error("Failed to check live status:", error);
      }
    };

    checkLive();
    // Check every 30 minutes
    const interval = setInterval(checkLive, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (!status.isLive || !visible) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-red-50 dark:bg-red-600 text-red-700 dark:text-white overflow-hidden relative border-b border-red-100 dark:border-red-500"
      >
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 dark:bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600 dark:bg-white"></span>
            </div>
            <span className="font-bold whitespace-nowrap text-sm md:text-base">
              {status.title || t('news.live_now')}
            </span>
            <div className="hidden md:block h-4 w-px bg-red-200 dark:bg-white/30"></div>
            <p className="hidden md:block text-sm text-red-600 dark:text-red-100 truncate">
              {t('news.live_desc')}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <a 
              href={status.liveUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-red-600 dark:bg-white text-white dark:text-red-600 px-3 py-1 rounded-full text-xs md:text-sm font-bold hover:bg-red-700 dark:hover:bg-red-50 transition-colors whitespace-nowrap shadow-sm"
            >
              {t('news.watch_live')}
              <ExternalLink size={14} />
            </a>
            <button 
              onClick={() => setVisible(false)}
              className="p-1 hover:bg-red-100 dark:hover:bg-white/10 rounded-full transition-colors text-red-400 dark:text-white"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
