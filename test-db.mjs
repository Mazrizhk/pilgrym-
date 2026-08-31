import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: "postgresql://postgres:postgres@localhost:5432/pilgrym" });
const prisma = new PrismaClient({ adapter });

try {
  const count = await prisma.user.count();
  console.log("Connected! User count:", count);

  // Test upsert
  const u = await prisma.user.upsert({
    where: { email: "test@test.com" },
    create: { email: "test@test.com", name: "Test", role: "CUSTOMER" },
    update: {}
  });
  console.log("Upsert works! User:", u.email);
  await prisma.user.delete({ where: { email: "test@test.com" } });
} catch(e) {
  console.error("Error:", e.message);
  console.error("Code:", e.code);
  console.error("Meta:", JSON.stringify(e.meta));
} finally {
  await prisma.$disconnect();
}
