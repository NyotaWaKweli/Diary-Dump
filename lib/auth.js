// lib/auth.js
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const COOKIE  = 'dd_auth';
const secret  = () => new TextEncoder().encode(process.env.AUTH_SECRET);
const ONE_YEAR = 60 * 60 * 24 * 365;

export async function signToken(username) {
  return new SignJWT({ username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('365d')
    .sign(secret());
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload.username;
  } catch {
    return null;
  }
}

// Call from Server Components / Route Handlers
export async function getSession() {
  const jar   = cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function cookieOptions(token) {
  return {
    name:     COOKIE,
    value:    token,
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path:     '/',
    maxAge:   ONE_YEAR,
  };
}

export function clearCookieOptions() {
  return { name: COOKIE, value: '', maxAge: 0, path: '/' };
}

