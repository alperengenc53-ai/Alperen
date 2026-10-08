import {
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AppUser } from '../types/user';

const USERS_CACHE_KEY = 'alperen_genc_users_cache_v3';
const ACTIVE_USER_KEY = 'alperen_genc_active_user_v3';

interface StoredUserAccount extends AppUser {
  passwordHash: string;
}

// In-memory or localStorage cache for fast instant response
function getLocalUsers(): StoredUserAccount[] {
  try {
    const raw = localStorage.getItem(USERS_CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalUsers(users: StoredUserAccount[]): void {
  try {
    localStorage.setItem(USERS_CACHE_KEY, JSON.stringify(users));
  } catch {
    // ignore
  }
}

export function getActiveUser(): AppUser | null {
  try {
    const raw = localStorage.getItem(ACTIVE_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setActiveUser(user: AppUser | null): void {
  try {
    if (user) {
      localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(ACTIVE_USER_KEY);
    }
  } catch {
    // ignore
  }
}

// Simple deterministic hash
function hashPassword(pass: string): string {
  let hash = 0;
  for (let i = 0; i < pass.length; i++) {
    const char = pass.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'h_' + Math.abs(hash).toString(36) + '_' + pass.length;
}

export function formatEmailToName(email: string): string {
  const clean = email.trim().toLowerCase();
  const atIndex = clean.indexOf('@');
  if (atIndex > 0) {
    return clean.substring(0, atIndex);
  }
  return clean;
}

export async function registerAccount(
  firstName: string,
  lastName: string,
  email: string,
  password: string
): Promise<{ success: boolean; user?: AppUser; error?: string }> {
  const cleanFirst = firstName.trim();
  const cleanLast = lastName.trim();
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = password.trim();

  if (!cleanFirst) {
    return { success: false, error: 'Lütfen adınızı giriniz.' };
  }
  if (!cleanLast) {
    return { success: false, error: 'Lütfen soyadınızı giriniz.' };
  }
  if (!cleanEmail) {
    return { success: false, error: 'Lütfen e-posta adresinizi giriniz.' };
  }
  if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    return { success: false, error: 'Lütfen geçerli bir e-posta adresi giriniz (Örn: ornek@gmail.com).' };
  }
  if (!cleanPass || cleanPass.length < 4) {
    return { success: false, error: 'Şifreniz en az 4 karakter olmalıdır.' };
  }

  // 1. Check local list first
  const localUsers = getLocalUsers();
  const existsLocal = localUsers.some(u => u.username.toLowerCase() === cleanEmail);
  if (existsLocal) {
    return { success: false, error: 'Bu e-posta adresiyle zaten kayıtlı bir hesap var. Lütfen giriş yapın.' };
  }

  // 2. Check Firestore
  try {
    const safeDocId = cleanEmail.replace(/[^a-zA-Z0-9_]/g, '_');
    const userDocRef = doc(db, 'users', safeDocId);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      return { success: false, error: 'Bu e-posta adresiyle zaten kayıtlı bir hesap var.' };
    }
  } catch {
    // offline fallback
  }

  const userId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const fullName = `${cleanFirst} ${cleanLast}`;

  const userObj: AppUser = {
    id: userId,
    name: fullName,
    firstName: cleanFirst,
    lastName: cleanLast,
    username: cleanEmail,
    role: 'user',
    createdAt: new Date().toISOString(),
  };

  const storedAccount: StoredUserAccount = {
    ...userObj,
    passwordHash: hashPassword(cleanPass),
  };

  // Save to local cache
  localUsers.push(storedAccount);
  saveLocalUsers(localUsers);
  setActiveUser(userObj);

  // Sync to Firestore
  try {
    const safeDocId = cleanEmail.replace(/[^a-zA-Z0-9_]/g, '_');
    await setDoc(doc(db, 'users', safeDocId), storedAccount);
  } catch (err) {
    console.warn('Firestore user save warning:', err);
  }

  return { success: true, user: userObj };
}

export async function loginAccount(
  email: string,
  password: string
): Promise<{ success: boolean; user?: AppUser; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = password.trim();

  if (!cleanEmail || !cleanPass) {
    return { success: false, error: 'Lütfen e-posta ve şifrenizi giriniz.' };
  }

  const expectedHash = hashPassword(cleanPass);

  // 1. Check local cache
  const localUsers = getLocalUsers();
  const foundLocal = localUsers.find(u => u.username.toLowerCase() === cleanEmail);
  if (foundLocal) {
    if (foundLocal.passwordHash === expectedHash) {
      const user: AppUser = {
        id: foundLocal.id,
        name: foundLocal.name || `${foundLocal.firstName || ''} ${foundLocal.lastName || ''}`.trim() || formatEmailToName(foundLocal.username),
        firstName: foundLocal.firstName,
        lastName: foundLocal.lastName,
        username: foundLocal.username,
        role: foundLocal.role,
        createdAt: foundLocal.createdAt,
      };
      setActiveUser(user);
      return { success: true, user };
    } else {
      return { success: false, error: 'Hatalı şifre girdiniz.' };
    }
  }

  // 2. Query Firestore
  try {
    const safeDocId = cleanEmail.replace(/[^a-zA-Z0-9_]/g, '_');
    const docSnap = await getDoc(doc(db, 'users', safeDocId));
    if (docSnap.exists()) {
      const data = docSnap.data() as StoredUserAccount;
      if (data.passwordHash === expectedHash) {
        const user: AppUser = {
          id: data.id,
          name: data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim() || formatEmailToName(data.username),
          firstName: data.firstName,
          lastName: data.lastName,
          username: data.username,
          role: data.role,
          createdAt: data.createdAt,
        };
        // update local cache
        localUsers.push(data);
        saveLocalUsers(localUsers);
        setActiveUser(user);
        return { success: true, user };
      } else {
        return { success: false, error: 'Hatalı şifre girdiniz.' };
      }
    }
  } catch (err) {
    console.warn('Firestore login check error:', err);
  }

  return { success: false, error: 'Bu e-posta adresiyle kayıtlı bir hesap bulunamadı.' };
}
