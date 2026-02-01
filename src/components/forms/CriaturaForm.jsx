import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { toast } from 'sonner';
import { Shield, Loader2, Save, Image as ImageIcon, X } from 'lucide-react';

export default function CriaturaForm({ pastaId, aoCriar, criaturaParaEditar, aoCancelar }) {
  const [loading, setLoading] = useState(false);
  const [dados, setDados] = useState({
    nome: '',
    descricao: '',
    nivel: 1,
    tipo: 'Monstruosidade',
    imagemUrl: ''
  });

  // Efeito para carregar dados se for edição
  useEffect(() => {
    if (criaturaParaEditar) {
      setDados({
        nome: criaturaParaEditar.nome,
        descricao: criaturaParaEditar.descricao || '',
        nivel: criaturaParaEditar.nivel,
        tipo: criaturaParaEditar.tipo,
        imagemUrl: criaturaParaEditar.imagemUrl || ''
      });
    } else {
      // Limpa se for criação nova
      setDados({ nome: '', descricao: '', nivel: 1, tipo: 'Monstruosidade', imagemUrl: '' });
    }
  }, [criaturaParaEditar]);

  const handleChange = (e) => {
    setDados({ ...dados, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (criaturaParaEditar) {
        // MODO EDIÇÃO (PUT)
        await api.put(`/api/criaturas/${criaturaParaEditar.id}`, dados);
        toast.success("Criatura atualizada com sucesso!");
      } else {
        // MODO CRIAÇÃO (POST)
        const payload = { ...dados, pastaId };
        await api.post('/api/criaturas', payload);
        toast.success("Criatura invocada com sucesso!");
      }
      
      // Limpar form se não for edição (ou fechar form)
      if (!criaturaParaEditar) {
        setDados({ nome: '', descricao: '', nivel: 1, tipo: 'Monstruosidade', imagemUrl: '' });
      }
      
      if (aoCriar) aoCriar(); // Recarrega a lista
    } catch (error) {
      toast.error("Erro: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:border-rose-500 outline-none";
  const labelClass = "block text-xs font-bold text-slate-400 mb-1 uppercase";

  return (
    <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm animate-in fade-in">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Shield className="text-rose-500" /> {criaturaParaEditar ? 'Editar Criatura' : 'Nova Criatura'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Nome da Criatura</label>
            <input name="nome" value={dados.nome} onChange={handleChange} className={inputClass} placeholder="Ex: Dragão Vermelho" required />
          </div>
          <div>
            <label className={labelClass}>Tipo</label>
            <select name="tipo" value={dados.tipo} onChange={handleChange} className={inputClass}>
              <option value="Monstruosidade">Monstruosidade</option>
              <option value="Dragão">Dragão</option>
              <option value="Morto-vivo">Morto-vivo</option>
              <option value="Fera">Fera</option>
              <option value="Humanoide">Humanoide</option>
              <option value="Demônio">Demônio</option>
              <option value="Elemental">Elemental</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>URL da Imagem (Opcional)</label>
          <div className="relative">
            <ImageIcon className="absolute left-3 top-2.5 text-slate-500" size={18} />
            <input name="imagemUrl" value={dados.imagemUrl} onChange={handleChange} className={`${inputClass} pl-10`} placeholder="https://..." />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-1">
            <label className={labelClass}>Nível</label>
            <input type="number" name="nivel" value={dados.nivel} onChange={handleChange} className={inputClass} min="0" max="30" />
          </div>
          <div className="col-span-3">
            <label className={labelClass}>Descrição / Lore</label>
            <textarea name="descricao" value={dados.descricao} onChange={handleChange} className={`${inputClass} h-24 resize-none`} placeholder="Descreva os perigos desta criatura..." />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          {/* Botão Cancelar (Aparece sempre agora, útil para fechar o modo edição) */}
          <button 
            type="button" 
            onClick={aoCancelar}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded transition-all flex justify-center items-center gap-2"
          >
            <X size={18}/> Cancelar
          </button>

          <button 
            type="submit" 
            disabled={loading} 
            className="flex-[2] bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded transition-all flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin"/> : <><Save size={18}/> {criaturaParaEditar ? 'Atualizar' : 'Invocar'}</>}
          </button>
        </div>

      </form>
    </div>
  );
}