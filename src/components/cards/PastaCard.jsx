import { Folder, Globe, Pencil, Trash2 } from 'lucide-react';

export default function PastaCard({ pasta, aoEntrar, aoEditar, aoDeletar, podeEditar, categoria }) {
  return (
    <div 
      onClick={() => aoEntrar(pasta)} 
      className="bg-slate-900 border border-slate-800 hover:border-yellow-500/50 p-4 rounded-xl cursor-pointer hover:bg-slate-800 group relative transition-all"
    >
      {/* BOTÕES DE AÇÃO (Só mostra se for dono) */}
      {podeEditar && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => aoEditar(e, pasta)} 
            className="p-1.5 bg-slate-800 rounded-full hover:bg-blue-600 hover:text-white text-slate-400" 
            title="Renomear"
          >
            <Pencil size={12}/>
          </button>
          <button 
            onClick={(e) => aoDeletar(e, `/api/pastas/${pasta.id}`, pasta.nome, 'Pasta')} 
            className="p-1.5 bg-slate-800 rounded-full hover:bg-red-600 hover:text-white text-slate-400" 
            title="Apagar"
          >
            <Trash2 size={12}/>
          </button>
        </div>
      )}

      <div className="flex justify-between mb-2">
        <Folder className="text-yellow-600 group-hover:text-yellow-400 transition-colors" size={32} />
        {pasta.publica && <Globe size={14} className="text-blue-400"/>}
      </div>
      
      <p className="font-bold text-slate-200 truncate">{pasta.nome}</p>
      
      <p className="text-xs text-slate-500">
        {categoria === 'CRIATURA' 
          ? `${pasta.quantidadeCriaturas} monstros` 
          : 'Abrir arsenal'}
      </p>
    </div>
  );
}