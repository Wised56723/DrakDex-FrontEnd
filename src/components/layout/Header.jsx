import { Menu, FolderOpen, Backpack, ChevronRight, LogOut, LogIn, Search, X } from 'lucide-react';

export default function Header({ 
  categoria, 
  caminhoPao = [], // Valor padrão para evitar erro
  voltarPasta, 
  abrirMenu, 
  authenticated, 
  user, 
  logout, 
  abrirLogin,
  termoBusca,       
  setTermoBusca     
}) {
  
  // CORREÇÃO: Usamos comparação direta em vez de .includes()
  const isArsenal = categoria === 'ITEM';

  return (
    <header className="h-16 border-b border-slate-800 flex items-center justify-between px-4 md:px-8 bg-slate-950/50 backdrop-blur shrink-0 gap-4">
      
      {/* LADO ESQUERDO: Ícones e Breadcrumbs */}
      <div className="flex items-center gap-3 text-sm text-slate-400 overflow-hidden shrink-0">
        <button onClick={abrirMenu} className="md:hidden text-slate-200 p-1 hover:bg-slate-800 rounded">
          <Menu size={24} />
        </button>

        <div className="hidden md:block">
          {isArsenal ? <Backpack size={18} className="text-rose-500"/> : <FolderOpen size={18} className="text-rose-500"/>}
        </div>
        
        {/* Breadcrumbs (Caminho do Pão) */}
        <div className={`flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1 no-scrollbar mask-gradient ${termoBusca ? 'hidden md:flex' : 'flex'}`}>
          {caminhoPao.map((passo, index) => (
            <div key={passo.id || 'root'} className="flex items-center gap-2">
              {index > 0 && <ChevronRight size={14} className="shrink-0" />}
              <button 
                onClick={() => voltarPasta && voltarPasta(index)} 
                className={`hover:text-white ${index === caminhoPao.length - 1 ? 'text-rose-500 font-bold' : ''}`}
              >
                {passo.nome}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* CENTRO: BARRA DE BUSCA */}
      {authenticated && (
        <div className="flex-1 max-w-md relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-slate-500 group-focus-within:text-rose-500 transition-colors"/>
          </div>
          <input
            type="text"
            value={termoBusca || ''}
            onChange={(e) => setTermoBusca(e.target.value)}
            placeholder={`Buscar em ${isArsenal ? 'Itens' : 'Monstros'}...`}
            className="block w-full pl-10 pr-10 bg-slate-900 border border-slate-700 rounded-full py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
          />
          {termoBusca && (
            <button 
              onClick={() => setTermoBusca('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {/* LADO DIREITO: Usuário */}
      <div className="flex items-center gap-4 shrink-0">
        {authenticated ? (
          <>
            <span className="text-sm font-bold text-white hidden md:block">{user?.vulgo}</span>
            <button onClick={logout} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-red-500" title="Sair">
              <LogOut size={20}/>
            </button>
          </>
        ) : (
          <button onClick={abrirLogin} className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 md:px-4 rounded-lg font-bold text-sm">
            <LogIn size={16}/> <span className="hidden md:inline">Entrar</span>
          </button>
        )}
      </div>
    </header>
  );
}