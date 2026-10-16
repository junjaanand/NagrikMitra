import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../api/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for simulated demo session first
    const savedDemoUser = localStorage.getItem('nagrikmitra_demo_user');
    if (savedDemoUser) {
      try {
        setUser(JSON.parse(savedDemoUser));
      } catch (e) {
        localStorage.removeItem('nagrikmitra_demo_user');
      }
    }

    if (isSupabaseConfigured && supabase) {
      // 1. Get initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setSession(session);
          setUser(session.user);
        }
        setLoading(false);
      });

      // 2. Listen for auth changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user || null);
        if (session?.user) {
          localStorage.removeItem('nagrikmitra_demo_user');
        }
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  // 1. Google OAuth Login
  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured yet. Please enter your project keys or use Demo Citizen Login.');
    }
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
    return data;
  };

  // 2. Email & Password Sign In
  const signInWithEmail = async (email, password) => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured yet. Please enter your project keys or use Demo Citizen Login.');
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  // 3. Email & Password Sign Up
  const signUpWithEmail = async (email, password, fullName) => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured yet. Please enter your project keys or use Demo Citizen Login.');
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    if (error) throw error;
    return data;
  };

  const [pendingAction, setPendingAction] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalConfig, setAuthModalConfig] = useState({
    title: 'Citizen Authentication Required',
    message: 'Please sign in or select an Instant Demo Citizen profile to access this tool.',
    requiredRole: null,
  });

  const openAuthModal = (config = {}) => {
    setAuthModalConfig({
      title: config.title || 'Citizen Authentication Required',
      message: config.message || 'Please sign in or select an Instant Demo Citizen profile to access this tool.',
      requiredRole: config.requiredRole || null,
    });
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
    setPendingAction(null);
  };

  const requireAuth = (actionCallback, config = {}) => {
    if (user) {
      const currentRole = user.user_metadata?.rbac_role || (user.id?.includes('vle') ? 'admin' : 'citizen');
      if (config.requiredRole && config.requiredRole !== currentRole) {
        openAuthModal({
          title: 'Administrative Access Required',
          message: `This action requires ${config.requiredRole === 'admin' ? 'CSC VLE / District Admin' : config.requiredRole} privileges. Select the CSC VLE profile to continue.`,
          requiredRole: config.requiredRole,
        });
        setPendingAction(() => actionCallback);
        return;
      }
      actionCallback(user);
    } else {
      openAuthModal(config);
      setPendingAction(() => actionCallback);
    }
  };

  // 4. Sign Out
  const signOut = async () => {
    localStorage.removeItem('nagrikmitra_demo_user');
    setUser(null);
    setSession(null);
    setPendingAction(null);
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
  };

  // 5. Instant Demo Citizen Login (for testing & presentations)
  const demoLogin = (profileType = 'farmer') => {
    const demoProfiles = {
      farmer: {
        id: 'demo-farmer-01',
        email: 'rajesh.farmer@nagrikmitra.in',
        user_metadata: {
          full_name: 'Rajesh Kumar Sharma',
          role: 'Farmer (UP • BPL)',
          state: 'Uttar Pradesh',
          age: 38,
          rbac_role: 'citizen',
        },
        is_demo: true,
      },
      student: {
        id: 'demo-student-02',
        email: 'ananya.student@nagrikmitra.in',
        user_metadata: {
          full_name: 'Ananya Sen Gupta',
          role: 'Student (MH • SC Category)',
          state: 'Maharashtra',
          age: 21,
          rbac_role: 'citizen',
        },
        is_demo: true,
      },
      women: {
        id: 'demo-women-03',
        email: 'sunita.devi@nagrikmitra.in',
        user_metadata: {
          full_name: 'Sunita Devi',
          role: 'Self-Help Group (Gujarat • Rural)',
          state: 'Gujarat',
          age: 34,
          rbac_role: 'citizen',
        },
        is_demo: true,
      },
      vle: {
        id: 'demo-vle-admin-04',
        email: 'vikram.vle@csc.gov.in',
        user_metadata: {
          full_name: 'Vikram Singh (CSC VLE)',
          role: 'District Nodal Officer / CSC VLE',
          state: 'Central',
          age: 32,
          rbac_role: 'admin',
        },
        is_demo: true,
      },
    };

    const chosenProfile = demoProfiles[profileType] || demoProfiles.farmer;
    setUser(chosenProfile);
    localStorage.setItem('nagrikmitra_demo_user', JSON.stringify(chosenProfile));
    
    // Auto-resume intercepted pending action if registered
    if (pendingAction) {
      const action = pendingAction;
      setPendingAction(null);
      setAuthModalOpen(false);
      setTimeout(() => action(chosenProfile), 100);
    } else {
      setAuthModalOpen(false);
    }

    return chosenProfile;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isConfigured: isSupabaseConfigured,
        authModalOpen,
        authModalConfig,
        openAuthModal,
        closeAuthModal,
        requireAuth,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        demoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
