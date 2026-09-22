import React from 'react';
import { Search, CalendarCheck2, LayoutDashboard } from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  return (
    <section id="como-funciona" className="py-20 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#176b63] bg-[#e2f2ef] px-3 py-1 rounded-full">
              FLUXO INTELIGENTE
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#102b38] font-display">
              Do horário disponível ao atendimento em <span className="text-[#176b63]">três passos.</span>
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              O fluxo de marcação foi arquitetado para eliminar o atrito das trocas de mensagens manuais,
              mantendo a integridade da agenda dos profissionais e a flexibilidade do paciente.
            </p>
          </div>

          <div className="lg:col-span-7 space-y-6">
            {/* Step 1 */}
            <div className="flex gap-5 p-6 rounded-2xl bg-[#f6f8fb] border border-slate-200">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#176b63] text-white flex items-center justify-center font-bold text-lg font-display shadow-sm">
                01
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[#102b38] font-display flex items-center gap-2">
                  <Search className="w-4 h-4 text-[#176b63]" />
                  Encontre e Consulte
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  O paciente consulta serviços, categorias, especialistas e horários livres em tempo real,
                  sem obrigatoriedade de cadastro inicial para pesquisa.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-5 p-6 rounded-2xl bg-[#f6f8fb] border border-slate-200">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#102b38] text-white flex items-center justify-center font-bold text-lg font-display shadow-sm">
                02
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[#102b38] font-display flex items-center gap-2">
                  <CalendarCheck2 className="w-4 h-4 text-[#102b38]" />
                  Autentique e Agende
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Ao escolher o horário ideal, o paciente autentica-se com segurança ou cadastra-se rapidamente
                  (validando e-mail único), gerando o agendamento confirmado no sistema.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-5 p-6 rounded-2xl bg-[#f6f8fb] border border-slate-200">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#d9a441] text-white flex items-center justify-center font-bold text-lg font-display shadow-sm">
                03
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[#102b38] font-display flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4 text-[#d9a441]" />
                  Acompanhe e Gerencie
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Clientes gerenciam seus horários; médicos visualizam suas agendas e pausas; administradores
                  monitoram o desempenho clínico global com regras de negócio blindadas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
