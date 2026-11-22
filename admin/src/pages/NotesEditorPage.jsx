import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Building2,
  GraduationCap,
  Calendar,
  BookOpen,
  Layers,
  FileText,
  Plus,
  Trash2,
  Save,
  Eye,
  Check,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Search,
  RotateCcw,
  Heading,
  Bold,
  Italic,
  List,
  ListOrdered,
  Table as TableIcon,
  Image as ImageIcon,
  Link2,
  Sigma,
  Zap,
} from 'lucide-react';
import api from '../services/api';
import AdminHeader from '../components/common/AdminHeader';
import NotesReader from '../components/reader/NotesReader';

const NotesEditorPage = () => {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const isEditing = !!noteId && noteId !== 'new';

  // Step 1 to 7 navigation
  // 1: College, 2: Course, 3: Semester, 4: Subject, 5: Block, 6: Unit, 7: Notes Editor
  const [currentStep, setCurrentStep] = useState(isEditing ? 7 : 1);

  // Hierarchy Data Lists
  const [colleges, setColleges] = useState([]);
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [units, setUnits] = useState([]);

  // Selected Entities
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);

  // Search Filters for steps
  const [searchCollege, setSearchCollege] = useState('');
  const [searchCourse, setSearchCourse] = useState('');
  const [searchSubject, setSearchSubject] = useState('');

  // Inline Creation form state for Block
  const [showNewBlockForm, setShowNewBlockForm] = useState(false);
  const [newBlockNumber, setNewBlockNumber] = useState(1);
  const [newBlockName, setNewBlockName] = useState('');
  const [newBlockDesc, setNewBlockDesc] = useState('');
  const [creatingBlock, setCreatingBlock] = useState(false);

  // Inline Creation form state for Unit
  const [showNewUnitForm, setShowNewUnitForm] = useState(false);
  const [newUnitNumber, setNewUnitNumber] = useState(1);
  const [newUnitTitle, setNewUnitTitle] = useState('');
  const [newUnitDesc, setNewUnitDesc] = useState('');
  const [creatingUnit, setCreatingUnit] = useState(false);

  // Note Content & Metadata (preserved during any back/forward navigation)
  const [title, setTitle] = useState('');
  const [type, setType] = useState('normal'); // 'normal' | 'quick'
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(25);
  const [discountedPrice, setDiscountedPrice] = useState(19);
  const [previewPageCount, setPreviewPageCount] = useState(2);
  const [status, setStatus] = useState('published'); // 'draft' | 'published'
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // Note Pages Array
  const [pages, setPages] = useState([
    {
      pageNumber: 1,
      title: 'Page 1: Introduction & Concepts',
      contentHtml: `<div class="note-chapter">
  <span class="chapter-badge">ACADEMIC FOUNDATION</span>
  <h1 class="chapter-title">Core Principles & Derivations</h1>
  <p>Write your detailed academic note content here. You can use headings, mathematical formulas, and tables.</p>
  <div class="callout callout-info">
    <strong>Key Definition:</strong> Master concept definition explained here with exam-oriented focus.
  </div>
</div>`,
    },
  ]);

  const [activePageIndex, setActivePageIndex] = useState(0);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Initial Load: Fetch Colleges and Note (if editing)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const colRes = await api.get('/colleges');
        if (colRes.data?.success) {
          setColleges(colRes.data.colleges || []);
        }

        if (isEditing) {
          const noteRes = await api.get(`/notes/${noteId}`);
          if (noteRes.data?.success) {
            const n = noteRes.data.note;
            setTitle(n.title);
            setType(n.type);
            setDescription(n.description || '');
            setPrice(n.price);
            setDiscountedPrice(n.discountedPrice);
            setPreviewPageCount(n.previewPageCount);
            setStatus(n.status);

            if (n.college) setSelectedCollege(n.college);
            if (n.course) setSelectedCourse(n.course);
            if (n.semester) setSelectedSemester(n.semester);
            if (n.subject) setSelectedSubject(n.subject);
            if (n.block) setSelectedBlock(n.block);
            if (n.unit) setSelectedUnit(n.unit);

            if (noteRes.data.pages && noteRes.data.pages.length > 0) {
              setPages(noteRes.data.pages);
            }
            setCurrentStep(7);
          }
        }
      } catch (err) {
        console.error('Failed to load initial data:', err);
        setErrorMsg('Failed to load note data');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [noteId, isEditing]);

  // Handle College Selection -> Fetch Courses
  const handleSelectCollege = async (college) => {
    setSelectedCollege(college);
    setSelectedCourse(null);
    setSelectedSemester(null);
    setSelectedSubject(null);
    setSelectedBlock(null);
    setSelectedUnit(null);
    try {
      setLoading(true);
      const res = await api.get(`/courses/college/${college._id}`);
      if (res.data?.success) {
        setCourses(res.data.courses || []);
        setCurrentStep(2);
      }
    } catch (err) {
      setErrorMsg('Failed to load courses for selected college');
    } finally {
      setLoading(false);
    }
  };

  // Handle Course Selection -> Fetch Semesters
  const handleSelectCourse = async (course) => {
    setSelectedCourse(course);
    setSelectedSemester(null);
    setSelectedSubject(null);
    setSelectedBlock(null);
    setSelectedUnit(null);
    try {
      setLoading(true);
      const res = await api.get(`/semesters/course/${course._id}`);
      if (res.data?.success) {
        setSemesters(res.data.semesters || []);
        setCurrentStep(3);
      }
    } catch (err) {
      setErrorMsg('Failed to load semesters for selected course');
    } finally {
      setLoading(false);
    }
  };

  // Handle Semester Selection -> Fetch Subjects
  const handleSelectSemester = async (semester) => {
    setSelectedSemester(semester);
    setSelectedSubject(null);
    setSelectedBlock(null);
    setSelectedUnit(null);
    try {
      setLoading(true);
      const res = await api.get(`/subjects/semester/${semester._id}`);
      if (res.data?.success) {
        setSubjects(res.data.subjects || []);
        setCurrentStep(4);
      }
    } catch (err) {
      setErrorMsg('Failed to load subjects for selected semester');
    } finally {
      setLoading(false);
    }
  };

  // Handle Subject Selection -> Fetch Blocks
  const handleSelectSubject = async (subject) => {
    setSelectedSubject(subject);
    setSelectedBlock(null);
    setSelectedUnit(null);
    try {
      setLoading(true);
      const res = await api.get(`/blocks/subject/${subject._id}`);
      if (res.data?.success) {
        const fetchedBlocks = res.data.blocks || [];
        setBlocks(fetchedBlocks);
        setNewBlockNumber(fetchedBlocks.length + 1);
        setCurrentStep(5);
      }
    } catch (err) {
      setErrorMsg('Failed to load blocks for selected subject');
    } finally {
      setLoading(false);
    }
  };

  // Handle Block Selection -> Fetch Units
  const handleSelectBlock = async (block) => {
    setSelectedBlock(block);
    setSelectedUnit(null);
    try {
      setLoading(true);
      const res = await api.get(`/units/block/${block._id}`);
      if (res.data?.success) {
        const fetchedUnits = res.data.units || [];
        setUnits(fetchedUnits);
        setNewUnitNumber(fetchedUnits.length + 1);
        setCurrentStep(6);
      }
    } catch (err) {
      setErrorMsg('Failed to load units for selected block');
    } finally {
      setLoading(false);
    }
  };

  // Handle Unit Selection -> Proceed to Editor
  const handleSelectUnit = (unit) => {
    setSelectedUnit(unit);
    setCurrentStep(7);
  };

  // Inline Create Block
  const handleCreateBlockSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSubject) return;
    if (!newBlockName.trim()) {
      alert('Please enter a block name');
      return;
    }
    try {
      setCreatingBlock(true);
      const res = await api.post('/blocks', {
        subjectId: selectedSubject._id,
        blockNumber: Number(newBlockNumber),
        name: newBlockName.trim(),
        description: newBlockDesc.trim(),
      });
      if (res.data?.success && res.data.block) {
        const created = res.data.block;
        setBlocks((prev) => [...prev, created]);
        setShowNewBlockForm(false);
        setNewBlockName('');
        setNewBlockDesc('');
        handleSelectBlock(created);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create block');
    } finally {
      setCreatingBlock(false);
    }
  };

  // Inline Create Unit
  const handleCreateUnitSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSubject) return;
    if (!newUnitTitle.trim()) {
      alert('Please enter a unit title');
      return;
    }
    try {
      setCreatingUnit(true);
      const res = await api.post('/units', {
        subjectId: selectedSubject._id,
        blockId: selectedBlock ? selectedBlock._id : undefined,
        unitNumber: Number(newUnitNumber),
        title: newUnitTitle.trim(),
        description: newUnitDesc.trim(),
      });
      if (res.data?.success && res.data.unit) {
        const created = res.data.unit;
        setUnits((prev) => [...prev, created]);
        setShowNewUnitForm(false);
        setNewUnitTitle('');
        setNewUnitDesc('');
        handleSelectUnit(created);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create unit');
    } finally {
      setCreatingUnit(false);
    }
  };

  // Add new page
  const handleAddPage = () => {
    const nextNum = pages.length + 1;
    const newPage = {
      pageNumber: nextNum,
      title: `Page ${nextNum}: Topic Heading`,
      contentHtml: `<div class="note-chapter">
  <h1 class="chapter-title">Page ${nextNum} Heading</h1>
  <p>Write your detailed academic note content here...</p>
</div>`,
    };
    setPages([...pages, newPage]);
    setActivePageIndex(pages.length);
  };

  // Remove page
  const handleRemovePage = (index) => {
    if (pages.length <= 1) {
      alert('A note must contain at least 1 page.');
      return;
    }
    const filtered = pages.filter((_, i) => i !== index).map((p, i) => ({ ...p, pageNumber: i + 1 }));
    setPages(filtered);
    setActivePageIndex(Math.max(0, index - 1));
  };

  // Update active page content
  const handleCurrentPageChange = (field, value) => {
    setPages((prev) => {
      const copy = [...prev];
      copy[activePageIndex] = {
        ...copy[activePageIndex],
        [field]: value,
      };
      return copy;
    });
  };

  // Quick insertion helpers for editor controls
  const insertSnippet = (snippet) => {
    const current = pages[activePageIndex]?.contentHtml || '';
    handleCurrentPageChange('contentHtml', current + '\n' + snippet);
  };

  // Save or Publish Note
  const handleSave = async (publishState) => {
    setErrorMsg('');
    setSaveMsg('');
    setLoading(true);

    const finalStatus = publishState || status;

    if (!title.trim()) {
      setErrorMsg('Note Title is required.');
      setLoading(false);
      return;
    }

    if (!selectedUnit && !selectedBlock) {
      setErrorMsg('Please assign this note to a Unit or Block.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        unitId: selectedUnit?._id || undefined,
        blockId: selectedBlock?._id || undefined,
        title: title.trim(),
        type,
        description: description.trim(),
        price: Number(price),
        discountedPrice: Number(discountedPrice),
        previewPageCount: Number(previewPageCount),
        status: finalStatus,
        pages,
      };

      if (isEditing) {
        await api.put(`/notes/${noteId}`, payload);
        setSaveMsg('Note updated successfully!');
      } else {
        const res = await api.post('/notes', payload);
        setSaveMsg('Note created successfully!');
        if (res.data?.note?._id) {
          navigate(`/notes/edit/${res.data.note._id}`, { replace: true });
        }
      }
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to save note');
    } finally {
      setLoading(false);
    }
  };

  const activePage = pages[activePageIndex] || pages[0] || {};

  // Hierarchy Breadcrumb string
  const breadcrumbItems = [
    selectedCollege && { label: selectedCollege.code || selectedCollege.name, step: 1 },
    selectedCourse && { label: selectedCourse.name, step: 2 },
    selectedSemester && { label: selectedSemester.name, step: 3 },
    selectedSubject && { label: selectedSubject.name, step: 4 },
    selectedBlock && { label: `Block ${selectedBlock.blockNumber}: ${selectedBlock.name}`, step: 5 },
    selectedUnit && { label: `Unit ${selectedUnit.unitNumber}: ${selectedUnit.title}`, step: 6 },
  ].filter(Boolean);

  return (
    <div className="flex-1 min-h-screen bg-[#FBF9F7] dark:bg-[#141414] transition-colors pb-16">
      <AdminHeader
        title={isEditing ? `Editing: ${title || 'Academic Note'}` : 'Add Academic Notes'}
        subtitle="Step-by-step guided workflow to navigate college, course, semester, subject, block, and unit"
      />

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Step Indicator Header (Steps 1 through 7) */}
        <div className="bg-white dark:bg-[#1E1E1E] p-4 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-3">
            {/* Step Pills */}
            <div className="flex items-center gap-1.5 flex-wrap text-xs font-semibold">
              {[
                { num: 1, label: '1. College', ready: !!selectedCollege },
                { num: 2, label: '2. Course', ready: !!selectedCourse },
                { num: 3, label: '3. Semester', ready: !!selectedSemester },
                { num: 4, label: '4. Subject', ready: !!selectedSubject },
                { num: 5, label: '5. Block', ready: !!selectedBlock },
                { num: 6, label: '6. Unit', ready: !!selectedUnit },
                { num: 7, label: '7. Notes Editor', ready: currentStep === 7 },
              ].map((stepItem) => {
                const isActive = currentStep === stepItem.num;
                const isPassed = currentStep > stepItem.num || stepItem.ready;
                return (
                  <button
                    key={stepItem.num}
                    type="button"
                    onClick={() => {
                      // Allow jumping back to any prior step or to step 7 if hierarchy is selected
                      if (stepItem.num < currentStep || (stepItem.ready && stepItem.num <= 7)) {
                        setCurrentStep(stepItem.num);
                      }
                    }}
                    disabled={!isPassed && !isActive}
                    className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-gradient-to-r from-brand-500 to-coral-500 text-white font-bold shadow-sm'
                        : isPassed
                        ? 'bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700 cursor-pointer'
                        : 'bg-gray-50 dark:bg-neutral-900 text-gray-400 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    {isPassed && !isActive ? <Check className="w-3 h-3 text-emerald-500" /> : null}
                    <span>{stepItem.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Back to Notes List */}
            <button
              onClick={() => navigate('/notes')}
              className="text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center gap-1 font-medium transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Notes List</span>
            </button>
          </div>

          {/* Active Hierarchy Breadcrumb Display */}
          {breadcrumbItems.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-1.5 flex-wrap text-gray-600 dark:text-gray-300">
                <span className="text-[10px] uppercase font-bold text-gray-400">Selected Hierarchy:</span>
                {breadcrumbItems.map((item, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && <span className="text-gray-400">/</span>}
                    <button
                      type="button"
                      onClick={() => setCurrentStep(item.step)}
                      className="font-semibold hover:text-brand-500 transition underline underline-offset-2 decoration-gray-300 dark:decoration-neutral-700"
                    >
                      {item.label}
                    </button>
                  </React.Fragment>
                ))}
              </div>

              {currentStep === 7 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-500 hover:text-brand-600 transition"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Change Hierarchy</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Global Notifications */}
        {errorMsg && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-600 rounded-xl text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMsg}</span>
          </div>
        )}

        {saveMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 rounded-xl text-xs flex items-center gap-2 font-medium">
            <Check className="w-4 h-4" />
            <span>{saveMsg}</span>
          </div>
        )}

        {/* STEP 1: SELECT COLLEGE */}
        {currentStep === 1 && (
          <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-2xl border border-gray-200 dark:border-neutral-800 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-brand-500" />
                  <span>Step 1: Select College / University</span>
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Choose the institution for which you are creating this note.
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search colleges..."
                  value={searchCollege}
                  onChange={(e) => setSearchCollege(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl text-xs text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {colleges.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs">
                No colleges found. Please create a college in Academic Structure first.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {colleges
                  .filter((col) =>
                    `${col.name} ${col.code || ''}`.toLowerCase().includes(searchCollege.toLowerCase())
                  )
                  .map((col) => {
                    const isSelected = selectedCollege?._id === col._id;
                    return (
                      <div
                        key={col._id}
                        onClick={() => handleSelectCollege(col)}
                        className={`p-4 rounded-xl border text-left cursor-pointer transition ${
                          isSelected
                            ? 'bg-brand-50/50 dark:bg-[#181818] border-brand-500 dark:border-brand-500 text-brand-600 dark:text-brand-400 ring-1 ring-brand-500/30 dark:shadow-[0_0_12px_rgba(242,140,82,0.18)]'
                            : 'bg-gray-50 dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 hover:border-gray-400 dark:hover:border-neutral-700 text-gray-800 dark:text-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-200 dark:bg-neutral-800 font-bold">
                            {col.code || 'COLLEGE'}
                          </span>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                        <h4 className="text-sm font-bold truncate">{col.name}</h4>
                        {col.city && <p className="text-[11px] text-gray-400 mt-0.5">{col.city}</p>}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: SELECT COURSE */}
        {currentStep === 2 && (
          <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-2xl border border-gray-200 dark:border-neutral-800 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-brand-500" />
                  <span>Step 2: Select Course / Branch</span>
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Courses available under <strong>{selectedCollege?.name}</strong>:
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-neutral-700 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to College</span>
                </button>
              </div>
            </div>

            {courses.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs space-y-2">
                <p>No courses found under this college.</p>
                <button
                  onClick={() => navigate('/academic')}
                  className="text-brand-500 font-bold hover:underline"
                >
                  Go to Academic Structure to add courses
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {courses.map((crs) => {
                  const isSelected = selectedCourse?._id === crs._id;
                  return (
                    <div
                      key={crs._id}
                      onClick={() => handleSelectCourse(crs)}
                      className={`p-4 rounded-xl border text-left cursor-pointer transition ${
                        isSelected
                          ? 'bg-brand-50/50 dark:bg-[#181818] border-brand-500 dark:border-brand-500 text-brand-600 dark:text-brand-400 ring-1 ring-brand-500/30 dark:shadow-[0_0_12px_rgba(242,140,82,0.18)]'
                          : 'bg-gray-50 dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 hover:border-gray-400 dark:hover:border-neutral-700 text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-200 dark:bg-neutral-800 font-bold">
                          {crs.code || 'COURSE'}
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                      <h4 className="text-sm font-bold truncate">{crs.name}</h4>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* STEP 3: SELECT SEMESTER */}
        {currentStep === 3 && (
          <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-2xl border border-gray-200 dark:border-neutral-800 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-brand-500" />
                  <span>Step 3: Select Semester</span>
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Semesters available under <strong>{selectedCourse?.name}</strong>:
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-neutral-700 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Course</span>
                </button>
              </div>
            </div>

            {semesters.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs space-y-2">
                <p>No semesters found under this course.</p>
                <button
                  onClick={() => navigate('/academic')}
                  className="text-brand-500 font-bold hover:underline"
                >
                  Go to Academic Structure to add semesters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {semesters.map((sem) => {
                  const isSelected = selectedSemester?._id === sem._id;
                  return (
                    <div
                      key={sem._id}
                      onClick={() => handleSelectSemester(sem)}
                      className={`p-4 rounded-xl border text-center cursor-pointer transition ${
                        isSelected
                          ? 'bg-brand-50/50 dark:bg-[#181818] border-brand-500 dark:border-brand-500 text-brand-600 dark:text-brand-400 font-bold ring-1 ring-brand-500/30 dark:shadow-[0_0_12px_rgba(242,140,82,0.18)]'
                          : 'bg-gray-50 dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 hover:border-gray-400 dark:hover:border-neutral-700 text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      <h4 className="text-base font-bold">{sem.name}</h4>
                      <p className="text-[10px] text-gray-400 mt-1">Semester {sem.semesterNumber}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* STEP 4: SELECT SUBJECT */}
        {currentStep === 4 && (
          <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-2xl border border-gray-200 dark:border-neutral-800 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-brand-500" />
                  <span>Step 4: Select Subject</span>
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Subjects under <strong>{selectedSemester?.name}</strong>:
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative w-48 sm:w-60">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search subjects..."
                    value={searchSubject}
                    onChange={(e) => setSearchSubject(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl text-xs text-gray-900 dark:text-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-neutral-700 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              </div>
            </div>

            {subjects.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs space-y-2">
                <p>No subjects found under this semester.</p>
                <button
                  onClick={() => navigate('/academic')}
                  className="text-brand-500 font-bold hover:underline"
                >
                  Go to Academic Structure to add subjects
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {subjects
                  .filter((s) => s.name.toLowerCase().includes(searchSubject.toLowerCase()))
                  .map((subj) => {
                    const isSelected = selectedSubject?._id === subj._id;
                    return (
                      <div
                        key={subj._id}
                        onClick={() => handleSelectSubject(subj)}
                        className={`p-4 rounded-xl border text-left cursor-pointer transition ${
                          isSelected
                            ? 'bg-brand-50/50 dark:bg-[#181818] border-brand-500 dark:border-brand-500 text-brand-600 dark:text-brand-400 ring-1 ring-brand-500/30 dark:shadow-[0_0_12px_rgba(242,140,82,0.18)]'
                            : 'bg-gray-50 dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 hover:border-gray-400 dark:hover:border-neutral-700 text-gray-800 dark:text-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-200 dark:bg-neutral-800 font-bold">
                            {subj.code || 'SUBJECT'}
                          </span>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                        <h4 className="text-sm font-bold truncate">{subj.name}</h4>
                        {subj.description && (
                          <p className="text-[11px] text-gray-400 mt-1 line-clamp-1">
                            {subj.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* STEP 5: SELECT BLOCK (With Inline Create Block Option) */}
        {currentStep === 5 && (
          <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-2xl border border-gray-200 dark:border-neutral-800 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-brand-500" />
                  <span>Step 5: Select Block</span>
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Blocks under <strong>{selectedSubject?.name}</strong>:
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewBlockForm(!showNewBlockForm)}
                  className="px-3 py-1.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-brand-500 to-coral-500 hover:from-brand-600 hover:to-coral-600 shadow-sunset flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showNewBlockForm ? 'Cancel New Block' : 'Create New Block'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-neutral-700 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              </div>
            </div>

            {/* Inline New Block Form */}
            {showNewBlockForm && (
              <form
                onSubmit={handleCreateBlockSubmit}
                className="p-4 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-brand-500/30 space-y-3"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-brand-500">
                
                  <span>Create New Block Under {selectedSubject?.name}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                      Block Number
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={newBlockNumber}
                      onChange={(e) => setNewBlockNumber(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg text-xs"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                      Block Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Data Structures & Algorithms Foundation"
                      value={newBlockName}
                      onChange={(e) => setNewBlockName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg text-xs"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                    Optional Description
                  </label>
                  <input
                    type="text"
                    placeholder="Short description of this syllabus block..."
                    value={newBlockDesc}
                    onChange={(e) => setNewBlockDesc(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg text-xs"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowNewBlockForm(false)}
                    className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingBlock}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 transition"
                  >
                    {creatingBlock ? 'Saving Block...' : 'Save & Select Block'}
                  </button>
                </div>
              </form>
            )}

            {blocks.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs space-y-3">
                <p>No blocks found under this subject.</p>
                <button
                  type="button"
                  onClick={() => setShowNewBlockForm(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 transition"
                >
                  Create First Block Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {blocks.map((blk) => {
                  const isSelected = selectedBlock?._id === blk._id;
                  return (
                    <div
                      key={blk._id}
                      onClick={() => handleSelectBlock(blk)}
                      className={`p-4 rounded-xl border text-left cursor-pointer transition ${
                        isSelected
                          ? 'bg-brand-50/50 dark:bg-[#181818] border-brand-500 dark:border-brand-500 text-brand-600 dark:text-brand-400 ring-1 ring-brand-500/30 dark:shadow-[0_0_12px_rgba(242,140,82,0.18)]'
                          : 'bg-gray-50 dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 hover:border-gray-400 dark:hover:border-neutral-700 text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-200 dark:bg-neutral-800 font-bold">
                          BLOCK {blk.blockNumber}
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                      <h4 className="text-sm font-bold truncate">{blk.name}</h4>
                      {blk.description && (
                        <p className="text-[11px] text-gray-400 mt-1 line-clamp-1">
                          {blk.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* STEP 6: SELECT UNIT (With Inline Create Unit Option) */}
        {currentStep === 6 && (
          <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-2xl border border-gray-200 dark:border-neutral-800 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-brand-500" />
                  <span>Step 6: Select Unit</span>
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Units belonging to <strong>{selectedBlock?.name}</strong>:
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewUnitForm(!showNewUnitForm)}
                  className="px-3 py-1.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-brand-500 to-coral-500 hover:from-brand-600 hover:to-coral-600 shadow-sunset flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showNewUnitForm ? 'Cancel New Unit' : 'Create New Unit'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // Option to skip unit and make a block-level note
                    setSelectedUnit(null);
                    setCurrentStep(7);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-brand-500/50 text-xs text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition font-semibold"
                >
                  <span>Skip Unit (Block Note)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(5)}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-neutral-700 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              </div>
            </div>

            {/* Inline New Unit Form */}
            {showNewUnitForm && (
              <form
                onSubmit={handleCreateUnitSubmit}
                className="p-4 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-brand-500/30 space-y-3"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-brand-500">
               
                  <span>Create New Unit Under {selectedBlock?.name}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                      Unit Number
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={newUnitNumber}
                      onChange={(e) => setNewUnitNumber(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg text-xs"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                      Unit Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Asymptotic Complexity & Divide-and-Conquer"
                      value={newUnitTitle}
                      onChange={(e) => setNewUnitTitle(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg text-xs"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                    Optional Description
                  </label>
                  <input
                    type="text"
                    placeholder="Short description of this unit syllabus..."
                    value={newUnitDesc}
                    onChange={(e) => setNewUnitDesc(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg text-xs"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowNewUnitForm(false)}
                    className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingUnit}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 transition"
                  >
                    {creatingUnit ? 'Saving Unit...' : 'Save & Select Unit'}
                  </button>
                </div>
              </form>
            )}

            {units.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs space-y-3">
                <p>No units found under this block.</p>
                <div className="flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNewUnitForm(true)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 transition"
                  >
                    Create First Unit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUnit(null);
                      setCurrentStep(7);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200"
                  >
                    Continue as Block Note
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {units.map((u) => {
                  const isSelected = selectedUnit?._id === u._id;
                  return (
                    <div
                      key={u._id}
                      onClick={() => handleSelectUnit(u)}
                      className={`p-4 rounded-xl border text-left cursor-pointer transition ${
                        isSelected
                          ? 'bg-brand-50/50 dark:bg-[#181818] border-brand-500 dark:border-brand-500 text-brand-600 dark:text-brand-400 ring-1 ring-brand-500/30 dark:shadow-[0_0_12px_rgba(242,140,82,0.18)]'
                          : 'bg-gray-50 dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 hover:border-gray-400 dark:hover:border-neutral-700 text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-200 dark:bg-neutral-800 font-bold">
                          UNIT {u.unitNumber}
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                      <h4 className="text-sm font-bold truncate">{u.title}</h4>
                      {u.description && (
                        <p className="text-[11px] text-gray-400 mt-1 line-clamp-1">
                          {u.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* STEP 7: NOTES EDITOR & ESSENTIAL FIELDS */}
        {currentStep === 7 && (
          <div className="space-y-6">
            {/* Top Toolbar (Mode & Save Buttons) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#1E1E1E] p-4 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-sm">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(6)}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-neutral-700 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition flex items-center gap-1 font-semibold"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Unit</span>
                </button>

                {/* Editor vs Preview Mode Switch */}
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-neutral-800 p-1 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setIsPreviewMode(false)}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      !isPreviewMode
                        ? 'bg-white dark:bg-neutral-700 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 inline mr-1" />
                    Editor
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPreviewMode(true)}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      isPreviewMode
                        ? 'bg-brand-500 text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5 inline mr-1" />
                    Live Shared Reader Preview
                  </button>
                </div>
              </div>

              {/* Save & Publish Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSave('draft')}
                  disabled={loading}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 transition"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSave('published')}
                  disabled={loading}
                  className="px-5 py-2 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-brand-500 to-coral-500 hover:from-brand-600 hover:to-coral-600 shadow-sunset flex items-center gap-1.5 transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Save Changes' : 'Publish Note'}</span>
                </button>
              </div>
            </div>

          
            {isPreviewMode ? (
              <div className="space-y-4">
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 rounded-xl text-xs flex items-center gap-2 border border-amber-200 dark:border-amber-900/50">
                 
                  <span>
                    <strong>Shared Reader Preview:</strong> Renders with the EXACT same vertical document renderer, page organization, and light/dark theme switch as the student reader.
                  </span>
                </div>

                <div className="border border-gray-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
                  <NotesReader
                    note={{
                      title: title || 'Untitled Note',
                      type,
                      description,
                      price,
                      discountedPrice,
                      previewPageCount,
                      unit: selectedUnit ? { unitNumber: selectedUnit.unitNumber, title: selectedUnit.title } : undefined,
                      block: selectedBlock ? { blockNumber: selectedBlock.blockNumber, name: selectedBlock.name } : undefined,
                      subject: selectedSubject ? { name: selectedSubject.name } : undefined,
                    }}
                    pages={pages.map((p) => ({
                      ...p,
                      isLocked: false,
                    }))}
                    isAdminPreview={true}
                  />
                </div>
              </div>
            ) : (
              /* EDITOR WORKSPACE */
              <div className="space-y-6">
                {/* 1. Essential Note Properties Card */}
                <div className="bg-white dark:bg-[#1E1E1E] p-5 rounded-2xl border border-gray-200 dark:border-neutral-800 space-y-4 shadow-sm text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[11px]">
                      Essential Note Details
                    </h4>
                    <span className="text-[10px] text-gray-400">
                      Step 7 of 7 • Ready to format and publish
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Note Title */}
                    <div className="md:col-span-2">
                      <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Note Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Unit 1: Foundations of Relational Algebra"
                        className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl text-sm font-bold text-gray-900 dark:text-white"
                        required
                      />
                    </div>

                    {/* Note Type */}
                    <div>
                      <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Note Type
                      </label>
                      <select
                        value={type}
                        onChange={(e) => {
                          const t = e.target.value;
                          setType(t);
                          if (t === 'quick') setPreviewPageCount(0);
                        }}
                        className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-white"
                      >
                        <option value="normal">Normal Comprehensive Notes</option>
                        <option value="quick">Quick Exam Revision Notes</option>
                      </select>
                    </div>
                  </div>

                  {/* Optional Short Description */}
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Optional Short Description
                    </label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Concise overview or exam syllabus pointer (display only if entered)..."
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl text-xs text-gray-900 dark:text-white"
                    />
                  </div>

                  {/* Collapsible Advanced Settings (Pricing, Free Preview, Status) */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                      className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition"
                    >
                      {showAdvancedSettings ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      <span>{showAdvancedSettings ? 'Hide Advanced Settings' : 'Show Advanced Settings (Pricing & Free Preview Pages)'}</span>
                    </button>

                    {showAdvancedSettings && (
                      <div className="mt-3 p-4 rounded-xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-200 dark:border-neutral-800 grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div>
                          <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                            Regular Price (₹)
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg text-xs"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                            Discounted Price (₹)
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={discountedPrice}
                            onChange={(e) => setDiscountedPrice(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg text-xs"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                            Free Preview Pages
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={pages.length}
                            value={previewPageCount}
                            onChange={(e) => setPreviewPageCount(Number(e.target.value))}
                            className="w-full px-3 py-1.5 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg text-xs"
                          />
                          <span className="text-[10px] text-gray-400 mt-0.5 block">
                            Pages &gt; {previewPageCount} are locked
                          </span>
                        </div>

                        <div>
                          <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                            Publication Status
                          </label>
                          <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg text-xs"
                          >
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Main Content Editor with Multi-Page Organizer */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Left Column: Page Organizer */}
                  <div className="bg-white dark:bg-[#1E1E1E] p-4 rounded-2xl border border-gray-200 dark:border-neutral-800 space-y-3 shadow-sm text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-neutral-800">
                      <span className="font-bold uppercase tracking-wider text-gray-500">
                        Pages ({pages.length})
                      </span>
                      <button
                        type="button"
                        onClick={handleAddPage}
                        className="px-2.5 py-1 text-white bg-gradient-to-r from-brand-500 to-coral-500 rounded-lg flex items-center gap-1 font-bold text-[11px] shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Page</span>
                      </button>
                    </div>

                    <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                      {pages.map((p, idx) => (
                        <div
                          key={idx}
                          onClick={() => setActivePageIndex(idx)}
                          className={`p-2.5 rounded-xl text-xs flex items-center justify-between cursor-pointer transition ${
                            activePageIndex === idx
                              ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-bold border border-brand-200 dark:border-brand-900 shadow-sm'
                              : 'hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <div className="truncate flex items-center gap-2">
                            <span className="font-mono text-gray-400 text-[10px]">#{idx + 1}</span>
                            <span className="truncate">{p.title || `Page ${idx + 1}`}</span>
                          </div>
                          {idx >= previewPageCount ? (
                            <span className="text-[9px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded font-semibold">
                              Locked
                            </span>
                          ) : (
                            <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded font-semibold">
                              Free
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right 3 Columns: Active Page Content & Controls */}
                  <div className="lg:col-span-3 bg-white dark:bg-[#1E1E1E] rounded-2xl border border-gray-200 dark:border-neutral-800 p-6 space-y-4 shadow-sm">
                    {/* Page Header with Title Input & Delete Button */}
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-neutral-800 gap-4">
                      <div className="flex-1 max-w-lg">
                        <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                          Page {activePageIndex + 1} Topic Title
                        </label>
                        <input
                          type="text"
                          value={activePage.title || ''}
                          onChange={(e) => handleCurrentPageChange('title', e.target.value)}
                          placeholder="e.g. Asymptotic Complexity Derivations"
                          className="w-full px-3 py-1.5 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg text-sm font-bold text-gray-900 dark:text-white"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemovePage(activePageIndex)}
                        disabled={pages.length <= 1}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl disabled:opacity-30 transition"
                        title="Delete this page"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Rich Formatting Controls Toolbar */}
                    <div className="flex flex-wrap items-center gap-1.5 p-2 bg-gray-50 dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                      <span className="text-gray-400 text-[10px] uppercase mr-1">Format:</span>

                      {/* Headings */}
                      <button
                        type="button"
                        onClick={() => insertSnippet('<h2>Chapter Subheading</h2>')}
                        className="px-2 py-1 bg-white dark:bg-neutral-800 rounded border border-gray-200 dark:border-neutral-700 hover:text-brand-500 flex items-center gap-1"
                        title="Add Heading 2"
                      >
                        <Heading className="w-3 h-3" />
                        <span>H2</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => insertSnippet('<h3>Key Topic Sub-section</h3>')}
                        className="px-2 py-1 bg-white dark:bg-neutral-800 rounded border border-gray-200 dark:border-neutral-700 hover:text-brand-500 flex items-center gap-1"
                        title="Add Heading 3"
                      >
                        <Heading className="w-3 h-3 text-xs" />
                        <span>H3</span>
                      </button>

                      {/* Bold & Italic */}
                      <button
                        type="button"
                        onClick={() => insertSnippet('<strong>Bold Important Term</strong>')}
                        className="px-2 py-1 bg-white dark:bg-neutral-800 rounded border border-gray-200 dark:border-neutral-700 hover:text-brand-500 flex items-center gap-1"
                        title="Bold Text"
                      >
                        <Bold className="w-3 h-3" />
                        <span>Bold</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => insertSnippet('<em>Italicized Concept</em>')}
                        className="px-2 py-1 bg-white dark:bg-neutral-800 rounded border border-gray-200 dark:border-neutral-700 hover:text-brand-500 flex items-center gap-1"
                        title="Italic Text"
                      >
                        <Italic className="w-3 h-3" />
                        <span>Italic</span>
                      </button>

                      {/* Paragraph */}
                      <button
                        type="button"
                        onClick={() => insertSnippet('<p>Enter your academic paragraph content here...</p>')}
                        className="px-2 py-1 bg-white dark:bg-neutral-800 rounded border border-gray-200 dark:border-neutral-700 hover:text-brand-500"
                        title="Add Paragraph"
                      >
                        Paragraph
                      </button>

                      {/* Bullet & Numbered Lists */}
                      <button
                        type="button"
                        onClick={() =>
                          insertSnippet(`<ul>
  <li>First fundamental characteristic</li>
  <li>Second key property</li>
  <li>Third crucial rule</li>
</ul>`)
                        }
                        className="px-2 py-1 bg-white dark:bg-neutral-800 rounded border border-gray-200 dark:border-neutral-700 hover:text-brand-500 flex items-center gap-1"
                        title="Add Bulleted List"
                      >
                        <List className="w-3 h-3" />
                        <span>Bullets</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          insertSnippet(`<ol>
  <li>Step 1: Initialization</li>
  <li>Step 2: Execution</li>
  <li>Step 3: Termination</li>
</ol>`)
                        }
                        className="px-2 py-1 bg-white dark:bg-neutral-800 rounded border border-gray-200 dark:border-neutral-700 hover:text-brand-500 flex items-center gap-1"
                        title="Add Numbered List"
                      >
                        <ListOrdered className="w-3 h-3" />
                        <span>Numbered</span>
                      </button>

                      {/* Tables */}
                      <button
                        type="button"
                        onClick={() =>
                          insertSnippet(`<div class="table-container">
  <table class="academic-table">
    <thead>
      <tr><th>Criterion</th><th>Approach A</th><th>Approach B</th></tr>
    </thead>
    <tbody>
      <tr><td>Time Complexity</td><td>O(log n)</td><td>O(n)</td></tr>
      <tr><td>Space Complexity</td><td>O(1)</td><td>O(n)</td></tr>
    </tbody>
  </table>
</div>`)
                        }
                        className="px-2 py-1 bg-white dark:bg-neutral-800 rounded border border-gray-200 dark:border-neutral-700 hover:text-brand-500 flex items-center gap-1"
                        title="Add Comparison Table"
                      >
                        <TableIcon className="w-3 h-3" />
                        <span>Table</span>
                      </button>

                      {/* Images */}
                      <button
                        type="button"
                        onClick={() =>
                          insertSnippet(`<div class="note-diagram">
  <img src="https://via.placeholder.com/600x300?text=Academic+Diagram" alt="Academic Diagram" class="rounded-xl shadow-md mx-auto" />
  <p class="caption text-center text-xs text-gray-500 mt-1">Figure: Conceptual Architecture Diagram</p>
</div>`)
                        }
                        className="px-2 py-1 bg-white dark:bg-neutral-800 rounded border border-gray-200 dark:border-neutral-700 hover:text-brand-500 flex items-center gap-1"
                        title="Add Image or Diagram"
                      >
                        <ImageIcon className="w-3 h-3" />
                        <span>Image</span>
                      </button>

                      {/* Links */}
                      <button
                        type="button"
                        onClick={() =>
                          insertSnippet('<a href="https://example.com" target="_blank" rel="noopener noreferrer" class="text-brand-500 underline">Reference Material Link</a>')
                        }
                        className="px-2 py-1 bg-white dark:bg-neutral-800 rounded border border-gray-200 dark:border-neutral-700 hover:text-brand-500 flex items-center gap-1"
                        title="Add Link"
                      >
                        <Link2 className="w-3 h-3" />
                        <span>Link</span>
                      </button>

                      {/* Equation / Formula */}
                      <button
                        type="button"
                        onClick={() =>
                          insertSnippet(`<div class="math-formula">
  T(n) = 2T(n/2) + &Theta;(n) &rArr; &Theta;(n log n)
</div>`)
                        }
                        className="px-2 py-1 bg-white dark:bg-neutral-800 rounded border border-gray-200 dark:border-neutral-700 hover:text-brand-500 flex items-center gap-1"
                        title="Add Math Equation / Formula"
                      >
                        <Sigma className="w-3 h-3" />
                        <span>Equation</span>
                      </button>

                      {/* Callout / Exam Tip */}
                      <button
                        type="button"
                        onClick={() =>
                          insertSnippet(`<div class="exam-tip-box">
  <strong>GenZ Exam Tip:</strong> Questions from this theorem appear frequently in 10-mark university final questions.
</div>`)
                        }
                        className="px-2 py-1 bg-white dark:bg-neutral-800 rounded border border-gray-200 dark:border-neutral-700 hover:text-brand-500 flex items-center gap-1"
                        title="Add GenZ Exam Tip Box"
                      >
                        <Zap className="w-3 h-3 text-amber-500" />
                        <span>GenZ Tip</span>
                      </button>
                    </div>

                    {/* Structured HTML Page Editor */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                          Structured Page HTML Content
                        </label>
                        <span className="text-[10px] text-gray-400">
                          Supports custom tags, styled callouts, and mathematical notation
                        </span>
                      </div>
                      <textarea
                        value={activePage.contentHtml || ''}
                        onChange={(e) => handleCurrentPageChange('contentHtml', e.target.value)}
                        rows={18}
                        className="w-full p-4 bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-neutral-800 rounded-xl font-mono text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 leading-relaxed"
                        placeholder="<div class='note-chapter'> ... </div>"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesEditorPage;
