"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Widget, Badge, EmptyState, Button, Input, Label, Select, Textarea } from "@/components/admin/ui";
import {
  Search, MapPin, Phone, Globe, Star, Plus, Save, Trash2, X, Loader2,
  AlertCircle, Download, RefreshCw, Building2, Users, CheckCircle2,
  MessageCircle, ExternalLink, Mail, Copy, Check, Zap, Clock,
  Smartphone, AlertTriangle, Code2, Eye, Layout, Shield, Share2, Link2,
  FileCheck, Send, CheckSquare, Square, Sparkles, ChevronRight,
  FileDown, Filter, Reply, MessageSquare,
} from "lucide-react";
import {
  getRelevantObjections,
  getUrgencyHooks,
  formatObjectionForDisplay,
} from "@/lib/objections";
import { generatePreviewHTML } from "@/lib/preview-generator";
import { normalizeBrazilianPhone } from "@/lib/phone-utils";

interface Lead {
  place_id?: string; id?: string; name: string; phone?: string | null;
  whatsapp?: string | null; email?: string | null; formatted_address?: string;
  city?: string; lat?: number; lng?: number; category?: string; niche?: string;
  website?: string | null; instagram?: string | null; facebook?: string | null;
  rating?: number | null; user_ratings_total?: number; source?: string;
  hasWebsite?: boolean; hasEmail?: boolean; hasWhatsApp?: boolean;
  hasSocialMedia?: boolean; webDevOpportunity?: boolean; openingHours?: string | null;
  status?: string; priority?: string; notes?: string | null; created_at?: string;
}

const NICHES = ["restaurante","barbearia","academia","salao de beleza","clinica estetica","escritorio de advocacia","consultorio odontologico","loja de roupas","papelaria","farmacia","pet shop","estetica automotiva","pizzaria","hamburgueria","cafeteria","loja de conveniencia","imobiliaria","contabilidade","agencia de marketing","estudio de pilates"];

const KANBAN = [
  { key: "new", label: "Novo", color: "blue" },
  { key: "contacted", label: "Contatado", color: "amber" },
  { key: "qualified", label: "Qualificado", color: "violet" },
  { key: "won", label: "Ganho", color: "emerald" },
  { key: "lost", label: "Perdido", color: "rose" },
];

