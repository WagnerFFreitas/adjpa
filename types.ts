
export type UserRole = 'ADMIN' | 'SECRETARY' | 'TREASURER' | 'PASTOR' | 'RH' | 'DP' | 'FINANCEIRO' | 'DEVELOPER';

export interface UserAuth {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  avatar?: string;
  unitId: string; // Unidade preferencial/atual
}

export interface Unit {
  id: string;
  name: string;
  cnpj: string;
  address: string;
  city: string;
  state: string;
  isHeadquarter: boolean;
}

export interface Asset {
  id: string;
  unitId: string;
  description: string;
  category: 'IMÓVEL' | 'VEÍCULO' | 'SOM_LUZ' | 'INSTRUMENTO' | 'MÓVEL' | 'INFORMÁTICA' | 'OUTROS';
  acquisitionDate: string;
  acquisitionValue: number;
  currentValue: number;
  depreciationRate: number; // % ao ano
  location: string;
  condition: 'NOVO' | 'BOM' | 'REGULAR' | 'PRECÁRIO';
  assetNumber: string; // Número de tombamento
  observations?: string;
}

export type LeaveType = 'VACATION' | 'MEDICAL' | 'MATERNITY' | 'PATERNITY' | 'MILITARY' | 'WEDDING' | 'BEREAVEMENT' | 'UNPAID';

export interface EmployeeLeave {
  id: string;
  unitId: string;
  employeeId: string;
  employeeName: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  cid10?: string;
  doctorName?: string;
  crm?: string;
  status: 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  observations?: string;
  attachmentUrl?: string;
}

export interface MemberContribution {
  id: string;
  value: number;
  date: string;
  type: 'TITHE' | 'OFFERING' | 'CAMPAIGN';
  description?: string;
}

export interface Dependent {
  id: string;
  name: string;
  birthDate: string;
  relationship: 'FILHO' | 'CONJUGE' | 'PAI' | 'MAE' | 'OUTRO';
  cpf?: string;
}

export interface Member {
  id: string;
  unitId: string; // Vínculo com a igreja específica
  name: string;
  cpf: string;
  rg: string;
  email: string;
  phone: string;
  whatsapp?: string;
  profession?: string;
  role: 'MEMBER' | 'VISITOR' | 'VOLUNTEER' | 'STAFF' | 'LEADER';
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  
  // Vida Cristã
  conversionDate?: string;
  conversionPlace?: string;
  baptismDate?: string;
  baptismChurch?: string;
  baptizingPastor?: string;
  holySpiritBaptism?: 'SIM' | 'NAO';
  
  // Formação e Status
  membershipDate?: string;
  churchOfOrigin?: string;
  discipleshipCourse?: 'NAO_INICIADO' | 'EM_ANDAMENTO' | 'CONCLUIDO';
  biblicalSchool?: 'ATIVO' | 'INATIVO' | 'NAO_FREQUENTA';
  
  // Ministérios e Cargos
  mainMinistry?: string;
  ministryRole?: string;
  otherMinistries?: string[];
  ecclesiasticalPosition?: string;
  consecrationDate?: string;

  // Financeiro Individual
  isTithable: boolean;
  isRegularGiver: boolean;
  participatesCampaigns: boolean;
  contributions: MemberContribution[];

  birthDate: string;
  gender: 'M' | 'F' | 'OTHER';
  maritalStatus: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
  spiritualGifts?: string;
  cellGroup?: string;
  
