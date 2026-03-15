import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { newsService, NewsArticle, Ticker, Ad, SocialLinks, RamadanTimer, PageSettings, safeDate } from "../services/newsService";
import { isConfigValid } from "../firebase";
import { FileText, Eye, TrendingUp, Clock, Edit, Trash2, Megaphone, PlusCircle, Image as ImageIcon, Share2, Save, Moon, Info, Shield, FileCheck, Mail, Radio, CheckCircle, AlertCircle, WifiOff } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { bn } from "date-fns/locale";
import { motion, AnimatePresence } from "motion/react";

import { useLanguage } from "../context/LanguageContext";

export default function Dashboard() {
  const { t } = useLanguage();
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
    contact: "",
    copyright: ""
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
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    message: "",
    onConfirm: () => {},
  });

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const openConfirm = (message: string, onConfirm: () => void) => {
    setConfirmModal({ isOpen: true, message, onConfirm });
  };

  const closeConfirm = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
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
    openConfirm(t('admin.confirm_delete'), async () => {
      setDeletingId(id);
      try {
        await newsService.deleteNews(id);
        // Update UI immediately
        setNews(prev => prev.filter(item => item.id !== id));
        showNotification(t('admin.delete_success'));
      } catch (error) {
        console.error("Error deleting news:", error);
        showNotification(t('admin.delete_error'), "error");
      } finally {
        setDeletingId(null);
        closeConfirm();
      }
    });
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
    openConfirm(t('admin.confirm_title_delete'), async () => {
      try {
        await newsService.deleteTicker(id);
        setTickers(tickers.filter(t => t.id !== id));
        showNotification(t('admin.title_delete_success'));
      } catch (error) {
        console.error("Error deleting ticker:", error);
        showNotification(t('admin.title_delete_error'), "error");
      } finally {
        closeConfirm();
      }
    });
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
    openConfirm(t('admin.confirm_ad_delete'), async () => {
      try {
        await newsService.deleteAd(id);
        setAds(ads.filter(a => a.id !== id));
        showNotification(t('admin.ad_delete_success'));
      } catch (error) {
        console.error("Error deleting ad:", error);
        showNotification(t('admin.ad_delete_error'), "error");
      } finally {
        closeConfirm();
      }
    });
  };

  const handleUpdateSocialLinks = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSocial(true);
    try {
      await newsService.updateSocialLinks(socialLinks);
      showNotification(t('admin.social_update_success'));
    } catch (error) {
      console.error("Error updating social links:", error);
      showNotification(t('admin.social_update_error'), "error");
    } finally {
      setSavingSocial(false);
    }
  };

  const handleUpdateRamadanTimer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingRamadan(true);
    try {
      await newsService.updateRamadanTimer(ramadanTimer);
      showNotification(t('admin.ramadan_update_success'));
    } catch (error: any) {
      console.error("Error updating ramadan timer:", error);
      showNotification(error.message || t('admin.ramadan_update_error'), "error");
    } finally {
      setSavingRamadan(false);
    }
  };

  const handleUpdatePageSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPages(true);
    try {
      await newsService.updatePageSettings(pageSettings);
      showNotification(t('admin.page_update_success'));
    } catch (error: any) {
      console.error("Error updating page settings:", error);
      showNotification(`${t('admin.page_update_error')} ${error.message || "Unknown error"}`, "error");
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
      showNotification(t('admin.title_update_success'));
    } catch (error) {
      console.error("Error updating ticker:", error);
      showNotification(t('admin.title_update_error'), "error");
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
      showNotification(t('admin.ad_update_success'));
    } catch (error) {
      console.error("Error updating ad:", error);
      showNotification(t('admin.ad_update_error'), "error");
    }
  };

  const handleToggleTicker = async (id: string, isActive: boolean) => {
    try {
      await newsService.updateTicker(id, { isActive });
      setTickers(tickers.map(t => t.id === id ? { ...t, isActive } : t));
      showNotification(isActive ? t('admin.title_status_on') : t('admin.title_status_off'));
    } catch (error) {
      console.error("Error toggling ticker:", error);
    }
  };

  const handleToggleAd = async (id: string, isActive: boolean) => {
    try {
      await newsService.updateAd(id, { isActive });
      setAds(ads.map(a => a.id === id ? { ...a, isActive } : a));
      showNotification(isActive ? t('admin.ad_status_on') : t('admin.ad_status_off'));
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
        <title>{t('admin.dashboard')} - {t('admin.panel')}</title>
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

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeConfirm}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-gray-200 dark:border-gray-700"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full">
                  <AlertCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('admin.confirm')}</h3>
                <p className="text-gray-600 dark:text-gray-400">{confirmModal.message}</p>
                <div className="flex gap-3 w-full pt-2">
                  <button
                    onClick={closeConfirm}
                    className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {t('admin.no')}
                  </button>
                  <button
                    onClick={confirmModal.onConfirm}
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
                  >
                    {t('admin.yes_delete')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{t('admin.dashboard')}</h1>
        <Link to="/admin/news/add" className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md transition-colors font-medium flex items-center justify-center gap-2">
          <FileText size={18} />
          {t('admin.new_news')}
        </Link>
      </div>

      {!isConfigValid && (
        <div className="bg-amber-50 dark:bg-amber-900/30 border-l-4 border-amber-500 p-4 rounded-xl flex items-start shadow-sm">
          <WifiOff className="text-amber-500 mr-3 mt-0.5 shrink-0" size={24} />
          <div>
            <h3 className="text-amber-800 dark:text-amber-200 font-bold">{t('admin.firebase_not_connected')}</h3>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              {t('admin.firebase_not_connected_desc')}
              <code className="bg-amber-100 dark:bg-amber-800 px-1 rounded font-mono">VITE_FIREBASE_*</code> {t('admin.firebase_not_connected_desc2')}
            </p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-4">
          <div className="p-4 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
            <FileText size={32} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('admin.total_news')}</p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{news.length}</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-4">
          <div className="p-4 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl">
            <Eye size={32} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('admin.total_views')}</p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{totalViews}</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-4">
          <div className="p-4 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-xl">
            <TrendingUp size={32} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('admin.trending_news')}</p>
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
              {t('admin.recent_news')}
            </h2>
            <Link to="/admin/news" className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 font-medium">{t('admin.view_all')}</Link>
          </div>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                  <th className="px-6 py-4 font-semibold">{t('admin.table_title')}</th>
                  <th className="px-6 py-4 font-semibold">{t('admin.table_category')}</th>
                  <th className="px-6 py-4 font-semibold">{t('admin.table_date')}</th>
                  <th className="px-6 py-4 font-semibold text-right">{t('admin.table_action')}</th>
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
                      {t('admin.no_news_found')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile News List */}
          <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
            {news.slice(0, 10).map((article) => (
              <div key={article.id} className="p-4 space-y-3">
                <div className="flex gap-3">
                  <img src={article.imageUrl} alt="" className="w-16 h-16 rounded object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 text-sm">{article.title}</h3>
                    <p className="text-[10px] text-gray-500 mt-1">
                      {article.category} • {formatDistanceToNow(safeDate(article.publishDate), { addSuffix: true, locale: bn })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <Link to={`/admin/news/edit/${article.id}`} className="flex-1 flex items-center justify-center gap-2 py-3 text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-xs font-bold active:bg-blue-100 transition-colors">
                    <Edit size={14} /> {t('admin.edit')}
                  </Link>
                  <button 
                    onClick={() => handleDelete(article.id)} 
                    disabled={deletingId === article.id}
                    className="flex-1 flex items-center justify-center gap-2 py-3 text-red-600 bg-red-50 dark:bg-red-900/20 rounded-xl text-xs font-bold active:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={14} /> {deletingId === article.id ? t('admin.deleting') : t('admin.delete')}
                  </button>
                </div>
              </div>
            ))}
            {news.length === 0 && (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                {t('admin.no_news_found')}
              </div>
            )}
          </div>
        </div>

        {/* Ticker Management */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Megaphone size={20} className="text-gray-500" />
              {t('admin.scrolling_title')}
            </h2>
          </div>
          <div className="p-6 flex-1 flex flex-col">
            <form onSubmit={handleAddTicker} className="mb-6 flex gap-2">
              <input
                type="text"
                value={newTickerText}
                onChange={(e) => setNewTickerText(e.target.value)}
                placeholder={t('admin.new_title_placeholder')}
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
                      {ticker.isActive ? t('admin.turn_off') : t('admin.turn_on')}
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
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">{t('admin.no_title')}</p>
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
              {t('admin.ad_management')}
            </h2>
          </div>
          <div className="p-6 flex-1 flex flex-col">
            <form onSubmit={handleAddAd} className="mb-6 flex gap-4 flex-col md:flex-row">
              <input
                type="url"
                value={newAdImageUrl}
                onChange={(e) => setNewAdImageUrl(e.target.value)}
                placeholder={t('admin.ad_image_url_placeholder')}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              />
              <input
                type="url"
                value={newAdLinkUrl}
                onChange={(e) => setNewAdLinkUrl(e.target.value)}
                placeholder={t('admin.ad_link_url_placeholder')}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              />
              <button type="submit" disabled={!newAdImageUrl.trim() || !newAdLinkUrl.trim()} className="p-2 px-6 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2 justify-center">
                <PlusCircle size={20} />
                {t('admin.add')}
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
                        {ad.isActive ? t('admin.turn_off') : t('admin.turn_on')}
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
                <p className="text-center text-gray-500 dark:text-gray-400 py-4 col-span-full">{t('admin.no_ad')}</p>
              )}
            </div>
          </div>
        </div>

        {/* Social Media Links Management */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Share2 size={20} className="text-gray-500" />
              {t('admin.social_links')}
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
                {savingSocial ? t('admin.saving') : <><Save size={20} /> {t('admin.save')}</>}
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
            {t('admin.ramadan_timer')}
          </h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleUpdateRamadanTimer} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('admin.sehri_time')}</label>
                <input
                  type="text"
                  value={ramadanTimer.sehriTime}
                  onChange={(e) => setRamadanTimer({ ...ramadanTimer, sehriTime: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  placeholder={t('admin.sehri_placeholder')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('admin.iftar_time')}</label>
                <input
                  type="text"
                  value={ramadanTimer.iftarTime}
                  onChange={(e) => setRamadanTimer({ ...ramadanTimer, iftarTime: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  placeholder={t('admin.iftar_placeholder')}
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
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('admin.timer_alert_on')}</span>
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
                        audio.play().then(() => setIsPlaying(true)).catch(e => showNotification(t('admin.audio_play_error'), "error"));
                      }
                    }
                  }}
                  className={`p-2 px-4 rounded-lg transition-colors text-sm font-bold ${isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                >
                  {isPlaying ? t('admin.stop_azan') : t('admin.test_azan')}
                </button>
              </div>
            </div>
            <button 
              type="submit" 
              disabled={savingRamadan}
              className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 font-bold shadow-md"
            >
              {savingRamadan ? t('admin.saving') : <><Save size={20} /> {t('admin.update_schedule')}</>}
            </button>
          </form>
        </div>
      </div>

      {/* Page Settings Management */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Edit size={20} className="text-gray-500" />
            {t('admin.page_content_management')}
          </h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleUpdatePageSettings} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Info size={16} className="text-blue-500" />
                  {t('admin.about_us')}
                </label>
                <textarea
                  value={pageSettings.about}
                  onChange={(e) => setPageSettings({ ...pageSettings, about: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none h-32"
                  placeholder={t('admin.html_content_placeholder')}
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Shield size={16} className="text-green-500" />
                  {t('admin.privacy_policy')}
                </label>
                <textarea
                  value={pageSettings.privacy}
                  onChange={(e) => setPageSettings({ ...pageSettings, privacy: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none h-32"
                  placeholder={t('admin.html_content_placeholder')}
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FileCheck size={16} className="text-emerald-500" />
                  {t('admin.terms_conditions')}
                </label>
                <textarea
                  value={pageSettings.terms}
                  onChange={(e) => setPageSettings({ ...pageSettings, terms: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none h-32"
                  placeholder={t('admin.html_content_placeholder')}
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Mail size={16} className="text-orange-500" />
                  {t('admin.contact_us')}
                </label>
                <textarea
                  value={pageSettings.contact}
                  onChange={(e) => setPageSettings({ ...pageSettings, contact: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none h-32"
                  placeholder={t('admin.html_content_placeholder')}
                />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <CheckCircle size={16} className="text-purple-500" />
                  {t('admin.copyright_text')}
                </label>
                <input
                  type="text"
                  value={pageSettings.copyright || ""}
                  onChange={(e) => setPageSettings({ ...pageSettings, copyright: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  placeholder={t('admin.copyright_placeholder')}
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={savingPages}
              className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 font-bold shadow-md"
            >
              {savingPages ? t('admin.saving') : <><Save size={20} /> {t('admin.save_page_settings')}</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
