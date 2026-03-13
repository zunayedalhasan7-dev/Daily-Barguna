import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { newsService, NewsArticle } from "../services/newsService";
import NewsCard from "../components/NewsCard";
import { MapPin, ArrowLeft } from "lucide-react";

export default function UnionNews() {
  const { unionName } = useParams<{ unionName: string }>();
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      if (!unionName) return;
      setLoading(true);
      try {
        const data = await newsService.getNewsByUnion(unionName);
        setNews(data);
      } catch (error) {
        console.error("Error fetching union news:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [unionName]);

  return (
    <div className="space-y-8">
      <Helmet>
        <title>{unionName} - এলাকার খবর | দৈনিক বরগুনা</title>
      </Helmet>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full">
            <MapPin size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-serif">
              {unionName}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              এই এলাকার সর্বশেষ সংবাদসমূহ
            </p>
          </div>
        </div>
        <Link 
          to="/" 
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-700 dark:hover:text-red-400 transition-colors font-medium"
        >
          <ArrowLeft size={18} />
          প্রচ্ছদে ফিরে যান
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse space-y-4">
              <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : news.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {news.map(article => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
          <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">এই এলাকায় কোন সংবাদ পাওয়া যায়নি</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">দুঃখিত, বর্তমানে {unionName} ইউনিয়নের কোন সংবাদ আমাদের কাছে নেই।</p>
          <Link to="/" className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 transition-colors">
            অন্যান্য সংবাদ দেখুন
          </Link>
        </div>
      )}
    </div>
  );
}
