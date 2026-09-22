import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  User,
  Professional,
  Service,
  WeeklyAvailability,
  ScheduleBlock,
  Appointment,
  ClinicConfig,
  TimeSlot,
  ViewMode,
  AppTab
} from '../types';
import {
  INITIAL_CLINIC_CONFIG,
  INITIAL_SERVICES,
  INITIAL_PROFESSIONALS,
  INITIAL_USERS,
  INITIAL_AVAILABILITY,
  INITIAL_BLOCKS,
  INITIAL_APPOINTMENTS
} from '../data/mockData';
import { hashPassword, verifyPassword } from '../utils/crypto';

// ─── Context Shape ────────────────────────────────────────────────────────────

interface ClinicContextType {
  // Navigation & UI State
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  currentTab: AppTab;
  setCurrentTab: (tab: AppTab) => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;

  // Auth modal
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authInitialTab: 'login' | 'register';
  openAuthModal: (tab?: 'login' | 'register', callback?: () => void) => void;
  closeAuthModal: () => void;

  // Auth actions (async — password hashing)
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  register: (
    nome: string,
    email: string,
    telefone: string,
    senha: string,
    tipo: 'cliente' | 'profissional' | 'administrador'
  ) => Promise<{ success: boolean; message: string; user?: User }>;

  // Business Rules inspector
  rulesModalOpen: boolean;
  setRulesModalOpen: (open: boolean) => void;
  selectedRuleCode: string | null;
  openRuleDetail: (code: string) => void;

  // Entities
  clinicConfig: ClinicConfig;
  updateClinicConfig: (config: Partial<ClinicConfig>) => void;
  services: Service[];
  professionals: Professional[];
  users: User[];
  appointments: Appointment[];
  availabilities: WeeklyAvailability[];
  blocks: ScheduleBlock[];

  // Helpers & Active Entities
  activeServices: Service[];
  activeProfessionals: Professional[];
  getServiceById: (id: string) => Service | undefined;
  getProfessionalById: (id: string) => Professional | undefined;
  getProfessionalsForService: (serviceId: string) => Professional[];
  getUserById: (id: string) => User | undefined;

  // Booking & Slots Engine 
  calculateAvailableSlots: (
    serviceId: string,
    professionalId: string,
    dateStr: string,
    excludeAppointmentId?: string
  ) => TimeSlot[];

  // Actions
  bookAppointment: (
    serviceId: string,
    professionalId: string,
    dateStr: string,
    horaInicio: string,
    customClientData?: { nome: string; email: string; telefone: string }
  ) => { success: boolean; message: string; appointment?: Appointment };

  cancelAppointment: (
    appointmentId: string,
    motivo: string
  ) => { success: boolean; message: string };

  rescheduleAppointment: (
    appointmentId: string,
    novaData: string,
    novoHorarioInicio: string
  ) => { success: boolean; message: string };

  completeAppointment: (appointmentId: string) => void;

  // Professional Availability & Blocks
  updateProfessionalAvailability: (
    professionalId: string,
    dayOfWeek: number,
    horaInicio: string,
    horaFim: string,
    ativo: boolean
  ) => void;

  addScheduleBlock: (
    professionalId: string,
    data: string,
    horaInicio: string,
    horaFim: string,
    motivo: string
  ) => void;

  removeScheduleBlock: (blockId: string) => void;

  // Admin Management
  addProfessional: (prof: Omit<Professional, 'id'>) => void;
  updateProfessional: (id: string, data: Partial<Professional>) => void;
  toggleProfessionalStatus: (id: string) => void;

  addService: (serv: Omit<Service, 'id'>) => void;
  updateService: (id: string, data: Partial<Service>) => void;
  toggleServiceStatus: (id: string) => void;

  // Legacy alias kept so AdminProfessionalsView compiles unchanged
  registerUser: (
    nome: string,
    email: string,
    telefone: string,
    tipo: 'cliente' | 'profissional' | 'administrador',
    profissionalData?: Partial<Professional>
  ) => { success: boolean; message: string; user?: User };

