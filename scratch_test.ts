import { PrismaClient } from "@prisma/client";
try {
  const prisma = new PrismaClient();
  console.log("PrismaClient initialized successfully");
} catch (e) {
  console.error("PrismaClient failed to initialize:", e);
}
