import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import NotesReader from '../components/reader/NotesReader';
import PurchaseModal from '../components/common/PurchaseModal';
import { NotesReaderSkeleton } from '../components/common/Skeletons';
import EmptyState from '../components/common/EmptyState';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, BookOpen } from 'lucide-react';
import SEOHead from '../components/common/SEOHead';

const NotesReaderPage = () => {
  const { noteId } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [noteData, setNoteData] = useState(null);
  const [pages, setPages] = useState([]);
  const [entitlement, setEntitlement] = useState({});
  const [watermark, setWatermark] = useState(null);
  const [purchasePricing, setPurchasePricing] = useState(null);
  const [initialPage, setInitialPage] = useState(1);

  // Purchase modal state
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [selectedPurchaseOption, setSelectedPurchaseOption] = useState({
    itemType: 'note',
    itemId: noteId,
    itemTitle: '',
    price: 0,
    discountedPrice: 0,
  });

  const fetchNote = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/notes/${noteId}`);
      if (res.data?.success) {
        setNoteData(res.data.note);
        setPages(res.data.pages || []);
        setEntitlement(res.data.entitlement || {});
        setWatermark(res.data.watermark || null);
        setPurchasePricing(res.data.purchasePricing || null);

        // Check if there is existing reading progress
        if (isAuthenticated) {
          try {
            const pRes = await api.get('/library/continue-reading');
            if (pRes.data?.success) {
              const matched = pRes.data.continueReading.find((r) => r.noteId === noteId);
              if (matched && matched.lastReadPage > 1) {
                setInitialPage(matched.lastReadPage);
              }
            }
          } catch {
            // Ignore progress retrieval error
          }
        }
      }
    } catch (err) {
      console.error('Failed to load note for reader:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNote();
  }, [noteId, isAuthenticated]);

  // Complete verification automatically when returning from a full-page Cashfree redirect
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cfOrderId = params.get('cf_order_id');
    if (!cfOrderId || !isAuthenticated) return;

    let cancelled = false;
    const verifyRedirectOrder = async () => {
      try {
        await api.post('/orders/verify', { cashfreeOrderId: cfOrderId });
      } catch (err) {
        console.warn('Cashfree return verification:', err.response?.data?.message || err.message);
      } finally {
        if (!cancelled) {
          navigate(location.pathname, { replace: true });
          fetchNote();
        }
      }
    };

    verifyRedirectOrder();
    return () => {
      cancelled = true;
    };
  }, [location.search, isAuthenticated]);

  // Handle page change: Save reading progress to MongoDB
  const handlePageChange = async (newPageNum, totalPages) => {
    if (!isAuthenticated) return;
    try {
      await api.post('/library/progress', {
        noteId,
        pageNumber: newPageNum,
        totalPages,
      });
    } catch (err) {
      // Background save error
      console.warn('Progress save:', err.message);
    }
  };

  // Trigger purchase modal for current locked note or parent unit/block/subject/semester
  const handleUnlockClick = (itemType = 'note', targetItem = null) => {
    if (targetItem) {
      setSelectedPurchaseOption({
        itemType: targetItem.itemType || itemType,
        itemId: targetItem.itemId,
        itemTitle: targetItem.title || noteData?.title || 'Academic Notes',
        price: targetItem.price || 19,
        discountedPrice: targetItem.price || 19,
      });
    } else {
      const notePrice = noteData?.discountedPrice || noteData?.price;
      setSelectedPurchaseOption({
        itemType: 'note',
        itemId: noteData?._id || noteId,
        itemTitle: noteData?.title || 'Academic Notes',
        price: noteData?.price || 19,
        discountedPrice: notePrice || 15,
      });
    }
    setPurchaseModalOpen(true);
  };

  if (loading) {
    return <NotesReaderSkeleton />;
  }

  if (!noteData) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center">
        <EmptyState
          title="Note Not Found"
          description="The requested note does not exist or is currently restricted."
          actionText="Back to Subjects"
          actionLink="/"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F3EF] dark:bg-[#171717] text-[#242321] dark:text-gray-100 flex flex-col transition-colors">
      <SEOHead
        title={`${noteData?.title || 'Academic Notes'} – Digital Reader | GenZ Notes`}
        description={`Read ${noteData?.title || 'college study notes'} on the GenZ Notes digital reader with high-yield derivations, page bookmarks, and verified syllabus content.`}
        canonical={`https://genznotes.in/reader/${noteId}`}
      />
      {/* Sub-header Bar with Back Navigation */}
      <div className="bg-[#FAF9F6] dark:bg-[#1C1C1C] border-b border-[#E3DED5] dark:border-neutral-800 px-4 py-2.5 flex items-center justify-between text-xs">
        <Link
          to={`/subject/${noteData.subject?._id || noteData.subject}`}
          className="flex items-center gap-1.5 text-[#77736C] dark:text-gray-300 hover:text-[#242321] dark:hover:text-white font-medium transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {noteData.subject?.name || 'Subject'}</span>
        </Link>

        <div className="flex items-center gap-2 text-[#77736C] dark:text-gray-400">
          <span>{noteData.college?.code || 'College'}</span>
          <span>•</span>
          <span>{noteData.course?.code || 'Course'}</span>
          <span>•</span>
          <span className="font-semibold text-[#242321] dark:text-gray-200">{noteData.title}</span>
        </div>
      </div>

      {/* Shared Notes Reader Component */}
      <div className="flex-1">
        <NotesReader
          note={noteData}
          pages={pages}
          entitlement={entitlement}
          watermark={watermark}
          purchasePricing={purchasePricing}
          initialPage={initialPage}
          onPageChange={handlePageChange}
          onUnlock={handleUnlockClick}
        />
      </div>

      {/* Purchase Modal */}
      <PurchaseModal
        isOpen={purchaseModalOpen}
        onClose={() => setPurchaseModalOpen(false)}
        itemType={selectedPurchaseOption.itemType}
        itemId={selectedPurchaseOption.itemId}
        itemTitle={selectedPurchaseOption.itemTitle}
        price={selectedPurchaseOption.price}
        discountedPrice={selectedPurchaseOption.discountedPrice}
        onSuccess={() => {
          fetchNote();
        }}
      />
    </div>
  );
};

export default NotesReaderPage;
