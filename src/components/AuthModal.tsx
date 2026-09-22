import React, { useState, useEffect } from 'react';
import { useClinic } from '../context/ClinicContext';
import { SEED_PASSWORD } from '../utils/crypto';
import {
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';

// ─── Validation helpers ───────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;

function validateLoginForm(email: string, password: string): Record<string, string> {
  const errs: Record<string, string> = {};
  if (!email.trim())              errs.email    = 'Informe o e-mail.';
  else if (!EMAIL_RE.test(email)) errs.email    = 'E-mail inválido.';
  if (!password)                  errs.password = 'Informe a senha.';
  return errs;
}

function validateRegisterForm(
  nome: string,
  email: string,
  telefone: string,
  senha: string,
  confirmSenha: string
): Record<string, string> {
  const errs: Record<string, string> = {};

  if (!nome.trim() || nome.trim().split(' ').filter(Boolean).length < 2)
    errs.nome = 'Informe nome e sobrenome.';

  if (!email.trim())              errs.email    = 'Informe o e-mail.';
  else if (!EMAIL_RE.test(email)) errs.email    = 'E-mail inválido.';

  if (!telefone.trim())               errs.telefone = 'Informe o telefone.';
  else if (!PHONE_RE.test(telefone))  errs.telefone = 'Formato: (84) 99999-9999';

  if (!senha)                         errs.senha    = 'Informe uma senha.';
  else if (senha.length < 8)          errs.senha    = 'Mínimo 8 caracteres.';
  else if (!/[A-Z]/.test(senha))      errs.senha    = 'Inclua ao menos uma letra maiúscula.';
  else if (!/[0-9]/.test(senha))      errs.senha    = 'Inclua ao menos um número.';

  if (!confirmSenha)                          errs.confirmSenha = 'Confirme a senha.';
  else if (senha && confirmSenha !== senha)   errs.confirmSenha = 'As senhas não coincidem.';

  return errs;
}

// ─── Field component ──────────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

const Field: React.FC<FieldProps> = ({ label, error, children }) => (
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

// ─── Password input with show/hide toggle ─────────────────────────────────────

interface PasswordInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: boolean;
  autoComplete?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChange,
  placeholder = 'Senha',
  error,
  autoComplete
}) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`w-full pl-9 pr-9 py-2.5 rounded-xl border text-sm focus:outline-none transition ${
          error
            ? 'border-red-400 bg-red-50 focus:border-red-500'
            : 'border-slate-300 focus:border-[#176b63]'
        }`}
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        tabIndex={-1}
        aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
};

// ─── Password strength indicator ──────────────────────────────────────────────

