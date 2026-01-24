import { useState, useEffect, useContext } from 'react';
import { AuthContext, AuthProvider } from './contexts/AuthContext';
import { api } from './services/api';
import { 
  Shield, PlusCircle, LayoutDashboard, Scroll, LogOut, User, LogIn, 
  Folder, FolderOpen, Globe, ChevronRight, Backpack, Sword, Hammer, 
  Gem, FlaskConical, Feather, Menu, X, Pencil, Trash2 // <--- NOVOS ÍCONES
} from 'lucide-react';
import CriaturaForm from './CriaturaForm';
import ItemForm from './ItemForm'; 
import AuthModal from './components/AuthModal';
import { toast, Toaster } from 'sonner';

// --- CONFIGURAÇÃO VISUAL ---
const CORES_RARIDADE = {
  COMUM: "border-slate-600 text-slate-400",
  INCOMUM: "border-green-600 text-green-400",
  RARO: "border-blue-500 text-blue-400",
  EPICO: "border-purple-500 text-purple-400",
  LENDARIO: "border-orange-500 text-orange-400",
  ARTEFATO: "border-red-600 text-red-500"
};

const ICONES_TIPO = {
  ARMA: <Sword size={18} />,
  ARMADURA: <Shield size={18} />,
  ACESSORIO: <Gem size={18} />,
  CONSUMIVEL: <FlaskConical size={18} />,
  FERRAMENTA: <Hammer size={18} />,
  TESOURO: <Gem size={18} className="text-yellow-400"/>,
  OUTRO: <Feather size={18} />
};

