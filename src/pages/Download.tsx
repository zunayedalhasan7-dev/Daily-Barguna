import React from "react";
import { Helmet } from "react-helmet-async";
import { Monitor, Download as DownloadIcon, CheckCircle, Shield, Zap } from "lucide-react";
import { motion } from "motion/react";

export default function Download() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <Helmet>
        <title>ডাউনলোড - দৈনিক বরগুনা</title>
        <meta name="description" content="দৈনিক বরগুনা উইন্ডোজ অ্যাপ ডাউনলোড করুন।" />
      </Helmet>

      <div className="text-center mb-16">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex p-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl mb-6"
        >
          <Monitor size={48} />
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 font-serif">
          ডেস্কটপ অ্যাপ ডাউনলোড করুন
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          দৈনিক বরগুনা এখন আপনার উইন্ডোজ পিসিতে। আরও দ্রুত এবং সহজ অভিজ্ঞতার জন্য আজই ডাউনলোড করুন।
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">কেন ডেস্কটপ অ্যাপ ব্যবহার করবেন?</h2>
          <ul className="space-y-4">
            {[
              { icon: Zap, title: "দ্রুত লোডিং", desc: "ব্রাউজারের চেয়ে দ্রুত সংবাদ পড়ুন।" },
              { icon: Shield, title: "নিরাপদ", desc: "সম্পূর্ণ নিরাপদ এবং নির্ভরযোগ্য।" },
              { icon: CheckCircle, title: "সহজ নেভিগেশন", desc: "ডেস্কটপ থেকে সরাসরি এক ক্লিকে প্রবেশ।" }
            ].map((item, i) => (
              <li key={i} className="flex gap-4">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-red-600 dark:text-red-400 h-fit">
                  <item.icon size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 text-center">
          <div className="mb-6">
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-full uppercase tracking-wider">
              Windows Version
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Windows (Portable)</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">Version 1.0.0 • .exe</p>
          
          <div className="space-y-4">
            <button 
              className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold text-lg hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-3"
              onClick={() => {
                const blob = new Blob(["দৈনিক বরগুনা উইন্ডোজ অ্যাপ তৈরির নির্দেশিকা:\n\n১. আপনার কম্পিউটারে প্রজেক্টটি ডাউনলোড করুন।\n২. টার্মিনালে 'npm install' কমান্ড দিন।\n৩. এরপর 'npm run electron:build' কমান্ড দিন।\n৪. 'build' ফোল্ডারে আপনার .exe ফাইলটি পেয়ে যাবেন।"], { type: 'text/plain' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'instructions.txt';
                a.click();
              }}
            >
              <DownloadIcon size={24} />
              ইনস্টলেশন গাইড ডাউনলোড করুন
            </button>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              সরাসরি .exe ফাইলটি পেতে আপনার কম্পিউটারে বিল্ড করতে হবে।
            </p>
          </div>
          
          <p className="mt-6 text-xs text-gray-500 dark:text-gray-400">
            * উইন্ডোজ ১০ বা তার পরবর্তী ভার্সন প্রয়োজন।
          </p>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900/50 p-8 rounded-3xl border border-gray-200 dark:border-gray-800">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">কীভাবে ইনস্টল করবেন?</h3>
        <ol className="list-decimal list-inside space-y-3 text-gray-600 dark:text-gray-400 text-sm">
          <li>উপরের ডাউনলোড বাটনে ক্লিক করে ফাইলটি সেভ করুন।</li>
          <li>ডাউনলোড করা <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">.exe</code> ফাইলটিতে ডাবল ক্লিক করুন।</li>
          <li>যদি উইন্ডোজ প্রোটেকশন দেখায়, তবে "More Info" এ ক্লিক করে "Run Anyway" দিন।</li>
          <li>অ্যাপটি ওপেন হবে এবং আপনি সংবাদ পড়া শুরু করতে পারবেন।</li>
        </ol>
      </div>
    </div>
  );
}
