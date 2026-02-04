import { useState } from 'react';
import { api } from '../../services/api';
import { X, FolderPlus, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function PastaForm({ aoCriar, aoCancelar, categoriaAtual, pastaPaiId }) {
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [erroDetalhado, setErroDetalhado] = useState(''); // Novo estado para erro

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome.trim()) return;

    setLoading(true);
    setErroDetalhado('');

    try {
      console.log("Enviando categoria:", categoriaAtual); // Debug no Console (F12)

      const payload = {
        nome: nome,
        publica: true, 
        categoria: categoriaAtual, 
        pastaPaiId: pastaPaiId || null
      };

      await api.post('/api/pastas', payload);
      toast.success("Pasta criada com sucesso!");
      aoCriar(); 
    } catch (error) {
      console.error(error);
      // Captura a mensagem real do Backend
      const msgBackend = error.response?.data?.message || "Erro desconhecido.";
      const status = error.response?.status;
      
      // Mostra o erro na tela para sabermos o que é
      setErroDetalhado(`Erro ${status}: ${msgBackend}`);
      toast.error(`Falha: ${msgBackend}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl relative animate-in zoom-in-95 duration-200">
      <button onClick={aoCancelar} className="absolute top-4 right-4 text-slate-500 hover:text-white">
        <X size={24} />
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="bg-purple-500/20 p-3 rounded-full text-purple-400">
          <FolderPlus size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Nova Pasta</h3>
          <p className="text-xs text-slate-400 uppercase font-bold">Categoria: {categoriaAtual}</p>
        </div>
      </div>

      {/* Exibição do Erro Real */}
      {erroDetalhado && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-2 text-red-200 text-sm">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{erroDetalhado}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome da Pasta</label>
          <input 
            autoFocus
            type="text" 
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder={`Ex: Meus Dragões...`}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button 
            type="button"
            onClick={aoCancelar}
            className="px-4 py-2 text-slate-400 hover:text-white font-medium transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            disabled={loading || !nome.trim()}
            className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-purple-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Criar Pasta'}
          </button>
        </div>
      </form>
    </div>
  );
}