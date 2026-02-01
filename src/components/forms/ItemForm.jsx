import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { toast } from 'sonner';
import { Sword, Loader2, Save, Image as ImageIcon, X } from 'lucide-react';

export default function ItemForm({ aoCriar, pastaId, itemParaEditar, aoCancelar }) {
  const [loading, setLoading] = useState(false);
  const [dados, setDados] = useState({
    nome: '',
    descricao: '',
    tipo: 'ARMA',
    raridade: 'COMUM',
    peso: '',
    preco: '',
    dano: '',
    defesa: '',
    propriedades: '',
    imagemUrl: ''
  });

  // Efeito para carregar dados se for edição
  useEffect(() => {
    if (itemParaEditar) {
      setDados({
        nome: itemParaEditar.nome,
        descricao: itemParaEditar.descricao || '',
        tipo: itemParaEditar.tipo,
        raridade: itemParaEditar.raridade,
        peso: itemParaEditar.peso || '',
        preco: itemParaEditar.preco || '',
        dano: itemParaEditar.dano || '',
        defesa: itemParaEditar.defesa || '',
        propriedades: itemParaEditar.propriedades || '',
        imagemUrl: itemParaEditar.imagemUrl || ''
      });
    } else {
      setDados({ nome: '', descricao: '', tipo: 'ARMA', raridade: 'COMUM', peso: '', preco: '', dano: '', defesa: '', propriedades: '', imagemUrl: '' });
    }
  }, [itemParaEditar]);

  const handleChange = (e) => {
    setDados({ ...dados, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { 
        ...dados, 
        peso: dados.peso ? parseFloat(dados.peso) : null,
        pastaId: pastaId // Ignorado pelo backend no PUT, mas necessário no POST
      };

      if (itemParaEditar) {
        // MODO EDIÇÃO (PUT)
        await api.put(`/api/itens/${itemParaEditar.id}`, payload);
        toast.success("Item reforjado com sucesso!");
      } else {
        // MODO CRIAÇÃO (POST)
        await api.post('/api/itens', payload);
        toast.success("Item forjado com sucesso!");
      }
      
      if (!itemParaEditar) {
        setDados({ nome: '', descricao: '', tipo: 'ARMA', raridade: 'COMUM', peso: '', preco: '', dano: '', defesa: '', propriedades: '', imagemUrl: '' });
      }
      
      if (aoCriar) aoCriar();
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
        <Sword className="text-rose-500" /> {itemParaEditar ? 'Reforjar Item' : 'Forjar Novo Item'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className={labelClass}>Nome do Item</label>
            <input name="nome" value={dados.nome} onChange={handleChange} className={inputClass} placeholder="Ex: Espada Vorpal" required />
          </div>
          <div>
            <label className={labelClass}>Preço (Valor)</label>
            <input name="preco" value={dados.preco} onChange={handleChange} className={inputClass} placeholder="Ex: 500 PO" />
          </div>
        </div>

        <div>
          <label className={labelClass}>URL da Imagem (Opcional)</label>
          <div className="relative">
            <ImageIcon className="absolute left-3 top-2.5 text-slate-500" size={18} />
            <input name="imagemUrl" value={dados.imagemUrl} onChange={handleChange} className={`${inputClass} pl-10`} placeholder="https://..." />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Tipo</label>
            <select name="tipo" value={dados.tipo} onChange={handleChange} className={inputClass}>
              <option value="ARMA">Arma</option>
              <option value="ARMADURA">Armadura / Escudo</option>
              <option value="ACESSORIO">Acessório</option>
              <option value="CONSUMIVEL">Consumível</option>
              <option value="TESOURO">Tesouro</option>
              <option value="FERRAMENTA">Ferramenta</option>
              <option value="OUTRO">Outro</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Raridade</label>
            <select name="raridade" value={dados.raridade} onChange={handleChange} className={inputClass}>
              <option value="COMUM">⚪ Comum</option>
              <option value="INCOMUM">🟢 Incomum</option>
              <option value="RARO">🔵 Raro</option>
              <option value="EPICO">🟣 Épico</option>
              <option value="LENDARIO">🟠 Lendário</option>
              <option value="ARTEFATO">🔴 Artefato</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Peso (Kg)</label>
            <input type="number" step="0.1" name="peso" value={dados.peso} onChange={handleChange} className={inputClass} placeholder="0.0" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 bg-slate-900/50 p-3 rounded border border-slate-800">
          <div>
            <label className={labelClass}>Dano (Se Arma)</label>
            <input name="dano" value={dados.dano} onChange={handleChange} className={inputClass} placeholder="Ex: 1d8 + 2" />
          </div>
          <div>
            <label className={labelClass}>Defesa (Se Armadura)</label>
            <input name="defesa" value={dados.defesa} onChange={handleChange} className={inputClass} placeholder="Ex: +2 AC" />
          </div>
        </div>

        <div>
          <label className={labelClass}>Descrição / Propriedades</label>
          <textarea name="descricao" value={dados.descricao} onChange={handleChange} className={`${inputClass} h-24 resize-none`} placeholder="Detalhes do item..." />
        </div>

        <div className="flex gap-3 pt-2">
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
            {loading ? <Loader2 className="animate-spin"/> : <><Save size={18}/> {itemParaEditar ? 'Salvar Mudanças' : 'Salvar no Arsenal'}</>}
          </button>
        </div>

      </form>
    </div>
  );
}