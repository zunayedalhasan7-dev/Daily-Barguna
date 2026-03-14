import React from "react";
import { Helmet } from "react-helmet-async";
import { Download } from "lucide-react";

export default function DownloadPage() {
  const downloadUrl = "https://drive.google.com/uc?export=download&id=1Vn94S4mTi-SFAlyLH7wb05fY83Qhl6Vo";

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Helmet>
        <title>অ্যাপ ডাউনলোড – দৈনিক বরগুনা</title>
        <meta name="description" content="দৈনিক বরগুনা অ্যাপ ডাউনলোড করুন এবং সর্বশেষ খবর পান।" />
      </Helmet>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-3">
          <Download className="text-red-700" size={32} />
          দৈনিক বরগুনা অ্যাপ ডাউনলোড
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-8">
          আমাদের অফিসিয়াল অ্যাপটি ডাউনলোড করুন এবং দ্রুততম সময়ে সব খবর আপনার হাতের মুঠোয় পান। নিচে অ্যাপটি ডাউনলোড করার নির্দেশাবলী দেওয়া হলো:
        </p>

        <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">ডাউনলোড ও ইনস্টল নির্দেশাবলী:</h2>
          <ol className="list-decimal list-inside space-y-4 text-gray-700 dark:text-gray-300">
            <li><strong>প্রথমে এখনই ডাউনলোড করুন এ চাপ দিন:</strong> তারপর "Download anyway" তে চাপ দিয়ে অ্যাপটি ডাউনলোড করুন।</li>
            <li><strong>INSTALL এ চাপ দিন:</strong> ডাউনলোড করা ফাইলটি ওপেন করে INSTALL বাটনে ক্লিক করুন।</li>
            <li><strong>More Details এ চাপ দিন:</strong> যদি "Play Protect hasn't seen this app" মেসেজটি আসে, তবে "More details" অপশনে ক্লিক করুন।</li>
            <li><strong>Install Without Scanning এ চাপ দিন:</strong> এরপর "Install without scanning" বাটনে ক্লিক করুন।</li>
            <li><strong>নিরাপত্তা যাচাই:</strong> আপনার ফোনের Fingerprint বা Pin দিয়ে অনুমতি দিন, তারপর অ্যাপটি ইনস্টল সম্পন্ন করুন।</li>
          </ol>
        </div>

        <a
          href={downloadUrl}
          className="inline-flex items-center gap-2 bg-red-700 text-white px-8 py-4 rounded-full font-bold hover:bg-red-800 transition-all shadow-lg hover:shadow-red-900/20"
        >
          <Download size={20} />
          এখনই ডাউনলোড করুন
        </a>
      </div>
    </div>
  );
}
