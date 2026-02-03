import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { toast } from 'sonner';
import { Sparkles, Loader2, Save, X, BookOpen } from 'lucide-react';

export default function MagiaForm({ aoCriar, pastaId, magiaParaEditar, aoCancelar }) {
  const [loading, setLoading] = useState(false);
  const [dados, setDados] = useState({
    nome: '',
    escola: '',
    tempoExecucao: '',
    alcance: '',
    duracao: '',
    componentes: '',
    custo: '',
    sistema: 'D&D 5e',
    descricao: ''
  });

  useEffect(() => {
    if (magiaParaEditar) {
      setDados({
        nome: magiaParaEditar.nome,
        escola: magiaParaEditar.escola || '',
        tempoExecucao: magiaParaEditar.tempoExecucao || '',
        alcance: magiaParaEditar.alcance || '',
        duracao: magiaParaEditar.duracao || '',
        componentes: magiaParaEditar.componentes || '',
        custo: magiaParaEditar.custo || '',
        sistema: magiaParaEditar.sistema || 'D&D 5e',
        descricao: magiaParaEditar.descricao || ''
      });
    } else {
      setDados({ nome: '', escola: '', tempoExecucao: '', alcance: '', duracao: '', componentes: '', custo: '', sistema: 'D&D 5e', descricao: '' });
    }
  }, [magiaParaEditar]);

  const handleChange = (e) => {
    setDados({ ...dados, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...dados, pastaId };

      if (magiaParaEditar) {
        await api.put(`/api/magias/${magiaParaEditar.id}`, payload);
        toast.success("Magia reescrita no grimório!");
      } else {
        await api.post('/api/magias', payload);
        toast.success("Nova magia aprendida!");
      }
      
      if (!magiaParaEditar) {
        setDados({ nome: '', escola: '', tempoExecucao: '', alcance: '', duracao: '', componentes: '', custo: '', sistema: 'D&D 5e', descricao: '' });
      }
      
      if (aoCriar) aoCriar();
    } catch (error) {
      toast.error("Erro: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:border-purple-500 outline-none placeholder-slate-600";
  const labelClass = "block text-xs font-bold text-purple-400/80 mb-1 uppercase tracking-wider";

  return (
    <div className="bg-slate-950/80 p-6 rounded-2xl border border-purple-500/20 backdrop-blur-sm animate-in fade-in shadow-2xl shadow-purple-900/10">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-slate-800 pb-4">
        <BookOpen className="text-purple-500" /> {magiaParaEditar ? 'Reescrever Magia' : 'Inscrever Nova Magia'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Linha 1: Nome e Escola */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className={labelClass}>Nome da Magia</label>
            <input name="nome" value={dados.nome} onChange={handleChange} className={inputClass} placeholder="Ex: Bola de Fogo" required autoFocus />
          </div>
          <div>
            <label className={labelClass}>Escola / Tipo</label>
            <input name="escola" value={dados.escola} onChange={handleChange} className={inputClass} placeholder="Ex: Evocação" />
          </div>
        </div>

        {/* Linha 2: Stats Técnicos */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className={labelClass}>Tempo</label>
            <input name="tempoExecucao" value={dados.tempoExecucao} onChange={handleChange} className={inputClass} placeholder="Ex: 1 Ação" />
          </div>
          <div>
            <label className={labelClass}>Alcance</label>
            <input name="alcance" value={dados.alcance} onChange={handleChange} className={inputClass} placeholder="Ex: 18m" />
          </div>
          <div>
            <label className={labelClass}>Duração</label>
            <input name="duracao" value={dados.duracao} onChange={handleChange} className={inputClass} placeholder="Ex: Instantâneo" />
          </div>
          <div>
            <label className={labelClass}>Custo / Nível</label>
            <input name="custo" value={dados.custo} onChange={handleChange} className={inputClass} placeholder="Ex: Slot Nvl 3" />
          </div>
        </div>

        {/* Linha 3: Detalhes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Componentes</label>
            <input name="componentes" value={dados.componentes} onChange={handleChange} className={inputClass} placeholder="Ex: V, S, M (Enxofre)" />
          </div>
          <div>
            <label className={labelClass}>Sistema de Regra</label>
            <input name="sistema" value={dados.sistema} onChange={handleChange} className={inputClass} placeholder="Ex: D&D 5e, Tormenta..." />
          </div>
        </div>

        {/* Descrição */}
        <div>
          <label className={labelClass}>Descrição do Efeito</label>
          <textarea 
            name="descricao" 
            value={dados.descricao} 
            onChange={handleChange} 
            className={`${inputClass} h-32 resize-none leading-relaxed`} 
            placeholder="Descreva o que a magia faz, dano, testes de resistência..." 
          />
        </div>

        {/* Botões */}
        <div className="flex gap-3 pt-4 border-t border-slate-800 mt-4">
          <button 
            type="button" 
            onClick={aoCancelar}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-lg transition-all flex justify-center items-center gap-2"
          >
            <X size={18}/> Cancelar
          </button>
          
          <button 
            type="submit" 
            disabled={loading} 
            className="flex-[2] bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-all flex justify-center items-center gap-2 shadow-lg shadow-purple-900/20"
          >
            {loading ? <Loader2 className="animate-spin"/> : <><Save size={18}/> {magiaParaEditar ? 'Salvar Alterações' : 'Inscrever Magia'}</>}
          </button>
        </div>

      </form>
    </div>
  );
}