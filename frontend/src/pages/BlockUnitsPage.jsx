import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  ChevronRight,
  FileText,
  Boxes,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';
import { BlockUnitsSkeleton } from '../components/common/Skeletons';
import EmptyState from '../components/common/EmptyState';
import SEOHead from '../components/common/SEOHead';

const BlockUnitsPage = () => {
  const { blockId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [block, setBlock] = useState(null);
  const [units, setUnits] = useState([]);
  const [blockNotes, setBlockNotes] = useState([]);

  useEffect(() => {
    const fetchBlockData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/blocks/${blockId}`);
        if (res.data?.success) {
          setBlock(res.data.block);
          setUnits(res.data.units || []);
          setBlockNotes(res.data.blockNotes || []);
        }
      } catch (err) {
        console.error('Failed to load block units:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlockData();
  }, [blockId]);

  if (loading) {
    return <BlockUnitsSkeleton />;
  }

  if (!block) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#F5F3EF] dark:bg-[#141414] p-4">
        <EmptyState
          title="Block Not Found"
          description="The requested academic block does not exist or has been removed."
          actionText="Back to Home"
          actionLink="/"
        />
      </div>
    );
  }

  const subject = block.subjectId || {};
  const semester = block.semesterId || {};
  const course = block.courseId || {};
  const college = block.collegeId || {};

  return (
    <div className="min-h-screen bg-[#F5F3EF] dark:bg-[#141414] text-[#242321] dark:text-gray-100 pb-24 transition-colors">
      <SEOHead
        title={`Block ${block.blockNumber}: ${block.name} – ${subject.name} | GenZ Notes`}
        description={
          block.description ||
          `Academic block ${block.blockNumber} study units and digital notes for ${subject.name}.`
        }
        canonical={`https://genznotes.in/block/${blockId}`}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Academic Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-xs text-[#77736C] dark:text-gray-400 flex-wrap">
          <Link to="/" className="hover:text-[#242321] dark:hover:text-white transition">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#77736C]/60" />
          <span>{college.code || college.name}</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#77736C]/60" />
          <span>{course.name}</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#77736C]/60" />
          <Link
            to={`/available-subjects?semesterId=${semester._id || semester}`}
            className="hover:text-[#242321] dark:hover:text-white transition"
          >
            {semester.name}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#77736C]/60" />
          <Link to={`/subject/${subject._id}`} className="hover:text-[#242321] dark:hover:text-white transition">
            {subject.name}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#77736C]/60" />
          <span className="font-semibold text-[#242321] dark:text-white truncate">Block {block.blockNumber}</span>
        </nav>

        {/* Block Header */}
        <div className="space-y-2 pb-6 border-b border-[#E3DED5] dark:border-neutral-800">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#DE8E5C]">
            Block {block.blockNumber} • {subject.name}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#242321] dark:text-white tracking-tight">
            {block.name}
          </h1>

          {/* Optional Admin-Controlled Description ONLY */}
          {block.description && block.description.trim() !== '' && (
            <p className="text-xs sm:text-sm text-[#77736C] dark:text-gray-400 leading-relaxed max-w-3xl">
              {block.description}
            </p>
          )}
        </div>

        {/* Block-Level Direct Notes (if any) */}
        {blockNotes.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#77736C] dark:text-gray-400">
              Block Level Overview Notes
            </h2>
            <div className="flex flex-col gap-2.5">
              {blockNotes.map((note) => (
                <Link
                  key={note._id}
                  to={`/reader/${note._id}`}
                  className="p-4 sm:p-5 rounded-2xl bg-[#FAF9F6] hover:bg-[#EEEAE3] dark:bg-[#1A1A1A] dark:hover:bg-[#202020] border border-[#E3DED5] hover:border-[#D6D0C5] dark:border-neutral-800 flex items-center justify-between gap-4 transition shadow-sm group"
                >
                  <div className="flex items-center gap-3 truncate">
                    <BookOpen className="w-5 h-5 text-[#DE8E5C] flex-shrink-0" />
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-[#242321] group-hover:text-[#DE8E5C] dark:text-white dark:group-hover:text-[#DE8E5C] transition">
                        {note.title}
                      </h4>
                      <span className="text-[11px] text-[#77736C] dark:text-gray-400">
                        {note.type === 'quick' ? 'Exam Revision Note' : 'Comprehensive Theory Note'}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#77736C] group-hover:text-[#DE8E5C] transition flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Units Section */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#77736C] dark:text-gray-400">
            Syllabus Units
          </h2>

          {units.length === 0 ? (
            <div className="text-center py-16 bg-[#FAF9F6] dark:bg-[#1A1A1A] rounded-2xl border border-[#E3DED5] dark:border-neutral-800 p-8 space-y-3 shadow-sm">
              <Boxes className="w-8 h-8 text-[#77736C] mx-auto" />
              <h3 className="text-base font-bold text-[#242321] dark:text-white">No Units Listed</h3>
              <p className="text-xs text-[#77736C] dark:text-gray-400 max-w-sm mx-auto">
                Units under this block will be added soon.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {units.map((unit) => (
                <div
                  key={unit._id}
                  className="w-full p-5 sm:p-6 bg-[#FAF9F6] dark:bg-[#1A1A1A] border border-[#E3DED5] dark:border-neutral-800 rounded-2xl space-y-3 shadow-sm"
                >
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[#242321] dark:text-white">
                      Unit {unit.unitNumber}: {unit.title}
                    </h3>
                    {unit.description && unit.description.trim() !== '' && (
                      <p className="text-xs text-[#77736C] dark:text-gray-400 mt-1 leading-relaxed">
                        {unit.description}
                      </p>
                    )}
                  </div>

                  {/* Notes under this Unit */}
                  {unit.notes && unit.notes.length > 0 ? (
                    <div className="pt-3 border-t border-[#E3DED5] dark:border-neutral-800/80 flex flex-col gap-2">
                      {unit.notes.map((note) => (
                        <Link
                          key={note._id}
                          to={`/reader/${note._id}`}
                          className="flex items-center justify-between p-3 rounded-xl bg-[#EEEAE3] dark:bg-neutral-900 hover:bg-[#E5E0D7] dark:hover:bg-neutral-800/80 border border-[#E3DED5] dark:border-neutral-800 text-xs font-semibold text-[#242321] dark:text-white hover:text-[#DE8E5C] transition"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <BookOpen className="w-4 h-4 text-[#DE8E5C] flex-shrink-0" />
                            <span className="truncate">{note.title}</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-[#77736C]" />
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="pt-2 text-[11px] text-[#77736C] dark:text-gray-500 italic">
                      Notes for this unit are being prepared.
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlockUnitsPage;