export default function AdminParceirosPage() {
  const [view, setView] = useState<"search"|"kanban"|"salvos"|"envios"|"respostas"|"report">("search");
  const [niche, setNiche] = useState("restaurante");
  const [location, setLocation] = useState("Recife, PE");
  const [radius, setRadius] = useState(5000);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<Lead[]>([]);
  const [searchError, setSearchError] = useState<string|null>(null);
  const [searchMeta, setSearchMeta] = useState<any>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [expandedLead, setExpandedLead] = useState<string|null>(null);
  const [copiedText, setCopiedText] = useState<string|null>(null);
  const [autoSaving, setAutoSaving] = useState(false);
  const [prospects, setProspects] = useState<Lead[]>([]);
  const [loadingProspects, setLoadingProspects] = useState(true);
  const [draggingId, setDraggingId] = useState<string|null>(null);
  const [dragOverCol, setDragOverCol] = useState<string|null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [replyLead, setReplyLead] = useState<Lead | null>(null);
  const [styleSelectorLead, setStyleSelectorLead] = useState<Lead | null>(null);
  const [replyVersion, setReplyVersion] = useState(0); // increments when a reply is saved → triggers LeadDetailModal refresh
  const [replyCounts, setReplyCounts] = useState<Record<string, number>>({}); // prospect_id → reply count
  const [showRepliedOnly, setShowRepliedOnly] = useState(false); // filter in "Leads Salvos"

  // Fetch reply counts (called on mount + after each reply save)
  const loadReplyCounts = useCallback(async () => {
    try {
      const resp = await fetch("/api/admin/respostas/counts");
      const json = await resp.json();
      setReplyCounts(json.counts || {});
    } catch {
      // Non-critical
    }
  }, []);

  useEffect(() => { loadReplyCounts(); }, [loadReplyCounts]);

  // === Keyboard shortcut: press "R" to open Reply modal ===
  // Works when:
  //   - LeadDetailModal is open (selectedLead set) → uses selectedLead
  //   - A card is expanded in Buscar tab (expandedLead set) → finds matching lead in results
  // Does NOT trigger when:
  //   - ReplyModal is already open (replyLead set)
  //   - User is typing in an input/textarea/select
  //   - Any modifier key (Ctrl, Alt, Meta) is held
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Skip if ReplyModal is already open
      if (replyLead) return;
      // Skip if user is typing
      const target = e.target as HTMLElement;
      const tag = target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select" || target?.isContentEditable) return;
      // Skip if modifier keys are held
      if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return;
      // Only trigger on "r" or "R"
      if (e.key.toLowerCase() !== "r") return;

      // Priority 1: LeadDetailModal is open
      if (selectedLead) {
        e.preventDefault();
        setReplyLead(selectedLead);
        return;
      }
      // Priority 2: a card is expanded in Buscar tab
      if (expandedLead && view === "search") {
        const lead = results.find(r => (r.place_id === expandedLead || r.id === expandedLead));
        if (lead) {
          e.preventDefault();
          setReplyLead(lead);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedLead, replyLead, expandedLead, view, results]);

  // === Bulk selection state ===
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkStyle, setBulkStyle] = useState<"ai"|"template">("ai");
  const [bulkTemplate, setBulkTemplate] = useState<string>("t1");
  const [bulkCustomCta, setBulkCustomCta] = useState<string>("");
  const [bulkGenerating, setBulkGenerating] = useState(false);
  const [bulkResults, setBulkResults] = useState<any[] | null>(null);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [bulkSentIds, setBulkSentIds] = useState<Set<string>>(new Set());
  const [bulkCampaign, setBulkCampaign] = useState<string>("");
  const bulkLinkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  // === Batch control ===
  const [batchSize, setBatchSize] = useState<number>(10);
  const [allSentIds, setAllSentIds] = useState<Set<string>>(new Set()); // tracks all sent across ALL batches
  // === "Hide contacted" filter ===
  const [hideContacted, setHideContacted] = useState<boolean>(false);
  // Build a Set of already-contacted lead IDs (from prospects where status==='contacted')
  const contactedIds = new Set(
    prospects.filter(p => p.status === "contacted").map(p => p.id || p.place_id || "").filter(Boolean)
  );

  function toggleSelectLead(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function selectAllResults() {
    const allIds = results
      .filter(r => {
        const id = r.id || r.place_id || "";
        const hasPhone = !!(r.whatsapp || r.phone || "").replace(/\D/g,"");
        // Respect "hideContacted" filter: exclude leads that are already contacted
        const isContacted = contactedIds.has(id);
        return hasPhone && (!hideContacted || !isContacted);
      })
      .map(r => r.id || r.place_id || "")
      .filter(Boolean);
    setSelectedIds(new Set(allIds));
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  // Trigger bulk send: generate messages then open modal
  async function startBulkSend() {
    if (selectedIds.size === 0) return;
    setShowBulkModal(true);
    setBulkResults(null);
    setBulkError(null);
    setBulkSentIds(new Set());
    setAllSentIds(new Set()); // reset cross-batch tracking
    await generateBulkMessages("initial");
  }

  // mode: "initial" | "regenerate" | "continue"
  // - initial:    first batch of the session (resets allSentIds)
  // - regenerate: same leads as current batch (keeps allSentIds)
  // - continue:   next batch, excluding allSentIds (keeps allSentIds)
  async function generateBulkMessages(mode: "initial"|"regenerate"|"continue" = "initial") {
    setBulkGenerating(true);
    setBulkError(null);
    setBulkResults(null);
    setBulkSentIds(new Set());
    try {
      let batchLeads: Lead[];

      if (mode === "continue") {
        // Continue: take next batchSize leads, excluding already-sent
        batchLeads = results.filter(r => {
          const id = r.id || r.place_id || "";
          return selectedIds.has(id)
            && (r.whatsapp || r.phone || "").replace(/\D/g,"")
            && !allSentIds.has(id);
        }).slice(0, batchSize);
      } else if (mode === "regenerate" && bulkResults && bulkResults.length > 0) {
        // Regenerate: use the SAME leads as the current batch
        const currentIds = new Set(bulkResults.map((r: any) => r.lead.id));
        batchLeads = results.filter(r => {
          const id = r.id || r.place_id || "";
          return currentIds.has(id);
        });
      } else {
        // Initial: first batchSize selected leads with whatsapp/phone
        batchLeads = results.filter(r => {
          const id = r.id || r.place_id || "";
          return selectedIds.has(id) && (r.whatsapp || r.phone || "").replace(/\D/g,"");
        }).slice(0, batchSize);
      }

      if (batchLeads.length === 0) {
        setBulkError(
          mode === "continue"
            ? "Todos os leads selecionados já receberam disparo. ✅"
            : "Nenhum lead selecionado tem WhatsApp/telefone."
        );
        setBulkGenerating(false);
        return;
      }
      // Keep the same campaign tag across batches in this session
      let campaign = bulkCampaign;
      if (!campaign) {
        campaign = `bulk-${new Date().toISOString().slice(0,16).replace("T"," ").replace(":","h")}`;
        setBulkCampaign(campaign);
      }
      const resp = await fetch("/api/admin/bulk-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leads: batchLeads,
          style: bulkStyle,
          templateId: bulkTemplate,
          customCta: bulkCustomCta || undefined,
          campaign,
        }),
      });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json.error || "Falha ao gerar mensagens");
      setBulkResults(json.results || []);
    } catch (e: any) {
      setBulkError(e.message);
    } finally {
      setBulkGenerating(false);
    }
  }

  // Continue to next batch (after current batch is fully sent)
  async function continueToNextBatch() {
    await generateBulkMessages("continue");
  }

  // Open WhatsApp for one lead + log to envios
  async function openOneBulkSend(item: any) {
    if (!item.waLink) return;
    const leadId = item.lead.id || item.lead.place_id || "";
    // Open wa.me link
    window.open(item.waLink, "_blank", "noopener,noreferrer");
    // Mark as sent locally (current batch + cross-batch)
    setBulkSentIds(prev => new Set(prev).add(leadId));
    setAllSentIds(prev => new Set(prev).add(leadId));
    // Log to envios
    try {
      const resp = await fetch("/api/admin/envios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospect_id: leadId,
          message_text: item.message,
          message_variant: item.variant,
          status: "sent",
          campaign: item.campaign || bulkCampaign,
          destination_jid: item.lead.whatsapp || item.lead.phone || null,
        }),
      });
      if (!resp.ok) {
        const errText = await resp.text().catch(() => "");
        console.warn("[bulk-send] envios log failed:", resp.status, errText);
      }
    } catch (e) {
      console.warn("[bulk-send] envios log error:", e);
    }
  }

  // Open WhatsApp for ALL leads in the batch sequentially + log each
  async function openAllBulkSend() {
    if (!bulkResults || bulkResults.length === 0) return;
    for (const item of bulkResults) {
      if (!item.waLink) continue;
      // Open in new tab — browsers may block multiple popups without user gesture,
      // so we open them with a small stagger
      window.open(item.waLink, "_blank", "noopener,noreferrer");
      const leadId = item.lead.id || item.lead.place_id || "";
      setBulkSentIds(prev => new Set(prev).add(leadId));
      setAllSentIds(prev => new Set(prev).add(leadId));
      // Log to envios
      try {
        const resp = await fetch("/api/admin/envios", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prospect_id: leadId,
            message_text: item.message,
            message_variant: item.variant,
            status: "sent",
            campaign: item.campaign || bulkCampaign,
            destination_jid: item.lead.whatsapp || item.lead.phone || null,
          }),
        });
        if (!resp.ok) {
          const errText = await resp.text().catch(() => "");
          console.warn("[bulk-send] envios log failed:", resp.status, errText);
        }
      } catch (e) {
        console.warn("[bulk-send] envios log error:", e);
      }
      // Small delay between opens to avoid browser popup blocker
      await new Promise(r => setTimeout(r, 250));
    }
  }

  const loadProspects = useCallback(async () => {
    setLoadingProspects(true);
    try {
      const resp = await fetch("/api/admin/prospects?limit=500", { cache: "no-store" });
      const json = await resp.json();
      setProspects(json.data || []);
      const ids = new Set<string>();
      (json.data||[]).forEach((p:Lead) => { if(p.place_id) ids.add(p.place_id); });
      setSavedIds(ids);
    } catch { setProspects([]); }
    setLoadingProspects(false);
  }, []);

  useEffect(() => { loadProspects(); }, [loadProspects]);

  async function handleSearch() {
    setSearching(true); setSearchError(null); setResults([]); setSearchMeta(null);
    try {
      const resp = await fetch("/api/admin/prospect/search", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({niche,location,radius,limit:20}) });
      const json = await resp.json();
      if (!resp.ok) { setSearchError(json.error||"Erro"); return; }
      setResults(json.results||[]); setSearchMeta(json.search_meta);
      setAutoSaving(true);
      for (const lead of (json.results||[])) {
        if (lead.place_id && !savedIds.has(lead.place_id)) {
          try { await fetch("/api/admin/prospects", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({...lead, status:"new", priority: lead.webDevOpportunity?"high":"medium"}) }); } catch {}
        }
      }
      setAutoSaving(false); await loadProspects();
    } catch(e:any) { setSearchError(e.message); }
    finally { setSearching(false); }
  }

  async function updateStatus(id:string, status:string) {
    setProspects(prev => prev.map(p => p.id===id?{...p,status}:p));
    try { await fetch("/api/admin/prospects", { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({id,status}) }); } catch { loadProspects(); }
  }

  async function deleteProspect(id:string) {
    if(!confirm("Remover?")) return;
    setProspects(prev => prev.filter(p => p.id!==id));
    try { await fetch("/api/admin/prospects", { method:"DELETE", headers:{"Content-Type":"application/json"}, body: JSON.stringify({id}) }); } catch {}
  }

  function copyToClipboard(text:string, id:string) { navigator.clipboard.writeText(text); setCopiedText(id); setTimeout(()=>setCopiedText(null),2000); }

  function genWA(lead:Lead):string {
    const hasSite = lead.hasWebsite;
    const niche = lead.niche || lead.category || "estabelecimento";
    const rating = lead.rating || null;
    const isFoodNiche = /(restaurante|pizzaria|hamburgueria|cafeteria|loja de conveniencia|bar|lanchonete|padaria|confeitaria)/i.test(niche);

    // Avaliação só elogia se rating existir
    const ratingLine = rating
      ? `Vi sua avaliação de ${rating} estrelas no Google Maps — parabéns pelo trabalho bem feito! 🙌`
      : `Vi seu cadastro no Google Maps e gostei do que encontrei.`;

    // Diagnóstico inicial
    const diagLine = hasSite
      ? `Notei que seu site atual está perdendo clientes por ser lento/desatualizado.`
      : `Notei que vocês ainda NÃO têm um site profissional — e isso está custando clientes todos os meses.`;

    return `Olá! Tudo bem? 👋

Meu nome é Clodoaldo Silva, sou especialista em marketing digital local aqui da região.

${ratingLine}

Cheguei até você pesquisando "${niche} perto de mim" no Google. ${diagLine} Deixa eu te mostrar o que está acontecendo:

🔍 Pesquisando "${niche} em ${lead.city || "sua cidade"}", seus concorrentes aparecem em primeiro — e estão ganhando os clientes que poderiam estar vindo até você. São 150-400 buscas/mês só na sua região.

📱 87% das pessoas pesquisam online ANTES de decidir onde comprar. Sem presença digital forte, você está invisível para esse público.

📉 A cada mês sem isso = 30-50 clientes novos indo direto pro concorrente.

Mais que um site, eu ofereço um **ecossistema completo** para o seu negócio crescer:

✅ ${hasSite ? "Redesign do site atual" : "Criação de site profissional"} — rápido, responsivo, que converte visita em cliente
✅ SEO local — aparecer em 1º nas buscas "${niche} em ${lead.city || "sua cidade"}"
✅ Google Meu Negócio otimizado — destaque no Maps
✅ Integração com WhatsApp — cliente pede com 1 clique
${isFoodNiche ? `✅ Cardápio digital com QR Code — cliente acessa do celular, sem app, sem download
✅ Edição/atualização de cardápio — fotos profissionais + descrições que vendem
✅ Artes para redes sociais (Instagram/Facebook) — 12 a 30 artes/mês prontas para postar` : `✅ Artes para redes sociais (Instagram/Facebook) — 12 a 30 artes/mês prontas para postar
✅ Gestão de redes sociais opcional — poste sem trabalho extra`}
✅ Pacote de recorrência mensal — site + artes + SEO + suporte, sem contratação de funcionário
✅ E diversos outros produtos digitais sob medida (e-books, landing pages de campanhas, auditoria de perfil, criativos para tráfego pago...)

💰 **Custo-benefício que faz sentido:** um único site seu custa menos que 1 mês de aluguel da loja. E diferente do aluguel (que você paga pra sempre), o site é seu, trabalha 24/7 por anos.

✅ **Sem fidelidade:** você pode cancelar a recorrência quando quiser.
✅ **Sem trabalho pra você:** eu cuido de tudo — design, conteúdo, publicação. Você só aprova o resultado final.

Sei que provavelmente está ocupado(a) — todo mundo que tem negócio próprio está. Por isso não precisa de reunião interminável: me chama aqui no WhatsApp, a gente conversa por mensagem mesmo, e em 5 minutinhos eu te mostro exatamente o que dá pra fazer pro ${lead.name}.

👉 Posso te enviar um preview gratuito do site que eu criaria pra vocês? É só responder "sim" aqui no WhatsApp.

📱 (81) 92005-1068
🌐 clodoaldo.vercel.app

Abraço,
Clodoaldo Silva`;
  }

  function genEmail(lead:Lead):string {
    const hasSite = lead.hasWebsite;
    const niche = lead.niche || lead.category || "estabelecimento";
    const rating = lead.rating || null;
    const isFoodNiche = /(restaurante|pizzaria|hamburgueria|cafeteria|loja de conveniencia|bar|lanchonete|padaria|confeitaria)/i.test(niche);

    const ratingLine = rating
      ? `Vi sua avaliação de ${rating} estrelas no Google Maps — parabéns pelo trabalho bem feito!`
      : `Vi seu cadastro no Google Maps e gostei do que encontrei.`;

    const diagLine = hasSite
      ? `Notei que seu site atual está perdendo clientes por ser lento/desatualizado.`
      : `Notei que vocês ainda NÃO têm um site profissional — e isso está custando clientes todos os meses.`;

    return `Assunto: ${lead.name} — como atrair 30-50 clientes novos por mês (sem depender de indicação)

Olá, equipe ${lead.name}!

Meu nome é Clodoaldo Silva, sou especialista em marketing digital local aqui da região.

${ratingLine}

Cheguei até vocês pesquisando "${niche} perto de mim" no Google. ${diagLine} Deixa eu explicar o que está acontecendo:

1. 🔍 Pesquisando "${niche} em ${lead.city || "sua cidade"}", seus concorrentes aparecem em primeiro — e estão ganhando os clientes que poderiam estar vindo até vocês. São 150-400 buscas/mês só na região.

2. 📱 87% das pessoas pesquisam online ANTES de decidir onde comprar. Sem presença digital forte, vocês estão invisíveis para esse público.

3. 📉 A cada mês sem isso = 30-50 clientes novos indo direto pro concorrente. Em 6 meses, são 200+ clientes que poderiam ser de vocês.

Mais que um site, eu ofereço um **ecossistema completo** para o ${lead.name} crescer:

✅ ${hasSite ? "Redesign do site atual" : "Criação de site profissional"} — rápido, responsivo, que converte visita em cliente
✅ SEO local — aparecer em 1º nas buscas "${niche} em ${lead.city || "sua cidade"}"
✅ Google Meu Negócio otimizado — destaque no Maps
✅ Integração com WhatsApp — cliente pede com 1 clique
${isFoodNiche ? `✅ Cardápio digital com QR Code — cliente acessa do celular, sem app, sem download
✅ Edição/atualização de cardápio — fotos profissionais + descrições que vendem
✅ Artes para redes sociais (Instagram/Facebook) — 12 a 30 artes/mês prontas para postar` : `✅ Artes para redes sociais (Instagram/Facebook) — 12 a 30 artes/mês prontas para postar
✅ Gestão de redes sociais opcional — você posta sem trabalho extra`}
✅ Pacote de recorrência mensal — site + artes + SEO + suporte, sem contratar funcionário
✅ E diversos outros produtos digitais sob medida (e-books, landing pages de campanhas, auditoria de perfil, criativos para tráfego pago...)

💰 **Custo-benefício que faz sentido:** um único site profissional custa menos que 1 mês de aluguel da loja. E diferente do aluguel (que se paga pra sempre), o site é de vocês, trabalha 24/7 por anos.

✅ Sem fidelidade — vocês podem cancelar a recorrência quando quiserem.
✅ Sem trabalho pra vocês — eu cuido de tudo (design, conteúdo, publicação). Vocês só aprovam o resultado final.

Sei que provavelmente estão ocupados — todo mundo que tem negócio próprio está. Por isso não precisa de reunião interminável: me chama no WhatsApp, a gente conversa por mensagem mesmo, e em 5 minutinhos eu mostro exatamente o que dá pra fazer pro ${lead.name}.

👉 Posso enviar um preview gratuito do site que eu criaria pra vocês? É só responder "sim" no WhatsApp.

📱 (81) 92005-1068
🌐 https://clodoaldo.vercel.app

Abraço,
Clodoaldo Silva`;
  }

  function genPrompt(lead:Lead):string {
    const wa = (lead.whatsapp||lead.phone||"").replace(/\D/g,"");
    const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.name+" "+(lead.formatted_address||lead.city||location))}`;
    return `CRIE UMA LANDING PAGE RESPONSIVA para:\n\nNome: ${lead.name}\nTipo: ${lead.niche||lead.category||"estabelecimento"}\nEndereco: ${lead.formatted_address||"N/A"}\nCidade: ${lead.city||location}\nTelefone: ${lead.phone||"N/A"}\nWhatsApp: ${wa||"N/A"}\nAvaliacao: ${lead.rating?lead.rating+" estrelas":"N/A"}\n\nESTRUTURA:\n1. Hero (nome, subtitulo, avaliacao, botoes WhatsApp + Como Chegar)\n2. Sobre Nos\n3. Servicos (sem precos)\n4. Galeria (6 imagens)\n5. Mapa Google Maps + botao "Como Chegar" → ${maps}\n6. CTA final (WhatsApp + Telefone + Como Chegar)\n7. Footer ("Site criado por Clodoaldo Silva")\n\nREQUISITOS: 100% responsivo, SEO, sem precos, Google Maps embed: https://www.google.com/maps?q=${lead.lat},${lead.lng}&z=16&output=embed`;
  }

  function genPreview(lead:Lead):string {
    return generatePreviewHTML({
      name: lead.name,
      niche: lead.niche,
      category: lead.category,
      formatted_address: lead.formatted_address,
      city: lead.city,
      phone: lead.phone,
      whatsapp: lead.whatsapp,
      website: lead.website,
      instagram: lead.instagram,
      facebook: lead.facebook,
      rating: lead.rating ?? null,
      user_ratings_total: lead.user_ratings_total ?? null,
      lat: lead.lat,
      lng: lead.lng,
    });
  }

  function openPreview(lead:Lead) {
    // Abre o seletor de estilos primeiro (carrossel de capas)
    setStyleSelectorLead(lead);
  }

  function openPreviewWithStyle(lead:Lead, styleId:string) {
    // Abre o preview via API com o estilo escolhido
    const id = lead.id || lead.place_id || "";
    if (!id) {
      // Fallback: gera localmente sem estilo
      const blob = new Blob([genPreview(lead)], {type:"text/html"});
      window.open(URL.createObjectURL(blob), "_blank");
    } else {
      window.open(`https://clodoaldo.vercel.app/api/preview?lead=${id}&style=${styleId}`, "_blank");
    }
    setStyleSelectorLead(null);
  }

  function openPreviewLinkWithStyle(lead:Lead, styleId:string) {
    const id = lead.id || lead.place_id || "";
    window.open(`https://clodoaldo.vercel.app/api/preview?lead=${id}&style=${styleId}`, "_blank");
    setStyleSelectorLead(null);
  }

  function getPreviewLink(lead:Lead):string {
    const id = lead.id || lead.place_id || "";
    return `https://clodoaldo.vercel.app/api/preview?lead=${id}`;
  }

  function getPreviewLinkWithStyle(lead:Lead, styleId:string):string {
    const id = lead.id || lead.place_id || "";
    return `https://clodoaldo.vercel.app/api/preview?lead=${id}&style=${styleId}`;
  }

  function copyPreviewLink(lead:Lead) {
    const link = getPreviewLink(lead);
    navigator.clipboard.writeText(link);
    setCopiedText(`link-${lead.id || lead.place_id}`);
    setTimeout(() => setCopiedText(null), 3000);
  }

  function openPreviewLink(lead:Lead) {
    // Abre o seletor de estilos primeiro
    setStyleSelectorLead(lead);
  }

  const total = prospects.length;
  const opps = prospects.filter(p=>p.webDevOpportunity).length;
  const mapSrc = `https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&center=${searchMeta?.lat||-8.0476},${searchMeta?.lng||-34.8770}&zoom=13`;

  return (
    <AdminShell title="Parceiros — Prospeccao via Google Maps">
      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-7">
        <SB label="Total" value={total} icon={Users} c="emerald" />
        {KANBAN.map(k => <SB key={k.key} label={k.label} value={prospects.filter(p=>p.status===k.key).length} icon={Building2} c={k.color as any} />)}
        <SB label="Oportunidades" value={opps} icon={Zap} c="amber" />
      </div>

      <div className="mb-4 flex flex-wrap gap-0.5 rounded-full border border-white/5 bg-white/[0.03] p-0.5 inline-flex">
        {[["search","Buscar",Search],["kanban","Pipeline ("+total+")",Layout],["salvos","Leads Salvos ("+total+")",CheckCircle2]].map(([k,l,I]:any) => (
          <button key={k} onClick={()=>setView(k)} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition ${view===k?"bg-emerald-500/20 text-emerald-300":"text-zinc-400 hover:text-zinc-200"}`}><I className="h-4 w-4" /> {l}</button>
        ))}
        <button onClick={()=>setView("envios")} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition ${view==="envios"?"bg-emerald-500/20 text-emerald-300":"text-zinc-400 hover:text-zinc-200"}`}><MessageCircle className="h-4 w-4" /> Envios</button>
        <button onClick={()=>setView("respostas")} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition ${view==="respostas"?"bg-emerald-500/20 text-emerald-300":"text-zinc-400 hover:text-zinc-200"}`}><Mail className="h-4 w-4" /> Respostas</button>
        <button onClick={()=>setView("report")} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition ${view==="report"?"bg-emerald-500/20 text-emerald-300":"text-zinc-400 hover:text-zinc-200"}`}><RefreshCw className="h-4 w-4" /> Relatorio</button>
      </div>

      {view==="search" && (
        <Widget title="Prospeccao de clientes via Google Maps" icon={<MapPin className="h-4 w-4 text-emerald-400" />}>
          <div className="mb-6 grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto]">
            <div><Label>Nicho</Label><Select value={niche} onChange={e=>setNiche(e.target.value)}>{NICHES.map(n=><option key={n} value={n}>{n}</option>)}</Select></div>
            <div><Label>Cidade</Label><Input value={location} onChange={e=>setLocation(e.target.value)} placeholder="Ex: Recife, PE" /></div>
            <div><Label>Raio</Label><Select value={String(radius)} onChange={e=>setRadius(Number(e.target.value))}><option value="2000">2 km</option><option value="5000">5 km</option><option value="10000">10 km</option><option value="20000">20 km</option></Select></div>
            <div className="flex items-end"><Button variant="primary" onClick={handleSearch} disabled={searching} className="w-full">{searching?<Loader2 className="h-4 w-4 animate-spin" />:<Search className="h-4 w-4" />}{searching?"Buscando…":"Buscar"}</Button></div>
          </div>
          {autoSaving && <div className="mb-3 flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300"><Loader2 className="h-3 w-3 animate-spin" /> Salvando leads automaticamente…</div>}
          {searchError && <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300"><AlertCircle className="h-5 w-5 shrink-0 mt-0.5" /><span>{searchError}</span></div>}
          {searchMeta && <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] p-3 text-xs text-emerald-200"><strong>{searchMeta.total} estabelecimentos</strong> • fonte: {searchMeta.source} • {autoSaving?"salvando…":"✅ salvos no pipeline"}</div>}
          {results.length>0 && (
            <div className="grid gap-4 lg:grid-cols-[1fr_350px]">
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {/* === Bulk action bar === */}
                {/* Eligible = leads with phone, not in contactedIds (when hideContacted is ON) */}
                {(() => {
                  const eligibleLeads = results.filter(r => {
                    const id = r.id || r.place_id || "";
                    const hasPhone = !!(r.whatsapp || r.phone || "").replace(/\D/g,"");
                    const isContacted = contactedIds.has(id);
                    return hasPhone && (!hideContacted || !isContacted);
                  });
                  const eligibleIds = new Set(eligibleLeads.map(r => r.id || r.place_id || ""));
                  const allEligibleSelected = eligibleLeads.length > 0 && eligibleLeads.every(r => selectedIds.has(r.id || r.place_id || ""));
                  const contactedCount = results.filter(r => contactedIds.has(r.id || r.place_id || "")).length;
                  return (
                  <div className="sticky top-0 z-10 -mx-1 mb-2 flex flex-wrap items-center gap-2 rounded-xl border border-emerald-500/20 bg-zinc-950/95 backdrop-blur px-3 py-2 shadow-lg">
                    <button
                      type="button"
                      onClick={allEligibleSelected ? clearSelection : selectAllResults}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/25 transition"
                    >
                      {allEligibleSelected
                        ? <CheckSquare className="h-3.5 w-3.5" />
                        : <Square className="h-3.5 w-3.5" />}
                      {allEligibleSelected
                        ? "Desmarcar todos"
                        : hideContacted
                          ? `Selecionar ${eligibleLeads.length} não contatados`
                          : "Selecionar todos os leads"}
                    </button>
                    {selectedIds.size > 0 && (
                      <>
                        <Badge variant="success">{selectedIds.size} selecionado{selectedIds.size>1?"s":""}</Badge>
                        <button
                          type="button"
                          onClick={clearSelection}
                          className="text-xs text-zinc-400 hover:text-zinc-200 underline"
                        >
                          limpar
                        </button>
                      </>
                    )}
                    <div className="flex-1" />
                    {/* === "Hide contacted" toggle === */}
                    <label className="flex items-center gap-1.5 cursor-pointer select-none text-xs text-zinc-400 hover:text-zinc-200 transition">
                      <input
                        type="checkbox"
                        checked={hideContacted}
                        onChange={e => {
                          setHideContacted(e.target.checked);
                          // Clear selection if some selected leads become hidden
                          if (e.target.checked) {
                            setSelectedIds(prev => {
                              const next = new Set<string>();
                              prev.forEach(id => {
                                if (!contactedIds.has(id)) next.add(id);
                              });
                              return next;
                            });
                          }
                        }}
                        className="h-3.5 w-3.5 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                      />
                      <span>Ocultar já contatados{contactedCount > 0 ? ` (${contactedCount})` : ""}</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-zinc-400 hidden sm:inline">Lote:</span>
                      <select
                        value={String(batchSize)}
                        onChange={e => setBatchSize(Number(e.target.value))}
                        className="rounded-lg border border-white/10 bg-zinc-900 px-2 py-1.5 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                      >
                        <option value="10">10 / vez</option>
                        <option value="20">20 / vez</option>
                        <option value="30">30 / vez</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={startBulkSend}
                      disabled={selectedIds.size === 0}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-1.5 text-xs font-bold text-white shadow hover:scale-[1.02] transition disabled:opacity-50 disabled:hover:scale-100"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Disparar mensagens ({Math.min(selectedIds.size, batchSize)} por vez)
                    </button>
                  </div>
                  );
                })()}
                {results.map(lead => {
                  const exp = expandedLead===lead.place_id;
                  const wa = genWA(lead); const em = genEmail(lead); const pr = genPrompt(lead);
                  const num = normalizeBrazilianPhone(lead.whatsapp||lead.phone) || "";
                  const leadId = lead.id || lead.place_id || "";
                  const isSelected = selectedIds.has(leadId);
                  const canBulk = !!num;
                  const isContacted = contactedIds.has(leadId);
                  // Hide lead entirely if hideContacted is ON and lead is contacted
                  if (hideContacted && isContacted) return null;
                  return (
                    <div key={lead.place_id} className={`rounded-xl border p-4 transition ${lead.webDevOpportunity?"border-amber-500/30 bg-amber-500/[0.03]":"border-white/5 bg-white/[0.02]"} ${isSelected?"ring-2 ring-emerald-500/50":""} ${isContacted?"opacity-60":""}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2 min-w-0 flex-1">
                          {/* === Checkbox for bulk selection === */}
                          <button
                            type="button"
                            onClick={() => canBulk && toggleSelectLead(leadId)}
                            disabled={!canBulk}
                            className={`mt-0.5 shrink-0 rounded p-1 transition ${canBulk?"cursor-pointer hover:bg-white/10":"cursor-not-allowed opacity-30"}`}
                            title={canBulk ? (isSelected?"Desmarcar":"Selecionar para disparo") : "Sem WhatsApp/telefone"}
                            aria-label={isSelected ? "Desmarcar lead" : "Selecionar lead"}
                          >
                            {isSelected
                              ? <CheckSquare className="h-4 w-4 text-emerald-400" />
                              : <Square className="h-4 w-4 text-zinc-500" />}
                          </button>
                          <div className="min-w-0 flex-1 cursor-pointer" onClick={()=>setExpandedLead(exp?null:lead.place_id||null)}>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-bold text-white">{lead.name}</h4>
                              {lead.rating&&<span className="flex items-center gap-0.5 text-xs"><Star className="h-3 w-3 fill-amber-400 text-amber-400" /><span className="font-semibold text-amber-300">{lead.rating}</span></span>}
                              {isContacted && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-300 bg-amber-500/15 px-1.5 py-0.5 rounded">
                                  <CheckCircle2 className="h-2.5 w-2.5" /> Já contatado
                                </span>
                              )}
                            </div>
                            <p className="mt-0.5 text-[11px] text-zinc-500 capitalize">{lead.category}</p>
                          <div className="mt-1 flex items-start gap-1 text-xs text-zinc-400"><MapPin className="h-3 w-3 shrink-0 mt-0.5" /><span className="truncate">{lead.formatted_address}</span></div>
                          </div>
                        </div>
                        {savedIds.has(lead.place_id!)&&<Badge variant="success"><CheckCircle2 className="h-3 w-3" /> Salvo</Badge>}
                        {(replyCounts[lead.id || ""] || 0) > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-zinc-300 bg-white/5 px-1.5 py-0.5 rounded" title={`${replyCounts[lead.id || ""]} resposta(s)`}>
                            <Mail className="h-2.5 w-2.5" /> {replyCounts[lead.id || ""]} {replyCounts[lead.id || ""] === 1 ? "resp." : "resps."}
                          </span>
                        )}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {lead.hasWebsite?<Badge variant="info"><Globe className="h-3 w-3" /> Tem site</Badge>:<Badge variant="warning"><AlertTriangle className="h-3 w-3" /> Sem site</Badge>}
                        {lead.hasWhatsApp&&<Badge variant="success"><MessageCircle className="h-3 w-3" /> WhatsApp</Badge>}
                        {lead.webDevOpportunity&&<Badge variant="danger"><Zap className="h-3 w-3" /> Oportunidade</Badge>}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {num&&<a href={`https://wa.me/${num}?text=${encodeURIComponent(wa)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/25"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp</a>}
                        {lead.website&&<a href={lead.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-blue-500/15 px-3 py-1.5 text-xs font-semibold text-blue-300 hover:bg-blue-500/25"><ExternalLink className="h-3.5 w-3.5" /> Site</a>}
                        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.name+" "+(lead.formatted_address||""))}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/15 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/25"><MapPin className="h-3.5 w-3.5" /> Maps</a>
                        <button onClick={()=>setExpandedLead(exp?null:lead.place_id||null)} className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-white/10"><Copy className="h-3.5 w-3.5" /> Copy + CTA</button>
                        <button onClick={()=>setReplyLead(lead)} className="inline-flex items-center gap-1.5 rounded-lg bg-violet-500/15 px-3 py-1.5 text-xs font-semibold text-violet-300 hover:bg-violet-500/25 transition" title="Registrar resposta do lead (atalho: R)">
                          <Mail className="h-3.5 w-3.5" /> Resposta
                          <kbd className="hidden sm:inline-block ml-0.5 rounded bg-violet-500/20 px-1 py-0.5 text-[9px] font-mono text-violet-300/80">R</kbd>
                        </button>
                      </div>
                      {exp&&(
                        <div className="mt-4 space-y-3 border-t border-white/5 pt-4">
                          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.03] p-3"><div className="mb-2 flex items-center justify-between"><span className="flex items-center gap-1.5 text-xs font-bold text-emerald-300"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp</span><button onClick={()=>copyToClipboard(wa,`wa-${lead.place_id}`)} className="rounded-md bg-emerald-500/20 px-2 py-1 text-[10px] font-semibold text-emerald-300 hover:bg-emerald-500/30">{copiedText===`wa-${lead.place_id}`?"✓":"Copiar"}</button></div><pre className="whitespace-pre-wrap text-[11px] text-zinc-300 font-sans max-h-32 overflow-y-auto">{wa}</pre></div>
                          <div className="rounded-lg border border-blue-500/20 bg-blue-500/[0.03] p-3"><div className="mb-2 flex items-center justify-between"><span className="flex items-center gap-1.5 text-xs font-bold text-blue-300"><Mail className="h-3.5 w-3.5" /> Email</span><button onClick={()=>copyToClipboard(em,`em-${lead.place_id}`)} className="rounded-md bg-blue-500/20 px-2 py-1 text-[10px] font-semibold text-blue-300 hover:bg-blue-500/30">{copiedText===`em-${lead.place_id}`?"✓":"Copiar"}</button></div><pre className="whitespace-pre-wrap text-[11px] text-zinc-300 font-sans max-h-32 overflow-y-auto">{em}</pre></div>
                          <button onClick={()=>openPreview(lead)} className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-sm font-bold text-white shadow-lg hover:scale-[1.02] transition"><Eye className="h-4 w-4" /> Ver Preview do Site</button>
                          <a href={`/admin/aprovacoes?new=1&client_name=${encodeURIComponent(lead.name)}&client_whatsapp=${encodeURIComponent(lead.whatsapp || lead.phone || "")}&client_email=${encodeURIComponent(lead.email || "")}&project_title=${encodeURIComponent("Projeto para " + lead.name)}&prospect_id=${encodeURIComponent(lead.id || lead.place_id || "")}&preview_url=${encodeURIComponent(getPreviewLink(lead))}`} className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-500/15 border border-violet-500/30 py-3 text-sm font-bold text-violet-300 hover:bg-violet-500/25 transition">
                            <FileCheck className="h-4 w-4" /> Criar projeto de aprovação
                          </a>
                          <div className="flex gap-2">
                            <button onClick={()=>copyPreviewLink(lead)} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-500/15 px-3 py-2 text-xs font-semibold text-blue-300 ring-1 ring-blue-500/20 hover:bg-blue-500/25 transition" title="Copiar link compartilhável">
                              {copiedText===`link-${lead.id || lead.place_id}` ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
                              {copiedText===`link-${lead.id || lead.place_id}` ? "Link copiado!" : "Copiar link"}
                            </button>
                            <button onClick={()=>openPreviewLink(lead)} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-500/20 hover:bg-emerald-500/25 transition" title="Abrir link compartilhável">
                              <Share2 className="h-3.5 w-3.5" /> Abrir link
                            </button>
                          </div>
                          <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.03] p-3"><div className="mb-2 flex items-center justify-between"><span className="flex items-center gap-1.5 text-xs font-bold text-amber-300"><Code2 className="h-3.5 w-3.5" /> Prompt do Site</span><button onClick={()=>copyToClipboard(pr,`pr-${lead.place_id}`)} className="rounded-md bg-amber-500/20 px-2 py-1 text-[10px] font-semibold text-amber-300 hover:bg-amber-500/30">{copiedText===`pr-${lead.place_id}`?"✓":"Copiar"}</button></div><pre className="whitespace-pre-wrap text-[10px] text-zinc-400 font-mono max-h-48 overflow-y-auto">{pr}</pre></div>

                          {/* === QUEBRA DE OBJEÇÕES === */}
                          {(() => {
                            const objections = getRelevantObjections({
                              niche: lead.niche || lead.category,
                              hasWebsite: lead.hasWebsite,
                            });
                            if (objections.length === 0) return null;
                            return (
                              <div className="rounded-lg border border-rose-500/30 bg-rose-500/[0.04] p-3">
                                <div className="mb-3 flex items-center gap-1.5">
                                  <Shield className="h-3.5 w-3.5 text-rose-300" />
                                  <span className="text-xs font-bold text-rose-200">
                                    Quebra de Objeções ({objections.length})
                                  </span>
                                </div>
                                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                                  {objections.map((obj) => {
                                    const f = formatObjectionForDisplay(obj);
                                    const copyId = `obj-${lead.place_id}-${obj.id}`;
                                    return (
                                      <div key={obj.id} className="rounded-md border border-white/5 bg-black/20 p-2.5">
                                        <div className="mb-1.5 text-[10px] font-bold text-rose-300/80 uppercase tracking-wide">
                                          {f.objectionLabel}
                                        </div>
                                        <div className="mb-2 text-[11px] text-zinc-300 italic">
                                          "{obj.objection}"
                                        </div>
                                        <div className="mb-1.5 text-[10px] font-bold text-emerald-300/80 uppercase tracking-wide">
                                          {f.breakLabel}
                                        </div>
                                        <div className="flex gap-2">
                                          <pre className="flex-1 whitespace-pre-wrap text-[10px] text-zinc-200 font-sans max-h-40 overflow-y-auto leading-relaxed">
                                            {obj.break}
                                          </pre>
                                          <button
                                            onClick={() => copyToClipboard(obj.break, copyId)}
                                            className="shrink-0 rounded bg-emerald-500/20 px-2 py-1 text-[10px] font-semibold text-emerald-300 hover:bg-emerald-500/30 h-fit"
                                            title="Copiar resposta pronta"
                                          >
                                            {copiedText === copyId ? "✓" : <Copy className="h-3 w-3" />}
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                                <div className="mt-2 pt-2 border-t border-rose-500/20 text-[10px] text-zinc-500">
                                  💡 As 2 objeções de prioridade 1 já estão embutidas na mensagem WhatsApp acima como ganchos preventivos.
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="space-y-4">
                <div className="rounded-xl border border-white/5 overflow-hidden"><div className="bg-white/[0.02] px-3 py-2 border-b border-white/5"><div className="flex items-center gap-2 text-xs font-semibold text-zinc-300"><MapPin className="h-3.5 w-3.5 text-emerald-400" /> Mapa</div></div><iframe src={mapSrc} width="100%" height="250" style={{border:0}} loading="lazy" title="Mapa" /></div>
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.03] p-4"><div className="flex items-center gap-2 mb-3"><Zap className="h-4 w-4 text-amber-400" /><h4 className="text-sm font-bold text-white">Oportunidades</h4></div><div className="space-y-1.5 text-xs"><div className="flex justify-between"><span className="text-zinc-400">Sem site</span><span className="font-bold text-amber-300">{results.filter(r=>!r.hasWebsite).length}</span></div><div className="flex justify-between"><span className="text-zinc-400">Com WhatsApp</span><span className="font-bold text-emerald-300">{results.filter(r=>r.hasWhatsApp).length}</span></div></div></div>
              </div>
            </div>
          )}
          {!searching&&results.length===0&&!searchError&&!searchMeta&&<EmptyState title="Busque estabelecimentos no Google Maps" description="Os leads serao salvos automaticamente no pipeline." icon={<MapPin className="h-8 w-8" />} />}
        </Widget>
      )}

      {view==="kanban" && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-[1000px]">
            {KANBAN.map(col => {
              const items = prospects.filter(p=>p.status===col.key);
              const colors:Record<string,string> = {blue:"border-blue-500/30 bg-blue-500/[0.03]",amber:"border-amber-500/30 bg-amber-500/[0.03]",violet:"border-violet-500/30 bg-violet-500/[0.03]",emerald:"border-emerald-500/30 bg-emerald-500/[0.03]",rose:"border-rose-500/30 bg-rose-500/[0.03]"};
              const hc:Record<string,string> = {blue:"text-blue-300",amber:"text-amber-300",violet:"text-violet-300",emerald:"text-emerald-300",rose:"text-rose-300"};
              return (
                <div key={col.key} className={`flex-1 min-w-[200px] rounded-xl border ${colors[col.color]} p-3 ${dragOverCol===col.key?"ring-2 ring-emerald-500/40":""}`} onDragOver={e=>{e.preventDefault();setDragOverCol(col.key);}} onDrop={e=>{e.preventDefault();if(draggingId)updateStatus(draggingId,col.key);setDraggingId(null);setDragOverCol(null);}}>
                  <div className="mb-3 flex items-center justify-between"><h3 className={`text-sm font-bold ${hc[col.color]}`}>{col.label}</h3><span className="rounded-full bg-white/5 px-2 py-0.5 text-xs font-bold text-zinc-400">{items.length}</span></div>
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {loadingProspects?<div className="py-4 text-center text-xs text-zinc-500"><Loader2 className="h-4 w-4 animate-spin mx-auto" /></div>:items.length===0?<div className="py-4 text-center text-xs text-zinc-600">Vazio</div>:
                    items.map(p => {
                      const num = normalizeBrazilianPhone(p.whatsapp||p.phone) || "";
                      const wa=genWA(p);
                      return (
                        <div key={p.id} draggable onDragStart={e=>setDraggingId(p.id!)} onDragEnd={()=>{setDraggingId(null);setDragOverCol(null);}} className="cursor-grab rounded-lg border border-white/5 bg-white/[0.04] p-3 hover:bg-white/[0.08] transition active:cursor-grabbing">
                          <div className="mb-1 flex items-start justify-between gap-2"><h4 className="text-xs font-bold text-white truncate flex-1">{p.name}</h4><button onClick={()=>deleteProspect(p.id!)} className="shrink-0 text-zinc-600 hover:text-rose-400"><Trash2 className="h-3 w-3" /></button></div>
                          <p className="text-[10px] text-zinc-500 truncate mb-1">{p.formatted_address||p.city||""}</p>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {p.hasWebsite?<Badge variant="info"><Globe className="h-2.5 w-2.5" /></Badge>:<Badge variant="warning"><AlertTriangle className="h-2.5 w-2.5" /></Badge>}
                            {p.hasWhatsApp&&<Badge variant="success"><MessageCircle className="h-2.5 w-2.5" /></Badge>}
                            {p.webDevOpportunity&&<Badge variant="danger"><Zap className="h-2.5 w-2.5" /></Badge>}
                            {p.rating&&<span className="text-[10px] text-amber-300">⭐{p.rating}</span>}
                          </div>
                          <div className="flex gap-1">
                            {num&&<a href={`https://wa.me/${num}?text=${encodeURIComponent(wa)}`} target="_blank" rel="noreferrer" className="flex-1 rounded bg-emerald-500/15 px-2 py-1 text-center text-[10px] font-semibold text-emerald-300 hover:bg-emerald-500/25">WhatsApp</a>}
                            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.name+" "+(p.formatted_address||""))}`} target="_blank" rel="noreferrer" className="rounded bg-amber-500/15 px-2 py-1 text-[10px] font-semibold text-amber-300 hover:bg-amber-500/25" title="Ver no Google Maps"><MapPin className="h-3 w-3" /></a>
                            <button onClick={()=>openPreview(p)} className="rounded bg-amber-500/15 px-2 py-1 text-[10px] font-semibold text-amber-300 hover:bg-amber-500/25" title="Preview do site"><Eye className="h-3 w-3" /></button>
                            <button onClick={()=>copyPreviewLink(p)} className="rounded bg-blue-500/15 px-2 py-1 text-[10px] font-semibold text-blue-300 hover:bg-blue-500/25" title="Copiar link do preview"><Link2 className="h-3 w-3" /></button>
                            <button onClick={()=>openPreviewLink(p)} className="rounded bg-emerald-500/15 px-2 py-1 text-[10px] font-semibold text-emerald-300 hover:bg-emerald-500/25" title="Abrir link compartilhável"><Share2 className="h-3 w-3" /></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view==="salvos" && (
        <Widget title="Leads Salvos" icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />} action={<Button variant="outline" size="sm" onClick={loadProspects} disabled={loadingProspects}><RefreshCw className={`h-3 w-3 ${loadingProspects?"animate-spin":""}`} /><span className="ml-1">Atualizar</span></Button>}>
          {loadingProspects ? (
            <div className="py-12 text-center text-zinc-500"><RefreshCw className="mx-auto mb-2 h-6 w-6 animate-spin" />Carregando leads salvos...</div>
          ) : prospects.length === 0 ? (
            <EmptyState icon={<CheckCircle2 className="h-8 w-8 text-zinc-600" />} title="Nenhum lead salvo" description="Busque estabelecimentos e eles serão salvos automaticamente aqui." />
          ) : (
            <>
              {/* === Filter bar === */}
              <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
                <label className="flex items-center gap-1.5 cursor-pointer select-none text-xs text-zinc-300 hover:text-zinc-100 transition">
                  <input
                    type="checkbox"
                    checked={showRepliedOnly}
                    onChange={e => setShowRepliedOnly(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-white/20 bg-white/5 text-violet-500 focus:ring-1 focus:ring-violet-500/40"
                  />
                  <Filter className="h-3 w-3" />
                  Só com respostas ({Object.values(replyCounts).filter(c => c > 0).length})
                </label>
                <div className="flex-1" />
                <span className="text-[11px] text-zinc-500">
                  {prospects.filter(p => (replyCounts[p.id || ""] || 0) > 0).length} com respostas • {prospects.length} total
                </span>
              </div>

              <div className="mb-3 rounded-lg border border-blue-500/20 bg-blue-500/[0.04] px-3 py-2 text-xs text-blue-200">
                💡 Dica: clique em qualquer lead (card) para ver todos os detalhes — mensagens prontas (WhatsApp/Email), prompt do site, preview, histórico de respostas e quebra de objeções.
              </div>
              <div className="space-y-2">
                {prospects.filter(p => {
                  if (!showRepliedOnly) return true;
                  return (replyCounts[p.id || ""] || 0) > 0;
                }).map((p) => {
                  const num = normalizeBrazilianPhone(p.whatsapp||p.phone) || "";
                  const wa = genWA(p);
                  const replyCount = replyCounts[p.id || ""] || 0;
                  return (
                    <div
                      key={p.id || p.place_id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedLead(p)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedLead(p);
                        }
                      }}
                      className="block w-full text-left rounded-xl border border-white/5 bg-white/[0.02] hover:bg-emerald-500/[0.06] hover:border-emerald-500/30 active:bg-emerald-500/[0.1] p-3 sm:p-4 transition group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white text-sm sm:text-base group-hover:text-emerald-300 transition truncate">{p.name}</span>
                            {p.rating && (
                              <span className="flex items-center gap-0.5 text-xs shrink-0">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                <span className="font-semibold text-amber-300">{p.rating}</span>
                                {p.user_ratings_total && <span className="text-zinc-500">({p.user_ratings_total})</span>}
                              </span>
                            )}
                            {p.webDevOpportunity && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-300 bg-amber-500/15 px-1.5 py-0.5 rounded shrink-0">
                                <Zap className="h-2.5 w-2.5" /> Oportunidade
                              </span>
                            )}
                            {replyCount > 0 && (
                              <span
                                className="inline-flex items-center gap-0.5 text-[10px] font-bold text-violet-300 bg-violet-500/15 px-1.5 py-0.5 rounded shrink-0"
                                title={`${replyCount} resposta(s) recebida(s)`}
                              >
                                <Mail className="h-2.5 w-2.5" /> {replyCount} {replyCount === 1 ? "resposta" : "respostas"}
                              </span>
                            )}
                          </div>
                          {p.formatted_address && (
                            <div className="mt-1 flex items-center gap-1 text-xs text-zinc-400">
                              <MapPin className="h-3 w-3 shrink-0" />
                              <span className="truncate">{p.formatted_address}</span>
                            </div>
                          )}
                          <div className="mt-2 flex flex-wrap items-center gap-1.5">
                            <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-zinc-300 capitalize">{p.niche || p.category || "—"}</span>
                            {p.city && <span className="text-[10px] text-zinc-500">📍 {p.city}</span>}
                            {p.hasWebsite ? (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-blue-300 bg-blue-500/15 px-1.5 py-0.5 rounded"><Globe className="h-2.5 w-2.5" /> Tem site</span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-amber-300 bg-amber-500/15 px-1.5 py-0.5 rounded"><AlertTriangle className="h-2.5 w-2.5" /> Sem site</span>
                            )}
                            {p.hasWhatsApp && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-300 bg-emerald-500/15 px-1.5 py-0.5 rounded"><MessageCircle className="h-2.5 w-2.5" /> WhatsApp</span>
                            )}
                            <span className="rounded-md bg-blue-500/15 px-1.5 py-0.5 text-[10px] font-bold text-blue-300 ring-1 ring-blue-500/20">{p.status || "new"}</span>
                          </div>
                        </div>
                        {/* Indicador visual de "clique para ver detalhes" */}
                        <div className="shrink-0 flex flex-col items-end gap-2">
                          <div className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold text-emerald-300 group-hover:bg-emerald-500/25 transition whitespace-nowrap">
                            <Eye className="h-3 w-3" /> Detalhes
                          </div>
                          {/* Ações rápidas — stopPropagation evita abrir o modal */}
                          <div
                            className="flex gap-1"
                            role="group"
                            aria-label="Ações rápidas"
                          >
                            {num && (
                              <a
                                href={`https://wa.me/${num}?text=${encodeURIComponent(wa)}`}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="rounded bg-emerald-500/15 p-2 text-emerald-300 hover:bg-emerald-500/30 transition"
                                title="Abrir WhatsApp"
                                aria-label="Abrir WhatsApp"
                              >
                                <MessageCircle className="h-3.5 w-3.5" />
                              </a>
                            )}
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.name + " " + (p.formatted_address || ""))}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="rounded bg-amber-500/15 p-2 text-amber-300 hover:bg-amber-500/30 transition"
                              title="Ver no Google Maps"
                              aria-label="Ver no Google Maps"
                            >
                              <MapPin className="h-3.5 w-3.5" />
                            </a>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); openPreview(p); }}
                              className="rounded bg-amber-500/15 p-2 text-amber-300 hover:bg-amber-500/30 transition"
                              title="Preview do site"
                              aria-label="Preview do site"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); copyPreviewLink(p); }}
                              className="rounded bg-blue-500/15 p-2 text-blue-300 hover:bg-blue-500/30 transition"
                              title="Copiar link compartilhável"
                              aria-label="Copiar link compartilhável"
                            >
                              {copiedText === `link-${p.id || p.place_id}` ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
                            </button>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); openPreviewLink(p); }}
                              className="rounded bg-emerald-500/15 p-2 text-emerald-300 hover:bg-emerald-500/30 transition"
                              title="Abrir link compartilhável"
                              aria-label="Abrir link compartilhável"
                            >
                              <Share2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </Widget>
      )}

      {/* Modal de detalhes do lead — mostra todas as informações + copy+CTA */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          genWA={genWA}
          genEmail={genEmail}
          genPrompt={genPrompt}
          openPreview={openPreview}
          copyPreviewLink={copyPreviewLink}
          openPreviewLink={openPreviewLink}
          copyToClipboard={copyToClipboard}
          copiedText={copiedText}
          onOpenReply={setReplyLead}
          replyVersion={replyVersion}
        />
      )}

      {/* === REPLY MODAL — registrar resposta do lead === */}
      {replyLead && (
        <ReplyModal
          lead={replyLead}
          onClose={() => setReplyLead(null)}
          onSaved={async () => {
            await loadProspects();
            await loadReplyCounts();
            setReplyVersion(v => v + 1); // trigger LeadDetailModal reply history refresh
          }}
        />
      )}

      {/* === STYLE SELECTOR MODAL — carrossel de estilos de preview === */}
      {styleSelectorLead && (
        <StyleSelectorModal
          lead={styleSelectorLead}
          onClose={() => setStyleSelectorLead(null)}
          onSelectStyle={(styleId) => openPreviewWithStyle(styleSelectorLead, styleId)}
          getPreviewLinkWithStyle={getPreviewLinkWithStyle}
        />
      )}

      {/* === BULK SEND MODAL === */}
      {showBulkModal && (
        <BulkSendModal
          selectedCount={selectedIds.size}
          bulkStyle={bulkStyle}
          setBulkStyle={setBulkStyle}
          bulkTemplate={bulkTemplate}
          setBulkTemplate={setBulkTemplate}
          bulkCustomCta={bulkCustomCta}
          setBulkCustomCta={setBulkCustomCta}
          bulkGenerating={bulkGenerating}
          bulkResults={bulkResults}
          bulkError={bulkError}
          bulkSentIds={bulkSentIds}
          batchSize={batchSize}
          allSentIds={allSentIds}
          onGenerate={() => generateBulkMessages("regenerate")}
          onOpenOne={openOneBulkSend}
          onOpenAll={openAllBulkSend}
          onContinueToNextBatch={continueToNextBatch}
          onClose={() => { setShowBulkModal(false); setBulkResults(null); setBulkCampaign(""); }}
          onSentComplete={loadProspects}
        />
      )}

      {view==="envios" && <EnviosView />}
      {view==="respostas" && <RespostasView onOpenReply={(lead) => setReplyLead(lead)} />}
      {view==="report" && <ReportView />}
    </AdminShell>
  );
}

function EnviosView() {
  const [data,setData]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);
  const [nicheFilter,setNicheFilter]=useState<string>("all");
  const [campaignFilter,setCampaignFilter]=useState<string>("all");
  const [statusFilter,setStatusFilter]=useState<string>("all");

  useEffect(()=>{
    fetch("/api/admin/envios?limit=500")
      .then(r=>r.json())
      .then(d=>{setData(d.data||[]);setLoading(false);})
      .catch(()=>setLoading(false));
  },[]);

  // Derive unique niches and campaigns from data
  const niches = Array.from(new Set(data.map((e:any)=>e.prospect_niche).filter(Boolean))) as string[];
  const campaigns = Array.from(new Set(data.map((e:any)=>e.campaign).filter(Boolean))) as string[];

  // Apply filters
  const filtered = data.filter((e:any) => {
    if (nicheFilter !== "all" && e.prospect_niche !== nicheFilter) return false;
    if (campaignFilter !== "all" && e.campaign !== campaignFilter) return false;
    if (statusFilter !== "all" && e.status !== statusFilter) return false;
    return true;
  });

  // Stats for the filtered set
  const stats = {
    total: filtered.length,
    sent: filtered.filter((e:any)=>e.status==="sent").length,
    failed: filtered.filter((e:any)=>e.status==="failed").length,
    pending: filtered.filter((e:any)=>e.status==="pending").length,
  };

  if(loading) return <div className="py-12 text-center text-sm text-zinc-500"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>;

  return (
    <Widget title="Log de Envios" icon={<MessageCircle className="h-4 w-4 text-emerald-400" />}>
      {data.length===0 ? (
        <EmptyState title="Nenhum envio" icon={<MessageCircle className="h-8 w-8" />} />
      ) : (
        <div className="space-y-4">
          {/* === Stats summary === */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Total</div>
              <div className="text-lg font-bold text-white">{stats.total}</div>
            </div>
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.04] p-2.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Enviados</div>
              <div className="text-lg font-bold text-emerald-300">{stats.sent}</div>
            </div>
            <div className="rounded-lg border border-rose-500/20 bg-rose-500/[0.04] p-2.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Falhas</div>
              <div className="text-lg font-bold text-rose-300">{stats.failed}</div>
            </div>
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.04] p-2.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Pendentes</div>
              <div className="text-lg font-bold text-amber-300">{stats.pending}</div>
            </div>
          </div>

          {/* === Filters === */}
          <div className="flex flex-wrap items-end gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Nicho</label>
              <select
                value={nicheFilter}
                onChange={e=>setNicheFilter(e.target.value)}
                className="rounded-lg border border-white/10 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 min-w-[140px]"
              >
                <option value="all">Todos os nichos ({data.length})</option>
                {niches.map(n => (
                  <option key={n} value={n}>{n} ({data.filter(e=>e.prospect_niche===n).length})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Campanha</label>
              <select
                value={campaignFilter}
                onChange={e=>setCampaignFilter(e.target.value)}
                className="rounded-lg border border-white/10 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 min-w-[180px] max-w-[280px]"
              >
                <option value="all">Todas as campanhas ({data.length})</option>
                {campaigns.map(c => (
                  <option key={c} value={c}>{c} ({data.filter(e=>e.campaign===c).length})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={e=>setStatusFilter(e.target.value)}
                className="rounded-lg border border-white/10 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 min-w-[110px]"
              >
                <option value="all">Todos</option>
                <option value="sent">Enviados</option>
                <option value="failed">Falhas</option>
                <option value="pending">Pendentes</option>
              </select>
            </div>
            {(nicheFilter !== "all" || campaignFilter !== "all" || statusFilter !== "all") && (
              <button
                type="button"
                onClick={() => { setNicheFilter("all"); setCampaignFilter("all"); setStatusFilter("all"); }}
                className="text-xs text-zinc-400 hover:text-zinc-200 underline ml-auto"
              >
                Limpar filtros
              </button>
            )}
          </div>

          {/* === Table === */}
          {filtered.length === 0 ? (
            <EmptyState title="Nenhum envio com esses filtros" description="Tente limpar os filtros ou alterar a seleção." icon={<MessageCircle className="h-8 w-8" />} />
          ) : (
            <div className="-mx-2 overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead className="border-b border-white/5 text-[11px] uppercase tracking-wider text-zinc-500">
                  <tr>
                    <th className="px-3 py-2">Data</th>
                    <th className="px-3 py-2">Lead</th>
                    <th className="px-3 py-2">Nicho</th>
                    <th className="px-3 py-2">Campanha</th>
                    <th className="px-3 py-2">Variante</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Erro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((e:any)=>(
                    <tr key={e.id} className="hover:bg-white/[0.02]">
                      <td className="px-3 py-2.5 text-xs text-zinc-400 whitespace-nowrap">{new Date(e.sent_at).toLocaleString("pt-BR")}</td>
                      <td className="px-3 py-2.5 text-zinc-200">{e.prospect_name||"—"}</td>
                      <td className="px-3 py-2.5">
                        {e.prospect_niche ? (
                          <Badge variant="info">{e.prospect_niche}</Badge>
                        ) : (
                          <span className="text-xs text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-zinc-400 max-w-[200px] truncate" title={e.campaign||""}>{e.campaign||"—"}</td>
                      <td className="px-3 py-2.5"><Badge variant="muted">{e.message_variant||"—"}</Badge></td>
                      <td className="px-3 py-2.5">
                        <Badge variant={e.status==="sent"?"success":e.status==="failed"?"danger":"warning"}>{e.status}</Badge>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-rose-300 max-w-[200px] truncate">{e.error||"—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </Widget>
  );
}

function RespostasView({ onOpenReply }: { onOpenReply: (lead: Lead) => void }) {
  const [data,setData]=useState<any[]>([]); const [loading,setLoading]=useState(true);
  const [selectedReply, setSelectedReply] = useState<any | null>(null);
  const [nicheFilter, setNicheFilter] = useState<string>("all");
  const [classFilter, setClassFilter] = useState<string>("all");

  const load=useCallback(()=>{setLoading(true);fetch("/api/admin/respostas?limit=500").then(r=>r.json()).then(d=>{setData(d.data||[]);setLoading(false);}).catch(()=>setLoading(false));},[]);
  useEffect(()=>{load();},[load]);

  const cc:Record<string,any> = {permission_to_send:"info",interessado:"success",meeting_ready:"success",opt_out:"danger",pricing_question:"warning",ambiguous:"muted",unclassified:"muted"};
  const classMeta: Record<string, { emoji: string; label: string }> = {
    permission_to_send: { emoji: "✅", label: "Permitiu info" },
    interessado: { emoji: "🔥", label: "Interessado" },
    meeting_ready: { emoji: "📅", label: "Quer reunião" },
    opt_out: { emoji: "🚫", label: "Não quer" },
    pricing_question: { emoji: "💰", label: "Preço" },
    ambiguous: { emoji: "❓", label: "Ambíguo" },
    unclassified: { emoji: "📋", label: "Sem classificação" },
  };

  // Derive unique niches + classifications
  const niches = Array.from(new Set(data.map((r:any)=>r.prospect_niche).filter(Boolean))) as string[];
  const classes = Array.from(new Set(data.map((r:any)=>r.classification).filter(Boolean))) as string[];

  // Apply filters
  const filtered = data.filter((r:any) => {
    if (nicheFilter !== "all" && r.prospect_niche !== nicheFilter) return false;
    if (classFilter !== "all" && r.classification !== classFilter) return false;
    return true;
  });

  return (
    <Widget title="Respostas Recebidas" icon={<Mail className="h-4 w-4 text-emerald-400" />} action={
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-3.5 w-3.5 ${loading?"animate-spin":""}`} /><span className="ml-1">Atualizar</span>
        </Button>
      </div>
    }>
      {loading ? (
        <div className="py-12 text-center text-sm text-zinc-500"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
      ) : data.length === 0 ? (
        <EmptyState title="Nenhuma resposta" icon={<Mail className="h-8 w-8" />} description="Quando um lead responder no WhatsApp, registre a resposta via botão 'Resposta' na aba Buscar." />
      ) : (
        <div className="space-y-3">
          {/* === Stats + filters === */}
          <div className="flex flex-wrap items-end gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Nicho</label>
              <select
                value={nicheFilter}
                onChange={e=>setNicheFilter(e.target.value)}
                className="rounded-lg border border-white/10 bg-zinc-900 px-2 py-1.5 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 min-w-[140px]"
              >
                <option value="all">Todos ({data.length})</option>
                {niches.map(n => (
                  <option key={n} value={n}>{n} ({data.filter(r=>r.prospect_niche===n).length})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Classificação</label>
              <select
                value={classFilter}
                onChange={e=>setClassFilter(e.target.value)}
                className="rounded-lg border border-white/10 bg-zinc-900 px-2 py-1.5 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 min-w-[160px]"
              >
                <option value="all">Todas ({data.length})</option>
                {classes.map(c => (
                  <option key={c} value={c}>{classMeta[c]?.emoji || ""} {classMeta[c]?.label || c} ({data.filter(r=>r.classification===c).length})</option>
                ))}
              </select>
            </div>
            {(nicheFilter !== "all" || classFilter !== "all") && (
              <button
                type="button"
                onClick={() => { setNicheFilter("all"); setClassFilter("all"); }}
                className="text-xs text-zinc-400 hover:text-zinc-200 underline ml-auto"
              >
                Limpar filtros
              </button>
            )}
          </div>

          {/* === Replies list === */}
          {filtered.length === 0 ? (
            <EmptyState title="Nenhuma resposta com esses filtros" description="Tente limpar os filtros ou alterar a seleção." icon={<Mail className="h-8 w-8" />} />
          ) : (
            <div className="space-y-2">
              {filtered.map((r:any) => {
                const cm = classMeta[r.classification] || classMeta.unclassified;
                return (
                  <div
                    key={r.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedReply(r)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedReply(r); } }}
                    className="block w-full text-left rounded-xl border border-white/5 bg-white/[0.02] hover:bg-violet-500/[0.06] hover:border-violet-500/30 active:bg-violet-500/[0.1] p-3 transition group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-white group-hover:text-violet-300 transition truncate">{r.prospect_name||"—"}</span>
                          {r.prospect_niche && (
                            <span className="text-[10px] text-zinc-500 capitalize">{r.prospect_niche}</span>
                          )}
                          <span className="text-[11px] text-zinc-500">{new Date(r.received_at).toLocaleString("pt-BR")}</span>
                        </div>
                      </div>
                      <Badge variant={cc[r.classification]||"muted"}>
                        {cm.emoji} {cm.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-zinc-300 mb-2 italic line-clamp-2 overflow-hidden">
                      "{r.message_text}"
                    </p>
                    {(r.action_taken || r.next_step) && (
                      <div className="flex gap-4 text-[11px] text-zinc-500">
                        {r.action_taken && <span>📋 {r.action_taken}</span>}
                        {r.next_step && <span>→ {r.next_step}</span>}
                      </div>
                    )}
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-violet-400/70 group-hover:text-violet-300 transition">
                      <Eye className="h-3 w-3" /> Clique para ver detalhes e responder
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* === Reply Detail Modal === */}
      {selectedReply && (
        <ReplyDetailModal
          reply={selectedReply}
          onClose={() => setSelectedReply(null)}
          onOpenReply={onOpenReply}
        />
      )}
    </Widget>
  );
}

// =====================================================
// REPLY DETAIL MODAL — shows full reply + actions
// =====================================================
function ReplyDetailModal({
  reply,
  onClose,
  onOpenReply,
}: {
  reply: any;
  onClose: () => void;
  onOpenReply: (lead: Lead) => void;
}) {
  // Body scroll lock + ESC
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onEsc);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onEsc);
    };
  }, [onClose]);

  const classMeta: Record<string, { emoji: string; label: string; color: string }> = {
    permission_to_send: { emoji: "✅", label: "Permitiu info", color: "info" },
    interessado: { emoji: "🔥", label: "Interessado", color: "success" },
    meeting_ready: { emoji: "📅", label: "Quer reunião", color: "success" },
    opt_out: { emoji: "🚫", label: "Não quer", color: "danger" },
    pricing_question: { emoji: "💰", label: "Preço", color: "warning" },
    ambiguous: { emoji: "❓", label: "Ambíguo", color: "muted" },
    unclassified: { emoji: "📋", label: "Sem classificação", color: "muted" },
  };
  const cm = classMeta[reply.classification] || classMeta.unclassified;
  const waNum = normalizeBrazilianPhone(reply.prospect_whatsapp || reply.prospect_phone) || "";
  const waLink = waNum ? `https://wa.me/${waNum}` : "";

  // Build a Lead object for onOpenReply
  const lead: Lead = {
    id: reply.prospect_id,
    name: reply.prospect_name || "—",
    niche: reply.prospect_niche,
    city: reply.prospect_city,
    whatsapp: reply.prospect_whatsapp,
    phone: reply.prospect_phone,
    status: "contacted",
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[88vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-white/5 bg-zinc-950/95 backdrop-blur p-4 sm:p-5">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Mail className="h-5 w-5 text-violet-400" />
              <h3 className="text-base sm:text-lg font-bold text-white truncate">{reply.prospect_name || "—"}</h3>
              <Badge variant={(["success","info","danger","warning","muted"] as const).includes(cm.color as any) ? cm.color as any : "muted"}>
                {cm.emoji} {cm.label}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              {reply.prospect_niche && <span className="capitalize">{reply.prospect_niche}</span>}
              {reply.prospect_city && <span className="ml-1.5">• {reply.prospect_city}</span>}
              <span className="ml-1.5">• {new Date(reply.received_at).toLocaleString("pt-BR")}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="shrink-0 rounded-full bg-white/5 p-2 text-zinc-400 hover:bg-white/10 hover:text-white transition min-h-9 min-w-9 flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          {/* Full message */}
          <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.04] p-3">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-violet-300">
              💬 Mensagem recebida
            </div>
            <pre className="whitespace-pre-wrap text-sm text-zinc-200 font-sans leading-relaxed">{reply.message_text}</pre>
          </div>

          {/* Action taken + next step */}
          {(reply.action_taken || reply.next_step) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {reply.action_taken && (
                <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">📋 Ação tomada</div>
                  <div className="text-xs text-zinc-300">{reply.action_taken}</div>
                </div>
              )}
              {reply.next_step && (
                <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">→ Próximo passo</div>
                  <div className="text-xs text-zinc-300">{reply.next_step}</div>
                </div>
              )}
            </div>
          )}

          {/* Contact info */}
          <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">📞 Contato</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-zinc-500">WhatsApp:</span>{" "}
                <span className="text-emerald-300 font-mono">{reply.prospect_whatsapp || reply.prospect_phone || "—"}</span>
              </div>
              <div>
                <span className="text-zinc-500">Cidade:</span>{" "}
                <span className="text-zinc-300">{reply.prospect_city || "—"}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-2 pt-2">
            {/* Reply button (opens ReplyModal to register a new reply) */}
            <button
              onClick={() => {
                onClose();
                onOpenReply(lead);
              }}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-violet-500/15 border border-violet-500/30 py-3 text-sm font-bold text-violet-300 hover:bg-violet-500/25 transition"
            >
              <Reply className="h-4 w-4" /> Registrar nova resposta deste lead
              <kbd className="ml-1 rounded bg-violet-500/20 px-1 py-0.5 text-[9px] font-mono text-violet-300/80">R</kbd>
            </button>

            {/* WhatsApp button */}
            {waLink && (
              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 py-3 text-sm font-bold text-emerald-300 hover:bg-emerald-500/25 transition"
              >
                <MessageCircle className="h-4 w-4" /> Abrir WhatsApp do lead
              </a>
            )}

            {/* Export button */}
            {reply.prospect_id && (
              <a
                href={`/api/admin/respostas/export?prospect_id=${encodeURIComponent(reply.prospect_id)}&format=csv`}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-500/15 border border-blue-500/30 py-2.5 text-xs font-bold text-blue-300 hover:bg-blue-500/25 transition"
              >
                <FileDown className="h-4 w-4" /> Exportar histórico completo (CSV)
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportView() {
  const [r,setR]=useState<any>(null); const [loading,setLoading]=useState(true);
  useEffect(()=>{fetch("/api/admin/prospect/report").then(r=>r.json()).then(d=>{setR(d);setLoading(false);}).catch(()=>setLoading(false));},[]);
  if(loading) return <div className="py-12 text-center text-sm text-zinc-500"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>;
  if(!r) return <EmptyState title="Erro ao carregar" icon={<AlertCircle className="h-8 w-8" />} />;
  const t=r.today||{}; const s=t.sends||{}; const rep=t.replies||{};
  return (
    <div className="space-y-4">
      <Widget title={`Relatorio — ${r.date}`} icon={<RefreshCw className="h-4 w-4 text-emerald-400" />}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SB label="Enviados hoje" value={s.confirmed||0} icon={MessageCircle} c="emerald" />
          <SB label="Falhas" value={s.failed||0} icon={AlertCircle} c="rose" />
          <SB label="Respostas" value={rep.total||0} icon={Mail} c="blue" />
          <SB label="Oportunidades" value={r.opportunities||0} icon={Zap} c="amber" />
        </div>
      </Widget>
      <Widget title="Pipeline por Status" icon={<Layout className="h-4 w-4 text-violet-400" />}>
        <div className="space-y-2">{(r.status_breakdown||[]).map((s:any)=><div key={s.status} className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2"><span className="text-sm text-zinc-300 capitalize">{s.status}</span><span className="font-bold text-white">{s.count}</span></div>)}</div>
      </Widget>
    </div>
  );
}

function SB({label,value,icon:Icon,c="emerald"}:{label:string;value:number;icon:React.ComponentType<{className?:string}>;c?:"emerald"|"blue"|"amber"|"rose"|"violet"}) {
  const colors:Record<string,string> = {emerald:"text-emerald-300 bg-emerald-500/10",blue:"text-blue-300 bg-blue-500/10",amber:"text-amber-300 bg-amber-500/10",rose:"text-rose-300 bg-rose-500/10",violet:"text-violet-300 bg-violet-500/10"};
  return <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3"><div className="flex items-center gap-2"><div className={`flex h-7 w-7 items-center justify-center rounded-lg ${colors[c]}`}><Icon className="h-3.5 w-3.5" /></div><div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{label}</div></div><div className="mt-1.5 text-xl font-bold text-white">{value}</div></div>;
}

// =====================================================
// MODAL DETALHES DO LEAD — mostra todas as informações
// + mensagens WhatsApp/Email + Prompt + Preview + Objeções + Histórico de respostas
// =====================================================
function LeadDetailModal({
  lead, onClose, genWA, genEmail, genPrompt,
  openPreview, copyPreviewLink, openPreviewLink,
  copyToClipboard, copiedText, onOpenReply, replyVersion,
}: {
  lead: Lead;
  onClose: () => void;
  genWA: (l: Lead) => string;
  genEmail: (l: Lead) => string;
  genPrompt: (l: Lead) => string;
  openPreview: (l: Lead) => void;
  copyPreviewLink: (l: Lead) => void;
  openPreviewLink: (l: Lead) => void;
  copyToClipboard: (text: string, id: string) => void;
  copiedText: string | null;
  onOpenReply: (lead: Lead) => void;
  replyVersion: number;
}) {
  const wa = genWA(lead);
  const em = genEmail(lead);
  const pr = genPrompt(lead);
  const num = normalizeBrazilianPhone(lead.whatsapp || lead.phone) || "";
  const leadId = lead.id || lead.place_id || "";

  // === Fetch reply history for this lead ===
  const [replies, setReplies] = useState<any[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadReplies() {
      if (!leadId) { setLoadingReplies(false); return; }
      setLoadingReplies(true);
      try {
        const resp = await fetch(`/api/admin/respostas?limit=50`);
        const json = await resp.json();
        if (cancelled) return;
        const all = json.data || [];
        // Filter replies for this lead (match by prospect_id UUID OR place_id)
        const leadReplies = all.filter((r: any) => {
          if (lead.id && r.prospect_id === lead.id) return true;
          // Also match by prospect_name as fallback
          if (r.prospect_name && lead.name && r.prospect_name === lead.name) return true;
          return false;
        });
        setReplies(leadReplies);
      } catch {
        if (!cancelled) setReplies([]);
      } finally {
        if (!cancelled) setLoadingReplies(false);
      }
    }
    loadReplies();
    return () => { cancelled = true; };
  }, [leadId, lead.id, lead.name, replyVersion]);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onEsc);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onEsc);
    };
  }, [onClose]);

  const objections = getRelevantObjections({
    niche: lead.niche || lead.category,
    hasWebsite: lead.hasWebsite,
  });

  // Classification metadata for reply history
  const classMeta: Record<string, { emoji: string; label: string; color: string }> = {
    permission_to_send: { emoji: "✅", label: "Permitiu info", color: "info" },
    interessado: { emoji: "🔥", label: "Interessado", color: "success" },
    meeting_ready: { emoji: "📅", label: "Quer reunião", color: "success" },
    opt_out: { emoji: "🚫", label: "Não quer", color: "danger" },
    pricing_question: { emoji: "💰", label: "Preço", color: "warning" },
    ambiguous: { emoji: "❓", label: "Ambíguo", color: "muted" },
    unclassified: { emoji: "📋", label: "Sem classificação", color: "muted" },
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-3xl max-h-[92vh] sm:max-h-[88vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl"
      >
        {/* Header sticky */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-white/5 bg-zinc-950/95 backdrop-blur p-4 sm:p-5">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-white truncate">{lead.name}</h3>
              {lead.rating && (
                <span className="flex items-center gap-0.5 text-xs">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-amber-300">{lead.rating}</span>
                  {lead.user_ratings_total && <span className="text-zinc-500">({lead.user_ratings_total})</span>}
                </span>
              )}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <Badge variant="muted">{lead.niche || lead.category || "estabelecimento"}</Badge>
              {lead.hasWebsite ? <Badge variant="info"><Globe className="h-3 w-3" /> Tem site</Badge> : <Badge variant="warning"><AlertTriangle className="h-3 w-3" /> Sem site</Badge>}
              {lead.hasWhatsApp && <Badge variant="success"><MessageCircle className="h-3 w-3" /> WhatsApp</Badge>}
              {lead.webDevOpportunity && <Badge variant="danger"><Zap className="h-3 w-3" /> Oportunidade</Badge>}
              <span className="rounded-md bg-blue-500/15 px-2 py-0.5 text-[10px] font-bold text-blue-300 ring-1 ring-blue-500/20">{lead.status || "new"}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="shrink-0 rounded-full bg-white/5 p-2 text-zinc-400 hover:bg-white/10 hover:text-white transition min-h-9 min-w-9 flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          {/* === INFORMAÇÕES PRINCIPAIS === */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 sm:p-4">
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-400">Informações</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {lead.formatted_address && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-zinc-500" />
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase text-zinc-500">Endereço</div>
                    <div className="text-zinc-200 text-xs sm:text-sm break-words">{lead.formatted_address}</div>
                  </div>
                </div>
              )}
              {lead.city && (
                <div className="flex items-start gap-2">
                  <Building2 className="h-4 w-4 shrink-0 mt-0.5 text-zinc-500" />
                  <div>
                    <div className="text-[10px] uppercase text-zinc-500">Cidade</div>
                    <div className="text-zinc-200 text-xs sm:text-sm">{lead.city}</div>
                  </div>
                </div>
              )}
              {lead.phone && (
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 shrink-0 mt-0.5 text-zinc-500" />
                  <div>
                    <div className="text-[10px] uppercase text-zinc-500">Telefone</div>
                    <div className="text-zinc-200 text-xs sm:text-sm">{lead.phone}</div>
                  </div>
                </div>
              )}
              {lead.whatsapp && (
                <div className="flex items-start gap-2">
                  <MessageCircle className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
                  <div>
                    <div className="text-[10px] uppercase text-zinc-500">WhatsApp</div>
                    <div className="text-emerald-300 text-xs sm:text-sm">{lead.whatsapp}</div>
                  </div>
                </div>
              )}
              {lead.email && (
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 shrink-0 mt-0.5 text-zinc-500" />
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase text-zinc-500">Email</div>
                    <div className="text-zinc-200 text-xs sm:text-sm break-all">{lead.email}</div>
                  </div>
                </div>
              )}
              {lead.website && (
                <div className="flex items-start gap-2">
                  <Globe className="h-4 w-4 shrink-0 mt-0.5 text-blue-400" />
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase text-zinc-500">Website</div>
                    <a href={lead.website} target="_blank" rel="noreferrer" className="text-blue-300 text-xs sm:text-sm break-all hover:underline">{lead.website}</a>
                  </div>
                </div>
              )}
              {lead.instagram && (
                <div className="flex items-start gap-2">
                  <Smartphone className="h-4 w-4 shrink-0 mt-0.5 text-zinc-500" />
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase text-zinc-500">Instagram</div>
                    <a href={lead.instagram} target="_blank" rel="noreferrer" className="text-pink-300 text-xs sm:text-sm break-all hover:underline">{lead.instagram}</a>
                  </div>
                </div>
              )}
              {lead.openingHours && (
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 shrink-0 mt-0.5 text-zinc-500" />
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase text-zinc-500">Horário</div>
                    <div className="text-zinc-200 text-xs sm:text-sm whitespace-pre-line">{lead.openingHours}</div>
                  </div>
                </div>
              )}
              {lead.created_at && (
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 shrink-0 mt-0.5 text-zinc-500" />
                  <div>
                    <div className="text-[10px] uppercase text-zinc-500">Salvo em</div>
                    <div className="text-zinc-200 text-xs sm:text-sm">{new Date(lead.created_at).toLocaleString("pt-BR")}</div>
                  </div>
                </div>
              )}
            </div>
            {/* Localização + Maps button */}
            <div className="mt-3 flex flex-wrap gap-2 pt-3 border-t border-white/5">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.name + " " + (lead.formatted_address || ""))}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/15 px-3 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500/25"
              >
                <MapPin className="h-3.5 w-3.5" /> Abrir no Google Maps
              </a>
              {lead.lat && lead.lng && (
                <a
                  href={`https://www.google.com/maps?q=${lead.lat},${lead.lng}&z=16`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/10"
                >
                  <MapPin className="h-3.5 w-3.5" /> Ver coordenadas
                </a>
              )}
            </div>
          </div>

          {/* === WHATSAPP MESSAGE + CTA === */}
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.03] p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                <MessageCircle className="h-3.5 w-3.5" /> Mensagem WhatsApp
              </span>
              <div className="flex gap-1.5">
                {num && (
                  <a
                    href={`https://wa.me/${num}?text=${encodeURIComponent(wa)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md bg-emerald-500/20 px-2 py-1 text-[10px] font-semibold text-emerald-300 hover:bg-emerald-500/30 inline-flex items-center gap-1"
                  >
                    <MessageCircle className="h-3 w-3" /> Abrir
                  </a>
                )}
                <button
                  onClick={() => copyToClipboard(wa, `wa-${leadId}`)}
                  className="rounded-md bg-emerald-500/20 px-2 py-1 text-[10px] font-semibold text-emerald-300 hover:bg-emerald-500/30"
                >
                  {copiedText === `wa-${leadId}` ? "✓ Copiado" : "Copiar"}
                </button>
              </div>
            </div>
            <pre className="whitespace-pre-wrap text-[11px] text-zinc-300 font-sans max-h-48 overflow-y-auto leading-relaxed">{wa}</pre>
          </div>

          {/* === EMAIL MESSAGE === */}
          <div className="rounded-lg border border-blue-500/20 bg-blue-500/[0.03] p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-blue-300">
                <Mail className="h-3.5 w-3.5" /> Mensagem Email
              </span>
              <button
                onClick={() => copyToClipboard(em, `em-${leadId}`)}
                className="rounded-md bg-blue-500/20 px-2 py-1 text-[10px] font-semibold text-blue-300 hover:bg-blue-500/30"
              >
                {copiedText === `em-${leadId}` ? "✓ Copiado" : "Copiar"}
              </button>
            </div>
            <pre className="whitespace-pre-wrap text-[11px] text-zinc-300 font-sans max-h-48 overflow-y-auto leading-relaxed">{em}</pre>
          </div>

          {/* === PREVIEW DO SITE === */}
          <button
            onClick={() => openPreview(lead)}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-sm font-bold text-white shadow-lg hover:scale-[1.01] transition"
          >
            <Eye className="h-4 w-4" /> Ver Preview do Site
          </button>

          {/* === LINK COMPARTILHÁVEL === */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => copyPreviewLink(lead)}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-500/15 px-3 py-2 text-xs font-semibold text-blue-300 ring-1 ring-blue-500/20 hover:bg-blue-500/25 transition"
              title="Copiar link compartilhável"
            >
              {copiedText === `link-${lead.id || lead.place_id}` ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
              {copiedText === `link-${lead.id || lead.place_id}` ? "Link copiado!" : "Copiar link"}
            </button>
            <button
              onClick={() => openPreviewLink(lead)}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-500/20 hover:bg-emerald-500/25 transition"
              title="Abrir link compartilhável"
            >
              <Share2 className="h-3.5 w-3.5" /> Abrir link
            </button>
          </div>

          {/* === EXPORT HISTORY (CSV) === */}
          {lead.id && (
            <a
              href={`/api/admin/respostas/export?prospect_id=${encodeURIComponent(lead.id)}&format=csv`}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-500/15 border border-violet-500/30 py-2.5 text-xs font-bold text-violet-300 hover:bg-violet-500/25 transition"
              title="Baixar histórico de respostas em CSV"
            >
              <FileDown className="h-4 w-4" /> Exportar histórico de respostas (CSV)
            </a>
          )}

          {/* === PROMPT DO SITE === */}
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.03] p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                <Code2 className="h-3.5 w-3.5" /> Prompt do Site
              </span>
              <button
                onClick={() => copyToClipboard(pr, `pr-${leadId}`)}
                className="rounded-md bg-amber-500/20 px-2 py-1 text-[10px] font-semibold text-amber-300 hover:bg-amber-500/30"
              >
                {copiedText === `pr-${leadId}` ? "✓ Copiado" : "Copiar"}
              </button>
            </div>
            <pre className="whitespace-pre-wrap text-[10px] text-zinc-400 font-mono max-h-56 overflow-y-auto leading-relaxed">{pr}</pre>
          </div>

          {/* === QUEBRA DE OBJEÇÕES === */}
          {objections.length > 0 && (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/[0.04] p-3">
              <div className="mb-3 flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-rose-300" />
                <span className="text-xs font-bold text-rose-200">
                  Quebra de Objeções ({objections.length})
                </span>
              </div>
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {objections.map((obj) => {
                  const f = formatObjectionForDisplay(obj);
                  const copyId = `obj-${leadId}-${obj.id}`;
                  return (
                    <div key={obj.id} className="rounded-md border border-white/5 bg-black/20 p-2.5">
                      <div className="mb-1.5 text-[10px] font-bold text-rose-300/80 uppercase tracking-wide">
                        {f.objectionLabel}
                      </div>
                      <div className="mb-2 text-[11px] text-zinc-300 italic">
                        &ldquo;{obj.objection}&rdquo;
                      </div>
                      <div className="mb-1.5 text-[10px] font-bold text-emerald-300/80 uppercase tracking-wide">
                        {f.breakLabel}
                      </div>
                      <div className="flex gap-2">
                        <pre className="flex-1 whitespace-pre-wrap text-[10px] text-zinc-200 font-sans max-h-40 overflow-y-auto leading-relaxed">
                          {obj.break}
                        </pre>
                        <button
                          onClick={() => copyToClipboard(obj.break, copyId)}
                          className="shrink-0 rounded bg-emerald-500/20 px-2 py-1 text-[10px] font-semibold text-emerald-300 hover:bg-emerald-500/30 h-fit"
                          title="Copiar resposta pronta"
                        >
                          {copiedText === copyId ? "✓" : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 pt-2 border-t border-rose-500/20 text-[10px] text-zinc-500">
                💡 As 2 objeções de prioridade 1 já estão embutidas na mensagem WhatsApp acima como ganchos preventivos.
              </div>
            </div>
          )}

          {/* === HISTÓRICO DE RESPOSTAS === */}
          <div className="rounded-lg border border-violet-500/20 bg-violet-500/[0.03] p-3">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-violet-300">
                <Mail className="h-3.5 w-3.5" />
                Histórico de respostas ({replies.length})
              </span>
              <button
                onClick={() => onOpenReply(lead)}
                className="inline-flex items-center gap-1 rounded-md bg-violet-500/20 px-2 py-1 text-[10px] font-semibold text-violet-300 hover:bg-violet-500/30 transition"
                title="Registrar nova resposta (atalho: R)"
              >
                <Plus className="h-3 w-3" /> Registrar nova
                <kbd className="ml-0.5 rounded bg-violet-500/20 px-1 py-0.5 text-[9px] font-mono text-violet-300/80">R</kbd>
              </button>
            </div>

            {loadingReplies ? (
              <div className="flex items-center gap-2 py-3 text-[11px] text-zinc-500">
                <Loader2 className="h-3 w-3 animate-spin" /> Carregando respostas...
              </div>
            ) : replies.length === 0 ? (
              <div className="py-3 text-center text-[11px] text-zinc-600">
                Nenhuma resposta registrada ainda.
                <br />
                Clique em "Registrar nova" ou pressione <kbd className="rounded bg-white/5 px-1 py-0.5 text-[9px] font-mono">R</kbd> quando este lead responder.
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {replies.map((r: any, idx: number) => {
                  const cm = classMeta[r.classification] || classMeta.unclassified;
                  const badgeVariant = (["success","info","danger","warning","muted"] as const).includes(cm.color as any) ? cm.color as any : "muted";
                  return (
                    <div key={r.id || idx} className="rounded-md border border-white/5 bg-black/20 p-2.5">
                      <div className="mb-1.5 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <Badge variant={badgeVariant}>
                            {cm.emoji} {cm.label}
                          </Badge>
                          <span className="text-[10px] text-zinc-500">
                            {new Date(r.received_at).toLocaleString("pt-BR")}
                          </span>
                        </div>
                        {r.next_step && (
                          <span className="text-[10px] text-zinc-400">→ {r.next_step}</span>
                        )}
                      </div>
                      <pre className="whitespace-pre-wrap text-[11px] text-zinc-300 font-sans leading-relaxed mb-1.5">
                        {r.message_text}
                      </pre>
                      {r.action_taken && (
                        <div className="text-[10px] text-zinc-500 italic">
                          📋 {r.action_taken}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// BULK SEND MODAL
// =====================================================
function BulkSendModal({
  selectedCount,
  bulkStyle, setBulkStyle,
  bulkTemplate, setBulkTemplate,
  bulkCustomCta, setBulkCustomCta,
  bulkGenerating,
  bulkResults,
  bulkError,
  bulkSentIds,
  batchSize,
  allSentIds,
  onGenerate,
  onOpenOne,
  onOpenAll,
  onContinueToNextBatch,
  onClose,
  onSentComplete,
}: {
  selectedCount: number;
  bulkStyle: "ai" | "template";
  setBulkStyle: (s: "ai" | "template") => void;
  bulkTemplate: string;
  setBulkTemplate: (s: string) => void;
  bulkCustomCta: string;
  setBulkCustomCta: (s: string) => void;
  bulkGenerating: boolean;
  bulkResults: any[] | null;
  bulkError: string | null;
  bulkSentIds: Set<string>;
  batchSize: number;
  allSentIds: Set<string>;
  onGenerate: () => Promise<void>;
  onOpenOne: (item: any) => Promise<void>;
  onOpenAll: () => Promise<void>;
  onContinueToNextBatch: () => Promise<void>;
  onClose: () => void;
  onSentComplete: () => Promise<void>;
}) {
  // Body scroll lock + ESC handler
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onEsc);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onEsc);
    };
  }, [onClose]);

  // Refresh prospects when all sends are done
  useEffect(() => {
    if (bulkResults && bulkResults.length > 0 && bulkSentIds.size === bulkResults.length) {
      onSentComplete();
    }
  }, [bulkSentIds, bulkResults, onSentComplete]);

  const templatesList = [
    { id: "t1", name: "Direto e curto", desc: "Mensagem enxuta com observação + CTA" },
    { id: "t2", name: "Elogio + gancho", desc: "Começa elogiando avaliação + se apresenta" },
    { id: "t3", name: "Oportunidade local", desc: "Foca em pesquisa no Google + oportunidade perdida" },
    { id: "t4", name: "Curto e amigo", desc: "Mais informal, estilo indicação" },
  ];

  const allSent = bulkResults && bulkResults.length > 0 && bulkSentIds.size === bulkResults.length;
  // Overall progress across all batches
  const totalSent = allSentIds.size;
  const remaining = Math.max(0, selectedCount - totalSent);
  const nextBatchSize = Math.min(remaining, batchSize);
  const allDone = totalSent >= selectedCount && selectedCount > 0;
  const progressPct = selectedCount > 0 ? Math.round((totalSent / selectedCount) * 100) : 0;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-4xl max-h-[92vh] sm:max-h-[88vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl"
      >
        {/* Header sticky */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-white/5 bg-zinc-950/95 backdrop-blur p-4 sm:p-5">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Sparkles className="h-5 w-5 text-emerald-400" />
              <h3 className="text-base sm:text-lg font-bold text-white truncate">
                Disparo em massa — Primeira mensagem
              </h3>
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              {selectedCount} leads selecionados • {batchSize} por vez • Campanha: {new Date().toLocaleDateString("pt-BR")}
            </p>
            {/* Overall progress bar */}
            {selectedCount > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <span className="text-[11px] font-bold text-emerald-300 whitespace-nowrap">
                  {totalSent}/{selectedCount} enviados
                </span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="shrink-0 rounded-full bg-white/5 p-2 text-zinc-400 hover:bg-white/10 hover:text-white transition min-h-9 min-w-9 flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          {/* === STEP 1: STYLE SELECTOR === */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-400">
              Passo 1 — Estilo da mensagem
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setBulkStyle("ai")}
                className={`text-left rounded-lg border p-3 transition ${
                  bulkStyle === "ai"
                    ? "border-emerald-500/50 bg-emerald-500/10"
                    : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm font-bold text-white">IA personalizada</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Cada lead recebe uma mensagem única gerada pela IA (Gemini), variando estrutura e gancho.
                </p>
              </button>
              <button
                type="button"
                onClick={() => setBulkStyle("template")}
                className={`text-left rounded-lg border p-3 transition ${
                  bulkStyle === "template"
                    ? "border-emerald-500/50 bg-emerald-500/10"
                    : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <FileCheck className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-bold text-white">Template fixo</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Mesmo template para todos os leads, com personalização de nome/nicho/cidade.
                </p>
              </button>
            </div>
          </div>

          {/* === STEP 2: TEMPLATE PICKER (only if template mode) === */}
          {bulkStyle === "template" && (
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-400">
                Passo 2 — Escolha o template
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {templatesList.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setBulkTemplate(t.id)}
                    className={`text-left rounded-lg border p-3 transition ${
                      bulkTemplate === t.id
                        ? "border-emerald-500/50 bg-emerald-500/10"
                        : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="text-sm font-bold text-white">{t.name}</div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* === STEP 3: OPTIONAL CUSTOM CTA === */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
              {bulkStyle === "template" ? "Passo 3" : "Passo 2"} — CTA final (opcional)
            </h4>
            <p className="mb-2 text-[11px] text-zinc-500">
              Padrão: <em>"Caso tenha interesse, é só me chamar aqui no WhatsApp. 🙌"</em>
            </p>
            <Input
              placeholder="Deixe vazio para usar o CTA padrão…"
              value={bulkCustomCta}
              onChange={(e) => setBulkCustomCta(e.target.value)}
            />
          </div>

          {/* === STEP 4: GENERATE BUTTON === */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="primary"
              onClick={onGenerate}
              disabled={bulkGenerating || selectedCount === 0}
              className="flex-1 min-w-[200px]"
            >
              {bulkGenerating ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Gerando mensagens…</>
              ) : (
                <><Sparkles className="h-4 w-4" /> Gerar {Math.min(selectedCount, batchSize)} mensagens</>
              )}
            </Button>
            {bulkResults && bulkResults.length > 0 && (
              <Button variant="outline" onClick={onGenerate} disabled={bulkGenerating}>
                <RefreshCw className={`h-3.5 w-3.5 ${bulkGenerating ? "animate-spin" : ""}`} />
                <span className="ml-1">Regenerar</span>
              </Button>
            )}
          </div>

          {/* === OVERALL PROGRESS (when results exist) === */}
          {bulkResults && bulkResults.length > 0 && (
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/[0.04] p-3 space-y-2">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-bold text-blue-300 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Progresso total da campanha
                </span>
                <span className="text-zinc-400">
                  {totalSent} de {selectedCount} enviados • {remaining} restantes
                </span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="flex items-center justify-between gap-2 text-[11px]">
                <span className="text-zinc-500">Lote atual: {bulkResults.length} mensagens • {bulkSentIds.size}/{bulkResults.length} enviadas neste lote</span>
                <span className="font-bold text-emerald-300">{progressPct}%</span>
              </div>
            </div>
          )}

          {/* === ERROR === */}
          {bulkError && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{bulkError}</span>
            </div>
          )}

          {/* === RESULTS === */}
          {bulkResults && bulkResults.length > 0 && (
            <div className="space-y-3">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm font-bold text-emerald-300">
                    Lote atual: {bulkResults.length} mensagens geradas
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400">
                  {bulkSentIds.size}/{bulkResults.length} enviadas neste lote
                </div>
              </div>

              {/* Open all button */}
              {!allSent && (
                <button
                  type="button"
                  onClick={onOpenAll}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-sm font-bold text-white shadow-lg hover:scale-[1.01] transition"
                >
                  <Send className="h-4 w-4" />
                  Abrir todos no WhatsApp ({bulkResults.length} abas)
                </button>
              )}

              {/* === BATCH SENT — show "Continue" or "All done" === */}
              {allSent && !allDone && remaining > 0 && (
                <button
                  type="button"
                  onClick={onContinueToNextBatch}
                  disabled={bulkGenerating}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 py-3 text-sm font-bold text-white shadow-lg hover:scale-[1.01] transition disabled:opacity-50"
                >
                  {bulkGenerating ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Gerando próximo lote…</>
                  ) : (
                    <><ChevronRight className="h-4 w-4" /> Continuar disparo para próximos {nextBatchSize} leads</>
                  )}
                </button>
              )}

              {/* All done */}
              {allDone && (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-center space-y-1">
                  <div className="flex items-center justify-center gap-2 text-sm font-bold text-emerald-300">
                    <CheckCircle2 className="h-5 w-5" />
                    Campanha concluída! 🎉
                  </div>
                  <p className="text-xs text-emerald-200/80">
                    Todos os {selectedCount} leads selecionados receberam o disparo e foram marcados como "Contatado".
                  </p>
                  <p className="text-[11px] text-zinc-400 pt-1">
                    Os registros estão na aba <strong className="text-zinc-300">Envios</strong>.
                  </p>
                </div>
              )}

              {/* Old "batch sent" message replaced by the above */}

              {/* Per-lead list */}
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {bulkResults.map((item, idx) => {
                  const sent = bulkSentIds.has(item.lead.id);
                  return (
                    <div
                      key={item.lead.id}
                      className={`rounded-lg border p-3 transition ${
                        sent
                          ? "border-emerald-500/30 bg-emerald-500/[0.04]"
                          : "border-white/5 bg-white/[0.02]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold text-zinc-500">#{idx + 1}</span>
                            <span className="text-sm font-bold text-white truncate">{item.lead.name}</span>
                            {sent && (
                              <Badge variant="success">
                                <CheckCircle2 className="h-3 w-3" /> Enviado
                              </Badge>
                            )}
                          </div>
                          <div className="text-[10px] text-zinc-500 mt-0.5">
                            {item.lead.niche || "—"} • {item.lead.city || "—"} • variant: {item.variant}
                          </div>
                        </div>
                        {item.waLink && !sent && (
                          <button
                            type="button"
                            onClick={() => onOpenOne(item)}
                            className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/25 transition"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            Abrir WhatsApp
                          </button>
                        )}
                      </div>
                      <pre className="whitespace-pre-wrap text-[11px] text-zinc-300 font-sans leading-relaxed bg-black/20 rounded-md p-2">
                        {item.message}
                      </pre>
                    </div>
                  );
                })}
              </div>

              {/* Helper note about popup blocker */}
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.04] p-3 text-[11px] text-amber-200 flex items-start gap-2">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <div>
                  <strong>Atenção:</strong> Se o navegador bloquear múltiplas abas, clique em "Abrir WhatsApp" em cada lead individualmente. Cada clique registra o envio no log e marca o lead como "Contatado".
                </div>
              </div>
            </div>
          )}

          {/* Empty state when no results yet */}
          {!bulkResults && !bulkError && !bulkGenerating && (
            <div className="py-8 text-center">
              <Sparkles className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
              <p className="text-sm text-zinc-500">
                Clique em "Gerar mensagens" para criar {Math.min(selectedCount, batchSize)} mensagens personalizadas (primeiro lote).
              </p>
              {selectedCount > batchSize && (
                <p className="text-[11px] text-zinc-600 mt-1">
                  Após enviar este lote, você poderá continuar para os próximos {batchSize} leads.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer with close button */}
        <div className="sticky bottom-0 z-10 flex items-center justify-end gap-2 border-t border-white/5 bg-zinc-950/95 backdrop-blur p-4">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// REPLY MODAL — registrar resposta do lead
// =====================================================
function ReplyModal({
  lead,
  onClose,
  onSaved,
}: {
  lead: Lead;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [messageText, setMessageText] = useState("");
  const [classification, setClassification] = useState<string>("interessado");
  const [actionTaken, setActionTaken] = useState("");
  const [nextStep, setNextStep] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Body scroll lock + ESC handler
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onEsc);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onEsc);
    };
  }, [onClose]);

  const classifications = [
    { value: "interessado", label: "🔥 Interessado", desc: "Quer saber mais" },
    { value: "meeting_ready", label: "📅 Quer reunião", desc: "Pronto para agendar" },
    { value: "permission_to_send", label: "✅ Permitiu enviar info", desc: "Autorizou enviar materiais" },
    { value: "pricing_question", label: "💰 Pergunta de preço", desc: "Quer saber valores" },
    { value: "ambiguous", label: "❓ Ambíguo", desc: "Resposta incerta" },
    { value: "opt_out", label: "🚫 Não quer mais receber", desc: "Pediu para não incomodar" },
    { value: "unclassified", label: "📋 Sem classificação", desc: "Ainda não classificado" },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!messageText.trim()) {
      setError("Digite a mensagem recebida");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const prospectId = lead.id || lead.place_id || "";
      const resp = await fetch("/api/admin/respostas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospect_id: prospectId,
          message_text: messageText,
          classification,
          action_taken: actionTaken || undefined,
          next_step: nextStep || undefined,
        }),
      });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json.error || `Erro ${resp.status}`);
      setSuccess(true);
      // Refresh prospects list (updates status, replied flag)
      await onSaved();
      // Auto-close after 2 seconds
      setTimeout(() => onClose(), 2000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[88vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl"
      >
        {/* Header sticky */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-white/5 bg-zinc-950/95 backdrop-blur p-4 sm:p-5">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Mail className="h-5 w-5 text-violet-400" />
              <h3 className="text-base sm:text-lg font-bold text-white truncate">
                Registrar resposta
              </h3>
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              <strong className="text-zinc-300">{lead.name}</strong>
              {lead.niche && <span className="ml-1.5">• {lead.niche}</span>}
              {lead.city && <span className="ml-1.5">• {lead.city}</span>}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="shrink-0 rounded-full bg-white/5 p-2 text-zinc-400 hover:bg-white/10 hover:text-white transition min-h-9 min-w-9 flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 sm:p-5">
          {success ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center space-y-2">
              <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto" />
              <h4 className="text-base font-bold text-emerald-300">Resposta registrada!</h4>
              <p className="text-xs text-zinc-400">
                Lead atualizado e notificação Telegram enviada. Fechando automaticamente...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Lead info */}
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-zinc-500">WhatsApp:</span>{" "}
                    <span className="text-emerald-300 font-mono">{lead.whatsapp || lead.phone || "—"}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Status atual:</span>{" "}
                    <span className="text-blue-300">{lead.status || "new"}</span>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div>
                <Label>Mensagem recebida *</Label>
                <Textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  rows={4}
                  placeholder="Cole aqui a mensagem que o lead enviou no WhatsApp..."
                  className="resize-y"
                />
                <p className="mt-1 text-[10px] text-zinc-500">
                  Dica: copie a mensagem diretamente do WhatsApp (Ctrl+C) e cole aqui
                </p>
              </div>

              {/* Classification */}
              <div>
                <Label>Classificação</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {classifications.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setClassification(c.value)}
                      className={`text-left rounded-lg border p-2.5 transition ${
                        classification === c.value
                          ? "border-violet-500/50 bg-violet-500/10"
                          : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="text-sm font-bold text-white">{c.label}</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">{c.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action taken */}
              <div>
                <Label>Ação tomada (opcional)</Label>
                <Input
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                  placeholder="Ex: Respondi via WhatsApp, enviei proposta..."
                />
              </div>

              {/* Next step */}
              <div>
                <Label>Próximo passo (opcional)</Label>
                <Input
                  value={nextStep}
                  onChange={(e) => setNextStep(e.target.value)}
                  placeholder="Ex: Agendar reunião, enviar orçamento..."
                />
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" disabled={saving || !messageText.trim()} className="flex-1">
                  {saving ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Salvando…</>
                  ) : (
                    <><Mail className="h-4 w-4" /> Registrar + notificar Telegram</>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// =====================================================
// STYLE SELECTOR MODAL — carrossel de estilos de preview
// =====================================================
function StyleSelectorModal({
  lead,
  onClose,
  onSelectStyle,
  getPreviewLinkWithStyle,
}: {
  lead: Lead;
  onClose: () => void;
  onSelectStyle: (styleId: string) => void;
  getPreviewLinkWithStyle: (lead: Lead, styleId: string) => string;
}) {
  const [styles, setStyles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [copiedStyle, setCopiedStyle] = useState<string | null>(null);

  // Body scroll lock + ESC
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onEsc);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onEsc);
    };
  }, [onClose]);

  // Fetch styles with thumbnails
  useEffect(() => {
    const niche = lead.niche || lead.category || "";
    fetch(`/api/preview/styles?niche=${encodeURIComponent(niche)}`)
      .then(r => r.json())
      .then(data => {
        setStyles(data.styles || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [lead.niche, lead.category]);

  function handleCopyLink(styleId: string) {
    const link = getPreviewLinkWithStyle(lead, styleId);
    navigator.clipboard.writeText(link);
    setCopiedStyle(styleId);
    setTimeout(() => setCopiedStyle(null), 2000);
  }

  function prevSlide() {
    setCurrentIdx(i => (i === 0 ? styles.length - 1 : i - 1));
  }

  function nextSlide() {
    setCurrentIdx(i => (i === styles.length - 1 ? 0 : i + 1));
  }

  const current = styles[currentIdx];

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-4xl max-h-[92vh] sm:max-h-[88vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-white/5 bg-zinc-950/95 backdrop-blur p-4 sm:p-5">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Eye className="h-5 w-5 text-amber-400" />
              <h3 className="text-base sm:text-lg font-bold text-white truncate">
                Escolha o estilo do preview
              </h3>
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              <strong className="text-zinc-300">{lead.name}</strong>
              {lead.niche && <span className="ml-1.5">• {lead.niche}</span>}
              {lead.city && <span className="ml-1.5">• {lead.city}</span>}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="shrink-0 rounded-full bg-white/5 p-2 text-zinc-400 hover:bg-white/10 hover:text-white transition min-h-9 min-w-9 flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
            </div>
          ) : styles.length === 0 ? (
            <div className="py-12 text-center text-sm text-zinc-500">
              Nenhum estilo disponível.
            </div>
          ) : (
            <>
              {/* === Carrossel principal === */}
              <div className="relative">
                {/* Slide atual */}
                <div className="overflow-hidden rounded-2xl border border-white/10">
                  {current && (
                    <div className="relative">
                      {/* Thumbnail SVG */}
                      <div className="aspect-[400/280] bg-white/5 flex items-center justify-center overflow-hidden">
                        <img
                          src={current.thumbnail}
                          alt={current.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {/* Overlay com info do estilo */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">{current.emoji}</span>
                          <h4 className="text-lg font-bold text-white">{current.name}</h4>
                        </div>
                        <p className="text-xs text-zinc-300">{current.description}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Setas de navegação */}
                {styles.length > 1 && (
                  <>
                    <button
                      onClick={prevSlide}
                      className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/70 backdrop-blur p-2.5 text-white hover:bg-black/90 transition border border-white/10"
                      aria-label="Anterior"
                    >
                      <ChevronRight className="h-5 w-5 rotate-180" />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/70 backdrop-blur p-2.5 text-white hover:bg-black/90 transition border border-white/10"
                      aria-label="Próximo"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>

              {/* === Indicadores (dots) === */}
              {styles.length > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  {styles.map((s, i) => (
                    <button
                      key={s.id}
                      onClick={() => setCurrentIdx(i)}
                      className={`h-2 rounded-full transition-all ${
                        i === currentIdx ? "w-8 bg-amber-400" : "w-2 bg-white/20 hover:bg-white/40"
                      }`}
                      aria-label={`Estilo ${i + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* === Thumbnails menores (todos os estilos) === */}
              <div className="mt-6">
                <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                  Todos os estilos ({styles.length})
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {styles.map((s, i) => (
                    <button
                      key={s.id}
                      onClick={() => setCurrentIdx(i)}
                      className={`rounded-xl overflow-hidden border-2 transition ${
                        i === currentIdx
                          ? "border-amber-400 ring-2 ring-amber-400/30"
                          : "border-white/5 hover:border-white/20"
                      }`}
                    >
                      <div className="aspect-[400/280] bg-white/5">
                        <img src={s.thumbnail} alt={s.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-2 bg-white/[0.02]">
                        <div className="text-[11px] font-bold text-white truncate">
                          {s.emoji} {s.name}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* === Botões de ação === */}
              {current && (
                <div className="mt-6 flex flex-wrap gap-2">
                  <button
                    onClick={() => onSelectStyle(current.id)}
                    className="flex-1 min-w-[200px] inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3.5 text-sm font-bold text-white shadow-lg hover:scale-[1.01] transition"
                  >
                    <Eye className="h-4 w-4" />
                    Visualizar com {current.name}
                  </button>
                  <button
                    onClick={() => handleCopyLink(current.id)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-500/15 border border-blue-500/30 px-4 py-3.5 text-sm font-bold text-blue-300 hover:bg-blue-500/25 transition"
                    title="Copiar link compartilhável com este estilo"
                  >
                    {copiedStyle === current.id ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
                    {copiedStyle === current.id ? "Copiado!" : "Copiar link"}
                  </button>
                </div>
              )}

              {/* Info helper */}
              <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/[0.04] p-3 text-[11px] text-amber-200/80 flex items-start gap-2">
                <Sparkles className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <div>
                  <strong>Dica:</strong> Cada estilo adapta automaticamente as cores e conteúdo ao nicho do lead.
                  Use as setas ou os thumbnails abaixo para navegar entre os 4 estilos disponíveis.
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
