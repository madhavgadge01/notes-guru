import React, { useState, useEffect } from 'react';
import { Settings, Save, Check, AlertCircle, Bell, HelpCircle, Sparkles } from 'lucide-react';
import api from '../services/api';
import AdminHeader from '../components/common/AdminHeader';
import { ButtonSpinner } from '../components/common/AdminSkeletons';

const SettingsPage = () => {
  const [platformName, setPlatformName] = useState('GenZNotes');
  const [tagline, setTagline] = useState('Exam Tomorrow? GenZNotes Today.');
  const [defaultCurrency, setDefaultCurrency] = useState('INR');
  const [defaultPreviewPagesNormal, setDefaultPreviewPagesNormal] = useState(2);
  const [defaultPreviewPagesQuick, setDefaultPreviewPagesQuick] = useState(0);
  const [supportEmail, setSupportEmail] = useState('support@genznotes.in');
  const [supportPhone, setSupportPhone] = useState('+91 98765 43210');
  const [announcementBanner, setAnnouncementBanner] = useState('');

  // Persistent default pricing across hierarchy
  const [pricingDefaults, setPricingDefaults] = useState({
    semester: { price: 199, discountedPrice: 99 },
    subject: { price: 79, discountedPrice: 49 },
    block: { price: 39, discountedPrice: 25 },
    unit: { price: 29, discountedPrice: 19 },
  });

  const [loading, setLoading] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    const fetchSettingsAndPricing = async () => {
      try {
        const [settingsRes, pricingRes] = await Promise.all([
          api.get('/admin/settings'),
          api.get('/admin/pricing-defaults'),
        ]);

        if (settingsRes.data?.success) {
          const s = settingsRes.data.settings;
          if (s.platformName) setPlatformName(s.platformName);
          if (s.tagline) setTagline(s.tagline);
          if (s.defaultCurrency) setDefaultCurrency(s.defaultCurrency);
          if (s.defaultPreviewPagesNormal !== undefined)
            setDefaultPreviewPagesNormal(s.defaultPreviewPagesNormal);
          if (s.defaultPreviewPagesQuick !== undefined)
            setDefaultPreviewPagesQuick(s.defaultPreviewPagesQuick);
          if (s.supportEmail) setSupportEmail(s.supportEmail);
          if (s.supportPhone) setSupportPhone(s.supportPhone);
          if (s.announcementBanner) setAnnouncementBanner(s.announcementBanner);
        }

        if (pricingRes.data?.success && pricingRes.data.defaults) {
          setPricingDefaults(pricingRes.data.defaults);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchSettingsAndPricing();
  }, []);

  const handlePriceChange = (level, field, value) => {
    setPricingDefaults((prev) => ({
      ...prev,
      [level]: {
        ...prev[level],
        [field]: Number(value) || 0,
      },
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await Promise.all([
        api.put('/admin/settings', {
          platformName,
          tagline,
          defaultCurrency,
          defaultPreviewPagesNormal: Number(defaultPreviewPagesNormal),
          defaultPreviewPagesQuick: Number(defaultPreviewPagesQuick),
          supportEmail,
          supportPhone,
          announcementBanner,
        }),
        api.put('/admin/pricing-defaults', {
          defaults: pricingDefaults,
        }),
      ]);

      setSaveMsg('Platform settings and default pricing saved successfully to MongoDB!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-[#FBF9F7] dark:bg-[#141414] transition-colors pb-12">
      <AdminHeader
        title="Platform Settings & Defaults"
        subtitle="Configure branding, currency, student preview limits, persistent pricing memory, and system announcements"
      />

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {saveMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2 border border-emerald-200 dark:border-emerald-800 transition">
            <Check className="w-4 h-4" />
            <span>{saveMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Brand Identity */}
          <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-2xl border border-gray-200 dark:border-neutral-800 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white pb-2 border-b border-gray-100 dark:border-neutral-800">
              1. Brand Identity
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Brand Tagline
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl"
                  required
                />
              </div>
            </div>
          </div>

          {/* Persistent Hierarchy Pricing Memory (Requirement 4) */}
          <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-2xl border border-gray-200 dark:border-neutral-800 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-500" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  2. Hierarchy Default Pricing Memory
                </h3>
              </div>
              <span className="text-[11px] text-gray-400">Persistent across admin sessions & refreshes</span>
            </div>

            <p className="text-xs text-gray-500">
              When creating a new Semester, Subject, Block, or Unit, these prices are automatically populated. They also auto-update whenever you enter a new price during creation or editing.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {/* Semester */}
              <div className="p-3 bg-gray-50 dark:bg-neutral-900/60 rounded-xl border border-gray-200 dark:border-neutral-800 space-y-2">
                <span className="font-bold text-gray-800 dark:text-gray-200 block">Semester Pricing</span>
                <div>
                  <label className="text-[10px] text-gray-400 block font-semibold">Regular Price (₹)</label>
                  <input
                    type="number"
                    value={pricingDefaults.semester?.price ?? 199}
                    onChange={(e) => handlePriceChange('semester', 'price', e.target.value)}
                    className="w-full px-2 py-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block font-semibold">Discounted Price (₹)</label>
                  <input
                    type="number"
                    value={pricingDefaults.semester?.discountedPrice ?? 99}
                    onChange={(e) => handlePriceChange('semester', 'discountedPrice', e.target.value)}
                    className="w-full px-2 py-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg text-xs font-bold text-brand-600"
                  />
                </div>
              </div>

              {/* Subject */}
              <div className="p-3 bg-gray-50 dark:bg-neutral-900/60 rounded-xl border border-gray-200 dark:border-neutral-800 space-y-2">
                <span className="font-bold text-gray-800 dark:text-gray-200 block">Subject Pricing</span>
                <div>
                  <label className="text-[10px] text-gray-400 block font-semibold">Regular Price (₹)</label>
                  <input
                    type="number"
                    value={pricingDefaults.subject?.price ?? 79}
                    onChange={(e) => handlePriceChange('subject', 'price', e.target.value)}
                    className="w-full px-2 py-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block font-semibold">Discounted Price (₹)</label>
                  <input
                    type="number"
                    value={pricingDefaults.subject?.discountedPrice ?? 49}
                    onChange={(e) => handlePriceChange('subject', 'discountedPrice', e.target.value)}
                    className="w-full px-2 py-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg text-xs font-bold text-brand-600"
                  />
                </div>
              </div>

              {/* Block */}
              <div className="p-3 bg-gray-50 dark:bg-neutral-900/60 rounded-xl border border-gray-200 dark:border-neutral-800 space-y-2">
                <span className="font-bold text-gray-800 dark:text-gray-200 block">Block Pricing</span>
                <div>
                  <label className="text-[10px] text-gray-400 block font-semibold">Regular Price (₹)</label>
                  <input
                    type="number"
                    value={pricingDefaults.block?.price ?? 39}
                    onChange={(e) => handlePriceChange('block', 'price', e.target.value)}
                    className="w-full px-2 py-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block font-semibold">Discounted Price (₹)</label>
                  <input
                    type="number"
                    value={pricingDefaults.block?.discountedPrice ?? 25}
                    onChange={(e) => handlePriceChange('block', 'discountedPrice', e.target.value)}
                    className="w-full px-2 py-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg text-xs font-bold text-brand-600"
                  />
                </div>
              </div>

              {/* Unit */}
              <div className="p-3 bg-gray-50 dark:bg-neutral-900/60 rounded-xl border border-gray-200 dark:border-neutral-800 space-y-2">
                <span className="font-bold text-gray-800 dark:text-gray-200 block">Unit Pricing</span>
                <div>
                  <label className="text-[10px] text-gray-400 block font-semibold">Regular Price (₹)</label>
                  <input
                    type="number"
                    value={pricingDefaults.unit?.price ?? 29}
                    onChange={(e) => handlePriceChange('unit', 'price', e.target.value)}
                    className="w-full px-2 py-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block font-semibold">Discounted Price (₹)</label>
                  <input
                    type="number"
                    value={pricingDefaults.unit?.discountedPrice ?? 19}
                    onChange={(e) => handlePriceChange('unit', 'discountedPrice', e.target.value)}
                    className="w-full px-2 py-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg text-xs font-bold text-brand-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Academic & Reading Defaults */}
          <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-2xl border border-gray-200 dark:border-neutral-800 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white pb-2 border-b border-gray-100 dark:border-neutral-800">
              3. Academic & Reading Defaults
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Default Currency
                </label>
                <select
                  value={defaultCurrency}
                  onChange={(e) => setDefaultCurrency(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl"
                >
                  <option value="INR">INR (₹) - Indian Rupee</option>
                  <option value="USD">USD ($) - US Dollar</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Normal Notes Preview Pages
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={defaultPreviewPagesNormal}
                  onChange={(e) => setDefaultPreviewPagesNormal(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Quick Notes Preview Pages
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={defaultPreviewPagesQuick}
                  onChange={(e) => setDefaultPreviewPagesQuick(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Support & Announcements */}
          <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-2xl border border-gray-200 dark:border-neutral-800 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white pb-2 border-b border-gray-100 dark:border-neutral-800">
              4. Support & Announcements
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Support Email
                </label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Support Phone
                </label>
                <input
                  type="text"
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                Announcement Banner Text
              </label>
              <textarea
                value={announcementBanner}
                onChange={(e) => setAnnouncementBanner(e.target.value)}
                rows={2}
                placeholder="Important announcements broadcasted to all students..."
                className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-brand-500 to-coral-500 hover:from-brand-600 hover:to-coral-600 shadow-sunset flex items-center gap-2 transition disabled:opacity-50"
            >
              {loading ? <ButtonSpinner className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{loading ? 'Saving...' : 'Save All Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
