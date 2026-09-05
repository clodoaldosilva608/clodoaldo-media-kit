# Generate the complete parceiros page with all 5 tabs
content = r'''"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Widget, Badge, EmptyState, Button, Input, Label, Select, Textarea } from "@/components/admin/ui";
import {
  Search, MapPin, Phone, Globe, Star, Plus, Save, Trash2, X, Loader2,
  AlertCircle, Download, RefreshCw, Building2, Users, CheckCircle2,
  MessageCircle, ExternalLink, Mail, Copy, Check, Zap, Clock,
  Smartphone, AlertTriangle, Code2, Eye, Layout,
} from "lucide-react";

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
  const [view, setView] = useState<"search"|"kanban"|"envios"|"respostas"|"report">("search");
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
    return `Ola! Tudo bem?\n\nMeu nome e Clodoaldo Silva, sou especialista em marketing digital.\n\nEncontrei o ${lead.name} no Google Maps e fiquei impressionado com a avaliacao de ${lead.rating||"5"} estrelas!\n\nNotei que ${hasSite?"seu site poderia ter performance melhor":"voces ainda nao tem um site profissional"}, e isso pode estar custando clientes.\n\nPosso ajudar com:\n✅ ${hasSite?"Redesign do site":"Criacao de site profissional"} que converte\n✅ SEO — aparecer nas buscas da cidade\n✅ Integracao com WhatsApp\n✅ Google Meu Negocio otimizado\n\nTem interesse em 10 min de conversa?\n\n— Clodoaldo Silva\n📱 (81) 92005-1068\n🌐 clodoaldo.vercel.app`;
  }

  function genEmail(lead:Lead):string {
    return `Assunto: ${lead.name} — como atrair mais clientes\n\nOlá, equipe ${lead.name}!\n\nMeu nome e Clodoaldo Silva. Encontrei voces no Google Maps (${lead.rating||"5"} estrelas — parabens!).\n\nNotei que ${lead.hasWebsite?"seu site poderia ter melhor desempenho":"voces nao tem site profissional"}. 87% dos consumidores pesquisam antes de comprar.\n\nO que posso fazer:\n1. ${lead.hasWebsite?"Redesign":"Criacao de site"} — rapido, responsivo\n2. SEO local\n3. Integracao WhatsApp\n4. Google Meu Negocio\n\n10 min de conversa?\n\nClodoaldo Silva\n📱 (81) 92005-1068\n🌐 clodoaldo.vercel.app`;
  }

  function genPrompt(lead:Lead):string {
    const wa = (lead.whatsapp||lead.phone||"").replace(/\D/g,"");
    const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.name+" "+(lead.formatted_address||lead.city||location))}`;
    return `CRIE UMA LANDING PAGE RESPONSIVA para:\n\nNome: ${lead.name}\nTipo: ${lead.niche||lead.category||"estabelecimento"}\nEndereco: ${lead.formatted_address||"N/A"}\nCidade: ${lead.city||location}\nTelefone: ${lead.phone||"N/A"}\nWhatsApp: ${wa||"N/A"}\nAvaliacao: ${lead.rating?lead.rating+" estrelas":"N/A"}\n\nESTRUTURA:\n1. Hero (nome, subtitulo, avaliacao, botoes WhatsApp + Como Chegar)\n2. Sobre Nos\n3. Servicos (sem precos)\n4. Galeria (6 imagens)\n5. Mapa Google Maps + botao "Como Chegar" → ${maps}\n6. CTA final (WhatsApp + Telefone + Como Chegar)\n7. Footer ("Site criado por Clodoaldo Silva")\n\nREQUISITOS: 100% responsivo, SEO, sem precos, Google Maps embed: https://www.google.com/maps?q=${lead.lat},${lead.lng}&z=16&output=embed`;
  }

  function genPreview(lead:Lead):string {
    const wa = (lead.whatsapp||lead.phone||"").replace(/\D/g,"");
    const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.name+" "+(lead.formatted_address||location))}`;
    const embed = `https://www.google.com/maps?q=${lead.lat},${lead.lng}&z=16&output=embed`;
    const n = lead.niche||lead.category||"estabelecimento";
    return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${lead.name}</title><style>*{margin:0;padding:0;box-sizing:border-box;font-family:Inter,sans-serif}body{color:#333;background:#FFF8E1}.hero{background:linear-gradient(rgba(0,0,0,.5),rgba(0,0,0,.7)),url('https://source.unsplash.com/800x400/?${n}');background-size:cover;color:#fff;text-align:center;padding:100px 20px}.hero h1{font-size:2.5rem;margin-bottom:10px}.btn{display:inline-block;padding:14px 32px;border-radius:50px;text-decoration:none;font-weight:700;margin:5px;transition:transform .2s}.btn:hover{transform:scale(1.05)}.btn-wa{background:#25D366;color:#fff}.btn-maps{background:#FF6F00;color:#fff}.section{padding:60px 20px;max-width:1000px;margin:0 auto}.section h2{text-align:center;font-size:2rem;color:#D32F2F;margin-bottom:30px}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px}.card{background:#fff;border-radius:16px;padding:30px;text-align:center;box-shadow:0 4px 15px rgba(0,0,0,.08)}.gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}.gallery img{width:100%;height:150px;object-fit:cover;border-radius:12px;background:#ddd}.map-section iframe{width:100%;max-width:600px;height:350px;border:0;border-radius:16px;margin:20px 0}.cta-final{background:#D32F2F;color:#fff;text-align:center;padding:80px 20px}.cta-final .btn{background:#fff;color:#D32F2F}.cta-final .btn-wa{background:#25D366;color:#fff}footer{background:#222;color:#999;text-align:center;padding:30px;font-size:.85rem}@media(max-width:600px){.hero h1{font-size:1.8rem}}</style></head><body><div class="hero"><h1>${lead.name}</h1><p>O melhor ${n} de ${lead.city||location}</p>${lead.rating?`<div style="background:rgba(255,255,255,.2);padding:8px 16px;border-radius:20px;display:inline-block;margin:10px">⭐ ${lead.rating} (${lead.user_ratings_total||0})</div>`:""}<div>${wa?`<a href="https://wa.me/${wa}" class="btn btn-wa" target="_blank">💬 WhatsApp</a>`:""}<a href="${maps}" class="btn btn-maps" target="_blank">🗺️ Como Chegar</a></div></div><div class="section"><h2>Sobre Nos</h2><p style="text-align:center;max-width:600px;margin:0 auto;line-height:1.8;color:#555">Bem-vindo ao <strong>${lead.name}</strong>! ${lead.formatted_address||lead.city||location}. ${lead.rating?`Com ${lead.rating} estrelas no Google, `:""}oferecemos qualidade e atendimento excepcional.</p><div class="cards" style="margin-top:40px"><div class="card"><div style="font-size:2.5rem">✅</div><h3 style="color:#D32F2F;margin:10px 0">Qualidade</h3><p style="color:#666">O melhor para nossos clientes</p></div><div class="card"><div style="font-size:2.5rem">❤️</div><h3 style="color:#D32F2F;margin:10px 0">Atendimento</h3><p style="color:#666">Equipe treinada</p></div><div class="card"><div style="font-size:2.5rem">📍</div><h3 style="color:#D32F2F;margin:10px 0">Localizacao</h3><p style="color:#666">Facil acesso</p></div></div></div><div class="section"><h2>Galeria</h2><div class="gallery">${Array.from({length:6}).map((_,i)=>`<img src="https://source.unsplash.com/300x200/?${n},food&sig=${i}" alt="Foto ${i+1}" loading="lazy">`).join("")}</div></div><div class="section map-section" style="text-align:center"><h2>Como Chegar</h2><p style="color:#666;margin-bottom:10px">${lead.formatted_address||lead.city||location}</p><iframe src="${embed}" loading="lazy"></iframe><div style="margin-top:20px"><a href="${maps}" class="btn btn-maps" target="_blank">🗺️ Abrir no Google Maps</a>${wa?`<a href="tel:${wa}" class="btn" style="background:#D32F2F;color:#fff">📞 Ligar</a>`:""}</div></div><div class="cta-final"><h2 style="margin-bottom:30px">Entre em contato!</h2><div>${wa?`<a href="https://wa.me/${wa}" class="btn btn-wa" target="_blank">💬 WhatsApp</a>`:""}${wa?`<a href="tel:${wa}" class="btn" target="_blank">📞 Telefone</a>`:""}<a href="${maps}" class="btn" target="_blank">🗺️ Como Chegar</a></div></div><footer><p><strong>${lead.name}</strong></p><p>${lead.formatted_address||""}</p>${lead.phone?`<p>${lead.phone}</p>`:""}<p style="margin-top:15px">© ${new Date().getFullYear()} ${lead.name}</p><p style="margin-top:5px;font-size:.75rem">Site criado por <a href="https://clodoaldo.vercel.app" target="_blank" style="color:#FF6F00">Clodoaldo Silva</a></p></footer></body></html>`;
  }

  function openPreview(lead:Lead) {
    const blob = new Blob([genPreview(lead)], {type:"text/html"});
    window.open(URL.createObjectURL(blob), "_blank");
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
        {[["search","Buscar",Search],["kanban","Pipeline ("+total+")",Layout]].map(([k,l,I]:any) => (
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
                        <button onClick={()=>setExpandedLead(exp?null:lead.place_id||null)} className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-white/10"><Copy className="h-3.5 w-3.5" /> Copy + CTA</button>
                      </div>
                      {exp&&(
                        <div className="mt-4 space-y-3 border-t border-white/5 pt-4">
                          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.03] p-3"><div className="mb-2 flex items-center justify-between"><span className="flex items-center gap-1.5 text-xs font-bold text-emerald-300"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp</span><button onClick={()=>copyToClipboard(wa,`wa-${lead.place_id}`)} className="rounded-md bg-emerald-500/20 px-2 py-1 text-[10px] font-semibold text-emerald-300 hover:bg-emerald-500/30">{copiedText===`wa-${lead.place_id}`?"✓":"Copiar"}</button></div><pre className="whitespace-pre-wrap text-[11px] text-zinc-300 font-sans max-h-32 overflow-y-auto">{wa}</pre></div>
                          <div className="rounded-lg border border-blue-500/20 bg-blue-500/[0.03] p-3"><div className="mb-2 flex items-center justify-between"><span className="flex items-center gap-1.5 text-xs font-bold text-blue-300"><Mail className="h-3.5 w-3.5" /> Email</span><button onClick={()=>copyToClipboard(em,`em-${lead.place_id}`)} className="rounded-md bg-blue-500/20 px-2 py-1 text-[10px] font-semibold text-blue-300 hover:bg-blue-500/30">{copiedText===`em-${lead.place_id}`?"✓":"Copiar"}</button></div><pre className="whitespace-pre-wrap text-[11px] text-zinc-300 font-sans max-h-32 overflow-y-auto">{em}</pre></div>
                          <button onClick={()=>openPreview(lead)} className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-sm font-bold text-white shadow-lg hover:scale-[1.02] transition"><Eye className="h-4 w-4" /> Ver Preview do Site</button>
                          <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.03] p-3"><div className="mb-2 flex items-center justify-between"><span className="flex items-center gap-1.5 text-xs font-bold text-amber-300"><Code2 className="h-3.5 w-3.5" /> Prompt do Site</span><button onClick={()=>copyToClipboard(pr,`pr-${lead.place_id}`)} className="rounded-md bg-amber-500/20 px-2 py-1 text-[10px] font-semibold text-amber-300 hover:bg-amber-500/30">{copiedText===`pr-${lead.place_id}`?"✓":"Copiar"}</button></div><pre className="whitespace-pre-wrap text-[10px] text-zinc-400 font-mono max-h-48 overflow-y-auto">{pr}</pre></div>
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
                            <button onClick={()=>openPreview(p)} className="rounded bg-amber-500/15 px-2 py-1 text-[10px] font-semibold text-amber-300 hover:bg-amber-500/25"><Eye className="h-3 w-3" /></button>
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
'''

with open("/home/z/my-project/src/app/admin/parceiros/page.tsx", "w") as f:
    f.write(content)

print(f"✅ Page written: {len(content)} chars")
