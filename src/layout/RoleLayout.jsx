// src/components/layout/RoleLayout.jsx
import DashboardLayout from "./DashboardLayout";
import { Outlet } from "react-router-dom";

export default function RoleLayout() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}
