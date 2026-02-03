import { 
  User, Shield, Heart, Skull, 
  Trash2, Pencil, Sparkles, Sword 
} from 'lucide-react';

export default function NpcCard({ npc, aoDeletar, aoEditar, podeEditar }) {
  
  const isDnD = npc.tipoFicha === 'DND5E';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg hover:border-yellow-500/50 transition-all group flex flex-col h-full relative">
      
      {/* Botões de Ação */}
      {podeEditar && (
        <div className="absolute top-2 right-2 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => { e.stopPropagation(); aoEditar(npc); }} 
            className="p-2 bg-black/60 backdrop-blur rounded-full text-white hover:bg-blue-600 transition-colors"
            title="Editar NPC"
          >
            <Pencil size={14}/>
          </button>

          <button 
            onClick={(e) => aoDeletar(e, `/api/npcs/${npc.id}`, npc.nome, 'NPC')} 
            className="p-2 bg-black/60 backdrop-blur rounded-full text-white hover:bg-red-600 transition-colors"
            title="Excluir NPC"
          >
            <Trash2 size={14}/>
          </button>
        </div>
      )}

      {/* Cabeçalho */}
      <div className="bg-gradient-to-r from-yellow-900/40 to-slate-900 p-4 border-b border-slate-800 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-500/10 p-2 rounded-lg border border-yellow-500/30">
            <User size={24} className="text-yellow-400" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 leading-tight">{npc.nome}</h3>
            <span className="text-[10px] font-bold text-yellow-500/80 uppercase tracking-wider bg-yellow-900/20 px-2 py-0.5 rounded">
              {isDnD ? `ND ${npc.nivelDesafio || '?'}` : 'NPC Livre'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats (Apenas D&D) */}
      {isDnD && (
        <div className="grid grid-cols-2 gap-px bg-slate-800 border-b border-slate-800">
          <div className="bg-slate-950/50 p-2 flex items-center justify-center gap-2 text-red-400">
            <Heart size={14} /> 
            <span className="font-mono text-sm">{npc.pontosVida || '?'} PV</span>
          </div>
          <div className="bg-slate-950/50 p-2 flex items-center justify-center gap-2 text-blue-400">
            <Shield size={14} /> 
            <span className="font-mono text-sm">{npc.classeArmadura || '?'} CA</span>
          </div>
        </div>
      )}

      {/* Descrição / Lore */}
      <div className="p-4 flex-1">
        <p className="text-xs text-slate-500 mb-2 italic">
          {npc.aparencia || "Aparência desconhecida..."}
        </p>
        <div className="text-sm text-slate-300 line-clamp-3 leading-relaxed">
          {npc.personalidade || npc.historia || <span className="opacity-50">Sem história definida.</span>}
        </div>
      </div>

      {/* Badges de Equipamento/Magia */}
      <div className="px-4 pb-3 flex gap-2">
        {npc.equipamentos?.length > 0 && (
          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded flex items-center gap-1 border border-slate-700" title="Possui Itens">
            <Sword size={10} /> {npc.equipamentos.length}
          </span>
        )}
        {npc.magiasConhecidas?.length > 0 && (
          <span className="text-[10px] bg-slate-800 text-purple-400 px-2 py-1 rounded flex items-center gap-1 border border-slate-700" title="Possui Magias">
            <Sparkles size={10} /> {npc.magiasConhecidas.length}
          </span>
        )}
      </div>

    </div>
  );
}