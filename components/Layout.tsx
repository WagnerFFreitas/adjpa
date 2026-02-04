
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  LayoutDashboard, 
  DollarSign, 
  Calendar, 
  MessageSquare, 
  Settings, 
  Menu, 
  Church,
  Briefcase,
  LogOut,
  ChevronRight,
  ClipboardList,
  BarChart3,
  UserCircle,
  ShieldCheck,
  UserCheck,
  Calculator,
  Box,
  PlaneTakeoff,
  Building2,
  ChevronDown,
  Cloud,
  CloudOff
} from 'lucide-react';
import { UserAuth, Unit } from '../types';
import { dbService } from '../services/databaseService';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  isCollapsed: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active, onClick, isCollapsed }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
      active 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
    }`}
  >
    <div className={`transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
      {icon}
    </div>
    {!isCollapsed && <span className="font-medium whitespace-nowrap text-sm">{label}</span>}
    {!isCollapsed && active && <ChevronRight className="ml-auto w-4 h-4" />}
  </button>
);

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: UserAuth;
  onLogout: () => void;
  currentUnitId: string;
  onUnitChange: (unitId: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, activeTab, setActiveTab, user, onLogout, currentUnitId, onUnitChange 
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isUnitSelectorOpen, setIsUnitSelectorOpen] = useState(false);
  const [dbStatus, setDbStatus] = useState<'online' | 'offline'>('online');

  useEffect(() => {
    dbService.getUnits().then(setUnits).catch(() => setDbStatus('offline'));
  }, []);

  const currentUnit = units.find(u => u.id === currentUnitId);

  const menuItems = [
    { id: 'dashboard', label: 'Painel Geral', icon: <LayoutDashboard size={20} /> },
    { id: 'members', label: 'Membros', icon: <Users size={20} /> },
    { id: 'finance', label: 'Financeiro (ERP)', icon: <DollarSign size={20} /> },
    { id: 'assets', label: 'Patrimônio', icon: <Box size={20} /> },
    { id: 'rh', label: 'Recursos Humanos', icon: <UserCheck size={20} /> },
    { id: 'dp', label: 'Depto. Pessoal', icon: <Briefcase size={20} /> },
    { id: 'leaves', label: 'Afastamentos', icon: <PlaneTakeoff size={20} /> },
    { id: 'payroll', label: 'Folha de Pagamento', icon: <Calculator size={20} /> },
    { id: 'events', label: 'Agenda & Eventos', icon: <Calendar size={20} /> },
    { id: 'reports', label: 'Relatórios', icon: <BarChart3 size={20} /> },
    { id: 'messages', label: 'Comunicação', icon: <MessageSquare size={20} /> },
    { id: 'audit', label: 'Auditoria Logs', icon: <ClipboardList size={20} /> },
    { id: 'portal', label: 'Portal do Membro', icon: <UserCircle size={20} /> },
    { id: 'settings', label: 'Configurações', icon: <Settings size={20} /> },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 bg-white border-r border-slate-200 transition-all duration-300 transform ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="h-full flex flex-col p-4">
          <div className={`flex items-center gap-3 px-2 mb-8 transition-all ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-100">
              <Church size={24} />
            </div>
            {!isCollapsed && <span className="text-xl font-black bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-transparent">ADJPA</span>}
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto pr-1 scrollbar-hide">
            {menuItems.map((item) => (
              <SidebarItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={activeTab === item.id}
                isCollapsed={isCollapsed}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
              />
            ))}
          </nav>

          <div className="mt-auto border-t border-slate-100 pt-4">
            {/* Database Cloud Status */}
            <div className={`flex items-center gap-2 px-4 py-2 mb-4 rounded-xl ${dbStatus === 'online' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
              {dbStatus === 'online' ? <Cloud size={16} /> : <CloudOff size={16} />}
              {!isCollapsed && <span className="text-[10px] font-black uppercase">{dbStatus === 'online' ? 'API Online' : 'API Offline'}</span>}
            </div>
            
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors group"
            >
              <LogOut size={20} className="group-hover:scale-110 transition-transform" />
              {!isCollapsed && <span className="font-bold text-sm">Sair do Sistema</span>}
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-[4.6rem] bg-white border-b border-slate-200 flex items-center justify-between px-6 sm:px-12 shrink-0">
          <div className="flex items-center gap-4 mt-[10px]">
            <button className="lg:hidden p-2 text-slate-500" onClick={() => setIsSidebarOpen(true)}><Menu size={24} /></button>
            
            <div className="relative">
              <button 
                onClick={() => setIsUnitSelectorOpen(!isUnitSelectorOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all group"
              >
                <Building2 size={16} className="text-indigo-600" />
                <div className="text-left">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter leading-none">Unidade Ativa</p>
                  <p className="text-xs font-black text-slate-700 uppercase tracking-tight flex items-center gap-1">
                    {currentUnit?.name || 'Selecione...'}
                    <ChevronDown size={12} className={`transition-transform ${isUnitSelectorOpen ? 'rotate-180' : ''}`} />
                  </p>
                </div>
              </button>

              {isUnitSelectorOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[100] p-2 animate-in fade-in zoom-in duration-200">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest p-2 border-b border-slate-50">Alternar Entre Unidades</p>
                   {units.map(u => (
                     <button
                      key={u.id}
                      onClick={() => { onUnitChange(u.id); setIsUnitSelectorOpen(false); }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${u.id === currentUnitId ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-600'}`}
                     >
                       <div className="text-left">
                          <p className="text-xs font-black uppercase">{u.name}</p>
                          <p className="text-[9px] font-bold opacity-60">{u.city}/{u.state}</p>
                       </div>
                       {u.id === currentUnitId && <ShieldCheck size={16} />}
                     </button>
                   ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 mt-[10px]">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-black text-slate-900 leading-none">{user.name}</p>
              <p className="text-[10px] text-indigo-600 font-black uppercase mt-1 tracking-tighter">{user.role}</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-100 border-2 border-white shadow-sm overflow-hidden">
              <img src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 sm:px-12 pt-2 sm:pt-4 pb-6 sm:pb-10 bg-slate-50 custom-scrollbar">
          <div className="transform scale-[0.95] origin-top-left">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
