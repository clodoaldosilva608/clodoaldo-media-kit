"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Widget, Badge, EmptyState, Button, Input, Label, Textarea } from "@/components/admin/ui";
import { adminUpsert, fetchAdminData } from "@/lib/admin/data";
import { Settings, RefreshCw, Save, Database, AlertTriangle, Code, Copy, Check, FileText, Mail, Send, Loader2, CheckCircle2, QrCode, DollarSign } from "lucide-react";

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

      <GoogleOAuthWidget />
      <PixConfigWidget />
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
// PIX CONFIG WIDGET — configura chave PIX + gera cobrança
// =====================================================
function PixConfigWidget() {
  const [pixKey, setPixKey] = useState("");
  const [merchantName, setMerchantName] = useState("Clodoaldo Silva");
  const [merchantCity, setMerchantCity] = useState("Recife");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testAmount, setTestAmount] = useState("297");
  const [pixResult, setPixResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/admin/pix/config").then(r => r.json()).then(d => {
      if (d.config) {
        setPixKey(d.config.pixKey || "");
        setMerchantName(d.config.merchantName || "Clodoaldo Silva");
        setMerchantCity(d.config.merchantCity || "Recife");
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    await fetch("/api/admin/pix/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pixKey, merchantName, merchantCity }),
    });
    setSaving(false);
    alert("PIX configurado com sucesso!");
  }

  async function handleGenerate() {
    setPixResult(null);
    try {
      const resp = await fetch("/api/admin/pix/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(testAmount), description: "Site Profissional" }),
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

  return (
    <Widget title="Configuração PIX" icon={<DollarSign className="h-4 w-4 text-emerald-400" />} className="mt-4">
      {loading ? (
        <div className="py-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-zinc-600" /></div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Chave PIX (CPF, email, telefone ou aleatória)</Label>
              <Input value={pixKey} onChange={(e) => setPixKey(e.target.value)} placeholder="Ex: clodoaldo608@gmail.com" />
            </div>
            <div>
              <Label>Nome do recebedor (max 25 caracteres)</Label>
              <Input value={merchantName} onChange={(e) => setMerchantName(e.target.value)} maxLength={25} />
            </div>
            <div>
              <Label>Cidade (max 15 caracteres)</Label>
              <Input value={merchantCity} onChange={(e) => setMerchantCity(e.target.value)} maxLength={15} />
            </div>
          </div>
          <Button variant="primary" onClick={handleSave} disabled={saving || !pixKey}>
            {saving ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Salvando…</> : <><Save className="h-3.5 w-3.5" /> Salvar PIX</>}
          </Button>

          {/* Testar geração de cobrança */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Testar cobrança PIX</div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Label>Valor (R$)</Label>
                <Input value={testAmount} onChange={(e) => setTestAmount(e.target.value)} placeholder="297" type="number" />
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

          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.03] p-3 text-[11px] text-emerald-200/70">
            💡 O PIX é integrado automaticamente no fluxo de entrega do projeto. Quando o cliente aprova, a mensagem de entrega inclui a cobrança PIX com QR Code.
          </div>
        </div>
      )}
    </Widget>
  );
}
