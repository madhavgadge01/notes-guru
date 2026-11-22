import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronRight,
  BookOpen,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  Sparkles,
} from 'lucide-react';
import SEOHead from '../components/common/SEOHead';
import EmptyState from '../components/common/EmptyState';
import {
  getUnitData,
  getSubjectByCode,
  getCourseBySlug,
  IGNOU_INFO,
} from '../data/ignouData';

const IgnouUnitPage = () => {
  const { courseCode, subjectCode, unitNum } = useParams();
  const unitNumber = parseInt(unitNum, 10);

  const unitData = getUnitData(courseCode, subjectCode, unitNumber);
  const course = getCourseBySlug(courseCode);

  if (!unitData) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#F5F3EF] dark:bg-[#141414] p-4">
        <EmptyState
          title="Unit Not Found"
          description={`Unit ${unitNum} for subject "${subjectCode}" was not found.`}
          actionText="Back to Subject"
          actionLink={`/ignou/${courseCode || 'bca'}/${subjectCode || ''}`}
        />
      </div>
    );
  }

  const { unit, block, subject } = unitData;
  const cSlug = course ? course.slug : subject.courseSlug;

  // Compute previous and next units if available
  const allUnits = subject.blocks ? subject.blocks.flatMap((b) => b.units || []) : [];
  const currentIndex = allUnits.findIndex((u) => u.unitNumber === unit.unitNumber);
  const prevUnit = currentIndex > 0 ? allUnits[currentIndex - 1] : null;
  const nextUnit = currentIndex >= 0 && currentIndex < allUnits.length - 1 ? allUnits[currentIndex + 1] : null;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'LearningResource',
      name: `IGNOU ${subject.code} Unit ${unit.unitNumber}: ${unit.title}`,
      description: unit.summary || `Study material and notes for IGNOU ${subject.code} Unit ${unit.unitNumber}.`,
      educationalLevel: 'Undergraduate',
      inLanguage: 'en',
      provider: {
        '@type': 'EducationalOrganization',
        name: 'GenZ Notes',
        url: 'https://genznotes.in',
      },
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
          name: cSlug.toUpperCase(),
          item: `https://genznotes.in/ignou/${cSlug}/`,
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: subject.code,
          item: `https://genznotes.in/ignou/${cSlug}/${subject.code.toLowerCase()}/`,
        },
        {
          '@type': 'ListItem',
          position: 5,
          name: `Unit ${unit.unitNumber}`,
          item: `https://genznotes.in/ignou/${cSlug}/${subject.code.toLowerCase()}/unit-${unit.unitNumber}/`,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F3EF] dark:bg-[#141414] text-[#242321] dark:text-gray-100 pb-24 transition-colors">
      <SEOHead
        title={`IGNOU ${subject.code} Unit ${unit.unitNumber} Notes: ${unit.title} | GenZ Notes`}
        description={
          unit.summary ||
          `Study notes, concepts, and syllabus coverage for IGNOU ${subject.code} Unit ${unit.unitNumber} (${unit.title}).`
        }
        canonical={`https://genznotes.in/ignou/${cSlug}/${subject.code.toLowerCase()}/unit-${unit.unitNumber}/`}
        ogTitle={`IGNOU ${subject.code} Unit ${unit.unitNumber}: ${unit.title} Notes`}
        ogDescription={unit.summary}
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
            to={`/ignou/${cSlug}/`}
            className="hover:text-[#242321] dark:hover:text-white transition"
          >
            {cSlug.toUpperCase()}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#77736C]/60" />
          <Link
            to={`/ignou/${cSlug}/${subject.code.toLowerCase()}/`}
            className="hover:text-[#242321] dark:hover:text-white transition"
          >
            {subject.code}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#77736C]/60" />
          <span className="font-semibold text-[#242321] dark:text-white truncate">
            Unit {unit.unitNumber}
          </span>
        </nav>

        {/* Unit Header */}
        <div className="space-y-2 pb-6 border-b border-[#E3DED5] dark:border-neutral-800">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#DE8E5C]">
            {subject.code} • Block {block.blockNumber}: {block.name}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#242321] dark:text-white tracking-tight">
            Unit {unit.unitNumber}: {unit.title}
          </h1>
          {unit.summary && (
            <p className="text-xs sm:text-sm text-[#77736C] dark:text-gray-400 leading-relaxed max-w-3xl">
              {unit.summary}
            </p>
          )}
        </div>

        {/* Key Concepts / Syllabus Coverage Card */}
        {unit.keyTopics && unit.keyTopics.length > 0 && (
          <section className="p-6 rounded-2xl bg-[#FAF9F6] dark:bg-[#1A1A1A] border border-[#E3DED5] dark:border-neutral-800 space-y-4 shadow-sm">
            <div className="space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#DE8E5C]">
                Syllabus & Core Topics
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#242321] dark:text-white">
                Key Concepts Covered in Unit {unit.unitNumber}
              </h2>
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {unit.keyTopics.map((topic, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F5F3EF] dark:bg-[#141414] border border-[#E3DED5]/70 dark:border-neutral-800/70 text-xs font-medium text-[#242321] dark:text-gray-200"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#DE8E5C] flex-shrink-0 mt-0.5" />
                  <span>{topic}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Study Strategy Tip */}
        <section className="p-5 rounded-2xl bg-[#DE8E5C]/10 border border-[#DE8E5C]/25 text-xs text-[#77736C] dark:text-gray-300 space-y-2">
          <div className="font-bold text-[#242321] dark:text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#DE8E5C]" />
            <span>IGNOU Exam Preparation Strategy</span>
          </div>
          <p className="leading-relaxed">
            For Unit {unit.unitNumber} in {subject.code}, questions in the IGNOU Term-End Examination (TEE) frequently ask for direct conceptual definitions, comparisons, and block diagrams. Ensure you review these key topics thoroughly before exams.
          </p>
        </section>

        {/* Unit Navigation (Previous / Next) */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#E3DED5] dark:border-neutral-800">
          {prevUnit ? (
            <Link
              to={`/ignou/${cSlug}/${subject.code.toLowerCase()}/unit-${prevUnit.unitNumber}/`}
              className="px-4 py-2.5 rounded-xl bg-[#FAF9F6] hover:bg-[#EEEAE3] dark:bg-[#1A1A1A] dark:hover:bg-[#202020] border border-[#E3DED5] dark:border-neutral-800 text-xs font-semibold text-[#242321] dark:text-white flex items-center gap-2 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Unit {prevUnit.unitNumber}</span>
            </Link>
          ) : (
            <div />
          )}

          <Link
            to={`/ignou/${cSlug}/${subject.code.toLowerCase()}/`}
            className="text-xs font-semibold text-[#DE8E5C] hover:underline"
          >
            All {subject.code} Units
          </Link>

          {nextUnit ? (
            <Link
              to={`/ignou/${cSlug}/${subject.code.toLowerCase()}/unit-${nextUnit.unitNumber}/`}
              className="px-4 py-2.5 rounded-xl bg-[#FAF9F6] hover:bg-[#EEEAE3] dark:bg-[#1A1A1A] dark:hover:bg-[#202020] border border-[#E3DED5] dark:border-neutral-800 text-xs font-semibold text-[#242321] dark:text-white flex items-center gap-2 transition"
            >
              <span>Unit {nextUnit.unitNumber}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <div />
          )}
        </div>

        {/* Disclaimer */}
        <div className="pt-6 text-xs text-[#77736C] dark:text-gray-500 border-t border-[#E3DED5] dark:border-neutral-800 leading-relaxed">
          {IGNOU_INFO.disclaimer}
        </div>
      </div>
    </div>
  );
};

export default IgnouUnitPage;
