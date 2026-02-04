import { Skull, Scroll, Backpack, Users, Shield } from 'lucide-react';

export default function Sidebar({ categoriaAtiva, setCategoriaAtiva }) {
  
  const categorias = [
    { id: 'CRIATURA', nome: 'Bestiário', icon: Skull, cor: 'text-red-500', bg: 'bg-red-500/10' },
    { id: 'ITEM', nome: 'Arsenal', icon: Backpack, cor: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    // AQUI ESTAVA O ERRO: Certifica-te que é 'MAGIA' e 'NPC' (Singular e Maiúsculas)
    { id: 'MAGIA', nome: 'Grimório', icon: Scroll, cor: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'NPC', nome: 'População', icon: Users, cor: 'text-emerald-500', bg: 'bg-emerald-500/10' }
  ];

  return (
    <aside className="w-20 md:w-64 border-r border-slate-800 bg-slate-950 flex flex-col shrink-0 transition-all duration-300">
      
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-slate-800">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
          <Shield className="text-purple-600" size={28} />
          <span className="hidden md:block bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            DrakDex
          </span>
        </div>
      </div>

      {/* Menu Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-2 space-y-2">
        {categorias.map((cat) => {
          const Icon = cat.icon;
          const ativo = categoriaAtiva === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setCategoriaAtiva(cat.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group
                ${ativo ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-900 hover:text-slate-300'}
              `}
            >
              <div className={`p-2 rounded-lg transition-colors ${ativo ? cat.bg + ' ' + cat.cor : 'bg-slate-900 group-hover:bg-slate-800'}`}>
                <Icon size={20} />
              </div>
              <span className={`hidden md:block font-medium ${ativo ? 'text-white' : ''}`}>
                {cat.nome}
              </span>
              
              {/* Indicador Ativo */}
              {ativo && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-500 hidden md:block animate-pulse" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-center md:text-left">
        <p className="text-[10px] text-slate-600 uppercase font-bold tracking-widest hidden md:block">
          Versão 1.0
        </p>
      </div>
    </aside>
  );
}