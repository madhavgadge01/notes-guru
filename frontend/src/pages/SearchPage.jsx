import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, BookOpen, Layers, GraduationCap, FileText, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { SearchSkeleton } from '../components/common/Skeletons';
import EmptyState from '../components/common/EmptyState';
import SEOHead from '../components/common/SEOHead';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState({ colleges: [], courses: [], subjects: [], notes: [], total: 0 });

  useEffect(() => {
    if (!query) {
      setResults({ colleges: [], courses: [], subjects: [], notes: [], total: 0 });
      setLoading(false);
      return;
    }

    const performSearch = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/search?q=${encodeURIComponent(query)}`);
        if (res.data?.success) {
          setResults(res.data.results);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query]);

  return (
    <div className="min-h-screen bg-[#141414] text-gray-100 transition-colors py-8">
      <SEOHead
        title={query ? `Search: "${query}" | GenZ Notes` : 'Search Academic Notes | GenZ Notes'}
        description="Search college subjects, course syllabus, and study notes on GenZ Notes."
        noindex={true}
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="pb-4 border-b border-gray-200 dark:border-neutral-800">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white flex items-center gap-2">
            <Search className="w-6 h-6 text-brand-500" />
            <span>Search Results for "{query}"</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Found {results.total} matching academic items across colleges, subjects, and notes.
          </p>
        </div>

        {loading ? (
          <SearchSkeleton />
        ) : results.total === 0 ? (
          <EmptyState
            icon={Search}
            title="No Results Found"
            description={`We couldn't find any colleges, subjects, or notes matching "${query}". Try searching for acronyms like DSA, OS, DTU, or discrete math.`}
            actionText="Go to Homepage"
            actionLink="/"
          />
        ) : (
          <div className="space-y-8">
            {/* Matching Subjects */}
            {results.subjects.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  Subjects ({results.subjects.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.subjects.map((subj) => (
                    <div
                      key={subj._id}
                      className="p-5 rounded-2xl bg-white dark:bg-[#202020] border border-gray-200 dark:border-neutral-800 flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-coral-600 dark:text-coral-400 bg-coral-50 dark:bg-coral-950/40 px-2 py-0.5 rounded">
                          {subj.code || 'SUBJECT'}
                        </span>
                        <h4 className="text-base font-bold text-gray-900 dark:text-white">
                          {subj.name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {subj.collegeId?.name} • {subj.semesterId?.name}
                        </p>
                      </div>

                      <Link
                        to={`/subject/${subj._id}`}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 shadow-sm flex items-center gap-1 transition"
                      >
                        <span>Open</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Matching Notes */}
            {results.notes.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-coral-600 dark:text-coral-400">
                  Notes ({results.notes.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.notes.map((note) => (
                    <div
                      key={note._id}
                      className="p-5 rounded-2xl bg-white dark:bg-[#202020] border border-gray-200 dark:border-neutral-800 flex items-center justify-between"
                    >
                      <div className="space-y-1 max-w-sm">
                        <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 px-2 py-0.5 rounded">
                          {note.type === 'quick' ? 'QUICK NOTES' : 'NORMAL NOTE'}
                        </span>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                          {note.title}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {note.subjectId?.name} • Unit {note.unitId?.unitNumber}
                        </p>
                      </div>

                      <Link
                        to={`/reader/${note._id}`}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-coral-500 hover:bg-coral-600 shadow-sm flex items-center gap-1 transition"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Read</span>
                      </Link>
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

export default SearchPage;
