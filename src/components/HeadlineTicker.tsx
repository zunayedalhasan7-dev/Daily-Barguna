import React, { useEffect, useState, useRef } from "react";
import { newsService, Ticker } from "../services/newsService";
import { Megaphone } from "lucide-react";
import { motion, useAnimationFrame, useMotionValue, useTransform } from "motion/react";

export default function HeadlineTicker() {
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const x = useMotionValue(0);

  useEffect(() => {
    const fetchTickers = async () => {
      try {
        const activeTickers = await newsService.getActiveTickers();
        setTickers(activeTickers);
      } catch (error) {
        console.error("Failed to fetch tickers:", error);
      }
    };
    fetchTickers();
  }, []);

  useAnimationFrame((time, delta) => {
    if (!textRef.current) return;
    
    // Speed: pixels per millisecond. Adjust this value to change speed.
    // 0.05 means 50 pixels per second.
    const speed = 0.05; 
    const moveBy = speed * delta;
    
    let newX = x.get() - moveBy;
    
    // Get the width of ONE instance of the text
    const textWidth = textRef.current.offsetWidth;
    
    // If we've scrolled past the first instance, reset to 0 to loop seamlessly
    if (newX <= -textWidth) {
      newX += textWidth;
    }
    
    x.set(newX);
  });

  if (tickers.length === 0) return null;

  const tickerText = tickers.map(t => t.text).join("   ♦   ") + "   ♦   ";
  // Repeat enough times to fill the screen. 10 times is usually enough for any screen.
  const repeatedText = Array(10).fill(tickerText).join("");

  return (
    <div className="bg-red-700 text-white flex items-center overflow-hidden border-b-4 border-red-900">
      <div className="bg-red-900 px-4 py-2 flex items-center space-x-2 z-10 whitespace-nowrap font-bold shadow-md">
        <Megaphone size={18} className="animate-pulse" />
        <span>শিরোনাম</span>
      </div>
      <div className="flex-1 overflow-hidden relative h-full flex items-center" ref={containerRef}>
        <motion.div 
          className="flex whitespace-nowrap w-max will-change-transform"
          style={{ x }}
        >
          <span ref={textRef} className="text-sm md:text-base font-medium">{repeatedText}</span>
          <span className="text-sm md:text-base font-medium">{repeatedText}</span>
        </motion.div>
      </div>
    </div>
  );
}
