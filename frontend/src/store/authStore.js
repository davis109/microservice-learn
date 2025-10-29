import { create } from 'zustand';
import { authAPI } from '../api/api';

export const useAuthStore = create((set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        try {
          const response = await authAPI.login({ email, password });
          const { token, user } = response.data;
          
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          
          set({
            user,
            token,
            isAuthenticated: true,
          });
          
          return { success: true };
        } catch (error) {
          return {
            success: false,
            error: error.response?.data?.error || 'Login failed',
          };
        }
      },

      register: async (username, email, password) => {
        try {
          const response = await authAPI.register({ username, email, password });
          const { token, user } = response.data;
          
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          
          set({
            user,
            token,
            isAuthenticated: true,
          });
          
          return { success: true };
        } catch (error) {
          return {
            success: false,
            error: error.response?.data?.error || 'Registration failed',
          };
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      initializeAuth: () => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (token && userStr) {
          try {
            const user = JSON.parse(userStr);
            set({
              user,
              token,
              isAuthenticated: true,
            });
          } catch (error) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      },
    }));
