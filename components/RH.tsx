
import React, { useState } from 'react';
import { 
  UserCheck, 
  Award, 
  BookOpen, 
  Heart, 
  Search, 
  Plus,
  TrendingUp,
  Star,
  Users
} from 'lucide-react';
import { Payroll } from '../types';

interface RHViewProps {
  employees: Payroll[];
}

export const RHView: React.FC<RHViewProps> = ({ employees }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Recursos Humanos (RH)</h1>
          <p className="text-slate-500 font-medium font-sm">Gestão de talentos, desenvolvimento ministerial e bem-estar.</p>
        </div>
        <button className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-indigo-100 flex items-center gap-2">
          <Award size={18} /> Novo Treinamento
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Treinamentos Ativos', value: '08', icon: <BookOpen />, color: 'blue' },
          { label: 'Avaliações Pendentes', value: '03', icon: <Star />, color: 'amber' },
          { label: 'Satisfação Interna', value: '94%', icon: <Heart />, color: 'rose' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6">
            <div className={`p-4 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600`}>{stat.icon}</div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-black text-slate-900">Quadro de Talentos</h3>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
              <input className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Buscar colaborador..." />
            </div>
          </div>
          <div className="p-4 space-y-3">
            {employees.map(emp => (
              <div key={emp.id} className="p-4 bg-slate-50/50 hover:bg-white hover:shadow-md border border-transparent hover:border-slate-100 rounded-2xl transition-all flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center font-black text-indigo-600">
                    {emp.employeeName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{emp.employeeName}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{emp.cargo}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={10} className={s <= 4 ? "fill-amber-400 text-amber-400" : "text-slate-200"} />
                    ))}
                  </div>
                  <p className="text-[10px] font-black text-indigo-500 uppercase">Ótimo Desempenho</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-900 text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-10"><TrendingUp size={120}/></div>
            <h3 className="text-2xl font-black mb-4">Cultura & Engajamento</h3>
            <p className="text-indigo-200 text-sm leading-relaxed mb-8">
              O bem-estar da equipe ministerial impacta diretamente na saúde espiritual da igreja. 
              Monitore o índice de satisfação e ofereça suporte preventivo.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 p-4 rounded-2xl border border-white/5">
                <p className="text-[10px] font-bold text-indigo-300 uppercase">E-NPS Atual</p>
                <p className="text-3xl font-black">78</p>
              </div>
              <div className="bg-white/10 p-4 rounded-2xl border border-white/5">
                <p className="text-[10px] font-bold text-indigo-300 uppercase">Meta Q3</p>
                <p className="text-3xl font-black">85</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
            <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2">
              <Users size={18} className="text-indigo-600"/>
              Benefícios & Vantagens
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {['Plano de Saúde', 'Cesta Básica', 'Curso Teológico', 'Auxílio Transporte'].map((b, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">{b}</span>
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
