import {
  User,
  Professional,
  Service,
  WeeklyAvailability,
  ScheduleBlock,
  Appointment,
  ClinicConfig,
  BusinessRuleDefinition
} from '../types';
import { SEED_HASHES } from '../utils/crypto';

export const INITIAL_CLINIC_CONFIG: ClinicConfig = {
  nome: 'CliniFlow — Central de Saúde & Agendamento',
  slogan: 'Sua clínica organizada. Seus horários sob controle.',
  cnpj: '08.258.295/0001-02',
  telefone: '(84) 3317-8200',
  email: 'contato@cliniflow.ufersa.br',
  endereco: 'Av. Francisco Mota, 572 - Bairro Costa e Silva (UFERSA Leste)',
  cidade: 'Pau dos Ferros - RN, CEP 59900-000',
  horario_abertura: '08:00',
  horario_fechamento: '18:00',
  dias_funcionamento: [1, 2, 3, 4, 5, 6], // Seg a Sáb
  antecedencia_minima_cancelamento_horas: 4, // RN09
  antecedencia_minima_agendamento_horas: 2,  // RN08 / RN11
  desconto_padrao_cancelamento_profissional: 20, // RN10: 20% OFF
  mensagem_consolacao_padrao: 'Sentimos muito pelo imprevisto na agenda do seu profissional. Como cortesia, concedemos 20% de desconto e disponibilizamos atendimento prioritário com nossa equipe médica.'
};

export const INITIAL_SERVICES: Service[] = [
  {
    id: 'serv-1',
    nome: 'Consulta Cardiológica Geral',
    descricao: 'Avaliação clínica cardiovascular completa, ausculta cardíaca e orientação preventiva.',
    duracao_minutos: 45, // RN06
    preco: 250,
    situacao: 'ativo',
    categoria: 'Cardiologia',
    profissionais_ids: ['prof-1']
  },
  {
    id: 'serv-2',
    nome: 'Eletrocardiograma (ECG) com Laudo',
    descricao: 'Exame de triagem para análise do ritmo e condução elétrica do coração.',
    duracao_minutos: 30, // RN06
    preco: 160,
    situacao: 'ativo',
    categoria: 'Cardiologia',
    profissionais_ids: ['prof-1']
  },
  {
    id: 'serv-3',
    nome: 'Consulta Dermatológica Clínica',
    descricao: 'Mapeamento de lesões cutâneas, dermatoscopia e acompanhamento de afecções da pele.',
    duracao_minutos: 30, // RN06
    preco: 220,
    situacao: 'ativo',
    categoria: 'Dermatologia',
    profissionais_ids: ['prof-2']
  },
  {
    id: 'serv-4',
    nome: 'Procedimento Dermatológico Menor',
    descricao: 'Biópsia cutânea, cauterização química ou retirada de pequenas lesões sob anestesia local.',
    duracao_minutos: 60, // RN06
    preco: 380,
    situacao: 'ativo',
    categoria: 'Dermatologia',
    profissionais_ids: ['prof-2']
  },
  {
    id: 'serv-5',
    nome: 'Consulta Ortopédica & Articular',
    descricao: 'Diagnóstico de dores musculoesqueléticas, traumas esportivos e coluna vertebral.',
    duracao_minutos: 40, // RN06
    preco: 240,
    situacao: 'ativo',
    categoria: 'Ortopedia',
    profissionais_ids: ['prof-3']
  },
  {
    id: 'serv-6',
    nome: 'Sessão de Fisioterapia Especializada',
    descricao: 'Reabilitação motora funcional, cinesioterapia e controle álgico.',
    duracao_minutos: 60, // RN06
    preco: 140,
    situacao: 'ativo',
    categoria: 'Fisioterapia',
    profissionais_ids: ['prof-3']
  }
];

