import { useState, useEffect, useContext } from 'react';
import { AuthContext, AuthProvider } from './contexts/AuthContext';
import { api } from './services/api';
import { Shield, PlusCircle, List, LayoutDashboard, Scroll, LogOut, User, LogIn, Lock as LockIcon } from 'lucide-react';
import CriaturaForm from './CriaturaForm';
import AuthModal from './components/AuthModal';

function Dashboard() {
  const { user, logout, authenticated } = useContext(AuthContext);
  
  const [abaAtiva, setAbaAtiva] = useState('lista');
  const [criaturas, setCriaturas] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Novo estado: Controla se a janelinha de login está aberta ou não
  const [showLoginModal, setShowLoginModal] = useState(false);

  const carregarBestiario = () => {
    setLoading(true);
    // Removemos o "if (!authenticated) return;" -> Agora todos podem ver!
    api.get('/api/criaturas?page=0&size=50&sort=id,desc')
      .then(res => {
        setCriaturas(res.data.content || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  // Carrega as criaturas assim que abre o site, logado ou não
  useEffect(() => {
    carregarBestiario();
  }, []);

  // Se o usuário logar, fechamos a modal automaticamente
  useEffect(() => {
    if (authenticated) {
      setShowLoginModal(false);
    }
  }, [authenticated]);

  // Lógica inteligente do botão "Nova Criatura"
  const handleNovaCriaturaClick = () => {
    if (authenticated) {
      setAbaAtiva('criar'); // Se logado, vai para o formulário
    } else {
      setShowLoginModal(true); // Se não, pede login
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans">
      
      {/* Modal só aparece se o estado for true */}
      {showLoginModal && <AuthModal aoFechar={() => setShowLoginModal(false)} />}

      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col p-6">
        <div className="text-2xl font-bold text-rose-600 mb-10 flex items-center gap-2">
          <LayoutDashboard size={28} /> DrakDex
        </div>
        <nav className="flex flex-col gap-2 flex-1">
          <button 
            onClick={() => setAbaAtiva('lista')} 
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${abaAtiva === 'lista' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <List size={20} /> Bestiário
          </button>
          
          <button 
            onClick={handleNovaCriaturaClick} 
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${abaAtiva === 'criar' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            {/* Adicionamos um cadeado visual se não estiver logado */}
            {authenticated ? <PlusCircle size={20} /> : <LockIcon size={16} className="text-slate-500"/>} 
            Nova Criatura
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* HEADER: Mostra Perfil OU Botão de Login */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-end px-8 bg-slate-950/50 backdrop-blur">
          {authenticated ? (
            <div className="flex items-center gap-4 animate-in fade-in">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-white">{user?.vulgo}</p>
                <p className="text-xs text-slate-500">Caçador</p>
              </div>
              <div className="h-10 w-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 text-rose-500">
                <User size={20} />
              </div>
              <button onClick={logout} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-red-500 transition-colors" title="Sair">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowLoginModal(true)}
              className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
            >
              <LogIn size={18} /> Entrar / Cadastrar
            </button>
          )}
        </header>

        <div className="flex-1 overflow-y-auto p-8 relative">
          
          {loading && <p className="text-center text-slate-500">Buscando pergaminhos...</p>}

          {abaAtiva === 'lista' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {criaturas.map((criatura) => (
                <div key={criatura.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-rose-600/50 transition-colors shadow-lg">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-rose-500">{criatura.nome}</h3>
                    <span className="bg-slate-800 text-xs font-bold px-3 py-1 rounded-full text-slate-300">Lvl {criatura.nivel}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
                    <Shield size={16} className="text-blue-400"/> {criatura.tipo}
                  </div>
                  <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
                    <p className="text-slate-400 italic text-sm flex gap-2"><Scroll size={16} className="shrink-0 mt-1 text-slate-600"/>{criatura.descricao}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Só mostra o form se estiver logado. Se o user for esperto e mudar o estado manualmente, o form aparece, mas o backend bloqueia o POST */}
          {abaAtiva === 'criar' && authenticated && (
            <div className="max-w-2xl mx-auto">
              <CriaturaForm aoCriar={(nova) => { setCriaturas([nova, ...criaturas]); setAbaAtiva('lista'); }} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  );
}

export default App;