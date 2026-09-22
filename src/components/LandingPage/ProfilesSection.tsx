import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import { User, Stethoscope, ShieldAlert, Check, X as XIcon, ArrowRight } from 'lucide-react';

export const ProfilesSection: React.FC = () => {
  const { switchRole, setViewMode, setCurrentTab } = useClinic();

  const rbacMatrix = [
    { operacao: 'Consultar serviços clínicos', cliente: true, profissional: true, admin: true },
    { operacao: 'Consultar profissionais e especialidades', cliente: true, profissional: true, admin: true },
    { operacao: 'Consultar horários livres em tempo real', cliente: true, profissional: true, admin: true },
    { operacao: 'Criar agendamento próprio', cliente: true, profissional: false, admin: true },
    { operacao: 'Visualizar próprios agendamentos', cliente: true, profissional: true, admin: true },
    { operacao: 'Visualizar agenda de outros profissionais', cliente: false, profissional: false, admin: true },
    { operacao: 'Cancelar próprio agendamento (com antecedência)', cliente: true, profissional: false, admin: true },
    { operacao: 'Cancelar agendamento vinculado com consolação', cliente: false, profissional: true, admin: true },
    { operacao: 'Definir disponibilidade semanal em blocos', cliente: false, profissional: true, admin: true },
    { operacao: 'Bloquear horários pontuais / ausências', cliente: false, profissional: true, admin: true },
    { operacao: 'Cadastrar e gerenciar profissionais', cliente: false, profissional: false, admin: true },
    { operacao: 'Cadastrar e gerenciar serviços', cliente: false, profissional: false, admin: true },
    { operacao: 'Configurar parâmetros gerais da clínica', cliente: false, profissional: false, admin: true }
  ];

  return (
    <section id="perfis" className="py-20 bg-[#f6f8fb]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#176b63] bg-[#e2f2ef] px-3 py-1 rounded-full">
            CONTROLE DE ACESSO (RBAC)
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#102b38] font-display">
            Três perfis. <br />
            <span className="text-[#176b63]">Uma única plataforma integrada.</span>
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            O acesso a funcionalidades é controlado com base no princípio do privilégio mínimo:
            cada perfil possui permissões estritas e verificação de propriedade dos recursos.
          </p>
        </div>

        {/* 3 Profile Cards */}
        <div className="mt-14 grid lg:grid-cols-3 gap-8">
          {/* Profile: Cliente */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-[#176b63] flex items-center justify-center font-bold">
                <User className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#176b63] uppercase">Perfil 01</span>
                <h3 className="text-xl font-bold text-[#102b38] font-display">Cliente / Paciente</h3>
              </div>
              <p className="text-sm text-slate-600">
                O usuário que utiliza a plataforma para consultar serviços, profissionais, horários e agendar consultas.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Consulta aberta de serviços, profissionais e horários vagos</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Criação de conta e agendamento de consultas</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Visualização e cancelamento de seus próprios agendamentos</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Recebimento de cupons de consolação caso o médico cancele</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => {
                switchRole('cliente');
                setViewMode('app');
                setCurrentTab('agendamento');
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#176b63] font-bold text-xs transition flex items-center justify-center gap-2"
            >
              <span>Testar como Cliente</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Profile: Profissional */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-blue-700 uppercase">Perfil 02</span>
                <h3 className="text-xl font-bold text-[#102b38] font-display">Profissional de Saúde</h3>
              </div>
              <p className="text-sm text-slate-600">
                Responsável pelo atendimento clínico e gerenciamento de sua própria agenda individual.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Visualização de sua agenda de atendimentos</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Definição de disponibilidade semanal em blocos</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Registro de bloqueios de horários para ausências e pausas</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Cancelamento vinculado com emissão de consolação</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => {
                switchRole('profissional');
                setViewMode('app');
                setCurrentTab('agenda-profissional');
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition flex items-center justify-center gap-2"
            >
              <span>Testar como Profissional</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Profile: Administrador */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-purple-700 uppercase">Perfil 03</span>
                <h3 className="text-xl font-bold text-[#102b38] font-display">Administrador Geral</h3>
              </div>
              <p className="text-sm text-slate-600">
                Usuário com privilégios de gestão integral da clínica, cadastros mestres e parâmetros de negócio.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span>Cadastro, edição e desativação suave de profissionais</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span>Gestão de serviços clínicos e duração em minutos</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span>Visão unificada de todos os agendamentos da clínica</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span>Configuração de prazos de antecedência e cancelamento</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => {
                switchRole('administrador');
                setViewMode('app');
                setCurrentTab('admin-dashboard');
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs transition flex items-center justify-center gap-2"
            >
              <span>Testar como Administrador</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* RBAC Table Matrix */}
        <div className="mt-16 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-[#102b38] font-display">
              Matriz de Controle de Acesso (RBAC)
            </h3>
            <p className="text-xs text-slate-500">
              Conforme definido na Seção 5 da documentação do projeto de Gestão e Agendamento para Clínicas.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f6f8fb] text-slate-700 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Operação / Recurso</th>
                  <th className="py-3.5 px-6 text-center">Cliente</th>
                  <th className="py-3.5 px-6 text-center">Profissional</th>
                  <th className="py-3.5 px-6 text-center">Administrador</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rbacMatrix.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-6 font-medium text-slate-800">{item.operacao}</td>
                    <td className="py-3 px-6 text-center">
                      {item.cliente ? (
                        <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <span className="text-slate-300 font-bold">—</span>
                      )}
                    </td>
                    <td className="py-3 px-6 text-center">
                      {item.profissional ? (
                        <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <span className="text-slate-300 font-bold">—</span>
                      )}
                    </td>
                    <td className="py-3 px-6 text-center">
                      {item.admin ? (
                        <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <span className="text-slate-300 font-bold">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};
