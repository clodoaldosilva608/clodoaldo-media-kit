"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { Widget, Badge, EmptyState, Button, Input, Label, Select, Textarea } from "@/components/admin/ui";
import {
  CheckCircle2, Plus, RefreshCw, Trash2, X, Loader2, ExternalLink,
  Send, Eye, MessageCircle, AlertCircle, Settings, Package,
  DollarSign, FileText, Clock, Shield, Smartphone, Globe,
} from "lucide-react";
import {
  STATUS_LABELS, STATUS_COLORS, PROJECT_TYPE_LABELS,
  type ApprovalProject, type ApprovalSettings, type AdditionalService,
  type ApprovalChangeRequest, type ApprovalRevision,
} from "@/lib/approvals";
import { ProjectEditor } from "./project-editor";
import { SettingsPanel } from "./settings-panel";
import { ServicesManager } from "./services-manager";

type View = "list" | "new" | "edit" | "settings" | "services";

export default function AdminAprovacoesPage() {
  const [view, setView] = useState<View>("list");
  const [projects, setProjects] = useState<ApprovalProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const url = filterStatus
        ? `/api/admin/approvals/projects?status=${filterStatus}`
        : "/api/admin/approvals/projects";
      const r = await fetch(url, { cache: "no-store" });
      const json = await r.json();
      setProjects(json.data || []);
    } catch {
      setProjects([]);
    }
    setLoading(false);
  }, [filterStatus]);

  useEffect(() => { load(); }, [load]);

  return (
    <AdminShell title="Portal de Aprovação — Projetos enviados a clientes">
      <div className="mb-4 flex flex-wrap gap-1.5 rounded-full border border-white/5 bg-white/[0.03] p-0.5">
        <button
          onClick={() => setView("list")}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition ${view === "list" ? "bg-emerald-500/20 text-emerald-300" : "text-zinc-400 hover:text-zinc-200"}`}
        >
          <FileText className="h-4 w-4" /> Projetos ({projects.length})
        </button>
        <button
          onClick={() => { setView("new"); setEditingId(null); }}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition ${view === "new" ? "bg-emerald-500/20 text-emerald-300" : "text-zinc-400 hover:text-zinc-200"}`}
        >
          <Plus className="h-4 w-4" /> Novo projeto
        </button>
        <button
          onClick={() => setView("services")}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition ${view === "services" ? "bg-emerald-500/20 text-emerald-300" : "text-zinc-400 hover:text-zinc-200"}`}
        >
          <Package className="h-4 w-4" /> Serviços adicionais
        </button>
        <button
          onClick={() => setView("settings")}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition ${view === "settings" ? "bg-emerald-500/20 text-emerald-300" : "text-zinc-400 hover:text-zinc-200"}`}
        >
          <Settings className="h-4 w-4" /> Configurações
        </button>
      </div>

      {view === "list" && (
        <Widget
          title="Projetos de Aprovação"
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />}
          action={<Button variant="outline" size="sm" onClick={load} disabled={loading}><RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} /><span className="ml-1">Atualizar</span></Button>}
        >
          <div className="mb-4 flex flex-wrap gap-2 items-center">
            <Label className="text-[10px]">Filtrar status:</Label>
            <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="max-w-[200px]">
              <option value="">Todos</option>
              <option value="draft">Rascunho</option>
              <option value="sent">Enviado</option>
              <option value="in_review">Em revisão</option>
              <option value="changes_requested">Alterações solicitadas</option>
              <option value="awaiting_payment">Aguardando pagamento</option>
              <option value="approved">Aprovado</option>
              <option value="archived">Arquivado</option>
              <option value="expired">Expirado</option>
            </Select>
          </div>

          {loading ? (
            <div className="py-12 text-center text-zinc-500"><Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin" />Carregando...</div>
          ) : projects.length === 0 ? (
            <EmptyState
              icon={<FileText className="h-8 w-8 text-zinc-600" />}
              title="Nenhum projeto ainda"
              description="Crie seu primeiro projeto de aprovação para enviar a um cliente."
            />
          ) : (
            <div className="space-y-2">
              {projects.map((p) => (
                <div
                  key={p.id}
                  className="rounded-xl border border-white/5 bg-white/[0.02] p-4 hover:bg-emerald-500/[0.04] hover:border-emerald-500/20 transition cursor-pointer"
                  onClick={() => { setEditingId(p.id); setView("edit"); }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-white text-sm">{p.project_title}</h4>
                        <Badge variant="muted">{PROJECT_TYPE_LABELS[p.project_type]}</Badge>
                        <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset ${STATUS_COLORS[p.status]}`}>{STATUS_LABELS[p.status]}</span>
                      </div>
                      <div className="mt-1 text-xs text-zinc-400">{p.client_name} · {p.client_email || p.client_whatsapp || "sem contato"}</div>
                      <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-zinc-500">
                        <span><Clock className="h-3 w-3 inline" /> Revisão {p.current_revision}/{p.max_revisions}</span>
                        <span><FileText className="h-3 w-3 inline" /> Criado {new Date(p.created_at).toLocaleDateString("pt-BR")}</span>
                        {p.sent_at && <span><Send className="h-3 w-3 inline" /> Enviado {new Date(p.sent_at).toLocaleDateString("pt-BR")}</span>}
                        {p.approved_at && <span><CheckCircle2 className="h-3 w-3 inline text-emerald-400" /> Aprovado {new Date(p.approved_at).toLocaleDateString("pt-BR")}</span>}
                        {p.expires_at && <span><AlertCircle className="h-3 w-3 inline" /> Expira {new Date(p.expires_at).toLocaleDateString("pt-BR")}</span>}
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-zinc-500 shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Widget>
      )}

      {(view === "new" || view === "edit") && (
        <ProjectEditor
          projectId={editingId}
          onClose={() => { setView("list"); setEditingId(null); }}
          onSaved={() => { load(); setView("list"); setEditingId(null); }}
        />
      )}

      {view === "settings" && <SettingsPanel />}
      {view === "services" && <ServicesManager />}
    </AdminShell>
  );
}
