import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  role: 'CLIENT' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED';
  firstName?: string;
  lastName?: string;
  theme: 'dark' | 'light';
  passwordChanged: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demonstration
const mockUsers: User[] = [
  {
    id: 'admin-1',
    email: 'admin@crypto-arbitrage.com',
    role: 'ADMIN',
    status: 'ACTIVE',
    firstName: 'Administrateur',
    lastName: 'Principal',
    theme: 'dark',
    passwordChanged: false
  },
  {
    id: 'client-1',
    email: 'client@example.com',
    role: 'CLIENT',
    status: 'ACTIVE',
    firstName: 'Jean',
    lastName: 'Dupont',
    theme: 'dark',
    passwordChanged: true
  }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for existing session
    const savedUser = localStorage.getItem('crypto_arbitrage_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    setIsLoading(true);
    
    // Mock authentication
    const mockUser = mockUsers.find(u => u.email === email);
    
    if (!mockUser) {
      setIsLoading(false);
      return { error: 'Email ou mot de passe invalide' };
    }

    // Mock password validation (admin123 for admin, any password for client)
    const isValidPassword = 
      (email === 'admin@crypto-arbitrage.com' && password === 'admin123') ||
      (email !== 'admin@crypto-arbitrage.com');

    if (!isValidPassword) {
      setIsLoading(false);
      return { error: 'Email ou mot de passe invalide' };
    }

    setUser(mockUser);
    localStorage.setItem('crypto_arbitrage_user', JSON.stringify(mockUser));
    setIsLoading(false);
    
    return {};
  };

  const signUp = async (
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string
  ): Promise<{ error?: string }> => {
    setIsLoading(true);

    // Check if user already exists
    if (mockUsers.some(u => u.email === email)) {
      setIsLoading(false);
      return { error: 'Un utilisateur avec cet email existe déjà' };
    }

    // Create new user
    const newUser: User = {
      id: `client-${Date.now()}`,
      email,
      role: 'CLIENT',
      status: 'ACTIVE',
      firstName,
      lastName,
      theme: 'dark',
      passwordChanged: true
    };

    mockUsers.push(newUser);
    setUser(newUser);
    localStorage.setItem('crypto_arbitrage_user', JSON.stringify(newUser));
    setIsLoading(false);

    return {};
  };

  const signOut = async (): Promise<void> => {
    setUser(null);
    localStorage.removeItem('crypto_arbitrage_user');
  };

  const updateProfile = async (updates: Partial<User>): Promise<void> => {
    if (!user) return;

    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('crypto_arbitrage_user', JSON.stringify(updatedUser));
    
    // Update in mock database
    const userIndex = mockUsers.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      mockUsers[userIndex] = updatedUser;
    }
  };

  const value = {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}