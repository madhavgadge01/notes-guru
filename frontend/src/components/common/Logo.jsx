import React from 'react';

const Logo = ({ className = 'w-8 h-8', showText = true, textClass = 'text-xl' }) => {
  return (
    <div className="flex items-center gap-2.5 group select-none">
      <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-sunset-red via-coral-500 to-brand-500 shadow-sunset p-2 ${className}`}>
        {/* Academic Open Book & Star Icon */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full text-white"
        >
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
          <path d="M6 6h10" />
          <path d="M6 10h7" />
          <path d="m18 8 1 2 2 .5-1.5 1.5.5 2-2-1-2 1 .5-2L15 10.5l2-.5z" fill="currentColor" stroke="none" />
        </svg>
      </div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-black tracking-tight text-gray-900 dark:text-white ${textClass}`}>
            GenZ<span className="text-brand-500 ml-0.5">Notes</span>
          </span>
          <span className="text-[9px] font-medium tracking-wider text-gray-500 dark:text-gray-400 uppercase mt-0.5">
            Exam Ready
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
