import React, { createContext, useState, useEffect, useCallback } from 'react';
import { loginUser, registerParticipant, createStaffUser, getCurrentUser } from '../api/auth';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [primaryField, setPrimaryField] = useState(() => {
    return localStorage.getItem('primaryField') || 'AI/ML';
  });
  const [loading, setLoading] = useState(true);

  // Extract primary field helper
  const parsePrimaryField = useCallback((userData) => {
    let field = 'AI/ML';
    try {
      if (userData?.profile?.interests) {
        const interests = typeof userData.profile.interests === 'string'
          ? JSON.parse(userData.profile.interests)
          : userData.profile.interests;
        if (Array.isArray(interests) && interests.length > 0) {
          field = interests[0];
        }
      }
    } catch (e) {
      console.warn('Could not parse user interests for primary field:', e);
    }
    return field;
  }, []);

  const saveAuthSession = useCallback((newToken, newUser, customField) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));

    const fieldToSave = customField || parsePrimaryField(newUser);
    setPrimaryField(fieldToSave);
    localStorage.setItem('primaryField', fieldToSave);
  }, [parsePrimaryField]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setPrimaryField('AI/ML');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('primaryField');
  }, []);

  // Hydrate user profile on load
  useEffect(() => {
    async function hydrate() {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          const res = await getCurrentUser();
          if (res.user) {
            setUser(res.user);
            localStorage.setItem('user', JSON.stringify(res.user));
            const field = parsePrimaryField(res.user);
            setPrimaryField(field);
            localStorage.setItem('primaryField', field);
          }
        } catch (err) {
          console.error('Session hydration failed:', err);
          logout();
        }
      }
      setLoading(false);
    }

    hydrate();
  }, [logout, parsePrimaryField]);

  const login = async (email, password) => {
    const res = await loginUser(email, password);
    if (res.token && res.user) {
      saveAuthSession(res.token, res.user);
    }
    return res;
  };

  const register = async (formData) => {
    // Inject primary field into interests array so it is stored in backend profile
    const selectedField = formData.primary_field || 'AI/ML';
    const otherInterests = Array.isArray(formData.interests) ? formData.interests : [];
    const combinedInterests = [selectedField, ...otherInterests.filter(i => i !== selectedField)];

    const payload = {
      ...formData,
      interests: combinedInterests,
    };

    const res = await registerParticipant(payload);
    if (res.token && res.user) {
      saveAuthSession(res.token, res.user, selectedField);
    }
    return res;
  };

  const createStaff = async (staffData) => {
    return createStaffUser(staffData);
  };

  const updateUser = useCallback((updatedUserData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedUserData };
      localStorage.setItem('user', JSON.stringify(merged));
      return merged;
    });
  }, []);

  const value = {
    token,
    user,
    role: (user?.role || '').toLowerCase(),
    primaryField,
    setPrimaryField: (field) => {
      setPrimaryField(field);
      localStorage.setItem('primaryField', field);
    },
    updateUser,
    loading,
    isAuthenticated: !!token && !!user,
    isStaff: ['organizer', 'judge', 'mentor', 'sponsor'].includes((user?.role || '').toLowerCase()),
    isOrganizer: (user?.role || '').toLowerCase() === 'organizer',
    isJudge: (user?.role || '').toLowerCase() === 'judge',
    isMentor: (user?.role || '').toLowerCase() === 'mentor',
    login,
    register,
    createStaff,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
