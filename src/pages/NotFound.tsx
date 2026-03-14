import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "motion/react";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-3xl my-8">
      <Helmet>
        <title>৪০৪ - পাতা পাওয়া যায়নি - দৈনিক বরগুনা</title>
      </Helmet>
      
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative mb-8"
      >
        <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full"></div>
        <AlertTriangle size={120} className="text-red-600 relative z-10 animate-pulse" />
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h1 className="text-8xl font-black text-gray-900 dark:text-white mb-2 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-orange-500">
          ৪০৪
        </h1>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-200 mb-6">
          দুঃখিত, এই পাতাটি খুঁজে পাওয়া যায়নি!
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-lg mb-10 text-lg leading-relaxed">
          আপনি যে সংবাদ বা পাতাটি খুঁজছেন তা হয়তো মুছে ফেলা হয়েছে অথবা এর ঠিকানা পরিবর্তন করা হয়েছে। সঠিক ঠিকানাটি পুনরায় যাচাই করুন।
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/" 
            className="px-10 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-red-500/30 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            প্রচ্ছদে ফিরে যান
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="px-10 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
          >
            পূর্ববর্তী পাতায় যান
          </button>
        </div>
      </motion.div>
    </div>
  );
}
