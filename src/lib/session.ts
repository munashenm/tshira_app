import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { Role, Province } from "@prisma/client";

export const SESSION_COOKIE_NAME = "tshira_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

interface SessionPayload {
  sub: string;
  role: Role;
  province: Province | null;
  exp: number;
}

export interface SessionActor {
  id: string;
  role: Role;
  province: Province | null;
}

function getSecret(): string {
  const secret = process.env.AUTH_SESSION_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("Missing AUTH_SESSION_SECRET or NEXTAUTH_SECRET");
  }
  return secret;
}

function toBase64Url(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64Url(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(data: string, secret: string): string {
  return createHmac("sha256", secret).update(data).digest("base64url");
}

function safeEqualString(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a, "utf8");
  const bBuffer = Buffer.from(b, "utf8");
  if (aBuffer.length !== bBuffer.length) return false;
  return timingSafeEqual(aBuffer, bBuffer);
}

export async function createSessionCookieValue(actor: SessionActor): Promise<string> {
  const payload: SessionPayload = {
    sub: actor.id,
    role: actor.role,
    province: actor.province,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const encoded = toBase64Url(JSON.stringify(payload));
  const signature = sign(encoded, getSecret());
  return `${encoded}.${signature}`;
}

export async function parseSessionCookieValue(raw: string): Promise<SessionActor | null> {
  const [encoded, providedSig] = raw.split(".");
  if (!encoded || !providedSig) return null;

  const expectedSig = sign(encoded, getSecret());
  if (!safeEqualString(expectedSig, providedSig)) return null;

  try {
    const payload = JSON.parse(fromBase64Url(encoded)) as SessionPayload;
    if (!payload?.sub || !payload?.role || typeof payload.exp !== "number") return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return { id: payload.sub, role: payload.role, province: payload.province ?? null };
  } catch {
    return null;
  }
}

export async function getSessionActorFromCookies(): Promise<SessionActor | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!raw) return null;
  return parseSessionCookieValue(raw);
}

export function getSessionCookieConfig() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}

