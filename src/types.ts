export type UserRole = 'cliente' | 'profissional' | 'administrador';
export type AccountStatus = 'ativo' | 'inativo';

export interface User {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  tipo: UserRole;
  situacao: AccountStatus;
  data_cadastro: string;
  avatar?: string;
  profissional_id?: string; // se tipo for profissional
  /** SHA-256 hex digest of the password — never exposed in plain text */
  senha_hash?: string;
}

/** Validation result for form fields */
export interface FieldError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: FieldError[];
}

export interface Professional {
  id: string;
  usuario_id: string;
  nome: string;
  especialidade: string;
  registro_profissional: string; // CRM, CRO, CRP, etc.
  telefone: string;
  email: string;
  servicos_ids: string[];
  situacao: AccountStatus;
  avatar?: string;
  bio?: string;
}

export interface Service {
  id: string;
  nome: string;
  descricao: string;
  duracao_minutos: number;
  preco: number;
  situacao: AccountStatus;
  profissionais_ids: string[];
  categoria: string;
}

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado

export interface WeeklyAvailability {
  id: string;
  profissional_id: string;
  dia_semana: DayOfWeek;
  hora_inicio: string; // '08:00'
  hora_fim: string;    // '18:00'
  ativo: boolean;
  intervalo_almoco_inicio?: string; // '12:00'
  intervalo_almoco_fim?: string;    // '13:00'
}

export interface ScheduleBlock {
  id: string;
  profissional_id: string;
  data: string; // 'YYYY-MM-DD'
  hora_inicio: string; // 'HH:mm'
  hora_fim: string;    // 'HH:mm'
  motivo: string;
  criado_em: string;
}

export type AppointmentStatus = 
  | 'confirmado' 
  | 'reagendado' 
  | 'cancelado_cliente' 
  | 'cancelado_profissional' 
  | 'concluido';

export interface AppointmentVoucher {
  codigo: string;
  desconto_percentual: number;
  descricao: string;
  profissional_alternativo_id?: string;
  profissional_alternativo_nome?: string;
  utilizado: boolean;
}

export interface Appointment {
  id: string;
  cliente_id: string;
  cliente_nome: string;
  cliente_email: string;
  cliente_telefone: string;
  profissional_id: string;
  profissional_nome: string;
  servico_id: string;
  servico_nome: string;
  data: string; // 'YYYY-MM-DD'
  hora_inicio: string; // 'HH:mm'
  hora_fim: string;    // 'HH:mm'
  status: AppointmentStatus;
  data_criacao: string;
  data_alteracao?: string;
  responsavel_alteracao?: string;
  motivo_cancelamento?: string;
  voucher_consolacao?: AppointmentVoucher;
}

export interface ClinicConfig {
  nome: string;
  slogan: string;
  cnpj: string;
  telefone: string;
  email: string;
  endereco: string;
  cidade: string;
  horario_abertura: string;
  horario_fechamento: string;
  dias_funcionamento: DayOfWeek[];
  antecedencia_minima_cancelamento_horas: number; // RN09
  antecedencia_minima_agendamento_horas: number;  // RN08 / RN11
  desconto_padrao_cancelamento_profissional: number; // RN10
  mensagem_consolacao_padrao: string;
}

export interface TimeSlot {
  hora_inicio: string;
  hora_fim: string;
  disponivel: boolean;
  motivo_indisponibilidade?: string;
}

export type ViewMode = 'landing' | 'app';

export type AppTab = 
  | 'agendamento' 
  | 'meus-agendamentos' 
  | 'agenda-profissional' 
  | 'disponibilidade' 
  | 'admin-dashboard' 
  | 'admin-profissionais' 
  | 'admin-servicos' 
  | 'admin-usuarios' 
  | 'admin-config'
  | 'regras-negocio';

export interface BusinessRuleDefinition {
  codigo: string; 
  titulo: string;
  descricao: string;
  categoria: 'Acesso' | 'Disponibilidade' | 'Agendamento' | 'Cancelamento' | 'Integridade';
  status: 'Implementada & Ativa';
  detalhe_validacao: string;
}
