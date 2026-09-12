import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProfileProvider, useProfile } from './context/ProfileContext';
import LandingPage from './pages/LandingPage';
import CitizenDashboard from './pages/CitizenDashboard';
import FeatureDetailPage from './pages/FeatureDetailPage';
import QuickChatModal from './components/landing/QuickChatModal';
import QuickScanModal from './components/landing/QuickScanModal';

function MainApp() {
  const { user } = useAuth();
  const { applyOcrData } = useProfile();

  const [view, setView] = useState('landing'); // 'landing', 'dashboard', 'feature'
  const [selectedFeatureId, setSelectedFeatureId] = useState('deterministic-matcher');
  const [chatOpen, setChatOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);

  const handleExploreFeature = (featureId) => {
    setSelectedFeatureId(featureId);
    setView('feature');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApplyScannedProfile = (ocrData) => {
    applyOcrData(ocrData);
    setScanOpen(false);
    setView('dashboard');
  };

  return (
    <div className="w-full min-h-screen">
      {view === 'dashboard' ? (
        <CitizenDashboard onBackToLanding={() => setView('landing')} />
      ) : view === 'feature' ? (
        <FeatureDetailPage
          featureId={selectedFeatureId}
          onBack={() => setView('landing')}
          onSelectFeature={(id) => setSelectedFeatureId(id)}
          onOpenDashboard={() => setView('dashboard')}
          onOpenVoiceModal={() => setChatOpen(true)}
          onOpenScanModal={() => setScanOpen(true)}
        />
      ) : (
        <LandingPage
          onEnterDashboard={() => setView('dashboard')}
          onExploreFeature={handleExploreFeature}
        />
      )}

      {/* Global Modals triggered from Feature pages */}
      <QuickChatModal
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
      />

      <QuickScanModal
        isOpen={scanOpen}
        onClose={() => setScanOpen(false)}
        onApplyProfile={handleApplyScannedProfile}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <MainApp />
      </ProfileProvider>
    </AuthProvider>
  );
}
