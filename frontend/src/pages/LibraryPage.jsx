import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  BookmarkCheck,
  CheckCircle,
  FileText,
  Layers,
  Sparkles,
  ArrowRight,
  Clock,
  Zap,
  Lock,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LibrarySkeleton } from '../components/common/Skeletons';
import EmptyState from '../components/common/EmptyState';

const LibraryPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [libraryData, setLibraryData] = useState({
    semesters: [],
    subjects: [],
    units: [],
    notes: [],
    totalPurchases: 0,
  });
  const [continueReading, setContinueReading] = useState([]);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const fetchLibrary = async () => {
      try {
        setLoading(true);
        const [libRes, contRes] = await Promise.all([
          api.get('/library/my-library'),
          api.get('/library/continue-reading'),
        ]);

        if (libRes.data?.success) {
          setLibraryData(libRes.data.library);
        }
        if (contRes.data?.success) {
          setContinueReading(contRes.data.continueReading || []);
        }
      } catch (err) {
        console.error('Failed to load library:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLibrary();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4 bg-[#F5F3EF] dark:bg-[#141414]">
        <div className="max-w-md w-full bg-[#FAF9F6] dark:bg-[#1E1E1E] rounded-2xl p-8 border border-[#E3DED5] dark:border-neutral-800 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 bg-[#EEEAE3] dark:bg-neutral-800 text-[#DE8E5C] rounded-2xl flex items-center justify-center">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[#242321] dark:text-white mb-2">My Notes</h2>
          <p className="text-xs text-[#77736C] dark:text-gray-400 mb-6 leading-relaxed">
            Please log in with your GenZNotes student account to view all your purchased semesters, subjects, notes, and reading progress.
          </p>
          <div className="flex flex-col gap-2.5">
            <Link
              to="/login"
              className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-[rgb(222,142,92)] hover:bg-[rgb(208,128,78)] shadow-sm transition text-center"
            >
              Sign In to Access My Notes
            </Link>
            <Link
              to="/register"
              className="w-full py-2.5 rounded-xl font-semibold text-xs text-[#242321] dark:text-gray-300 bg-[#EEEAE3] dark:bg-neutral-800 hover:bg-[#E5E0D7] transition text-center"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LibrarySkeleton />;
  }

  const hasPurchases =
    libraryData.semesters.length > 0 ||
    libraryData.subjects.length > 0 ||
    libraryData.units.length > 0 ||
    libraryData.notes.length > 0;

  return (
    <div className="min-h-screen bg-[#F5F3EF] dark:bg-[#141414] text-[#242321] dark:text-gray-100 transition-colors py-8 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="pb-4 border-b border-[#E3DED5] dark:border-neutral-800">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#DE8E5C] mb-1">
            <BookOpen className="w-4 h-4" />
            <span>My Study Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#242321] dark:text-white">
            My Notes & Purchased Passes
          </h1>
          <p className="text-xs sm:text-sm text-[#77736C] dark:text-gray-400 mt-1">
            Hierarchically organized by your college syllabus. Click any note to start reading immediately.
          </p>
        </div>

        {/* Continue Reading Section (If any notes have been opened) */}
        {continueReading.length > 0 && (
          <div className="bg-white dark:bg-[#202020] rounded-2xl border border-brand-200/70 dark:border-neutral-800 p-6 shadow-sunset-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-500" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                  Continue Reading
                </h2>
              </div>
              <span className="text-[11px] text-gray-400">Auto-saved reading bookmark</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {continueReading.map((item) => (
                <div
                  key={item.noteId}
                  className="p-4 rounded-xl bg-cream-50 dark:bg-neutral-900/60 border border-brand-200/50 dark:border-neutral-800 flex flex-col justify-between"
                >
                  <div className="space-y-1 mb-3">
                    <span className="text-[10px] font-bold text-coral-600 dark:text-coral-400 uppercase">
                      {item.subjectName} • Unit {item.unitNumber}
                    </span>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {item.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Last read on Page {item.lastReadPage} of {item.totalPages}
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-2">
                    <div className="w-full bg-gray-200 dark:bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-brand-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>

                    <Link
                      to={`/reader/${item.noteId}`}
                      className="w-full py-1.5 px-3 rounded-lg text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 transition flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Resume (Page {item.lastReadPage})</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E3DED5] dark:border-neutral-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'all'
                ? 'bg-[rgb(222,142,92)] text-white shadow-sm'
                : 'text-[#77736C] dark:text-gray-400 hover:bg-[#EEEAE3] dark:hover:bg-neutral-800'
            }`}
          >
            All Items ({libraryData.totalPurchases})
          </button>
          <button
            onClick={() => setActiveTab('semesters')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'semesters'
                ? 'bg-[rgb(222,142,92)] text-white shadow-sm'
                : 'text-[#77736C] dark:text-gray-400 hover:bg-[#EEEAE3] dark:hover:bg-neutral-800'
            }`}
          >
            Semester & Year Packages ({libraryData.semesters.length})
          </button>
          <button
            onClick={() => setActiveTab('subjects')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'subjects'
                ? 'bg-[rgb(222,142,92)] text-white shadow-sm'
                : 'text-[#77736C] dark:text-gray-400 hover:bg-[#EEEAE3] dark:hover:bg-neutral-800'
            }`}
          >
            Subjects ({libraryData.subjects.length})
          </button>
          <button
            onClick={() => setActiveTab('units')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'units'
                ? 'bg-[rgb(222,142,92)] text-white shadow-sm'
                : 'text-[#77736C] dark:text-gray-400 hover:bg-[#EEEAE3] dark:hover:bg-neutral-800'
            }`}
          >
            Units ({libraryData.units.length})
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'notes'
                ? 'bg-[rgb(222,142,92)] text-white shadow-sm'
                : 'text-[#77736C] dark:text-gray-400 hover:bg-[#EEEAE3] dark:hover:bg-neutral-800'
            }`}
          >
            Individual Notes ({libraryData.notes.length})
          </button>
        </div>

        {/* Library Content Listing */}
        {!hasPurchases ? (
          <EmptyState
            title="You Have No Notes Yet"
            description="You have not purchased any semester packages, subjects, or notes yet. Preview notes for free and purchase when ready."
            actionText="Find Academic Notes"
            actionLink="/"
          />
        ) : (
          <div className="space-y-6">
            {/* Semester Packages */}
            {(activeTab === 'all' || activeTab === 'semesters') && libraryData.semesters.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Purchased Semester & Year Packages
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {libraryData.semesters.map((sem) => (
                    <div
                      key={sem._id}
                      className="p-5 rounded-2xl bg-white dark:bg-[#202020] border border-gray-200 dark:border-neutral-800 flex items-center justify-between shadow-sm"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 px-2 py-0.5 rounded">
                          {sem.name?.toLowerCase().includes('year') ? 'FULL YEAR PASS' : 'FULL SEMESTER PASS'}
                        </span>
                        <h4 className="text-base font-bold text-gray-900 dark:text-white">
                          {sem.name} ({sem.courseId?.name})
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {sem.collegeId?.name} • All subjects unlocked
                        </p>
                      </div>

                      <Link
                        to={`/semester/${sem._id}`}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 shadow-sm flex items-center gap-1 transition"
                      >
                        <span>Open {sem.name || 'Curriculum'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Subjects */}
            {(activeTab === 'all' || activeTab === 'subjects') && libraryData.subjects.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Purchased Subjects
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {libraryData.subjects.map((subj) => (
                    <div
                      key={subj._id}
                      className="p-5 rounded-2xl bg-white dark:bg-[#202020] border border-gray-200 dark:border-neutral-800 flex items-center justify-between shadow-sm"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-coral-600 dark:text-coral-400 bg-coral-50 dark:bg-coral-950/40 px-2 py-0.5 rounded">
                          {subj.code || 'SUBJECT PASS'}
                        </span>
                        <h4 className="text-base font-bold text-gray-900 dark:text-white">
                          {subj.name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {subj.semesterId?.name} • All units unlocked
                        </p>
                      </div>

                      <Link
                        to={`/subject/${subj._id}`}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-coral-500 hover:bg-coral-600 shadow-sm flex items-center gap-1 transition"
                      >
                        <span>Open Subject</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Units */}
            {(activeTab === 'all' || activeTab === 'units') && libraryData.units.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Purchased Units
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {libraryData.units.map((unit) => (
                    <div
                      key={unit._id}
                      className="p-5 rounded-2xl bg-white dark:bg-[#202020] border border-gray-200 dark:border-neutral-800 flex items-center justify-between shadow-sm"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded">
                          UNIT {unit.unitNumber}
                        </span>
                        <h4 className="text-base font-bold text-gray-900 dark:text-white">
                          {unit.title}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Subject: {unit.subjectId?.name}
                        </p>
                      </div>

                      <Link
                        to={`/subject/${unit.subjectId?._id}`}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 transition"
                      >
                        View Notes
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Individual Notes */}
            {(activeTab === 'all' || activeTab === 'notes') && libraryData.notes.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Individual Notes Unlocked
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {libraryData.notes.map((note) => (
                    <div
                      key={note._id}
                      className="p-5 rounded-2xl bg-white dark:bg-[#202020] border border-gray-200 dark:border-neutral-800 flex items-center justify-between shadow-sm"
                    >
                      <div className="space-y-1 max-w-sm">
                        <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 px-2 py-0.5 rounded">
                          {note.type === 'quick' ? 'QUICK NOTES' : 'NORMAL NOTE'}
                        </span>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                          {note.title}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {note.subjectId?.name} • Unit {note.unitId?.unitNumber} ({note.pageCount || 1} pages)
                        </p>
                      </div>

                      <Link
                        to={`/reader/${note._id}`}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 shadow-sm flex items-center gap-1.5 transition"
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

export default LibraryPage;
