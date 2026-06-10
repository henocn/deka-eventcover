import { createContext, useCallback, useMemo, useState } from 'react';
import { clearSession, getStoredUser, login as loginRequest, updateProfile as updateProfileRequest } from '../api';

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());

  const login = useCallback(async (email, password) => {
    const data = await loginRequest(email, password);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const updatedUser = await updateProfileRequest(payload);
    setUser(updatedUser);
    return updatedUser;
  }, []);

  const value = useMemo(() => ({
    isAuthenticated: Boolean(user),
    login,
    logout,
    updateProfile,
    user,
  }), [login, logout, updateProfile, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext, AuthProvider };