const PasswordStrength: React.FC<{ password: string }> = ({ password }) => {
  if (!password) return null;

  const checks = [
    { ok: password.length >= 8,       label: '8+ caracteres' },
    { ok: /[A-Z]/.test(password),     label: 'Maiúscula' },
    { ok: /[0-9]/.test(password),     label: 'Número' },
    { ok: /[^A-Za-z0-9]/.test(password), label: 'Símbolo' },
  ];
  const score = checks.filter(c => c.ok).length;
  const colors = ['bg-red-400', 'bg-amber-400', 'bg-yellow-400', 'bg-emerald-500'];

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {checks.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i < score ? colors[score - 1] : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
        {checks.map(c => (
          <span
            key={c.label}
            className={`text-[10px] flex items-center gap-0.5 font-medium ${
              c.ok ? 'text-emerald-600' : 'text-slate-400'
            }`}
          >
            {c.ok ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
};

// ─── Main Modal ───────────────────────────────────────────────────────────────

export const AuthModal: React.FC = () => {
  const { authModalOpen, authInitialTab, closeAuthModal, login, register, currentUser } = useClinic();

  const [tab, setTab] = useState<'login' | 'register'>(authInitialTab);

  // Login fields
  const [loginEmail,    setLoginEmail]    = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginErrors,   setLoginErrors]   = useState<Record<string, string>>({});

  // Register fields
  const [nome,         setNome]         = useState('');
  const [email,        setEmail]        = useState('');
  const [telefone,     setTelefone]     = useState('');
  const [senha,        setSenha]        = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');
  const [regErrors,    setRegErrors]    = useState<Record<string, string>>({});

  // Shared UI state
  const [serverError, setServerError] = useState('');
  const [loading,     setLoading]     = useState(false);

  // Sync tab when modal is re-opened with a different initial tab
  useEffect(() => {
    setTab(authInitialTab);
    setServerError('');
    setLoginErrors({});
    setRegErrors({});
  }, [authInitialTab, authModalOpen]);

  // Close if user already logged in (pending action resolved externally)
  useEffect(() => {
    if (currentUser && authModalOpen) closeAuthModal();
  }, [currentUser]);

  if (!authModalOpen) return null;

  // ── Phone mask ──────────────────────────────────────────────────────────────
  const handleTelefone = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 11);
    let masked = digits;
    if (digits.length > 2)  masked = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length > 7)  masked = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    setTelefone(masked);
  };

  // ── Login submit ────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    const errs = validateLoginForm(loginEmail, loginPassword);
    setLoginErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    const res = await login(loginEmail.trim(), loginPassword);
    setLoading(false);
    if (!res.success) setServerError(res.message);
  };

  // ── Register submit ─────────────────────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    const errs = validateRegisterForm(nome, email, telefone, senha, confirmSenha);
    setRegErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    // Only clients can self-register; professionals/admins are created by admin
    const res = await register(nome, email, telefone, senha, 'cliente');
    setLoading(false);
    if (!res.success) setServerError(res.message);
  };

  const switchTab = (t: 'login' | 'register') => {
    setTab(t);
    setServerError('');
    setLoginErrors({});
    setRegErrors({});
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Autenticação"
    >
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#176b63] text-white flex items-center justify-center font-bold text-sm">
              ✚
            </span>
            <span className="font-extrabold text-lg text-[#102b38]">
              Clini<span className="text-[#176b63]">Flow</span>
            </span>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
          <button
            onClick={() => switchTab('login')}
            className={`flex-1 py-2 rounded-lg transition ${
              tab === 'login' ? 'bg-white text-[#102b38] shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Entrar na Conta
          </button>
          <button
            onClick={() => switchTab('register')}
            className={`flex-1 py-2 rounded-lg transition ${
              tab === 'register' ? 'bg-white text-[#102b38] shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Criar Conta
          </button>
        </div>

        {/* Server-level error */}
        {serverError && (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        {/* ── LOGIN FORM ─────────────────────────────────────────────────────── */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            <Field label="E-mail" error={loginErrors.email}>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="seu@email.com"
                  autoComplete="email"
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm focus:outline-none transition ${
                    loginErrors.email
                      ? 'border-red-400 bg-red-50 focus:border-red-500'
                      : 'border-slate-300 focus:border-[#176b63]'
                  }`}
                />
              </div>
            </Field>

            <Field label="Senha" error={loginErrors.password}>
              <PasswordInput
                value={loginPassword}
                onChange={setLoginPassword}
                placeholder="Sua senha"
                error={!!loginErrors.password}
                autoComplete="current-password"
              />
            </Field>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#176b63] hover:bg-[#0d514b] disabled:opacity-60 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verificando...</span>
                </>
              ) : (
                'Entrar'
              )}
            </button>

            {/* Seed accounts hint for evaluators */}
            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
                Contas de demonstração
              </p>
              <div className="grid grid-cols-1 gap-1 text-[11px]">
                {[
                  { label: 'Administradora', email: 'laviniadantass@gmail.com' },
                  { label: 'Médico (prof-1)',  email: 'marcos.melo@cliniflow.ufersa.br' },
                  { label: 'Cliente',          email: 'mariana.silva@exemplo.com.br' },
                ].map(({ label, email: demoEmail }) => (
                  <button
                    key={demoEmail}
                    type="button"
                    onClick={() => {
                      setLoginEmail(demoEmail);
                      setLoginPassword(SEED_PASSWORD);
                      setLoginErrors({});
                      setServerError('');
                    }}
                    className="text-left px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 transition text-slate-600 hover:text-emerald-800"
                  >
                    <span className="font-bold">{label}</span>
                    <span className="text-slate-400 ml-1">— {demoEmail}</span>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 text-center">
                Senha de todas as contas demo: <span className="font-mono font-bold text-slate-600">{SEED_PASSWORD}</span>
              </p>
            </div>
          </form>
        )}

        {/* ── REGISTER FORM ──────────────────────────────────────────────────── */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4" noValidate>
            <Field label="Nome Completo" error={regErrors.nome}>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  placeholder="Nome e Sobrenome"
                  autoComplete="name"
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm focus:outline-none transition ${
                    regErrors.nome
                      ? 'border-red-400 bg-red-50 focus:border-red-500'
                      : 'border-slate-300 focus:border-[#176b63]'
                  }`}
                />
              </div>
            </Field>

            <Field label="E-mail (RN02: único por conta)" error={regErrors.email}>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  autoComplete="email"
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm focus:outline-none transition ${
                    regErrors.email
                      ? 'border-red-400 bg-red-50 focus:border-red-500'
                      : 'border-slate-300 focus:border-[#176b63]'
                  }`}
                />
              </div>
            </Field>

            <Field label="Telefone WhatsApp" error={regErrors.telefone}>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="tel"
                  value={telefone}
                  onChange={e => handleTelefone(e.target.value)}
                  placeholder="(84) 99999-9999"
                  autoComplete="tel"
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm focus:outline-none transition ${
                    regErrors.telefone
                      ? 'border-red-400 bg-red-50 focus:border-red-500'
                      : 'border-slate-300 focus:border-[#176b63]'
                  }`}
                />
              </div>
            </Field>

            <Field label="Senha" error={regErrors.senha}>
              <PasswordInput
                value={senha}
                onChange={setSenha}
                placeholder="Crie uma senha forte"
                error={!!regErrors.senha}
                autoComplete="new-password"
              />
              <PasswordStrength password={senha} />
            </Field>

            <Field label="Confirmar Senha" error={regErrors.confirmSenha}>
              <PasswordInput
                value={confirmSenha}
                onChange={setConfirmSenha}
                placeholder="Repita a senha"
                error={!!regErrors.confirmSenha}
                autoComplete="new-password"
              />
            </Field>

            <p className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
              O cadastro cria uma conta de <span className="font-bold text-slate-700">paciente/cliente</span>.
              Contas de profissional são criadas pelo administrador da clínica.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#176b63] hover:bg-[#0d514b] disabled:opacity-60 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Criando conta...</span>
                </>
              ) : (
                'Criar Conta e Entrar'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
