import { createContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // Guarda { vulgo: "...", token: "..." }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ao carregar a página, verifica se já tínhamos logado antes
    const recoveredUser = localStorage.getItem('drakdex_user');
    const token = localStorage.getItem('drakdex_token');

    if (recoveredUser && token) {
      setUser(JSON.parse(recoveredUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, senha) => {
    // Faz o POST para o Spring
    const response = await api.post('/auth/login', { email, senha });
    
    // O backend devolve { token: "...", vulgo: "..." }
    const { token, vulgo } = response.data;

    // Salva no navegador e no estado
    localStorage.setItem('drakdex_token', token);
    localStorage.setItem('drakdex_user', JSON.stringify({ vulgo }));
    
    setUser({ vulgo });
  };

  const register = async (dadosRegistro) => {
    await api.post('/auth/register', dadosRegistro);
  };

  const logout = () => {
    localStorage.removeItem('drakdex_token');
    localStorage.removeItem('drakdex_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ authenticated: !!user, user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}