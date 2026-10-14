import { execSync } from "node:child_process";
import { rmSync } from "node:fs";

// Har test ishga tushirilganda vaqtinchalik SQLite fayl o'chirilib, yangidan yaratiladi
export default function setup() {
  for (const f of ["test.db", "test.db-journal"]) rmSync(new URL(`../prisma/${f}`, import.meta.url), { force: true });
  execSync("npx prisma db push --skip-generate", {
    stdio: "ignore",
    env: { ...process.env, DATABASE_URL: "file:./test.db" },
  });
}
