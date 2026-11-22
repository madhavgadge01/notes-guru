import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { ShieldCheck, Mail, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#EEEAE3] dark:bg-[#141414] border-t border-[#E3DED5] dark:border-neutral-800 transition-colors pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <Logo showText={true} />
            <p className="text-xs font-semibold text-[#DE8E5C]">
              "Exam Tomorrow? GenZNotes Today."
            </p>
            <p className="text-xs text-[#77736C] dark:text-gray-400 max-w-sm leading-relaxed">
              GenZNotes organizes high-yield notes, derivations, and solved questions aligned specifically to your university and semester syllabus.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified Syllabus Coverage & Protected Academic Content</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#242321] dark:text-white mb-3">
              Explore Academics
            </h4>
            <ul className="space-y-2 text-xs text-[#77736C] dark:text-gray-400">
              <li>
                <Link to="/" className="hover:text-[#DE8E5C] transition">Find Notes</Link>
              </li>
              <li>
                <Link to="/my-notes" className="hover:text-[#DE8E5C] transition">My Notes</Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-[#DE8E5C] transition">Wishlist</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-[#DE8E5C] transition">Student Login</Link>
              </li>
            </ul>
          </div>

          {/* Support & Details */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#242321] dark:text-white mb-3">
              Student Support
            </h4>
            <ul className="space-y-2.5 text-xs text-[#77736C] dark:text-gray-400">
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#DE8E5C]" />
                <span>support@genznotes.in</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#DE8E5C]" />
                <span>+91 98765 43210 (10 AM - 7 PM)</span>
              </li>
              <li className="pt-2 text-[11px] text-[#77736C] dark:text-gray-500">
                Payment transactions secured by Razorpay 256-bit SSL encryption.
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-[#E3DED5] dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#77736C] dark:text-gray-400">
          <div>
            &copy; {new Date().getFullYear()} GenZNotes Marketplace. All rights reserved.
          </div>
          <div>
            <span>Crafted for university students across India</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
