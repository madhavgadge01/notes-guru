import React from 'react';

const LoadingSpinner = ({ text = 'Loading GenZNotes...', size = 'md' }) => {
  const sizeMap = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <div
        className={`${sizeMap[size] || sizeMap.md} rounded-full border-brand-200 border-t-brand-500 animate-spin`}
      />
      {text && <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
