import React, { useState, useEffect, useRef } from 'react';
import {
  Maximize2,
  Lock,
  BookOpen,
  Moon,
  Sun,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
  Hand,
  Highlighter,
  PenTool,
  RotateCcw,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import WatermarkOverlay from './WatermarkOverlay';
import {
  getStoredAnnotations,
  saveStoredAnnotations,
  clearStoredAnnotations,
} from '../../utils/annotationStorage';
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
  isAdminPreview = false,
}) => {
  const { user } = useAuth();

  // Theme state: light (default) | dark
  const [readerTheme, setReaderTheme] = useState(() => {
    return localStorage.getItem('notesguru_reader_theme') || 'light';
  });

  // Hold-to-Read state (persistent across sessions via localStorage)
  const [holdToReadEnabled, setHoldToReadEnabled] = useState(() => {
    return localStorage.getItem('notesguru_reader_hold_to_read') === 'true';
  });
  const [isHolding, setIsHolding] = useState(false);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activePageNum, setActivePageNum] = useState(initialPage || 1);
  const [selectedPurchaseTier, setSelectedPurchaseTier] = useState('note');

  // Annotation Tools state: null | 'highlighter' | 'marker'
  const [activeTool, setActiveTool] = useState(null);
  const [highlights, setHighlights] = useState({}); // { [pageNumber]: [ strokes ] }
  const [drawings, setDrawings] = useState({}); // { [pageNumber]: [ strokes ] }
  const [markerOpacity, setMarkerOpacity] = useState(1);
  const [clearFeedback, setClearFeedback] = useState(false);

  const containerRef = useRef(null);
  const pagesContainerRef = useRef(null);
  const highlightCanvasRefs = useRef({});
  const markerCanvasRefs = useRef({});
  const isDrawingRef = useRef(false);
  const drawingPageRef = useRef(null);
  const currentStrokeRef = useRef([]);
  const strokeStartXRef = useRef(0);
  const strokeStartYRef = useRef(0);
  const currentDraftRectRef = useRef(null);
  const inactivityTimerRef = useRef(null);
  const fadeTimerRef = useRef(null);

  const highlightsRef = useRef(highlights);
  const drawingsRef = useRef(drawings);

  useEffect(() => {
    highlightsRef.current = highlights;
  }, [highlights]);

  useEffect(() => {
    drawingsRef.current = drawings;
  }, [drawings]);

  const totalPages = pages.length || 1;
  const isEntitled = isAdminPreview || !!entitlement?.isEntitled;

  // Toggle reader theme
  const toggleReaderTheme = () => {
    const nextTheme = readerTheme === 'dark' ? 'light' : 'dark';
    setReaderTheme(nextTheme);
    localStorage.setItem('notesguru_reader_theme', nextTheme);
  };

  // Toggle Hold-to-Read setting
  const toggleHoldToRead = () => {
    setHoldToReadEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('notesguru_reader_hold_to_read', String(next));
      if (!next) {
        setIsHolding(false);
      }
      return next;
    });
  };

  // Pointer and Touch handlers for Hold-to-Read
  const handlePointerDown = (e) => {
    if (!holdToReadEnabled) return;
    if (activeTool) return; // Do not interfere when using annotation tools
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    setIsHolding(true);
  };

  const handlePointerUp = () => {
    if (!holdToReadEnabled) return;
    if (activeTool) return;
    setIsHolding(false);
  };

  const handlePointerCancel = () => {
    if (!holdToReadEnabled) return;
    if (activeTool) return;
    setIsHolding(false);
  };

  // -------------------------------------------------------------
  // ANNOTATION LOGIC: Non-Stacking Flat Highlighter & Glow Marker
  // -------------------------------------------------------------

  // Draw a single flat, straight highlighter rectangle (Chisel-tip look, NO dots, NO circles)
  const drawHighlightBar = (ctx, rect, isLightMode) => {
    if (!rect) return;
    // Support legacy array of points gracefully
    if (Array.isArray(rect)) {
      if (rect.length === 0) return;
      const minX = Math.min(...rect.map((p) => p.x));
      const maxX = Math.max(...rect.map((p) => p.x));
      const avgY = rect.reduce((acc, p) => acc + p.y, 0) / rect.length;
      rect = {
        x: minX,
        y: avgY - 10,
        w: Math.max(maxX - minX, 16),
        h: 20,
      };
    }

    const { x, y, w, h } = rect;
    if (w <= 0 || h <= 0) return;

    ctx.save();
    // Solid fill inside canvas so overlapping never stacks or turns dark
    ctx.fillStyle = isLightMode ? '#FACC15' : '#FBBF24';
    const r = 3; // Clean 3px rounded corner for chisel-tip line
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  // Redraw all highlight bars on a canvas context
  const redrawAllPageHighlights = (ctx, rects, isLightMode, activeDraft = null) => {
    if (!ctx || !ctx.canvas) return;
    const canvas = ctx.canvas;
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    if (Array.isArray(rects)) {
      rects.forEach((rect) => drawHighlightBar(ctx, rect, isLightMode));
    }
    if (activeDraft) {
      drawHighlightBar(ctx, activeDraft, isLightMode);
    }
  };

  // Render Red & White Glow Marker Single Dot
  const renderMarkerDot = (ctx, pt) => {
    ctx.save();
    ctx.shadowColor = 'rgba(239, 68, 68, 0.95)';
    ctx.shadowBlur = 10;
    ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 2.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 1.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  // Render Red & White Glow Marker Line Segment
  const renderMarkerSegment = (ctx, p1, p2) => {
    // Pass 1: Red Glow Aura
    ctx.save();
    ctx.shadowColor = 'rgba(239, 68, 68, 0.95)';
    ctx.shadowBlur = 10;
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
    ctx.lineWidth = 3.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();

    // Pass 2: Thin White Center Core
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
    ctx.restore();
  };

  // Redraw all marker strokes on a canvas context
  const redrawAllMarkerStrokes = (ctx, strokes) => {
    if (!Array.isArray(strokes) || strokes.length === 0) return;
    strokes.forEach((stroke) => {
      if (!Array.isArray(stroke) || stroke.length === 0) return;
      if (stroke.length === 1) {
        renderMarkerDot(ctx, stroke[0]);
      } else {
        for (let i = 0; i < stroke.length - 1; i++) {
          renderMarkerSegment(ctx, stroke[i], stroke[i + 1]);
        }
      }
    });
  };

  // Reset inactivity timer for the red & white glow marker (25s idle fade-out)
  const resetInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
    if (fadeTimerRef.current) {
      clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
    setMarkerOpacity(1);

    inactivityTimerRef.current = setTimeout(() => {
      setMarkerOpacity(0);

      fadeTimerRef.current = setTimeout(() => {
        Object.values(markerCanvasRefs.current).forEach((canvas) => {
          if (canvas) {
            const ctx = canvas.getContext('2d');
            const dpr = window.devicePixelRatio || 1;
            ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
          }
        });
        setDrawings({});
        drawingsRef.current = {};
        if (note?._id) {
          saveStoredAnnotations(note._id, {
            highlights: highlightsRef.current,
            drawings: {},
          });
        }
        setMarkerOpacity(1);
        fadeTimerRef.current = null;
      }, 1200);
    }, 25000);
  };

  // Initialize canvas backing store size with devicePixelRatio for ultra-sharp retina strokes
  const initCanvasSize = (canvas, pageNumber, type = 'marker') => {
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const w = parent.offsetWidth;
    const h = parent.offsetHeight;
    if (w === 0 || h === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const targetW = Math.round(w * dpr);
    const targetH = Math.round(h * dpr);

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);

      if (type === 'highlight') {
        const pageHighlights = highlightsRef.current[pageNumber];
        if (pageHighlights && pageHighlights.length > 0) {
          redrawAllPageHighlights(ctx, pageHighlights, readerTheme === 'light');
        }
      } else {
        const pageDrawings = drawingsRef.current[pageNumber];
        if (pageDrawings && pageDrawings.length > 0) {
          redrawAllMarkerStrokes(ctx, pageDrawings);
        }
      }
    }
  };

  // Get local CSS coordinates relative to the canvas
  const getCanvasPoint = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  // Canvas pointer down handler
  const handleCanvasPointerDown = (e, pageNumber) => {
    if (!activeTool) return;

    // A. HIGHLIGHTER TOOL (Flat horizontal chisel-tip line, NO dots, NO circles)
    if (activeTool === 'highlighter') {
      const canvas = highlightCanvasRefs.current[pageNumber];
      if (!canvas) return;

      try {
        e.target.setPointerCapture(e.pointerId);
      } catch {}

      isDrawingRef.current = true;
      drawingPageRef.current = pageNumber;

      const pt = getCanvasPoint(e, canvas);
      strokeStartXRef.current = pt.x;
      strokeStartYRef.current = pt.y;

      currentDraftRectRef.current = {
        x: pt.x - 2,
        y: pt.y - 10,
        w: 12,
        h: 20,
      };

      const ctx = canvas.getContext('2d');
      const pageHighlights = highlightsRef.current[pageNumber] || [];
      redrawAllPageHighlights(ctx, pageHighlights, readerTheme === 'light', currentDraftRectRef.current);
      return;
    }

    // B. GLOW MARKER TOOL
    const canvas = markerCanvasRefs.current[pageNumber];
    if (!canvas) return;

    try {
      e.target.setPointerCapture(e.pointerId);
    } catch {}

    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
    if (fadeTimerRef.current) {
      clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
    setMarkerOpacity(1);

    isDrawingRef.current = true;
    drawingPageRef.current = pageNumber;

    const pt = getCanvasPoint(e, canvas);
    currentStrokeRef.current = [pt];

    const ctx = canvas.getContext('2d');
    renderMarkerDot(ctx, pt);
  };

  // Canvas pointer move handler
  const handleCanvasPointerMove = (e, pageNumber) => {
    if (!isDrawingRef.current || drawingPageRef.current !== pageNumber) return;

    // A. HIGHLIGHTER TOOL (Draws clean straight line/rectangle as you drag)
    if (activeTool === 'highlighter') {
      const canvas = highlightCanvasRefs.current[pageNumber];
      if (!canvas) return;

      const pt = getCanvasPoint(e, canvas);
      let startX = strokeStartXRef.current;
      let lineY = strokeStartYRef.current;

      // Multi-line dragging: If user drags down to the next line by > 18px
      if (Math.abs(pt.y - lineY) > 18) {
        if (currentDraftRectRef.current && currentDraftRectRef.current.w > 8) {
          const committed = { ...currentDraftRectRef.current };
          const prevList = highlightsRef.current[pageNumber] || [];
          const updatedList = [...prevList, committed];
          highlightsRef.current = { ...highlightsRef.current, [pageNumber]: updatedList };
          setHighlights(highlightsRef.current);
        }
        strokeStartXRef.current = pt.x;
        strokeStartYRef.current = pt.y;
        startX = pt.x;
        lineY = pt.y;
      }

      const minX = Math.min(startX, pt.x);
      const width = Math.max(Math.abs(pt.x - startX), 10);

      currentDraftRectRef.current = {
        x: minX,
        y: lineY - 10,
        w: width,
        h: 20,
      };

      const ctx = canvas.getContext('2d');
      const pageHighlights = highlightsRef.current[pageNumber] || [];
      redrawAllPageHighlights(ctx, pageHighlights, readerTheme === 'light', currentDraftRectRef.current);
      return;
    }

    // B. GLOW MARKER TOOL
    const canvas = markerCanvasRefs.current[pageNumber];
    if (!canvas) return;

    const pt = getCanvasPoint(e, canvas);
    const points = currentStrokeRef.current;
    if (points.length === 0) return;
    const prevPt = points[points.length - 1];

    const dist = Math.hypot(pt.x - prevPt.x, pt.y - prevPt.y);
    if (dist < 2.5) return;

    points.push(pt);

    const ctx = canvas.getContext('2d');
    renderMarkerSegment(ctx, prevPt, pt);
  };

  // Canvas pointer up handler
  const handleCanvasPointerUp = (e, pageNumber) => {
    if (!isDrawingRef.current || drawingPageRef.current !== pageNumber) return;
    isDrawingRef.current = false;
    drawingPageRef.current = null;

    try {
      e.target.releasePointerCapture(e.pointerId);
    } catch {}

    // A. HIGHLIGHTER TOOL (Commit final rectangle)
    if (activeTool === 'highlighter') {
      if (currentDraftRectRef.current && currentDraftRectRef.current.w >= 8) {
        const finalRect = { ...currentDraftRectRef.current };
        currentDraftRectRef.current = null;

        const prevHighlights = highlightsRef.current[pageNumber] || [];
        const nextHighlights = [...prevHighlights, finalRect];
        const allHighlights = { ...highlightsRef.current, [pageNumber]: nextHighlights };
        highlightsRef.current = allHighlights;
        setHighlights(allHighlights);

        const canvas = highlightCanvasRefs.current[pageNumber];
        if (canvas) {
          const ctx = canvas.getContext('2d');
          redrawAllPageHighlights(ctx, nextHighlights, readerTheme === 'light');
        }

        saveStoredAnnotations(note?._id, {
          highlights: allHighlights,
          drawings: drawingsRef.current,
        });
      }
      return;
    }

    // B. GLOW MARKER TOOL
    const finishedStroke = [...currentStrokeRef.current];
    currentStrokeRef.current = [];

    if (finishedStroke.length > 0) {
      setDrawings((prev) => {
        const pageStrokes = prev[pageNumber] ? [...prev[pageNumber], finishedStroke] : [finishedStroke];
        const nextDrawings = { ...prev, [pageNumber]: pageStrokes };
        drawingsRef.current = nextDrawings;
        saveStoredAnnotations(note?._id, {
          highlights: highlightsRef.current,
          drawings: nextDrawings,
        });
        return nextDrawings;
      });

      resetInactivityTimer();
    }
  };

  // Clear all annotations (Option 3)
  const handleClearAnnotations = () => {
    const dpr = window.devicePixelRatio || 1;

    // 1. Clear all highlight canvases
    Object.values(highlightCanvasRefs.current).forEach((canvas) => {
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      }
    });

    // 2. Clear all marker canvases
    Object.values(markerCanvasRefs.current).forEach((canvas) => {
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      }
    });

    // 3. Clear timers
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
    if (fadeTimerRef.current) {
      clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
    setMarkerOpacity(1);

    // 4. Reset states & refs
    setHighlights({});
    setDrawings({});
    highlightsRef.current = {};
    drawingsRef.current = {};

    // 5. Delete from client-side storage
    if (note?._id) {
      clearStoredAnnotations(note._id);
    }

    // 6. Visual feedback
    setClearFeedback(true);
    setTimeout(() => setClearFeedback(false), 1200);
  };

  // Toggle tool (Highlighter or Marker)
  const toggleTool = (toolName) => {
    setActiveTool((prev) => {
      if (prev === toolName) {
        return null; // Exit tool mode back to normal scrolling
      }
      if (toolName === 'marker') {
        setMarkerOpacity(1);
      }
      return toolName;
    });
  };

  // Load stored annotations when note changes
  useEffect(() => {
    if (!note?._id) return;

    let isMounted = true;
    getStoredAnnotations(note._id).then((stored) => {
      if (!isMounted) return;

      const loadedHighlights = stored.highlights && typeof stored.highlights === 'object' && !Array.isArray(stored.highlights)
        ? stored.highlights
        : {};
      const loadedDrawings = stored.drawings && typeof stored.drawings === 'object'
        ? stored.drawings
        : {};

      setHighlights(loadedHighlights);
      highlightsRef.current = loadedHighlights;
      setDrawings(loadedDrawings);
      drawingsRef.current = loadedDrawings;

      setTimeout(() => {
        // Redraw highlights
        Object.entries(loadedHighlights).forEach(([pageNum, strokes]) => {
          const canvas = highlightCanvasRefs.current[pageNum];
          if (canvas) {
            initCanvasSize(canvas, pageNum, 'highlight');
          }
        });

        // Redraw marker drawings
        Object.entries(loadedDrawings).forEach(([pageNum, strokes]) => {
          const canvas = markerCanvasRefs.current[pageNum];
          if (canvas) {
            initCanvasSize(canvas, pageNum, 'marker');
          }
        });
      }, 150);

      if (Object.keys(loadedDrawings).length > 0) {
        resetInactivityTimer();
      }
    });

    return () => {
      isMounted = false;
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      if (fadeTimerRef.current) {
        clearTimeout(fadeTimerRef.current);
      }
    };
  }, [note?._id, pages]);

  // Redraw highlights when theme toggles (light/dark multiply mode)
  useEffect(() => {
    const isLightMode = readerTheme === 'light';
    Object.entries(highlightCanvasRefs.current).forEach(([pageNum, canvas]) => {
      if (canvas) {
        const ctx = canvas.getContext('2d');
        const pageHighlights = highlightsRef.current[pageNum];
        if (pageHighlights && pageHighlights.length > 0) {
          redrawAllPageHighlights(ctx, pageHighlights, isLightMode);
        }
      }
    });
  }, [readerTheme]);

  // Window resize handler to keep canvases properly scaled
  useEffect(() => {
    const handleResize = () => {
      Object.entries(highlightCanvasRefs.current).forEach(([pageNum, canvas]) => {
        if (canvas) {
          initCanvasSize(canvas, pageNum, 'highlight');
        }
      });
      Object.entries(markerCanvasRefs.current).forEach(([pageNum, canvas]) => {
        if (canvas) {
          initCanvasSize(canvas, pageNum, 'marker');
        }
      });
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Fullscreen management: Request native fullscreen on container
  const handleToggleFullscreen = () => {
    if (!isFullscreen) {
      const elem = containerRef.current || document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(() => {
          setIsFullscreen(true);
        });
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else {
        setIsFullscreen(true);
      }
    } else {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
      setIsFullscreen(false);
    }
  };

  // Native fullscreenchange listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNativeFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
      setIsFullscreen(isNativeFs);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Track active page via intersection observer on vertical scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageNum = parseInt(entry.target.getAttribute('data-page-number'), 10);
            if (!isNaN(pageNum)) {
              setActivePageNum(pageNum);
              if (onPageChange) {
                onPageChange(pageNum, totalPages);
              }
            }
          }
        });
      },
      {
        root: isFullscreen ? pagesContainerRef.current : null,
        threshold: 0.3,
      }
    );

    const pageElements = document.querySelectorAll('.a4-document-page');
    pageElements.forEach((el) => observer.observe(el));

    return () => {
      pageElements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, [pages, isFullscreen, onPageChange, totalPages]);

  const isLight = readerTheme === 'light';

  // Find index of first locked page for inline purchase placement
  const firstLockedIndex = pages.findIndex((p) => !isAdminPreview && !isEntitled && p.isLocked);

  return (
    <div
      ref={containerRef}
      onCopy={(e) => { e.preventDefault(); e.stopPropagation(); }}
      onCut={(e) => { e.preventDefault(); e.stopPropagation(); }}
      onContextMenu={(e) => { e.preventDefault(); }}
      className={`notes-reader-container relative flex flex-col select-none ${
        isFullscreen
          ? 'fixed inset-0 z-[9999] w-screen h-screen overflow-hidden'
          : 'w-full rounded-2xl overflow-hidden border border-[#E3DED5] dark:border-neutral-800'
      } ${
        isLight
          ? 'bg-[#F5F3EF] text-[#242321]'
          : 'bg-[#121212] text-[#EDEDED]'
      }`}
    >
      {/* TOP TOOLBAR: VISIBLE ONLY IN NORMAL MODE (COMPLETELY HIDDEN IN FULLSCREEN) */}
      {!isFullscreen && (
        <div
          className={`flex items-center justify-between px-4 py-3 border-b text-xs font-semibold z-30 transition-colors ${
            isLight
              ? 'bg-[#FAF9F6] border-[#E3DED5] text-[#242321]'
              : 'bg-[#181818]/95 border-neutral-800 text-gray-200'
          }`}
        >
          {/* Left: Document Info */}
          <div className="flex items-center gap-3 truncate max-w-sm sm:max-w-md">
            <BookOpen className="w-4 h-4 text-[#DE8E5C] flex-shrink-0" />
            <div className="truncate">
              <h2 className="font-bold truncate text-xs sm:text-sm text-[#242321] dark:text-white">
                {note.title || 'Academic Notes'}
              </h2>
              <div className="text-[11px] text-[#77736C] dark:text-gray-400 font-normal">
                {note.type === 'quick' ? 'Exam Revision Sheet' : 'Comprehensive Notes'} • {totalPages} Pages
              </div>
            </div>
          </div>

          {/* Center: Live Page Indicator & Annotation Toolbar */}
          <div className="flex items-center gap-2">
            <div
              className={`hidden md:flex items-center px-3 py-1 rounded-full text-xs font-mono font-bold ${
                isLight ? 'bg-[#EEEAE3] text-[#242321]' : 'bg-neutral-800 text-gray-300'
              }`}
            >
              Page {activePageNum} of {totalPages}
            </div>

            {/* Compact Annotation Toolbar (Highlighter, Glow Marker, Clear) */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-[#EEEAE3] dark:bg-neutral-800/90 border border-[#E3DED5] dark:border-neutral-700 shadow-inner">
              {/* Option 1: Text Highlighter */}
              <button
                type="button"
                onClick={() => toggleTool('highlighter')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  activeTool === 'highlighter'
                    ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-500/30'
                    : isLight
                    ? 'hover:bg-[#E5E0D7] text-[#242321]'
                    : 'hover:bg-neutral-700 text-gray-200'
                }`}
                title="Text Highlighter (Drag across any line or text to highlight • Click again to exit)"
              >
                <Highlighter className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                <span className="hidden sm:inline">Highlight</span>
              </button>

              {/* Option 2: Red & White Glow Marker */}
              <button
                type="button"
                onClick={() => toggleTool('marker')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  activeTool === 'marker'
                    ? 'bg-red-600 text-white shadow-sm ring-2 ring-red-500/40'
                    : isLight
                    ? 'hover:bg-[#E5E0D7] text-[#242321]'
                    : 'hover:bg-neutral-700 text-gray-200'
                }`}
                title="Red & White Glow Marker (Click or touch & drag to draw glowing annotations • Click again to exit)"
              >
                <PenTool className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
                <span className="hidden sm:inline">Glow Pen</span>
              </button>

              {/* Option 3: Clear Annotations */}
              <button
                type="button"
                onClick={handleClearAnnotations}
                className={`flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-bold transition ${
                  clearFeedback
                    ? 'bg-emerald-600 text-white'
                    : isLight
                    ? 'hover:bg-[#E5E0D7] text-[#77736C] hover:text-red-600'
                    : 'hover:bg-neutral-700 text-neutral-400 hover:text-red-400'
                }`}
                title="Clear All Annotations"
              >
                {clearFeedback ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span className="hidden md:inline">Cleared</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Clear</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right: Minimum Controls (Hold to Read, Theme Toggle & Fullscreen Button) */}
          <div className="flex items-center gap-2">
            {/* Hold to Read Toggle */}
            <button
              type="button"
              onClick={toggleHoldToRead}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
                holdToReadEnabled
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400'
                  : isLight
                  ? 'bg-[#EEEAE3] border-[#E3DED5] hover:bg-[#E5E0D7] text-[#77736C]'
                  : 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700 text-neutral-400'
              }`}
              title="Hold to Read: Content is revealed only while pressing and holding mouse or touch"
            >
              {holdToReadEnabled ? (
                <>
                  <Eye className="w-3.5 h-3.5 text-amber-500" />
                  <span>Hold to Read: ON</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Hold to Read: OFF</span>
                </>
              )}
            </button>

            {/* Theme Toggle (Light / Dark) */}
            <button
              type="button"
              onClick={toggleReaderTheme}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
                isLight
                  ? 'bg-[#EEEAE3] border-[#E3DED5] hover:bg-[#E5E0D7] text-[#242321]'
                  : 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700 text-amber-300'
              }`}
              title={`Switch to ${isLight ? 'Dark' : 'Light'} reading mode`}
            >
              {isLight ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-[#77736C]" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Light</span>
                </>
              )}
            </button>

            {/* Enter Fullscreen Button */}
            <button
              type="button"
              onClick={handleToggleFullscreen}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[rgb(222,142,92)] hover:bg-[rgb(208,128,78)] transition shadow-sm"
              title="Full-screen PDF Reader (Distraction-Free)"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Fullscreen</span>
            </button>
          </div>
        </div>
      )}

      {/* VERTICAL SCROLLING PAGES CONTAINER */}
      {/* In Fullscreen mode: occupies 100% of screen with ZERO toolbar, ZERO controls, ZERO escape buttons */}
      <div
        ref={pagesContainerRef}
        onPointerDown={holdToReadEnabled ? handlePointerDown : undefined}
        onPointerUp={holdToReadEnabled ? handlePointerUp : undefined}
        onPointerLeave={holdToReadEnabled ? handlePointerUp : undefined}
        onPointerCancel={holdToReadEnabled ? handlePointerCancel : undefined}
        className={`flex-1 overflow-y-auto px-4 sm:px-6 py-8 space-y-8 h-full w-full ${
          isFullscreen ? 'bg-inherit' : ''
        } ${holdToReadEnabled && !activeTool ? 'select-none' : ''}`}
        style={{
          scrollBehavior: 'smooth',
          touchAction: holdToReadEnabled && !activeTool ? 'none' : 'auto',
        }}
      >
        {/* Floating Hint when Hold-to-Read is ON and user is not holding */}
        {holdToReadEnabled && (
          <div
            className={`sticky top-2 z-30 mx-auto max-w-sm pointer-events-none transition-all duration-200 ${
              isHolding ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'
            }`}
          >
            <div className="py-2 px-4 rounded-full bg-neutral-900/90 text-white border border-neutral-700 shadow-xl flex items-center justify-center gap-2 text-xs font-semibold backdrop-blur-md">
              <Hand className="w-4 h-4 text-amber-400 animate-pulse flex-shrink-0" />
              <span>Press & hold mouse or screen to reveal notes</span>
            </div>
          </div>
        )}

        <div className="mx-auto space-y-10 max-w-[820px]">
          {pages.map((page, index) => {
            const isLocked = !isAdminPreview && !isEntitled && page.isLocked;
            const isFirstLocked = firstLockedIndex !== -1 && index === firstLockedIndex;

            return (
              <React.Fragment key={page._id || page.pageNumber}>
                {/* INLINE PURCHASE SECTION: Placed right after the last preview page */}
                {isFirstLocked && (
                  <div className="my-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div
                      className={`p-6 sm:p-8 rounded-3xl border shadow-xl relative overflow-hidden ${
                        isLight
                          ? 'bg-[#FAF9F6] border-[#E3DED5] text-[#242321]'
                          : 'bg-[#1C1C1C] border-neutral-800 text-white'
                      }`}
                    >
                      <div className="relative z-10 space-y-2">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white bg-[rgb(222,142,92)] shadow-sm">
                          <Lock className="w-3.5 h-3.5" />
                          <span>End of Free Preview</span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-[#242321] dark:text-white">
                          Unlock Complete Exam Notes
                        </h3>
                        <p className="text-xs sm:text-sm text-[#77736C] dark:text-gray-300">
                          You have read all free preview pages. Get instant access to the complete notes, formulas, and solved university patterns.
                        </p>
                      </div>

                      {/* 5 CLEAR PURCHASE OPTIONS */}
                      <div className="relative z-10 mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {/* 1. Opened Note */}
                        <div
                          onClick={() => setSelectedPurchaseTier('note')}
                          className={`p-4 rounded-2xl border cursor-pointer transition relative flex flex-col justify-between ${
                            selectedPurchaseTier === 'note'
                              ? 'border-[#DE8E5C] bg-[#DE8E5C]/10 ring-2 ring-[#DE8E5C]/30'
                              : isLight
                              ? 'border-[#E3DED5] bg-[#FAF9F6] hover:border-[#D6D0C5]'
                              : 'border-neutral-800 bg-[#222222] hover:border-neutral-700'
                          }`}
                        >
                          <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[rgb(222,142,92)] text-white shadow-sm">
                            Instant Access
                          </span>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#DE8E5C] block">
                              This Note Only
                            </span>
                            <div className="font-bold text-xs mt-0.5 truncate">{note.title}</div>
                          </div>
                          <div className="mt-3 flex items-baseline justify-between">
                            <span className="text-lg font-black text-[#DE8E5C]">
                              ₹{purchasePricing?.note?.price || note.discountedPrice || note.price || 19}
                            </span>
                            <span className="text-[10px] text-[#77736C] dark:text-gray-400">All {totalPages} Pages</span>
                          </div>
                        </div>

                        {/* 2. Unit Pass */}
                        {purchasePricing?.unit && (
                          <div
                            onClick={() => setSelectedPurchaseTier('unit')}
                            className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                              selectedPurchaseTier === 'unit'
                                ? 'border-[#DE8E5C] bg-[#DE8E5C]/10 ring-2 ring-[#DE8E5C]/30'
                                : isLight
                                ? 'border-[#E3DED5] bg-[#FAF9F6] hover:border-[#D6D0C5]'
                                : 'border-neutral-800 bg-[#222222] hover:border-neutral-700'
                            }`}
                          >
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#DE8E5C] block">
                                Complete Unit Pass
                              </span>
                              <div className="font-bold text-xs mt-0.5 truncate">{purchasePricing.unit.title}</div>
                            </div>
                            <div className="mt-3 flex items-baseline justify-between">
                              <span className="text-lg font-black text-[#DE8E5C]">
                                ₹{purchasePricing.unit.price}
                              </span>
                              <span className="text-[10px] text-[#77736C] dark:text-gray-400">All Unit Notes</span>
                            </div>
                          </div>
                        )}

                        {/* 3. Block Pass */}
                        {purchasePricing?.block && (
                          <div
                            onClick={() => setSelectedPurchaseTier('block')}
                            className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                              selectedPurchaseTier === 'block'
                                ? 'border-[#DE8E5C] bg-[#DE8E5C]/10 ring-2 ring-[#DE8E5C]/30'
                                : isLight
                                ? 'border-[#E3DED5] bg-[#FAF9F6] hover:border-[#D6D0C5]'
                                : 'border-neutral-800 bg-[#222222] hover:border-neutral-700'
                            }`}
                          >
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#DE8E5C] block">
                                Complete Block Pass
                              </span>
                              <div className="font-bold text-xs mt-0.5 truncate">{purchasePricing.block.title}</div>
                            </div>
                            <div className="mt-3 flex items-baseline justify-between">
                              <span className="text-lg font-black text-[#DE8E5C]">
                                ₹{purchasePricing.block.price}
                              </span>
                              <span className="text-[10px] text-[#77736C] dark:text-gray-400">All Block Units</span>
                            </div>
                          </div>
                        )}

                        {/* 4. Complete Subject Pass */}
                        {purchasePricing?.subject && (
                          <div
                            onClick={() => setSelectedPurchaseTier('subject')}
                            className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                              selectedPurchaseTier === 'subject'
                                ? 'border-[#DE8E5C] bg-[#DE8E5C]/10 ring-2 ring-[#DE8E5C]/30'
                                : isLight
                                ? 'border-[#E3DED5] bg-[#FAF9F6] hover:border-[#D6D0C5]'
                                : 'border-neutral-800 bg-[#222222] hover:border-neutral-700'
                            }`}
                          >
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#DE8E5C] block">
                                Full Subject Pass
                              </span>
                              <div className="font-bold text-xs mt-0.5 truncate">{purchasePricing.subject.title}</div>
                            </div>
                            <div className="mt-3 flex items-baseline justify-between">
                              <span className="text-lg font-black text-[#DE8E5C]">
                                ₹{purchasePricing.subject.price}
                              </span>
                              <span className="text-[10px] text-[#77736C] dark:text-gray-400">All Blocks & Units</span>
                            </div>
                          </div>
                        )}

                        {/* 5. Semester All-Subject Bundle */}
                        {purchasePricing?.semester && (
                          <div
                            onClick={() => setSelectedPurchaseTier('semester')}
                            className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between sm:col-span-2 lg:col-span-1 ${
                              selectedPurchaseTier === 'semester'
                                ? 'border-[#DE8E5C] bg-[#DE8E5C]/10 ring-2 ring-[#DE8E5C]/30'
                                : isLight
                                ? 'border-[#E3DED5] bg-[#FAF9F6] hover:border-[#D6D0C5]'
                                : 'border-neutral-800 bg-[#222222] hover:border-neutral-700'
                            }`}
                          >
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#DE8E5C] block">
                                Full Semester Package
                              </span>
                              <div className="font-bold text-xs mt-0.5 truncate">{purchasePricing.semester.title}</div>
                            </div>
                            <div className="mt-3 flex items-baseline justify-between">
                              <span className="text-lg font-black text-[#DE8E5C]">
                                ₹{purchasePricing.semester.price}
                              </span>
                              <span className="text-[10px] text-[#77736C] dark:text-gray-400">All Subjects Bundle</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Primary Checkout CTA */}
                      <div className="relative z-10 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#E3DED5] dark:border-neutral-800">
                        <div className="text-xs text-[#77736C] dark:text-gray-400 flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>100% Secure Checkout via Razorpay • Instant Academic Access</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (onUnlock) {
                              const targetItem =
                                selectedPurchaseTier === 'note'
                                  ? { itemType: 'note', itemId: note._id, price: purchasePricing?.note?.price || note.price, title: note.title }
                                  : selectedPurchaseTier === 'unit'
                                  ? { itemType: 'unit', itemId: purchasePricing?.unit?.id, price: purchasePricing?.unit?.price, title: purchasePricing?.unit?.title }
                                  : selectedPurchaseTier === 'block'
                                  ? { itemType: 'block', itemId: purchasePricing?.block?.id, price: purchasePricing?.block?.price, title: purchasePricing?.block?.title }
                                  : selectedPurchaseTier === 'subject'
                                  ? { itemType: 'subject', itemId: purchasePricing?.subject?.id, price: purchasePricing?.subject?.price, title: purchasePricing?.subject?.title }
                                  : { itemType: 'semester', itemId: purchasePricing?.semester?.id, price: purchasePricing?.semester?.price, title: purchasePricing?.semester?.title };
                              onUnlock(targetItem.itemType, targetItem);
                            }
                          }}
                          className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-xs text-white bg-[rgb(222,142,92)] hover:bg-[rgb(208,128,78)] shadow-sm flex items-center justify-center gap-2 transition"
                        >
                          <span>Proceed to Unlock Selected Item</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* A4 DOCUMENT PAGE SURFACE */}
                <div
                  data-page-number={page.pageNumber}
                  className={`a4-document-page relative rounded-xl p-8 sm:p-12 min-h-[1050px] shadow-sm border transition-colors flex flex-col justify-between ${
                    isLight
                      ? 'bg-white border-[#E3DED5] shadow-sm text-[#242321]'
                      : 'bg-[#1C1C1C] border-[#2A2A2A] shadow-black/40 text-gray-100'
                  }`}
                >
                  {/* 1. TRANSLUCENT YELLOW HIGHLIGHTER CANVAS LAYER (Persistent during reading session) */}
                  <canvas
                    ref={(el) => {
                      if (el) {
                        highlightCanvasRefs.current[page.pageNumber] = el;
                        initCanvasSize(el, page.pageNumber, 'highlight');
                      }
                    }}
                    data-highlight-page={page.pageNumber}
                    onPointerDown={(e) => handleCanvasPointerDown(e, page.pageNumber)}
                    onPointerMove={(e) => handleCanvasPointerMove(e, page.pageNumber)}
                    onPointerUp={(e) => handleCanvasPointerUp(e, page.pageNumber)}
                    onPointerCancel={(e) => handleCanvasPointerUp(e, page.pageNumber)}
                    className={`annotation-canvas absolute inset-0 w-full h-full rounded-xl z-[18] ${
                      activeTool === 'highlighter'
                        ? 'pointer-events-auto cursor-crosshair'
                        : 'pointer-events-none'
                    }`}
                    style={{
                      mixBlendMode: isLight ? 'multiply' : 'screen',
                      opacity: isLight ? 0.40 : 0.35,
                      touchAction: activeTool === 'highlighter' ? 'none' : 'auto',
                    }}
                  />

                  {/* 2. RED & WHITE GLOW MARKER CANVAS LAYER (Temporary with 25s inactivity fade-out) */}
                  <canvas
                    ref={(el) => {
                      if (el) {
                        markerCanvasRefs.current[page.pageNumber] = el;
                        initCanvasSize(el, page.pageNumber, 'marker');
                      }
                    }}
                    data-marker-page={page.pageNumber}
                    onPointerDown={(e) => handleCanvasPointerDown(e, page.pageNumber)}
                    onPointerMove={(e) => handleCanvasPointerMove(e, page.pageNumber)}
                    onPointerUp={(e) => handleCanvasPointerUp(e, page.pageNumber)}
                    onPointerCancel={(e) => handleCanvasPointerUp(e, page.pageNumber)}
                    className={`annotation-canvas absolute inset-0 w-full h-full rounded-xl z-[20] transition-opacity duration-1000 ${
                      activeTool === 'marker'
                        ? 'pointer-events-auto cursor-crosshair'
                        : 'pointer-events-none'
                    }`}
                    style={{
                      opacity: markerOpacity,
                      touchAction: activeTool === 'marker' ? 'none' : 'auto',
                    }}
                  />

                  {/* SUBTLE CENTER WATERMARK (Always subtly visible behind content) */}
                  <WatermarkOverlay isLight={isLight} />

                  {/* PAGE HEADER (Clean, minimal, academic) */}
                  <div
                    className={`page-header border-b pb-3 mb-6 flex items-center justify-between text-[11px] font-mono tracking-wider relative z-10 ${
                      isLight ? 'border-[#E3DED5] text-[#77736C]' : 'border-neutral-800 text-neutral-400'
                    }`}
                  >
                    <span className="truncate max-w-sm font-medium">
                      {note.title || 'Academic Notes'}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                      {note.unit?.title ? `Unit ${note.unit?.unitNumber || ''} • ${note.unit.title}` : 'GenZNotes Academic Series'}
                    </span>
                  </div>

                  {/* PAGE BODY CONTENT */}
                  <div
                    className={`page-body flex-1 relative z-10 transition-all duration-150 ${
                      holdToReadEnabled
                        ? (isHolding || !!activeTool)
                          ? 'hold-to-read-revealed'
                          : 'hold-to-read-blurred'
                        : ''
                    }`}
                  >
                    {isLocked ? (
                      /* LOCKED PAGE PLACEHOLDER */
                      <div className="locked-page-preview relative h-full flex flex-col items-center justify-center text-center p-8 min-h-[600px] select-none">
                        <div className="p-4 rounded-2xl bg-[#EEEAE3] dark:bg-neutral-800 text-[#DE8E5C] mb-4 shadow-sm">
                          <Lock className="w-8 h-8" />
                        </div>
                        <h4 className="text-lg font-bold text-[#242321] dark:text-white mb-1">
                          Page {page.pageNumber} Content Locked
                        </h4>
                        <p className="text-xs text-[#77736C] dark:text-gray-400 max-w-sm leading-relaxed mb-6">
                          This page contains full-mark answers, derivations, and exam summaries. Unlock this note or subject pass to continue reading.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            if (onUnlock) onUnlock('note', { itemType: 'note', itemId: note._id, price: note.price, title: note.title });
                          }}
                          className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[rgb(222,142,92)] hover:bg-[rgb(208,128,78)] transition shadow-sm flex items-center gap-2"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Unlock Page {page.pageNumber}</span>
                        </button>
                      </div>
                    ) : (
                      /* FULL HTML CONTENT */
                      <div
                        className="prose-academic ng-notes-container"
                        dangerouslySetInnerHTML={{ __html: page.contentHtml || '<p>Page content empty.</p>' }}
                      />
                    )}
                  </div>

                  {/* PERSONALIZED FOOTER WATERMARK (Clean academic licensing footer within A4 page layout) */}
                  <div
                    className={`page-footer border-t pt-3 mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10px] sm:text-[11px] font-mono tracking-wider relative z-10 ${
                      isLight ? 'border-[#E3DED5] text-[#77736C]' : 'border-neutral-800 text-neutral-400'
                    }`}
                  >
                    {/* Left: Branding & Dynamic User Licensing */}
                    <div className="flex items-center gap-2 truncate max-w-md">
                      <span className="font-bold tracking-widest text-[#242321] dark:text-neutral-200">
                        GENZNOTES
                      </span>
                      <span className="text-neutral-300 dark:text-neutral-700">•</span>
                   
                    </div>

                    {/* Right: User ID & Page Pagination */}
                    <div className="flex items-center gap-3 ml-auto text-[10px] sm:text-[11px]">
                      {user?._id && (
                        <span className="text-neutral-400 dark:text-neutral-500 hidden md:inline">
                          ID: {user._id.slice(-6).toUpperCase()}
                        </span>
                      )}
                      <span className="font-semibold text-[#242321] dark:text-gray-300">
                        Page {page.pageNumber} of {totalPages}
                      </span>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Floating Active Tool Indicator & Quick Controls */}
      {activeTool && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200 pointer-events-auto">
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-neutral-900/95 dark:bg-neutral-800/95 text-white border border-neutral-700 shadow-2xl backdrop-blur-md text-xs font-medium">
            <div className="flex items-center gap-2">
              {activeTool === 'highlighter' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <Highlighter className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-bold">Highlighter:</span>
                  <span className="text-neutral-300 text-[11px] hidden sm:inline">Drag across text to highlight (Content Protected)</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <PenTool className="w-3.5 h-3.5 text-red-400" />
                  <span className="font-bold">Glow Pen:</span>
                  <span className="text-neutral-300 text-[11px] hidden sm:inline">Drag anywhere to draw glowing annotations</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-1.5 pl-2 border-l border-neutral-700">
              <button
                type="button"
                onClick={handleClearAnnotations}
                className="p-1 rounded-lg hover:bg-neutral-700 text-neutral-400 hover:text-red-400 transition"
                title="Clear Annotations"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTool(null)}
                className="px-2.5 py-1 rounded-full bg-neutral-700 hover:bg-neutral-600 text-[11px] font-bold text-gray-200 transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesReader;
