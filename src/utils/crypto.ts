/**
 * Password hashing using the Web Crypto API (SHA-256).
 * No external dependency — runs entirely in the browser.
 *
 * For a production back-end you would use bcrypt/argon2 server-side.
 * For this front-end-only academic project we apply SHA-256 with a
 * deterministic per-user salt (email) so plain-text passwords are
 * never stored in localStorage.
 */

/** Returns a hex-encoded SHA-256 digest of `message`. */
async function sha256(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Hashes a password salted with the user's normalised e-mail.
 * Formula: SHA-256(`cliniflow:<email>:<password>`)
 */
export async function hashPassword(password: string, email: string): Promise<string> {
  const salted = `cliniflow:${email.toLowerCase().trim()}:${password}`;
  return sha256(salted);
}

/** Verifies a plain-text password against a stored hash. */
export async function verifyPassword(
  password: string,
  email: string,
  storedHash: string
): Promise<boolean> {
  const hash = await hashPassword(password, email);
  return hash === storedHash;
}

/**
 * Default seed password for all pre-seeded demo accounts.
 * Displayed on the login modal so evaluators know what to type.
 */
export const SEED_PASSWORD = 'Cliniflow@2026';

/**
 * Pre-computed SHA-256(cliniflow:<email>:<SEED_PASSWORD>) for each
 * seed account.  These let the mockData file use static strings
 * without needing async at module init time.
 *
 * Re-generate with Node:
 *   const c = require('crypto');
 *   const h = (e) => c.createHash('sha256')
 *     .update('cliniflow:'+e+':Cliniflow@2026').digest('hex');
 */
export const SEED_HASHES: Record<string, string> = {
  'laviniadantass@gmail.com':
    '185071f65e95abc49b7130d79bc0f154c84b65beee0fd8f3222eddb861f87e71',
  'marcos.melo@cliniflow.ufersa.br':
    '283de8716f8faca21a46360fa25d18a29dd453ee4dbf32591f48f4a0488dd4ed',
  'camila.torres@cliniflow.ufersa.br':
    '1c68c811af5d62615d0b54569df4ff90bf8c7c92d06d442e01a18a4b52f5b6c7',
  'rafael.albuquerque@cliniflow.ufersa.br':
    'd21ba3607f83cab23cdf946d9a7089a4ee1449f973c65dbee8822007dfab8fa3',
  'mariana.silva@exemplo.com.br':
    '1b5aa84a582d59c1e1b8db0e3315ff502c043e0a0c7d1320b8ea4f9d8ecb6f8f',
  'lucas.fernandes@exemplo.com.br':
    'a31d78fc708abec00bd027b380adc3e494200d409b3dda3a747e930532d9dd95',
};
