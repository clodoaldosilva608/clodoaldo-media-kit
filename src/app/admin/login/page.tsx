import { Suspense } from "react";
import AdminLoginForm from "./admin-login-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Login — Clodoaldo Silva",
  description: "Painel administrativo — acesso restrito",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0f]" />}>
      <AdminLoginForm />
    </Suspense>
  );
}
