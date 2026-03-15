import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Lock, ArrowLeft, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "../context/LanguageContext";

export default function PasscodePage() {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    if (localStorage.getItem("passcode_authenticated") === "true") {
      navigate("/admin/login");
    }

    const lockUntil = localStorage.getItem("passcode_lock_until");
    if (lockUntil) {
      const remaining = parseInt(lockUntil) - Date.now();
      if (remaining > 0) {
        setIsLocked(true);
        setTimeLeft(Math.ceil(remaining / 1000));
        const timer = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              setIsLocked(false);
              localStorage.removeItem("passcode_lock_until");
              localStorage.removeItem("passcode_attempts");
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        return () => clearInterval(timer);
      } else {
        localStorage.removeItem("passcode_lock_until");
        localStorage.removeItem("passcode_attempts");
      }
    }
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    if (passcode === "Xp000") {
      localStorage.setItem("passcode_authenticated", "true");
      localStorage.removeItem("passcode_attempts");
      navigate("/admin/login");
    } else {
      const attempts = parseInt(localStorage.getItem("passcode_attempts") || "0") + 1;
      localStorage.setItem("passcode_attempts", attempts.toString());

      if (attempts >= 3) {
        const lockUntil = Date.now() + 60000;
        localStorage.setItem("passcode_lock_until", lockUntil.toString());
        setIsLocked(true);
        setTimeLeft(60);
        setError(t('admin.passcode_locked'));
      } else {
        setError(t('admin.passcode_wrong').replace('{attempts}', (3 - attempts).toString()));
      }
      setPasscode("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12 relative">
      <Helmet>
        <title>{t('admin.passcode_verify')} - {t('site.title')}</title>
      </Helmet>

      <Link 
        to="/" 
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-600 transition-colors font-medium text-sm bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <ArrowLeft size={18} />
        <span>{t('admin.back_to_home')}</span>
      </Link>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700"
      >
        <div>
          <h2 className="text-center text-2xl font-extrabold text-gray-900 dark:text-white">
            {t('admin.enter_passcode')}
          </h2>
        </div>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded-md flex items-center">
            <AlertCircle className="text-red-500 mr-3" size={20} />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="password"
              required
              disabled={isLocked}
              value={isLocked ? "" : passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className={`appearance-none block w-full pl-10 px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
              placeholder={isLocked ? t('admin.wait_seconds').replace('{seconds}', timeLeft.toString()) : t('admin.passcode')}
            />
          </div>

          <button
            type="submit"
            disabled={isLocked}
            className="w-full py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLocked ? t('admin.wait_seconds').replace('{seconds}', timeLeft.toString()) : t('admin.verify')}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
