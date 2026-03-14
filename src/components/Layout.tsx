import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Search, Moon, Sun, ChevronRight, Facebook, Twitter, Youtube, Instagram, Globe, Download } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { CATEGORIES, newsService, Ad, SocialLinks } from "../services/newsService";
import HeadlineTicker from "./HeadlineTicker";
import LiveBanner from "./LiveBanner";
import RamadanTimer from "./RamadanTimer";
import { AnimatePresence, motion } from "motion/react";

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t, getCategoryTranslation } = useLanguage();
  const [ads, setAds] = useState<Ad[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    facebook: "#",
    twitter: "#",
    youtube: "#",
    instagram: "#"
  });
  const navigate = useNavigate();
  const location = useLocation();
  const [pageSettings, setPageSettings] = useState<any>(null);

  const handleAdminClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate("/admin/passcode");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [activeAds, links, settings] = await Promise.all([
          newsService.getActiveAds(),
          newsService.getSocialLinks(),
          newsService.getPageSettings()
        ]);
        setAds(activeAds);
        setSocialLinks(links);
        setPageSettings(settings);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsMobileMenuOpen(false);
    }
  };

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date: Date) => {
    const locale = language === 'bn' ? 'bn-BD' : 'en-US';
    
    const time = date.toLocaleTimeString(locale, { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit', 
      hour12: true 
    });
    
    // Gregorian Date
    const gregorianDate = new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long'
    }).format(date);
    
    // Hijri Date
    const hijriDate = new Intl.DateTimeFormat(language === 'bn' ? 'bn-BD-u-ca-islamic' : 'en-US-u-ca-islamic', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
    
    return { time, gregorianDate, hijriDate };
  };

  const { time, gregorianDate, hijriDate } = formatDateTime(currentTime);

  return (
    <div className={`min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 ${language === 'en' ? 'font-inter' : 'font-sans'}`}>
      
      {/* Top Bar (Somoy TV Style) */}
      <div className="bg-gray-100 dark:bg-[#1a1a1a] text-gray-600 dark:text-gray-300 py-1 text-[10px] sm:text-xs border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-8 sm:h-10">
          <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
            <div className="flex items-center gap-2 font-medium">
              <span className="whitespace-nowrap hidden xs:inline">{gregorianDate}</span>
              <span className="text-gray-600 hidden xs:inline">|</span>
              <span className="whitespace-nowrap hidden sm:inline">{currentTime.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <span className="text-gray-600 hidden sm:inline">|</span>
              <span className="whitespace-nowrap">{hijriDate}</span>
              <span className="text-gray-600 hidden sm:inline">|</span>
              <span className="whitespace-nowrap font-bold text-gray-900 dark:text-gray-300">{time}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex items-center bg-white dark:bg-gray-800 rounded-full border border-gray-300 dark:border-gray-700 p-0.5">
                <button 
                  onClick={() => setLanguage('bn')}
                  className={`px-2 py-0.5 text-[9px] sm:text-[10px] font-bold rounded-full transition-all ${language === 'bn' ? 'bg-red-700 text-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  বাংলা
                </button>
                <button 
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-0.5 text-[9px] sm:text-[10px] font-bold rounded-full transition-all ${language === 'en' ? 'bg-red-700 text-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  EN
                </button>
              </div>
              <a 
                href="#" 
                onClick={handleAdminClick} 
                className="text-[9px] sm:text-[11px] font-bold hover:text-red-700 dark:hover:text-white transition-colors border border-gray-300 dark:border-gray-700 px-2 py-0.5 rounded-sm"
              >
                Employee
              </a>
              <div className="hidden md:flex items-center gap-4 border-l border-gray-300 dark:border-gray-700 pl-4">
                <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-red-700 dark:hover:text-white transition-colors"><Facebook size={14} /></a>
                <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-red-700 dark:hover:text-white transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="hover:text-red-700 dark:hover:text-white transition-colors"><Youtube size={14} /></a>
                <button 
                  onClick={toggleTheme}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors"
                  aria-label="Toggle Theme"
                >
                  {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ramadan Timer */}
      <RamadanTimer />

      {/* Live Banner */}
      <LiveBanner />

      {/* Header */}
      <header className="bg-white dark:bg-gray-900 sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center gap-1.5 sm:gap-2 group">
                <div className="bg-red-700 text-white p-1.5 sm:p-2 rounded-sm flex-shrink-0">
                  <span className="font-serif font-black text-xl sm:text-2xl leading-none">দ</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-serif font-black text-xl sm:text-3xl tracking-tight text-gray-900 dark:text-white leading-none">
                    দৈনিক <span className="text-red-700">বরগুনা</span>
                  </span>
                  <span className="text-[8px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.2em] text-gray-500 dark:text-gray-400 font-bold mt-0.5 sm:mt-1">
                    সত্যের সন্ধানে অবিরাম
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              <Link to="/" className="px-3 py-2 text-sm font-bold text-gray-900 dark:text-gray-100 hover:text-red-700 dark:hover:text-red-400 transition-colors">
                {t('nav.home')}
              </Link>
              {CATEGORIES.slice(0, 5).map(category => (
                <Link 
                  key={category} 
                  to={`/category/${category}`} 
                  className="px-3 py-2 text-sm font-bold text-gray-900 dark:text-gray-100 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                >
                  {getCategoryTranslation(category)}
                </Link>
              ))}
              <div className="relative group px-3 py-2">
                <button className="text-sm font-bold text-gray-900 dark:text-gray-100 hover:text-red-700 dark:hover:text-red-400 transition-colors flex items-center">
                  {t('nav.more')} <ChevronRight size={14} className="ml-1 rotate-90 group-hover:rotate-[-90deg] transition-transform" />
                </button>
                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  {CATEGORIES.slice(5).map(category => (
                    <Link 
                      key={category} 
                      to={`/category/${category}`} 
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-700 dark:hover:text-red-400"
                    >
                      {getCategoryTranslation(category)}
                    </Link>
                  ))}
                </div>
              </div>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder={t('nav.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 pl-4 pr-10 py-1.5 border-b-2 border-gray-300 dark:border-gray-600 focus:border-red-700 dark:focus:border-red-500 bg-transparent text-sm text-gray-900 dark:text-white transition-colors focus:outline-none placeholder-gray-400"
                />
                <button type="submit" className="absolute right-0 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-red-700 dark:hover:text-red-400 transition-colors">
                  <Search size={16} />
                </button>
              </form>
              
              <button 
                onClick={toggleTheme} 
                className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <Link
                to="/download"
                className="p-2 text-gray-500 hover:text-red-700 dark:text-gray-400 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Download App"
              >
                <Download size={20} />
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden space-x-2">
              <button 
                onClick={toggleTheme} 
                className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <Link
                to="/download"
                className="p-2 text-gray-500 hover:text-red-700 dark:text-gray-400 dark:hover:text-white transition-colors"
                aria-label="Download App"
              >
                <Download size={20} />
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 absolute w-full shadow-lg">
            <div className="px-4 pt-4 pb-6 space-y-4">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder={t('nav.search_placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 border border-gray-300 dark:border-gray-700 rounded-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <Search size={20} />
                </button>
              </form>
              
              <div className="grid grid-cols-2 gap-2">
                <Link 
                  to="/" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-sm text-base font-bold text-gray-900 dark:text-white hover:bg-red-50 dark:hover:bg-gray-800 hover:text-red-700 dark:hover:text-red-400"
                >
                  {t('nav.home')}
                </Link>
                {CATEGORIES.map(category => (
                  <Link 
                    key={category} 
                    to={`/category/${category}`} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-sm text-base font-bold text-gray-900 dark:text-white hover:bg-red-50 dark:hover:bg-gray-800 hover:text-red-700 dark:hover:text-red-400"
                  >
                    {getCategoryTranslation(category)}
                  </Link>
                ))}
                <Link 
                  to="/unions" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-sm text-base font-bold text-gray-900 dark:text-white hover:bg-red-50 dark:hover:bg-gray-800 hover:text-red-700 dark:hover:text-red-400"
                >
                  {t('nav.unions')}
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Headline Ticker */}
      <HeadlineTicker />

      {/* Ads Section */}
      {ads.length > 0 && (
        <div className="w-full bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ads.map(ad => (
                <a key={ad.id} href={ad.linkUrl} target="_blank" rel="noopener noreferrer" className="block w-full aspect-[4/1] md:aspect-[3/1] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <img src={ad.imageUrl} alt="Advertisement" className="w-full h-full object-cover" />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-4 md:py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white pt-16 pb-8 border-t-4 border-red-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            
            <div className="col-span-1 md:col-span-2 space-y-6">
              <Link to="/" className="flex items-center gap-2 group w-fit">
                <div className="bg-red-700 text-white p-2 rounded-sm flex-shrink-0">
                  <span className="font-serif font-black text-2xl leading-none">দ</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-serif font-black text-3xl tracking-tight text-gray-900 dark:text-white leading-none">
                    দৈনিক <span className="text-red-700 dark:text-red-500">বরগুনা</span>
                  </span>
                </div>
              </Link>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-w-md font-serif">
                {t('footer.description')}
              </p>
              <div className="flex space-x-4">
                <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center hover:bg-red-700 transition-colors text-gray-600 dark:text-white"><Facebook size={18} /></a>
                <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center hover:bg-red-700 transition-colors text-gray-600 dark:text-white">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center hover:bg-red-700 transition-colors text-gray-600 dark:text-white"><Youtube size={18} /></a>
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center hover:bg-red-700 transition-colors text-gray-600 dark:text-white"><Instagram size={18} /></a>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold font-serif mb-6 border-b border-gray-200 dark:border-gray-800 pb-2">{t('footer.upazila')}</h3>
              <ul className="space-y-3">
                {CATEGORIES.filter(c => c !== "সারাদেশ" && c !== "বিশ্ব").slice(0, 6).map(cat => (
                  <li key={cat}>
                    <Link to={`/category/${cat}`} className="text-gray-600 dark:text-gray-400 hover:text-red-700 dark:hover:text-white transition-colors text-sm flex items-center">
                      <ChevronRight size={14} className="mr-2 text-red-500" /> {getCategoryTranslation(cat)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold font-serif mb-6 border-b border-gray-200 dark:border-gray-800 pb-2">{t('footer.contact')}</h3>
              <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  <strong className="block text-gray-900 dark:text-white mb-1">{t('footer.editor')}:</strong>
                  <Link to="/editor-info" className="hover:text-red-700 dark:hover:text-red-400 transition-colors">{t('footer.editor_name')}</Link>
                </li>
                <li>
                  <strong className="block text-gray-900 dark:text-white mb-1">{t('footer.office')}:</strong>
                  {t('footer.address')}
                </li>
                <li>
                  <strong className="block text-gray-900 dark:text-white mb-1">{t('footer.email')}:</strong>
                  <a href="mailto:dailybarguna01@gmail.com" className="hover:text-red-700 dark:hover:text-red-400 transition-colors">dailybarguna01@gmail.com</a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-200 dark:border-gray-800 text-center md:flex md:justify-between md:text-left text-sm text-gray-500">
            <p>{pageSettings?.copyright || t('footer.copyright').replace('{year}', new Date().getFullYear().toString())}</p>
            <div className="mt-4 md:mt-0 space-x-4">
              <Link to="/about" className="hover:text-red-700 dark:hover:text-white transition-colors">{t('footer.about')}</Link>
              <Link to="/privacy" className="hover:text-red-700 dark:hover:text-white transition-colors">{t('footer.privacy')}</Link>
              <Link to="/terms" className="hover:text-red-700 dark:hover:text-white transition-colors">{t('footer.terms')}</Link>
              <Link to="/contact" className="hover:text-red-700 dark:hover:text-white transition-colors">{t('footer.contact')}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
