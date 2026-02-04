
import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Lock, Upload, Key, FileWarning, 
  Trash2, RefreshCw, CheckCircle2, AlertTriangle,
  Fingerprint, Info, Calculator, Save, Database,
  Percent, ChevronRight, Settings as SettingsIcon,
  ShieldAlert, Download, UploadCloud, FileJson,
  MapPin, DatabaseZap, CloudDownload, Globe, Loader2,
  Terminal, Shield
} from 'lucide-react';
import { DigitalCertificate, UserAuth, TaxConfig, TaxBracket } from '../types';
import { DEFAULT_TAX_CONFIG } from '../constants';

interface SettingsProps {
  user: UserAuth;
}

const BRAZIL_STATES = [
  { uf: 'AC', name: 'Acre' }, { uf: 'AL', name: 'Alagoas' }, { uf: 'AP', name: 'Amapá' },
  { uf: 'AM', name: 'Amazonas' }, { uf: 'BA', name: 'Bahia' }, { uf: 'CE', name: 'Ceará' },
  { uf: 'DF', name: 'Distrito Federal' }, { uf: 'ES', name: 'Espírito Santo' }, { uf: 'GO', name: 'Goiás' },
  { uf: 'MA', name: 'Maranhão' }, { uf: 'MT', name: 'Mato Grosso' }, { uf: 'MS', name: 'Mato Grosso do Sul' },
  { uf: 'MG', name: 'Minas Gerais' }, { uf: 'PA', name: 'Pará' }, { uf: 'PB', name: 'Paraíba' },
  { uf: 'PR', name: 'Paraná' }, { uf: 'PE', name: 'Pernambuco' }, { uf: 'PI', name: 'Piauí' },
  { uf: 'RJ', name: 'Rio de Janeiro' }, { uf: 'RN', name: 'Rio Grande do Norte' }, { uf: 'RS', name: 'Rio Grande do Sul' },
  { uf: 'RO', name: 'Rondônia' }, { uf: 'RR', name: 'Roraima' }, { uf: 'SC', name: 'Santa Catarina' },
  { uf: 'SP', name: 'São Paulo' }, { uf: 'SE', name: 'Sergipe' }, { uf: 'TO', name: 'Tocantins' }
];

