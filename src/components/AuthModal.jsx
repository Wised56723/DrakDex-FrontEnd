import { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { X, User, Lock, Mail, ChevronRight, Loader2, AlertCircle, Ghost } from 'lucide-react'; 
import { toast } from 'sonner';

export default function AuthModal({ onClose }) { 
  const { login, register } = useContext(AuthContext);
  
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    nomeCompleto: '', 
    vulgo: '',
    email: '',
    senha: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await login(formData.email, formData.senha);
        toast.success(`Bem-vindo de volta!`);
        if (onClose) onClose(); 
      } else {
        // Validação extra no Frontend
        if (formData.senha.length < 8) {
             setError("A senha deve ter no mínimo 8 caracteres.");
             setLoading(false);
             return;
        }

        await register(formData);
        toast.success("Conta criada! Faça login agora.");
        setIsLogin(true);
        // Limpa o form
        setFormData({ nomeCompleto: '', vulgo: '', email: '', senha: '' });
      }
    } catch (err) {
      console.error("Erro no Auth:", err);
      
      // LÓGICA DE ERRO MELHORADA
      const msgBackend = err.response?.data;

      if (typeof msgBackend === 'object') {
          // Se for JSON (erros de validação do Spring), mostra mensagem genérica ou o primeiro erro
          setError("Dados inválidos. Verifique os campos.");
      } else if (typeof msgBackend === 'string') {
          // Se for Texto (ex: "Email já existe"), mostra o texto
          setError(msgBackend);
      } else {
          setError("Erro de conexão ou servidor.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Classes CSS reutilizáveis
  const inputClass = "w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 text-white focus:border-purple-500 focus:outline-none transition-colors";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-slate-950 border border-slate-800 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
          <X size={24} />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-2">
            {isLogin ? 'Acessar Portal' : 'Novo Caçador'}
          </h2>
          <p className="text-slate-400 text-sm">
            {isLogin ? 'Entre para gerenciar seus bestiários.' : 'Junte-se à guilda e comece sua jornada.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-950/30 border border-red-900/50 p-3 rounded-lg flex items-center gap-3 text-red-400 text-sm">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {!isLogin && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nome Real</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-slate-500" size={18} />
                  <input 
                    name="nomeCompleto"
                    type="text" 
                    placeholder="Seu nome completo"
                    required
                    value={formData.nomeCompleto} // Adicionado value
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Vulgo (Apelido)</label>
                <div className="relative">
                  <Ghost className="absolute left-3 top-3 text-purple-500" size={18} />
                  <input 
                    name="vulgo"
                    type="text" 
                    placeholder="Como quer ser chamado?"
                    required
                    value={formData.vulgo} // Adicionado value
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-500" size={18} />
              <input 
                name="email"
                type="email" 
                placeholder="seu@email.com"
                required
                value={formData.email} // Adicionado value
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-500" size={18} />
              <input 
                name="senha"
                type="password" 
                placeholder="Mínimo 8 caracteres"
                required
                value={formData.senha} // Adicionado value
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          <button 
            disabled={loading}
            type="submit" 
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <>
                {isLogin ? 'Entrar' : 'Criar Conta'} <ChevronRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center pt-6 border-t border-slate-900">
          <p className="text-slate-400 text-sm">
            {isLogin ? 'Ainda não tem conta?' : 'Já tem uma conta?'}
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="text-purple-400 hover:text-purple-300 font-bold ml-2 hover:underline"
            >
              {isLogin ? 'Cadastre-se' : 'Faça Login'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}