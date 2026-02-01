import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext'; // Ajustado ../
import { api } from '../services/api'; // Ajustado ../
import { FolderOpen, Folder, PlusCircle } from 'lucide-react';
import { toast, Toaster } from 'sonner';

// --- COMPONENTES (Caminhos ajustados com ../) ---
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import CriaturaForm from '../components/forms/CriaturaForm';
import ItemForm from '../components/forms/ItemForm'; 
import PastaForm from '../components/forms/PastaForm'; 

import AuthModal from '../components/AuthModal'; // Ajuste se moveu para components/modals ou mantenha se estiver solto
import DeleteConfirmationModal from '../components/modals/DeleteConfirmationModal';
import PastaCard from '../components/cards/PastaCard';
import CriaturaCard from '../components/cards/CriaturaCard';
import ItemCard from '../components/cards/ItemCard';

export default function Dashboard() {
  const { user, logout, authenticated } = useContext(AuthContext);
  
  // --- ESTADOS GLOBAIS ---
  const [abaAtiva, setAbaAtiva] = useState('meu_bestiario');
  const [pastaAtualId, setPastaAtualId] = useState(null);
  const [caminhoPao, setCaminhoPao] = useState([{ id: null, nome: 'Raiz' }]);
  const [conteudo, setConteudo] = useState({ pastas: [], criaturas: [], itens: [] });
  const [loading, setLoading] = useState(false);
  
  // --- ESTADOS UI ---
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);
  const [itemParaDeletar, setItemParaDeletar] = useState(null);

  // --- ESTADOS FORM PASTA ---
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

  const navegar = (novaAba) => {
    setAbaAtiva(novaAba);
    setPastaAtualId(null);
    setCaminhoPao([{ id: null, nome: 'Raiz' }]);
    setMenuMobileAberto(false);
  };

  const voltarPasta = (indice) => {
    const novoCaminho = caminhoPao.slice(0, indice + 1);
    setCaminhoPao(novoCaminho);
    setPastaAtualId(novoCaminho[novoCaminho.length - 1].id);
  };

  const entrarNaPasta = (pasta) => {
    setPastaAtualId(pasta.id);
    setCaminhoPao([...caminhoPao, { id: pasta.id, nome: pasta.nome }]);
  };

  const salvarPasta = async (e) => {
    e.preventDefault();
    try {
      if (pastaEmEdicaoId) {
        await api.put(`/api/pastas/${pastaEmEdicaoId}`, { nome: novaPastaNome, publica: novaPastaPublica });
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
      const msgErro = error.response?.data?.message || "Falha ao salvar pasta";
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
      toast.error("Erro ao deletar.");
    } finally {
      setItemParaDeletar(null);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
      <Toaster richColors theme="dark" position="top-right" />
      {showLoginModal && <AuthModal aoFechar={() => setShowLoginModal(false)} />}
      
      <DeleteConfirmationModal 
        item={itemParaDeletar} 
        aoConfirmar={confirmarDelecao} 
        aoCancelar={() => setItemParaDeletar(null)} 
      />

      {menuMobileAberto && (
        <div onClick={() => setMenuMobileAberto(false)} className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm animate-in fade-in" />
      )}

      <Sidebar 
        abaAtiva={abaAtiva}
        navegar={navegar}
        menuAberto={menuMobileAberto}
        fecharMenu={() => setMenuMobileAberto(false)}
        authenticated={authenticated}
        abrirLogin={() => setShowLoginModal(true)}
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Header 
          abaAtiva={abaAtiva}
          caminhoPao={caminhoPao}
          voltarPasta={voltarPasta}
          abrirMenu={() => setMenuMobileAberto(true)}
          authenticated={authenticated}
          user={user}
          logout={logout}
          abrirLogin={() => setShowLoginModal(true)}
        />

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          
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

          {showCriarPasta && (
            <PastaForm 
              nome={novaPastaNome}
              setNome={setNovaPastaNome}
              publica={novaPastaPublica}
              setPublica={setNovaPastaPublica}
              isEdicao={!!pastaEmEdicaoId}
              categoria={getCategoriaAtual()}
              aoSalvar={salvarPasta}
              aoCancelar={resetarFormPasta}
            />
          )}

          {!abaAtiva.includes('criar') && conteudo.pastas.length > 0 && (
            <>
              <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-4">Pastas</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
                {conteudo.pastas.map(pasta => (
                  <PastaCard key={pasta.id} pasta={pasta} aoEntrar={entrarNaPasta} aoEditar={prepararEdicaoPasta} aoDeletar={solicitarDelecao} podeEditar={authenticated && !abaAtiva.includes('publico')} categoria={getCategoriaAtual()} />
                ))}
              </div>
            </>
          )}

          {!abaAtiva.includes('criar') && getCategoriaAtual() === 'CRIATURA' && conteudo.criaturas.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {conteudo.criaturas.map((criatura) => (
                <CriaturaCard key={criatura.id} criatura={criatura} aoDeletar={solicitarDelecao} podeDeletar={authenticated && !abaAtiva.includes('publico')} />
              ))}
            </div>
          )}

          {!abaAtiva.includes('criar') && getCategoriaAtual() === 'ITEM' && conteudo.itens.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {conteudo.itens.map((item) => (
                <ItemCard key={item.id} item={item} aoDeletar={solicitarDelecao} podeDeletar={authenticated && !abaAtiva.includes('publico')} />
              ))}
            </div>
          )}

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