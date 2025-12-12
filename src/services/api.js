import axios from 'axios';

// URL base do Render
export const api = axios.create({
  baseURL: 'https://drakdex-api.onrender.com', // Confirma se é o teu link
});

// O INTERCEPTADOR (A Mágica)
// Antes de cada requisição, ele roda isto:
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('drakdex_token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});