import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { newsService, NewsArticle } from "../services/newsService";
import NewsCard from "../components/NewsCard";
import { motion } from "motion/react";
import { useLanguage } from "../context/LanguageContext";

export default function Category() {
  const { t, getCategoryTranslation } = useLanguage();
  const { category } = useParams<{ category: string }>();
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryNews = async () => {
      if (!category) return;
      setLoading(true);
      try {
        const data = await newsService.getNewsByCategory(category);
        setNews(data);
      } catch (error) {
        console.error("Error fetching category news:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategoryNews();
  }, [category]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl w-full"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Helmet>
        <title>{category ? `${getCategoryTranslation(category)} - ${t('site.title')}` : t('site.title')}</title>
        <meta name="description" content={`${category ? getCategoryTranslation(category) : ''} ${t('news.latest_desc')}`} />
      </Helmet>

      <div className="flex items-center justify-between mb-8 pb-4 border-b-4 border-red-600">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white uppercase tracking-wider">
          {category ? getCategoryTranslation(category) : ''}
        </h1>
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
          {news.length} {t('news.count')}
        </span>
      </div>

      {news.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
          <p className="text-xl text-gray-500 dark:text-gray-400 mb-4">{t('news.no_news_category')}</p>
          <Link to="/" className="inline-block px-6 py-2 bg-red-600 text-white font-medium rounded-full hover:bg-red-700 transition-colors">
            {t('nav.home')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {news.map(article => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
