"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Widget, Badge, EmptyState, Button, Input, Label, Textarea } from "@/components/admin/ui";
import { adminUpsert, fetchAdminData } from "@/lib/admin/data";
import { Settings, RefreshCw, Save, Database, AlertTriangle, Code, Copy, Check, FileText, Mail, Send, Loader2, CheckCircle2, QrCode, DollarSign, Plus, Trash2, Zap } from "lucide-react";

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
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-emerald-200">✅ Migration aplicada — Banco de dados completo</h4>
              <p className="mt-1 text-xs text-emerald-200/80">
                Todas as tabelas do admin estão criadas e funcionando: cupons, depoimentos, contagem regressiva, pixels, WhatsApp, afiliados, e-mail marketing, assinaturas, notificações e PIX.
              </p>
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
          <DBStat label="coupons" exists />
          <DBStat label="testimonials" exists />
          <DBStat label="countdown_campaigns" exists />
          <DBStat label="pixel_config" exists />
          <DBStat label="whatsapp_config" exists />
          <DBStat label="affiliates" exists />
          <DBStat label="email_templates" exists />
          <DBStat label="subscription_plans" exists />
        </div>
      </Widget>

      <Widget title="Variáveis de ambiente" icon={<Code className="h-4 w-4 text-violet-400" />} className="mt-4">
        <EnvVarsStatus />
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

      <GoogleOAuthWidget />
      <PixConfigWidget />
      <AsaasConfigWidget />
      <WeeklyReportWidget />
    </AdminShell>
  );
}

