import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext';
import { BUSINESS_RULES_LIST } from '../data/mockData';
import {
  ShieldCheck,
  X,
  ArrowRight,
  CheckCircle2,
  Search
} from 'lucide-react';

export const BusinessRulesInspector: React.FC = () => {
  const {
    rulesModalOpen,
    setRulesModalOpen,
    selectedRuleCode,
    openRuleDetail,
    setViewMode,
    setCurrentTab,
    currentUser,
    openAuthModal
  } = useClinic();

  const [filterCategory, setFilterCategory] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');

  if (!rulesModalOpen) return null;

  const categories = [
    'todos', 'Acesso', 'Conta', 'Disponibilidade',
    'Serviço', 'Agendamento', 'Cancelamento', 'Integridade'
  ];

  const filteredRules = BUSINESS_RULES_LIST.filter(rule => {
    const matchCat = filterCategory === 'todos' || rule.categoria === filterCategory;
    const term = searchTerm.toLowerCase();
    const matchSearch =
      rule.codigo.toLowerCase().includes(term) ||
      rule.titulo.toLowerCase().includes(term) ||
      rule.descricao.toLowerCase().includes(term);
    return matchCat && matchSearch;
  });

  const selectedRule =
    BUSINESS_RULES_LIST.find(r => r.codigo === selectedRuleCode) ||
    filteredRules[0] ||
    BUSINESS_RULES_LIST[0];

  /**
   * Navigate to the most relevant view to observe the rule.
   * Uses the real auth state — no fake role switching.
   * If the target requires a logged-in user, opens the auth modal.
   */
  const handleGoToRule = (codigo: string) => {
    setRulesModalOpen(false);

    // Rules that are fully public — no auth needed
    const publicRules = new Set(['RN01', 'RN02', 'RN03', 'RN04', 'RN05', 'RN06', 'RN07', 'RN08', 'RN13', 'RN14']);

    // Determine target tab
    type TargetTab = Parameters<typeof setCurrentTab>[0];
    const tabMap: Record<string, TargetTab> = {
      RN01:  'agendamento',
      RN02:  'agendamento',
      RN03:  'agendamento',
      RN04:  'agendamento',
      RN05:  'agendamento',
      RN06:  'agendamento',
      RN07:  'disponibilidade',
      RN08:  'agendamento',
      RN09:  'meus-agendamentos',
      RN10:  'agenda-profissional',
      RN11:  'meus-agendamentos',
      RN12:  'agendamento',
      RN13:  'agendamento',
      RN14:  'admin-profissionais',
      RN15:  'admin-dashboard',
      RN16:  'admin-dashboard',
    };

    const target = tabMap[codigo] ?? 'agendamento';

    // Rules that require an admin to be meaningful
    const adminRules = new Set(['RN14', 'RN15', 'RN16']);
    // Rules that require a professional
    const profRules  = new Set(['RN07', 'RN10']);
    // Rules that require any logged-in client
    const clientRules = new Set(['RN09', 'RN11', 'RN12']);

    const goNow = () => {
      setViewMode('app');
      setCurrentTab(target);
    };

    if (publicRules.has(codigo) && !adminRules.has(codigo) && !profRules.has(codigo)) {
      // Fully observable without login
      goNow();
      return;
    }

    if (!currentUser) {
      // Need to log in first — open modal, then navigate on success
      openAuthModal('login', goNow);
      return;
    }

    if (adminRules.has(codigo) && currentUser.tipo !== 'administrador') {
      openAuthModal('login', goNow);
      return;
    }

    if (profRules.has(codigo) && currentUser.tipo !== 'profissional' && currentUser.tipo !== 'administrador') {
      openAuthModal('login', goNow);
      return;
    }

    goNow();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-5xl w-full h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="p-6 bg-[#102b38] text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-400">
                AUDITORIA DE REGRAS DE NEGÓCIO (RN01–RN16)
              </span>
              <h3 className="text-xl font-extrabold">
                Inspetor de Conformidade Clínica
              </h3>
            </div>
          </div>
          <button
            onClick={() => setRulesModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 bg-[#f6f8fb] border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs flex-shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-bold capitalize whitespace-nowrap transition ${
                  filterCategory === cat
                    ? 'bg-[#176b63] text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar regra ou palavra-chave..."
              className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 text-xs focus:outline-none focus:border-[#176b63] w-56"
            />
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden min-h-0">

          {/* Rules list */}
          <div className="md:col-span-5 border-r border-slate-200 overflow-y-auto divide-y divide-slate-100 p-2">
            {filteredRules.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-8">Nenhuma regra encontrada.</p>
            )}
            {filteredRules.map(rule => {
              const isSelected = selectedRule?.codigo === rule.codigo;
              return (
                <div
                  key={rule.codigo}
                  onClick={() => openRuleDetail(rule.codigo)}
                  className={`p-3.5 rounded-xl cursor-pointer transition space-y-1 ${
                    isSelected
                      ? 'bg-[#e2f2ef] border border-emerald-300'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-[#176b63] font-mono">
                      {rule.codigo}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      {rule.categoria}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-[#102b38]">{rule.titulo}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{rule.descricao}</p>
                </div>
              );
            })}
          </div>

          {/* Detail pane */}
          <div className="md:col-span-7 p-6 overflow-y-auto space-y-6 bg-white">
            {selectedRule && (
              <>
                <div className="space-y-2 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#176b63] text-white text-xs font-black font-mono px-2.5 py-1 rounded-lg">
                      {selectedRule.codigo}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      {selectedRule.categoria}
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-[#102b38]">
                    {selectedRule.titulo}
                  </h3>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1">
                      Definição da Regra:
                    </h4>
                    <div className="p-4 bg-[#f6f8fb] rounded-xl border border-slate-200 text-slate-700 leading-relaxed text-sm">
                      {selectedRule.descricao}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1">
                      Implementação no CliniFlow:
                    </h4>
                    <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 text-emerald-950 leading-relaxed">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>Garantia do Sistema: </strong>
                          {selectedRule.detalhe_validacao}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-[11px] space-y-1">
                    <div className="font-bold text-slate-800">Mapeamento Arquitetural (AWS):</div>
                    <div>• Validação executada na função Lambda de agendamento</div>
                    <div>• Unicidade e integridade referencial persistida no RDS (PostgreSQL)</div>
                    <div>• Auditoria de eventos registrada no Amazon CloudWatch</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-400">
                    {!currentUser
                      ? 'Faça login para testar regras que requerem autenticação.'
                      : 'Clique para navegar até a tela correspondente.'}
                  </span>
                  <button
                    onClick={() => handleGoToRule(selectedRule.codigo)}
                    className="inline-flex items-center gap-2 bg-[#176b63] hover:bg-[#0d514b] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition whitespace-nowrap"
                  >
                    <span>Ver {selectedRule.codigo} no Sistema</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
