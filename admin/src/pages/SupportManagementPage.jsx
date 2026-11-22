import React, { useState, useEffect, useRef } from 'react';
import {
  HelpCircle,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  User,
  Mail,
  Calendar,
  MessageSquare,
  ShieldCheck,
  UserCheck,
  Filter,
  Save,
  Check,
  ArrowUpRight,
} from 'lucide-react';
import api from '../services/api';
import AdminHeader from '../components/common/AdminHeader';
import { TableSkeleton, ButtonSpinner } from '../components/common/AdminSkeletons';

const SupportManagementPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({ total: 0, new: 0, in_progress: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('');

  // Details Modal state
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('new');
  const [adminNotes, setAdminNotes] = useState('');
  const [modalSuccessMsg, setModalSuccessMsg] = useState('');
  const [modalErrorMsg, setModalErrorMsg] = useState('');

  const debounceTimeout = useRef(null);

  const fetchComplaints = async (query = search, status = statusFilter, type = userTypeFilter) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (query.trim()) params.append('search', query.trim());
      if (status && status !== 'all') params.append('status', status);
      if (type && type !== 'all') params.append('userType', type);

      const res = await api.get(`/admin/complaints?${params.toString()}`);
      if (res.data?.success) {
        setComplaints(res.data.complaints || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      fetchComplaints(search, statusFilter, userTypeFilter);
    }, 250);

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [search, statusFilter, userTypeFilter]);

  // Open Details Modal
  const handleOpenDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status || 'new');
    setAdminNotes(complaint.adminNotes || '');
    setModalSuccessMsg('');
    setModalErrorMsg('');
    setModalOpen(true);
  };

  // Update Status in backend
  const handleStatusUpdate = async () => {
    if (!selectedComplaint) return;
    try {
      setUpdatingStatus(true);
      setModalErrorMsg('');
      setModalSuccessMsg('');

      const res = await api.patch(`/admin/complaints/${selectedComplaint._id}/status`, {
        status: newStatus,
        adminNotes,
      });

      if (res.data?.success) {
        const updated = res.data.complaint;
        setModalSuccessMsg('Complaint status updated successfully!');
        setSelectedComplaint(updated);

        // Update list locally
        setComplaints((prev) =>
          prev.map((c) => (c._id === updated._id ? { ...c, status: updated.status, adminNotes: updated.adminNotes } : c))
        );

        // Refresh stats
        fetchComplaints(search, statusFilter, userTypeFilter);
      }
    } catch (err) {
      console.error('Status update failed:', err);
      setModalErrorMsg(err.response?.data?.message || 'Failed to update complaint status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Helper to format date
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Helper for status badge styling
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'new':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            New
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            In Progress
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
            <CheckCircle className="w-3 h-3 text-emerald-500" />
            Resolved
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-[#FBF9F7] dark:bg-[#141414] transition-colors pb-12">
      <AdminHeader
        title="Help & Support"
        subtitle="Customer complaints, user feedback, and resolution management"
      />

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Top Summary Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#1E1E1E] p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Tickets</p>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{stats.total}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 flex items-center justify-center font-bold">
              <HelpCircle className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white dark:bg-[#1E1E1E] p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-500">New / Unresolved</p>
              <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{stats.new}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white dark:bg-[#1E1E1E] p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-blue-500">In Progress</p>
              <h3 className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{stats.in_progress}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white dark:bg-[#1E1E1E] p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-500">Resolved</p>
              <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.resolved}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center font-bold">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Search & Filters Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by User Name, Email, Ticket ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center gap-3 text-xs font-bold flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-gray-400">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="new">New</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-gray-400">User:</span>
              <select
                value={userTypeFilter}
                onChange={(e) => setUserTypeFilter(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none"
              >
                <option value="">All Types</option>
                <option value="registered">Registered</option>
                <option value="guest">Guest</option>
              </select>
            </div>
          </div>
        </div>

        {/* Complaints Table */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden shadow-sm">
          {loading ? (
            <TableSkeleton rows={5} cols={8} colWidths={['w-28', 'w-36', 'w-40', 'w-56', 'w-24', 'w-28', 'w-24', 'w-20']} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-neutral-900/60 border-b border-gray-200 dark:border-neutral-800 text-gray-400 uppercase font-bold text-[10px]">
                    <th className="py-3 px-4">Ticket ID</th>
                    <th className="py-3 px-4">User Name</th>
                    <th className="py-3 px-4">Email Address</th>
                    <th className="py-3 px-4">Issue Description</th>
                    <th className="py-3 px-4">User Type</th>
                    <th className="py-3 px-4">Submission Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-neutral-800/60">
                  {complaints.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-12 text-center text-gray-400">
                        <HelpCircle className="w-8 h-8 text-gray-300 dark:text-neutral-700 mx-auto mb-2" />
                        <span>No support complaints found matching your criteria.</span>
                      </td>
                    </tr>
                  ) : (
                    complaints.map((c) => (
                      <tr key={c._id} className="hover:bg-gray-50/50 dark:hover:bg-neutral-800/30 transition">
                        {/* Ticket ID */}
                        <td className="py-3.5 px-4 font-mono font-bold text-gray-900 dark:text-white">
                          <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-neutral-800 text-[11px]">
                            {c.ticketId}
                          </span>
                        </td>

                        {/* User Name */}
                        <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white truncate max-w-[150px]">
                          {c.name}
                        </td>

                        {/* Email Address */}
                        <td className="py-3.5 px-4 text-gray-500 dark:text-gray-400 font-mono text-[11px] truncate max-w-[180px]">
                          {c.email}
                        </td>

                        {/* Issue Description */}
                        <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300 max-w-xs truncate" title={c.description}>
                          {c.description}
                        </td>

                        {/* User Type */}
                        <td className="py-3.5 px-4">
                          {c.userType === 'registered' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-900/40">
                              <UserCheck className="w-3 h-3" />
                              Registered
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-neutral-700">
                              <User className="w-3 h-3" />
                              Guest
                            </span>
                          )}
                        </td>

                        {/* Submission Date */}
                        <td className="py-3.5 px-4 text-gray-500 text-[11px] whitespace-nowrap">
                          {formatDate(c.createdAt)}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {renderStatusBadge(c.status)}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(c)}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 hover:bg-brand-100 dark:hover:bg-brand-900/60 transition"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* COMPLAINT DETAILS MODAL */}
      {modalOpen && selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl border border-gray-200 dark:border-neutral-800 p-6 max-w-xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-gray-100 dark:border-neutral-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-neutral-800 text-xs font-mono font-bold text-brand-600 dark:text-brand-400">
                    {selectedComplaint.ticketId}
                  </span>
                  {renderStatusBadge(selectedComplaint.status)}
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mt-1.5">
                  Support Ticket Details
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalSuccessMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs rounded-xl flex items-center gap-2 border border-emerald-200 dark:border-emerald-800">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>{modalSuccessMsg}</span>
              </div>
            )}

            {modalErrorMsg && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 text-xs rounded-xl flex items-center gap-2 border border-rose-200 dark:border-rose-800">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{modalErrorMsg}</span>
              </div>
            )}

            {/* User & Ticket Metadata */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-neutral-900 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block">User Name</span>
                <span className="font-bold text-gray-900 dark:text-white text-sm">{selectedComplaint.name}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Email Address</span>
                <a
                  href={`mailto:${selectedComplaint.email}?subject=Re: GenZNotes Support Ticket ${selectedComplaint.ticketId}`}
                  className="font-mono text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                >
                  <span>{selectedComplaint.email}</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block">User Type</span>
                <span className="font-semibold text-gray-700 dark:text-gray-300 capitalize">
                  {selectedComplaint.userType === 'registered' ? 'Registered Student Account' : 'Guest Inquirer'}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Submitted At</span>
                <span className="font-mono text-gray-700 dark:text-gray-300 text-xs">
                  {formatDate(selectedComplaint.createdAt)}
                </span>
              </div>
            </div>

            {/* Full Issue Description */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                Full Issue Description
              </label>
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-xs text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                {selectedComplaint.description}
              </div>
            </div>

            {/* Status Update Control */}
            <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-neutral-800">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Update Ticket Status
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {['new', 'in_progress', 'resolved'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setNewStatus(st)}
                    className={`py-2 px-3 rounded-xl font-bold border transition capitalize ${
                      newStatus === st
                        ? 'bg-gradient-to-r from-brand-500 to-coral-500 text-white border-transparent shadow-sm'
                        : 'bg-gray-50 dark:bg-neutral-900 border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>

              {/* Admin Internal Resolution Notes */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1">
                  Internal Admin Resolution Notes (Optional)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Record resolution steps, customer replies, or notes for internal staff..."
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-brand-500 resize-none"
                />
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={handleStatusUpdate}
                  disabled={updatingStatus}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-50 transition shadow-sm flex items-center gap-1.5"
                >
                  {updatingStatus ? <ButtonSpinner className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save Status</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportManagementPage;
