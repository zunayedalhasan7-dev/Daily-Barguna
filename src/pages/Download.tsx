import React from "react";
import { Helmet } from "react-helmet-async";
import { Download } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function DownloadPage() {
  const { t } = useLanguage();
  const downloadUrl = "https://drive.google.com/uc?export=download&id=1Vn94S4mTi-SFAlyLH7wb05fY83Qhl6Vo";

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Helmet>
        <title>{t('download.title')} – {t('site.title')}</title>
        <meta name="description" content={t('download.desc')} />
      </Helmet>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-3">
          <Download className="text-red-700" size={32} />
          {t('download.heading')}
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {t('download.subheading')}
        </p>

        <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{t('download.instructions_title')}</h2>
          <ol className="list-decimal list-inside space-y-4 text-gray-700 dark:text-gray-300">
            <li dangerouslySetInnerHTML={{ __html: t('download.step1') }}></li>
            <li dangerouslySetInnerHTML={{ __html: t('download.step2') }}></li>
            <li dangerouslySetInnerHTML={{ __html: t('download.step3') }}></li>
            <li dangerouslySetInnerHTML={{ __html: t('download.step4') }}></li>
            <li dangerouslySetInnerHTML={{ __html: t('download.step5') }}></li>
          </ol>
        </div>

        <a
          href={downloadUrl}
          className="inline-flex items-center gap-2 bg-red-700 text-white px-8 py-4 rounded-full font-bold hover:bg-red-800 transition-all shadow-lg hover:shadow-red-900/20"
        >
          <Download size={20} />
          {t('download.button')}
        </a>
      </div>
    </div>
  );
}
