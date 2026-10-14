import { useState } from "react";
import { Link } from "react-router-dom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { fmtDate, fmtMoney } from "../lib/labels";
import { btnGhost, EmptyState, ErrorBox, inputCls, Pagination, Spinner } from "../components/ui";
import { ReturnRepairModal } from "../components/RepairModals";

const PAGE_SIZE = 15;

export default function Repairs() {
  const [open, setOpen] = useState("true");
  const [page, setPage] = useState(1);
  const [returnId, setReturnId] = useState<number | null>(null);
  const query = { open: open || undefined, page, pageSize: PAGE_SIZE };

  const { data, isLoading, error } = useQuery({
    queryKey: ["repairs", query],
    queryFn: () => api<{ items: any[]; total: number }>("/repairs", { query }),
    placeholderData: keepPreviousData,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Ta'mirlar</h1>
        <select className={`${inputCls} max-w-48`} value={open} onChange={(e) => { setOpen(e.target.value); setPage(1); }} aria-label="Holat">
          <option value="true">Hozir ta'mirda</option>
          <option value="false">Yakunlangan</option>
          <option value="">Hammasi</option>
        </select>
      </div>
      <p className="text-sm text-slate-500">Yangi ta'mirni jihoz kartochkasidan "Ta'mirga yuborish" orqali qayd eting.</p>
      <ErrorBox error={error} />

      {isLoading ? <Spinner /> : !data || data.items.length === 0 ? (
        <EmptyState title="Ta'mir yozuvlari yo'q" />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>{["Jihoz", "Yuborildi", "Sabab", "Ta'mirlovchi", "Narxi", "Qaytdi", ""].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
              </thead>
              <tbody>
                {data.items.map((r) => (
                  <tr key={r.id} className="border-t border-slate-100">
                    <td className="px-4 py-3">
                      <Link className="font-medium text-brand hover:underline" to={`/equipment/${r.equipment.id}`}>{r.equipment.inventoryNumber}</Link>
                      <div className="text-xs text-slate-500">{r.equipment.name}</div>
                    </td>
                    <td className="px-4 py-3">{fmtDate(r.sentDate)}</td>
                    <td className="px-4 py-3">{r.reason}</td>
                    <td className="px-4 py-3">{r.repairer ?? "-"}</td>
                    <td className="px-4 py-3">{fmtMoney(r.cost)}</td>
                    <td className="px-4 py-3">{r.returnedDate ? fmtDate(r.returnedDate) : "-"}</td>
                    <td className="px-4 py-3 text-right">
                      {!r.returnedDate && <button className={btnGhost} onClick={() => setReturnId(r.id)}>Yakunlash</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} total={data.total} pageSize={PAGE_SIZE} onChange={setPage} />
        </>
      )}
      {returnId !== null && <ReturnRepairModal repairId={returnId} onClose={() => setReturnId(null)} />}
    </div>
  );
}
