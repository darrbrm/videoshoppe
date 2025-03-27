import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload
        setIsAuthenticated(true);
        setIsAdmin(decodedToken.isAdmin);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);

  return { isAuthenticated, isAdmin };
};
