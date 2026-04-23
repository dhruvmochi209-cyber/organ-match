import api from './api';

export const authService = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('organmatch_token', res.data.token);
    localStorage.setItem('organmatch_user', JSON.stringify(res.data.user));
    return res.data;
  },

  register: async (data) => {
    const res = await api.post('/auth/register', data);
    localStorage.setItem('organmatch_token', res.data.token);
    localStorage.setItem('organmatch_user', JSON.stringify(res.data.user));
    return res.data;
  },

  logout: () => {
    localStorage.removeItem('organmatch_token');
    localStorage.removeItem('organmatch_user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('organmatch_user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => !!localStorage.getItem('organmatch_token'),
};
