import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Calendar, Clock, CheckCircle2, ArrowRight, Sparkles, UserCheck, Stethoscope } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { setViewMode, setCurrentTab, activeServices, activeProfessionals, appointments } = useClinic();

  return (
    <section className="relative overflow-hidden pt-12 pb-20 bg-gradient-to-b from-[#f6f8fb] to-[#edf5f3]">
      {/* Decorative Glows */}
      <div className="absolute top-10 right-5 w-96 h-96 bg-[#176b63]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 left-5 w-72 h-72 bg-[#d9a441]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#e2f2ef] text-[#176b63] text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-[#176b63] animate-pulse" />
              Gestão Inteligente de Agendas Clínicas
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#102b38] tracking-tight font-display leading-[1.15]">
              Sua clínica organizada. <br />
              <span className="text-[#176b63]">Seus horários</span> sob controle.
            </h1>

            <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
              Uma plataforma web para centralizar agendamentos, organizar a agenda dos profissionais
              e tornar a experiência do cliente simples, rápida e sem conflitos de horários.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => {
                  setViewMode('app');
                  setCurrentTab('agendamento');
                }}
                className="inline-flex items-center gap-2.5 bg-[#176b63] hover:bg-[#0d514b] text-white px-6 py-3.5 rounded-xl font-bold text-base shadow-lg shadow-[#176b63]/25 transition hover:-translate-y-0.5"
              >
                <Calendar className="w-5 h-5" />
                <span>Agendar Consulta Online</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setViewMode('app');
                  setCurrentTab('agendamento');
                }}
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-[#102b38] border border-slate-200 px-6 py-3.5 rounded-xl font-bold text-base shadow-xs transition"
              >
                <Clock className="w-5 h-5 text-[#176b63]" />
                <span>Consultar Horários Livres</span>
              </button>
            </div>

            {/* Quick trust metrics */}
            <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4 max-w-md text-slate-700">
              <div>
                <div className="text-2xl font-extrabold text-[#102b38] font-display">100%</div>
                <div className="text-xs text-slate-500 font-medium">Sem Conflitos</div>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-[#176b63] font-display">{activeProfessionals.length}</div>
                <div className="text-xs text-slate-500 font-medium">Especialistas Ativos</div>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-[#d9a441] font-display">{activeServices.length}</div>
                <div className="text-xs text-slate-500 font-medium">Serviços Clínicos</div>
              </div>
            </div>
          </div>

          {/* Hero Right Visual Mockup: Interactive Schedule Card */}
          <div className="lg:col-span-5">
          </div>
        </div>
      </div>
    </section>
  );
};
