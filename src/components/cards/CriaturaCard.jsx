import { Shield, Trash2, User } from 'lucide-react';

export default function CriaturaCard({ criatura, aoDeletar, podeDeletar }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg hover:border-rose-600/30 transition-all group relative">
      
      {/* Botão de Deletar (Condicional) */}
      {podeDeletar && (
        <div className="absolute top-2 left-2 z-10 flex gap-2">
          <button 
            onClick={(e) => aoDeletar(e, `/api/criaturas/${criatura.id}`, criatura.nome, 'Criatura')} 
            className="p-2 bg-black/50 backdrop-blur rounded-full text-white hover:bg-red-600 transition-colors"
            title="Excluir Criatura"
          >
            <Trash2 size={16}/>
          </button>
        </div>
      )}

      {/* Imagem */}
      <div className="h-48 w-full bg-slate-950 relative overflow-hidden">
        {criatura.imagemUrl ? (
          <img 
            src={criatura.imagemUrl} 
            alt={criatura.nome} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
            onError={(e) => { 
              e.target.onerror = null; 
              e.target.style.display = 'none'; 
              e.target.parentNode.classList.add('flex', 'items-center', 'justify-center'); 
              e.target.parentNode.innerHTML = '<span class="text-slate-700 opacity-20"><svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#334155" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10 10 10 0 0 0-10-10zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/></svg></span>'; 
            }} 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-950 text-slate-700">
            <Shield size={64} opacity={0.2} />
          </div>
        )}
        
        {/* Badge Nível */}
        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full border border-rose-500/50 shadow-sm">
          Lvl {criatura.nivel}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-rose-500 transition-colors">
          {criatura.nome}
        </h3>
        
        <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-3">
          <Shield size={12}/> {criatura.tipo}
        </div>

        <p className="text-slate-400 text-sm line-clamp-3 mb-4 h-16">
          {criatura.descricao || "Sem descrição."}
        </p>

        <div className="flex items-center gap-2 pt-3 border-t border-slate-800 text-xs text-slate-500">
          <User size={14} /> 
          <span>Invocado por: <span className="text-slate-300">{criatura.criadorVulgo}</span></span>
        </div>
      </div>
    </div>
  );
}