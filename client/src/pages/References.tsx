import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useDepartments, useRooms, useTypes } from "../lib/refs";
import { btnPrimary, ErrorBox, inputCls, Spinner } from "../components/ui";

function Section({
  title, queryKey, path, items, loading, extra,
}: {
  title: string;
  queryKey: string;
  path: string;
  items: { id: number; name: string }[];
  loading: boolean;
  extra?: { placeholder: string; key: string; type?: string; sub?: (i: any) => string };
}) {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [extraVal, setExtraVal] = useState("");
  const add = useMutation({
    mutationFn: () => {
      const body: Record<string, unknown> = { name };
      if (extra && extraVal !== "") body[extra.key] = extra.type === "number" ? Number(extraVal) : extraVal;
      return api(path, { method: "POST", body });
    },
    onSuccess: () => {
      setName(""); setExtraVal("");
      qc.invalidateQueries({ queryKey: [queryKey] });
    },
  });
  const submit = (e: FormEvent) => { e.preventDefault(); add.mutate(); };

  return (
    <section className="rounded-xl bg-white p-5 shadow-sm">
      <h2 className="mb-3 font-semibold">{title}</h2>
      <ErrorBox error={add.error} />
      {loading ? <Spinner /> : (
        <ul className="mb-4 divide-y divide-slate-100 text-sm">
          {items.length === 0 && <li className="py-2 text-slate-500">Hali yo'q</li>}
          {items.map((i) => (
            <li key={i.id} className="flex justify-between py-2">
              <span>{i.name}</span>
              {extra?.sub && <span className="text-slate-500">{extra.sub(i)}</span>}
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={submit} className="flex gap-2">
        <input className={inputCls} placeholder="Nomi" value={name} onChange={(e) => setName(e.target.value)} required />
        {extra && (
          <input className={`${inputCls} max-w-28`} type={extra.type ?? "text"} placeholder={extra.placeholder} value={extraVal} onChange={(e) => setExtraVal(e.target.value)} />
        )}
        <button className={btnPrimary} disabled={add.isPending}>Qo'shish</button>
      </form>
    </section>
  );
}

export default function References() {
  const deps = useDepartments();
  const rooms = useRooms();
  const types = useTypes();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Ma'lumotnomalar</h1>
      <div className="grid gap-4 lg:grid-cols-3">
        <Section title="Bo'limlar" queryKey="departments" path="/departments" items={deps.data ?? []} loading={deps.isLoading} />
        <Section
          title="Xonalar" queryKey="rooms" path="/rooms" items={rooms.data ?? []} loading={rooms.isLoading}
          extra={{ placeholder: "Qavat", key: "floor", type: "number", sub: (r) => `${r.floor}-qavat` }}
        />
        <Section title="Jihoz turlari" queryKey="types" path="/equipment-types" items={types.data ?? []} loading={types.isLoading} />
      </div>
    </div>
  );
}
