import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "../lib/api";
import { useAuth } from "../lib/auth";
import { ROLE } from "../lib/labels";
import { useDepartments } from "../lib/refs";
import { Badge, btnGhost, btnPrimary, EmptyState, ErrorBox, Field, inputCls, Modal, Spinner } from "../components/ui";

function CreateUser({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const deps = useDepartments().data ?? [];
  const [f, setF] = useState({ fullName: "", email: "", password: "", role: "EMPLOYEE", departmentId: "" });
  const m = useMutation({
    mutationFn: () => api("/users", { method: "POST", body: { ...f, departmentId: f.departmentId ? Number(f.departmentId) : null } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["users"] }); qc.invalidateQueries({ queryKey: ["userOptions"] }); onClose(); },
  });
  const err = m.error instanceof ApiError ? m.error : null;
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  const submit = (e: FormEvent) => { e.preventDefault(); m.mutate(); };

  return (
    <Modal title="Yangi foydalanuvchi" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <ErrorBox error={m.error} />
        <Field label="To'liq ism" error={err?.fieldError("fullName")}><input className={inputCls} value={f.fullName} onChange={set("fullName")} required /></Field>
        <Field label="Email" error={err?.fieldError("email")}><input type="email" className={inputCls} value={f.email} onChange={set("email")} required /></Field>
        <Field label="Parol (kamida 8 belgi)" error={err?.fieldError("password")}><input type="password" className={inputCls} value={f.password} onChange={set("password")} required autoComplete="new-password" /></Field>
        <Field label="Rol">
          <select className={inputCls} value={f.role} onChange={set("role")}>
            {Object.entries(ROLE).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </Field>
        <Field label="Bo'lim">
          <select className={inputCls} value={f.departmentId} onChange={set("departmentId")}>
            <option value="">Belgilanmagan</option>
            {deps.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </Field>
        <div className="flex justify-end gap-2">
          <button type="button" className={btnGhost} onClick={onClose}>Bekor qilish</button>
          <button className={btnPrimary} disabled={m.isPending}>Saqlash</button>
        </div>
      </form>
    </Modal>
  );
}

export default function Users() {
  const { user: me } = useAuth();
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);
  const { data, isLoading, error } = useQuery({ queryKey: ["users"], queryFn: () => api<any[]>("/users") });

  const patch = useMutation({
    mutationFn: ({ id, body }: { id: number; body: object }) => api(`/users/${id}`, { method: "PATCH", body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
  const reset = useMutation({
    mutationFn: ({ id, password }: { id: number; password: string }) => api(`/users/${id}/reset-password`, { method: "POST", body: { password } }),
  });

  const resetPassword = (id: number) => {
    const password = prompt("Yangi parol (kamida 8 belgi):");
    if (password) reset.mutate({ id, password }, { onSuccess: () => alert("Parol yangilandi") });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Foydalanuvchilar</h1>
        <button className={btnPrimary} onClick={() => setCreating(true)}>+ Foydalanuvchi</button>
      </div>
      <ErrorBox error={error ?? patch.error ?? reset.error} />
      {isLoading ? <Spinner /> : !data?.length ? <EmptyState title="Foydalanuvchilar yo'q" /> : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>{["Ism", "Email", "Rol", "Holat", ""].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody>
              {data.map((u) => (
                <tr key={u.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium">{u.fullName}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">
                    <select
                      className={`${inputCls} max-w-44`} value={u.role} disabled={u.id === me?.id} aria-label="Rol"
                      onChange={(e) => patch.mutate({ id: u.id, body: { role: e.target.value } })}
                    >
                      {Object.entries(ROLE).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3"><Badge text={u.isActive ? "Faol" : "Bloklangan"} color={u.isActive ? "#3c9d6b" : "#c8553d"} /></td>
                  <td className="space-x-2 px-4 py-3 text-right whitespace-nowrap">
                    <button className={btnGhost} onClick={() => resetPassword(u.id)}>Parolni tiklash</button>
                    {u.id !== me?.id && (
                      <button className={btnGhost} onClick={() => patch.mutate({ id: u.id, body: { isActive: !u.isActive } })}>
                        {u.isActive ? "Bloklash" : "Faollashtirish"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {creating && <CreateUser onClose={() => setCreating(false)} />}
    </div>
  );
}
