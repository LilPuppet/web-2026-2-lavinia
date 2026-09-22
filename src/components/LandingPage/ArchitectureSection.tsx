import React from 'react';
import { Cloud, Database, Cpu, ShieldCheck, Server, ArrowDown, ExternalLink, Github, Calculator } from 'lucide-react';

export const ArchitectureSection: React.FC = () => {
  return (
    <section id="arquitetura" className="py-20 bg-[#102b38] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800">
            ARQUITETURA EM NUVEM AWS
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
            Preparado para escalabilidade <br />
            <span className="text-emerald-400">e alta disponibilidade.</span>
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Estrutura técnica projetada para a disciplina de Desenvolvimento Web na UFERSA,
            organizada em microsserviços serverless na Amazon Web Services.
          </p>
        </div>

        {/* Visual Architecture Diagram (Based on Page 6 of the PDF) */}
        <div className="mt-14 max-w-4xl mx-auto bg-slate-900/90 rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-8">
          {/* Top Layer: Actors */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <span className="text-xs font-bold text-slate-300">👤 Cliente</span>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <span className="text-xs font-bold text-slate-300">🩺 Profissional</span>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <span className="text-xs font-bold text-slate-300">⚙️ Administrador</span>
            </div>
          </div>

          <div className="flex justify-center -my-3">
            <ArrowDown className="w-5 h-5 text-emerald-400 animate-bounce" />
          </div>

          {/* DNS Layer */}
          <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-center max-w-xs mx-auto">
            <div className="text-xs font-bold text-emerald-400">Amazon Route 53 (DNS)</div>
            <div className="text-[10px] text-slate-400">Resolução de domínio zangado.web.ufersa.dev.br</div>
          </div>

          <div className="flex justify-center -my-3">
            <ArrowDown className="w-5 h-5 text-emerald-400" />
          </div>

          {/* Frontend Web */}
          <div className="bg-slate-800 p-4 rounded-xl border border-emerald-500/40 text-center max-w-md mx-auto">
            <div className="text-xs font-bold text-white flex items-center justify-center gap-1.5">
              <Cloud className="w-4 h-4 text-emerald-400" />
              <span>Frontend Web (AWS Amplify / React + Vite)</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Interface SPA responsiva com Tailwind CSS e RBAC</div>
          </div>

          <div className="flex justify-center -my-3">
            <ArrowDown className="w-5 h-5 text-emerald-400" />
          </div>

          {/* Auth & API Layer */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-1">
              <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Amazon Cognito</span>
              </div>
              <div className="text-[11px] text-slate-300 font-semibold">Autenticação & Identidade</div>
              <div className="text-[10px] text-slate-400">Tokens JWT com controle de perfis (Cliente, Profissional, Admin)</div>
            </div>

            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-1">
              <div className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                <Server className="w-4 h-4" />
                <span>Amazon API Gateway</span>
              </div>
              <div className="text-[11px] text-slate-300 font-semibold">REST API HTTPS</div>
              <div className="text-[10px] text-slate-400">Roteamento seguro para os microsserviços de agendamento</div>
            </div>
          </div>

          <div className="flex justify-center -my-3">
            <ArrowDown className="w-5 h-5 text-emerald-400" />
          </div>

          {/* Compute Layer */}
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 text-center">
            <div className="text-xs font-bold text-purple-400 flex items-center justify-center gap-1.5">
              <Cpu className="w-4 h-4" />
              <span>AWS Lambda (Funções Serverless)</span>
            </div>
            <div className="text-[11px] text-slate-300 mt-1 font-semibold">
              Execução e Validação das Regras de Negócio
            </div>
            <div className="text-[10px] text-slate-400">
              Cálculo de slots livres, prevenção de conflitos, cancelamento e reagendamento
            </div>
          </div>

          <div className="flex justify-center -my-3">
            <ArrowDown className="w-5 h-5 text-emerald-400" />
          </div>

          {/* Persistence & Observability */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-1">
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Database className="w-4 h-4" />
                <span>Amazon RDS (Relacional)</span>
              </div>
              <div className="text-[11px] text-slate-300 font-semibold">PostgreSQL / MySQL</div>
              <div className="text-[10px] text-slate-400">Usuários, Especialistas, Serviços, Bloqueios e Agendamentos</div>
            </div>

            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-1">
              <div className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                <Cloud className="w-4 h-4" />
                <span>Amazon CloudWatch</span>
              </div>
              <div className="text-[11px] text-slate-300 font-semibold">Monitoramento & Logs</div>
              <div className="text-[10px] text-slate-400">Rastreabilidade, auditoria de cancelamentos e alarmes</div>
            </div>
          </div>
        </div>

        {/* Reference Links & GitHub Box from PDF page 7 */}
        <div className="mt-12 max-w-4xl mx-auto grid sm:grid-cols-2 gap-6">
          <div className="bg-slate-800/70 p-6 rounded-2xl border border-slate-700 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Calculator className="w-4 h-4" />
                <span>AWS Pricing Calculator</span>
              </div>
              <h4 className="text-base font-bold text-white mt-1">
                Estimativa de Custos de Infraestrutura
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Planejamento orçamentário dos recursos na nuvem para o ambiente de produção da clínica.
              </p>
            </div>
            <a
              href="https://calculator.aws/#/estimate?id=e6d4104e09c66de29b93e96fdc7dfd5e94385fc4"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition"
            >
              <span>Ver Estimativa AWS</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="bg-slate-800/70 p-6 rounded-2xl border border-slate-700 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 text-slate-300 font-bold text-sm">
                <Github className="w-4 h-4 text-white" />
                <span>Repositório do Projeto</span>
              </div>
              <h4 className="text-base font-bold text-white mt-1">
                LilPuppet / web-2026-2-lavinia
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Autora: Lavinia Dantas (laviniadantass@gmail.com) • Disciplina de Desenvolvimento Web UFERSA
              </p>
            </div>
            <a
              href="https://github.com/LilPuppet/web-2026-2-lavinia"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-bold text-white hover:text-emerald-400 transition"
            >
              <span>Acessar Código no GitHub</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
