import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronRight,
  BookOpen,
  ArrowRight,
  GraduationCap,
  Boxes,
} from 'lucide-react';
import SEOHead from '../components/common/SEOHead';
import EmptyState from '../components/common/EmptyState';
import {
  getCourseBySlug,
  getSemesterSubjects,
  IGNOU_INFO,
} from '../data/ignouData';

const IgnouSemesterPage = () => {
  const { courseCode, semNum } = useParams();
  const course = getCourseBySlug(courseCode);
  const semesterNumber = parseInt(semNum, 10);
  const subjects = getSemesterSubjects(courseCode, semesterNumber);

  if (!course || isNaN(semesterNumber)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#F5F3EF] dark:bg-[#141414] p-4">
        <EmptyState
          title="Semester Not Found"
          description={`The requested semester was not found for course "${courseCode}".`}
          actionText="Back to Course"
          actionLink={`/ignou/${courseCode || ''}`}
        />
      </div>
    );
  }

  const jsonLd = [
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
        {
          '@type': 'ListItem',
          position: 4,
          name: `Semester ${semesterNumber}`,
          item: `https://genznotes.in/ignou/${course.slug}/semester-${semesterNumber}/`,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F3EF] dark:bg-[#141414] text-[#242321] dark:text-gray-100 pb-24 transition-colors">
      <SEOHead
        title={`IGNOU ${course.code} Semester ${semesterNumber} Notes & Study Material | GenZ Notes`}
        description={`Study notes, unit summaries, and exam preparation material for IGNOU ${course.code} Semester ${semesterNumber} subjects including ${subjects.map((s) => s.code).join(', ')}.`}
        canonical={`https://genznotes.in/ignou/${course.slug}/semester-${semesterNumber}/`}
        ogTitle={`IGNOU ${course.code} Semester ${semesterNumber} Notes | GenZ Notes`}
        ogDescription={`Complete unit-wise study notes and curriculum breakdown for IGNOU ${course.code} Semester ${semesterNumber}.`}
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
          <Link
            to={`/ignou/${course.slug}/`}
            className="hover:text-[#242321] dark:hover:text-white transition"
          >
            {course.code}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#77736C]/60" />
          <span className="font-semibold text-[#242321] dark:text-white truncate">
            Semester {semesterNumber}
          </span>
        </nav>

        {/* Semester Header */}
        <div className="space-y-2 pb-6 border-b border-[#E3DED5] dark:border-neutral-800">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#DE8E5C]">
            {course.name} • Semester {semesterNumber}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#242321] dark:text-white tracking-tight">
            IGNOU {course.code} Semester {semesterNumber} Notes
          </h1>
          <p className="text-xs sm:text-sm text-[#77736C] dark:text-gray-400 leading-relaxed max-w-3xl">
            Unit-wise notes, chapter explanations, solved questions, and exam revision guides for all prescribed subjects in Semester {semesterNumber}.
          </p>
        </div>

        {/* Other Semesters Navigation Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {course.semesters.map((s) => (
            <Link
              key={s.semesterNumber}
              to={`/ignou/${course.slug}/semester-${s.semesterNumber}/`}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                s.semesterNumber === semesterNumber
                  ? 'bg-[#DE8E5C] text-white shadow-sm'
                  : 'bg-[#FAF9F6] dark:bg-[#1A1A1A] border border-[#E3DED5] dark:border-neutral-800 text-[#77736C] dark:text-gray-400 hover:text-[#242321] dark:hover:text-white'
              }`}
            >
              Semester {s.semesterNumber}
            </Link>
          ))}
        </div>

        {/* Subjects List */}
        <section className="space-y-3 pt-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#77736C] dark:text-gray-400">
            Prescribed Subjects ({subjects.length})
          </h2>

          <div className="flex flex-col gap-3">
            {subjects.map((sub) => (
              <Link
                key={sub.code}
                to={`/ignou/${course.slug}/${sub.code.toLowerCase()}/`}
                className="group w-full p-5 sm:p-6 bg-[#FAF9F6] hover:bg-[#EEEAE3] dark:bg-[#1A1A1A] dark:hover:bg-[#202020] border border-[#E3DED5] hover:border-[#D6D0C5] dark:border-neutral-800 dark:hover:border-neutral-700 rounded-2xl transition duration-150 flex items-center justify-between gap-4 shadow-sm"
              >
                <div className="space-y-1.5 flex-1 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#DE8E5C]">{sub.code}</span>
                    <span className="text-[11px] text-[#77736C] dark:text-gray-400">
                      • {sub.credits} Credits • {sub.blocks ? `${sub.blocks.length} Curriculum Blocks` : 'Curriculum Units'}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#242321] dark:text-white group-hover:text-[#DE8E5C] transition">
                    {sub.name}
                  </h3>
                  <p className="text-xs text-[#77736C] dark:text-gray-400 line-clamp-2 leading-relaxed">
                    {sub.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-[#DE8E5C] flex-shrink-0">
                  <span className="hidden sm:inline">Explore Units</span>
                  <div className="w-8 h-8 rounded-full bg-[#DE8E5C]/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-4 h-4 text-[#DE8E5C]" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Disclaimer */}
        <div className="pt-6 text-xs text-[#77736C] dark:text-gray-500 border-t border-[#E3DED5] dark:border-neutral-800 leading-relaxed">
          {IGNOU_INFO.disclaimer}
        </div>
      </div>
    </div>
  );
};

export default IgnouSemesterPage;
