import React, { useState, useEffect, useRef } from 'react';
import { Users, Search, ShieldAlert, ShieldCheck, Check, Ban, CheckCircle } from 'lucide-react';
import api from '../services/api';
import AdminHeader from '../components/common/AdminHeader';
import { TableSkeleton, ButtonSpinner } from '../components/common/AdminSkeletons';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [successMsg, setSuccessMsg] = useState('');
  const [togglingUserId, setTogglingUserId] = useState(null);

  const debounceTimeout = useRef(null);

  const fetchUsers = async (query = search, targetPage = page) => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/users?search=${encodeURIComponent(query)}&page=${targetPage}`);
      if (res.data?.success) {
        setUsers(res.data.users || []);
        setTotalPages(res.data.pages || 1);
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
      fetchUsers(search, page);
    }, 250);

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [search, page]);

  // Optimistic Toggle Block without full-page table destruction
  const handleToggleBlock = async (user) => {
    const userId = user._id;
    if (togglingUserId) return;

    if (!window.confirm(`Are you sure you want to ${user.isBlocked ? 'unblock' : 'block'} student ${user.name}?`)) {
      return;
    }

    setTogglingUserId(userId);
    // Optimistic toggle in state
    setUsers((prev) =>
      prev.map((u) => (u._id === userId ? { ...u, isBlocked: !u.isBlocked } : u))
    );

    try {
      const res = await api.patch(`/admin/users/${userId}/toggle-block`);
      if (res.data?.success) {
        setSuccessMsg(res.data.message || `Student ${user.isBlocked ? 'unblocked' : 'blocked'} successfully`);
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      // Rollback on error
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isBlocked: user.isBlocked } : u))
      );
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setTogglingUserId(null);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-[#FBF9F7] dark:bg-[#141414] transition-colors pb-12">
      <AdminHeader
        title="Student User Accounts"
        subtitle="Manage student registrations, single-device session states, and block/unblock controls"
      />

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {successMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2 border border-emerald-200 dark:border-emerald-800 transition">
            <Check className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search students by name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden shadow-sm">
          {loading ? (
            <TableSkeleton rows={5} cols={6} colWidths={['w-44', 'w-48', 'w-24', 'w-24', 'w-20', 'w-20']} />
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-neutral-900/60 border-b border-gray-200 dark:border-neutral-800 text-gray-400 uppercase font-bold text-[10px]">
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">College / Course</th>
                  <th className="py-3 px-4">Registered Date</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-800/60">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-gray-400">
                      No student accounts found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => {
                    const isToggling = togglingUserId === user._id;

                    return (
                      <tr key={user._id} className="hover:bg-gray-50/50 dark:hover:bg-neutral-800/30 transition">
                        <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">
                          {user.name}
                        </td>
                        <td className="py-3 px-4 text-gray-500">{user.email}</td>
                        <td className="py-3 px-4 text-gray-500">
                          {user.college?.name || user.college?.code || 'DTU'} /{' '}
                          {user.course?.name || user.course?.code || 'B.Tech'}
                        </td>
                        <td className="py-3 px-4 font-mono text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          {user.isBlocked ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 flex items-center gap-1 w-fit">
                              <Ban className="w-3 h-3" />
                              Blocked
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center gap-1 w-fit">
                              <CheckCircle className="w-3 h-3" />
                              Active
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleToggleBlock(user)}
                            disabled={isToggling}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ml-auto disabled:opacity-50 ${
                              user.isBlocked
                                ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                                : 'bg-rose-500 hover:bg-rose-600 text-white'
                            }`}
                          >
                            {isToggling ? (
                              <ButtonSpinner className="w-3 h-3" />
                            ) : user.isBlocked ? (
                              <ShieldCheck className="w-3.5 h-3.5" />
                            ) : (
                              <ShieldAlert className="w-3.5 h-3.5" />
                            )}
                            <span>{user.isBlocked ? 'Unblock' : 'Block Student'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between text-xs font-semibold">
              <span className="text-gray-400">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-neutral-700 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-neutral-700 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagementPage;
