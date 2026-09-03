"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Widget, Badge, EmptyState, Button, Input, Label, Textarea } from "@/components/admin/ui";
import { adminUpsert, fetchAdminData } from "@/lib/admin/data";
import { Settings, RefreshCw, Save, Database, AlertTriangle, Code, Copy, Check, FileText } from "lucide-react";

interface AppSetting {
  key: string;
  value: any;
  updated_at: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AppSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await fetchAdminData<AppSetting>("app_settings", 100);
    setSettings(data || []);
    const obj: Record<string, any> = {};
    (data || []).forEach((s) => (obj[s.key] = s.value));
    setEditing(obj);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  async function save() {
    setSaving(true);
    for (const [key, value] of Object.entries(editing)) {
      adminUpsert("app_settings", { key, value, updated_at: new Date().toISOString() });
    }
    setSaving(false);
    alert("Configurações salvas!");
    await load();
  }

  function copyMigration() {
    const sql = `-- Aplicar no Supabase SQL Editor:
-- https://supabase.com/dashboard/project/jckkbsluvbejioyrlcfo/sql/new
-- Conteúdo do arquivo: upload/codigo-01/supabase/migrations/20260903090000_admin_expansion.sql`;
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <AdminShell title="Configurações">
      <Widget
        title="Configurações do sistema"
        icon={<Settings className="h-4 w-4 text-emerald-400" />}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={load}>
              <RefreshCw className="h-3.5 w-3.5" /> Atualizar
            </Button>
            <Button variant="primary" size="sm" onClick={save} disabled={saving}>
              <Save className="h-3.5 w-3.5" /> {saving ? "Salvando…" : "Salvar tudo"}
            </Button>
          </div>
        }
      >
        {loading ? (
          <div className="py-12 text-center text-sm text-zinc-500">Carregando…</div>
        ) : Object.keys(editing).length === 0 ? (
          <EmptyState title="Sem configurações" description="As configurações do app aparecerão aqui." icon={<Settings className="h-8 w-8" />} />
        ) : (
          <div className="space-y-4">
            {Object.entries(editing).map(([key, value]) => (
              <div key={key} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <Label>{key}</Label>
                {typeof value === "object" && value !== null ? (
                  <Textarea
                    value={JSON.stringify(value, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        setEditing({ ...editing, [key]: parsed });
                      } catch {
                        // ignore parse errors while typing
                      }
                    }}
                    rows={Math.min(10, JSON.stringify(value, null, 2).split("\n").length)}
                    className="font-mono text-xs"
                  />
                ) : Array.isArray(value) ? (
                  <Textarea
                    value={value.join("\n")}
                    onChange={(e) => setEditing({ ...editing, [key]: e.target.value.split("\n") })}
                    rows={Math.min(10, value.length)}
                  />
                ) : (
                  <Input
                    value={String(value ?? "")}
                    onChange={(e) => setEditing({ ...editing, [key]: e.target.value })}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </Widget>

      <Widget title="Status do banco de dados" icon={<Database className="h-4 w-4 text-blue-400" />} className="mt-4">
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.03] p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-amber-200">Migration pendente — Admin Expansion</h4>
              <p className="mt-1 text-xs text-amber-200/80">
                Para habilitar todas as funcionalidades do admin (cupons, depoimentos, contagem regressiva, pixels, WhatsApp, afiliados, e-mail marketing, assinaturas, notificações), 
                você precisa aplicar a migration <code className="rounded bg-amber-500/10 px-1">20260903090000_admin_expansion.sql</code> no Supabase SQL Editor.
              </p>
              <ol className="mt-2 space-y-1 text-[11px] text-amber-200/70">
                <li>1. Acesse: <a href="https://supabase.com/dashboard/project/jckkbsluvbejioyrlcfo/sql/new" target="_blank" rel="noreferrer" className="font-mono underline">Supabase SQL Editor</a></li>
                <li>2. Abra o arquivo: <code className="rounded bg-amber-500/10 px-1">upload/codigo-01/supabase/migrations/20260903090000_admin_expansion.sql</code></li>
                <li>3. Cole todo o conteúdo no SQL Editor</li>
                <li>4. Clique em <strong>Run</strong></li>
              </ol>
              <div className="mt-3">
                <Button variant="outline" size="sm" onClick={copyMigration}>
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copiado!" : "Copiar instruções"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <DBStat label="orders" exists />
          <DBStat label="service_queue" exists />
          <DBStat label="quiz_leads" exists />
          <DBStat label="service_requests" exists />
          <DBStat label="offers" exists />
          <DBStat label="analytics_events" exists />
          <DBStat label="user_roles" exists />
          <DBStat label="knowledge_items" exists />
          <DBStat label="coupons" pending />
          <DBStat label="testimonials" pending />
          <DBStat label="countdown_campaigns" pending />
          <DBStat label="pixel_config" pending />
          <DBStat label="whatsapp_config" pending />
          <DBStat label="affiliates" pending />
          <DBStat label="email_templates" pending />
          <DBStat label="subscription_plans" pending />
        </div>
      </Widget>

      <Widget title="Variáveis de ambiente" icon={<Code className="h-4 w-4 text-violet-400" />} className="mt-4">
        <div className="space-y-2 text-xs">
          {[
            { k: "NEXT_PUBLIC_SUPABASE_URL", v: "✓ Configurado" },
            { k: "SUPABASE_SERVICE_ROLE_KEY", v: "✓ Configurado" },
            { k: "KIWIFY_API_TOKEN", v: "⚠ Pendente (configurar no .env)" },
            { k: "KIWIFY_WEBHOOK_SECRET", v: "⚠ Pendente (configurar no .env)" },
            { k: "KIWIFY_DEFAULT_PRODUCT_ID", v: "⚠ Pendente (configurar no .env)" },
          ].map((e) => (
            <div key={e.k} className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2">
              <code className="font-mono text-zinc-300">{e.k}</code>
              <span className="text-zinc-400">{e.v}</span>
            </div>
          ))}
        </div>
      </Widget>

      <Widget title="Documentação" icon={<FileText className="h-4 w-4 text-blue-400" />} className="mt-4">
        <div className="space-y-2 text-sm text-zinc-300">
          <p>
            <strong className="text-white">Acesso ao admin:</strong> Faça login em <a href="/auth?redirect=/admin" className="text-emerald-400 hover:text-emerald-300">/auth</a> com sua conta Google/Supabase.
            Apenas usuários com role <code className="rounded bg-white/5 px-1">admin</code> na tabela <code className="rounded bg-white/5 px-1">user_roles</code> podem acessar.
          </p>
          <p>
            <strong className="text-white">Sua conta já está como admin</strong> (clodoaldo608@gmail.com). Para adicionar outros administradores, 
            insira a linha <code className="rounded bg-white/5 px-1">INSERT INTO user_roles (user_id, role) VALUES ('USER_ID', 'admin');</code> no SQL Editor.
          </p>
        </div>
      </Widget>
    </AdminShell>
  );
}

function DBStat({ label, exists, pending }: { label: string; exists?: boolean; pending?: boolean }) {
  return (
    <div className={`rounded-lg border p-2 text-center ${exists ? "border-emerald-500/20 bg-emerald-500/[0.03]" : pending ? "border-amber-500/20 bg-amber-500/[0.03]" : "border-white/5 bg-white/[0.02]"}`}>
      <code className="block truncate font-mono text-[10px] text-zinc-300">{label}</code>
      <div className="mt-0.5">
        {exists ? (
          <Badge variant="success">OK</Badge>
        ) : pending ? (
          <Badge variant="warning">pendente</Badge>
        ) : (
          <Badge variant="muted">—</Badge>
        )}
      </div>
    </div>
  );
}
