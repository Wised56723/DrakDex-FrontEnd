import { Menu, FolderOpen, Backpack, ChevronRight, LogOut, LogIn } from 'lucide-react';

export default function Header({ 
  abaAtiva, 
  caminhoPao, 
  voltarPasta, 
  abrirMenu, 
  authenticated, 
  user, 
  logout, 
  abrirLogin 
}) {
  
  const isArsenal = abaAtiva.includes('arsenal');

  return (
    <header className="h-16 border-b border-slate-800 flex items-center justify-between px-4 md:px-8 bg-slate-950/50 backdrop-blur shrink-0">
      
      {/* LADO ESQUERDO: Ícones e Breadcrumbs */}
      <div className="flex items-center gap-3 text-sm text-slate-400 overflow-hidden">
        
        {/* Botão Menu Hambúrguer (Mobile) */}
        <button onClick={abrirMenu} className="md:hidden text-slate-200 p-1 hover:bg-slate-800 rounded">
          <Menu size={24} />
        </button>

        {/* Ícone de Contexto (Pasta ou Mochila) */}
        <div className="hidden md:block">
          {isArsenal ? (
            <Backpack size={18} className="text-rose-500"/> 
          ) : (
            <FolderOpen size={18} className="text-rose-500"/>
          )}
        </div>
        
        {/* Breadcrumbs (Caminho) */}
        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1 no-scrollbar mask-gradient">
          {caminhoPao.map((passo, index) => (
            <div key={passo.id || 'root'} className="flex items-center gap-2">
              {index > 0 && <ChevronRight size={14} className="shrink-0" />}
              <button 
                onClick={() => voltarPasta(index)} 
                className={`hover:text-white ${index === caminhoPao.length - 1 ? 'text-rose-500 font-bold' : ''}`}
              >
                {passo.nome}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* LADO DIREITO: Usuário e Login */}
      {authenticated ? (
        <div className="flex items-center gap-4 shrink-0">
          <span className="text-sm font-bold text-white hidden md:block">{user?.vulgo}</span>
          <button 
            onClick={logout} 
            className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-red-500"
            title="Sair"
          >
            <LogOut size={20}/>
          </button>
        </div>
      ) : (
        <button 
          onClick={abrirLogin} 
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 md:px-4 rounded-lg font-bold text-sm"
        >
          <LogIn size={16}/> <span className="hidden md:inline">Entrar</span>
        </button>
      )}
    </header>
  );
}