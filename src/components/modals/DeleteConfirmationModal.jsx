import { AlertTriangle, Trash2 } from 'lucide-react';

export default function DeleteConfirmationModal({ item, aoConfirmar, aoCancelar }) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
        
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mb-4 border border-red-900/50">
            <AlertTriangle className="text-red-500" size={32} />
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2">Apagar {item.tipo}?</h3>
          
          <p className="text-slate-400 text-sm">
            Tem certeza que deseja destruir <strong className="text-white">"{item.nome}"</strong>? 
            
            {/* Aviso especial se for Pasta */}
            {item.tipo === 'Pasta' && (
              <span className="block mt-2 text-red-400 font-bold text-xs uppercase bg-red-950/30 p-2 rounded border border-red-900/30">
                ⚠️ Isso apagará todos os itens e monstros dentro dela!
              </span>
            )}
          </p>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={aoCancelar} 
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          
          <button 
            onClick={aoConfirmar} 
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 size={18} /> Sim, Destruir
          </button>
        </div>

      </div>
    </div>
  );
}