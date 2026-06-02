import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

let pool: Pool | undefined;

const getPrisma = () => {
  if (typeof window !== "undefined") return null;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return new Proxy({} as PrismaClient, {
      get(_, prop) {
        if (prop === 'then') return undefined;
        throw new Error(`DATABASE_URL is not set. Cannot access prisma.${String(prop)} during build or without configuration.`);
      }
    });
  }

  // Create pool only once
  if (!pool) {
    pool = new Pool({ connectionString });
  }

  const adapter = new PrismaPg(pool);
  
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
};

export const prisma = globalForPrisma.prisma ?? (getPrisma() as PrismaClient);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
