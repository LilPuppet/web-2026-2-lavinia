import React, { useState, useMemo } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Tag,
  ShieldAlert,
  Info
} from 'lucide-react';

export const ClientBookingFlow: React.FC = () => {
  const {
    activeServices,
    activeProfessionals,
    getProfessionalsForService,
    getServiceById,
    getProfessionalById,
    calculateAvailableSlots,
    bookAppointment,
    currentUser,
    openAuthModal,
    setCurrentTab,
    appointments,
    clinicConfig
  } = useClinic();

  // Booking Flow Steps: 1: Service -> 2: Professional -> 3: Date & Slot -> 4: Review
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Selections
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>('');
  
  // Date selection (default to tomorrow or nearest weekday)
  const getInitialDateStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };
  const [selectedDate, setSelectedDate] = useState<string>(getInitialDateStr());
  const [selectedSlotTime, setSelectedSlotTime] = useState<string>('');

  // Voucher application
  const [appliedVoucher, setAppliedVoucher] = useState<string>('');
  const [voucherError, setVoucherError] = useState<string>('');

  // Booking result
  const [bookingSuccessData, setBookingSuccessData] = useState<any>(null);

  // Filtered services
  const categories = useMemo(() => {
    const cats = new Set(activeServices.map(s => s.categoria));
    return ['todos', ...Array.from(cats)];
  }, [activeServices]);

  const filteredServices = useMemo(() => {
    if (selectedCategory === 'todos') return activeServices;
    return activeServices.filter(s => s.categoria === selectedCategory);
  }, [activeServices, selectedCategory]);

  // Enabled professionals for selected service
  const availableProfessionals = useMemo(() => {
    if (!selectedServiceId) return [];
    return getProfessionalsForService(selectedServiceId);
  }, [selectedServiceId, getProfessionalsForService]);

  // Slots for chosen date and professional
  const availableSlots = useMemo(() => {
    if (!selectedServiceId || !selectedProfessionalId || !selectedDate) return [];
    return calculateAvailableSlots(selectedServiceId, selectedProfessionalId, selectedDate);
  }, [selectedServiceId, selectedProfessionalId, selectedDate, calculateAvailableSlots]);

  // Selected entities
  const currentService = getServiceById(selectedServiceId);
  const currentProfessional = getProfessionalById(selectedProfessionalId);

  // Check if current user has an unredeemed voucher from doctor cancellation
  const clientAvailableVouchers = useMemo(() => {
    if (!currentUser || currentUser.tipo !== 'cliente') return [];
    return appointments
      .filter(a => a.cliente_id === currentUser.id && a.voucher_consolacao && !a.voucher_consolacao.utilizado)
      .map(a => a.voucher_consolacao!);
  }, [currentUser, appointments]);

  // Handle final confirmation
  const handleConfirmBooking = () => {
    if (!currentUser) {
      // Prompt login or account creation
      openAuthModal('login', () => {
        // Will be resumed after login
      });
      return;
    }

    const result = bookAppointment(
      selectedServiceId,
      selectedProfessionalId,
      selectedDate,
      selectedSlotTime
    );

    if (result.success) {
      setBookingSuccessData(result.appointment);
    }
  };

  // Reset flow
  const handleResetFlow = () => {
    setStep(1);
    setSelectedServiceId('');
    setSelectedProfessionalId('');
    setSelectedSlotTime('');
    setBookingSuccessData(null);
  };

  // Today string for min date
  const todayStr = new Date().toISOString().split('T')[0];

  if (bookingSuccessData) {
    return (
      <div className="max-w-2xl mx-auto my-8 bg-white rounded-2xl p-8 border border-emerald-200 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-100 text-[#176b63] rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            AGENDAMENTO CONFIRMADO
          </span>
          <h2 className="text-2xl font-extrabold text-[#102b38] font-display">
            Consulta marcada com sucesso!
          </h2>
          <p className="text-sm text-slate-600">
            Seu agendamento foi registrado com segurança e os horários foram bloqueados no sistema.
          </p>
        </div>

        {/* Appointment Card Details */}
        <div className="p-6 bg-[#f6f8fb] rounded-xl border border-slate-200 text-left space-y-3 text-sm">
          <div className="flex justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-500">Protocolo:</span>
            <span className="font-mono font-bold text-slate-800">{bookingSuccessData.id}</span>
          </div>
          <div className="flex justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-500">Serviço:</span>
            <span className="font-semibold text-slate-900">{bookingSuccessData.servico_nome}</span>
          </div>
          <div className="flex justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-500">Profissional:</span>
            <span className="font-semibold text-slate-900">{bookingSuccessData.profissional_nome}</span>
          </div>
          <div className="flex justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-500">Data & Horário:</span>
            <span className="font-bold text-[#176b63]">
              {bookingSuccessData.data} às {bookingSuccessData.hora_inicio} até {bookingSuccessData.hora_fim}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Paciente:</span>
            <span className="font-semibold text-slate-900">{bookingSuccessData.cliente_nome}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => setCurrentTab('meus-agendamentos')}
            className="bg-[#176b63] hover:bg-[#0d514b] text-white px-6 py-2.5 rounded-xl font-bold text-sm transition"
          >
            Ver Meus Agendamentos
          </button>
          <button
            onClick={handleResetFlow}
            className="border border-slate-300 text-slate-700 hover:bg-slate-50 px-6 py-2.5 rounded-xl font-semibold text-sm transition"
          >
            Fazer Novo Agendamento
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header & Steps Breadcrumb */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-[#102b38] font-display">
              Agendamento de Consultas & Procedimentos
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Consulta pública de horários • Validação de conflitos e disponibilidades em tempo real
            </p>
          </div>

          {!currentUser && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Modo Visitante:</strong> Consulta livre. Solicitará login ao confirmar.
              </span>
            </div>
          )}
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={() => setStep(1)}
            className={`flex items-center gap-2 p-2 rounded-lg text-xs font-semibold transition text-left ${
              step === 1 ? 'bg-[#e2f2ef] text-[#176b63]' : step > 1 ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-400'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-current text-white flex items-center justify-center text-[10px] shrink-0">
              1
            </span>
            <span className="hidden sm:inline">Serviço</span>
          </button>

          <button
            onClick={() => selectedServiceId && setStep(2)}
            disabled={!selectedServiceId}
            className={`flex items-center gap-2 p-2 rounded-lg text-xs font-semibold transition text-left ${
              step === 2 ? 'bg-[#e2f2ef] text-[#176b63]' : step > 2 ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-400'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-current text-white flex items-center justify-center text-[10px] shrink-0">
              2
            </span>
            <span className="hidden sm:inline">Profissional</span>
          </button>

          <button
            onClick={() => selectedServiceId && selectedProfessionalId && setStep(3)}
            disabled={!selectedServiceId || !selectedProfessionalId}
            className={`flex items-center gap-2 p-2 rounded-lg text-xs font-semibold transition text-left ${
              step === 3 ? 'bg-[#e2f2ef] text-[#176b63]' : step > 3 ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-400'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-current text-white flex items-center justify-center text-[10px] shrink-0">
              3
            </span>
            <span className="hidden sm:inline">Data e Horário</span>
          </button>

          <button
            onClick={() => selectedServiceId && selectedProfessionalId && selectedSlotTime && setStep(4)}
            disabled={!selectedSlotTime}
            className={`flex items-center gap-2 p-2 rounded-lg text-xs font-semibold transition text-left ${
              step === 4 ? 'bg-[#e2f2ef] text-[#176b63]' : 'text-slate-400'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-current text-white flex items-center justify-center text-[10px] shrink-0">
              4
            </span>
            <span className="hidden sm:inline">Revisão</span>
          </button>
        </div>
      </div>

      {/* STEP 1: Choose Service */}
      {step === 1 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-[#102b38] font-display">
                Passo 1: Selecione o Serviço Clínico Desejado
              </h3>
              <p className="text-xs text-slate-500">
                Cada serviço possui duração definida em minutos para cálculo dos horários.
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition ${
                    selectedCategory === cat
                      ? 'bg-[#176b63] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {filteredServices.map((serv) => {
              const isSelected = selectedServiceId === serv.id;
              const enabledProfs = getProfessionalsForService(serv.id);

              return (
                <div
                  key={serv.id}
                  onClick={() => {
                    setSelectedServiceId(serv.id);
                    // Preselect professional if only one is enabled
                    if (enabledProfs.length === 1) {
                      setSelectedProfessionalId(enabledProfs[0].id);
                    } else if (selectedProfessionalId && !enabledProfs.some(p => p.id === selectedProfessionalId)) {
                      setSelectedProfessionalId('');
                    }
                  }}
                  className={`p-5 rounded-xl border-2 transition cursor-pointer flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'border-[#176b63] bg-[#e2f2ef]/40 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {serv.categoria}
                      </span>
                      <span className="text-xs font-bold text-[#176b63] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {serv.duracao_minutos} min
                      </span>
                    </div>
                    <h4 className="font-bold text-base text-[#102b38]">
                      {serv.nome}
                    </h4>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {serv.descricao}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 font-medium">Valor: </span>
                      <span className="font-extrabold text-sm text-slate-800">
                        R$ {serv.preco.toFixed(2)}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {enabledProfs.length} {enabledProfs.length === 1 ? 'médico habilitado' : 'médicos habilitados'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setStep(2)}
              disabled={!selectedServiceId}
              className="inline-flex items-center gap-2 bg-[#176b63] hover:bg-[#0d514b] disabled:bg-slate-200 disabled:text-slate-400 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition"
            >
              <span>Avançar para Profissional</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Choose Professional */}
      {step === 2 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-bold text-[#102b38] font-display">
              Passo 2: Escolha o Profissional Habilitado
            </h3>
            <p className="text-xs text-slate-500">
              Apenas profissionais formalmente vinculados ao serviço selecionado podem atender este agendamento.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {availableProfessionals.map((prof) => {
              const isSelected = selectedProfessionalId === prof.id;

              return (
                <div
                  key={prof.id}
                  onClick={() => setSelectedProfessionalId(prof.id)}
                  className={`p-5 rounded-xl border-2 transition cursor-pointer flex gap-4 ${
                    isSelected
                      ? 'border-[#176b63] bg-[#e2f2ef]/40 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  {prof.avatar ? (
                    <img
                      src={prof.avatar}
                      alt={prof.nome}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-slate-200 flex items-center justify-center font-bold text-slate-600 shrink-0">
                      <Stethoscope className="w-8 h-8 text-slate-400" />
                    </div>
                  )}

                  <div className="space-y-1">
                    <h4 className="font-bold text-base text-[#102b38]">
                      {prof.nome}
                    </h4>
                    <div className="text-xs font-semibold text-[#176b63]">
                      {prof.especialidade}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {prof.registro_profissional}
                    </div>
                    {prof.bio && (
                      <p className="text-[11px] text-slate-500 line-clamp-2 pt-1">
                        {prof.bio}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-2 border border-slate-300 text-slate-700 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-slate-50 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Serviço</span>
            </button>

            <button
              onClick={() => setStep(3)}
              disabled={!selectedProfessionalId}
              className="inline-flex items-center gap-2 bg-[#176b63] hover:bg-[#0d514b] disabled:bg-slate-200 disabled:text-slate-400 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition"
            >
              <span>Avançar para Horários</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Choose Date & Available Slots */}
      {step === 3 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-bold text-[#102b38] font-display">
              Passo 3: Escolha a Data e Horário Disponível
            </h3>
            <p className="text-xs text-slate-500">
              Horários calculados considerando disponibilidade semanal, duração de {currentService?.duracao_minutos}min, sem conflitos e sem bloqueios.
            </p>
          </div>

          {/* Date Picker Input */}
          <div className="p-4 bg-[#f6f8fb] rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Data do Atendimento (não permite passado)
              </label>
              <input
                type="date"
                min={todayStr}
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedSlotTime('');
                }}
                className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#176b63]"
              />
            </div>

            <div className="text-xs text-slate-600 sm:text-right">
              <span className="font-semibold text-slate-800">Profissional selecionado:</span>
              <div>{currentProfessional?.nome}</div>
              <div className="text-[11px] text-slate-500">{currentService?.nome}</div>
            </div>
          </div>

          {/* Slots Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-[#102b38]">
                Horários Gerados para {selectedDate}:
              </h4>
              <span className="text-xs text-slate-500">
                {availableSlots.filter(s => s.disponivel).length} horários livres encontrados
              </span>
            </div>

            {availableSlots.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                <div className="font-bold text-sm text-slate-700">
                  Nenhum horário de atendimento disponível para esta data
                </div>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  O profissional não possui disponibilidade cadastrada para este dia da semana ou todos os horários estão preenchidos. Por favor, selecione outra data.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                {availableSlots.map((slot) => {
                  const isSelected = selectedSlotTime === slot.hora_inicio;

                  if (!slot.disponivel) {
                    return (
                      <div
                        key={slot.hora_inicio}
                        className="p-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-400 text-center cursor-not-allowed opacity-60"
                        title={slot.motivo_indisponibilidade}
                      >
                        <div className="font-bold text-xs line-through">{slot.hora_inicio}</div>
                        <div className="text-[9px] truncate">{slot.motivo_indisponibilidade?.split(' ')[0]}</div>
                      </div>
                    );
                  }

                  return (
                    <button
                      key={slot.hora_inicio}
                      onClick={() => setSelectedSlotTime(slot.hora_inicio)}
                      className={`p-2.5 rounded-xl border text-center transition font-bold text-xs ${
                        isSelected
                          ? 'bg-[#176b63] text-white border-[#176b63] shadow-sm'
                          : 'bg-white text-slate-800 border-slate-300 hover:border-[#176b63] hover:bg-[#e2f2ef]/50'
                      }`}
                    >
                      <div>{slot.hora_inicio}</div>
                      <div className={`text-[10px] font-normal ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                        até {slot.hora_fim}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 border border-slate-300 text-slate-700 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-slate-50 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Profissional</span>
            </button>

            <button
              onClick={() => setStep(4)}
              disabled={!selectedSlotTime}
              className="inline-flex items-center gap-2 bg-[#176b63] hover:bg-[#0d514b] disabled:bg-slate-200 disabled:text-slate-400 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition"
            >
              <span>Revisar e Confirmar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Review & Confirm Booking */}
      {step === 4 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-bold text-[#102b38] font-display">
              Passo 4: Revise e Confirme o seu Agendamento
            </h3>
            <p className="text-xs text-slate-500">
              Verifique as informações antes de finalizar. O agendamento é validado instantaneamente contra regras de conflito.
            </p>
          </div>

          {/* Details Card */}
          <div className="bg-[#f6f8fb] rounded-xl p-6 border border-slate-200 space-y-4 text-sm">
            <div className="grid sm:grid-cols-2 gap-4 pb-4 border-b border-slate-200">
              <div>
                <span className="text-xs text-slate-500 block">Serviço:</span>
                <span className="font-bold text-slate-900 text-base">{currentService?.nome}</span>
                <div className="text-xs text-slate-500 mt-0.5">
                  Duração: {currentService?.duracao_minutos} minutos
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-500 block">Profissional de Saúde:</span>
                <span className="font-bold text-slate-900 text-base">{currentProfessional?.nome}</span>
                <div className="text-xs text-[#176b63] font-semibold mt-0.5">
                  {currentProfessional?.especialidade} • {currentProfessional?.registro_profissional}
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pb-4 border-b border-slate-200">
              <div>
                <span className="text-xs text-slate-500 block">Data e Horário:</span>
                <span className="font-extrabold text-[#176b63] text-base">
                  {selectedDate} das {selectedSlotTime} até{' '}
                  {availableSlots.find(s => s.hora_inicio === selectedSlotTime)?.hora_fim}
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-500 block">Local de Atendimento:</span>
                <span className="font-medium text-slate-800">
                  {clinicConfig.nome}
                </span>
                <div className="text-[11px] text-slate-500">{clinicConfig.endereco}</div>
              </div>
            </div>

            {/* Patient identity check */}
            <div className="pt-1">
              <span className="text-xs text-slate-500 block">Dados do Paciente:</span>
              {currentUser ? (
                <div className="flex items-center gap-3 mt-1.5 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <User className="w-5 h-5 text-emerald-700" />
                  <div>
                    <div className="font-bold text-slate-900">{currentUser.nome}</div>
                    <div className="text-xs text-slate-600">
                      {currentUser.email} • {currentUser.telefone}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-1.5 p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-3">
                  <div className="flex items-start gap-2 text-xs text-amber-900">
                    <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <strong>Autenticação Obrigatória para Confirmação:</strong>
                      <p className="text-slate-600 mt-0.5">
                        A consulta de vagas é livre, porém para registrar o agendamento você deve acessar sua conta ou cadastrar-se rapidamente.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openAuthModal('login')}
                      className="bg-[#102b38] hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-lg transition"
                    >
                      Já tenho conta (Entrar)
                    </button>
                    <button
                      onClick={() => openAuthModal('register')}
                      className="bg-[#176b63] hover:bg-[#0d514b] text-white text-xs font-bold px-4 py-2 rounded-lg transition"
                    >
                      Criar Conta com E-mail Único
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Consolation Voucher Notice if applicable */}
            {clientAvailableVouchers.length > 0 && (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-amber-900">
                  <Tag className="w-4 h-4 text-amber-700" />
                  <span>
                    Você possui um voucher de cortesia de <strong>20% de desconto</strong> emitido por cancelamento médico anterior: <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-amber-300 font-bold">{clientAvailableVouchers[0].codigo}</code>
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-2 border border-slate-300 text-slate-700 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-slate-50 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar aos Horários</span>
            </button>

            <button
              onClick={handleConfirmBooking}
              className="inline-flex items-center gap-2 bg-[#176b63] hover:bg-[#0d514b] text-white px-8 py-3 rounded-xl font-bold text-sm shadow-md transition"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Confirmar Agendamento</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
