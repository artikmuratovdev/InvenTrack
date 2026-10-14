export const CONDITION: Record<string, string> = {
  NEW: "Yangi", GOOD: "Yaxshi", FAIR: "Qoniqarli", BROKEN: "Nosoz", WRITTEN_OFF: "Hisobdan chiqarilgan",
};
export const USAGE: Record<string, string> = {
  IN_USE: "Ishlatilmoqda", IN_STORAGE: "Omborda", IN_REPAIR: "Ta'mirda", WRITTEN_OFF: "Hisobdan chiqarilgan",
};
export const ROLE: Record<string, string> = {
  ADMIN: "Administrator", RESPONSIBLE: "Mas'ul shaxs", EMPLOYEE: "Xodim",
};
export const ACTION: Record<string, string> = {
  CREATED: "Jihoz qo'shildi", UPDATED: "Ma'lumot o'zgardi", MOVED: "Ko'chirildi",
  RESPONSIBLE_CHANGED: "Mas'ul o'zgardi", CONDITION_CHANGED: "Holat o'zgardi",
  REPAIR_SENT: "Ta'mirga yuborildi", REPAIR_RETURNED: "Ta'mirdan qaytdi",
  ARCHIVED: "Arxivlandi", RESTORED: "Arxivdan tiklandi",
};
export const FIELD: Record<string, string> = {
  name: "Nomi", typeId: "Turi", brand: "Brend", model: "Model", serialNumber: "Seriya raqami",
  purchaseDate: "Xarid sanasi", price: "Narxi", roomId: "Xona", responsibleUserId: "Mas'ul",
  condition: "Texnik holat", usageStatus: "Foydalanish holati", notes: "Izoh",
};
export const CONDITION_COLOR: Record<string, string> = {
  NEW: "#0e7c86", GOOD: "#3c9d6b", FAIR: "#f2a541", BROKEN: "#c8553d", WRITTEN_OFF: "#94a3b8",
};
export const USAGE_COLOR: Record<string, string> = {
  IN_USE: "#3c9d6b", IN_STORAGE: "#5b7c99", IN_REPAIR: "#f2a541", WRITTEN_OFF: "#94a3b8",
};

export const fmtDate = (v?: string | null) => (v ? new Date(v).toLocaleDateString("uz-UZ") : "-");
export const fmtDateTime = (v: string) =>
  new Date(v).toLocaleString("uz-UZ", { dateStyle: "short", timeStyle: "short" });
export const fmtMoney = (v?: number | null) => (v == null ? "-" : `${v.toLocaleString("uz-UZ")} so'm`);
export const toInputDate = (v?: string | null) => (v ? v.slice(0, 10) : "");

/** Tarixdagi xom qiymatni (GOOD, IN_USE) o'zbekchaga o'giradi */
export const humanValue = (v?: string | null) => (v ? CONDITION[v] ?? USAGE[v] ?? v : "-");
