import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Check,
  Search,
  Zap,
  BookOpen
} from 'lucide-react';
import api from '../services/api';
import AdminHeader from '../components/common/AdminHeader';
import { TableSkeleton, ButtonSpinner } from '../components/common/AdminSkeletons';

const NotesListPage = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const debounceTimeout = useRef(null);

  const fetchNotes = async (query = '') => {
    try {
      setLoading(true);
      const res = await api.get(`/search?q=${encodeURIComponent(query || 'a')}`);
      if (res.data?.success) {
        setNotes(res.data.results.notes || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      fetchNotes(searchTerm);
    }, 250);

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [searchTerm]);

  const handleDelete = async (note) => {
    const noteId = note._id;
    if (deletingId) return;

    if (!window.confirm(`Are you sure you want to delete note "${note.title}"?`)) return;

    setDeletingId(noteId);
    // Optimistic deletion
    setNotes((prev) => prev.filter((n) => n._id !== noteId));

    try {
      await api.delete(`/notes/${noteId}`);
      setSuccessMsg(`Deleted note "${note.title}" successfully.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      // Rollback
      setNotes((prev) => [...prev, note]);
      alert(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-[#FBF9F7] dark:bg-[#141414] transition-colors pb-12">
      <AdminHeader
        title="Notes Management"
        subtitle="Create, edit, preview, and organize multi-page academic HTML notes"
      />

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {successMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2 border border-emerald-200 dark:border-emerald-800 transition">
            <Check className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search notes by title or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <Link
            to="/notes/new"
            className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-brand-500 to-coral-500 hover:from-brand-600 hover:to-coral-600 shadow-sunset flex items-center gap-1.5 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Note</span>
          </Link>
        </div>

        {/* Table of Notes */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden shadow-sm">
          {loading ? (
            <TableSkeleton rows={5} cols={7} colWidths={['w-48', 'w-20', 'w-32', 'w-16', 'w-16', 'w-16', 'w-20']} />
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-neutral-900/60 border-b border-gray-200 dark:border-neutral-800 text-gray-400 uppercase font-bold text-[10px]">
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Subject & Unit</th>
                  <th className="py-3 px-4">Pages</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-800/60">
                {notes.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-400">
                      No notes found. Create your first note above!
                    </td>
                  </tr>
                ) : (
                  notes.map((note) => {
                    const isDeleting = deletingId === note._id;

                    return (
                      <tr key={note._id} className="hover:bg-gray-50/50 dark:hover:bg-neutral-800/30 transition">
                        <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">
                          {note.title}
                        </td>
                        <td className="py-3 px-4">
                          {note.type === 'quick' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 flex items-center gap-1 w-fit">
                              <Zap className="w-3 h-3" />
                              Quick
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400 flex items-center gap-1 w-fit">
                              <BookOpen className="w-3 h-3" />
                              Normal
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-500">
                          {note.subjectId?.name || 'General Subject'}
                          {note.unitId && ` - Unit ${note.unitId.unitNumber || 1}`}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-gray-700 dark:text-gray-300">
                          {note.pageCount || note.pages?.length || 0} pages
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-brand-600 dark:text-brand-400">
                            ₹{note.discountedPrice || note.price || 0}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              note.status === 'published'
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                                : 'bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-gray-400'
                            }`}
                          >
                            {note.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              to={`/notes/edit/${note._id}`}
                              className="p-1 rounded text-gray-400 hover:text-gray-900 dark:hover:text-white"
                              title="Edit Note"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              onClick={() => handleDelete(note)}
                              disabled={isDeleting}
                              className="p-1 rounded text-rose-500 hover:text-rose-700 disabled:opacity-50"
                              title="Delete Note"
                            >
                              {isDeleting ? <ButtonSpinner className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
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
      </div>
    </div>
  );
};

export default NotesListPage;
