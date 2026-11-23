import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowLeft } from 'lucide-react';
import SEOHead from '../components/common/SEOHead';

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 bg-[#F5F3EF] dark:bg-[#141414] text-[#242321] dark:text-gray-100 transition-colors">
      <SEOHead title="Page Not Found | GenZ Notes" noindex={true} />
      <div className="max-w-md w-full text-center space-y-5 bg-[#FAF9F6] dark:bg-[#1A1A1A] p-8 rounded-2xl border border-[#E3DED5] dark:border-neutral-800 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-[#DE8E5C]/10 text-[#DE8E5C] flex items-center justify-center mx-auto">
          <BookOpen className="w-6 h-6" />
        </div>
        <div className="space-y-1.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#DE8E5C]">
            Error 404
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#242321] dark:text-white">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-[#77736C] dark:text-gray-400 leading-relaxed">
            The academic page, note, or study resource you are looking for does not exist or may have been moved.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
          <Link
            to="/"
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#DE8E5C] hover:bg-[#D47E48] text-white text-xs font-semibold shadow-sm transition flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <Link
            to="/ignou"
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#EEEAE3] dark:bg-neutral-800 hover:bg-[#E8E3DB] dark:hover:bg-neutral-700 text-[#242321] dark:text-white text-xs font-semibold border border-[#E3DED5] dark:border-neutral-700 transition"
          >
            IGNOU Notes
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
