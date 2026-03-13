import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { newsService, NewsArticle, safeDate } from "../services/newsService";
import { format } from "date-fns";
import { bn } from "date-fns/locale";
import { Facebook, Twitter, Linkedin, Link as LinkIcon, Eye, Clock, User, MapPin } from "lucide-react";
import { motion } from "motion/react";

export default function NewsDetail() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [relatedNews, setRelatedNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await newsService.getNewsById(id);
        if (data) {
          setArticle(data);
          // Increment view count (mock implementation, ideally done on server)
          await newsService.updateNews(id, { views: data.views + 1 });
          
          // Fetch related news
          const related = await newsService.getNewsByCategory(data.category);
          setRelatedNews(related.filter(n => n.id !== id).slice(0, 3));
        }
      } catch (error) {
        console.error("Error fetching article:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id]);

  if (loading) {

    return (
      <div className="animate-pulse max-w-4xl mx-auto space-y-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl w-full"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-20">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">সংবাদটি পাওয়া যায়নি</h2>
        <Link to="/" className="text-red-600 hover:underline">প্রচ্ছদে ফিরে যান</Link>
      </div>
    );
  }

  const shareUrl = window.location.href;

  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    
    // YouTube
    const ytMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/);
    if (ytMatch) {
      const id = ytMatch[1].split('&')[0];
      return `https://www.youtube.com/embed/${id}`;
    }

    // Google Drive
    const driveMatch = url.match(/(?:https?:\/\/)?(?:www\.)?drive\.google\.com\/file\/d\/(.+?)\/(?:view|preview)/);
    if (driveMatch) {
      return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
    }

    return url;
  };

  const embedUrl = getEmbedUrl(article.videoUrl || "");

  return (
    <article className="max-w-4xl mx-auto">
      <Helmet>
        <title>{article.title} - দৈনিক বরগুনা</title>
        <meta name="description" content={article.description} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.description} />
        <meta property="og:image" content={article.imageUrl} />
        <meta property="og:url" content={shareUrl} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400 font-bold uppercase tracking-wider mb-4">
          <Link to={`/category/${article.category}`} className="hover:underline">{article.category}</Link>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center justify-between py-4 border-y border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 gap-4">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <User size={16} />
              <span className="font-medium text-gray-900 dark:text-gray-300">{article.author}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock size={16} />
              <time dateTime={safeDate(article.publishDate).toISOString()}>
                {format(safeDate(article.publishDate), "d MMMM yyyy, h:mm a", { locale: bn })}
              </time>
            </div>
            <div className="flex items-center space-x-2">
              <Eye size={16} />
              <span>{article.views} পঠিত</span>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="flex items-center space-x-3">
            <span className="font-medium mr-2">শেয়ার:</span>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors">
              <Facebook size={16} />
            </a>
            <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(article.title)}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-sky-500 text-white hover:bg-sky-600 transition-colors">
              <Twitter size={16} />
            </a>
            <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(article.title)}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-blue-800 text-white hover:bg-blue-900 transition-colors">
              <Linkedin size={16} />
            </a>
            <button onClick={() => navigator.clipboard.writeText(shareUrl)} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
              <LinkIcon size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Media */}
      <figure className="mb-10 rounded-xl overflow-hidden shadow-lg">
        {article.videoUrl ? (
          <div className="aspect-video w-full bg-black">
            {article.videoUrl.match(/\.(webm|mp4|mov)$/i) ? (
              <video 
                src={article.videoUrl} 
                controls 
                className="w-full h-full object-contain"
                poster={article.imageUrl}
              >
                আপনার ব্রাউজার ভিডিও ট্যাগ সমর্থন করে না।
              </video>
            ) : (
              <iframe 
                src={embedUrl || ""} 
                title={article.title}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              ></iframe>
            )}
          </div>
        ) : (
          <img 
            src={article.imageUrl} 
            alt={article.title} 
            className="w-full h-auto object-cover max-h-[600px]"
          />
        )}
        <figcaption className="p-3 bg-gray-100 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-400 text-center italic">
          {article.imageCaption || article.title}
        </figcaption>
      </figure>

      {/* Content */}
      <div className="mb-12">
        {article.description && (
          <div className="text-xl md:text-2xl font-medium text-gray-700 dark:text-gray-300 leading-relaxed mb-8 font-serif italic border-l-4 border-red-600 pl-4">
            {article.description}
          </div>
        )}
        <div 
          className="prose prose-lg dark:prose-invert max-w-none font-serif text-gray-800 dark:text-gray-200 leading-relaxed mb-8"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
        
        {/* Additional Images Gallery */}
        {article.additionalImages && article.additionalImages.length > 0 && (
          <div className="mt-10">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
              আরও ছবি
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {article.additionalImages.map((imgUrl, index) => (
                <a 
                  key={index} 
                  href={imgUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow aspect-video"
                >
                  <img 
                    src={imgUrl} 
                    alt={`${article.title} - ছবি ${index + 1}`} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tags/Categories */}
      <div className="flex flex-wrap items-center gap-3 mb-12 pb-8 border-b border-gray-200 dark:border-gray-700">
        <span className="font-bold text-gray-900 dark:text-white">বিষয়:</span>
        <Link to={`/category/${article.category}`} className="px-4 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-400 transition-colors">
          {article.category}
        </Link>
        {article.union && (
          <Link to={`/union/${encodeURIComponent(article.union)}`} className="px-4 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-full text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center gap-1">
            <MapPin size={14} />
            {article.union}
          </Link>
        )}
      </div>

      {/* Related News */}
      {relatedNews.length > 0 && (
        <section>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 border-l-4 border-red-600 pl-3">
            আরও পড়ুন
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedNews.map(news => (
              <Link key={news.id} to={`/news/${news.id}`} className="group block">
                <div className="aspect-video rounded-lg overflow-hidden mb-3">
                  <img src={news.imageUrl} alt={news.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2">
                  {news.title}
                </h4>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
