import React, { useState, useEffect, useRef } from 'react';
import { CreditCard, Search, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import api from '../services/api';
import AdminHeader from '../components/common/AdminHeader';
import { TableSkeleton } from '../components/common/AdminSkeletons';

const OrdersManagementPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const debounceTimeout = useRef(null);

  const fetchOrders = async (query = search, status = statusFilter) => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/orders?search=${encodeURIComponent(query)}&status=${status}`);
      if (res.data?.success) {
        setOrders(res.data.orders || []);
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
      fetchOrders(search, statusFilter);
    }, 250);

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [search, statusFilter]);

  return (
    <div className="flex-1 min-h-screen bg-[#FBF9F7] dark:bg-[#141414] transition-colors pb-12">
      <AdminHeader
        title="Orders & Cashfree Transactions"
        subtitle="Live payment verification logs, order IDs, and entitlement fulfillments"
      />

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by Order ID, Cashfree ID, item..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="text-gray-400">Filter:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="paid">Paid & Fulfilled</option>
              <option value="created">Created / Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden shadow-sm">
          {loading ? (
            <TableSkeleton rows={5} cols={7} colWidths={['w-32', 'w-28', 'w-44', 'w-16', 'w-28', 'w-16', 'w-24']} />
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-neutral-900/60 border-b border-gray-200 dark:border-neutral-800 text-gray-400 uppercase font-bold text-[10px]">
                  <th className="py-3 px-4">Order Number</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Item Type & Title</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Cashfree Payment ID</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-800/60">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-400">
                      No orders found matching filters.
                    </td>
                  </tr>
                ) : (
                  orders.map((ord) => (
                    <tr key={ord._id} className="hover:bg-gray-50/50 dark:hover:bg-neutral-800/30 transition">
                      <td className="py-3 px-4 font-mono font-bold text-gray-900 dark:text-white">
                        {ord.orderNumber}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-gray-900 dark:text-white block">
                          {ord.userId?.name || 'Student'}
                        </span>
                        <span className="text-[10px] text-gray-400">{ord.userId?.email}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] uppercase font-bold text-brand-600 block">
                          {ord.itemType}
                        </span>
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                          {ord.itemTitle}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">
                        ₹{ord.amount}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-gray-500">
                        {ord.cashfreePaymentId || ord.razorpayPaymentId || '—'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            ord.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                          }`}
                        >
                          {ord.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-[11px] text-right">
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersManagementPage;