  // Notifications
  toastMessage: { text: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
}

// ─── Context & Storage ────────────────────────────────────────────────────────

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

const STORAGE_PREFIX = 'cliniflow_v2_'; // bumped to v2 to avoid stale data without senha_hash

// ─── Provider ─────────────────────────────────────────────────────────────────

export const ClinicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [viewMode, setViewMode] = useState<ViewMode>('landing');
  const [currentTab, setCurrentTab] = useState<AppTab>('agendamento');

  // Auth
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + 'session');
      return saved ? (JSON.parse(saved) as User) : null;
    } catch {
      return null;
    }
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<'login' | 'register'>('login');
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Persist session (without the hash — we re-read from users array on login)
  useEffect(() => {
    if (currentUser) {
      // Store session without the hash for security hygiene
      const { senha_hash: _omit, ...safeUser } = currentUser;
      localStorage.setItem(STORAGE_PREFIX + 'session', JSON.stringify(safeUser));
    } else {
      localStorage.removeItem(STORAGE_PREFIX + 'session');
    }
  }, [currentUser]);

  // Business Rules modal
  const [rulesModalOpen, setRulesModalOpen] = useState(false);
  const [selectedRuleCode, setSelectedRuleCode] = useState<string | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(prev => (prev?.text === text ? null : prev)), 4500);
  };

  // ── Entity State with localStorage ──────────────────────────────────────────

  const [clinicConfig, setClinicConfig] = useState<ClinicConfig>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'config');
    return saved ? JSON.parse(saved) : INITIAL_CLINIC_CONFIG;
  });

  const [services, setServices] = useState<Service[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'services');
    return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  });

  const [professionals, setProfessionals] = useState<Professional[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'professionals');
    return saved ? JSON.parse(saved) : INITIAL_PROFESSIONALS;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [availabilities, setAvailabilities] = useState<WeeklyAvailability[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'availabilities');
    return saved ? JSON.parse(saved) : INITIAL_AVAILABILITY;
  });

  const [blocks, setBlocks] = useState<ScheduleBlock[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'blocks');
    return saved ? JSON.parse(saved) : INITIAL_BLOCKS;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'appointments');
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  // Sync to localStorage
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'config', JSON.stringify(clinicConfig)); }, [clinicConfig]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'services', JSON.stringify(services)); }, [services]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'professionals', JSON.stringify(professionals)); }, [professionals]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'availabilities', JSON.stringify(availabilities)); }, [availabilities]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'blocks', JSON.stringify(blocks)); }, [blocks]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'appointments', JSON.stringify(appointments)); }, [appointments]);

  // ── Memoised helpers ─────────────────────────────────────────────────────────

  // inactive records hidden from new bookings
  const activeServices = useMemo(() => services.filter(s => s.situacao === 'ativo'), [services]);
  const activeProfessionals = useMemo(() => professionals.filter(p => p.situacao === 'ativo'), [professionals]);

  const getServiceById = (id: string) => services.find(s => s.id === id);
  const getProfessionalById = (id: string) => professionals.find(p => p.id === id);
  const getUserById = (id: string) => users.find(u => u.id === id);

  // only professionals associated with the service
  const getProfessionalsForService = (serviceId: string) =>
    activeProfessionals.filter(p => p.servicos_ids.includes(serviceId));

  // ── Auth Modal helpers ───────────────────────────────────────────────────────

  const openAuthModal = (tab: 'login' | 'register' = 'login', callback?: () => void) => {
    setAuthInitialTab(tab);
    setPendingAction(callback ? () => callback : null);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
    setPendingAction(null);
  };

  const openRuleDetail = (code: string) => {
    setSelectedRuleCode(code);
    setRulesModalOpen(true);
  };

  // ── Real Authentication ──────────────────────────────────────────────────────

  /**
   * Async login — verifies password hash with Web Crypto API.
   * checks account exists; checks account is active.
   */
  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; message: string }> => {
    const normalised = email.trim().toLowerCase();
    const found = users.find(u => u.email.trim().toLowerCase() === normalised);

    if (!found) {
      return { success: false, message: 'E-mail não cadastrado no sistema.' };
    }

    if (found.situacao !== 'ativo') {
      return { success: false, message: 'Esta conta está desativada. Contate a administração.' };
    }

    if (!found.senha_hash) {
      // Account created before password system — shouldn't happen after migration
      return { success: false, message: 'Conta sem senha definida. Contate a administração.' };
    }

    const ok = await verifyPassword(password, normalised, found.senha_hash);
    if (!ok) {
      return { success: false, message: 'Senha incorreta. Tente novamente.' };
    }

    // Strip hash from in-memory session (it's already persisted in users array)
    const { senha_hash: _omit, ...safeUser } = found;
    setCurrentUser(found); // keep full object in state for comparisons

    // Route to the right default tab based on role
    if (found.tipo === 'administrador') {
      setViewMode('app');
      setCurrentTab('admin-dashboard');
    } else if (found.tipo === 'profissional') {
      setViewMode('app');
      setCurrentTab('agenda-profissional');
    }

    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }

    closeAuthModal();
    showToast(`Bem-vindo(a) de volta, ${found.nome.split(' ')[0]}!`, 'success');
    return { success: true, message: 'Login realizado com sucesso!' };
  };

  /** Clears the session. */
  const logout = () => {
    setCurrentUser(null);
    setViewMode('landing');
    showToast('Sessão encerrada com segurança.', 'info');
  };

  /**
   * Async register — hashes password, enforces RULE 2 (unique email).
   * Clients register freely. Profissionais/Admins can only be created
   * by an existing administrator (enforced via the context — the modal
   * only offers 'cliente' to non-admin users).
   */
  const register = async (
    nome: string,
    email: string,
    telefone: string,
    senha: string,
    tipo: 'cliente' | 'profissional' | 'administrador'
  ): Promise<{ success: boolean; message: string; user?: User }> => {
    const normalised = email.trim().toLowerCase();

    // unique email
    const exists = users.some(u => u.email.trim().toLowerCase() === normalised);
    if (exists) {
      return {
        success: false,
        message: 'Este e-mail já está cadastrado. Use outro ou faça login.'
      };
    }

    const hash = await hashPassword(senha, normalised);
    const newUserId = `usr-${Date.now()}`;

    const newUser: User = {
      id: newUserId,
      nome: nome.trim(),
      email: normalised,
      telefone: telefone.trim(),
      tipo,
      situacao: 'ativo',
      data_cadastro: new Date().toISOString().split('T')[0],
      senha_hash: hash
    };

    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);

    // Route after registration
    if (tipo === 'administrador') {
      setViewMode('app');
      setCurrentTab('admin-dashboard');
    } else if (tipo === 'profissional') {
      setViewMode('app');
      setCurrentTab('agenda-profissional');
    }

    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }

    closeAuthModal();
    showToast(`Conta criada! Bem-vindo(a), ${nome.trim().split(' ')[0]}.`, 'success');
    return { success: true, message: 'Conta criada com sucesso!', user: newUser };
  };

  // ── Legacy synchronous registerUser (used by AdminProfessionalsView) ─────────
  // Creates accounts without a password — admin-managed accounts get a hash of a
  // temporary placeholder so login still works once admin sets a real password.
  const registerUser = (
    nome: string,
    email: string,
    telefone: string,
    tipo: 'cliente' | 'profissional' | 'administrador',
    profissionalData?: Partial<Professional>
  ): { success: boolean; message: string; user?: User } => {
    const normalised = email.trim().toLowerCase();

    const exists = users.some(u => u.email.trim().toLowerCase() === normalised);
    if (exists) {
      return {
        success: false,
        message: 'Este e-mail já está cadastrado no sistema.'
      };
    }

    const newUserId = `usr-${Date.now()}`;
    let profId: string | undefined;

    if (tipo === 'profissional' && profissionalData) {
      profId = `prof-${Date.now()}`;
      const newProf: Professional = {
        id: profId,
        usuario_id: newUserId,
        nome,
        especialidade: profissionalData.especialidade || 'Clínica Geral',
        registro_profissional: profissionalData.registro_profissional || 'CRM 00000',
        telefone,
        email: normalised,
        servicos_ids: profissionalData.servicos_ids || [],
        situacao: 'ativo'
      };
      setProfessionals(prev => [...prev, newProf]);
    }

    const newUser: User = {
      id: newUserId,
      nome,
      email: normalised,
      telefone,
      tipo,
      situacao: 'ativo',
      data_cadastro: new Date().toISOString().split('T')[0],
      profissional_id: profId
      // No senha_hash — admin-created accounts must reset via the auth flow
    };

    setUsers(prev => [...prev, newUser]);
    showToast(`Usuário ${nome} cadastrado. Peça que ele defina a senha no primeiro acesso.`, 'success');
    return { success: true, message: 'Usuário cadastrado com sucesso!', user: newUser };
  };

  // ── Clinic Config ────────────────────────────────────────────────────────────

  const updateClinicConfig = (config: Partial<ClinicConfig>) => {
    setClinicConfig(prev => ({ ...prev, ...config }));
    showToast('Configurações da clínica atualizadas com sucesso!', 'success');
  };

  // ── Time helpers ─────────────────────────────────────────────────────────────

  const timeToMinutes = (timeStr: string): number => {
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const minutesToTime = (totalMinutes: number): string => {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  // ── Slot Engine ──────────────────────────────────────────────────────────────
  /**
   * Enforces 1, 3 TO 8, 12 TO 14.
   * Public — no auth required to view available slots.
   */
  const calculateAvailableSlots = (
    serviceId: string,
    professionalId: string,
    dateStr: string,
    excludeAppointmentId?: string
  ): TimeSlot[] => {
    const service = getServiceById(serviceId);
    const professional = getProfessionalById(professionalId);

    if (!service || service.situacao !== 'ativo') return [];        
    if (!professional || professional.situacao !== 'ativo') return []; 
    if (!professional.servicos_ids.includes(serviceId)) return []; 
    if (!dateStr) return [];

    const [year, month, day] = dateStr.split('-').map(Number);
    const targetDate = new Date(year, month - 1, day);
    const dayOfWeek = targetDate.getDay();

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    if (dateStr < todayStr) return [];

    // professional must have availability for this day
    const dayAvail = availabilities.find(
      a => a.profissional_id === professionalId && a.dia_semana === dayOfWeek && a.ativo
    );
    if (!dayAvail) return [];

    const workStart = timeToMinutes(dayAvail.hora_inicio);
    const workEnd = timeToMinutes(dayAvail.hora_fim);
    const serviceDuration = service.duracao_minutos; 

    const lunchStart = dayAvail.intervalo_almoco_inicio ? timeToMinutes(dayAvail.intervalo_almoco_inicio) : -1;
    const lunchEnd   = dayAvail.intervalo_almoco_fim   ? timeToMinutes(dayAvail.intervalo_almoco_fim)   : -1;

    const dayBlocks  = blocks.filter(b => b.profissional_id === professionalId && b.data === dateStr);
    const activeApts = appointments.filter(
      a =>
        a.profissional_id === professionalId &&
        a.data === dateStr &&
        a.status !== 'cancelado_cliente' &&
        a.status !== 'cancelado_profissional' &&
        a.id !== excludeAppointmentId
    );

    // RN12 — check client's own appointments only when logged in as cliente
    const clientApts =
      currentUser && currentUser.tipo === 'cliente'
        ? appointments.filter(
            a =>
              a.cliente_id === currentUser.id &&
              a.data === dateStr &&
              a.status !== 'cancelado_cliente' &&
              a.status !== 'cancelado_profissional' &&
              a.id !== excludeAppointmentId
          )
        : [];

    const slots: TimeSlot[] = [];
    const step = 30;

    for (let startM = workStart; startM + serviceDuration <= workEnd; startM += step) {
      const endM     = startM + serviceDuration;
      const startStr = minutesToTime(startM);
      const endStr   = minutesToTime(endM);

      // RN08 — minimum advance booking for today
      if (dateStr === todayStr) {
        const currentM   = now.getHours() * 60 + now.getMinutes();
        const minAllowed = currentM + clinicConfig.antecedencia_minima_agendamento_horas * 60;
        if (startM < minAllowed) {
          slots.push({ hora_inicio: startStr, hora_fim: endStr, disponivel: false, motivo_indisponibilidade: 'Horário já ultrapassado ou com antecedência insuficiente (RN08)' });
          continue;
        }
      }

      // RN05 — lunch break
      if (lunchStart !== -1 && startM < lunchEnd && endM > lunchStart) {
        slots.push({ hora_inicio: startStr, hora_fim: endStr, disponivel: false, motivo_indisponibilidade: 'Intervalo de almoço do profissional (RN05)' });
        continue;
      }

      // RN07 — blocked slots
      if (dayBlocks.some(b => startM < timeToMinutes(b.hora_fim) && endM > timeToMinutes(b.hora_inicio))) {
        slots.push({ hora_inicio: startStr, hora_fim: endStr, disponivel: false, motivo_indisponibilidade: 'Horário bloqueado pelo profissional (RN07)' });
        continue;
      }

      // RN04 — doctor already has an appointment
      if (activeApts.some(a => startM < timeToMinutes(a.hora_fim) && endM > timeToMinutes(a.hora_inicio))) {
        slots.push({ hora_inicio: startStr, hora_fim: endStr, disponivel: false, motivo_indisponibilidade: 'Horário já reservado para outro paciente (RN04)' });
        continue;
      }

      // RN12 — client double-booking
      if (clientApts.some(a => startM < timeToMinutes(a.hora_fim) && endM > timeToMinutes(a.hora_inicio))) {
        slots.push({ hora_inicio: startStr, hora_fim: endStr, disponivel: false, motivo_indisponibilidade: 'Você já possui outra consulta marcada neste horário (RN12)' });
        continue;
      }

      slots.push({ hora_inicio: startStr, hora_fim: endStr, disponivel: true });
    }

    return slots;
  };

  // ── Booking ──────────────────────────────────────────────────────────────────
  const bookAppointment = (
    serviceId: string,
    professionalId: string,
    dateStr: string,
    horaInicio: string,
    customClientData?: { nome: string; email: string; telefone: string }
  ) => {
    // RN01 — must be authenticated to confirm
    if (!currentUser) {
      openAuthModal('login');
      return {
        success: false,
        message: 'Você pode consultar horários livremente, mas deve entrar para confirmar o agendamento.'
      };
    }

    const service      = getServiceById(serviceId);
    const professional = getProfessionalById(professionalId);

    if (!service)      return { success: false, message: 'Serviço não encontrado.' };
    if (!professional) return { success: false, message: 'Profissional não encontrado.' };

    if (!professional.servicos_ids.includes(serviceId)) {
      return { success: false, message: 'Este profissional não está habilitado para este serviço.' };
    }

    const startM  = timeToMinutes(horaInicio);
    const endM    = startM + service.duracao_minutos;
    const horaFim = minutesToTime(endM);

    const availableSlots = calculateAvailableSlots(serviceId, professionalId, dateStr);
    const targetSlot     = availableSlots.find(s => s.hora_inicio === horaInicio);

    if (!targetSlot || !targetSlot.disponivel) {
      return {
        success: false,
        message: targetSlot?.motivo_indisponibilidade ?? 'Horário indisponível.'
      };
    }

    const clientUser =
      currentUser.tipo === 'administrador' && customClientData
        ? { id: `usr-client-${Date.now()}`, ...customClientData }
        : { id: currentUser.id, nome: currentUser.nome, email: currentUser.email, telefone: currentUser.telefone };

    const newAppointment: Appointment = {
      id: `apt-${Date.now()}`,
      cliente_id: clientUser.id,
      cliente_nome: clientUser.nome,
      cliente_email: clientUser.email,
      cliente_telefone: clientUser.telefone,
      profissional_id: professional.id,
      profissional_nome: professional.nome,
      servico_id: service.id,
      servico_nome: service.nome,
      data: dateStr,
      hora_inicio: horaInicio,
      hora_fim: horaFim,
      status: 'confirmado', // RN16
      data_criacao: new Date().toISOString()
    };

    setAppointments(prev => [newAppointment, ...prev]);
    showToast(`Agendamento confirmado para ${dateStr} às ${horaInicio}!`, 'success');
    return { success: true, message: 'Agendamento confirmado!', appointment: newAppointment };
  };

  // ── Cancel ───────────────────────────────────────────────────────────────────
  const cancelAppointment = (appointmentId: string, motivo: string) => {
    const apt = appointments.find(a => a.id === appointmentId);
    if (!apt) return { success: false, message: 'Agendamento não encontrado.' };
    if (!currentUser) return { success: false, message: 'Autenticação necessária.' };

    const now         = new Date();
    const aptDateTime = new Date(`${apt.data}T${apt.hora_inicio}:00`);

    if (currentUser.tipo === 'cliente') {
      if (apt.cliente_id !== currentUser.id)
        return { success: false, message: 'Você só pode cancelar seus próprios agendamentos.' };

      const diffHours = (aptDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      if (diffHours < clinicConfig.antecedencia_minima_cancelamento_horas) {
        return {
          success: false,
          message: `Cancelamento exige ${clinicConfig.antecedencia_minima_cancelamento_horas}h de antecedência. Entre em contato com a clínica.`
        };
      }

      setAppointments(prev =>
        prev.map(a =>
          a.id === appointmentId
            ? { ...a, status: 'cancelado_cliente', motivo_cancelamento: motivo || 'Cancelado a pedido do paciente.', data_alteracao: new Date().toISOString(), responsavel_alteracao: `${currentUser.nome} (Cliente)` }
            : a
        )
      );
      showToast('Agendamento cancelado.', 'info');
      return { success: true, message: 'Agendamento cancelado com sucesso.' };
    }

    if (currentUser.tipo === 'profissional') {
      if (apt.profissional_id !== currentUser.profissional_id)
        return { success: false, message: 'Você só pode cancelar agendamentos da sua própria agenda.' };

      const altProfs      = activeProfessionals.filter(p => p.id !== apt.profissional_id && p.servicos_ids.includes(apt.servico_id));
      const recommendedProf = altProfs[0];
      const voucherCode   = `DESC${clinicConfig.desconto_padrao_cancelamento_profissional}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      setAppointments(prev =>
        prev.map(a =>
          a.id === appointmentId
            ? {
                ...a,
                status: 'cancelado_profissional',
                motivo_cancelamento: motivo || 'Imprevisto na agenda do profissional.',
                data_alteracao: new Date().toISOString(),
                responsavel_alteracao: `${currentUser.nome} (Profissional)`,
                voucher_consolacao: {
                  codigo: voucherCode,
                  desconto_percentual: clinicConfig.desconto_padrao_cancelamento_profissional,
                  descricao: `${clinicConfig.desconto_padrao_cancelamento_profissional}% de desconto de cortesia.`,
                  profissional_alternativo_id: recommendedProf?.id,
                  profissional_alternativo_nome: recommendedProf?.nome,
                  utilizado: false
                }
              }
            : a
        )
      );
      showToast(`Cancelado. Voucher ${voucherCode} enviado ao paciente.`, 'success');
      return { success: true, message: `Atendimento cancelado. Voucher de ${clinicConfig.desconto_padrao_cancelamento_profissional}% gerado.` };
    }

    if (currentUser.tipo === 'administrador') {
      setAppointments(prev =>
        prev.map(a =>
          a.id === appointmentId
            ? { ...a, status: 'cancelado_cliente', motivo_cancelamento: motivo || 'Cancelado administrativamente.', data_alteracao: new Date().toISOString(), responsavel_alteracao: `${currentUser.nome} (Administrador)` }
            : a
        )
      );
      showToast('Agendamento cancelado pelo Administrador.', 'info');
      return { success: true, message: 'Agendamento cancelado administrativamente.' };
    }

    return { success: false, message: 'Ação não permitida para o seu perfil.' };
  };

  // ── Reschedule ───────────────────────────────────────────────────────────────
  const rescheduleAppointment = (appointmentId: string, novaData: string, novoHorarioInicio: string) => {
    const apt = appointments.find(a => a.id === appointmentId);
    if (!apt)        return { success: false, message: 'Agendamento não encontrado.' };
    if (!currentUser) return { success: false, message: 'Autenticação necessária.' };

    if (currentUser.tipo === 'cliente' && apt.cliente_id !== currentUser.id)
      return { success: false, message: 'Acesso negado: agendamento de outro cliente.' };
    if (currentUser.tipo === 'profissional' && apt.profissional_id !== currentUser.profissional_id)
      return { success: false, message: 'Acesso negado: agendamento de outro profissional.' };

    const slots     = calculateAvailableSlots(apt.servico_id, apt.profissional_id, novaData, appointmentId);
    const targetSlot = slots.find(s => s.hora_inicio === novoHorarioInicio);

    if (!targetSlot || !targetSlot.disponivel) {
      return { success: false, message: targetSlot?.motivo_indisponibilidade ?? 'Horário indisponível para reagendamento.' };
    }

    const service = getServiceById(apt.servico_id);
    const duracao  = service?.duracao_minutos ?? 30;
    const novaFim  = minutesToTime(timeToMinutes(novoHorarioInicio) + duracao);

    setAppointments(prev =>
      prev.map(a =>
        a.id === appointmentId
          ? { ...a, data: novaData, hora_inicio: novoHorarioInicio, hora_fim: novaFim, status: 'reagendado', data_alteracao: new Date().toISOString(), responsavel_alteracao: `${currentUser.nome} (${currentUser.tipo})` }
          : a
      )
    );
    showToast(`Reagendado para ${novaData} às ${novoHorarioInicio}!`, 'success');
    return { success: true, message: 'Reagendado com sucesso!' };
  };

  const completeAppointment = (appointmentId: string) => {
    setAppointments(prev =>
      prev.map(a =>
        a.id === appointmentId
          ? { ...a, status: 'concluido', data_alteracao: new Date().toISOString(), responsavel_alteracao: currentUser ? `${currentUser.nome} (${currentUser.tipo})` : 'Sistema' }
          : a
      )
    );
    showToast('Atendimento marcado como concluído!', 'success');
  };

  // ── Availability & Blocks ────────────────────────────────────────────────────
  const updateProfessionalAvailability = (
    professionalId: string,
    dayOfWeek: number,
    horaInicio: string,
    horaFim: string,
    ativo: boolean
  ) => {
    setAvailabilities(prev => {
      const existing = prev.find(a => a.profissional_id === professionalId && a.dia_semana === dayOfWeek);
      if (existing) {
        return prev.map(a => a.id === existing.id ? { ...a, hora_inicio: horaInicio, hora_fim: horaFim, ativo } : a);
      }
      return [...prev, {
        id: `avail-${professionalId}-dia${dayOfWeek}`,
        profissional_id: professionalId,
        dia_semana: dayOfWeek as WeeklyAvailability['dia_semana'],
        hora_inicio: horaInicio,
        hora_fim: horaFim,
        ativo
      }];
    });
    showToast('Disponibilidade semanal atualizada!', 'success');
  };

  const addScheduleBlock = (
    professionalId: string,
    data: string,
    horaInicio: string,
    horaFim: string,
    motivo: string
  ) => {
    setBlocks(prev => [...prev, {
      id: `block-${Date.now()}`,
      profissional_id: professionalId,
      data,
      hora_inicio: horaInicio,
      hora_fim: horaFim,
      motivo,
      criado_em: new Date().toISOString()
    }]);
    showToast('Horário bloqueado!', 'success');
  };

  const removeScheduleBlock = (blockId: string) => {
    setBlocks(prev => prev.filter(b => b.id !== blockId));
    showToast('Bloqueio removido da agenda.', 'info');
  };

  // ── Admin CRUD ───────────────────────────────────────────────────────────────
  const addProfessional = (profData: Omit<Professional, 'id'>) => {
    const newId = `prof-${Date.now()}`;
    setProfessionals(prev => [...prev, { ...profData, id: newId }]);
    // Default Mon–Fri availability
    setAvailabilities(prev => [
      ...prev,
      ...[1, 2, 3, 4, 5].map(dia => ({
        id: `avail-${newId}-dia${dia}`,
        profissional_id: newId,
        dia_semana: dia as WeeklyAvailability['dia_semana'],
        hora_inicio: '08:00',
        hora_fim: '18:00',
        ativo: true,
        intervalo_almoco_inicio: '12:00',
        intervalo_almoco_fim: '13:00'
      }))
    ]);
    showToast(`Profissional ${profData.nome} cadastrado!`, 'success');
  };

  const updateProfessional = (id: string, data: Partial<Professional>) => {
    setProfessionals(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    showToast('Dados do profissional atualizados.', 'success');
  };

  const toggleProfessionalStatus = (id: string) => { // RN14
    setProfessionals(prev =>
      prev.map(p => {
        if (p.id !== id) return p;
        const novo = p.situacao === 'ativo' ? 'inativo' : 'ativo';
        showToast(`Profissional ${p.nome} ${novo === 'ativo' ? 'reativado' : 'desativado'}.`, 'info');
        return { ...p, situacao: novo };
      })
    );
  };

  const addService = (servData: Omit<Service, 'id'>) => {
    const newService: Service = { ...servData, id: `serv-${Date.now()}` };
    setServices(prev => [...prev, newService]);
    showToast(`Serviço "${newService.nome}" cadastrado: ${newService.duracao_minutos}min)!`, 'success');
  };

  const updateService = (id: string, data: Partial<Service>) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
    showToast('Serviço atualizado.', 'success');
  };

  const toggleServiceStatus = (id: string) => { // RN14
    setServices(prev =>
      prev.map(s => {
        if (s.id !== id) return s;
        const novo = s.situacao === 'ativo' ? 'inativo' : 'ativo';
        showToast(`Serviço "${s.nome}" ${novo === 'ativo' ? 'reativado' : 'desativado'}.`, 'info');
        return { ...s, situacao: novo };
      })
    );
  };

  // ── Provider ─────────────────────────────────────────────────────────────────
  return (
    <ClinicContext.Provider
      value={{
        viewMode, setViewMode,
        currentTab, setCurrentTab,
        currentUser, setCurrentUser,

        authModalOpen, setAuthModalOpen,
        authInitialTab, openAuthModal, closeAuthModal,
        login, logout, register,

        rulesModalOpen, setRulesModalOpen,
        selectedRuleCode, openRuleDetail,

        clinicConfig, updateClinicConfig,
        services, professionals, users, appointments, availabilities, blocks,

        activeServices, activeProfessionals,
        getServiceById, getProfessionalById, getProfessionalsForService, getUserById,

        calculateAvailableSlots,
        bookAppointment,
        cancelAppointment,
        rescheduleAppointment,
        completeAppointment,

        updateProfessionalAvailability,
        addScheduleBlock,
        removeScheduleBlock,

        addProfessional, updateProfessional, toggleProfessionalStatus,
        addService, updateService, toggleServiceStatus,

        registerUser,

        toastMessage, showToast
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
};

export const useClinic = () => {
  const ctx = useContext(ClinicContext);
  if (!ctx) throw new Error('useClinic must be used within a ClinicProvider');
  return ctx;
};
