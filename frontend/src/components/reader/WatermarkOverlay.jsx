import React from 'react';

/**
 * WatermarkOverlay
 * 
 * Minimal, professional academic watermark.
 * Features a single, large, extremely subtle GenZNotes insignia
 * centered behind the document content at ~2-3% opacity.
 * Does not obstruct or distract from text, diagrams, formulas, or tables.
 */
const WatermarkOverlay = ({ isLight = true }) => {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0"
      aria-hidden="true"
    >
      <div
        className="w-72 h-72 sm:w-96 sm:h-96 flex flex-col items-center justify-center transition-opacity"
        style={{
          opacity: isLight ? 0.025 : 0.022,
          color: isLight ? '#171717' : '#FFFFFF',
        }}
      >
        <svg
          viewBox="0 0 200 200"
          fill="none"
          stroke="currentColor"
          className="w-full h-full"
        >
          {/* Subtle Outer Concentric Academic Seal */}
          <circle
            cx="100"
            cy="100"
            r="92"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
          <circle
            cx="100"
            cy="100"
            r="84"
            strokeWidth="1"
          />

          {/* Academic Open Book Emblem */}
          <g transform="translate(60, 48) scale(3.3)">
            <path
              d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6 6h10"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M6 10h7"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {/* Academic Star Insignia */}
            <path
              d="m18 8 1 2 2 .5-1.5 1.5.5 2-2-1-2 1 .5-2L15 10.5l2-.5z"
              fill="currentColor"
              stroke="none"
            />
          </g>

          {/* Muted Academic Wordmark within Seal */}
          <text
            x="100"
            y="152"
            textAnchor="middle"
            fill="currentColor"
            stroke="none"
            fontSize="11"
            fontWeight="800"
            letterSpacing="0.25em"
            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          >
            GENZNOTES
          </text>
          <text
            x="100"
            y="166"
            textAnchor="middle"
            fill="currentColor"
            stroke="none"
            fontSize="7"
            fontWeight="600"
            letterSpacing="0.2em"
            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          >
            OFFICIAL ACADEMIC REPOSITORY
          </text>
        </svg>
      </div>
    </div>
  );
};

export default React.memo(WatermarkOverlay);
