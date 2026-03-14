import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { NewsArticle } from "../services/newsService";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface NewsSliderProps {
  news: NewsArticle[];
}

export default function NewsSlider({ news }: NewsSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % news.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [news.length]);

  if (news.length === 0) return null;

  return (
    <div className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden rounded-xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <img
            src={news[currentIndex].imageUrl}
            alt={news[currentIndex].title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 md:p-10 text-white">
            <Link to={`/news/${news[currentIndex].id}`}>
              <h2 className="text-2xl md:text-4xl font-bold mb-2 hover:text-red-400 transition-colors">
                {news[currentIndex].title}
              </h2>
            </Link>
            <p className="text-sm md:text-base text-gray-200 line-clamp-2">
              {news[currentIndex].description}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
      
      <button
        onClick={() => setCurrentIndex((prev) => (prev - 1 + news.length) % news.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
      >
        <ChevronLeft />
      </button>
      <button
        onClick={() => setCurrentIndex((prev) => (prev + 1) % news.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
      >
        <ChevronRight />
      </button>
    </div>
  );
}
