import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { newsService, NewsArticle } from "../services/newsService";
import NewsSlider from "../components/NewsSlider";
import { Link } from "react-router-dom";

export default function WorldNews() {
  const [worldNews, setWorldNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const news = await newsService.getNewsByCategory("World");
        setWorldNews(news);
      } catch (error) {
        console.error("Error fetching world news:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">লোড হচ্ছে...</div>;
  }

  const featured = worldNews.slice(0, 5);
  const remaining = worldNews.slice(5);

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>বিশ্ব সংবাদ – দৈনিক বরগুনা</title>
        <meta name="description" content="সর্বশেষ আন্তর্জাতিক ও বিশ্ব সংবাদ, ব্রেকিং নিউজ এবং ট্রেন্ডিং খবর দৈনিক বরগুনায়।" />
      </Helmet>

      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">বিশ্ব সংবাদ</h1>

      {featured.length > 0 && <NewsSlider news={featured} />}

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {remaining.map((article) => (
          <Link key={article.id} to={`/news/${article.id}`} className="group block bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              referrerPolicy="no-referrer"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-red-600 transition-colors">
                {article.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                {article.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
