import express from "express";
import helmet from "helmet";
import cors from "cors";
import { env } from "./env.js";
import { authenticate, errorHandler } from "./middleware.js";
import { authRouter } from "./routes/auth.js";
import { equipmentRouter } from "./routes/equipment.js";
import { repairsRouter } from "./routes/repairs.js";
import { departmentsRouter, roomsRouter, typesRouter } from "./routes/reference.js";
import { usersRouter } from "./routes/users.js";
import { reportsRouter } from "./routes/reports.js";
import { aiRouter } from "./routes/ai.js";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json({ limit: "100kb" }));

  app.get("/api/health", (_req, res) => res.json({ ok: true }));
  app.use("/api/auth", authRouter);

  // Quyidagi barcha yo'llar JWT talab qiladi
  app.use("/api", authenticate);
  app.use("/api/equipment", equipmentRouter);
  app.use("/api/repairs", repairsRouter);
  app.use("/api/departments", departmentsRouter);
  app.use("/api/rooms", roomsRouter);
  app.use("/api/equipment-types", typesRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/reports", reportsRouter);
  app.use("/api/ai", aiRouter);

  app.use((_req, res) => res.status(404).json({ message: "Yo'l topilmadi" }));
  app.use(errorHandler);
  return app;
}
