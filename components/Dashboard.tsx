
import React, { useEffect, useState, useMemo } from 'react';
import { 
  Users, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  Sparkles,
  Target,
  Clock,
  Cake,
  Gift,
  PartyPopper,
  ChevronRight,
  AlertTriangle,
  FileWarning,
  Database,
  ShieldCheck
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { geminiService } from '../services/geminiService';
import { UserAuth, Member, Payroll } from '../types';

const chartData = [
  { name: 'Jan', revenue: 4000, members: 2400 },
  { name: 'Fev', revenue: 3000, members: 1398 },
  { name: 'Mar', revenue: 2000, members: 9800 },
  { name: 'Abr', revenue: 2780, members: 3908 },
  { name: 'Mai', revenue: 1890, members: 4800 },
];

interface DashboardProps {
  user: UserAuth;
  members: Member[];
  employees: Payroll[];
}

export const Dashboard: React.FC<DashboardProps> = ({ user, members, employees }) => {
  const [insights, setInsights] = useState<string>('Carregando insights estratégicos...');

  useEffect(() => {
    const fetchInsights = async () => {
      const result = await geminiService.analyzeChurchHealth({
        totalMembers: members.length,
        activeMembers: members.filter(m => m.status === 'ACTIVE').length,
        monthlyRevenue: 25000,
        monthlyExpenses: 18000
      });
      setInsights(result || "Não foi possível carregar os insights.");
    };
    fetchInsights();
  }, [members]);

  // Lógica de Aniversariantes
  const anniversaries = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();

    const allPeople = [
      ...members.map(m => ({ name: m.name, birthDate: m.birthDate, avatar: m.avatar, type: 'Membro' })),
      ...employees.map(e => ({ name: e.employeeName, birthDate: e.birthDate, avatar: `https://ui-avatars.com/api/?name=${e.employeeName}`, type: 'Funcionário' }))
    ];

    const thisMonth = allPeople.filter(p => {
      if (!p.birthDate) return false;
      const bDate = new Date(p.birthDate + 'T00:00:00'); 
      return (bDate.getMonth() + 1) === currentMonth;
    }).sort((a, b) => {
      return new Date(a.birthDate + 'T00:00:00').getDate() - new Date(b.birthDate + 'T00:00:00').getDate();
    });

    const isToday = (dateStr: string) => {
      const bDate = new Date(dateStr + 'T00:00:00');
      return bDate.getDate() === currentDay && (bDate.getMonth() + 1) === currentMonth;
    };

    return { thisMonth, currentDay, currentMonth, isToday };
  }, [members, employees]);

  const cnhAlerts = useMemo(() => {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    return employees.filter(e => {
      if (!e.cnh_vencimento) return false;
      const vDate = new Date(e.cnh_vencimento + 'T12:00:00');
      return vDate <= thirtyDaysFromNow;
    }).map(e => {
      const vDate = new Date(e.cnh_vencimento! + 'T12:00:00');
      const diffTime = vDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return {
        ...e,
        daysToExpiry: diffDays,
        isExpired: diffDays <= 0
      };
    }).sort((a, b) => a.daysToExpiry - b.daysToExpiry);
  }, [employees]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-base font-black text-slate-900 leading-tight">Olá, {user.name.split(' ')[0]}</h1>
          <div className="flex items-center gap-2 mt-1">
             <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100 animate-pulse">
                <Database size={10} />
                <span className="text-[8px] font-black uppercase">DB Local Online</span>
             </div>
             <p className="text-slate-500 font-medium text-xs">Unidade Sede • v2.8 ERP Ready</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="bg-indigo-600 text-white px-3 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-100 flex items-center gap-2 text-xs uppercase">
            <ShieldCheck size={14} /> Auditoria Rápida
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        {[
          { label: 'Total Membros', value: members.length.toString(), trend: '+12%', icon: <Users />, color: 'indigo' },
          { label: 'Arrecadação', value: 'R$ 25.400', trend: '+8%', icon: <DollarSign />, color: 'emerald' },
          { label: 'Frequência Média', value: '312', trend: '-2%', icon: <Target />, color: 'amber' },
          { label: 'Novos Visitantes', value: '18', trend: '+24%', icon: <TrendingUp />, color: 'blue' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-1">
              <div className={`p-1.5 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-105 transition-transform shadow-sm`}>
                {React.cloneElement(stat.icon as any, { size: 14 })}
              </div>
              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${stat.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {stat.trend}
              </span>
            </div>
            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-base font-black text-slate-900 mt-0.5">{stat.value}</h3>
          </div>
        ))}
      </div>

      {cnhAlerts.length > 0 && (
        <div className="bg-rose-50 border border-rose-100 rounded-lg p-2 animate-in slide-in-from-top-4 duration-500">
           <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                 <div className="p-1 bg-rose-600 text-white rounded-lg shadow">
                    <FileWarning size={14} />
                 </div>
                 <div>
                   <h3 className="text-[10px] font-black text-rose-900 uppercase tracking-tight">Alertas Críticos de Documentação</h3>
                   <p className="text-[8px] font-bold text-rose-600 uppercase mt-0.5">Vencimentos de CNH Próximos</p>
                 </div>
              </div>
              <span className="bg-rose-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full">{cnhAlerts.length} PENDÊNCIAS</span>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {cnhAlerts.map(alert => (
                 <div key={alert.id} className="bg-white p-2 rounded-lg border border-rose-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                    <div className="flex items-center gap-3">
                       <div className="w-6 h-6 rounded-full bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                          <img src={`https://ui-avatars.com/api/?name=${alert.employeeName}&background=f8fafc&color=475569`} className="w-full h-full object-cover" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-slate-900 leading-tight">{alert.employeeName.split(' ')[0]} {alert.employeeName.split(' ').slice(-1)}</p>
                          <p className="text-[7px] font-bold text-slate-500 uppercase">Venc: {new Date(alert.cnh_vencimento! + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className={`text-[8px] font-black uppercase ${alert.isExpired ? 'text-rose-600' : 'text-amber-600'}`}>
                          {alert.isExpired ? 'VENCIDA' : `Faltam ${alert.daysToExpiry} dias`}
                       </p>
                       <AlertTriangle size={10} className={`ml-auto mt-1 ${alert.isExpired ? 'text-rose-600' : 'text-amber-500'} animate-pulse`} />
                    </div>
                 </div>
              ))}
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-black text-slate-900">Fluxo Financeiro vs Membresia</h3>
            <select className="bg-slate-50 border border-slate-200 text-[10px] font-black text-slate-700 uppercase rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option>Últimos 6 meses</option>
              <option>Este ano</option>
            </select>
          </div>
          <div className="h-[160px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 700}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}}
                />
                <Area type="monotone" dataKey="revenue" stroke="#4f46e5" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-3">
          <div className="bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden flex flex-col flex-1">
            <div className="p-2.5 border-b border-slate-50 bg-indigo-50/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-indigo-600 text-white rounded-lg shadow">
                  <Cake size={14} />
                </div>
                <h3 className="font-black text-slate-900 text-[10px]">Aniversariantes do Mês</h3>
              </div>
              <span className="text-[10px] font-black text-indigo-700 uppercase bg-white px-2 py-1 rounded-md border border-indigo-100">
                {new Date().toLocaleDateString('pt-BR', { month: 'long' })}
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto max-h-[260px] p-2.5 space-y-2 custom-scrollbar">
              {anniversaries.thisMonth.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center space-y-3 py-10">
                   <PartyPopper size={32} className="opacity-40" />
                   <p className="text-xs font-bold uppercase tracking-tight">Nenhum aniversário este mês</p>
                </div>
              ) : (
                anniversaries.thisMonth.map((person, idx) => {
                  const personIsToday = anniversaries.isToday(person.birthDate);
                  const bDate = new Date(person.birthDate + 'T00:00:00');
                  
                  return (
                    <div key={idx} className={`p-2 rounded-xl border transition-all flex items-center justify-between group ${personIsToday ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-slate-50 border-slate-100 hover:bg-white hover:shadow-md hover:border-indigo-200'}`}>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img src={person.avatar} className="w-7 h-7 rounded-xl object-cover border-2 border-white shadow-sm" alt="" />
                          {personIsToday && (
                             <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-indigo-600 rounded-full animate-ping" />
                          )}
                        </div>
                        <div>
                          <p className={`text-[10px] font-black leading-tight ${personIsToday ? 'text-white' : 'text-slate-900'}`}>{person.name.split(' ')[0]} {person.name.split(' ').slice(-1)}</p>
                          <p className={`text-[8px] font-bold uppercase tracking-tighter ${personIsToday ? 'text-indigo-200' : 'text-slate-600'}`}>{person.type} • Dia {bDate.getDate()}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end">
                        {personIsToday ? (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/20 rounded-lg backdrop-blur-sm animate-bounce">
                             <PartyPopper size={12}/>
                             <span className="text-[10px] font-black uppercase">HOJE!</span>
                          </div>
                        ) : (
                          <button className="p-1 text-slate-500 hover:text-indigo-600 group-hover:bg-indigo-50 rounded-lg transition-all">
                             <Gift size={12}/>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            <button className="m-3 mt-0 p-2.5 border-2 border-dashed border-slate-200 rounded-xl text-[9px] font-black text-slate-600 uppercase tracking-widest hover:border-indigo-300 hover:text-indigo-600 transition-all flex items-center justify-center gap-2">
              Ver Relatório Completo <ChevronRight size={10}/>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-1 bg-slate-900 text-white p-3 rounded-lg shadow-2xl relative overflow-hidden flex flex-col h-full">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Sparkles size={120} />
          </div>
          <div className="relative z-10 flex-1">
            <div className="flex items-center gap-2 mb-5">
              <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg shadow-indigo-900">
                <Sparkles size={16} className="text-white" />
              </div>
              <h3 className="font-black text-xs">IA Eclesiástica</h3>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white/5 p-2.5 rounded-lg border border-white/5 backdrop-blur-sm">
                <p className="text-[10px] text-indigo-100 leading-relaxed italic font-medium">
                  "{insights}"
                </p>
              </div>
              
              <div className="pt-6 border-t border-white/10">
                <h4 className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-4">Ações Recomendadas</h4>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-xs text-slate-200 font-bold">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Focar na retenção de visitantes
                  </li>
                  <li className="flex items-center gap-3 text-xs text-slate-200 font-bold">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Revisar campanha de dízimos
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <button className="mt-6 w-full bg-indigo-600 text-white py-2 rounded-xl font-black text-[10px] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-950 z-10">
            Gerar Relatório IA
          </button>
        </div>

        <div className="lg:col-span-2 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
           <h3 className="font-black text-slate-900 mb-6">Metas Ministeriais</h3>
           <div className="space-y-6">
              {[
                { label: 'Crescimento de Membresia', val: '78%', color: 'indigo' },
                { label: 'Campanha Sede Própria', val: '45%', color: 'emerald' },
                { label: 'Engajamento Voluntariado', val: '92%', color: 'amber' },
              ].map((m, i) => (
                <div key={i} className="space-y-2">
                   <div className="flex justify-between items-center text-xs font-bold text-slate-600 uppercase">
                      <span>{m.label}</span>
                      <span className={`text-${m.color}-700 font-black`}>{m.val}</span>
                   </div>
                   <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className={`bg-${m.color}-600 h-full rounded-full`} style={{width: m.val}} />
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};
