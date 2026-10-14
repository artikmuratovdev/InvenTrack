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
  isTest: process.env.NODE_ENV === "test",
};
