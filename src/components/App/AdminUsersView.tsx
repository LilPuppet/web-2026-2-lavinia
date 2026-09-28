import React, { useState, useMemo } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { User, UserRole } from '../../types';
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Power,
  PowerOff,
  X,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  Stethoscope,
  UserIcon
} from 'lucide-react';

// ─── helpers ─────────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;

function validateForm(
  nome: string,
  email: string,
  telefone: string
): Record<string, string> {
  const errs: Record<string, string> = {};
  if (!nome.trim() || nome.trim().split(' ').filter(Boolean).length < 2)
    errs.nome = 'Informe nome e sobrenome.';
  if (!email.trim())
    errs.email = 'Informe o e-mail.';
  else if (!EMAIL_RE.test(email))
    errs.email = 'E-mail inválido.';
  if (!telefone.trim())
    errs.telefone = 'Informe o telefone.';
  else if (!PHONE_RE.test(telefone))
    errs.telefone = 'Formato: (84) 99999-9999';
  return errs;
}

const roleBadge: Record<UserRole, string> = {
  administrador: 'bg-purple-100 text-purple-800',
  profissional:  'bg-blue-100 text-blue-800',
  cliente:       'bg-emerald-100 text-emerald-800',
};

const roleLabel: Record<UserRole, string> = {
  administrador: 'Administrador',
  profissional:  'Profissional',
  cliente:       'Cliente',
};

const RoleIcon: React.FC<{ tipo: UserRole; className?: string }> = ({ tipo, className = 'w-4 h-4' }) => {
  if (tipo === 'administrador') return <ShieldAlert className={className} />;
  if (tipo === 'profissional')  return <Stethoscope className={className} />;
  return <UserIcon className={className} />;
};

// ─── Field ────────────────────────────────────────────────────────────────────

const Field: React.FC<{ label: string; error?: string; children: React.ReactNode }> = ({ label, error, children }) => (
  <div className="space-y-1">
    <label className="block text-xs font-bold text-slate-700">{label}</label>
    {children}
    {error && (
      <p className="flex items-center gap-1 text-[11px] text-red-600 font-medium">
        <AlertCircle className="w-3 h-3 flex-shrink-0" />
        {error}
      </p>
    )}
  </div>
);

// ─── Main View ────────────────────────────────────────────────────────────────

