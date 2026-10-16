import React, { useState, Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProfileProvider, useProfile } from './context/ProfileContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import LandingPage from './pages/LandingPage';
import QuickChatModal from './components/landing/QuickChatModal';
import QuickScanModal from './components/landing/QuickScanModal';
import { Loader2 } from 'lucide-react';

// Lazy load heavy components for optimized initial bundle size
const CitizenDashboard = lazy(() => import('./pages/CitizenDashboard'));
const FeatureDetailPage = lazy(() => import('./pages/FeatureDetailPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

function PageLoader() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
        </div>
        <p className="text-xs font-bold text-slate-500 tracking-wide">Loading Citizen Workspace...</p>
      </div>
    </div>
  );
}

function MainApp() {
  const { user, requireAuth } = useAuth();
  const { applyOcrData } = useProfile();

  const [view, setView] = useState('landing'); // 'landing', 'dashboard', 'feature', 'admin'
  const [selectedFeatureId, setSelectedFeatureId] = useState('deterministic-matcher');
  const [chatOpen, setChatOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);

  // Protected Route Guards
  const handleEnterDashboard = () => {
    requireAuth(() => {
      setView('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, {
      title: 'Citizen Dashboard Access',
      message: 'Sign in with your Google account or credentials to view your personalized schemes, bookmarks, and readiness checklist.',
    });
  };

  const handleEnterAdmin = () => {
    requireAuth(() => {
      setView('admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, {
      title: 'District Administration & VLE Portal',
      message: 'Access to Scheme Administration & CSC Kiosk Desk requires verified Admin or CSC VLE credentials.',
      requiredRole: 'admin',
    });
  };

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
      <Suspense fallback={<PageLoader />}>
        {view === 'admin' ? (
          <AdminDashboard 
            onBackToLanding={() => setView('landing')} 
            onGoToCitizenDashboard={() => setView('dashboard')} 
          />
        ) : view === 'dashboard' ? (
          user ? (
            <CitizenDashboard 
              onBackToLanding={() => setView('landing')} 
              onGoToAdmin={handleEnterAdmin} 
            />
          ) : (
            <LandingPage
              onEnterDashboard={handleEnterDashboard}
              onEnterAdmin={handleEnterAdmin}
              onExploreFeature={handleExploreFeature}
            />
          )
        ) : view === 'feature' ? (
          <FeatureDetailPage
            featureId={selectedFeatureId}
            onBack={() => setView('landing')}
            onSelectFeature={(id) => setSelectedFeatureId(id)}
            onOpenDashboard={handleEnterDashboard}
            onOpenVoiceModal={() => setChatOpen(true)}
            onOpenScanModal={() => setScanOpen(true)}
          />
        ) : (
          <LandingPage
            onEnterDashboard={handleEnterDashboard}
            onEnterAdmin={handleEnterAdmin}
            onExploreFeature={handleExploreFeature}
          />
        )}
      </Suspense>

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
    <ErrorBoundary>
      <AuthProvider>
        <ProfileProvider>
          <MainApp />
        </ProfileProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
