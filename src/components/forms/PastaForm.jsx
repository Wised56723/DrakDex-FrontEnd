import { Save, X } from 'lucide-react';

export default function PastaForm({ 
  nome, 
  setNome, 
  publica, 
  setPublica, 
  isEdicao, 
  categoria, 
  aoSalvar, 
  aoCancelar 
}) {
  return (
    <form onSubmit={aoSalvar} className="bg-slate-900 p-4 rounded-lg border border-slate-700 mb-8 flex flex-col md:flex-row gap-4 items-end animate-in fade-in">
      <div className="flex-1 w-full">
        <label className="text-xs text-slate-400 block mb-1">
          {isEdicao ? 'Renomear Pasta' : `Nova Pasta (${categoria})`}
        </label>
        <input 
          value={nome} 
          onChange={e => setNome(e.target.value)} 
          className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-rose-500 outline-none" 
          required 
          autoFocus 
        />
      </div>
      
      {/* Checkbox de Pública (Só aparece ao criar, para simplificar a edição) */}
      {!isEdicao && (
        <div className="flex items-center gap-2 pb-3">
          <input 
            type="checkbox" 
            checked={publica} 
            onChange={e => setPublica(e.target.checked)} 
            className="accent-rose-600 h-4 w-4" 
          />
          <label className="text-sm">Pública?</label>
        </div>
      )}

      <div className="flex gap-2 w-full md:w-auto">
        <button 
          type="button" 
          onClick={aoCancelar} 
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded transition-colors flex items-center gap-2"
        >
          <X size={18} /> Cancelar
        </button>
        <button 
          type="submit" 
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors flex-1 md:flex-none flex items-center gap-2 justify-center"
        >
          <Save size={18} /> Salvar
        </button>
      </div>
    </form>
  );
}