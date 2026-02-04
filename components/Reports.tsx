
import React, { useState } from 'react';
import { 
  BarChart3, Download, FileSpreadsheet, FileText, 
  TrendingUp, TrendingDown, Users, DollarSign,
  Briefcase, Database, Share2, CheckCircle2, Loader2,
  FileJson, FileCode, X
} from 'lucide-react';
import { MOCK_PAYROLL, MOCK_TRANSACTIONS, MOCK_MEMBERS, DEFAULT_TAX_CONFIG } from '../constants';
import { jsPDF } from 'jspdf';

export const Reports: React.FC = () => {
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);

  const reportCategories = [
    { 
      title: 'Financeiro', 
      icon: <DollarSign size={16} className="text-emerald-500" />,
      items: [
        { name: 'Balancete Mensal', data: MOCK_TRANSACTIONS },
        { name: 'Dízimos por Membro', data: MOCK_TRANSACTIONS.filter(t => t.category === 'TITHE') },
        { name: 'Fluxo de Caixa Anual', data: MOCK_TRANSACTIONS },
        { name: 'Previsão Orçamentária', data: [] }
      ] 
    },
    { 
      title: 'Pessoas (RH/DP)', 
      icon: <Briefcase size={16} className="text-indigo-500" />,
      items: [
        { name: 'Quadro de Funcionários', data: MOCK_PAYROLL },
        { name: 'Encargos Patronais Totais', data: MOCK_PAYROLL },
        { name: 'Férias e Vencimentos', data: [] },
        { name: 'Aniversariantes', data: MOCK_PAYROLL }
      ] 
    },
    { 
      title: 'Membros', 
      icon: <Users size={16} className="text-blue-500" />,
      items: [
        { name: 'Crescimento de Membresia', data: MOCK_MEMBERS },
        { name: 'Frequência nos Cultos', data: [] },
        { name: 'Batismos por Período', data: MOCK_MEMBERS }
      ] 
    },
  ];

  const exportToCSV = (data: any[], fileName: string) => {
    if (!data || data.length === 0) {
      alert("Não há dados disponíveis para este relatório no momento.");
      return;
    }
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => 
      Object.values(obj).map(val => 
        typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
      ).join(',')
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${fileName.replace(/\s+/g, '_')}_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateSimplePDF = (data: any[], title: string) => {
    if (!data || data.length === 0) {
      alert("Não há dados disponíveis para visualizar este relatório.");
      return;
    }
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`ADJPA ERP - ${title}`, 10, 20);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 10, 30);
    
    let y = 45;
    data.slice(0, 15).forEach((item, index) => {
      if (y > 280) { doc.addPage(); y = 20; }
      const line = Object.entries(item).slice(0, 4).map(([k, v]) => `${k}: ${v}`).join(' | ');
      doc.text(`${index + 1}. ${line}`, 10, y);
      y += 10;
    });

    if (data.length > 15) {
      doc.text(`... e mais ${data.length - 15} registros ocultos nesta prévia.`, 10, y + 5);
    }

    doc.save(`${title.replace(/\s+/g, '_')}_Preview.pdf`);
  };

  const handleDownloadReport = async (itemName: string, data: any[], type: 'CSV' | 'PDF') => {
    const actionId = `${itemName}_${type}`;
    setIsExporting(actionId);
    
    // Simula latência de processamento de dados
    await new Promise(resolve => setTimeout(resolve, 1200));

    if (type === 'CSV') {
      exportToCSV(data, itemName);
    } else {
      generateSimplePDF(data, itemName);
    }

    setIsExporting(null);
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  const handleAccountingExport = async (type: 'FINANCE' | 'PAYROLL' | 'MEMBERS', format: 'CSV' | 'JSON') => {
    setIsExporting(`${type}_${format}`);
    await new Promise(resolve => setTimeout(resolve, 1500));

    let dataToExport: any[] = [];
    let name = '';

    switch(type) {
      case 'FINANCE': 
        dataToExport = MOCK_TRANSACTIONS.map(t => ({
          ...t,
          conta_debito: t.type === 'INCOME' ? 'CAIXA_GERAL' : t.category,
          conta_credito: t.type === 'INCOME' ? t.category : 'CAIXA_GERAL'
        })); 
        name = 'Contabilidade_Financeiro'; 
        break;
      case 'PAYROLL': 
        dataToExport = MOCK_PAYROLL.map(p => ({
          ...p,
          inss_patronal: p.salario_base * DEFAULT_TAX_CONFIG.patronalRate,
          fgts_patronal: p.salario_base * DEFAULT_TAX_CONFIG.fgtsRate,
          total_custo_igreja: p.salario_base * (1 + DEFAULT_TAX_CONFIG.patronalRate + DEFAULT_TAX_CONFIG.fgtsRate + DEFAULT_TAX_CONFIG.ratRate)
        })); 
        name = 'Contabilidade_Folha_DP'; 
        break;
      case 'MEMBERS': dataToExport = MOCK_MEMBERS; name = 'Quadro_Membros'; break;
    }

    if (format === 'CSV') exportToCSV(dataToExport, name);
    else {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `${name}_${new Date().getTime()}.json`);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    }

    setIsExporting(null);
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 leading-tight">Centro de Relatórios & Integração</h1>
          <p className="text-slate-500 font-medium">Extração de dados para contabilidade e gestão estratégica.</p>
        </div>
        
        {exportSuccess && (
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl border border-emerald-100 animate-in slide-in-from-top-2">
            <CheckCircle2 size={18} />
            <span className="text-xs font-bold uppercase">Exportação Concluída!</span>
          </div>
        )}
      </div>

      {/* Painel de Exportação para Contabilidade */}
      <div className="bg-indigo-600 rounded-[2.5rem] p-1 shadow-2xl overflow-hidden">
        <div className="bg-slate-900 rounded-[2.3rem] p-8 md:p-10 flex flex-col lg:flex-row gap-10 items-center">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-500 rounded-2xl text-white shadow-lg">
                <Share2 size={24} />
              </div>
              <h2 className="text-2xl font-black text-white">Integração Contábil</h2>
            </div>
            <p className="text-slate-400 font-medium leading-relaxed max-w-md">
              Exporte seus dados em formatos compatíveis com os principais softwares contábeis do mercado brasileiro.
            </p>
          </div>

          <div className="w-full lg:w-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] hover:bg-white/10 transition-all group">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">Módulo Financeiro</p>
                <div className="flex gap-2">
                   <button 
                    onClick={() => handleAccountingExport('FINANCE', 'CSV')}
                    disabled={!!isExporting}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-white text-slate-900 rounded-xl font-black text-[10px] uppercase hover:bg-indigo-50 transition-all disabled:opacity-50"
                   >
                     {isExporting === 'FINANCE_CSV' ? <Loader2 size={14} className="animate-spin" /> : <FileSpreadsheet size={14} />} CSV
                   </button>
                   <button 
                    onClick={() => handleAccountingExport('FINANCE', 'JSON')}
                    disabled={!!isExporting}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-500 text-white rounded-xl font-black text-[10px] uppercase hover:bg-indigo-400 transition-all disabled:opacity-50"
                   >
                     {isExporting === 'FINANCE_JSON' ? <Loader2 size={14} className="animate-spin" /> : <FileJson size={14} />} JSON
                   </button>
                </div>
             </div>

             <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] hover:bg-white/10 transition-all group">
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-4">Folha de Pagamento (DP)</p>
                <div className="flex gap-2">
                   <button 
                    onClick={() => handleAccountingExport('PAYROLL', 'CSV')}
                    disabled={!!isExporting}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-white text-slate-900 rounded-xl font-black text-[10px] uppercase hover:bg-indigo-50 transition-all disabled:opacity-50"
                   >
                     {isExporting === 'PAYROLL_CSV' ? <Loader2 size={14} className="animate-spin" /> : <FileSpreadsheet size={14} />} CSV
                   </button>
                   <button 
                    onClick={() => handleAccountingExport('PAYROLL', 'JSON')}
                    disabled={!!isExporting}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase hover:bg-emerald-400 transition-all disabled:opacity-50"
                   >
                     {isExporting === 'PAYROLL_JSON' ? <Loader2 size={14} className="animate-spin" /> : <FileJson size={14} />} JSON
                   </button>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reportCategories.map((cat, i) => (
          <div key={i} className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm space-y-6 hover:shadow-md transition-shadow">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-b border-slate-50 pb-4 flex items-center justify-between">
              {cat.title}
              {cat.icon}
            </h3>
            <div className="space-y-2">
              {cat.items.map((item, j) => (
                <div key={j} className="flex items-center justify-between p-3 hover:bg-indigo-50 rounded-xl group transition-all border border-transparent hover:border-indigo-100">
                  <span className="text-sm font-bold text-slate-600 group-hover:text-indigo-700">{item.name}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      disabled={!!isExporting}
                      onClick={() => handleDownloadReport(item.name, item.data, 'CSV')}
                      className="p-1.5 bg-white rounded-lg text-slate-400 hover:text-emerald-600 shadow-sm border border-slate-100 transition-all disabled:opacity-50" 
                      title="Download CSV"
                    >
                      {isExporting === `${item.name}_CSV` ? <Loader2 size={14} className="animate-spin"/> : <Download size={14}/>}
                    </button>
                    <button 
                      disabled={!!isExporting}
                      onClick={() => handleDownloadReport(item.name, item.data, 'PDF')}
                      className="p-1.5 bg-white rounded-lg text-slate-400 hover:text-indigo-600 shadow-sm border border-slate-100 transition-all disabled:opacity-50" 
                      title="Ver Prévia PDF"
                    >
                      {isExporting === `${item.name}_PDF` ? <Loader2 size={14} className="animate-spin"/> : <FileText size={14}/>}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none"><BarChart3 size={200} /></div>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Database size={20}/></div>
              <h3 className="text-xl font-black text-slate-900">Análise de Saúde Institucional</h3>
            </div>
            <p className="text-slate-500 text-sm mb-8 font-medium">Análise automática baseada em todos os lançamentos do trimestre para apoio pastoral.</p>
            <div className="space-y-6">
              {[
                { label: 'Crescimento de Receita', val: '+12.4%', icon: <TrendingUp className="text-emerald-400"/> },
                { label: 'Retenção de Membros', val: '94%', icon: <Users className="text-indigo-400"/> },
                { label: 'Custo Operacional', val: '-3.2%', icon: <TrendingDown className="text-rose-400"/> },
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-lg shadow-sm">{row.icon}</div>
                    <span className="text-sm font-bold text-slate-700">{row.label}</span>
                  </div>
                  <span className="font-black text-lg text-slate-900">{row.val}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-slate-900 rounded-3xl p-8 border border-white/5 flex flex-col justify-center text-center shadow-2xl">
            <h4 className="text-indigo-400 font-black uppercase text-[10px] tracking-[0.2em] mb-4">Meta de Arrecadação - Sede Própria</h4>
            <div className="text-6xl font-black text-white mb-4">R$ 45k</div>
            <p className="text-sm text-slate-400 mb-8 font-medium px-10 leading-relaxed">Faltam R$ 9.900 para atingirmos o valor da parcela mensal.</p>
            <div className="w-full bg-white/10 h-4 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-400 h-full w-[78%] rounded-full shadow-lg shadow-indigo-500/50 relative">
                 <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>
            <p className="text-[10px] font-black mt-4 text-indigo-300 uppercase tracking-widest">78% DO OBJETIVO CONCLUÍDO</p>
          </div>
        </div>
      </div>
    </div>
  );
};
