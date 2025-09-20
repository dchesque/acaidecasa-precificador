import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Autenticação - AçaíDeCasa",
  description: "Sistema de autenticação do AçaíDeCasa Precificador",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {children}
    </div>
  );
}