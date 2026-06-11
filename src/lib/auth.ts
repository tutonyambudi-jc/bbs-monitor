import { cookies } from 'next/headers';
import {
  COOKIE_NAME,
  createSessionToken,
  verifySessionToken,
  type SessionUser,
} from './auth-session';

export type { SessionUser };
export { COOKIE_NAME, createSessionToken, verifySessionToken };

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export function isAdmin(role: SessionUser['role']) {
  return role === 'SUPER_ADMIN' || role === 'ADMIN';
}
