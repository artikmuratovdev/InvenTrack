import { Router } from "express";
import OpenAI from "openai";
import { z } from "zod";
import { prisma } from "../db.js";
import { env } from "../env.js";
import { HttpError, validate, wrap } from "../middleware.js";
import { buildWhere, equipmentInclude } from "../services/query.js";
import { CONDITIONS, USAGE_STATUSES } from "../constants.js";
import { CONDITION_LABELS, USAGE_LABELS } from "../services/labels.js";

export const aiRouter = Router();

const bodySchema = z.object({ message: z.string().trim().min(1).max(1000) });

const SYSTEM =
  "Siz InvenTrack (universitet inventarizatsiya tizimi) yordamchisisiz. Faqat o'zbek tilida, qisqa javob bering. " +
  "Ma'lumotni faqat berilgan asboblar orqali oling, o'ylab topmang. Ma'lumot topilmasa, shuni ayting.";

const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "equipment_stats",
      description: "Jihozlar sonini holat (condition) va foydalanish (usageStatus) bo'yicha qaytaradi, ochiq ta'mirlar sonini ham.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "search_equipment",
      description: "Jihozlarni qidiradi (eng ko'pi 10 ta).",
      parameters: {
        type: "object",
        properties: {
          search: { type: "string", description: "Inventar raqam, nom, brend, model yoki seriya raqami" },
          condition: { type: "string", enum: [...CONDITIONS] },
          usageStatus: { type: "string", enum: [...USAGE_STATUSES] },
        },
      },
    },
  },
];

// Faqat o'qish; foydalanuvchi huquqi buildWhere orqali xuddi oddiy API'dagidek qo'llanadi.
async function runTool(name: string, rawArgs: string, user: Express.Request["user"] & {}) {
  const args = JSON.parse(rawArgs || "{}");
  if (name === "equipment_stats") {
    const where = buildWhere({}, user);
    const [byCondition, byUsage, openRepairs] = await Promise.all([
      prisma.equipment.groupBy({ by: ["condition"], where, _count: { _all: true } }),
      prisma.equipment.groupBy({ by: ["usageStatus"], where, _count: { _all: true } }),
      prisma.repair.count({
        where: { returnedDate: null, ...(user.role === "RESPONSIBLE" ? { equipment: { responsibleUserId: user.id } } : {}) },
      }),
    ]);
    return {
      byCondition: byCondition.map((r) => ({ key: CONDITION_LABELS[r.condition] ?? r.condition, count: r._count._all })),
      byUsageStatus: byUsage.map((r) => ({ key: USAGE_LABELS[r.usageStatus] ?? r.usageStatus, count: r._count._all })),
      openRepairs,
    };
  }
  if (name === "search_equipment") {
    const f = z
      .object({
        search: z.string().max(100).optional(),
        condition: z.enum(CONDITIONS).optional(),
        usageStatus: z.enum(USAGE_STATUSES).optional(),
      })
      .parse(args);
    const rows = await prisma.equipment.findMany({
      where: buildWhere(f, user),
      include: equipmentInclude,
      take: 10,
      orderBy: { inventoryNumber: "asc" },
    });
    return rows.map((e) => ({
      inventoryNumber: e.inventoryNumber,
      name: e.name,
      type: e.type.name,
      room: e.room?.name,
      department: e.room?.department?.name,
      condition: CONDITION_LABELS[e.condition] ?? e.condition,
      usageStatus: USAGE_LABELS[e.usageStatus] ?? e.usageStatus,
      responsible: e.responsible?.fullName,
    }));
  }
  return { error: "Noma'lum asbob" };
}

aiRouter.post(
  "/chat",
  validate(bodySchema),
  wrap(async (req, res) => {
    if (!env.openrouterApiKey) throw new HttpError(503, "AI yordamchi sozlanmagan");
    const client = new OpenAI({ apiKey: env.openrouterApiKey, baseURL: "https://openrouter.ai/api/v1" });
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM },
      { role: "user", content: req.body.message },
    ];
    for (let i = 0; i < 4; i++) {
      let msg: OpenAI.Chat.Completions.ChatCompletionMessage;
      try {
        msg = (await client.chat.completions.create({ model: env.openrouterModel, messages, tools })).choices[0].message;
      } catch {
        throw new HttpError(502, "AI xizmati hozir javob bermayapti, keyinroq urinib ko'ring");
      }
      if (!msg.tool_calls?.length) return res.json({ reply: msg.content ?? "" });
      messages.push(msg);
      for (const call of msg.tool_calls) {
        if (call.type !== "function") continue;
        let result: unknown;
        try {
          result = await runTool(call.function.name, call.function.arguments, req.user!);
        } catch {
          result = { error: "Asbob bajarilmadi" };
        }
        messages.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(result) });
      }
    }
    res.json({ reply: "Savolga javob topa olmadim, aniqroq so'rang." });
  }),
);
