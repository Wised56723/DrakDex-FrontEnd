import { useState, useEffect, useContext } from 'react';
import { api } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { Plus, ArrowLeft, FolderPlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Componentes
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import AuthModal from '../components/AuthModal'; // IMPORTADO AQUI
import PastaCard from '../components/cards/PastaCard';
import CriaturaCard from '../components/cards/CriaturaCard';
import ItemCard from '../components/cards/ItemCard';
import MagiaCard from '../components/cards/MagiaCard'; 
import NpcCard from '../components/cards/NpcCard'; 

// Forms e Modals
import PastaForm from '../components/forms/PastaForm';
import CriaturaForm from '../components/forms/CriaturaForm';
import ItemForm from '../components/forms/ItemForm';
import MagiaForm from '../components/forms/MagiaForm'; 
import NpcForm from '../components/forms/NpcForm'; 
import DeleteConfirmationModal from '../components/modals/DeleteConfirmationModal';

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext); 

  // Estados Globais
  const [categoria, setCategoria] = useState('CRIATURA'); 
  const [pastas, setPastas] = useState([]);
  const [pastaAtual, setPastaAtual] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [termoBusca, setTermoBusca] = useState('');

  // Estados de Modals
  const [showAuthModal, setShowAuthModal] = useState(false); // NOVO ESTADO
  const [showPastaForm, setShowPastaForm] = useState(false);
  const [showCriaturaForm, setShowCriaturaForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [showMagiaForm, setShowMagiaForm] = useState(false); 
  const [showNpcForm, setShowNpcForm] = useState(false); 
  
  const [itemParaEditar, setItemParaEditar] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, url: '', nome: '', tipo: '' });

  const carregarDados = async () => {
    setLoading(true);
    try {
      if (pastaAtual) {
        const res = await api.get(`/api/pastas/${pastaAtual.id}`);
        setPastaAtual(res.data);
      } else {
        const res = await api.get('/api/pastas/meus-bestiarios', { params: { tipo: categoria } });
        setPastas(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPastaAtual(null); 
    carregarDados();
  }, [categoria]);

  useEffect(() => {
    carregarDados();
  }, [pastaAtual?.id]); 

  // Se o utilizador fizer login, recarrega os dados
  useEffect(() => {
    if (user) carregarDados();
  }, [user]);

  const caminhoPao = [
    { id: 'root', nome: 'Início' },
    ...(pastaAtual ? [{ id: pastaAtual.id, nome: pastaAtual.nome }] : [])
  ];

  const handleVoltarPasta = (index) => {
    if (index === 0) setPastaAtual(null);
  };

  const handleCriarSucesso = () => {
    setShowPastaForm(false);
    setShowCriaturaForm(false);
    setShowItemForm(false);
    setShowMagiaForm(false);
    setShowNpcForm(false);
    setItemParaEditar(null);
    carregarDados(); 
  };

  const confirmarDelecao = (e, url, nome, tipo) => {
    e.stopPropagation();
    setDeleteModal({ show: true, url, nome, tipo });
  };

  const renderConteudoPasta = () => {
    if (!pastaAtual) return null;

    const subpastasRender = pastaAtual.subPastas?.map(pasta => (
      <PastaCard 
        key={pasta.id} 
        pasta={pasta} 
        aoClicar={() => setPastaAtual(pasta)}
        aoDeletar={confirmarDelecao}
        aoEditar={() => {}}
      />
    ));

    let conteudoRender = null;
    const filtrar = (lista) => lista?.filter(item => 
      !termoBusca || item.nome.toLowerCase().includes(termoBusca.toLowerCase())
    ) || [];

    if (categoria === 'CRIATURA') {
      conteudoRender = filtrar(pastaAtual.criaturas).map(c => (
        <CriaturaCard 
          key={c.id} 
          criatura={c} 
          aoDeletar={confirmarDelecao}
          aoEditar={(item) => { setItemParaEditar(item); setShowCriaturaForm(true); }}
          podeEditar={true}
        />
      ));
    } else if (categoria === 'ITEM') {
      conteudoRender = filtrar(pastaAtual.itens).map(i => (
        <ItemCard 
          key={i.id} 
          item={i} 
          aoDeletar={confirmarDelecao}
          aoEditar={(item) => { setItemParaEditar(item); setShowItemForm(true); }}
          podeEditar={true}
        />
      ));
    } else if (categoria === 'MAGIA') {
      conteudoRender = filtrar(pastaAtual.magias).map(m => (
        <MagiaCard 
          key={m.id} 
          magia={m} 
          aoDeletar={confirmarDelecao}
          aoEditar={(item) => { setItemParaEditar(item); setShowMagiaForm(true); }}
          podeEditar={true}
        />
      ));
    } else if (categoria === 'NPC') {
      conteudoRender = filtrar(pastaAtual.npcs).map(n => (
        <NpcCard 
          key={n.id} 
          npc={n} 
          aoDeletar={confirmarDelecao}
          aoEditar={(item) => { setItemParaEditar(item); setShowNpcForm(true); }}
          podeEditar={true}
        />
      ));
    }

    if ((!pastaAtual.subPastas?.length) && (!conteudoRender?.length)) {
      return (
        <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-600 opacity-50">
          <FolderPlus size={48} className="mb-4" />
          <p>Esta pasta está vazia. Adicione algo novo!</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {subpastasRender}
        {conteudoRender}
      </div>
    );
  };

  const abrirFormularioNovo = () => {
    if (categoria === 'CRIATURA') setShowCriaturaForm(true);
    if (categoria === 'ITEM') setShowItemForm(true);
    if (categoria === 'MAGIA') setShowMagiaForm(true); 
    if (categoria === 'NPC') setShowNpcForm(true); 
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar categoriaAtiva={categoria} setCategoriaAtiva={setCategoria} />

      <div className="flex-1 flex flex-col min-w-0">
        
        {/* HEADER ATUALIZADO COM ABRIR LOGIN */}
        <Header 
          categoria={categoria}
          caminhoPao={caminhoPao}
          voltarPasta={handleVoltarPasta}
          abrirMenu={() => {}} 
          authenticated={!!user}
          user={user}
          logout={logout}
          abrirLogin={() => setShowAuthModal(true)} // <-- AQUI ESTAVA O PROBLEMA
          termoBusca={termoBusca}
          setTermoBusca={setTermoBusca}
        />

        <main className="flex-1 overflow-y-auto p-8 relative scrollbar-thin scrollbar-thumb-purple-900 scrollbar-track-transparent">
          
          <div className="flex items-center gap-4 mb-8">
             {pastaAtual && (
              <button 
                onClick={() => setPastaAtual(pastaAtual.pastaPaiId ? { id: pastaAtual.pastaPaiId } : null)} 
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={20} /> Voltar
              </button>
            )}
            
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              {pastaAtual ? pastaAtual.nome : 
                categoria === 'MAGIA' ? 'Meus Grimórios' : 
                categoria === 'ITEM' ? 'Meus Arsenais' : categoria === 'NPC' ? 'Minha População' : 'Meus Bestiários'
              }
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="animate-spin text-purple-500" size={40} />
            </div>
          ) : (
            <>
              {!pastaAtual && (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {pastas.map(pasta => (
                    <PastaCard 
                      key={pasta.id} 
                      pasta={pasta} 
                      aoClicar={() => setPastaAtual(pasta)}
                      aoDeletar={confirmarDelecao}
                      aoEditar={() => {}}
                    />
                  ))}
                  
                  <button 
                    onClick={() => setShowPastaForm(true)}
                    className="border-2 border-dashed border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center gap-3 text-slate-500 hover:border-purple-500 hover:text-purple-400 transition-all group h-full min-h-[160px]"
                  >
                    <div className="p-3 rounded-full bg-slate-900 group-hover:bg-purple-500/10 transition-colors">
                      <FolderPlus size={24} />
                    </div>
                    <span className="font-medium">Nova Pasta</span>
                  </button>
                </div>
              )}

              {pastaAtual && renderConteudoPasta()}
            </>
          )}

          {pastaAtual && (
            <div className="fixed bottom-8 right-8 flex flex-col gap-3">
              <button 
                onClick={() => setShowPastaForm(true)}
                className="bg-slate-800 hover:bg-slate-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105"
                title="Nova Subpasta"
              >
                <FolderPlus size={24} />
              </button>
              <button 
                onClick={abrirFormularioNovo}
                className="bg-purple-600 hover:bg-purple-500 text-white p-4 rounded-full shadow-lg shadow-purple-900/50 transition-transform hover:scale-105"
                title={`Adicionar ${categoria}`}
              >
                <Plus size={24} />
              </button>
            </div>
          )}

        </main>
      </div>

      {/* MODAL AUTH */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}

      {/* MODAL DE DELEÇÃO */}
      {deleteModal.show && (
        <DeleteConfirmationModal 
          item={{ nome: deleteModal.nome, tipo: deleteModal.tipo }} 
          aoCancelar={() => setDeleteModal({ show: false, url: '', nome: '', tipo: '' })}
          aoConfirmar={async () => {
             try {
                await api.delete(deleteModal.url);
                toast.success("Item apagado!");
                setDeleteModal({ show: false, url: '', nome: '', tipo: '' });
                carregarDados();
             } catch(e) {
                toast.error("Erro ao apagar.");
             }
          }}
        />
      )}
      
      {showPastaForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <PastaForm 
            aoCriar={handleCriarSucesso} 
            aoCancelar={() => setShowPastaForm(false)} 
            categoriaAtual={categoria}
            pastaPaiId={pastaAtual?.id}
          />
        </div>
      )}

      {showCriaturaForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
             <CriaturaForm 
               aoCriar={handleCriarSucesso}
               aoCancelar={() => { setShowCriaturaForm(false); setItemParaEditar(null); }}
               pastaId={pastaAtual?.id}
               criaturaParaEditar={itemParaEditar}
             />
          </div>
        </div>
      )}

      {showItemForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <ItemForm 
               aoCriar={handleCriarSucesso}
               aoCancelar={() => { setShowItemForm(false); setItemParaEditar(null); }}
               pastaId={pastaAtual?.id}
               itemParaEditar={itemParaEditar}
            />
          </div>
        </div>
      )}

      {showMagiaForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <MagiaForm 
               aoCriar={handleCriarSucesso}
               aoCancelar={() => { setShowMagiaForm(false); setItemParaEditar(null); }}
               pastaId={pastaAtual?.id}
               magiaParaEditar={itemParaEditar}
            />
          </div>
        </div>
      )}

      {showNpcForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl">
            <NpcForm 
               aoCriar={handleCriarSucesso}
               aoCancelar={() => { setShowNpcForm(false); setItemParaEditar(null); }}
               pastaId={pastaAtual?.id}
               npcParaEditar={itemParaEditar}
            />
          </div>
        </div>
      )}

    </div>
  );
}