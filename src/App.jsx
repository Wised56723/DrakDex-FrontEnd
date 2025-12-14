import { useState, useEffect, useContext } from 'react';
import { AuthContext, AuthProvider } from './contexts/AuthContext';
import { api } from './services/api';
// REMOVIDO QUALQUER VESTÍGIO DE 'Lock'
import { Shield, PlusCircle, LayoutDashboard, Scroll, LogOut, User, LogIn, Folder, FolderOpen, Globe, ChevronRight, Backpack, Sword, Hammer, Gem, FlaskConical, Feather } from 'lucide-react';
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
  
  const [conteudo, setConteudo] = useState({ pastas: [], criaturas: [] });
  const [itens, setItens] = useState([]); 
  
  const [loading, setLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCriarPasta, setShowCriarPasta] = useState(false); 
  const [novaPastaNome, setNovaPastaNome] = useState('');
  const [novaPastaPublica, setNovaPastaPublica] = useState(false);

  const carregarDados = () => {
    if (abaAtiva === 'criar_criatura' || abaAtiva === 'criar_item') return;
    setLoading(true);

    if (abaAtiva === 'arsenal') {
      if (!authenticated) { setLoading(false); return; }
      api.get('/api/itens')
        .then(res => setItens(res.data))
        .catch(err => toast.error("Erro ao abrir o arsenal"))
        .finally(() => setLoading(false));

    } else if (abaAtiva === 'publico') {
      api.get('/api/pastas/publicas')
        .then(res => setConteudo({ pastas: res.data, criaturas: [] }))
        .catch(err => toast.error("Erro ao carregar público"))
        .finally(() => setLoading(false));

    } else {
      if (!authenticated) { setLoading(false); return; }
      const url = pastaAtualId ? `/api/pastas/${pastaAtualId}` : '/api/pastas/meus-bestiarios';
      api.get(url)
        .then(res => {
          if (pastaAtualId) setConteudo({ pastas: res.data.subPastas, criaturas: res.data.criaturas });
          else setConteudo({ pastas: res.data, criaturas: [] });
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => { carregarDados(); }, [abaAtiva, pastaAtualId, authenticated]);

  const entrarNaPasta = (pasta) => {
    setPastaAtualId(pasta.id);
    setCaminhoPao([...caminhoPao, { id: pasta.id, nome: pasta.nome }]);
    setAbaAtiva('meu_bestiario');
  };

  const voltarPasta = (indice) => {
    const novoCaminho = caminhoPao.slice(0, indice + 1);
    setCaminhoPao(novoCaminho);
    setPastaAtualId(novoCaminho[novoCaminho.length - 1].id);
    setAbaAtiva('meu_bestiario');
  };

  const criarPasta = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/pastas', { nome: novaPastaNome, publica: novaPastaPublica, pastaPaiId: pastaAtualId });
      toast.success("Pasta criada!");
      setNovaPastaNome('');
      setShowCriarPasta(false);
      carregarDados();
    } catch (error) {
      toast.error("Erro ao criar pasta");
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans">
      <Toaster richColors theme="dark" position="top-right" />
      {showLoginModal && <AuthModal aoFechar={() => setShowLoginModal(false)} />}

      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col p-6">
        <div className="text-2xl font-bold text-rose-600 mb-10 flex items-center gap-2">
          <LayoutDashboard size={28} /> DrakDex
        </div>
        <nav className="flex flex-col gap-2 flex-1">
          <button onClick={() => { setAbaAtiva('meu_bestiario'); setPastaAtualId(null); setCaminhoPao([{id:null, nome:'Raiz'}]); }} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${abaAtiva === 'meu_bestiario' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
            <FolderOpen size={20} /> Meu Bestiário
          </button>
          <button onClick={() => { setAbaAtiva('publico'); setPastaAtualId(null); }} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${abaAtiva === 'publico' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
            <Globe size={20} /> Bestiário Público
          </button>
          <button onClick={() => authenticated ? setAbaAtiva('arsenal') : setShowLoginModal(true)} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${abaAtiva === 'arsenal' || abaAtiva === 'criar_item' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
            <Backpack size={20} /> Arsenal & Itens
          </button>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-950/50 backdrop-blur">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            {abaAtiva === 'meu_bestiario' && caminhoPao.map((passo, index) => (
              <div key={passo.id || 'root'} className="flex items-center gap-2">
                {index > 0 && <ChevronRight size={14} />}
                <button onClick={() => voltarPasta(index)} className={`hover:text-white ${index === caminhoPao.length - 1 ? 'text-rose-500 font-bold' : ''}`}>{passo.nome}</button>
              </div>
            ))}
            {abaAtiva === 'arsenal' && <span className="flex items-center gap-2 text-rose-500 font-bold"><Backpack size={16}/> Seu Arsenal</span>}
            {abaAtiva === 'publico' && <span className="flex items-center gap-2 text-rose-500 font-bold"><Globe size={16}/> Explorando Mundos</span>}
          </div>

          {authenticated ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-white hidden md:block">{user?.vulgo}</span>
              <button onClick={logout} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-red-500"><LogOut size={20}/></button>
            </div>
          ) : (
            <button onClick={() => setShowLoginModal(true)} className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg font-bold text-sm"><LogIn size={16}/> Entrar</button>
          )}
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {abaAtiva === 'meu_bestiario' && authenticated && (
            <>
              <div className="flex gap-4 mb-8">
                <button onClick={() => setShowCriarPasta(!showCriarPasta)} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-700 transition-all"><Folder size={18} className="text-yellow-500"/> Nova Pasta</button>
                <button onClick={() => setAbaAtiva('criar_criatura')} className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg transition-all"><PlusCircle size={18}/> Nova Criatura</button>
              </div>

              {showCriarPasta && (
                <form onSubmit={criarPasta} className="bg-slate-900 p-4 rounded-lg border border-slate-700 mb-8 flex gap-4 items-end animate-in fade-in">
                  <div className="flex-1"><label className="text-xs text-slate-400 block mb-1">Nome</label><input value={novaPastaNome} onChange={e => setNovaPastaNome(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white" required /></div>
                  <div className="flex items-center gap-2 pb-2"><input type="checkbox" checked={novaPastaPublica} onChange={e => setNovaPastaPublica(e.target.checked)} className="accent-rose-600 h-4 w-4" /><label className="text-sm">Pública?</label></div>
                  <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Salvar</button>
                </form>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
                {conteudo.pastas.map(pasta => (
                  <div key={pasta.id} onClick={() => entrarNaPasta(pasta)} className="bg-slate-900 border border-slate-800 hover:border-yellow-500/50 p-4 rounded-xl cursor-pointer hover:bg-slate-800 group">
                    <div className="flex justify-between mb-2"><Folder className="text-yellow-600 group-hover:text-yellow-400" size={32} /></div>
                    <p className="font-bold text-slate-200 truncate">{pasta.nome}</p>
                    <p className="text-xs text-slate-500">{pasta.quantidadeCriaturas} monstros</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {conteudo.criaturas.map((criatura) => (
                  <div key={criatura.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
                    <h3 className="text-xl font-bold text-rose-500 mb-2">{criatura.nome}</h3>
                    <p className="text-slate-400 italic text-sm bg-slate-950/50 p-2 rounded">{criatura.descricao}</p>
                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800 text-xs text-slate-500">
                      <User size={14} />
                      <span>Invocado por: <strong className="text-slate-400">{criatura.criadorVulgo || "Desconhecido"}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {abaAtiva === 'arsenal' && authenticated && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex gap-2 items-center"><Backpack className="text-rose-500"/> Inventário</h2>
                <button onClick={() => setAbaAtiva('criar_item')} className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg transition-all"><PlusCircle size={18}/> Forjar Item</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {itens.map((item) => {
                  const corRaridade = CORES_RARIDADE[item.raridade] || "border-slate-700";
                  return (
                    <div key={item.id} className={`bg-slate-900 border-l-4 ${corRaridade} border-y border-r border-slate-800 rounded-r-xl p-5 hover:bg-slate-800 transition-all shadow-lg group`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className={`p-2 rounded-lg bg-slate-950 ${corRaridade.split(" ")[1]}`}>{ICONES_TIPO[item.tipo] || <Feather size={18}/>}</div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-slate-950 ${corRaridade.split(" ")[1]}`}>{item.raridade}</span>
                      </div>
                      <h3 className={`text-lg font-bold mb-1 ${corRaridade.split(" ")[1]}`}>{item.nome}</h3>
                      <p className="text-xs text-slate-500 uppercase mb-3 font-bold flex gap-2">{item.tipo} {item.peso && `• ${item.peso}kg`} {item.preco && `• ${item.preco}`}</p>
                      {(item.dano || item.defesa) && (<div className="flex gap-2 mb-3">{item.dano && <span className="text-xs bg-red-900/30 text-red-400 px-2 py-1 rounded border border-red-900/50 font-bold">⚔️ {item.dano}</span>}{item.defesa && <span className="text-xs bg-blue-900/30 text-blue-400 px-2 py-1 rounded border border-blue-900/50 font-bold">🛡️ {item.defesa}</span>}</div>)}
                      <p className="text-sm text-slate-400 italic line-clamp-2">{item.descricao}</p>
                    </div>
                  );
                })}
              </div>
              {!loading && itens.length === 0 && <div className="text-center text-slate-600 mt-20"><Backpack size={64} className="mx-auto mb-4 opacity-20"/><p>Seu arsenal está vazio.</p></div>}
            </>
          )}

          {abaAtiva === 'criar_criatura' && <div className="max-w-2xl mx-auto"><button onClick={() => setAbaAtiva('meu_bestiario')} className="mb-4 text-slate-400 hover:text-white flex items-center gap-2">← Voltar</button><CriaturaForm pastaId={pastaAtualId} aoCriar={(nova) => { setAbaAtiva('meu_bestiario'); carregarDados(); }} /></div>}
          {abaAtiva === 'criar_item' && <div className="max-w-2xl mx-auto"><button onClick={() => setAbaAtiva('arsenal')} className="mb-4 text-slate-400 hover:text-white flex items-center gap-2">← Voltar ao Arsenal</button><ItemForm aoCriar={(novo) => { setAbaAtiva('arsenal'); setItens([novo, ...itens]); }} /></div>}
        </div>
      </main>
    </div>
  );
}

function App() { return <AuthProvider><Dashboard /></AuthProvider>; }
export default App;