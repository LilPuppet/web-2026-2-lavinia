import React from 'react';
import { Layers, AlertTriangle, MessageSquareOff } from 'lucide-react';

export const ProblemSection: React.FC = () => {
  return (
    <section id="problema" className="py-20 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#176b63] bg-[#e2f2ef] px-3 py-1 rounded-full">
            O PROBLEMA
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#102b38] font-display">
            Menos conversa manual. <br />
            <span className="text-[#176b63]">Mais tempo para atender.</span>
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Quando a agenda depende de planilhas manuais, anotações de papel e mensagens espalhadas pelo WhatsApp,
            pequenos desencontros transformam-se em conflitos sérios de horários e perda de faturamento.
          </p>
        </div>

        <div className="mt-14 grid md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="p-8 rounded-2xl bg-[#f6f8fb] border border-slate-200/90 hover:border-emerald-300 transition duration-300 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-[#176b63] flex items-center justify-center font-bold text-xl">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#102b38] font-display">
              Agendas pouco integradas
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Informações fragmentadas entre recepcionistas e profissionais dificultam a visualização dos horários
              reais e sobrecarregam a equipe com tarefas repetitivas.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-2xl bg-[#f6f8fb] border border-slate-200/90 hover:border-amber-300 transition duration-300 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-[#d9a441] flex items-center justify-center font-bold text-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#102b38] font-display">
              Conflitos de horários
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Dupla marcação no mesmo horário para o mesmo médico ou atendimento marcado fora do expediente. O CliniFlow
              aplica regras de negócio automatizadas para impedir agendamentos inválidos.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-2xl bg-[#f6f8fb] border border-slate-200/90 hover:border-blue-300 transition duration-300 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xl">
              <MessageSquareOff className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#102b38] font-display">
              Comunicação excessiva
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              O cliente encontra serviços, profissionais e horários disponíveis em tempo real sem depender de longas
              trocas de mensagens manuais para encontrar uma vaga.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
