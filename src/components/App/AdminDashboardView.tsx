import React, { useState, useMemo } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Calendar,
  Users,
  Stethoscope,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  ShieldCheck,
  Tag
} from 'lucide-react';

export const AdminDashboardView: React.FC = () => {
  const {
    appointments,
    professionals,
    services,
    completeAppointment,
    cancelAppointment,
    setCurrentTab
  } = useClinic();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterProf, setFilterProf] = useState('todos');

  // Metrics
  const totalApts = appointments.length;
  const confirmedApts = appointments.filter(a => a.status === 'confirmado' || a.status === 'reagendado').length;
  const completedApts = appointments.filter(a => a.status === 'concluido').length;
  const cancelledApts = appointments.filter(a => a.status.startsWith('cancelado')).length;

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const matchSearch =
        apt.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.servico_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.profissional_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = filterStatus === 'todos' ? true : apt.status === filterStatus;
      const matchProf = filterProf === 'todos' ? true : apt.profissional_id === filterProf;

      return matchSearch && matchStatus && matchProf;
    });
  }, [appointments, searchTerm, filterStatus, filterProf]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
            PAINEL ADMINISTRATIVO GERAL (RBAC: ACESSO TOTAL)
          </span>
          <h2 className="text-2xl font-extrabold text-[#102b38] font-display mt-2">
            Visão Geral da Clínica
          </h2>
          <p className="text-xs text-slate-500">
            Monitoramento de indicadores clínicos, controle de todos os agendamentos e auditoria do sistema.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setCurrentTab('admin-profissionais')}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
          >
            Gerenciar Médicos
          </button>
          <button
            onClick={() => setCurrentTab('admin-servicos')}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
          >
            Gerenciar Serviços
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Total Agendamentos</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-[#102b38] font-display">{totalApts}</div>
          <div className="text-[11px] text-slate-400">Registros em histórico auditado</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Confirmados / Ativos</span>
            <Clock className="w-4 h-4 text-[#176b63]" />
          </div>
          <div className="text-2xl font-extrabold text-[#176b63] font-display">{confirmedApts}</div>
          <div className="text-[11px] text-emerald-700">Horários bloqueados na agenda</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Atendimentos Concluídos</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 font-display">{completedApts}</div>
          <div className="text-[11px] text-slate-400">Consultas finalizadas</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Cancelamentos</span>
            <XCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-amber-700 font-display">{cancelledApts}</div>
          <div className="text-[11px] text-slate-400">Com registro de motivo e autor</div>
        </div>
      </div>

      {/* Main Clinic Appointments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-[#102b38] font-display">
              Todos os Agendamentos da Clínica
            </h3>
            <p className="text-xs text-slate-500">
              Visão centralizada de atendimentos de todos os pacientes e médicos vinculados.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar paciente, médico..."
                className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 bg-[#f6f8fb] text-slate-800 focus:outline-none focus:border-[#176b63]"
              />
            </div>

            {/* Filter by Doctor */}
            <select
              value={filterProf}
              onChange={(e) => setFilterProf(e.target.value)}
              className="py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold"
            >
              <option value="todos">Todos os Médicos</option>
              {professionals.map(p => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>

            {/* Filter by Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold"
            >
              <option value="todos">Todos os Status</option>
              <option value="confirmado">Confirmado</option>
              <option value="reagendado">Reagendado</option>
              <option value="concluido">Concluído</option>
              <option value="cancelado_cliente">Cancelado pelo Paciente</option>
              <option value="cancelado_profissional">Cancelado pelo Médico</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f6f8fb] text-slate-700 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Protocolo</th>
                <th className="py-3 px-4">Paciente</th>
                <th className="py-3 px-4">Serviço</th>
                <th className="py-3 px-4">Médico</th>
                <th className="py-3 px-4">Data & Horário</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Nenhum agendamento encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-400">
                      {apt.id}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{apt.cliente_nome}</div>
                      <div className="text-[10px] text-slate-400">{apt.cliente_telefone}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800">{apt.servico_nome}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-700">{apt.profissional_nome}</span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-[#176b63]">{apt.data}</div>
                      <div className="text-[11px] text-slate-500">{apt.hora_inicio} - {apt.hora_fim}</div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          apt.status === 'confirmado'
                            ? 'bg-emerald-100 text-emerald-800'
                            : apt.status === 'reagendado'
                            ? 'bg-blue-100 text-blue-800'
                            : apt.status === 'concluido'
                            ? 'bg-slate-200 text-slate-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {apt.status === 'cancelado_profissional' ? 'Canc. Médico (RN10)' : apt.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right space-x-1">
                      {apt.status !== 'concluido' && !apt.status.startsWith('cancelado') && (
                        <>
                          <button
                            onClick={() => completeAppointment(apt.id)}
                            className="p-1 rounded text-emerald-600 hover:bg-emerald-50"
                            title="Concluir Atendimento"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => cancelAppointment(apt.id, 'Cancelado administrativamente')}
                            className="p-1 rounded text-red-600 hover:bg-red-50"
                            title="Cancelar Agendamento"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
