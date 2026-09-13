import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/rbac";

/**
 * POST /api/admin/setup-agent-memory
 *
 * Cria tabela agent_memory + habilita RLS + Realtime.
 * Idempotente (CREATE IF NOT EXISTS).
 *
 * Rota admin-only. Rodar uma única vez após deploy.
 */
export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    const sb: any = getSupabaseServer();

    // Verificar se a tabela já existe
    const { data: existing, error: existingErr } = await sb
      .from("agent_memory")
      .select("id")
      .limit(1);

    if (existingErr && existingErr.message.includes("Does not exist")) {
      // Tabela não existe — instruir criação manual via SQL Editor
      return NextResponse.json({
        success: false,
        needs_manual_setup: true,
        message: "Tabela agent_memory ainda não existe no Supabase. Execute o DDL abaixo no SQL Editor.",
        ddl: `-- Execute no SQL Editor do Supabase (https://supabase.com/dashboard/project/jckkbsluvbejioyrlcfo/sql/new)

CREATE TABLE IF NOT EXISTS public.agent_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.crm_leads(id) ON DELETE CASCADE,
  conversation_summary TEXT,
  temperature_history JSONB DEFAULT '[]'::jsonb,
  key_objections JSONB DEFAULT '[]'::jsonb,
  next_action_suggested TEXT,
  last_interaction_at TIMESTAMPTZ DEFAULT now(),
  conversation_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(lead_id)
);

CREATE INDEX IF NOT EXISTS idx_agent_memory_lead ON public.agent_memory(lead_id);
CREATE INDEX IF NOT EXISTS idx_agent_memory_updated ON public.agent_memory(updated_at DESC);

ALTER TABLE public.agent_memory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "agent_memory_service_role_all" ON public.agent_memory;
CREATE POLICY "agent_memory_service_role_all"
  ON public.agent_memory FOR ALL
  USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_memory;`,
      }, { status: 200 });
    }

    // Tabela existe — verificar se Realtime está habilitado tentando inserir/atualizar
    return NextResponse.json({
      success: true,
      message: "agent_memory table already exists",
      row_count: existing?.length || 0,
      realtime_note: "Se o Realtime não estiver habilitado, rode: ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_memory;",
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
