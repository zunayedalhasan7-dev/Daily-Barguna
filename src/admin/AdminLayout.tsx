import React, { useState } from "react";
import { Outlet, Navigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { LayoutDashboard, FileText, PlusCircle, LogOut, Sun, Moon, Home, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

export default function AdminLayout() {
  const { t } = useLanguage();
  const { currentUser, loading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem("passcode_authenticated");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
    </div>;
  }

  if (!currentUser || (currentUser.email !== "xpeee01@gmail.com" && currentUser.email !== "zunayedalhasan7@gmail.com")) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  const navItems = [
    { path: "/admin", icon: LayoutDashboard, label: t('admin.dashboard') },
    { path: "/admin/news", icon: FileText, label: t('admin.all_news') },
    { path: "/admin/news/add", icon: PlusCircle, label: t('admin.add_news') },
  ];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-30 flex items-center justify-between px-4 shadow-sm">
        <Link to="/" className="text-xl font-bold text-red-600 dark:text-red-500 flex items-center gap-2">
          <Home size={20} />
          {t('site.title')}
        </Link>
        <button onClick={toggleSidebar} className="p-2 text-gray-600 dark:text-gray-400">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-xl flex flex-col z-50 transition-transform duration-300 transform 
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0 lg:static lg:h-screen
      `}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <Link to="/" className="text-2xl font-bold text-red-600 dark:text-red-500 tracking-tight flex items-center gap-2">
            <Home size={24} />
            {t('site.title')}
          </Link>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 uppercase tracking-wider font-semibold">{t('admin.panel')}</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium" 
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('admin.change_theme')}</span>
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              {theme === "light" ? <Moon size={18} className="text-gray-600" /> : <Sun size={18} className="text-yellow-400" />}
            </button>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors font-medium"
          >
            <LogOut size={18} />
            <span>{t('admin.logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen pt-20 lg:pt-8">
        <div className="max-w-6xl mx-auto">
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
        </div>
      </main>
    </div>
  );
}
