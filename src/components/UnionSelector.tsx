import React, { useState } from "react";
import { Link } from "react-router-dom";
import { UNIONS } from "../services/newsService";
import { MapPin, Search, ChevronRight } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function UnionSelector() {
  const { t, getUnionTranslation } = useLanguage();
  const [search, setSearch] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const filteredUnions = UNIONS.filter(u => 
    u.toLowerCase().includes(search.toLowerCase())
  ).slice(0, isExpanded ? undefined : 12);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="p-4 bg-red-700 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin size={18} />
          <h3 className="font-bold font-serif">{t('news.area_news')}</h3>
        </div>
      </div>
      
      <div className="p-4">
        <div className="relative mb-4">
          <input
            type="text"
            placeholder={t('news.search_union')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
          />
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          {filteredUnions.map(union => (
            <Link
              key={union}
              to={`/union/${encodeURIComponent(union)}`}
              className="text-xs md:text-sm px-3 py-2 bg-gray-50 dark:bg-gray-700/50 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-700 dark:text-gray-300 hover:text-red-700 dark:hover:text-red-400 rounded transition-colors flex items-center justify-between group"
            >
              <span className="truncate">{getUnionTranslation(union)}</span>
              <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </Link>
          ))}
        </div>

        {!search && UNIONS.length > 12 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full mt-4 py-2 text-xs font-bold text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
          >
            {isExpanded ? t('common.show_less') : t('news.all_unions')}
          </button>
        )}
        
        {search && filteredUnions.length === 0 && (
          <p className="text-center text-xs text-gray-500 py-4">{t('news.no_union')}</p>
        )}
      </div>
    </div>
  );
}
