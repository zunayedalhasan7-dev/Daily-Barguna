import React from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "motion/react";
import { Facebook, MessageCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

export default function EditorInfo() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <Helmet>
        <title>{t('editor.title')} - {t('site.title')}</title>
      </Helmet>

      <div className="max-w-md mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors font-bold"
        >
          <ArrowLeft size={20} />
          {t('nav.back')}
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700"
        >
          <div className="bg-red-600 p-8 text-center text-white">
            <div className="w-24 h-24 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center backdrop-blur-sm border-4 border-white/30">
              <span className="text-4xl font-bold">{t('editor.initial')}</span>
            </div>
            <h1 className="text-2xl font-bold mb-1">{t('footer.editor_name')}</h1>
            <p className="text-red-100">{t('footer.editor')}</p>
          </div>

          <div className="p-8 space-y-6">
            <p className="text-center text-gray-600 dark:text-gray-400 leading-relaxed">
              {t('editor.contact_desc')}
            </p>

            <div className="space-y-4">
              <a 
                href="https://www.facebook.com/xpzunayed" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-2xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-600 text-white rounded-xl group-hover:scale-110 transition-transform">
                    <Facebook size={24} />
                  </div>
                  <span className="font-bold">{t('editor.facebook')}</span>
                </div>
                <span className="text-sm">@xpzunayed</span>
              </a>

              <a 
                href="https://wa.me/8801626538051" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-2xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-green-600 text-white rounded-xl group-hover:scale-110 transition-transform">
                    <MessageCircle size={24} />
                  </div>
                  <span className="font-bold">{t('editor.whatsapp')}</span>
                </div>
                <span className="text-sm">01626538051</span>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
