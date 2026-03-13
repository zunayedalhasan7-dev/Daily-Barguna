import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { newsService, NewsArticle, CATEGORIES } from "../services/newsService";
import NewsCard from "../components/NewsCard";
import UnionSelector from "../components/UnionSelector";
import { motion } from "motion/react";

export default function Home() {
  const [latestNews, setLatestNews] = useState<NewsArticle[]>([]);
  const [trendingNews, setTrendingNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const [latest, trending] = await Promise.all([
          newsService.getAllNews(),
          newsService.getTrendingNews()
        ]);
        setLatestNews(latest);
        setTrendingNews(trending);
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-[60vh] bg-gray-200 dark:bg-gray-700 w-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 w-full"></div>
          ))}
        </div>
      </div>
    );
  }

  const featuredArticle = latestNews[0];
  const otherLatest = latestNews.slice(1, 7);

  return (
    <div className="space-y-6 sm:space-y-12">
      <Helmet>
        <title>দৈনিক বরগুনা - বরগুনার সর্বশেষ খবর</title>
        <meta name="description" content="দৈনিক বরগুনা - বরগুনা সদর, আমতলী, পাথরঘাটা, বেতাগী, বামনা ও তালতলী সহ সারাদেশের সর্বশেষ খবর।" />
      </Helmet>

      {/* Featured Section */}
      {featuredArticle && (
        <section className="mb-6 sm:mb-12">
          <NewsCard article={featuredArticle} featured={true} />
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
        {/* Main Content Column */}
        <div className="lg:col-span-8 space-y-8 sm:space-y-12">
          
          {/* Latest News List */}
          <section>
            <div className="flex items-center justify-between mb-4 sm:mb-6 border-b-2 border-red-700 pb-2">
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-gray-900 dark:text-white">সর্বশেষ খবর</h2>
              <Link to="/latest" className="text-xs sm:text-sm text-red-700 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium">সব খবর দেখুন &rarr;</Link>
            </div>
            <div className="flex flex-col">
              {otherLatest.map(article => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          </section>

          {/* Category Sections */}
          {CATEGORIES.slice(0, 2).map(category => {
            const catNews = latestNews.filter(n => n.category === category).slice(0, 4);
            if (catNews.length === 0) return null;
            return (
              <section key={category}>
                <div className="flex items-center justify-between mb-4 sm:mb-6 border-b-2 border-red-700 pb-2">
                  <h2 className="text-xl sm:text-2xl font-bold font-serif text-gray-900 dark:text-white">{category}</h2>
                  <Link to={`/category/${category}`} className="text-xs sm:text-sm text-red-700 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium">আরও দেখুন &rarr;</Link>
                </div>
                <div className="flex flex-col">
                  {catNews.map(article => (
                    <NewsCard key={article.id} article={article} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-8">
          {/* Trending News */}
          <UnionSelector />
          
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-none border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-xl font-bold font-serif text-gray-900 dark:text-white mb-6 border-l-4 border-red-700 pl-3 uppercase tracking-wide">
              সর্বাধিক পঠিত
            </h3>
            <div className="space-y-6">
              {trendingNews.map((article, index) => (
                <Link key={article.id} to={`/news/${article.id}`} className="flex items-start space-x-4 group border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                  <span className="text-4xl font-black font-serif text-gray-200 dark:text-gray-700 group-hover:text-red-100 dark:group-hover:text-red-900/30 transition-colors leading-none">
                    {(index + 1).toString().padStart(2, '0')}
                  </span>
                  <div>
                    <h4 className="text-base font-bold font-serif text-gray-800 dark:text-gray-200 group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors line-clamp-3 leading-snug">
                      {article.title}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Categories List */}
          <div className="bg-white dark:bg-gray-800 rounded-none border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-xl font-bold font-serif text-gray-900 dark:text-white mb-4 border-l-4 border-red-700 pl-3 uppercase tracking-wide">
              উপজেলা সমূহ
            </h3>
            <ul className="flex flex-wrap gap-2">
              {CATEGORIES.filter(c => c !== "সারাদেশ").map(cat => (
                <li key={cat}>
                  <Link to={`/category/${cat}`} className="inline-block py-1.5 px-3 border border-gray-200 dark:border-gray-600 rounded-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-700 dark:text-gray-300 hover:text-red-700 dark:hover:text-red-400 transition-colors text-sm font-medium">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
