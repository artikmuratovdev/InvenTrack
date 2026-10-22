import { execSync } from "node:child_process";

// Testlar alohida Postgres bazada ishlaydi (TEST_DATABASE_URL); har ishga tushganda baza tozalanadi.
export default function setup() {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) throw new Error("TEST_DATABASE_URL o'rnatilmagan (testlar bazani tozalaydi, asosiy bazadan foydalanmang)");
  execSync("npx prisma db push --skip-generate --force-reset --accept-data-loss", {
    stdio: "ignore",
    env: { ...process.env, DATABASE_URL: url, DIRECT_URL: url },
  });
}
