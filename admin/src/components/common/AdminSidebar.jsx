import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Network,
  FileEdit,
  BadgePercent,
  Users,
  CreditCard,
  Settings,
  LogOut,
  ExternalLink,
  BookOpen,
  HelpCircle
} from 'lucide-react';
import AdminLogo from './AdminLogo';
import { useAdminAuth } from '../../context/AdminAuthContext';

const AdminSidebar = () => {
  const { logout, admin } = useAdminAuth();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/academic', label: 'Academic Hierarchy', icon: Network },
    { to: '/notes', label: 'Notes & Editor', icon: FileEdit },
    { to: '/pricing', label: 'Pricing Control', icon: BadgePercent },
    { to: '/users', label: 'Student Accounts', icon: Users },
    { to: '/orders', label: 'Orders & Payments', icon: CreditCard },
    { to: '/support', label: 'Help & Support', icon: HelpCircle },
    { to: '/settings', label: 'Platform Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-[#1C1C1C] border-r border-gray-200 dark:border-neutral-800 flex flex-col justify-between h-screen sticky top-0 transition-colors z-30">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-gray-100 dark:border-neutral-800">
          <AdminLogo />
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-500 to-coral-500 text-white shadow-sunset'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800/80 hover:text-gray-900 dark:hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Admin User Info & Logout */}
      <div className="p-4 border-t border-gray-100 dark:border-neutral-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 font-bold text-xs flex items-center justify-center flex-shrink-0">
              {admin?.name?.charAt(0) || 'A'}
            </div>
            <div className="truncate">
              <span className="text-xs font-bold text-gray-900 dark:text-white block truncate">
                {admin?.name || 'Administrator'}
              </span>
              <span className="text-[10px] text-gray-400 block truncate">
                {admin?.email}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-1.5 text-gray-400 hover:text-red-500 transition"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Link to public student store */}
        <a
          href="http://localhost:5173"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 w-full py-1.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 hover:text-brand-500 dark:hover:text-brand-400 bg-gray-50 dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 transition"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>View Student Site</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </aside>
  );
};

export default AdminSidebar;
