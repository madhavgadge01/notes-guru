import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  ChevronRight,
  Search,
  ArrowRight,
  Layers,
  Sparkles,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SubjectGridSkeleton } from '../components/common/Skeletons';

const AcademicExplorePage = () => {
  const { user, isAuthenticated, savePreferences } = useAuth();
  const navigate = useNavigate();

  // Academic hierarchy state
  const [colleges, setColleges] = useState([]);
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Selections
  const [selectedCollegeId, setSelectedCollegeId] = useState(() => {
    return localStorage.getItem('notesguru_pref_college') || '';
  });
  const [selectedCourseId, setSelectedCourseId] = useState(() => {
    return localStorage.getItem('notesguru_pref_course') || '';
  });
  const [selectedSemesterId, setSelectedSemesterId] = useState(() => {
    return localStorage.getItem('notesguru_pref_semester') || '';
  });

  // Loaders
  const [loadingColleges, setLoadingColleges] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingSemesters, setLoadingSemesters] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  // Search filters
  const [collegeSearch, setCollegeSearch] = useState('');
  const [subjectSearch, setSubjectSearch] = useState('');

  // 1. Fetch Colleges
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        setLoadingColleges(true);
        const res = await api.get('/colleges');
        if (res.data?.success) {
          const list = res.data.colleges || [];
          setColleges(list);

          // Restore preferences if not already chosen
          if (!selectedCollegeId) {
            if (user?.college) {
              const uColId = (user.college._id || user.college).toString();
              setSelectedCollegeId(uColId);
            } else if (list.length > 0) {
              setSelectedCollegeId(list[0]._id);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load colleges:', err);
      } finally {
        setLoadingColleges(false);
      }
    };

    fetchColleges();
  }, [user]);

  // 2. Fetch Courses when college changes
  useEffect(() => {
    if (!selectedCollegeId) {
      setCourses([]);
      setSelectedCourseId('');
      setSemesters([]);
      setSelectedSemesterId('');
      setSubjects([]);
      return;
    }

    localStorage.setItem('notesguru_pref_college', selectedCollegeId);

    const fetchCourses = async () => {
      try {
        setLoadingCourses(true);
        const res = await api.get(`/courses/college/${selectedCollegeId}`);
        if (res.data?.success) {
          const fetchedCourses = res.data.courses || [];
          setCourses(fetchedCourses);

          // Keep selected course if it belongs to this college, otherwise select first
          let matchedCourseId = '';
          const currentStored = localStorage.getItem('notesguru_pref_course');
          if (currentStored && fetchedCourses.some((c) => c._id.toString() === currentStored)) {
            matchedCourseId = currentStored;
          } else if (user?.course && fetchedCourses.some((c) => c._id.toString() === (user.course._id || user.course).toString())) {
            matchedCourseId = (user.course._id || user.course).toString();
          }

          if (matchedCourseId) {
            setSelectedCourseId(matchedCourseId);
          } else if (fetchedCourses.length > 0) {
            setSelectedCourseId(fetchedCourses[0]._id);
          } else {
            setSelectedCourseId('');
            setSemesters([]);
            setSelectedSemesterId('');
            setSubjects([]);
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
      setSubjects([]);
      return;
    }

    localStorage.setItem('notesguru_pref_course', selectedCourseId);

    const fetchSemesters = async () => {
      try {
        setLoadingSemesters(true);
        const res = await api.get(`/semesters/course/${selectedCourseId}`);
        if (res.data?.success) {
          const fetchedSemesters = res.data.semesters || [];
          setSemesters(fetchedSemesters);

          let matchedSemId = '';
          const currentStored = localStorage.getItem('notesguru_pref_semester');
          if (currentStored && fetchedSemesters.some((s) => s._id.toString() === currentStored)) {
            matchedSemId = currentStored;
          } else if (user?.semester && fetchedSemesters.some((s) => s._id.toString() === (user.semester._id || user.semester).toString())) {
            matchedSemId = (user.semester._id || user.semester).toString();
          }

          if (matchedSemId) {
            setSelectedSemesterId(matchedSemId);
          } else if (fetchedSemesters.length > 0) {
            setSelectedSemesterId(fetchedSemesters[0]._id);
          } else {
            setSelectedSemesterId('');
            setSubjects([]);
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

  // 4. Fetch Subjects when semester is selected
  useEffect(() => {
    if (!selectedSemesterId) {
      setSubjects([]);
      return;
    }

    localStorage.setItem('notesguru_pref_semester', selectedSemesterId);

    if (isAuthenticated && selectedCollegeId && selectedCourseId && selectedSemesterId) {
      savePreferences(selectedCollegeId, selectedCourseId, selectedSemesterId);
    }

    const fetchSubjects = async () => {
      try {
        setLoadingSubjects(true);
        const res = await api.get(`/subjects/semester/${selectedSemesterId}`);
        if (res.data?.success) {
          setSubjects(res.data.subjects || []);
        }
      } catch (err) {
        console.error('Failed to load subjects:', err);
      } finally {
        setLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, [selectedSemesterId]);

  const selectedCollege = colleges.find((c) => c._id === selectedCollegeId);
  const selectedCourse = courses.find((c) => c._id === selectedCourseId);
  const isYearCourse = selectedCourse?.academicStructure === 'year';
  const selectedSemester = semesters.find((s) => s._id === selectedSemesterId);

  // Filtered subjects
  const filteredSubjects = subjects.filter((subj) =>
    subj.name.toLowerCase().includes(subjectSearch.toLowerCase())
  );

  const handleResetSelections = () => {
    setSelectedCollegeId('');
    setSelectedCourseId('');
    setSelectedSemesterId('');
    setSubjects([]);
    localStorage.removeItem('notesguru_pref_college');
    localStorage.removeItem('notesguru_pref_course');
    localStorage.removeItem('notesguru_pref_semester');
  };

  return (
    <div className="min-h-screen bg-[#F5F3EF] dark:bg-[#141414] text-[#242321] dark:text-gray-100 pb-24 transition-colors">
      {/* Top Header / Breadcrumb */}
      <section className="border-b border-[#E3DED5] dark:border-neutral-800 bg-[#EEEAE3]/60 dark:bg-[#171717] py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF9F6] dark:bg-neutral-900 border border-[#E3DED5] dark:border-neutral-800 text-[11px] font-semibold text-[#DE8E5C] mb-2">
               
                <span>Academic Curriculum Directory</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#242321] dark:text-white tracking-tight">
                Explore College Notes
              </h1>
              <p className="text-xs sm:text-sm text-[#77736C] dark:text-gray-400 mt-1 max-w-xl">
                Choose your college, course, and semester or year to view all verified syllabus subjects.
              </p>
            </div>

            {(selectedCollegeId || selectedCourseId || selectedSemesterId) && (
              <button
                onClick={handleResetSelections}
                className="self-start sm:self-center inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FAF9F6] dark:bg-neutral-800 border border-[#E3DED5] dark:border-neutral-700 hover:bg-[#EEEAE3] dark:hover:bg-neutral-700 text-xs font-semibold text-[#242321] dark:text-gray-200 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Selection</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Step-by-Step Selection Card */}
        <div className="bg-[#FAF9F6] dark:bg-[#1A1A1A] rounded-2xl p-6 border border-[#E3DED5] dark:border-neutral-800 shadow-sm space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#77736C] dark:text-gray-400">
            Select Academic Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. College */}
            <div>
              <label className="block text-xs font-bold text-[#242321] dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                1. College / University
              </label>
              <select
                value={selectedCollegeId}
                onChange={(e) => setSelectedCollegeId(e.target.value)}
                disabled={loadingColleges}
                className="w-full px-3.5 py-2.5 bg-[#EEEAE3] dark:bg-neutral-900 border border-[#E3DED5] dark:border-neutral-700 rounded-xl text-xs sm:text-sm text-[#242321] dark:text-white focus:outline-none focus:border-[#DE8E5C] disabled:opacity-50 transition"
              >
                <option value="">Choose College...</option>
                {colleges.map((col) => (
                  <option key={col._id} value={col._id}>
                    {col.code ? `${col.code} — ${col.name}` : col.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Course */}
            <div>
              <label className="block text-xs font-bold text-[#242321] dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                2. Course / Branch
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                disabled={!selectedCollegeId || loadingCourses}
                className="w-full px-3.5 py-2.5 bg-[#EEEAE3] dark:bg-neutral-900 border border-[#E3DED5] dark:border-neutral-700 rounded-xl text-xs sm:text-sm text-[#242321] dark:text-white focus:outline-none focus:border-[#DE8E5C] disabled:opacity-50 transition"
              >
                <option value="">
                  {loadingCourses ? 'Loading Courses...' : 'Choose Course...'}
                </option>
                {courses.map((crs) => (
                  <option key={crs._id} value={crs._id}>
                    {crs.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Semester / Year */}
            <div>
              <label className="block text-xs font-bold text-[#242321] dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                3. {isYearCourse ? 'Year' : 'Semester'}
              </label>
              <select
                value={selectedSemesterId}
                onChange={(e) => setSelectedSemesterId(e.target.value)}
                disabled={!selectedCourseId || loadingSemesters}
                className="w-full px-3.5 py-2.5 bg-[#EEEAE3] dark:bg-neutral-900 border border-[#E3DED5] dark:border-neutral-700 rounded-xl text-xs sm:text-sm text-[#242321] dark:text-white focus:outline-none focus:border-[#DE8E5C] disabled:opacity-50 transition"
              >
                <option value="">
                  {loadingSemesters
                    ? (isYearCourse ? 'Loading Years...' : 'Loading Semesters...')
                    : (isYearCourse ? 'Choose Year...' : 'Choose Semester...')}
                </option>
                {semesters.map((sem) => (
                  <option key={sem._id} value={sem._id}>
                    {sem.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Current Selection Summary Breadcrumb */}
          {selectedCollege && selectedCourse && selectedSemester && (
            <div className="pt-4 border-t border-[#E3DED5] dark:border-neutral-800/80 flex items-center gap-2 text-xs text-[#242321] dark:text-gray-300 flex-wrap">
              <span className="text-[#77736C] font-semibold">Active Selection:</span>
              <span className="px-2.5 py-1 rounded-lg bg-[#EEEAE3] dark:bg-neutral-900 border border-[#E3DED5] dark:border-neutral-700 font-medium">
                {selectedCollege.code || selectedCollege.name}
              </span>
              <span className="text-[#77736C]">•</span>
              <span className="px-2.5 py-1 rounded-lg bg-[#EEEAE3] dark:bg-neutral-900 border border-[#E3DED5] dark:border-neutral-700 font-medium">
                {selectedCourse.name}
              </span>
              <span className="text-[#77736C]">•</span>
              <span className="px-2.5 py-1 rounded-lg bg-[#DE8E5C]/15 border border-[#DE8E5C]/30 text-[#DE8E5C] font-bold">
                {selectedSemester.name}
              </span>
            </div>
          )}
        </div>

        {/* Available Subjects Section */}
        {selectedSemesterId ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E3DED5] dark:border-neutral-800">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#242321] dark:text-white">
                  Available Subjects
                </h2>
                <p className="text-xs text-[#77736C] dark:text-gray-400 mt-0.5">
                  Click any subject to view its syllabus blocks, units, and notes.
                </p>
              </div>

              {subjects.length > 0 && (
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-[#77736C] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={subjectSearch}
                    onChange={(e) => setSubjectSearch(e.target.value)}
                    placeholder="Search subjects..."
                    className="w-full pl-9 pr-3.5 py-2 bg-[#FAF9F6] dark:bg-neutral-900 border border-[#E3DED5] dark:border-neutral-800 rounded-xl text-xs text-[#242321] dark:text-white placeholder-[#77736C] focus:outline-none focus:border-[#DE8E5C] transition"
                  />
                </div>
              )}
            </div>

            {loadingSubjects ? (
              <div className="py-2">
                <SubjectGridSkeleton count={4} />
              </div>
            ) : filteredSubjects.length === 0 ? (
              <div className="text-center py-16 bg-[#FAF9F6] dark:bg-[#1A1A1A] rounded-2xl border border-[#E3DED5] dark:border-neutral-800 p-8 space-y-3 shadow-sm">
                <BookOpen className="w-8 h-8 text-[#77736C] mx-auto" />
                <h3 className="text-base font-bold text-[#242321] dark:text-white">No Subjects Found</h3>
                <p className="text-xs text-[#77736C] dark:text-gray-400 max-w-sm mx-auto">
                  {subjectSearch
                    ? `No subjects matching "${subjectSearch}" under this ${isYearCourse ? 'year' : 'semester'}.`
                    : `There are no subjects listed under this ${isYearCourse ? 'year' : 'semester'} yet.`}
                </p>
              </div>
            ) : (
              /* Full-Width Subject Cards Stacked Vertically */
              <div className="flex flex-col gap-3">
                {filteredSubjects.map((subject) => (
                  <Link
                    key={subject._id}
                    to={`/subject/${subject._id}`}
                    className="group w-full p-5 sm:p-6 bg-[#FAF9F6] hover:bg-[#EEEAE3] dark:bg-[#1A1A1A] dark:hover:bg-[#202020] border border-[#E3DED5] hover:border-[#D6D0C5] dark:border-neutral-800 dark:hover:border-neutral-700 rounded-2xl transition duration-150 flex items-center justify-between gap-4 shadow-sm"
                  >
                    <div className="space-y-1.5 flex-1 pr-4">
                      <h3 className="text-base sm:text-lg font-bold text-[#242321] group-hover:text-[#DE8E5C] dark:text-white dark:group-hover:text-[#DE8E5C] transition">
                        {subject.name}
                      </h3>

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
        ) : (
          <div className="text-center py-16 bg-[#FAF9F6] dark:bg-[#1A1A1A] rounded-2xl border border-[#E3DED5] dark:border-neutral-800 p-8 space-y-3 shadow-sm">
            <GraduationCap className="w-10 h-10 text-[#77736C] mx-auto" />
            <h3 className="text-base font-bold text-[#242321] dark:text-white">Select Your Academic Details</h3>
            <p className="text-xs text-[#77736C] dark:text-gray-400 max-w-sm mx-auto">
              Please choose your College, Course, and {isYearCourse ? 'Year' : 'Semester'} above to view all curriculum subjects.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcademicExplorePage;
