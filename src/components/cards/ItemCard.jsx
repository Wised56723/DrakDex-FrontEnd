import { 
  Shield, Sword, Hammer, Gem, FlaskConical, Feather, 
  Trash2, User, Backpack 
} from 'lucide-react';

// Constantes Visuais Locais
const CORES_RARIDADE = {
  COMUM: "border-slate-600 text-slate-400",
  INCOMUM: "border-green-600 text-green-400",
  RARO: "border-blue-500 text-blue-400",
  EPICO: "border-purple-500 text-purple-400",
  LENDARIO: "border-orange-500 text-orange-400",
  ARTEFATO: "border-red-600 text-red-500"
};

const ICONES_TIPO = {
  ARMA: <Sword size={18} />,
  ARMADURA: <Shield size={18} />,
  ACESSORIO: <Gem size={18} />,
  CONSUMIVEL: <FlaskConical size={18} />,
  FERRAMENTA: <Hammer size={18} />,
  TESOURO: <Gem size={18} className="text-yellow-400"/>,
  OUTRO: <Feather size={18} />
};

export default function ItemCard({ item, aoDeletar, podeDeletar }) {
  // Lógica de Cores
  const corRaridadeClasses = CORES_RARIDADE[item.raridade] || "border-slate-600 text-slate-400";
  const corTexto = corRaridadeClasses.split(" ").find(c => c.startsWith("text-")) || "text-slate-400";
  const corBorda = corRaridadeClasses.split(" ").find(c => c.startsWith("border-")) || "border-slate-700";

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg hover:border-slate-600 transition-all group flex flex-col relative">
      
      {/* Botão Deletar */}
      {podeDeletar && (
        <div className="absolute top-2 right-2 z-10 flex gap-2">
          <button 
            onClick={(e) => aoDeletar(e, `/api/itens/${item.id}`, item.nome, 'Item')} 
            className="p-2 bg-black/50 backdrop-blur rounded-full text-white hover:bg-red-600 transition-colors"
            title="Excluir Item"
          >
            <Trash2 size={16}/>
          </button>
        </div>
      )}

      {/* Imagem */}
      <div className="h-40 w-full bg-slate-950 relative overflow-hidden border-b border-slate-800">
        {item.imagemUrl ? (
          <img 
            src={item.imagemUrl} 
            alt={item.nome} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
            onError={(e) => { 
              e.target.onerror = null; 
              e.target.style.display = 'none'; 
              e.target.parentNode.classList.add('flex', 'items-center', 'justify-center'); 
            }} 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-950 text-slate-700">
            <Backpack size={48} opacity={0.2} />
          </div>
        )}
        
        {/* Ícone Tipo */}
        <div className="absolute top-2 left-2 bg-black/70 backdrop-blur text-white p-1.5 rounded-lg border border-slate-700 shadow-sm">
          {ICONES_TIPO[item.tipo] || <Feather size={16}/>}
        </div>
      </div>

      {/* Detalhes */}
      <div className={`p-4 flex-1 flex flex-col border-l-4 ${corBorda}`}>
        <div className="flex justify-between items-start mb-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${corTexto}`}>
              {item.raridade}
            </span>
            {item.preco && (
              <span className="text-[10px] text-yellow-500 font-mono bg-yellow-900/20 px-1 rounded">
                💰 {item.preco}
              </span>
            )}
        </div>

        <h3 className={`text-lg font-bold mb-2 ${corTexto} line-clamp-1`}>{item.nome}</h3>
        
        {/* Stats Grid */}
        {(item.dano || item.defesa || item.peso) && (
            <div className="flex gap-2 mb-3 text-xs">
                {item.dano && <span className="bg-red-950/50 text-red-400 px-2 py-1 rounded border border-red-900/30 font-bold">⚔️ {item.dano}</span>}
                {item.defesa && <span className="bg-blue-950/50 text-blue-400 px-2 py-1 rounded border border-blue-900/30 font-bold">🛡️ {item.defesa}</span>}
                {item.peso && <span className="text-slate-500 py-1 ml-auto">{item.peso}kg</span>}
            </div>
        )}

        <p className="text-slate-400 text-sm italic line-clamp-2 mb-3 flex-1">
          {item.descricao}
        </p>
        
        <p className="text-[10px] text-slate-600 pt-2 border-t border-slate-800/50 flex items-center gap-1">
          <User size={10}/> Forjado por {item.donoVulgo}
        </p>
      </div>
    </div>
  );
}