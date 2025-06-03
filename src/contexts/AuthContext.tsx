import React, { createContext, useContext, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface User {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const hashPassword = async (password: string, salt: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const loadUsers = (): User[] => {
    try {
      const data = localStorage.getItem('users');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      return [];
    }
  };

  const saveUsers = (users: User[]) => {
    localStorage.setItem('users', JSON.stringify(users));
  };

  const register = async (email: string, password: string): Promise<boolean> => {
    const users = loadUsers();
    if (users.some(u => u.email === email)) {
      return false; // User already exists
    }

    const salt = uuidv4();
    const passwordHash = await hashPassword(password, salt);

    const newUser: User = {
      id: uuidv4(),
      email,
      passwordHash,
      salt
    };

    users.push(newUser);
    saveUsers(users);
    setUser(newUser);
    return true;
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const users = loadUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) return false;

    const passwordHash = await hashPassword(password, user.salt);
    if (passwordHash !== user.passwordHash) return false;

    setUser(user);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};