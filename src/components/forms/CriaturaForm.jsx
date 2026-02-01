import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { toast } from 'sonner';
import { Shield, Loader2, Save, Image as ImageIcon, X, Download, Search } from 'lucide-react';

// Pequeno dicionário para traduzir os tipos do D&D (Inglês) para o DrakDex (Português)
const TRADUCAO_TIPOS = {
  'dragon': 'Dragão',
  'monstrosity': 'Monstruosidade',
  'undead': 'Morto-vivo',
  'beast': 'Fera',
  'humanoid': 'Humanoide',
  'fiend': 'Demônio',
  'elemental': 'Elemental',
  'giant': 'Gigante',
  'construct': 'Constructo'
};

export default function CriaturaForm({ pastaId, aoCriar, criaturaParaEditar, aoCancelar }) {
  const [loading, setLoading] = useState(false);
  const [dados, setDados] = useState({
    nome: '',
    descricao: '',
    nivel: 1,
    tipo: 'Monstruosidade',
    imagemUrl: ''
  });

  // ESTADOS DO MODAL DE IMPORTAÇÃO
  const [showImportar, setShowImportar] = useState(false);
  const [monstrosExternos, setMonstrosExternos] = useState([]);
  const [termoBuscaExterno, setTermoBuscaExterno] = useState('');
  const [loadingImportacao, setLoadingImportacao] = useState(false);

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
        await api.put(`/api/criaturas/${criaturaParaEditar.id}`, dados);
        toast.success("Criatura atualizada com sucesso!");
      } else {
        const payload = { ...dados, pastaId };
        await api.post('/api/criaturas', payload);
        toast.success("Criatura invocada com sucesso!");
      }
      
      if (!criaturaParaEditar) {
        setDados({ nome: '', descricao: '', nivel: 1, tipo: 'Monstruosidade', imagemUrl: '' });
      }
      
      if (aoCriar) aoCriar();
    } catch (error) {
      toast.error("Erro: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA DE IMPORTAÇÃO ---

  const abrirImportacao = async () => {
    setShowImportar(true);
    setLoadingImportacao(true);
    try {
      // Busca a lista simples (index, name, url)
      const res = await api.get('/api/external/monsters');
      setMonstrosExternos(res.data.results || []);
    } catch (error) {
      toast.error("Erro ao conectar com o compêndio de D&D.");
      setShowImportar(false);
    } finally {
      setLoadingImportacao(false);
    }
  };

  const importarMonstro = async (index) => {
    setLoadingImportacao(true);
    try {
      // Busca os detalhes completos do monstro escolhido
      const res = await api.get(`/api/external/monsters/${index}`);
      const monstro = res.data;

      // Mapeia os dados da API (Inglês) para o nosso formulário
      const tipoTraduzido = TRADUCAO_TIPOS[monstro.type] || 'Monstruosidade';
      
      setDados({
        ...dados,
        nome: monstro.name,
        // Constrói uma descrição baseada nos stats
        descricao: `HP: ${monstro.hit_points} (AC ${monstro.armor_class?.[0]?.value || 10})\n` +
                   `Tamanho: ${monstro.size}\n` +
                   `Alinhamento: ${monstro.alignment}`,
        nivel: Math.max(1, Math.round(monstro.challenge_rating || 1)), // CR vira Nível
        tipo: tipoTraduzido,
        imagemUrl: `https://www.dnd5eapi.co${monstro.image || ''}` // Alguns têm imagem, outros não
      });

      toast.success(`${monstro.name} importado!`);
      setShowImportar(false);
    } catch (error) {
      toast.error("Erro ao importar detalhes.");
    } finally {
      setLoadingImportacao(false);
    }
  };

  // Filtra a lista do modal
  const monstrosFiltrados = monstrosExternos.filter(m => 
    m.name.toLowerCase().includes(termoBuscaExterno.toLowerCase())
  );

  const inputClass = "w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:border-rose-500 outline-none";
  const labelClass = "block text-xs font-bold text-slate-400 mb-1 uppercase";

  return (
    <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm animate-in fade-in relative">
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Shield className="text-rose-500" /> {criaturaParaEditar ? 'Editar Criatura' : 'Nova Criatura'}
        </h2>
        
        {/* BOTÃO IMPORTAR D&D */}
        {!criaturaParaEditar && (
          <button 
            type="button"
            onClick={abrirImportacao}
            className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded flex items-center gap-2 transition-colors"
          >
            <Download size={14} /> Importar D&D 5e
          </button>
        )}
      </div>

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
              <option value="Gigante">Gigante</option>
              <option value="Constructo">Constructo</option>
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
            <label className={labelClass}>Nível (CR)</label>
            <input type="number" name="nivel" value={dados.nivel} onChange={handleChange} className={inputClass} min="0" max="30" />
          </div>
          <div className="col-span-3">
            <label className={labelClass}>Descrição / Stats</label>
            <textarea name="descricao" value={dados.descricao} onChange={handleChange} className={`${inputClass} h-24 resize-none`} placeholder="Descreva os perigos desta criatura..." />
          </div>
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
            {loading ? <Loader2 className="animate-spin"/> : <><Save size={18}/> {criaturaParaEditar ? 'Atualizar' : 'Invocar'}</>}
          </button>
        </div>
      </form>

      {/* --- MODAL DE IMPORTAÇÃO (OVERLAY) --- */}
      {showImportar && (
        <div className="absolute inset-0 z-20 bg-slate-900/95 backdrop-blur rounded-2xl p-4 flex flex-col animate-in fade-in">
          <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
            <h3 className="font-bold text-white flex gap-2"><Download className="text-indigo-500"/> Compêndio D&D</h3>
            <button onClick={() => setShowImportar(false)} className="text-slate-400 hover:text-white"><X size={20}/></button>
          </div>

          {/* Busca Interna no Modal */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
            <input 
              autoFocus
              className="w-full bg-slate-800 border border-slate-600 rounded p-2 pl-9 text-white focus:border-indigo-500 outline-none"
              placeholder="Buscar (ex: goblin, orc, dragon)..."
              value={termoBuscaExterno}
              onChange={e => setTermoBuscaExterno(e.target.value)}
            />
          </div>

          {/* Lista de Resultados */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
            {loadingImportacao && monstrosExternos.length === 0 ? (
              <div className="flex justify-center p-4"><Loader2 className="animate-spin text-indigo-500"/></div>
            ) : (
              monstrosFiltrados.slice(0, 50).map((monstro) => ( // Limite de 50 para não pesar
                <button 
                  key={monstro.index}
                  onClick={() => importarMonstro(monstro.index)}
                  className="w-full text-left p-3 rounded bg-slate-800 hover:bg-indigo-600/20 border border-slate-700 hover:border-indigo-500 transition-all flex justify-between items-center group"
                >
                  <span className="font-bold text-slate-300 group-hover:text-white">{monstro.name}</span>
                  <span className="text-xs text-slate-500 uppercase">Selecionar</span>
                </button>
              ))
            )}
            {monstrosFiltrados.length === 0 && !loadingImportacao && (
              <p className="text-center text-slate-500 mt-4">Nenhum monstro encontrado.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}