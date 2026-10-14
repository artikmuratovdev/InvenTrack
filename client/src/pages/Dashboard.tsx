import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../lib/api";
import { ACTION, CONDITION, CONDITION_COLOR, USAGE, USAGE_COLOR, fmtDateTime, humanValue } from "../lib/labels";
import { EmptyState, ErrorBox, Spinner } from "../components/ui";

interface Stat { key: string; count: number }
interface Dash {
  total: number;
  openRepairs: number;
  byCondition: Stat[];
  byUsageStatus: Stat[];
  recent: any[];
}

const Card = ({ label, value, accent }: { label: string; value: number; accent: string }) => (
  <div className="rounded-xl bg-white p-5 shadow-sm">
    <p className="text-sm text-slate-500">{label}</p>
    <p className="mt-1 text-4xl font-bold" style={{ color: accent }}>{value}</p>
  </div>
);

export default function Dashboard() {
  const { data, isLoading, error } = useQuery({ queryKey: ["dashboard"], queryFn: () => api<Dash>("/reports/dashboard") });
  if (isLoading) return <Spinner />;
  if (error || !data) return <ErrorBox error={error} />;

  const cond = data.byCondition.map((s) => ({ name: CONDITION[s.key] ?? s.key, value: s.count, color: CONDITION_COLOR[s.key] }));
  const usage = data.byUsageStatus.map((s) => ({ name: USAGE[s.key] ?? s.key, value: s.count, color: USAGE_COLOR[s.key] }));
  const inUse = data.byUsageStatus.find((s) => s.key === "IN_USE")?.count ?? 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card label="Jami jihoz" value={data.total} accent="#0b3c49" />
        <Card label="Ishlatilmoqda" value={inUse} accent="#3c9d6b" />
        <Card label="Ta'mirda" value={data.openRepairs} accent="#f2a541" />
        <Card label="Nosoz" value={data.byCondition.find((s) => s.key === "BROKEN")?.count ?? 0} accent="#c8553d" />
      </div>

      {data.total === 0 ? (
        <EmptyState title="Hali jihoz yo'q" hint="Jihozlar bo'limidan birinchi jihozni qo'shing" />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <h2 className="mb-2 font-semibold">Texnik holat bo'yicha</h2>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={cond} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} label>
                  {cond.map((c) => <Cell key={c.name} fill={c.color} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <h2 className="mb-2 font-semibold">Foydalanish holati bo'yicha</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={usage}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" name="Soni">
                  {usage.map((c) => <Cell key={c.name} fill={c.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-semibold">Oxirgi o'zgarishlar</h2>
        {data.recent.length === 0 ? (
          <p className="text-sm text-slate-500">O'zgarishlar yo'q</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {data.recent.map((h) => (
              <li key={h.id} className="flex flex-col gap-1 py-2 text-sm sm:flex-row sm:items-center sm:justify-between">
                <span>
                  <Link className="font-medium text-brand hover:underline" to={`/equipment/${h.equipment.id}`}>{h.equipment.inventoryNumber}</Link>{" "}
                  {ACTION[h.action] ?? h.action}
                  {h.newValue && <span className="text-slate-500"> → {humanValue(h.newValue)}</span>}
                </span>
                <span className="text-xs text-slate-500">{h.changedBy?.fullName} · {fmtDateTime(h.changedAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
