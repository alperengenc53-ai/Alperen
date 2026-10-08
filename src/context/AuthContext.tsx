import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppUser } from '../types/user';
import {
  getActiveUser,
  setActiveUser,
  registerAccount,
  loginAccount,
} from '../services/userService';

interface AuthContextType {
  // Admin auth
  isAdmin: boolean;
  adminName: string | null;
  login: (username: string, pass: string) => { success: boolean; error?: string };
  logout: () => void;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;

  // Visitor User Account Auth (Hesap Giriş / Hesap Oluştur)
  currentUser: AppUser | null;
  activeUserName: string | null;
  isLoggedIn: boolean; // either admin or normal user
  isUserAuthModalOpen: boolean;
  userAuthModalTab: 'login' | 'register';
  openUserAuthModal: (tab?: 'login' | 'register') => void;
  closeUserAuthModal: () => void;
  loginUser: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  registerUser: (firstName: string, lastName: string, email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logoutUser: () => void;
}

const AUTH_KEY = 'alperen_genc_admin_auth_v1';
const EXPECTED_USER = 'Alperen Genç';
const EXPECTED_PASS = '5353';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Admin state
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return localStorage.getItem(AUTH_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Normal user account state
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => getActiveUser());
  const [isUserAuthModalOpen, setIsUserAuthModalOpen] = useState(false);
  const [userAuthModalTab, setUserAuthModalTab] = useState<'login' | 'register'>('login');

  useEffect(() => {
    try {
      if (isAdmin) {
        localStorage.setItem(AUTH_KEY, 'true');
      } else {
        localStorage.removeItem(AUTH_KEY);
      }
    } catch {
      // ignore
    }
  }, [isAdmin]);

  // Admin login
  const login = (username: string, pass: string) => {
    const cleanUser = username.trim();
    const cleanPass = pass.trim();

    if (cleanUser === EXPECTED_USER && cleanPass === EXPECTED_PASS) {
      setIsAdmin(true);
      setIsLoginModalOpen(false);
      return { success: true };
    }
    return { success: false, error: 'Hatalı Yönetici Adı veya Şifre girdiniz.' };
  };

  const logout = () => {
    setIsAdmin(false);
  };

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  // Visitor user account functions
  const openUserAuthModal = (tab: 'login' | 'register' = 'login') => {
    setUserAuthModalTab(tab);
    setIsUserAuthModalOpen(true);
  };

  const closeUserAuthModal = () => {
    setIsUserAuthModalOpen(false);
  };

  const loginUser = async (username: string, pass: string) => {
    const cleanUser = username.trim();
    const cleanPass = pass.trim();

    // If logging in as admin directly from user login
    if (cleanUser === EXPECTED_USER && cleanPass === EXPECTED_PASS) {
      setIsAdmin(true);
      setIsUserAuthModalOpen(false);
      return { success: true };
    }

    const res = await loginAccount(cleanUser, cleanPass);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      setIsUserAuthModalOpen(false);
      return { success: true };
    }
    return { success: false, error: res.error || 'Giriş yapılamadı.' };
  };

  const registerUser = async (firstName: string, lastName: string, email: string, pass: string) => {
    const res = await registerAccount(firstName, lastName, email, pass);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      setIsUserAuthModalOpen(false);
      return { success: true };
    }
    return { success: false, error: res.error || 'Hesap oluşturulamadı.' };
  };

  const logoutUser = () => {
    setActiveUser(null);
    setCurrentUser(null);
    if (isAdmin) {
      setIsAdmin(false);
    }
  };

  // Determine active display name for comments/header
  const activeUserName = isAdmin
    ? 'Alperen Genç (Yönetici)'
    : currentUser
    ? currentUser.name
    : null;

  const isLoggedIn = isAdmin || !!currentUser;

  return (
    <AuthContext.Provider
      value={{
        isAdmin,
        adminName: isAdmin ? EXPECTED_USER : null,
        login,
        logout,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,

        currentUser,
        activeUserName,
        isLoggedIn,
        isUserAuthModalOpen,
        userAuthModalTab,
        openUserAuthModal,
        closeUserAuthModal,
        loginUser,
        registerUser,
        logoutUser,
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
