import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Github, ExternalLink, ShieldCheck } from 'lucide-react';

export const FooterSection: React.FC = () => {
  const { setRulesModalOpen, clinicConfig } = useClinic();

  return (
    <footer className="bg-[#0b1d26] text-slate-400 py-12 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800/80">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2 text-white font-extrabold text-lg font-display">
              <span className="w-7 h-7 rounded-lg bg-[#176b63] text-white flex items-center justify-center font-bold text-sm">
                ✚
              </span>
              <span>Clini<span className="text-[#176b63]">Flow</span></span>
            </div>
            <p className="text-slate-400 max-w-sm leading-relaxed">
              {clinicConfig.slogan}
            </p>
            <p className="text-[11px] text-slate-500">
              {clinicConfig.endereco} • {clinicConfig.cidade}
            </p>
          </div>

          {/* Academic links */}
          <div className="space-y-2">
            <div className="text-slate-200 font-bold uppercase tracking-wider text-[11px]">
              Projeto Acadêmico
            </div>
            <ul className="space-y-1.5 text-slate-400">
              <li>UFERSA - Campus Pau dos Ferros</li>
              <li>Desenvolvimento Web (2026.2)</li>
            </ul>
          </div>

          {/* Business rules & GitHub */}
          <div className="space-y-2">
            <div className="text-slate-200 font-bold uppercase tracking-wider text-[11px]">
              Conformidade & Código
            </div>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setRulesModalOpen(true)}
                  className="hover:text-emerald-400 text-slate-300 flex items-center gap-1.5 transition"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Matriz de Regras</span>
                </button>
              </li>
              <li>
                <a
                  href="https://github.com/LilPuppet/web-2026-2-lavinia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white text-slate-300 flex items-center gap-1.5 transition"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub: LilPuppet</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © 2026 CliniFlow. Desenvolvido para a disciplina de Desenvolvimento Web da UFERSA.
          </div>
          <div className="flex items-center gap-4">
            <span>Privacidade & Dados</span>
            <span>Termos de Uso</span>
            <span>Controle RBAC Ativo</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
