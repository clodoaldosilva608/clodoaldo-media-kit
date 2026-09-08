import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const calculatorSchema = z.object({
  intent: z.enum(["marca", "creator", "empresa"]),
  budget_range: z.enum(["ate-2k", "2k-5k", "5k-15k", "15k+", "flexivel"]),
  deadline: z.enum(["7d", "15d", "30d", "60d", "flexivel"]),
  complexity: z.enum(["simples", "media", "complexa"]).default("media"),
  addons: z.array(z.string()).max(10).default([]),
  name: z.string().max(120).optional(),
  email: z.string().email().max(254).optional(),
  whatsapp: z.string().max(30).optional(),
  company: z.string().max(120).optional(),
  project_idea: z.string().max(2000).optional(),
});

const SERVICE_PRICE_TABLE = {
  marca: [
    { slug: "mencoes-patrocinadas", name: "Menções Patrocinadas", base: 70_000 },
    { slug: "video-dedicado", name: "Vídeo Dedicado", base: 150_000 },
    { slug: "serie-stories", name: "Série de Stories", base: 90_000 },
    { slug: "combo-completo", name: "Combo Completo", base: 297_000 },
  ],
  creator: [
    { slug: "roteiro-estrategico", name: "Roteiro Estratégico", base: 49_700 },
    { slug: "edicao-viral", name: "Edição Viral", base: 79_700 },
    { slug: "pack-criativos", name: "Pack de Criativos", base: 67_000 },
    { slug: "auditoria-de-perfil", name: "Auditoria de Perfil", base: 97_000 },
  ],
  empresa: [
    { slug: "site-institucional", name: "Site Institucional", base: 2_500_000 },
    { slug: "landing-page-conversao", name: "Landing Page de Conversão", base: 1_500_000 },
    { slug: "app-mvp", name: "App / MVP sob medida", base: 5_000_000 },
    { slug: "projeto-sob-medida", name: "Projeto sob medida", base: 3_000_000 },
  ],
};

const BUDGET_RANGES: Record<string, { min: number; max: number }> = {
  "ate-2k": { min: 500_00, max: 200_000 },
  "2k-5k": { min: 200_000, max: 500_000 },
  "5k-15k": { min: 500_000, max: 1_500_000 },
  "15k+": { min: 1_500_000, max: 10_000_000 },
  "flexivel": { min: 500_00, max: 5_000_000 },
};

const DEADLINE_LABELS: Record<string, string> = {
  "7d": "5 a 7 dias úteis",
  "15d": "10 a 15 dias úteis",
  "30d": "20 a 30 dias úteis",
  "60d": "45 a 60 dias úteis",
  "flexivel": "A combinar (preferencialmente 20-30 dias)",
};

const COMPLEXITY_MULTIPLIER: Record<string, number> = {
  simples: 1.0,
  media: 1.2,
  complexa: 1.5,
};

function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function getServiceRationale(slug: string): string {
  const rationales: Record<string, string> = {
    "mencoes-patrocinadas": "Menção orgânica integrada ao conteúdo — ideal para quem quer exposição sem produção de vídeo dedicado.",
    "video-dedicado": "Vídeo 100% dedicado à sua marca com roteiro estratégico e CTA de conversão.",
    "serie-stories": "Sequência de stories com narrativa construída para gerar curiosidade e clique.",
    "combo-completo": "Pacote completo: vídeo + stories + menção. Maior alcance e impacto combinado.",
    "roteiro-estrategico": "3 roteiros personalizados para você gravar — ideal para quem quer melhorar conteúdo próprio.",
    "edicao-viral": "Edição premium do seu material bruto com ritmo viral, legendas e B-roll.",
    "pack-criativos": "Banco de criativos (fotos/vídeos curtos) para você usar em redes sociais.",
    "auditoria-de-perfil": "Diagnóstico completo do seu perfil + plano de ação para 30 dias.",
    "site-institucional": "Site institucional profissional, responsivo, com SEO local e integração WhatsApp.",
    "landing-page-conversao": "Landing page focada em conversão (captura de lead ou venda direta).",
    "app-mvp": "MVP de aplicativo web/mobile — ideação, design, desenvolvimento e publicação.",
    "projeto-sob-medida": "Projeto digital sob medida — escopo definido em conjunto conforme sua necessidade.",
  };
  return rationales[slug] || "Serviço recomendado com base no seu perfil.";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = calculatorSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    const input = parsed.data;

    const serviceOptions = SERVICE_PRICE_TABLE[input.intent];
    const budget = BUDGET_RANGES[input.budget_range];
    const multiplier = COMPLEXITY_MULTIPLIER[input.complexity];

    const recommended = serviceOptions
      .map((s) => ({
        slug: s.slug,
        name: s.name,
        base_price_cents: Math.round(s.base * multiplier),
        rationale: getServiceRationale(s.slug),
      }))
      .filter((s) => s.base_price_cents <= budget.max * 1.2)
      .slice(0, 3);

    if (recommended.length === 0 && serviceOptions.length > 0) {
      const cheapest = serviceOptions.reduce((a, b) => (a.base < b.base ? a : b));
      recommended.push({
        slug: cheapest.slug,
        name: cheapest.name,
        base_price_cents: Math.round(cheapest.base * multiplier),
        rationale: getServiceRationale(cheapest.slug),
      });
    }

    const totalMin = recommended.reduce((sum, s) => sum + s.base_price_cents, 0);
    const totalMax = Math.round(totalMin * 1.4);
    const investmentMin = Math.max(totalMin, budget.min);
    const investmentMax = Math.min(totalMax, budget.max * 1.3);

    const bonus: string[] = [];
    if (investmentMin >= 500_000) bonus.push("E-book '30 Ganchos para Reels' liberado");
    if (investmentMin >= 1_000_000) bonus.push("1 auditoria de perfil complementar");
    if (investmentMin >= 2_000_000) bonus.push("1 mês de suporte por WhatsApp após entrega");
    if (bonus.length === 0) bonus.push("Material de apoio para execução");

    const validUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const result = {
      intent: input.intent,
      recommended_services: recommended,
      investment_range: {
        min_cents: investmentMin,
        max_cents: investmentMax,
        min_label: formatBRL(investmentMin),
        max_label: formatBRL(investmentMax),
      },
      estimated_days: DEADLINE_LABELS[input.deadline],
      bonus,
      proposal_valid_until: validUntil.toISOString(),
      notes: "Esta é uma estimativa automatizada baseada nos parâmetros fornecidos. O valor final pode variar conforme briefing detalhado. Esta proposta não cria compromisso financeiro — é apenas um ponto de partida para conversa.",
    };

    // Salvar lead no CRM se tiver dados de contato
    if (input.name && (input.email || input.whatsapp)) {
      try {
        const { getSupabaseServer } = await import("@/lib/supabase-server");
        const supabase = getSupabaseServer();
        const { data: lead } = await supabase
          .from("crm_leads")
          .insert({
            name: input.name,
            email: input.email || null,
            whatsapp: input.whatsapp || null,
            company: input.company || null,
            project_idea: input.project_idea || null,
            intent: input.intent,
            budget_range: input.budget_range,
            deadline: input.deadline,
            source: "proposta_calculadora",
            stage: "novo",
            estimated_value_cents: investmentMin,
            proposed_service_slug: recommended[0]?.slug || null,
          })
          .select()
          .single();
        if (lead) (result as any).lead_id = lead.id;
      } catch (e) {
        console.error("[proposta-calculadora] lead save error:", e);
      }
    }

    return NextResponse.json({ proposal: result });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
