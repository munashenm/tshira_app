import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const getPrisma = () => {
  if (typeof window !== "undefined") return null;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    // Return a proxy that throws only when accessed, allowing build-time imports to succeed
    return new Proxy({} as PrismaClient, {
      get(_, prop) {
        if (prop === 'then') return undefined; // Avoid issues with async/await
        throw new Error(`DATABASE_URL is not set. Cannot access prisma.${String(prop)} during build or without configuration.`);
      }
    });
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
};

export const prisma = globalForPrisma.prisma ?? (getPrisma() as PrismaClient);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
