import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

async function main() {
  const adapter = new PrismaNeon({
    connectionString: process.env.DATABASE_URL!,
  });
  const prisma = new PrismaClient({ adapter });

  try {
    const result = await prisma.$queryRaw<[{ now: Date }]>`SELECT NOW() as now`;
    console.log("Connected to database:", result[0].now);

    const [userCount, pokemonCount] = await Promise.all([
      prisma.user.count(),
      prisma.pokemon.count(),
    ]);

    console.log("Users:", userCount);
    console.log("Pokemon:", pokemonCount);
    console.log("Database connection and schema verified.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("Database test failed:", err);
  process.exit(1);
});
