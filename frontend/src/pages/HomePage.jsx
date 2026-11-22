import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  GraduationCap,
  Layers,
  FileCheck,
  Zap,
  CheckCircle2,
  Search,
  BookMarked,
  Calendar,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Academic dropdown states for the hero search bar
  const [colleges, setColleges] = useState([]);
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);

  const [selectedCollegeId, setSelectedCollegeId] = useState(() => {
    return localStorage.getItem('notesguru_pref_college') || '';
  });
  const [selectedCourseId, setSelectedCourseId] = useState(() => {
    return localStorage.getItem('notesguru_pref_course') || '';
  });
  const [selectedSemesterId, setSelectedSemesterId] = useState(() => {
    return localStorage.getItem('notesguru_pref_semester') || '';
  });

  const [loadingColleges, setLoadingColleges] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingSemesters, setLoadingSemesters] = useState(false);
  const [validationError, setValidationError] = useState('');

  const selectedCourse = courses.find((c) => c._id === selectedCourseId);
  const isYearCourse = selectedCourse?.academicStructure === 'year';

  // 1. Fetch Colleges
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        setLoadingColleges(true);
        const res = await api.get('/colleges');
        if (res.data?.success) {
          const list = res.data.colleges || [];
          setColleges(list);
        }
      } catch (err) {
        console.error('Failed to load colleges:', err);
      } finally {
        setLoadingColleges(false);
      }
    };
    fetchColleges();
  }, []);

  // 2. Fetch Courses when college changes
  useEffect(() => {
    if (!selectedCollegeId) {
      setCourses([]);
      setSelectedCourseId('');
      setSemesters([]);
      setSelectedSemesterId('');
      return;
    }

    const fetchCourses = async () => {
      try {
        setLoadingCourses(true);
        const res = await api.get(`/courses/college/${selectedCollegeId}`);
        if (res.data?.success) {
          const list = res.data.courses || [];
          setCourses(list);
          if (!list.some((c) => c._id.toString() === selectedCourseId)) {
            setSelectedCourseId('');
            setSemesters([]);
            setSelectedSemesterId('');
          }
        }
      } catch (err) {
        console.error('Failed to load courses:', err);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, [selectedCollegeId]);

  // 3. Fetch Semesters when course changes
  useEffect(() => {
    if (!selectedCourseId) {
      setSemesters([]);
      setSelectedSemesterId('');
      return;
    }

    const fetchSemesters = async () => {
      try {
        setLoadingSemesters(true);
        const res = await api.get(`/semesters/course/${selectedCourseId}`);
        if (res.data?.success) {
          const list = res.data.semesters || [];
          setSemesters(list);
          if (!list.some((s) => s._id.toString() === selectedSemesterId)) {
            setSelectedSemesterId('');
          }
        }
      } catch (err) {
        console.error('Failed to load semesters:', err);
      } finally {
        setLoadingSemesters(false);
      }
    };
    fetchSemesters();
  }, [selectedCourseId]);

  // Handle Find button click
  const handleFindSubjects = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!selectedCollegeId) {
      setValidationError('Please select a college to continue.');
      return;
    }
    if (!selectedCourseId) {
      setValidationError('Please select your course or branch.');
      return;
    }
    if (!selectedSemesterId) {
      setValidationError(isYearCourse ? 'Please select an academic year.' : 'Please select a semester.');
      return;
    }

    // Preserve preferences in localStorage
    localStorage.setItem('notesguru_pref_college', selectedCollegeId);
    localStorage.setItem('notesguru_pref_course', selectedCourseId);
    localStorage.setItem('notesguru_pref_semester', selectedSemesterId);

    // Navigate to dedicated Available Subjects page
    navigate(`/available-subjects?semesterId=${selectedSemesterId}&collegeId=${selectedCollegeId}&courseId=${selectedCourseId}`);
  };

  return (
    <div className="min-h-screen bg-[#F5F3EF] dark:bg-[#141414] text-[#242321] dark:text-gray-100 flex flex-col transition-colors">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-16 sm:pb-24 border-b border-[#E3DED5] dark:border-neutral-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          {/* Brand Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF9F6] dark:bg-neutral-900 border border-[#E3DED5] dark:border-neutral-800 text-xs font-semibold text-[#DE8E5C] shadow-sm">
            
            <span>Exam Tomorrow? GenZNotes Today.</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-[#242321] dark:text-white tracking-tight leading-[1.15] max-w-3xl mx-auto">
            Syllabus-Mapped College Notes for{' '}
            <span className="text-[#DE8E5C]">Exam Night Clarity</span>
          </h1>

          {/* Short, Meaningful Description */}
          <p className="text-sm sm:text-base text-[#77736C] dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Stop sorting through unorganized drives and scattered PDFs. Discover verified,
            concise academic notes organized precisely by your university, course, semester, and unit.
          </p>

          {/* Integrated Academic Search Bar with Prominent "Find" Button */}
          <div className="pt-4 max-w-4xl mx-auto">
            <form
              onSubmit={handleFindSubjects}
              className="bg-[#FAF9F6] dark:bg-[#1E1E1E] p-3 sm:p-4 rounded-2xl border border-[#E3DED5] dark:border-neutral-800 shadow-md"
            >
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center text-left">
                {/* 1. College Dropdown */}
                <div className="sm:col-span-4">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#77736C] dark:text-gray-400 mb-1">
                    1. College
                  </label>
                  {loadingColleges ? (
                    <div className="skeleton-shimmer h-[38px] w-full rounded-xl" />
                  ) : (
                    <select
                      value={selectedCollegeId}
                      onChange={(e) => {
                        setSelectedCollegeId(e.target.value);
                        setValidationError('');
                      }}
                      className="w-full px-3 py-2 bg-[#EEEAE3] dark:bg-neutral-900 border border-[#E3DED5] dark:border-neutral-700 rounded-xl text-xs sm:text-sm text-[#242321] dark:text-white focus:outline-none focus:border-[#DE8E5C] transition"
                    >
                      <option value="">Select College...</option>
                      {colleges.map((col) => (
                        <option key={col._id} value={col._id}>
                          {col.code ? `${col.code} — ${col.name}` : col.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* 2. Course Dropdown */}
                <div className="sm:col-span-3">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#77736C] dark:text-gray-400 mb-1">
                    2. Course
                  </label>
                  {loadingCourses ? (
                    <div className="skeleton-shimmer h-[38px] w-full rounded-xl" />
                  ) : (
                    <select
                      value={selectedCourseId}
                      onChange={(e) => {
                        setSelectedCourseId(e.target.value);
                        setValidationError('');
                      }}
                      disabled={!selectedCollegeId}
                      className="w-full px-3 py-2 bg-[#EEEAE3] dark:bg-neutral-900 border border-[#E3DED5] dark:border-neutral-700 rounded-xl text-xs sm:text-sm text-[#242321] dark:text-white focus:outline-none focus:border-[#DE8E5C] disabled:opacity-50 transition"
                    >
                      <option value="">Select Course...</option>
                      {courses.map((crs) => (
                        <option key={crs._id} value={crs._id}>
                          {crs.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* 3. Semester / Year Dropdown */}
                <div className="sm:col-span-3">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#77736C] dark:text-gray-400 mb-1">
                    3. {isYearCourse ? 'Year' : 'Semester'}
                  </label>
                  {loadingSemesters ? (
                    <div className="skeleton-shimmer h-[38px] w-full rounded-xl" />
                  ) : (
                    <select
                      value={selectedSemesterId}
                      onChange={(e) => {
                        setSelectedSemesterId(e.target.value);
                        setValidationError('');
                      }}
                      disabled={!selectedCourseId}
                      className="w-full px-3 py-2 bg-[#EEEAE3] dark:bg-neutral-900 border border-[#E3DED5] dark:border-neutral-700 rounded-xl text-xs sm:text-sm text-[#242321] dark:text-white focus:outline-none focus:border-[#DE8E5C] disabled:opacity-50 transition"
                    >
                      <option value="">Select {isYearCourse ? 'Year' : 'Semester'}...</option>
                      {semesters.map((sem) => (
                        <option key={sem._id} value={sem._id}>
                          {sem.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* 4. Prominent "Find" Button */}
                <div className="sm:col-span-2 pt-2 sm:pt-4">
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-[rgb(222,142,92)] hover:bg-[rgb(208,128,78)] transition shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Search className="w-4 h-4" />
                    <span>Find</span>
                  </button>
                </div>
              </div>

              {/* Inline Validation Notice */}
              {validationError && (
                <p className="text-xs text-red-600 dark:text-red-400 font-medium text-left mt-2.5 pt-2 border-t border-[#E3DED5] dark:border-neutral-800">
                  {validationError}
                </p>
              )}
            </form>
          </div>

          {/* Trust Highlights */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs text-[#77736C] dark:text-gray-400 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Verified University Curricula</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Free Previews on Every Note</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Distraction-Free Vertical Reader</span>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 sm:py-20 border-b border-[#E3DED5] dark:border-neutral-800 bg-[#EEEAE3]/60 dark:bg-[#161616]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#DE8E5C]">
              Simple 3-Step Journey
            </h2>
            <h3 className="text-2xl sm:text-3xl font-black text-[#242321] dark:text-white">
              How GenZNotes Works
            </h3>
            <p className="text-xs sm:text-sm text-[#77736C] dark:text-gray-400 max-w-lg mx-auto">
              Find exactly what you need to study for tomorrow's exam in less than 30 seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-[#FAF9F6] dark:bg-[#1D1D1D] border border-[#E3DED5] dark:border-neutral-800 transition">
              <div className="w-9 h-9 rounded-xl bg-[#EEEAE3] dark:bg-neutral-800 text-[#DE8E5C] flex items-center justify-center font-black text-sm mb-4">
                01
              </div>
              <h4 className="text-base font-bold text-[#242321] dark:text-white mb-1.5">
                Select your college
              </h4>
              <p className="text-xs text-[#77736C] dark:text-gray-400 leading-relaxed">
                Choose your university or institute to narrow down content specifically mapped to your syllabus.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-[#FAF9F6] dark:bg-[#1D1D1D] border border-[#E3DED5] dark:border-neutral-800 transition">
              <div className="w-9 h-9 rounded-xl bg-[#EEEAE3] dark:bg-neutral-800 text-[#DE8E5C] flex items-center justify-center font-black text-sm mb-4">
                02
              </div>
              <h4 className="text-base font-bold text-[#242321] dark:text-white mb-1.5">
                Choose course & semester / year
              </h4>
              <p className="text-xs text-[#77736C] dark:text-gray-400 leading-relaxed">
                Filter by your branch of study and active semester or year to access your exact curriculum.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-[#FAF9F6] dark:bg-[#1D1D1D] border border-[#E3DED5] dark:border-neutral-800 transition">
              <div className="w-9 h-9 rounded-xl bg-[#EEEAE3] dark:bg-neutral-800 text-[#DE8E5C] flex items-center justify-center font-black text-sm mb-4">
                03
              </div>
              <h4 className="text-base font-bold text-[#242321] dark:text-white mb-1.5">
                Explore subjects & read notes
              </h4>
              <p className="text-xs text-[#77736C] dark:text-gray-400 leading-relaxed">
                Browse syllabus blocks and units, preview free pages, and start reading in the distraction-free reader.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WHY GENZNOTES */}
      <section className="py-16 sm:py-20 border-b border-[#E3DED5] dark:border-neutral-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#DE8E5C]">
              Built for Students
            </h2>
            <h3 className="text-2xl sm:text-3xl font-black text-[#242321] dark:text-white">
              Why GenZNotes
            </h3>
            <p className="text-xs sm:text-sm text-[#77736C] dark:text-gray-400 max-w-lg mx-auto">
              Engineered to replace bloated textbooks with high-yield, exam-tested clarity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="p-6 rounded-2xl bg-[#FAF9F6] dark:bg-[#1A1A1A] border border-[#E3DED5] dark:border-neutral-800 flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-[#EEEAE3] dark:bg-neutral-800 flex items-center justify-center text-[#DE8E5C] flex-shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm sm:text-base font-bold text-[#242321] dark:text-white">
                  Organized college notes
                </h4>
                <p className="text-xs text-[#77736C] dark:text-gray-400 leading-relaxed">
                  Every note is curated to cover the syllabus systematically without fluff or missing chapters.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAF9F6] dark:bg-[#1A1A1A] border border-[#E3DED5] dark:border-neutral-800 flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-[#EEEAE3] dark:bg-neutral-800 flex items-center justify-center text-[#DE8E5C] flex-shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm sm:text-base font-bold text-[#242321] dark:text-white">
                  Subject and unit-wise learning
                </h4>
                <p className="text-xs text-[#77736C] dark:text-gray-400 leading-relaxed">
                  Navigate easily through subjects, blocks, and granular units to revise exactly the topic you need.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAF9F6] dark:bg-[#1A1A1A] border border-[#E3DED5] dark:border-neutral-800 flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-[#EEEAE3] dark:bg-neutral-800 flex items-center justify-center text-[#DE8E5C] flex-shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm sm:text-base font-bold text-[#242321] dark:text-white">
                  Quick revision notes
                </h4>
                <p className="text-xs text-[#77736C] dark:text-gray-400 leading-relaxed">
                  High-yield summaries, formulas, and step-by-step derivations optimized for last-minute cramming.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAF9F6] dark:bg-[#1A1A1A] border border-[#E3DED5] dark:border-neutral-800 flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-[#EEEAE3] dark:bg-neutral-800 flex items-center justify-center text-[#DE8E5C] flex-shrink-0">
                <FileCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm sm:text-base font-bold text-[#242321] dark:text-white">
                  Easy access to study material
                </h4>
                <p className="text-xs text-[#77736C] dark:text-gray-400 leading-relaxed">
                  Read smoothly on any device in full screen with light/dark reading mode and instant page navigation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="p-8 sm:p-10 rounded-3xl bg-[#FAF9F6] dark:bg-[#1A1A1A] border border-[#E3DED5] dark:border-neutral-800 shadow-sm">
            <div className="space-y-3 max-w-lg mx-auto">
              <h3 className="text-2xl sm:text-3xl font-black text-[#242321] dark:text-white tracking-tight">
                Ready for Tomorrow's Exam?
              </h3>
              <p className="text-xs sm:text-sm text-[#77736C] dark:text-gray-400 leading-relaxed">
                Stop worrying about exam prep. Select your college above to view all verified notes.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-[rgb(222,142,92)] hover:bg-[rgb(208,128,78)] transition shadow-sm"
                >
                  <Search className="w-4 h-4" />
                  <span>Find Notes for Your Course</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
