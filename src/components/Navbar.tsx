import React, { useState, useRef, useEffect } from 'react';
import { useClinic } from '../context/ClinicContext';
import {
  Calendar,
  ShieldCheck,
  LogOut,
  LogIn,
  ChevronDown,
  Menu,
  X,
  UserCircle2,
  Stethoscope,
  LayoutDashboard,
  ClipboardList,
  Clock,
  Settings,
  UserPlus
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    currentTab,
    setCurrentTab,
    currentUser,
    logout,
    openAuthModal,
    setRulesModalOpen,
    clinicConfig
  } = useClinic();

  const [mobileMenuOpen, setMobileMenuOpen]   = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const roleColor = {
    administrador: 'text-purple-600 bg-purple-50',
    profissional:  'text-blue-600 bg-blue-50',
    cliente:       'text-emerald-600 bg-emerald-50',
  } as const;

  const roleLabel = {
    administrador: 'Administrador',
    profissional:  'Profissional',
    cliente:       'Cliente',
  } as const;

  return (
    <header className="sticky top-0 z-50 bg-[#f6f8fb]/90 backdrop-blur-md border-b border-[#dfe6ec]">

      {/* ── Top academic banner ─────────────────────────────────────────────── */}
      <div className="bg-[#102b38] text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#176b63] text-white">
              UFERSA • Pau dos Ferros • Web 2026.2
            </span>
            <span className="hidden sm:inline text-slate-300">
              Projeto CliniFlow: Sistema de Gestão e Agendamento para Clínicas
            </span>
          </div>

          <button
            onClick={() => setRulesModalOpen(true)}
            className="flex items-center gap-1 text-emerald-300 hover:text-emerald-200 text-xs font-semibold underline decoration-emerald-400 underline-offset-2"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Regras RN01–RN16</span>
          </button>
        </div>
      </div>

      {/* ── Main navbar ─────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode('landing')}
              className="flex items-center gap-2.5 text-left focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-[#176b63] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                ✚
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-[#102b38]">
                  Clini<span className="text-[#176b63]">Flow</span>
                </span>
                <span className="hidden md:block text-[10px] text-slate-500 font-medium leading-none">
                  Gestão & Agendamento Clínico
                </span>
              </div>
            </button>

            {/* View mode toggle */}
            <div className="hidden lg:flex items-center ml-6 bg-slate-200/70 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('landing')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  viewMode === 'landing'
                    ? 'bg-white text-[#176b63] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Página Informativa
              </button>
              <button
                onClick={() => setViewMode('app')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  viewMode === 'app'
                    ? 'bg-[#176b63] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sistema
              </button>
            </div>
          </div>

          {/* ── Centre nav links ──────────────────────────────────────────────── */}
          {viewMode === 'landing' ? (
            <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
              <a href="#problema"       className="hover:text-[#176b63] transition">O Problema</a>
              <a href="#funcionalidades" className="hover:text-[#176b63] transition">Funcionalidades</a>
              <a href="#perfis"         className="hover:text-[#176b63] transition">Perfis</a>
              <a href="#seguranca"      className="hover:text-[#176b63] transition">Segurança</a>
              <a href="#arquitetura"    className="hover:text-[#176b63] transition">Arquitetura AWS</a>
            </nav>
          ) : (
            <nav className="hidden md:flex items-center gap-0.5 text-xs font-semibold text-slate-600">
              {/* Always visible */}
              <button
                onClick={() => setCurrentTab('agendamento')}
                className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
                  currentTab === 'agendamento' ? 'bg-[#e2f2ef] text-[#176b63]' : 'hover:bg-slate-100'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                Agendar
              </button>

              {/* Client */}
              {currentUser?.tipo === 'cliente' && (
                <button
                  onClick={() => setCurrentTab('meus-agendamentos')}
                  className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
                    currentTab === 'meus-agendamentos' ? 'bg-[#e2f2ef] text-[#176b63]' : 'hover:bg-slate-100'
                  }`}
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  Meus Agendamentos
                </button>
              )}

              {/* Professional */}
              {(currentUser?.tipo === 'profissional' || currentUser?.tipo === 'administrador') && (
                <>
                  <button
                    onClick={() => setCurrentTab('agenda-profissional')}
                    className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
                      currentTab === 'agenda-profissional' ? 'bg-[#e2f2ef] text-[#176b63]' : 'hover:bg-slate-100'
                    }`}
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                    Minha Agenda
                  </button>
                  <button
                    onClick={() => setCurrentTab('disponibilidade')}
                    className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
                      currentTab === 'disponibilidade' ? 'bg-[#e2f2ef] text-[#176b63]' : 'hover:bg-slate-100'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Disponibilidade
                  </button>
                </>
              )}

              {/* Admin */}
              {currentUser?.tipo === 'administrador' && (
                <>
                  <button
                    onClick={() => setCurrentTab('admin-dashboard')}
                    className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
                      currentTab === 'admin-dashboard' ? 'bg-[#e2f2ef] text-[#176b63]' : 'hover:bg-slate-100'
                    }`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Painel
                  </button>
                  <button
                    onClick={() => setCurrentTab('admin-profissionais')}
                    className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
                      currentTab === 'admin-profissionais' ? 'bg-[#e2f2ef] text-[#176b63]' : 'hover:bg-slate-100'
                    }`}
                  >
                    Profissionais
                  </button>
                  <button
                    onClick={() => setCurrentTab('admin-servicos')}
                    className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
                      currentTab === 'admin-servicos' ? 'bg-[#e2f2ef] text-[#176b63]' : 'hover:bg-slate-100'
                    }`}
                  >
                    Serviços
                  </button>
                  <button
                    onClick={() => setCurrentTab('admin-config')}
                    className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
                      currentTab === 'admin-config' ? 'bg-[#e2f2ef] text-[#176b63]' : 'hover:bg-slate-100'
                    }`}
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Parâmetros
                  </button>
                </>
              )}
            </nav>
          )}

          {/* ── Right actions ─────────────────────────────────────────────────── */}
          <div className="flex items-center gap-2">
            {viewMode === 'landing' ? (
              <button
                onClick={() => { setViewMode('app'); setCurrentTab('agendamento'); }}
                className="hidden sm:inline-flex items-center gap-2 bg-[#176b63] hover:bg-[#0d514b] text-white px-4 py-2 rounded-xl text-sm font-bold transition shadow-sm"
              >
                <Calendar className="w-4 h-4" />
                Agendar Consulta
              </button>
            ) : currentUser ? (
              /* ── Logged-in user menu ──────────────────────────────────────── */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(o => !o)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition shadow-xs"
                  aria-expanded={userDropdownOpen}
                  aria-haspopup="true"
                >
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.nome}
                      className="w-7 h-7 rounded-full object-cover border border-emerald-200"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#176b63] text-white flex items-center justify-center font-bold text-xs">
                      {currentUser.nome.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="hidden sm:flex flex-col items-start leading-tight">
                    <span className="text-xs font-bold text-slate-900 max-w-[120px] truncate">
                      {currentUser.nome.split(' ')[0]}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0 rounded-full ${
                      currentUser.tipo in roleColor
                        ? roleColor[currentUser.tipo as keyof typeof roleColor]
                        : 'text-slate-500'
                    }`}>
                      {roleLabel[currentUser.tipo as keyof typeof roleLabel] ?? currentUser.tipo}
                    </span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-sm">
                    {/* User info header */}
                    <div className="px-3 pb-2 mb-1 border-b border-slate-100">
                      <p className="font-bold text-slate-800 text-xs truncate">{currentUser.nome}</p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                      <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        currentUser.tipo in roleColor
                          ? roleColor[currentUser.tipo as keyof typeof roleColor]
                          : 'text-slate-500 bg-slate-100'
                      }`}>
                        {roleLabel[currentUser.tipo as keyof typeof roleLabel] ?? currentUser.tipo}
                      </span>
                    </div>

                    {/* Role-specific quick links */}
                    {currentUser.tipo === 'cliente' && (
                      <button
                        onClick={() => { setCurrentTab('meus-agendamentos'); setViewMode('app'); setUserDropdownOpen(false); }}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 text-xs font-semibold transition"
                      >
                        <ClipboardList className="w-4 h-4 text-emerald-600" />
                        Meus Agendamentos
                      </button>
                    )}
                    {(currentUser.tipo === 'profissional' || currentUser.tipo === 'administrador') && (
                      <button
                        onClick={() => { setCurrentTab('agenda-profissional'); setViewMode('app'); setUserDropdownOpen(false); }}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 text-xs font-semibold transition"
                      >
                        <Stethoscope className="w-4 h-4 text-blue-600" />
                        Minha Agenda
                      </button>
                    )}
                    {currentUser.tipo === 'administrador' && (
                      <button
                        onClick={() => { setCurrentTab('admin-dashboard'); setViewMode('app'); setUserDropdownOpen(false); }}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 text-xs font-semibold transition"
                      >
                        <LayoutDashboard className="w-4 h-4 text-purple-600" />
                        Painel Administrativo
                      </button>
                    )}

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={() => { logout(); setUserDropdownOpen(false); setMobileMenuOpen(false); }}
                        className="w-full text-left px-3 py-2 hover:bg-red-50 flex items-center gap-2 text-red-600 text-xs font-bold transition rounded-b-xl"
                      >
                        <LogOut className="w-4 h-4" />
                        Sair da Conta
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ── Guest buttons ────────────────────────────────────────────── */
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('login')}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#102b38] hover:text-[#176b63] px-3 py-2 rounded-lg transition"
                >
                  <LogIn className="w-4 h-4" />
                  Entrar
                </button>
                <button
                  onClick={() => openAuthModal('register')}
                  className="flex items-center gap-1.5 bg-[#102b38] hover:bg-[#176b63] text-white text-xs font-bold px-3 py-2 rounded-lg transition"
                >
                  <UserPlus className="w-4 h-4" />
                  Criar Conta
                </button>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(o => !o)}
              className="md:hidden p-2 text-slate-700 hover:text-[#176b63] rounded-lg transition"
              aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile drawer ───────────────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-5 space-y-3 shadow-lg">
          {/* View switch */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-500">Visualização</span>
            <div className="flex items-center bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => { setViewMode('landing'); setMobileMenuOpen(false); }}
                className={`px-3 py-1 rounded text-xs font-bold ${
                  viewMode === 'landing' ? 'bg-white text-[#176b63] shadow-xs' : 'text-slate-600'
                }`}
              >
                Página
              </button>
              <button
                onClick={() => { setViewMode('app'); setMobileMenuOpen(false); }}
                className={`px-3 py-1 rounded text-xs font-bold ${
                  viewMode === 'app' ? 'bg-[#176b63] text-white' : 'text-slate-600'
                }`}
              >
                Sistema
              </button>
            </div>
          </div>

          {/* Logged-in user info */}
          {currentUser && (
            <div className="flex items-center gap-3 py-2 px-1 bg-slate-50 rounded-xl border border-slate-100">
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.nome} className="w-9 h-9 rounded-full object-cover border border-emerald-200" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#176b63] text-white flex items-center justify-center font-bold">
                  {currentUser.nome.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-sm font-bold text-slate-800">{currentUser.nome}</p>
                <p className="text-xs text-slate-500">{currentUser.email}</p>
              </div>
            </div>
          )}

          {/* App navigation links */}
          {viewMode === 'app' && (
            <div className="space-y-1">
              <button
                onClick={() => { setCurrentTab('agendamento'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-50 text-slate-700 flex items-center gap-2"
              >
                <Calendar className="w-4 h-4 text-[#176b63]" />
                Agendar Consulta
              </button>
              {currentUser?.tipo === 'cliente' && (
                <button
                  onClick={() => { setCurrentTab('meus-agendamentos'); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-50 text-slate-700 flex items-center gap-2"
                >
                  <ClipboardList className="w-4 h-4 text-[#176b63]" />
                  Meus Agendamentos
                </button>
              )}
              {(currentUser?.tipo === 'profissional' || currentUser?.tipo === 'administrador') && (
                <>
                  <button
                    onClick={() => { setCurrentTab('agenda-profissional'); setMobileMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 text-slate-700 flex items-center gap-2"
                  >
                    <Stethoscope className="w-4 h-4 text-blue-600" />
                    Minha Agenda
                  </button>
                  <button
                    onClick={() => { setCurrentTab('disponibilidade'); setMobileMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 text-slate-700 flex items-center gap-2"
                  >
                    <Clock className="w-4 h-4 text-blue-600" />
                    Disponibilidade & Bloqueios
                  </button>
                </>
              )}
              {currentUser?.tipo === 'administrador' && (
                <>
                  <button
                    onClick={() => { setCurrentTab('admin-dashboard'); setMobileMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold hover:bg-purple-50 text-slate-700 flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4 text-purple-600" />
                    Painel Geral
                  </button>
                  <button
                    onClick={() => { setCurrentTab('admin-profissionais'); setMobileMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold hover:bg-purple-50 text-slate-700 flex items-center gap-2"
                  >
                    <UserCircle2 className="w-4 h-4 text-purple-600" />
                    Profissionais
                  </button>
                  <button
                    onClick={() => { setCurrentTab('admin-servicos'); setMobileMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold hover:bg-purple-50 text-slate-700 flex items-center gap-2"
                  >
                    Serviços
                  </button>
                  <button
                    onClick={() => { setCurrentTab('admin-config'); setMobileMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold hover:bg-purple-50 text-slate-700 flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4 text-purple-600" />
                    Parâmetros da Clínica
                  </button>
                </>
              )}
            </div>
          )}

          {/* Auth actions */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
            <button
              onClick={() => { setRulesModalOpen(true); setMobileMenuOpen(false); }}
              className="text-xs font-bold text-[#176b63] flex items-center gap-1"
            >
              <ShieldCheck className="w-4 h-4" />
              Regras RN01–RN16
            </button>
            {currentUser ? (
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="text-xs font-bold text-red-600 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sair
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => { openAuthModal('login'); setMobileMenuOpen(false); }}
                  className="text-xs font-bold text-[#176b63] px-3 py-1.5 rounded-lg border border-[#176b63] hover:bg-[#e2f2ef] transition"
                >
                  Entrar
                </button>
                <button
                  onClick={() => { openAuthModal('register'); setMobileMenuOpen(false); }}
                  className="text-xs font-bold text-white bg-[#176b63] hover:bg-[#0d514b] px-3 py-1.5 rounded-lg transition"
                >
                  Criar Conta
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
