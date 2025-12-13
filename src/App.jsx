import { useState, useEffect, useContext } from 'react';
import { AuthContext, AuthProvider } from './contexts/AuthContext';
import { api } from './services/api';
import { Shield, PlusCircle, LayoutDashboard, Scroll, LogOut, User, LogIn, Lock as LockIcon, Folder, FolderOpen, Globe, ChevronRight, Home, ArrowLeft } from 'lucide-react';
import CriaturaForm from './CriaturaForm';
import AuthModal from './components/AuthModal';
import { toast, Toaster } from 'sonner';

function Dashboard() {
  const { user, logout, authenticated } = useContext(AuthContext);
  
  // Abas: 'publico' | 'meu_bestiario'
  const [abaAtiva, setAbaAtiva] = useState('meu_bestiario');
  
  // Navegação: null = Raiz, ID = Dentro de uma pasta
  const [pastaAtualId, setPastaAtualId] = useState(null);
  const [caminhoPao, setCaminhoPao] = useState([{ id: null, nome: 'Raiz' }]); // Breadcrumbs
  
  const [conteudo, setConteudo] = useState({ pastas: [], criaturas: [] });
  const [loading, setLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCriarPasta, setShowCriarPasta] = useState(false); // Simples modal in-line para pasta

  // ESTADO DO FORMULÁRIO DE PASTA
  const [novaPastaNome, setNovaPastaNome] = useState('');
  const [novaPastaPublica, setNovaPastaPublica] = useState(false);

  // --- CARREGAMENTO DE DADOS ---
  const carregarDados = () => {
    setLoading(true);

    if (abaAtiva === 'publico') {
      // Carrega Feed Público (Raízes)
      api.get('/api/pastas/publicas')
        .then(res => setConteudo({ pastas: res.data, criaturas: [] }))
        .catch(err => toast.error("Erro ao carregar público"))
        .finally(() => setLoading(false));
    } else {
      // MEU BESTIÁRIO
      if (!authenticated) {
        setLoading(false); return;
      }

      if (pastaAtualId === null) {
        // Raiz do Meu Bestiário
        api.get('/api/pastas/meus-bestiarios')
          .then(res => setConteudo({ pastas: res.data, criaturas: [] })) // Na raiz não mostramos criaturas soltas por enquanto
          .catch(err => console.error(err))
          .finally(() => setLoading(false));
      } else {
        // Dentro de uma Pasta Específica
        api.get(`/api/pastas/${pastaAtualId}`)
          .then(res => {
            setConteudo({ 
              pastas: res.data.subPastas, 
              criaturas: res.data.criaturas 
            });
          })
          .catch(err => toast.error("Erro ao abrir pasta"))
          .finally(() => setLoading(false));
      }
    }
  };

  useEffect(() => {
    carregarDados();
  }, [abaAtiva, pastaAtualId, authenticated]);

  // --- AÇÕES ---

  const entrarNaPasta = (pasta) => {
    setPastaAtualId(pasta.id);
    setCaminhoPao([...caminhoPao, { id: pasta.id, nome: pasta.nome }]);
  };

  const voltarPasta = (indice) => {
    // Corta o caminho até o índice clicado
    const novoCaminho = caminhoPao.slice(0, indice + 1);
    setCaminhoPao(novoCaminho);
    setPastaAtualId(novoCaminho[novoCaminho.length - 1].id);
  };

  const criarPasta = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/pastas', {
        nome: novaPastaNome,
        publica: novaPastaPublica,
        pastaPaiId: pastaAtualId // Cria dentro da pasta atual
      });
      toast.success("Pasta criada!");
      setNovaPastaNome('');
      setShowCriarPasta(false);
      carregarDados(); // Recarrega para mostrar a nova pasta
    } catch (error) {
      toast.error("Erro ao criar pasta");
    }
  };

  // --- RENDERIZAÇÃO ---

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans">
      <Toaster richColors theme="dark" position="top-right" />
      {showLoginModal && <AuthModal aoFechar={() => setShowLoginModal(false)} />}

      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col p-6">
        <div className="text-2xl font-bold text-rose-600 mb-10 flex items-center gap-2">
          <LayoutDashboard size={28} /> DrakDex
        </div>
        
        <nav className="flex flex-col gap-2 flex-1">
          {/* ABA MEU BESTIÁRIO */}
          <button 
            onClick={() => { setAbaAtiva('meu_bestiario'); setPastaAtualId(null); setCaminhoPao([{id:null, nome:'Raiz'}]); }} 
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${abaAtiva === 'meu_bestiario' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <FolderOpen size={20} /> Meu Bestiário
          </button>
          
          {/* ABA PÚBLICO */}
          <button 
            onClick={() => { setAbaAtiva('publico'); setPastaAtualId(null); }} 
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${abaAtiva === 'publico' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Globe size={20} /> Bestiário Público
          </button>
        </nav>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* HEADER */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-950/50 backdrop-blur">
          {/* BREADCRUMBS (Navegação) */}
          <div className="flex items-center gap-2 text-sm text-slate-400">
            {abaAtiva === 'meu_bestiario' && caminhoPao.map((passo, index) => (
              <div key={passo.id || 'root'} className="flex items-center gap-2">
                {index > 0 && <ChevronRight size={14} />}
                <button 
                  onClick={() => voltarPasta(index)}
                  className={`hover:text-white ${index === caminhoPao.length - 1 ? 'text-rose-500 font-bold' : ''}`}
                >
                  {passo.nome}
                </button>
              </div>
            ))}
            {abaAtiva === 'publico' && <span className="flex items-center gap-2 text-rose-500 font-bold"><Globe size={16}/> Explorando Mundos</span>}
          </div>

          {/* PERFIL / LOGIN */}
          {authenticated ? (
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-white">{user?.vulgo}</p>
                <p className="text-xs text-slate-500">Caçador</p>
              </div>
              <div className="h-10 w-10 bg-slate-800 rounded-full flex items-center justify-center text-rose-500 border border-slate-700"><User size={20}/></div>
              <button onClick={logout} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-red-500"><LogOut size={20}/></button>
            </div>
          ) : (
            <button onClick={() => setShowLoginModal(true)} className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg font-bold text-sm"><LogIn size={16}/> Entrar</button>
          )}
        </header>

        {/* CONTEÚDO (PASTAS E CRIATURAS) */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {/* BARRA DE AÇÕES (Só no Meu Bestiário e Logado) */}
          {abaAtiva === 'meu_bestiario' && authenticated && (
            <div className="flex gap-4 mb-8">
              <button 
                onClick={() => setShowCriarPasta(!showCriarPasta)}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-700 transition-all"
              >
                <Folder size={18} className="text-yellow-500"/> Nova Pasta
              </button>
              {/* TODO: Implementar lógica de abrir modal de criatura aqui */}
              <button className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg transition-all">
                <PlusCircle size={18}/> Nova Criatura Aqui
              </button>
            </div>
          )}

          {/* FORMULÁRIO RÁPIDO DE CRIAR PASTA */}
          {showCriarPasta && (
            <form onSubmit={criarPasta} className="bg-slate-900 p-4 rounded-lg border border-slate-700 mb-8 flex gap-4 items-end animate-in fade-in slide-in-from-top-2">
              <div className="flex-1">
                <label className="text-xs text-slate-400 block mb-1">Nome da Pasta</label>
                <input 
                  value={novaPastaNome} 
                  onChange={e => setNovaPastaNome(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white" 
                  placeholder="Ex: Monstros do Pântano" 
                  required
                />
              </div>
              <div className="flex items-center gap-2 pb-2">
                <input 
                  type="checkbox" 
                  checked={novaPastaPublica}
                  onChange={e => setNovaPastaPublica(e.target.checked)}
                  id="chkPub"
                  className="accent-rose-600 h-4 w-4"
                />
                <label htmlFor="chkPub" className="text-sm cursor-pointer">Pública?</label>
              </div>
              <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">Salvar</button>
            </form>
          )}

          {loading && <p className="text-slate-500">Carregando grimórios...</p>}

          {/* GRID DE PASTAS */}
          {conteudo.pastas.length > 0 && (
            <>
              <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-4">Pastas / Tomos</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
                {conteudo.pastas.map(pasta => (
                  <div 
                    key={pasta.id} 
                    onClick={() => entrarNaPasta(pasta)}
                    className="bg-slate-900 border border-slate-800 hover:border-yellow-500/50 p-4 rounded-xl cursor-pointer transition-all hover:bg-slate-800 group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <Folder className="text-yellow-600 group-hover:text-yellow-400 transition-colors" size={32} />
                      {pasta.publica && <Globe size={14} className="text-blue-400" title="Pública"/>}
                    </div>
                    <p className="font-bold text-slate-200 truncate">{pasta.nome}</p>
                    <p className="text-xs text-slate-500">{pasta.quantidadeCriaturas} criaturas</p>
                    {pasta.donoVulgo && <p className="text-xs text-rose-500 mt-1">por {pasta.donoVulgo}</p>}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* GRID DE CRIATURAS (Conteúdo da Pasta) */}
          {conteudo.criaturas.length > 0 && (
            <>
              <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-4 border-t border-slate-800 pt-4">Criaturas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {conteudo.criaturas.map((criatura) => (
                  <div key={criatura.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-rose-600/50 transition-colors shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-rose-500">{criatura.nome}</h3>
                      <span className="bg-slate-800 text-xs font-bold px-3 py-1 rounded-full text-slate-300">Lvl {criatura.nivel}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
                      <Shield size={16} className="text-blue-400"/> {criatura.tipo}
                    </div>
                    <p className="text-slate-400 italic text-sm mb-3 bg-slate-950/50 p-2 rounded">{criatura.descricao}</p>
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800 text-xs text-slate-500">
                      <User size={14} /> <span>{criatura.criadorVulgo}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* EMPTY STATE */}
          {!loading && conteudo.pastas.length === 0 && conteudo.criaturas.length === 0 && (
            <div className="text-center text-slate-600 mt-10">
              <FolderOpen size={48} className="mx-auto mb-4 opacity-50"/>
              <p>Este bestiário está vazio.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function App() {
  return <AuthProvider><Dashboard /></AuthProvider>;
}

export default App;