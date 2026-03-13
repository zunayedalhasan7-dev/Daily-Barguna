import React from "react";
import { Helmet } from "react-helmet-async";
import UnionSelector from "../components/UnionSelector";

export default function AllUnions() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>এলাকা ভিত্তিক সংবাদ - দৈনিক বরগুনা</title>
      </Helmet>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 font-serif">এলাকা ভিত্তিক সংবাদ</h1>
      <UnionSelector />
    </div>
  );
}
