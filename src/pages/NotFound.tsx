import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "motion/react";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <Helmet>
        <title>৪০৪ - পাতা পাওয়া যায়নি - দৈনিক বরগুনা</title>
      </Helmet>
      
      <AlertTriangle size={80} className="text-red-500 mb-6 animate-bounce" />
      <h1 className="text-6xl font-black text-gray-900 dark:text-white mb-4 tracking-tighter">৪০৪</h1>
      <h2 className="text-2xl md:text-3xl font-bold text-gray-700 dark:text-gray-300 mb-6">
        দুঃখিত, পাতাটি পাওয়া যায়নি!
      </h2>
      <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
        আপনি যে পাতাটি খুঁজছেন তা হয়তো সরিয়ে ফেলা হয়েছে, নাম পরিবর্তন করা হয়েছে অথবা সাময়িকভাবে অনুপলব্ধ।
      </p>
      <Link 
        to="/" 
        className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
      >
        প্রচ্ছদে ফিরে যান
      </Link>
    </div>
  );
}