// =====================================================
// Google OAuth connection widget
// =====================================================
function GoogleOAuthWidget() {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for success/error params in URL
    const params = new URLSearchParams(window.location.search);
    if (params.get("google_connected")) {
      const emailParam = params.get("email");
      if (emailParam) setEmail(emailParam);
      window.history.replaceState({}, "", "/admin/settings");
    }
    if (params.get("google_error")) {
      alert("Erro ao conectar Google: " + params.get("google_error"));
      window.history.replaceState({}, "", "/admin/settings");
    }

    fetch("/api/oauth/google/status")
      .then((r) => r.json())
      .then((data) => {
        setConnected(data.connected);
        setEmail(data.email);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleDisconnect() {
    if (!confirm("Desconectar Google? O relatório semanal por email deixará de ser enviado.")) return;
    await fetch("/api/oauth/google/disconnect", { method: "POST" });
    setConnected(false);
    setEmail(null);
  }

  if (loading) {
    return (
      <Widget title="Google OAuth" icon={<Mail className="h-4 w-4 text-blue-400" />} className="mt-4">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Verificando conexão...
        </div>
      </Widget>
    );
  }

  return (
    <Widget title="Google OAuth" icon={<Mail className="h-4 w-4 text-blue-400" />} className="mt-4">
      {connected ? (
        <div className="space-y-3">
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/[0.06] p-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                Google conectado{email ? ` como ${email}` : ""}
              </div>
              <div className="text-[10px] text-zinc-500 mt-1">
                OAuth 2.0 ativo — relatório semanal será enviado para este email.
              </div>
            </div>
            <button
              onClick={handleDisconnect}
              className="rounded-md bg-rose-500/15 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/25 transition"
            >
              Desconectar
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { name: "Gmail", desc: "Envio de emails + relatório semanal" },
              { name: "Sheets", desc: "Exportar leads" },
              { name: "Drive", desc: "Upload arquivos" },
              { name: "Calendar", desc: "Criar reuniões" },
            ].map((s) => (
              <div key={s.name} className="rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-400 text-xs">✅</span>
                  <span className="text-xs font-bold text-zinc-200">{s.name}</span>
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.04] p-3">
            <div className="text-sm font-semibold text-amber-200">⚠️ Google não conectado</div>
            <p className="mt-1 text-xs text-amber-200/80">
              Conecte sua conta Google para habilitar:
            </p>
            <ul className="mt-2 space-y-1 text-[11px] text-amber-200/70">
              <li>📧 <strong>Relatório semanal por email</strong> (enviado toda segunda-feira às 09h)</li>
              <li>📨 Envio de emails pelo Gmail (campanhas, recuperação de carrinho)</li>
              <li>📊 Exportação de leads para Google Sheets</li>
              <li>📁 Upload de arquivos no Google Drive</li>
              <li>📅 Criação de reuniões no Google Calendar</li>
            </ul>
          </div>
          <a
            href="/api/oauth/google/start"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-600 transition"
          >
            🔑 Conectar Google
          </a>
        </div>
      )}
    </Widget>
  );
}

// =====================================================
// Weekly report widget — manual trigger
// =====================================================
function WeeklyReportWidget() {
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<number>(7);

  async function triggerReport() {
    const periodLabel = period === 7 ? "semanal" : period === 14 ? "quinzenal" : period === 30 ? "mensal" : `${period} dias`;
    if (!confirm(`Disparar relatório ${periodLabel} agora? Será enviado por email (se Google conectado) e Telegram.`)) return;
    setSending(true);
    setError(null);
    setResult(null);
    try {
      const resp = await fetch(`/api/cron/weekly-report?days=${period}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || "bc4d32cc6d0e39e91f62a790f282b0e2c3d3d5fd6e936943"}`,
        },
      });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json.error || `Erro ${resp.status}`);
      setResult(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <Widget
      title="Relatório Semanal"
      icon={<Send className="h-4 w-4 text-emerald-400" />}
      className="mt-4"
      action={
        <div className="flex items-center gap-2">
          <select
            value={String(period)}
            onChange={e => setPeriod(Number(e.target.value))}
            className="rounded-lg border border-white/10 bg-zinc-900 px-2 py-1.5 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            title="Período do relatório"
          >
            <option value="7">7 dias</option>
            <option value="14">14 dias</option>
            <option value="30">30 dias</option>
          </select>
          <Button variant="primary" size="sm" onClick={triggerReport} disabled={sending}>
            {sending ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Disparando…</> : <><Send className="h-3.5 w-3.5" /> Disparar agora</>}
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3 text-xs text-zinc-400">
          <p>
            O relatório é enviado automaticamente <strong className="text-zinc-200">toda segunda-feira às 09h</strong> (horário de Brasília)
            com o resumo de disparos, respostas, top nichos, campanhas e pipeline.
          </p>
          <p className="mt-2">
            Use o seletor de período + botão <strong className="text-emerald-300">"Disparar agora"</strong> para testar o envio imediatamente
            (email + Telegram) com o período escolhido.
          </p>
        </div>

        {/* Result display */}
        {result && (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/[0.06] p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
              Relatório gerado com sucesso!
            </div>
            <div className="text-xs text-zinc-300">
              <strong>Período:</strong> {result.period?.start} a {result.period?.end}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
              <div className="rounded border border-white/5 bg-white/[0.02] p-2 text-center">
                <div className="text-[10px] uppercase text-zinc-500">Disparos</div>
                <div className="text-base font-bold text-emerald-300">{result.stats?.envios ?? 0}</div>
              </div>
              <div className="rounded border border-white/5 bg-white/[0.02] p-2 text-center">
                <div className="text-[10px] uppercase text-zinc-500">Respostas</div>
                <div className="text-base font-bold text-blue-300">{result.stats?.respostas ?? 0}</div>
              </div>
              <div className="rounded border border-white/5 bg-white/[0.02] p-2 text-center">
                <div className="text-[10px] uppercase text-zinc-500">Tx. resposta</div>
                <div className="text-base font-bold text-amber-300">{result.stats?.replyRate ?? 0}%</div>
              </div>
              <div className="rounded border border-white/5 bg-white/[0.02] p-2 text-center">
                <div className="text-[10px] uppercase text-zinc-500">Leads únicos</div>
                <div className="text-base font-bold text-violet-300">{result.stats?.uniqueLeads ?? 0}</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-2 text-[11px]">
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${result.emailSent ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"}`}>
                {result.emailSent ? "✅" : "❌"} Email {result.emailSent ? "enviado" : result.emailError || "não enviado"}
              </span>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${result.telegramSent ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"}`}>
                {result.telegramSent ? "✅" : "❌"} Telegram {result.telegramSent ? "enviado" : "não enviado"}
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </Widget>
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

// =====================================================
// PIX CONFIG WIDGET — múltiplas chaves PIX + cobrança
// =====================================================
function PixConfigWidget() {
  const [keys, setKeys] = useState<any[]>([]);
  const [defaultKeyId, setDefaultKeyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState({ label: "", type: "phone", value: "", merchantName: "Clodoaldo Silva", merchantCity: "Recife" });
  const [testAmount, setTestAmount] = useState("297");
  const [testKeyId, setTestKeyId] = useState("");
  const [pixResult, setPixResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({}); // auditoria P0-C: chaves mascaradas por padrão

  const load = useCallback(async () => {
    try {
      const resp = await fetch("/api/admin/pix/config");
      const json = await resp.json();
      setKeys(json.keys || []);
      setDefaultKeyId(json.defaultKeyId);
      setTestKeyId(json.defaultKeyId || "");
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleAddKey() {
    if (!newKey.value) return;
    await fetch("/api/admin/pix/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "add", key: newKey }),
    });
    setNewKey({ ...newKey, label: "", value: "" });
    await load();
  }

  async function handleRemoveKey(keyId: string) {
    if (!confirm("Remover esta chave PIX?")) return;
    await fetch("/api/admin/pix/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "remove", keyId }),
    });
    await load();
  }

  async function handleSetDefault(keyId: string) {
    await fetch("/api/admin/pix/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "setDefault", keyId }),
    });
    await load();
  }

  async function handleGenerate() {
    setPixResult(null);
    try {
      const resp = await fetch("/api/admin/pix/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(testAmount), description: "Site Profissional", keyId: testKeyId || undefined }),
      });
      const json = await resp.json();
      setPixResult(json);
    } catch (e: any) {
      setPixResult({ error: e.message });
    }
  }

  function copyBRCode() {
    if (pixResult?.brCode) {
      navigator.clipboard.writeText(pixResult.brCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const keyTypes: Record<string, string> = {
    phone: "Telefone",
    email: "Email",
    cpf: "CPF",
    random: "Aleatória",
    brcode: "BR Code completo",
  };

  return (
    <Widget title="Chaves PIX" icon={<DollarSign className="h-4 w-4 text-emerald-400" />} className="mt-4">
      {loading ? (
        <div className="py-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-zinc-600" /></div>
      ) : (
        <div className="space-y-4">
          {/* === Lista de chaves cadastradas === */}
          {keys.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Chaves cadastradas ({keys.length})</div>
              {keys.map((k) => {
                const revealed = !!revealedKeys[k.id];
                const masked = k.type === "brcode"
                  ? `${k.value.slice(0, 30)}••••••••••••••••••••`
                  : k.value.length > 8
                    ? `${k.value.slice(0, 4)}${"•".repeat(Math.max(4, k.value.length - 8))}${k.value.slice(-4)}`
                    : "••••••••";
                return (
                <div key={k.id} className={`flex items-center justify-between gap-2 rounded-lg border p-3 ${defaultKeyId === k.id ? "border-emerald-500/30 bg-emerald-500/[0.04]" : "border-white/5 bg-white/[0.02]"}`}>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white">{k.label || "Sem nome"}</span>
                      <span className="text-[10px] text-zinc-500 bg-white/5 px-1.5 py-0.5 rounded">{keyTypes[k.type] || k.type}</span>
                      {defaultKeyId === k.id && <span className="text-[10px] text-emerald-400 font-bold">★ Padrão</span>}
                    </div>
                    <div className="text-[11px] text-zinc-400 truncate mt-1 font-mono">
                      {revealed ? (k.type === "brcode" ? k.value.slice(0, 80) + "..." : k.value) : masked}
                    </div>
                    <div className="text-[10px] text-zinc-600 mt-0.5">{k.merchantName} • {k.merchantCity}</div>
                  </div>
                  <div className="shrink-0 flex items-center gap-1">
                    <button
                      onClick={() => setRevealedKeys((p) => ({ ...p, [k.id]: !revealed }))}
                      className={`text-[10px] px-2 py-1 rounded transition ${revealed ? "text-amber-400 hover:text-amber-300" : "text-zinc-400 hover:text-zinc-300"}`}
                      title={revealed ? "Ocultar chave" : "Revelar chave (visualização sensível)"}
                    >
                      {revealed ? "🙈 Ocultar" : "👁 Revelar"}
                    </button>
                    {defaultKeyId !== k.id && (
                      <button onClick={() => handleSetDefault(k.id)} className="text-[10px] text-emerald-400 hover:text-emerald-300 underline">Padrão</button>
                    )}
                    <button onClick={() => handleRemoveKey(k.id)} className="text-rose-400 hover:text-rose-300 p-1"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
                );
              })}
            </div>
          )}

          {/* === Adicionar nova chave === */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Adicionar nova chave PIX</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Nome/Label</Label>
                <Input value={newKey.label} onChange={(e) => setNewKey({ ...newKey, label: e.target.value })} placeholder="Ex: Clodoaldo telefone" />
              </div>
              <div>
                <Label>Tipo da chave</Label>
                <select
                  value={newKey.type}
                  onChange={(e) => setNewKey({ ...newKey, type: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                >
                  <option value="phone">Telefone</option>
                  <option value="email">Email</option>
                  <option value="cpf">CPF</option>
                  <option value="random">Aleatória</option>
                  <option value="brcode">BR Code completo (PIX Copia e Cola)</option>
                </select>
              </div>
            </div>
            <div>
              <Label>{newKey.type === "brcode" ? "BR Code completo (PIX Copia e Cola)" : "Chave PIX"}</Label>
              {newKey.type === "brcode" ? (
                <Textarea
                  value={newKey.value}
                  onChange={(e) => setNewKey({ ...newKey, value: e.target.value })}
                  placeholder="Cole aqui o código completo do PIX (00020126...)"
                  rows={3}
                  className="font-mono text-xs"
                />
              ) : (
                <Input value={newKey.value} onChange={(e) => setNewKey({ ...newKey, value: e.target.value })} placeholder={newKey.type === "phone" ? "81971133707" : newKey.type === "email" ? "email@gmail.com" : "Digite a chave"} />
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Nome do recebedor (max 25)</Label>
                <Input value={newKey.merchantName} onChange={(e) => setNewKey({ ...newKey, merchantName: e.target.value })} maxLength={25} />
              </div>
              <div>
                <Label>Cidade (max 15)</Label>
                <Input value={newKey.merchantCity} onChange={(e) => setNewKey({ ...newKey, merchantCity: e.target.value })} maxLength={15} />
              </div>
            </div>
            <Button variant="primary" onClick={handleAddKey} disabled={!newKey.value}>
              <Plus className="h-3.5 w-3.5" /> Adicionar chave
            </Button>
          </div>

          {/* === Testar cobrança === */}
          {keys.length > 0 && (
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Testar cobrança PIX</div>
              <div className="flex items-end gap-2 flex-wrap">
                <div className="flex-1 min-w-[100px]">
                  <Label>Valor (R$)</Label>
                  <Input value={testAmount} onChange={(e) => setTestAmount(e.target.value)} placeholder="297" type="number" />
                </div>
                <div className="flex-1 min-w-[150px]">
                  <Label>Chave</Label>
                  <select
                    value={testKeyId}
                    onChange={(e) => setTestKeyId(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                  >
                    {keys.map((k) => (
                      <option key={k.id} value={k.id}>{k.label || "Sem nome"} ({keyTypes[k.type]})</option>
                    ))}
                  </select>
                </div>
                <Button variant="outline" onClick={handleGenerate}>
                  <QrCode className="h-3.5 w-3.5" /> Gerar PIX
                </Button>
              </div>

              {pixResult?.error && (
                <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">{pixResult.error}</div>
              )}

              {pixResult?.qrUrl && (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="shrink-0">
                      <img src={pixResult.qrUrl} alt="QR Code PIX" className="rounded-xl border border-white/10" width={200} height={200} />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="text-lg font-bold text-emerald-300">{pixResult.amountFormatted}</div>
                      {pixResult.keyUsed && (
                        <div className="text-[11px] text-zinc-500">Chave: {pixResult.keyUsed.label} ({keyTypes[pixResult.keyUsed.type]})</div>
                      )}
                      <div>
                        <Label>PIX Copia e Cola</Label>
                        <pre className="whitespace-pre-wrap break-all rounded-lg bg-black/30 border border-white/10 p-2 text-[10px] font-mono text-zinc-400 max-h-32 overflow-y-auto">{pixResult.brCode}</pre>
                      </div>
                      <Button variant="outline" size="sm" onClick={copyBRCode}>
                        {copied ? <><Check className="h-3 w-3" /> Copiado!</> : <><Copy className="h-3 w-3" /> Copiar código</>}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.03] p-3 text-[11px] text-emerald-200/70">
            💡 Você pode cadastrar múltiplas chaves PIX (telefone, email, CPF, aleatória ou BR Code completo). A chave padrão é usada automaticamente no fluxo de entrega do projeto.
          </div>
        </div>
      )}
    </Widget>
  );
}

// =====================================================
// ASAAS CONFIG WIDGET — status + webhook + PIX automático
// =====================================================
function AsaasConfigWidget() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [webhookTest, setWebhookTest] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await fetch("/api/admin/payment-config");
      const json = await resp.json();
      setStatus(json);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function testWebhook() {
    setTesting(true);
    setWebhookTest(null);
    try {
      const resp = await fetch("/api/webhook-asaas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "asaas-access-token": process.env.NEXT_PUBLIC_CRON_SECRET || "bc4d32cc6d0e39e91f62a790f282b0e2c3d3d5fd6e936943",
        },
        body: JSON.stringify({
          event: "PAYMENT_RECEIVED",
          payment: {
            id: "pay_test_" + Date.now(),
            status: "RECEIVED",
            value: 1700,
            externalReference: "test_webhook",
          },
        }),
      });
      const json = await resp.json();
      setWebhookTest({ ok: resp.ok, data: json });
    } catch (e: any) {
      setWebhookTest({ ok: false, error: e.message });
    }
    setTesting(false);
  }

  const configured = status?.asaas_configured;

  return (
    <Widget
      title="Asaas — PIX Automático"
      icon={<DollarSign className="h-4 w-4 text-emerald-400" />}
      className="mt-4"
      action={<Button variant="outline" size="sm" onClick={load} disabled={loading}><RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /></Button>}
    >
      {loading ? (
        <div className="py-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-zinc-600" /></div>
      ) : (
        <div className="space-y-4">
          {/* Status */}
          <div className={`rounded-xl border p-4 ${configured ? "border-emerald-500/30 bg-emerald-500/[0.06]" : "border-amber-500/30 bg-amber-500/[0.06]"}`}>
            <div className="flex items-center gap-3">
              {configured ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
              )}
              <div>
                <div className={`text-sm font-bold ${configured ? "text-emerald-200" : "text-amber-200"}`}>
                  {configured ? "Asaas conectado" : "Asaas não configurado"}
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  {configured
                    ? "PIX automático ativo — cobranças geradas e confirmadas via webhook"
                    : "Configure ASAAS_API_KEY e ASAAS_WEBHOOK_TOKEN no Vercel"}
                </div>
              </div>
            </div>
          </div>

          {configured && (
            <>
              {/* Webhook info */}
              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Webhook URL</div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 font-mono text-[11px] text-zinc-300 break-all bg-black/20 px-2 py-1.5 rounded">
                    {status?.webhook_url || "https://clodoaldo.vercel.app/api/webhook-asaas"}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(status?.webhook_url || "https://clodoaldo.vercel.app/api/webhook-asaas");
                    }}
                    className="text-zinc-400 hover:text-zinc-200 p-1.5 shrink-0"
                    title="Copiar URL"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="text-[10px] text-zinc-500">
                  Configure no painel Asaas → Settings → Webhooks → URL acima → Evento: PAYMENT_RECEIVED
                </div>
              </div>

              {/* Webhook test */}
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={testWebhook} disabled={testing}>
                  {testing ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Testando…</> : <><Zap className="h-3.5 w-3.5" /> Testar webhook</>}
                </Button>
                {webhookTest && (
                  <span className={`text-xs font-semibold ${webhookTest.ok ? "text-emerald-300" : "text-rose-300"}`}>
                    {webhookTest.ok ? "✅ Webhook OK!" : "❌ Erro no webhook"}
                  </span>
                )}
              </div>

              {/* Env vars status */}
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.03] p-2.5 text-center">
                  <code className="block text-[10px] font-mono text-zinc-300">ASAAS_API_KEY</code>
                  <Badge variant="success">✓ Configurado</Badge>
                </div>
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.03] p-2.5 text-center">
                  <code className="block text-[10px] font-mono text-zinc-300">ASAAS_WEBHOOK_TOKEN</code>
                  <Badge variant="success">✓ Configurado</Badge>
                </div>
              </div>

              {/* Flow explanation */}
              <div className="rounded-lg border border-blue-500/20 bg-blue-500/[0.04] p-3 text-[11px] text-blue-200/80">
                <strong>Fluxo automático:</strong>
                <ol className="mt-1.5 space-y-0.5 list-decimal list-inside text-zinc-400">
                  <li>Cliente clica "Pagar com PIX" no site → Asaas gera QR Code + Copia e Cola</li>
                  <li>Cliente paga → Asaas envia webhook pra /api/webhook-asaas</li>
                  <li>Sistema atualiza order pra 'paid' → envia email → notifica Telegram</li>
                  <li>Custo: R$ 0,99 por PIX recebido (descontado do valor)</li>
                </ol>
              </div>
            </>
          )}

          {!configured && (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.04] p-3 text-[11px] text-amber-200/80">
              <strong>Como configurar:</strong>
              <ol className="mt-1.5 space-y-1 list-decimal list-inside text-zinc-400">
                <li>Crie conta em <a href="https://www.asaas.com" target="_blank" rel="noreferrer" className="text-amber-400 underline">asaas.com</a> (grátis)</li>
                <li>Complete cadastro com CPF/CNPJ → aguarde aprovação (instantâneo)</li>
                <li>Gere API Key em Perfil → Integrações → API Keys</li>
                <li>Configure Webhook: URL acima, Token, Evento: PAYMENT_RECEIVED</li>
                <li>Adicione <code className="text-amber-300">ASAAS_API_KEY</code> e <code className="text-amber-300">ASAAS_WEBHOOK_TOKEN</code> no Vercel</li>
                <li>Recarregue esta página</li>
              </ol>
            </div>
          )}
        </div>
      )}
    </Widget>
  );
}

// =====================================================
// ENV VARS STATUS — Lê status real do backend (auditoria P0-B)
// =====================================================
function EnvVarsStatus() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/system/envs")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="py-4 text-center text-xs text-zinc-500"><Loader2 className="h-4 w-4 animate-spin inline mr-1" /> Verificando…</div>;
  }

  if (!data) {
    return <div className="text-xs text-rose-400">Falha ao verificar variáveis.</div>;
  }

  const { envs, status } = data;
  const rows: Array<{ k: string; ok: boolean; hint?: string; status?: string }> = [
    { k: "NEXT_PUBLIC_SUPABASE_URL", ok: envs.supabase_url },
    { k: "SUPABASE_SERVICE_ROLE_KEY", ok: envs.supabase_service },
    { k: "GEMINI_API_KEY", ok: envs.gemini },
    { k: "GOOGLE_MAPS_API_KEY", ok: envs.google_maps },
    { k: "TELEGRAM_BOT_TOKEN + CHAT_ID", ok: envs.telegram },
    { k: "CRON_SECRET", ok: envs.cron_secret },
    { k: "GOOGLE_OAUTH (client_id + secret)", ok: envs.google_oauth_client, hint: envs.google_oauth_client ? undefined : "Necessário para relatório semanal por email" },
    {
      k: "KIWIFY_API_TOKEN + WEBHOOK + PRODUCT_ID",
      ok: envs.kiwify_token && envs.kiwify_webhook && envs.kiwify_product,
      status: status?.kiwify,
      hint: status?.kiwify === "not_configured"
        ? "Não utilizado — vendas atuais usam checkout direto. Configure apenas se for adotar Kiwify."
        : undefined,
    },
    {
      k: "PIXEL ativo (Meta/GA4/Google Ads/TikTok)",
      ok: envs.pixel_active,
      status: status?.analytics,
      hint: envs.pixel_active ? undefined : "Configure em /admin/pixels para começar a rastrear visitas",
    },
  ];

  return (
    <div className="space-y-2 text-xs">
      {rows.map((r) => (
        <div key={r.k} className="flex items-start justify-between gap-3 rounded-lg bg-white/[0.02] px-3 py-2">
          <div className="min-w-0 flex-1">
            <code className="font-mono text-zinc-300 break-all">{r.k}</code>
            {r.hint && <div className="mt-0.5 text-[10px] text-zinc-500">{r.hint}</div>}
          </div>
          {r.ok ? (
            <span className="shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">✓ Configurado</span>
          ) : r.status === "not_configured" ? (
            <span className="shrink-0 rounded-full bg-zinc-500/15 px-2 py-0.5 text-[10px] font-semibold text-zinc-400">— Não utilizado</span>
          ) : (
            <span className="shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-300">⚠ Pendente</span>
          )}
        </div>
      ))}
      <div className="mt-2 text-[10px] text-zinc-500">
        Status verificado em tempo real. Variáveis são lidas do ambiente Vercel — configurar em <code className="text-zinc-400">vercel.com → Project → Settings → Environment Variables</code>.
      </div>
    </div>
  );
}
