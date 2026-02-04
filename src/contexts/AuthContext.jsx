import { createContext, useState, useEffect } from "react";
import { api } from "../services/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // CORREÇÃO: Usar 'drakdex_token' para combinar com o api.js
    const token = localStorage.getItem("drakdex_token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, senha) => {
    try {
      const response = await api.post("/auth/login", { email, senha });
      const { token, nome, vulgo } = response.data;

      // CORREÇÃO: Salvar como 'drakdex_token'
      localStorage.setItem("drakdex_token", token);
      localStorage.setItem("user", JSON.stringify({ nome, vulgo }));
      
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser({ nome, vulgo });
    } catch (error) {
      throw error;
    }
  };

  const register = async (dados) => {
    try {
      await api.post("/auth/register", dados);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    // CORREÇÃO: Remover 'drakdex_token'
    localStorage.removeItem("drakdex_token");
    localStorage.removeItem("user");
    api.defaults.headers.common["Authorization"] = null;
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ authenticated: !!user, user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}