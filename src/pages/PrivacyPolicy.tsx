import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { ShieldCheck } from "lucide-react";
import { newsService } from "../services/newsService";
import { useLanguage } from "../context/LanguageContext";

export default function PrivacyPolicy() {
  const { t } = useLanguage();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const settings = await newsService.getPageSettings();
        setContent(settings.privacy);
      } catch (error) {
        console.error("Failed to fetch privacy content:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>{t('privacy.title')} - দৈনিক বরগুনা</title>
      </Helmet>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="bg-blue-700 p-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-3xl font-bold font-serif">{t('privacy.title')}</h1>
          </div>
          <p className="text-blue-100 text-lg">{t('privacy.title')}</p>
        </div>

        <div className="p-8 md:p-12 space-y-8">
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          ) : (
            <div 
              className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed text-lg"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
