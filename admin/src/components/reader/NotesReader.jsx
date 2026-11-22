import React, { useState, useEffect, useRef } from 'react';
import {
  Maximize2,
  Minimize2,
  Lock,
  Sparkles,
  BookOpen,
  ZoomIn,
  ZoomOut,
  Moon,
  Sun,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Check,
  ArrowRight
} from 'lucide-react';
import '../../styles/reader.css';

const NotesReader = ({
  note = {},
  pages = [],
  entitlement = {},
  watermark = null,
  purchasePricing = null,
  initialPage = 1,
  onPageChange = null,
  onUnlock = null,
  isAdminPreview = true,
}) => {
  const [readerTheme, setReaderTheme] = useState(() => {
    return localStorage.getItem('notesguru_reader_theme') || 'dark';
  });

  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activePageNum, setActivePageNum] = useState(initialPage || 1);
  const [copyWarning, setCopyWarning] = useState(false);

  const containerRef = useRef(null);
  const pagesContainerRef = useRef(null);

  const totalPages = pages.length || 1;
  const isEntitled = true; // In admin preview, all pages are viewable

  const toggleReaderTheme = () => {
    const nextTheme = readerTheme === 'dark' ? 'light' : 'dark';
    setReaderTheme(nextTheme);
    localStorage.setItem('notesguru_reader_theme', nextTheme);
  };

  const handleToggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {
          setIsFullscreen(true);
        });
      } else {
        setIsFullscreen(true);
      }
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
          }
          setIsFullscreen(false);
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

  const isLight = readerTheme === 'light';

  return (
    <div
      ref={containerRef}
      className={`notes-reader-container select-none relative flex flex-col ${
        isFullscreen
          ? 'fixed inset-0 z-[9999] w-screen h-screen overflow-hidden'
          : 'w-full rounded-2xl overflow-hidden border border-gray-200 dark:border-neutral-800'
      } ${
        isLight
          ? 'bg-[#F2EFE9] text-[#1F2937]'
          : 'bg-[#121212] text-[#EDEDED]'
      }`}
    >
      {/* Top Toolbar */}
      <div
        className={`flex items-center justify-between px-4 py-3 border-b text-xs font-semibold z-30 transition-colors ${
          isLight
            ? 'bg-white/95 border-gray-200 text-gray-800'
            : 'bg-[#181818]/95 border-neutral-800 text-gray-200'
        }`}
      >
        <div className="flex items-center gap-3 truncate max-w-sm">
          <BookOpen className="w-4 h-4 text-brand-500 flex-shrink-0" />
          <div className="truncate">
            <h2 className="font-bold truncate text-xs sm:text-sm">
              {note.title || 'Academic Notes'} (Admin Live Preview)
            </h2>
            <div className="text-[11px] text-gray-400 font-normal">
              {totalPages} Pages • Vertical Document Reader
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom */}
          <div
            className={`hidden sm:flex items-center rounded-xl p-0.5 border ${
              isLight ? 'bg-gray-100 border-gray-200' : 'bg-neutral-800 border-neutral-700'
            }`}
          >
            <button
              onClick={() => setZoomLevel((prev) => Math.max(80, prev - 10))}
              disabled={zoomLevel <= 80}
              className="p-1.5 hover:text-brand-500 disabled:opacity-30 rounded-lg transition"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(100)}
              className="px-2 text-[10px] font-mono hover:text-brand-500 font-bold"
            >
              {zoomLevel}%
            </button>
            <button
              onClick={() => setZoomLevel((prev) => Math.min(140, prev + 10))}
              disabled={zoomLevel >= 140}
              className="p-1.5 hover:text-brand-500 disabled:opacity-30 rounded-lg transition"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleReaderTheme}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
              isLight
                ? 'bg-gray-100 border-gray-200 hover:bg-gray-200 text-gray-800'
                : 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700 text-amber-300'
            }`}
          >
            {isLight ? (
              <>
                <Moon className="w-3.5 h-3.5 text-gray-600" />
                <span className="hidden sm:inline">Dark</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Light</span>
              </>
            )}
          </button>

          {/* Fullscreen */}
          <button
            onClick={handleToggleFullscreen}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition bg-neutral-800 border-neutral-700 hover:bg-neutral-700 text-gray-200"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Exit (Esc)' : 'Fullscreen'}</span>
          </button>
        </div>
      </div>

      {/* Pages Container */}
      <div
        ref={pagesContainerRef}
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-8 space-y-8"
      >
        <div
          className="mx-auto space-y-10"
          style={{
            maxWidth: `${Math.round(820 * (zoomLevel / 100))}px`,
          }}
        >
          {pages.map((page) => (
            <div
              key={page._id || page.pageNumber}
              className={`a4-document-page relative rounded-xl p-8 sm:p-12 min-h-[1050px] shadow-sm border transition-colors flex flex-col justify-between ${
                isLight
                  ? 'bg-white border-gray-200/80 shadow-gray-200/50'
                  : 'bg-[#1C1C1C] border-[#2A2A2A] shadow-black/40'
              }`}
            >
              {/* Header */}
              <div
                className={`page-header border-b pb-3 mb-6 flex items-center justify-between text-[11px] font-mono tracking-wider uppercase ${
                  isLight ? 'border-gray-200 text-gray-400' : 'border-neutral-800 text-neutral-500'
                }`}
              >
                <span className="truncate max-w-sm">{note.title || 'GenZNotes'}</span>
                <span>Admin Document Preview</span>
              </div>

              {/* Content */}
              <div className="flex-1">
                <div
                  className="reader-content prose-academic leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: page.contentHtml || '<p>No content for this page.</p>' }}
                />
              </div>

              {/* Footer */}
              <div
                className={`page-footer border-t pt-4 mt-8 flex items-center justify-between text-[11px] font-mono ${
                  isLight ? 'border-gray-200 text-gray-400' : 'border-neutral-800 text-neutral-500'
                }`}
              >
                <span>GenZNotes • Admin Mode</span>
                <span className="font-bold">
                  Page {page.pageNumber} of {totalPages}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotesReader;