  address: {
    zipCode: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  
  observations?: string;
  specialNeeds?: string;
  talents?: string;
  avatar: string;
}

export interface Payroll {
  id: string;
  unitId: string;
  membro_id?: string;
  matricula: string;
  employeeName: string;
  cpf: string;
  rg: string;
  pis: string;
  ctps: string;
  titulo_eleitor?: string;
  reservista?: string;
  aso_data?: string;
  blood_type?: string;
  emergency_contact?: string;
  photo?: string; // Campo para foto do funcionário
  cargo: string;
  funcao: string;
  departamento: string;
  cbo: string;
  data_admissao: string;
  data_demissao?: string;
  birthDate: string;
  tipo_contrato: 'CLT' | 'PJ' | 'VOLUNTARIO' | 'TEMPORARIO';
  jornada_trabalho: string;
  regime_trabalho: 'PRESENCIAL' | 'HIBRIDO' | 'REMOTO';
  salario_base: number;
  tipo_salario: 'MENSAL' | 'HORISTA' | 'COMISSIONADO';
  sindicato?: string;
  convencao_coletiva?: string;
  he50_qtd: number;
  he100_qtd: number;
  dsr_ativo: boolean;
  adic_noturno_qtd: number;
  insalubridade_grau: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
  periculosidade_ativo: boolean;
  comissoes: number;
  gratificacoes: number;
  premios: number;
  ats_percentual: number;
  auxilio_moradia: number;
  arredondamento: number;
  dependentes_qtd: number;
  dependentes_lista?: Dependent[];
  is_pcd: boolean;
  tipo_deficiencia: string;
  banco: string;
  codigo_banco: string;
  agencia: string;
  conta: string;
  tipo_conta: 'CORRENTE' | 'POUPANCA';
  titular: string;
  chave_pix: string;
  vt_ativo: boolean;
  vale_transporte_total: number;
  va_ativo: boolean;
  vale_alimentacao: number;
  vr_ativo: boolean;
  vale_refeicao: number;
  ps_ativo: boolean;
  plano_saude_colaborador: number;
  po_ativo: boolean;
  plano_saude_dependentes: number;
  vale_farmacia: number;
  seguro_vida: number;
  faltas: number;
  atrasos: number;
  adiantamento: number;
  pensao_alimenticia: number;
  consignado: number;
  outros_descontos: number;
  coparticipacoes: number;
  inss: number;
  fgts_retido: number;
  irrf: number;
  fgts_patronal: number;
  inss_patronal: number;
  rat: number;
  terceiros: number;
  month: string;
  year: string;
  total_proventos: number;
  total_descontos: number;
  salario_liquido: number;
  status: 'PAID' | 'PENDING' | 'ACTIVE' | 'INACTIVE';
  cnh_numero?: string;
  cnh_categoria?: string;
  cnh_vencimento?: string;
  address: {
    zipCode: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
}

export interface Transaction {
  id: string;
  unitId: string;
  description: string;
  amount: number;
  date: string;
  competencyDate?: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  operationNature?: string;
  costCenter?: string;
  projectId?: string;
  accountId: string;
  memberId?: string;
  reference?: string;
  invoiceNumber?: string;
  paymentMethod?: 'CASH' | 'PIX' | 'CREDIT_CARD';
  providerName?: string;
  providerCpf?: string;
  providerCnpj?: string;
  isInstallment?: boolean;
  installmentsCount?: number;
  currentInstallment?: number;
  status?: 'PAID' | 'PENDING' | 'CANCELLED';
  isConciliated?: boolean;
  attachmentUrl?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FinancialAccount {
  id: string;
  unitId: string;
  name: string;
  type: 'CASH' | 'BANK';
  currentBalance: number;
}

export interface AuditLog {
  id: string;
  unitId: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  date: string;
  ip: string;
}

export interface ChurchEvent {
  id: string;
  unitId: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  attendeesCount: number;
  type: 'SERVICE' | 'MEETING' | 'COURSE' | 'RETREAT';
}

export interface TaxBracket {
  limit: number;
  rate: number;
  deduction?: number;
}

export interface TaxConfig {
  inssBrackets: TaxBracket[];
  irrfBrackets: TaxBracket[];
  fgtsRate: number;
  patronalRate: number;
  ratRate: number;
}

export interface DigitalCertificate {
  id: string;
  ownerName: string;
  cnpj: string;
  expiryDate: string;
  issuer: string;
  status: 'VALID' | 'EXPIRED' | 'REVOKED';
  serialNumber: string;
}
