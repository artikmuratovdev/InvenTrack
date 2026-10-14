import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import ErrorBoundary from "./ErrorBoundary";
import { useAuth } from "../lib/auth";
import { ROLE } from "../lib/labels";

export default function Layout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const isAdmin = user?.role === "ADMIN";
  const links = [
    { to: "/", label: "Dashboard", end: true },
    { to: "/equipment", label: "Jihozlar" },
    ...(user?.role !== "EMPLOYEE" ? [{ to: "/repairs", label: "Ta'mirlar" }] : []),
    { to: "/reports", label: "Hisobotlar" },
    ...(isAdmin ? [{ to: "/admin/users", label: "Foydalanuvchilar" }, { to: "/admin/references", label: "Ma'lumotnomalar" }] : []),
  ];
  const cls = ({ isActive }: { isActive: boolean }) =>
    `block rounded-lg px-3 py-2 text-sm font-medium ${isActive ? "bg-brand text-white" : "text-slate-700 hover:bg-slate-200"}`;

  return (
    <div className="min-h-screen md:flex">
      <header className="flex items-center justify-between bg-brand-dark px-4 py-3 text-white md:hidden print:hidden">
        <span className="text-lg font-bold">InvenTrack</span>
        <button onClick={() => setOpen(!open)} aria-label="Menyu" className="rounded border border-white/40 px-3 py-1">☰</button>
      </header>
      <aside className={`${open ? "block" : "hidden"} w-full shrink-0 border-r border-slate-200 bg-white p-4 md:block md:w-60 print:hidden`}>
        <div className="mb-6 hidden text-2xl font-bold text-brand-dark md:block">InvenTrack</div>
        <nav className="space-y-1" onClick={() => setOpen(false)}>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={cls}>{l.label}</NavLink>
          ))}
        </nav>
        <div className="mt-6 border-t border-slate-200 pt-4 text-sm">
          <p className="font-medium">{user?.fullName}</p>
          <p className="text-slate-500">{user ? ROLE[user.role] : ""}</p>
          <button onClick={logout} className="mt-2 text-brand hover:underline">Chiqish</button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-4 md:p-8">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
}
