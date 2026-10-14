import { useDeferredValue, useState } from "react";
import { Link } from "react-router-dom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import EquipmentFilters, { type Filters } from "../components/EquipmentFilters";
import { btnPrimary, ConditionBadge, EmptyState, ErrorBox, Pagination, Spinner, UsageBadge } from "../components/ui";

const PAGE_SIZE = 15;

export default function EquipmentList() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<Filters>({});
  const [page, setPage] = useState(1);
  const deferredSearch = useDeferredValue(filters.search);
  const query = { ...filters, search: deferredSearch, page, pageSize: PAGE_SIZE };

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["equipment", query],
    queryFn: () => api<{ items: any[]; total: number }>("/equipment", { query }),
    placeholderData: keepPreviousData,
  });

  const change = (f: Filters) => {
    setFilters(f);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Jihozlar</h1>
        {user?.role === "ADMIN" && <Link to="/equipment/new" className={btnPrimary}>+ Jihoz qo'shish</Link>}
      </div>
      <EquipmentFilters value={filters} onChange={change} showSearch showArchived />
      <ErrorBox error={error} />

      {isLoading ? (
        <Spinner />
      ) : data && data.items.length === 0 ? (
        <EmptyState title="Jihoz topilmadi" hint="Filtrlarni o'zgartiring yoki qidiruvni tozalang" />
      ) : (
        data && (
          <div className={isFetching ? "opacity-60" : ""}>
            {/* Desktop: jadval */}
            <div className="hidden overflow-x-auto rounded-xl bg-white shadow-sm md:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    {["Inventar raqam", "Nomi", "Tur", "Xona", "Mas'ul", "Holat", "Foydalanish"].map((h) => (
                      <th key={h} className="px-4 py-3 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((e) => (
                    <tr key={e.id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium"><Link className="text-brand hover:underline" to={`/equipment/${e.id}`}>{e.inventoryNumber}</Link></td>
                      <td className="px-4 py-3">{e.name}</td>
                      <td className="px-4 py-3">{e.type.name}</td>
                      <td className="px-4 py-3">{e.room?.name ?? "-"}</td>
                      <td className="px-4 py-3">{e.responsible?.fullName ?? "-"}</td>
                      <td className="px-4 py-3"><ConditionBadge v={e.condition} /></td>
                      <td className="px-4 py-3"><UsageBadge v={e.usageStatus} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobil: kartochkalar */}
            <div className="space-y-3 md:hidden">
              {data.items.map((e) => (
                <Link key={e.id} to={`/equipment/${e.id}`} className="block rounded-xl bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-brand">{e.inventoryNumber}</span>
                    <UsageBadge v={e.usageStatus} />
                  </div>
                  <p className="mt-1">{e.name}</p>
                  <p className="text-xs text-slate-500">{e.type.name} · {e.room?.name ?? "xona yo'q"}</p>
                  <div className="mt-2"><ConditionBadge v={e.condition} /></div>
                </Link>
              ))}
            </div>
            <Pagination page={page} total={data.total} pageSize={PAGE_SIZE} onChange={setPage} />
          </div>
        )
      )}
    </div>
  );
}
