
import React from 'react';
import { User, Award, Heart, History, Calendar, CreditCard } from 'lucide-react';

export const MemberPortal: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-8 items-center">
        <div className="w-32 h-32 rounded-[2rem] bg-indigo-100 flex items-center justify-center text-indigo-600 border-4 border-indigo-50 shadow-inner overflow-hidden">
          <img src="https://i.pravatar.cc/150?u=1" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-black text-slate-900">Olá, João Silva</h1>
          <p className="text-slate-500 font-medium">Membro ativo desde 2010 • Ministério de Louvor</p>
          <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase border border-emerald-100">Batizado</span>
            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase border border-indigo-100">Dizimista Fiel</span>
          </div>
        </div>
        <button className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl">Editar Perfil</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2">
              <History size={18} className="text-indigo-600"/>
              Minhas Contribuições Recentes
            </h3>
            <div className="space-y-4">
              {[
                { date: '05/05/2024', type: 'Dízimo', val: 'R$ 500,00', status: 'Confirmado' },
                { date: '21/04/2024', type: 'Oferta Especial', val: 'R$ 50,00', status: 'Confirmado' },
              ].map((c, i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white rounded-xl shadow-sm"><CreditCard size={18} className="text-indigo-500"/></div>
                    <div>
                      <p className="font-bold text-slate-900">{c.type}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{c.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-900">{c.val}</p>
                    <p className="text-[10px] text-emerald-600 font-bold uppercase">{c.status}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold text-xs hover:border-indigo-300 hover:text-indigo-600 transition-all">Ver Histórico Completo</button>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10"><Award size={80}/></div>
            <h3 className="font-black text-lg mb-4">Próximo Passo</h3>
            <p className="text-indigo-100 text-sm leading-relaxed mb-6">Você completou o curso de Liderança 1. O próximo passo é o treinamento de **Pastoreio Local**.</p>
            <button className="w-full bg-white text-indigo-600 py-3 rounded-xl font-black text-xs hover:bg-indigo-50 transition-all">Inscrever-se Agora</button>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2 text-sm">
              <Calendar size={18} className="text-indigo-600"/>
              Minha Agenda
            </h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="text-center">
                  <p className="text-[10px] font-black text-indigo-600 uppercase">Dom</p>
                  <p className="text-xl font-black text-slate-900">19</p>
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">Escala de Louvor</p>
                  <p className="text-xs text-slate-500">Culto da Noite • 18:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
