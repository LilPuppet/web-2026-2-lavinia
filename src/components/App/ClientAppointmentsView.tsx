import React, { useState, useMemo } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Appointment, AppointmentStatus } from '../../types';
import {
  Calendar,
  Clock,
  User,
  AlertTriangle,
  RefreshCw,
  XCircle,
  CheckCircle2,
  Tag,
  Stethoscope,
  Info
} from 'lucide-react';

export const ClientAppointmentsView: React.FC = () => {
  const {
    currentUser,
    appointments,
    cancelAppointment,
    rescheduleAppointment,
    calculateAvailableSlots,
    clinicConfig,
    setCurrentTab
  } = useClinic();

  // Filter state
  const [activeTab, setActiveTab] = useState<'ativos' | 'historico' | 'vouchers'>('ativos');

  // Cancel Modal State
  const [cancelModalApt, setCancelModalApt] = useState<Appointment | null>(null);
  const [cancelMotivo, setCancelMotivo] = useState('');

  // Reschedule Modal State
  const [rescheduleModalApt, setRescheduleModalApt] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [newSlotTime, setNewSlotTime] = useState('');

  // RBAC: Client only sees their own appointments!
  const myAppointments = useMemo(() => {
    if (!currentUser) return [];
    return appointments.filter(a => a.cliente_id === currentUser.id);
  }, [appointments, currentUser]);

  const activeApts = useMemo(() => {
    return myAppointments.filter(
      a => a.status === 'confirmado' || a.status === 'reagendado'
    );
  }, [myAppointments]);

  const historicalApts = useMemo(() => {
    return myAppointments.filter(
      a => a.status === 'cancelado_cliente' || a.status === 'cancelado_profissional' || a.status === 'concluido'
    );
  }, [myAppointments]);

  // Consolation Vouchers
  const myVouchers = useMemo(() => {
    return myAppointments
      .filter(a => a.voucher_consolacao)
      .map(a => ({
        ...a.voucher_consolacao!,
        appointmentId: a.id,
        serviceName: a.servico_nome,
        date: a.data
      }));
  }, [myAppointments]);

  // Calculate available slots for rescheduling
  const rescheduleSlots = useMemo(() => {
    if (!rescheduleModalApt || !newDate) return [];
    return calculateAvailableSlots(
      rescheduleModalApt.servico_id,
      rescheduleModalApt.profissional_id,
      newDate,
      rescheduleModalApt.id
    );
  }, [rescheduleModalApt, newDate, calculateAvailableSlots]);

  // Check cancellation eligibility
  const checkCancellationEligibility = (apt: Appointment) => {
    const now = new Date();
    const aptDateTime = new Date(`${apt.data}T${apt.hora_inicio}:00`);
    const diffHours = (aptDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    return {
      eligible: diffHours >= clinicConfig.antecedencia_minima_cancelamento_horas,
      hoursLeft: Math.max(0, Math.round(diffHours))
    };
  };

  const handleConfirmCancel = () => {
    if (!cancelModalApt) return;
    cancelAppointment(cancelModalApt.id, cancelMotivo);
    setCancelModalApt(null);
    setCancelMotivo('');
  };

  const handleConfirmReschedule = () => {
    if (!rescheduleModalApt || !newDate || !newSlotTime) return;
    rescheduleAppointment(rescheduleModalApt.id, newDate, newSlotTime);
    setRescheduleModalApt(null);
    setNewSlotTime('');
  };

  if (!currentUser) {
    return (
      <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center max-w-lg mx-auto space-y-4">
        <User className="w-12 h-12 text-slate-400 mx-auto" />
        <h3 className="text-xl font-bold text-[#102b38] font-display">Acesso Restrito</h3>
        <p className="text-sm text-slate-500">
          Você precisa estar autenticado como Cliente para acessar seus agendamentos e histórico pessoal.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#176b63] bg-[#e2f2ef] px-2.5 py-1 rounded-full">
            ÁREA DO PACIENTE (RBAC: PRIVILÉGIO MÍNIMO)
          </span>
          <h2 className="text-2xl font-extrabold text-[#102b38] font-display mt-2">
            Meus Agendamentos
          </h2>
          <p className="text-xs text-slate-500">
            Acompanhe suas consultas confirmadas, reagende ou solicite cancelamento conforme antecedência mínima.
          </p>
        </div>

        <button
          onClick={() => setCurrentTab('agendamento')}
          className="bg-[#176b63] hover:bg-[#0d514b] text-white px-5 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Calendar className="w-4 h-4" />
          <span>Nova Consulta</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('ativos')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'ativos'
              ? 'border-[#176b63] text-[#176b63]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Consultas Ativas ({activeApts.length})
        </button>

        <button
          onClick={() => setActiveTab('historico')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'historico'
              ? 'border-[#176b63] text-[#176b63]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Histórico e Canceladas ({historicalApts.length})
        </button>

        <button
          onClick={() => setActiveTab('vouchers')}
          className={`pb-3 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'vouchers'
              ? 'border-[#176b63] text-[#176b63]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Vouchers de Consolação ({myVouchers.length})</span>
        </button>
      </div>

      {/* TAB 1: Active Appointments */}
      {activeTab === 'ativos' && (
        <div className="space-y-4">
          {activeApts.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
              <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="font-bold text-base text-slate-700">Nenhum agendamento futuro ativo</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Você não possui consultas agendadas para os próximos dias. Deseja marcar uma nova consulta?
              </p>
              <button
                onClick={() => setCurrentTab('agendamento')}
                className="inline-block mt-2 bg-[#176b63] text-white px-4 py-2 rounded-xl text-xs font-bold"
              >
                Agendar Agora
              </button>
            </div>
          ) : (
            activeApts.map((apt) => {
              const { eligible, hoursLeft } = checkCancellationEligibility(apt);

              return (
                <div
                  key={apt.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:border-emerald-300 transition space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-400">#{apt.id}</span>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                          apt.status === 'confirmado'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {apt.status === 'confirmado' ? 'Confirmado' : 'Reagendado'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500">
                      Marcado em {new Date(apt.data_criacao).toLocaleDateString('pt-BR')}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">Serviço:</span>
                      <span className="font-bold text-base text-slate-900">{apt.servico_nome}</span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">Profissional:</span>
                      <span className="font-semibold text-sm text-slate-800 flex items-center gap-1.5">
                        <Stethoscope className="w-4 h-4 text-[#176b63]" />
                        {apt.profissional_nome}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">Data & Horário:</span>
                      <span className="font-extrabold text-sm text-[#176b63] flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {apt.data} • {apt.hora_inicio} às {apt.hora_fim}
                      </span>
                    </div>
                  </div>

                  {/* Actions according to rules */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="text-slate-500">
                      {eligible ? (
                        <span className="text-emerald-700 font-medium">
                          ✓ Cancelamento permitido (faltam ~{hoursLeft}h para o atendimento)
                        </span>
                      ) : (
                        <span className="text-amber-700 font-medium">
                          ⚠ Menos de {clinicConfig.antecedencia_minima_cancelamento_horas}h de antecedência (RN09)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setRescheduleModalApt(apt)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-[#176b63]" />
                        <span>Reagendar</span>
                      </button>

                      <button
                        onClick={() => setCancelModalApt(apt)}
                        disabled={!eligible}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                          eligible
                            ? 'border border-red-200 text-red-700 hover:bg-red-50'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                        title={
                          !eligible
                            ? `Exige no mínimo ${clinicConfig.antecedencia_minima_cancelamento_horas}h de antecedência`
                            : undefined
                        }
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancelar Consulta</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: Historical & Cancelled Appointments */}
      {activeTab === 'historico' && (
        <div className="space-y-4">
          <div className="p-3.5 bg-[#e2f2ef]/60 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
            <Info className="w-4 h-4 text-[#176b63] shrink-0" />
            <span>
              <strong>Histórico Preservado:</strong> Cancelamentos ou desativações não excluem registros. Todas as alterações permanecem registradas com data e responsável pela alteração.
            </span>
          </div>

          {historicalApts.map((apt) => (
            <div
              key={apt.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3 opacity-90"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400">#{apt.id}</span>
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      apt.status === 'concluido'
                        ? 'bg-slate-200 text-slate-800'
                        : apt.status === 'cancelado_profissional'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {apt.status === 'cancelado_profissional'
                      ? 'Cancelado pelo Profissional'
                      : apt.status === 'cancelado_cliente'
                      ? 'Cancelado pelo Paciente'
                      : 'Atendimento Concluído'}
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  {apt.data} • {apt.hora_inicio} às {apt.hora_fim}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Serviço & Médico:</span>
                  <span className="font-bold text-slate-800 text-sm">{apt.servico_nome}</span>
                  <div className="text-slate-600">{apt.profissional_nome}</div>
                </div>

                <div className="space-y-1">
                  {apt.motivo_cancelamento && (
                    <div>
                      <span className="text-slate-400 block font-medium">Motivo do Cancelamento:</span>
                      <span className="text-slate-700 italic">"{apt.motivo_cancelamento}"</span>
                    </div>
                  )}
                  {apt.responsavel_alteracao && (
                    <div className="text-[11px] text-slate-500">
                      Alterado por: <strong className="text-slate-700">{apt.responsavel_alteracao}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* RN10: Voucher awarded box */}
              {apt.voucher_consolacao && (
                <div className="mt-3 p-3 bg-purple-50 rounded-xl border border-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-bold text-purple-900 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-purple-700" />
                      Cupom de Consolação Gerado: {apt.voucher_consolacao.codigo}
                    </span>
                    <span className="text-purple-700 text-[11px]">
                      {apt.voucher_consolacao.desconto_percentual}% de desconto concedido automaticamente pelo cancelamento do profissional.
                    </span>
                  </div>
                  <button
                    onClick={() => setCurrentTab('agendamento')}
                    className="bg-purple-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs hover:bg-purple-800 transition shrink-0"
                  >
                    Reagendar com Desconto
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: Consolation Vouchers */}
      {activeTab === 'vouchers' && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
            <strong className="font-bold">Política de Consolação por Cancelamento Profissional:</strong>
            <p>
              Quando um profissional precisa desmarcar sua consulta por imprevisto ou urgência hospitalar,
              o CliniFlow emite automaticamente um cupom de compensação para você utilizar na sua próxima reserva.
            </p>
          </div>

          {myVouchers.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-2">
              <Tag className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-700">Nenhum cupom ativo no momento</h4>
              <p className="text-xs text-slate-400">
                Você não possui cancelamentos gerados por profissionais pendentes de consolação.
              </p>
            </div>
          ) : (
            myVouchers.map((v, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border-2 border-dashed border-amber-300 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-lg text-amber-800 bg-amber-100 px-3 py-1 rounded-lg">
                      {v.codigo}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      {v.desconto_percentual}% OFF
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    {v.descricao}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Originado do cancelamento da consulta de {v.serviceName}
                  </p>
                </div>

                <button
                  onClick={() => setCurrentTab('agendamento')}
                  className="bg-[#176b63] hover:bg-[#0d514b] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shrink-0"
                >
                  Usar em Nova Consulta
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* CANCEL MODAL */}
      {cancelModalApt && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center gap-2 text-red-600 font-bold text-lg">
              <AlertTriangle className="w-5 h-5" />
              <span>Confirmar Cancelamento</span>
            </div>

            <p className="text-xs text-slate-600">
              Você está cancelando o agendamento de <strong>{cancelModalApt.servico_nome}</strong> no dia{' '}
              <strong>{cancelModalApt.data} às {cancelModalApt.hora_inicio}</strong>.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Motivo do Cancelamento (opcional):
              </label>
              <textarea
                value={cancelMotivo}
                onChange={(e) => setCancelMotivo(e.target.value)}
                placeholder="Ex: Imprevisto de trabalho, melhora dos sintomas..."
                className="w-full border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-red-500"
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
                onClick={handleConfirmCancel}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition"
              >
                Confirmar Cancelamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESCHEDULE MODAL*/}
      {rescheduleModalApt && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-[#102b38] font-display">
                  Reagendar Atendimento
                </h3>
                <p className="text-xs text-slate-500">
                  {rescheduleModalApt.servico_nome} com {rescheduleModalApt.profissional_nome}
                </p>
              </div>
              <button
                onClick={() => setRescheduleModalApt(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Pick new date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Selecione a Nova Data:
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={newDate}
                onChange={(e) => {
                  setNewDate(e.target.value);
                  setNewSlotTime('');
                }}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#176b63]"
              />
            </div>

            {/* Slots */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Horários Disponíveis para {newDate}:
              </label>
              {rescheduleSlots.filter(s => s.disponivel).length === 0 ? (
                <div className="p-4 text-center bg-slate-50 rounded-xl text-xs text-slate-500">
                  Nenhum horário livre com este profissional na data selecionada.
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {rescheduleSlots.filter(s => s.disponivel).map((slot) => (
                    <button
                      key={slot.hora_inicio}
                      onClick={() => setNewSlotTime(slot.hora_inicio)}
                      className={`p-2 rounded-lg text-xs font-bold text-center border transition ${
                        newSlotTime === slot.hora_inicio
                          ? 'bg-[#176b63] text-white border-[#176b63]'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-[#176b63]'
                      }`}
                    >
                      {slot.hora_inicio}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setRescheduleModalApt(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmReschedule}
                disabled={!newSlotTime}
                className="px-5 py-2 bg-[#176b63] hover:bg-[#0d514b] disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-bold transition"
              >
                Confirmar Reagendamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