export const INITIAL_PROFESSIONALS: Professional[] = [
  {
    id: 'prof-1',
    usuario_id: 'usr-prof-1',
    nome: 'Dr. Marcos Vinícius Melo',
    especialidade: 'Cardiologia Clínica',
    registro_profissional: 'CRM-RN 14.892 / RQE 7.411',
    telefone: '(84) 98822-1040',
    email: 'marcos.melo@cliniflow.ufersa.br',
    servicos_ids: ['serv-1', 'serv-2'], // RN13
    situacao: 'ativo',
    bio: 'Mestre em Ciências da Saúde com mais de 10 anos de experiência em prevenção e arritmias cardíacas.',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=240&auto=format&fit=crop&q=80'
  },
  {
    id: 'prof-2',
    usuario_id: 'usr-prof-2',
    nome: 'Dra. Camila Torres Medeiros',
    especialidade: 'Dermatologia Estética & Cirúrgica',
    registro_profissional: 'CRM-RN 23.410 / RQE 9.832',
    telefone: '(84) 99933-7721',
    email: 'camila.torres@cliniflow.ufersa.br',
    servicos_ids: ['serv-3', 'serv-4'], // RN13
    situacao: 'ativo',
    bio: 'Especialista pela Sociedade Brasileira de Dermatologia com foco em diagnóstico precoce e cuidados dermatológicos.',
    avatar: 'https://images.unsplash.com/photo-1594824813581-22e379b3a0f7?w=240&auto=format&fit=crop&q=80'
  },
  {
    id: 'prof-3',
    usuario_id: 'usr-prof-3',
    nome: 'Dr. Rafael Albuquerque Dias',
    especialidade: 'Ortopedia e Traumatologia',
    registro_profissional: 'CRM-RN 19.284 / RQE 8.115',
    telefone: '(84) 99144-8899',
    email: 'rafael.albuquerque@cliniflow.ufersa.br',
    servicos_ids: ['serv-5', 'serv-6'], // RN13
    situacao: 'ativo',
    bio: 'Atendimento focado em lesões articulares, medicina do esporte e recuperação funcional acelerada.',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=240&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin-1',
    nome: 'Dra. Lavinia Dantas',
    email: 'laviniadantass@gmail.com',
    telefone: '(84) 99988-1122',
    tipo: 'administrador',
    situacao: 'ativo',
    data_cadastro: '2026-01-10',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=240&auto=format&fit=crop&q=80',
    senha_hash: SEED_HASHES['laviniadantass@gmail.com']
  },
  {
    id: 'usr-prof-1',
    nome: 'Dr. Marcos Vinícius Melo',
    email: 'marcos.melo@cliniflow.ufersa.br',
    telefone: '(84) 98822-1040',
    tipo: 'profissional',
    profissional_id: 'prof-1',
    situacao: 'ativo',
    data_cadastro: '2026-01-15',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=240&auto=format&fit=crop&q=80',
    senha_hash: SEED_HASHES['marcos.melo@cliniflow.ufersa.br']
  },
  {
    id: 'usr-prof-2',
    nome: 'Dra. Camila Torres Medeiros',
    email: 'camila.torres@cliniflow.ufersa.br',
    telefone: '(84) 99933-7721',
    tipo: 'profissional',
    profissional_id: 'prof-2',
    situacao: 'ativo',
    data_cadastro: '2026-01-18',
    avatar: 'https://images.unsplash.com/photo-1594824813581-22e379b3a0f7?w=240&auto=format&fit=crop&q=80',
    senha_hash: SEED_HASHES['camila.torres@cliniflow.ufersa.br']
  },
  {
    id: 'usr-prof-3',
    nome: 'Dr. Rafael Albuquerque Dias',
    email: 'rafael.albuquerque@cliniflow.ufersa.br',
    telefone: '(84) 99144-8899',
    tipo: 'profissional',
    profissional_id: 'prof-3',
    situacao: 'ativo',
    data_cadastro: '2026-02-01',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=240&auto=format&fit=crop&q=80',
    senha_hash: SEED_HASHES['rafael.albuquerque@cliniflow.ufersa.br']
  },
  {
    id: 'usr-cli-1',
    nome: 'Mariana Silva Rocha',
    email: 'mariana.silva@exemplo.com.br',
    telefone: '(84) 99455-1234',
    tipo: 'cliente',
    situacao: 'ativo',
    data_cadastro: '2026-02-10',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=240&auto=format&fit=crop&q=80',
    senha_hash: SEED_HASHES['mariana.silva@exemplo.com.br']
  },
  {
    id: 'usr-cli-2',
    nome: 'Lucas Fernandes Santos',
    email: 'lucas.fernandes@exemplo.com.br',
    telefone: '(84) 99877-4321',
    tipo: 'cliente',
    situacao: 'ativo',
    data_cadastro: '2026-02-14',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80',
    senha_hash: SEED_HASHES['lucas.fernandes@exemplo.com.br']
  }
];

