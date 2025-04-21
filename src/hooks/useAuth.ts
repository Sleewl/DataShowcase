import { useState, useEffect } from 'react';
import { UserRole } from '../types';
import CryptoJS from 'crypto-js';

interface Credentials {
  username: string;
  password: string;
}

const ENCRYPTION_KEY = '';

const encryptPassword = (password: string): string => {
  return CryptoJS.AES.encrypt(password, ENCRYPTION_KEY).toString();
};

const decryptPassword = (encryptedPassword: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedPassword, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

const USERS: Record<string, { password: string; role: UserRole }> = {
  'Executor': { 
    password: encryptPassword('Executor'), 
    role: 'executor' 
  },
  'Director': { 
    password: encryptPassword('Director'), 
    role: 'executive' 
  },
  'Admin': { 
    password: encryptPassword('Admin'), 
    role: 'technical' 
  }
};

export const useAuth = () => {
  const [user, setUser] = useState<{ role: UserRole } | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = (credentials: Credentials): boolean => {
    const userInfo = USERS[credentials.username];
    
    if (userInfo) {
      const decryptedPassword = decryptPassword(userInfo.password);
      if (credentials.password === decryptedPassword) {
        setUser({ role: userInfo.role });
        return true;
      }
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const canSelectRole = (role: StatusRole | InstallationRole): boolean => {
    if (!user) return false;

    switch (user.role) {
      case 'executor':
        return role === 'executor' || role === 'operator';
      case 'executive':
        return role === 'executor' || role === 'executive' || role === 'operator';
      case 'technical':
        return true;
      default:
        return false;
    }
  };

  return { user, login, logout, canSelectRole };
};
