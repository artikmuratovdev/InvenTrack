import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "../lib/api";
import { useAuth } from "../lib/auth";
import { CONDITION, USAGE, toInputDate } from "../lib/labels";
import { useRooms, useTypes, useUserOptions } from "../lib/refs";
import { btnGhost, btnPrimary, ErrorBox, Field, inputCls, Spinner } from "../components/ui";

const empty = {
  name: "", typeId: "", brand: "", model: "", serialNumber: "", purchaseDate: "", price: "",
  roomId: "", responsibleUserId: "", condition: "NEW", usageStatus: "IN_STORAGE", notes: "",
};

export default function EquipmentForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const nav = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  const limited = user?.role === "RESPONSIBLE"; // Mas'ul faqat 3 ta maydonni o'zgartiradi

  const types = useTypes().data ?? [];
  const rooms = useRooms().data ?? [];
  const users = useUserOptions().data ?? [];
  const [form, setForm] = useState(empty);

  const existing = useQuery({ queryKey: ["equipment", id], queryFn: () => api<any>(`/equipment/${id}`), enabled: isEdit });
  useEffect(() => {
    const e = existing.data;
    if (!e) return;
    setForm({
      name: e.name, typeId: String(e.typeId), brand: e.brand ?? "", model: e.model ?? "", serialNumber: e.serialNumber ?? "",
      purchaseDate: toInputDate(e.purchaseDate), price: e.price != null ? String(e.price) : "",
      roomId: e.roomId ? String(e.roomId) : "", responsibleUserId: e.responsibleUserId ? String(e.responsibleUserId) : "",
      condition: e.condition, usageStatus: e.usageStatus, notes: e.notes ?? "",
    });
  }, [existing.data]);

  const save = useMutation({
    mutationFn: () => {
      const num = (v: string) => (v === "" ? null : Number(v));
      const str = (v: string) => (v.trim() === "" ? null : v.trim());
      const full = {
        name: form.name.trim(), typeId: Number(form.typeId), brand: str(form.brand), model: str(form.model),
        serialNumber: str(form.serialNumber), purchaseDate: str(form.purchaseDate), price: num(form.price),
        roomId: num(form.roomId), responsibleUserId: num(form.responsibleUserId),
        condition: form.condition, usageStatus: form.usageStatus, notes: str(form.notes),
      };
      const body = limited ? { condition: full.condition, usageStatus: full.usageStatus, notes: full.notes } : full;
      return isEdit ? api(`/equipment/${id}`, { method: "PATCH", body }) : api("/equipment", { method: "POST", body });
    },
    onSuccess: (r: any) => {
      qc.invalidateQueries({ queryKey: ["equipment"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      nav(`/equipment/${r.id}`);
    },
  });

  if (isEdit && existing.isLoading) return <Spinner />;
  const err = save.error instanceof ApiError ? save.error : null;
  const set = (k: keyof typeof empty) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value });
  const lock = limited; // faqat holat/foydalanish/izoh ochiq

  const submit = (e: FormEvent) => {
    e.preventDefault();
    save.mutate();
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold">{isEdit ? "Jihozni tahrirlash" : "Yangi jihoz qo'shish"}</h1>
      <ErrorBox error={err && err.errors.length === 0 ? err : err ? new ApiError(err.status, "Maydonlarni tekshiring") : null} />
      {!isEdit && <p className="text-sm text-slate-500">Inventar raqam saqlanganda avtomatik beriladi.</p>}

      <div className="grid gap-4 rounded-xl bg-white p-5 shadow-sm sm:grid-cols-2">
        <Field label="Nomi *" error={err?.fieldError("name")}>
          <input className={inputCls} value={form.name} onChange={set("name")} disabled={lock} required />
        </Field>
        <Field label="Turi *" error={err?.fieldError("typeId")}>
          <select className={inputCls} value={form.typeId} onChange={set("typeId")} disabled={lock} required>
            <option value="">Tanlang</option>
            {types.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </Field>
        <Field label="Brend"><input className={inputCls} value={form.brand} onChange={set("brand")} disabled={lock} /></Field>
        <Field label="Model"><input className={inputCls} value={form.model} onChange={set("model")} disabled={lock} /></Field>
        <Field label="Seriya raqami"><input className={inputCls} value={form.serialNumber} onChange={set("serialNumber")} disabled={lock} /></Field>
        <Field label="Xarid sanasi" error={err?.fieldError("purchaseDate")}>
          <input type="date" className={inputCls} value={form.purchaseDate} onChange={set("purchaseDate")} disabled={lock} />
        </Field>
        <Field label="Narxi (so'm)" error={err?.fieldError("price")}>
          <input type="number" min={0} className={inputCls} value={form.price} onChange={set("price")} disabled={lock} />
        </Field>
        <Field label="Xona">
          <select className={inputCls} value={form.roomId} onChange={set("roomId")} disabled={lock}>
            <option value="">Belgilanmagan</option>
            {rooms.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </Field>
        <Field label="Mas'ul shaxs">
          <select className={inputCls} value={form.responsibleUserId} onChange={set("responsibleUserId")} disabled={lock}>
            <option value="">Biriktirilmagan</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.fullName}</option>)}
          </select>
        </Field>
        <Field label="Texnik holat">
          <select className={inputCls} value={form.condition} onChange={set("condition")}>
            {Object.entries(CONDITION).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </Field>
        <Field label="Foydalanish holati" error={err?.fieldError("usageStatus")}>
          <select className={inputCls} value={form.usageStatus} onChange={set("usageStatus")} disabled={form.usageStatus === "IN_REPAIR"}>
            {Object.entries(USAGE).filter(([k]) => k !== "IN_REPAIR" || form.usageStatus === "IN_REPAIR").map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </Field>
        <div className="sm:col-span-2">
          <Field label="Izoh">
            <textarea className={inputCls} rows={3} value={form.notes} onChange={set("notes")} />
          </Field>
        </div>
      </div>

      <div className="flex gap-3">
        <button className={btnPrimary} disabled={save.isPending}>{save.isPending ? "Saqlanmoqda..." : "Saqlash"}</button>
        <button type="button" className={btnGhost} onClick={() => nav(-1)}>Bekor qilish</button>
      </div>
    </form>
  );
}
