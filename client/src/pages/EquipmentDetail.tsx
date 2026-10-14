import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, fetchBlob } from "../lib/api";
import { useAuth } from "../lib/auth";
import { ACTION, FIELD, fmtDate, fmtDateTime, fmtMoney, humanValue } from "../lib/labels";
import { btnDanger, btnGhost, btnPrimary, ConditionBadge, EmptyState, ErrorBox, Spinner, UsageBadge } from "../components/ui";
import { ReturnRepairModal, SendRepairModal } from "../components/RepairModals";

function QrImage({ id, label }: { id: number; label: string }) {
  const [src, setSrc] = useState<string>();
  useEffect(() => {
    let url: string | undefined;
    fetchBlob(`/equipment/${id}/qr`).then((b) => setSrc((url = URL.createObjectURL(b)))).catch(() => undefined);
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [id]);
  return src ? <img src={src} alt={`QR-kod: ${label}`} className="h-36 w-36 rounded border border-slate-200 bg-white p-1" /> : null;
}

const Row = ({ k, v }: { k: string; v: React.ReactNode }) => (
  <div className="flex justify-between gap-4 border-b border-slate-100 py-2 text-sm">
    <dt className="text-slate-500">{k}</dt>
    <dd className="text-right font-medium">{v ?? "-"}</dd>
  </div>
);

export default function EquipmentDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [sendOpen, setSendOpen] = useState(false);
  const [returnId, setReturnId] = useState<number | null>(null);

  const eq = useQuery({ queryKey: ["equipment", id], queryFn: () => api<any>(`/equipment/${id}`) });
  const history = useQuery({ queryKey: ["equipment", id, "history"], queryFn: () => api<any[]>(`/equipment/${id}/history`) });
  const repairs = useQuery({ queryKey: ["equipment", id, "repairs"], queryFn: () => api<any[]>(`/equipment/${id}/repairs`) });

  const archive = useMutation({
    mutationFn: (restore: boolean) => api(`/equipment/${id}/${restore ? "restore" : "archive"}`, { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["equipment"] }),
  });

  if (eq.isLoading) return <Spinner />;
  if (eq.error || !eq.data) return <ErrorBox error={eq.error} />;
  const e = eq.data;
  const isAdmin = user?.role === "ADMIN";
  const canEdit = isAdmin || user?.role === "RESPONSIBLE";
  const openRepair = repairs.data?.find((r) => !r.returnedDate);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link to="/equipment" className="text-sm text-brand hover:underline">← Jihozlar</Link>
          <h1 className="text-2xl font-bold">{e.inventoryNumber}</h1>
          <p className="text-slate-600">{e.name}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <ConditionBadge v={e.condition} />
            <UsageBadge v={e.usageStatus} />
            {e.isArchived && <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium">Arxivda</span>}
          </div>
        </div>
        {canEdit && !e.isArchived && (
          <div className="flex flex-wrap gap-2">
            <Link to={`/equipment/${e.id}/edit`} className={btnGhost}>Tahrirlash</Link>
            {openRepair ? (
              <button className={btnPrimary} onClick={() => setReturnId(openRepair.id)}>Ta'mirni yakunlash</button>
            ) : e.usageStatus !== "WRITTEN_OFF" ? (
              <button className={btnPrimary} onClick={() => setSendOpen(true)}>Ta'mirga yuborish</button>
            ) : null}
            {isAdmin && <button className={btnDanger} onClick={() => confirm("Jihozni arxivlaysizmi?") && archive.mutate(false)}>Arxivlash</button>}
          </div>
        )}
        {isAdmin && e.isArchived && <button className={btnPrimary} onClick={() => archive.mutate(true)}>Arxivdan tiklash</button>}
      </div>
      <ErrorBox error={archive.error} />

      <div className="grid gap-4 lg:grid-cols-3">
        <dl className="rounded-xl bg-white p-5 shadow-sm lg:col-span-2">
          <Row k="Turi" v={e.type.name} />
          <Row k="Brend / model" v={[e.brand, e.model].filter(Boolean).join(" ") || "-"} />
          <Row k="Seriya raqami" v={e.serialNumber} />
          <Row k="Xarid sanasi" v={fmtDate(e.purchaseDate)} />
          <Row k="Narxi" v={fmtMoney(e.price)} />
          <Row k="Xona" v={e.room ? `${e.room.name}${e.room.department ? ` (${e.room.department.name})` : ""}` : "-"} />
          <Row k="Mas'ul shaxs" v={e.responsible?.fullName} />
          <Row k="Izoh" v={e.notes} />
        </dl>
        <div className="flex flex-col items-center gap-2 rounded-xl bg-white p-5 shadow-sm">
          <QrImage id={e.id} label={e.inventoryNumber} />
          <p className="text-xs text-slate-500">{e.inventoryNumber}</p>
          <button className={`${btnGhost} print:hidden`} onClick={() => window.print()}>Chop etish</button>
        </div>
      </div>

      <section className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-semibold">Ta'mirlar</h2>
        {repairs.isLoading ? <Spinner /> : !repairs.data?.length ? (
          <p className="text-sm text-slate-500">Ta'mir yozuvlari yo'q</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-500">
                <tr>{["Yuborildi", "Sabab", "Ta'mirlovchi", "Narxi", "Qaytdi", "Natija"].map((h) => <th key={h} className="py-2 pr-4 font-medium">{h}</th>)}</tr>
              </thead>
              <tbody>
                {repairs.data.map((r) => (
                  <tr key={r.id} className="border-t border-slate-100">
                    <td className="py-2 pr-4">{fmtDate(r.sentDate)}</td>
                    <td className="py-2 pr-4">{r.reason}</td>
                    <td className="py-2 pr-4">{r.repairer ?? "-"}</td>
                    <td className="py-2 pr-4">{fmtMoney(r.cost)}</td>
                    <td className="py-2 pr-4">{r.returnedDate ? fmtDate(r.returnedDate) : <span className="text-amber-600">Ta'mirda</span>}</td>
                    <td className="py-2">{r.result ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-semibold">Tarix</h2>
        {history.isLoading ? <Spinner /> : !history.data?.length ? (
          <EmptyState title="Tarix bo'sh" />
        ) : (
          <ol className="relative ml-2 border-l-2 border-brand/30">
            {history.data.map((h) => (
              <li key={h.id} className="mb-5 ml-5">
                <span className="absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full bg-brand" />
                <p className="font-medium">{ACTION[h.action] ?? h.action}</p>
                {h.field && (
                  <p className="text-sm text-slate-600">
                    {FIELD[h.field] ?? h.field}: <span className="line-through">{humanValue(h.oldValue)}</span> → <b>{humanValue(h.newValue)}</b>
                  </p>
                )}
                <p className="text-xs text-slate-500">{h.changedBy?.fullName ?? "Tizim"} · {fmtDateTime(h.changedAt)}</p>
              </li>
            ))}
          </ol>
        )}
      </section>

      {sendOpen && <SendRepairModal equipmentId={e.id} onClose={() => setSendOpen(false)} />}
      {returnId !== null && <ReturnRepairModal repairId={returnId} onClose={() => setReturnId(null)} />}
    </div>
  );
}
