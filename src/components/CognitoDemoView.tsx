/**
 * CognitoDemoView
 * ───────────────
 * Demonstração acadêmica de autenticação com Amazon Cognito (Implicit Grant).
 *
 * Fluxo completo dentro do mesmo SPA/URL:
 *  1. Visitante vê três botões (Entrar / Criar conta / Google)
 *  2. Clique redireciona para a Hosted UI do Cognito com state CSRF
 *  3. Cognito devolve para window.location.origin com #id_token=...&access_token=...
 *  4. useEffect lê o hash, valida state, salva tokens e exibe a tela de tokens JWT
 *
 * Nenhum secret do Cognito ou do Google está neste código.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  LogIn,
  UserPlus,
  Copy,
  ExternalLink,
  LogOut,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

// ─── Configuração do Cognito ──────────────────────────────────────────────────
// Apenas valores públicos — sem nenhum secret.

const COGNITO_REGION    = 'us-east-1';
const COGNITO_POOL_ID   = 'us-east-1_2plLvJx5Q';
const COGNITO_CLIENT_ID = '6hkbh9iqrcg1ij7984vqgq1ofp';
const COGNITO_DOMAIN    = 'https://us-east-12pllvjx5q.auth.us-east-1.amazoncognito.com';
const COGNITO_SCOPES    = 'openid email profile';
const JWKS_URL          = `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/${COGNITO_POOL_ID}/.well-known/jwks.json`;
const ISSUER            = `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/${COGNITO_POOL_ID}`;

// Redirect URI = raiz do site (único URL configurado no Amplify / Cognito App Client)
const REDIRECT_URI = window.location.origin;

// ─── Tipos internos ───────────────────────────────────────────────────────────

interface JwtParts {
  header:  Record<string, unknown>;
  payload: Record<string, unknown>;
}

interface TokenSession {
  idToken:     string;
  accessToken: string;
  idDecoded:   JwtParts;
  accDecoded:  JwtParts;
}

// ─── Utilitários puros (fora do componente para não recriar a cada render) ────

/** Base64url → JSON com suporte a UTF-8. */
function decodeJwtPart(b64url: string): Record<string, unknown> {
  const b64 = b64url
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(b64url.length + ((4 - (b64url.length % 4)) % 4), '=');
  const binary = atob(b64);
  const bytes  = Uint8Array.from(binary, c => c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

/** Decodifica header + payload de um JWT. Lança se malformado. */
function decodeJwt(token: string): JwtParts {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('JWT malformado');
  return { header: decodeJwtPart(parts[0]), payload: decodeJwtPart(parts[1]) };
}

/** Validações mínimas client-side (sem verificar assinatura). */
function validateJwtPayload(payload: Record<string, unknown>): string[] {
  const errors: string[] = [];
  const aud = payload.aud ?? payload.client_id;
  if (aud !== COGNITO_CLIENT_ID)
    errors.push(`aud inválido: esperado ${COGNITO_CLIENT_ID}, recebido ${String(aud)}`);
  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp === 'number' && payload.exp < now)
    errors.push(`Token expirado em ${new Date(payload.exp * 1000).toLocaleString('pt-BR')}`);
  return errors;
}

/** Gera um state aleatório e persiste no sessionStorage. */
function generateState(): string {
  const state = crypto.randomUUID();
  sessionStorage.setItem('cf_cognito_state', state);
  return state;
}

/** Verifica e consome o state. */
function consumeState(returned: string | null): boolean {
  const saved = sessionStorage.getItem('cf_cognito_state');
  sessionStorage.removeItem('cf_cognito_state');
  return !!saved && saved === returned;
}

/** Monta a URL de autenticação. */
function buildAuthUrl(endpoint: string, extra: Record<string, string> = {}): string {
  const params = new URLSearchParams({
    client_id:     COGNITO_CLIENT_ID,
    response_type: 'token',
    scope:         COGNITO_SCOPES,
    redirect_uri:  REDIRECT_URI,
    state:         generateState(),
    ...extra,
  });
  return `${COGNITO_DOMAIN}/${endpoint}?${params.toString()}`;
}

/** Formata segundos em "Xh Ym Zs". */
function fmtSeconds(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h && `${h}h`, m && `${m}m`, `${sec}s`].filter(Boolean).join(' ');
}

