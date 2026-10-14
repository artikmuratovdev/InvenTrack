import { CONDITION, USAGE } from "../lib/labels";
import { useDepartments, useRooms, useTypes } from "../lib/refs";
import { inputCls } from "./ui";

export interface Filters {
  search?: string;
  typeId?: string;
  roomId?: string;
  departmentId?: string;
  condition?: string;
  usageStatus?: string;
  archived?: string;
}

interface Props {
  value: Filters;
  onChange: (f: Filters) => void;
  showSearch?: boolean;
  showArchived?: boolean;
}

/** Jihozlar ro'yxati va hisobot sahifasi uchun umumiy filtr paneli */
export default function EquipmentFilters({ value, onChange, showSearch, showArchived }: Props) {
  const types = useTypes().data ?? [];
  const rooms = useRooms().data ?? [];
  const deps = useDepartments().data ?? [];
  const set = (k: keyof Filters) => (e: { target: { value: string } }) => onChange({ ...value, [k]: e.target.value || undefined });

  const select = (k: keyof Filters, label: string, opts: [string | number, string][]) => (
    <select className={inputCls} value={value[k] ?? ""} onChange={set(k)} aria-label={label}>
      <option value="">{label}: hammasi</option>
      {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 print:hidden">
      {showSearch && (
        <input
          className={`${inputCls} sm:col-span-2 lg:col-span-4`}
          placeholder="Qidirish: inventar raqam, nom, brend, seriya..."
          value={value.search ?? ""}
          onChange={set("search")}
        />
      )}
      {select("typeId", "Tur", types.map((t) => [t.id, t.name]))}
      {select("roomId", "Xona", rooms.map((r) => [r.id, r.name]))}
      {select("departmentId", "Bo'lim", deps.map((d) => [d.id, d.name]))}
      {select("condition", "Holat", Object.entries(CONDITION))}
      {select("usageStatus", "Foydalanish", Object.entries(USAGE))}
      {showArchived && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={value.archived === "true"} onChange={(e) => onChange({ ...value, archived: e.target.checked ? "true" : undefined })} />
          Arxivdagilar
        </label>
      )}
    </div>
  );
}
