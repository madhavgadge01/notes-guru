import React, { useState, useEffect } from 'react';
import {
  BadgePercent,
  Save,
  Check,
  IndianRupee,
  Layers,
  FileText,
  Boxes,
  Sparkles,
  AlertCircle,
  Copy
} from 'lucide-react';
import api from '../services/api';
import AdminHeader from '../components/common/AdminHeader';
import { TableSkeleton, ButtonSpinner } from '../components/common/AdminSkeletons';

const PricingManagementPage = () => {
  const [colleges, setColleges] = useState([]);
  const [selectedCollegeId, setSelectedCollegeId] = useState('');
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [semesters, setSemesters] = useState([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [blocks, setBlocks] = useState([]);
  const [units, setUnits] = useState([]);

  // Remembered default pricing (Requirement 4)
  const [pricingDefaults, setPricingDefaults] = useState({
    semester: { price: 199, discountedPrice: 99 },
    subject: { price: 79, discountedPrice: 49 },
    block: { price: 39, discountedPrice: 25 },
    unit: { price: 29, discountedPrice: 19 },
  });

  // Loading states
  const [loadingColleges, setLoadingColleges] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingSemesters, setLoadingSemesters] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingBlocksAndUnits, setLoadingBlocksAndUnits] = useState(false);

  // Action-level button loading: { [id]: boolean }
  const [savingEntity, setSavingEntity] = useState({});
  const [saveMsg, setSaveMsg] = useState('');

  // Initial load: colleges and persistent defaults
  useEffect(() => {
    setLoadingColleges(true);
    Promise.all([
      api.get('/colleges'),
      api.get('/admin/pricing-defaults'),
    ])
      .then(([colRes, defRes]) => {
        if (colRes.data?.success && colRes.data.colleges.length > 0) {
          setColleges(colRes.data.colleges);
          setSelectedCollegeId(colRes.data.colleges[0]._id);
        }
        if (defRes.data?.success && defRes.data.defaults) {
          setPricingDefaults(defRes.data.defaults);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingColleges(false));
  }, []);

  // When college changes
  useEffect(() => {
    if (!selectedCollegeId) return;
    setLoadingCourses(true);
    api.get(`/courses/college/${selectedCollegeId}`).then((res) => {
      if (res.data?.success) {
        const cList = res.data.courses || [];
        setCourses(cList);
        if (cList.length > 0) setSelectedCourseId(cList[0]._id);
        else {
          setSelectedCourseId('');
          setSemesters([]);
          setSubjects([]);
          setBlocks([]);
          setUnits([]);
        }
      }
    }).finally(() => setLoadingCourses(false));
  }, [selectedCollegeId]);

  // When course changes
  useEffect(() => {
    if (!selectedCourseId) return;
    setLoadingSemesters(true);
    api.get(`/semesters/course/${selectedCourseId}`).then((res) => {
      if (res.data?.success) {
        const sList = res.data.semesters || [];
        setSemesters(sList);
        if (sList.length > 0) setSelectedSemesterId(sList[0]._id);
        else {
          setSelectedSemesterId('');
          setSubjects([]);
          setBlocks([]);
          setUnits([]);
        }
      }
    }).finally(() => setLoadingSemesters(false));
  }, [selectedCourseId]);

  // When semester changes, load its subjects
  useEffect(() => {
    if (!selectedSemesterId) return;
    setLoadingSubjects(true);
    api.get(`/subjects/semester/${selectedSemesterId}`).then((res) => {
      if (res.data?.success) {
        const subList = res.data.subjects || [];
        setSubjects(subList);
        if (subList.length > 0) {
          setSelectedSubjectId(subList[0]._id);
        } else {
          setSelectedSubjectId('');
          setBlocks([]);
          setUnits([]);
        }
      }
    }).finally(() => setLoadingSubjects(false));
  }, [selectedSemesterId]);

  // When subject changes, load both its blocks and units
  useEffect(() => {
    if (!selectedSubjectId) {
      setBlocks([]);
      setUnits([]);
      return;
    }
    setLoadingBlocksAndUnits(true);
    Promise.all([
      api.get(`/blocks/subject/${selectedSubjectId}`),
      api.get(`/units/subject/${selectedSubjectId}?includeUnpublished=true`),
    ]).then(([blkRes, uRes]) => {
      if (blkRes.data?.success) {
        setBlocks(blkRes.data.blocks || []);
      }
      if (uRes.data?.success) {
        setUnits(uRes.data.units || []);
      }
    }).finally(() => setLoadingBlocksAndUnits(false));
  }, [selectedSubjectId]);

  // Update semester price inline
  const handleSemesterPriceChange = (field, val) => {
    setSemesters((prev) =>
      prev.map((s) => (s._id === selectedSemesterId ? { ...s, [field]: Number(val) } : s))
    );
  };

  const handleSaveSemesterPrice = async (semester) => {
    const key = `sem_${semester._id}`;
    setSavingEntity((prev) => ({ ...prev, [key]: true }));
    try {
      await api.put(`/semesters/${semester._id}`, {
        price: semester.price,
        discountedPrice: semester.discountedPrice,
      });
      setPricingDefaults((prev) => ({
        ...prev,
        semester: { price: semester.price, discountedPrice: semester.discountedPrice },
      }));
      setSaveMsg(`Saved pricing for Semester: ${semester.name}!`);
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Semester price save failed');
    } finally {
      setSavingEntity((prev) => ({ ...prev, [key]: false }));
    }
  };

  // Update subject price inline
  const handleSubjectPriceChange = (subjectId, field, val) => {
    setSubjects((prev) =>
      prev.map((s) => (s._id === subjectId ? { ...s, [field]: Number(val) } : s))
    );
  };

  const handleSaveSubjectPrice = async (subject) => {
    const key = `sub_${subject._id}`;
    setSavingEntity((prev) => ({ ...prev, [key]: true }));
    try {
      await api.put(`/subjects/${subject._id}`, {
        price: subject.price,
        discountedPrice: subject.discountedPrice,
      });
      setPricingDefaults((prev) => ({
        ...prev,
        subject: { price: subject.price, discountedPrice: subject.discountedPrice },
      }));
      setSaveMsg(`Saved pricing for ${subject.name}!`);
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Price save failed');
    } finally {
      setSavingEntity((prev) => ({ ...prev, [key]: false }));
    }
  };

  // Update block price inline
  const handleBlockPriceChange = (blockId, field, val) => {
    setBlocks((prev) =>
      prev.map((b) => (b._id === blockId ? { ...b, [field]: Number(val) } : b))
    );
  };

  const handleSaveBlockPrice = async (block) => {
    const key = `blk_${block._id}`;
    setSavingEntity((prev) => ({ ...prev, [key]: true }));
    try {
      await api.put(`/blocks/${block._id}`, {
        price: block.price,
        discountedPrice: block.discountedPrice,
      });
      setPricingDefaults((prev) => ({
        ...prev,
        block: { price: block.price, discountedPrice: block.discountedPrice },
      }));
      setSaveMsg(`Saved pricing for Block: ${block.name}!`);
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Block price save failed');
    } finally {
      setSavingEntity((prev) => ({ ...prev, [key]: false }));
    }
  };

  // Update unit price inline
  const handleUnitPriceChange = (unitId, field, val) => {
    setUnits((prev) =>
      prev.map((u) => (u._id === unitId ? { ...u, [field]: Number(val) } : u))
    );
  };

  // Requirement 5 - Option 1: Apply to this unit only
  const handleSaveUnitPrice = async (unit) => {
    const key = `unit_${unit._id}`;
    setSavingEntity((prev) => ({ ...prev, [key]: true }));
    try {
      await api.put(`/units/${unit._id}`, {
        price: unit.price,
        discountedPrice: unit.discountedPrice,
        applyToAllInSubject: false,
      });
      setPricingDefaults((prev) => ({
        ...prev,
        unit: { price: unit.price, discountedPrice: unit.discountedPrice },
      }));
      setSaveMsg(`Saved pricing for Unit: ${unit.title || `Unit ${unit.unitNumber}`}!`);
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Unit price save failed');
    } finally {
      setSavingEntity((prev) => ({ ...prev, [key]: false }));
    }
  };

  // Requirement 5 - Option 2: Apply to ALL units in this subject
  const handleApplyToAllUnits = async (sourceUnit) => {
    const currentSub = subjects.find((s) => s._id === selectedSubjectId);
    const subName = currentSub?.name || 'this subject';

    const confirmed = window.confirm(
      `Are you sure you want to apply Regular Price: ₹${sourceUnit.price} and Discounted Price: ₹${sourceUnit.discountedPrice} to ALL units in "${subName}"?\n\nThis will update all ${units.length} unit(s) belonging to this subject.`
    );
    if (!confirmed) return;

    const key = `all_units_${sourceUnit._id}`;
    setSavingEntity((prev) => ({ ...prev, [key]: true }));

    try {
      // Call bulk update endpoint
      await api.put(`/units/subject/${selectedSubjectId}/pricing`, {
        price: sourceUnit.price,
        discountedPrice: sourceUnit.discountedPrice,
      });

      // Optimistically update all units in state
      setUnits((prev) =>
        prev.map((u) => ({
          ...u,
          price: sourceUnit.price,
          discountedPrice: sourceUnit.discountedPrice,
        }))
      );

      // Remember unit pricing
      setPricingDefaults((prev) => ({
        ...prev,
        unit: { price: sourceUnit.price, discountedPrice: sourceUnit.discountedPrice },
      }));

      setSaveMsg(`Updated pricing for all ${units.length} units in ${subName}!`);
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update pricing for all units');
    } finally {
      setSavingEntity((prev) => ({ ...prev, [key]: false }));
    }
  };

  const selectedSem = semesters.find((s) => s._id === selectedSemesterId);

  return (
    <div className="flex-1 min-h-screen bg-[#FBF9F7] dark:bg-[#141414] transition-colors pb-12">
      <AdminHeader
        title="Pricing Control Center"
        subtitle="Manage semester packages, individual subjects, block pricing, and unit pricing stored in MongoDB"
      />

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {saveMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2 border border-emerald-200 dark:border-emerald-800 transition">
            <Check className="w-4 h-4" />
            <span>{saveMsg}</span>
          </div>
        )}

        {/* Remembered Default Pricing Bar (Requirement 4) */}
        <div className="bg-gradient-to-r from-brand-50 via-cream-50 to-amber-50 dark:from-neutral-900 dark:via-neutral-900/80 dark:to-neutral-900/60 p-4 rounded-2xl border border-brand-200/80 dark:border-neutral-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-500 to-coral-500 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 block">
                Persistent Default Pricing (Auto-Remembered)
              </span>
              <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                New items automatically pre-fill using the latest saved pricing at each level.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="px-3 py-1.5 bg-white dark:bg-[#1E1E1E] rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm">
              <span className="text-gray-400 text-[10px] block font-bold">Semester</span>
              <span className="font-bold text-gray-900 dark:text-white">
                ₹{pricingDefaults.semester?.price ?? 199} <span className="text-emerald-600">/ ₹{pricingDefaults.semester?.discountedPrice ?? 99}</span>
              </span>
            </div>
            <div className="px-3 py-1.5 bg-white dark:bg-[#1E1E1E] rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm">
              <span className="text-gray-400 text-[10px] block font-bold">Subject</span>
              <span className="font-bold text-gray-900 dark:text-white">
                ₹{pricingDefaults.subject?.price ?? 79} <span className="text-emerald-600">/ ₹{pricingDefaults.subject?.discountedPrice ?? 49}</span>
              </span>
            </div>
            <div className="px-3 py-1.5 bg-white dark:bg-[#1E1E1E] rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm">
              <span className="text-gray-400 text-[10px] block font-bold">Block</span>
              <span className="font-bold text-gray-900 dark:text-white">
                ₹{pricingDefaults.block?.price ?? 39} <span className="text-emerald-600">/ ₹{pricingDefaults.block?.discountedPrice ?? 25}</span>
              </span>
            </div>
            <div className="px-3 py-1.5 bg-white dark:bg-[#1E1E1E] rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm">
              <span className="text-gray-400 text-[10px] block font-bold">Unit</span>
              <span className="font-bold text-gray-900 dark:text-white">
                ₹{pricingDefaults.unit?.price ?? 29} <span className="text-emerald-600">/ ₹{pricingDefaults.unit?.discountedPrice ?? 19}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Hierarchy Filters */}
        <div className="bg-white dark:bg-[#1E1E1E] p-4 rounded-2xl border border-gray-200 dark:border-neutral-800 flex flex-wrap items-center gap-4 text-xs font-semibold shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">College:</span>
            <select
              value={selectedCollegeId}
              onChange={(e) => setSelectedCollegeId(e.target.value)}
              className="px-2.5 py-1.5 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg text-gray-900 dark:text-white"
            >
              {colleges.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-400">Course:</span>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="px-2.5 py-1.5 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg text-gray-900 dark:text-white"
            >
              {courses.map((crs) => (
                <option key={crs._id} value={crs._id}>
                  {crs.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-400">Semester:</span>
            <select
              value={selectedSemesterId}
              onChange={(e) => setSelectedSemesterId(e.target.value)}
              className="px-2.5 py-1.5 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg text-gray-900 dark:text-white"
            >
              {semesters.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} (Sem {s.semesterNumber})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Semester Package Pricing Card */}
        {selectedSem && (
          <div className="bg-gradient-to-r from-brand-50 to-cream-100 dark:from-neutral-900 dark:to-neutral-900/60 p-6 rounded-2xl border border-brand-200 dark:border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-coral-600 uppercase tracking-widest block">
                Semester All-Subject Bundle Price
              </span>
              <h3 className="text-lg font-black text-gray-900 dark:text-white">
                {selectedSem.name} Package
              </h3>
              <p className="text-xs text-gray-500 mt-1 max-w-md">
                Admin-controlled full semester package price offered to students when unlocking all subjects.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div>
                <span className="text-[10px] text-gray-400 font-bold block">Regular Price</span>
                <input
                  type="number"
                  value={selectedSem.price || ''}
                  onChange={(e) => handleSemesterPriceChange('price', e.target.value)}
                  className="w-24 px-2 py-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg text-xs"
                />
              </div>

              <div>
                <span className="text-[10px] text-gray-400 font-bold block">Discounted Price</span>
                <input
                  type="number"
                  value={selectedSem.discountedPrice || ''}
                  onChange={(e) => handleSemesterPriceChange('discountedPrice', e.target.value)}
                  className="w-24 px-2 py-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg text-xs font-bold text-brand-600"
                />
              </div>

              <div className="pt-3">
                <button
                  onClick={() => handleSaveSemesterPrice(selectedSem)}
                  disabled={savingEntity[`sem_${selectedSem._id}`]}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 transition shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  {savingEntity[`sem_${selectedSem._id}`] && <ButtonSpinner className="w-3 h-3" />}
                  <span>Save</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Subject-Wise Pricing Table */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Subject Package Prices in Selected Semester
              </h3>
              <p className="text-[11px] text-gray-400">Click a subject to manage its blocks and units below.</p>
            </div>
          </div>

          {loadingSubjects ? (
            <TableSkeleton rows={4} cols={4} colWidths={['w-48', 'w-24', 'w-24', 'w-24']} />
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-neutral-900/60 border-b border-gray-200 dark:border-neutral-800 text-gray-400 uppercase font-bold text-[10px]">
                  <th className="py-3 px-4">Subject Name</th>
                  <th className="py-3 px-4">Regular Price (₹)</th>
                  <th className="py-3 px-4">Discounted Price (₹)</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-800/60">
                {subjects.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-gray-400">
                      No subjects in this semester.
                    </td>
                  </tr>
                ) : (
                  subjects.map((subj) => {
                    const isSaving = savingEntity[`sub_${subj._id}`];

                    return (
                      <tr
                        key={subj._id}
                        onClick={() => setSelectedSubjectId(subj._id)}
                        className={`cursor-pointer transition ${
                          selectedSubjectId === subj._id
                            ? 'bg-brand-50/50 dark:bg-brand-950/20'
                            : 'hover:bg-gray-50/50 dark:hover:bg-neutral-800/30'
                        }`}
                      >
                        <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            {subj.name}
                            {selectedSubjectId === subj._id && (
                              <span className="text-[10px] text-brand-500 font-semibold">(Selected)</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="number"
                            value={subj.price || ''}
                            onChange={(e) => handleSubjectPriceChange(subj._id, 'price', e.target.value)}
                            className="w-24 px-2 py-1 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg text-xs"
                          />
                        </td>
                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="number"
                            value={subj.discountedPrice || ''}
                            onChange={(e) =>
                              handleSubjectPriceChange(subj._id, 'discountedPrice', e.target.value)
                            }
                            className="w-24 px-2 py-1 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg text-xs font-bold text-brand-600"
                          />
                        </td>
                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleSaveSubjectPrice(subj)}
                            disabled={isSaving}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 transition shadow-sm flex items-center gap-1.5 ml-auto disabled:opacity-50"
                          >
                            {isSaving && <ButtonSpinner className="w-3 h-3" />}
                            <span>Update Subject</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Block-Wise Pricing Table */}
        {selectedSubjectId && (
          <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Block Prices for: {subjects.find((s) => s._id === selectedSubjectId)?.name}
                </h3>
                <p className="text-[11px] text-gray-400">Configure pricing for individual academic blocks.</p>
              </div>
            </div>

            {loadingBlocksAndUnits ? (
              <TableSkeleton rows={3} cols={5} colWidths={['w-40', 'w-20', 'w-24', 'w-24', 'w-24']} />
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-neutral-900/60 border-b border-gray-200 dark:border-neutral-800 text-gray-400 uppercase font-bold text-[10px]">
                    <th className="py-3 px-4">Block Name</th>
                    <th className="py-3 px-4">Block Number</th>
                    <th className="py-3 px-4">Regular Price (₹)</th>
                    <th className="py-3 px-4">Discounted Price (₹)</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-neutral-800/60">
                  {blocks.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-gray-400">
                        No blocks found for this subject.
                      </td>
                    </tr>
                  ) : (
                    blocks.map((blk) => {
                      const isSaving = savingEntity[`blk_${blk._id}`];

                      return (
                        <tr key={blk._id} className="hover:bg-gray-50/50 dark:hover:bg-neutral-800/30 transition">
                          <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">
                            {blk.name}
                          </td>
                          <td className="py-3 px-4 font-mono text-gray-500">Block {blk.blockNumber}</td>
                          <td className="py-3 px-4">
                            <input
                              type="number"
                              value={blk.price || ''}
                              onChange={(e) => handleBlockPriceChange(blk._id, 'price', e.target.value)}
                              className="w-24 px-2 py-1 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg text-xs"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="number"
                              value={blk.discountedPrice || ''}
                              onChange={(e) =>
                                handleBlockPriceChange(blk._id, 'discountedPrice', e.target.value)
                              }
                              className="w-24 px-2 py-1 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg text-xs font-bold text-brand-600"
                            />
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleSaveBlockPrice(blk)}
                              disabled={isSaving}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-coral-500 hover:bg-coral-600 transition shadow-sm flex items-center gap-1.5 ml-auto disabled:opacity-50"
                            >
                              {isSaving && <ButtonSpinner className="w-3 h-3" />}
                              <span>Update Block</span>
                            </button>
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

        {/* Requirement 5: Unit-Wise Pricing Table with Apply to One / Apply to All Options */}
        {selectedSubjectId && (
          <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-100 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span>Unit Prices for: {subjects.find((s) => s._id === selectedSubjectId)?.name}</span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                    {units.length} Units
                  </span>
                </h3>
                <p className="text-[11px] text-gray-400">
                  Update an individual unit, or use <strong>"Apply to All Units in Subject"</strong> to synchronize pricing across all {units.length} units.
                </p>
              </div>
            </div>

            {loadingBlocksAndUnits ? (
              <TableSkeleton rows={4} cols={5} colWidths={['w-40', 'w-20', 'w-24', 'w-24', 'w-32']} />
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-neutral-900/60 border-b border-gray-200 dark:border-neutral-800 text-gray-400 uppercase font-bold text-[10px]">
                    <th className="py-3 px-4">Unit # & Title</th>
                    <th className="py-3 px-4">Parent Block</th>
                    <th className="py-3 px-4">Regular Price (₹)</th>
                    <th className="py-3 px-4">Discounted Price (₹)</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-neutral-800/60">
                  {units.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-gray-400">
                        No units found for this subject.
                      </td>
                    </tr>
                  ) : (
                    units.map((u) => {
                      const isSavingSingle = savingEntity[`unit_${u._id}`];
                      const isSavingAll = savingEntity[`all_units_${u._id}`];

                      return (
                        <tr key={u._id} className="hover:bg-gray-50/50 dark:hover:bg-neutral-800/30 transition">
                          <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">
                            <div>
                              <span>Unit {u.unitNumber}: {u.title}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-500 font-mono">
                            {u.blockId?.name ? `Block ${u.blockId.blockNumber || 1}` : 'Direct Unit'}
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="number"
                              value={u.price || ''}
                              onChange={(e) => handleUnitPriceChange(u._id, 'price', e.target.value)}
                              className="w-24 px-2 py-1 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg text-xs"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="number"
                              value={u.discountedPrice || ''}
                              onChange={(e) =>
                                handleUnitPriceChange(u._id, 'discountedPrice', e.target.value)
                              }
                              className="w-24 px-2 py-1 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg text-xs font-bold text-brand-600"
                            />
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Option 1: Apply only to this unit */}
                              <button
                                onClick={() => handleSaveUnitPrice(u)}
                                disabled={isSavingSingle || isSavingAll}
                                className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 transition shadow-sm flex items-center gap-1 disabled:opacity-50"
                                title="Update pricing only for this unit"
                              >
                                {isSavingSingle && <ButtonSpinner className="w-3 h-3" />}
                                <span>Apply to this unit</span>
                              </button>

                              {/* Option 2: Apply to ALL units in this subject (Requirement 5) */}
                              <button
                                onClick={() => handleApplyToAllUnits(u)}
                                disabled={isSavingSingle || isSavingAll}
                                className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-white bg-gradient-to-r from-brand-500 to-amber-600 hover:from-brand-600 hover:to-amber-700 transition shadow-sm flex items-center gap-1 disabled:opacity-50"
                                title="Apply this price to all units in this subject"
                              >
                                {isSavingAll && <ButtonSpinner className="w-3 h-3" />}
                                <Copy className="w-3 h-3" />
                                <span>Apply to all units in subject</span>
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
      </div>
    </div>
  );
};

export default PricingManagementPage;
