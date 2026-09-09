"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Widget, Badge, EmptyState, Button, Input, Label, Select, Textarea } from "@/components/admin/ui";
import {
  Search, MapPin, Phone, Globe, Star, Plus, Save, Trash2, X, Loader2,
  AlertCircle, Download, RefreshCw, Building2, Users, CheckCircle2,
  MessageCircle, ExternalLink, Mail, Copy, Check, Zap, Clock,
  Smartphone, AlertTriangle, Code2, Eye, Layout, Shield, Share2, Link2,
} from "lucide-react";
import {
  getRelevantObjections,
  getUrgencyHooks,
  formatObjectionForDisplay,
} from "@/lib/objections";
import { generatePreviewHTML } from "@/lib/preview-generator";

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
✅ **Garantia:** se em 90 dias você não ver resultado, devolvo seu investimento.
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
✅ Garantia — se em 90 dias não houver resultado, devolvo o investimento.
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
    const blob = new Blob([genPreview(lead)], {type:"text/html"});
    window.open(URL.createObjectURL(blob), "_blank");
  }

  function getPreviewLink(lead:Lead):string {
    const id = lead.id || lead.place_id || "";
    return `https://clodoaldo.vercel.app/api/preview?lead=${id}`;
  }

  function copyPreviewLink(lead:Lead) {
    const link = getPreviewLink(lead);
    navigator.clipboard.writeText(link);
    setCopiedText(`link-${lead.id || lead.place_id}`);
    setTimeout(() => setCopiedText(null), 3000);
  }

  function openPreviewLink(lead:Lead) {
    window.open(getPreviewLink(lead), "_blank");
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
                {results.map(lead => {
                  const exp = expandedLead===lead.place_id;
                  const wa = genWA(lead); const em = genEmail(lead); const pr = genPrompt(lead);
                  const num = (lead.whatsapp||lead.phone||"").replace(/\D/g,"");
                  return (
                    <div key={lead.place_id} className={`rounded-xl border p-4 ${lead.webDevOpportunity?"border-amber-500/30 bg-amber-500/[0.03]":"border-white/5 bg-white/[0.02]"}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1 cursor-pointer" onClick={()=>setExpandedLead(exp?null:lead.place_id||null)}>
                          <div className="flex items-center gap-2 flex-wrap"><h4 className="text-sm font-bold text-white">{lead.name}</h4>{lead.rating&&<span className="flex items-center gap-0.5 text-xs"><Star className="h-3 w-3 fill-amber-400 text-amber-400" /><span className="font-semibold text-amber-300">{lead.rating}</span></span>}</div>
                          <p className="mt-0.5 text-[11px] text-zinc-500 capitalize">{lead.category}</p>
                          <div className="mt-1 flex items-start gap-1 text-xs text-zinc-400"><MapPin className="h-3 w-3 shrink-0 mt-0.5" /><span className="truncate">{lead.formatted_address}</span></div>
                        </div>
                        {savedIds.has(lead.place_id!)&&<Badge variant="success"><CheckCircle2 className="h-3 w-3" /> Salvo</Badge>}
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
                      </div>
                      {exp&&(
                        <div className="mt-4 space-y-3 border-t border-white/5 pt-4">
                          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.03] p-3"><div className="mb-2 flex items-center justify-between"><span className="flex items-center gap-1.5 text-xs font-bold text-emerald-300"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp</span><button onClick={()=>copyToClipboard(wa,`wa-${lead.place_id}`)} className="rounded-md bg-emerald-500/20 px-2 py-1 text-[10px] font-semibold text-emerald-300 hover:bg-emerald-500/30">{copiedText===`wa-${lead.place_id}`?"✓":"Copiar"}</button></div><pre className="whitespace-pre-wrap text-[11px] text-zinc-300 font-sans max-h-32 overflow-y-auto">{wa}</pre></div>
                          <div className="rounded-lg border border-blue-500/20 bg-blue-500/[0.03] p-3"><div className="mb-2 flex items-center justify-between"><span className="flex items-center gap-1.5 text-xs font-bold text-blue-300"><Mail className="h-3.5 w-3.5" /> Email</span><button onClick={()=>copyToClipboard(em,`em-${lead.place_id}`)} className="rounded-md bg-blue-500/20 px-2 py-1 text-[10px] font-semibold text-blue-300 hover:bg-blue-500/30">{copiedText===`em-${lead.place_id}`?"✓":"Copiar"}</button></div><pre className="whitespace-pre-wrap text-[11px] text-zinc-300 font-sans max-h-32 overflow-y-auto">{em}</pre></div>
                          <button onClick={()=>openPreview(lead)} className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-sm font-bold text-white shadow-lg hover:scale-[1.02] transition"><Eye className="h-4 w-4" /> Ver Preview do Site</button>
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
                      const num=(p.whatsapp||p.phone||"").replace(/\D/g,"");
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
              <div className="mb-3 rounded-lg border border-blue-500/20 bg-blue-500/[0.04] px-3 py-2 text-xs text-blue-200">
                💡 Dica: clique em qualquer lead (card) para ver todos os detalhes — mensagens prontas (WhatsApp/Email), prompt do site, preview e quebra de objeções.
              </div>
              <div className="space-y-2">
                {prospects.map((p) => {
                  const num = (p.whatsapp||p.phone||"").replace(/\D/g,"");
                  const wa = genWA(p);
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
        />
      )}

      {view==="envios" && <EnviosView />}
      {view==="respostas" && <RespostasView />}
      {view==="report" && <ReportView />}
    </AdminShell>
  );
}

function EnviosView() {
  const [data,setData]=useState<any[]>([]); const [loading,setLoading]=useState(true);
  useEffect(()=>{fetch("/api/admin/envios?limit=200").then(r=>r.json()).then(d=>{setData(d.data||[]);setLoading(false);}).catch(()=>setLoading(false));},[]);
  if(loading) return <div className="py-12 text-center text-sm text-zinc-500"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>;
  return (
    <Widget title="Log de Envios" icon={<MessageCircle className="h-4 w-4 text-emerald-400" />}>
      {data.length===0?<EmptyState title="Nenhum envio" icon={<MessageCircle className="h-8 w-8" />} />:
      <div className="-mx-2 overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="border-b border-white/5 text-[11px] uppercase tracking-wider text-zinc-500"><tr><th className="px-3 py-2">Data</th><th className="px-3 py-2">Lead</th><th className="px-3 py-2">Variante</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Erro</th></tr></thead><tbody className="divide-y divide-white/5">{data.map((e:any)=><tr key={e.id} className="hover:bg-white/[0.02]"><td className="px-3 py-2.5 text-xs text-zinc-400">{new Date(e.sent_at).toLocaleString("pt-BR")}</td><td className="px-3 py-2.5 text-zinc-200">{e.prospect_name||"—"}</td><td className="px-3 py-2.5"><Badge variant="muted">{e.message_variant||"—"}</Badge></td><td className="px-3 py-2.5"><Badge variant={e.status==="sent"?"success":e.status==="failed"?"danger":"warning"}>{e.status}</Badge></td><td className="px-3 py-2.5 text-xs text-rose-300 max-w-[200px] truncate">{e.error||"—"}</td></tr>)}</tbody></table></div>}
    </Widget>
  );
}

function RespostasView() {
  const [data,setData]=useState<any[]>([]); const [loading,setLoading]=useState(true); const [showAdd,setShowAdd]=useState(false); const [reply,setReply]=useState({prospect_id:"",message_text:""});
  const load=useCallback(()=>{setLoading(true);fetch("/api/admin/respostas?limit=200").then(r=>r.json()).then(d=>{setData(d.data||[]);setLoading(false);}).catch(()=>setLoading(false));},[]);
  useEffect(()=>{load();},[load]);
  const cc:Record<string,any> = {permission_to_send:"info",interessado:"success",meeting_ready:"success",opt_out:"danger",pricing_question:"warning",ambiguous:"muted",unclassified:"muted"};
  async function submit(){if(!reply.prospect_id||!reply.message_text)return;await fetch("/api/admin/respostas",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(reply)});setReply({prospect_id:"",message_text:""});setShowAdd(false);load();}
  return (
    <Widget title="Respostas Recebidas" icon={<Mail className="h-4 w-4 text-emerald-400" />} action={<Button size="sm" variant="primary" onClick={()=>setShowAdd(!showAdd)}><Plus className="h-3.5 w-3.5" /> Registrar</Button>}>
      {showAdd&&<div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] p-4 space-y-2"><Input placeholder="ID do prospect" value={reply.prospect_id} onChange={e=>setReply({...reply,prospect_id:e.target.value})} /><Textarea placeholder="Mensagem recebida…" value={reply.message_text} onChange={e=>setReply({...reply,message_text:e.target.value})} rows={3} /><Button size="sm" variant="primary" onClick={submit}>Classificar e Salvar</Button></div>}
      {loading?<div className="py-12 text-center text-sm text-zinc-500"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>:
      data.length===0?<EmptyState title="Nenhuma resposta" icon={<Mail className="h-8 w-8" />} />:
      <div className="space-y-2">{data.map((r:any)=><div key={r.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-3"><div className="flex items-start justify-between gap-2 mb-2"><div><span className="text-sm font-bold text-white">{r.prospect_name||"—"}</span><span className="ml-2 text-[11px] text-zinc-500">{new Date(r.received_at).toLocaleString("pt-BR")}</span></div><Badge variant={cc[r.classification]||"muted"}>{r.classification}</Badge></div><p className="text-xs text-zinc-300 mb-2 italic">"{r.message_text}"</p><div className="flex gap-4 text-[11px] text-zinc-500"><span>📋 {r.action_taken||"—"}</span><span>→ {r.next_step||"—"}</span></div></div>)}</div>}
    </Widget>
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
// + mensagens WhatsApp/Email + Prompt + Preview + Objeções
// =====================================================
function LeadDetailModal({
  lead, onClose, genWA, genEmail, genPrompt,
  openPreview, copyPreviewLink, openPreviewLink,
  copyToClipboard, copiedText,
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
}) {
  const wa = genWA(lead);
  const em = genEmail(lead);
  const pr = genPrompt(lead);
  const num = (lead.whatsapp || lead.phone || "").replace(/\D/g, "");
  const leadId = lead.id || lead.place_id || "";

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
        </div>
      </div>
    </div>
  );
}
