import "dotenv/config";

const secret = process.env.JWT_SECRET ?? "";
if (secret.length < 32) {
  throw new Error("JWT_SECRET kamida 32 belgidan iborat bo'lishi kerak (.env faylini tekshiring)");
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: secret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "8h",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
  openrouterApiKey: process.env.OPENROUTER_API_KEY ?? "",
  openrouterModel: process.env.OPENROUTER_MODEL ?? "google/gemini-2.5-flash",
  isTest: process.env.NODE_ENV === "test",
};
