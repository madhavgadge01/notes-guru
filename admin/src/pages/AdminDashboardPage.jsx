import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  BookOpen,
  Layers,
  FileText,
  CreditCard,
  IndianRupee,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Plus
} from 'lucide-react';
import api from '../services/api';
import AdminHeader from '../components/common/AdminHeader';

const AdminDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/dashboard');
        if (res.data?.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 min-h-screen bg-[#FBF9F7] dark:bg-[#141414] transition-colors pb-12">
        <AdminHeader
          title="Admin Control Dashboard"
          subtitle="Live platform metrics, academic statistics, and transaction health"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
          {/* Top 4 Stats Metric Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="p-5 rounded-2xl bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-neutral-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="skeleton-shimmer h-4 w-24 rounded" />
                  <div className="skeleton-shimmer w-8 h-8 rounded-lg" />
                </div>
                <div className="skeleton-shimmer h-8 w-28 rounded-lg" />
                <div className="skeleton-shimmer h-3 w-36 rounded" />
              </div>
            ))}
          </div>

          {/* 2-Column Split Skeletons */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-neutral-800 space-y-4">
              <div className="skeleton-shimmer h-6 w-44 rounded-md" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-neutral-800">
                    <div className="space-y-1.5">
                      <div className="skeleton-shimmer h-4 w-40 rounded" />
                      <div className="skeleton-shimmer h-3 w-28 rounded" />
                    </div>
                    <div className="skeleton-shimmer h-5 w-16 rounded" />
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-neutral-800 space-y-4">
              <div className="skeleton-shimmer h-6 w-36 rounded-md" />
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="p-3 rounded-xl border border-gray-100 dark:border-neutral-800 space-y-2">
                    <div className="skeleton-shimmer h-4 w-32 rounded" />
                    <div className="skeleton-shimmer h-3 w-20 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentTransactions = data?.recentTransactions || [];
  const popularSubjects = data?.popularSubjects || [];

  return (
    <div className="flex-1 min-h-screen bg-[#FBF9F7] dark:bg-[#141414] transition-colors pb-12">
      <AdminHeader
        title="Admin Control Dashboard"
        subtitle="Live platform metrics, academic statistics, and transaction health"
      />

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#1E1E1E] p-5 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
              <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-gray-950 dark:text-white">
              ₹{stats.totalRevenue?.toLocaleString('en-IN') || 0}
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold block">
              Direct Razorpay verified payments
            </span>
          </div>

          <div className="bg-white dark:bg-[#1E1E1E] p-5 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
              <span className="text-xs font-bold uppercase tracking-wider">Registered Students</span>
              <div className="p-2 bg-brand-50 dark:bg-brand-950/40 text-brand-600 rounded-xl">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-gray-950 dark:text-white">
              {stats.totalStudents || 0}
            </div>
            <span className="text-[10px] text-gray-400 font-medium block">
              Active student accounts
            </span>
          </div>

          <div className="bg-white dark:bg-[#1E1E1E] p-5 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
              <span className="text-xs font-bold uppercase tracking-wider">Academic Notes</span>
              <div className="p-2 bg-coral-50 dark:bg-coral-950/40 text-coral-600 rounded-xl">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-gray-950 dark:text-white">
              {stats.totalNotes || 0}
            </div>
            <span className="text-[10px] text-gray-400 font-medium block">
              In {stats.totalUnits || 0} units across {stats.totalSubjects || 0} subjects
            </span>
          </div>

          <div className="bg-white dark:bg-[#1E1E1E] p-5 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
              <span className="text-xs font-bold uppercase tracking-wider">Purchases Unlocked</span>
              <div className="p-2 bg-sunset-red/10 text-sunset-red rounded-xl">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-gray-950 dark:text-white">
              {stats.totalPurchases || 0}
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold block">
              Entitlements granted
            </span>
          </div>
        </div>

        {/* Academic Hierarchy Summary Ribbon */}
        <div className="bg-white dark:bg-[#1E1E1E] p-5 rounded-2xl border border-gray-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6 text-xs">
            <div>
              <span className="text-gray-400 block uppercase font-bold text-[10px]">Colleges</span>
              <span className="text-base font-bold text-gray-900 dark:text-white">{stats.totalColleges}</span>
            </div>
            <div className="h-6 w-px bg-gray-200 dark:bg-neutral-800" />
            <div>
              <span className="text-gray-400 block uppercase font-bold text-[10px]">Courses</span>
              <span className="text-base font-bold text-gray-900 dark:text-white">{stats.totalCourses}</span>
            </div>
            <div className="h-6 w-px bg-gray-200 dark:bg-neutral-800" />
            <div>
              <span className="text-gray-400 block uppercase font-bold text-[10px]">Semesters</span>
              <span className="text-base font-bold text-gray-900 dark:text-white">{stats.totalSemesters}</span>
            </div>
            <div className="h-6 w-px bg-gray-200 dark:bg-neutral-800" />
            <div>
              <span className="text-gray-400 block uppercase font-bold text-[10px]">Subjects</span>
              <span className="text-base font-bold text-gray-900 dark:text-white">{stats.totalSubjects}</span>
            </div>
            <div className="h-6 w-px bg-gray-200 dark:bg-neutral-800" />
            <div>
              <span className="text-gray-400 block uppercase font-bold text-[10px]">Units</span>
              <span className="text-base font-bold text-gray-900 dark:text-white">{stats.totalUnits}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/academic"
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/40 hover:bg-brand-100 transition"
            >
              Manage Hierarchy
            </Link>
            <Link
              to="/notes/new"
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 shadow-sm flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Note</span>
            </Link>
          </div>
        </div>

        {/* Two-Column Grid: Recent Transactions & Popular Subjects */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Transactions (2 cols) */}
          <div className="lg:col-span-2 bg-white dark:bg-[#1E1E1E] rounded-2xl border border-gray-200 dark:border-neutral-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-neutral-800">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-500" />
                <span>Recent Orders & Unlocks</span>
              </h3>
              <Link to="/orders" className="text-xs font-bold text-brand-500 hover:underline">
                View All
              </Link>
            </div>

            {recentTransactions.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No orders recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-gray-400 uppercase font-bold text-[10px] border-b border-gray-100 dark:border-neutral-800">
                      <th className="pb-2">Order</th>
                      <th className="pb-2">Student</th>
                      <th className="pb-2">Item</th>
                      <th className="pb-2">Amount</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-neutral-800/60">
                    {recentTransactions.map((tx) => (
                      <tr key={tx._id} className="hover:bg-gray-50/50 dark:hover:bg-neutral-800/30">
                        <td className="py-2.5 font-mono text-gray-500 text-[11px]">{tx.orderNumber}</td>
                        <td className="py-2.5 font-medium text-gray-900 dark:text-white">
                          {tx.userId?.name || 'Student'}
                        </td>
                        <td className="py-2.5 text-gray-600 dark:text-gray-300 truncate max-w-[180px]">
                          {tx.itemTitle}
                        </td>
                        <td className="py-2.5 font-bold text-gray-900 dark:text-white">₹{tx.amount}</td>
                        <td className="py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              tx.status === 'paid'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {tx.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Popular Subjects & Notes (1 col) */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl border border-gray-200 dark:border-neutral-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-neutral-800">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                
                <span>Active Subjects</span>
              </h3>
              <Link to="/academic" className="text-xs font-bold text-brand-500 hover:underline">
                Manage
              </Link>
            </div>

            <div className="space-y-3">
              {popularSubjects.map((subj) => (
                <div
                  key={subj._id}
                  className="p-3 rounded-xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-200 dark:border-neutral-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-gray-900 dark:text-white block">
                      {subj.name}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">{subj.code}</span>
                  </div>
                  <span className="font-bold text-brand-600 dark:text-brand-400">
                    ₹{subj.discountedPrice || subj.price}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
