import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { newsService, NewsArticle, Ticker, Ad, SocialLinks, RamadanTimer, PageSettings, safeDate } from "../services/newsService";
import { FileText, Eye, TrendingUp, Clock, Edit, Trash2, Megaphone, PlusCircle, Image as ImageIcon, Share2, Save, Moon, Info, Shield, FileCheck, Mail, Radio, CheckCircle, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { bn } from "date-fns/locale";
import { motion, AnimatePresence } from "motion/react";

export default function Dashboard() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    facebook: "",
    twitter: "",
    youtube: "",
    instagram: ""
  });
  const [ramadanTimer, setRamadanTimer] = useState<RamadanTimer>({
    sehriTime: "",
    iftarTime: "",
    isActive: false
  });
  const [pageSettings, setPageSettings] = useState<PageSettings>({
    about: "",
    privacy: "",
    terms: "",
    contact: ""
  });
  const [loading, setLoading] = useState(true);
  const [savingSocial, setSavingSocial] = useState(false);
  const [savingRamadan, setSavingRamadan] = useState(false);
  const [savingPages, setSavingPages] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [newTickerText, setNewTickerText] = useState("");
  const [newAdImageUrl, setNewAdImageUrl] = useState("");
  const [newAdLinkUrl, setNewAdLinkUrl] = useState("");

  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    // Set up real-time listener for news
    const unsubscribe = newsService.subscribeToNews((updatedNews) => {
      setNews(updatedNews);
    });

    // Initial fetch for other data
    fetchOtherData();

    return () => {
      unsubscribe();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const [editingTicker, setEditingTicker] = useState<Ticker | null>(null);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);

  const fetchOtherData = async () => {
    try {
      const [tickersData, adsData, socialData, ramadanData, pagesData] = await Promise.all([
        newsService.getTickers(),
        newsService.getAds(),
        newsService.getSocialLinks(),
        newsService.getRamadanTimer(),
        newsService.getPageSettings()
      ]);
      setTickers(tickersData);
      setAds(adsData);
      setSocialLinks(socialData);
      setRamadanTimer(ramadanData);
      setPageSettings(pagesData);
    } catch (error) {
      console.error("Error fetching other data:", error);
    } finally {
      setLoading(false);
    }
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm("আপনি কি নিশ্চিত যে এই সংবাদটি মুছে ফেলতে চান?")) {
      setDeletingId(id);
      try {
        await newsService.deleteNews(id);
        // Update UI immediately
        setNews(prev => prev.filter(item => item.id !== id));
        showNotification("সংবাদটি সফলভাবে মুছে ফেলা হয়েছে।");
      } catch (error) {
        console.error("Error deleting news:", error);
        showNotification("সংবাদ মুছতে সমস্যা হয়েছে।", "error");
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleAddTicker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTickerText.trim()) return;
    try {
      const id = await newsService.addTicker(newTickerText.trim());
      setTickers([{ id, text: newTickerText.trim(), isActive: true, createdAt: Date.now() }, ...tickers]);
      setNewTickerText("");
    } catch (error) {
      console.error("Error adding ticker:", error);
    }
  };

  const handleDeleteTicker = async (id: string) => {
    if (confirm("আপনি কি নিশ্চিত যে এই শিরোনামটি মুছে ফেলতে চান?")) {
      try {
        await newsService.deleteTicker(id);
        setTickers(tickers.filter(t => t.id !== id));
        showNotification("শিরোনামটি মুছে ফেলা হয়েছে।");
      } catch (error) {
        console.error("Error deleting ticker:", error);
        showNotification("শিরোনাম মুছতে সমস্যা হয়েছে।", "error");
      }
    }
  };

  const handleAddAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdImageUrl.trim() || !newAdLinkUrl.trim()) return;
    try {
      const id = await newsService.addAd({ imageUrl: newAdImageUrl.trim(), linkUrl: newAdLinkUrl.trim(), isActive: true });
      setAds([{ id, imageUrl: newAdImageUrl.trim(), linkUrl: newAdLinkUrl.trim(), isActive: true, createdAt: Date.now() }, ...ads]);
      setNewAdImageUrl("");
      setNewAdLinkUrl("");
    } catch (error) {
      console.error("Error adding ad:", error);
    }
  };

  const handleDeleteAd = async (id: string) => {
    if (confirm("আপনি কি নিশ্চিত যে এই বিজ্ঞাপনটি মুছে ফেলতে চান?")) {
      try {
        await newsService.deleteAd(id);
        setAds(ads.filter(a => a.id !== id));
        showNotification("বিজ্ঞাপনটি মুছে ফেলা হয়েছে।");
      } catch (error) {
        console.error("Error deleting ad:", error);
        showNotification("বিজ্ঞাপন মুছতে সমস্যা হয়েছে।", "error");
      }
    }
  };

  const handleUpdateSocialLinks = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSocial(true);
    try {
      await newsService.updateSocialLinks(socialLinks);
      showNotification("সোশ্যাল মিডিয়া লিংক সফলভাবে আপডেট করা হয়েছে।");
    } catch (error) {
      console.error("Error updating social links:", error);
      showNotification("লিংক আপডেট করতে সমস্যা হয়েছে।", "error");
    } finally {
      setSavingSocial(false);
    }
  };

  const handleUpdateRamadanTimer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingRamadan(true);
    try {
      await newsService.updateRamadanTimer(ramadanTimer);
      showNotification("রমজানের সময়সূচী সফলভাবে আপডেট করা হয়েছে।");
    } catch (error: any) {
      console.error("Error updating ramadan timer:", error);
      showNotification(error.message || "সময়সূচী আপডেট করতে সমস্যা হয়েছে।", "error");
    } finally {
      setSavingRamadan(false);
    }
  };

  const handleUpdatePageSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPages(true);
    try {
      await newsService.updatePageSettings(pageSettings);
      showNotification("পেজ সেটিংস সফলভাবে আপডেট করা হয়েছে।");
    } catch (error: any) {
      console.error("Error updating page settings:", error);
      showNotification(`সেটিংস আপডেট করতে সমস্যা হয়েছে: ${error.message || "Unknown error"}`, "error");
    } finally {
      setSavingPages(false);
    }
  };

  const totalViews = news.reduce((sum, article) => sum + article.views, 0);
  const trendingCount = news.filter(n => n.trending).length;

  const handleUpdateTicker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTicker || !editingTicker.text.trim()) return;

    try {
      await newsService.updateTicker(editingTicker.id, { text: editingTicker.text.trim() });
      setTickers(tickers.map(t => t.id === editingTicker.id ? { ...t, text: editingTicker.text.trim() } : t));
      setEditingTicker(null);
      showNotification("শিরোনাম আপডেট করা হয়েছে।");
    } catch (error) {
      console.error("Error updating ticker:", error);
      showNotification("শিরোনাম আপডেট করতে সমস্যা হয়েছে।", "error");
    }
  };

  const handleUpdateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAd || !editingAd.imageUrl.trim()) return;

    try {
      await newsService.updateAd(editingAd.id, { 
        imageUrl: editingAd.imageUrl.trim(),
        linkUrl: editingAd.linkUrl.trim() || "#"
      });
      setAds(ads.map(a => a.id === editingAd.id ? { ...a, imageUrl: editingAd.imageUrl.trim(), linkUrl: editingAd.linkUrl.trim() || "#" } : a));
      setEditingAd(null);
      showNotification("বিজ্ঞাপন আপডেট করা হয়েছে।");
    } catch (error) {
      console.error("Error updating ad:", error);
      showNotification("বিজ্ঞাপন আপডেট করতে সমস্যা হয়েছে।", "error");
    }
  };

  const handleToggleTicker = async (id: string, isActive: boolean) => {
    try {
      await newsService.updateTicker(id, { isActive });
      setTickers(tickers.map(t => t.id === id ? { ...t, isActive } : t));
      showNotification(`শিরোনাম ${isActive ? "চালু" : "বন্ধ"} করা হয়েছে।`);
    } catch (error) {
      console.error("Error toggling ticker:", error);
    }
  };

  const handleToggleAd = async (id: string, isActive: boolean) => {
    try {
      await newsService.updateAd(id, { isActive });
      setAds(ads.map(a => a.id === id ? { ...a, isActive } : a));
      showNotification(`বিজ্ঞাপন ${isActive ? "চালু" : "বন্ধ"} করা হয়েছে।`);
    } catch (error) {
      console.error("Error toggling ad:", error);
    }
  };

  if (loading) {
    return <div className="animate-pulse space-y-6">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>)}
      </div>
      <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
    </div>;
  }

  return (
    <div className="space-y-8 relative">
      <Helmet>
        <title>ড্যাশবোর্ড - অ্যাডমিন প্যানেল</title>
      </Helmet>

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 20, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className={`fixed top-0 left-1/2 z-50 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border ${
              notification.type === "success" 
                ? "bg-green-600 border-green-500 text-white" 
                : "bg-red-600 border-red-500 text-white"
            }`}
          >
            {notification.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span className="font-bold">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">ড্যাশবোর্ড</h1>
        <Link to="/admin/news/add" className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md transition-colors font-medium flex items-center gap-2">
          <FileText size={18} />
          নতুন সংবাদ
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-4">
          <div className="p-4 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
            <FileText size={32} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">মোট সংবাদ</p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{news.length}</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-4">
          <div className="p-4 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl">
            <Eye size={32} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">মোট ভিউ</p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{totalViews}</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-4">
          <div className="p-4 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-xl">
            <TrendingUp size={32} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">ট্রেন্ডিং সংবাদ</p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{trendingCount}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent News Table */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock size={20} className="text-gray-500" />
              সাম্প্রতিক সংবাদ
            </h2>
            <Link to="/admin/news" className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 font-medium">সব দেখুন</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                  <th className="px-6 py-4 font-semibold">শিরোনাম</th>
                  <th className="px-6 py-4 font-semibold">ক্যাটাগরি</th>
                  <th className="px-6 py-4 font-semibold">প্রকাশকাল</th>
                  <th className="px-6 py-4 font-semibold text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {news.slice(0, 5).map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <img src={article.imageUrl} alt="" className="w-10 h-10 rounded object-cover" />
                        <span className="font-medium text-gray-900 dark:text-gray-200 line-clamp-2 max-w-[200px]">{article.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-xs font-medium">
                        {article.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(safeDate(article.publishDate), { addSuffix: true, locale: bn })}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link to={`/admin/news/edit/${article.id}`} className="inline-flex items-center p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 rounded-lg transition-colors">
                        <Edit size={16} />
                      </Link>
                      <button 
                        onClick={() => handleDelete(article.id)} 
                        disabled={deletingId === article.id}
                        className="inline-flex items-center p-2 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {deletingId === article.id ? "Deleting..." : <Trash2 size={16} />}
                      </button>
                    </td>
                  </tr>
                ))}
                {news.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      কোনো সংবাদ পাওয়া যায়নি।
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ticker Management */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Megaphone size={20} className="text-gray-500" />
              স্ক্রলিং শিরোনাম
            </h2>
          </div>
          <div className="p-6 flex-1 flex flex-col">
            <form onSubmit={handleAddTicker} className="mb-6 flex gap-2">
              <input
                type="text"
                value={newTickerText}
                onChange={(e) => setNewTickerText(e.target.value)}
                placeholder="নতুন শিরোনাম লিখুন..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              />
              <button type="submit" disabled={!newTickerText.trim()} className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors">
                <PlusCircle size={24} />
              </button>
            </form>

            <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
              {tickers.map(ticker => (
                <div key={ticker.id} className={`p-4 rounded-xl border ${ticker.isActive ? 'border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-900/10' : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'} flex justify-between items-start gap-4 transition-colors`}>
                  <p className={`text-sm ${ticker.isActive ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400 line-through'}`}>
                    {ticker.text}
                  </p>
                  <div className="flex items-center gap-2 shrink-0">
                    <button 
                      onClick={() => handleToggleTicker(ticker.id, ticker.isActive)}
                      className={`text-xs px-2 py-1 rounded font-medium ${ticker.isActive ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'}`}
                    >
                      {ticker.isActive ? 'বন্ধ করুন' : 'চালু করুন'}
                    </button>
                    <button 
                      onClick={() => handleDeleteTicker(ticker.id)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {tickers.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">কোনো শিরোনাম নেই।</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ad Management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ImageIcon size={20} className="text-gray-500" />
              বিজ্ঞাপন ব্যবস্থাপনা (হেডলাইনের নিচে)
            </h2>
          </div>
          <div className="p-6 flex-1 flex flex-col">
            <form onSubmit={handleAddAd} className="mb-6 flex gap-4 flex-col md:flex-row">
              <input
                type="url"
                value={newAdImageUrl}
                onChange={(e) => setNewAdImageUrl(e.target.value)}
                placeholder="ছবির URL (যেমন: https://example.com/ad.jpg)"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                required
              />
              <input
                type="url"
                value={newAdLinkUrl}
                onChange={(e) => setNewAdLinkUrl(e.target.value)}
                placeholder="লিংক URL (ক্লিক করলে যেখানে যাবে)"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                required
              />
              <button type="submit" disabled={!newAdImageUrl.trim() || !newAdLinkUrl.trim()} className="p-2 px-6 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2 justify-center">
                <PlusCircle size={20} />
                যোগ করুন
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ads.map(ad => (
                <div key={ad.id} className={`p-4 rounded-xl border ${ad.isActive ? 'border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-900/10' : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'} flex flex-col gap-4 transition-colors`}>
                  <div className="aspect-[3/1] w-full bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <img src={ad.imageUrl} alt="Ad" className={`w-full h-full object-cover ${!ad.isActive && 'opacity-50 grayscale'}`} />
                  </div>
                  <div className="flex justify-between items-center mt-auto">
                    <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 dark:text-blue-400 hover:underline truncate max-w-[150px]">
                      {ad.linkUrl}
                    </a>
                    <div className="flex items-center gap-2 shrink-0">
                      <button 
                        onClick={() => handleToggleAd(ad.id, ad.isActive)}
                        className={`text-xs px-2 py-1 rounded font-medium ${ad.isActive ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'}`}
                      >
                        {ad.isActive ? 'বন্ধ করুন' : 'চালু করুন'}
                      </button>
                      <button 
                        onClick={() => handleDeleteAd(ad.id)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {ads.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4 col-span-full">কোনো বিজ্ঞাপন নেই।</p>
              )}
            </div>
          </div>
        </div>

        {/* Social Media Links Management */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Share2 size={20} className="text-gray-500" />
              সোশ্যাল মিডিয়া লিংক
            </h2>
          </div>
          <div className="p-6 flex-1">
            <form onSubmit={handleUpdateSocialLinks} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Facebook</label>
                <input
                  type="url"
                  value={socialLinks.facebook}
                  onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">X (Twitter)</label>
                <input
                  type="url"
                  value={socialLinks.twitter}
                  onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  placeholder="https://x.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">YouTube</label>
                <input
                  type="url"
                  value={socialLinks.youtube}
                  onChange={(e) => setSocialLinks({ ...socialLinks, youtube: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  placeholder="https://youtube.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instagram</label>
                <input
                  type="url"
                  value={socialLinks.instagram}
                  onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  placeholder="https://instagram.com/..."
                />
              </div>
              <button 
                type="submit" 
                disabled={savingSocial}
                className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 font-bold"
              >
                {savingSocial ? "সংরক্ষণ হচ্ছে..." : <><Save size={20} /> সংরক্ষণ করুন</>}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Ramadan Timer Management */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Moon size={20} className="text-gray-500" />
            রমজানের সময়সূচী ও আজান এলার্ট
          </h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleUpdateRamadanTimer} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">সেহরির শেষ সময়</label>
                <input
                  type="text"
                  value={ramadanTimer.sehriTime}
                  onChange={(e) => setRamadanTimer({ ...ramadanTimer, sehriTime: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  placeholder="যেমন: 04:45 AM"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ইফতারের সময়</label>
                <input
                  type="text"
                  value={ramadanTimer.iftarTime}
                  onChange={(e) => setRamadanTimer({ ...ramadanTimer, iftarTime: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  placeholder="যেমন: 06:15 PM"
                />
              </div>
              <div className="flex items-end gap-2">
                <label className="flex items-center gap-3 cursor-pointer p-2 bg-gray-50 dark:bg-gray-700 rounded-lg flex-1 border border-gray-200 dark:border-gray-600">
                  <input
                    type="checkbox"
                    checked={ramadanTimer.isActive}
                    onChange={(e) => setRamadanTimer({ ...ramadanTimer, isActive: e.target.checked })}
                    className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">টাইমার ও এলার্ট চালু করুন</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (isPlaying) {
                      audioRef.current?.pause();
                      audioRef.current = null;
                      setIsPlaying(false);
                    } else {
                      const idMatch = "https://drive.google.com/file/d/1vtWed08ucWHeuHcTi2XNEX9RUmN8LNQW/view?usp=sharing".match(/[-\w]{25,}/);
                      if (idMatch) {
                        const audio = new Audio(`https://drive.google.com/uc?id=${idMatch[0]}`);
                        audioRef.current = audio;
                        audio.onended = () => setIsPlaying(false);
                        audio.play().then(() => setIsPlaying(true)).catch(e => showNotification("অডিও প্লে করতে সমস্যা হয়েছে। ব্রাউজারে একবার ক্লিক করে আবার চেষ্টা করুন।", "error"));
                      }
                    }
                  }}
                  className={`p-2 px-4 rounded-lg transition-colors text-sm font-bold ${isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                >
                  {isPlaying ? "আজান বন্ধ করুন" : "আজান টেস্ট করুন"}
                </button>
              </div>
            </div>
            <button 
              type="submit" 
              disabled={savingRamadan}
              className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 font-bold shadow-md"
            >
              {savingRamadan ? "সংরক্ষণ হচ্ছে..." : <><Save size={20} /> সময়সূচী আপডেট করুন</>}
            </button>
          </form>
        </div>
      </div>

      {/* Page Settings Management */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Edit size={20} className="text-gray-500" />
            পেজ কন্টেন্ট ব্যবস্থাপনা (About, Privacy, etc.)
          </h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleUpdatePageSettings} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Info size={16} className="text-blue-500" />
                  আমাদের সম্পর্কে (About Us)
                </label>
                <textarea
                  value={pageSettings.about}
                  onChange={(e) => setPageSettings({ ...pageSettings, about: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none h-32"
                  placeholder="HTML কন্টেন্ট এখানে দিন..."
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Shield size={16} className="text-green-500" />
                  গোপনীয়তা নীতি (Privacy Policy)
                </label>
                <textarea
                  value={pageSettings.privacy}
                  onChange={(e) => setPageSettings({ ...pageSettings, privacy: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none h-32"
                  placeholder="HTML কন্টেন্ট এখানে দিন..."
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FileCheck size={16} className="text-emerald-500" />
                  ব্যবহারের শর্তাবলী (Terms & Conditions)
                </label>
                <textarea
                  value={pageSettings.terms}
                  onChange={(e) => setPageSettings({ ...pageSettings, terms: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none h-32"
                  placeholder="HTML কন্টেন্ট এখানে দিন..."
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Mail size={16} className="text-orange-500" />
                  যোগাযোগ (Contact Us)
                </label>
                <textarea
                  value={pageSettings.contact}
                  onChange={(e) => setPageSettings({ ...pageSettings, contact: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none h-32"
                  placeholder="HTML কন্টেন্ট এখানে দিন..."
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={savingPages}
              className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 font-bold shadow-md"
            >
              {savingPages ? "সংরক্ষণ হচ্ছে..." : <><Save size={20} /> পেজ সেটিংস সংরক্ষণ করুন</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
