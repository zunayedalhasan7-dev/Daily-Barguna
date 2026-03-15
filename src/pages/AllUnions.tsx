import React from "react";
import { Helmet } from "react-helmet-async";
import UnionSelector from "../components/UnionSelector";
import { useLanguage } from "../context/LanguageContext";

export default function AllUnions() {
  const { t } = useLanguage();
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>{t('nav.unions')} - {t('site.title')}</title>
      </Helmet>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 font-serif">{t('nav.unions')}</h1>
      <UnionSelector />
    </div>
  );
}
