import React from 'react';
import { ClinicProvider, useClinic } from './context/ClinicContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage/LandingPage';
import { ClientBookingFlow } from './components/App/ClientBookingFlow';
import { ClientAppointmentsView } from './components/App/ClientAppointmentsView';
import { ProfessionalAgendaView } from './components/App/ProfessionalAgendaView';
import { ProfessionalAvailabilityView } from './components/App/ProfessionalAvailabilityView';
import { AdminDashboardView } from './components/App/AdminDashboardView';
import { AdminProfessionalsView } from './components/App/AdminProfessionalsView';
import { AdminServicesView } from './components/App/AdminServicesView';
import { AdminSettingsView } from './components/App/AdminSettingsView';
import { BusinessRulesInspector } from './components/BusinessRulesInspector';
import { AuthModal } from './components/AuthModal';
import {
  ArrowLeft,
  ShieldCheck,
  Calendar,
  ClipboardList,
  Stethoscope,
  Clock,
  LayoutDashboard,
  Settings
} from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    currentTab,
    setCurrentTab,
    currentUser,
    setRulesModalOpen
  } = useClinic();

  // Derive role label from the real currentUser — no more fake userRole state
  const roleLabel = currentUser
    ? currentUser.tipo.charAt(0).toUpperCase() + currentUser.tipo.slice(1)
    : 'Visitante';

  const roleColor = !currentUser
    ? 'text-slate-500 bg-slate-100'
    : currentUser.tipo === 'administrador'
      ? 'text-purple-700 bg-purple-100'
      : currentUser.tipo === 'profissional'
        ? 'text-blue-700 bg-blue-100'
        : 'text-emerald-700 bg-emerald-100';

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      <Navbar />

      {viewMode === 'landing' ? (
        <main className="flex-1">
          <LandingPage />
        </main>
      ) : (
        <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">

          {/* Sub-navigation bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">

            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode('landing')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold transition shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Voltar à Página Inicial
              </button>

              <div className="h-4 w-px bg-slate-200" />

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Perfil:</span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${roleColor}`}>
                  {roleLabel}
                </span>
              </div>
            </div>

            {/* Contextual tab strip */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">

              {/* Booking — visible to everyone */}
              <button
                onClick={() => setCurrentTab('agendamento')}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 ${
                  currentTab === 'agendamento'
                    ? 'bg-[#176b63] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                Novo Agendamento
              </button>

              {/* Client: own appointments */}
              {currentUser?.tipo === 'cliente' && (
                <button
                  onClick={() => setCurrentTab('meus-agendamentos')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 ${
                    currentTab === 'meus-agendamentos'
                      ? 'bg-[#176b63] text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  Meus Agendamentos
                </button>
              )}

              {/* Professional (+ admin can view agenda) */}
              {(currentUser?.tipo === 'profissional' || currentUser?.tipo === 'administrador') && (
                <>
                  <button
                    onClick={() => setCurrentTab('agenda-profissional')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 ${
                      currentTab === 'agenda-profissional'
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                    Minha Agenda
                  </button>
                  <button
                    onClick={() => setCurrentTab('disponibilidade')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 ${
                      currentTab === 'disponibilidade'
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Disponibilidade
                  </button>
                </>
              )}

              {/* Admin only */}
              {currentUser?.tipo === 'administrador' && (
                <>
                  <button
                    onClick={() => setCurrentTab('admin-dashboard')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 ${
                      currentTab === 'admin-dashboard'
                        ? 'bg-purple-700 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Painel Geral
                  </button>
                  <button
                    onClick={() => setCurrentTab('admin-profissionais')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition ${
                      currentTab === 'admin-profissionais'
                        ? 'bg-purple-700 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Profissionais
                  </button>
                  <button
                    onClick={() => setCurrentTab('admin-servicos')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition ${
                      currentTab === 'admin-servicos'
                        ? 'bg-purple-700 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Serviços
                  </button>
                  <button
                    onClick={() => setCurrentTab('admin-config')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 ${
                      currentTab === 'admin-config'
                        ? 'bg-purple-700 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Políticas
                  </button>
                </>
              )}

              <button
                onClick={() => setRulesModalOpen(true)}
                className="px-3 py-1.5 rounded-xl font-bold bg-emerald-50 text-[#176b63] border border-emerald-200 hover:bg-emerald-100 transition flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Regras
              </button>
            </div>
          </div>

          {/* ── View router ────────────────────────────────────────────────────
              Tab IDs match exactly the AppTab type in types.ts and the tab
              values set in ClinicContext / Navbar.
          ──────────────────────────────────────────────────────────────────── */}
          {currentTab === 'agendamento'          && <ClientBookingFlow />}
          {currentTab === 'meus-agendamentos'    && <ClientAppointmentsView />}
          {currentTab === 'agenda-profissional'  && <ProfessionalAgendaView />}
          {currentTab === 'disponibilidade'      && <ProfessionalAvailabilityView />}
          {currentTab === 'admin-dashboard'      && <AdminDashboardView />}
          {currentTab === 'admin-profissionais'  && <AdminProfessionalsView />}
          {currentTab === 'admin-servicos'       && <AdminServicesView />}
          {currentTab === 'admin-config'         && <AdminSettingsView />}
        </main>
      )}

      {/* Global modals */}
      <BusinessRulesInspector />
      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <ClinicProvider>
      <AppContent />
    </ClinicProvider>
  );
}
