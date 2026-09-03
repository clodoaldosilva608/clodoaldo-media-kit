import { Suspense } from "react";
import { QuizClient } from "@/components/quiz/quiz-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quiz: Qual oferta é ideal para você? — Clodoaldo Silva",
  description: "Responda 5 perguntas rápidas e receba uma recomendação personalizada de serviço, e-book ou app ideal para o seu momento.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Quiz: Qual oferta é ideal para você? — Clodoaldo Silva",
    description: "Recomendação personalizada em 2 minutos. Bônus exclusivos para seu perfil.",
    type: "website",
    locale: "pt_BR",
  },
};

export default function QuizPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0f]" />}>
      <QuizClient />
    </Suspense>
  );
}
