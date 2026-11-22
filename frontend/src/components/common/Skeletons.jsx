import React from 'react';
import { ChevronRight, ChevronDown, Search, BookOpen } from 'lucide-react';

/**
 * Fundamental Skeleton Shimmer Element
 */
export const Skeleton = ({ className = '' }) => {
  const hasRadius = className.includes('rounded');
  return <div className={`skeleton-shimmer ${hasRadius ? '' : 'rounded-xl'} ${className}`} />;
};

/**
 * Subject Card Skeleton (Matches AcademicExplorePage)
 */
export const SubjectCardSkeleton = () => (
  <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl border border-[#E3DED5] dark:border-neutral-800 p-6 shadow-sm flex flex-col justify-between space-y-4">
    <div className="space-y-3">
      {/* Code badge & Subject Tag */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-20 rounded-md" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>

      {/* Subject Title */}
      <Skeleton className="h-6 w-3/4 rounded-lg" />
      <Skeleton className="h-4 w-1/2 rounded-md" />

      {/* Meta details */}
      <div className="pt-2 space-y-1.5">
        <Skeleton className="h-3.5 w-full rounded" />
        <Skeleton className="h-3.5 w-4/5 rounded" />
      </div>
    </div>

    {/* Footer Price & Button */}
    <div className="pt-4 border-t border-[#E3DED5] dark:border-neutral-800 flex items-center justify-between">
      <Skeleton className="h-5 w-16 rounded" />
      <Skeleton className="h-9 w-28 rounded-xl" />
    </div>
  </div>
);

/**
 * Grid of Subject Cards Skeleton (For AcademicExplorePage)
 */
export const SubjectGridSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <SubjectCardSkeleton key={i} />
    ))}
  </div>
);

/**
 * Page 1: Available Subjects Skeleton (Matches SubjectListingPage exactly)
 */
