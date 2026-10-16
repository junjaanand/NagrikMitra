import React, { useState, useEffect } from 'react';
import { ShieldCheck, Globe, Menu, X, ArrowRight, UserCheck, LogOut, User, LayoutDashboard, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ onOpenAuth, onEnterDashboard, onEnterAdmin }) {
  const { user, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lang, setLang] = useState('EN');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'EN' ? 'HI' : 'EN'));
  };

  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Citizen';

  const userRole = user?.user_metadata?.role || 'Citizen Portal';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 bg-white/95 backdrop-blur-md border-b border-slate-200/80 ${
        scrolled ? 'shadow-sm py-2' : 'py-2.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          
          {/* Brand Logo & Identity */}
          <a href="#" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-700 to-slate-900 flex items-center justify-center text-white shadow-sm shadow-emerald-600/20 group-hover:scale-105 transition-transform shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div className="shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-slate-900 leading-none">
                  Nagrik<span className="text-emerald-600">Mitra</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-extrabold border border-emerald-200/80 whitespace-nowrap tracking-wide leading-none">
                  नागरिक मित्र
                </span>
              </div>
              <p className="text-[9px] text-slate-400 font-bold tracking-wider uppercase mt-1 leading-none">
                Government Scheme Intelligence
              </p>
            </div>
          </a>

          {/* Desktop Nav Links (Clean Segmented Pills) */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold text-slate-600">
            <a
              href="#how-it-works"
              className="px-2.5 py-1.5 rounded-lg hover:text-emerald-700 hover:bg-slate-100/80 whitespace-nowrap transition-colors"
            >
              How It Works
            </a>
            <a
              href="#features"
              className="px-2.5 py-1.5 rounded-lg hover:text-emerald-700 hover:bg-slate-100/80 whitespace-nowrap transition-colors"
            >
              Features
            </a>
            <a
              href="#stats"
              className="px-2.5 py-1.5 rounded-lg hover:text-emerald-700 hover:bg-slate-100/80 whitespace-nowrap transition-colors"
            >
              Live Impact
            </a>
            <a
              href="#about"
              className="px-2.5 py-1.5 rounded-lg hover:text-emerald-700 hover:bg-slate-100/80 whitespace-nowrap transition-colors"
            >
              Mission
            </a>
            <a
              href="#tech-stack"
              className="px-2.5 py-1.5 rounded-lg hover:text-emerald-700 hover:bg-slate-100/80 whitespace-nowrap transition-colors"
            >
              Tech Stack
            </a>
            <a
              href="#team"
              className="px-2.5 py-1.5 rounded-lg hover:text-emerald-700 hover:bg-slate-100/80 whitespace-nowrap transition-colors"
            >
              Team
            </a>
          </nav>

          {/* Right Action Items */}
          <div className="hidden md:flex items-center gap-2.5 shrink-0">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer shrink-0"
              title="Switch language"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>{lang === 'EN' ? 'English' : 'हिंदी'}</span>
            </button>

            {/* If Admin / VLE, show Admin Portal button */}
            {user && (user?.user_metadata?.rbac_role === 'admin' || user?.user_metadata?.role?.includes('Admin') || user?.user_metadata?.role?.includes('VLE')) && onEnterAdmin && (
              <button
                onClick={onEnterAdmin}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 transition-all cursor-pointer shadow-xs hover:shadow-sm shrink-0"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Admin Portal</span>
              </button>
            )}

            {/* Citizen Dashboard Nav Button (Shown only when logged in) */}
            {user && onEnterDashboard && (
              <button
                onClick={onEnterDashboard}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer shadow-xs hover:shadow-sm shrink-0"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>
            )}

            {user ? (
              /* Authenticated User Capsule */
              <div className="flex items-center pl-1.5 pr-2 py-1 rounded-xl bg-slate-100/80 hover:bg-slate-100 border border-slate-200/90 transition-all shrink-0">
                <div
                  onClick={onEnterDashboard}
                  className="flex items-center gap-2 cursor-pointer group"
                  title="Go to Citizen Dashboard"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left max-w-[130px]">
                    <span className="block text-xs font-bold text-slate-800 leading-tight truncate group-hover:text-emerald-700 transition-colors">
                      {displayName}
                    </span>
                    <span className="block text-[10px] text-slate-500 font-medium leading-tight truncate">
                      {userRole}
                    </span>
                  </div>
                </div>

                <div className="h-4 w-px bg-slate-300 mx-2 shrink-0" />

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    signOut();
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              /* Login / Get Started Button */
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-xl bg-slate-900 hover:bg-emerald-700 text-white transition-all shadow-xs cursor-pointer shrink-0"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Citizen Login</span>
                <ArrowRight className="w-3 h-3 opacity-70" />
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-4 shadow-lg">
          <nav className="flex flex-col space-y-3 text-base font-medium text-slate-700">
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-emerald-600"
            >
              How It Works
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-emerald-600"
            >
              Features
            </a>
            <a
              href="#stats"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-emerald-600"
            >
              Live Impact
            </a>
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-emerald-600"
            >
              Mission
            </a>
            <a
              href="#tech-stack"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-emerald-600"
            >
              Tech Stack
            </a>
            <a
              href="#team"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-emerald-600"
            >
              Team
            </a>
          </nav>

          <div className="pt-2 flex flex-col gap-3 border-t border-slate-100">
            {onEnterDashboard && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onEnterDashboard();
                }}
                className="w-full py-2.5 px-4 text-center font-bold text-xs text-emerald-800 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                <span>Go to Citizen Dashboard</span>
              </button>
            )}

            <button
              onClick={toggleLanguage}
              className="flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg border border-slate-200"
            >
              <Globe className="w-4 h-4 text-emerald-600" />
              <span>Switch to {lang === 'EN' ? 'हिंदी' : 'English'}</span>
            </button>

            {user ? (
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div 
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (onEnterDashboard) onEnterDashboard();
                    }}
                    className="cursor-pointer"
                  >
                    <span className="block text-xs font-bold text-slate-900">{displayName}</span>
                    <span className="block text-[11px] text-emerald-600">{userRole}</span>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut();
                    }}
                    className="text-xs text-rose-600 font-bold"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth();
                }}
                className="w-full py-3 text-center font-semibold text-white bg-slate-900 rounded-xl hover:bg-emerald-700 transition-colors"
              >
                Citizen Login / Sign Up
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
