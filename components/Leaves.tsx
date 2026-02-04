
import React, { useState } from 'react';
import { 
  PlaneTakeoff, Plus, Search, Filter, Calendar, 
  Stethoscope, Baby, HeartPulse, Clock, ShieldCheck,
  X, Save, FileText, User, AlertCircle, Edit2
} from 'lucide-react';
import { EmployeeLeave, LeaveType } from '../types';

interface LeavesProps {
  leaves: EmployeeLeave[];
  setLeaves: (leaves: EmployeeLeave[]) => void;
  currentUnitId: string;
}

export const Leaves: React.FC<LeavesProps> = ({ leaves, setLeaves, currentUnitId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredLeaves = leaves.filter(l => 
    l.unitId === currentUnitId &&
    (l.employeeName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getLeaveIcon = (type: LeaveType) => {
    switch (type) {
      case 'MEDICAL': return <Stethoscope size={18}/>;
      case 'VACATION': return <PlaneTakeoff size={18}/>;
      case 'MATERNITY':
      case 'PATERNITY': return <Baby size={18}/>;
      default: return <Clock size={18}/>;
    }
  };

  const getLeaveColor = (type: LeaveType) => {
    switch (type) {
      case 'MEDICAL': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'VACATION': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'MATERNITY': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const leaveLabels: Record<LeaveType, string> = {
    VACATION: 'Férias',
    MEDICAL: 'Licença Médica',
    MATERNITY: 'Licença Maternidade',
    PATERNITY: 'Licença Paternidade',
    MILITARY: 'Serviço Militar',
    WEDDING: 'Casamento (Gala)',
    BEREAVEMENT: 'Falecimento (Nojo)',
    UNPAID: 'Licença não remunerada'
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 leading-tight">Afastamentos & Licenças</h1>
          <p className="text-slate-500 font-medium text-sm">Controle de férias, saúde e ausências CLT.</p>
        </div>
        <button className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black shadow-xl hover:bg-slate-800 transition-all flex items-center gap-2 uppercase text-xs">
          <Plus size={18} /> Registrar Afastamento
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/20">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por colaborador..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div> 12 Ativos
             </div>
             <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div> 5 Agendados
             </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[10px] text-slate-400 font-black uppercase tracking-widest">
              <tr>
                <th className="px-8 py-5">Colaborador</th>
                <th className="px-8 py-5">Tipo de Afastamento</th>
                <th className="px-8 py-5">Período</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredLeaves.map(leave => (
                <tr key={leave.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><User size={16}/></div>
                       <div>
                          <p className="font-bold text-slate-900">{leave.employeeName}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Unidade: {currentUnitId}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase ${getLeaveColor(leave.type)}`}>
                       {getLeaveIcon(leave.type)}
                       {leaveLabels[leave.type]}
                    </div>
                    {leave.cid10 && <span className="ml-2 text-[9px] font-black text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded">CID: {leave.cid10}</span>}
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-xs font-black text-slate-700">{new Date(leave.startDate + 'T12:00:00').toLocaleDateString('pt-BR')} até {new Date(leave.endDate + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Total: 30 dias</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                      leave.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' :
                      leave.status === 'SCHEDULED' ? 'bg-amber-50 text-amber-600' :
                      'bg-slate-100 text-slate-400'
                    }`}>
                       {leave.status === 'ACTIVE' ? 'Em Gozo' : leave.status === 'SCHEDULED' ? 'Agendado' : 'Concluído'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                       {/* Fix: Edit2 icon is now correctly imported */}
                       <button className="p-2 text-slate-400 hover:text-indigo-600 transition-all"><Edit2 size={16}/></button>
                       <button className="p-2 text-slate-400 hover:text-indigo-600 transition-all"><FileText size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-indigo-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-10 opacity-10"><HeartPulse size={120}/></div>
           <h3 className="text-2xl font-black mb-4">Conformidade eSocial</h3>
           <p className="text-indigo-100/70 text-sm leading-relaxed mb-8">
              Afastamentos superiores a 15 dias devem ser comunicados ao governo via evento S-2230. 
              Mantenha os prontuários e atestados digitalizados para auditoria imediata.
           </p>
           <div className="flex items-center gap-4">
              <button className="px-6 py-3 bg-white text-indigo-900 rounded-2xl font-black text-xs uppercase hover:bg-indigo-50 transition-all">Ver Manual de Licenças</button>
              <button className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase hover:bg-indigo-500 transition-all">Guias Médicas</button>
           </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
           <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
              <AlertCircle size={24} className="text-amber-500" />
              Atenção com Prazos
           </h3>
           <div className="space-y-4">
              {[
                { label: 'Exame de Retorno ao Trabalho', val: 'Obrigatório após 30 dias de afastamento.', icon: <HeartPulse className="text-rose-400"/> },
                { label: 'Prorrogação de Licença', val: 'Solicitar 2 dias antes do vencimento.', icon: <Clock className="text-amber-400"/> },
                { label: 'Atestados de até 2 dias', val: 'Registrar apenas para controle interno.', icon: <FileText className="text-indigo-400"/> },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                   <div className="shrink-0">{item.icon}</div>
                   <div>
                      <p className="text-xs font-black text-slate-800 uppercase tracking-tighter">{item.label}</p>
                      <p className="text-xs text-slate-500 font-medium">{item.val}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};
