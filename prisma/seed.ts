import "dotenv/config";
import { PrismaClient, Role, Province } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create an Admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@tshira.co.za" },
    update: {},
    create: {
      email: "admin@tshira.co.za",
      name: "Head Office Admin",
      role: Role.ADMIN_OFFICER,
      password: "password123", // In a real app, hash this!
    },
  });

  // Create a Provincial Coordinator for Limpopo
  const coordinator = await prisma.user.upsert({
    where: { email: "limpopo.coord@itguysa.co.za" },
    update: {},
    create: {
      email: "limpopo.coord@itguysa.co.za",
      name: "Limpopo Coordinator",
      role: Role.PROVINCIAL_COORDINATOR,
      province: Province.LIMPOPO,
      password: "password123",
    },
  });

  // Create a DCO for Limpopo
  const dco = await prisma.user.upsert({
    where: { email: "limpopo.dco@itguysa.co.za" },
    update: {},
    create: {
      email: "limpopo.dco@itguysa.co.za",
      name: "Limpopo DCO",
      role: Role.DATA_COLLECTION_OFFICER,
      province: Province.LIMPOPO,
      password: "password123",
    },
  });

  console.log("Seeding successful:", { admin: admin.email, coordinator: coordinator.email, dco: dco.email });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
