import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { toast } from 'sonner';
import { 
  User, Loader2, Save, X, Shield, Heart, Skull, 
  Sword, Scroll, BookOpen, AlertCircle 
} from 'lucide-react';

export default function NpcForm({ aoCriar, pastaId, npcParaEditar, aoCancelar }) {
  const [loading, setLoading] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState('GERAL'); // GERAL, COMBATE, INVENTARIO
  
  // Listas para seleção (carregadas do backend)
  const [todosItens, setTodosItens] = useState([]);
  const [todasMagias, setTodasMagias] = useState([]);

  const [dados, setDados] = useState({
    nome: '',
    tipoFicha: 'DND5E', // Default
    aparencia: '',
    personalidade: '',
    historia: '',
    
    // D&D
    nivelDesafio: 0,
    classeArmadura: 10,
    pontosVida: 10,
    forca: 10,
    destreza: 10,
    constituicao: 10,
    inteligencia: 10,
    sabedoria: 10,
    carisma: 10,

    // Livre
    regrasCustomizadas: '',

    // Relacionamentos (IDs)
    equipamentosIds: [],
    magiasIds: []
  });

  // 1. Carregar dados iniciais e listas de seleção
  useEffect(() => {
    carregarRecursos();
    
    if (npcParaEditar) {
      setDados({
        ...npcParaEditar,
        // Garante que as listas sejam arrays de IDs para o formulário
        equipamentosIds: npcParaEditar.equipamentos?.map(i => i.id) || [],
        magiasIds: npcParaEditar.magiasConhecidas?.map(m => m.id) || []
      });
    }
  }, [npcParaEditar]);

  // Busca todos os itens e magias do usuário para ele poder escolher
  const carregarRecursos = async () => {
    try {
      // Busca pastas de itens
      const resItens = await api.get('/api/pastas/me', { params: { categoria: 'ITEM' } });
      const itensFlat = resItens.data.flatMap(pasta => pasta.itens || []);
      setTodosItens(itensFlat);

      // Busca pastas de magias
      const resMagias = await api.get('/api/pastas/me', { params: { categoria: 'MAGIA' } });
      const magiasFlat = resMagias.data.flatMap(pasta => pasta.magias || []);
      setTodasMagias(magiasFlat);

    } catch (error) {
      console.error("Erro ao carregar recursos", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setDados(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  // Toggle para seleção múltipla (Itens/Magias)
  const toggleSelection = (id, field) => {
    setDados(prev => {
      const list = prev[field];
      if (list.includes(id)) {
        return { ...prev, [field]: list.filter(item => item !== id) };
      } else {
        return { ...prev, [field]: [...list, id] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...dados, pastaId };

      if (npcParaEditar) {
        await api.put(`/api/npcs/${npcParaEditar.id}`, payload);
        toast.success("NPC atualizado!");
      } else {
        await api.post('/api/npcs', payload);
        toast.success("Novo NPC criado!");
      }
      if (aoCriar) aoCriar();
    } catch (error) {
      toast.error("Erro: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Estilos
  const inputClass = "w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:border-yellow-500 outline-none placeholder-slate-600";
  const labelClass = "block text-xs font-bold text-yellow-500/80 mb-1 uppercase tracking-wider";
  const tabClass = (tab) => `flex-1 py-2 text-sm font-bold border-b-2 transition-colors ${abaAtiva === tab ? 'border-yellow-500 text-yellow-500 bg-yellow-500/10' : 'border-transparent text-slate-500 hover:text-slate-300'}`;
  const itemSelectClass = (selected) => `p-3 rounded-lg border text-sm cursor-pointer transition-all flex items-center justify-between ${selected ? 'bg-yellow-500/20 border-yellow-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'}`;

  return (
    <div className="bg-slate-950/90 p-0 md:p-6 rounded-2xl border border-yellow-500/20 backdrop-blur-sm animate-in fade-in shadow-2xl h-full flex flex-col">
      
      {/* Header */}
      <div className="p-4 md:p-0 border-b border-slate-800 mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <User className="text-yellow-500" /> {npcParaEditar ? 'Editar NPC' : 'Criar NPC'}
        </h2>
        <div className="bg-slate-900 p-1 rounded-lg flex text-xs">
          <button onClick={() => setDados({...dados, tipoFicha: 'DND5E'})} className={`px-3 py-1 rounded ${dados.tipoFicha === 'DND5E' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}>D&D 5e</button>
          <button onClick={() => setDados({...dados, tipoFicha: 'LIVRE'})} className={`px-3 py-1 rounded ${dados.tipoFicha === 'LIVRE' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}>Livre</button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
        
        {/* Tabs */}
        <div className="flex mb-4 px-4 md:px-0">
          <button type="button" onClick={() => setAbaAtiva('GERAL')} className={tabClass('GERAL')}>Geral & Lore</button>
          {dados.tipoFicha === 'DND5E' && (
            <button type="button" onClick={() => setAbaAtiva('COMBATE')} className={tabClass('COMBATE')}>Ficha D&D</button>
          )}
          <button type="button" onClick={() => setAbaAtiva('INVENTARIO')} className={tabClass('INVENTARIO')}>Inventário & Magia</button>
        </div>

        {/* Conteúdo Scrollável */}
        <div className="flex-1 overflow-y-auto px-4 md:px-0 custom-scrollbar space-y-4">
          
          {/* ABA 1: GERAL */}
          {abaAtiva === 'GERAL' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-4">
              <div>
                <label className={labelClass}>Nome do NPC</label>
                <input name="nome" value={dados.nome} onChange={handleChange} className={inputClass} required autoFocus />
              </div>
              <div>
                <label className={labelClass}>Aparência Física</label>
                <textarea name="aparencia" value={dados.aparencia} onChange={handleChange} className={`${inputClass} h-20 resize-none`} placeholder="Alto, cicatriz no olho, usa manto vermelho..." />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Personalidade</label>
                  <textarea name="personalidade" value={dados.personalidade} onChange={handleChange} className={`${inputClass} h-32 resize-none`} placeholder="Ranzinza, leal, odeia goblins..." />
                </div>
                <div>
                  <label className={labelClass}>História / Background</label>
                  <textarea name="historia" value={dados.historia} onChange={handleChange} className={`${inputClass} h-32 resize-none`} placeholder="Nasceu em..." />
                </div>
              </div>
              
              {/* Se for LIVRE, a caixa de texto grande aparece aqui */}
              {dados.tipoFicha === 'LIVRE' && (
                <div>
                  <label className={labelClass}>Regras / Stats Customizados</label>
                  <textarea name="regrasCustomizadas" value={dados.regrasCustomizadas} onChange={handleChange} className={`${inputClass} h-40 font-mono text-sm`} placeholder="Escreva aqui os stats, perícias ou notas mecânicas..." />
                </div>
              )}
            </div>
          )}

          {/* ABA 2: COMBATE (Só D&D) */}
          {abaAtiva === 'COMBATE' && dados.tipoFicha === 'DND5E' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}><Skull size={12} className="inline mr-1"/> Nível Desafio</label>
                  <input type="number" name="nivelDesafio" value={dados.nivelDesafio} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}><Shield size={12} className="inline mr-1"/> CA (AC)</label>
                  <input type="number" name="classeArmadura" value={dados.classeArmadura} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}><Heart size={12} className="inline mr-1"/> Vida (HP)</label>
                  <input type="number" name="pontosVida" value={dados.pontosVida} onChange={handleChange} className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Atributos</label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {['forca', 'destreza', 'constituicao', 'inteligencia', 'sabedoria', 'carisma'].map(attr => (
                    <div key={attr} className="text-center">
                      <span className="text-[10px] text-slate-500 uppercase">{attr.substring(0,3)}</span>
                      <input 
                        type="number" 
                        name={attr} 
                        value={dados[attr]} 
                        onChange={handleChange} 
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-center text-white focus:border-yellow-500" 
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ABA 3: INVENTÁRIO & MAGIA */}
          {abaAtiva === 'INVENTARIO' && (
            <div className="space-y-6 animate-in fade-in">
              
              {/* Seleção de Itens */}
              <div>
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Sword size={16} className="text-blue-400"/> Equipamento (Do Arsenal)
                </h3>
                {todosItens.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Você não tem itens criados no Arsenal.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {todosItens.map(item => (
                      <div 
                        key={item.id} 
                        onClick={() => toggleSelection(item.id, 'equipamentosIds')}
                        className={itemSelectClass(dados.equipamentosIds.includes(item.id))}
                      >
                        <span className="truncate">{item.nome}</span>
                        {dados.equipamentosIds.includes(item.id) && <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Seleção de Magias */}
              <div>
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Scroll size={16} className="text-purple-400"/> Magias Conhecidas (Do Grimório)
                </h3>
                {todasMagias.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Você não tem magias criadas no Grimório.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {todasMagias.map(magia => (
                      <div 
                        key={magia.id} 
                        onClick={() => toggleSelection(magia.id, 'magiasIds')}
                        className={itemSelectClass(dados.magiasIds.includes(magia.id))}
                      >
                        <span className="truncate">{magia.nome}</span>
                        {dados.magiasIds.includes(magia.id) && <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-slate-900/50 p-3 rounded border border-slate-800 flex gap-2 items-start">
                <AlertCircle size={16} className="text-slate-500 mt-0.5 shrink-0"/>
                <p className="text-xs text-slate-500">
                  Itens e Magias selecionados aqui aparecerão linkados na ficha do NPC. Se você editar o Item original no Arsenal, o NPC será atualizado automaticamente.
                </p>
              </div>

            </div>
          )}

        </div>

        {/* Footer com Botões */}
        <div className="flex gap-3 pt-4 border-t border-slate-800 mt-4 px-4 md:px-0">
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
            className="flex-[2] bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 rounded-lg transition-all flex justify-center items-center gap-2 shadow-lg shadow-yellow-900/20"
          >
            {loading ? <Loader2 className="animate-spin"/> : <><Save size={18}/> {npcParaEditar ? 'Salvar NPC' : 'Criar NPC'}</>}
          </button>
        </div>

      </form>
    </div>
  );
}