export const AdminUsersView: React.FC = () => {
  const {
    users,
    currentUser,
    updateUser,
    toggleUserStatus,
    deleteUser,
    adminCreateUser,
    showToast
  } = useClinic();

  // ── list state ──────────────────────────────────────────────────────────────
  const [search,      setSearch]      = useState('');
  const [filterRole,  setFilterRole]  = useState<'todos' | UserRole>('todos');
  const [filterSit,   setFilterSit]   = useState<'todos' | 'ativo' | 'inativo'>('todos');

  // ── modal state ─────────────────────────────────────────────────────────────
  type ModalMode = 'create' | 'edit' | null;
  const [modalMode,    setModalMode]    = useState<ModalMode>(null);
  const [editTarget,   setEditTarget]   = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  // ── form state ──────────────────────────────────────────────────────────────
  const [fNome,     setFNome]     = useState('');
  const [fEmail,    setFEmail]    = useState('');
  const [fTelefone, setFTelefone] = useState('');
  const [fTipo,     setFTipo]     = useState<UserRole>('cliente');
  const [fSituacao, setFSituacao] = useState<'ativo' | 'inativo'>('ativo');
  const [fErrors,   setFErrors]   = useState<Record<string, string>>({});
  const [serverErr, setServerErr] = useState('');

  // ── filtered list ───────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return users.filter(u => {
      const term = search.toLowerCase();
      const matchSearch =
        u.nome.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.telefone.includes(term);
      const matchRole = filterRole === 'todos' || u.tipo === filterRole;
      const matchSit  = filterSit  === 'todos' || u.situacao === filterSit;
      return matchSearch && matchRole && matchSit;
    });
  }, [users, search, filterRole, filterSit]);

  // ── phone mask ──────────────────────────────────────────────────────────────
  const handlePhone = (raw: string) => {
    const d = raw.replace(/\D/g, '').slice(0, 11);
    let m = d;
    if (d.length > 2) m = `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length > 7) m = `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    setFTelefone(m);
  };

  // ── open modals ─────────────────────────────────────────────────────────────
  const openCreate = () => {
    setFNome(''); setFEmail(''); setFTelefone('');
    setFTipo('cliente'); setFSituacao('ativo');
    setFErrors({}); setServerErr('');
    setEditTarget(null);
    setModalMode('create');
  };

  const openEdit = (u: User) => {
    setFNome(u.nome); setFEmail(u.email); setFTelefone(u.telefone);
    setFTipo(u.tipo); setFSituacao(u.situacao);
    setFErrors({}); setServerErr('');
    setEditTarget(u);
    setModalMode('edit');
  };

  const closeModal = () => { setModalMode(null); setEditTarget(null); };

  // ── submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerErr('');
    const errs = validateForm(fNome, fEmail, fTelefone);
    setFErrors(errs);
    if (Object.keys(errs).length) return;

    if (modalMode === 'create') {
      const res = adminCreateUser(fNome, fEmail, fTelefone, fTipo);
      if (!res.success) { setServerErr(res.message); return; }
    } else if (modalMode === 'edit' && editTarget) {
      updateUser(editTarget.id, {
        nome:     fNome.trim(),
        email:    fEmail.trim(),
        telefone: fTelefone.trim(),
        tipo:     fTipo,
        situacao: fSituacao,
      });
    }
    closeModal();
  };

  // ── delete confirm ──────────────────────────────────────────────────────────
  const confirmDelete = () => {
    if (!deleteTarget) return;
    const res = deleteUser(deleteTarget.id);
    if (!res.success) showToast(res.message, 'error');
    setDeleteTarget(null);
  };

  // ── counts ──────────────────────────────────────────────────────────────────
  const counts = useMemo(() => ({
    total:   users.length,
    ativos:  users.filter(u => u.situacao === 'ativo').length,
    clientes: users.filter(u => u.tipo === 'cliente').length,
    profissionais: users.filter(u => u.tipo === 'profissional').length,
    admins:  users.filter(u => u.tipo === 'administrador').length,
  }), [users]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
            GESTÃO DE CONTAS
          </span>
          <h2 className="text-2xl font-extrabold text-[#102b38] font-display mt-2">
            Usuários do Sistema
          </h2>
          <p className="text-xs text-slate-500">
            Criação, edição, ativação e remoção de contas. Senhas nunca são exibidas.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-[#176b63] hover:bg-[#0d514b] text-white px-4 py-2.5 rounded-xl font-bold text-xs transition shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Nova Conta
        </button>
      </div>

      {/* ── KPIs ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total de Contas',   value: counts.total,         color: 'text-slate-800'  },
          { label: 'Contas Ativas',     value: counts.ativos,        color: 'text-emerald-700'},
          { label: 'Clientes',          value: counts.clientes,      color: 'text-[#176b63]'  },
          { label: 'Profissionais',     value: counts.profissionais, color: 'text-blue-700'   },
        ].map(k => (
          <div key={k.label} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className={`text-2xl font-extrabold font-display ${k.color}`}>{k.value}</div>
            <div className="text-xs text-slate-500">{k.label}</div>
          </div>
        ))}
      </div>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* toolbar */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-base font-bold text-[#102b38] font-display flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-600" />
            Todas as Contas ({filtered.length})
          </h3>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Nome, e-mail ou telefone..."
                className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 bg-[#f6f8fb] focus:outline-none focus:border-[#176b63] w-52"
              />
            </div>
            <select
              value={filterRole}
              onChange={e => setFilterRole(e.target.value as typeof filterRole)}
              className="py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold"
            >
              <option value="todos">Todos os perfis</option>
              <option value="cliente">Cliente</option>
              <option value="profissional">Profissional</option>
              <option value="administrador">Administrador</option>
            </select>
            <select
              value={filterSit}
              onChange={e => setFilterSit(e.target.value as typeof filterSit)}
              className="py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold"
            >
              <option value="todos">Todos os status</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f6f8fb] text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Usuário</th>
                <th className="py-3 px-4">Contato</th>
                <th className="py-3 px-4 text-center">Perfil</th>
                <th className="py-3 px-4 text-center">Situação</th>
                <th className="py-3 px-4">Cadastro</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    Nenhum usuário encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                filtered.map(u => {
                  const isMe = u.id === currentUser?.id;
                  return (
                    <tr key={u.id} className={`hover:bg-slate-50/70 transition ${u.situacao === 'inativo' ? 'opacity-60' : ''}`}>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.nome} className="w-8 h-8 rounded-full object-cover border border-slate-200 flex-shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                              <RoleIcon tipo={u.tipo} className="w-4 h-4 text-slate-500" />
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-900">
                              {u.nome}
                              {isMe && <span className="ml-1.5 text-[10px] font-bold text-[#176b63] bg-emerald-50 px-1.5 py-0.5 rounded-full">você</span>}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">{u.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-700">{u.email}</div>
                        <div className="text-slate-400">{u.telefone}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${roleBadge[u.tipo]}`}>
                          <RoleIcon tipo={u.tipo} className="w-3 h-3" />
                          {roleLabel[u.tipo]}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          u.situacao === 'ativo'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}>
                          {u.situacao}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{u.data_cadastro}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          {/* Edit */}
                          <button
                            onClick={() => openEdit(u)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#176b63] hover:bg-slate-100 transition"
                            title="Editar conta"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Toggle status */}
                          {!isMe && (
                            <button
                              onClick={() => toggleUserStatus(u.id)}
                              className={`p-1.5 rounded-lg transition ${
                                u.situacao === 'ativo'
                                  ? 'text-amber-600 hover:bg-amber-50'
                                  : 'text-emerald-600 hover:bg-emerald-50'
                              }`}
                              title={u.situacao === 'ativo' ? 'Desativar conta' : 'Reativar conta'}
                            >
                              {u.situacao === 'ativo'
                                ? <PowerOff className="w-3.5 h-3.5" />
                                : <Power className="w-3.5 h-3.5" />}
                            </button>
                          )}

                          {/* Delete */}
                          {!isMe && (
                            <button
                              onClick={() => setDeleteTarget(u)}
                              className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition"
                              title="Remover conta permanentemente"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-slate-100 text-[11px] text-slate-400">
          As senhas dos usuários nunca são exibidas e não podem ser visualizadas pelo administrador. Para redefinir o acesso de um usuário, remova e recrie a conta.
        </div>
      </div>

      {/* ── Create / Edit Modal ─────────────────────────────────────────────── */}
      {modalMode && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#102b38] font-display">
                {modalMode === 'create' ? 'Criar Nova Conta' : 'Editar Conta'}
              </h3>
              <button onClick={closeModal} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition" aria-label="Fechar">
                <X className="w-5 h-5" />
              </button>
            </div>

            {serverErr && (
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{serverErr}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <Field label="Nome Completo" error={fErrors.nome}>
                <input
                  type="text"
                  value={fNome}
                  onChange={e => setFNome(e.target.value)}
                  placeholder="Nome e Sobrenome"
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none transition ${fErrors.nome ? 'border-red-400 bg-red-50' : 'border-slate-300 focus:border-[#176b63]'}`}
                />
              </Field>

              <Field label="E-mail" error={fErrors.email}>
                <input
                  type="email"
                  value={fEmail}
                  onChange={e => setFEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none transition ${fErrors.email ? 'border-red-400 bg-red-50' : 'border-slate-300 focus:border-[#176b63]'}`}
                />
              </Field>

              <Field label="Telefone" error={fErrors.telefone}>
                <input
                  type="tel"
                  value={fTelefone}
                  onChange={e => handlePhone(e.target.value)}
                  placeholder="(84) 99999-9999"
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none transition ${fErrors.telefone ? 'border-red-400 bg-red-50' : 'border-slate-300 focus:border-[#176b63]'}`}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Perfil">
                  <select
                    value={fTipo}
                    onChange={e => setFTipo(e.target.value as UserRole)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-semibold focus:outline-none focus:border-[#176b63]"
                  >
                    <option value="cliente">Cliente</option>
                    <option value="profissional">Profissional</option>
                    <option value="administrador">Administrador</option>
                  </select>
                </Field>

                {modalMode === 'edit' && (
                  <Field label="Situação">
                    <select
                      value={fSituacao}
                      onChange={e => setFSituacao(e.target.value as 'ativo' | 'inativo')}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-semibold focus:outline-none focus:border-[#176b63]"
                    >
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                    </select>
                  </Field>
                )}
              </div>

              {modalMode === 'create' && (
                <p className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  A conta será criada sem senha. O usuário deve definir a senha no primeiro acesso através da tela de login.
                </p>
              )}

              <div className="flex justify-end gap-3 pt-1">
                <button type="button" onClick={closeModal} className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-50 transition">
                  Cancelar
                </button>
                <button type="submit" className="px-5 py-2 bg-[#176b63] hover:bg-[#0d514b] text-white rounded-xl text-sm font-bold transition">
                  {modalMode === 'create' ? 'Criar Conta' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ────────────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Remover conta permanentemente?</h3>
                <p className="text-xs text-slate-500">Esta ação não pode ser desfeita.</p>
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-0.5">
              <p className="font-bold text-slate-800">{deleteTarget.nome}</p>
              <p className="text-slate-500">{deleteTarget.email}</p>
              <span className={`inline-block mt-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${roleBadge[deleteTarget.tipo]}`}>
                {roleLabel[deleteTarget.tipo]}
              </span>
            </div>
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Contas com agendamentos ativos não podem ser removidas. Cancele os agendamentos primeiro.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-50 transition">
                Cancelar
              </button>
              <button onClick={confirmDelete} className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition">
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
