import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  Search,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileText,
  HelpCircle,
} from 'lucide-react';
import SEOHead from '../components/common/SEOHead';
import { IGNOU_INFO, IGNOU_COURSES, IGNOU_SUBJECTS } from '../data/ignouData';

const IgnouLandingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseTab, setSelectedCourseTab] = useState('bca');

  const coursesList = Object.values(IGNOU_COURSES);
  const activeCourse = IGNOU_COURSES[selectedCourseTab] || IGNOU_COURSES.bca;

  // Filter subjects based on search query
  const allSubjects = Object.values(IGNOU_SUBJECTS);
  const filteredSubjects = searchQuery.trim()
    ? allSubjects.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      name: 'GenZ Notes',
      url: 'https://genznotes.in',
      logo: 'https://genznotes.in/logo.png',
      description:
        'Syllabus-aligned college study notes, solved unit materials, and exam revision resources for IGNOU students.',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://genznotes.in/',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'IGNOU Study Material',
          item: 'https://genznotes.in/ignou/',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F3EF] dark:bg-[#141414] text-[#242321] dark:text-gray-100 transition-colors pb-24">
      <SEOHead
        title="IGNOU Study Material & Notes – BCA, MCA, B.Com, BA | GenZ Notes"
        description="Access comprehensive IGNOU study notes, unit-wise syllabus summaries, solved question papers, and digital revision guides for BCA, MCA, B.Com, and BA students."
        canonical="https://genznotes.in/ignou/"
        ogTitle="IGNOU Study Material & Notes – BCA, MCA, B.Com, BA | GenZ Notes"
        ogDescription="Explore high-yield IGNOU notes and chapter summaries organized by Course, Semester, and Subject on GenZ Notes."
        jsonLd={jsonLd}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-12 sm:pb-16 border-b border-[#E3DED5] dark:border-neutral-800 bg-[#FAF9F6] dark:bg-[#171717]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-[#77736C] dark:text-gray-400">
            <Link to="/" className="hover:text-[#242321] dark:hover:text-white transition">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#77736C]/60" />
            <span className="font-semibold text-[#242321] dark:text-white">IGNOU</span>
          </nav>

          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#DE8E5C]/10 text-[#DE8E5C] border border-[#DE8E5C]/20">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>IGNOU Distance Learning Hub</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#242321] dark:text-white tracking-tight leading-tight">
              IGNOU Study Notes & Exam Preparation Resources
            </h1>

            <p className="text-sm sm:text-base text-[#77736C] dark:text-gray-400 leading-relaxed">
              High-yield, syllabus-aligned academic study material, unit-by-unit chapter notes, and solved questions specifically organized for Indira Gandhi National Open University students.
            </p>
          </div>

          {/* Search Box */}
          <div className="max-w-xl">
            <div className="relative">
              <Search className="w-4 h-4 text-[#77736C] dark:text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search IGNOU subjects, codes (e.g. BCS-011, BCS-012, MCS-011)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#EEEAE3] dark:bg-neutral-900 focus:bg-[#FAF9F6] dark:focus:bg-neutral-800 border border-[#E3DED5] dark:border-neutral-700 focus:border-[#DE8E5C] rounded-xl text-sm text-[#242321] dark:text-white placeholder-[#77736C] dark:placeholder-gray-400 focus:outline-none transition shadow-sm"
              />
            </div>

            {/* Instant Search Results Dropdown */}
            {searchQuery.trim() && (
              <div className="mt-2 p-3 bg-[#FAF9F6] dark:bg-[#1A1A1A] border border-[#E3DED5] dark:border-neutral-800 rounded-2xl shadow-lg space-y-2 max-h-80 overflow-y-auto">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#77736C] dark:text-gray-400 px-2">
                  Matching IGNOU Subjects ({filteredSubjects.length})
                </div>
                {filteredSubjects.length > 0 ? (
                  filteredSubjects.map((sub) => (
                    <Link
                      key={sub.code}
                      to={`/ignou/${sub.courseSlug}/${sub.code.toLowerCase()}/`}
                      className="block p-3 rounded-xl hover:bg-[#EEEAE3] dark:hover:bg-neutral-800 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#DE8E5C]">{sub.code}</span>
                        <span className="text-[11px] text-[#77736C] dark:text-gray-400 uppercase">
                          {sub.courseSlug.toUpperCase()} • Sem {sub.semesterNumber}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-[#242321] dark:text-white mt-0.5">
                        {sub.name}
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-xs text-[#77736C] dark:text-gray-400 p-2">
                    No subjects matched "{searchQuery}". Browse available courses below.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-12">
        {/* Available IGNOU Courses Grid */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#E3DED5] dark:border-neutral-800 pb-3">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#DE8E5C]">
                Degree Programs
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#242321] dark:text-white tracking-tight">
                Available IGNOU Courses
              </h2>
            </div>
            <p className="text-xs text-[#77736C] dark:text-gray-400">
              Select a program to access semester-wise notes & syllabus
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {coursesList.map((course) => (
              <Link
                key={course.slug}
                to={`/ignou/${course.slug}/`}
                className="group p-5 bg-[#FAF9F6] hover:bg-[#EEEAE3] dark:bg-[#1A1A1A] dark:hover:bg-[#202020] border border-[#E3DED5] hover:border-[#D6D0C5] dark:border-neutral-800 dark:hover:border-neutral-700 rounded-2xl transition duration-150 flex flex-col justify-between shadow-sm space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-[#DE8E5C]/10 text-[#DE8E5C] uppercase tracking-wide">
                      {course.code}
                    </span>
                    <span className="text-[11px] text-[#77736C] dark:text-gray-400 font-medium">
                      {course.duration}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-[#242321] dark:text-white group-hover:text-[#DE8E5C] transition">
                    {course.name}
                  </h3>
                  <p className="text-xs text-[#77736C] dark:text-gray-400 line-clamp-2 leading-relaxed">
                    {course.overview}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#E3DED5]/70 dark:border-neutral-800/70 text-xs font-semibold text-[#DE8E5C]">
                  <span>{course.totalSemesters} Semesters</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* BCA Semester Explorer Section */}
        <section className="space-y-6 bg-[#FAF9F6] dark:bg-[#1A1A1A] border border-[#E3DED5] dark:border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#DE8E5C]">
              Featured Program
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#242321] dark:text-white tracking-tight">
              IGNOU BCA Semester-Wise Study Notes
            </h2>
            <p className="text-xs sm:text-sm text-[#77736C] dark:text-gray-400 leading-relaxed">
              Explore syllabus breakdown, units, and high-scoring notes organized semester-by-semester for Bachelor of Computer Applications.
            </p>
          </div>

          {/* Course Tabs (BCA, MCA) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {coursesList.map((course) => (
              <button
                key={course.slug}
                onClick={() => setSelectedCourseTab(course.slug)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  selectedCourseTab === course.slug
                    ? 'bg-[#DE8E5C] text-white shadow-sm'
                    : 'bg-[#EEEAE3] dark:bg-neutral-800 text-[#77736C] dark:text-gray-400 hover:text-[#242321] dark:hover:text-white'
                }`}
              >
                {course.code}
              </button>
            ))}
          </div>

          {/* Semesters Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {activeCourse.semesters.map((sem) => (
              <Link
                key={sem.semesterNumber}
                to={`/ignou/${activeCourse.slug}/semester-${sem.semesterNumber}/`}
                className="p-4 rounded-xl bg-[#F5F3EF] hover:bg-[#EEEAE3] dark:bg-[#141414] dark:hover:bg-[#1c1c1c] border border-[#E3DED5] dark:border-neutral-800 transition flex items-center justify-between group"
              >
                <div className="space-y-1">
                  <div className="text-xs font-bold text-[#242321] dark:text-white group-hover:text-[#DE8E5C] transition">
                    Semester {sem.semesterNumber}
                  </div>
                  <div className="text-[11px] text-[#77736C] dark:text-gray-400">
                    {sem.subjects.length} Subjects Included
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#77736C] group-hover:translate-x-0.5 group-hover:text-[#DE8E5C] transition" />
              </Link>
            ))}
          </div>
        </section>

        {/* Popular IGNOU Subject Notes Spotlight */}
        <section className="space-y-4">
          <div className="border-b border-[#E3DED5] dark:border-neutral-800 pb-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#DE8E5C]">
              Direct Subject Notes
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#242321] dark:text-white tracking-tight">
              Popular IGNOU BCA Subject Notes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {['bcs-011', 'bcs-012', 'bcs-031', 'bcs-040', 'bcs-051', 'bcs-053'].map((code) => {
              const sub = IGNOU_SUBJECTS[code];
              if (!sub) return null;
              return (
                <Link
                  key={sub.code}
                  to={`/ignou/${sub.courseSlug}/${sub.code.toLowerCase()}/`}
                  className="group p-5 bg-[#FAF9F6] hover:bg-[#EEEAE3] dark:bg-[#1A1A1A] dark:hover:bg-[#202020] border border-[#E3DED5] hover:border-[#D6D0C5] dark:border-neutral-800 dark:hover:border-neutral-700 rounded-2xl transition duration-150 flex flex-col justify-between shadow-sm space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#DE8E5C]">{sub.code}</span>
                      <span className="text-[11px] text-[#77736C] dark:text-gray-400 uppercase">
                        Semester {sub.semesterNumber} • {sub.credits} Credits
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-[#242321] dark:text-white group-hover:text-[#DE8E5C] transition">
                      {sub.name}
                    </h3>
                    <p className="text-xs text-[#77736C] dark:text-gray-400 line-clamp-2 leading-relaxed">
                      {sub.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#E3DED5]/70 dark:border-neutral-800/70 text-xs font-semibold text-[#DE8E5C]">
                    <span>Explore Units & Syllabus</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Why GenZ Notes for IGNOU Students */}
        <section className="bg-[#FAF9F6] dark:bg-[#1A1A1A] border border-[#E3DED5] dark:border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#DE8E5C]">
              Academic Advantage
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#242321] dark:text-white tracking-tight">
              Why Prepare with GenZ Notes?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-xl bg-[#DE8E5C]/10 text-[#DE8E5C] flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-[#242321] dark:text-white">
                100% Syllabus Aligned
              </h3>
              <p className="text-xs text-[#77736C] dark:text-gray-400 leading-relaxed">
                Structured unit-by-unit according to IGNOU curriculum guidelines, ensuring you cover every topic asked in Term-End Examinations (TEE).
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-8 h-8 rounded-xl bg-[#DE8E5C]/10 text-[#DE8E5C] flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-[#242321] dark:text-white">
                High-Yield Chapter Summaries
              </h3>
              <p className="text-xs text-[#77736C] dark:text-gray-400 leading-relaxed">
                Cut through hundreds of pages of bulky PDFs. Focus on crisp derivations, conceptual definitions, solved examples, and key diagrams.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-8 h-8 rounded-xl bg-[#DE8E5C]/10 text-[#DE8E5C] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-[#242321] dark:text-white">
                Distraction-Free Digital Reader
              </h3>
              <p className="text-xs text-[#77736C] dark:text-gray-400 leading-relaxed">
                Clean digital reader interface with dark/light themes, bookmarks, table of contents, and automatic reading progress tracking across devices.
              </p>
            </div>
          </div>
        </section>

        {/* Academic Disclaimer Notice */}
        <section className="p-4 rounded-2xl bg-[#EEEAE3] dark:bg-neutral-900 border border-[#E3DED5] dark:border-neutral-800 text-xs text-[#77736C] dark:text-gray-400 space-y-1">
          <div className="font-bold text-[#242321] dark:text-gray-200">
            Independent Educational Resource Notice
          </div>
          <p className="leading-relaxed">
            {IGNOU_INFO.disclaimer} All registered course codes (e.g. BCS-011, BCS-012, MCS-011) and program names are referenced strictly for educational indexing and student navigation purposes.
          </p>
        </section>
      </div>
    </div>
  );
};

export default IgnouLandingPage;
