
import React, { useState, useMemo } from 'react';
import {
  Briefcase, UserPlus, Edit2, Trash2, X, Save,
  FileText, User, ShieldCheck, ChevronRight, FileCheck, MapPin,
  HeartPulse, Pill, Bus, Utensils, ArrowDownRight, Landmark, Users,
  CreditCard, Plus, Calendar, Check, Droplets, PhoneCall, DollarSign, Clock, Star,
  Upload, FileWarning, ExternalLink, AlertCircle, Home, HardDrive,
  QrCode, Download, Printer, Loader2, Square, CheckSquare, Phone, Mail, Info, Trash,
  Stethoscope, Accessibility, CreditCard as CardIcon, Map, Search, Building, UserCircle,
  Camera
} from 'lucide-react';
import { Payroll, Dependent } from '../types';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface DPViewProps {
  employees: Payroll[];
  currentUnitId: string;
  setEmployees: (newList: Payroll[]) => void;
}

// Componente do Crachá do Funcionário (Padrão CR-80: 54mm x 86mm)
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
    'CLT': 'EFETIVO',
    'PJ': 'TERCEIRIZADO',
    'VOLUNTARIO': 'VOLUNTÁRIO',
    'TEMPORARIO': 'ESTAGIÁRIO'
  }[emp.tipo_contrato] || 'VISITANTE';

  return (
    <div className="flex flex-row items-start justify-center gap-1.5 print:gap-1.5 no-break id-card-element bg-white p-1 border border-slate-50 print:border-none print:shadow-none" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
      {/* FRENTE DO CRACHÁ */}
      <div className="w-[54mm] h-[86mm] bg-white border border-slate-100 relative overflow-hidden flex flex-col items-center shrink-0">
        {/* Header escuro com logo e nome da empresa */}
        <div className="w-full bg-slate-800 py-2 px-2 flex items-start justify-start gap-2">
          <div className="bg-white p-1 rounded shadow-sm mt-0.5">
            <img src="img/logo.jpg" className="w-4 h-4 object-contain" alt="Logo" crossOrigin="anonymous" />
          </div>
          <div className="flex flex-col justify-start" style={{ marginTop: '0.075rem' }}>
            <span className="text-[6px] text-white leading-none mb-1 font-black" style={{ letterSpacing: '1px' }}>ASSEMBLÉIA DE DEUS</span>
            <span className="text-[6px] text-white leading-none font-black" style={{ letterSpacing: '1px' }}>JESUS PÃO QUE ALIMENTA</span>
          </div>
        </div>

        {/* Faixa de vínculo */}
        <div className={`w-full ${getVinculoColor(emp.tipo_contrato)} py-1 flex items-center justify-center`}>
          <span className="text-[6px] font-black text-white uppercase tracking-wider">{vinculoLabel}</span>
        </div>

        {/* Foto com iniciais */}
        <div className="mt-4 relative">
          <div className="w-24 h-24 rounded-full border-3 border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center">
            {emp.photo ? (
              <img
                src={emp.photo}
                className="w-full h-full object-cover"
                alt={emp.employeeName}
                crossOrigin="anonymous"
              />
            ) : (
              <span className="text-[32px] font-black text-slate-400 uppercase">
                {emp.employeeName?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'RO'}
              </span>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-md border border-slate-100">
            <ShieldCheck size={12} className="text-indigo-600" />
          </div>
        </div>

        {/* Informações do funcionário */}
        <div className="flex-1 w-full px-2 flex flex-col items-center justify-center text-center mt-2">
          <h4 className="text-[9px] font-black text-slate-900 leading-tight mb-0.5 uppercase">{emp.employeeName?.replace(/\s+/g, '\u00A0\u00A0') || 'NOME DO FUNCIONÁRIO'}</h4>
          <p className="text-[8px] font-bold text-indigo-600 uppercase tracking-wide mb-0.5">{emp.cargo}</p>
          <p className="text-[7px] font-medium text-slate-400 uppercase tracking-widest">{emp.departamento || 'ECLESIÁSTICO'}</p>
        </div>

        {/* QR Code */}
        <div className="w-full px-2 pb-3 flex flex-col items-center gap-1">
          <div className="p-1 bg-white border border-slate-200 rounded">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`ID:${emp.matricula || '2024001'};Nome:${emp.employeeName};Cargo:${emp.cargo};Admissao:${emp.data_admissao || '2024-01-01'}`)}&format=png&ecc=H`}
              className="w-6 h-6"
              alt="QR Code"
              crossOrigin="anonymous"
              style={{ imageRendering: 'crisp-edges' }}
            />
          </div>
          <div className="flex flex-col items-center">
            <p className="text-[5px] font-medium text-slate-400 uppercase tracking-widest">VÁLIDO ATÉ</p>
            <p className="text-[6px] font-black text-red-600">31/12/2025</p>
          </div>
        </div>
      </div>

      {/* VERSO DO CRACHÁ */}
      <div className="w-[54mm] h-[86mm] bg-white relative overflow-hidden flex flex-col p-3 border border-slate-100 shrink-0 text-slate-800">
        {/* Cabeçalho do verso */}
        <div className="w-full flex justify-between items-start mb-3">
          <div>
            <p className="text-[9px] font-medium text-indigo-600 uppercase tracking-wide">REGISTRO INTERNO</p>
            <p className="text-[12px] font-black text-slate-900">ID: {emp.matricula || '2024001'}</p>
          </div>
          <div className="text-center">
            <p className="text-[7px] font-medium text-slate-400 uppercase">EMISSÃO</p>
            <p className="text-[9px] font-bold text-slate-900">01/01/2024</p>
          </div>
        </div>

        {/* Data Admissão e Tipo Sanguíneo */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-[7px] font-medium text-slate-400 uppercase">DATA DE ADMISSÃO</p>
            <p className="text-[9px] font-bold text-slate-900">
              {emp.data_admissao ? new Date(emp.data_admissao + 'T12:00:00').toLocaleDateString('pt-BR') : '10/01/2021'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[7px] font-medium text-slate-400 uppercase">T. SANGUÍNEO</p>
            <p className="text-[9px] font-bold text-red-600">{emp.blood_type || 'O+'}</p>
          </div>
        </div>

        {/* Contato Emergência */}
        <div className="mb-6">
          <p className="text-[7px] font-medium text-slate-400 uppercase mb-1">CONTATO&nbsp;&nbsp;DE&nbsp;EMERGÊNCIA</p>
          <p className="text-[9px] font-bold text-slate-900">
            {emp.emergency_contact || '(11) 98877-6655'}
          </p>
          <p className="text-[7px] font-medium text-slate-600">(Esposa)</p>
        </div>

        {/* Avisos */}
        <div className="space-y-4 mb-8 px-2 py-1">
          <div className="flex items-start gap-1">
            <div className="w-4 h-4 flex items-center justify-center shrink-0 mt-1">
              <Info size={14} className="text-indigo-400" />
            </div>
            <p className="text-[7px] text-slate-500 font-medium leading-tight uppercase">USO&nbsp;PESSOAL&nbsp;&nbsp;E&nbsp;&nbsp;INTRANSFERÍVEL.<br />OBRIGATÓRIO&nbsp;&nbsp;EM&nbsp;DEPENDÊNCIAS<br />DA&nbsp;INSTITUIÇÃO.</p>
          </div>
          <div className="flex items-start gap-1">
            <div className="w-4 h-4 flex items-center justify-center shrink-0 mt-1">
              <AlertCircle size={14} className="text-amber-500" />
            </div>
            <p className="text-[7px] text-slate-500 font-medium leading-tight uppercase">EM&nbsp;CASO&nbsp;&nbsp;DE&nbsp;&nbsp;PERDA,&nbsp;DEVOLVA&nbsp;&nbsp;À&nbsp;&nbsp;ADJPA&nbsp;&nbsp;-&nbsp;SETOR&nbsp;&nbsp;DE&nbsp;RH.</p>
          </div>
        </div>

        {/* Rodapé com QR e contatos */}
        <div className="mt-auto">
          <div className="flex justify-between items-start mb-4">
            <div className="flex flex-col items-start">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(`CONTROLE:${emp.matricula || '2024001'};ADJPA:${emp.employeeName}`)}&format=png&ecc=H`}
                className="w-5 h-5 mb-1"
                alt="QR Code Controle"
                crossOrigin="anonymous"
                style={{ imageRendering: 'crisp-edges' }}
              />
              <span className="text-[4px] font-medium text-slate-300 uppercase">CONTROLE</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <Phone size={7} className="text-indigo-600" />
                <span className="text-[7px] font-medium text-slate-600">(11) 4002-8922</span>
              </div>
              <div className="flex items-center gap-1">
                <Mail size={7} className="text-indigo-600" />
                <span className="text-[7px] font-medium text-slate-600">rh@adjpa.org</span>
              </div>
            </div>
          </div>

          {/* Linha de assinatura */}
          <div className="w-full flex flex-col items-center">
            <div className="h-px w-20 bg-slate-300 mb-1"></div>
            <p className="text-[5px] text-slate-400 uppercase font-medium tracking-wide">ASSINATURA DIGITAL / ESOCIAL</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const DPView: React.FC<DPViewProps> = ({ employees, currentUnitId, setEmployees }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIDCardOpen, setIsIDCardOpen] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSearchingCEP, setIsSearchingCEP] = useState(false);
  const [cepError, setCepError] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'personal' | 'address' | 'payroll_base' | 'benefits' | 'dependents' | 'bank' | 'contract'>('personal');
  const [editingEmp, setEditingEmp] = useState<Payroll | null>(null);

  const [newDep, setNewDep] = useState<Partial<Dependent>>({ name: '', birthDate: '', relationship: 'FILHO' });

  const [formData, setFormData] = useState<Partial<Payroll>>({
    employeeName: '', cpf: '', rg: '', pis: '', ctps: '', cargo: '',
    salario_base: 0, dependentes_lista: [], dependentes_qtd: 0,
    ats_percentual: 0, auxilio_moradia: 0,
    blood_type: '', emergency_contact: '', photo: '',
    is_pcd: false, tipo_deficiencia: '',
    he50_qtd: 0, he100_qtd: 0, dsr_ativo: true, insalubridade_grau: 'NONE', periculosidade_ativo: false,
    vt_ativo: true, va_ativo: true, vr_ativo: true, ps_ativo: true, po_ativo: false,
    vale_refeicao: 0, vale_alimentacao: 0, vale_transporte_total: 0, vale_farmacia: 0,
    plano_saude_colaborador: 0, plano_saude_dependentes: 0, seguro_vida: 0,
    banco: '', codigo_banco: '', agencia: '', conta: '', tipo_conta: 'CORRENTE', titular: '', chave_pix: '',
    cnh_numero: '', cnh_categoria: '', cnh_vencimento: '',
    address: { zipCode: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '' },
    unitId: currentUnitId
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
      setCepError('Erro ao buscar CEP.');
    } finally {
      setIsSearchingCEP(false);
    }
  };

  const handleSave = () => {
    if (!formData.employeeName) {
      alert("O nome é obrigatório.");
      return;
    }

    const dependentesAtuais = formData.dependentes_lista || [];
    const dataToSave: Partial<Payroll> = {
      ...formData,
      dependentes_lista: [...dependentesAtuais],
      dependentes_qtd: dependentesAtuais.length,
      unitId: currentUnitId,
      status: formData.status || 'ACTIVE'
    };

    if (editingEmp) {
      const updatedList = employees.map(e => e.id === editingEmp.id ? { ...e, ...dataToSave } as Payroll : e);
      setEmployees(updatedList);
    } else {
      const newId = Math.random().toString(36).substr(2, 9);
      setEmployees([{ ...dataToSave, id: newId, status: 'ACTIVE', month: '01', year: '2024' } as Payroll, ...employees]);
    }
    closeModal();
  };

  const openModal = (emp?: Payroll) => {
    if (emp) {
      setEditingEmp(emp);
      setFormData({
        ...emp,
        dependentes_lista: emp.dependentes_lista ? [...emp.dependentes_lista] : [],
        address: emp.address || { zipCode: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '' }
      });
    }
    else {
      setEditingEmp(null);
      setFormData({
        employeeName: '',
        data_admissao: new Date().toISOString().split('T')[0],
        tipo_contrato: 'CLT',
        salario_base: 0,
        ats_percentual: 0,
        auxilio_moradia: 0,
        dependentes_lista: [],
        dependentes_qtd: 0,
        is_pcd: false,
        tipo_deficiencia: '',
        he50_qtd: 0, he100_qtd: 0, dsr_ativo: true, insalubridade_grau: 'NONE', periculosidade_ativo: false,
        vt_ativo: true, va_ativo: true, vr_ativo: true, ps_ativo: true, po_ativo: false,
        vale_refeicao: 0, vale_alimentacao: 0, vale_transporte_total: 0, vale_farmacia: 0,
        plano_saude_colaborador: 0, plano_saude_dependentes: 0, seguro_vida: 0,
        banco: '', agencia: '', conta: '', chave_pix: '',
        blood_type: '', emergency_contact: '',
        cnh_numero: '', cnh_categoria: '', cnh_vencimento: '',
        address: { zipCode: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '' },
        unitId: currentUnitId
      });
    }
    setActiveTab('personal');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEmp(null);
    setFormData({ dependentes_lista: [], address: { zipCode: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '' }, unitId: currentUnitId });
  };

  const addDependent = () => {
    if (newDep.name && newDep.birthDate) {
      const dep: Dependent = {
        id: Math.random().toString(36).substr(2, 9),
        name: newDep.name,
        birthDate: newDep.birthDate,
        relationship: newDep.relationship || 'OUTRO',
        cpf: newDep.cpf
      };
      setFormData(prev => ({
        ...prev,
        dependentes_lista: [...(prev.dependentes_lista || []), dep],
        dependentes_qtd: (prev.dependentes_lista?.length || 0) + 1
      }));
      setNewDep({ name: '', birthDate: '', relationship: 'FILHO', cpf: '' });
    } else {
      alert("Preencha nome e data de nascimento do dependente.");
    }
  };

  const removeDependent = (id: string) => {
    setFormData(prev => {
      const newList = prev.dependentes_lista?.filter(d => d.id !== id) || [];
      return {
        ...prev,
        dependentes_lista: newList,
        dependentes_qtd: newList.length
      };
    });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === employees.length) setSelectedIds([]);
    else setSelectedIds(employees.map(e => e.id));
  };

  const handleOpenBadges = () => {
    if (selectedIds.length === 0) {
      alert("Selecione um ou mais funcionários.");
      return;
    }
    setIsIDCardOpen(true);
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    const container = document.getElementById('printable-area-dp');
    if (!container) return;
    try {
      // Aguarda carregamento das fontes
      await new Promise(resolve => setTimeout(resolve, 1500));

      const pdf = new jsPDF('l', 'mm', 'a4');
      const pages = container.querySelectorAll('.a4-page-mimic-landscape');

      for (let i = 0; i < pages.length; i++) {
        const pageElement = pages[i] as HTMLElement;

        // Configurações balanceadas - qualidade alta mas compatível
        const canvas = await html2canvas(pageElement, {
          scale: 3, // Boa qualidade e compatibilidade
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff',
          width: pageElement.offsetWidth,
          height: pageElement.offsetHeight,
          imageTimeout: 12000,
          removeContainer: false
        });

        const imgData = canvas.toDataURL('image/png', 0.98); // Alta qualidade
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        if (i > 0) pdf.addPage();

        // Adiciona a imagem
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      }

      pdf.save(`Crachas_ADJPA_DP_Professional_${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar PDF. Tente novamente.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const chunkedEmployees = useMemo(() => {
    const list = employees.filter(e => selectedIds.includes(e.id));
    const size = 4;
    const result = [];
    for (let i = 0; i < list.length; i += size) { result.push(list.slice(i, i + size)); }
    return result;
  }, [employees, selectedIds]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-xl font-black text-slate-900 leading-tight">Departamento Pessoal (DP)</h1>
          <p className="text-slate-500 font-medium text-xs">Emissão de Crachás Padrão CR-80 em Folha Paisagem.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button onClick={handleOpenBadges} className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl font-black text-[10px] uppercase shadow-lg transition-all ${selectedIds.length > 0 ? 'bg-slate-800 text-white hover:bg-slate-900' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
            <QrCode size={14} /> Imprimir Crachás {selectedIds.length > 0 && `(${selectedIds.length})`}
          </button>
          <button onClick={() => openModal()} className="flex-1 md:flex-none bg-indigo-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center gap-1.5 whitespace-nowrap text-xs">
            <UserPlus size={14} /> Admissão Digital
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-slate-50/50 text-[10px] text-slate-400 font-black uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 w-12 text-center">
                  <button onClick={toggleSelectAll} className="p-1 hover:bg-slate-200 rounded-md transition-colors">
                    {selectedIds.length === employees.length && employees.length > 0 ? <CheckSquare className="text-indigo-600" size={16} /> : <Square className="text-slate-400" size={16} />}
                  </button>
                </th>
                <th className="px-5 py-2">Colaborador / eSocial</th>
                <th className="px-5 py-2">Contrato / CBO</th>
                <th className="px-5 py-2">Identificação</th>
                <th className="px-5 py-2 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {employees.map(emp => (
                <tr key={emp.id} className={`hover:bg-slate-50/30 transition-colors group ${selectedIds.includes(emp.id) ? 'bg-indigo-50/30' : ''}`}>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleSelect(emp.id)} className="p-1 hover:bg-slate-200 rounded-md transition-colors">
                      {selectedIds.includes(emp.id) ? <CheckSquare className="text-indigo-600" size={16} /> : <Square className="text-slate-400" size={16} />}
                    </button>
                  </td>
                  <td className="px-5 py-2">
                    <p className="font-bold text-slate-900">{emp.employeeName}</p>
                    <p className="text-[10px] text-indigo-600 font-bold uppercase">CPF: {emp.cpf || '--'}</p>
                  </td>
                  <td className="px-5 py-2">
                    <p className="font-medium text-slate-700 text-sm">{emp.cargo}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">CBO: {emp.cbo || '--'}</p>
                  </td>
                  <td className="px-5 py-2">
                    <div className="flex flex-col gap-1">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase w-fit">
                        {emp.dependentes_lista?.length || 0} Dep.
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-2 text-right">
                    <button onClick={() => openModal(emp)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Edit2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isIDCardOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-300 print:block print:p-0 print:static print:bg-transparent">
          <style>{`
             @media print {
               @page { size: landscape; margin: 0 !important; }
               .no-print { display: none !important; }
               
               #printable-area { 
                 position: absolute !important;
                 top: 0 !important;
                 left: 0 !important;
                 width: 100% !important;
                 margin: 0 !important;
                 padding: 0 !important;
                 display: block !important;
               }

               .a4-page-mimic-landscape { 
                 margin: 0 auto !important;
                 padding: 0 !important;
                 width: 297mm !important;
                 height: 210mm !important;
                 display: flex !important;
                 flex-direction: column !important;
                 align-items: center !important;
                 justify-content: flex-start !important;
                 page-break-after: always !important;
                 border: none !important;
                 box-shadow: none !important;
               }

               .a4-page-mimic-landscape > div {
                 display: grid !important;
                 grid-template-cols: repeat(2, 1fr) !important;
                 gap: 8mm !important;
                 width: 100% !important;
                 justify-items: center !important;
                 margin-top: 5mm !important;
               }
             }
           `}</style>
          <div className="bg-white rounded-[2rem] w-full max-w-7xl shadow-2xl relative flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-[2rem] no-print">
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none">Layout de Impressão (Paisagem)</h3>
                <p className="text-[10px] text-slate-700 font-bold uppercase tracking-widest mt-2">Paginação: {chunkedEmployees.length} • 4 crachás por página</p>
              </div>
              <div className="flex gap-3">
                <button onClick={handleDownloadPDF} disabled={isGeneratingPDF} className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-indigo-600 text-indigo-700 rounded-xl font-black text-xs uppercase shadow-lg hover:bg-indigo-50 transition-all disabled:opacity-50">
                  {isGeneratingPDF ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} Exportar PDF
                </button>
                <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">
                  <Printer size={16} /> Imprimir Tudo
                </button>
                <button onClick={() => setIsIDCardOpen(false)} className="p-3 hover:bg-white rounded-full text-slate-600 transition-all shadow-sm"><X size={20} /></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-10 bg-slate-200/50 custom-scrollbar scroll-smooth print-landscape flex flex-col items-center" id="printable-area">
              {chunkedEmployees.map((group, pageIndex) => (
                <div key={pageIndex} className="a4-page-mimic-landscape bg-white mx-auto shadow-2xl border border-slate-100 p-[10mm] mb-12 last:mb-0 relative overflow-hidden page-break print:mb-0 print:shadow-none print:border-none flex flex-col items-center" style={{ width: '297mm', height: '210mm', minHeight: '210mm', boxSizing: 'border-box' }}>
                  <div className="w-full grid grid-cols-2 gap-x-6 gap-y-4 justify-items-center"> {group.map(e => (<EmployeeIDCard key={e.id} emp={e} />))} </div>
                  <div className="absolute bottom-[10mm] left-[10mm] right-[10mm] border-t border-dashed border-slate-200 pt-4 flex justify-between items-center text-slate-400">
                    <p className="text-[8px] font-black uppercase tracking-widest">Folha {pageIndex + 1} de {chunkedEmployees.length}</p>
                    <p className="text-[8px] font-black uppercase tracking-widest">ADJPA ERP • DEPARTAMENTO PESSOAL</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-6xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[95vh]">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100"><Briefcase size={28} /></div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{editingEmp ? 'Editar Colaborador' : 'Admissão Digital'}</h2>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Controle de Recursos Humanos & eSocial</p>
                </div>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={28} /></button>
            </div>

            <div className="flex border-b border-slate-100 px-8 gap-6 bg-slate-50/50 overflow-x-auto scrollbar-hide shrink-0">
              {[
                { id: 'personal', label: 'Dados Base', icon: <UserCircle size={16} /> },
                { id: 'address', label: 'Endereço', icon: <Map size={16} /> },
                { id: 'payroll_base', label: 'Remuneração', icon: <DollarSign size={16} /> },
                { id: 'benefits', label: 'Benefícios', icon: <HeartPulse size={16} /> },
                { id: 'dependents', label: 'Dependentes', icon: <Users size={16} /> },
                { id: 'bank', label: 'Pagamento', icon: <Landmark size={16} /> },
                { id: 'contract', label: 'Documentos', icon: <FileCheck size={16} /> },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 py-5 px-1 text-xs font-black uppercase tracking-tighter transition-all relative whitespace-nowrap ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
                  {tab.icon} {tab.label}
                  {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-indigo-600 rounded-t-full shadow-lg" />}
                </button>
              ))}
            </div>

            <div className="p-10 overflow-y-auto custom-scrollbar bg-white flex-1">
              {/* TAB: PERSONAL */}
              {activeTab === 'personal' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-10 animate-in fade-in">
                  <div className="md:col-span-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Nome Completo do Colaborador *</label>
                        <input className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={formData.employeeName || ''} onChange={e => setFormData({ ...formData, employeeName: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Data de Nascimento *</label>
                        <input type="date" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={formData.birthDate || ''} onChange={e => setFormData({ ...formData, birthDate: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-rose-600 uppercase mb-2 block flex items-center gap-1 tracking-widest"><Droplets size={10} /> Tipo Sanguíneo</label>
                        <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={formData.blood_type || ''} onChange={e => setFormData({ ...formData, blood_type: e.target.value })}>
                          <option value="">Selecione...</option><option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option><option value="AB+">AB+</option><option value="AB-">AB-</option><option value="O+">O+</option><option value="O-">O-</option>
                        </select>
                      </div>
                    </div>

                    <div className="p-6 bg-slate-50 border border-slate-200 rounded-[2.5rem] space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl"><Accessibility size={20} /></div>
                          <div>
                            <p className="text-xs font-black text-slate-800 uppercase tracking-tighter">Pessoa com Deficiência (PCD)</p>
                            <p className="text-[9px] font-bold text-slate-500 uppercase">Informação obrigatória para cota eSocial</p>
                          </div>
                        </div>
                        <div
                          onClick={() => setFormData({ ...formData, is_pcd: !formData.is_pcd })}
                          className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${formData.is_pcd ? 'bg-emerald-500' : 'bg-slate-300'}`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${formData.is_pcd ? 'translate-x-6' : 'translate-x-0'}`} />
                        </div>
                      </div>
                      {formData.is_pcd && (
                        <div className="animate-in slide-in-from-top-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Descreva a Deficiência / Necessidade Especial</label>
                          <input className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800" value={formData.tipo_deficiencia || ''} onChange={e => setFormData({ ...formData, tipo_deficiencia: e.target.value })} placeholder="Ex: Deficiência Física, Visual, etc." />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Contato de Emergência (Nome e Telefone)</label>
                      <div className="relative">
                        <PhoneCall className="absolute left-4 top-4 text-slate-400" size={18} />
                        <input className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800" placeholder="Ex: Maria (Esposa) - (11) 98888-7777" value={formData.emergency_contact || ''} onChange={e => setFormData({ ...formData, emergency_contact: e.target.value })} />
                      </div>
                    </div>
                  </div>

                  {/* Foto do Funcionário */}
                  <div className="md:col-span-4 space-y-6">
                    <div className="bg-slate-50 border border-slate-200 rounded-[2.5rem] p-6 flex flex-col items-center">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl"><Camera size={20} /></div>
                        <div>
                          <p className="text-xs font-black text-slate-800 uppercase tracking-tighter">Foto do Funcionário</p>
                          <p className="text-[9px] font-bold text-slate-500 uppercase">Para o crachá de identificação</p>
                        </div>
                      </div>

                      <div className="w-32 h-32 rounded-full border-4 border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center mb-4">
                        {formData.photo ? (
                          <img
                            src={formData.photo}
                            className="w-full h-full object-cover"
                            alt="Foto do funcionário"
                          />
                        ) : (
                          <span className="text-[32px] font-black text-slate-400 uppercase">
                            {formData.employeeName?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'XX'}
                          </span>
                        )}
                      </div>

                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              setFormData({ ...formData, photo: event.target?.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                        id="photo-upload"
                      />

                      <div className="flex gap-2 w-full">
                        <label
                          htmlFor="photo-upload"
                          className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
                        >
                          <Upload size={14} /> Carregar Foto
                        </label>

                        {formData.photo && (
                          <button
                            onClick={() => setFormData({ ...formData, photo: undefined })}
                            className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-red-600 transition-all flex items-center justify-center"
                          >
                            <Trash size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-4 bg-slate-900 p-8 rounded-[3rem] text-white flex flex-col items-center justify-center text-center space-y-6">
                    <div className="relative">
                      <img src={`https://ui-avatars.com/api/?name=${formData.employeeName || 'N'}&size=150&background=4f46e5&color=fff&bold=true`} className="w-32 h-32 rounded-full border-4 border-white/20 shadow-2xl" />
                      <div className="absolute -bottom-2 -right-2 p-2 bg-indigo-600 rounded-full border-2 border-slate-900 shadow-lg"><Camera size={16} /></div>
                    </div>
                    <div>
                      <h4 className="font-black uppercase tracking-tight text-lg leading-tight">{formData.employeeName || 'Nome do Colaborador'}</h4>
                      <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mt-2">{formData.cargo || 'CARGO NÃO DEFINIDO'}</p>
                    </div>
                    <div className="w-full pt-6 border-t border-white/10 space-y-2">
                      <p className="text-[8px] font-black text-slate-500 uppercase">Unidade de Registro</p>
                      <p className="text-xs font-bold text-indigo-200 uppercase">{currentUnitId}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: ADDRESS */}
              {activeTab === 'address' && (
                <div className="space-y-8 animate-in fade-in">
                  <div className="bg-indigo-50 border border-indigo-100 p-10 rounded-[3rem] flex flex-col lg:flex-row gap-10 items-center">
                    <div className="shrink-0 p-5 bg-white rounded-3xl shadow-sm"><Map size={48} className="text-indigo-600" /></div>
                    <div className="flex-1 w-full space-y-6">
                      <div className="flex items-center gap-6">
                        <div className="flex-1 relative">
                          <label className="text-[10px] font-black text-indigo-800 uppercase mb-2 block tracking-widest">CEP para Busca Automática</label>
                          <div className="relative">
                            <input
                              className={`w-full px-6 py-5 bg-white border rounded-2xl font-black text-indigo-700 text-lg outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all ${cepError ? 'border-rose-300 ring-rose-100' : 'border-indigo-100'}`}
                              placeholder="00000-000"
                              value={formData.address?.zipCode || ''}
                              onChange={e => {
                                const val = e.target.value;
                                setFormData({ ...formData, address: { ...formData.address!, zipCode: val } });
                                if (val.replace(/\D/g, '').length === 8) handleCEPLookup(val);
                              }}
                            />
                            <div className="absolute right-6 top-1/2 -translate-y-1/2">
                              {isSearchingCEP ? <Loader2 size={24} className="text-indigo-400 animate-spin" /> : <Search size={24} className="text-indigo-300" />}
                            </div>
                          </div>
                          {cepError && <p className="text-[10px] font-black text-rose-500 mt-2 uppercase flex items-center gap-1"><AlertCircle size={12} /> {cepError}</p>}
                        </div>
                        <div className="w-40">
                          <label className="text-[10px] font-black text-indigo-800 uppercase mb-2 block tracking-widest">Nº / Casa</label>
                          <input className="w-full px-6 py-5 bg-white border border-indigo-100 rounded-2xl font-black text-indigo-700 text-lg text-center outline-none" placeholder="S/N" value={formData.address?.number || ''} onChange={e => setFormData({ ...formData, address: { ...formData.address!, number: e.target.value } })} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Logradouro / Avenida / Rua</label>
                      <div className="relative">
                        <Building className="absolute left-4 top-4 text-slate-300" size={20} />
                        <input className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 outline-none" value={formData.address?.street || ''} onChange={e => setFormData({ ...formData, address: { ...formData.address!, street: e.target.value } })} />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Bairro / Setor</label>
                      <input className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 outline-none" value={formData.address?.neighborhood || ''} onChange={e => setFormData({ ...formData, address: { ...formData.address!, neighborhood: e.target.value } })} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Complemento (Bloco, Apto...)</label>
                      <input className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 outline-none" value={formData.address?.complement || ''} onChange={e => setFormData({ ...formData, address: { ...formData.address!, complement: e.target.value } })} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Município</label>
                      <input className="w-full px-5 py-4 bg-slate-100 border border-slate-200 rounded-2xl font-black text-slate-500 cursor-not-allowed" readOnly value={formData.address?.city || ''} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">UF (Estado)</label>
                      <input className="w-full px-5 py-4 bg-slate-100 border border-slate-200 rounded-2xl font-black text-indigo-600 text-center cursor-not-allowed" readOnly value={formData.address?.state || ''} />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: PAYROLL BASE */}
              {activeTab === 'payroll_base' && (
                <div className="space-y-10 animate-in fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Cargo Ministerial *</label>
                      <input className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800" placeholder="Ex: Pastor Auxiliar" value={formData.cargo || ''} onChange={e => setFormData({ ...formData, cargo: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Departamento</label>
                      <input className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800" placeholder="Ex: Eclesiástico" value={formData.departamento || ''} onChange={e => setFormData({ ...formData, departamento: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Código CBO</label>
                      <input className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800" placeholder="Ex: 2631-05" value={formData.cbo || ''} onChange={e => setFormData({ ...formData, cbo: e.target.value })} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Data de Admissão</label>
                      <input type="date" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800" value={formData.data_admissao || ''} onChange={e => setFormData({ ...formData, data_admissao: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Tipo de Contrato</label>
                      <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800" value={formData.tipo_contrato} onChange={e => setFormData({ ...formData, tipo_contrato: e.target.value as any })}>
                        <option value="CLT">CLT (Efetivo)</option>
                        <option value="PJ">PJ (Contrato)</option>
                        <option value="VOLUNTARIO">Voluntário</option>
                        <option value="TEMPORARIO">Temporário/Estágio</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Regime de Trabalho</label>
                      <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800" value={formData.regime_trabalho} onChange={e => setFormData({ ...formData, regime_trabalho: e.target.value as any })}>
                        <option value="PRESENCIAL">Presencial</option>
                        <option value="REMOTO">Remoto (Home Office)</option>
                        <option value="HIBRIDO">Híbrido</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Jornada Semanal</label>
                      <input className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800" placeholder="Ex: 44h semanais" value={formData.jornada_trabalho || ''} onChange={e => setFormData({ ...formData, jornada_trabalho: e.target.value })} />
                    </div>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-100 p-10 rounded-[3rem] flex flex-col md:flex-row gap-10 items-center">
                    <div className="shrink-0 p-5 bg-white rounded-3xl shadow-sm"><DollarSign size={48} className="text-emerald-600" /></div>
                    <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div>
                        <label className="text-[10px] font-black text-emerald-800 uppercase mb-2 block tracking-widest">Salário Base Mensal (R$) *</label>
                        <input type="number" step="0.01" className="w-full px-6 py-5 bg-white border border-emerald-200 rounded-2xl font-black text-emerald-700 text-2xl outline-none focus:ring-4 focus:ring-emerald-500/20" value={formData.salario_base || 0} onChange={e => setFormData({ ...formData, salario_base: Number(e.target.value) })} />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-emerald-800 uppercase mb-2 block tracking-widest">Tipo de Remuneração</label>
                        <select className="w-full px-6 py-5 bg-white border border-emerald-200 rounded-2xl font-black text-emerald-700 text-lg outline-none focus:ring-4 focus:ring-emerald-500/20" value={formData.tipo_salario} onChange={e => setFormData({ ...formData, tipo_salario: e.target.value as any })}>
                          <option value="MENSAL">Mensalista</option>
                          <option value="HORISTA">Horista</option>
                          <option value="COMISSIONADO">Comissionado Puro</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: BENEFITS */}
              {activeTab === 'benefits' && (
                <div className="space-y-10 animate-in fade-in">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* TRANSPORTE E ALIMENTAÇÃO */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 text-indigo-600 border-b border-indigo-50 pb-4 mb-2">
                        <Bus size={20} />
                        <h3 className="text-sm font-black uppercase tracking-widest">Auxílio Transporte & Alimentação</h3>
                      </div>
                      <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 space-y-6">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-600 uppercase">Utiliza Vale Transporte?</span>
                          <div onClick={() => setFormData({ ...formData, vt_ativo: !formData.vt_ativo })} className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${formData.vt_ativo ? 'bg-indigo-600' : 'bg-slate-300'}`}><div className={`w-4 h-4 bg-white rounded-full transition-transform ${formData.vt_ativo ? 'translate-x-6' : 'translate-x-0'}`} /></div>
                        </div>
                        {formData.vt_ativo && (
                          <div className="animate-in slide-in-from-top-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Custo Total VT Mensal (R$)</label>
                            <input type="number" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold" value={formData.vale_transporte_total || 0} onChange={e => setFormData({ ...formData, vale_transporte_total: Number(e.target.value) })} />
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Vale Refeição (Desc. R$)</label>
                            <input type="number" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold" value={formData.vale_refeicao || 0} onChange={e => setFormData({ ...formData, vale_refeicao: Number(e.target.value) })} />
                          </div>
                          <div>
                            <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Vale Alimentação (Desc. R$)</label>
                            <input type="number" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold" value={formData.vale_alimentacao || 0} onChange={e => setFormData({ ...formData, vale_alimentacao: Number(e.target.value) })} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SAÚDE E VIDA */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 text-emerald-600 border-b border-emerald-50 pb-4 mb-2">
                        <Stethoscope size={20} />
                        <h3 className="text-sm font-black uppercase tracking-widest">Planos de Saúde & Seguros</h3>
                      </div>
                      <div className="bg-emerald-50/20 p-8 rounded-[2.5rem] border border-emerald-100 space-y-6">
                        <div>
                          <label className="text-[9px] font-black text-emerald-800 uppercase mb-1 block">Plano de Saúde - Titular (R$)</label>
                          <input type="number" className="w-full px-4 py-3 bg-white border border-emerald-100 rounded-xl font-black text-emerald-700" value={formData.plano_saude_colaborador || 0} onChange={e => setFormData({ ...formData, plano_saude_colaborador: Number(e.target.value) })} />
                        </div>
                        <div>
                          <label className="text-[9px] font-black text-emerald-800 uppercase mb-1 block">Plano de Saúde - Dependentes (R$)</label>
                          <input type="number" className="w-full px-4 py-3 bg-white border border-emerald-100 rounded-xl font-black text-emerald-700" value={formData.plano_saude_dependentes || 0} onChange={e => setFormData({ ...formData, plano_saude_dependentes: Number(e.target.value) })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div>
                            <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Seguro de Vida (R$)</label>
                            <input type="number" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold" value={formData.seguro_vida || 0} onChange={e => setFormData({ ...formData, seguro_vida: Number(e.target.value) })} />
                          </div>
                          <div>
                            <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Vale Farmácia (Média R$)</label>
                            <input type="number" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold" value={formData.vale_farmacia || 0} onChange={e => setFormData({ ...formData, vale_farmacia: Number(e.target.value) })} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: DEPENDENTS */}
              {activeTab === 'dependents' && (
                <div className="space-y-10 animate-in fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-8">
                      <div className="flex items-center gap-2 text-indigo-600 border-b border-indigo-50 pb-4 mb-2">
                        <Plus size={20} />
                        <h3 className="text-sm font-black uppercase tracking-widest">Vincular Novo Dependente</h3>
                      </div>
                      <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 space-y-6">
                        <div>
                          <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Nome Completo</label>
                          <input className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold" value={newDep.name || ''} onChange={e => setNewDep({ ...newDep, name: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Nascimento</label>
                            <input type="date" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold" value={newDep.birthDate || ''} onChange={e => setNewDep({ ...newDep, birthDate: e.target.value })} />
                          </div>
                          <div>
                            <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Parentesco</label>
                            <select className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold" value={newDep.relationship} onChange={e => setNewDep({ ...newDep, relationship: e.target.value as any })}>
                              <option value="FILHO">Filho(a)</option>
                              <option value="CONJUGE">Cônjuge</option>
                              <option value="PAI">Pai</option>
                              <option value="MAE">Mãe</option>
                              <option value="OUTRO">Outro</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">CPF do Dependente</label>
                          <input className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold" value={newDep.cpf || ''} onChange={e => setNewDep({ ...newDep, cpf: e.target.value })} placeholder="000.000.000-00" />
                        </div>
                        <button onClick={addDependent} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                          <Plus size={16} /> Adicionar ao Quadro Familiar
                        </button>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-2">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Users size={20} />
                          <h3 className="text-sm font-black uppercase tracking-widest">Dependentes Cadastrados</h3>
                        </div>
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase">{formData.dependentes_lista?.length || 0} REGISTROS</span>
                      </div>
                      <div className="space-y-3">
                        {formData.dependentes_lista?.map(d => (
                          <div key={d.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex justify-between items-center group hover:shadow-md transition-all">
                            <div className="flex items-center gap-4">
                              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><User size={16} /></div>
                              <div>
                                <p className="font-bold text-slate-900 text-sm leading-none mb-1">{d.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{d.relationship} • {new Date(d.birthDate + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                              </div>
                            </div>
                            <button onClick={() => removeDependent(d.id)} className="p-2 text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><Trash size={16} /></button>
                          </div>
                        ))}
                        {(!formData.dependentes_lista || formData.dependentes_lista.length === 0) && (
                          <div className="py-20 text-center space-y-4">
                            <Users size={48} className="mx-auto text-slate-100" />
                            <p className="text-xs font-bold text-slate-300 uppercase">Sem dependentes vinculados.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: BANK */}
              {activeTab === 'bank' && (
                <div className="space-y-10 animate-in fade-in">
                  <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl flex flex-col md:flex-row gap-10 items-center overflow-hidden relative">
                    <div className="absolute right-0 top-0 p-10 opacity-5"><Landmark size={120} /></div>
                    <div className="shrink-0 p-5 bg-indigo-600 rounded-3xl shadow-xl z-10"><CreditCard size={48} /></div>
                    <div className="flex-1 w-full space-y-6 z-10 text-left">
                      <h3 className="text-xl font-black uppercase tracking-tighter">Dados Bancários para Crédito</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <div>
                            <label className="text-[10px] font-black text-indigo-400 uppercase mb-2 block tracking-widest">Instituição Bancária</label>
                            <input className="w-full px-5 py-4 bg-white/10 border border-white/10 rounded-2xl font-black text-white outline-none focus:bg-white/20" placeholder="Ex: Banco Itaú" value={formData.banco || ''} onChange={e => setFormData({ ...formData, banco: e.target.value })} />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-[10px] font-black text-indigo-400 uppercase mb-2 block tracking-widest">Agência</label>
                              <input className="w-full px-5 py-4 bg-white/10 border border-white/10 rounded-2xl font-black text-white text-center" placeholder="0000" value={formData.agencia || ''} onChange={e => setFormData({ ...formData, agencia: e.target.value })} />
                            </div>
                            <div>
                              <label className="text-[10px] font-black text-indigo-400 uppercase mb-2 block tracking-widest">Conta + Dígito</label>
                              <input className="w-full px-5 py-4 bg-white/10 border border-white/10 rounded-2xl font-black text-white text-center" placeholder="00000-0" value={formData.conta || ''} onChange={e => setFormData({ ...formData, conta: e.target.value })} />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-6">
                          <div>
                            <label className="text-[10px] font-black text-indigo-400 uppercase mb-2 block tracking-widest">Chave PIX Preferencial</label>
                            <input className="w-full px-5 py-4 bg-white/10 border border-white/10 rounded-2xl font-black text-white" placeholder="CPF, E-mail, Celular..." value={formData.chave_pix || ''} onChange={e => setFormData({ ...formData, chave_pix: e.target.value })} />
                          </div>
                          <div>
                            <label className="text-[10px] font-black text-indigo-400 uppercase mb-2 block tracking-widest">Tipo de Conta</label>
                            <select className="w-full px-5 py-4 bg-white/10 border border-white/10 rounded-2xl font-black text-white outline-none focus:bg-white/20" value={formData.tipo_conta} onChange={e => setFormData({ ...formData, tipo_conta: e.target.value as any })}>
                              <option value="CORRENTE" className="text-slate-900">Conta Corrente</option>
                              <option value="POUPANCA" className="text-slate-900">Poupança</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: CONTRACT / DOCS */}
              {activeTab === 'contract' && (
                <div className="space-y-10 animate-in fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* DOCUMENTOS PESSOAIS */}
                    <div className="space-y-8">
                      <div className="flex items-center gap-2 text-indigo-600 border-b border-indigo-50 pb-4 mb-2">
                        <FileCheck size={20} />
                        <h3 className="text-sm font-black uppercase tracking-widest">Documentação Civil & eSocial</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">CPF *</label>
                          <input className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold" placeholder="000.000.000-00" value={formData.cpf || ''} onChange={e => setFormData({ ...formData, cpf: e.target.value })} />
                        </div>
                        <div>
                          <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">RG</label>
                          <input className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold" placeholder="00.000.000-0" value={formData.rg || ''} onChange={e => setFormData({ ...formData, rg: e.target.value })} />
                        </div>
                        <div>
                          <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">PIS / NIS</label>
                          <input className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold" value={formData.pis || ''} onChange={e => setFormData({ ...formData, pis: e.target.value })} />
                        </div>
                        <div>
                          <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">CTPS Digital / Física</label>
                          <input className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold" value={formData.ctps || ''} onChange={e => setFormData({ ...formData, ctps: e.target.value })} />
                        </div>
                        <div>
                          <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Título de Eleitor</label>
                          <input className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold" value={formData.titulo_eleitor || ''} onChange={e => setFormData({ ...formData, titulo_eleitor: e.target.value })} />
                        </div>
                        <div>
                          <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Certificado Reservista</label>
                          <input className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold" value={formData.reservista || ''} onChange={e => setFormData({ ...formData, reservista: e.target.value })} />
                        </div>
                      </div>
                    </div>

                    {/* MOTORISTA / CNH */}
                    <div className="space-y-8">
                      <div className="flex items-center gap-2 text-amber-600 border-b border-amber-50 pb-4 mb-2">
                        <CardIcon size={20} />
                        <h3 className="text-sm font-black uppercase tracking-widest">Habilitação (CNH)</h3>
                      </div>
                      <div className="bg-amber-50/20 p-8 rounded-[2.5rem] border border-amber-100 space-y-6">
                        <div>
                          <label className="text-[9px] font-black text-amber-800 uppercase mb-1 block">Nº Registro CNH</label>
                          <input className="w-full px-4 py-3 bg-white border border-amber-100 rounded-xl font-bold" value={formData.cnh_numero || ''} onChange={e => setFormData({ ...formData, cnh_numero: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[9px] font-black text-amber-800 uppercase mb-1 block">Categoria</label>
                            <input className="w-full px-4 py-3 bg-white border border-amber-100 rounded-xl font-black text-center" placeholder="A, B, C..." value={formData.cnh_categoria || ''} onChange={e => setFormData({ ...formData, cnh_categoria: e.target.value })} />
                          </div>
                          <div>
                            <label className="text-[9px] font-black text-amber-800 uppercase mb-1 block">Vencimento</label>
                            <input type="date" className="w-full px-4 py-3 bg-white border border-amber-100 rounded-xl font-bold" value={formData.cnh_vencimento || ''} onChange={e => setFormData({ ...formData, cnh_vencimento: e.target.value })} />
                          </div>
                        </div>
                        <div className="bg-amber-500/10 p-4 rounded-xl flex items-start gap-3">
                          <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                          <p className="text-[9px] text-amber-700 font-bold leading-tight uppercase">O sistema gerará alertas automáticos no painel geral 30 dias antes do vencimento para atualização cadastral.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-10 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-4 shrink-0">
              <button onClick={closeModal} className="px-8 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-100 transition-all text-sm uppercase">Descartar</button>
              <button onClick={handleSave} className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 shadow-xl flex items-center gap-2 text-sm uppercase"><Save size={20} /> Finalizar Operação</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
