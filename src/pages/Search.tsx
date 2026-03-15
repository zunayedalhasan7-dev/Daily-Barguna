import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { newsService, NewsArticle, CATEGORIES, SearchFilters, safeDate, SEARCHABLE_UNIONS } from "../services/newsService";
import { formatDistanceToNow, format } from "date-fns";
import { bn, enUS } from "date-fns/locale";
import { motion, AnimatePresence } from "motion/react";
import { Search as SearchIcon, Filter, Calendar, User, Tag, X, ChevronDown } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

// Helper to highlight text
const HighlightedText = ({ text, highlight }: { text: string; highlight: string }) => {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }
  
  const searchTerms = highlight.toLowerCase().split(/\s+/).filter(t => t.length > 0);
  if (searchTerms.length === 0) return <span>{text}</span>;

  // Create a regex that matches any of the search terms
  const regex = new RegExp(`(${searchTerms.join('|')})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, i) => 
        searchTerms.some(term => term.toLowerCase() === part.toLowerCase()) ? (
          <mark key={i} className="bg-yellow-200 dark:bg-yellow-900/50 text-gray-900 dark:text-yellow-100 px-0.5 rounded">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
};

export default function Search() {
  const { t, language, getCategoryTranslation, getUnionTranslation } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [authors, setAuthors] = useState<string[]>([]);

  // Filter states
  const [filters, setFilters] = useState<SearchFilters>({
    query: query,
    category: searchParams.get("category") || "",
    union: searchParams.get("union") || "",
    author: searchParams.get("author") || "",
    startDate: searchParams.get("start") ? parseInt(searchParams.get("start")!) : undefined,
    endDate: searchParams.get("end") ? parseInt(searchParams.get("end")!) : undefined,
  });

  useEffect(() => {
    const fetchAuthors = async () => {
      const data = await newsService.getAuthors();
      setAuthors(data);
    };
    fetchAuthors();
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const data = await newsService.searchNews({
          query: query,
          category: filters.category,
          union: filters.union,
          author: filters.author,
          startDate: filters.startDate,
          endDate: filters.endDate,
        });
        setResults(data);
      } catch (error) {
        console.error("Error searching news:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query, filters.category, filters.author, filters.startDate, filters.endDate]);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update URL params
    const params = new URLSearchParams(searchParams);
    if (value) {
      if (key === 'startDate') params.set('start', value.toString());
      else if (key === 'endDate') params.set('end', value.toString());
      else params.set(key, value);
    } else {
      if (key === 'startDate') params.delete('start');
      else if (key === 'endDate') params.delete('end');
      else params.delete(key);
    }
    setSearchParams(params);
  };

  const clearFilters = () => {
    const cleared = {
      query: query,
      category: "",
      author: "",
      startDate: undefined,
      endDate: undefined,
    };
    setFilters(cleared);
    
    const params = new URLSearchParams();
    params.set("q", query);
    setSearchParams(params);
  };

  const activeFiltersCount = [
    filters.category,
    filters.union,
    filters.author,
    filters.startDate,
    filters.endDate
  ].filter(Boolean).length;

  if (loading && results.length === 0) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl w-full"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Helmet>
        <title>{t('search.results')}: {query} - {t('site.title')}</title>
      </Helmet>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-4 border-b-4 border-red-600">
        <div className="flex items-center space-x-4">
          <SearchIcon size={32} className="text-red-600 dark:text-red-400" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {query ? (
              <>{t('news.search_results')}: <span className="text-red-600 dark:text-red-400">"{query}"</span></>
            ) : (
              <>{t('news.search_news')}</>
            )}
          </h1>
        </div>
        
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all ${
            showFilters || activeFiltersCount > 0
              ? "bg-red-600 text-white" 
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          <Filter size={16} />
          {t('news.filter')} {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          <ChevronDown size={14} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
        </button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-8"
          >
            <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-2">
                  <Tag size={12} /> {t('news.category')}
                </label>
                <select 
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600 dark:focus:border-red-500"
                >
                  <option value="">{t('news.all_categories')}</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{getCategoryTranslation(cat)}</option>
                  ))}
                </select>
              </div>

              {/* Union Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-2">
                  <Filter size={12} /> {t('news.area')}
                </label>
                <select 
                  value={filters.union}
                  onChange={(e) => handleFilterChange('union', e.target.value)}
                  className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600 dark:focus:border-red-500"
                >
                  <option value="">{t('news.all_areas')}</option>
                  {SEARCHABLE_UNIONS.map(u => (
                    <option key={u.search} value={u.name}>{getUnionTranslation(u.name)}</option>
                  ))}
                </select>
              </div>

              {/* Author Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-2">
                  <User size={12} /> {t('news.author')}
                </label>
                <select 
                  value={filters.author}
                  onChange={(e) => handleFilterChange('author', e.target.value)}
                  className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600 dark:focus:border-red-500"
                >
                  <option value="">{t('news.all_authors')}</option>
                  {authors.map(author => (
                    <option key={author} value={author}>{author}</option>
                  ))}
                </select>
              </div>

              {/* Start Date Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-2">
                  <Calendar size={12} /> {t('news.start_date')}
                </label>
                <input 
                  type="date"
                  value={filters.startDate ? format(filters.startDate, "yyyy-MM-dd") : ""}
                  onChange={(e) => handleFilterChange('startDate', e.target.value ? new Date(e.target.value).getTime() : undefined)}
                  className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600 dark:focus:border-red-500"
                />
              </div>

              {/* End Date Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-2">
                  <Calendar size={12} /> {t('news.end_date')}
                </label>
                <input 
                  type="date"
                  value={filters.endDate ? format(filters.endDate, "yyyy-MM-dd") : ""}
                  onChange={(e) => handleFilterChange('endDate', e.target.value ? new Date(e.target.value).getTime() : undefined)}
                  className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600 dark:focus:border-red-500"
                />
              </div>

              {activeFiltersCount > 0 && (
                <div className="lg:col-span-4 flex justify-end">
                  <button 
                    onClick={clearFilters}
                    className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
                  >
                    <X size={12} /> {t('news.clear_filters')}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {results.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
          <p className="text-xl text-gray-500 dark:text-gray-400 mb-4">{t('news.no_results')}</p>
          <Link to="/" className="inline-block px-6 py-2 bg-red-600 text-white font-medium rounded-full hover:bg-red-700 transition-colors">
            {t('nav.home')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {results.map(article => (
            <Link key={article.id} to={`/news/${article.id}`} className="group flex flex-col bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 dark:border-gray-700">
              <div className="aspect-video w-full overflow-hidden relative">
                <img 
                  src={article.imageUrl} 
                  alt={article.title} 
                  className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <span className="text-xs font-semibold text-red-600 dark:text-red-400 mb-2 uppercase tracking-wide">
                  {getCategoryTranslation(article.category)}
                </span>
                <h3 className="text-lg font-bold font-serif text-gray-900 dark:text-white mb-2 leading-snug group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2">
                  <HighlightedText text={article.title} highlight={query} />
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4 flex-grow">
                  <HighlightedText text={article.description} highlight={query} />
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500 mt-auto">
                  <span>{formatDistanceToNow(safeDate(article.publishDate), { addSuffix: true, locale: language === 'bn' ? bn : enUS })}</span>
                  {article.union && (
                    <span className="text-red-700 dark:text-red-500 font-medium">{getUnionTranslation(article.union)}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
