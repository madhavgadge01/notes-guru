import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronRight,
  BookOpen,
  GraduationCap,
  ArrowRight,
  FileText,
  Layers,
  ArrowLeft,
} from 'lucide-react';
import SEOHead from '../components/common/SEOHead';
import EmptyState from '../components/common/EmptyState';
import { getCourseBySlug, IGNOU_COURSES, IGNOU_SUBJECTS, IGNOU_INFO } from '../data/ignouData';

const IgnouCoursePage = () => {
  const { courseCode } = useParams();
  const course = getCourseBySlug(courseCode);

  if (!course) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#F5F3EF] dark:bg-[#141414] p-4">
        <EmptyState
          title="Course Not Found"
          description={`The requested IGNOU course "${courseCode}" was not found or is currently unavailable.`}
          actionText="Back to IGNOU Hub"
          actionLink="/ignou"
        />
      </div>
    );
  }

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: `IGNOU ${course.code} – ${course.name}`,
      description: course.overview,
      provider: {
        '@type': 'EducationalOrganization',
        name: 'GenZ Notes',
        url: 'https://genznotes.in',
      },
      educationalLevel: course.degreeType,
      inLanguage: 'en',
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
          name: 'IGNOU',
          item: 'https://genznotes.in/ignou/',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: course.code,
          item: `https://genznotes.in/ignou/${course.slug}/`,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F3EF] dark:bg-[#141414] text-[#242321] dark:text-gray-100 pb-24 transition-colors">
      <SEOHead
        title={`IGNOU ${course.code} Notes – ${course.name} Study Material | GenZ Notes`}
        description={`Comprehensive IGNOU ${course.code} study notes, semester-wise subjects, syllabus breakdowns, and exam preparation guides for ${course.name} students.`}
        canonical={`https://genznotes.in/ignou/${course.slug}/`}
        ogTitle={`IGNOU ${course.code} Study Material & Notes | GenZ Notes`}
        ogDescription={course.overview}
        jsonLd={jsonLd}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Academic Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-xs text-[#77736C] dark:text-gray-400 flex-wrap">
          <Link to="/" className="hover:text-[#242321] dark:hover:text-white transition">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#77736C]/60" />
          <Link to="/ignou" className="hover:text-[#242321] dark:hover:text-white transition">
            IGNOU
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#77736C]/60" />
          <span className="font-semibold text-[#242321] dark:text-white truncate">
            {course.code}
          </span>
        </nav>

        {/* Course Header */}
        <div className="space-y-2 pb-6 border-b border-[#E3DED5] dark:border-neutral-800">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#DE8E5C]">
            IGNOU • {course.degreeType} • {course.duration}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#242321] dark:text-white tracking-tight">
            IGNOU {course.code} Notes & Study Material
          </h1>
          <p className="text-xs sm:text-sm text-[#77736C] dark:text-gray-400 leading-relaxed max-w-3xl">
            {course.overview}
          </p>
        </div>

        {/* Semester-Wise Breakdown */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#77736C] dark:text-gray-400">
            Semester-Wise Notes & Curriculum
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {course.semesters.map((sem) => (
              <Link
                key={sem.semesterNumber}
                to={`/ignou/${course.slug}/semester-${sem.semesterNumber}/`}
                className="group p-5 bg-[#FAF9F6] hover:bg-[#EEEAE3] dark:bg-[#1A1A1A] dark:hover:bg-[#202020] border border-[#E3DED5] hover:border-[#D6D0C5] dark:border-neutral-800 dark:hover:border-neutral-700 rounded-2xl transition duration-150 flex flex-col justify-between shadow-sm space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-[#DE8E5C]/10 text-[#DE8E5C] uppercase tracking-wide">
                      Semester {sem.semesterNumber}
                    </span>
                    <span className="text-[11px] text-[#77736C] dark:text-gray-400 font-medium">
                      {sem.subjects.length} Subjects
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-[#242321] dark:text-white group-hover:text-[#DE8E5C] transition">
                    {sem.title}
                  </h3>
                  <p className="text-xs text-[#77736C] dark:text-gray-400 leading-relaxed">
                    {sem.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#E3DED5]/70 dark:border-neutral-800/70 text-xs font-semibold text-[#DE8E5C]">
                  <span>View Semester Notes</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* All Subjects Listed Under this Course */}
        <section className="space-y-4 pt-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#77736C] dark:text-gray-400">
            All {course.code} Subjects
          </h2>

          <div className="flex flex-col gap-2.5">
            {course.semesters.flatMap((sem) =>
              sem.subjects.map((subCode) => {
                const sub = IGNOU_SUBJECTS[subCode];
                if (!sub) return null;
                return (
                  <Link
                    key={sub.code}
                    to={`/ignou/${course.slug}/${sub.code.toLowerCase()}/`}
                    className="p-4 sm:p-5 rounded-2xl bg-[#FAF9F6] hover:bg-[#EEEAE3] dark:bg-[#1A1A1A] dark:hover:bg-[#202020] border border-[#E3DED5] hover:border-[#D6D0C5] dark:border-neutral-800 flex items-center justify-between gap-4 transition shadow-sm group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#DE8E5C]">{sub.code}</span>
                        <span className="text-[11px] text-[#77736C] dark:text-gray-400 uppercase">
                          • Semester {sem.semesterNumber} • {sub.credits} Credits
                        </span>
                      </div>
                      <div className="font-bold text-sm text-[#242321] dark:text-white group-hover:text-[#DE8E5C] transition">
                        {sub.name}
                      </div>
                      <p className="text-xs text-[#77736C] dark:text-gray-400 line-clamp-1">
                        {sub.description}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#77736C] group-hover:translate-x-1 group-hover:text-[#DE8E5C] transition flex-shrink-0" />
                  </Link>
                );
              })
            )}
          </div>
        </section>

        {/* Disclaimer */}
        <div className="pt-4 text-xs text-[#77736C] dark:text-gray-500 border-t border-[#E3DED5] dark:border-neutral-800 leading-relaxed">
          {IGNOU_INFO.disclaimer}
        </div>
      </div>
    </div>
  );
};

export default IgnouCoursePage;
