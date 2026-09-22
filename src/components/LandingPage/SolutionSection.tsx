import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import { CalendarCheck, UserCog, Settings, RefreshCw, History, CheckCheck, ArrowRight } from 'lucide-react';

export const SolutionSection: React.FC = () => {
  const { setViewMode, setCurrentTab } = useClinic();

  return (
    <section id="funcionalidades" className="py-20 bg-[#f6f8fb]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#176b63] bg-[#e2f2ef] px-3 py-1 rounded-full">
            A SOLUÇÃO CLÍNICA
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#102b38] font-display">
            Uma agenda centralizada para <br />
            <span className="text-[#176b63]">toda a sua clínica.</span>
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            O CliniFlow reúne todas as etapas do processo de agendamento em um único ambiente integrado,
            com permissões estritas para Clientes, Profissionais e Administradores.
          </p>
        </div>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1: Cliente */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition space-y-3">
            <div className="flex items-center justify-between">
              <span className="p-2.5 rounded-xl bg-[#e2f2ef] text-[#176b63]">
                <CalendarCheck className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 uppercase">
                CLIENTE
              </span>
            </div>
            <h3 className="text-lg font-bold text-[#102b38] font-display">
              Agendamento simplificado
            </h3>
            <p className="text-sm text-slate-600">
              Consulte serviços, profissionais e horários disponíveis sem login. Crie sua conta com e-mail único
              e confirme o atendimento de forma ágil.
            </p>
          </div>

          {/* Feature 2: Profissional */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition space-y-3">
            <div className="flex items-center justify-between">
              <span className="p-2.5 rounded-xl bg-blue-50 text-blue-700">
                <UserCog className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 uppercase">
                PROFISSIONAL
              </span>
            </div>
            <h3 className="text-lg font-bold text-[#102b38] font-display">
              Agenda sob controle
            </h3>
            <p className="text-sm text-slate-600">
              Defina horários de disponibilidade semanal em blocos, configure pausas de almoço, registre bloqueios
              de ausência e gerencie apenas seus pacientes.
            </p>
          </div>

          {/* Feature 3: Administrador */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition space-y-3">
            <div className="flex items-center justify-between">
              <span className="p-2.5 rounded-xl bg-purple-50 text-purple-700">
                <Settings className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 uppercase">
                ADMINISTRADOR
              </span>
            </div>
            <h3 className="text-lg font-bold text-[#102b38] font-display">
              Gestão administrativa
            </h3>
            <p className="text-sm text-slate-600">
              Cadastre e gerencie profissionais, serviços e associações. Configure parâmetros como
              antecedência mínima e regras de funcionamento global da clínica.
            </p>
          </div>

          {/* Feature 4: Flexibilidade */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition space-y-3">
            <div className="flex items-center justify-between">
              <span className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
                <RefreshCw className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 uppercase">
                FLEXIBILIDADE
              </span>
            </div>
            <h3 className="text-lg font-bold text-[#102b38] font-display">
              Cancelamento & Reagendamento
            </h3>
            <p className="text-sm text-slate-600">
              Cancelamento pelo paciente com prazo mínimo de antecedência. Cancelamento pelo médico com geração
              automática de cupom de desconto de consolação.
            </p>
          </div>

          {/* Feature 5: Histórico */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition space-y-3">
            <div className="flex items-center justify-between">
              <span className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
                <History className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 uppercase">
                ORGANIZAÇÃO
              </span>
            </div>
            <h3 className="text-lg font-bold text-[#102b38] font-display">
              Histórico preservado
            </h3>
            <p className="text-sm text-slate-600">
              Cancelamentos e desativações nunca apagam registros. Dados históricos permanecem auditados no sistema
              com responsável e data de alteração.
            </p>
          </div>

          {/* Feature 6: Regras */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition space-y-3">
            <div className="flex items-center justify-between">
              <span className="p-2.5 rounded-xl bg-teal-50 text-teal-700">
                <CheckCheck className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 uppercase">
                MOTOR DE REGRAS
              </span>
            </div>
            <h3 className="text-lg font-bold text-[#102b38] font-display">
              Horários realmente disponíveis
            </h3>
            <p className="text-sm text-slate-600">
              O motor considera disponibilidade do médico + duração do serviço + horários livres +
              ausência de bloqueios antes de oferecer qualquer slot.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={() => {
              setViewMode('app');
              setCurrentTab('agendamento');
            }}
            className="inline-flex items-center gap-2 bg-[#176b63] hover:bg-[#0d514b] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md transition"
          >
            <span>Experimentar Agendamento Interativo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
