import { LayoutDashboard, FolderOpen, Globe, Backpack, X } from 'lucide-react';

export default function Sidebar({ 
  abaAtiva, 
  navegar, 
  menuAberto, 
  fecharMenu, 
  authenticated, 
  abrirLogin 
}) {
  
  // Helper para estilizar botões
  const btnClass = (nomeAba) => `flex items-center gap-3 p-3 rounded-lg transition-colors ${abaAtiva === nomeAba ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`;

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col p-6 transition-transform duration-300 ease-in-out
      ${menuAberto ? 'translate-x-0' : '-translate-x-full'} 
      md:translate-x-0 md:static md:inset-auto
    `}>
      <div className="flex justify-between items-center mb-8">
        <div className="text-2xl font-bold text-rose-600 flex items-center gap-2">
          <LayoutDashboard size={28} /> DrakDex
        </div>
        
        {/* Botão fechar (Mobile) */}
        <button onClick={fecharMenu} className="md:hidden text-slate-400 hover:text-white">
          <X size={24} />
        </button>
      </div>
      
      <nav className="flex flex-col gap-2 flex-1 overflow-y-auto">
        
        {/* SEÇÃO BESTIÁRIO */}
        <p className="text-xs font-bold text-slate-500 uppercase mt-2 mb-1">Bestiário</p>
        <button onClick={() => navegar('meu_bestiario')} className={btnClass('meu_bestiario')}>
          <FolderOpen size={20} /> Meus Monstros
        </button>
        <button onClick={() => navegar('publico_bestiario')} className={btnClass('publico_bestiario')}>
          <Globe size={20} /> Público
        </button>

        {/* SEÇÃO ARSENAL */}
        <p className="text-xs font-bold text-slate-500 uppercase mt-6 mb-1">Arsenal</p>
        <button 
          onClick={() => authenticated ? navegar('meu_arsenal') : abrirLogin()} 
          className={btnClass('meu_arsenal')}
        >
          <Backpack size={20} /> Meus Itens
        </button>
        <button onClick={() => navegar('publico_arsenal')} className={btnClass('publico_arsenal')}>
          <Globe size={20} /> Arsenal Público
        </button>

      </nav>
    </aside>
  );
}