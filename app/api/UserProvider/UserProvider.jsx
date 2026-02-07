'use client';

import { createContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch user data
  const fetchUser = async () => {
    try {
      const tokenString = localStorage.getItem('token');
      if (!tokenString) {
        setUser(null);
        setLoading(false);
        return;
      }

      let token;
      try {
        const parsed = JSON.parse(tokenString);
        token = parsed.token;
      } catch (e) {
        token = tokenString;
      }

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      console.log('Using Token:', token);

      const response = await fetch('/api/user-info', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        const errMsg = data?.error || data?.message || 'API fetch failed';
        console.error('User fetch error:', errMsg);
        setUser(null);
        setLoading(false);
        return;
      }

      if (!data.user) {
        console.error('User data not found in API response');
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(data.user);
      console.log('User loaded successfully:', data.user);
    } catch (error) {
      console.error('Error fetching user info:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch when component mounts
  useEffect(() => {
    fetchUser();
  }, []);

  // Listen for localStorage changes (for login/logout)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        console.log('Token changed, refreshing user data');
        setLoading(true);
        fetchUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check for token changes in same tab
    const interval = setInterval(() => {
      const currentToken = localStorage.getItem('token');
      const previousToken = localStorage.getItem('previousToken') || '';
      
      if (currentToken !== previousToken) {
        console.log('Token changed in same tab, refreshing user data');
        localStorage.setItem('previousToken', currentToken || '');
        setLoading(true);
        fetchUser();
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
};
