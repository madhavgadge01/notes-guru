import React, { useState, useEffect } from 'react';
import {
  User,
  GraduationCap,
  CreditCard,
  Key,
  ShieldCheck,
  CheckCircle,
  Clock,
  LogOut,
  Save,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { OrdersSkeleton } from '../components/common/Skeletons';
import SEOHead from '../components/common/SEOHead';

const ProfilePage = () => {
  const { user, logout, savePreferences } = useAuth();

  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileMsg, setProfileMsg] = useState('');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Academic preferences dropdowns
  const [colleges, setColleges] = useState([]);
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedCollegeId, setSelectedCollegeId] = useState(user?.college?._id || user?.college || '');
  const [selectedCourseId, setSelectedCourseId] = useState(user?.course?._id || user?.course || '');
  const [selectedSemesterId, setSelectedSemesterId] = useState(user?.semester?._id || user?.semester || '');
  const [prefMsg, setPrefMsg] = useState('');

  const selectedCourse = courses.find((c) => c._id === selectedCourseId);
  const isYear = selectedCourse?.academicStructure === 'year';

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      if (user.college) setSelectedCollegeId(user.college._id || user.college);
      if (user.course) setSelectedCourseId(user.course._id || user.course);
      if (user.semester) setSelectedSemesterId(user.semester._id || user.semester);
    }
  }, [user]);

  // Load orders
  useEffect(() => {
    if (activeTab === 'orders') {
      const fetchOrders = async () => {
        try {
          setLoadingOrders(true);
          const res = await api.get('/orders/my-orders');
          if (res.data?.success) {
            setOrders(res.data.orders || []);
          }
        } catch (err) {
          console.error('Failed to load orders:', err);
        } finally {
          setLoadingOrders(false);
        }
      };
      fetchOrders();
    }
  }, [activeTab]);

  // Load Colleges
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const res = await api.get('/colleges');
        if (res.data?.success) {
          setColleges(res.data.colleges || []);
        }
      } catch (err) {
        console.error('Failed to load colleges:', err);
      }
    };
    fetchColleges();
  }, []);

  // When college changes, fetch courses
  useEffect(() => {
    if (!selectedCollegeId) return;
    const fetchCourses = async () => {
      try {
        const res = await api.get(`/courses/college/${selectedCollegeId}`);
        if (res.data?.success) {
          setCourses(res.data.courses || []);
        }
      } catch (err) {
        console.error('Failed to load courses:', err);
      }
    };
    fetchCourses();
  }, [selectedCollegeId]);

  // When course changes, fetch semesters
  useEffect(() => {
    if (!selectedCourseId) return;
    const fetchSemesters = async () => {
      try {
        const res = await api.get(`/semesters/course/${selectedCourseId}`);
        if (res.data?.success) {
          setSemesters(res.data.semesters || []);
        }
      } catch (err) {
        console.error('Failed to load semesters:', err);
      }
    };
    fetchSemesters();
  }, [selectedCourseId]);

  // Save profile
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/auth/profile', { name, phone });
      if (res.data?.success) {
        setProfileMsg('Profile updated successfully!');
        setTimeout(() => setProfileMsg(''), 3000);
      }
    } catch (err) {
      console.error('Update profile error:', err);
    }
  };

  // Save Academic Preferences
  const handleSaveAcademicPreferences = async (e) => {
    e.preventDefault();
    if (selectedCollegeId && selectedCourseId && selectedSemesterId) {
      const success = await savePreferences(selectedCollegeId, selectedCourseId, selectedSemesterId);
      if (success) {
        setPrefMsg('Academic preferences updated! These will pre-fill your homepage searches.');
        setTimeout(() => setPrefMsg(''), 4000);
      }
    }
  };

  // Change password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordMsg('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    try {
      const res = await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      if (res.data?.success) {
        setPasswordMsg('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordMsg(''), 3000);
      }
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to update password');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F3EF] dark:bg-[#141414] text-[#242321] dark:text-gray-100 transition-colors py-6 sm:py-8 pb-24 md:pb-12">
      <SEOHead title="My Profile & Settings | GenZ Notes" noindex={true} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Profile Card Header */}
        <div className="bg-[#FAF9F6] dark:bg-[#1E1E1E] rounded-2xl sm:rounded-3xl border border-[#E3DED5] dark:border-neutral-800 p-5 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5 sm:gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-500 to-coral-500 text-white flex items-center justify-center font-black text-2xl shadow-sunset flex-shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || 'S'}
            </div>
            <div className="text-center sm:text-left min-w-0">
              <h1 className="text-xl sm:text-2xl font-black text-[#242321] dark:text-white truncate">
                {user?.name}
              </h1>
              <p className="text-xs text-[#77736C] dark:text-gray-400 mt-0.5 truncate">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Single-Device Active Session
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-900/40 flex items-center gap-1.5 transition active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-b border-[#E3DED5] dark:border-neutral-800 text-xs font-bold pb-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl transition whitespace-nowrap active:scale-95 ${
              activeTab === 'profile'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-[#77736C] dark:text-gray-400 hover:bg-[#EEEAE3] dark:hover:bg-neutral-800'
            }`}
          >
            Profile Info
          </button>
          <button
            onClick={() => setActiveTab('academics')}
            className={`px-4 py-2 rounded-xl transition whitespace-nowrap active:scale-95 ${
              activeTab === 'academics'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-[#77736C] dark:text-gray-400 hover:bg-[#EEEAE3] dark:hover:bg-neutral-800'
            }`}
          >
            Academic Preferences
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl transition whitespace-nowrap active:scale-95 ${
              activeTab === 'orders'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-[#77736C] dark:text-gray-400 hover:bg-[#EEEAE3] dark:hover:bg-neutral-800'
            }`}
          >
            Purchase History
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 rounded-xl transition whitespace-nowrap active:scale-95 ${
              activeTab === 'security'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-[#77736C] dark:text-gray-400 hover:bg-[#EEEAE3] dark:hover:bg-neutral-800'
            }`}
          >
            Security & Password
          </button>
        </div>

        {/* Tab 1: Profile Info */}
        {activeTab === 'profile' && (
          <div className="bg-white dark:bg-[#202020] rounded-2xl border border-gray-200 dark:border-neutral-800 p-6 sm:p-8 max-w-xl">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">
              Edit Personal Information
            </h3>

            {profileMsg && (
              <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>{profileMsg}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl text-sm text-gray-500 cursor-not-allowed"
                />
                <span className="text-[10px] text-gray-400 mt-0.5 block">
                  Email is linked to your purchased note entitlements and watermarks.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl text-sm"
                />
              </div>

              <button
                type="submit"
                className="py-2.5 px-5 rounded-xl font-bold text-xs text-white bg-brand-500 hover:bg-brand-600 shadow-sm flex items-center gap-1.5 transition"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: Academic Preferences */}
        {activeTab === 'academics' && (
          <div className="bg-white dark:bg-[#202020] rounded-2xl border border-gray-200 dark:border-neutral-800 p-6 sm:p-8 max-w-xl">
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="w-5 h-5 text-brand-500" />
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Saved Academic Preferences
              </h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              GenZNotes remembers your college, course, and semester so you never have to re-select them on every visit.
            </p>

            {prefMsg && (
              <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>{prefMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveAcademicPreferences} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  College
                </label>
                <select
                  value={selectedCollegeId}
                  onChange={(e) => setSelectedCollegeId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl text-sm"
                  required
                >
                  <option value="">Select College...</option>
                  {colleges.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Course
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl text-sm"
                  required
                >
                  <option value="">Select Course...</option>
                  {courses.map((crs) => (
                    <option key={crs._id} value={crs._id}>
                      {crs.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {isYear ? 'Year' : 'Semester'}
                </label>
                <select
                  value={selectedSemesterId}
                  onChange={(e) => setSelectedSemesterId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl text-sm"
                  required
                >
                  <option value="">Select {isYear ? 'Year' : 'Semester'}...</option>
                  {semesters.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="py-2.5 px-5 rounded-xl font-bold text-xs text-white bg-brand-500 hover:bg-brand-600 shadow-sm flex items-center gap-1.5 transition"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Academic Preferences</span>
              </button>
            </form>
          </div>
        )}

        {/* Tab 3: Purchase History */}
        {activeTab === 'orders' && (
          <div className="bg-white dark:bg-[#202020] rounded-2xl border border-gray-200 dark:border-neutral-800 p-6 sm:p-8">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">
              All Orders & Cashfree Invoices
            </h3>

            {loadingOrders ? (
              <OrdersSkeleton />
            ) : orders.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No orders placed yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-neutral-800 text-gray-400 uppercase font-bold">
                      <th className="py-2.5 px-3">Order Number</th>
                      <th className="py-2.5 px-3">Item Purchased</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Payment ID</th>
                      <th className="py-2.5 px-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((ord) => (
                      <tr
                        key={ord._id}
                        className="border-b border-gray-100 dark:border-neutral-800/60 hover:bg-gray-50 dark:hover:bg-neutral-800/40"
                      >
                        <td className="py-3 px-3 font-mono font-semibold text-gray-900 dark:text-white">
                          {ord.orderNumber}
                        </td>
                        <td className="py-3 px-3 font-medium text-gray-800 dark:text-gray-200">
                          {ord.itemTitle}
                        </td>
                        <td className="py-3 px-3 font-bold text-gray-900 dark:text-white">
                          ₹{ord.amount}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              ord.status === 'paid'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {ord.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-gray-400 text-[11px]">
                          {ord.cashfreePaymentId || ord.razorpayPaymentId || '—'}
                        </td>
                        <td className="py-3 px-3 text-gray-500 text-[11px]">
                          {new Date(ord.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Security / Change Password */}
        {activeTab === 'security' && (
          <div className="bg-white dark:bg-[#202020] rounded-2xl border border-gray-200 dark:border-neutral-800 p-6 sm:p-8 max-w-xl">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">
              Update Password
            </h3>

            {passwordError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordMsg && (
              <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>{passwordMsg}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl text-sm"
                  required
                />
              </div>

              <button
                type="submit"
                className="py-2.5 px-5 rounded-xl font-bold text-xs text-white bg-brand-500 hover:bg-brand-600 shadow-sm transition"
              >
                Update Password
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
