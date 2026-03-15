import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Helmet } from "react-helmet-async";
import { motion } from "motion/react";
import { Lock, Mail, AlertCircle, ArrowLeft } from "lucide-react";

import { useLanguage } from "../context/LanguageContext";

export default function Login() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/admin";

  React.useEffect(() => {
    if (currentUser && (currentUser.email === "xpeee01@gmail.com" || currentUser.email === "zunayedalhasan7@gmail.com")) {
      navigate(from, { replace: true });
    }
  }, [currentUser, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || t('admin.login_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12 sm:px-6 lg:px-8 relative">
      <Helmet>
        <title>{t('admin.login_title')} - {t('site.title')}</title>
      </Helmet>

      <Link 
        to="/" 
        className="absolute top-6 left-6 sm:top-10 sm:left-10 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium text-sm sm:text-base bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md z-10"
      >
        <ArrowLeft size={18} />
        <span>{t('admin.back_to_home')}</span>
      </Link>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm sm:max-w-md space-y-8 bg-white dark:bg-gray-800 p-6 sm:p-10 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 mt-12 sm:mt-0"
      >
        <div>
          <h2 className="mt-2 text-center text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {t('admin.login')}
          </h2>
          <p className="mt-2 text-center text-xs sm:text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
            {t('admin.employee')}
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded-md flex items-start">
            <AlertCircle className="text-red-500 mr-3 mt-0.5" size={20} />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('admin.email_address')}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                  placeholder=""
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('admin.password')}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                  placeholder=""
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('admin.logging_in')}
                </span>
              ) : (
                t('admin.login')
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
