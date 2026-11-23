import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Search, BookOpen, Layers, GraduationCap, FileText, ArrowRight, Sparkles } from 'lucide-react';
import api from '../services/api';
import { SearchSkeleton } from '../components/common/Skeletons';
import EmptyState from '../components/common/EmptyState';
import SEOHead from '../components/common/SEOHead';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState(query);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ colleges: [], courses: [], subjects: [], notes: [], total: 0 });

  useEffect(() => {
    setSearchInput(query);
    if (!query.trim()) {
      setResults({ colleges: [], courses: [], subjects: [], notes: [], total: 0 });
      setLoading(false);
      return;
    }

    const performSearch = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/search?q=${encodeURIComponent(query.trim())}`);
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
    }
  };

  const popularSearches = ['IGNOU', 'BCA', 'DSA', 'Operating Systems', 'BCS-011', 'Database'];

  return (
    <div className="min-h-screen bg-[#F5F3EF] dark:bg-[#141414] text-[#242321] dark:text-gray-100 transition-colors py-6 sm:py-8 pb-24 md:pb-12">
      <SEOHead
        title={query ? `Search: "${query}" | GenZ Notes` : 'Search Academic Notes | GenZ Notes'}
        description="Search college subjects, course syllabus, and study notes on GenZ Notes."
        noindex={true}
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Apple-style Interactive Search Input */}
        <div className="space-y-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-5 h-5 text-[#77736C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search notes, subjects, codes (e.g. DSA, OS, BCS-011)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-11 pr-24 h-12 bg-[#FAF9F6] dark:bg-[#1E1E1E] border border-[#E3DED5] dark:border-neutral-800 focus:border-[#DE8E5C] rounded-2xl text-sm sm:text-base text-[#242321] dark:text-white placeholder-[#77736C] focus:outline-none shadow-sm transition"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-500 to-coral-500 hover:from-brand-600 hover:to-coral-600 transition shadow-sm active:scale-95"
            >
              Search
            </button>
          </form>

          {/* Quick Filter Tags */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <span className="text-[11px] font-bold text-[#77736C] dark:text-gray-400 whitespace-nowrap flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#DE8E5C]" />
              Popular:
            </span>
            {popularSearches.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => {
                  setSearchInput(term);
                  setSearchParams({ q: term });
                }}
                className="px-3 py-1 rounded-full text-xs font-medium bg-[#FAF9F6] dark:bg-[#1C1C1C] hover:bg-[#EEEAE3] dark:hover:bg-neutral-800 border border-[#E3DED5] dark:border-neutral-800 text-[#242321] dark:text-gray-200 transition whitespace-nowrap active:scale-95"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* Results Header */}
        {query && (
          <div className="pb-3 border-b border-[#E3DED5] dark:border-neutral-800 flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#242321] dark:text-white tracking-tight">
                Results for "{query}"
              </h1>
              <p className="text-xs text-[#77736C] dark:text-gray-400 mt-0.5">
                Found {results.total} matching academic items.
              </p>
            </div>
          </div>
        )}

        {!query ? (
          <div className="text-center py-16 bg-[#FAF9F6] dark:bg-[#1A1A1A] rounded-3xl border border-[#E3DED5] dark:border-neutral-800 p-8 space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#DE8E5C]/10 text-[#DE8E5C] flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#242321] dark:text-white">
                Search Academic Curricula
              </h3>
              <p className="text-xs text-[#77736C] dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
                Type any subject name, course abbreviation, or university topic above to find verified notes instantly.
              </p>
            </div>
          </div>
        ) : loading ? (
          <SearchSkeleton />
        ) : results.total === 0 ? (
          <EmptyState
            icon={Search}
            title="No Results Found"
            description={`We couldn't find any colleges, subjects, or notes matching "${query}". Try searching for acronyms like DSA, OS, DTU, or BCS-011.`}
            actionText="Browse IGNOU Notes"
            actionLink="/ignou"
          />
        ) : (
          <div className="space-y-8">
            {/* Matching Subjects */}
            {results.subjects.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#DE8E5C]">
                  Subjects ({results.subjects.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {results.subjects.map((subj) => (
                    <div
                      key={subj._id}
                      className="p-4 sm:p-5 rounded-2xl bg-[#FAF9F6] dark:bg-[#1A1A1A] border border-[#E3DED5] dark:border-neutral-800 flex items-center justify-between gap-3 shadow-sm active:scale-[0.99] transition"
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-[#DE8E5C] bg-[#DE8E5C]/10 px-2 py-0.5 rounded-md">
                          {subj.code || 'SUBJECT'}
                        </span>
                        <h4 className="text-sm sm:text-base font-bold text-[#242321] dark:text-white truncate">
                          {subj.name}
                        </h4>
                        <p className="text-xs text-[#77736C] dark:text-gray-400 truncate">
                          {subj.collegeId?.name} • {subj.semesterId?.name}
                        </p>
                      </div>

                      <Link
                        to={`/subject/${subj._id}`}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-500 to-coral-500 hover:from-brand-600 hover:to-coral-600 shadow-sm flex items-center gap-1 transition flex-shrink-0 active:scale-95"
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
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#DE8E5C]">
                  Notes ({results.notes.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {results.notes.map((note) => (
                    <div
                      key={note._id}
                      className="p-4 sm:p-5 rounded-2xl bg-[#FAF9F6] dark:bg-[#1A1A1A] border border-[#E3DED5] dark:border-neutral-800 flex items-center justify-between gap-3 shadow-sm active:scale-[0.99] transition"
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-[#DE8E5C] bg-[#DE8E5C]/10 px-2 py-0.5 rounded-md">
                          {note.type === 'quick' ? 'QUICK NOTES' : 'NORMAL NOTE'}
                        </span>
                        <h4 className="text-sm font-bold text-[#242321] dark:text-white truncate">
                          {note.title}
                        </h4>
                        <p className="text-xs text-[#77736C] dark:text-gray-400 truncate">
                          {note.subjectId?.name} • Unit {note.unitId?.unitNumber}
                        </p>
                      </div>

                      <Link
                        to={`/reader/${note._id}`}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-500 to-coral-500 hover:from-brand-600 hover:to-coral-600 shadow-sm flex items-center gap-1 transition flex-shrink-0 active:scale-95"
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
