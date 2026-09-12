import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ProfileContext = createContext(null);

const DEFAULT_PROFILE = {
  age: 32,
  gender: 'male',
  state: 'Uttar Pradesh',
  residence: 'rural',
  caste_category: 'OBC',
  annual_income: 150000,
  is_bpl: false,
  has_disability: false,
  occupation: 'farmer',
};

export function ProfileProvider({ children }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('nagrikmitra_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load profile from localStorage:', e);
    }
    return DEFAULT_PROFILE;
  });

  // When user logs in with a demo account, update profile according to user_metadata
  useEffect(() => {
    if (user?.user_metadata) {
      const meta = user.user_metadata;
      setProfile((prev) => {
        const updated = {
          ...prev,
          age: meta.age !== undefined ? meta.age : prev.age,
          gender: meta.gender || prev.gender,
          state: meta.state || prev.state,
          occupation: meta.occupation || prev.occupation,
          caste_category: meta.caste || prev.caste_category,
          annual_income: meta.income !== undefined ? meta.income : prev.annual_income,
          is_bpl: meta.is_bpl !== undefined ? meta.is_bpl : prev.is_bpl,
          has_disability: meta.has_disability !== undefined ? meta.has_disability : prev.has_disability,
        };
        try {
          localStorage.setItem('nagrikmitra_profile', JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
        return updated;
      });
    }
  }, [user]);

  const updateProfile = (updates) => {
    setProfile((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem('nagrikmitra_profile', JSON.stringify(next));
      } catch (e) {
        console.error('Failed to save profile to localStorage:', e);
      }
      return next;
    });
  };

  const applyOcrData = (ocr) => {
    const updates = {};
    if (ocr.age) updates.age = Number(ocr.age);
    if (ocr.gender) {
      const g = ocr.gender.toLowerCase();
      if (g.includes('fem') || g.includes('महिला')) updates.gender = 'female';
      else if (g.includes('male') || g.includes('पुरुष')) updates.gender = 'male';
    }
    if (ocr.state) updates.state = ocr.state;
    updateProfile(updates);
  };

  return (
    <ProfileContext.Provider value={{ profile, updateProfile, applyOcrData, setProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
