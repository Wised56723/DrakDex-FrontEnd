import { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
// 👇 IMPORTANTE: Usamos 'Key' e removemos totalmente o 'Lock' para evitar o erro
import { Shield, User, Mail, Key, Ghost, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

export default function AuthModal({ aoFechar }) {
  const { login, register } = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '', senha: '', nomeCompleto: '', vulgo: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login(formData.email, formData.senha);
        toast.success(`Bem-vindo de volta!`);
      } else {
        if (formData.senha.length < 8) {
          toast.warning("A senha precisa de pelo menos 8 caracteres!");
          setLoading(false);
          return;
        }
        await register(formData);
        toast.success("Conta criada! Faça login agora.");
        setIsLogin(true);
      }
    } catch (error) {
      toast.error("Erro: " + (error.response?.data || error.message));
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-slate-950 border border-slate-700 rounded-lg p-3 pl-10 text-white focus:border-rose-600 focus:outline-none transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl relative">
        
        <button onClick={aoFechar} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
          <X size={24} />
        </button>

        <div className="text-center mb-8">
          <div className="flex justify-center mb-4 text-rose-600">
            <Shield size={48} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">DrakDex</h1>
          <p className="text-slate-400">{isLogin ? "Acesse para criar criaturas" : "Junte-se à ordem"}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {!isLogin && (
            <>
              <div className="relative">
                <User className="absolute left-3 top-3.5 text-slate-500" size={18} />
                <input name="nomeCompleto" placeholder="Nome Completo" className={inputClass} onChange={handleChange} required />
              </div>
              <div className="relative">
                <Ghost className="absolute left-3 top-3.5 text-slate-500" size={18} />
                <input name="vulgo" placeholder="Seu Vulgo" className={inputClass} onChange={handleChange} required />
              </div>
            </>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-slate-500" size={18} />
            <input type="email" name="email" placeholder="Email" className={inputClass} onChange={handleChange} required />
          </div>

          <div className="relative">
            {/* 👇 USAMOS A CHAVE AQUI AGORA */}
            <Key className="absolute left-3 top-3.5 text-slate-500" size={18} />
            <input type="password" name="senha" placeholder="Senha" className={inputClass} onChange={handleChange} required />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-lg transition-all flex justify-center items-center gap-2">
            {loading ? <Loader2 className="animate-spin" /> : (isLogin ? "Entrar" : "Cadastrar")}
          </button>
        </form>

        <p className="text-center mt-6 text-slate-400 text-sm">
          {isLogin ? "Ainda não tem conta?" : "Já é um caçador?"}{" "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-rose-500 font-bold hover:underline">
            {isLogin ? "Crie uma agora" : "Fazer Login"}
          </button>
        </p>
      </div>
    </div>
  );
}