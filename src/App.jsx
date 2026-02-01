import { useState, useEffect, useContext } from 'react';
import { AuthContext, AuthProvider } from './contexts/AuthContext';
import { api } from './services/api';
import { 
  PlusCircle, LayoutDashboard, LogOut, LogIn, 
  FolderOpen, Globe, ChevronRight, Backpack, Menu, X, Folder
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

// --- IMPORTAÇÃO DOS NOVOS COMPONENTES ---
import CriaturaForm from './CriaturaForm';
import ItemForm from './ItemForm'; 
import AuthModal from './components/AuthModal'; // Se já moveu para /components/modals, ajuste o import
import DeleteConfirmationModal from './components/modals/DeleteConfirmationModal';
import PastaCard from './components/cards/PastaCard';
import CriaturaCard from './components/cards/CriaturaCard';
import ItemCard from './components/cards/ItemCard';

function Dashboard() {
  const { user, logout, authenticated } = useContext(AuthContext);
  
  // --- ESTADOS GLOBAIS ---
  const [abaAtiva, setAbaAtiva] = useState('meu_bestiario');
  const [pastaAtualId, setPastaAtualId] = useState(null);
  const [caminhoPao, setCaminhoPao] = useState([{ id: null, nome: 'Raiz' }]);
  
  const [conteudo, setConteudo] = useState({ pastas: [], criaturas: [], itens: [] });
  const [loading, setLoading] = useState(false);
  
  // --- ESTADOS DE UI (Modais e Menus) ---
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);
  const [itemParaDeletar, setItemParaDeletar] = useState(null); // Para o DeleteConfirmationModal

  // --- ESTADOS DE FORMULÁRIO DE PASTA ---
  const [showCriarPasta, setShowCriarPasta] = useState(false); 
  const [novaPastaNome, setNovaPastaNome] = useState('');
  const [novaPastaPublica, setNovaPastaPublica] = useState(false);
  const [pastaEmEdicaoId, setPastaEmEdicaoId] = useState(null);

  const getCategoriaAtual = () => {
    if (abaAtiva.includes('arsenal') || abaAtiva === 'criar_item') return 'ITEM';
    return 'CRIATURA';
  };

  const carregarDados = () => {
    if (abaAtiva === 'criar_criatura' || abaAtiva === 'criar_item') return;
    
    setLoading(true);
    const categoria = getCategoriaAtual();
    const isPublico = abaAtiva.includes('publico');
    
    let url = '';
    if (pastaAtualId) {
      url = `/api/pastas/${pastaAtualId}`;
    } else {
      url = isPublico 
        ? `/api/pastas/publicas?tipo=${categoria}`
        : `/api/pastas/meus-bestiarios?tipo=${categoria}`;
    }

    if (!isPublico && !authenticated) {
      setLoading(false); return;
    }

    api.get(url)
      .then(res => {
        if (pastaAtualId) {
          setConteudo({ 
            pastas: res.data.subPastas || [], 
            criaturas: res.data.criaturas || [],
            itens: res.data.itens || [] 
          });
        } else {
          setConteudo({ pastas: res.data || [], criaturas: [], itens: [] });
        }
      })
      .catch(err => toast.error("Erro ao carregar dados."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { carregarDados(); }, [abaAtiva, pastaAtualId, authenticated]);

  // --- NAVEGAÇÃO ---
  const navegar = (novaAba) => {
    setAbaAtiva(novaAba);
    setPastaAtualId(null);
    setCaminhoPao([{ id: null, nome: 'Raiz' }]);
    setMenuMobileAberto(false);
  };

  const entrarNaPasta = (pasta) => {
    setPastaAtualId(pasta.id);
    setCaminhoPao([...caminhoPao, { id: pasta.id, nome: pasta.nome }]);
  };

  const voltarPasta = (indice) => {
    const novoCaminho = caminhoPao.slice(0, indice + 1);
    setCaminhoPao(novoCaminho);
    setPastaAtualId(novoCaminho[novoCaminho.length - 1].id);
  };

  // --- AÇÕES (CRUD) ---

  const salvarPasta = async (e) => {
    e.preventDefault();
    try {
      if (pastaEmEdicaoId) {
        await api.put(`/api/pastas/${pastaEmEdicaoId}`, { 
          nome: novaPastaNome,
          publica: novaPastaPublica 
        });
        toast.success("Pasta renomeada!");
      } else {
        await api.post('/api/pastas', { 
          nome: novaPastaNome, 
          publica: novaPastaPublica, 
          pastaPaiId: pastaAtualId,
          categoria: getCategoriaAtual()
        });
        toast.success("Pasta criada!");
      }
      resetarFormPasta();
      carregarDados();
    } catch (error) {
      const msgErro = error.response?.data?.message || error.response?.data || "Falha ao salvar pasta";
      toast.error(`Erro: ${msgErro}`);
    }
  };

  const resetarFormPasta = () => {
    setNovaPastaNome('');
    setNovaPastaPublica(false);
    setPastaEmEdicaoId(null);
    setShowCriarPasta(false);
  };

  const prepararEdicaoPasta = (e, pasta) => {
    e.stopPropagation();
    setNovaPastaNome(pasta.nome);
    setNovaPastaPublica(pasta.publica);
    setPastaEmEdicaoId(pasta.id);
    setShowCriarPasta(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const solicitarDelecao = (e, url, nome, tipo) => {
    if(e) e.stopPropagation();
    setItemParaDeletar({ url, nome, tipo });
  };

  const confirmarDelecao = async () => {
    if (!itemParaDeletar) return;
    try {
      await api.delete(itemParaDeletar.url);
      toast.success(`${itemParaDeletar.tipo} removido(a)!`);
      carregarDados();
    } catch (error) {
      const msgErro = error.response?.data?.message || "Erro ao deletar";
      toast.error(`Erro: ${msgErro}`);
    } finally {
      setItemParaDeletar(null);
    }
  };

  // --- RENDERIZAÇÃO ---
  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
      <Toaster richColors theme="dark" position="top-right" />
      
      {/* MODAIS GLOBAIS */}
      {showLoginModal && <AuthModal aoFechar={() => setShowLoginModal(false)} />}
      
      <DeleteConfirmationModal 
        item={itemParaDeletar} 
        aoConfirmar={confirmarDelecao} 
        aoCancelar={() => setItemParaDeletar(null)} 
      />

      {menuMobileAberto && (
        <div onClick={() => setMenuMobileAberto(false)} className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm animate-in fade-in" />
      )}

      {/* SIDEBAR (Ainda monolítica, próxima fase extraímos) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col p-6 transition-transform duration-300 ease-in-out ${menuMobileAberto ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:inset-auto`}>
        <div className="flex justify-between items-center mb-8">
          <div className="text-2xl font-bold text-rose-600 flex items-center gap-2"><LayoutDashboard size={28} /> DrakDex</div>
          <button onClick={() => setMenuMobileAberto(false)} className="md:hidden text-slate-400 hover:text-white"><X size={24} /></button>
        </div>
        <nav className="flex flex-col gap-2 flex-1 overflow-y-auto">
          <p className="text-xs font-bold text-slate-500 uppercase mt-2 mb-1">Bestiário</p>
          <button onClick={() => navegar('meu_bestiario')} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${abaAtiva === 'meu_bestiario' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><FolderOpen size={20} /> Meus Monstros</button>
          <button onClick={() => navegar('publico_bestiario')} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${abaAtiva === 'publico_bestiario' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><Globe size={20} /> Público</button>
          <p className="text-xs font-bold text-slate-500 uppercase mt-6 mb-1">Arsenal</p>
          <button onClick={() => authenticated ? navegar('meu_arsenal') : setShowLoginModal(true)} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${abaAtiva === 'meu_arsenal' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><Backpack size={20} /> Meus Itens</button>
          <button onClick={() => navegar('publico_arsenal')} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${abaAtiva === 'publico_arsenal' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><Globe size={20} /> Arsenal Público</button>
        </nav>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-4 md:px-8 bg-slate-950/50 backdrop-blur shrink-0">
          <div className="flex items-center gap-3 text-sm text-slate-400 overflow-hidden">
            <button onClick={() => setMenuMobileAberto(true)} className="md:hidden text-slate-200 p-1 hover:bg-slate-800 rounded"><Menu size={24} /></button>
            <div className="hidden md:block">{abaAtiva.includes('arsenal') ? <Backpack size={18} className="text-rose-500"/> : <FolderOpen size={18} className="text-rose-500"/>}</div>
            <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1 no-scrollbar mask-gradient">
              {caminhoPao.map((passo, index) => (
                <div key={passo.id || 'root'} className="flex items-center gap-2">
                  {index > 0 && <ChevronRight size={14} className="shrink-0" />}
                  <button onClick={() => voltarPasta(index)} className={`hover:text-white ${index === caminhoPao.length - 1 ? 'text-rose-500 font-bold' : ''}`}>{passo.nome}</button>
                </div>
              ))}
            </div>
          </div>
          {authenticated ? (
            <div className="flex items-center gap-4 shrink-0">
              <span className="text-sm font-bold text-white hidden md:block">{user?.vulgo}</span>
              <button onClick={logout} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-red-500"><LogOut size={20}/></button>
            </div>
          ) : (
            <button onClick={() => setShowLoginModal(true)} className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 md:px-4 rounded-lg font-bold text-sm"><LogIn size={16}/> <span className="hidden md:inline">Entrar</span></button>
          )}
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          
          {/* BARRA DE AÇÕES (Nova Pasta, Novo Item...) */}
          {authenticated && !abaAtiva.includes('publico') && !abaAtiva.includes('criar') && (
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <button onClick={() => { resetarFormPasta(); setShowCriarPasta(true); }} className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-700 transition-all w-full md:w-auto">
                <Folder size={18} className="text-yellow-500"/> {pastaEmEdicaoId ? 'Editar Pasta' : 'Nova Pasta'}
              </button>
              
              {getCategoriaAtual() === 'CRIATURA' ? (
                <button onClick={() => setAbaAtiva('criar_criatura')} className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-3 rounded-lg transition-all w-full md:w-auto">
                  <PlusCircle size={18}/> Nova Criatura
                </button>
              ) : (
                <button onClick={() => setAbaAtiva('criar_item')} className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-3 rounded-lg transition-all w-full md:w-auto">
                  <PlusCircle size={18}/> Forjar Item
                </button>
              )}
            </div>
          )}

          {/* FORMULÁRIO DE PASTA (INLINE) */}
          {showCriarPasta && (
            <form onSubmit={salvarPasta} className="bg-slate-900 p-4 rounded-lg border border-slate-700 mb-8 flex flex-col md:flex-row gap-4 items-end animate-in fade-in">
              <div className="flex-1 w-full">
                <label className="text-xs text-slate-400 block mb-1">{pastaEmEdicaoId ? 'Renomear Pasta' : `Nova Pasta (${getCategoriaAtual()})`}</label>
                <input value={novaPastaNome} onChange={e => setNovaPastaNome(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-rose-500 outline-none" required autoFocus />
              </div>
              {!pastaEmEdicaoId && (
                <div className="flex items-center gap-2 pb-3">
                  <input type="checkbox" checked={novaPastaPublica} onChange={e => setNovaPastaPublica(e.target.checked)} className="accent-rose-600 h-4 w-4" />
                  <label className="text-sm">Pública?</label>
                </div>
              )}
              <div className="flex gap-2 w-full md:w-auto">
                <button type="button" onClick={resetarFormPasta} className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded transition-colors">Cancelar</button>
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors flex-1 md:flex-none">Salvar</button>
              </div>
            </form>
          )}

          {/* --- AQUI COMEÇA A MÁGICA DA LIMPEZA --- */}

          {/* LISTA DE PASTAS */}
          {!abaAtiva.includes('criar') && conteudo.pastas.length > 0 && (
            <>
              <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-4">Pastas</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
                {conteudo.pastas.map(pasta => (
                  <PastaCard 
                    key={pasta.id} 
                    pasta={pasta} 
                    aoEntrar={entrarNaPasta}
                    aoEditar={prepararEdicaoPasta}
                    aoDeletar={solicitarDelecao}
                    podeEditar={authenticated && !abaAtiva.includes('publico')}
                    categoria={getCategoriaAtual()}
                  />
                ))}
              </div>
            </>
          )}

          {/* LISTA DE CRIATURAS */}
          {!abaAtiva.includes('criar') && getCategoriaAtual() === 'CRIATURA' && conteudo.criaturas.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {conteudo.criaturas.map((criatura) => (
                <CriaturaCard 
                  key={criatura.id}
                  criatura={criatura}
                  aoDeletar={solicitarDelecao}
                  podeDeletar={authenticated && !abaAtiva.includes('publico')}
                />
              ))}
            </div>
          )}

          {/* LISTA DE ITENS */}
          {!abaAtiva.includes('criar') && getCategoriaAtual() === 'ITEM' && conteudo.itens.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {conteudo.itens.map((item) => (
                <ItemCard 
                  key={item.id}
                  item={item}
                  aoDeletar={solicitarDelecao}
                  podeDeletar={authenticated && !abaAtiva.includes('publico')}
                />
              ))}
            </div>
          )}

          {/* EMPTY STATES E FORMULÁRIOS DE CRIAÇÃO (MANTIDOS) */}
          {!loading && !abaAtiva.includes('criar') && conteudo.pastas.length === 0 && conteudo.criaturas.length === 0 && conteudo.itens.length === 0 && (
            <div className="text-center text-slate-600 mt-20"><FolderOpen size={64} className="mx-auto mb-4 opacity-20"/><p>Nenhum registro encontrado neste tomo.</p></div>
          )}

          {abaAtiva === 'criar_criatura' && (<div className="max-w-2xl mx-auto"><button onClick={() => setAbaAtiva('meu_bestiario')} className="mb-4 text-slate-400 hover:text-white flex items-center gap-2">← Voltar</button><CriaturaForm pastaId={pastaAtualId} aoCriar={(nova) => { setAbaAtiva('meu_bestiario'); carregarDados(); }} /></div>)}
          {abaAtiva === 'criar_item' && (<div className="max-w-2xl mx-auto"><button onClick={() => setAbaAtiva('meu_arsenal')} className="mb-4 text-slate-400 hover:text-white flex items-center gap-2">← Voltar ao Arsenal</button><ItemForm pastaId={pastaAtualId} aoCriar={(novo) => { setAbaAtiva('meu_arsenal'); carregarDados(); }} /></div>)}
        </div>
      </main>
    </div>
  );
}
function App() { return <AuthProvider><Dashboard /></AuthProvider>; }
export default App;