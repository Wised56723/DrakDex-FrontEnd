import { useState } from 'react';
import { api } from './services/api';
import { toast } from 'sonner';
import { Scroll, Shield, Zap, Loader2 } from 'lucide-react';

export default function CriaturaForm({ aoCriar, pastaId }) {
  const [dados, setDados] = useState({
    nome: '',
    tipo: '',
    nivel: 1,
    descricao: ''
  });
  const [enviando, setEnviando] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDados(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      // Adicionamos o pastaId ao objeto que vai para o backend
      const payload = { ...dados, pastaId: pastaId };
      
      const response = await api.post('/api/criaturas', payload);
      
      toast.success('Criatura invocada com sucesso! 🐉');
      
      setDados({ nome: '', tipo: '', nivel: 1, descricao: '' });
      if (aoCriar) aoCriar(response.data);
    } catch (error) {
      toast.error('Falha na invocação: ' + (error.response?.data?.message || error.message));
    } finally {
      setEnviando(false);
    }
  };

  const inputClass = "w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-rose-600 focus:outline-none transition-colors";
  const labelClass = "block text-sm font-bold text-slate-400 mb-1 flex items-center gap-2";

  return (
    <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-xl">
      <div className="flex items-center gap-3 mb-6 text-rose-500">
        <Zap size={24} />
        <h2 className="text-xl font-bold text-white">Detalhes da Invocação</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Nome da Criatura</label>
          <input
            name="nome"
            value={dados.nome}
            onChange={handleChange}
            placeholder="Ex: Lobo Cinzento"
            className={inputClass}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}><Shield size={14}/> Tipo</label>
            <input
              name="tipo"
              value={dados.tipo}
              onChange={handleChange}
              placeholder="Ex: Animal"
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Nível</label>
            <input
              type="number"
              name="nivel"
              value={dados.nivel}
              onChange={handleChange}
              min="1"
              className={inputClass}
              required
            />
          </div>
        </div>

        <div>
          <label className={labelClass}><Scroll size={14}/> Descrição / Lore</label>
          <textarea
            name="descricao"
            value={dados.descricao}
            onChange={handleChange}
            placeholder="Pelagem grossa, dentes afiados..."
            className={`${inputClass} h-32 resize-none`}
          />
        </div>

        <button
          type="submit"
          disabled={enviando}
          className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-rose-900/20 flex justify-center items-center gap-2 mt-2"
        >
          {enviando ? <Loader2 className="animate-spin" /> : (
            <>
              <Scroll size={20} />
              {pastaId ? "Salvar nesta Pasta" : "Salvar no Bestiário"}
            </>
          )}
        </button>
      </form>
    </div>
  );
}