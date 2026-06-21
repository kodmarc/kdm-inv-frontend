import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

interface UserProfile {
  id: string;
  username: string;
  email: string | null;
  role: 'ORG_ADMIN' | 'ORG_USER' | 'BRANCH_ADMIN' | 'USER' | 'KPO';
  org_id: string | null;
  org_name: string | null;
  branch_slug: string | null;
  branch_name: string | null;
  company_creation_policy?: 'ORG_ADMIN' | 'BRANCH_ADMIN' | null;
  item_creation_policy?: 'ORG_ADMIN' | 'BRANCH_ADMIN' | null;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginOrg: (orgId: string, role: string, username: string, password: string) => Promise<UserProfile>;
  loginBranch: (orgId: string, branchSlug: string, role: string, username: string, password: string) => Promise<UserProfile>;
  signupOrg: (orgId: string, orgName: string, username: string, password: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore session on app load
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const response = await api.get('/auth/me/');
        setUser(response.data);
        setIsAuthenticated(true);
        
        // Inject CSRF token into default Axios headers for mutating requests
        if (response.data.csrf_token) {
          api.defaults.headers.common['X-CSRFToken'] = response.data.csrf_token;
        }
      } catch (err) {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, []);

  // Listen to session expiration events from axios interceptors
  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null);
      setIsAuthenticated(false);
      delete api.defaults.headers.common['X-CSRFToken'];
    };

    window.addEventListener('auth-session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('auth-session-expired', handleSessionExpired);
    };
  }, []);

  const loginOrg = async (orgId: string, role: string, username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login-org/', {
        org_id: orgId,
        role,
        username,
        password
      });
      const profile = response.data.user;
      setUser(profile);
      setIsAuthenticated(true);
      
      // Inject CSRF token into default Axios headers for mutating requests
      api.defaults.headers.common['X-CSRFToken'] = response.data.csrf_token;
      return profile;
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginBranch = async (orgId: string, branchSlug: string, role: string, username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login-branch/', {
        org_id: orgId,
        branch_slug: branchSlug,
        role,
        username,
        password
      });
      const profile = response.data.user;
      setUser(profile);
      setIsAuthenticated(true);
      
      // Inject CSRF token
      api.defaults.headers.common['X-CSRFToken'] = response.data.csrf_token;
      return profile;
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signupOrg = async (orgId: string, orgName: string, username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/signup/', {
        org_id: orgId,
        org_name: orgName,
        username,
        password
      });
      const profile = response.data.user;
      setUser(profile);
      setIsAuthenticated(true);
      
      // Inject CSRF token into default Axios headers for mutating requests
      api.defaults.headers.common['X-CSRFToken'] = response.data.csrf_token;
      return profile;
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.post('/auth/logout/', {});
    } catch (error) {
      // Even if network fails, force client-side logout cleanup
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      delete api.defaults.headers.common['X-CSRFToken'];
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, loginOrg, loginBranch, signupOrg, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
