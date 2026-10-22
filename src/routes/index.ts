import { Router } from "express";
import { authenticate } from "../middleware.js";
import { authRouter } from "./auth.js";
import { equipmentRouter } from "./equipment.js";
import { repairsRouter } from "./repairs.js";
import { departmentsRouter, roomsRouter, typesRouter } from "./reference.js";
import { usersRouter } from "./users.js";
import { reportsRouter } from "./reports.js";
import { aiRouter } from "./ai.js";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => res.json({ ok: true }));
apiRouter.use("/auth", authRouter);

// Quyidagi barcha yo'llar JWT talab qiladi
apiRouter.use(authenticate);
apiRouter.use("/equipment", equipmentRouter);
apiRouter.use("/repairs", repairsRouter);
apiRouter.use("/departments", departmentsRouter);
apiRouter.use("/rooms", roomsRouter);
apiRouter.use("/equipment-types", typesRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/reports", reportsRouter);
apiRouter.use("/ai", aiRouter);
