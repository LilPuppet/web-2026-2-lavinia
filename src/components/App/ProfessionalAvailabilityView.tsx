import React, { useState, useMemo } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { DayOfWeek } from '../../types';
import {
  Clock,
  Calendar,
  Plus,
  Trash2,
  CheckCircle2,
  AlertOctagon,
  ShieldCheck,
  Stethoscope,
  Info
} from 'lucide-react';

export const ProfessionalAvailabilityView: React.FC = () => {
  const {
    currentUser,
    professionals,
    availabilities,
    blocks,
    updateProfessionalAvailability,
    addScheduleBlock,
    removeScheduleBlock
  } = useClinic();

  const professional = useMemo(() => {
    if (!currentUser) return professionals[0];
    if (currentUser.tipo === 'profissional') {
      return professionals.find(p => p.id === currentUser.profissional_id || p.email === currentUser.email) || professionals[0];
    }
    return professionals[0];
  }, [currentUser, professionals]);

  // Days of week labels (0 = Domingo to 6 = Sábado)
  const daysOfWeekMap = [
    { dia: 0, nome: 'Domingo' },
    { dia: 1, nome: 'Segunda-feira' },
    { dia: 2, nome: 'Terça-feira' },
    { dia: 3, nome: 'Quarta-feira' },
    { dia: 4, nome: 'Quinta-feira' },
    { dia: 5, nome: 'Sexta-feira' },
    { dia: 6, nome: 'Sábado' }
  ];

  // Professional's availabilities
  const profAvailabilities = useMemo(() => {
    return availabilities.filter(a => a.profissional_id === professional?.id);
  }, [availabilities, professional]);

  // Professional's blocks
  const profBlocks = useMemo(() => {
    return blocks.filter(b => b.profissional_id === professional?.id);
  }, [blocks, professional]);

  // New Block Form State
  const [newBlockDate, setNewBlockDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [newBlockStart, setNewBlockStart] = useState('14:00');
  const [newBlockEnd, setNewBlockEnd] = useState('16:00');
  const [newBlockReason, setNewBlockReason] = useState('Reunião clínica / Pausa acadêmica');

  const handleAddBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!professional) return;
    addScheduleBlock(professional.id, newBlockDate, newBlockStart, newBlockEnd, newBlockReason);
    setNewBlockReason('');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#176b63] bg-[#e2f2ef] px-2.5 py-0.5 rounded-full">
          GESTÃO DE HORÁRIOS & CAPACIDADE
        </span>
        <h2 className="text-2xl font-extrabold text-[#102b38] font-display mt-2">
          Disponibilidade Semanal & Bloqueios de Agenda
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Configuração da grade de atendimento de <strong>{professional?.nome}</strong> ({professional?.especialidade}).
        </p>
      </div>

      {/* Weekly Availability Config */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-[#102b38] font-display">
              Grade Semanal de Trabalho
            </h3>
            <p className="text-xs text-slate-500">
              O sistema gera blocos automáticos para agendamento apenas dentro destes períodos ativos.
            </p>
          </div>
          <div className="text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Validação de slots ativa</span>
          </div>
        </div>

        <div className="space-y-3">
          {daysOfWeekMap.map(({ dia, nome }) => {
            const avail = profAvailabilities.find(a => a.dia_semana === dia);
            const isActive = avail ? avail.ativo : false;
            const start = avail ? avail.hora_inicio : '08:00';
            const end = avail ? avail.hora_fim : '18:00';

            return (
              <div
                key={dia}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
                  isActive
                    ? 'bg-white border-slate-200 hover:border-emerald-300'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3 w-44">
                  <input
                    type="checkbox"
                    id={`day-${dia}`}
                    checked={isActive}
                    onChange={(e) => {
                      if (!professional) return;
                      updateProfessionalAvailability(professional.id, dia, start, end, e.target.checked);
                    }}
                    className="w-4 h-4 rounded text-[#176b63] focus:ring-[#176b63]"
                  />
                  <label htmlFor={`day-${dia}`} className="font-bold text-sm text-slate-800 cursor-pointer">
                    {nome}
                  </label>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs">
                  {isActive ? (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-medium">Início:</span>
                        <input
                          type="time"
                          value={start}
                          onChange={(e) => {
                            if (!professional) return;
                            updateProfessionalAvailability(professional.id, dia, e.target.value, end, true);
                          }}
                          className="bg-[#f6f8fb] border border-slate-300 rounded-lg px-2 py-1 font-bold text-slate-800"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-medium">Término:</span>
                        <input
                          type="time"
                          value={end}
                          onChange={(e) => {
                            if (!professional) return;
                            updateProfessionalAvailability(professional.id, dia, start, e.target.value, true);
                          }}
                          className="bg-[#f6f8fb] border border-slate-300 rounded-lg px-2 py-1 font-bold text-slate-800"
                        />
                      </div>

                      <div className="text-[11px] text-slate-400">
                        Intervalo de almoço padrão: 12h às 13h
                      </div>
                    </>
                  ) : (
                    <span className="text-xs text-slate-400 italic">
                      Não há atendimento clínico cadastrado para este dia
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Schedule Blocks (Ausências, almoços, congressos) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
        <div>
          <h3 className="text-lg font-bold text-[#102b38] font-display">
            Bloqueios Pontuais de Horário
          </h3>
          <p className="text-xs text-slate-500">
            Horários bloqueados tornam-se imediatamente indisponíveis para agendamentos de clientes, impedindo sobreposição.
          </p>
        </div>

        {/* Add Block Form */}
        <form onSubmit={handleAddBlock} className="p-4 bg-[#f6f8fb] rounded-xl border border-slate-200 space-y-4">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Adicionar Novo Bloqueio de Ausência:
          </div>

          <div className="grid sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-slate-600 mb-1">Data do Bloqueio:</label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={newBlockDate}
                onChange={(e) => setNewBlockDate(e.target.value)}
                required
                className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1">Hora Inicial:</label>
              <input
                type="time"
                value={newBlockStart}
                onChange={(e) => setNewBlockStart(e.target.value)}
                required
                className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1">Hora Final:</label>
              <input
                type="time"
                value={newBlockEnd}
                onChange={(e) => setNewBlockEnd(e.target.value)}
                required
                className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1">Motivo do Bloqueio:</label>
              <input
                type="text"
                value={newBlockReason}
                onChange={(e) => setNewBlockReason(e.target.value)}
                required
                placeholder="Ex: Almoço prolongado, Congresso..."
                className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 bg-[#176b63] hover:bg-[#0d514b] text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Bloqueio</span>
            </button>
          </div>
        </form>

        {/* Existing Blocks List */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-700">
            Bloqueios Ativos Cadastrados:
          </div>

          {profBlocks.length === 0 ? (
            <div className="p-4 text-center bg-slate-50 rounded-xl text-xs text-slate-400">
              Nenhum bloqueio cadastrado para este profissional. Toda a grade semanal permanece liberada.
            </div>
          ) : (
            profBlocks.map((block) => (
              <div
                key={block.id}
                className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 flex items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
                    <AlertOctagon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-amber-950">
                      {block.data} • {block.hora_inicio} às {block.hora_fim}
                    </div>
                    <div className="text-amber-800">{block.motivo}</div>
                  </div>
                </div>

                <button
                  onClick={() => removeScheduleBlock(block.id)}
                  className="text-red-600 hover:text-red-800 p-1.5 rounded-lg hover:bg-red-50 transition"
                  title="Remover Bloqueio"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
