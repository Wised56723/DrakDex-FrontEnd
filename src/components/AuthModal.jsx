import { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { X, User, Lock, Mail, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AuthModal({ onClose }) {
  const { login, register } = useContext(AuthContext);
  
  const [isLogin, setIsLogin] = useState(true); // Alternar entre Login e Cadastro
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Estados do formulário
  const [formData, setFormData] = useState({
    nome: '',
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
        // LOGIN
        await login(formData.email, formData.senha);
        toast.success(`Bem-vindo de volta!`);
        onClose(); // Fecha o modal
      } else {
        // CADASTRO
        await register(formData);
        toast.success("Conta criada! Faça login agora.");
        setIsLogin(true); // Muda para a tela de login
        setFormData({ ...formData, senha: '' }); // Limpa a senha por segurança
      }
    } catch (err) {
      console.error(err);
      setError("Falha na autenticação. Verifique seus dados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-slate-950 border border-slate-800 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
        
        {/* Botão Fechar */}
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
          <X size={24} />
        </button>

        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-2">
            {isLogin ? 'Acessar Portal' : 'Novo Caçador'}
          </h2>
          <p className="text-slate-400 text-sm">
            {isLogin ? 'Entre para gerenciar seus bestiários.' : 'Junte-se à guilda e comece sua jornada.'}
          </p>
        </div>

        {/* Erro */}
        {error && (
          <div className="mb-6 bg-red-950/30 border border-red-900/50 p-3 rounded-lg flex items-center gap-3 text-red-400 text-sm">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Campos extras para Cadastro */}
          {!isLogin && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nome Real</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-slate-500" size={18} />
                  <input 
                    name="nome"
                    type="text" 
                    placeholder="Seu nome completo"
                    required
                    value={formData.nome}
                    onChange={handleChange}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 text-white focus:border-purple-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Vulgo (Apelido)</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-purple-500" size={18} />
                  <input 
                    name="vulgo"
                    type="text" 
                    placeholder="Como quer ser chamado?"
                    required
                    value={formData.vulgo}
                    onChange={handleChange}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 text-white focus:border-purple-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-500" size={18} />
              <input 
                name="email"
                type="email" 
                placeholder="seu@email.com"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 text-white focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Senha */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-500" size={18} />
              <input 
                name="senha"
                type="password" 
                placeholder="••••••••"
                required
                value={formData.senha}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 text-white focus:border-purple-500 focus:outline-none transition-colors"
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

        {/* Rodapé Alternar */}
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