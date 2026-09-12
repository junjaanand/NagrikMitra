import React, { useState, useEffect } from 'react';
import { ShieldCheck, Globe, Menu, X, ArrowRight, UserCheck, LogOut, User, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ onOpenAuth, onEnterDashboard }) {
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200/80 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-700 to-slate-900 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  Nagrik<span className="text-emerald-600">Mitra</span>
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold border border-amber-200">
                  नागरिक मित्र
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide">
                GOVERNMENT SCHEME INTELLIGENCE
              </p>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <a href="#how-it-works" className="hover:text-emerald-600 transition-colors">
              How It Works
            </a>
            <a href="#features" className="hover:text-emerald-600 transition-colors">
              Features
            </a>
            <a href="#stats" className="hover:text-emerald-600 transition-colors">
              Live Impact
            </a>
            <a href="#about" className="hover:text-emerald-600 transition-colors">
              Mission
            </a>
            <a href="#tech-stack" className="hover:text-emerald-600 transition-colors">
              Tech Stack
            </a>
            <a href="#team" className="hover:text-emerald-600 transition-colors">
              Team
            </a>
          </nav>

          {/* Actions: Lang toggle & Auth User Card or Login CTA */}
          <div className="hidden md:flex items-center gap-3.5">
            {/* Language Toggle Button */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
              title="Switch language"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>{lang === 'EN' ? 'English' : 'हिंदी'}</span>
            </button>

            {/* Direct Dashboard Nav Button */}
            {onEnterDashboard && (
              <button
                onClick={onEnterDashboard}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/80 transition-all cursor-pointer shadow-xs"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-emerald-600" />
                <span>Dashboard</span>
              </button>
            )}

            {user ? (
              /* Authenticated User Pill */
              <div
                onClick={onEnterDashboard}
                className="flex items-center gap-2.5 pl-2 border-l border-slate-200 cursor-pointer group"
                title="Go to Citizen Dashboard"
              >
                <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 font-bold text-xs group-hover:ring-2 group-hover:ring-emerald-500 transition-all">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <span className="block text-xs font-bold text-slate-800 leading-tight group-hover:text-emerald-700 transition-colors">
                    {displayName}
                  </span>
                  <span className="block text-[10px] text-emerald-600 font-medium">
                    {userRole}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    signOut();
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Login / Get Started Button */
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-slate-900 hover:bg-emerald-700 text-white transition-all shadow-sm hover:shadow-md hover:shadow-emerald-900/10 cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>Citizen Login</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-70" />
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-4 shadow-lg">
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
