'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from './db/schema';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  logout: () => {},
});

function setCookie(name: string, value: string, days: number) {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
}

function getCookie(name: string) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for(let c of ca) {
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function eraseCookie(name: string) {
  document.cookie = name + '=; Max-Age=-99999999;';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // 检查cookie中的用户信息
    const userCookie = getCookie('user');
    if (userCookie) {
      try {
        setUser(JSON.parse(userCookie));
      } catch (e) {
        console.error('Failed to parse user cookie:', e);
      }
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        return false;
      }

      const userData = await response.json();
      setUser(userData);
      // 设置cookie，过期时间7天
      setCookie('user', JSON.stringify(userData), 7);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    eraseCookie('user');
  };

  const contextValue = {
    user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 