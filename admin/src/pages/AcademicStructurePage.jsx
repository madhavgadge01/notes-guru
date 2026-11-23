import React, { useState, useEffect, useRef } from 'react';
import {
  Network,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Layers,
  GraduationCap,
  BookOpen,
  ChevronRight,
  AlertCircle,
  FileText,
  ToggleLeft,
  ToggleRight,
  Boxes,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import api from '../services/api';
import AdminHeader from '../components/common/AdminHeader';
import { TableSkeleton, CardGridSkeleton, ButtonSpinner } from '../components/common/AdminSkeletons';

  // Helper to format year labels: 1st Year, 2nd Year, 3rd Year, 4th Year, etc.
  const getYearLabel = (num) => {
    const n = parseInt(num, 10);
    if (isNaN(n) || n <= 0) return '';
    const j = n % 10;
    const k = n % 100;
    let suffix = 'th';
    if (j === 1 && k !== 11) suffix = 'st';
    else if (j === 2 && k !== 12) suffix = 'nd';
    else if (j === 3 && k !== 13) suffix = 'rd';
    return `${n}${suffix} Year`;
  };

  const AcademicStructurePage = () => {
  const [activeTab, setActiveTab] = useState('colleges'); // 'colleges' | 'courses' | 'semesters' | 'subjects' | 'blocks' | 'units'

  // Entity lists for main view
  const [colleges, setColleges] = useState([]);
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [units, setUnits] = useState([]);

  // Selected filters for dependent view
  const [filterCollegeId, setFilterCollegeId] = useState('');
  const [filterCourseId, setFilterCourseId] = useState('');
  const [filterSemesterId, setFilterSemesterId] = useState('');
  const [filterSubjectId, setFilterSubjectId] = useState('');
  const [filterBlockId, setFilterBlockId] = useState('');

  // Modal-specific dependent lists
  const [modalCourses, setModalCourses] = useState([]);
  const [modalSemesters, setModalSemesters] = useState([]);
  const [modalSubjects, setModalSubjects] = useState([]);
  const [modalBlocks, setModalBlocks] = useState([]);

  // Loading states
  const [loadingColleges, setLoadingColleges] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingSemesters, setLoadingSemesters] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingBlocks, setLoadingBlocks] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);

  // Action-level button loading: { [itemId]: 'toggle' | 'delete' }
  const [actionLoading, setActionLoading] = useState({});
  const [submittingForm, setSubmittingForm] = useState(false);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [editingItem, setEditingItem] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form input states
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formDiscountedPrice, setFormDiscountedPrice] = useState('');
  const [formNumber, setFormNumber] = useState('');
  const [formParentCollegeId, setFormParentCollegeId] = useState('');
  const [formParentCourseId, setFormParentCourseId] = useState('');
  const [formParentSemesterId, setFormParentSemesterId] = useState('');
  const [formParentSubjectId, setFormParentSubjectId] = useState('');
  const [formParentBlockId, setFormParentBlockId] = useState('');
  const [formAcademicStructure, setFormAcademicStructure] = useState('year'); // 'year' | 'semester'

  // Selected course details & structure helper
  const selectedCourse = courses.find((c) => c._id === filterCourseId);
  const isYearCourse = selectedCourse?.academicStructure === 'year';

  // Unit pricing scope: 'single' | 'all' (Requirement 5)
  const [unitPricingScope, setUnitPricingScope] = useState('single');

  // Persistent Default Pricing cache (Requirement 4)
  const [pricingDefaults, setPricingDefaults] = useState({
    semester: { price: 199, discountedPrice: 99 },
    subject: { price: 79, discountedPrice: 49 },
    block: { price: 39, discountedPrice: 25 },
    unit: { price: 29, discountedPrice: 19 },
  });

  // Load pricing defaults from database on initial mount
  useEffect(() => {
    api.get('/admin/pricing-defaults')
      .then((res) => {
        if (res.data?.success && res.data.defaults) {
          setPricingDefaults(res.data.defaults);
        }
      })
      .catch((err) => console.error('Could not fetch pricing defaults:', err));
  }, []);

  // Fetch initial colleges
  const loadColleges = async (silent = false) => {
    if (!silent) setLoadingColleges(true);
    try {
      const res = await api.get('/colleges?includeInactive=true');
      if (res.data?.success) {
        const list = res.data.colleges || [];
        setColleges(list);
        if (list.length > 0) {
          setFilterCollegeId((prev) => (prev && list.some((c) => c._id === prev) ? prev : list[0]._id));
        }
      }
    } catch (err) {
      console.error('Failed to load colleges:', err);
    } finally {
      if (!silent) setLoadingColleges(false);
    }
  };

  useEffect(() => {
    loadColleges();
  }, []);

  // When filterCollegeId changes, fetch courses
  useEffect(() => {
    if (!filterCollegeId) {
      setCourses([]);
      return;
    }
    const loadCourses = async () => {
      setLoadingCourses(true);
      try {
        const res = await api.get(`/courses/college/${filterCollegeId}?includeInactive=true`);
        if (res.data?.success) {
          const list = res.data.courses || [];
          setCourses(list);
          if (list.length > 0) {
            setFilterCourseId((prev) => (prev && list.some((c) => c._id === prev) ? prev : list[0]._id));
          } else {
            setFilterCourseId('');
            setSemesters([]);
            setSubjects([]);
            setBlocks([]);
            setUnits([]);
          }
        }
      } catch (err) {
        console.error('Failed to load courses:', err);
      } finally {
        setLoadingCourses(false);
      }
    };
    loadCourses();
  }, [filterCollegeId]);

  // When filterCourseId changes, fetch semesters
  useEffect(() => {
    if (!filterCourseId) {
      setSemesters([]);
      return;
    }
    const loadSemesters = async () => {
      setLoadingSemesters(true);
      try {
        const res = await api.get(`/semesters/course/${filterCourseId}?includeInactive=true`);
        if (res.data?.success) {
          const list = res.data.semesters || [];
          setSemesters(list);
          if (list.length > 0) {
            setFilterSemesterId((prev) => (prev && list.some((s) => s._id === prev) ? prev : list[0]._id));
          } else {
            setFilterSemesterId('');
            setSubjects([]);
            setBlocks([]);
            setUnits([]);
          }
        }
      } catch (err) {
        console.error('Failed to load semesters:', err);
      } finally {
        setLoadingSemesters(false);
      }
    };
    loadSemesters();
  }, [filterCourseId]);

  // When filterSemesterId changes, fetch subjects
  useEffect(() => {
    if (!filterSemesterId) {
      setSubjects([]);
      return;
    }
    const loadSubjects = async () => {
      setLoadingSubjects(true);
      try {
        const res = await api.get(`/subjects/semester/${filterSemesterId}?includeInactive=true`);
        if (res.data?.success) {
          const list = res.data.subjects || [];
          setSubjects(list);
          if (list.length > 0) {
            setFilterSubjectId((prev) => (prev && list.some((sub) => sub._id === prev) ? prev : list[0]._id));
          } else {
            setFilterSubjectId('');
            setBlocks([]);
            setUnits([]);
          }
        }
      } catch (err) {
        console.error('Failed to load subjects:', err);
      } finally {
        setLoadingSubjects(false);
      }
    };
    loadSubjects();
  }, [filterSemesterId]);

  // When filterSubjectId changes, fetch blocks and units
  useEffect(() => {
    if (!filterSubjectId) {
      setBlocks([]);
      setUnits([]);
      return;
    }
    const loadBlocksAndUnits = async () => {
      setLoadingBlocks(true);
      setLoadingUnits(true);
      try {
        const [blkRes, uRes] = await Promise.all([
          api.get(`/blocks/subject/${filterSubjectId}?includeInactive=true`),
          api.get(`/units/subject/${filterSubjectId}?includeUnpublished=true`),
        ]);

        if (blkRes.data?.success) {
          const list = blkRes.data.blocks || [];
          setBlocks(list);
          if (list.length > 0) {
            setFilterBlockId((prev) => (prev && list.some((b) => b._id === prev) ? prev : list[0]._id));
          } else {
            setFilterBlockId('');
          }
        }

        if (uRes.data?.success) {
          setUnits(uRes.data.units || []);
        }
      } catch (err) {
        console.error('Failed to load blocks & units:', err);
      } finally {
        setLoadingBlocks(false);
        setLoadingUnits(false);
      }
    };

    loadBlocksAndUnits();
  }, [filterSubjectId]);

  // Modal Reactive Select Handlers (Ensures dependent dropdowns always stay synchronized)
  const handleModalCollegeChange = async (colId) => {
    setFormParentCollegeId(colId);
    try {
      const res = await api.get(`/courses/college/${colId}?includeInactive=true`);
      const cList = res.data?.courses || [];
      setModalCourses(cList);
      if (cList.length > 0) {
        const newCrsId = cList[0]._id;
        setFormParentCourseId(newCrsId);
        const sRes = await api.get(`/semesters/course/${newCrsId}?includeInactive=true`);
        const sList = sRes.data?.semesters || [];
        setModalSemesters(sList);
        if (sList.length > 0) {
          setFormParentSemesterId(sList[0]._id);
        } else {
          setFormParentSemesterId('');
        }
      } else {
        setFormParentCourseId('');
        setModalSemesters([]);
        setFormParentSemesterId('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleModalCourseChange = async (crsId) => {
    setFormParentCourseId(crsId);
    try {
      const sRes = await api.get(`/semesters/course/${crsId}?includeInactive=true`);
      const sList = sRes.data?.semesters || [];
      setModalSemesters(sList);
      if (sList.length > 0) {
        const newSemId = sList[0]._id;
        setFormParentSemesterId(newSemId);
        const subRes = await api.get(`/subjects/semester/${newSemId}?includeInactive=true`);
        const subList = subRes.data?.subjects || [];
        setModalSubjects(subList);
        if (subList.length > 0) {
          setFormParentSubjectId(subList[0]._id);
        } else {
          setFormParentSubjectId('');
        }
      } else {
        setFormParentSemesterId('');
        setModalSubjects([]);
        setFormParentSubjectId('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleModalSemesterChange = async (semId) => {
    setFormParentSemesterId(semId);
    try {
      const subRes = await api.get(`/subjects/semester/${semId}?includeInactive=true`);
      const subList = subRes.data?.subjects || [];
      setModalSubjects(subList);
      if (subList.length > 0) {
        const newSubId = subList[0]._id;
        setFormParentSubjectId(newSubId);
        const blkRes = await api.get(`/blocks/subject/${newSubId}?includeInactive=true`);
        const blkList = blkRes.data?.blocks || [];
        setModalBlocks(blkList);
        if (blkList.length > 0) {
          setFormParentBlockId(blkList[0]._id);
        } else {
          setFormParentBlockId('');
        }
      } else {
        setFormParentSubjectId('');
        setModalBlocks([]);
        setFormParentBlockId('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleModalSubjectChange = async (subId) => {
    setFormParentSubjectId(subId);
    try {
      const blkRes = await api.get(`/blocks/subject/${subId}?includeInactive=true`);
      const blkList = blkRes.data?.blocks || [];
      setModalBlocks(blkList);
      if (blkList.length > 0) {
        setFormParentBlockId(blkList[0]._id);
      } else {
        setFormParentBlockId('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Open modal for Create - Instant (0ms lag) using local loaded state + remembered pricing
  const handleOpenCreate = () => {
    setModalMode('create');
    setEditingItem(null);
    setErrorMsg('');
    setFormCode('');
    setFormDesc('');
    setUnitPricingScope('single');

    const effCollegeId = filterCollegeId || (colleges.length > 0 ? colleges[0]._id : '');
    setFormParentCollegeId(effCollegeId);
    setModalCourses(courses);

    const effCourseId = filterCourseId || (courses.length > 0 ? courses[0]._id : '');
    setFormParentCourseId(effCourseId);
    setModalSemesters(semesters);

    const effSemesterId = filterSemesterId || (semesters.length > 0 ? semesters[0]._id : '');
    setFormParentSemesterId(effSemesterId);
    setModalSubjects(subjects);

    const effSubjectId = filterSubjectId || (subjects.length > 0 ? subjects[0]._id : '');
    setFormParentSubjectId(effSubjectId);
    setModalBlocks(blocks);

    const effBlockId = filterBlockId || (blocks.length > 0 ? blocks[0]._id : '');
    setFormParentBlockId(effBlockId);

    // Apply remembered pricing automatically (Requirement 4)
    setFormAcademicStructure('year');
    if (activeTab === 'semesters') {
      const parentCrs = courses.find((c) => c._id === effCourseId);
      const isYear = parentCrs?.academicStructure === 'year';
      const nextSem = (semesters.length || 0) + 1;
      setFormNumber(nextSem);
      setFormName(isYear ? getYearLabel(nextSem) : `Semester ${nextSem}`);
      setFormPrice(pricingDefaults.semester?.price ?? 199);
      setFormDiscountedPrice(pricingDefaults.semester?.discountedPrice ?? 99);
    } else if (activeTab === 'subjects') {
      setFormNumber('');
      setFormName('');
      setFormPrice(pricingDefaults.subject?.price ?? 79);
      setFormDiscountedPrice(pricingDefaults.subject?.discountedPrice ?? 49);
    } else if (activeTab === 'blocks') {
      const nextBlk = (blocks.length || 0) + 1;
      setFormNumber(nextBlk);
      setFormName(`Block ${nextBlk}`);
      setFormPrice(pricingDefaults.block?.price ?? 39);
      setFormDiscountedPrice(pricingDefaults.block?.discountedPrice ?? 25);
    } else if (activeTab === 'units') {
      const nextUnit = (units.length || 0) + 1;
      setFormNumber(nextUnit);
      setFormName('');
      setFormPrice(pricingDefaults.unit?.price ?? 29);
      setFormDiscountedPrice(pricingDefaults.unit?.discountedPrice ?? 19);
    } else {
      setFormNumber('');
      setFormName('');
      setFormPrice('');
      setFormDiscountedPrice('');
    }

    setModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (item) => {
    setModalMode('edit');
    setEditingItem(item);
    setErrorMsg('');
    setUnitPricingScope('single');
    setFormName(item.name || item.title || '');
    setFormCode(item.code || '');
    setFormDesc(item.description || item.packageDescription || '');
    setFormPrice(item.price !== undefined ? item.price : '');
    setFormDiscountedPrice(item.discountedPrice !== undefined ? item.discountedPrice : '');
    setFormNumber(item.semesterNumber || item.blockNumber || item.unitNumber || '');
    setFormParentCollegeId(item.collegeId?._id || item.collegeId || filterCollegeId);
    setFormParentCourseId(item.courseId?._id || item.courseId || filterCourseId);
    setFormParentSemesterId(item.semesterId?._id || item.semesterId || filterSemesterId);
    setFormParentSubjectId(item.subjectId?._id || item.subjectId || filterSubjectId);
    setFormParentBlockId(item.blockId?._id || item.blockId || '');
    setFormAcademicStructure(item.academicStructure || 'year');
    setModalOpen(true);
  };

  // Form Submission - Fast, in-place state update without full-list refetches
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (submittingForm) return;

    setErrorMsg('');

    // Confirmation if applying unit pricing to all units in the subject (Requirement 5)
    if (activeTab === 'units' && modalMode === 'edit' && unitPricingScope === 'all') {
      const reg = formPrice !== '' ? Number(formPrice) : 0;
      const disc = formDiscountedPrice !== '' ? Number(formDiscountedPrice) : 0;
      const confirmed = window.confirm(
        `Are you sure you want to update Regular Price: ₹${reg} and Discounted Price: ₹${disc} for ALL units belonging to this subject?`
      );
      if (!confirmed) return;
    }

    setSubmittingForm(true);

    try {
      if (activeTab === 'colleges') {
        if (modalMode === 'create') {
          const res = await api.post('/colleges', {
            name: formName.trim(),
            code: formCode.trim(),
            description: formDesc.trim(),
          });
          const createdCol = res.data?.college;
          if (createdCol) {
            setColleges((prev) => [...prev, createdCol]);
            if (!filterCollegeId) setFilterCollegeId(createdCol._id);
          }
        } else {
          const res = await api.put(`/colleges/${editingItem._id}`, {
            name: formName.trim(),
            code: formCode.trim(),
            description: formDesc.trim(),
          });
          const updated = res.data?.college;
          if (updated) {
            setColleges((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
          }
        }
      } else if (activeTab === 'courses') {
        const targetCollegeId = formParentCollegeId || filterCollegeId || (colleges.length > 0 ? colleges[0]._id : '');
        if (!targetCollegeId) {
          throw new Error('Please create or select a College first before adding a Course.');
        }

        if (modalMode === 'create') {
          const cRes = await api.post('/courses', {
            collegeId: targetCollegeId,
            name: formName.trim(),
            code: formCode.trim(),
            description: formDesc.trim(),
            academicStructure: formAcademicStructure,
          });
          const createdCourse = cRes.data?.course;
          if (createdCourse) {
            setCourses((prev) => [...prev, createdCourse]);
            setFilterCollegeId(targetCollegeId);
            setFilterCourseId(createdCourse._id);
            // Refresh divisions: 6 default semesters or 3 default years
            api.get(`/semesters/course/${createdCourse._id}?includeInactive=true`).then((sRes) => {
              if (sRes.data?.success) setSemesters(sRes.data.semesters || []);
            });
            setSuccessMsg(
              createdCourse.academicStructure === 'year'
                ? 'Course created with 3 default academic years (1st, 2nd, 3rd Year)!'
                : 'Course created with 6 default semesters!'
            );
          }
        } else {
          const res = await api.put(`/courses/${editingItem._id}`, {
            name: formName.trim(),
            code: formCode.trim(),
            description: formDesc.trim(),
            academicStructure: formAcademicStructure,
          });
          const updated = res.data?.course;
          if (updated) {
            setCourses((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
          }
        }
      } else if (activeTab === 'semesters') {
        let targetCourseId = formParentCourseId || filterCourseId;
        if (!targetCourseId && courses.length > 0) targetCourseId = courses[0]._id;
        if (!targetCourseId) {
          throw new Error('Please select or create a Course before adding a Semester or Year.');
        }

        const parentCrs = courses.find((c) => c._id === targetCourseId);
        const isYear = parentCrs?.academicStructure === 'year';
        const termName = isYear ? 'Year' : 'Semester';

        const semNum = parseInt(formNumber, 10);
        if (isNaN(semNum) || semNum <= 0) {
          throw new Error(`${termName} number must be a positive integer (e.g. 1, 2, 3)`);
        }

        const priceVal = formPrice !== '' ? Number(formPrice) : pricingDefaults.semester?.price ?? 199;
        const discVal = formDiscountedPrice !== '' ? Number(formDiscountedPrice) : pricingDefaults.semester?.discountedPrice ?? 99;

        const defaultDivisionName = isYear ? getYearLabel(semNum) : `Semester ${semNum}`;

        if (modalMode === 'create') {
          const sRes = await api.post('/semesters', {
            courseId: targetCourseId,
            semesterNumber: semNum,
            name: formName.trim() || defaultDivisionName,
            price: priceVal,
            discountedPrice: discVal,
            packageDescription: formDesc.trim() || `${defaultDivisionName} Package`,
          });
          const createdSem = sRes.data?.semester;
          if (createdSem) {
            setSemesters((prev) => [...prev, createdSem].sort((a, b) => a.semesterNumber - b.semesterNumber));
            setFilterCourseId(targetCourseId);
            setFilterSemesterId(createdSem._id);
            setSuccessMsg(isYear ? 'Academic year created successfully!' : 'Semester created successfully!');
          }
        } else {
          const res = await api.put(`/semesters/${editingItem._id}`, {
            name: formName.trim() || defaultDivisionName,
            semesterNumber: semNum,
            price: priceVal,
            discountedPrice: discVal,
            packageDescription: formDesc.trim(),
          });
          const updated = res.data?.semester;
          if (updated) {
            setSemesters((prev) => prev.map((s) => (s._id === updated._id ? updated : s)));
          }
        }

        // Update local pricing default memory
        setPricingDefaults((prev) => ({
          ...prev,
          semester: { price: priceVal, discountedPrice: discVal },
        }));
      } else if (activeTab === 'subjects') {
        let targetSemId = formParentSemesterId || filterSemesterId;
        if (!targetSemId && semesters.length > 0) targetSemId = semesters[0]._id;
        if (!targetSemId) {
          throw new Error('Please select or create a Semester before adding a Subject.');
        }

        const priceVal = formPrice !== '' ? Number(formPrice) : pricingDefaults.subject?.price ?? 79;
        const discVal = formDiscountedPrice !== '' ? Number(formDiscountedPrice) : pricingDefaults.subject?.discountedPrice ?? 49;

        if (modalMode === 'create') {
          const subRes = await api.post('/subjects', {
            semesterId: targetSemId,
            name: formName.trim(),
            code: formCode.trim(),
            description: formDesc.trim(),
            price: priceVal,
            discountedPrice: discVal,
          });
          const createdSub = subRes.data?.subject;
          if (createdSub) {
            setSubjects((prev) => [...prev, createdSub]);
            setFilterSemesterId(targetSemId);
            setFilterSubjectId(createdSub._id);
            // Refresh blocks and units because 1 default block and 5 default units were created (Requirement 3)
            Promise.all([
              api.get(`/blocks/subject/${createdSub._id}?includeInactive=true`),
              api.get(`/units/subject/${createdSub._id}?includeUnpublished=true`),
            ]).then(([blkRes, uRes]) => {
              if (blkRes.data?.success) setBlocks(blkRes.data.blocks || []);
              if (uRes.data?.success) setUnits(uRes.data.units || []);
            });
            setSuccessMsg('Subject created with 1 default block and 5 default units!');
          }
        } else {
          const res = await api.put(`/subjects/${editingItem._id}`, {
            name: formName.trim(),
            code: formCode.trim(),
            description: formDesc.trim(),
            price: priceVal,
            discountedPrice: discVal,
          });
          const updated = res.data?.subject;
          if (updated) {
            setSubjects((prev) => prev.map((s) => (s._id === updated._id ? updated : s)));
          }
        }

        setPricingDefaults((prev) => ({
          ...prev,
          subject: { price: priceVal, discountedPrice: discVal },
        }));
      } else if (activeTab === 'blocks') {
        let targetSubId = formParentSubjectId || filterSubjectId;
        if (!targetSubId && subjects.length > 0) targetSubId = subjects[0]._id;
        if (!targetSubId) {
          throw new Error('Please select or create a Subject before adding a Block.');
        }

        const blkNum = parseInt(formNumber, 10);
        if (isNaN(blkNum) || blkNum <= 0) {
          throw new Error('Block number must be a positive integer (e.g. 1, 2, 3)');
        }

        const priceVal = formPrice !== '' ? Number(formPrice) : pricingDefaults.block?.price ?? 39;
        const discVal = formDiscountedPrice !== '' ? Number(formDiscountedPrice) : pricingDefaults.block?.discountedPrice ?? 25;

        if (modalMode === 'create') {
          const blkRes = await api.post('/blocks', {
            subjectId: targetSubId,
            blockNumber: blkNum,
            name: formName.trim() || `Block ${blkNum}`,
            description: formDesc.trim(),
            price: priceVal,
            discountedPrice: discVal,
          });
          const createdBlk = blkRes.data?.block;
          if (createdBlk) {
            setBlocks((prev) => [...prev, createdBlk].sort((a, b) => a.blockNumber - b.blockNumber));
            setFilterSubjectId(targetSubId);
            setFilterBlockId(createdBlk._id);
          }
        } else {
          const res = await api.put(`/blocks/${editingItem._id}`, {
            name: formName.trim(),
            blockNumber: blkNum,
            description: formDesc.trim(),
            price: priceVal,
            discountedPrice: discVal,
          });
          const updated = res.data?.block;
          if (updated) {
            setBlocks((prev) => prev.map((b) => (b._id === updated._id ? updated : b)));
          }
        }

        setPricingDefaults((prev) => ({
          ...prev,
          block: { price: priceVal, discountedPrice: discVal },
        }));
      } else if (activeTab === 'units') {
        let targetSubId = formParentSubjectId || filterSubjectId;
        if (!targetSubId && subjects.length > 0) targetSubId = subjects[0]._id;
        if (!targetSubId) {
          throw new Error('Please select or create a Subject before adding a Unit.');
        }

        const uNum = parseInt(formNumber, 10);
        if (isNaN(uNum) || uNum <= 0) {
          throw new Error('Unit number must be a positive integer (e.g. 1, 2, 3)');
        }

        const priceVal = formPrice !== '' ? Number(formPrice) : pricingDefaults.unit?.price ?? 29;
        const discVal = formDiscountedPrice !== '' ? Number(formDiscountedPrice) : pricingDefaults.unit?.discountedPrice ?? 19;
        const applyToAll = modalMode === 'edit' && unitPricingScope === 'all';

        if (modalMode === 'create') {
          const res = await api.post('/units', {
            subjectId: targetSubId,
            blockId: formParentBlockId || null,
            unitNumber: uNum,
            title: formName.trim(),
            description: formDesc.trim(),
            price: priceVal,
            discountedPrice: discVal,
          });
          const createdUnit = res.data?.unit;
          if (createdUnit) {
            setUnits((prev) => [...prev, createdUnit].sort((a, b) => a.unitNumber - b.unitNumber));
            setFilterSubjectId(targetSubId);
          }
        } else {
          const res = await api.put(`/units/${editingItem._id}`, {
            unitNumber: uNum,
            title: formName.trim(),
            description: formDesc.trim(),
            blockId: formParentBlockId || null,
            price: priceVal,
            discountedPrice: discVal,
            applyToAllInSubject: applyToAll,
          });
          const updated = res.data?.unit;

          if (applyToAll) {
            // Optimistically update all units belonging to this subject
            setUnits((prev) =>
              prev.map((u) => ({
                ...u,
                price: priceVal,
                discountedPrice: discVal,
                ...(u._id === updated?._id ? updated : {}),
              }))
            );
            setSuccessMsg(`Pricing applied to all units in ${subjects.find((s) => s._id === targetSubId)?.name || 'subject'}!`);
          } else if (updated) {
            setUnits((prev) => prev.map((u) => (u._id === updated._id ? updated : u)));
          }
        }

        setPricingDefaults((prev) => ({
          ...prev,
          unit: { price: priceVal, discountedPrice: discVal },
        }));
      }

      if (!successMsg) {
        setSuccessMsg('Saved successfully!');
      }
      setTimeout(() => setSuccessMsg(''), 3000);
      setModalOpen(false);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Operation failed');
    } finally {
      setSubmittingForm(false);
    }
  };

  // Toggle active / published status - Optimistic update with instant visual feedback
  const handleToggleStatus = async (item) => {
    const itemId = item._id;
    if (actionLoading[itemId]) return;

    setActionLoading((prev) => ({ ...prev, [itemId]: 'toggle' }));

    // Optimistic state toggle
    if (activeTab === 'colleges') {
      setColleges((prev) => prev.map((c) => (c._id === itemId ? { ...c, isActive: !c.isActive } : c)));
    } else if (activeTab === 'courses') {
      setCourses((prev) => prev.map((c) => (c._id === itemId ? { ...c, isActive: !c.isActive } : c)));
    } else if (activeTab === 'semesters') {
      setSemesters((prev) => prev.map((s) => (s._id === itemId ? { ...s, isActive: !s.isActive } : s)));
    } else if (activeTab === 'subjects') {
      setSubjects((prev) => prev.map((s) => (s._id === itemId ? { ...s, isActive: !s.isActive } : s)));
    } else if (activeTab === 'blocks') {
      setBlocks((prev) => prev.map((b) => (b._id === itemId ? { ...b, isActive: !b.isActive } : b)));
    } else if (activeTab === 'units') {
      setUnits((prev) => prev.map((u) => (u._id === itemId ? { ...u, isPublished: !u.isPublished } : u)));
    }

    try {
      const endpoint =
        activeTab === 'colleges'
          ? `/colleges/${itemId}/toggle-status`
          : activeTab === 'courses'
          ? `/courses/${itemId}/toggle-status`
          : activeTab === 'semesters'
          ? `/semesters/${itemId}/toggle-status`
          : activeTab === 'subjects'
          ? `/subjects/${itemId}/toggle-status`
          : activeTab === 'blocks'
          ? `/blocks/${itemId}/toggle-status`
          : `/units/${itemId}/toggle-status`;

      await api.patch(endpoint);
    } catch (err) {
      // Rollback on error
      if (activeTab === 'colleges') {
        setColleges((prev) => prev.map((c) => (c._id === itemId ? item : c)));
      } else if (activeTab === 'courses') {
        setCourses((prev) => prev.map((c) => (c._id === itemId ? item : c)));
      } else if (activeTab === 'semesters') {
        setSemesters((prev) => prev.map((s) => (s._id === itemId ? item : s)));
      } else if (activeTab === 'subjects') {
        setSubjects((prev) => prev.map((s) => (s._id === itemId ? item : s)));
      } else if (activeTab === 'blocks') {
        setBlocks((prev) => prev.map((b) => (b._id === itemId ? item : b)));
      } else if (activeTab === 'units') {
        setUnits((prev) => prev.map((u) => (u._id === itemId ? item : u)));
      }
      alert(err.response?.data?.message || 'Status update failed');
    } finally {
      setActionLoading((prev) => {
        const next = { ...prev };
        delete next[itemId];
        return next;
      });
    }
  };

  // Delete entity - Optimistic removal with rollback on failure
  const handleDelete = async (item) => {
    const itemId = item._id;
    if (actionLoading[itemId]) return;

    const itemName = item.name || item.title;
    if (!window.confirm(`Are you sure you want to delete "${itemName}"? This may affect linked data.`)) {
      return;
    }

    setActionLoading((prev) => ({ ...prev, [itemId]: 'delete' }));

    // Optimistically remove from state
    if (activeTab === 'colleges') setColleges((prev) => prev.filter((c) => c._id !== itemId));
    else if (activeTab === 'courses') setCourses((prev) => prev.filter((c) => c._id !== itemId));
    else if (activeTab === 'semesters') setSemesters((prev) => prev.filter((s) => s._id !== itemId));
    else if (activeTab === 'subjects') setSubjects((prev) => prev.filter((s) => s._id !== itemId));
    else if (activeTab === 'blocks') setBlocks((prev) => prev.filter((b) => b._id !== itemId));
    else if (activeTab === 'units') setUnits((prev) => prev.filter((u) => u._id !== itemId));

    try {
      const endpoint =
        activeTab === 'colleges'
          ? `/colleges/${itemId}`
          : activeTab === 'courses'
          ? `/courses/${itemId}`
          : activeTab === 'semesters'
          ? `/semesters/${itemId}`
          : activeTab === 'subjects'
          ? `/subjects/${itemId}`
          : activeTab === 'blocks'
          ? `/blocks/${itemId}`
          : `/units/${itemId}`;

      await api.delete(endpoint);
      setSuccessMsg(`Deleted "${itemName}" successfully.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      // Rollback on error
      if (activeTab === 'colleges') setColleges((prev) => [...prev, item]);
      else if (activeTab === 'courses') setCourses((prev) => [...prev, item]);
      else if (activeTab === 'semesters') setSemesters((prev) => [...prev, item]);
      else if (activeTab === 'subjects') setSubjects((prev) => [...prev, item]);
      else if (activeTab === 'blocks') setBlocks((prev) => [...prev, item]);
      else if (activeTab === 'units') setUnits((prev) => [...prev, item]);

      alert(err.response?.data?.message || 'Delete operation failed');
    } finally {
      setActionLoading((prev) => {
        const next = { ...prev };
        delete next[itemId];
        return next;
      });
    }
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Academic Hierarchy & Structure"
        subtitle="Manage Colleges, Courses, Semesters, Subjects, Blocks, and Units dynamically."
      />

      {successMsg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs rounded-xl flex items-center gap-2 border border-emerald-200 dark:border-emerald-800 transition">
          <Check className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-gray-100 dark:bg-[#1E1E1E] rounded-2xl w-fit text-xs font-bold border border-gray-200 dark:border-neutral-800">
        <button
          onClick={() => setActiveTab('colleges')}
          className={`px-4 py-2.5 rounded-xl transition ${
            activeTab === 'colleges'
              ? 'bg-gradient-to-r from-brand-500 to-coral-500 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-neutral-800'
          }`}
        >
          1. Colleges ({colleges.length})
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          className={`px-4 py-2.5 rounded-xl transition ${
            activeTab === 'courses'
              ? 'bg-gradient-to-r from-brand-500 to-coral-500 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-neutral-800'
          }`}
        >
          2. Courses ({courses.length})
        </button>
        <button
          onClick={() => setActiveTab('semesters')}
          className={`px-4 py-2.5 rounded-xl transition ${
            activeTab === 'semesters'
              ? 'bg-gradient-to-r from-brand-500 to-coral-500 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-neutral-800'
          }`}
        >
          3. {isYearCourse ? 'Years' : 'Semesters'} ({semesters.length})
        </button>
        <button
          onClick={() => setActiveTab('subjects')}
          className={`px-4 py-2.5 rounded-xl transition ${
            activeTab === 'subjects'
              ? 'bg-gradient-to-r from-brand-500 to-coral-500 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-neutral-800'
          }`}
        >
          4. Subjects ({subjects.length})
        </button>
        <button
          onClick={() => setActiveTab('blocks')}
          className={`px-4 py-2.5 rounded-xl transition ${
            activeTab === 'blocks'
              ? 'bg-gradient-to-r from-brand-500 to-coral-500 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-neutral-800'
          }`}
        >
          5. Blocks ({blocks.length})
        </button>
        <button
          onClick={() => setActiveTab('units')}
          className={`px-4 py-2.5 rounded-xl transition ${
            activeTab === 'units'
              ? 'bg-gradient-to-r from-brand-500 to-coral-500 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-neutral-800'
          }`}
        >
          6. Units ({units.length})
        </button>
      </div>

      {/* Drill-down Hierarchy Filter Selectors (Top Bar) */}
      {activeTab !== 'colleges' && (
        <div className="bg-white dark:bg-[#1C1C1C] p-4 rounded-2xl border border-gray-200 dark:border-neutral-800 flex flex-wrap items-center gap-4 text-xs font-semibold shadow-sm">
          {/* College Selector */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400">College:</span>
            <select
              value={filterCollegeId}
              onChange={(e) => setFilterCollegeId(e.target.value)}
              className="px-2.5 py-1.5 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg text-gray-900 dark:text-white"
            >
              {colleges.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.code ? `${c.code} - ${c.name}` : c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Course Selector */}
          {['semesters', 'subjects', 'blocks', 'units'].includes(activeTab) && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Course:</span>
              <select
                value={filterCourseId}
                onChange={(e) => setFilterCourseId(e.target.value)}
                className="px-2.5 py-1.5 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg text-gray-900 dark:text-white"
              >
                {courses.length === 0 ? (
                  <option value="">No courses</option>
                ) : (
                  courses.map((crs) => (
                    <option key={crs._id} value={crs._id}>
                      {crs.code ? `${crs.code} - ${crs.name}` : crs.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          )}

          {/* Semester Selector */}
          {['subjects', 'blocks', 'units'].includes(activeTab) && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Semester:</span>
              <select
                value={filterSemesterId}
                onChange={(e) => setFilterSemesterId(e.target.value)}
                className="px-2.5 py-1.5 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg text-gray-900 dark:text-white"
              >
                {semesters.length === 0 ? (
                  <option value="">No semesters</option>
                ) : (
                  semesters.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} (Sem {s.semesterNumber})
                    </option>
                  ))
                )}
              </select>
            </div>
          )}

          {/* Subject Selector */}
          {['blocks', 'units'].includes(activeTab) && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Subject:</span>
              <select
                value={filterSubjectId}
                onChange={(e) => setFilterSubjectId(e.target.value)}
                className="px-2.5 py-1.5 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg text-gray-900 dark:text-white max-w-xs truncate"
              >
                {subjects.length === 0 ? (
                  <option value="">No subjects</option>
                ) : (
                  subjects.map((sub) => (
                    <option key={sub._id} value={sub._id}>
                      {sub.code ? `${sub.code} - ${sub.name}` : sub.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white capitalize flex items-center gap-2">
            <span>{activeTab === 'semesters' ? (isYearCourse ? 'Academic Years' : 'Semesters') : activeTab} Management</span>
            {['semesters', 'subjects', 'blocks', 'units'].includes(activeTab) && (
              <span className="text-[11px] font-normal text-gray-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-brand-500" />
                Pricing remembered: ₹{pricingDefaults.semester?.price ?? 0} (Regular) / ₹{pricingDefaults.semester?.discountedPrice ?? 0} (Discounted)
              </span>
            )}
          </h2>
          <p className="text-xs text-gray-500">
            {activeTab === 'colleges' && 'Top-level educational institutions in the system.'}
            {activeTab === 'courses' && 'Degrees and branches under selected college. Choose Semester-Based (creates 6 semesters) or Year-Based (creates 3 years).'}
            {activeTab === 'semesters' && (isYearCourse ? 'Academic years under selected course.' : 'Academic terms under selected course.')}
            {activeTab === 'subjects' && 'Course subjects under selected semester/year. Adding a subject automatically creates 1 default block and 5 units.'}
            {activeTab === 'blocks' && 'Modular curriculum divisions under selected subject.'}
            {activeTab === 'units' && 'Target units/chapters under selected subject.'}
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-500 to-coral-500 hover:from-brand-600 hover:to-coral-600 flex items-center gap-1.5 shadow-sm transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{activeTab === 'semesters' ? (isYearCourse ? 'Add Year' : 'Add Semester') : `Add ${activeTab.slice(0, -1)}`}</span>
        </button>
      </div>

      {/* TAB 1: COLLEGES */}
      {activeTab === 'colleges' && (
        <div>
          {loadingColleges ? (
            <CardGridSkeleton count={3} />
          ) : colleges.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-[#1E1E1E] rounded-2xl border border-gray-200 dark:border-neutral-800 text-gray-400 text-xs">
              No colleges found. Click "Add college" to create your first college.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {colleges.map((col) => {
                const isItemToggling = actionLoading[col._id] === 'toggle';
                const isItemDeleting = actionLoading[col._id] === 'delete';

                return (
                  <div
                    key={col._id}
                    className="bg-white dark:bg-[#1E1E1E] p-5 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-brand-300 dark:hover:border-neutral-700 transition"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300">
                          {col.code || 'COLLEGE'}
                        </span>
                        <button
                          onClick={() => handleToggleStatus(col)}
                          disabled={isItemToggling}
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 transition ${
                            col.isActive
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                              : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                          }`}
                        >
                          {isItemToggling ? (
                            <ButtonSpinner className="w-3 h-3" />
                          ) : col.isActive ? (
                            <ToggleRight className="w-3.5 h-3.5" />
                          ) : (
                            <ToggleLeft className="w-3.5 h-3.5" />
                          )}
                          <span>{col.isActive ? 'Active' : 'Inactive'}</span>
                        </button>
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white mt-2">
                        {col.name}
                      </h3>
                      {col.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{col.description}</p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between">
                      <button
                        onClick={() => {
                          setFilterCollegeId(col._id);
                          setActiveTab('courses');
                        }}
                        className="text-xs text-brand-600 dark:text-brand-400 font-bold flex items-center gap-1 hover:underline"
                      >
                        <span>View Courses</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(col)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
                          title="Edit College"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(col)}
                          disabled={isItemDeleting}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition disabled:opacity-50"
                          title="Delete College"
                        >
                          {isItemDeleting ? <ButtonSpinner className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: COURSES */}
      {activeTab === 'courses' && (
        <div>
          {loadingCourses ? (
            <CardGridSkeleton count={3} />
          ) : courses.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-[#1E1E1E] rounded-2xl border border-gray-200 dark:border-neutral-800 text-gray-400 text-xs">
              No courses found for this college. Click "Add course" to create a new degree/branch (6 default semesters will be created automatically).
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {courses.map((crs) => {
                const isItemToggling = actionLoading[crs._id] === 'toggle';
                const isItemDeleting = actionLoading[crs._id] === 'delete';

                return (
                  <div
                    key={crs._id}
                    className="bg-white dark:bg-[#1E1E1E] p-5 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-brand-300 dark:hover:border-neutral-700 transition"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-300">
                            {crs.code || 'COURSE'}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                            crs.academicStructure === 'year'
                              ? 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300'
                              : 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300'
                          }`}>
                            {crs.academicStructure === 'year' ? 'Year-Based' : 'Semester-Based'}
                          </span>
                        </div>
                        <button
                          onClick={() => handleToggleStatus(crs)}
                          disabled={isItemToggling}
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 transition ${
                            crs.isActive
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                              : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                          }`}
                        >
                          {isItemToggling ? (
                            <ButtonSpinner className="w-3 h-3" />
                          ) : crs.isActive ? (
                            <ToggleRight className="w-3.5 h-3.5" />
                          ) : (
                            <ToggleLeft className="w-3.5 h-3.5" />
                          )}
                          <span>{crs.isActive ? 'Active' : 'Inactive'}</span>
                        </button>
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white mt-2">
                        {crs.name}
                      </h3>
                      {crs.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{crs.description}</p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between">
                      <button
                        onClick={() => {
                          setFilterCourseId(crs._id);
                          setActiveTab('semesters');
                        }}
                        className="text-xs text-brand-600 dark:text-brand-400 font-bold flex items-center gap-1 hover:underline"
                      >
                        <span>{crs.academicStructure === 'year' ? 'View Years' : 'View Semesters'}</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(crs)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
                          title="Edit Course"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(crs)}
                          disabled={isItemDeleting}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition disabled:opacity-50"
                          title="Delete Course"
                        >
                          {isItemDeleting ? <ButtonSpinner className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SEMESTERS */}
      {activeTab === 'semesters' && (
        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden shadow-sm">
          {loadingSemesters ? (
            <TableSkeleton rows={6} cols={5} colWidths={['w-32', 'w-24', 'w-20', 'w-20', 'w-16']} />
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-neutral-900/60 border-b border-gray-200 dark:border-neutral-800 text-gray-400 uppercase font-bold text-[10px]">
                  <th className="py-3 px-4">{isYearCourse ? 'Year Number' : 'Semester Number'}</th>
                  <th className="py-3 px-4">Name / Title</th>
                  <th className="py-3 px-4">Bundle Price (₹)</th>
                  <th className="py-3 px-4">Discounted (₹)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-800/60">
                {semesters.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-gray-400">
                      {isYearCourse
                        ? 'No academic years found for this course. Click "Add Year" above.'
                        : 'No semesters found for this course. Click "Add semester" above.'}
                    </td>
                  </tr>
                ) : (
                  semesters.map((s) => {
                    const isItemToggling = actionLoading[s._id] === 'toggle';
                    const isItemDeleting = actionLoading[s._id] === 'delete';

                    return (
                      <tr key={s._id} className="hover:bg-gray-50/50 dark:hover:bg-neutral-800/30 transition">
                        <td className="py-3 px-4 font-mono font-bold text-gray-500">
                          {isYearCourse ? `Year ${s.semesterNumber}` : `Sem ${s.semesterNumber}`}
                        </td>
                        <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">
                          <button
                            onClick={() => {
                              setFilterSemesterId(s._id);
                              setActiveTab('subjects');
                            }}
                            className="hover:text-brand-500 hover:underline flex items-center gap-1.5"
                          >
                            <span>{s.name}</span>
                            <ChevronRight className="w-3 h-3 text-gray-400" />
                          </button>
                        </td>
                        <td className="py-3 px-4 text-gray-500 line-through">₹{s.price || 199}</td>
                        <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{s.discountedPrice || 99}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleStatus(s)}
                            disabled={isItemToggling}
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                              s.isActive
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                                : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                            }`}
                          >
                            {isItemToggling ? (
                              <ButtonSpinner className="w-2.5 h-2.5" />
                            ) : s.isActive ? (
                              <ToggleRight className="w-3 h-3" />
                            ) : (
                              <ToggleLeft className="w-3 h-3" />
                            )}
                            <span>{s.isActive ? 'Active' : 'Inactive'}</span>
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEdit(s)}
                              className="p-1 rounded text-gray-400 hover:text-gray-900 dark:hover:text-white"
                              title={isYearCourse ? 'Edit Academic Year' : 'Edit Semester'}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(s)}
                              disabled={isItemDeleting}
                              className="p-1 rounded text-rose-500 hover:text-rose-700 disabled:opacity-50"
                              title={isYearCourse ? 'Delete Year' : 'Delete Semester'}
                            >
                              {isItemDeleting ? <ButtonSpinner className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* TAB 4: SUBJECTS */}
      {activeTab === 'subjects' && (
        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden shadow-sm">
          {loadingSubjects ? (
            <TableSkeleton rows={5} cols={5} colWidths={['w-44', 'w-20', 'w-20', 'w-20', 'w-16']} />
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-neutral-900/60 border-b border-gray-200 dark:border-neutral-800 text-gray-400 uppercase font-bold text-[10px]">
                  <th className="py-3 px-4">Subject Name</th>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Regular (₹)</th>
                  <th className="py-3 px-4">Discounted (₹)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-800/60">
                {subjects.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-gray-400">
                      No subjects found in this semester. Click "Add subject" (1 block and 5 units will be created automatically).
                    </td>
                  </tr>
                ) : (
                  subjects.map((sub) => {
                    const isItemToggling = actionLoading[sub._id] === 'toggle';
                    const isItemDeleting = actionLoading[sub._id] === 'delete';

                    return (
                      <tr key={sub._id} className="hover:bg-gray-50/50 dark:hover:bg-neutral-800/30 transition">
                        <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">
                          <button
                            onClick={() => {
                              setFilterSubjectId(sub._id);
                              setActiveTab('blocks');
                            }}
                            className="hover:text-brand-500 hover:underline flex items-center gap-1.5"
                          >
                            <span>{sub.name}</span>
                            <ChevronRight className="w-3 h-3 text-gray-400" />
                          </button>
                        </td>
                        <td className="py-3 px-4 font-mono text-gray-500">{sub.code || '-'}</td>
                        <td className="py-3 px-4 text-gray-500 line-through">₹{sub.price || 79}</td>
                        <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{sub.discountedPrice || 49}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleStatus(sub)}
                            disabled={isItemToggling}
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                              sub.isActive
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                                : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                            }`}
                          >
                            {isItemToggling ? (
                              <ButtonSpinner className="w-2.5 h-2.5" />
                            ) : sub.isActive ? (
                              <ToggleRight className="w-3 h-3" />
                            ) : (
                              <ToggleLeft className="w-3 h-3" />
                            )}
                            <span>{sub.isActive ? 'Active' : 'Inactive'}</span>
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEdit(sub)}
                              className="p-1 rounded text-gray-400 hover:text-gray-900 dark:hover:text-white"
                              title="Edit Subject"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(sub)}
                              disabled={isItemDeleting}
                              className="p-1 rounded text-rose-500 hover:text-rose-700 disabled:opacity-50"
                              title="Delete Subject"
                            >
                              {isItemDeleting ? <ButtonSpinner className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* TAB 5: BLOCKS */}
      {activeTab === 'blocks' && (
        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden shadow-sm">
          {loadingBlocks ? (
            <TableSkeleton rows={4} cols={5} colWidths={['w-40', 'w-24', 'w-20', 'w-20', 'w-16']} />
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-neutral-900/60 border-b border-gray-200 dark:border-neutral-800 text-gray-400 uppercase font-bold text-[10px]">
                  <th className="py-3 px-4">Block Number</th>
                  <th className="py-3 px-4">Block Title</th>
                  <th className="py-3 px-4">Regular (₹)</th>
                  <th className="py-3 px-4">Discounted (₹)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-800/60">
                {blocks.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-gray-400">
                      No blocks found for this subject. Click "Add block" above.
                    </td>
                  </tr>
                ) : (
                  blocks.map((blk) => {
                    const isItemToggling = actionLoading[blk._id] === 'toggle';
                    const isItemDeleting = actionLoading[blk._id] === 'delete';

                    return (
                      <tr key={blk._id} className="hover:bg-gray-50/50 dark:hover:bg-neutral-800/30 transition">
                        <td className="py-3 px-4 font-mono font-bold text-gray-500">
                          Block {blk.blockNumber}
                        </td>
                        <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">
                          <button
                            onClick={() => {
                              setFilterBlockId(blk._id);
                              setActiveTab('units');
                            }}
                            className="hover:text-brand-500 hover:underline flex items-center gap-1.5"
                          >
                            <span>{blk.name}</span>
                            <ChevronRight className="w-3 h-3 text-gray-400" />
                          </button>
                        </td>
                        <td className="py-3 px-4 text-gray-500 line-through">₹{blk.price || 39}</td>
                        <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{blk.discountedPrice || 25}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleStatus(blk)}
                            disabled={isItemToggling}
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                              blk.isActive
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                                : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                            }`}
                          >
                            {isItemToggling ? (
                              <ButtonSpinner className="w-2.5 h-2.5" />
                            ) : blk.isActive ? (
                              <ToggleRight className="w-3 h-3" />
                            ) : (
                              <ToggleLeft className="w-3 h-3" />
                            )}
                            <span>{blk.isActive ? 'Active' : 'Inactive'}</span>
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEdit(blk)}
                              className="p-1 rounded text-gray-400 hover:text-gray-900 dark:hover:text-white"
                              title="Edit Block"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(blk)}
                              disabled={isItemDeleting}
                              className="p-1 rounded text-rose-500 hover:text-rose-700 disabled:opacity-50"
                              title="Delete Block"
                            >
                              {isItemDeleting ? <ButtonSpinner className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* TAB 6: UNITS */}
      {activeTab === 'units' && (
        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden shadow-sm">
          {loadingUnits ? (
            <TableSkeleton rows={5} cols={6} colWidths={['w-20', 'w-44', 'w-24', 'w-16', 'w-16', 'w-16']} />
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-neutral-900/60 border-b border-gray-200 dark:border-neutral-800 text-gray-400 uppercase font-bold text-[10px]">
                  <th className="py-3 px-4">Unit #</th>
                  <th className="py-3 px-4">Unit Title</th>
                  <th className="py-3 px-4">Block</th>
                  <th className="py-3 px-4">Regular (₹)</th>
                  <th className="py-3 px-4">Discounted (₹)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-800/60">
                {units.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-400">
                      No units found for this subject. Click "Add unit" above.
                    </td>
                  </tr>
                ) : (
                  units.map((u) => {
                    const isItemToggling = actionLoading[u._id] === 'toggle';
                    const isItemDeleting = actionLoading[u._id] === 'delete';

                    return (
                      <tr key={u._id} className="hover:bg-gray-50/50 dark:hover:bg-neutral-800/30 transition">
                        <td className="py-3 px-4 font-mono font-bold text-gray-500">
                          Unit {u.unitNumber}
                        </td>
                        <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">
                          {u.title}
                        </td>
                        <td className="py-3 px-4 text-gray-500">
                          {u.blockId?.name ? `Block ${u.blockId.blockNumber}: ${u.blockId.name}` : 'Direct Unit'}
                        </td>
                        <td className="py-3 px-4 text-gray-500 line-through">₹{u.price || 29}</td>
                        <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{u.discountedPrice || 19}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleStatus(u)}
                            disabled={isItemToggling}
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                              u.isPublished
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                                : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                            }`}
                          >
                            {isItemToggling ? (
                              <ButtonSpinner className="w-2.5 h-2.5" />
                            ) : u.isPublished ? (
                              <ToggleRight className="w-3 h-3" />
                            ) : (
                              <ToggleLeft className="w-3 h-3" />
                            )}
                            <span>{u.isPublished ? 'Published' : 'Draft'}</span>
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEdit(u)}
                              className="p-1 rounded text-gray-400 hover:text-gray-900 dark:hover:text-white"
                              title="Edit Unit Pricing & Details"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(u)}
                              disabled={isItemDeleting}
                              className="p-1 rounded text-rose-500 hover:text-rose-700 disabled:opacity-50"
                              title="Delete Unit"
                            >
                              {isItemDeleting ? <ButtonSpinner className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl border border-gray-200 dark:border-neutral-800 p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-neutral-800">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white capitalize">
                {modalMode === 'create'
                  ? (activeTab === 'semesters' ? (isYearCourse ? 'Create Academic Year' : 'Create New Semester') : `Create New ${activeTab.slice(0, -1)}`)
                  : (activeTab === 'semesters' ? (isYearCourse ? 'Edit Academic Year' : 'Edit Semester') : `Edit ${activeTab.slice(0, -1)}`)}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 text-xs rounded-xl flex items-center gap-2 border border-rose-200 dark:border-rose-800">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
              {/* Parent Selectors when creating Course */}
              {activeTab === 'courses' && modalMode === 'create' && (
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Parent College
                  </label>
                  <select
                    value={formParentCollegeId}
                    onChange={(e) => setFormParentCollegeId(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl"
                    required
                  >
                    {colleges.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Academic Structure Selector when creating or editing Course */}
              {activeTab === 'courses' && (
                <div className="pt-1">
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    What is the academic structure of this course?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormAcademicStructure('year')}
                      className={`p-3.5 rounded-2xl border text-left transition-all duration-150 ${
                        formAcademicStructure === 'year'
                          ? 'border-brand-500 dark:border-brand-500 bg-brand-50/70 dark:bg-[#141414] ring-2 ring-brand-500/20 dark:ring-brand-500/40 dark:shadow-[0_0_15px_rgba(242,140,82,0.18)]'
                          : 'border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-[#181818] hover:border-gray-300 dark:hover:border-neutral-700'
                      }`}
                    >
                      <div
                        className={`text-xs font-bold flex items-center gap-2 ${
                          formAcademicStructure === 'year'
                            ? 'text-brand-600 dark:text-brand-400'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full transition-all ${
                            formAcademicStructure === 'year'
                              ? 'bg-brand-500 dark:bg-brand-400 shadow-[0_0_6px_rgba(242,140,82,0.8)] ring-2 ring-brand-500/20'
                              : 'bg-gray-400 dark:bg-neutral-600'
                          }`}
                        />
                        <span>Year-Based</span>
                      </div>
                      <div
                        className={`text-[11px] mt-1.5 leading-snug transition-colors ${
                          formAcademicStructure === 'year'
                            ? 'text-gray-600 dark:text-gray-200'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        Automatically creates 1st Year, 2nd Year, 3rd Year by default.
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormAcademicStructure('semester')}
                      className={`p-3.5 rounded-2xl border text-left transition-all duration-150 ${
                        formAcademicStructure === 'semester'
                          ? 'border-brand-500 dark:border-brand-500 bg-brand-50/70 dark:bg-[#141414] ring-2 ring-brand-500/20 dark:ring-brand-500/40 dark:shadow-[0_0_15px_rgba(242,140,82,0.18)]'
                          : 'border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-[#181818] hover:border-gray-300 dark:hover:border-neutral-700'
                      }`}
                    >
                      <div
                        className={`text-xs font-bold flex items-center gap-2 ${
                          formAcademicStructure === 'semester'
                            ? 'text-brand-600 dark:text-brand-400'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full transition-all ${
                            formAcademicStructure === 'semester'
                              ? 'bg-brand-500 dark:bg-brand-400 shadow-[0_0_6px_rgba(242,140,82,0.8)] ring-2 ring-brand-500/20'
                              : 'bg-gray-400 dark:bg-neutral-600'
                          }`}
                        />
                        <span>Semester-Based</span>
                      </div>
                      <div
                        className={`text-[11px] mt-1.5 leading-snug transition-colors ${
                          formAcademicStructure === 'semester'
                            ? 'text-gray-600 dark:text-gray-200'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        Automatically creates Semester 1 to Semester 6 by default.
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Parent Selectors when creating Semester */}
              {activeTab === 'semesters' && modalMode === 'create' && (
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Parent Course
                  </label>
                  <select
                    value={formParentCourseId}
                    onChange={(e) => setFormParentCourseId(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl"
                    required
                  >
                    {modalCourses.length === 0 ? (
                      <option value="">No courses available</option>
                    ) : (
                      modalCourses.map((crs) => (
                        <option key={crs._id} value={crs._id}>
                          {crs.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              )}

              {/* Parent Selectors when creating Subject */}
              {activeTab === 'subjects' && modalMode === 'create' && (
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Parent Semester
                  </label>
                  <select
                    value={formParentSemesterId}
                    onChange={(e) => setFormParentSemesterId(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl"
                    required
                  >
                    {modalSemesters.length === 0 ? (
                      <option value="">No semesters available</option>
                    ) : (
                      modalSemesters.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name} (Sem {s.semesterNumber})
                        </option>
                      ))
                    )}
                  </select>
                </div>
              )}

              {/* Parent Selectors when creating Block */}
              {activeTab === 'blocks' && modalMode === 'create' && (
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Parent Subject
                  </label>
                  <select
                    value={formParentSubjectId}
                    onChange={(e) => setFormParentSubjectId(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl"
                    required
                  >
                    {modalSubjects.length === 0 ? (
                      <option value="">No subjects available</option>
                    ) : (
                      modalSubjects.map((sub) => (
                        <option key={sub._id} value={sub._id}>
                          {sub.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              )}

              {/* Parent Selectors when creating Unit */}
              {activeTab === 'units' && modalMode === 'create' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Subject
                    </label>
                    <select
                      value={formParentSubjectId}
                      onChange={(e) => handleModalSubjectChange(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl"
                      required
                    >
                      {modalSubjects.length === 0 ? (
                        <option value="">No subjects found</option>
                      ) : (
                        modalSubjects.map((sub) => (
                          <option key={sub._id} value={sub._id}>
                            {sub.name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Parent Block (Optional)
                    </label>
                    <select
                      value={formParentBlockId}
                      onChange={(e) => setFormParentBlockId(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl"
                    >
                      <option value="">No Block (Direct Unit)</option>
                      {modalBlocks.map((b) => (
                        <option key={b._id} value={b._id}>
                          Block {b.blockNumber}: {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Name / Title
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Enter title..."
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl"
                  required
                />
              </div>

              {['colleges', 'courses', 'subjects'].includes(activeTab) && (
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Code / Acronym
                  </label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="e.g. CS201, DTU"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl"
                  />
                </div>
              )}

              {['semesters', 'blocks', 'units'].includes(activeTab) && (
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    {activeTab === 'semesters' ? (isYearCourse ? 'Year Number' : 'Semester Number') : activeTab === 'blocks' ? 'Block Number' : 'Unit Number'}
                  </label>
                  <input
                    type="number"
                    value={formNumber}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormNumber(val);
                      if (activeTab === 'semesters' && isYearCourse) {
                        setFormName(getYearLabel(val));
                      }
                    }}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl"
                    required
                  />
                </div>
              )}

              {['semesters', 'subjects', 'blocks', 'units'].includes(activeTab) && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Regular Price (₹)
                    </label>
                    <input
                      type="number"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      placeholder="e.g. 79"
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Discounted Price (₹)
                    </label>
                    <input
                      type="number"
                      value={formDiscountedPrice}
                      onChange={(e) => setFormDiscountedPrice(e.target.value)}
                      placeholder="e.g. 49"
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl"
                    />
                  </div>
                </div>
              )}

              {/* Requirement 5: Unit Pricing Scope Selector (Single vs All units in subject) */}
              {activeTab === 'units' && modalMode === 'edit' && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl space-y-2">
                  <label className="block text-xs font-bold text-amber-900 dark:text-amber-200">
                    Pricing Update Scope
                  </label>
                  <div className="space-y-1.5 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-800 dark:text-gray-200">
                      <input
                        type="radio"
                        name="unitPricingScope"
                        value="single"
                        checked={unitPricingScope === 'single'}
                        onChange={() => setUnitPricingScope('single')}
                        className="text-brand-500 focus:ring-brand-500"
                      />
                      <span>Apply only to this unit (Unit {formNumber || editingItem?.unitNumber})</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-800 dark:text-gray-200">
                      <input
                        type="radio"
                        name="unitPricingScope"
                        value="all"
                        checked={unitPricingScope === 'all'}
                        onChange={() => setUnitPricingScope('all')}
                        className="text-brand-500 focus:ring-brand-500"
                      />
                      <span className="font-bold text-amber-800 dark:text-amber-300">
                        Apply to all units in this subject
                      </span>
                    </label>
                  </div>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400">
                    {unitPricingScope === 'all'
                      ? '⚠️ Updates Regular and Discounted price for EVERY unit in this subject.'
                      : 'Only changes pricing for the selected unit.'}
                  </p>
                </div>
              )}

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Optional Description
                </label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  rows={3}
                  placeholder="Optional syllabus summary (leave empty for none)..."
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingForm}
                  className="px-5 py-2 rounded-xl font-bold text-white bg-brand-500 hover:bg-brand-600 shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submittingForm && <ButtonSpinner className="w-3.5 h-3.5" />}
                  <span>{submittingForm ? 'Saving...' : 'Save Entity'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicStructurePage;
