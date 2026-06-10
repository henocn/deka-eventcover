import { createContext, useMemo, useState } from 'react';
import { clearSession, getStoredUser, login as loginRequest } from '../api';

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());

  async function login(email, password) {
    const data = await loginRequest(email, password);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    clearSession();
    setUser(null);
  }

  const value = useMemo(() => ({
    isAuthenticated: Boolean(user),
    login,
    logout,
    user,
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext, AuthProvider };
