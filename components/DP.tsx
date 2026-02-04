import React, { useState, useMemo } from 'react';
import {
  Briefcase, UserPlus, Edit2, X, Save, ShieldCheck, FileCheck, Users,
  Landmark, QrCode, Download, Printer, Loader2, Square, CheckSquare,
  Phone, Mail, Info, Trash, HeartPulse, DollarSign, Map, UserCircle, Camera, AlertCircle, Upload, Search, Building, Droplets, PhoneCall
} from 'lucide-react';
import { Payroll, Dependent } from '../types';

interface DPViewProps {
  employees: Payroll[];
  currentUnitId: string;
  setEmployees: (newList: Payroll[]) => void;
}

// Componente do Crachá - PADRÃO CR-80 REAL (54mm x 86mm)
const EmployeeIDCard: React.FC<{ emp: Payroll }> = ({ emp }) => {
  const getVinculoColor = (tipo: string) => {
    switch (tipo) {
      case 'CLT': return 'bg-indigo-600';
      case 'PJ': return 'bg-emerald-600';
      case 'VOLUNTARIO': return 'bg-amber-600';
      default: return 'bg-slate-600';
    }
  };

  const vinculoLabel = {
    'CLT': 'EFETIVO', 'PJ': 'TERCEIRIZADO', 'VOLUNTARIO': 'VOLUNTÁRIO', 'TEMPORARIO': 'ESTAGIÁRIO'
  }[emp.tipo_contrato] || 'VISITANTE';

  return (
    /* Removido scale-[1.4] para manter tamanho real CR-80 na régua */
    <div className="flex flex-row items-start justify-center gap-2 bg-white border border-slate-200 print:border-none print:shadow-none print:gap-4" style={{ pageBreakInside: 'avoid', breakInside: 'avoid', width: 'max-content' }}>

      {/* FRENTE (54mm x 86mm) */}
      <div className="w-[54mm] h-[86mm] bg-white border border-slate-100 relative overflow-hidden flex flex-col items-center shrink-0 shadow-sm print:shadow-none">
        <div className="w-full bg-[#1e293b] py-2 px-2 flex items-start justify-start gap-2">
          <div className="bg-white p-0.5 rounded shadow-sm">
            <img src="img/logo.jpg" className="w-4 h-4 object-contain" alt="Logo" />
          </div>
          <div className="flex flex-col">
            <span className="text-[5px] text-white leading-none font-black tracking-tighter">ASSEMBLÉIA DE DEUS</span>
            <span className="text-[5px] text-white leading-none font-black tracking-tighter">JESUS PÃO QUE ALIMENTA</span>
          </div>
        </div>
        <div className={`w-full ${getVinculoColor(emp.tipo_contrato)} py-1 flex items-center justify-center`}>
          <span className="text-[6px] font-black text-white uppercase tracking-widest">{vinculoLabel}</span>
        </div>
        <div className="mt-4 relative">
          <div className="w-20 h-20 rounded-full border-3 border-slate-50 overflow-hidden bg-slate-50 flex items-center justify-center">
            {emp.photo ? (
              <img src={emp.photo} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-200 text-2xl font-black">AD</div>
            )}
          </div>
        </div>
        <div className="flex-1 w-full px-2 flex flex-col items-center justify-center text-center mt-1">
          <h4 className="text-[8px] font-black text-slate-800 leading-tight uppercase mb-0.5">{emp.employeeName}</h4>
          <p className="text-[7px] font-bold text-indigo-600 uppercase">{emp.cargo}</p>
          <p className="text-[6px] font-medium text-slate-400 uppercase">{emp.departamento || 'GERAL'}</p>
        </div>
        <div className="w-full px-2 pb-3 flex flex-col items-center gap-1">
          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${emp.matricula}`} className="w-5 h-5" alt="qr" />
          <p className="text-[4px] font-black text-red-600">VÁLIDO ATÉ 31/12/2025</p>
        </div>
      </div>

      {/* VERSO (54mm x 86mm) */}
      <div className="w-[54mm] h-[86mm] bg-white border border-slate-100 relative overflow-hidden flex flex-col p-3 shrink-0 text-slate-800 shadow-sm print:shadow-none">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-[5px] font-black text-indigo-600 uppercase">REGISTRO INTERNO</p>
            <p className="text-[9px] font-black">ID: {emp.matricula || '2024001'}</p>
          </div>
          <div className="text-right">
            <p className="text-[4px] font-bold text-slate-400 uppercase">EMISSÃO</p>
            <p className="text-[7px] font-black">01/01/2024</p>
          </div>
        </div>
        <div className="space-y-2 mb-3">
          <div>
            <p className="text-[4px] font-bold text-slate-400 uppercase">ADMISSÃO</p>
            <p className="text-[7px] font-black">{emp.data_admissao || '10/01/2021'}</p>
          </div>
          <div>
            <p className="text-[4px] font-bold text-slate-400 uppercase">EMERGÊNCIA</p>
            <p className="text-[7px] font-black">{emp.emergency_contact || '(11) 98877-6655'}</p>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-start gap-1">
            <Info size={6} className="text-indigo-400 mt-0.5" />
            <p className="text-[4px] text-slate-500 font-bold uppercase leading-tight">USO PESSOAL E INTRANSFERÍVEL.</p>
          </div>
          <div className="flex items-start gap-1">
            <AlertCircle size={6} className="text-amber-500 mt-0.5" />
            <p className="text-[4px] text-slate-500 font-bold uppercase leading-tight">EM CASO DE PERDA, DEVOLVA AO RH.</p>
          </div>
        </div>
        <div className="mt-auto flex justify-between items-end border-t border-slate-100 pt-1">
          <div className="flex flex-col">
            <span className="text-[4px] font-bold text-slate-400">(11) 4002-8922</span>
            <span className="text-[4px] font-bold text-slate-400">rh@adjpa.org</span>
          </div>
          <p className="text-[3px] text-slate-300 font-black uppercase">ASSINATURA</p>
        </div>
      </div>
    </div>
  );
};

export const DPView: React.FC<DPViewProps> = ({ employees, currentUnitId, setEmployees }) => {
  const [isIDCardOpen, setIsIDCardOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Cabem 3 crachás confortavelmente por página sem cortes.
  const chunkedEmployees = useMemo(() => {
    const list = employees.filter(e => selectedIds.includes(e.id));
    const result = [];
    for (let i = 0; i < list.length; i += 3) { result.push(list.slice(i, i + 3)); }
    return result;
  }, [employees, selectedIds]);

  return (
    <div className="p-6 space-y-6">
      <style>{`
        @media print {
          body { visibility: hidden !important; margin: 0 !important; padding: 0 !important; background: white !important; }
          #print-section, #print-section * { visibility: visible !important; }
          #print-section { display: block !important; position: absolute !important; left: 0 !important; top: -10mm !important; width: 210mm !important; }
          @page { size: portrait; margin: 0 !important; }
          .a4-page { 
            width: 210mm !important; height: 297mm !important; 
            padding: 0mm !important; 
            page-break-after: always !important; 
            display: flex !important; flex-direction: column !important; 
            align-items: center !important; justify-content: flex-start !important; 
            background: white !important; box-sizing: border-box !important;
          }
          .grid-print { display: grid !important; grid-template-columns: 1fr !important; gap: 10mm 0 !important; justify-items: center !important; width: 100% !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>

      {/* Interface Principal */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <h1 className="text-xl font-black text-slate-900 uppercase">Departamento Pessoal</h1>
        <button onClick={() => selectedIds.length > 0 && setIsIDCardOpen(true)} className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-bold text-xs uppercase flex items-center gap-2">
          <Printer size={16} /> Imprimir CR-80 ({selectedIds.length})
        </button>
      </div>

      {/* Tabela Simplificada para Seleção */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b">
            <tr>
              <th className="px-4 py-4 w-12 text-center">
                <button onClick={() => setSelectedIds(selectedIds.length === employees.length ? [] : employees.map(e => e.id))}>
                  {selectedIds.length === employees.length ? <CheckSquare size={18} className="text-indigo-600" /> : <Square size={18} />}
                </button>
              </th>
              <th className="px-5">Colaborador</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {employees.map(emp => (
              <tr key={emp.id}>
                <td className="px-4 py-4 text-center">
                  <button onClick={() => setSelectedIds(prev => prev.includes(emp.id) ? prev.filter(i => i !== emp.id) : [...prev, emp.id])}>
                    {selectedIds.includes(emp.id) ? <CheckSquare size={18} className="text-indigo-600" /> : <Square size={18} />}
                  </button>
                </td>
                <td className="px-5 py-4 font-bold text-slate-700">{emp.employeeName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DE PREVIEW */}
      {isIDCardOpen && (
        <div className="fixed inset-0 z-[99999] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-10 no-print">
          <div className="bg-white rounded-[2.5rem] w-full max-w-5xl h-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
              <h3 className="text-xl font-black text-slate-900 uppercase">Tamanho Real (PVC CR-80)</h3>
              <div className="flex gap-4">
                <button onClick={() => window.print()} className="bg-indigo-600 text-white px-10 py-3.5 rounded-2xl font-black text-xs uppercase shadow-xl">Imprimir</button>
                <button onClick={() => setIsIDCardOpen(false)} className="p-3.5 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100"><X size={24} /></button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-12 bg-slate-100 flex flex-col items-center gap-10">
              {chunkedEmployees.map((group, idx) => (
                <div key={idx} className="bg-white shadow-2xl p-12 shrink-0 border border-slate-200" style={{ width: '210mm', minHeight: '297mm' }}>
                  <div className="flex flex-col items-center justify-start gap-12">
                    {group.map(e => <EmployeeIDCard key={e.id} emp={e} />)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CONTAINER DE IMPRESSÃO */}
      <div id="print-section" className="opacity-0 pointer-events-none fixed top-0 left-0 print:opacity-100 print:pointer-events-auto">
        {chunkedEmployees.map((group, idx) => (
          <div key={idx} className="a4-page">
            <div className="grid-print">
              {group.map(e => <EmployeeIDCard key={e.id} emp={e} />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};