/** Escapa HTML simples para evitar XSS ao renderizar dados dos tokens via dangerouslySetInnerHTML. */
function esc(v: unknown): string {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Syntax highlight básico de JSON — retorna HTML string. */
function highlightJson(obj: unknown): string {
  const json = JSON.stringify(obj, null, 2);
  return json.replace(
    /("(\\u[\dA-Fa-f]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    match => {
      let cls = 'cf-jn';
      if (/^"/.test(match)) cls = /:$/.test(match) ? 'cf-jk' : 'cf-js';
      else if (/true|false|null/.test(match)) cls = 'cf-jb';
      return `<span class="${cls}">${esc(match)}</span>`;
    },
  );
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

/** Caixa de um único token JWT com raw, header/payload e tabela de claims. */
const TokenCard: React.FC<{
  label:      string;
  emoji:      string;
  badgeCls:   string;
  rawToken:   string;
  decoded:    JwtParts;
}> = ({ label, emoji, badgeCls, rawToken, decoded }) => {
  const [copied,       setCopied]       = useState(false);
  const [headerOpen,   setHeaderOpen]   = useState(false);
  const [payloadOpen,  setPayloadOpen]  = useState(true);

  const payload = decoded.payload;
  const now     = Math.floor(Date.now() / 1000);

  const copyToken = async () => {
    await navigator.clipboard.writeText(rawToken).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = rawToken;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openJwtIo = () =>
    window.open(`https://jwt.io/#debugger-io?token=${encodeURIComponent(rawToken)}`, '_blank', 'noopener,noreferrer');

  // Claims a destacar
  type ClaimRow = { key: string; val: React.ReactNode; desc: string };
  const rows: ClaimRow[] = [];

  const p = payload as Record<string, unknown>;

  if (p.iss)   rows.push({ key: 'iss',               val: <code className="cf-code">{esc(p.iss)}</code>,             desc: 'Emissor — Amazon Cognito' });
  if (p.aud)   rows.push({ key: 'aud',               val: <code className="cf-code">{esc(p.aud)}</code>,             desc: 'App Client ID que deve aceitar este token' });
  if (p.client_id) rows.push({ key: 'client_id',     val: <code className="cf-code">{esc(p.client_id)}</code>,       desc: 'App Client ID (Access Token)' });
  if (p.token_use) rows.push({ key: 'token_use',     val: <span className={`cf-pill ${p.token_use === 'id' ? 'cf-pill-purple' : 'cf-pill-blue'}`}>{esc(p.token_use)}</span>, desc: '"id" ou "access"' });
  if (p.sub)   rows.push({ key: 'sub',               val: <code className="cf-code">{esc(p.sub)}</code>,             desc: 'Identificador único imutável do usuário' });

  if (typeof p.exp === 'number') {
    const diff = p.exp - now;
    rows.push({
      key: 'exp',
      val: (
        <span>
          <span className={diff > 0 ? 'cf-exp-ok' : 'cf-exp-warn'}>
            {new Date(p.exp * 1000).toLocaleString('pt-BR')}
          </span>
          <span className="cf-muted"> ({diff > 0 ? `válido por mais ${fmtSeconds(diff)}` : `expirou há ${fmtSeconds(-diff)}`})</span>
        </span>
      ),
      desc: 'Data/hora de expiração',
    });
  }

  if (p.email)              rows.push({ key: 'email',              val: esc(p.email),                   desc: 'E-mail do usuário' });
  if (p.name)               rows.push({ key: 'name',               val: esc(p.name),                    desc: 'Nome completo' });
  if (p['cognito:username']) rows.push({ key: 'cognito:username',  val: <code className="cf-code">{esc(p['cognito:username'])}</code>, desc: 'Username interno do Cognito' });

  if (Array.isArray(p['cognito:groups'])) {
    rows.push({
      key: 'cognito:groups',
      val: (p['cognito:groups'] as string[]).map(g => (
        <span key={g} className="cf-pill cf-pill-green mr-1">{esc(g)}</span>
      )),
      desc: 'Grupos do Cognito',
    });
  }

  const identities = Array.isArray(p.identities) ? p.identities as Record<string, unknown>[] : null;
  if (identities) {
    rows.push({
      key: 'identities',
      val: identities.map((id, i) => (
        <span key={i} className="cf-google-badge mr-1">
          🌐 {esc(id.providerName)} — {esc(id.userId)}
        </span>
      )),
      desc: 'Identidade federada (provedor externo)',
    });
  }

  return (
    <div className="cf-card">
      {/* Header do card */}
      <div className="cf-card-head">
        <div className="cf-card-title">
          <span className={`cf-badge ${badgeCls}`}>{emoji} {label}</span>
          <h2 className="cf-card-h2">{label} (JWT)</h2>
        </div>
        <div className="cf-card-actions">
          <button className="cf-btn-sm cf-btn-copy" onClick={copyToken}>
            {copied ? <><CheckCircle2 className="w-3.5 h-3.5" /> Copiado!</> : <><Copy className="w-3.5 h-3.5" /> Copiar</>}
          </button>
          <button className="cf-btn-sm cf-btn-secondary" onClick={openJwtIo}>
            <ExternalLink className="w-3.5 h-3.5" /> jwt.io
          </button>
        </div>
      </div>

      {/* Token raw */}
      <textarea
        className="cf-raw"
        readOnly
        rows={3}
        spellCheck={false}
        value={rawToken}
        aria-label={`Token ${label} completo`}
      />
      <p className="cf-hint">
        💡 Ou cole o token em{' '}
        <a href="https://jwt.io" target="_blank" rel="noopener noreferrer" className="cf-link">
          https://jwt.io
        </a>{' '}
        para validar a assinatura.
      </p>

      {/* Header decodificado (colapsável) */}
      <div className="cf-section-toggle" onClick={() => setHeaderOpen(o => !o)}>
        <span className="cf-section-label">Header decodificado</span>
        {headerOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </div>
      {headerOpen && (
        <div
          className="cf-json-block"
          dangerouslySetInnerHTML={{ __html: highlightJson(decoded.header) }}
        />
      )}

      {/* Payload decodificado (colapsável) */}
      <div className="cf-section-toggle" onClick={() => setPayloadOpen(o => !o)}>
        <span className="cf-section-label">Payload decodificado</span>
        {payloadOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </div>
      {payloadOpen && (
        <div
          className="cf-json-block"
          dangerouslySetInnerHTML={{ __html: highlightJson(decoded.payload) }}
        />
      )}

      {/* Tabela de claims */}
      <div className="cf-claims-wrap">
        <div className="cf-section-label" style={{ padding: '0 0 .5rem' }}>Claims principais</div>
        <table className="cf-claims-table">
          <thead>
            <tr>
              <th>Claim</th>
              <th>Valor</th>
              <th>Descrição</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.key}>
                <td className="cf-claim-key">{r.key}</td>
                <td className="cf-claim-val">{r.val}</td>
                <td className="cf-claim-desc">{r.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Componente principal ─────────────────────────────────────────────────────

interface Props {
  /** Volta para a tela anterior no CliniFlow. */
  onBack: () => void;
}

type Screen = 'loading' | 'login' | 'tokens';

export const CognitoDemoView: React.FC<Props> = ({ onBack }) => {
  const [screen,      setScreen]      = useState<Screen>('loading');
  const [session,     setSession]     = useState<TokenSession | null>(null);
  const [loginError,  setLoginError]  = useState<{ title: string; desc: string } | null>(null);

  // ── Processa o callback do Cognito (hash fragment) ────────────────────────
  const handleCallback = useCallback(() => {
    const hash  = window.location.hash.substring(1);
    const query = window.location.search.substring(1);

    // Verifica erros no hash ou na query string
    const errorSource = new URLSearchParams(hash || query);
    const errCode = errorSource.get('error');
    const errDesc = errorSource.get('error_description');
    if (errCode) {
      // Limpa o hash sujo antes de mostrar o erro
      history.replaceState(null, '', window.location.pathname);
      setLoginError({ title: `Erro: ${errCode}`, desc: errDesc ?? 'Sem descrição adicional.' });
      setScreen('login');
      return;
    }

    // Sem hash? Verifica sessão persistida
    if (!hash) {
      const savedId  = sessionStorage.getItem('cf_id_token');
      const savedAcc = sessionStorage.getItem('cf_access_token');
      if (savedId && savedAcc) {
        try {
          const idDec  = decodeJwt(savedId);
          const accDec = decodeJwt(savedAcc);
          const exp = idDec.payload.exp as number | undefined;
          const now = Math.floor(Date.now() / 1000);
          if (exp && exp < now) throw new Error('expirado');
          setSession({ idToken: savedId, accessToken: savedAcc, idDecoded: idDec, accDecoded: accDec });
          setScreen('tokens');
          return;
        } catch {
          sessionStorage.removeItem('cf_id_token');
          sessionStorage.removeItem('cf_access_token');
        }
      }
      setScreen('login');
      return;
    }

    // Hash presente — callback do Cognito
    const params      = new URLSearchParams(hash);
    const idToken     = params.get('id_token');
    const accessToken = params.get('access_token');
    const state       = params.get('state');

    if (!idToken || !accessToken) {
      setScreen('login');
      return;
    }

    // Validação de state (proteção CSRF)
    if (!consumeState(state)) {
      history.replaceState(null, '', window.location.pathname);
      setLoginError({
        title: 'Erro: state_mismatch',
        desc:  'O parâmetro "state" não confere. Possível ataque CSRF. Tente fazer login novamente.',
      });
      setScreen('login');
      return;
    }

    // Decodifica e valida
    try {
      const idDec  = decodeJwt(idToken);
      const accDec = decodeJwt(accessToken);
      const errors = validateJwtPayload(idDec.payload);
      if (errors.length) throw new Error(errors.join(' | '));

      // Persiste (chaves propositalmente visíveis em DevTools > Session Storage)
      sessionStorage.setItem('cf_id_token',     idToken);
      sessionStorage.setItem('cf_access_token', accessToken);

      // Log intencional para fins de aula
      console.log('%c[CliniFlow Demo] ID TOKEN:',     'color:#176b63;font-weight:bold', idToken);
      console.log('%c[CliniFlow Demo] ACCESS TOKEN:', 'color:#1d4ed8;font-weight:bold', accessToken);

      // Limpa o hash da barra de endereço
      history.replaceState(null, '', window.location.pathname);

      setSession({ idToken, accessToken, idDecoded: idDec, accDecoded: accDec });
      setScreen('tokens');
    } catch (e) {
      history.replaceState(null, '', window.location.pathname);
      setLoginError({ title: 'Erro: token_invalid', desc: (e as Error).message });
      setScreen('login');
    }
  }, []);

  useEffect(() => {
    handleCallback();
  }, [handleCallback]);

  // ── Ações de navegação ────────────────────────────────────────────────────
  const goLogin  = () => window.location.href = buildAuthUrl('login');
  const goSignup = () => window.location.href = buildAuthUrl('signup');
  const goGoogle = () => window.location.href = buildAuthUrl('oauth2/authorize', { identity_provider: 'Google' });

  const handleLogout = () => {
    sessionStorage.removeItem('cf_id_token');
    sessionStorage.removeItem('cf_access_token');
    const params = new URLSearchParams({ client_id: COGNITO_CLIENT_ID, logout_uri: REDIRECT_URI });
    window.location.href = `${COGNITO_DOMAIN}/logout?${params.toString()}`;
  };

  // ── Derivados da sessão ───────────────────────────────────────────────────
  const idPayload  = session?.idDecoded.payload  as Record<string, unknown> | undefined;
  const accPayload = session?.accDecoded.payload as Record<string, unknown> | undefined;
  const userName   = String(idPayload?.name ?? idPayload?.['cognito:username'] ?? '—');
  const userEmail  = String(idPayload?.email ?? '—');
  const userPic    = typeof idPayload?.picture === 'string' ? idPayload.picture : null;
  const isGoogle   = Array.isArray(idPayload?.identities) &&
    (idPayload!.identities as Record<string, unknown>[]).some(i => i.providerName === 'Google');

  // ════════════════════════════════════════════════════════════════════════════
  //  RENDER
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="cf-root">
      {/* ── Estilos escopados (não poluem o app CliniFlow) ────────────────── */}
      <style>{`
        /* ── Escopo .cf-root ─────────────────────────────────────────── */
        .cf-root { font-family: 'Inter','Segoe UI',system-ui,-apple-system,sans-serif; min-height:100vh; background:linear-gradient(135deg,#edf5f3 0%,#f8fafc 60%,#eef2ff 100%); color:#1e293b; }

        /* Loading */
        .cf-loading { min-height:60vh; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:1rem; color:#64748b; }
        .cf-ring { width:48px; height:48px; border:4px solid #e2e8f0; border-top-color:#176b63; border-radius:50%; animation:cf-spin .9s linear infinite; }
        @keyframes cf-spin { to { transform:rotate(360deg); } }

        /* Back bar */
        .cf-backbar { max-width:960px; margin:0 auto; padding:1.25rem 1.25rem 0; }
        .cf-back-btn { display:inline-flex; align-items:center; gap:.4rem; padding:.4rem .9rem; border-radius:.6rem; border:1px solid #e2e8f0; background:#fff; color:#334155; font-size:.78rem; font-weight:700; cursor:pointer; transition:all .15s; }
        .cf-back-btn:hover { background:#f1f5f9; }

        /* Login screen */
        .cf-login-wrap { display:flex; align-items:center; justify-content:center; padding:2rem 1rem 4rem; }
        .cf-login-card { background:#fff; border-radius:1.5rem; border:1px solid #e2e8f0; box-shadow:0 10px 40px -8px rgba(0,0,0,.18); padding:2.5rem 2rem; width:100%; max-width:440px; animation:cf-fadeup .35s ease both; }
        @keyframes cf-fadeup { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }

        .cf-logo { display:flex; align-items:center; gap:.6rem; margin-bottom:1.5rem; }
        .cf-logo-icon { width:40px;height:40px; background:#176b63; border-radius:.75rem; display:flex;align-items:center;justify-content:center; color:#fff; font-size:1.2rem; font-weight:900; box-shadow:0 4px 12px rgba(23,107,99,.3); }
        .cf-logo-text { font-size:1.35rem; font-weight:800; color:#102b38; letter-spacing:-.02em; }
        .cf-logo-text span { color:#176b63; }

        .cf-h1 { font-size:1.5rem; font-weight:800; color:#102b38; letter-spacing:-.02em; margin-bottom:.3rem; }
        .cf-sub { color:#64748b; font-size:.875rem; margin-bottom:1.75rem; }

        .cf-actions { display:flex; flex-direction:column; gap:.75rem; margin-bottom:1.5rem; }
        .cf-btn { display:flex; align-items:center; justify-content:center; gap:.5rem; width:100%; padding:.875rem 1.25rem; border-radius:1rem; font-size:.9375rem; font-weight:700; cursor:pointer; border:none; transition:all .18s; }
        .cf-btn:active { transform:scale(.98); }
        .cf-btn-primary { background:#176b63; color:#fff; box-shadow:0 4px 14px rgba(23,107,99,.28); }
        .cf-btn-primary:hover { background:#0d514b; }
        .cf-btn-outline { background:#fff; color:#102b38; border:2px solid #e2e8f0; }
        .cf-btn-outline:hover { background:#f8fafc; border-color:#cbd5e1; }
        .cf-btn-google { background:#fff; color:#334155; border:2px solid #e2e8f0; }
        .cf-btn-google:hover { background:#f8fafc; border-color:#4285f4; }

        .cf-divider { display:flex; align-items:center; gap:.75rem; color:#94a3b8; font-size:.72rem; font-weight:700; text-transform:uppercase; letter-spacing:.06em; }
        .cf-divider::before,.cf-divider::after { content:''; flex:1; height:1px; background:#e2e8f0; }

        .cf-info-box { background:#e2f2ef; border:1px solid #a7d4cd; border-radius:.75rem; padding:.875rem 1rem; font-size:.78rem; color:#0d514b; line-height:1.55; }
        .cf-info-code { background:rgba(23,107,99,.12); border-radius:4px; padding:0 4px; font-family:monospace; font-size:.78em; }

        .cf-error-banner { background:#fef2f2; border:1px solid #fecaca; border-radius:.75rem; padding:.875rem 1rem; font-size:.825rem; color:#dc2626; margin-bottom:1.25rem; }
        .cf-error-banner p { margin-bottom:.4rem; }

        /* Tokens screen */
        .cf-topbar { background:#102b38; color:#fff; padding:.875rem 1.5rem; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:.75rem; position:sticky; top:0; z-index:100; box-shadow:0 2px 12px rgba(0,0,0,.2); }
        .cf-topbar-brand { display:flex; align-items:center; gap:.5rem; font-weight:800; font-size:1.1rem; }
        .cf-topbar-brand-icon { width:30px; height:30px; background:#176b63; border-radius:.5rem; display:flex;align-items:center;justify-content:center; font-weight:900; }
        .cf-topbar-brand span { color:#176b63; }
        .cf-topbar-user { display:flex; align-items:center; gap:.75rem; flex-wrap:wrap; }
        .cf-avatar { width:34px;height:34px; border-radius:50%; border:2px solid rgba(255,255,255,.25); object-fit:cover; }
        .cf-avatar-ph { width:34px;height:34px; border-radius:50%; background:#176b63; display:flex;align-items:center;justify-content:center; font-weight:800; font-size:.875rem; border:2px solid rgba(255,255,255,.25); flex-shrink:0; }
        .cf-user-name { font-weight:700; font-size:.875rem; }
        .cf-user-email { font-size:.72rem; color:rgba(255,255,255,.6); }
        .cf-logout-btn { background:rgba(255,255,255,.12); color:#fff; border:1px solid rgba(255,255,255,.2); padding:.4rem .9rem; border-radius:.5rem; font-size:.78rem; font-weight:700; cursor:pointer; display:flex;align-items:center;gap:.35rem; transition:all .15s; }
        .cf-logout-btn:hover { background:rgba(255,255,255,.22); }

        .cf-warn { background:#fffbeb; border-bottom:2px solid #fde68a; padding:.7rem 1.5rem; display:flex; align-items:center; gap:.6rem; font-size:.8125rem; color:#d97706; font-weight:600; flex-wrap:wrap; }

        .cf-main { max-width:1060px; margin:0 auto; padding:1.75rem 1.25rem 4rem; }
        .cf-page-title { font-size:1.4rem; font-weight:800; color:#102b38; letter-spacing:-.02em; margin-bottom:.3rem; }
        .cf-page-sub { color:#64748b; font-size:.875rem; margin-bottom:1.75rem; }

        /* Token card */
        .cf-card { background:#fff; border:1px solid #e2e8f0; border-radius:1.5rem; overflow:hidden; margin-bottom:1.75rem; box-shadow:0 2px 16px rgba(0,0,0,.06); }
        .cf-card-head { padding:1.1rem 1.5rem .9rem; border-bottom:1px solid #f1f5f9; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:.75rem; }
        .cf-card-title { display:flex; align-items:center; gap:.6rem; }
        .cf-card-h2 { font-size:1rem; font-weight:700; color:#102b38; }
        .cf-badge { display:inline-flex; align-items:center; gap:.3rem; padding:.2rem .7rem; border-radius:999px; font-size:.68rem; font-weight:800; text-transform:uppercase; letter-spacing:.06em; }
        .cf-badge-id     { background:#ede9fe; color:#6d28d9; }
        .cf-badge-access { background:#dbeafe; color:#1d4ed8; }
        .cf-card-actions { display:flex; gap:.5rem; flex-wrap:wrap; }
        .cf-btn-sm { padding:.35rem .85rem; font-size:.75rem; font-weight:700; border-radius:.5rem; cursor:pointer; border:none; display:flex;align-items:center;gap:.3rem; transition:all .15s; }
        .cf-btn-sm:active { transform:scale(.97); }
        .cf-btn-copy { background:#e2f2ef; color:#0d514b; }
        .cf-btn-copy:hover { background:#c3e3de; }
        .cf-btn-secondary { background:#f3f4f6; color:#334155; }
        .cf-btn-secondary:hover { background:#e2e8f0; }

        .cf-raw { display:block; width:100%; padding:.75rem 1.25rem; font-family:'JetBrains Mono','Fira Code',monospace; font-size:.68rem; line-height:1.55; color:#334155; background:#f8fafc; border:none; border-bottom:1px solid #f1f5f9; resize:none; outline:none; word-break:break-all; }
        .cf-hint { padding:.4rem 1.25rem .6rem; font-size:.72rem; color:#94a3b8; border-bottom:1px solid #f1f5f9; }
        .cf-link { color:#176b63; text-decoration:underline; }

        .cf-section-toggle { display:flex; align-items:center; justify-content:space-between; padding:.75rem 1.5rem; cursor:pointer; border-bottom:1px solid #f1f5f9; background:#fafafa; transition:background .15s; user-select:none; }
        .cf-section-toggle:hover { background:#f1f5f9; }
        .cf-section-label { font-size:.68rem; font-weight:700; text-transform:uppercase; letter-spacing:.08em; color:#94a3b8; }
        .cf-json-block { padding:.875rem 1.5rem; font-family:'JetBrains Mono','Fira Code',monospace; font-size:.7rem; line-height:1.65; overflow-x:auto; white-space:pre; background:#f8fafc; border-bottom:1px solid #f1f5f9; }
        .cf-jk { color:#0369a1; }
        .cf-js { color:#15803d; }
        .cf-jn { color:#9333ea; }
        .cf-jb { color:#d97706; }

        .cf-claims-wrap { padding:1.1rem 1.5rem; }
        .cf-claims-table { width:100%; border-collapse:collapse; font-size:.78rem; margin-top:.5rem; }
        .cf-claims-table th { text-align:left; font-size:.68rem; font-weight:700; text-transform:uppercase; letter-spacing:.07em; color:#94a3b8; padding:.35rem .6rem; background:#f8fafc; border-bottom:1px solid #e2e8f0; }
        .cf-claims-table td { padding:.5rem .6rem; border-bottom:1px solid #f1f5f9; vertical-align:top; word-break:break-word; }
        .cf-claims-table tr:last-child td { border-bottom:none; }
        .cf-claim-key { font-family:'JetBrains Mono',monospace; font-size:.7rem; color:#0369a1; white-space:nowrap; font-weight:600; width:1%; }
        .cf-claim-desc { color:#94a3b8; font-size:.7rem; }
        .cf-exp-ok { color:#15803d; font-weight:700; }
        .cf-exp-warn { color:#dc2626; font-weight:700; }
        .cf-muted { color:#94a3b8; font-size:.72rem; }
        .cf-code { font-family:'JetBrains Mono',monospace; font-size:.7rem; background:#f1f5f9; padding:.1rem .35rem; border-radius:.25rem; color:#1e293b; }
        .cf-pill { display:inline-block; padding:.12rem .5rem; border-radius:999px; font-size:.66rem; font-weight:700; }
        .cf-pill-green  { background:#dcfce7; color:#15803d; }
        .cf-pill-blue   { background:#dbeafe; color:#1d4ed8; }
        .cf-pill-purple { background:#ede9fe; color:#6d28d9; }
        .cf-google-badge { display:inline-flex;align-items:center;gap:.35rem; background:#fff;border:1.5px solid #4285f4;border-radius:999px;padding:.2rem .65rem;font-size:.72rem;font-weight:700;color:#1a73e8; }

        /* Issuer box */
        .cf-issuer { background:#fff; border:1px solid #e2e8f0; border-radius:1.5rem; padding:1.5rem; margin-bottom:1.75rem; box-shadow:0 2px 16px rgba(0,0,0,.06); }
        .cf-issuer h3 { font-size:1rem; font-weight:700; color:#102b38; margin-bottom:.875rem; }
        .cf-issuer p { font-size:.84rem; color:#334155; margin-bottom:.6rem; line-height:1.65; }
        .cf-issuer a { color:#176b63; text-decoration:underline; word-break:break-all; }
        .cf-issuer-warn { margin-top:.75rem; padding:.75rem 1rem; background:#f8fafc; border:1px solid #e2e8f0; border-radius:.6rem; font-size:.78rem; }
      `}</style>

      {/* ── LOADING ──────────────────────────────────────────────────────── */}
      {screen === 'loading' && (
        <div className="cf-loading">
          <div className="cf-ring" />
          <span>Verificando autenticação…</span>
        </div>
      )}

      {/* ── TELA 1: LOGIN ────────────────────────────────────────────────── */}
      {screen === 'login' && (
        <>
          <div className="cf-backbar">
            <button className="cf-back-btn" onClick={onBack}>
              <ArrowLeft className="w-3.5 h-3.5" />
              Voltar ao CliniFlow
            </button>
          </div>

          <div className="cf-login-wrap">
            <div className="cf-login-card">
              <div className="cf-logo">
                <div className="cf-logo-icon">✚</div>
                <span className="cf-logo-text">Clini<span>Flow</span></span>
              </div>

              <h1 className="cf-h1">Bem-vindo(a)</h1>
              <p className="cf-sub">
                Demonstração de autenticação com Amazon Cognito e tokens JWT.
              </p>

              {loginError && (
                <div className="cf-error-banner">
                  <p><strong>{loginError.title}</strong></p>
                  <p>{loginError.desc}</p>
                </div>
              )}

              <div className="cf-actions">
                <button className="cf-btn cf-btn-primary" onClick={goLogin}>
                  <LogIn className="w-4 h-4" /> Entrar com e-mail
                </button>
                <button className="cf-btn cf-btn-outline" onClick={goSignup}>
                  <UserPlus className="w-4 h-4" /> Criar conta
                </button>
                <div className="cf-divider">ou</div>
                <button className="cf-btn cf-btn-google" onClick={goGoogle}>
                  {/* Google G SVG inline */}
                  <svg width="17" height="17" viewBox="0 0 48 48" aria-hidden="true">
                    <path fill="#EA4335" d="M24 9.5c3.1 0 5.9 1.1 8.1 2.9l6-6C34.4 3.1 29.5 1 24 1 14.9 1 7.1 6.4 3.6 14.1l7 5.4C12.4 13.3 17.7 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4 6.9-10 6.9-17z"/>
                    <path fill="#FBBC05" d="M10.6 28.5A14.6 14.6 0 0 1 9.5 24c0-1.6.3-3.1.7-4.5l-7-5.4A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.5-5.8c-.3-.8-.5-1.6-.5-2.5z" transform="translate(0.4 0)"/>
                    <path fill="#34A853" d="M24 47c5.5 0 10.1-1.8 13.5-4.9l-7.5-5.8c-1.9 1.3-4.3 2-6.9 2-6.3 0-11.6-3.8-13.5-9.3l-7.5 5.8C7.1 41.6 14.9 47 24 47z" transform="translate(0.4 0)"/>
                  </svg>
                  Continuar com Google
                </button>
              </div>

              <div className="cf-info-box">
                <strong>🎓 Demonstração acadêmica</strong> — Conecta ao Amazon Cognito (User Pool{' '}
                <code className="cf-info-code">{COGNITO_POOL_ID}</code>). Após o login, os tokens JWT
                são exibidos com decodificação interativa para fins de aula.
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── TELA 2: TOKENS ───────────────────────────────────────────────── */}
      {screen === 'tokens' && session && (
        <>
          {/* Top bar */}
          <header className="cf-topbar">
            <div className="cf-topbar-brand">
              <div className="cf-topbar-brand-icon">✚</div>
              Clini<span>Flow</span>
            </div>
            <div className="cf-topbar-user">
              {userPic ? (
                <img src={userPic} alt={userName} className="cf-avatar"
                     onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              ) : (
                <div className="cf-avatar-ph">{userName.charAt(0).toUpperCase()}</div>
              )}
              <div>
                <div className="cf-user-name">{userName}</div>
                <div className="cf-user-email">{userEmail}</div>
              </div>
              <button className="cf-logout-btn" onClick={handleLogout}>
                <LogOut className="w-3.5 h-3.5" /> Sair
              </button>
            </div>
          </header>

          {/* Faixa de aviso demonstração */}
          <div className="cf-warn">
            <span>⚠️</span>
            <strong>Modo demonstração:</strong>&nbsp;exibir tokens na tela é só para a aula.
            <strong>&nbsp;Nunca faça isso em produção.</strong>
          </div>

          <main className="cf-main">
            {/* Botão voltar ao CliniFlow */}
            <button className="cf-back-btn" onClick={onBack} style={{ marginBottom: '1.25rem' }}>
              <ArrowLeft className="w-3.5 h-3.5" />
              Voltar ao CliniFlow
            </button>

            <h1 className="cf-page-title">Tokens JWT da Sessão</h1>
            <p className="cf-page-sub">
              Tokens emitidos pelo Amazon Cognito após autenticação bem-sucedida.
              Decodificação apenas local — nenhum dado sai desta página.
            </p>

            {/* ID Token */}
            <TokenCard
              label="ID Token"
              emoji="🪪"
              badgeCls="cf-badge-id"
              rawToken={session.idToken}
              decoded={session.idDecoded}
            />

            {/* Access Token */}
            <TokenCard
              label="Access Token"
              emoji="🔑"
              badgeCls="cf-badge-access"
              rawToken={session.accessToken}
              decoded={session.accDecoded}
            />

            {/* Quem emitiu este token? */}
            <div className="cf-issuer">
              <h3>🏛️ Quem emitiu este token?</h3>

              {isGoogle && (
                <p>
                  <span className="cf-google-badge">🌐 Login realizado via Google (provedor federado)</span>
                </p>
              )}

              <p>
                O claim <code className="cf-code">iss</code> (issuer) informa que quem <strong>assinou
                e emitiu</strong> estes tokens é o <strong>Amazon Cognito</strong>, User Pool{' '}
                <code className="cf-code">{COGNITO_POOL_ID}</code> na região{' '}
                <code className="cf-code">{COGNITO_REGION}</code>.
              </p>
              <p>
                Issuer esperado: <code className="cf-code">{ISSUER}</code>
              </p>

              {isGoogle && (
                <p>
                  Embora o usuário tenha entrado com a conta <strong>Google</strong>, o Cognito atuou
                  como <em>broker</em>: autenticou no Google e emitiu seus <strong>próprios tokens JWT</strong>{' '}
                  assinados com a chave privada do User Pool. O claim{' '}
                  <code className="cf-code">identities</code> registra o provedor original.
                </p>
              )}

              <p>
                O <strong>backend</strong> deve validar a assinatura usando as chaves públicas (JWKS):
              </p>
              <p>
                🔗{' '}
                <a href={JWKS_URL} target="_blank" rel="noopener noreferrer">
                  {JWKS_URL}
                </a>
              </p>

              <div className="cf-issuer-warn">
                <strong>⚠️ Importante:</strong> a validação aqui é apenas <em>client-side</em> (Base64,
                sem verificar a assinatura criptográfica). Em um sistema real, a verificação{' '}
                <strong>DEVE</strong> ocorrer no servidor com as chaves JWKS acima. Nunca confie em
                tokens apenas por tê-los decodificado no navegador.
              </div>
            </div>
          </main>
        </>
      )}
    </div>
  );
};