function Dashboard() {
  const { user, logout, authenticated } = useContext(AuthContext);
  
  const [abaAtiva, setAbaAtiva] = useState('meu_bestiario');
  const [pastaAtualId, setPastaAtualId] = useState(null);
  const [caminhoPao, setCaminhoPao] = useState([{ id: null, nome: 'Raiz' }]);
  
  const [conteudo, setConteudo] = useState({ pastas: [], criaturas: [], itens: [] });
  const [loading, setLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // ESTADOS DE CRIAÇÃO/EDIÇÃO DE PASTA
  const [showCriarPasta, setShowCriarPasta] = useState(false); 
  const [novaPastaNome, setNovaPastaNome] = useState('');
  const [novaPastaPublica, setNovaPastaPublica] = useState(false);
  const [pastaEmEdicaoId, setPastaEmEdicaoId] = useState(null); // <--- ID da pasta que estamos renomeando

  const [menuMobileAberto, setMenuMobileAberto] = useState(false);

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

  // --- FUNÇÕES CRUD (CRIAR, EDITAR, DELETAR) ---

  const salvarPasta = async (e) => {
    e.preventDefault();
    try {
      if (pastaEmEdicaoId) {
        // MODO EDIÇÃO (Renomear)
        await api.put(`/api/pastas/${pastaEmEdicaoId}`, { nome: novaPastaNome });
        toast.success("Pasta renomeada!");
      } else {
        // MODO CRIAÇÃO
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
      toast.error("Erro: " + (error.response?.data?.message || "Falha ao salvar pasta"));
    }
  };

  const resetarFormPasta = () => {
    setNovaPastaNome('');
    setNovaPastaPublica(false);
    setPastaEmEdicaoId(null);
    setShowCriarPasta(false);
  };

  const prepararEdicaoPasta = (e, pasta) => {
    e.stopPropagation(); // Impede de entrar na pasta ao clicar no lápis
    setNovaPastaNome(pasta.nome);
    setNovaPastaPublica(pasta.publica);
    setPastaEmEdicaoId(pasta.id);
    setShowCriarPasta(true);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Sobe a tela para ver o form
  };

  const deletarGenerico = async (url, tipoItem) => {
    if (window.confirm(`Tem certeza que deseja apagar ${tipoItem}? Essa ação não pode ser desfeita.`)) {
      try {
        await api.delete(url);
        toast.success(`${tipoItem} removido(a)!`);
        carregarDados();
      } catch (error) {
        toast.error("Erro ao deletar: " + (error.response?.data?.message || "Erro desconhecido"));
      }
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
      <Toaster richColors theme="dark" position="top-right" />
      {showLoginModal && <AuthModal aoFechar={() => setShowLoginModal(false)} />}

      {menuMobileAberto && (
        <div onClick={() => setMenuMobileAberto(false)} className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm animate-in fade-in" />
      )}

      {/* SIDEBAR */}
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

      {/* MAIN */}
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
          
          {authenticated && !abaAtiva.includes('publico') && !abaAtiva.includes('criar') && (
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <button onClick={() => setShowCriarPasta(true)} className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-700 transition-all w-full md:w-auto">
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

          {/* FORMULÁRIO DE PASTA (CRIAR E EDITAR) */}
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

          {/* LISTA DE PASTAS */}
          {!abaAtiva.includes('criar') && conteudo.pastas.length > 0 && (
            <>
              <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-4">Pastas</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
                {conteudo.pastas.map(pasta => (
                  <div key={pasta.id} onClick={() => entrarNaPasta(pasta)} className="bg-slate-900 border border-slate-800 hover:border-yellow-500/50 p-4 rounded-xl cursor-pointer hover:bg-slate-800 group relative">
                    {/* BOTÕES DE AÇÃO (SÓ APARECEM SE FOR O DONO) */}
                    {authenticated && !abaAtiva.includes('publico') && (
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => preparerEdicaoPasta(e, pasta)} className="p-1.5 bg-slate-800 rounded-full hover:bg-blue-600 hover:text-white text-slate-400" title="Renomear"><Pencil size={12}/></button>
                        <button onClick={(e) => { e.stopPropagation(); deletarGenerico(`/api/pastas/${pasta.id}`, 'esta Pasta'); }} className="p-1.5 bg-slate-800 rounded-full hover:bg-red-600 hover:text-white text-slate-400" title="Apagar"><Trash2 size={12}/></button>
                      </div>
                    )}
                    <div className="flex justify-between mb-2">
                      <Folder className="text-yellow-600 group-hover:text-yellow-400" size={32} />
                      {pasta.publica && <Globe size={14} className="text-blue-400"/>}
                    </div>
                    <p className="font-bold text-slate-200 truncate">{pasta.nome}</p>
                    <p className="text-xs text-slate-500">{getCategoriaAtual() === 'CRIATURA' ? `${pasta.quantidadeCriaturas} monstros` : 'Abrir arsenal'}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* CARDS DE CRIATURAS */}
          {!abaAtiva.includes('criar') && getCategoriaAtual() === 'CRIATURA' && conteudo.criaturas.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {conteudo.criaturas.map((criatura) => (
                <div key={criatura.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg hover:border-rose-600/30 transition-all group relative">
                  {authenticated && !abaAtiva.includes('publico') && (
                    <div className="absolute top-2 left-2 z-10 flex gap-2">
                      <button onClick={() => deletarGenerico(`/api/criaturas/${criatura.id}`, 'esta Criatura')} className="p-2 bg-black/50 backdrop-blur rounded-full text-white hover:bg-red-600 transition-colors"><Trash2 size={16}/></button>
                    </div>
                  )}
                  <div className="h-48 w-full bg-slate-950 relative overflow-hidden">
                    {criatura.imagemUrl ? (
                      <img src={criatura.imagemUrl} alt={criatura.nome} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.parentNode.classList.add('flex', 'items-center', 'justify-center'); e.target.parentNode.innerHTML = '<span class="text-slate-700 opacity-20"><svg...></svg></span>'; }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-950 text-slate-700"><Shield size={64} opacity={0.2} /></div>
                    )}
                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full border border-rose-500/50 shadow-sm">Lvl {criatura.nivel}</div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-rose-500 transition-colors">{criatura.nome}</h3>
                    <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-3"><Shield size={12}/> {criatura.tipo}</div>
                    <p className="text-slate-400 text-sm line-clamp-3 mb-4 h-16">{criatura.descricao || "Sem descrição."}</p>
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-800 text-xs text-slate-500"><User size={14} /> <span>Invocado por: <span className="text-slate-300">{criatura.criadorVulgo}</span></span></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CARDS DE ITENS */}
          {!abaAtiva.includes('criar') && getCategoriaAtual() === 'ITEM' && conteudo.itens.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {conteudo.itens.map((item) => {
                const corRaridadeClasses = CORES_RARIDADE[item.raridade] || "border-slate-600 text-slate-400";
                const corTexto = corRaridadeClasses.split(" ").find(c => c.startsWith("text-")) || "text-slate-400";
                const corBorda = corRaridadeClasses.split(" ").find(c => c.startsWith("border-")) || "border-slate-700";
                return (
                  <div key={item.id} className={`bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg hover:border-slate-600 transition-all group flex flex-col relative`}>
                    {authenticated && !abaAtiva.includes('publico') && (
                      <div className="absolute top-2 right-2 z-10 flex gap-2">
                        <button onClick={() => deletarGenerico(`/api/itens/${item.id}`, 'este Item')} className="p-2 bg-black/50 backdrop-blur rounded-full text-white hover:bg-red-600 transition-colors"><Trash2 size={16}/></button>
                      </div>
                    )}
                    <div className="h-40 w-full bg-slate-950 relative overflow-hidden border-b border-slate-800">
                      {item.imagemUrl ? (
                        <img src={item.imagemUrl} alt={item.nome} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.parentNode.classList.add('flex', 'items-center', 'justify-center'); }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-950 text-slate-700"><Backpack size={48} opacity={0.2} /></div>
                      )}
                      <div className="absolute top-2 left-2 bg-black/70 backdrop-blur text-white p-1.5 rounded-lg border border-slate-700 shadow-sm">{ICONES_TIPO[item.tipo] || <Feather size={16}/>}</div>
                    </div>
                    <div className={`p-4 flex-1 flex flex-col border-l-4 ${corBorda}`}>
                      <div className="flex justify-between items-start mb-1">
                         <span className={`text-[10px] font-bold uppercase tracking-wider ${corTexto}`}>{item.raridade}</span>
                         {item.preco && <span className="text-[10px] text-yellow-500 font-mono bg-yellow-900/20 px-1 rounded">💰 {item.preco}</span>}
                      </div>
                      <h3 className={`text-lg font-bold mb-2 ${corTexto} line-clamp-1`}>{item.nome}</h3>
                      {(item.dano || item.defesa || item.peso) && (<div className="flex gap-2 mb-3 text-xs">{item.dano && <span className="bg-red-950/50 text-red-400 px-2 py-1 rounded border border-red-900/30 font-bold">⚔️ {item.dano}</span>}{item.defesa && <span className="bg-blue-950/50 text-blue-400 px-2 py-1 rounded border border-blue-900/30 font-bold">🛡️ {item.defesa}</span>}{item.peso && <span className="text-slate-500 py-1 ml-auto">{item.peso}kg</span>}</div>)}
                      <p className="text-slate-400 text-sm italic line-clamp-2 mb-3 flex-1">{item.descricao}</p>
                      <p className="text-[10px] text-slate-600 pt-2 border-t border-slate-800/50 flex items-center gap-1"><User size={10}/> Forjado por {item.donoVulgo}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* EMPTY STATES */}
          {!loading && !abaAtiva.includes('criar') && conteudo.pastas.length === 0 && conteudo.criaturas.length === 0 && conteudo.itens.length === 0 && (
            <div className="text-center text-slate-600 mt-20"><FolderOpen size={64} className="mx-auto mb-4 opacity-20"/><p>Nenhum registro encontrado neste tomo.</p></div>
          )}

          {/* FORMS DE CRIAÇÃO (MANTIDOS IGUAIS) */}
          {abaAtiva === 'criar_criatura' && (<div className="max-w-2xl mx-auto"><button onClick={() => setAbaAtiva('meu_bestiario')} className="mb-4 text-slate-400 hover:text-white flex items-center gap-2">← Voltar</button><CriaturaForm pastaId={pastaAtualId} aoCriar={(nova) => { setAbaAtiva('meu_bestiario'); carregarDados(); }} /></div>)}
          {abaAtiva === 'criar_item' && (<div className="max-w-2xl mx-auto"><button onClick={() => setAbaAtiva('meu_arsenal')} className="mb-4 text-slate-400 hover:text-white flex items-center gap-2">← Voltar ao Arsenal</button><ItemForm pastaId={pastaAtualId} aoCriar={(novo) => { setAbaAtiva('meu_arsenal'); carregarDados(); }} /></div>)}
        </div>
      </main>
    </div>
  );
}
function App() { return <AuthProvider><Dashboard /></AuthProvider>; }
export default App;