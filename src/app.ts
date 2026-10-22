import express from "express";
import helmet from "helmet";
import cors from "cors";
import { env } from "./env.js";
import { errorHandler } from "./middleware.js";
import { apiRouter } from "./routes/index.js";
import swaggerUi from "swagger-ui-express";
import { openapi } from "./openapi.js";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json({ limit: "100kb" }));

  app.get("/api/openapi.json", (_req, res) => res.json(openapi));
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapi, { swaggerOptions: { persistAuthorization: true } }));
  app.use("/api", apiRouter);

  app.use((_req, res) => res.status(404).json({ message: "Yo'l topilmadi" }));
  app.use(errorHandler);
  return app;
}
