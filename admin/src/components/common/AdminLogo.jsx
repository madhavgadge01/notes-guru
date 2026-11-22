import React from 'react';

const AdminLogo = () => {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sunset-red via-coral-500 to-brand-500 flex items-center justify-center shadow-sunset p-2 text-white">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full"
        >
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
          <path d="M6 6h10" />
          <path d="M6 10h7" />
          <path d="m18 8 1 2 2 .5-1.5 1.5.5 2-2-1-2 1 .5-2L15 10.5l2-.5z" fill="currentColor" stroke="none" />
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <span className="font-black text-lg tracking-tight text-gray-900 dark:text-white">
          GenZ<span className="text-brand-500">Notes</span>
        </span>
        <span className="text-[10px] font-bold text-coral-600 dark:text-brand-400 uppercase tracking-widest mt-0.5">
          Admin Portal
        </span>
      </div>
    </div>
  );
};

export default AdminLogo;
