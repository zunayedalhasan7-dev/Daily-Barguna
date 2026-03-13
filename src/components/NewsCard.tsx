import React from "react";
import { Link } from "react-router-dom";
import { NewsArticle, safeDate } from "../services/newsService";
import { format } from "date-fns";
import { bn } from "date-fns/locale";

interface NewsCardProps {
  article: NewsArticle;
  featured?: boolean;
  key?: React.Key;
}

export default function NewsCard({ article, featured = false }: NewsCardProps) {
  const date = safeDate(article.publishDate);
  const formattedDate = format(date, "d MMMM yyyy", { locale: bn });

  if (featured) {
    return (
      <Link to={`/news/${article.id}`} className="group relative block overflow-hidden rounded-none border-b-4 border-red-700 shadow-sm hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-800">
        <div className="aspect-video md:aspect-[21/9] w-full relative overflow-hidden">
          <img 
            src={article.imageUrl} 
            alt={article.title} 
            className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-700 ease-in-out"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent md:from-black/90 md:via-black/20" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 text-white">
          <span className="inline-block px-2 py-0.5 md:px-3 md:py-1 bg-red-700 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-2 md:mb-4">
            {article.category}
          </span>
          <h2 className="text-xl sm:text-2xl md:text-5xl font-bold font-serif leading-tight mb-2 md:mb-3 group-hover:text-red-300 transition-colors drop-shadow-md line-clamp-2 md:line-clamp-none">
            {article.title}
          </h2>
          <p className="text-gray-200 text-xs sm:text-sm md:text-lg line-clamp-2 mb-3 md:mb-4 font-serif max-w-3xl drop-shadow hidden sm:block">
            {article.description}
          </p>
          <div className="flex items-center text-[10px] md:text-sm text-gray-300 font-medium">
            <span>{article.author}</span>
            <span className="mx-1 md:mx-2">•</span>
            <span>{formattedDate}</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/news/${article.id}`} className="group flex flex-col bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-300 border-b border-gray-200 dark:border-gray-700 pb-3 mb-3 sm:pb-6 sm:mb-6 last:border-0 last:mb-0 last:pb-0">
      <div className="flex flex-row sm:flex-row gap-3 sm:gap-4">
        <div className="w-24 h-18 sm:w-1/3 sm:aspect-[4/3] overflow-hidden relative rounded-sm shrink-0">
          <img 
            src={article.imageUrl} 
            alt={article.title} 
            className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {article.videoUrl && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
              <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-full bg-red-700/90 flex items-center justify-center text-white pl-0.5 sm:pl-1">
                <svg className="w-3 h-3 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z" /></svg>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col flex-grow justify-center min-w-0">
          <span className="text-[10px] sm:text-xs font-bold text-red-700 dark:text-red-500 mb-0.5 sm:mb-2 uppercase tracking-wide">
            {article.category}
          </span>
          <h3 className="text-sm sm:text-2xl font-bold font-serif text-gray-900 dark:text-gray-100 mb-1 leading-tight sm:leading-snug group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors line-clamp-2 break-words">
            {article.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-[11px] sm:text-sm font-serif line-clamp-1 sm:line-clamp-2 mb-1 sm:mb-3 break-words hidden xs:block">
            {article.description}
          </p>
          <div className="flex items-center text-[9px] sm:text-xs text-gray-500 dark:text-gray-500 font-medium mt-auto gap-1 sm:gap-2">
            <span>{formattedDate}</span>
            {article.union && (
              <>
                <span>•</span>
                <span className="text-red-700 dark:text-red-500">{article.union}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
