import { useState } from 'react';
import { api } from '../../services/api';
import { toast } from 'sonner';
import { Shield, Loader2, Save, Image as ImageIcon } from 'lucide-react';

export default function CriaturaForm({ pastaId, aoCriar }) {
  const [loading, setLoading] = useState(false);
  const [dados, setDados] = useState({
    nome: '',
    descricao: '',
    nivel: 1,
    tipo: 'Monstruosidade',
    imagemUrl: '' // <--- NOVO CAMPO NO ESTADO
  });

  const handleChange = (e) => {
    setDados({ ...dados, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...dados, pastaId };
      const response = await api.post('/api/criaturas', payload);
      toast.success("Criatura invocada com sucesso!");
      
      // Limpar form
      setDados({ nome: '', descricao: '', nivel: 1, tipo: 'Monstruosidade', imagemUrl: '' });
      
      if (aoCriar) aoCriar(response.data);
    } catch (error) {
      toast.error("Erro ao invocar: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:border-rose-500 outline-none";
  const labelClass = "block text-xs font-bold text-slate-400 mb-1 uppercase";

  return (
    <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm animate-in fade-in">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Shield className="text-rose-500" /> Nova Criatura
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

        {/* 👇 NOVO CAMPO DE URL DE IMAGEM */}
        <div>
          <label className={labelClass}>URL da Imagem (Opcional)</label>
          <div className="relative">
            <ImageIcon className="absolute left-3 top-2.5 text-slate-500" size={18} />
            <input 
              name="imagemUrl" 
              value={dados.imagemUrl} 
              onChange={handleChange} 
              className={`${inputClass} pl-10`} 
              placeholder="https://..." 
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-1 ml-1">Cole o link direto de uma imagem (JPG, PNG, WebP).</p>
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

        <button type="submit" disabled={loading} className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded transition-all flex justify-center items-center gap-2">
          {loading ? <Loader2 className="animate-spin"/> : <><Save size={18}/> Invocar no Bestiário</>}
        </button>

      </form>
    </div>
  );
}