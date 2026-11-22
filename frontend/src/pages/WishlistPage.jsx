import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, BookOpen, ArrowRight, Layers, FileText } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { WishlistSkeleton } from '../components/common/Skeletons';
import EmptyState from '../components/common/EmptyState';
import SEOHead from '../components/common/SEOHead';

const WishlistPage = () => {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState({ subjects: [], units: [], notes: [], total: 0 });

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await api.get('/wishlist');
      if (res.data?.success) {
        setWishlist(res.data.wishlist);
      }
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleRemove = async (itemType, itemId) => {
    try {
      await api.post('/wishlist/remove', { itemType, itemId });
      fetchWishlist();
    } catch (err) {
      console.error('Remove from wishlist error:', err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <EmptyState
          icon={Heart}
          title="Sign in to View Wishlist"
          description="Save subjects and high-yield notes to your personal wishlist so you can revisit them anytime."
          actionText="Log In"
          actionLink="/login"
        />
      </div>
    );
  }

  if (loading) {
    return <WishlistSkeleton />;
  }

  const hasItems = wishlist.total > 0;

  return (
    <div className="min-h-screen bg-[#141414] text-gray-100 transition-colors py-8">
      <SEOHead title="My Wishlist | GenZ Notes" noindex={true} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="pb-4 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white flex items-center gap-2">
              <Heart className="w-6 h-6 text-coral-500 fill-coral-500" />
              <span>Saved Wishlist ({wishlist.total})</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              Your bookmarked academic subjects, units, and exam preparation notes.
            </p>
          </div>
        </div>

        {!hasItems ? (
          <EmptyState
            icon={Heart}
            title="Your Wishlist is Empty"
            description="You haven't saved any subjects or notes yet. Click the heart icon on any subject or note to save it here."
            actionText="Browse Academic Notes"
            actionLink="/"
          />
        ) : (
          <div className="space-y-6">
            {/* Saved Subjects */}
            {wishlist.subjects.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Saved Subjects ({wishlist.subjects.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {wishlist.subjects.map((subj) => (
                    <div
                      key={subj._id}
                      className="p-5 rounded-2xl bg-white dark:bg-[#202020] border border-gray-200 dark:border-neutral-800 flex items-center justify-between shadow-sm"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 px-2 py-0.5 rounded">
                          {subj.code || 'SUBJECT'}
                        </span>
                        <h4 className="text-base font-bold text-gray-900 dark:text-white">
                          {subj.name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {subj.semesterId?.name} • ₹{subj.discountedPrice || subj.price}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRemove('subject', subj._id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition"
                          title="Remove from wishlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <Link
                          to={`/subject/${subj._id}`}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 shadow-sm flex items-center gap-1 transition"
                        >
                          <span>Open</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
