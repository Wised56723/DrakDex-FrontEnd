import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { api } from '../services/api';
import { FolderOpen, Folder, PlusCircle, Search } from 'lucide-react'; // Search importado
import { toast, Toaster } from 'sonner';

import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import CriaturaForm from '../components/forms/CriaturaForm';
import ItemForm from '../components/forms/ItemForm'; 
import PastaForm from '../components/forms/PastaForm'; 

import AuthModal from '../components/AuthModal'; 
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
  
  // --- ESTADO DE BUSCA (NOVO) ---
  const [termoBusca, setTermoBusca] = useState('');

  // --- ESTADOS UI ---
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);
  const [itemParaDeletar, setItemParaDeletar] = useState(null);

  // --- ESTADOS DE EDIÇÃO ---
  const [showCriarPasta, setShowCriarPasta] = useState(false); 
  const [novaPastaNome, setNovaPastaNome] = useState('');
  const [novaPastaPublica, setNovaPastaPublica] = useState(false);
  const [pastaEmEdicaoId, setPastaEmEdicaoId] = useState(null);
  
  const [criaturaParaEditar, setCriaturaParaEditar] = useState(null);
  const [itemParaEditar, setItemParaEditar] = useState(null);

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

  // Limpar busca ao navegar
  const navegar = (novaAba) => {
    setAbaAtiva(novaAba);
    setPastaAtualId(null);
    setCaminhoPao([{ id: null, nome: 'Raiz' }]);
    setMenuMobileAberto(false);
    setTermoBusca(''); // Limpa busca
    cancelarEdicoes();
  };

  const cancelarEdicoes = () => {
    setCriaturaParaEditar(null);
    setItemParaEditar(null);
    resetarFormPasta();
  };

  const voltarPasta = (indice) => {
    const novoCaminho = caminhoPao.slice(0, indice + 1);
    setCaminhoPao(novoCaminho);
    setPastaAtualId(novoCaminho[novoCaminho.length - 1].id);
    setTermoBusca(''); // Limpa busca
    cancelarEdicoes();
  };

  const entrarNaPasta = (pasta) => {
    setPastaAtualId(pasta.id);
    setCaminhoPao([...caminhoPao, { id: pasta.id, nome: pasta.nome }]);
    setTermoBusca(''); // Limpa busca
    cancelarEdicoes();
  };

  // --- LÓGICA DE FILTRAGEM (NOVO) ---
  const filtrarConteudo = (lista, campo) => {
    if (!termoBusca) return lista;
    return lista.filter(item => 
      item[campo].toLowerCase().includes(termoBusca.toLowerCase())
    );
  };

  const pastasFiltradas = filtrarConteudo(conteudo.pastas, 'nome');
  const criaturasFiltradas = filtrarConteudo(conteudo.criaturas, 'nome');
  const itensFiltrados = filtrarConteudo(conteudo.itens, 'nome');

  // --- CRUD LÓGICA (MANTIDA IGUAL) ---
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
  
  const prepararEdicaoCriatura = (criatura) => { setCriaturaParaEditar(criatura); setAbaAtiva('criar_criatura'); };
  const prepararEdicaoItem = (item) => { setItemParaEditar(item); setAbaAtiva('criar_item'); };
  const aoConcluirEdicao = () => { setAbaAtiva(itemParaEditar ? 'meu_arsenal' : 'meu_bestiario'); cancelarEdicoes(); carregarDados(); };

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
      
      <DeleteConfirmationModal item={itemParaDeletar} aoConfirmar={confirmarDelecao} aoCancelar={() => setItemParaDeletar(null)} />

      {menuMobileAberto && <div onClick={() => setMenuMobileAberto(false)} className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm animate-in fade-in" />}

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
          termoBusca={termoBusca} // <--- Passando estado
          setTermoBusca={setTermoBusca} // <--- Passando setter
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

          {/* RENDERIZAÇÃO DAS LISTAS FILTRADAS */}
          {!abaAtiva.includes('criar') && pastasFiltradas.length > 0 && (
            <>
              <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-4">Pastas</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
                {pastasFiltradas.map(pasta => (
                  <PastaCard key={pasta.id} pasta={pasta} aoEntrar={entrarNaPasta} aoEditar={prepararEdicaoPasta} aoDeletar={solicitarDelecao} podeEditar={authenticated && !abaAtiva.includes('publico')} categoria={getCategoriaAtual()} />
                ))}
              </div>
            </>
          )}

          {!abaAtiva.includes('criar') && getCategoriaAtual() === 'CRIATURA' && criaturasFiltradas.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {criaturasFiltradas.map((criatura) => (
                <CriaturaCard key={criatura.id} criatura={criatura} aoDeletar={solicitarDelecao} aoEditar={prepararEdicaoCriatura} podeEditar={authenticated && !abaAtiva.includes('publico')} />
              ))}
            </div>
          )}

          {!abaAtiva.includes('criar') && getCategoriaAtual() === 'ITEM' && itensFiltrados.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {itensFiltrados.map((item) => (
                <ItemCard key={item.id} item={item} aoDeletar={solicitarDelecao} aoEditar={prepararEdicaoItem} podeEditar={authenticated && !abaAtiva.includes('publico')} />
              ))}
            </div>
          )}

          {/* EMPTY STATE BUSCA */}
          {!loading && !abaAtiva.includes('criar') && pastasFiltradas.length === 0 && criaturasFiltradas.length === 0 && itensFiltrados.length === 0 && (
            <div className="text-center text-slate-600 mt-20">
              {termoBusca ? (
                <>
                  <Search size={64} className="mx-auto mb-4 opacity-20"/>
                  <p>Nenhum resultado para "{termoBusca}".</p>
                </>
              ) : (
                <>
                  <FolderOpen size={64} className="mx-auto mb-4 opacity-20"/>
                  <p>Nenhum registro encontrado neste tomo.</p>
                </>
              )}
            </div>
          )}

          {abaAtiva === 'criar_criatura' && (<div className="max-w-2xl mx-auto"><button onClick={() => { setAbaAtiva('meu_bestiario'); cancelarEdicoes(); }} className="mb-4 text-slate-400 hover:text-white flex items-center gap-2">← Voltar</button><CriaturaForm pastaId={pastaAtualId} criaturaParaEditar={criaturaParaEditar} aoCriar={aoConcluirEdicao} aoCancelar={() => { setAbaAtiva('meu_bestiario'); cancelarEdicoes(); }} /></div>)}
          {abaAtiva === 'criar_item' && (<div className="max-w-2xl mx-auto"><button onClick={() => { setAbaAtiva('meu_arsenal'); cancelarEdicoes(); }} className="mb-4 text-slate-400 hover:text-white flex items-center gap-2">← Voltar ao Arsenal</button><ItemForm pastaId={pastaAtualId} itemParaEditar={itemParaEditar} aoCriar={aoConcluirEdicao} aoCancelar={() => { setAbaAtiva('meu_arsenal'); cancelarEdicoes(); }} /></div>)}
        </div>
      </main>
    </div>
  );
}