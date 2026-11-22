import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  BookOpen,
  GraduationCap,
  RotateCcw,
  Search,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import api from '../services/api';
import { SubjectListingSkeleton } from '../components/common/Skeletons';
import EmptyState from '../components/common/EmptyState';

const SubjectListingPage = () => {
  const { semesterId: paramSemesterId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const activeSemesterId = paramSemesterId || searchParams.get('semesterId') || localStorage.getItem('notesguru_pref_semester');

  const [loading, setLoading] = useState(true);
  const [semesterData, setSemesterData] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // "Change Selection" inline dropdown state
  const [showChangeSelector, setShowChangeSelector] = useState(false);
  const [colleges, setColleges] = useState([]);
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedColId, setSelectedColId] = useState('');
  const [selectedCrsId, setSelectedCrsId] = useState('');

  const isYear = semesterData?.course?.academicStructure === 'year' || courses.find((c) => c._id === selectedCrsId)?.academicStructure === 'year';
  const [selectedSemId, setSelectedSemId] = useState(activeSemesterId || '');

  // 1. Fetch Subjects for the active semester
  useEffect(() => {
    if (!activeSemesterId) {
      setLoading(false);
      return;
    }

    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/subjects/semester/${activeSemesterId}`);
        if (res.data?.success) {
          setSemesterData(res.data.semester);
          setSubjects(res.data.subjects || []);

          if (res.data.semester?.college) {
            setSelectedColId(res.data.semester.college._id || res.data.semester.college);
          }
          if (res.data.semester?.course) {
            setSelectedCrsId(res.data.semester.course._id || res.data.semester.course);
          }
          setSelectedSemId(activeSemesterId);
        }
      } catch (err) {
        console.error('Failed to load semester subjects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [activeSemesterId]);

  // Load Colleges if user opens "Change Selection"
  useEffect(() => {
    if (!showChangeSelector || colleges.length > 0) return;
    api.get('/colleges').then((res) => {
      if (res.data?.success) setColleges(res.data.colleges || []);
    });
  }, [showChangeSelector]);

  // When college changes in selector
  useEffect(() => {
    if (!selectedColId) {
      setCourses([]);
      return;
    }
    api.get(`/courses/college/${selectedColId}`).then((res) => {
      if (res.data?.success) setCourses(res.data.courses || []);
    });
  }, [selectedColId]);

  // When course changes in selector
  useEffect(() => {
    if (!selectedCrsId) {
      setSemesters([]);
      return;
    }
    api.get(`/semesters/course/${selectedCrsId}`).then((res) => {
      if (res.data?.success) setSemesters(res.data.semesters || []);
    });
  }, [selectedCrsId]);

  const handleApplyNewSelection = (e) => {
    e.preventDefault();
    if (!selectedSemId) return;
    localStorage.setItem('notesguru_pref_college', selectedColId);
    localStorage.setItem('notesguru_pref_course', selectedCrsId);
    localStorage.setItem('notesguru_pref_semester', selectedSemId);
    setShowChangeSelector(false);
    navigate(`/available-subjects?semesterId=${selectedSemId}&collegeId=${selectedColId}&courseId=${selectedCrsId}`);
  };

  const filteredSubjects = subjects.filter((subj) =>
    subj.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <SubjectListingSkeleton />;
  }

  if (!semesterData && !loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#F5F3EF] dark:bg-[#141414] p-4">
        <EmptyState
          title="No Academic Details Selected"
          description="Please select your College, Course, and Semester from the homepage to find subjects."
          actionText="Go to Homepage"
          actionLink="/"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F3EF] dark:bg-[#141414] text-[#242321] dark:text-gray-100 pb-24 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Top Navigation & Breadcrumb */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <nav className="flex items-center gap-1.5 text-xs text-[#77736C] dark:text-gray-400">
            <Link to="/" className="hover:text-[#242321] dark:hover:text-white transition">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#77736C]/60" />
            <span>{semesterData?.college?.code || semesterData?.college?.name}</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#77736C]/60" />
            <span>{semesterData?.course?.name}</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#77736C]/60" />
            <span className="font-semibold text-[#242321] dark:text-white">{semesterData?.name}</span>
          </nav>

          {/* Change Selection Button */}
          <button
            type="button"
            onClick={() => setShowChangeSelector((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E3DED5] dark:border-neutral-700 bg-[#FAF9F6] dark:bg-neutral-800 hover:bg-[#EEEAE3] dark:hover:bg-neutral-700 text-xs font-semibold text-[#242321] dark:text-gray-200 transition shadow-sm"
          >
            <span>Change Academic Selection</span>
            {showChangeSelector ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Expandable "Change Academic Selection" Card */}
        {showChangeSelector && (
          <form
            onSubmit={handleApplyNewSelection}
            className="p-4 sm:p-5 rounded-2xl bg-[#FAF9F6] dark:bg-[#1E1E1E] border border-[#E3DED5] dark:border-neutral-800 shadow-sm space-y-4 text-xs"
          >
            <div className="font-bold uppercase tracking-wider text-[11px] text-[#77736C] dark:text-gray-400">
              Select Different College / Course / {isYear ? 'Year' : 'Semester'}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-[#242321] dark:text-gray-300 mb-1">
                  College
                </label>
                <select
                  value={selectedColId}
                  onChange={(e) => setSelectedColId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#EEEAE3] dark:bg-neutral-900 border border-[#E3DED5] dark:border-neutral-700 rounded-xl text-xs text-[#242321] dark:text-white"
                >
                  <option value="">Select College...</option>
                  {colleges.map((col) => (
                    <option key={col._id} value={col._id}>
                      {col.code ? `${col.code} — ${col.name}` : col.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#242321] dark:text-gray-300 mb-1">
                  Course
                </label>
                <select
                  value={selectedCrsId}
                  onChange={(e) => setSelectedCrsId(e.target.value)}
                  disabled={!selectedColId}
                  className="w-full px-3 py-2 bg-[#EEEAE3] dark:bg-neutral-900 border border-[#E3DED5] dark:border-neutral-700 rounded-xl text-xs text-[#242321] dark:text-white disabled:opacity-50"
                >
                  <option value="">Select Course...</option>
                  {courses.map((crs) => (
                    <option key={crs._id} value={crs._id}>
                      {crs.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#242321] dark:text-gray-300 mb-1">
                  {isYear ? 'Year' : 'Semester'}
                </label>
                <select
                  value={selectedSemId}
                  onChange={(e) => setSelectedSemId(e.target.value)}
                  disabled={!selectedCrsId}
                  className="w-full px-3 py-2 bg-[#EEEAE3] dark:bg-neutral-900 border border-[#E3DED5] dark:border-neutral-700 rounded-xl text-xs text-[#242321] dark:text-white disabled:opacity-50"
                >
                  <option value="">Select {isYear ? 'Year' : 'Semester'}...</option>
                  {semesters.map((sem) => (
                    <option key={sem._id} value={sem._id}>
                      {sem.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowChangeSelector(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#77736C] hover:text-[#242321]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedSemId}
                className="px-5 py-1.5 rounded-xl text-xs font-bold text-white bg-[rgb(222,142,92)] hover:bg-[rgb(208,128,78)] transition shadow-sm disabled:opacity-50"
              >
                Update Subjects
              </button>
            </div>
          </form>
        )}

        {/* Primary Page Heading: "Available Subjects" */}
        <div className="space-y-2 pb-5 border-b border-[#E3DED5] dark:border-neutral-800">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#DE8E5C]">
            {semesterData?.college?.name} • {semesterData?.course?.name}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#242321] dark:text-white tracking-tight">
                Available Subjects
              </h1>
              <p className="text-xs text-[#77736C] dark:text-gray-400 mt-0.5">
                Showing all curriculum subjects for <strong>{semesterData?.name}</strong>.
              </p>
            </div>

            {/* Subject Search Bar */}
            {subjects.length > 0 && (
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-[#77736C] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter subjects..."
                  className="w-full pl-9 pr-3.5 py-2 bg-[#FAF9F6] dark:bg-neutral-900 border border-[#E3DED5] dark:border-neutral-800 rounded-xl text-xs text-[#242321] dark:text-white placeholder-[#77736C] focus:outline-none focus:border-[#DE8E5C] transition"
                />
              </div>
            )}
          </div>
        </div>

        {/* Vertical Full-Width Subject Cards (Minimal, NO Prices, NO Codes) */}
        {subjects.length === 0 ? (
          <div className="text-center py-16 bg-[#FAF9F6] dark:bg-[#1A1A1A] rounded-2xl border border-[#E3DED5] dark:border-neutral-800 p-8 space-y-3 shadow-sm">
            <BookOpen className="w-8 h-8 text-[#77736C] mx-auto" />
            <h3 className="text-base font-bold text-[#242321] dark:text-white">No Subjects Available</h3>
            <p className="text-xs text-[#77736C] dark:text-gray-400 max-w-sm mx-auto">
              Subjects for this {isYear ? 'year' : 'semester'} will appear here once published.
            </p>
          </div>
        ) : filteredSubjects.length === 0 ? (
          <div className="text-center py-16 bg-[#FAF9F6] dark:bg-[#1A1A1A] rounded-2xl border border-[#E3DED5] dark:border-neutral-800 p-8 space-y-3 shadow-sm">
            <Search className="w-8 h-8 text-[#77736C] mx-auto" />
            <h3 className="text-base font-bold text-[#242321] dark:text-white">No Matching Subjects</h3>
            <p className="text-xs text-[#77736C] dark:text-gray-400 max-w-sm mx-auto">
              No subjects matching "{searchQuery}" in this {isYear ? 'year' : 'semester'}.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredSubjects.map((subject) => (
              <Link
                key={subject._id}
                to={`/subject/${subject._id}`}
                className="group w-full p-5 sm:p-6 bg-[#FAF9F6] hover:bg-[#EEEAE3] dark:bg-[#1A1A1A] dark:hover:bg-[#202020] border border-[#E3DED5] hover:border-[#D6D0C5] dark:border-neutral-800 dark:hover:border-neutral-700 rounded-2xl transition duration-150 flex items-center justify-between gap-4 shadow-sm"
              >
                <div className="space-y-1 flex-1 pr-4">
                  {/* Subject Name ONLY */}
                  <h3 className="text-base sm:text-lg font-bold text-[#242321] group-hover:text-[#DE8E5C] dark:text-white dark:group-hover:text-[#DE8E5C] transition">
                    {subject.name}
                  </h3>

                  {/* Optional Short Description (Display ONLY if added) */}
                  {subject.description && subject.description.trim() !== '' && (
                    <p className="text-xs text-[#77736C] dark:text-gray-400 line-clamp-2 leading-relaxed">
                      {subject.description}
                    </p>
                  )}
                </div>

                <div className="w-8 h-8 rounded-xl bg-[#EEEAE3] dark:bg-neutral-900 group-hover:bg-[#DE8E5C]/15 flex items-center justify-center text-[#77736C] group-hover:text-[#DE8E5C] flex-shrink-0 transition">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectListingPage;
