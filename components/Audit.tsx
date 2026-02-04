
import React from 'react';
import { ShieldCheck, User, Clock, Terminal, Search } from 'lucide-react';
import { MOCK_AUDIT } from '../constants';

export const Audit: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Auditoria & Logs</h1>
          <p className="text-slate-500 font-medium">Monitoramento em tempo real de todas as ações administrativas.</p>
        </div>
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 flex items-center gap-2">
          <ShieldCheck size={20}/>
          <span className="text-xs font-black uppercase tracking-widest">LGPD Compliant</span>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
            <input className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Filtrar por usuário ou ação..." />
          </div>
          <div className="flex gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Sistema Operando Localmente</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/20">
              <tr>
                <th className="px-8 py-5">Usuário</th>
                <th className="px-8 py-5">Ação Executada</th>
                <th className="px-8 py-5">Entidade</th>
                <th className="px-8 py-5">Data/Hora</th>
                <th className="px-8 py-5">Endereço IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {MOCK_AUDIT.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-all font-medium">
                  <td className="px-8 py-5 flex items-center gap-2">
                    <User size={14} className="text-indigo-400"/>
                    <span className="text-sm font-bold text-slate-700">{log.userName}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 bg-slate-900 text-white text-[10px] font-black uppercase rounded-lg">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm text-slate-500">{log.entity}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock size={12}/>
                      {log.date}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-[10px] font-black text-indigo-400">
                      <Terminal size={12}/>
                      {log.ip}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
