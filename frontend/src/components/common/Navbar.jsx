import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  BookOpen,
  Heart,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Settings,
  Sun,
  Moon,
} from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#F5F3EF]/95 dark:bg-[#171717]/95 backdrop-blur-md border-b border-[#E3DED5] dark:border-neutral-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <Link to="/" className="flex-shrink-0">
          <Logo />
        </Link>

        {/* Center: Search Bar (Desktop) */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex items-center flex-1 max-w-md mx-4 relative"
        >
          <Search className="w-4 h-4 text-[#77736C] dark:text-gray-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search subjects, units, colleges (e.g. DSA, OS, DTU)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#EEEAE3] dark:bg-neutral-900 hover:bg-[#E8E3DB] dark:hover:bg-neutral-800 focus:bg-[#FAF9F6] dark:focus:bg-neutral-900 border border-[#E3DED5] dark:border-neutral-800 focus:border-[#DE8E5C] rounded-xl text-xs sm:text-sm text-[#242321] dark:text-white placeholder-[#77736C] dark:placeholder-gray-400 focus:outline-none transition"
          />
        </form>

        {/* Right Navigation & Profile (Minimal, Essential Only) */}
        <div className="hidden lg:flex items-center gap-2.5">
          {/* Light / Dark Mode Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-[#E3DED5] dark:border-neutral-700 bg-[#FAF9F6] dark:bg-neutral-800 hover:bg-[#EEEAE3] dark:hover:bg-neutral-750 text-[#77736C] dark:text-gray-300 hover:text-[#242321] dark:hover:text-white transition shadow-sm flex items-center justify-center"
            title={isDark ? 'Switch to Warm Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Light/Dark Theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-[#77736C]" />
            )}
          </button>

          {isAuthenticated ? (
            /* Profile Dropdown Menu (Contains My Notes, Wishlist, Settings, Sign Out) */
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-[#E3DED5] dark:border-neutral-700 bg-[#FAF9F6] dark:bg-neutral-800 hover:bg-[#EEEAE3] dark:hover:bg-neutral-750 text-[#242321] dark:text-gray-100 transition"
              >
                <div className="w-7 h-7 rounded-full bg-[#DE8E5C] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || 'S'}
                </div>
                <span className="text-xs font-semibold max-w-[120px] truncate">
                  {user?.name?.split(' ')[0] || 'Account'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#77736C] dark:text-gray-400" />
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#FAF9F6] dark:bg-[#1E1E1E] border border-[#E3DED5] dark:border-neutral-800 shadow-xl py-2 z-50 text-xs">
                  {/* User info banner */}
                  <div className="px-4 py-2.5 border-b border-[#E3DED5] dark:border-neutral-800">
                    <p className="font-bold text-[#242321] dark:text-white truncate">{user?.name}</p>
                    <p className="text-[11px] text-[#77736C] dark:text-gray-400 truncate">{user?.email}</p>
                  </div>

                  {/* Profile Links */}
                  <div className="py-1">
                    <Link
                      to="/my-notes"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-[#242321] dark:text-gray-200 hover:bg-[#EEEAE3] dark:hover:bg-neutral-800 transition font-medium"
                    >
                      <BookOpen className="w-4 h-4 text-[#DE8E5C]" />
                      <span>My Notes</span>
                    </Link>

                    <Link
                      to="/wishlist"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-[#242321] dark:text-gray-200 hover:bg-[#EEEAE3] dark:hover:bg-neutral-800 transition font-medium"
                    >
                      <Heart className="w-4 h-4 text-[#DE8E5C]" />
                      <span>Wishlist</span>
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-[#242321] dark:text-gray-200 hover:bg-[#EEEAE3] dark:hover:bg-neutral-800 transition font-medium"
                    >
                      <Settings className="w-4 h-4 text-[#77736C]" />
                      <span>Account Settings</span>
                    </Link>
                  </div>

                  {/* Sign Out Action */}
                  <div className="pt-1 border-t border-[#E3DED5] dark:border-neutral-800">
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-[#EEEAE3] dark:hover:bg-neutral-800 transition font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-semibold text-white bg-[#DE8E5C] hover:bg-[#D0804E] rounded-xl transition shadow-sm active:scale-95 flex items-center gap-2"
              >
                <span>Continue with Google</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Actions: Theme Toggle & Hamburger */}
        <div className="flex lg:hidden items-center gap-1.5">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 text-[#77736C] dark:text-gray-300 bg-[#FAF9F6] dark:bg-neutral-800 hover:bg-[#EEEAE3] dark:hover:bg-neutral-700 border border-[#E3DED5] dark:border-neutral-700 rounded-xl transition shadow-sm"
            title={isDark ? 'Switch to Warm Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Light/Dark Theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#77736C]" />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#242321] dark:text-gray-200 hover:bg-[#EEEAE3] dark:hover:bg-neutral-800 rounded-xl transition"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Apple-Grade Sheet with Translucent Blur & Inset Grouping) */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 top-16 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Sheet */}
          <div className="relative z-40 lg:hidden bg-[#FAF9F6]/95 dark:bg-[#1C1C1C]/95 backdrop-blur-2xl border-b border-[#E3DED5] dark:border-neutral-800 rounded-b-3xl shadow-2xl p-4 space-y-3.5 animate-apple-sheet">
            {/* Quick Search */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 text-[#77736C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search notes, subjects, units..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 h-11 bg-[#EEEAE3] dark:bg-neutral-900 border border-[#E3DED5] dark:border-neutral-700 rounded-xl text-sm text-[#242321] dark:text-white placeholder-[#77736C] focus:outline-none focus:border-[#DE8E5C] transition"
              />
            </form>

            {isAuthenticated ? (
              <div className="space-y-3">
                {/* User Info Header Card */}
                <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-neutral-900/60 rounded-2xl border border-[#E3DED5]/60 dark:border-neutral-800">
                  <div className="w-10 h-10 rounded-full bg-[#DE8E5C] text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
                    {user?.name?.charAt(0)?.toUpperCase() || 'S'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-[#242321] dark:text-white truncate">
                      {user?.name}
                    </p>
                    <p className="text-[11px] text-[#77736C] dark:text-gray-400 truncate">
                      {user?.email}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    Active
                  </span>
                </div>

                {/* Inset Grouped Navigation List (iOS Settings Style) */}
                <div className="bg-white/60 dark:bg-neutral-900/60 rounded-2xl border border-[#E3DED5]/60 dark:border-neutral-800 divide-y divide-[#E3DED5]/50 dark:divide-neutral-800 overflow-hidden">
                  <Link
                    to="/my-notes"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold text-[#242321] dark:text-gray-200 hover:bg-[#EEEAE3]/80 dark:hover:bg-neutral-800 active:scale-[0.99] transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#DE8E5C]/10 text-[#DE8E5C] flex items-center justify-center">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <span>My Notes</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-[#77736C] -rotate-90" />
                  </Link>

                  <Link
                    to="/wishlist"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold text-[#242321] dark:text-gray-200 hover:bg-[#EEEAE3]/80 dark:hover:bg-neutral-800 active:scale-[0.99] transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#DE8E5C]/10 text-[#DE8E5C] flex items-center justify-center">
                        <Heart className="w-4 h-4" />
                      </div>
                      <span>Wishlist</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-[#77736C] -rotate-90" />
                  </Link>

                  <Link
                    to="/ignou"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold text-[#242321] dark:text-gray-200 hover:bg-[#EEEAE3]/80 dark:hover:bg-neutral-800 active:scale-[0.99] transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#DE8E5C]/10 text-[#DE8E5C] flex items-center justify-center">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <span>IGNOU Study Material</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#DE8E5C]/15 text-[#DE8E5C]">
                      Hub
                    </span>
                  </Link>

                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold text-[#242321] dark:text-gray-200 hover:bg-[#EEEAE3]/80 dark:hover:bg-neutral-800 active:scale-[0.99] transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#EEEAE3] dark:bg-neutral-800 text-[#77736C] flex items-center justify-center">
                        <Settings className="w-4 h-4" />
                      </div>
                      <span>Account Settings</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-[#77736C] -rotate-90" />
                  </Link>
                </div>

                {/* Sign Out Button */}
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/15 rounded-xl transition active:scale-[0.98]"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                {/* Guest Quick Navigation */}
                <div className="bg-white/60 dark:bg-neutral-900/60 rounded-2xl border border-[#E3DED5]/60 dark:border-neutral-800 divide-y divide-[#E3DED5]/50 dark:divide-neutral-800 overflow-hidden">
                  <Link
                    to="/ignou"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold text-[#242321] dark:text-gray-200 hover:bg-[#EEEAE3]/80 dark:hover:bg-neutral-800 active:scale-[0.99] transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#DE8E5C]/10 text-[#DE8E5C] flex items-center justify-center">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <span>IGNOU Study Material</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#DE8E5C]/15 text-[#DE8E5C]">
                      Hub
                    </span>
                  </Link>
                </div>

                {/* Primary CTA: Continue with Google */}
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full h-11 text-xs font-bold text-white bg-gradient-to-r from-brand-500 to-coral-500 hover:from-brand-600 hover:to-coral-600 rounded-xl shadow-sunset flex items-center justify-center gap-2 active:scale-[0.98] transition"
                >
                  <User className="w-4 h-4" />
                  <span>Continue with Google</span>
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </header>
  );
};

export default Navbar;
