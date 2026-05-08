import bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  // Backward-compatibility path for legacy plaintext seeds.
  if (!stored.startsWith("$2")) {
    return password === stored;
  }
  return bcrypt.compare(password, stored);
}

