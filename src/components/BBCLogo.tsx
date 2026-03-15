import React from 'react';
import { Link } from 'react-router-dom';

export default function BBCLogo() {
  return (
    <div className="flex-shrink-0 flex items-center w-[180px] sm:w-[220px] h-[40px] sm:h-[48px]">
      <Link to="/" className="flex items-center gap-1.5 sm:gap-2 group">
        <div className="bg-red-700 text-white p-1.5 sm:p-2 rounded-sm flex-shrink-0 shadow-sm">
          <span className="font-serif font-black text-xl sm:text-2xl leading-none">দ</span>
        </div>
        <div className="flex flex-col">
          <span className="font-serif font-black text-xl sm:text-3xl tracking-tight text-gray-900 dark:text-white leading-none drop-shadow-sm">
            দৈনিক <span className="text-red-700">বরগুনা</span>
          </span>
          <span className="text-[8px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.2em] text-gray-500 dark:text-gray-400 font-bold mt-0.5 sm:mt-1">
            সত্যের সন্ধানে অবিরাম
          </span>
        </div>
      </Link>
    </div>
  );
}