// Disponibilidade Semanal (Segunda a Sexta das 08h às 18h com almoço 12h-13h) - RN03 e RN05
export const INITIAL_AVAILABILITY: WeeklyAvailability[] = [
  // Dr. Marcos (prof-1) Seg a Sex
  ...([1, 2, 3, 4, 5] as const).map(dia => ({
    id: `avail-prof1-dia${dia}`,
    profissional_id: 'prof-1',
    dia_semana: dia,
    hora_inicio: '08:00',
    hora_fim: '18:00',
    ativo: true,
    intervalo_almoco_inicio: '12:00',
    intervalo_almoco_fim: '13:00'
  })),
  // Dra. Camila (prof-2) Seg, Qua, Sex
  ...([1, 3, 5] as const).map(dia => ({
    id: `avail-prof2-dia${dia}`,
    profissional_id: 'prof-2',
    dia_semana: dia,
    hora_inicio: '08:30',
    hora_fim: '17:30',
    ativo: true,
    intervalo_almoco_inicio: '12:30',
    intervalo_almoco_fim: '13:30'
  })),
  // Dr. Rafael (prof-3) Ter, Qui, Sab manhã
  ...([2, 4] as const).map(dia => ({
    id: `avail-prof3-dia${dia}`,
    profissional_id: 'prof-3',
    dia_semana: dia,
    hora_inicio: '08:00',
    hora_fim: '18:00',
    ativo: true,
    intervalo_almoco_inicio: '12:00',
    intervalo_almoco_fim: '13:00'
  })),
  {
    id: 'avail-prof3-dia6',
    profissional_id: 'prof-3',
    dia_semana: 6, // Sábado
    hora_inicio: '08:00',
    hora_fim: '12:00',
    ativo: true
  }
];

export const INITIAL_BLOCKS: ScheduleBlock[] = [
  {
    id: 'block-1',
    profissional_id: 'prof-1',
    data: '2026-09-18',
    hora_inicio: '15:00',
    hora_fim: '17:00',
    motivo: 'Participação em congresso regional de arritmias',
    criado_em: '2026-09-10'
  },
  {
    id: 'block-2',
    profissional_id: 'prof-2',
    data: '2026-09-17',
    hora_inicio: '10:00',
    hora_fim: '12:00',
    motivo: 'Capacitação clínica em novas tecnologias a laser',
    criado_em: '2026-09-12'
  }
];

// Helper to format date offset
const getFormattedDate = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-101',
    cliente_id: 'usr-cli-1',
    cliente_nome: 'Mariana Silva Rocha',
    cliente_email: 'mariana.silva@exemplo.com.br',
    cliente_telefone: '(84) 99455-1234',
    profissional_id: 'prof-1',
    profissional_nome: 'Dr. Marcos Vinícius Melo',
    servico_id: 'serv-1',
    servico_nome: 'Consulta Cardiológica Geral',
    data: getFormattedDate(2),
    hora_inicio: '09:00',
    hora_fim: '09:45',
    status: 'confirmado',
    data_criacao: '2026-09-12T10:30:00.000Z'
  },
  {
    id: 'apt-102',
    cliente_id: 'usr-cli-1',
    cliente_nome: 'Mariana Silva Rocha',
    cliente_email: 'mariana.silva@exemplo.com.br',
    cliente_telefone: '(84) 99455-1234',
    profissional_id: 'prof-2',
    profissional_nome: 'Dra. Camila Torres Medeiros',
    servico_id: 'serv-3',
    servico_nome: 'Consulta Dermatológica Clínica',
    data: getFormattedDate(5),
    hora_inicio: '14:00',
    hora_fim: '14:30',
    status: 'confirmado',
    data_criacao: '2026-09-13T14:15:00.000Z'
  },
  {
    id: 'apt-103',
    cliente_id: 'usr-cli-2',
    cliente_nome: 'Lucas Fernandes Santos',
    cliente_email: 'lucas.fernandes@exemplo.com.br',
    cliente_telefone: '(84) 99877-4321',
    profissional_id: 'prof-1',
    profissional_nome: 'Dr. Marcos Vinícius Melo',
    servico_id: 'serv-2',
    servico_nome: 'Eletrocardiograma (ECG) com Laudo',
    data: getFormattedDate(1),
    hora_inicio: '10:00',
    hora_fim: '10:30',
    status: 'confirmado',
    data_criacao: '2026-09-14T08:00:00.000Z'
  },
  {
    id: 'apt-104',
    cliente_id: 'usr-cli-2',
    cliente_nome: 'Lucas Fernandes Santos',
    cliente_email: 'lucas.fernandes@exemplo.com.br',
    cliente_telefone: '(84) 99877-4321',
    profissional_id: 'prof-2',
    profissional_nome: 'Dra. Camila Torres Medeiros',
    servico_id: 'serv-4',
    servico_nome: 'Procedimento Dermatológico Menor',
    data: getFormattedDate(-3),
    hora_inicio: '11:00',
    hora_fim: '12:00',
    status: 'cancelado_profissional', // RN10
    data_criacao: '2026-09-08T09:00:00.000Z',
    data_alteracao: '2026-09-10T16:00:00.000Z',
    responsavel_alteracao: 'Dra. Camila Torres Medeiros (Profissional)',
    motivo_cancelamento: 'Convocação urgente para cirurgia hospitalar',
    voucher_consolacao: {
      codigo: 'CLINI-DESC20-7F89',
      desconto_percentual: 20,
      descricao: '20% de desconto gerado automaticamente pelo cancelamento profissional (RN10).',
      utilizado: false
    }
  },
  {
    id: 'apt-105',
    cliente_id: 'usr-cli-1',
    cliente_nome: 'Mariana Silva Rocha',
    cliente_email: 'mariana.silva@exemplo.com.br',
    cliente_telefone: '(84) 99455-1234',
    profissional_id: 'prof-3',
    profissional_nome: 'Dr. Rafael Albuquerque Dias',
    servico_id: 'serv-5',
    servico_nome: 'Consulta Ortopédica & Articular',
    data: getFormattedDate(-7),
    hora_inicio: '14:00',
    hora_fim: '14:40',
    status: 'concluido',
    data_criacao: '2026-09-01T11:00:00.000Z'
  }
];

