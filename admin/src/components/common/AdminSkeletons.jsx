import React from 'react';

/**
 * Basic Shimmer Box
 */
export const Skeleton = ({ className = '' }) => (
  <div className={`skeleton-shimmer rounded-xl ${className}`} />
);

/**
 * Action Button Spinner
 */
export const ButtonSpinner = ({ className = 'w-3.5 h-3.5' }) => (
  <svg
    className={`animate-spin text-current ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

/**
 * Realistic Table Skeleton for AcademicStructure, Orders, Users, Notes
 */
export const TableSkeleton = ({
  rows = 5,
  cols = 5,
  colWidths = ['w-40', 'w-24', 'w-20', 'w-20', 'w-24'],
}) => (
  <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden shadow-sm animate-pulse-subtle">
    {/* Table Header */}
    <div className="px-4 py-3 bg-gray-50 dark:bg-neutral-900/60 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between">
      <Skeleton className="h-4 w-32 rounded" />
      <Skeleton className="h-4 w-20 rounded" />
    </div>

    {/* Table Rows */}
    <div className="divide-y divide-gray-100 dark:divide-neutral-800/60">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="px-4 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className={`h-4 ${colWidths[0] || 'w-36'} rounded`} />
            {cols > 1 && (
              <Skeleton className={`h-3.5 ${colWidths[1] || 'w-24'} rounded hidden sm:block`} />
            )}
            {cols > 2 && (
              <Skeleton className={`h-3.5 ${colWidths[2] || 'w-20'} rounded hidden md:block`} />
            )}
            {cols > 3 && (
              <Skeleton className={`h-3.5 ${colWidths[3] || 'w-16'} rounded hidden lg:block`} />
            )}
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-12 rounded-lg" />
            <Skeleton className="h-7 w-7 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

/**
 * Card Grid Skeleton (Colleges & Courses Main View)
 */
export const CardGridSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
    {Array.from({ length: count }).map((_, idx) => (
      <div
        key={idx}
        className="bg-white dark:bg-[#1E1E1E] p-5 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-sm space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-3 w-16 rounded" />
            </div>
          </div>
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>

        <div className="space-y-2 pt-1">
          <Skeleton className="h-3 w-full rounded" />
          <Skeleton className="h-3 w-3/4 rounded" />
        </div>

        <div className="pt-3 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between">
          <Skeleton className="h-4 w-20 rounded" />
          <div className="flex items-center gap-2">
            <Skeleton className="w-7 h-7 rounded-lg" />
            <Skeleton className="w-7 h-7 rounded-lg" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

/**
 * Dashboard Stats Metric Cards Skeleton
 */
export const DashboardStatsSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: 4 }).map((_, idx) => (
      <div
        key={idx}
        className="p-5 rounded-2xl bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-neutral-800 space-y-3 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <Skeleton className="h-3.5 w-24 rounded" />
          <Skeleton className="w-8 h-8 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-28 rounded-lg" />
        <Skeleton className="h-3 w-36 rounded" />
      </div>
    ))}
  </div>
);

/**
 * Pricing Control Center Skeletons
 */
export const PricingSkeleton = () => (
  <div className="space-y-6">
    {/* Package Card Skeleton */}
    <div className="p-6 rounded-2xl bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
      <div className="space-y-2">
        <Skeleton className="h-3 w-32 rounded" />
        <Skeleton className="h-6 w-48 rounded-lg" />
        <Skeleton className="h-3 w-64 rounded" />
      </div>
      <div className="space-y-1">
        <Skeleton className="h-3 w-20 rounded" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>

    {/* Table Skeleton */}
    <TableSkeleton
      rows={4}
      cols={4}
      colWidths={['w-48', 'w-24', 'w-24', 'w-24']}
    />
  </div>
);
