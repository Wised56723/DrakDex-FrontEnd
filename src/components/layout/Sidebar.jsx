import { Home, Sword, Scroll, BookOpen, Users } from 'lucide-react';

export default function Sidebar({ categoriaAtiva, setCategoriaAtiva }) {
  
  const menuItems = [
    { id: 'CRIATURA', label: 'Bestiário', icon: Home },
    { id: 'ITEM', label: 'Arsenal', icon: Sword },
    { id: 'MAGIA', label: 'Grimório', icon: BookOpen }, // Novo
    { id: 'NPC', label: 'População', icon: Users }, // (Deixa comentado para o próximo passo)
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-900 flex flex-col">
      <div className="p-6 border-b border-slate-900 flex items-center gap-3">
        <div className="bg-purple-600 p-2 rounded-lg shadow-lg shadow-purple-900/50">
          <Scroll className="text-white" size={24} />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          DrakDex
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const ativo = categoriaAtiva === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setCategoriaAtiva(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                ativo 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30' 
                  : 'text-slate-400 hover:bg-slate-900 hover:text-purple-400'
              }`}
            >
              <Icon size={20} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-900">
        <div className="bg-slate-900/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500">Versão Beta 0.3</p>
        </div>
      </div>
    </aside>
  );
}