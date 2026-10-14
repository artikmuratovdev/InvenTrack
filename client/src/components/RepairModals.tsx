import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "../lib/api";
import { btnGhost, btnPrimary, ErrorBox, Field, inputCls, Modal } from "./ui";

const today = () => new Date().toISOString().slice(0, 10);

function useRefresh() {
  const qc = useQueryClient();
  return () => {
    ["equipment", "repairs", "dashboard"].forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
  };
}

export function SendRepairModal({ equipmentId, onClose }: { equipmentId: number; onClose: () => void }) {
  const refresh = useRefresh();
  const [f, setF] = useState({ sentDate: today(), reason: "", repairer: "", cost: "" });
  const m = useMutation({
    mutationFn: () =>
      api(`/equipment/${equipmentId}/repairs`, {
        method: "POST",
        body: {
          sentDate: f.sentDate, reason: f.reason, repairer: f.repairer || null, cost: f.cost === "" ? null : Number(f.cost),
        },
      }),
    onSuccess: () => { refresh(); onClose(); },
  });
  const err = m.error instanceof ApiError ? m.error : null;
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  const submit = (e: FormEvent) => { e.preventDefault(); m.mutate(); };

  return (
    <Modal title="Ta'mirga yuborish" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <ErrorBox error={m.error} />
        <Field label="Yuborilgan sana"><input type="date" className={inputCls} value={f.sentDate} onChange={set("sentDate")} required /></Field>
        <Field label="Sabab *" error={err?.fieldError("reason")}><textarea className={inputCls} rows={2} value={f.reason} onChange={set("reason")} required /></Field>
        <Field label="Ta'mirlovchi"><input className={inputCls} value={f.repairer} onChange={set("repairer")} /></Field>
        <Field label="Taxminiy narx (so'm)"><input type="number" min={0} className={inputCls} value={f.cost} onChange={set("cost")} /></Field>
        <div className="flex justify-end gap-2">
          <button type="button" className={btnGhost} onClick={onClose}>Bekor qilish</button>
          <button className={btnPrimary} disabled={m.isPending}>Yuborish</button>
        </div>
      </form>
    </Modal>
  );
}

export function ReturnRepairModal({ repairId, onClose }: { repairId: number; onClose: () => void }) {
  const refresh = useRefresh();
  const [f, setF] = useState({ returnedDate: today(), result: "", cost: "", usageStatus: "IN_USE", condition: "GOOD" });
  const m = useMutation({
    mutationFn: () =>
      api(`/repairs/${repairId}`, {
        method: "PATCH",
        body: {
          returnedDate: f.returnedDate, result: f.result, cost: f.cost === "" ? null : Number(f.cost),
          usageStatus: f.usageStatus, condition: f.condition,
        },
      }),
    onSuccess: () => { refresh(); onClose(); },
  });
  const err = m.error instanceof ApiError ? m.error : null;
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  const submit = (e: FormEvent) => { e.preventDefault(); m.mutate(); };

  return (
    <Modal title="Ta'mirni yakunlash" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <ErrorBox error={m.error} />
        <Field label="Qaytgan sana"><input type="date" className={inputCls} value={f.returnedDate} onChange={set("returnedDate")} required /></Field>
        <Field label="Natija *" error={err?.fieldError("result")}><textarea className={inputCls} rows={2} value={f.result} onChange={set("result")} required /></Field>
        <Field label="Yakuniy narx (so'm)"><input type="number" min={0} className={inputCls} value={f.cost} onChange={set("cost")} /></Field>
        <Field label="Qaytgandan keyingi holat">
          <select className={inputCls} value={f.condition} onChange={set("condition")}>
            <option value="GOOD">Yaxshi</option><option value="FAIR">Qoniqarli</option><option value="BROKEN">Nosoz</option>
          </select>
        </Field>
        <Field label="Foydalanish">
          <select className={inputCls} value={f.usageStatus} onChange={set("usageStatus")}>
            <option value="IN_USE">Ishlatilmoqda</option><option value="IN_STORAGE">Omborda</option>
          </select>
        </Field>
        <div className="flex justify-end gap-2">
          <button type="button" className={btnGhost} onClick={onClose}>Bekor qilish</button>
          <button className={btnPrimary} disabled={m.isPending}>Yakunlash</button>
        </div>
      </form>
    </Modal>
  );
}
