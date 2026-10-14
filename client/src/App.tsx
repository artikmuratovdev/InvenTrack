import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth, type User } from "./lib/auth";
import Layout from "./components/Layout";
import { Spinner } from "./components/ui";
import Login from "./pages/Login";
const Dashboard = lazy(() => import("./pages/Dashboard"));
const EquipmentList = lazy(() => import("./pages/EquipmentList"));
const EquipmentDetail = lazy(() => import("./pages/EquipmentDetail"));
const EquipmentForm = lazy(() => import("./pages/EquipmentForm"));
const Repairs = lazy(() => import("./pages/Repairs"));
const Reports = lazy(() => import("./pages/Reports"));
const Users = lazy(() => import("./pages/Users"));
const References = lazy(() => import("./pages/References"));

function Protected({ roles }: { roles?: User["role"][] }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <Layout />;
}


export default function App() {
  return (
    <Suspense fallback={<Spinner />}>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Protected />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/equipment" element={<EquipmentList />} />
        <Route path="/equipment/:id" element={<EquipmentDetail />} />
        <Route path="/reports" element={<Reports />} />
      </Route>
      <Route element={<Protected roles={["ADMIN", "RESPONSIBLE"]} />}>
        <Route path="/repairs" element={<Repairs />} />
        <Route path="/equipment/:id/edit" element={<EquipmentForm />} />
      </Route>
      <Route element={<Protected roles={["ADMIN"]} />}>
        <Route path="/equipment/new" element={<EquipmentForm />} />
        <Route path="/admin/users" element={<Users />} />
        <Route path="/admin/references" element={<References />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
  );
}
