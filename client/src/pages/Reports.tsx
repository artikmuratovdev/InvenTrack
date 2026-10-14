import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api, download } from "../lib/api";
import EquipmentFilters, { type Filters } from "../components/EquipmentFilters";
import { btnGhost, btnPrimary, ConditionBadge, EmptyState, ErrorBox, Pagination, Spinner, UsageBadge } from "../components/ui";

const PAGE_SIZE = 25;

export default function Reports() {
  const [filters, setFilters] = useState<Filters>({});
  const [page, setPage] = useState(1);
  const [exportErr, setExportErr] = useState<unknown>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["report", filters, page],
    queryFn: () => api<{ items: any[]; total: number }>("/reports/inventory", { query: { ...filters, page, pageSize: PAGE_SIZE } }),
    placeholderData: keepPreviousData,
  });

  const exportAs = async (format: "xlsx" | "pdf") => {
    setBusy(format);
    setExportErr(null);
    try {
      await download("/reports/inventory/export", `inventarizatsiya.${format}`, { ...filters, format });
    } catch (e) {
      setExportErr(e);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <h1 className="text-2xl font-bold">Inventarizatsiya hisoboti</h1>
        <div className="flex gap-2">
          <button className={btnPrimary} disabled={!!busy} onClick={() => exportAs("xlsx")}>{busy === "xlsx" ? "..." : "Excel"}</button>
          <button className={btnPrimary} disabled={!!busy} onClick={() => exportAs("pdf")}>{busy === "pdf" ? "..." : "PDF"}</button>
          <button className={btnGhost} onClick={() => window.print()}>Chop etish</button>
        </div>
      </div>
      <h1 className="hidden text-xl font-bold print:block">InvenTrack — Inventarizatsiya hisoboti ({new Date().toLocaleDateString("uz-UZ")})</h1>

      <EquipmentFilters value={filters} onChange={(f) => { setFilters(f); setPage(1); }} />
      <ErrorBox error={error ?? exportErr} />

      {isLoading ? <Spinner /> : !data || data.items.length === 0 ? (
        <EmptyState title="Tanlangan filtr bo'yicha jihoz yo'q" />
      ) : (
        <>
          <p className="text-sm text-slate-500">Jami: {data.total} ta jihoz</p>
          <div className="overflow-x-auto rounded-xl bg-white shadow-sm print:shadow-none">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>{["Inventar raqam", "Nomi", "Tur", "Xona", "Bo'lim", "Mas'ul", "Holat", "Foydalanish"].map((h) => <th key={h} className="px-3 py-2 font-medium">{h}</th>)}</tr>
              </thead>
              <tbody>
                {data.items.map((e) => (
                  <tr key={e.id} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-medium">{e.inventoryNumber}</td>
                    <td className="px-3 py-2">{e.name}</td>
                    <td className="px-3 py-2">{e.type.name}</td>
                    <td className="px-3 py-2">{e.room?.name ?? "-"}</td>
                    <td className="px-3 py-2">{e.room?.department?.name ?? "-"}</td>
                    <td className="px-3 py-2">{e.responsible?.fullName ?? "-"}</td>
                    <td className="px-3 py-2"><ConditionBadge v={e.condition} /></td>
                    <td className="px-3 py-2"><UsageBadge v={e.usageStatus} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} total={data.total} pageSize={PAGE_SIZE} onChange={setPage} />
        </>
      )}
    </div>
  );
}
