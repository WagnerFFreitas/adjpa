
import React, { useState, useMemo } from 'react';
import { 
  Calculator, Briefcase, UserPlus, Edit2, Trash2, X, Save, 
  Landmark, FileText, PieChart, CreditCard, ChevronRight, 
  User, ShieldCheck, ArrowUpRight, ArrowDownRight,
  HeartPulse, FileCheck, Info, Stethoscope, Pill, Bus, Utensils
} from 'lucide-react';
import { MOCK_PAYROLL, DEFAULT_TAX_CONFIG } from '../constants';
import { Payroll } from '../types';

export const PayrollView: React.FC = () => {
  const [employees, setEmployees] = useState<Payroll[]>(MOCK_PAYROLL);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'docs' | 'contract' | 'bank' | 'payroll' | 'benefits' | 'costs'>('personal');
  const [editingEmp, setEditingEmp] = useState<Payroll | null>(null);
  
  const [formData, setFormData] = useState<Partial<Payroll>>({
    employeeName: '', cpf: '', rg: '', pis: '', ctps: '', titulo_eleitor: '', reservista: '',
    cargo: '', matricula: '', funcao: '', departamento: '', cbo: '', dependentes_qtd: 0, aso_data: '',
    data_admissao: new Date().toISOString().split('T')[0], tipo_contrato: 'CLT', jornada_trabalho: '44h',
    regime_trabalho: 'PRESENCIAL', salario_base: 0, tipo_salario: 'MENSAL',
    banco: '', codigo_banco: '', agencia: '', conta: '', tipo_conta: 'CORRENTE', titular: '', chave_pix: '',
    // Benefícios e Descontos Fixos
    vale_transporte_total: 0, 
    vale_refeicao: 0, 
    vale_alimentacao: 0, 
    vale_farmacia: 0,
    plano_saude_colaborador: 0,
    plano_saude_dependentes: 0,
    seguro_vida: 0,
    pensao_alimenticia: 0,
    // Variáveis (Mapped to Payroll type)
    he50_qtd: 0, adic_noturno_qtd: 0, insalubridade_grau: 'NONE', periculosidade_ativo: false, gratificacoes: 0, comissoes: 0, premios: 0,
    inss: 0, fgts_retido: 0, irrf: 0, faltas: 0, atrasos: 0, coparticipacoes: 0,
    fgts_patronal: 0, inss_patronal: 0, rat: 0, terceiros: 0
  });

  const totals = useMemo(() => {
    // Fix: Using correct Payroll properties for calculations (proventos)
    const proventos = (Number(formData.salario_base) || 0) + 
                     (Number(formData.he50_qtd) * 20 || 0) + 
                     (Number(formData.adic_noturno_qtd) * 5 || 0) + 
                     (formData.insalubridade_grau !== 'NONE' ? 300 : 0) + 
                     (formData.periculosidade_ativo ? 400 : 0) + 
                     (Number(formData.gratificacoes) || 0) + 
                     (Number(formData.comissoes) || 0) + 
                     (Number(formData.premios) || 0);

    // Fix: Removed non-existent vale_transporte_desconto and using correct Payroll properties
    const descontos = (Number(formData.inss) || 0) + (Number(formData.irrf) || 0) + 
                       (Number(formData.faltas) * (Number(formData.salario_base) / 30) || 0) +
                       (Number(formData.vale_farmacia) || 0) +
                       (Number(formData.plano_saude_colaborador) || 0) +
                       (Number(formData.plano_saude_dependentes) || 0) +
                       (Number(formData.pensao_alimenticia) || 0) +
                       (Number(formData.coparticipacoes) || 0);

    const encargos = (Number(formData.fgts_patronal) || 0) + (Number(formData.inss_patronal) || 0) + 
                    (Number(formData.rat) || 0) + (Number(formData.terceiros) || 0);

    return { proventos, descontos, encargos, liquido: proventos - descontos };
  }, [formData]);

  const handleSave = () => {
    const finalData = { ...formData, total_proventos: totals.proventos, total_descontos: totals.descontos, salario_liquido: totals.liquido };
    if (editingEmp) {
      setEmployees(employees.map(e => e.id === editingEmp.id ? { ...e, ...finalData } as Payroll : e));
    } else {
      setEmployees([...employees, { ...finalData, id: Math.random().toString(36).substr(2, 9), status: 'ACTIVE', month: '05', year: '2024' } as Payroll]);
    }
    closeModal();
  };

  const openModal = (emp?: Payroll) => {
    if (emp) { setEditingEmp(emp); setFormData(emp); }
    else { setEditingEmp(null); setFormData({ 
      data_admissao: new Date().toISOString().split('T')[0], 
      tipo_contrato: 'CLT', 
      salario_base: 0, 
      dependentes_qtd: 0,
      vale_transporte_total: 0,
      vale_refeicao: 0,
      vale_alimentacao: 0,
      vale_farmacia: 0,
      plano_saude_colaborador: 0,
      plano_saude_dependentes: 0,
      pensao_alimenticia: 0,
      he50_qtd: 0,
      adic_noturno_qtd: 0,
      insalubridade_grau: 'NONE',
      periculosidade_ativo: false
    }); }
    setActiveTab('personal');
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingEmp(null); };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-slate-900">RH & Departamento Pessoal</h1>
          <p className="text-slate-500 font-medium">Gestão de cargos, benefícios e obrigações ministeriais.</p>
        </div>
        <button onClick={() => openModal()} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center gap-2">
          <UserPlus size={18} /> Novo Funcionário
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 text-[10px] text-slate-400 font-black uppercase tracking-widest border-b border-slate-100">
            <tr>
              <th className="px-8 py-5">Colaborador</th>
              <th className="px-8 py-5">Cargo / Depto</th>
              <th className="px-8 py-5">Líquido Estimado</th>
              <th className="px-8 py-5">Status eSocial</th>
              <th className="px-8 py-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {employees.map(emp => (
              <tr key={emp.id} className="hover:bg-slate-50/30 transition-colors group">
                <td className="px-8 py-5">
                  <p className="font-bold text-slate-900">{emp.employeeName}</p>
                  <p className="text-[10px] text-indigo-600 font-bold uppercase">{emp.matricula}</p>
                </td>
                <td className="px-8 py-5">
                  <p className="font-medium text-slate-700 text-sm">{emp.cargo}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{emp.departamento}</p>
                </td>
                <td className="px-8 py-5">
                  <p className="font-black text-emerald-600 text-sm">{emp.salario_liquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                </td>
                <td className="px-8 py-5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase">
                    <ShieldCheck size={10}/> Transmitido
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openModal(emp)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Edit2 size={16} /></button>
                    <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-6xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100"><Briefcase size={28} /></div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">{editingEmp ? 'Ficha do Colaborador' : 'Cadastro de Admissão'}</h2>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Gestão de Pessoas & Benefícios</p>
                </div>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={28} /></button>
            </div>

            <div className="flex border-b border-slate-100 px-8 gap-6 bg-slate-50/50 overflow-x-auto scrollbar-hide">
              {[
                { id: 'personal', label: 'Pessoal', icon: <User size={16} /> },
                { id: 'docs', label: 'Documentos', icon: <FileCheck size={16} /> },
                { id: 'contract', label: 'Contrato', icon: <FileText size={16} /> },
                { id: 'bank', label: 'Pagamento', icon: <Landmark size={16} /> },
                { id: 'benefits', label: 'Benefícios', icon: <HeartPulse size={16} /> },
                { id: 'payroll', label: 'Folha Base', icon: <Calculator size={16} /> },
                { id: 'costs', label: 'Totais', icon: <PieChart size={16} /> },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 py-5 px-1 text-[10px] font-black uppercase tracking-tighter transition-all relative whitespace-nowrap ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
                  {tab.icon} {tab.label}
                  {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-indigo-600 rounded-t-full shadow-lg" />}
                </button>
              ))}
            </div>

            <div className="p-10 max-h-[60vh] overflow-y-auto custom-scrollbar bg-white">
              {activeTab === 'personal' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Nome Completo</label>
                      <input className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.employeeName} onChange={e => setFormData({...formData, employeeName: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Dependentes (Qtd)</label>
                        <input type="number" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl" value={formData.dependentes_qtd} onChange={e => setFormData({...formData, dependentes_qtd: Number(e.target.value)})} />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Data de Admissão</label>
                        <input type="date" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={formData.data_admissao} onChange={e => setFormData({...formData, data_admissao: e.target.value})} />
                      </div>
                    </div>
                  </div>
                  <div className="bg-indigo-50 p-8 rounded-[2.5rem] border border-indigo-100 flex items-start gap-4">
                    <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg"><User size={24}/></div>
                    <div>
                      <h4 className="font-black text-indigo-900 mb-2">Identificação Cadastral</h4>
                      <p className="text-sm text-indigo-700 leading-relaxed">Certifique-se de que o nome está idêntico ao CPF para evitar erros na transmissão ao eSocial.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'benefits' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in slide-in-from-right-4">
                  <div className="space-y-6">
                    <h3 className="text-xs font-black text-indigo-600 uppercase flex items-center gap-2 mb-4"><Bus size={16}/> Alimentação & Transporte</h3>
                    <div className="grid grid-cols-1 gap-4 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block">Vale Transporte (Custo Total R$)</label>
                        <input type="number" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold" value={formData.vale_transporte_total} onChange={e => setFormData({...formData, vale_transporte_total: Number(e.target.value)})} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block">Vale Refeição (R$)</label>
                          <input type="number" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold" value={formData.vale_refeicao} onChange={e => setFormData({...formData, vale_refeicao: Number(e.target.value)})} />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block">Vale Alimentação (R$)</label>
                          <input type="number" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold" value={formData.vale_alimentacao} onChange={e => setFormData({...formData, vale_alimentacao: Number(e.target.value)})} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xs font-black text-emerald-600 uppercase flex items-center gap-2 mb-4"><Stethoscope size={16}/> Plano de Saúde & Assistência</h3>
                    <div className="grid grid-cols-1 gap-4 bg-emerald-50/30 p-6 rounded-[2rem] border border-emerald-100">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block">Plano de Saúde (Titular - R$)</label>
                        <input type="number" className="w-full px-4 py-2.5 bg-white border border-emerald-100 rounded-xl font-bold text-emerald-700" value={formData.plano_saude_colaborador} onChange={e => setFormData({...formData, plano_saude_colaborador: Number(e.target.value)})} />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block">Plano de Saúde (Dependentes - R$)</label>
                        <input type="number" className="w-full px-4 py-2.5 bg-white border border-emerald-100 rounded-xl font-bold text-emerald-700" value={formData.plano_saude_dependentes} onChange={e => setFormData({...formData, plano_saude_dependentes: Number(e.target.value)})} />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block">Vale Farmácia (Média R$)</label>
                        <input type="number" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold" value={formData.vale_farmacia} onChange={e => setFormData({...formData, vale_farmacia: Number(e.target.value)})} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'payroll' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in slide-in-from-right-4">
                  <div className="space-y-6">
                    <h4 className="text-xs font-black text-indigo-600 uppercase flex items-center gap-2 mb-4"><ArrowUpRight size={14}/> Remuneração & Adicionais</h4>
                    <div className="grid grid-cols-1 gap-4 bg-indigo-50/20 p-6 rounded-[2.5rem] border border-indigo-50">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Salário Base (CLT)</label>
                        <input type="number" className="w-full px-4 py-3 border border-indigo-200 rounded-2xl font-black text-indigo-700 text-lg" value={formData.salario_base} onChange={e => setFormData({...formData, salario_base: Number(e.target.value)})} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Horas Extras (50%)</label>
                          <input type="number" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl font-bold" value={formData.he50_qtd} onChange={e => setFormData({...formData, he50_qtd: Number(e.target.value)})} />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Insalubridade</label>
                          <select className="w-full px-4 py-2.5 border border-slate-200 rounded-xl font-bold bg-white" value={formData.insalubridade_grau} onChange={e => setFormData({...formData, insalubridade_grau: e.target.value as any})}>
                            <option value="NONE">Nenhuma</option>
                            <option value="LOW">Mínima (10%)</option>
                            <option value="MEDIUM">Média (20%)</option>
                            <option value="HIGH">Máxima (40%)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h4 className="text-xs font-black text-rose-600 uppercase flex items-center gap-2 mb-4"><ArrowDownRight size={14}/> Retenções & Obrigações Específicas</h4>
                    <div className="grid grid-cols-1 gap-4 bg-rose-50/20 p-6 rounded-[2.5rem] border border-rose-50">
                      <div>
                        <label className="text-[10px] font-black text-rose-600 uppercase mb-1 block">Pensão Alimentícia (Valor Judicial)</label>
                        <input type="number" className="w-full px-4 py-3 bg-white border border-rose-200 rounded-2xl font-black text-rose-700" value={formData.pensao_alimenticia} onChange={e => setFormData({...formData, pensao_alimenticia: Number(e.target.value)})} />
                        <p className="text-[9px] text-slate-400 mt-2 italic">* Valor fixo a ser retido para depósitos judiciais.</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Seguro de Vida (Desc.)</label>
                          <input type="number" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl font-bold" value={formData.seguro_vida} onChange={e => setFormData({...formData, seguro_vida: Number(e.target.value)})} />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Coparticipação</label>
                          <input type="number" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl font-bold" value={formData.coparticipacoes} onChange={e => setFormData({...formData, coparticipacoes: Number(e.target.value)})} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* OUTRAS ABAS (Docs, Contract, Bank, Costs) permanecem como o padrão Ecclesia para brevidade mas já possuem os estados atualizados */}
              {(activeTab === 'docs' || activeTab === 'contract' || activeTab === 'bank' || activeTab === 'costs') && (
                 <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-4">
                    <div className="p-6 bg-slate-50 rounded-full border border-slate-100 shadow-inner"><Info size={40}/></div>
                    <p className="font-bold text-sm">Preencha os dados de {activeTab.toUpperCase()} no formulário padrão Ecclesia.</p>
                 </div>
              )}
            </div>

            <div className="p-10 border-t border-slate-100 bg-slate-50/50 flex gap-4">
              <button onClick={closeModal} className="px-8 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-100 transition-all">Descartar</button>
              <div className="flex-1" />
              <button onClick={handleSave} className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center gap-2"><Save size={20} /> Salvar e Atualizar eSocial</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