export const SubjectListingSkeleton = () => (
  <div className="min-h-screen bg-[#F5F3EF] dark:bg-[#141414] text-[#242321] dark:text-gray-100 pb-24 transition-colors">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-[#77736C] dark:text-gray-400">
          <Skeleton className="h-3.5 w-10 rounded" />
          <ChevronRight className="w-3.5 h-3.5 text-[#77736C]/40" />
          <Skeleton className="h-3.5 w-16 rounded" />
          <ChevronRight className="w-3.5 h-3.5 text-[#77736C]/40" />
          <Skeleton className="h-3.5 w-10 rounded" />
          <ChevronRight className="w-3.5 h-3.5 text-[#77736C]/40" />
          <Skeleton className="h-3.5 w-20 rounded" />
        </div>

        {/* Change Academic Selection Button Skeleton */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E3DED5] dark:border-neutral-700 bg-[#FAF9F6] dark:bg-neutral-800 shadow-sm">
          <Skeleton className="h-3.5 w-36 rounded" />
          <ChevronDown className="w-3.5 h-3.5 text-[#77736C]/40" />
        </div>
      </div>

      {/* Primary Page Heading */}
      <div className="space-y-2 pb-5 border-b border-[#E3DED5] dark:border-neutral-800">
        <div className="text-[11px] font-bold uppercase tracking-wider">
          <Skeleton className="h-3 w-48 rounded bg-[#DE8E5C]/30" />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Skeleton className="h-8 sm:h-9 w-60 rounded-xl mb-1.5" />
            <Skeleton className="h-3.5 w-72 max-w-full rounded" />
          </div>

          {/* Subject Filter Search Bar */}
          <div className="relative w-full sm:w-64">
            <div className="w-full h-9 px-3.5 bg-[#FAF9F6] dark:bg-neutral-900 border border-[#E3DED5] dark:border-neutral-800 rounded-xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-[#77736C]/40" />
                <Skeleton className="h-3 w-24 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vertical Full-Width Subject Cards */}
      <div className="flex flex-col gap-3">
        {[
          { titleW: 'w-48 sm:w-56', descW: 'w-3/4 max-w-sm' },
          { titleW: 'w-64 sm:w-72', descW: 'w-2/3 max-w-xs' },
          { titleW: 'w-40 sm:w-48', descW: null },
          { titleW: 'w-52 sm:w-60', descW: 'w-4/5 max-w-md' },
        ].map((card, idx) => (
          <div
            key={idx}
            className="w-full p-5 sm:p-6 bg-[#FAF9F6] dark:bg-[#1A1A1A] border border-[#E3DED5] dark:border-neutral-800 rounded-2xl flex items-center justify-between gap-4 shadow-sm"
          >
            <div className="space-y-2 flex-1 pr-4">
              <Skeleton className={`h-6 ${card.titleW} rounded-lg`} />
              {card.descW && <Skeleton className={`h-3.5 ${card.descW} rounded`} />}
            </div>
            <div className="w-8 h-8 rounded-xl bg-[#EEEAE3] dark:bg-neutral-900 flex items-center justify-center flex-shrink-0">
              <ChevronRight className="w-4 h-4 text-[#77736C]/40" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const AvailableSubjectsSkeleton = SubjectListingSkeleton;

/**
 * Page 2: Subject Details Page Skeleton (Matches SubjectDetailsPage exactly)
 */
export const SubjectDetailsSkeleton = () => (
  <div className="min-h-screen bg-[#F5F3EF] dark:bg-[#141414] text-[#242321] dark:text-gray-100 pb-24 transition-colors">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
      {/* Academic Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-[#77736C] dark:text-gray-400 flex-wrap">
        <Skeleton className="h-3.5 w-10 rounded" />
        <ChevronRight className="w-3.5 h-3.5 text-[#77736C]/40" />
        <Skeleton className="h-3.5 w-14 rounded" />
        <ChevronRight className="w-3.5 h-3.5 text-[#77736C]/40" />
        <Skeleton className="h-3.5 w-10 rounded" />
        <ChevronRight className="w-3.5 h-3.5 text-[#77736C]/40" />
        <Skeleton className="h-3.5 w-20 rounded" />
        <ChevronRight className="w-3.5 h-3.5 text-[#77736C]/40" />
        <Skeleton className="h-3.5 w-28 rounded" />
      </nav>

      {/* Subject Header */}
      <div className="space-y-2 pb-6 border-b border-[#E3DED5] dark:border-neutral-800">
        <div className="text-[11px] font-bold uppercase tracking-wider">
          <Skeleton className="h-3 w-36 rounded bg-[#DE8E5C]/30" />
        </div>
        <Skeleton className="h-8 sm:h-9 w-60 sm:w-80 rounded-xl" />
        <div className="space-y-1.5 pt-1">
          <Skeleton className="h-3.5 w-full max-w-xl rounded" />
          <Skeleton className="h-3.5 w-2/3 max-w-md rounded" />
        </div>
      </div>

      {/* Curriculum Blocks Section Header */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#77736C] dark:text-gray-400 mb-4">
          <Skeleton className="h-3.5 w-36 rounded" />
        </h2>

        {/* Full-Width Vertical Block Cards */}
        <div className="flex flex-col gap-3">
          {[
            { titleW: 'w-44 sm:w-56', descW: 'w-2/3 max-w-sm' },
            { titleW: 'w-52 sm:w-64', descW: 'w-1/2 max-w-xs' },
            { titleW: 'w-48 sm:w-60', descW: null },
          ].map((block, idx) => (
            <div
              key={idx}
              className="w-full p-5 sm:p-6 bg-[#FAF9F6] dark:bg-[#1A1A1A] border border-[#E3DED5] dark:border-neutral-800 rounded-2xl flex items-center justify-between gap-4 shadow-sm"
            >
              <div className="space-y-2 flex-1 pr-4">
                <Skeleton className={`h-6 ${block.titleW} rounded-lg`} />
                {block.descW && <Skeleton className={`h-3.5 ${block.descW} rounded`} />}
              </div>
              <div className="w-8 h-8 rounded-xl bg-[#EEEAE3] dark:bg-neutral-900 flex items-center justify-center flex-shrink-0">
                <ChevronRight className="w-4 h-4 text-[#77736C]/40" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

/**
 * Page 3: Block Units Page Skeleton (Matches BlockUnitsPage exactly)
 */
export const BlockUnitsSkeleton = () => (
  <div className="min-h-screen bg-[#F5F3EF] dark:bg-[#141414] text-[#242321] dark:text-gray-100 pb-24 transition-colors">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
      {/* Academic Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-[#77736C] dark:text-gray-400 flex-wrap">
        <Skeleton className="h-3.5 w-10 rounded" />
        <ChevronRight className="w-3.5 h-3.5 text-[#77736C]/40" />
        <Skeleton className="h-3.5 w-14 rounded" />
        <ChevronRight className="w-3.5 h-3.5 text-[#77736C]/40" />
        <Skeleton className="h-3.5 w-10 rounded" />
        <ChevronRight className="w-3.5 h-3.5 text-[#77736C]/40" />
        <Skeleton className="h-3.5 w-20 rounded" />
        <ChevronRight className="w-3.5 h-3.5 text-[#77736C]/40" />
        <Skeleton className="h-3.5 w-28 rounded" />
        <ChevronRight className="w-3.5 h-3.5 text-[#77736C]/40" />
        <Skeleton className="h-3.5 w-16 rounded" />
      </nav>

      {/* Block Header */}
      <div className="space-y-2 pb-6 border-b border-[#E3DED5] dark:border-neutral-800">
        <div className="text-[11px] font-bold uppercase tracking-wider">
          <Skeleton className="h-3 w-44 rounded bg-[#DE8E5C]/30" />
        </div>
        <Skeleton className="h-8 sm:h-9 w-36 sm:w-48 rounded-xl" />
        <div className="space-y-1.5 pt-1">
          <Skeleton className="h-3.5 w-full max-w-lg rounded" />
        </div>
      </div>

      {/* Syllabus Units Section */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#77736C] dark:text-gray-400">
          <Skeleton className="h-3.5 w-32 rounded" />
        </h2>

        {/* 5 Units (matching the 5 default units) */}
        <div className="flex flex-col gap-4">
          {[
            { titleW: 'w-36 sm:w-44', noteCount: 1, noteW: 'w-24 sm:w-32' },
            { titleW: 'w-40 sm:w-48', noteCount: 1, noteW: 'w-28 sm:w-36' },
            { titleW: 'w-36 sm:w-40', noteCount: 2, noteW: 'w-32 sm:w-40' },
            { titleW: 'w-44 sm:w-52', noteCount: 1, noteW: 'w-28 sm:w-36' },
            { titleW: 'w-36 sm:w-44', noteCount: 1, noteW: 'w-24 sm:w-32' },
          ].map((unit, idx) => (
            <div
              key={idx}
              className="w-full p-5 sm:p-6 bg-[#FAF9F6] dark:bg-[#1A1A1A] border border-[#E3DED5] dark:border-neutral-800 rounded-2xl space-y-3 shadow-sm"
            >
              <div>
                <Skeleton className={`h-6 ${unit.titleW} rounded-lg`} />
              </div>

              {/* Inner note pill row */}
              <div className="pt-3 border-t border-[#E3DED5] dark:border-neutral-800/80 flex flex-col gap-2">
                {Array.from({ length: unit.noteCount }).map((_, nIdx) => (
                  <div
                    key={nIdx}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#EEEAE3] dark:bg-neutral-900 border border-[#E3DED5] dark:border-neutral-800"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded bg-[#DE8E5C]/20 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-2.5 h-2.5 text-[#DE8E5C]/60" />
                      </div>
                      <Skeleton className={`h-3.5 ${unit.noteW} rounded`} />
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-[#77736C]/40 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

/**
 * Notes Reader Page Skeleton (A4 Paper Layout with Floating Toolbar & Document Skeletons)
 */
export const NotesReaderSkeleton = () => (
  <div className="min-h-screen bg-[#EFECE6] dark:bg-[#0F0F0F] py-6 sm:py-8 transition-colors">
    {/* Floating Top Controls Toolbar Skeleton */}
    <div className="sticky top-4 z-30 max-w-4xl mx-auto px-4 mb-6">
      <div className="bg-white/95 dark:bg-[#1E1E1E]/95 backdrop-blur-md rounded-2xl border border-[#E3DED5] dark:border-neutral-800 p-3 shadow-lg flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 rounded-xl" />
          <Skeleton className="h-5 w-32 hidden sm:block rounded" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20 rounded-xl" />
          <Skeleton className="h-8 w-8 rounded-xl" />
          <Skeleton className="h-8 w-8 rounded-xl" />
        </div>
      </div>
    </div>

    {/* Realistic A4 Document Surface */}
    <div className="max-w-[820px] mx-auto px-4">
      <div className="a4-page-surface bg-white dark:bg-[#1A1A1A] p-8 sm:p-14 rounded-2xl border border-[#E3DED5] dark:border-neutral-800 shadow-xl space-y-6">
        {/* Document Header Skeleton */}
        <div className="pb-4 border-b border-[#E3DED5] dark:border-neutral-800 flex items-center justify-between">
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
        </div>

        {/* Tag & Main Heading Skeleton */}
        <Skeleton className="h-6 w-36 rounded-full" />
        <Skeleton className="h-8 w-4/5 rounded-xl" />

        {/* Lead Intro Paragraph */}
        <div className="space-y-2 py-2">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-2/3 rounded" />
        </div>

        {/* Highlight Callout Block */}
        <div className="p-5 rounded-xl border border-brand-200 dark:border-neutral-800 bg-brand-50/50 dark:bg-neutral-900/50 space-y-2">
          <Skeleton className="h-4 w-28 rounded" />
          <Skeleton className="h-3.5 w-full rounded" />
          <Skeleton className="h-3.5 w-4/5 rounded" />
        </div>

        {/* Subheading */}
        <Skeleton className="h-6 w-1/2 rounded-lg mt-4" />

        {/* 2-Column Responsive Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl border border-[#E3DED5] dark:border-neutral-800 space-y-2">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-3 w-full rounded" />
            <Skeleton className="h-3 w-3/4 rounded" />
          </div>
          <div className="p-4 rounded-xl border border-[#E3DED5] dark:border-neutral-800 space-y-2">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-3 w-full rounded" />
            <Skeleton className="h-3 w-3/4 rounded" />
          </div>
        </div>

        {/* More Paragraph lines */}
        <div className="space-y-2.5 pt-4">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-5/6 rounded" />
        </div>

        {/* Document Footer Watermark Skeleton */}
        <div className="pt-8 mt-12 border-t border-[#E3DED5] dark:border-neutral-800 flex items-center justify-between">
          <Skeleton className="h-4 w-40 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
        </div>
      </div>
    </div>
  </div>
);

/**
 * Library Page Skeleton (Stats cards & notes list)
 */
export const LibrarySkeleton = () => (
  <div className="min-h-screen bg-[#F5F3EF] dark:bg-[#141414] py-8 sm:py-10 transition-colors">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <Skeleton className="h-4 w-80 rounded" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="p-5 rounded-2xl bg-white dark:bg-[#1E1E1E] border border-[#E3DED5] dark:border-neutral-800 space-y-2"
          >
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-7 w-16 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div
            key={n}
            className="p-6 rounded-3xl bg-white dark:bg-[#1E1E1E] border border-[#E3DED5] dark:border-neutral-800 space-y-4"
          >
            <Skeleton className="h-5 w-20 rounded" />
            <Skeleton className="h-6 w-4/5 rounded-md" />
            <Skeleton className="h-4 w-1/2 rounded" />
            <div className="pt-4 border-t border-[#E3DED5] dark:border-neutral-800 flex justify-between items-center">
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-9 w-28 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/**
 * Wishlist Page Skeleton
 */
export const WishlistSkeleton = () => (
  <div className="min-h-screen bg-[#F5F3EF] dark:bg-[#141414] py-8 sm:py-10 transition-colors">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-44 rounded-xl" />
        <Skeleton className="h-4 w-72 rounded" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="p-6 rounded-3xl bg-white dark:bg-[#1E1E1E] border border-[#E3DED5] dark:border-neutral-800 space-y-4"
          >
            <div className="flex justify-between items-start">
              <Skeleton className="h-5 w-20 rounded" />
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>
            <Skeleton className="h-6 w-4/5 rounded-md" />
            <Skeleton className="h-4 w-1/2 rounded" />
            <div className="pt-4 border-t border-[#E3DED5] dark:border-neutral-800 flex justify-between items-center">
              <Skeleton className="h-6 w-20 rounded" />
              <Skeleton className="h-9 w-24 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/**
 * Search Page Skeleton
 */
export const SearchSkeleton = () => (
  <div className="space-y-8 animate-in fade-in">
    {/* Subjects Section */}
    <div className="space-y-3">
      <Skeleton className="h-4 w-28 rounded" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((n) => (
          <div
            key={n}
            className="p-5 rounded-2xl bg-white dark:bg-[#202020] border border-gray-200 dark:border-neutral-800 flex items-center justify-between"
          >
            <div className="space-y-2">
              <Skeleton className="h-4 w-16 rounded" />
              <Skeleton className="h-5 w-40 rounded" />
              <Skeleton className="h-3.5 w-32 rounded" />
            </div>
            <Skeleton className="h-9 w-20 rounded-xl" />
          </div>
        ))}
      </div>
    </div>

    {/* Notes Section */}
    <div className="space-y-3">
      <Skeleton className="h-4 w-24 rounded" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((n) => (
          <div
            key={n}
            className="p-5 rounded-2xl bg-white dark:bg-[#202020] border border-gray-200 dark:border-neutral-800 flex items-center justify-between"
          >
            <div className="space-y-2">
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-5 w-48 rounded" />
              <Skeleton className="h-3.5 w-36 rounded" />
            </div>
            <Skeleton className="h-9 w-20 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

/**
 * Orders Table / Rows Skeleton (For Profile Page Purchases Tab)
 */
export const OrdersSkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3].map((n) => (
      <div
        key={n}
        className="p-4 sm:p-5 rounded-2xl bg-[#FAF9F6] dark:bg-neutral-900 border border-[#E3DED5] dark:border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
      >
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-28 rounded font-mono" />
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
          <Skeleton className="h-5 w-48 sm:w-64 rounded" />
          <Skeleton className="h-3.5 w-32 rounded" />
        </div>
        <div className="flex items-center gap-4 sm:flex-col sm:items-end w-full sm:w-auto justify-between">
          <Skeleton className="h-6 w-20 rounded" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      </div>
    ))}
  </div>
);
