import { useState } from 'react';
import { API_URL } from './config';
import { PlusCircle, Save, Loader2 } from 'lucide-react';
import { api } from './services/api'; // <--- Importa o Axios configurado

function CriaturaForm({ aoCriar }) {
  const [dados, setDados] = useState({ nome: '', tipo: '', nivel: 1, descricao: '' });
  const [enviando, setEnviando] = useState(false);

  const handleChange = (e) => {
    setDados({ ...dados, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
        e.preventDefault();
        setEnviando(true);
        try {
          // Usamos api.post em vez de fetch
          // Não precisamos passar headers, o api.js já coloca o Token!
          const response = await api.post('/api/criaturas', dados);
          
          const nova = response.data; // Axios devolve os dados em .data
          
          setDados({ nome: '', tipo: '', nivel: 1, descricao: '' });
          alert('Criatura invocada!');
          if (aoCriar) aoCriar(nova);
        } catch (error) {
          alert('Erro: ' + error.message);
        } finally {
          setEnviando(false);
        }
    };

  // Classes comuns para inputs (para não repetir código)
  const inputClass = "w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all";

  return (
    <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl">
      <div className="flex items-center gap-3 mb-6 text-rose-500">
        <PlusCircle size={24} />
        <h3 className="text-xl font-bold">Detalhes da Invocação</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Nome da Criatura</label>
          <input
            name="nome"
            value={dados.nome}
            onChange={handleChange}
            required
            className={inputClass}
            placeholder="Ex: Dragão do Caos"
          />
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Tipo</label>
            <input
              name="tipo"
              value={dados.tipo}
              onChange={handleChange}
              required
              className={inputClass}
              placeholder="Ex: Fogo"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Nível</label>
            <input
              name="nivel"
              type="number"
              min="1"
              value={dados.nivel}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Descrição / Lore</label>
          <textarea
            name="descricao"
            value={dados.descricao}
            onChange={handleChange}
            rows="4"
            className={inputClass}
            placeholder="Descreva os perigos desta criatura..."
          />
        </div>

        <button 
          type="submit" 
          disabled={enviando}
          className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {enviando ? <><Loader2 className="animate-spin"/> Invocando...</> : <><Save size={20}/> Salvar no Bestiário</>}
        </button>
      </form>
    </div>
  );
}

export default CriaturaForm;