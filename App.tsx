
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Members } from './components/Members';
import { Finance } from './components/Finance';
import { RHView } from './components/RH';
import { DPView } from './components/DP';
import { Leaves } from './components/Leaves';
import { Assets } from './components/Assets';
import { FolhaProcessView } from './components/FolhaProcess';
import { Events } from './components/Events';
import { Communication } from './components/Communication';
import { Reports } from './components/Reports';
import { Audit } from './components/Audit';
import { MemberPortal } from './components/MemberPortal';
import { Settings } from './components/Settings';
import { UserAuth, Payroll, Member, Transaction, FinancialAccount, Unit, Asset, EmployeeLeave } from './types';
import { dbService } from './services/databaseService';
import { MOCK_PAYROLL, MOCK_LEAVES, MOCK_ASSETS } from './constants';
import { 
  User as UserIcon, Key, LogIn, Church, AlertCircle, Loader2, Cloud
} from 'lucide-react';

const SYSTEM_USERS = [
  { id: 'u1', name: 'Pr. Anderson Lima', username: 'anderson', password: '123', role: 'ADMIN' as const, avatar: 'https://picsum.photos/seed/pastor/100', unitId: 'u-sede' },
  { id: 'dev', name: 'Desenvolvedor Master', username: 'desenvolvedor', password: 'dev@ecclesia_secure_2024', role: 'DEVELOPER' as const, avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=dev', unitId: 'u-sede' }
];

const Login: React.FC<{ onLogin: (user: UserAuth) => void }> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = SYSTEM_USERS.find(u => u.username === username && u.password === password);
    if (user) {
      onLogin({ id: user.id, name: user.name, username: user.username, role: user.role, avatar: user.avatar, unitId: user.unitId });
    } else {
      setError('Credenciais inválidas. Verifique usuário e senha.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 text-center">
        <div className="p-10 pt-12">
          <div className="inline-flex p-4 bg-indigo-600 text-white rounded-[1.5rem] shadow-lg mb-6">
            <Church size={40} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">ADJPA ERP</h1>
          <p className="text-slate-500 font-medium mb-10 text-xs uppercase tracking-[0.2em]">Enterprise Edition</p>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div className="relative">
              <UserIcon className="absolute left-4 top-4 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Usuário" 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
            <div className="relative">
              <Key className="absolute left-4 top-4 text-slate-400" size={20} />
              <input 
                type="password" 
                placeholder="Senha" 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 text-rose-600 bg-rose-50 p-3 rounded-xl text-xs font-bold animate-in shake">
                <AlertCircle size={16} /> {error}
              </div>
            )}
            <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 shadow-xl transition-all flex items-center justify-center gap-2 mt-6">
              <LogIn size={20} /> Acessar Sistema
            </button>
          </form>
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 uppercase">
             <Cloud size={12}/> PostgreSQL Engine v5.0
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserAuth | null>(null);
  const [currentUnitId, setCurrentUnitId] = useState<string>('u-sede');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  
  // Carrega funcionários do localStorage ou usa dados mock
  const [employees, setEmployees] = useState<Payroll[]>(() => {
    const saved = localStorage.getItem('ecclesia_employees');
    return saved ? JSON.parse(saved) : MOCK_PAYROLL;
  });
  const [members, setMembers] = useState<Member[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [assets, setAssets] = useState<Asset[]>(MOCK_ASSETS);
  const [leaves, setLeaves] = useState<EmployeeLeave[]>(MOCK_LEAVES);

  // Persiste funcionários no localStorage sempre que a lista mudar
  useEffect(() => {
    localStorage.setItem('ecclesia_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [m, t, a] = await Promise.all([
          dbService.getMembers(),
          dbService.getTransactions(),
          dbService.getAccounts()
        ]);
        setMembers(m);
        setTransactions(t);
        setAccounts(a);
      } catch (err) {
        console.error("Erro ao carregar dados remotos. Verifique as configurações da API.");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (currentUser) fetchData();
    else setIsLoading(false);
  }, [currentUser]);

  const syncMembers = async (newList: Member[]) => {
     setMembers(newList);
     // Em produção, salvaria individualmente via dbService.saveMember
  };

  const handleUpdateTransactions = async (newList: Transaction[]) => {
    setTransactions(newList);
  };

  if (isLoading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
       <Loader2 size={48} className="text-indigo-600 animate-spin" />
       <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Sincronizando Banco de Dados...</p>
    </div>
  );

  if (!currentUser) return <Login onLogin={u => { setCurrentUser(u); setCurrentUnitId(u.unitId); }} />;

  const unitMembers = members.filter(m => m.unitId === currentUnitId);
  const unitEmployees = employees.filter(e => e.unitId === currentUnitId);
  const unitTransactions = transactions.filter(t => t.unitId === currentUnitId);
  const unitAccounts = accounts.filter(a => a.unitId === currentUnitId);
  const unitAssets = assets.filter(a => a.unitId === currentUnitId);
  const unitLeaves = leaves.filter(l => l.unitId === currentUnitId);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard user={currentUser} members={unitMembers} employees={unitEmployees} />;
      case 'members': return (
        <Members 
          members={unitMembers} 
          currentUnitId={currentUnitId}
          setMembers={syncMembers} 
          setTransactions={handleUpdateTransactions}
          accounts={unitAccounts}
          setAccounts={setAccounts}
        />
      );
      case 'finance': return (
        <Finance 
          transactions={unitTransactions} 
          currentUnitId={currentUnitId}
          setTransactions={handleUpdateTransactions}
          accounts={unitAccounts}
          setAccounts={setAccounts}
          user={currentUser}
        />
      );
      case 'assets': return <Assets assets={unitAssets} setAssets={setAssets} currentUnitId={currentUnitId} />;
      case 'rh': return <RHView employees={unitEmployees} />;
      case 'dp': return <DPView employees={unitEmployees} setEmployees={setEmployees} currentUnitId={currentUnitId} />;
      case 'leaves': return <Leaves leaves={unitLeaves} setLeaves={setLeaves} currentUnitId={currentUnitId} />;
      case 'payroll': return <FolhaProcessView employees={unitEmployees} setEmployees={setEmployees} />;
      case 'events': return <Events />;
      case 'reports': return <Reports />;
      case 'messages': return <Communication members={unitMembers} employees={unitEmployees} />;
      case 'audit': return <Audit />;
      case 'portal': return <MemberPortal />;
      case 'settings': return <Settings user={currentUser} />;
      default: return <Dashboard user={currentUser} members={unitMembers} employees={unitEmployees} />;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      user={currentUser}
      onLogout={() => setCurrentUser(null)}
      currentUnitId={currentUnitId}
      onUnitChange={setCurrentUnitId}
    >
      <div className="max-w-[1600px] mx-auto">
        {renderContent()}
      </div>
    </Layout>
  );
};

export default App;