export const Settings: React.FC<SettingsProps> = ({ user }) => {
  const [activeCertificate, setActiveCertificate] = useState<DigitalCertificate | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Estados para Sincronização de CEP (Dev Only)
  const [selectedUF, setSelectedUF] = useState('RJ');
  const [isSyncingCEP, setIsSyncingCEP] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [lastSync, setLastSync] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('ecclesia_cep_sync_log');
    return saved ? JSON.parse(saved) : { 'RJ': '15/05/2024' };
  });

  // Configurações de Taxas
  const [taxConfig, setTaxConfig] = useState<TaxConfig>(() => {
    const saved = localStorage.getItem('ecclesia_tax_config');
    return saved ? JSON.parse(saved) : DEFAULT_TAX_CONFIG;
  });

  useEffect(() => {
    const saved = localStorage.getItem('ecclesia_a1_cert');
    if (saved) setActiveCertificate(JSON.parse(saved));
  }, []);

  const handleSaveTaxConfig = () => {
    localStorage.setItem('ecclesia_tax_config', JSON.stringify(taxConfig));
    alert("Configurações tributárias salvas com sucesso!");
  };

  const handleSyncCEP = () => {
    setIsSyncingCEP(true);
    setSyncProgress(0);
    
    // Simulação de download e indexação de milhares de logradouros no IndexedDB
    const interval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSyncingCEP(false);
          const newSyncDate = new Date().toLocaleString('pt-BR');
          setLastSync(prevSync => {
            const updated = { ...prevSync, [selectedUF]: newSyncDate };
            localStorage.setItem('ecclesia_cep_sync_log', JSON.stringify(updated));
            return updated;
          });
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  const handleSimulateUpload = () => {
    if (!password) {
      alert("Informe a senha do certificado para prosseguir.");
      return;
    }
    setIsUploading(true);
    setTimeout(() => {
      const mockCert: DigitalCertificate = {
        id: 'cert_' + Math.random().toString(36).substr(2, 9),
        ownerName: 'IGREJA EVANGELICA SEDE MUNDIAL',
        cnpj: '00.123.456/0001-99',
        expiryDate: '2025-12-15',
        issuer: 'AC SOLUTI Multipla v5',
        status: 'VALID',
        serialNumber: '7283491023847592301'
      };
      setActiveCertificate(mockCert);
      localStorage.setItem('ecclesia_a1_cert', JSON.stringify(mockCert));
      setIsUploading(false);
      setPassword('');
    }, 2000);
  };

  const removeCertificate = () => {
    if (confirm("Deseja realmente remover o certificado A1?")) {
      setActiveCertificate(null);
      localStorage.removeItem('ecclesia_a1_cert');
    }
  };

  const updateBracket = (type: 'inss' | 'irrf', index: number, field: keyof TaxBracket, value: number) => {
    const configKey = type === 'inss' ? 'inssBrackets' : 'irrfBrackets';
    const newBrackets = [...taxConfig[configKey]];
    newBrackets[index] = { ...newBrackets[index], [field]: value };
    setTaxConfig({ ...taxConfig, [configKey]: newBrackets });
  };

  const handleExportFullBackup = () => {
    const backupData = {
      members: JSON.parse(localStorage.getItem('ecclesia_members') || '[]'),
      employees: JSON.parse(localStorage.getItem('ecclesia_employees') || '[]'),
      transactions: JSON.parse(localStorage.getItem('ecclesia_transactions') || '[]'),
      accounts: JSON.parse(localStorage.getItem('ecclesia_accounts') || '[]'),
      taxConfig: JSON.parse(localStorage.getItem('ecclesia_tax_config') || '{}'),
      exportDate: new Date().toISOString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `BACKUP_ADJPA_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (confirm("ATENÇÃO: Importar este backup substituirá todos os dados atuais. Deseja prosseguir?")) {
          localStorage.setItem('ecclesia_members', JSON.stringify(json.members || []));
          localStorage.setItem('ecclesia_employees', JSON.stringify(json.employees || []));
          localStorage.setItem('ecclesia_transactions', JSON.stringify(json.transactions || []));
          localStorage.setItem('ecclesia_accounts', JSON.stringify(json.accounts || []));
          if (json.taxConfig) localStorage.setItem('ecclesia_tax_config', JSON.stringify(json.taxConfig));
          
          alert("Backup restaurado com sucesso! O sistema irá recarregar.");
          window.location.reload();
        }
      } catch (err) {
        alert("Erro ao ler arquivo de backup. Certifique-se de que é um arquivo .json válido gerado pelo sistema.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 leading-tight">Configurações do Sistema</h1>
          <p className="text-slate-500 font-medium">Segurança, tabelas fiscais e backup de dados.</p>
        </div>
      </div>

      {/* BACKUP E SEGURANÇA DE DADOS */}
      <div className="bg-white rounded-[2.5rem] border border-amber-200 shadow-sm overflow-hidden border-l-8 border-l-amber-500">
        <div className="p-8 flex flex-col lg:flex-row gap-8 items-center bg-amber-50/30">
          <div className="flex-1 space-y-3">
             <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-lg">
                   <Database size={24}/>
                </div>
                <h3 className="text-lg font-black text-slate-900 uppercase">Segurança de Dados & Backup</h3>
             </div>
             <p className="text-sm text-slate-600 font-medium leading-relaxed">
               Como este sistema funciona localmente no seu navegador, a limpeza do cache pode apagar os dados. 
               <strong> Realize um backup semanal</strong> para garantir a segurança das informações da igreja.
             </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
             <button 
              onClick={handleExportFullBackup}
              className="flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase hover:bg-slate-800 transition-all shadow-xl"
             >
                <Download size={18}/> Baixar Cópia de Segurança
             </button>
             <div className="relative">
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={handleImportBackup}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                />
                <button className="w-full flex items-center justify-center gap-2 bg-white border-2 border-slate-900 text-slate-900 px-8 py-4 rounded-2xl font-black text-xs uppercase hover:bg-slate-50 transition-all">
                   <UploadCloud size={18}/> Restaurar Backup
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* SEÇÃO EXCLUSIVA DO DESENVOLVEDOR: ATUALIZAÇÃO DE CEPs */}
      {user.role === 'DEVELOPER' && (
        <div className="bg-white rounded-[2.5rem] border border-indigo-600 shadow-2xl overflow-hidden border-l-8 border-l-indigo-600 animate-in zoom-in duration-300">
           <div className="p-8 border-b border-indigo-50 flex items-center justify-between bg-indigo-900 text-white">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg ring-4 ring-indigo-500/30">
                    <DatabaseZap size={24}/>
                 </div>
                 <div>
                    <div className="flex items-center gap-2">
                       <h3 className="text-lg font-black uppercase tracking-tighter">Engine de Logradouros (Atualização Brasil)</h3>
                       <span className="px-2 py-0.5 bg-rose-600 text-[8px] font-black rounded uppercase">Dev Only</span>
                    </div>
                    <p className="text-xs text-indigo-300 font-medium">Sincronização massiva da base nacional de CEPs por Unidade Federativa.</p>
                 </div>
              </div>
              <Terminal size={24} className="opacity-20"/>
           </div>
           
           <div className="p-8 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10 bg-slate-900">
              <div className="lg:col-span-4 space-y-6">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">Selecione o Estado para Sincronizar</label>
                    <div className="relative">
                       <Globe className="absolute left-4 top-4 text-indigo-500" size={20}/>
                       <select 
                        className="w-full pl-12 pr-4 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-white font-black text-sm outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
                        value={selectedUF}
                        onChange={e => setSelectedUF(e.target.value)}
                        disabled={isSyncingCEP}
                       >
                          {BRAZIL_STATES.map(s => <option key={s.uf} value={s.uf}>{s.name} ({s.uf})</option>)}
                       </select>
                    </div>
                 </div>
                 <button 
                  onClick={handleSyncCEP}
                  disabled={isSyncingCEP}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-500 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                    {isSyncingCEP ? <Loader2 size={20} className="animate-spin"/> : <CloudDownload size={20}/>}
                    {isSyncingCEP ? 'Processando Base...' : `Atualizar CEPs: ${selectedUF}`}
                 </button>
              </div>

              <div className="lg:col-span-8 space-y-6">
                 <div className="bg-slate-800 border border-slate-700 rounded-[2rem] p-8 h-full flex flex-col justify-center">
                    <div className="flex justify-between items-end mb-4">
                       <div>
                          <p className="text-[10px] font-black text-indigo-400 uppercase mb-1">Status da Indexação Local</p>
                          <h4 className="text-xl font-black text-white">Estado: {BRAZIL_STATES.find(s => s.uf === selectedUF)?.name}</h4>
                       </div>
                       <div className="text-right">
                          <p className="text-[9px] font-bold text-slate-500 uppercase">Última Atualização</p>
                          <p className="text-[10px] font-black text-indigo-300">{lastSync[selectedUF] || 'PENDENTE'}</p>
                       </div>
                    </div>

                    <div className="relative w-full h-4 bg-slate-700 rounded-full overflow-hidden mb-8">
                       <div 
                        className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 transition-all duration-300"
                        style={{ width: `${isSyncingCEP ? syncProgress : (lastSync[selectedUF] ? 100 : 0)}%` }}
                       />
                       {isSyncingCEP && (
                          <div className="absolute inset-0 bg-white/10 animate-pulse" />
                       )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                       <div className="p-4 bg-slate-900 rounded-2xl border border-slate-700 text-center">
                          <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Registros</p>
                          <p className="text-sm font-black text-indigo-400">+{selectedUF === 'SP' || selectedUF === 'RJ' ? '250k' : '90k'}</p>
                       </div>
                       <div className="p-4 bg-slate-900 rounded-2xl border border-slate-700 text-center">
                          <p className="text-[8px] font-black text-slate-500 uppercase mb-1">GeoJSON</p>
                          <p className="text-sm font-black text-emerald-400">Ativo</p>
                       </div>
                       <div className="p-4 bg-slate-900 rounded-2xl border border-slate-700 text-center">
                          <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Protocolo</p>
                          <p className="text-sm font-black text-indigo-400">HTTPS/2</p>
                       </div>
                       <div className="p-4 bg-slate-900 rounded-2xl border border-slate-700 text-center">
                          <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Cripto</p>
                          <p className="text-sm font-black text-rose-400">AES-256</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
           
           <div className="p-6 bg-slate-800 flex items-center gap-3 justify-center border-t border-slate-700">
              <Shield size={16} className="text-indigo-500"/>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em]">Ferramenta de Manutenção Reservada • Acesso do Desenvolvedor Verificado</p>
           </div>
        </div>
      )}

      {/* Seção Identidade Digital A1 */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><ShieldCheck size={24}/></div>
             <div>
               <h3 className="font-black text-slate-900">Identidade Digital (Certificado A1)</h3>
               <p className="text-xs text-slate-500 font-medium">Necessário para assinar holerites e transmitir ao eSocial.</p>
             </div>
          </div>
        </div>

        <div className="p-8 md:p-10">
          {!activeCertificate ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-10 flex flex-col items-center justify-center text-center group hover:border-indigo-300 transition-all cursor-pointer relative">
                   <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept=".pfx,.p12" />
                   <div className="p-4 bg-white rounded-2xl shadow-sm mb-4 group-hover:scale-110 transition-transform">
                      <Upload size={32} className="text-slate-400 group-hover:text-indigo-600" />
                   </div>
                   <p className="text-sm font-bold text-slate-700">Importar Certificado A1 (.pfx)</p>
                </div>
                <div className="space-y-4">
                  <input 
                    type={showPassword ? "text" : "password"}
                    placeholder="Senha do Certificado" 
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button 
                    onClick={handleSimulateUpload}
                    disabled={isUploading}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                  >
                    {isUploading ? <RefreshCw size={20} className="animate-spin" /> : <Fingerprint size={20} />}
                    {isUploading ? "Validando..." : "Instalar Certificado"}
                  </button>
                </div>
              </div>
              <div className="bg-indigo-900 rounded-[2rem] p-8 text-white">
                <h4 className="font-black text-lg mb-4">Segurança</h4>
                <p className="text-sm text-indigo-100 leading-relaxed font-medium">O certificado A1 permite que o sistema assine digitalmente os holerites, garantindo que o documento tenha validade jurídica sem a necessidade de assinatura manual.</p>
              </div>
            </div>
          ) : (
            <div className="p-8 bg-slate-900 rounded-[2rem] text-white flex justify-between items-center">
               <div>
                  <p className="text-[10px] font-black text-indigo-400 uppercase mb-1">Certificado Ativo</p>
                  <h4 className="text-xl font-black">{activeCertificate.ownerName}</h4>
                  <p className="text-xs text-slate-400">CNPJ: {activeCertificate.cnpj} • Vencimento: {new Date(activeCertificate.expiryDate).toLocaleDateString('pt-BR')}</p>
               </div>
               <button onClick={removeCertificate} className="p-4 bg-white/10 text-rose-400 rounded-2xl hover:bg-rose-500 hover:text-white transition-all"><Trash2/></button>
            </div>
          )}
        </div>
      </div>

      {/* Painel do Desenvolvedor (Apenas para ADMIN ou DEVELOPER) */}
      {(user.role === 'ADMIN' || user.role === 'DEVELOPER') && (
        <div className="bg-white rounded-[2.5rem] border border-indigo-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-indigo-50 flex items-center justify-between bg-indigo-50/30">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg"><Calculator size={24}/></div>
              <h3 className="font-black text-slate-900">Parâmetros de Cálculo Fiscais</h3>
            </div>
            <button onClick={handleSaveTaxConfig} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase hover:bg-indigo-700 transition-all shadow-md">
              Salvar Tabelas
            </button>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase">Tabela Progressiva INSS</h4>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                {taxConfig.inssBrackets.map((b, i) => (
                  <div key={i} className="flex gap-4">
                    <input className="flex-1 px-3 py-2 rounded-lg border border-slate-200 font-bold text-xs" type="number" value={b.limit} onChange={(e) => updateBracket('inss', i, 'limit', Number(e.target.value))} />
                    <input className="w-24 px-3 py-2 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 font-black text-xs" type="number" value={b.rate} onChange={(e) => updateBracket('inss', i, 'rate', Number(e.target.value))} />
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase">Encargos Patronais Fixos</h4>
              <div className="bg-slate-900 p-6 rounded-[2rem] space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-indigo-300 uppercase">FGTS Patronal</span>
                  <input className="w-20 bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white font-black text-right" type="number" value={taxConfig.fgtsRate} onChange={e => setTaxConfig({...taxConfig, fgtsRate: Number(e.target.value)})} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-indigo-300 uppercase">INSS Patronal (Cota)</span>
                  <input className="w-20 bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white font-black text-right" type="number" value={taxConfig.patronalRate} onChange={e => setTaxConfig({...taxConfig, patronalRate: Number(e.target.value)})} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
