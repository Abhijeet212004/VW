import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInSignupFlow: boolean;
  tempSignupData: { user: User; token: string } | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signUp: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string; tempData?: any }>;
  signOut: () => Promise<void>;
  completeSignupFlow: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInSignupFlow, setIsInSignupFlow] = useState(false);
  const [tempSignupData, setTempSignupData] = useState<{ user: User; token: string } | null>(null);

  const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3000';

  // Load stored auth data on app start
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('auth_token');
      const storedUser = await AsyncStorage.getItem('user_data');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    try {
      console.log('🚀 Signing up user:', { name, email });
      
      const response = await fetch(`${backendUrl}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      console.log('📊 Sign up response:', data);
      
      if (response.ok && data.success) {
        // Store auth data - backend returns user and token inside data object
        await AsyncStorage.setItem('auth_token', data.data.token);
        await AsyncStorage.setItem('user_data', JSON.stringify(data.data.user));
        
        // Store temporarily instead of setting immediately
        setTempSignupData({ user: data.data.user, token: data.data.token });
        setIsInSignupFlow(true); // Set signup flow flag
        
        console.log('✅ Sign up successful, data stored temporarily');
        return { 
          success: true, 
          message: data.message || 'Account created successfully!',
          tempData: { user: data.data.user, token: data.data.token }
        };
      } else {
        console.error('❌ Sign up failed:', data.message);
        return { success: false, message: data.message || 'Sign up failed' };
      }
    } catch (error) {
      console.error('❌ Sign up error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🚀 Signing in user:', email);
      
      const response = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('📊 Sign in response:', data);
      
      if (response.ok && data.success) {
        // Store auth data - backend returns user and token inside data object
        await AsyncStorage.setItem('auth_token', data.data.token);
        await AsyncStorage.setItem('user_data', JSON.stringify(data.data.user));
        
        setToken(data.data.token);
        setUser(data.data.user);
        
        console.log('✅ Sign in successful');
        return { success: true, message: data.message || 'Signed in successfully!' };
      } else {
        console.error('❌ Sign in failed:', data.message);
        return { success: false, message: data.message || 'Sign in failed' };
      }
    } catch (error) {
      console.error('❌ Sign in error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');
      setToken(null);
      setUser(null);
      setIsInSignupFlow(false);
      console.log('✅ Signed out successfully');
    } catch (error) {
      console.error('❌ Sign out error:', error);
    }
  };

  const completeSignupFlow = () => {
    if (tempSignupData) {
      setUser(tempSignupData.user);
      setToken(tempSignupData.token);
      setTempSignupData(null);
    }
    setIsInSignupFlow(false);
    console.log('✅ Signup flow completed, user data set');
  };

  const value = {
    user,
    token,
    isLoading,
    isInSignupFlow,
    tempSignupData,
    signIn,
    signUp,
    signOut,
    completeSignupFlow,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};