/**
 * scripts/delete-all-users.ts
 *
 * Deletes every User row and everything that cascades from it: accounts,
 * sessions, collection/review data (UserPokemon), packs + pack rolls,
 * lists + list items, comments + replies, all three like tables, follows,
 * feed events, and dust transactions. Also clears VerificationToken rows,
 * which aren't FK-linked to User so cascade doesn't reach them.
 *
 * Does NOT touch the Pokemon reference table.
 *
 * Defaults to a dry run (prints counts, deletes nothing). Pass --yes to
 * actually delete.
 *
 * Run:
 *   npx tsx scripts/delete-all-users.ts          (dry run)
 *   npx tsx scripts/delete-all-users.ts --yes     (deletes for real)
 */

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "DIRECT_URL/DATABASE_URL not set. Run via `npx tsx --env-file=.env scripts/delete-all-users.ts`.",
  );
}
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const confirmed = process.argv.includes("--yes");

  const [userCount, tokenCount] = await Promise.all([
    prisma.user.count(),
    prisma.verificationToken.count(),
  ]);

  console.log(`Users to delete: ${userCount}`);
  console.log(`Verification tokens to delete: ${tokenCount}`);
  console.log(
    "This cascades to accounts, sessions, collection/reviews, packs, lists, comments, likes, follows, feed events, and dust transactions for every user.",
  );

  if (!confirmed) {
    console.log("\nDry run only — nothing was deleted. Re-run with --yes to actually delete.");
    return;
  }

  const [{ count: deletedTokens }, { count: deletedUsers }] = await prisma.$transaction([
    prisma.verificationToken.deleteMany({}),
    prisma.user.deleteMany({}),
  ]);

  console.log(`Deleted ${deletedTokens} verification token(s) and ${deletedUsers} user(s).`);
}

main()
  .catch((err) => {
    console.error("Failed to delete users:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
