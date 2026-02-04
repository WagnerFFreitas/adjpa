
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, ArrowUp, ArrowDown, Download, FileText, CreditCard,
  Landmark, Wallet, TrendingUp, X, Save, DollarSign, Calendar, 
  Search, Filter, RefreshCw, Edit2, Trash2, ShieldCheck, 
  Receipt, User, Printer, Loader2, FileSearch, PieChart,
  Link as LinkIcon, Paperclip, CheckCircle2, AlertCircle, Layers,
  Briefcase, History, CheckCircle, Tag, MoreHorizontal
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Transaction, FinancialAccount, UserAuth } from '../types';
import { COST_CENTERS, OPERATION_NATURES, CHURCH_PROJECTS } from '../constants';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface FinanceProps {
  transactions: Transaction[];
  currentUnitId: string;
  setTransactions: (newList: Transaction[]) => void;
  accounts: FinancialAccount[];
  setAccounts: (newList: FinancialAccount[]) => void;
  user?: UserAuth;
}

type ReportType = 'BALANCES' | 'EXPENSES' | 'PAYABLES' | 'PROJECTS';

export const Finance: React.FC<FinanceProps> = ({ transactions, currentUnitId, setTransactions, accounts, setAccounts, user }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [activeReport, setActiveReport] = useState<ReportType | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterCostCenter, setFilterCostCenter] = useState('ALL');
  const [viewType, setViewType] = useState<'CAIXA' | 'COMPETENCIA'>('CAIXA');
  
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Transaction>>({
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    competencyDate: new Date().toISOString().split('T')[0],
    type: 'INCOME',
    category: 'TITHE',
    operationNature: 'nat6', // Default para Receita Ordinária
    costCenter: COST_CENTERS[0].id,
    projectId: '',
    accountId: accounts[0]?.id || '',
    paymentMethod: 'CASH',
    invoiceNumber: '',
    providerName: '',
    providerCpf: '',
    providerCnpj: '',
    isInstallment: false,
    installmentsCount: 1,
    status: 'PAID',
    isConciliated: false,
    unitId: currentUnitId
  });

  // Ajusta classificações automáticas baseadas no tipo de lançamento
  useEffect(() => {
    if (formData.type === 'INCOME') {
      // Se for entrada, força natureza de receita se estiver com natureza de despesa
      if (formData.operationNature === 'nat1' || formData.operationNature === 'nat3') {
        setFormData(prev => ({ ...prev, operationNature: 'nat6' }));
      }
    } else {
      // Se for saída, força natureza de despesa se estiver com natureza de receita
      if (formData.operationNature === 'nat6' || formData.operationNature === 'nat7') {
        setFormData(prev => ({ ...prev, operationNature: 'nat1' }));
      }
    }
  }, [formData.type]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (t.providerName && t.providerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (t.invoiceNumber && t.invoiceNumber.includes(searchTerm));
      const matchCategory = filterCategory === 'ALL' || t.category === filterCategory;
      const matchCostCenter = filterCostCenter === 'ALL' || t.costCenter === filterCostCenter;
      return matchSearch && matchCategory && matchCostCenter;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchTerm, filterCategory, filterCostCenter]);

  const totals = useMemo(() => {
    return transactions.reduce((acc, curr) => {
      const isPaid = curr.status === 'PAID';
      if (isPaid) {
        if (curr.type === 'INCOME') acc.income += curr.amount;
        else acc.expense += curr.amount;
      } else if (curr.status === 'PENDING') {
        acc.payable += curr.amount;
      }
      return acc;
    }, { income: 0, expense: 0, payable: 0 });
  }, [transactions]);

  const handleSave = () => {
    if (!formData.description || !formData.amount || formData.amount <= 0) {
      alert("Por favor, preencha descrição e valor corretamente.");
      return;
    }

    if (editingId) {
      // LOGICA DE EDIÇÃO
      const oldTransaction = transactions.find(t => t.id === editingId);
      if (!oldTransaction) return;

      // 1. Reverter saldo antigo se estava pago
      if (oldTransaction.status === 'PAID') {
        const updatedAccounts = accounts.map(acc => {
          if (acc.id === oldTransaction.accountId) {
            const revertAdjustment = oldTransaction.type === 'INCOME' ? -oldTransaction.amount : oldTransaction.amount;
            return { ...acc, currentBalance: acc.currentBalance + revertAdjustment };
          }
          return acc;
        });
        setAccounts(updatedAccounts);
      }

      // 2. Atualizar transação
      const updatedTransaction = { 
        ...oldTransaction, 
        ...formData, 
        updatedAt: new Date().toISOString() 
      } as Transaction;

      const updatedList = transactions.map(t => t.id === editingId ? updatedTransaction : t);
      setTransactions(updatedList);

      // 3. Aplicar novo saldo se o novo status for pago
      if (updatedTransaction.status === 'PAID') {
        const finalAccounts = accounts.map(acc => {
          if (acc.id === updatedTransaction.accountId) {
            const newAdjustment = updatedTransaction.type === 'INCOME' ? updatedTransaction.amount : -updatedTransaction.amount;
            return { ...acc, currentBalance: acc.currentBalance + newAdjustment };
          }
          return acc;
        });
        setAccounts(finalAccounts);
      }

      setEditingId(null);
    } else {
      // LOGICA DE NOVO LANÇAMENTO
      const newEntries: Transaction[] = [];
      const baseDate = new Date(formData.date + 'T12:00:00');

      if (formData.type === 'EXPENSE' && formData.paymentMethod === 'CREDIT_CARD' && formData.isInstallment && (formData.installmentsCount || 1) > 1) {
        const installments = formData.installmentsCount || 1;
        const installmentAmount = (formData.amount || 0) / installments;

        for (let i = 1; i <= installments; i++) {
          const installmentDate = new Date(baseDate);
          installmentDate.setMonth(baseDate.getMonth() + (i - 1));

          newEntries.push({
            ...formData,
            id: 't' + Math.random().toString(36).substr(2, 9),
            unitId: currentUnitId,
            amount: installmentAmount,
            date: installmentDate.toISOString().split('T')[0],
            currentInstallment: i,
            status: i === 1 ? 'PAID' : 'PENDING',
            description: `${formData.description} (${i}/${installments})`,
            createdAt: new Date().toISOString(),
            createdBy: user?.name || 'Sistema'
          } as Transaction);
        }
      } else {
        newEntries.push({
          ...formData,
          id: 't' + Math.random().toString(36).substr(2, 9),
          unitId: currentUnitId,
          status: formData.status || 'PAID',
          createdAt: new Date().toISOString(),
          createdBy: user?.name || 'Sistema'
        } as Transaction);
      }

      setTransactions([...newEntries, ...transactions]);
      
      const updatedAccounts = accounts.map(acc => {
        if (acc.id === formData.accountId) {
          const adjustment = newEntries
            .filter(t => t.status === 'PAID')
            .reduce((sum, t) => sum + (t.type === 'INCOME' ? t.amount : -t.amount), 0);
          return { ...acc, currentBalance: acc.currentBalance + adjustment };
        }
        return acc;
      });
      setAccounts(updatedAccounts);
    }

    setIsModalOpen(false);
    resetForm();
  };

  const openEditModal = (t: Transaction) => {
    setEditingId(t.id);
    setFormData({ ...t });
    setIsModalOpen(true);
  };

  const markAsPaid = (tId: string) => {
    const transaction = transactions.find(t => t.id === tId);
    if (!transaction || transaction.status === 'PAID') return;

    if (confirm(`Confirmar liquidação de R$ ${transaction.amount.toFixed(2)} em conta?`)) {
      // Fix: casting status to const to ensure it matches the Transaction status type union "PAID" | "PENDING" | "CANCELLED"
      const updatedTransactions = transactions.map(t => t.id === tId ? { ...t, status: 'PAID' as const, isConciliated: true } : t);
      setTransactions(updatedTransactions);
      
      const updatedAccounts = accounts.map(acc => {
        if (acc.id === transaction.accountId) {
          const adjustment = transaction.type === 'INCOME' ? transaction.amount : -transaction.amount;
          return { ...acc, currentBalance: acc.currentBalance + adjustment };
        }
        return acc;
      });
      setAccounts(updatedAccounts);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      description: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      competencyDate: new Date().toISOString().split('T')[0],
      type: 'INCOME',
      category: 'TITHE',
      operationNature: 'nat6',
      costCenter: COST_CENTERS[0].id,
      projectId: '',
      accountId: accounts[0]?.id || '',
      paymentMethod: 'CASH',
      invoiceNumber: '',
      providerName: '',
      providerCpf: '',
      providerCnpj: '',
      isInstallment: false,
      installmentsCount: 1,
      status: 'PAID',
      isConciliated: false,
      unitId: currentUnitId
    });
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    const element = document.getElementById('printable-area');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Relatorio_Analitico_ADJPA_${activeReport}_${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const FinancialReport = () => {
    if (!activeReport) return null;

    const reportTitle = {
      BALANCES: 'RELATÓRIO CONSOLIDADO DE ATIVOS FINANCEIROS',
      EXPENSES: 'RELATÓRIO ANALÍTICO DE SAÍDAS (COMPETÊNCIA)',
      PAYABLES: 'RELATÓRIO DE PASSIVOS E PROVISÕES A PAGAR',
      PROJECTS: 'DEMONSTRATIVO FINANCEIRO POR PROJETO'
    }[activeReport];

    const today = new Date().toLocaleDateString('pt-BR');

    return (
      <div className="bg-white p-8 text-slate-900 min-h-[297mm] flex flex-col font-sans border border-slate-200">
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
          <div>
            <h1 className="text-xl font-black uppercase">ADJPA - SEDE MUNDIAL</h1>
            <p className="text-xs font-bold text-slate-700 uppercase">Gestão Financeira Estratégica ERP</p>
            <p className="text-xs text-slate-600 mt-1">SÃO PAULO/SP • v2.7 ERP COMPLIANCE</p>
          </div>
          <div className="text-right">
            <h2 className="text-sm font-black uppercase bg-slate-900 text-white px-4 py-1 inline-block mb-2">Relatório de Auditoria</h2>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-800">Emissão: {today}</p>
          </div>
        </div>

        <div className="text-center mb-10">
          <h3 className="text-lg font-black uppercase underline decoration-2 underline-offset-8">{reportTitle}</h3>
        </div>

        <div className="flex-1">
           <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-100 border-2 border-slate-900">
                  <th className="p-2 text-left font-black uppercase text-[10px] border-r border-slate-900">Data</th>
                  <th className="p-2 text-left font-black uppercase text-[10px] border-r border-slate-900">Natureza / Operação</th>
                  <th className="p-2 text-left font-black uppercase text-[10px] border-r border-slate-900">Projeto / Centro Custo</th>
                  <th className="p-2 text-right font-black uppercase text-[10px]">Valor (R$)</th>
                </tr>
              </thead>
              <tbody className="border-2 border-slate-900">
                {transactions.map(t => (
                  <tr key={t.id} className="border-b border-slate-200">
                    <td className="p-2 text-[10px] font-bold border-r border-slate-900">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                    <td className="p-2 text-[10px] font-medium border-r border-slate-900">
                      <span className="font-black text-indigo-700">{OPERATION_NATURES.find(n => n.id === t.operationNature)?.name || 'Geral'}</span><br/>
                      {t.description}
                    </td>
                    <td className="p-2 text-[10px] font-medium border-r border-slate-900">
                      <span className="uppercase text-slate-600 font-bold">{COST_CENTERS.find(cc => cc.id === t.costCenter)?.name || '--'}</span><br/>
                      {CHURCH_PROJECTS.find(p => p.id === t.projectId)?.name || 'Sem Projeto'}
                    </td>
                    <td className={`p-2 text-[10px] font-black text-right ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
           </table>
        </div>

        <div className="mt-auto pt-10 border-t border-slate-200">
           <p className="text-[8px] text-center text-slate-500 uppercase font-black tracking-[0.4em]">Autenticidade Garantida ADJPA ERP • Gestão Integrada</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-xl font-black text-slate-900 leading-tight">Finanças & ERP Contábil</h1>
          <p className="text-slate-700 font-medium text-xs">Controle de Naturezas, Centros de Custo e Baixa de Títulos.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={() => setIsReportModalOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 px-6 py-3 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
          >
            <FileSearch size={18} className="text-indigo-600" /> Relatórios Analíticos
          </button>
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all text-sm uppercase tracking-tighter"
          >
            <Plus size={18} /> Novo Lançamento
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-black text-slate-600 uppercase tracking-[0.2em]">Fluxo de Caixa (Realizado)</h3>
              <div className="flex bg-slate-50 p-1 rounded-xl gap-1">
                <button 
                  onClick={() => setViewType('CAIXA')}
                  className={`px-3 py-1 text-[9px] font-black uppercase rounded-lg transition-all ${viewType === 'CAIXA' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}
                >Caixa</button>
                <button 
                  onClick={() => setViewType('COMPETENCIA')}
                  className={`px-3 py-1 text-[9px] font-black uppercase rounded-lg transition-all ${viewType === 'COMPETENCIA' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}
                >Competência</button>
              </div>
            </div>
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Entradas', value: totals.income },
                  { name: 'Saídas', value: totals.expense },
                  { name: 'A Pagar', value: totals.payable }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 700}} />
                  <YAxis axisLine={false} tickLine={false} hide />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    <Cell fill="#10b981" />
                    <Cell fill="#ef4444" />
                    <Cell fill="#f59e0b" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="w-full md:w-64 space-y-3 flex flex-col justify-center border-l border-slate-50 pl-0 md:pl-4">
             <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-[8px] font-black text-emerald-700 uppercase">Receita Realizada</p>
                <p className="text-lg font-black text-slate-900">R$ {totals.income.toLocaleString('pt-BR')}</p>
             </div>
             <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
                <p className="text-[8px] font-black text-rose-700 uppercase">Despesa Liquidada</p>
                <p className="text-lg font-black text-slate-900">R$ {totals.expense.toLocaleString('pt-BR')}</p>
             </div>
             <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-[8px] font-black text-amber-700 uppercase">Provisão a Pagar</p>
                <p className="text-lg font-black text-slate-900">R$ {totals.payable.toLocaleString('pt-BR')}</p>
             </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-xs font-black text-slate-600 uppercase tracking-[0.2em] mb-4">Contas Integradas</h3>
          <div className="space-y-3 overflow-y-auto max-h-[200px] custom-scrollbar">
             {accounts.map(acc => (
               <div key={acc.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white rounded-lg shadow-sm text-indigo-600">
                      {acc.type === 'BANK' ? <Landmark size={14}/> : <Wallet size={14}/>}
                    </div>
                    <span className="text-xs font-bold text-slate-700">{acc.name}</span>
                  </div>
                  <span className="text-xs font-black text-slate-900">R$ {acc.currentBalance.toFixed(0)}</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-2.5 border-b border-slate-100 flex flex-col md:flex-row gap-2.5 justify-between items-center bg-slate-50/30">
          <div className="flex-1 relative w-full">
              <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
              <input 
                type="text" 
                placeholder="Pesquisar descrição, fornecedor ou NF..." 
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-xs font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <div className="flex gap-2 w-full md:w-auto">
              <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                <Filter size={16} className="text-slate-600" />
                <select 
                  className="bg-transparent text-[10px] font-black text-slate-700 uppercase outline-none"
                  value={filterCostCenter}
                  onChange={(e) => setFilterCostCenter(e.target.value)}
                >
                   <option value="ALL">Todos Centros Custo</option>
                   {COST_CENTERS.map(cc => (
                     <option key={cc.id} value={cc.id}>{cc.name}</option>
                   ))}
                </select>
              </div>
           </div>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full min-w-[1300px]">
            <thead className="bg-slate-50/50 text-slate-600 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-5 py-2 text-left">Data Pagto / Competência</th>
                <th className="px-5 py-2 text-left">Natureza / Lançamento</th>
                <th className="px-5 py-2 text-left">Projeto / Origem</th>
                <th className="px-5 py-2 text-right">Valor</th>
                <th className="px-5 py-2 text-center">Situação</th>
                <th className="px-5 py-2 text-right w-24">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition-all group">
                  <td className="px-5 py-2">
                    <div className="flex flex-col gap-1">
                      <p className="text-xs font-black text-slate-900">{new Date(t.date).toLocaleDateString('pt-BR')}</p>
                      <p className="text-[8px] text-slate-600 font-bold uppercase">Compet: {t.competencyDate ? new Date(t.competencyDate).toLocaleDateString('pt-BR') : '--'}</p>
                    </div>
                  </td>
                  <td className="px-5 py-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${t.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {t.type === 'INCOME' ? <ArrowUp size={14}/> : <ArrowDown size={14}/>}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-xs leading-none mb-1">{t.description}</p>
                        <p className="text-[9px] text-indigo-700 font-black uppercase tracking-tighter">
                          {OPERATION_NATURES.find(n => n.id === t.operationNature)?.name || 'Geral'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-2">
                    <div className="space-y-1">
                       <p className="text-xs font-black text-indigo-700">{CHURCH_PROJECTS.find(prj => prj.id === t.projectId)?.name || 'Sem Projeto'}</p>
                       <p className="text-[9px] text-slate-600 font-bold uppercase truncate max-w-[200px]">
                         {t.providerName || 'N/A'} {t.invoiceNumber ? `• NF: ${t.invoiceNumber}` : ''}
                       </p>
                    </div>
                  </td>
                  <td className={`px-5 py-2 text-right font-black text-xs ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {t.type === 'INCOME' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-5 py-2">
                    <div className="flex flex-col items-center gap-2">
                       <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase ${t.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                        {t.status === 'PAID' ? 'Liquidado' : 'Aberto'}
                       </span>
                       {t.status === 'PENDING' && (
                         <button 
                          onClick={() => markAsPaid(t.id)}
                          className="flex items-center gap-1 text-[8px] font-black text-indigo-700 hover:text-indigo-800 uppercase bg-indigo-50 px-2 py-1 rounded transition-all"
                         >
                           <CheckCircle size={10}/> Baixar
                         </button>
                       )}
                    </div>
                  </td>
                  <td className="px-5 py-2 text-right">
                    <button 
                      onClick={() => openEditModal(t)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                      title="Editar Registro"
                    >
                      <Edit2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Lançamento / Edição ERP */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-6xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300 max-h-[95vh]">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg">
                  {editingId ? <Edit2 size={24} /> : <DollarSign size={24} />}
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 uppercase">
                    {editingId ? 'Editar Registro Contábil' : 'Novo Lançamento Analítico'}
                  </h2>
                  <p className="text-[10px] text-slate-700 font-black uppercase mt-1 tracking-widest">Sincronizado com Fluxo de Caixa & Projetos</p>
                </div>
              </div>
              <button onClick={() => { setIsModalOpen(false); setEditingId(null); }} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"><X/></button>
            </div>

            <div className="p-10 space-y-10 overflow-y-auto custom-scrollbar text-left bg-white">
              <div className="grid grid-cols-2 gap-4">
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, type: 'INCOME', category: 'TITHE', operationNature: 'nat6', status: 'PAID'})}
                  className={`py-5 rounded-2xl font-black text-sm uppercase flex items-center justify-center gap-2 transition-all ${formData.type === 'INCOME' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-50 text-slate-600 border border-slate-100'}`}
                >
                  <ArrowUp size={20}/> Entrada Analítica
                </button>
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, type: 'EXPENSE', category: 'MAINTENANCE', operationNature: 'nat1'})}
                  className={`py-5 rounded-2xl font-black text-sm uppercase flex items-center justify-center gap-2 transition-all ${formData.type === 'EXPENSE' ? 'bg-rose-600 text-white shadow-lg' : 'bg-slate-50 text-slate-600 border border-slate-100'}`}
                >
                  <ArrowDown size={20}/> Saída / Despesa
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-4">
                  <label className="text-[10px] font-black text-slate-600 uppercase mb-2 block">Descrição do Lançamento</label>
                  <input 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none text-slate-800" 
                    placeholder="Ex: Reforma da Fachada - Etapa 2"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="text-[10px] font-black text-slate-600 uppercase mb-2 block">Valor (R$)</label>
                  <input 
                    type="number"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-xl outline-none text-slate-900"
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
                  />
                </div>
                <div className="md:col-span-2.5">
                  <label className="text-[10px] font-black text-slate-600 uppercase mb-2 block">Competência</label>
                  <input 
                    type="date"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none text-slate-800"
                    value={formData.competencyDate}
                    onChange={e => setFormData({...formData, competencyDate: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2.5">
                  <label className="text-[10px] font-black text-slate-600 uppercase mb-2 block">Data Pagto / Vencimento</label>
                  <input 
                    type="date"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none text-slate-800"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div>
                    <label className="text-[10px] font-black text-slate-600 uppercase mb-2 block">Natureza da Operação</label>
                    <select 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none text-slate-800"
                      value={formData.operationNature}
                      onChange={e => setFormData({...formData, operationNature: e.target.value})}
                    >
                      {OPERATION_NATURES.map(nat => <option key={nat.id} value={nat.id}>{nat.name}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-600 uppercase mb-2 block">Vínculo de Projeto</label>
                    <select 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none text-slate-800"
                      value={formData.projectId}
                      onChange={e => setFormData({...formData, projectId: e.target.value})}
                    >
                      <option value="">Nenhum Projeto Associado</option>
                      {CHURCH_PROJECTS.map(prj => <option key={prj.id} value={prj.id}>{prj.name}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-600 uppercase mb-2 block">Centro de Custo</label>
                    <select 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none text-slate-800"
                      value={formData.costCenter}
                      onChange={e => setFormData({...formData, costCenter: e.target.value})}
                    >
                      {COST_CENTERS.map(cc => <option key={cc.id} value={cc.id}>{cc.name}</option>)}
                    </select>
                 </div>
              </div>

              <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-200 space-y-8">
                 <div className="flex items-center gap-2 text-indigo-700 border-b border-slate-200 pb-4">
                    <ShieldCheck size={20}/>
                    <h3 className="text-xs font-black uppercase tracking-widest">Informações de Auditoria e Fiscal</h3>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                       <div>
                          <label className="text-[10px] font-black text-slate-700 uppercase mb-2 block">Origem / Fornecedor</label>
                          <div className="relative">
                            <User className="absolute left-4 top-4 text-slate-500" size={18}/>
                            <input className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-800" placeholder="Nome do Membro ou Empresa" value={formData.providerName} onChange={e => setFormData({...formData, providerName: e.target.value})} />
                          </div>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-black text-slate-700 uppercase mb-2 block">CPF / CNPJ</label>
                            <input className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-800" placeholder="Identificação Fiscal" value={formData.providerCnpj} onChange={e => setFormData({...formData, providerCnpj: e.target.value})} />
                          </div>
                          <div>
                            <label className="text-[10px] font-black text-slate-700 uppercase mb-2 block">Nº Documento / NF</label>
                            <input className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-800" placeholder="Comprovante" value={formData.invoiceNumber} onChange={e => setFormData({...formData, invoiceNumber: e.target.value})} />
                          </div>
                       </div>
                    </div>

                    <div className="space-y-6">
                       <div className="bg-white p-6 rounded-[2rem] border border-slate-200 border-dashed flex flex-col items-center justify-center text-center group cursor-pointer hover:border-indigo-400 transition-all">
                          <Paperclip className="text-slate-500 mb-2 group-hover:text-indigo-600" size={32}/>
                          <p className="text-xs font-black uppercase text-slate-600 group-hover:text-indigo-600">Clique para Anexar Comprovante</p>
                          <p className="text-[9px] text-slate-500 mt-1">PDF ou Imagem digitalizada.</p>
                       </div>
                       <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200">
                          <div className="flex items-center gap-3">
                             <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg"><History size={16}/></div>
                             <span className="text-[10px] font-black text-slate-700 uppercase">Título Já Liquidado?</span>
                          </div>
                          <div 
                            onClick={() => setFormData({...formData, status: formData.status === 'PAID' ? 'PENDING' : 'PAID'})}
                            className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${formData.status === 'PAID' ? 'bg-emerald-500' : 'bg-slate-400'}`}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${formData.status === 'PAID' ? 'translate-x-6' : 'translate-x-0'}`} />
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="flex items-center gap-2 text-indigo-700 border-b border-slate-100 pb-4">
                    <CreditCard size={20}/>
                    <h3 className="text-xs font-black uppercase tracking-widest">Forma de Pagamento & Conta</h3>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 space-y-4">
                       <label className="text-[10px] font-black text-slate-700 uppercase block">Conta Vinculada</label>
                       <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800" value={formData.accountId} onChange={e => setFormData({...formData, accountId: e.target.value})}>
                          {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                       </select>
                    </div>
                    <div className="md:col-span-2 space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: 'CASH', label: 'Dinheiro', icon: <Wallet size={16}/> },
                          { id: 'PIX', label: 'PIX Direto', icon: <RefreshCw size={16}/> },
                          { id: 'CREDIT_CARD', label: 'Cartão/Parcelas', icon: <CreditCard size={16}/> }
                        ].map(m => (
                          <button 
                            key={m.id}
                            type="button"
                            onClick={() => setFormData({...formData, paymentMethod: m.id as any, isInstallment: m.id === 'CREDIT_CARD'})}
                            className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${formData.paymentMethod === m.id ? 'bg-indigo-50 border-indigo-600 text-indigo-700' : 'bg-white border-slate-100 text-slate-600'}`}
                          >
                            {m.icon}
                            <span className="text-[10px] font-black uppercase">{m.label}</span>
                          </button>
                        ))}
                      </div>

                      {/* CONFIGURAÇÃO DE PARCELAMENTO - VISÍVEL APENAS PARA CARTÃO */}
                      {formData.paymentMethod === 'CREDIT_CARD' && !editingId && (
                        <div className="p-6 bg-indigo-50/50 rounded-[2rem] border border-indigo-100 space-y-4 animate-in slide-in-from-top-2">
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                 <div 
                                  onClick={() => setFormData({...formData, isInstallment: !formData.isInstallment})}
                                  className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-colors ${formData.isInstallment ? 'bg-indigo-600' : 'bg-slate-300'}`}
                                 >
                                    <div className={`w-3 h-3 bg-white rounded-full transition-transform ${formData.isInstallment ? 'translate-x-5' : 'translate-x-0'}`} />
                                 </div>
                                 <span className="text-[10px] font-black text-indigo-900 uppercase">Parcelar este lançamento?</span>
                              </div>
                              {formData.isInstallment && (
                                <div className="flex items-center gap-4">
                                  <label className="text-[10px] font-black text-slate-600 uppercase">Nº de Parcelas:</label>
                                  <input 
                                    type="number" 
                                    min="2" 
                                    max="72"
                                    className="w-20 px-3 py-2 bg-white border border-indigo-200 rounded-xl font-black text-indigo-700 text-center outline-none"
                                    value={formData.installmentsCount || 2}
                                    onChange={e => setFormData({...formData, installmentsCount: Number(e.target.value)})}
                                  />
                                </div>
                              )}
                           </div>
                           <p className="text-[9px] text-indigo-600 font-bold italic">
                              * Ao parcelar, a 1ª parcela será baixada agora e as demais serão enviadas para "Contas a Pagar" (Status: Aberto).
                           </p>
                        </div>
                      )}
                      
                      {editingId && formData.isInstallment && (
                        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                          <p className="text-[10px] font-black text-amber-700 uppercase">Aviso de Edição de Parcela</p>
                          <p className="text-[9px] text-amber-600 font-medium">Você está editando uma parcela individual. Alterar o valor aqui afetará apenas esta parcela específica e o saldo vinculado.</p>
                        </div>
                      )}
                    </div>
                 </div>
              </div>
            </div>

            <div className="p-10 border-t border-slate-100 bg-slate-50/50 flex gap-4 shrink-0">
              <button onClick={() => { setIsModalOpen(false); setEditingId(null); }} className="flex-1 py-5 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 hover:bg-slate-100 transition-all text-sm uppercase">Descartar</button>
              <button onClick={handleSave} className="flex-[2] py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 text-sm uppercase">
                <Save size={24}/> {editingId ? 'Atualizar Registro ERP' : 'Gravar Registro Analítico ERP'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Relatórios permanece inalterado */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-6xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
              <div className="bg-white p-8 flex justify-between items-center border-b border-slate-100 shrink-0 no-print">
                 <div className="flex items-center gap-4">
                    <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg"><FileSearch size={24}/></div>
                    <div>
                      <h2 className="font-black text-slate-900 uppercase tracking-widest leading-none">Cofre de Auditoria ERP</h2>
                      <p className="text-[10px] text-slate-700 font-black uppercase mt-2 tracking-tight">Regime de Caixa e Competência Certificados</p>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    {activeReport && (
                      <>
                        <button type="button" onClick={handleDownloadPDF} disabled={isGeneratingPDF} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-xl">
                           {isGeneratingPDF ? <Loader2 size={18} className="animate-spin" /> : <Download size={18}/>} Exportar PDF
                        </button>
                        <button type="button" onClick={() => window.print()} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-xs hover:bg-emerald-700 shadow-xl flex items-center gap-2">
                           <Printer size={18}/> Imprimir
                        </button>
                      </>
                    )}
                    <button type="button" onClick={() => { setIsReportModalOpen(false); setActiveReport(null); }} className="p-4 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"><X size={24}/></button>
                 </div>
              </div>

              <div className="flex flex-1 overflow-hidden">
                <div className="w-80 bg-slate-50 border-r border-slate-100 p-8 space-y-4 no-print shrink-0 overflow-y-auto">
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-6">Modelos de Conformidade</p>
                  {[
                    { id: 'BALANCES', label: 'Extrato Consolidado', icon: <Landmark size={18}/>, desc: 'Saldos em bancos e caixa físico' },
                    { id: 'EXPENSES', label: 'Saídas por Competência', icon: <PieChart size={18}/>, desc: 'Visão contábil por fato gerador' },
                    { id: 'PAYABLES', label: 'Passivos a Vencer', icon: <Briefcase size={18}/>, desc: 'Títulos em aberto e parcelamentos' },
                    { id: 'PROJECTS', label: 'Análise de Projetos', icon: <Tag size={18}/>, desc: 'Gastos agrupados por campanha' },
                  ].map(rep => (
                    <button 
                      key={rep.id}
                      onClick={() => setActiveReport(rep.id as ReportType)}
                      className={`w-full p-5 rounded-[1.5rem] border-2 text-left transition-all group ${activeReport === rep.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl' : 'bg-white border-slate-100 hover:border-indigo-300'}`}
                    >
                       <div className="flex items-center gap-3 mb-1">
                          <span className={activeReport === rep.id ? 'text-white' : 'text-indigo-700'}>{rep.icon}</span>
                          <span className="text-[11px] font-black uppercase tracking-tighter">{rep.label}</span>
                       </div>
                       <p className={`text-[9px] font-bold leading-tight ${activeReport === rep.id ? 'text-indigo-100' : 'text-slate-600'}`}>{rep.desc}</p>
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto p-12 bg-slate-200/50 custom-scrollbar scroll-smooth">
                   {activeReport ? (
                      <div id="printable-area" className="mx-auto w-[210mm] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] bg-white min-h-[297mm]">
                         <FinancialReport />
                      </div>
                   ) : (
                     <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-6">
                        <div className="p-10 bg-white rounded-full border border-slate-200 shadow-inner">
                           <FileSearch size={80} className="opacity-30" />
                        </div>
                        <div className="text-center space-y-2">
                          <p className="font-black uppercase text-base tracking-[0.2em] text-slate-700">Selecionador de Auditoria</p>
                          <p className="text-xs font-bold max-w-xs text-slate-600">Escolha um documento técnico ao lado para carregar a visualização certificada para conselho fiscal.</p>
                        </div>
                     </div>
                   )}
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
