
import React, { useState, useMemo } from 'react';
import {
  Search, UserPlus, Filter, Edit2, Trash2, X, Church, MapPin,
  Sparkles, Heart, ChevronRight, User, BookOpen, Layers,
  MapIcon, MessageSquare, DollarSign, Briefcase, Camera, Check,
  Calendar, Plus, Trash, Download, QrCode, Users, TrendingUp,
  UserCheck, Baby, MoreHorizontal, Printer, Mail, Phone,
  Star, Square, CheckSquare, Loader2, Award, Flame, Zap, Droplets,
  Map, Building, AlertCircle
} from 'lucide-react';
import { Member, MemberContribution, Transaction, FinancialAccount, Dependent } from '../types';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

type MemberTab = 'pessoais' | 'familia' | 'vida_crista' | 'ministerios' | 'endereco' | 'financeiro' | 'observacoes';

interface MembersProps {
  members: Member[];
  currentUnitId: string;
  setMembers: (newList: Member[]) => void;
  setTransactions: (newList: Transaction[]) => void;
  accounts: FinancialAccount[];
  setAccounts: (newList: FinancialAccount[]) => void;
}

// Componente da Carteirinha Otimizado
const MemberIDCard: React.FC<{ member: Member }> = ({ member }) => (
  <div className="flex flex-row items-start justify-center gap-0 print:mb-0 mb-3 no-break id-card-element bg-white" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
    {/* Frente */}
    <div className="w-[86mm] h-[54mm] bg-gradient-to-br from-slate-900 to-indigo-950 rounded-l-lg shadow-md relative overflow-hidden flex flex-col p-3 text-white border border-slate-800 border-r-0 shrink-0">
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

      {/* Header */}
      <div className="flex items-center gap-2.5 mb-1.5 relative z-10 w-full">
        <div className="absolute top-3 left-3 w-5 h-5 bg-white rounded-md shadow-sm border border-slate-200/60"></div>
        <div className="bg-white p-1 rounded-lg shadow-sm shrink-0">
          <img
            src="https://i.ibb.co/3yk0Q9k/logo-church.png"
            className="w-6 h-6 object-contain"
            alt="Logo ADJPA"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=ADJPA&background=4f46e5&color=fff'; }}
          />
        </div>
        <div className="text-left flex-1 min-w-0">
          <p className="text-[11px] font-black uppercase tracking-wider leading-none mb-0.5 truncate">ADJPA</p>
          <p className="text-[4px] font-bold text-indigo-300 uppercase tracking-tight truncate">Assembleia de Deus</p>
        </div>
        <div className="absolute right-4 top-3">
          <span className="text-[5px] font-black px-1.5 py-0.5 bg-indigo-600 rounded-full text-white uppercase tracking-wider shadow-sm border border-indigo-400/30">Membro</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex w-full gap-2.5 relative z-10 mt-1 items-center flex-1">
        {/* Photo */}
        <div className="w-[22mm] h-[28mm] rounded-lg border-[2px] border-slate-600 overflow-hidden shadow-lg bg-slate-800 shrink-0 relative">
          <img
            src={member.avatar}
            className="w-full h-full object-cover"
            alt={member.name}
            onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${member.name}&background=1e293b&color=fff`; }}
          />
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col justify-center min-w-0">
          <div className="mb-2">
            <h4 className="text-[10px] font-black uppercase leading-tight mb-0.5 text-white drop-shadow-sm line-clamp-2">{member.name}</h4>
            <p className="text-[6px] font-bold text-indigo-400 uppercase tracking-widest truncate">{member.ecclesiasticalPosition || 'MEMBRO ATIVO'}</p>
          </div>

          <div className="mt-auto">
            <p className="text-[4px] font-bold text-slate-400 uppercase leading-none mb-0.5">Congregação</p>
            <p className="text-[6px] font-black text-white uppercase tracking-wide truncate">SEDE MUNDIAL</p>
          </div>
        </div>
      </div>

      {/* Bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600"></div>
    </div>

    {/* Divisor para Dobra */}
    <div className="w-[0.5px] h-[54mm] border-r border-dashed border-slate-300 z-20"></div>

    {/* Verso */}
    <div className="w-[86mm] h-[54mm] bg-white rounded-r-lg shadow-md relative overflow-hidden flex p-1.5 border border-slate-200 border-l-0 shrink-0">
      <div className="flex-1 flex flex-col h-full relative z-10 justify-between">
        <div className="border-b-2 border-slate-100 pb-1 mb-0.5">
          <p className="text-[1.2px] font-black uppercase tracking-tight text-slate-900 leading-none">Credencial de Identificação</p>
        </div>

        <div className="grid grid-cols-2 gap-x-[5px] gap-y-[3px]">
          <div>
            <p className="text-[0.6px] font-bold text-slate-500 uppercase mb-0.5">CPF</p>
            <p className="text-[1.05px] font-black text-slate-800 tracking-tight">{member.cpf || '---.---.---'}</p>
          </div>
          <div>
            <p className="text-[0.6px] font-bold text-slate-500 uppercase mb-0.5">Data Nasc.</p>
            <p className="text-[1.05px] font-black text-slate-800">{member.birthDate ? new Date(member.birthDate + 'T12:00:00').toLocaleDateString('pt-BR') : '--/--/----'}</p>
          </div>
          <div>
            <p className="text-[0.6px] font-bold text-slate-500 uppercase mb-0.5">Data Origem</p>
            <p className="text-[1.05px] font-black text-slate-800">
              {member.membershipDate
                ? new Date(member.membershipDate + 'T12:00:00').toLocaleDateString('pt-BR')
                : (member.conversionDate
                  ? new Date(member.conversionDate + 'T12:00:00').toLocaleDateString('pt-BR')
                  : '---')}
            </p>
          </div>
          <div>
            <p className="text-[0.6px] font-bold text-slate-500 uppercase mb-0.5">Validade</p>
            <p className="text-[1.05px] font-black text-rose-600">31/12/2025</p>
          </div>
        </div>

        <div className="mt-auto pt-[5px]">
          <div className="border-t border-dashed border-slate-200"></div>
          <p className="text-[0.75px] font-bold text-slate-400 uppercase tracking-widest text-center mt-1">Assinatura do Pastor Presidente</p>
        </div>
      </div>

      <div className="w-[22mm] flex flex-col items-center justify-center gap-[3px] border-l-2 border-slate-50 pl-[5px] ml-[3px]">
        <div className="p-1 bg-white rounded-lg border border-slate-100 shadow-sm">
          <QrCode size={24} className="text-slate-900" />
        </div>
        <div className="text-center">
          <p className="text-[0.6px] font-black text-indigo-900 uppercase leading-tight tracking-wide">Validação<br />Digital</p>
        </div>
      </div>
    </div>
  </div>
);

export const Members: React.FC<MembersProps> = ({ members, currentUnitId, setMembers, setTransactions, accounts, setAccounts }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIDCardOpen, setIsIDCardOpen] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [activeTab, setActiveTab] = useState<MemberTab>('pessoais');

  // Estados para busca de CEP
  const [isSearchingCEP, setIsSearchingCEP] = useState(false);
  const [cepError, setCepError] = useState('');

  const [newTithe, setNewTithe] = useState({
    value: '',
    date: new Date().toISOString().split('T')[0],
    type: 'TITHE' as 'TITHE' | 'OFFERING' | 'CAMPAIGN',
    accountId: accounts[0]?.id || ''
  });

  // Estado para novo filho/dependente
  const [newChild, setNewChild] = useState<Partial<Dependent>>({ name: '', birthDate: '', relationship: 'FILHO' });

  const [formData, setFormData] = useState<Partial<Member>>({
    name: '', cpf: '', rg: '', email: '', phone: '', whatsapp: '', profession: '',
    role: 'MEMBER', status: 'ACTIVE', gender: 'M', maritalStatus: 'SINGLE',
    birthDate: '', conversionDate: '', conversionPlace: '', baptismDate: '',
    baptismChurch: '', baptizingPastor: '', holySpiritBaptism: 'NAO',
    membershipDate: '', churchOfOrigin: '', discipleshipCourse: 'NAO_INICIADO', biblicalSchool: 'NAO_FREQUENTA',
    mainMinistry: '', ministryRole: '', otherMinistries: [], ecclesiasticalPosition: '', consecrationDate: '',
    isTithable: false, isRegularGiver: false, participatesCampaigns: false, contributions: [],
    address: { zipCode: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '' },
    observations: '', specialNeeds: '', talents: '', spiritualGifts: '',
    cellGroup: '', unitId: currentUnitId
  });

  const handleCEPLookup = async (cep: string) => {
    const cleanedCEP = cep.replace(/\D/g, '');
    if (cleanedCEP.length !== 8) return;

    setIsSearchingCEP(true);
    setCepError('');
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanedCEP}/json/`);
      const data = await response.json();

      if (data.erro) {
        setCepError('CEP não encontrado.');
        return;
      }

      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address!,
          zipCode: data.cep,
          street: data.logradouro,
          neighborhood: data.bairro,
          city: data.localidade,
          state: data.uf
        }
      }));
    } catch (err) {
      setCepError('Erro ao buscar CEP. Verifique sua conexão.');
    } finally {
      setIsSearchingCEP(false);
    }
  };

  const stats = useMemo(() => {
    const active = members.filter(m => m.status === 'ACTIVE').length;
    const leaders = members.filter(m => m.role === 'LEADER').length;
    const visitors = members.filter(m => m.role === 'VISITOR').length;
    return { active, leaders, visitors };
  }, [members]);

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.cpf && m.cpf.includes(searchTerm))
  );

  const toggleSelectMember = (id: string) => {
    setSelectedMemberIds(prev =>
      prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedMemberIds.length === filteredMembers.length) {
      setSelectedMemberIds([]);
    } else {
      setSelectedMemberIds(filteredMembers.map(m => m.id));
    }
  };

  const handleSave = () => {
    if (!formData.name) {
      alert("O nome é obrigatório.");
      return;
    }

    const dataToSave = {
      ...formData,
      unitId: currentUnitId,
      status: formData.status || 'ACTIVE',
      role: formData.role || 'MEMBER',
      contributions: formData.contributions || [],
      address: formData.address || { zipCode: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '' }
    } as Member;

    if (editingMember) {
      const updatedList = members.map(m => m.id === editingMember.id ? { ...m, ...dataToSave } : m);
      setMembers(updatedList);
    } else {
      const newMember = {
        ...dataToSave,
        id: Math.random().toString(36).substr(2, 9),
        avatar: `https://i.pravatar.cc/150?u=${Math.random()}`
      } as Member;
      setMembers([...members, newMember]);
    }
    closeModal();
  };

  const openModal = (member?: Member) => {
    setCepError('');
    setIsSearchingCEP(false);
    if (member) {
      setEditingMember(member);
      setFormData({
        ...member,
        address: member.address || { zipCode: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '' }
      });
    } else {
      setEditingMember(null);
      setFormData({
        name: '', role: 'MEMBER', status: 'ACTIVE', gender: 'M', maritalStatus: 'SINGLE',
        isTithable: false, isRegularGiver: false, participatesCampaigns: false, contributions: [],
        address: { zipCode: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '' },
        otherMinistries: [], talents: '', spiritualGifts: '', unitId: currentUnitId
      });
    }
    setActiveTab('pessoais');
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingMember(null); };

  const addChild = () => {
    if (newChild.name && newChild.birthDate) {
      alert("Dependente adicionado com sucesso ao prontuário.");
      setNewChild({ name: '', birthDate: '', relationship: 'FILHO' });
    }
  };

  const handleAddContribution = () => {
    if (!newTithe.value || Number(newTithe.value) <= 0) return;
    const contributionId = Math.random().toString(36).substr(2, 9);
    const contributionValue = Number(newTithe.value);

    const contribution: MemberContribution = {
      id: contributionId,
      value: contributionValue,
      date: newTithe.date,
      type: newTithe.type,
      description: `Lançado via prontuário: ${formData.name}`
    };

    const updatedContributions = [contribution, ...(formData.contributions || [])];
    setFormData(prev => ({ ...prev, contributions: updatedContributions }));

    const globalTransaction: Transaction = {
      id: 'tr_' + contributionId,
      unitId: currentUnitId,
      description: `${newTithe.type === 'TITHE' ? 'Dízimo' : 'Oferta'} - ${formData.name}`,
      amount: contributionValue,
      date: newTithe.date,
      type: 'INCOME',
      category: newTithe.type,
      accountId: newTithe.accountId,
      memberId: editingMember?.id || 'new',
      status: 'PAID',
      paymentMethod: 'CASH'
    };

    setTransactions([globalTransaction]); // Nota: setTransactions agora espera o Delta ou o Wrapper trata a mesclagem.

    const updatedAccounts = accounts.map(acc => {
      if (acc.id === newTithe.accountId) {
        return { ...acc, currentBalance: acc.currentBalance + contributionValue };
      }
      return acc;
    });
    setAccounts(updatedAccounts);

    setNewTithe({ ...newTithe, value: '' });
  };

  const handleOpenBatchCards = () => {
    if (selectedMemberIds.length === 0) {
      alert("Selecione um ou mais membros na tabela abaixo.");
      return;
    }
    setEditingMember(null);
    setIsIDCardOpen(true);
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    const container = document.getElementById('printable-area-multi');
    if (!container) return;

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pages = container.querySelectorAll('.a4-page-mimic');

      for (let i = 0; i < pages.length; i++) {
        const pageElement = pages[i] as HTMLElement;
        const canvas = await html2canvas(pageElement, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      }

      pdf.save(`Carteirinhas_ADJPA_${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const chunkedMembers = useMemo(() => {
    const list = editingMember ? [editingMember] : members.filter(m => selectedMemberIds.includes(m.id));
    const size = 5;
    const result = [];
    for (let i = 0; i < list.length; i += size) {
      result.push(list.slice(i, i + size));
    }
    return result;
  }, [members, selectedMemberIds, editingMember]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-lg font-black text-slate-900 leading-tight">Gestão de Membresia</h1>
          <p className="text-slate-700 font-medium text-xs">Cuidado pastoral e administrativo em tempo real.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={handleOpenBatchCards}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl font-black text-xs uppercase shadow-xl transition-all ${selectedMemberIds.length > 0 ? 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700' : 'bg-slate-300 text-slate-600 cursor-help'}`}
          >
            <QrCode size={16} /> Imprimir Carteirinhas {selectedMemberIds.length > 0 && `(${selectedMemberIds.length})`}
          </button>

          <button onClick={() => openModal()} className="flex-1 md:flex-none bg-slate-900 text-white px-7 py-2.5 rounded-2xl font-bold shadow-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all">
            <UserPlus size={16} /> Novo Cadastro
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {[
          { label: 'Membros Ativos', val: stats.active, icon: <UserCheck size={20} /> },
          { label: 'Líderes Ativos', val: stats.leaders, icon: <Star size={20} /> },
          { label: 'Visitantes / Transição', val: stats.visitors, icon: <TrendingUp size={20} /> },
          { label: 'Total Registrados', val: members.length, icon: <Users size={20} /> },
        ].map((s, i) => (
          <div key={i} className={`bg-white p-2 rounded-xl border border-slate-100 shadow-sm flex items-center gap-2`}>
            <div className={`p-1 rounded-lg bg-indigo-50 text-indigo-600`}>{React.cloneElement(s.icon as any, { size: 14 })}</div>
            <div>
              <p className="text-[7px] font-black text-slate-700 uppercase tracking-widest">{s.label}</p>
              <p className="text-base font-black text-slate-900">{s.val}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 text-slate-600" size={16} />
          <input type="text" placeholder="Buscar por nome, e-mail ou CPF..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-xs text-slate-900 font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-slate-800 font-bold text-xs hover:bg-slate-50 transition-colors"><Filter size={16} /> Filtros Avançados</button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-slate-50/50 text-[10px] text-slate-700 font-black uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-3 py-2 w-12 text-center">
                  <button onClick={toggleSelectAll} className="p-1 hover:bg-slate-200 rounded-md transition-colors" title="Selecionar Todos">
                    {selectedMemberIds.length === filteredMembers.length && filteredMembers.length > 0 ? (
                      <CheckSquare className="text-indigo-600" size={12} />
                    ) : (
                      <Square className="text-slate-400" size={12} />
                    )}
                  </button>
                </th>
                <th className="px-3 py-2">Identificação</th>
                <th className="px-4 py-2">Cargo / Ministério</th>
                <th className="px-4 py-2">Vínculos</th>
                <th className="px-4 py-2">Status Financeiro</th>
                <th className="px-4 py-2">Situação</th>
                <th className="px-4 py-2 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[10px]">
              {filteredMembers.map((member) => (
                <tr key={member.id} className={`hover:bg-slate-50/50 transition-all group ${selectedMemberIds.includes(member.id) ? 'bg-indigo-50/30' : ''}`}>
                  <td className="px-3 py-2 text-center">
                    <button onClick={() => toggleSelectMember(member.id)} className="p-1 hover:bg-slate-200 rounded-md transition-colors">
                      {selectedMemberIds.includes(member.id) ? (
                        <CheckSquare className="text-indigo-600" size={12} />
                      ) : (
                        <Square className="text-slate-400" size={12} />
                      )}
                    </button>
                  </td>
                  <td className="px-3 py-1.5">
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <img
                          src={member.avatar}
                          className="w-8 h-8 rounded-2xl object-cover shadow-sm border border-slate-100"
                          alt=""
                          onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${member.name}&background=1e293b&color=fff`; }}
                        />
                        {member.isTithable && <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center" title="Dizimista Ativo"><DollarSign size={7} className="text-white" /></div>}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-[10px] leading-none mb-0.5">{member.name}</p>
                        <p className="text-[8px] text-slate-700 font-bold uppercase tracking-tighter">{member.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-1.5">
                    <p className="text-slate-900 font-bold text-xs">{member.ecclesiasticalPosition || 'Membro'}</p>
                    <p className="text-[9px] text-indigo-700 font-black uppercase">{member.mainMinistry || 'Geral'}</p>
                  </td>
                  <td className="px-4 py-1.5">
                    <div className="flex items-center gap-1">
                      <div className="flex -space-x-2">
                        <div className="w-5 h-5 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[7px] font-black text-slate-700" title="Possui vínculos familiares">F</div>
                      </div>
                      <span className="text-[9px] font-bold text-slate-700 uppercase">Ver Vínculos</span>
                    </div>
                  </td>
                  <td className="px-4 py-1.5">
                    <div className="flex flex-col gap-1">
                      <span className={`px-2 py-0.5 rounded w-fit text-[8px] font-black uppercase ${member.isTithable ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                        {member.isTithable ? 'Dizimista' : 'Visitante'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-1.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase ${member.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
                      {member.status === 'ACTIVE' ? 'Regular' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-1.5 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setEditingMember(member); setIsIDCardOpen(true); }} className="p-1 text-slate-600 hover:text-indigo-600 transition-colors bg-slate-50 rounded-xl" title="Imprimir Carteirinha">
                        <QrCode size={12} />
                      </button>
                      <button onClick={() => openModal(member)} className="p-1 text-slate-600 hover:text-indigo-600 transition-colors bg-slate-50 rounded-xl" title="Editar Cadastro">
                        <Edit2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE IMPRESSÃO */}
      {isIDCardOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-300">
          <style>{`
             @media print {
               @page { size: portrait !important; margin: 0 !important; }
             }
           `}</style>
          <div className="bg-white rounded-[2rem] w-full max-w-5xl shadow-2xl relative flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-[2rem] no-print">
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none">Impressão em Lote</h3>
                <p className="text-[10px] text-slate-700 font-bold uppercase tracking-widest mt-2">Cabem até 5 unidades por folha A4</p>
              </div>
              <div className="flex gap-3">
                <button onClick={handleDownloadPDF} disabled={isGeneratingPDF} className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-indigo-600 text-indigo-700 rounded-xl font-black text-xs uppercase shadow-lg hover:bg-indigo-50 transition-all disabled:opacity-50">
                  {isGeneratingPDF ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} Gerar PDF
                </button>
                <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">
                  <Printer size={16} /> Imprimir Tudo
                </button>
                <button onClick={() => { setIsIDCardOpen(false); setEditingMember(null); }} className="p-3 hover:bg-white rounded-full text-slate-600 transition-all shadow-sm"><X size={20} /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-10 bg-slate-200/50 custom-scrollbar" id="printable-area">
              {chunkedMembers.map((group, pageIndex) => (
                <div key={pageIndex} className="a4-page-mimic bg-white mx-auto shadow-lg border border-slate-200 flex flex-col items-center p-[10mm] mb-12 last:mb-0 relative page-break print:mb-0 print:shadow-none print:border-none" style={{ width: '210mm', height: '297mm', minHeight: '297mm' }}>
                  <div className="w-full flex flex-col items-center justify-start gap-1">
                    {group.map(m => (
                      <MemberIDCard key={m.id} member={m} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CADASTRO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in duration-300">
            <div className="p-8 bg-white border-b border-slate-100 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg"><UserPlus size={24} /></div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 leading-none uppercase">{editingMember ? 'Edição Ministerial' : 'Cadastro de Membresia'}</h2>
                  <p className="text-[10px] text-slate-800 font-black uppercase tracking-tighter mt-2 tracking-[0.1em]">Dossiê Completo e Histórico Espiritual</p>
                </div>
              </div>
              <button onClick={closeModal} className="p-3 hover:bg-slate-100 rounded-full text-slate-600 transition-colors"><X /></button>
            </div>

            <div className="bg-white px-8 flex gap-6 border-b border-slate-100 shrink-0 overflow-x-auto scrollbar-hide">
              {[
                { id: 'pessoais', label: 'Dados Básicos', icon: <User size={16} /> },
                { id: 'familia', label: 'Família', icon: <Users size={16} /> },
                { id: 'vida_crista', label: 'Caminhada Cristã', icon: <Sparkles size={16} /> },
                { id: 'ministerios', label: 'Dons & Talentos', icon: <Layers size={16} /> },
                { id: 'endereco', label: 'Endereço', icon: <MapPin size={16} /> },
                { id: 'financeiro', label: 'Dízimos & Ofertas', icon: <DollarSign size={16} /> },
                { id: 'observacoes', label: 'Prontuário', icon: <MessageSquare size={16} /> },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as MemberTab)}
                  className={`py-5 px-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter transition-all relative whitespace-nowrap ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-700 hover:text-slate-900'}`}
                >
                  {tab.icon} {tab.label}
                  {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full" />}
                </button>
              ))}
            </div>

            <div className="p-10 overflow-y-auto custom-scrollbar flex-1 bg-white">
              {activeTab === 'pessoais' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-10 animate-in fade-in">
                  <div className="md:col-span-3">
                    <div className="aspect-square bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-600 hover:border-indigo-300 hover:text-indigo-700 transition-all cursor-pointer group">
                      <Camera size={32} className="group-hover:scale-110 transition-transform" />
                      <span className="text-[9px] font-black uppercase mt-2">Alterar Foto</span>
                    </div>
                  </div>
                  <div className="md:col-span-9 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-[9px] font-black text-slate-800 uppercase mb-1 block">Nome Completo *</label>
                        <input className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Nome completo" />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-slate-800 uppercase mb-1 block">Data de Nascimento *</label>
                        <input type="date" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900" value={formData.birthDate} onChange={e => setFormData({ ...formData, birthDate: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="text-[9px] font-black text-slate-800 uppercase mb-1 block">CPF</label>
                        <input className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold" value={formData.cpf} onChange={e => setFormData({ ...formData, cpf: e.target.value })} placeholder="000.000.000-00" />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-slate-800 uppercase mb-1 block">Sexo</label>
                        <select className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900" value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value as any })}>
                          <option value="M">Masculino</option>
                          <option value="F">Feminino</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-slate-800 uppercase mb-1 block">Celular / WhatsApp *</label>
                        <input className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="(00) 00000-0000" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'familia' && (
                <div className="space-y-10 animate-in fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 text-indigo-600 mb-2 border-b border-indigo-50 pb-2">
                        <Heart size={18} />
                        <h3 className="text-xs font-black uppercase tracking-widest">Informações Conjugais</h3>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="text-[9px] font-black text-slate-800 uppercase mb-1 block">Estado Civil</label>
                          <select className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900" value={formData.maritalStatus} onChange={e => setFormData({ ...formData, maritalStatus: e.target.value as any })}>
                            <option value="SINGLE">Solteiro(a)</option>
                            <option value="MARRIED">Casado(a)</option>
                            <option value="DIVORCED">Divorciado(a)</option>
                            <option value="WIDOWED">Viúvo(a)</option>
                          </select>
                        </div>
                        {formData.maritalStatus === 'MARRIED' && (
                          <div className="grid grid-cols-1 gap-4 animate-in slide-in-from-top-2">
                            <div>
                              <label className="text-[9px] font-black text-slate-800 uppercase mb-1 block">Nome do Cônjuge</label>
                              <input className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900" placeholder="Nome completo do esposo(a)" />
                            </div>
                            <div>
                              <label className="text-[9px] font-black text-slate-800 uppercase mb-1 block">Data de Casamento</label>
                              <input type="date" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-2 text-indigo-600 mb-2 border-b border-indigo-50 pb-2">
                        <Baby size={18} />
                        <h3 className="text-xs font-black uppercase tracking-widest">Registro de Filhos</h3>
                      </div>
                      <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200 space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="text-[9px] font-black text-slate-800 uppercase mb-1 block">Nome do Filho(a)</label>
                            <input className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold" value={newChild.name} onChange={e => setNewChild({ ...newChild, name: e.target.value })} placeholder="Nome completo" />
                          </div>
                          <div>
                            <label className="text-[9px] font-black text-slate-800 uppercase mb-1 block">Data de Nascimento</label>
                            <input type="date" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold" value={newChild.birthDate} onChange={e => setNewChild({ ...newChild, birthDate: e.target.value })} />
                          </div>
                          <button onClick={addChild} className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-black text-[10px] uppercase shadow-md hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                            <Plus size={16} /> Adicionar à Família
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'vida_crista' && (
                <div className="space-y-10 animate-in fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-8">
                      <div>
                        <div className="flex items-center gap-2 text-indigo-600 mb-4">
                          <Zap size={18} />
                          <h3 className="text-xs font-black uppercase tracking-widest">Conversão e Origem</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-1">
                            <label className="text-[9px] font-black text-slate-800 uppercase mb-1 block">Data de Conversão</label>
                            <input type="date" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={formData.conversionDate} onChange={e => setFormData({ ...formData, conversionDate: e.target.value })} />
                          </div>
                          <div className="col-span-1">
                            <label className="text-[9px] font-black text-slate-800 uppercase mb-1 block">Local</label>
                            <input className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold" placeholder="Igreja/Cidade" value={formData.conversionPlace} onChange={e => setFormData({ ...formData, conversionPlace: e.target.value })} />
                          </div>
                          <div className="col-span-2">
                            <label className="text-[9px] font-black text-slate-800 uppercase mb-1 block">Igreja de Procedência</label>
                            <input className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold" placeholder="Nome da instituição anterior" value={formData.churchOfOrigin} onChange={e => setFormData({ ...formData, churchOfOrigin: e.target.value })} />
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 text-indigo-600 mb-4">
                          <Award size={18} />
                          <h3 className="text-xs font-black uppercase tracking-widest">Formação Espiritual</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[9px] font-black text-slate-800 uppercase mb-1 block">Curso de Discipulado</label>
                            <select className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={formData.discipleshipCourse} onChange={e => setFormData({ ...formData, discipleshipCourse: e.target.value as any })}>
                              <option value="NAO_INICIADO">Não Iniciado</option>
                              <option value="EM_ANDAMENTO">Em Andamento</option>
                              <option value="CONCLUIDO">Concluído</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[9px] font-black text-slate-800 uppercase mb-1 block">Escola Bíblica (EBD)</label>
                            <select className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={formData.biblicalSchool} onChange={e => setFormData({ ...formData, biblicalSchool: e.target.value as any })}>
                              <option value="ATIVO">Aluno Ativo</option>
                              <option value="INATIVO">Afastado</option>
                              <option value="NAO_FREQUENTA">Não Frequenta</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[2.5rem]">
                        <div className="flex items-center gap-2 text-indigo-800 mb-6">
                          <Droplets size={20} />
                          <h3 className="text-sm font-black uppercase tracking-widest">Registros de Batismo</h3>
                        </div>
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-[9px] font-black text-indigo-900 uppercase mb-1 block">Data Batismo Águas</label>
                              <input type="date" className="w-full px-5 py-3 bg-white border border-indigo-200 rounded-2xl font-bold text-indigo-900" value={formData.baptismDate} onChange={e => setFormData({ ...formData, baptismDate: e.target.value })} />
                            </div>
                            <div>
                              <label className="text-[9px] font-black text-indigo-900 uppercase mb-1 block">Batizado no Espírito Santo?</label>
                              <select className="w-full px-5 py-3 bg-white border border-indigo-200 rounded-2xl font-bold text-indigo-900" value={formData.holySpiritBaptism} onChange={e => setFormData({ ...formData, holySpiritBaptism: e.target.value as any })}>
                                <option value="NAO">Não</option>
                                <option value="SIM">Sim</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="text-[9px] font-black text-indigo-900 uppercase mb-1 block">Pastor que Batizou</label>
                            <input className="w-full px-5 py-3 bg-white border border-indigo-200 rounded-2xl font-bold text-indigo-900" placeholder="Nome do Ministro" value={formData.baptizingPastor} onChange={e => setFormData({ ...formData, baptizingPastor: e.target.value })} />
                          </div>
                          <div>
                            <label className="text-[9px] font-black text-indigo-900 uppercase mb-1 block">Igreja do Batismo</label>
                            <input className="w-full px-5 py-3 bg-white border border-indigo-200 rounded-2xl font-bold text-indigo-900" placeholder="Congregação/Sede" value={formData.baptismChurch} onChange={e => setFormData({ ...formData, baptismChurch: e.target.value })} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'ministerios' && (
                <div className="space-y-10 animate-in fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-8">
                      <div>
                        <div className="flex items-center gap-2 text-indigo-600 mb-6 border-b border-indigo-50 pb-2">
                          <Award size={18} />
                          <h3 className="text-xs font-black uppercase tracking-widest">Graduação Ministerial</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div>
                            <label className="text-[9px] font-black text-slate-800 uppercase mb-1 block">Cargo Eclesiástico</label>
                            <select className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={formData.ecclesiasticalPosition} onChange={e => setFormData({ ...formData, ecclesiasticalPosition: e.target.value })}>
                              <option value="">Selecione...</option>
                              <option value="MEMBRO">Membro</option>
                              <option value="AUXILIAR">Auxiliar</option>
                              <option value="DIACONO">Diácono(isa)</option>
                              <option value="PRESBITERO">Presbítero</option>
                              <option value="EVANGELISTA">Evangelista</option>
                              <option value="MISSIONARIO">Missionário(a)</option>
                              <option value="PASTOR">Pastor(a)</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[9px] font-black text-slate-800 uppercase mb-1 block">Data de Consagração</label>
                            <input type="date" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={formData.consecrationDate} onChange={e => setFormData({ ...formData, consecrationDate: e.target.value })} />
                          </div>
                          <div className="col-span-full">
                            <label className="text-[9px] font-black text-slate-800 uppercase mb-1 block">Ministério Principal</label>
                            <input className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold" placeholder="Ex: Louvor, Infantil, Intercessão" value={formData.mainMinistry} onChange={e => setFormData({ ...formData, mainMinistry: e.target.value })} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div>
                        <div className="flex items-center gap-2 text-indigo-600 mb-6 border-b border-indigo-50 pb-2">
                          <Flame size={18} />
                          <h3 className="text-xs font-black uppercase tracking-widest">Dons & Aptidões</h3>
                        </div>
                        <div className="space-y-6">
                          <div>
                            <label className="text-[9px] font-black text-slate-800 uppercase mb-2 block tracking-widest">Dons Espirituais Manifestos</label>
                            <textarea className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[2rem] font-medium text-sm outline-none focus:ring-2 focus:ring-indigo-500 h-24" placeholder="Ex: Profecia, Cura, Línguas..." value={formData.spiritualGifts} onChange={e => setFormData({ ...formData, spiritualGifts: e.target.value })} />
                          </div>
                          <div>
                            <label className="text-[9px] font-black text-slate-800 uppercase mb-2 block tracking-widest">Talentos e Habilidades Técnicas</label>
                            <textarea className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[2rem] font-medium text-sm outline-none focus:ring-2 focus:ring-indigo-500 h-24" placeholder="Ex: Eletricista, Cozinheiro, Designer..." value={formData.talents} onChange={e => setFormData({ ...formData, talents: e.target.value })} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'financeiro' && (
                <div className="space-y-8 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2">
                      <Heart size={18} className="text-rose-500" />
                      <h3 className="text-sm font-black text-slate-900 uppercase">Histórico de Contribuições</h3>
                    </div>
                    <div className="bg-indigo-50 px-4 py-2 rounded-xl">
                      <span className="text-lg font-black text-indigo-800">R$ {(formData.contributions?.reduce((a, c) => a + c.value, 0) || 0).toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                  <div className="bg-indigo-900 text-white p-8 rounded-[2.5rem] shadow-xl">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                      <div className="md:col-span-3">
                        <label className="text-[9px] font-black text-indigo-200 uppercase mb-2 block tracking-widest">Valor (R$)</label>
                        <input type="number" className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl font-black text-white placeholder-indigo-300/50" value={newTithe.value} onChange={e => setNewTithe({ ...newTithe, value: e.target.value })} placeholder="0,00" />
                      </div>
                      <div className="md:col-span-3">
                        <label className="text-[9px] font-black text-indigo-200 uppercase mb-2 block tracking-widest">Data</label>
                        <input type="date" className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl font-bold text-white" value={newTithe.date} onChange={e => setNewTithe({ ...newTithe, date: e.target.value })} />
                      </div>
                      <div className="md:col-span-6">
                        <button onClick={handleAddContribution} className="w-full bg-white text-indigo-900 py-3 rounded-xl font-black text-[10px] uppercase shadow-lg hover:bg-indigo-50 transition-all flex items-center justify-center gap-2">
                          <Plus size={16} /> Lançar Contribuição
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="border border-slate-100 rounded-[2rem] overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-[9px] font-black text-slate-800 uppercase tracking-widest">
                        <tr><th className="px-6 py-3">Data</th><th className="px-6 py-3">Tipo</th><th className="px-6 py-3 text-right">Valor</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-xs font-bold text-slate-900">
                        {formData.contributions?.map(c => (
                          <tr key={c.id}>
                            <td className="px-6 py-3">{new Date(c.date).toLocaleDateString('pt-BR')}</td>
                            <td className="px-6 py-3"><span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded uppercase text-[8px]">{c.type}</span></td>
                            <td className="px-6 py-3 text-right">R$ {c.value.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'endereco' && (
                <div className="space-y-8 animate-in fade-in">
                  <div className="bg-indigo-50 border border-indigo-100 p-8 rounded-[2.5rem] flex flex-col lg:flex-row gap-8 items-start">
                    <div className="shrink-0 p-4 bg-white rounded-2xl shadow-sm">
                      <Map size={32} className="text-indigo-600" />
                    </div>
                    <div className="flex-1 space-y-4 w-full">
                      <div className="flex items-center gap-4">
                        <div className="flex-1 relative">
                          <label className="text-[10px] font-black text-indigo-800 uppercase mb-2 block tracking-widest">CEP (Localização)</label>
                          <div className="relative">
                            <input
                              className={`w-full px-5 py-4 bg-white border rounded-2xl font-black text-indigo-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${cepError ? 'border-rose-300 ring-rose-100' : 'border-indigo-100'}`}
                              placeholder="00000-000"
                              value={formData.address?.zipCode || ''}
                              onChange={e => {
                                const val = e.target.value;
                                setFormData({ ...formData, address: { ...formData.address!, zipCode: val } });
                                if (val.replace(/\D/g, '').length === 8) handleCEPLookup(val);
                              }}
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                              {isSearchingCEP ? <Loader2 size={20} className="text-indigo-400 animate-spin" /> : <Search size={20} className="text-indigo-300" />}
                            </div>
                          </div>
                          {cepError && <p className="text-[10px] font-bold text-rose-500 mt-2 uppercase flex items-center gap-1 animate-in slide-in-from-left-2"><AlertCircle size={10} /> {cepError}</p>}
                        </div>
                        <div className="w-32">
                          <label className="text-[10px] font-black text-indigo-800 uppercase mb-2 block tracking-widest">Número</label>
                          <input
                            className="w-full px-5 py-4 bg-white border border-indigo-100 rounded-2xl font-black text-indigo-700 outline-none"
                            placeholder="S/N"
                            value={formData.address?.number || ''}
                            onChange={e => setFormData({ ...formData, address: { ...formData.address!, number: e.target.value } })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Logradouro / Rua</label>
                      <div className="relative">
                        <Building className="absolute left-4 top-4 text-slate-300" size={18} />
                        <input
                          className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800"
                          placeholder="Nome da rua, avenida, etc."
                          value={formData.address?.street || ''}
                          onChange={e => setFormData({ ...formData, address: { ...formData.address!, street: e.target.value } })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Bairro</label>
                      <input
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800"
                        placeholder="Ex: Copacabana"
                        value={formData.address?.neighborhood || ''}
                        onChange={e => setFormData({ ...formData, address: { ...formData.address!, neighborhood: e.target.value } })}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Complemento / Ref.</label>
                      <input
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800"
                        placeholder="Bloco, Apt, Fundos..."
                        value={formData.address?.complement || ''}
                        onChange={e => setFormData({ ...formData, address: { ...formData.address!, complement: e.target.value } })}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Cidade</label>
                      <input
                        className="w-full px-5 py-4 bg-slate-100 border border-slate-200 rounded-2xl font-black text-slate-500"
                        readOnly
                        value={formData.address?.city || ''}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Estado (UF)</label>
                      <input
                        className="w-full px-5 py-4 bg-slate-100 border border-slate-200 rounded-2xl font-black text-indigo-600 text-center"
                        readOnly
                        value={formData.address?.state || ''}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'observacoes' && (
                <div className="space-y-6 animate-in fade-in">
                  <div>
                    <label className="text-[9px] font-black text-slate-800 uppercase mb-2 block tracking-widest">Prontuário Ministerial & Observações Pastorais</label>
                    <textarea className="w-full px-8 py-6 bg-slate-50 border border-slate-200 rounded-[3rem] font-medium text-sm outline-none focus:ring-2 focus:ring-indigo-500 h-[300px]" placeholder="Anote aqui informações relevantes para o acompanhamento pastoral, necessidades especiais ou histórico disciplinar..." value={formData.observations} onChange={e => setFormData({ ...formData, observations: e.target.value })} />
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-4 shrink-0">
              <button onClick={closeModal} className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 uppercase text-xs">Descartar</button>
              <button onClick={handleSave} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 uppercase text-xs">
                <Check size={20} /> Gravar Cadastro Ministerial
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
