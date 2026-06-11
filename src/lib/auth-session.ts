import { SignJWT, jwtVerify } from 'jose';
import type { UserRole } from '@prisma/client';

const COOKIE_NAME = 'bbs_monitor_session';

export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
};

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('AUTH_SECRET doit contenir au moins 32 caractères');
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    sub: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.sub || typeof payload.email !== 'string') return null;
    return {
      id: String(payload.sub),
      email: payload.email,
      fullName: String(payload.fullName ?? ''),
      role: payload.role as UserRole,
    };
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
