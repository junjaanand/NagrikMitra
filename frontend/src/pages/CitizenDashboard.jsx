import React, { useState, useEffect } from 'react';
import {
  Search,
  SlidersHorizontal,
  Bookmark,
  Layers,
  ArrowLeft,
  Sparkles,
  TrendingUp,
  MapPin,
  CheckCircle2,
  Filter,
  LogOut,
  RefreshCw,
  Loader2,
  User,
  Edit3,
  Briefcase,
  IndianRupee,
  ShieldCheck,
  MessageSquare,
  Camera,
  Check,
  BarChart3,
  PieChart as PieIcon,
  ArrowRight,
  PlusCircle,
  Building2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { getSchemes, matchEligibility } from '../api/client';
import EligibilityWizard from '../components/dashboard/EligibilityWizard';
import SchemeCard from '../components/dashboard/SchemeCard';
import SchemeDetailModal from '../components/dashboard/SchemeDetailModal';
import EditProfileModal from '../components/dashboard/EditProfileModal';
import QuickChatModal from '../components/landing/QuickChatModal';
import QuickScanModal from '../components/landing/QuickScanModal';
import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard';
import ComparisonDock from '../components/dashboard/ComparisonDock';
import ComparisonMatrixModal from '../components/dashboard/ComparisonMatrixModal';
import AccessibilityBar from '../components/common/AccessibilityBar';
import AddSchemeModal from '../components/dashboard/AddSchemeModal';

const CATEGORIES = [
  'All',
  'Agriculture,Rural & Environment',
  'Education & Learning',
  'Health & Wellness',
  'Social welfare & Empowerment',
  'Housing & Shelter',
  'Banking,Financial Services and Insurance',
  'Women and Child',
  'Employment & Livelihood',
];

const STATES = [
  'All',
  'Central',
  'Uttar Pradesh',
  'Maharashtra',
  'Gujarat',
  'Rajasthan',
  'Madhya Pradesh',
  'Bihar',
  'Delhi',
  'Tamil Nadu',
  'Karnataka',
  'West Bengal',
  'Punjab',
  'Haryana',
  'Uttarakhand',
  'Puducherry',
];

export default function CitizenDashboard({ onBackToLanding, onGoToAdmin }) {
  const { user, signOut } = useAuth();
  const { profile, updateProfile, applyOcrData } = useProfile();

  const [activeTab, setActiveTab] = useState('wizard'); // 'wizard', 'explorer', 'saved'
  const [matchedResults, setMatchedResults] = useState(null);
  const [evaluating, setEvaluating] = useState(false);

  // Scheme Explorer State
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedState, setSelectedState] = useState('All');
  const [filterWomen, setFilterWomen] = useState(false);
  const [filterBPL, setFilterBPL] = useState(false);
  const [filterDisability, setFilterDisability] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedMode, setSelectedMode] = useState('all');

  // Bookmarks State (Saved in LocalStorage)
  const [bookmarkedSlugs, setBookmarkedSlugs] = useState(() => {
    try {
      const saved = localStorage.getItem('nagrikmitra_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [bookmarkedSchemes, setBookmarkedSchemes] = useState([]);

  // Modals
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [addSchemeOpen, setAddSchemeOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // Comparison State (Day 10)
  const [comparedSchemes, setComparedSchemes] = useState([]);
  const [matrixOpen, setMatrixOpen] = useState(false);

  const toggleCompare = (scheme) => {
    setComparedSchemes((prev) => {
      const exists = prev.some((s) => s.slug === scheme.slug);
      if (exists) {
        showNotification(`Removed "${scheme.name.substring(0, 25)}..." from comparison`);
        return prev.filter((s) => s.slug !== scheme.slug);
      } else {
        if (prev.length >= 4) {
          showNotification('Maximum 4 schemes can be compared at once.');
          return prev;
        }
        showNotification(`Added "${scheme.name.substring(0, 25)}..." to comparison queue`);
        return [...prev, scheme];
      }
    });
  };

  const removeFromCompare = (slug) => {
    setComparedSchemes((prev) => prev.filter((s) => s.slug !== slug));
  };

  const clearCompared = () => {
    setComparedSchemes([]);
    showNotification('Cleared comparison queue');
  };

  // Citizen Name
  const citizenName =
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Valued Citizen';

  const citizenRole = user?.user_metadata?.role || 'Citizen Portal';

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Toggle Bookmark
  const toggleBookmark = (scheme) => {
    setBookmarkedSlugs((prev) => {
      let updated;
      if (prev.includes(scheme.slug)) {
        updated = prev.filter((s) => s !== scheme.slug);
        setBookmarkedSchemes((bPrev) => bPrev.filter((b) => b.slug !== scheme.slug));
        showNotification(`Removed "${scheme.name.substring(0, 30)}..." from saved`);
      } else {
        updated = [...prev, scheme.slug];
        setBookmarkedSchemes((bPrev) => [...bPrev, scheme]);
        showNotification(`Saved "${scheme.name.substring(0, 30)}..." to dossier`);
      }
      localStorage.setItem('nagrikmitra_bookmarks', JSON.stringify(updated));
      return updated;
    });
  };

  // Run instant match based on current profile
  const runInstantMatch = async (activeProf = profile) => {
    setEvaluating(true);
    try {
      const payload = {
        ...activeProf,
        age: Number(activeProf.age),
        annual_income: Number(activeProf.annual_income),
      };
      const data = await matchEligibility(payload);
      setMatchedResults(data);
    } catch (err) {
      console.error('Instant match failed:', err);
    } finally {
      setEvaluating(false);
    }
  };

  // Auto-run initial evaluation when dashboard mounts
  useEffect(() => {
    runInstantMatch();
  }, [profile.age, profile.state, profile.annual_income, profile.occupation]);

  // Fetch schemes for Explorer
  const fetchExplorerSchemes = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        page_size: 12,
        search: searchQuery || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        state: selectedState !== 'All' ? selectedState : undefined,
        gender: filterWomen ? 'female' : undefined,
        bpl: filterBPL ? true : undefined,
        disability: filterDisability ? true : undefined,
        mode: selectedMode !== 'all' ? selectedMode : undefined,
      };
      const data = await getSchemes(params);
      setSchemes(data.items);
      setTotalPages(data.total_pages);
      setTotalCount(data.total);
    } catch (err) {
      console.error('Failed to fetch schemes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'explorer') {
      fetchExplorerSchemes();
    }
  }, [activeTab, page, selectedCategory, selectedState, filterWomen, filterBPL, filterDisability, selectedMode]);

  // Handle Search submit
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchExplorerSchemes();
  };

  // Handle Wizard Match Complete
  const handleMatchComplete = (results, updatedProfile) => {
    setMatchedResults(results);
    showNotification(`Successfully matched ${results.total_matched} government schemes!`);
  };

  // Handle OCR Scan Application
  const handleApplyScannedProfile = (ocrData) => {
    applyOcrData(ocrData);
    showNotification('Applied scanned Aadhaar/PAN demographic parameters!');
    runInstantMatch();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top App Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToLanding}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Return to Public Landing Page"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight">
                  Nagrik<span className="text-emerald-400">Mitra</span> Dashboard
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30">
                  Active Session
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Welcome back, <strong>{citizenName}</strong> • {citizenRole}
              </p>
            </div>
          </div>

          {/* User actions */}
          <div className="flex items-center gap-2.5">
            <AccessibilityBar />

            {/* Admin Switcher for VLE / Admin users */}
            {(user?.user_metadata?.rbac_role === 'admin' || user?.user_metadata?.role?.includes('Admin') || user?.user_metadata?.role?.includes('VLE')) && onGoToAdmin && (
              <button
                onClick={onGoToAdmin}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-colors cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Portal</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('saved')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 cursor-pointer transition-colors"
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-400" />
              <span>Saved ({bookmarkedSlugs.length})</span>
            </button>

            <button
              onClick={signOut}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* DEMOGRAPHIC PROFILE RIBBON (Day 7 Requirement) */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white border border-slate-800 shadow-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Left: Profile details */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Verified Demographic Profile
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                  {profile.residence === 'rural' ? '🏡 Rural Domicile' : '🏢 Urban Domicile'}
                </span>
              </div>

              {/* Attributes row */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-slate-200">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    <strong>{profile.age} Yrs</strong> ({profile.gender === 'male' ? 'Male' : profile.gender === 'female' ? 'Female' : 'Other'})
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-200">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  <span>
                    State: <strong>{profile.state}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-200">
                  <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                  <span className="capitalize">
                    Trade: <strong>{profile.occupation}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-200">
                  <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    Income: <strong>₹{Number(profile.annual_income).toLocaleString()}/yr</strong> ({profile.caste_category})
                  </span>
                </div>

                {profile.is_bpl && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    BPL Cardholder
                  </span>
                )}

                {profile.has_disability && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    PwD (दिव्यांग)
                  </span>
                )}
              </div>
            </div>

            {/* Right: Edit Profile CTA */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setEditProfileOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Details</span>
              </button>

              <button
                onClick={() => runInstantMatch()}
                disabled={evaluating}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Recalculate eligibility with current profile"
              >
                <RefreshCw className={`w-4 h-4 ${evaluating ? 'animate-spin text-emerald-400' : ''}`} />
              </button>
            </div>

          </div>
        </div>

        {/* QUICK ACTIONS GRID (Day 7 & Day 8) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          <button
            onClick={() => setActiveTab('wizard')}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              activeTab === 'wizard'
                ? 'bg-emerald-50 border-emerald-300 shadow-sm'
                : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 mb-2">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-900">Eligibility Wizard</span>
              <span className="block text-[10px] text-slate-500">4-Step Rule Engine</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              activeTab === 'analytics'
                ? 'bg-emerald-50 border-emerald-300 shadow-sm'
                : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 mb-2">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-900">Visual Analytics</span>
              <span className="block text-[10px] text-slate-500">Recharts SVG Hub</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('explorer')}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              activeTab === 'explorer'
                ? 'bg-emerald-50 border-emerald-300 shadow-sm'
                : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 mb-2">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-900">Scheme Explorer</span>
              <span className="block text-[10px] text-slate-500">4,693 Initiatives</span>
            </div>
          </button>

          <button
            onClick={() => setChatOpen(true)}
            className="p-3.5 rounded-2xl border border-slate-200/80 bg-white hover:border-emerald-300 hover:shadow-xs text-left transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-100 group-hover:bg-purple-200 flex items-center justify-center text-purple-700 mb-2 transition-colors">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-900">Voice Assistant</span>
              <span className="block text-[10px] text-slate-500">Hindi / English AI</span>
            </div>
          </button>

          <button
            onClick={() => setScanOpen(true)}
            className="p-3.5 rounded-2xl border border-slate-200/80 bg-white hover:border-emerald-300 hover:shadow-xs text-left transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-100 group-hover:bg-amber-200 flex items-center justify-center text-amber-700 mb-2 transition-colors">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-900">Smart OCR</span>
              <span className="block text-[10px] text-slate-500">Aadhaar / PAN Scan</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              activeTab === 'saved'
                ? 'bg-emerald-50 border-emerald-300 shadow-sm'
                : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700 mb-2">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-900">Saved Dossiers</span>
              <span className="block text-[10px] text-slate-500">{bookmarkedSlugs.length} Starred</span>
            </div>
          </button>

          <button
            onClick={() => runInstantMatch()}
            disabled={evaluating}
            className="p-3.5 rounded-2xl border border-slate-200/80 bg-white hover:border-emerald-300 hover:shadow-xs text-left transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-100 group-hover:bg-emerald-200 flex items-center justify-center text-emerald-700 mb-2 transition-colors">
              <RefreshCw className={`w-4 h-4 ${evaluating ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-900">Instant Match</span>
              <span className="block text-[10px] text-slate-500">&lt;60ms Engine</span>
            </div>
          </button>
        </div>

        {/* KPI Summary Banner */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Matched Schemes
            </span>
            <div className="text-2xl font-black text-slate-900">
              {evaluating ? (
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600 inline" />
              ) : matchedResults ? (
                matchedResults.total_matched
              ) : (
                '--'
              )}
            </div>
            <span className="text-xs text-emerald-600 font-semibold mt-0.5 block">
              100% Deterministic Match
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Potential Annual Benefit
            </span>
            <div className="text-2xl font-black text-emerald-600">
              ₹6,26,000+
            </div>
            <span className="text-xs text-slate-500 font-medium mt-0.5 block">
              Combined Welfare Subsidies
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Catalog Breadth
            </span>
            <div className="text-2xl font-black text-slate-900">
              4,693
            </div>
            <span className="text-xs text-blue-600 font-semibold mt-0.5 block">
              37 States & UTs Sourced
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Saved Bookmarks
            </span>
            <div className="text-2xl font-black text-amber-600">
              {bookmarkedSlugs.length}
            </div>
            <span className="text-xs text-slate-500 font-medium mt-0.5 block">
              Ready for Application
            </span>
          </div>
        </div>

        {/* Mode Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-6 sm:gap-8 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('wizard')}
            className={`pb-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'wizard'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Eligibility Matcher Wizard</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-purple-600" />
            <span>Visual Analytics & Insights</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-bold border border-purple-200">
              Recharts SVG
            </span>
          </button>

          <button
            onClick={() => setActiveTab('explorer')}
            className={`pb-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'explorer'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Browse All 4,693 Schemes</span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`pb-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'saved'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Saved Dossiers ({bookmarkedSlugs.length})</span>
          </button>
        </div>

        {/* TAB 1: ELIGIBILITY WIZARD */}
        {activeTab === 'wizard' && (
          <div className="space-y-8">
            <EligibilityWizard onMatchComplete={handleMatchComplete} />

            {/* If matched, show results */}
            {matchedResults && (
              <div className="space-y-6 pt-4">
                
                {/* Visual Demographic Match Summary Banner (Day 8 Feature) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-purple-900 to-indigo-950 text-white shadow-md border border-purple-800/80">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded border border-purple-400/30 flex items-center gap-1">
                        <BarChart3 className="w-3 h-3" />
                        Recharts Demographic Intelligence
                      </span>
                      <span className="text-xs text-purple-200 font-semibold">
                        {matchedResults.total_matched} Schemes Across {Object.keys(matchedResults.category_breakdown || {}).length} Sectors
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {Object.entries(matchedResults.category_breakdown || {}).slice(0, 5).map(([cat, cnt]) => (
                        <span key={cat} className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-white/10 text-white border border-white/10">
                          {cat.split(',')[0]}: {cnt}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('analytics')}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-purple-50 text-purple-950 text-xs font-black transition-all shadow-sm cursor-pointer flex items-center gap-2 shrink-0 self-start sm:self-center"
                  >
                    <span>View Interactive Visual Analytics</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900">
                      Top Qualified Welfare Schemes ({matchedResults.total_matched})
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Ranked by algorithmic relevance based on your profile: {profile.age} yrs • {profile.state} • {profile.occupation}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(Array.isArray(matchedResults) ? matchedResults : (matchedResults?.matched_schemes || [])).map((scheme) => (
                    <SchemeCard
                      key={scheme.slug}
                      scheme={scheme}
                      isBookmarked={bookmarkedSlugs.includes(scheme.slug)}
                      onToggleBookmark={toggleBookmark}
                      onViewDetails={(s) => setSelectedScheme(s)}
                      isCompared={comparedSchemes.some((c) => c.slug === scheme.slug)}
                      onToggleCompare={toggleCompare}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: VISUAL ANALYTICS & INSIGHTS (Day 8 Requirement) */}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard
            matchedResults={matchedResults}
            userProfile={profile}
            onDrilldownToExplorer={({ category, state }) => {
              if (category && category !== 'All') setSelectedCategory(category);
              if (state && state !== 'All') setSelectedState(state);
              setPage(1);
              setActiveTab('explorer');
            }}
            onViewSchemeDetails={(s) => setSelectedScheme(s)}
            bookmarkedSlugs={bookmarkedSlugs}
            onToggleBookmark={toggleBookmark}
          />
        )}

        {/* TAB 3: SCHEME EXPLORER */}
        {activeTab === 'explorer' && (
          <div className="space-y-6">
            
            {/* Search & Filter Bar */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
              <form onSubmit={handleSearch} className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by scheme name, keyword (e.g. Kisan, Scholarship, Housing)..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={() => setAddSchemeOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm shadow-blue-500/20 whitespace-nowrap"
                  title="CSC / Admin Scheme Ingestion Portal"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Ingest Scheme</span>
                </button>
              </form>

              {/* State & Toggle Filters */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-slate-700">State:</span>
                    <select
                      value={selectedState}
                      onChange={(e) => {
                        setSelectedState(e.target.value);
                        setPage(1);
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:outline-none"
                    >
                      {STATES.map((s) => (
                        <option key={s} value={s}>
                          {s === 'All' ? 'All States (Pan-India)' : s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filterWomen}
                      onChange={(e) => {
                        setFilterWomen(e.target.checked);
                        setPage(1);
                      }}
                      className="rounded text-emerald-600 w-3.5 h-3.5"
                    />
                    <span>👩 Women Targeted</span>
                  </label>

                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filterBPL}
                      onChange={(e) => {
                        setFilterBPL(e.target.checked);
                        setPage(1);
                      }}
                      className="rounded text-emerald-600 w-3.5 h-3.5"
                    />
                    <span>🍞 BPL Card</span>
                  </label>

                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filterDisability}
                      onChange={(e) => {
                        setFilterDisability(e.target.checked);
                        setPage(1);
                      }}
                      className="rounded text-emerald-600 w-3.5 h-3.5"
                    />
                    <span>♿ PwD / दिव्यांग</span>
                  </label>
                </div>

                <span className="text-xs text-slate-400 font-medium">
                  Showing {schemes.length} of {totalCount} initiatives
                </span>
              </div>

              {/* Application Mode Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
                  <span>Application Mode:</span>
                </span>
                {[
                  { id: 'all', label: 'All Modes' },
                  { id: 'online', label: '🌐 Online Direct' },
                  { id: 'hybrid', label: '🔄 CSC Hybrid' },
                  { id: 'offline', label: '🏢 In-Person / Physical' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setSelectedMode(m.id);
                      setPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      selectedMode === m.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat === 'All' ? 'All Categories' : cat.split(',')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Scheme Cards Grid */}
            {loading ? (
              <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                <span>Searching official schemes catalog...</span>
              </div>
            ) : schemes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {schemes.map((scheme) => (
                  <SchemeCard
                    key={scheme.slug}
                    scheme={scheme}
                    isBookmarked={bookmarkedSlugs.includes(scheme.slug)}
                    onToggleBookmark={toggleBookmark}
                    onViewDetails={(s) => setSelectedScheme(s)}
                    isCompared={comparedSchemes.some((c) => c.slug === scheme.slug)}
                    onToggleCompare={toggleCompare}
                  />
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                No schemes match the selected filters. Try broadening your criteria.
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-6">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
                >
                  Previous
                </button>
                <span className="text-xs font-semibold text-slate-500">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
                >
                  Next
                </button>
              </div>
            )}

          </div>
        )}

        {/* TAB 3: SAVED SCHEMES */}
        {activeTab === 'saved' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  My Bookmarked Welfare Dossiers ({bookmarkedSlugs.length})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Schemes saved for application review and Common Service Center (CSC) visits.
                </p>
              </div>
            </div>

            {bookmarkedSchemes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookmarkedSchemes.map((scheme) => (
                  <SchemeCard
                    key={scheme.slug}
                    scheme={scheme}
                    isBookmarked={true}
                    onToggleBookmark={toggleBookmark}
                    onViewDetails={(s) => setSelectedScheme(s)}
                    isCompared={comparedSchemes.some((c) => c.slug === scheme.slug)}
                    onToggleCompare={toggleCompare}
                  />
                ))}
              </div>
            ) : (
              <div className="p-16 text-center bg-white rounded-2xl border border-slate-200/80 space-y-3">
                <Bookmark className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-base font-bold text-slate-800">No Saved Schemes Yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click the bookmark icon on any scheme card while exploring or running the eligibility matcher to save schemes here.
                </p>
                <button
                  onClick={() => setActiveTab('wizard')}
                  className="mt-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  Run Eligibility Matcher
                </button>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        onSave={() => {
          showNotification('Profile updated successfully!');
          runInstantMatch();
        }}
      />

      {/* Quick Chat Modal */}
      <QuickChatModal
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
      />

      {/* Quick Scan Modal */}
      <QuickScanModal
        isOpen={scanOpen}
        onClose={() => setScanOpen(false)}
        onApplyProfile={handleApplyScannedProfile}
      />

      {/* Scheme Detail Modal */}
      <SchemeDetailModal
        scheme={selectedScheme}
        isOpen={Boolean(selectedScheme)}
        onClose={() => setSelectedScheme(null)}
        isBookmarked={selectedScheme ? bookmarkedSlugs.includes(selectedScheme.slug) : false}
        onToggleBookmark={toggleBookmark}
      />

      {/* Persistent Floating Comparison Dock (Day 10) */}
      <ComparisonDock
        comparedSchemes={comparedSchemes}
        onRemoveScheme={removeFromCompare}
        onClearAll={clearCompared}
        onOpenMatrix={() => setMatrixOpen(true)}
      />

      {/* Multi-Scheme Comparison Matrix Modal (Day 10) */}
      <ComparisonMatrixModal
        isOpen={matrixOpen}
        onClose={() => setMatrixOpen(false)}
        schemes={comparedSchemes}
        onRemoveScheme={removeFromCompare}
        onToggleBookmark={toggleBookmark}
        bookmarkedSlugs={bookmarkedSlugs}
      />

      {/* Day 11: Dynamic Scheme Ingestion & OGD Sync Modal */}
      <AddSchemeModal
        isOpen={addSchemeOpen}
        onClose={() => setAddSchemeOpen(false)}
        onSchemeAdded={(newScheme) => {
          showNotification(newScheme ? `Ingested "${newScheme.name}"` : 'Gazette synchronization complete');
          fetchExplorerSchemes();
          if (profile) runInstantMatch(profile);
        }}
      />

    </div>
  );
}