export const BUSINESS_RULES_LIST: BusinessRuleDefinition[] = [
  {
    codigo: 'RN01',
    titulo: 'Cadastro e Consulta Prévia',
    descricao: 'Consulta livre de serviços, profissionais e horários sem autenticação; confirmação exige conta do cliente.',
    categoria: 'Acesso',
    status: 'Implementada & Ativa',
    detalhe_validacao: 'Usuários não autenticados navegam por serviços e horários vagos. Ao clicar em "Confirmar Reserva", a aplicação solicita login ou cadastro.'
  },
  {
    codigo: 'RN02',
    titulo: 'E-mail Único',
    descricao: 'Cada conta de usuário deve possuir um endereço de e-mail único no sistema.',
    categoria: 'Acesso',
    status: 'Implementada & Ativa',
    detalhe_validacao: 'Validação no formulário de criação de conta impede o registro de e-mails já existentes no banco de dados da clínica.'
  },
  {
    codigo: 'RN03',
    titulo: 'Disponibilidade Profissional',
    descricao: 'Agendamentos só podem ser marcados dentro dos períodos de trabalho cadastrados na agenda do profissional.',
    categoria: 'Disponibilidade',
    status: 'Implementada & Ativa',
    detalhe_validacao: 'Motor de slots verifica a grade semanal configurada pelo profissional (dias da semana e intervalos válidos).'
  },
  {
    codigo: 'RN04',
    titulo: 'Conflito de Horários',
    descricao: 'O sistema impede que dois agendamentos ocupem o mesmo horário para o mesmo profissional.',
    categoria: 'Disponibilidade',
    status: 'Implementada & Ativa',
    detalhe_validacao: 'Horários já ocupados por agendamentos ativos são removidos da lista de slots elegíveis.'
  },
  {
    codigo: 'RN05',
    titulo: 'Horários Definidos por Blocos',
    descricao: 'O profissional define blocos de disponibilidade considerando o período médio de atendimento.',
    categoria: 'Disponibilidade',
    status: 'Implementada & Ativa',
    detalhe_validacao: 'Grade particiona a jornada em blocos compatíveis com os intervalos e pausas de almoço.'
  },
  {
    codigo: 'RN06',
    titulo: 'Duração do Serviço',
    descricao: 'Cada serviço possui duração definida e o sistema a considera no cálculo dos slots livres e horário final.',
    categoria: 'Agendamento',
    status: 'Implementada & Ativa',
    detalhe_validacao: 'Ex: Consulta (45 min) gera hora final = hora início + 45 min, rejeitando slots sem tempo hábil até o fim do turno.'
  },
  {
    codigo: 'RN07',
    titulo: 'Horário Disponível Rigoroso',
    descricao: 'Disponível quando: dentro da disponibilidade + duração suficiente + não ocupado + não bloqueado.',
    categoria: 'Disponibilidade',
    status: 'Implementada & Ativa',
    detalhe_validacao: 'Função de validação combina 4 filtros obrigatórios antes de expor o horário ao paciente.'
  },
  {
    codigo: 'RN08',
    titulo: 'Bloqueio de Agendamento no Passado',
    descricao: 'O sistema não permite o agendamento de horários ou datas anteriores à data e hora atual.',
    categoria: 'Agendamento',
    status: 'Implementada & Ativa',
    detalhe_validacao: 'Datas anteriores a hoje são desabilitadas no calendário e horários de hoje passados são bloqueados.'
  },
  {
    codigo: 'RN09',
    titulo: 'Cancelamento pelo Cliente',
    descricao: 'O cliente pode cancelar seus próprios agendamentos respeitando a antecedência mínima da clínica.',
    categoria: 'Cancelamento',
    status: 'Implementada & Ativa',
    detalhe_validacao: 'Sistema checa a regra da clínica (ex: mínimo de 4 horas de antecedência) para permitir cancelamento direto.'
  },
  {
    codigo: 'RN10',
    titulo: 'Cancelamento pelo Profissional com Consolação',
    descricao: 'Profissional pode cancelar vinculados à sua agenda; sistema registra autoria e emite cupom ou alternativa de médico.',
    categoria: 'Cancelamento',
    status: 'Implementada & Ativa',
    detalhe_validacao: 'Ao cancelar, o profissional insere o motivo; o paciente recebe notificação com voucher de desconto e sugestão de colegas.'
  },
  {
    codigo: 'RN11',
    titulo: 'Reagendamento Seguro',
    descricao: 'Reagendamento permitido apenas para horário vago do profissional e respeitando antecedência mínima.',
    categoria: 'Agendamento',
    status: 'Implementada & Ativa',
    detalhe_validacao: 'Fluxo recalcula disponibilidade do profissional na nova data e atualiza o histórico do agendamento original.'
  },
  {
    codigo: 'RN12',
    titulo: 'Agendamento Duplicado do Cliente',
    descricao: 'Impede que o mesmo cliente possua dois agendamentos conflitantes no mesmo período.',
    categoria: 'Agendamento',
    status: 'Implementada & Ativa',
    detalhe_validacao: 'Valida se o cliente já possui outra consulta marcada no mesmo dia e intervalo horário em qualquer especialidade.'
  },
  {
    codigo: 'RN13',
    titulo: 'Profissional Habilitado para o Serviço',
    descricao: 'Um profissional somente pode receber agendamentos para serviços associados ao seu perfil.',
    categoria: 'Agendamento',
    status: 'Implementada & Ativa',
    detalhe_validacao: 'Ao selecionar um serviço, a lista de profissionais é estritamente filtrada por `profissionais_ids` habilitados.'
  },
  {
    codigo: 'RN14',
    titulo: 'Desativação Suave',
    descricao: 'Profissional ou serviço desativado não aparece para novos agendamentos, mas histórico permanece.',
    categoria: 'Integridade',
    status: 'Implementada & Ativa',
    detalhe_validacao: 'Itens com `situacao: inativo` são ocultados dos seletores públicos mas mantidos nas listas históricas.'
  },
  {
    codigo: 'RN15',
    titulo: 'Histórico de Agendamentos Preservado',
    descricao: 'Mesmo que cancelado, o registro permanece no sistema com data, autor e motivo.',
    categoria: 'Integridade',
    status: 'Implementada & Ativa',
    detalhe_validacao: 'Nenhum agendamento é deletado fisicamente; o status é atualizado com metadados de auditoria.'
  },
  {
    codigo: 'RN16',
    titulo: 'Status Explícito do Agendamento',
    descricao: 'Todo agendamento possui estado definido (Confirmado, Reagendado, Cancelado pelo Cliente/Profissional, Concluído).',
    categoria: 'Integridade',
    status: 'Implementada & Ativa',
    detalhe_validacao: 'Estados são tratados por enums e renderizados visualmente com badges coloridos e descritivos.'
  }
];
