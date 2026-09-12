import React, { useState } from 'react';
import Navbar from '../components/common/Navbar';
import HeroSection from '../components/landing/HeroSection';
import HowItWorks from '../components/landing/HowItWorks';
import KeyFeatures from '../components/landing/KeyFeatures';
import LiveStats from '../components/landing/LiveStats';
import AboutMission from '../components/landing/AboutMission';
import TechStackGrid from '../components/landing/TechStackGrid';
import TeamProfiles from '../components/landing/TeamProfiles';
import Footer from '../components/common/Footer';
import EligibilityModal from '../components/landing/EligibilityModal';
import QuickChatModal from '../components/landing/QuickChatModal';
import QuickScanModal from '../components/landing/QuickScanModal';
import AuthModal from '../components/auth/AuthModal';
import { MessageSquare, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage({ onEnterDashboard, onExploreFeature }) {
  const { user } = useAuth();
  const [eligibilityOpen, setEligibilityOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [scannedProfile, setScannedProfile] = useState(null);

  const handleApplyScannedProfile = (profile) => {
    setScannedProfile(profile);
    setEligibilityOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Top Navbar */}
      <Navbar onOpenAuth={() => setAuthOpen(true)} onEnterDashboard={onEnterDashboard} />

      {/* Main Page Sections */}
      <main className="flex-1">
        {/* Section 1: Hero Banner with live card snapshot */}
        <HeroSection
          onCheckEligibility={onEnterDashboard || (() => setEligibilityOpen(true))}
          onOpenChat={() => setChatOpen(true)}
          onOpenScanner={() => setScanOpen(true)}
        />

        {/* Section 2: How It Works (3-Step Roadmap) */}
        <HowItWorks />

        {/* Section 3: 6 Key Glassmorphic Feature Cards */}
        <KeyFeatures onExploreFeature={onExploreFeature} />

        {/* Section 4: Live Real-Time Welfare Stats (API Connected) */}
        <LiveStats />

        {/* Section 5: Mission & Awareness Gap Narrative */}
        <AboutMission />

        {/* Section 6: Full-Stack Engineering Tech Suite */}
        <TechStackGrid />

        {/* Section 7: College Project Team & Faculty Mentor Attribution */}
        <TeamProfiles />
      </main>

      {/* Section 8: Civic Footer with Helplines & National Portals */}
      <Footer />

      {/* Floating Action Button for Voice Chat */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
        {onEnterDashboard && (
          <button
            onClick={onEnterDashboard}
            className="flex items-center gap-2 px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xl shadow-emerald-600/25 hover:scale-105 transition-all cursor-pointer"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Open Dashboard</span>
          </button>
        )}

        <button
          onClick={() => setChatOpen(true)}
          className="flex items-center gap-2.5 px-5 py-3 rounded-full bg-slate-900 hover:bg-emerald-700 text-white font-semibold text-sm shadow-xl shadow-slate-900/25 hover:shadow-2xl hover:scale-105 transition-all cursor-pointer group"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <MessageSquare className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition-transform" />
          <span>Ask NagrikMitra AI</span>
        </button>
      </div>

      {/* Interactive Modals */}
      <EligibilityModal
        isOpen={eligibilityOpen}
        onClose={() => {
          setEligibilityOpen(false);
          setScannedProfile(null);
        }}
        initialProfile={scannedProfile}
      />

      <QuickChatModal
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
      />

      <QuickScanModal
        isOpen={scanOpen}
        onClose={() => setScanOpen(false)}
        onApplyProfile={handleApplyScannedProfile}
      />

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
      />
    </div>
  );
}
