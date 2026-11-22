import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronRight,
  BookOpen,
  Boxes,
  ArrowRight,
  FileText,
  Lock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import SEOHead from '../components/common/SEOHead';
import EmptyState from '../components/common/EmptyState';
import api from '../services/api';
import {
  getSubjectByCode,
  getCourseBySlug,
  IGNOU_INFO,
} from '../data/ignouData';

const IgnouSubjectPage = () => {
  const { courseCode, subjectCode } = useParams();
  const course = getCourseBySlug(courseCode);
  const subject = getSubjectByCode(courseCode, subjectCode);

  // Optional matching subject in database
  const [dbSubject, setDbSubject] = useState(null);
  const [dbNotes, setDbNotes] = useState([]);

  useEffect(() => {
    if (!subject) return;

    // Check if the backend database has matching notes for this subject
    const checkDb = async () => {
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(subject.code)}`);
        if (res.data?.success && res.data.subjects?.length > 0) {
          const matched = res.data.subjects.find(
            (s) => s.code?.toUpperCase() === subject.code.toUpperCase()
          );
          if (matched) {
            setDbSubject(matched);
            // Fetch notes
            const nRes = await api.get(`/blocks/subject/${matched._id}`);
            if (nRes.data?.success && nRes.data.blocks) {
              setDbNotes(nRes.data.blocks);
            }
          }
        }
      } catch (err) {
        // Silent fallback: static curriculum is rendered flawlessly
      }
    };

    checkDb();
  }, [subject]);

  if (!subject) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#F5F3EF] dark:bg-[#141414] p-4">
        <EmptyState
          title="Subject Not Found"
          description={`The requested IGNOU subject "${subjectCode}" was not found.`}
          actionText="Back to Course"
          actionLink={`/ignou/${courseCode || ''}`}
        />
      </div>
    );
  }

  const courseTitle = course ? course.name : 'Bachelor of Computer Applications';
  const cSlug = course ? course.slug : subject.courseSlug;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: `IGNOU ${subject.code} Notes – ${subject.name}`,
      description: subject.description,
      provider: {
        '@type': 'EducationalOrganization',
        name: 'GenZ Notes',
        url: 'https://genznotes.in',
      },
      educationalLevel: 'Undergraduate',
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
          name: cSlug.toUpperCase(),
          item: `https://genznotes.in/ignou/${cSlug}/`,
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: `Semester ${subject.semesterNumber}`,
          item: `https://genznotes.in/ignou/${cSlug}/semester-${subject.semesterNumber}/`,
        },
        {
          '@type': 'ListItem',
          position: 5,
          name: subject.code,
          item: `https://genznotes.in/ignou/${cSlug}/${subject.code.toLowerCase()}/`,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F3EF] dark:bg-[#141414] text-[#242321] dark:text-gray-100 pb-24 transition-colors">
      <SEOHead
        title={`IGNOU ${subject.code} Notes – ${subject.name} | GenZ Notes`}
        description={
          subject.metaDescription ||
          `Explore IGNOU ${subject.code} ${subject.name} study material, unit-wise notes and learning resources for ${cSlug.toUpperCase()} students.`
        }
        canonical={`https://genznotes.in/ignou/${cSlug}/${subject.code.toLowerCase()}/`}
        ogTitle={`IGNOU ${subject.code} Notes – ${subject.name} | GenZ Notes`}
        ogDescription={subject.description}
        jsonLd={jsonLd}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Academic Breadcrumb */}
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
            to={`/ignou/${cSlug}/semester-${subject.semesterNumber}/`}
            className="hover:text-[#242321] dark:hover:text-white transition"
          >
            Semester {subject.semesterNumber}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#77736C]/60" />
          <span className="font-semibold text-[#242321] dark:text-white truncate">
            {subject.code}
          </span>
        </nav>

        {/* Subject Header */}
        <div className="space-y-2 pb-6 border-b border-[#E3DED5] dark:border-neutral-800">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#DE8E5C]">
            IGNOU • {cSlug.toUpperCase()} • Semester {subject.semesterNumber} • {subject.credits} Credits
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#242321] dark:text-white tracking-tight">
            IGNOU {subject.code} Notes – {subject.name}
          </h1>
          <p className="text-xs sm:text-sm text-[#77736C] dark:text-gray-400 leading-relaxed max-w-3xl">
            {subject.description}
          </p>

          {/* Quick Stats Banner */}
          <div className="flex items-center gap-4 pt-3 flex-wrap text-xs text-[#77736C] dark:text-gray-400">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#DE8E5C]" />
              <span>Course Code: <strong className="text-[#242321] dark:text-white">{subject.code}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Boxes className="w-4 h-4 text-[#DE8E5C]" />
              <span>Credits: <strong className="text-[#242321] dark:text-white">{subject.credits}</strong></span>
            </div>
            {dbSubject && (
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Interactive Digital Reader Available</span>
              </div>
            )}
          </div>
        </div>

        {/* Database Interactive Notes Link (if present) */}
        {dbSubject && (
          <div className="p-4 rounded-2xl bg-[#DE8E5C]/10 border border-[#DE8E5C]/30 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-bold text-[#DE8E5C]">Interactive Digital Reader Active</div>
              <p className="text-xs text-[#77736C] dark:text-gray-300">
                You can read, bookmark, and review the full digital notes for {subject.code} right now.
              </p>
            </div>
            <Link
              to={`/subject/${dbSubject._id}`}
              className="px-4 py-2 bg-[#DE8E5C] hover:bg-[#D47E48] text-white font-semibold text-xs rounded-xl shadow-sm transition whitespace-nowrap"
            >
              Open Subject Reader
            </Link>
          </div>
        )}

        {/* Curriculum Blocks & Units Section */}
        <section className="space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#77736C] dark:text-gray-400">
            Curriculum Structure & Study Units
          </h2>

          {subject.blocks && subject.blocks.length > 0 ? (
            <div className="space-y-5">
              {subject.blocks.map((block) => (
                <div
                  key={block.blockNumber}
                  className="p-5 sm:p-6 bg-[#FAF9F6] dark:bg-[#1A1A1A] border border-[#E3DED5] dark:border-neutral-800 rounded-2xl space-y-4 shadow-sm"
                >
                  <div className="space-y-1 border-b border-[#E3DED5] dark:border-neutral-800 pb-3">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#DE8E5C]">
                      Block {block.blockNumber}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-[#242321] dark:text-white">
                      {block.name}
                    </h3>
                    {block.description && (
                      <p className="text-xs text-[#77736C] dark:text-gray-400">
                        {block.description}
                      </p>
                    )}
                  </div>

                  {/* Units under this block */}
                  <div className="flex flex-col gap-2">
                    {block.units &&
                      block.units.map((unit) => (
                        <Link
                          key={unit.unitNumber}
                          to={`/ignou/${cSlug}/${subject.code.toLowerCase()}/unit-${unit.unitNumber}/`}
                          className="p-3.5 rounded-xl bg-[#F5F3EF] hover:bg-[#EEEAE3] dark:bg-[#141414] dark:hover:bg-[#202020] border border-[#E3DED5]/80 dark:border-neutral-800 transition flex items-center justify-between group"
                        >
                          <div className="space-y-1 pr-3">
                            <div className="text-xs font-bold text-[#242321] dark:text-white group-hover:text-[#DE8E5C] transition">
                              Unit {unit.unitNumber}: {unit.title}
                            </div>
                            {unit.summary && (
                              <p className="text-[11px] text-[#77736C] dark:text-gray-400 line-clamp-1 leading-relaxed">
                                {unit.summary}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#DE8E5C] flex-shrink-0">
                            <span className="hidden sm:inline text-[11px]">View Notes</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </Link>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-[#FAF9F6] dark:bg-[#1A1A1A] border border-[#E3DED5] dark:border-neutral-800 text-xs text-[#77736C] dark:text-gray-400 space-y-2">
              <p className="font-semibold text-[#242321] dark:text-white">
                Detailed unit notes for {subject.code} are currently being curated by our academic team.
              </p>
              <p>
                Browse related semester subjects or search for specific concepts above.
              </p>
            </div>
          )}
        </section>

        {/* Related Subjects Navigation */}
        <section className="pt-6 border-t border-[#E3DED5] dark:border-neutral-800 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#77736C] dark:text-gray-400">
            More IGNOU {cSlug.toUpperCase()} Semester {subject.semesterNumber} Subjects
          </h2>

          <div className="flex flex-wrap gap-2">
            <Link
              to={`/ignou/${cSlug}/semester-${subject.semesterNumber}/`}
              className="px-3 py-2 rounded-xl bg-[#FAF9F6] dark:bg-[#1A1A1A] border border-[#E3DED5] dark:border-neutral-800 text-xs font-semibold text-[#242321] dark:text-gray-200 hover:border-[#DE8E5C] transition"
            >
              ← Back to Semester {subject.semesterNumber} All Subjects
            </Link>
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

export default IgnouSubjectPage;
