import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Home,
  Search,
  BookOpen,
  GraduationCap,
  User,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MobileTabBar = () => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  // Hide on distraction-free reader screen
  if (location.pathname.startsWith('/reader/')) {
    return null;
  }

  const pathname = location.pathname;

  const isHomeActive =
    pathname === '/' ||
    pathname.startsWith('/semester') ||
    pathname.startsWith('/available-subjects') ||
    pathname.startsWith('/explore') ||
    pathname.startsWith('/academic');

  const isSearchActive = pathname.startsWith('/search');

  const isNotesActive =
    pathname.startsWith('/my-notes') ||
    pathname.startsWith('/library');

  const isIgnouActive = pathname.startsWith('/ignou');

  const isAccountActive =
    pathname.startsWith('/profile') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/wishlist');

  const tabs = [
    {
      name: 'Home',
      to: '/',
      icon: Home,
      isActive: isHomeActive,
    },
    {
      name: 'Search',
      to: '/search',
      icon: Search,
      isActive: isSearchActive,
    },
    {
      name: 'My Notes',
      to: isAuthenticated ? '/my-notes' : '/login',
      icon: BookOpen,
      isActive: isNotesActive,
    },
    {
      name: 'IGNOU',
      to: '/ignou',
      icon: GraduationCap,
      isActive: isIgnouActive,
      badge: 'Hub',
    },
    {
      name: isAuthenticated ? 'Account' : 'Sign In',
      to: isAuthenticated ? '/profile' : '/login',
      icon: User,
      isActive: isAccountActive,
      avatar: isAuthenticated ? user?.name?.charAt(0)?.toUpperCase() : null,
    },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-[#FAF9F6]/90 dark:bg-[#141414]/90 backdrop-blur-2xl border-t border-[#E3DED5]/80 dark:border-white/10 shadow-[0_-6px_25px_rgba(0,0,0,0.05)] dark:shadow-[0_-6px_25px_rgba(0,0,0,0.4)] transition-colors select-none"
      style={{ paddingBottom: 'max(0.25rem, env(safe-area-inset-bottom))' }}
    >
      <div className="max-w-md mx-auto px-2 h-14 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.name}
              to={tab.to}
              className="relative flex flex-col items-center justify-center flex-1 h-full py-0.5 group active:scale-90 transition-transform duration-150"
            >
              {/* Active Pill / Icon Container */}
              <div
                className={`relative flex items-center justify-center w-10 h-7 rounded-full transition-all duration-200 ${
                  tab.isActive
                    ? 'bg-[#DE8E5C]/15 dark:bg-[#DE8E5C]/25 text-[#DE8E5C] dark:text-[#F4A373]'
                    : 'text-[#77736C] dark:text-[#9E9A93] group-hover:text-[#242321] dark:group-hover:text-white'
                }`}
              >
                {tab.avatar ? (
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                      tab.isActive
                        ? 'bg-[#DE8E5C] text-white shadow-sm'
                        : 'bg-[#EEEAE3] dark:bg-neutral-800 text-[#77736C] dark:text-gray-300'
                    }`}
                  >
                    {tab.avatar}
                  </div>
                ) : (
                  <Icon
                    className={`w-5 h-5 transition-transform duration-200 ${
                      tab.isActive ? 'stroke-[2.35] scale-105' : 'stroke-[1.8]'
                    }`}
                  />
                )}

                {/* Optional mini badge (e.g. IGNOU hub dot) */}
                {tab.badge && !tab.isActive && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#DE8E5C]" />
                )}
              </div>

              {/* Tab Title */}
              <span
                className={`text-[10px] tracking-tight leading-none mt-0.5 transition-colors duration-150 ${
                  tab.isActive
                    ? 'text-[#DE8E5C] dark:text-[#F4A373] font-bold'
                    : 'text-[#77736C] dark:text-[#9E9A93] font-medium'
                }`}
              >
                {tab.name}
              </span>

              {/* Active Underline Pill Indicator */}
              {tab.isActive && (
                <span className="absolute -bottom-0.5 w-4 h-0.5 rounded-full bg-[#DE8E5C] dark:bg-[#F4A373]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileTabBar;
