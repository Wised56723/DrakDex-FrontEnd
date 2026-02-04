import { Folder, Trash2, MoreVertical, FolderOpen } from 'lucide-react';

export default function PastaCard({ pasta, aoClicar, aoDeletar, aoEditar }) {
  
  // Função para evitar que o clique no botão de deletar abra a pasta
  const handleDelete = (e) => {
    e.stopPropagation(); // Impede que o clique "suba" para a div principal
    aoDeletar(e, `/api/pastas/${pasta.id}`, pasta.nome, 'PASTA');
  };

  return (
    <div 
      onClick={aoClicar} // <--- O SEGREDO: Esta linha faz a pasta abrir!
      className="group relative bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-900/20 transition-all cursor-pointer flex flex-col justify-between h-[160px]"
    >
      
      {/* Cabeçalho do Card */}
      <div className="flex justify-between items-start">
        <div className="bg-slate-800 p-3 rounded-lg group-hover:bg-purple-500/20 group-hover:text-purple-400 transition-colors text-slate-400">
          <Folder size={24} className="group-hover:hidden" />
          <FolderOpen size={24} className="hidden group-hover:block" />
        </div>

        {/* Botão de Deletar (com stopPropagation) */}
        <button 
          onClick={handleDelete}
          className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          title="Apagar Pasta"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Título e Info */}
      <div>
        <h3 className="text-lg font-bold text-slate-200 group-hover:text-white truncate" title={pasta.nome}>
          {pasta.nome}
        </h3>
        <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
          {pasta.categoria || 'Geral'}
        </span>
      </div>

      {/* Efeito de brilho no fundo (Opcional) */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
}