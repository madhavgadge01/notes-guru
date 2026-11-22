import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronRight,
  BookOpen,
  Boxes,
  ArrowRight,
  Lock,
} from 'lucide-react';
import api from '../services/api';
import { SubjectDetailsSkeleton } from '../components/common/Skeletons';
import EmptyState from '../components/common/EmptyState';

const SubjectDetailsPage = () => {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [fallbackUnits, setFallbackUnits] = useState([]);

  useEffect(() => {
    const fetchSubjectData = async () => {
      try {
        setLoading(true);

        // Fetch subject details and blocks
        const res = await api.get(`/blocks/subject/${id}`);
        if (res.data?.success) {
          setSubject(res.data.subject);
          setBlocks(res.data.blocks || []);
        } else {
          // Fallback if blocks route returns no subject
          const sRes = await api.get(`/subjects/${id}`);
          if (sRes.data?.success) {
            setSubject(sRes.data.subject);
            setFallbackUnits(sRes.data.units || []);
          }
        }
      } catch (err) {
        console.error('Failed to load subject details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjectData();
  }, [id]);

  if (loading) {
    return <SubjectDetailsSkeleton />;
  }

  if (!subject) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#F5F3EF] dark:bg-[#141414] p-4">
        <EmptyState
          title="Subject Not Found"
          description="The requested subject does not exist or has been removed."
          actionText="Back to Home"
          actionLink="/"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F3EF] dark:bg-[#141414] text-[#242321] dark:text-gray-100 pb-24 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Academic Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-[#77736C] dark:text-gray-400 flex-wrap">
          <Link to="/" className="hover:text-[#242321] dark:hover:text-white transition">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#77736C]/60" />
          <span>{subject.college?.code || subject.college?.name}</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#77736C]/60" />
          <span>{subject.course?.name}</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#77736C]/60" />
          <Link
            to={`/available-subjects?semesterId=${subject.semester?._id || subject.semester}`}
            className="hover:text-[#242321] dark:hover:text-white transition"
          >
            {subject.semester?.name}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#77736C]/60" />
          <span className="font-semibold text-[#242321] dark:text-white truncate">{subject.name}</span>
        </nav>

        {/* Subject Header */}
        <div className="space-y-2 pb-6 border-b border-[#E3DED5] dark:border-neutral-800">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#DE8E5C]">
            {subject.course?.name} • {subject.semester?.name}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#242321] dark:text-white tracking-tight">
            {subject.name}
          </h1>

          {/* Optional Admin-Controlled Description ONLY */}
          {subject.description && subject.description.trim() !== '' && (
            <p className="text-xs sm:text-sm text-[#77736C] dark:text-gray-400 leading-relaxed max-w-3xl">
              {subject.description}
            </p>
          )}
        </div>

        {/* Blocks Section Header */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#77736C] dark:text-gray-400 mb-4">
            Curriculum Blocks
          </h2>

          {/* Blocks List (Full-Width, Stacked Vertically, NO PRICES) */}
          {blocks.length > 0 ? (
            <div className="flex flex-col gap-3">
              {blocks.map((block) => (
                <Link
                  key={block._id}
                  to={`/block/${block._id}`}
                  className="group w-full p-5 sm:p-6 bg-[#FAF9F6] hover:bg-[#EEEAE3] dark:bg-[#1A1A1A] dark:hover:bg-[#202020] border border-[#E3DED5] hover:border-[#D6D0C5] dark:border-neutral-800 dark:hover:border-neutral-700 rounded-2xl transition duration-150 flex items-center justify-between gap-4 shadow-sm"
                >
                  <div className="space-y-1.5 flex-1 pr-4">
                    <h3 className="text-base sm:text-lg font-bold text-[#242321] group-hover:text-[#DE8E5C] dark:text-white dark:group-hover:text-[#DE8E5C] transition">
                      Block {block.blockNumber}: {block.name}
                    </h3>

                    {/* Optional Short Description ONLY */}
                    {block.description && block.description.trim() !== '' && (
                      <p className="text-xs text-[#77736C] dark:text-gray-400 line-clamp-2 leading-relaxed">
                        {block.description}
                      </p>
                    )}
                  </div>

                  <div className="w-8 h-8 rounded-xl bg-[#EEEAE3] dark:bg-neutral-900 group-hover:bg-[#DE8E5C]/15 flex items-center justify-center text-[#77736C] group-hover:text-[#DE8E5C] flex-shrink-0 transition">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </Link>
              ))}
            </div>
          ) : fallbackUnits.length > 0 ? (
            /* Fallback Units if subject has no blocks */
            <div className="flex flex-col gap-3">
              {fallbackUnits.map((unit) => (
                <div
                  key={unit._id}
                  className="w-full p-5 sm:p-6 bg-[#FAF9F6] dark:bg-[#1A1A1A] border border-[#E3DED5] dark:border-neutral-800 rounded-2xl space-y-3 shadow-sm"
                >
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[#242321] dark:text-white">
                      Unit {unit.unitNumber}: {unit.title}
                    </h3>
                    {unit.description && unit.description.trim() !== '' && (
                      <p className="text-xs text-[#77736C] dark:text-gray-400 mt-1 leading-relaxed">{unit.description}</p>
                    )}
                  </div>

                  {unit.notes && unit.notes.length > 0 && (
                    <div className="pt-2 border-t border-[#E3DED5] dark:border-neutral-800/80 flex flex-col gap-2">
                      {unit.notes.map((note) => (
                        <Link
                          key={note._id}
                          to={`/reader/${note._id}`}
                          className="flex items-center justify-between p-3 rounded-xl bg-[#EEEAE3] dark:bg-neutral-900 hover:bg-[#E5E0D7] dark:hover:bg-neutral-800/80 border border-[#E3DED5] dark:border-neutral-800 text-xs font-semibold text-[#242321] dark:text-white hover:text-[#DE8E5C] transition"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <BookOpen className="w-4 h-4 text-[#DE8E5C] flex-shrink-0" />
                            <span className="truncate">{note.title}</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-[#77736C]" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-[#FAF9F6] dark:bg-[#1A1A1A] rounded-2xl border border-[#E3DED5] dark:border-neutral-800 p-8 space-y-3 shadow-sm">
              <Boxes className="w-8 h-8 text-[#77736C] mx-auto" />
              <h3 className="text-base font-bold text-[#242321] dark:text-white">No Blocks Available</h3>
              <p className="text-xs text-[#77736C] dark:text-gray-400 max-w-sm mx-auto">
                Blocks for this subject will be published soon.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubjectDetailsPage;
