import React, { useState, useMemo } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Appointment } from '../../types';
import {
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Gift,
  RefreshCw,
  Filter,
  Stethoscope,
  Info
} from 'lucide-react';

export const ProfessionalAgendaView: React.FC = () => {
  const {
    currentUser,
    professionals,
    appointments,
    cancelAppointment,
    rescheduleAppointment,
    completeAppointment,
    clinicConfig,
    calculateAvailableSlots
  } = useClinic();

  // Selected date filter (defaults to today or all)
  const todayStr = new Date().toISOString().split('T')[0];
  const [filterDate, setFilterDate] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  // Cancel by Doctor Modal
  const [cancelModalApt, setCancelModalApt] = useState<Appointment | null>(null);
  const [doctorCancelReason, setDoctorCancelReason] = useState<string>('');

  // Reschedule Modal
  const [rescheduleModalApt, setRescheduleModalApt] = useState<Appointment | null>(null);
  const [newRescheduleDate, setNewRescheduleDate] = useState<string>(todayStr);
  const [newSlotTime, setNewSlotTime] = useState<string>('');

  // Determine active professional profile
  const professionalProfile = useMemo(() => {
    if (!currentUser) return null;
    if (currentUser.tipo === 'profissional') {
      return professionals.find(p => p.id === currentUser.profissional_id || p.email === currentUser.email) || professionals[0];
    }
    // If admin is viewing this tab, show first doctor
    return professionals[0];
  }, [currentUser, professionals]);

  // Filter appointments for this professional (RBAC: professional only alters own agenda)
  const professionalAppointments = useMemo(() => {
    if (!professionalProfile) return [];
    return appointments.filter(a => {
      const matchProf = a.profissional_id === professionalProfile.id;
      const matchDate = filterDate ? a.data === filterDate : true;
      const matchStatus = statusFilter === 'todos' ? true : a.status === statusFilter;
      return matchProf && matchDate && matchStatus;
    });
  }, [appointments, professionalProfile, filterDate, statusFilter]);

  // Reschedule slots
  const availableRescheduleSlots = useMemo(() => {
    if (!rescheduleModalApt || !newRescheduleDate) return [];
    return calculateAvailableSlots(
      rescheduleModalApt.servico_id,
      rescheduleModalApt.profissional_id,
      newRescheduleDate,
      rescheduleModalApt.id
    );
  }, [rescheduleModalApt, newRescheduleDate, calculateAvailableSlots]);

  const handleConfirmDoctorCancel = () => {
    if (!cancelModalApt) return;
    cancelAppointment(cancelModalApt.id, doctorCancelReason);
    setCancelModalApt(null);
    setDoctorCancelReason('');
  };

  const handleConfirmReschedule = () => {
    if (!rescheduleModalApt || !newRescheduleDate || !newSlotTime) return;
    rescheduleAppointment(rescheduleModalApt.id, newRescheduleDate, newSlotTime);
    setRescheduleModalApt(null);
    setNewSlotTime('');
  };

  if (!professionalProfile) {
    return (
      <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center max-w-lg mx-auto space-y-3">
        <Stethoscope className="w-12 h-12 text-slate-400 mx-auto" />
        <h3 className="text-xl font-bold text-[#102b38] font-display">Acesso de Profissional</h3>
        <p className="text-sm text-slate-500">
          Você não possui um cadastro de profissional ativo vinculado.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Profile Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {professionalProfile.avatar ? (
            <img
              src={professionalProfile.avatar}
              alt={professionalProfile.nome}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-300 shadow-xs"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-[#176b63] text-white flex items-center justify-center font-bold text-xl">
              {professionalProfile.nome.charAt(0)}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#176b63] bg-[#e2f2ef] px-2.5 py-0.5 rounded-full">
                PAINEL DO PROFISSIONAL
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {professionalProfile.registro_profissional}
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-[#102b38] font-display mt-1">
              Agenda de {professionalProfile.nome}
            </h2>
            <p className="text-xs text-slate-500">
              {professionalProfile.especialidade} • Gerencie seus atendimentos diários com autonomia.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#f6f8fb] px-4 py-2 rounded-xl border border-slate-200 text-center">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Total Atendimentos</span>
            <span className="text-lg font-bold text-[#102b38]">{professionalAppointments.length}</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
              Filtrar por Data:
            </label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 bg-white"
            />
          </div>

          {filterDate && (
            <button
              onClick={() => setFilterDate('')}
              className="text-slate-500 hover:text-slate-800 underline self-end mb-1"
            >
              Ver Todas as Datas
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 self-end">
          <span className="text-slate-500 font-semibold mr-1">Status:</span>
          {['todos', 'confirmado', 'reagendado', 'concluido', 'cancelado_profissional', 'cancelado_cliente'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg font-bold capitalize transition ${
                statusFilter === st
                  ? 'bg-[#176b63] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'cancelado_profissional' ? 'Canc. Médico' : st === 'cancelado_cliente' ? 'Canc. Paciente' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Appointment list */}
      <div className="space-y-3">
        {professionalAppointments.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-2">
            <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
            <h4 className="font-bold text-slate-700">Nenhum atendimento encontrado para os filtros selecionados</h4>
            <p className="text-xs text-slate-500">
              Altere a data ou visualize todos os períodos para verificar agendamentos passados ou futuros.
            </p>
          </div>
        ) : (
          professionalAppointments.map((apt) => {
            const isFinished = apt.status === 'concluido';
            const isCancelled = apt.status === 'cancelado_cliente' || apt.status === 'cancelado_profissional';

            return (
              <div
                key={apt.id}
                className={`bg-white rounded-2xl p-5 border transition space-y-3 ${
                  isCancelled
                    ? 'border-slate-200 opacity-60 bg-slate-50/70'
                    : isFinished
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-slate-200 hover:border-[#176b63] shadow-xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400">#{apt.id}</span>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                        apt.status === 'confirmado'
                          ? 'bg-emerald-100 text-emerald-800'
                          : apt.status === 'reagendado'
                          ? 'bg-blue-100 text-blue-800'
                          : apt.status === 'concluido'
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {apt.status === 'cancelado_profissional' ? 'Cancelado pelo Profissional' : apt.status}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-[#176b63] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{apt.data} • {apt.hora_inicio} às {apt.hora_fim}</span>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Paciente:</span>
                    <span className="font-bold text-slate-900 text-sm">{apt.cliente_nome}</span>
                    <div className="text-slate-500">{apt.cliente_telefone} • {apt.cliente_email}</div>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-medium">Procedimento / Serviço:</span>
                    <span className="font-bold text-slate-800 text-sm">{apt.servico_nome}</span>
                  </div>

                  {/* Cancellation / Audit Details */}
                  <div>
                    {apt.motivo_cancelamento ? (
                      <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                        <span className="text-[10px] font-bold text-amber-900 block">Motivo:</span>
                        <span className="text-amber-800 italic">"{apt.motivo_cancelamento}"</span>
                        {apt.voucher_consolacao && (
                          <div className="mt-1 text-[10px] text-purple-700 font-semibold">
                            Cupom emitido: {apt.voucher_consolacao.codigo} ({apt.voucher_consolacao.desconto_percentual}% OFF)
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-slate-500">
                        Atendimento regular registrado em {new Date(apt.data_criacao).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Professional Actions */}
                {!isCancelled && !isFinished && (
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2 text-xs">
                    <button
                      onClick={() => completeAppointment(apt.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Concluir Atendimento</span>
                    </button>

                    <button
                      onClick={() => setRescheduleModalApt(apt)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-[#176b63]" />
                      <span>Reagendar</span>
                    </button>

                    <button
                      onClick={() => setCancelModalApt(apt)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 font-semibold transition"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancelar (Emite Consolação)</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* DOCTOR CANCEL MODAL */}
      {cancelModalApt && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-slate-200">
            <div className="flex items-center gap-2 text-purple-700 font-bold text-lg">
              <Gift className="w-5 h-5" />
              <span>Cancelamento pelo Profissional</span>
            </div>

            <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-950 space-y-2">
              <strong className="font-bold block">Regra de Negócio:</strong>
              <p>
                O sistema registrará que o cancelamento foi realizado pelo profissional e oferecerá uma consolação ao paciente
                (cupom de cortesia com <strong>{clinicConfig.desconto_padrao_cancelamento_profissional}% de desconto</strong> e indicação de outros profissionais habilitados).
              </p>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <div>Paciente: <strong>{cancelModalApt.cliente_nome}</strong></div>
              <div>Horário: <strong>{cancelModalApt.data} às {cancelModalApt.hora_inicio}</strong></div>
              <div>Serviço: <strong>{cancelModalApt.servico_nome}</strong></div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Justificativa Médica / Motivo do Cancelamento:
              </label>
              <textarea
                value={doctorCancelReason}
                onChange={(e) => setDoctorCancelReason(e.target.value)}
                placeholder="Ex: Cirurgia de urgência hospitalar, convocação para perícia, licença de saúde..."
                className="w-full border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setCancelModalApt(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-50 transition"
              >
                Voltar
              </button>
              <button
                onClick={handleConfirmDoctorCancel}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <span>Cancelar & Emitir Voucher</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DOCTOR RESCHEDULE MODAL */}
      {rescheduleModalApt && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-[#102b38] font-display">
                Reagendar Consulta de Paciente
              </h3>
              <button
                onClick={() => setRescheduleModalApt(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nova Data:
              </label>
              <input
                type="date"
                min={todayStr}
                value={newRescheduleDate}
                onChange={(e) => {
                  setNewRescheduleDate(e.target.value);
                  setNewSlotTime('');
                }}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Horários Livres da Sua Agenda em {newRescheduleDate}:
              </label>
              <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                {availableRescheduleSlots.filter(s => s.disponivel).map((slot) => (
                  <button
                    key={slot.hora_inicio}
                    onClick={() => setNewSlotTime(slot.hora_inicio)}
                    className={`p-2 rounded-lg text-xs font-bold border transition ${
                      newSlotTime === slot.hora_inicio
                        ? 'bg-[#176b63] text-white border-[#176b63]'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-[#176b63]'
                    }`}
                  >
                    {slot.hora_inicio}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setRescheduleModalApt(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmReschedule}
                disabled={!newSlotTime}
                className="px-5 py-2 bg-[#176b63] hover:bg-[#0d514b] disabled:bg-slate-200 text-white rounded-xl text-xs font-bold transition"
              >
                Salvar Reagendamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
