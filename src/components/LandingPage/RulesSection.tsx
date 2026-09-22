import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import { BUSINESS_RULES_LIST } from '../../data/mockData';
import { ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';

export const RulesSection: React.FC = () => {
  const { openRuleDetail, setRulesModalOpen } = useClinic();

  return (
    <section id="seguranca" className="py-20 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#176b63] bg-[#e2f2ef] px-3 py-1 rounded-full">
              REGRAS DE NEGÓCIO & CONFIABILIDADE
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#102b38] font-display">
              Não é apenas um calendário. <br />
              <span className="text-[#176b63]">Existe lógica rigorosa por trás.</span>
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              O CliniFlow aplica 16 regras de negócio fundamentadas para garantir que nenhuma consulta seja marcada
              em horário conflitante, no passado, ou fora da disponibilidade médica.
            </p>
          </div>

          <div>
            <button
              onClick={() => setRulesModalOpen(true)}
              className="inline-flex items-center gap-2 bg-[#176b63] hover:bg-[#0d514b] text-white px-5 py-3 rounded-xl font-bold text-sm shadow-sm transition"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Abrir Inspetor Interativo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 16 Rules Grid */}
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {BUSINESS_RULES_LIST.map((rule) => (
            <div
              key={rule.codigo}
              onClick={() => openRuleDetail(rule.codigo)}
              className="p-5 rounded-xl border border-slate-200 bg-[#f6f8fb] hover:bg-white hover:border-[#176b63] transition duration-200 cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#176b63] font-display px-2 py-0.5 rounded bg-emerald-100/70">
                    {rule.codigo}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    {rule.categoria}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-[#102b38] group-hover:text-[#176b63] transition font-display">
                  {rule.titulo}
                </h4>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {rule.descricao}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-semibold text-[#176b63]">
                <span>Verificar validação</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
