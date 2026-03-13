import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Info } from "lucide-react";
import { newsService } from "../services/newsService";

export default function AboutUs() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const settings = await newsService.getPageSettings();
        setContent(settings.about);
      } catch (error) {
        console.error("Failed to fetch about content:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>আমাদের সম্পর্কে - দৈনিক বরগুনা</title>
      </Helmet>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="bg-red-700 p-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Info size={32} />
            </div>
            <h1 className="text-3xl font-bold font-serif">আমাদের সম্পর্কে (About Us)</h1>
          </div>
          <p className="text-red-100 text-lg">দৈনিক বরগুনা: সত্যের সন্ধানে অবিরাম</p>
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
