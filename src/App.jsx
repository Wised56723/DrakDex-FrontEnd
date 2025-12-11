import { useState, useEffect } from 'react';
import { API_URL } from './config';
import { Shield, PlusCircle, List, LayoutDashboard, Scroll } from 'lucide-react';
import CriaturaForm from './CriaturaForm';

function App() {
  const [abaAtiva, setAbaAtiva] = useState('lista');
  const [criaturas, setCriaturas] = useState([]);
  const [loading, setLoading] = useState(false);

  const carregarBestiario = () => {
    setLoading(true);
    fetch(`${API_URL}?page=0&size=50&sort=id,desc`)
      .then(res => res.json())
      .then(data => {
        setCriaturas(data.content || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    carregarBestiario();
  }, []);

  const aoAdicionarCriatura = (novaCriatura) => {
    setCriaturas([novaCriatura, ...criaturas]);
    setAbaAtiva('lista');
  };

  return (
    // h-screen: Altura total da tela | flex: Lado a lado | bg-slate-950: Fundo muito escuro
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans">
      
      {/* --- SIDEBAR --- */}
      {/* w-64: Largura fixa | border-r: Borda direita | border-slate-800: Cor da borda */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col p-6">
        <div className="text-2xl font-bold text-rose-600 mb-10 flex items-center gap-2">
          <LayoutDashboard size={28} /> DrakDex
        </div>

        <nav className="flex flex-col gap-2">
          {/* Botão do Menu: hover:bg-slate-800 muda a cor quando passa o mouse */}
          <button 
            onClick={() => setAbaAtiva('lista')}
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
              abaAtiva === 'lista' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <List size={20} /> Bestiário
          </button>

          <button 
            onClick={() => setAbaAtiva('criar')}
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
              abaAtiva === 'criar' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <PlusCircle size={20} /> Nova Criatura
          </button>
        </nav>
      </aside>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      {/* flex-1: Ocupa todo o espaço restante | overflow-auto: Permite rolar a tela */}
      <main className="flex-1 p-8 overflow-y-auto">
        
        {abaAtiva === 'lista' && (
          <div>
            <h2 className="text-3xl font-bold mb-6 border-b border-slate-800 pb-4">Todas as Criaturas</h2>
            
            {loading && <p className="text-slate-500 animate-pulse">Carregando bestiário...</p>}

            {/* Grid Responsivo: grid-cols-1 no celular, 2 no tablet (md), 3 no PC (lg) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {criaturas.map((criatura) => (
                <div key={criatura.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-rose-600/50 transition-colors shadow-lg">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-rose-500">{criatura.nome}</h3>
                    <span className="bg-slate-800 text-xs font-bold px-3 py-1 rounded-full text-slate-300 border border-slate-700">
                      Lvl {criatura.nivel}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
                    <Shield size={16} className="text-blue-400"/> {criatura.tipo}
                  </div>
                  
                  <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
                    <p className="text-slate-400 italic text-sm flex gap-2">
                      <Scroll size={16} className="shrink-0 mt-1 text-slate-600"/>
                      {criatura.descricao}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {abaAtiva === 'criar' && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Invocar Nova Criatura</h2>
            <CriaturaForm aoCriar={aoAdicionarCriatura} />
          </div>
        )}

      </main>
    </div>
  );
}

export default App;