
import React, { useState, useMemo } from 'react';
import { 
  Printer, Check, Edit3, Save, DollarSign, Calculator, ArrowDownRight,
  Plus, X, FileText, Download, Shield,
  Loader2, Star, FileSearch, Printer as PrinterIcon
} from 'lucide-react';
import { DEFAULT_TAX_CONFIG } from '../constants';
import { Payroll } from '../types';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface FolhaProcessViewProps {
  employees: Payroll[];
  setEmployees: React.Dispatch<React.SetStateAction<Payroll[]>>;
}

export const FolhaProcessView: React.FC<FolhaProcessViewProps> = ({ employees, setEmployees }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingEmp, setEditingEmp] = useState<Payroll | null>(null);
  const [editData, setEditData] = useState<Partial<Payroll>>({});
  const [holeriteList, setHoleriteList] = useState<Payroll[]>([]);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === employees.length) setSelectedIds([]);
    else setSelectedIds(employees.map(e => e.id));
  };

  const openEditor = (emp: Payroll) => {
    setEditingEmp(emp);
    setEditData({ ...emp });
  };

  const calculatedFolha = useMemo(() => {
    if (!editingEmp || !editData) return null;

    const base = Number(editData.salario_base) || 0;
    const valorHora = base / 220;
    
    // PROVENTOS
    const valHE50 = (valorHora * 1.5) * (Number(editData.he50_qtd) || 0);
    const valHE100 = (valorHora * 2.0) * (Number(editData.he100_qtd) || 0);
    const valDSR = editData.dsr_ativo ? (valHE50 + valHE100) / 6 : 0;
    const valAdicNoturno = (valorHora * 0.2) * (Number(editData.adic_noturno_qtd) || 0);
    const valATS = base * ((Number(editData.ats_percentual) || 0) / 100);
    const valAuxMoradia = Number(editData.auxilio_moradia) || 0;
    const valSalarioFamilia = (base <= 1819.26) ? (Number(editData.dependentes_qtd) || 0) * 62.15 : 0;

    let valInsalubridade = 0;
    const baseMinima = 1412.00; 
    if (editData.insalubridade_grau === 'LOW') valInsalubridade = baseMinima * 0.1;
    else if (editData.insalubridade_grau === 'MEDIUM') valInsalubridade = baseMinima * 0.2;
    else if (editData.insalubridade_grau === 'HIGH') valInsalubridade = baseMinima * 0.4;

    const valPericulosidade = editData.periculosidade_ativo ? base * 0.3 : 0;

    const totalProventos = base + valHE50 + valHE100 + valDSR + valAdicNoturno + 
                           (Number(editData.comissoes) || 0) + (Number(editData.gratificacoes) || 0) + 
                           (Number(editData.premios) || 0) + valInsalubridade + valPericulosidade +
                           valATS + valAuxMoradia + valSalarioFamilia;

    // DESCONTOS LEGAIS E VARIÁVEIS
    let inss = 0;
    let baseINSS = totalProventos - valAuxMoradia - valSalarioFamilia;
    if (baseINSS > 0) {
      const f1 = Math.min(baseINSS, 1412.00);
      inss += f1 * 0.075;
      if (baseINSS > 1412.00) {
        const f2 = Math.min(baseINSS - 1412.00, 2666.68 - 1412.00);
        inss += f2 * 0.09;
        if (baseINSS > 2666.68) {
          const f3 = Math.min(baseINSS - 2666.68, 4000.03 - 2666.68);
          inss += f3 * 0.12;
          if (baseINSS > 4000.03) {
            const f4 = Math.min(baseINSS - 4000.03, 7786.02 - 4000.03);
            inss += f4 * 0.14;
          }
        }
      }
    }

    const deducaoDep = (Number(editData.dependentes_qtd) || 0) * 189.59;
    const baseIRRF = Math.max(0, baseINSS - inss - deducaoDep - (Number(editData.pensao_alimenticia) || 0));
    
    let irrf = 0;
    for (const bracket of DEFAULT_TAX_CONFIG.irrfBrackets) {
      if (baseIRRF <= (bracket.limit || Infinity)) {
        irrf = Math.max(0, (baseIRRF * bracket.rate) - (bracket.deduction || 0));
        break;
      }
    }

    const tetoVT = base * 0.06;
    const descVT = editData.vt_ativo ? Math.min(Number(editData.vale_transporte_total) || 0, tetoVT) : 0;
    
    const descVA = Number(editData.vale_alimentacao) || 0;
    const descVR = Number(editData.vale_refeicao) || 0;
    const descPS = Number(editData.plano_saude_colaborador) || 0;
    const descPo = Number(editData.plano_saude_dependentes) || 0;
    const descVF = Number(editData.vale_farmacia) || 0;
    
    const valFaltas = (base / 30) * (Number(editData.faltas) || 0);
    const valAtrasos = valorHora * (Number(editData.atrasos) || 0);

    const totalDescontos = inss + irrf + descVT + descVA + descVR + descPS + descPo + descVF + 
                           valFaltas + valAtrasos + (Number(editData.adiantamento) || 0) + 
                           (Number(editData.consignado) || 0) + (Number(editData.outros_descontos) || 0) +
                           (Number(editData.pensao_alimenticia) || 0);

    const liquido = totalProventos - totalDescontos;
    const fgtsMes = baseINSS * 0.08;

    return {
      valorHora, valHE50, valHE100, valDSR, valAdicNoturno, valInsalubridade, valPericulosidade,
      valATS, valAuxMoradia, valSalarioFamilia,
      totalProventos, inss, irrf, deducaoDep, baseIRRF, descVT, descVA, descVR, descPS, descPo, descVF,
      valFaltas, valAtrasos, totalDescontos, liquido, fgtsMes, baseINSS
    };
  }, [editingEmp, editData]);

  const handleSave = () => {
    if (!editingEmp || !calculatedFolha) return;
    const updated = employees.map(emp => {
      if (emp.id === editingEmp.id) {
        return {
          ...emp,
          ...editData,
          total_proventos: calculatedFolha.totalProventos,
          total_descontos: calculatedFolha.totalDescontos,
          salario_liquido: calculatedFolha.liquido,
          inss: calculatedFolha.inss,
          irrf: calculatedFolha.irrf,
          fgts_retido: calculatedFolha.fgtsMes
        } as Payroll;
      }
      return emp;
    });
    setEmployees(updated);
    setEditingEmp(null);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const elements = document.querySelectorAll('.holerite-page-container');

    for (let i = 0; i < elements.length; i++) {
      const canvas = await html2canvas(elements[i] as HTMLElement, {
        scale: 2, 
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    }

    const filename = `Holerites_ADJPA_${new Date().getTime()}.pdf`;
    pdf.save(filename);
    setIsGeneratingPDF(false);
  };

  const MarketHolerite = ({ emp, title }: { emp: Payroll, title: string }) => {
    const protocolCode = "ADJPA-ERP-P" + emp.month + "-" + emp.matricula;
    const hasIRRF = emp.irrf > 0;
    const hasATS = emp.ats_percentual > 0;

    return (
      <div className="bg-white border-[1.5px] border-black p-4 text-[10px] font-mono leading-normal space-y-2 holerite-block relative mb-2">
        <div className="flex justify-between border-b-[1.5px] border-black pb-1.5">
          <div className="flex-1">
            <p className="font-bold text-[11px] uppercase tracking-tight">ADJPA - SEDE MUNDIAL</p>
            <p className="font-bold">CNPJ: 00.123.456/0001-99</p>
            <p className="text-[9px] uppercase mt-1">Rua das Nações, 1000 - SEDE - SÃO PAULO/SP</p>
          </div>
          <div className="text-right flex flex-col items-end">
            <p className="font-bold text-[11px] uppercase mb-2">RECIBO DE PAGAMENTO DE SALÁRIO</p>
            <div className="border border-black px-3 py-1 bg-slate-50/50">
               <p className="font-bold text-[10px]">MÊS REFERÊNCIA: {emp.month}/{emp.year}</p>
            </div>
            <p className="text-[8px] font-bold italic text-slate-600 mt-1 uppercase tracking-tighter">{title}</p>
          </div>
        </div>

        <div className="grid grid-cols-12 border-b-[1.5px] border-black overflow-visible">
          <div className="col-span-1 border-r border-black p-2 text-center min-h-[36px]">
            <span className="text-[7px] font-bold uppercase block leading-none mb-1 text-slate-500">CÓD.</span>
            <span className="font-bold">{emp.matricula}</span>
          </div>
          <div className="col-span-6 border-r border-black p-2 min-h-[36px]">
            <span className="text-[7px] font-bold uppercase block leading-none mb-1 text-slate-500">NOME DO FUNCIONÁRIO</span>
            <span className="font-bold uppercase block leading-[1.1]">{emp.employeeName}</span>
          </div>
          <div className="col-span-2 border-r border-black p-2 text-center min-h-[36px]">
            <span className="text-[7px] font-bold uppercase block leading-none mb-1 text-slate-500">CBO</span>
            <span className="font-bold">{emp.cbo || '2631-05'}</span>
          </div>
          <div className="col-span-3 p-2 min-h-[36px]">
            <span className="text-[7px] font-bold uppercase block leading-none mb-1 text-slate-500">CARGO</span>
            <span className="font-bold uppercase block leading-[1.1] pb-0.5">{emp.cargo}</span>
          </div>
        </div>

        <div className="border-b-[1.5px] border-black">
          <table className="w-full">
            <thead>
              <tr className="border-b border-black text-center font-bold uppercase text-[9px]">
                <th className="border-r border-black w-12 py-1.5">CÓD</th>
                <th className="border-r border-black text-left pl-2 py-1.5">DESCRIÇÃO</th>
                <th className="border-r border-black w-14 py-1.5">REFER.</th>
                <th className="border-r border-black w-24 text-right pr-2 py-1.5">PROVENTOS</th>
                <th className="w-24 text-right pr-2 py-1.5">DESCONTOS</th>
              </tr>
            </thead>
            <tbody className="align-top font-bold">
              <tr className="h-5">
                <td className="border-r border-black text-center pt-1">001</td>
                <td className="border-r border-black pl-2 pt-1 uppercase">SALÁRIO BASE MENSAL</td>
                <td className="border-r border-black text-center pt-1">30D</td>
                <td className="border-r border-black text-right pr-2 pt-1">{emp.salario_base.toFixed(2)}</td>
                <td className="pt-1"></td>
              </tr>
              {hasATS && (
                <tr className="h-5">
                  <td className="border-r border-black text-center pt-1">010</td>
                  <td className="border-r border-black pl-2 pt-1 uppercase">ADIC. TEMPO SERVIÇO (ATS)</td>
                  <td className="border-r border-black text-center pt-1">{emp.ats_percentual}%</td>
                  <td className="border-r border-black text-right pr-2 pt-1">{(emp.salario_base * (emp.ats_percentual/100)).toFixed(2)}</td>
                  <td className="pt-1"></td>
                </tr>
              )}
              {emp.auxilio_moradia > 0 && (
                <tr className="h-5">
                  <td className="border-r border-black text-center pt-1">080</td>
                  <td className="border-r border-black pl-2 pt-1 uppercase">AUXÍLIO MORADIA / PREBENDA</td>
                  <td className="border-r border-black text-center pt-1">FIXO</td>
                  <td className="border-r border-black text-right pr-2 pt-1">{emp.auxilio_moradia.toFixed(2)}</td>
                  <td className="pt-1"></td>
                </tr>
              )}
              
              <tr className="h-5">
                <td className="border-r border-black text-center pt-1">901</td>
                <td className="border-r border-black pl-2 pt-1 uppercase">INSS - PREVIDÊNCIA SOCIAL</td>
                <td className="border-r border-black text-center pt-1">VAR</td>
                <td className="border-r border-black text-right pr-2 pt-1"></td>
                <td className="text-right pr-2 pt-1">{emp.inss.toFixed(2)}</td>
              </tr>
              {hasIRRF && (
                <tr className="h-5">
                  <td className="border-r border-black text-center pt-1">902</td>
                  <td className="border-r border-black pl-2 pt-1 uppercase">IRRF - IMPOSTO DE RENDA</td>
                  <td className="border-r border-black text-center pt-1">VAR</td>
                  <td className="border-r border-black text-right pr-2 pt-1"></td>
                  <td className="text-right pr-2 pt-1">{emp.irrf.toFixed(2)}</td>
                </tr>
              )}
              {emp.plano_saude_colaborador > 0 && (
                <tr className="h-5">
                  <td className="border-r border-black text-center pt-1">950</td>
                  <td className="border-r border-black pl-2 pt-1 uppercase">PLANO DE SAÚDE (TITULAR)</td>
                  <td className="border-r border-black text-center pt-1">PARC</td>
                  <td className="border-r border-black text-right pr-2 pt-1"></td>
                  <td className="text-right pr-2 pt-1">{emp.plano_saude_colaborador.toFixed(2)}</td>
                </tr>
              )}
              {emp.plano_saude_dependentes > 0 && (
                <tr className="h-5">
                  <td className="border-r border-black text-center pt-1">951</td>
                  <td className="border-r border-black pl-2 pt-1 uppercase">PLANO SAÚDE (DEPENDENTES)</td>
                  <td className="border-r border-black text-center pt-1">PARC</td>
                  <td className="border-r border-black text-right pr-2 pt-1"></td>
                  <td className="text-right pr-2 pt-1">{emp.plano_saude_dependentes.toFixed(2)}</td>
                </tr>
              )}
              {emp.vale_farmacia > 0 && (
                <tr className="h-5">
                  <td className="border-r border-black text-center pt-1">960</td>
                  <td className="border-r border-black pl-2 pt-1 uppercase">CONVÊNIO VALE-FARMÁCIA</td>
                  <td className="border-r border-black text-center pt-1">VAR</td>
                  <td className="border-r border-black text-right pr-2 pt-1"></td>
                  <td className="text-right pr-2 pt-1">{emp.vale_farmacia.toFixed(2)}</td>
                </tr>
              )}
              {emp.vale_alimentacao > 0 && (
                <tr className="h-5">
                  <td className="border-r border-black text-center pt-1">970</td>
                  <td className="border-r border-black pl-2 pt-1 uppercase">DESCONTO VALE ALIMENTAÇÃO</td>
                  <td className="border-r border-black text-center pt-1">FIXO</td>
                  <td className="border-r border-black text-right pr-2 pt-1"></td>
                  <td className="text-right pr-2 pt-1">{emp.vale_alimentacao.toFixed(2)}</td>
                </tr>
              )}
              {emp.vale_refeicao > 0 && (
                <tr className="h-5">
                  <td className="border-r border-black text-center pt-1">971</td>
                  <td className="border-r border-black pl-2 pt-1 uppercase">DESCONTO VALE REFEIÇÃO</td>
                  <td className="border-r border-black text-center pt-1">FIXO</td>
                  <td className="border-r border-black text-right pr-2 pt-1"></td>
                  <td className="text-right pr-2 pt-1">{emp.vale_refeicao.toFixed(2)}</td>
                </tr>
              )}

              <tr className="h-24"><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td></td></tr>
            </tbody>
            <tfoot>
              <tr className="border-t border-black uppercase font-black">
                <td colSpan={3} className="text-right pr-2 py-1.5 border-r border-black">TOTAIS R$</td>
                <td className="border-r border-black text-right pr-2 py-1.5">{emp.total_proventos.toFixed(2)}</td>
                <td className="text-right pr-2 py-1.5">{emp.total_descontos.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="grid grid-cols-12 pt-2 pb-1">
          <div className="col-span-8 flex flex-col justify-end pr-4">
            <div className="flex items-start gap-2 mb-6">
              <Shield className="text-indigo-700 mt-1 shrink-0" size={14}/>
              <div className="text-[7px] font-bold uppercase leading-tight tracking-tight">
                CERTIFICAÇÃO DIGITAL ADJPA ERP • PROTOCOLO DE AUTENTICIDADE: {protocolCode}
                <br/>
                <span className="text-slate-500 font-normal">DOCUMENTO EMITIDO ELETRONICAMENTE COM VALIDADE JURÍDICA ICP-BRASIL • SINCRONIZADO AO ESOCIAL</span>
              </div>
            </div>
            <div className="flex justify-between items-end gap-6 mb-1">
              <div className="flex-1 border-t border-black text-center pt-1 font-bold uppercase text-[8px]">ASSINATURA DO FUNCIONÁRIO / BENEFICIÁRIO</div>
              <div className="w-24 border-t border-black text-center pt-1 font-bold uppercase text-[8px]">DATA</div>
            </div>
          </div>
          <div className="col-span-4 border-[1.5px] border-black p-3 bg-slate-50/50 flex flex-col items-center justify-center">
             <span className="text-[9px] font-black uppercase text-center w-full border-b border-black pb-1 mb-2">VALOR LÍQUIDO A RECEBER</span>
             <span className="text-[22px] font-black leading-none">R$ {emp.salario_liquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 leading-none">Processamento de Folha</h1>
          <p className="text-slate-500 font-medium mt-2">Geração de contracheques e controle de benefícios.</p>
        </div>

        <div className="flex items-center gap-3 no-print">
          {selectedIds.length > 0 && (
             <div className="flex items-center gap-2 bg-indigo-50 p-2 rounded-2xl border border-indigo-100 animate-in slide-in-from-right-4">
               <span className="px-3 text-[10px] font-black text-indigo-600 uppercase tracking-widest">{selectedIds.length} selecionados</span>
               <button 
                type="button"
                onClick={() => setHoleriteList(employees.filter(e => selectedIds.includes(e.id)))}
                className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-xs hover:bg-indigo-700 shadow-md transition-all active:scale-95"
               >
                <PrinterIcon size={16}/> Imprimir Lote
               </button>
             </div>
          )}
          <button 
            type="button"
            onClick={() => {
              setSelectedIds(employees.map(e => e.id));
              setHoleriteList(employees);
            }}
            className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-black text-xs hover:bg-emerald-700 shadow-md transition-all active:scale-95"
          >
            <PrinterIcon size={16}/> Imprimir Tudo
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden no-print">
        <table className="w-full text-left">
          <thead className="text-[10px] font-black text-slate-400 uppercase bg-slate-50/10 border-b border-slate-50">
            <tr>
              <th className="px-10 py-6 w-24 text-center">
                <div 
                  onClick={toggleSelectAll} 
                  className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center cursor-pointer mx-auto transition-all ${selectedIds.length === employees.length ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}
                >
                  {selectedIds.length === employees.length && <Check size={18} className="text-white" />}
                </div>
              </th>
              <th className="px-8 py-6">Funcionário</th>
              <th className="px-8 py-6">Matrícula</th>
              <th className="px-8 py-6">Líquido</th>
              <th className="px-10 py-6 text-right">Opções</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {employees.map(emp => (
              <tr key={emp.id} className={`hover:bg-slate-50/50 transition-all ${selectedIds.includes(emp.id) ? 'bg-indigo-50/30' : ''}`}>
                <td className="px-10 py-6 text-center">
                  <div 
                    onClick={() => toggleSelect(emp.id)} 
                    className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center cursor-pointer mx-auto transition-all ${selectedIds.includes(emp.id) ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}
                  >
                    {selectedIds.includes(emp.id) && <Check size={18} className="text-white" />}
                  </div>
                </td>
                <td className="px-8 py-6">
                   <p className="font-bold text-slate-900">{emp.employeeName}</p>
                   <p className="text-[10px] text-slate-400 font-black uppercase">{emp.cargo}</p>
                </td>
                <td className="px-8 py-6 text-xs text-slate-400 font-bold">{emp.matricula}</td>
                <td className="px-8 py-6 font-black text-emerald-600 text-lg">
                  {emp.salario_liquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
                <td className="px-10 py-6 text-right flex justify-end gap-3">
                   <button type="button" onClick={() => openEditor(emp)} className="p-3 text-slate-400 hover:text-indigo-600 bg-slate-50 rounded-xl transition-all" title="Editar"><Edit3 size={18} /></button>
                   <button type="button" onClick={() => setHoleriteList([emp])} className="p-3 text-slate-400 hover:text-emerald-600 bg-slate-50 rounded-xl transition-all" title="Imprimir Recibo"><PrinterIcon size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {holeriteList.length > 0 && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-slate-100 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] relative">
              <div className="bg-white p-6 flex justify-between items-center border-b border-slate-200 shrink-0 no-print">
                 <div>
                    <h2 className="font-black text-slate-900 uppercase text-sm tracking-widest">Recibos ({holeriteList.length})</h2>
                    <p className="text-[10px] text-slate-500 font-black uppercase mt-1 tracking-tight">Padrão A4 Duplicado • Conferência Digital</p>
                 </div>
                 <div className="flex gap-4">
                    <button type="button" onClick={handleDownloadPDF} disabled={isGeneratingPDF} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-xs hover:bg-indigo-700 transition-all flex items-center gap-2">
                       {isGeneratingPDF ? <Loader2 size={16} className="animate-spin" /> : <Download size={16}/>} Gerar PDF
                    </button>
                    <button type="button" onClick={handlePrint} className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-black text-xs hover:bg-emerald-700 shadow-lg flex items-center gap-2">
                       <PrinterIcon size={16}/> Imprimir
                    </button>
                    <button type="button" onClick={() => setHoleriteList([])} className="p-3 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X/></button>
                 </div>
              </div>
              <div className="p-10 overflow-y-auto flex-1 custom-scrollbar bg-white" id="printable-area">
                {holeriteList.map((emp, index) => (
                  <div key={emp.id} className={`holerite-page-container bg-white p-4 ${index < holeriteList.length - 1 ? 'page-break mb-12' : ''}`}>
                     <MarketHolerite emp={emp} title="VIA DO COLABORADOR / BENEFICIÁRIO" />
                     <div className="h-12 flex items-center gap-2 py-6 no-print opacity-20">
                        <div className="flex-1 border-t-[1.5px] border-dashed border-slate-400"></div>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">PICOTE DE RECORTE</span>
                        <div className="flex-1 border-t-[1.5px] border-dashed border-slate-400"></div>
                     </div>
                     <MarketHolerite emp={emp} title="VIA DO EMPREGADOR / ARQUIVO INSTITUCIONAL" />
                  </div>
                ))}
              </div>
           </div>
        </div>
      )}

      {editingEmp && calculatedFolha && (
        <div className="fixed inset-0 z-[150] bg-white overflow-y-auto custom-scrollbar no-print animate-in slide-in-from-bottom-6 duration-500">
           <div className="border-b border-slate-200 px-10 py-6 flex justify-between items-center sticky top-0 bg-white z-50 shadow-sm">
             <div className="flex items-center gap-6">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Calculator size={24}/></div>
                <div>
                   <h2 className="text-xl font-black text-slate-900 uppercase">Editor de Lançamentos: {editingEmp.employeeName}</h2>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Ajuste Manual • Mês Referência</p>
                </div>
             </div>
             <div className="flex gap-4">
                <button type="button" onClick={() => setEditingEmp(null)} className="px-8 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50">Sair</button>
                <button type="button" onClick={handleSave} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-700 flex items-center gap-2 transition-all">
                   <Save size={20}/> Salvar Dados
                </button>
             </div>
           </div>

           <div className="max-w-7xl mx-auto p-10 space-y-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                 {/* COLUNA 1: PROVENTOS */}
                 <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 p-8 space-y-8 shadow-sm">
                    <h3 className="text-sm font-black text-emerald-600 uppercase flex items-center gap-2 border-b border-slate-50 pb-4"><Plus size={18}/> Vencimentos e Acréscimos</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="md:col-span-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Salário Base Mensal (R$)</label>
                          <input type="number" step="0.01" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-indigo-700 text-xl" value={editData.salario_base || 0} onChange={e => setEditData({...editData, salario_base: Number(e.target.value)})}/>
                       </div>
                       <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Gratificações / Prêmios</label>
                          <input type="number" step="0.01" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold" value={editData.gratificacoes || 0} onChange={e => setEditData({...editData, gratificacoes: Number(e.target.value)})}/>
                       </div>
                       <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Adic. Tempo de Serviço (ATS %)</label>
                          <input type="number" step="0.1" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold" value={editData.ats_percentual || 0} onChange={e => setEditData({...editData, ats_percentual: Number(e.target.value)})}/>
                       </div>
                       <div className="md:col-span-2">
                          <label className="text-[10px] font-black text-indigo-600 uppercase mb-1 block">Auxílio Moradia / Prebenda Ministerial (Isento INSS)</label>
                          <input type="number" step="0.01" className="w-full px-4 py-3 bg-indigo-50 border border-indigo-100 rounded-2xl font-black text-indigo-700" value={editData.auxilio_moradia || 0} onChange={e => setEditData({...editData, auxilio_moradia: Number(e.target.value)})}/>
                       </div>
                    </div>
                 </div>

                 {/* COLUNA 2: DESCONTOS (Com novos campos) */}
                 <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 space-y-8 shadow-sm">
                    <h3 className="text-sm font-black text-rose-600 uppercase flex items-center gap-2 border-b border-slate-50 pb-4"><ArrowDownRight size={18}/> Retenções e Descontos</h3>
                    
                    <div className="space-y-4">
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Vale Alimentação</label>
                            <input type="number" step="0.01" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold" value={editData.vale_alimentacao || 0} onChange={e => setEditData({...editData, vale_alimentacao: Number(e.target.value)})}/>
                          </div>
                          <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Vale Refeição</label>
                            <input type="number" step="0.01" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold" value={editData.vale_refeicao || 0} onChange={e => setEditData({...editData, vale_refeicao: Number(e.target.value)})}/>
                          </div>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Plano Saúde (Tit.)</label>
                            <input type="number" step="0.01" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-rose-600" value={editData.plano_saude_colaborador || 0} onChange={e => setEditData({...editData, plano_saude_colaborador: Number(e.target.value)})}/>
                          </div>
                          <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Plano Saúde (Dep.)</label>
                            <input type="number" step="0.01" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-rose-600" value={editData.plano_saude_dependentes || 0} onChange={e => setEditData({...editData, plano_saude_dependentes: Number(e.target.value)})}/>
                          </div>
                       </div>
                       <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Vale-Farmácia (Lançado)</label>
                          <input type="number" step="0.01" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold" value={editData.vale_farmacia || 0} onChange={e => setEditData({...editData, vale_farmacia: Number(e.target.value)})}/>
                       </div>
                       <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Adiantamento de Salário</label>
                          <input type="number" step="0.01" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold" value={editData.adiantamento || 0} onChange={e => setEditData({...editData, adiantamento: Number(e.target.value)})}/>
                       </div>
                       <div>
                          <label className="text-[10px] font-black text-rose-600 uppercase mb-1 block">Pensão Alimentícia</label>
                          <input type="number" step="0.01" className="w-full px-4 py-2.5 bg-rose-50 border border-rose-100 rounded-xl font-black text-rose-700" value={editData.pensao_alimenticia || 0} onChange={e => setEditData({...editData, pensao_alimenticia: Number(e.target.value)})}/>
                       </div>
                    </div>
                 </div>
              </div>

              {/* RESUMO DO CÁLCULO */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                 <div className="lg:col-span-1 bg-slate-50 rounded-[2rem] p-8 space-y-6">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><FileSearch size={14}/> Conferência Fiscal</h3>
                    <div className="space-y-4">
                       <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-500 uppercase">Base INSS</span>
                          <span className="font-black text-slate-900">R$ {calculatedFolha.baseINSS.toFixed(2)}</span>
                       </div>
                       <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-500 uppercase">INSS</span>
                          <span className="font-black text-rose-600">- R$ {calculatedFolha.inss.toFixed(2)}</span>
                       </div>
                       <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-500 uppercase">IRRF</span>
                          <span className="font-black text-rose-600">- R$ {calculatedFolha.irrf.toFixed(2)}</span>
                       </div>
                    </div>
                 </div>

                 <div className="lg:col-span-3 bg-slate-900 rounded-[3rem] p-12 text-white flex flex-col justify-center shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none rotate-12"><DollarSign size={200}/></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                       <div className="flex flex-col justify-center">
                          <p className="text-indigo-300 font-black uppercase text-[10px] tracking-[0.2em] mb-4">Líquido a Pagar</p>
                          <h2 className="text-6xl font-black text-white leading-none">R$ {calculatedFolha.liquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
                       </div>
                       <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-4">
                          <div className="flex justify-between items-center">
                             <span className="text-[10px] font-black text-slate-500 uppercase">Proventos (+)</span>
                             <span className="text-xl font-black text-emerald-400">R$ {calculatedFolha.totalProventos.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                             <span className="text-[10px] font-black text-slate-500 uppercase">Descontos (-)</span>
                             <span className="text-xl font-black text-rose-400">R$ {calculatedFolha.totalDescontos.toFixed(2)}</span>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
