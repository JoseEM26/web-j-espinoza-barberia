import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      businessName: "JEspinoza",
    },
  });

  const adminUsername = (process.env.SEED_ADMIN_USERNAME ?? "admin").toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin#JEspinoza2026";

  const existingAdmin = await prisma.user.findUnique({
    where: { username: adminUsername },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await prisma.user.create({
      data: {
        username: adminUsername,
        passwordHash,
        fullName: "Administrador JEspinoza",
        birthDate: new Date("1990-01-01"),
        role: "ADMIN",
      },
    });
    console.log(`Usuario admin creado: ${adminUsername}`);
  } else {
    console.log(`Usuario admin ya existe: ${adminUsername}`);
  }

  console.log("Seed completado.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
