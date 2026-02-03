import { 
  Sparkles, Clock, Target, Hourglass, 
  Trash2, Pencil, Scroll 
} from 'lucide-react';

export default function MagiaCard({ magia, aoDeletar, aoEditar, podeEditar }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg hover:border-purple-500/50 transition-all group flex flex-col relative h-full">
      
      {/* Botões de Ação */}
      {podeEditar && (
        <div className="absolute top-2 right-2 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => { e.stopPropagation(); aoEditar(magia); }} 
            className="p-2 bg-black/60 backdrop-blur rounded-full text-white hover:bg-blue-600 transition-colors"
            title="Editar Magia"
          >
            <Pencil size={14}/>
          </button>

          <button 
            onClick={(e) => aoDeletar(e, `/api/magias/${magia.id}`, magia.nome, 'Magia')} 
            className="p-2 bg-black/60 backdrop-blur rounded-full text-white hover:bg-red-600 transition-colors"
            title="Excluir Magia"
          >
            <Trash2 size={14}/>
          </button>
        </div>
      )}

      {/* Cabeçalho Visual */}
      <div className="bg-gradient-to-r from-purple-900/40 to-slate-900 p-4 border-b border-slate-800 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-purple-500/10 p-2 rounded-lg border border-purple-500/30">
            <Scroll size={24} className="text-purple-400" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 leading-tight">{magia.nome}</h3>
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
              {magia.escola || "Universal"}
            </span>
          </div>
        </div>
        {magia.custo && (
          <span className="text-[10px] font-mono bg-slate-950 px-2 py-1 rounded text-slate-400 border border-slate-800">
            {magia.custo}
          </span>
        )}
      </div>

      {/* Stats Rápidos */}
      <div className="grid grid-cols-3 gap-1 p-3 text-[10px] text-slate-400 border-b border-slate-800 bg-slate-950/30">
        <div className="flex flex-col items-center gap-1 text-center">
          <Clock size={12} className="text-slate-500"/>
          <span className="truncate w-full">{magia.tempoExecucao || "-"}</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-center border-x border-slate-800">
          <Target size={12} className="text-slate-500"/>
          <span className="truncate w-full">{magia.alcance || "-"}</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <Hourglass size={12} className="text-slate-500"/>
          <span className="truncate w-full">{magia.duracao || "-"}</span>
        </div>
      </div>

      {/* Descrição */}
      <div className="p-4 flex-1">
        <div className="text-sm text-slate-300 whitespace-pre-line line-clamp-4 leading-relaxed">
          {magia.descricao || <span className="italic text-slate-600">Sem descrição...</span>}
        </div>
      </div>

      {/* Rodapé (Componentes e Sistema) */}
      <div className="p-3 bg-slate-950/50 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500">
        <span title="Componentes">{magia.componentes || "V, S"}</span>
        <span className="flex items-center gap-1">
          <Sparkles size={10} /> {magia.sistema || "Genérico"}
        </span>
      </div>

    </div>
  );
}