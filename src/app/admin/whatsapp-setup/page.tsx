"use client";

import { useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Widget, Badge, Button } from "@/components/admin/ui";
import {
  Download, MessageSquare, Clock, Phone, FileText, Copy, Check,
  Package, Bot, Zap, AlertTriangle, CheckCircle2,
} from "lucide-react";

const WHATSAPP_PHONE = "(81) 92005-1068";

// Templates prontos para colar nas mensagens automáticas do WhatsApp Business
const TEMPLATES = [
  {
    id: "greeting",
    title: "Mensagem de saudação",
    description: "Enviada automaticamente quando alguém te manda mensagem pela 1ª vez",
    icon: MessageSquare,
    type: "greeting",
    body: `Olá! 👋 Sou o Clodoaldo Silva, criador de sites e especialista em marketing digital local.

Recebi sua mensagem! Em até 30 minutos eu te respondo pessoalmente (horário comercial: 8h-18h).

Se for urgente, me chama no direct do Instagram: @clodoaldosilva

Enquanto isso, dá uma olhada no meu portfólio:
🌐 https://clodoaldo.vercel.app

Para agilizar, me conta:
1. Qual é o seu negócio?
2. Você já tem site? Como está funcionando?
3. Qual seu maior desafio hoje com clientes novos?`,
  },
  {
    id: "away",
    title: "Mensagem de ausência",
    description: "Enviada fora do horário comercial (18h-8h e fins de semana)",
    icon: Clock,
    type: "away",
    body: `Olá! Recebi sua mensagem, mas estou fora do horário comercial agora. 🌙

Horário de atendimento:
- Segunda a sexta: 8h às 18h
- Sábados: 9h às 13h
- Domingos: fechado

Vou responder assim que voltar ao trabalho. Se for urgente, me chama no Instagram: @clodoaldosilva

Para adiantar, me conta brevemente:
1. Qual seu negócio?
2. Já tem site?
3. O que precisa de ajuda?

Abraço!
Clodoaldo Silva`,
  },
  {
    id: "quick_reply_portfolio",
    title: "Resposta rápida: Portfólio",
    description: "Botão de resposta rápida pra mandar o portfólio em 1 toque",
    icon: Zap,
    type: "quick_reply",
    body: `🎨 Aqui está meu portfólio público:

🌐 https://clodoaldo.vercel.app

Lá você encontra:
- Cases de clientes da região
- Serviços que ofereço (site, SEO, cardápio digital, etc.)
- Apps que desenvolvi
- Biblioteca com e-books grátis

Quer que eu mande o preview de um site que eu criaria pra VOCÊ? É grátis, sem compromisso. Bora? 🚀`,
  },
  {
    id: "quick_reply_pricing",
    title: "Resposta rápida: Valores",
    description: "Botão pra mandar os valores/pricing rapidamente",
    icon: Zap,
    type: "quick_reply",
    body: `💰 Aqui estão meus valores (todos negociáveis via pacote):

📦 PRODUTOS:
• Site Profissional — R$ 1.700,00 (em até 12x)
• SEO Local — R$ 490,00 (único)
• Google Meu Negócio Otimizado — R$ 290,00 (único)
• Cardápio Digital QR Code — R$ 990,00 (único)
• Edição de Cardápio Profissional — R$ 790,00 (único)

🔄 ASSINATURAS MENSais:
• Pacote de Artes Redes Sociais — R$ 39,00/mês
• Pacote Recorrência Mensal (TUDO) — R$ 497,00/mês

💡 A melhor opção pra começar: Site Profissional + 1º mês de Pacote Recorrência = R$ 2.197.

✅ Sem fidelidade
✅ Sem trabalho pra você (eu cuido de tudo)
✅ Pode parcelar em 12x

Quer que eu monte um plano personalizado pro seu negócio? Me conta:
1. Qual seu negócio?
2. Já tem site?`,
  },
  {
    id: "quick_reply_demo",
    title: "Resposta rápida: Demo grátis",
    description: "Botão pra oferecer o site demo gratuito",
    icon: Zap,
    type: "quick_reply",
    body: `🎨 Perfeito! Eu crio um site demo profissional PRA VOCÊ, sem compromisso.

Só preciso de 3 informações:
1. Nome do seu negócio
2. Cidade
3. Nicho (restaurante, barbearia, loja, etc.)

Em até 24h eu te mando o link do preview. Você olha, me diz o que achou, e se fizer sentido a gente avança. Se não fizer, sem problema — o demo é seu de qualquer forma. 🙌

Bora?`,
  },
  {
    id: "quick_reply_books",
    title: "Resposta rápida: Horário/marketing",
    description: "Botão pra mandar disponibilidade de agenda",
    icon: Zap,
    type: "quick_reply",
    body: `📅 Meus horários disponíveis pra conversa:

SEGUNDA: 14h às 18h
TERÇA: 9h às 12h, 14h às 18h
QUARTA: 14h às 18h
QUINTA: 9h às 12h, 14h às 18h
SEXTA: 9h às 12h

Atendimento via WhatsApp (não faço reunião por chamada a menos que você peça).

Me diz:
1. Qual dia/horário fica melhor pra você
2. Qual o assunto (venda de site, suporte, proposta, etc.)

Confirmo aqui mesmo. 🔥`,
  },
];

export default function WhatsAppSetupPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function copy(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function downloadCsv() {
    window.open("/api/admin/products/export-whatsapp", "_blank");
  }

  return (
    <AdminShell title="WhatsApp Business — Setup">
      <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.06] p-4">
        <div className="flex items-start gap-3">
          <Phone className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-emerald-200">
              Configurando o WhatsApp Business ({WHATSAPP_PHONE})
            </h4>
            <p className="text-xs text-zinc-400 mt-1">
              Esta página te dá tudo pronto pra configurar catálogo + mensagens automáticas no app.
              Você só precisa copiar/colar e importar o CSV.
            </p>
          </div>
        </div>
      </div>

      {/* === PASSO 1: Catálogo === */}
      <Widget
        title="📦 Passo 1 — Catálogo de produtos"
        icon={<Package className="h-4 w-4 text-violet-400" />}
        className="mb-4"
        action={<Button variant="primary" size="sm" onClick={downloadCsv}><Download className="h-3.5 w-3.5" /> Baixar CSV</Button>}
      >
        <ol className="space-y-2 text-xs text-zinc-300 list-decimal list-inside mb-3">
          <li>Clique em <strong>"Baixar CSV"</strong> acima — arquivo <code>catalogo-whatsapp-YYYY-MM-DD.csv</code></li>
          <li>Abra o <strong>WhatsApp Business</strong> no celular (use o número {WHATSAPP_PHONE})</li>
          <li>Toque em <strong>Configurações</strong> (engrenagem, canto superior direito)</li>
          <li>Toque em <strong>Ferramentas comerciais → Catálogo</strong></li>
          <li>Toque em <strong>"Adicionar novo item"</strong> ou <strong>"Importar"</strong> (se disponível)</li>
          <li>Para cada produto do CSV, adicione manualmente: Nome, Descrição, Preço, SKU</li>
          <li>Adicione foto (use logo do clodoaldo-media-kit.vercel.app/assets/clodoaldo-logo.png)</li>
          <li>Publique o catálogo — fica visível no seu perfil comercial</li>
        </ol>
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.06] p-3 text-[11px] text-amber-200/80">
          ⚠️ <strong>Importante:</strong> O WhatsApp Business não aceita import direto de CSV pelo app (apenas pela API oficial da Meta Cloud API, que é paga). O CSV acima é pra você usar como guia de digitação. Para importar em lote, é necessário cadastrar na <strong>Meta Business Suite → Commerce Account</strong>.
        </div>
      </Widget>

      {/* === PASSO 2: Mensagens automáticas === */}
      <Widget
        title="🤖 Passo 2 — Mensagens automáticas"
        icon={<Bot className="h-4 w-4 text-blue-400" />}
        className="mb-4"
      >
        <p className="text-xs text-zinc-300 mb-3">
          Configure no app: <strong>Configurações → Ferramentas comerciais → Mensagens automáticas</strong>. Copie cada template abaixo e cole no local indicado.
        </p>

        <div className="space-y-3">
          {TEMPLATES.filter(t => t.type === "greeting" || t.type === "away").map((t) => (
            <div key={t.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <t.icon className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-bold text-white">{t.title}</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => copy(t.body, t.id)}>
                  {copiedId === t.id ? <><Check className="h-3.5 w-3.5" /> Copiado!</> : <><Copy className="h-3.5 w-3.5" /> Copiar</>}
                </Button>
              </div>
              <p className="text-[11px] text-zinc-500 mb-2">{t.description}</p>
              <pre className="whitespace-pre-wrap break-words rounded-lg bg-black/30 border border-white/5 p-3 text-xs text-zinc-200 font-sans leading-relaxed">{t.body}</pre>
              <div className="mt-2 text-[10px] text-zinc-500">
                💡 Caminho no app: <strong>Configurações → Ferramentas comerciais → {t.type === "greeting" ? "Mensagem de saudação" : "Mensagem de ausência"} → Ativar → Cole o texto</strong>
              </div>
            </div>
          ))}
        </div>
      </Widget>

      {/* === PASSO 3: Respostas rápidas === */}
      <Widget
        title="⚡ Passo 3 — Respostas rápidas (atalhos)"
        icon={<Zap className="h-4 w-4 text-amber-400" />}
        className="mb-4"
      >
        <p className="text-xs text-zinc-300 mb-3">
          Crie atalhos para mensagens que você manda toda hora. No app: <strong>Configurações → Ferramentas comerciais → Respostas rápidas → Adicionar</strong>.
          Digite o atalho (ex: <code>/portfolio</code>) e cole o texto.
        </p>

        <div className="space-y-3">
          {TEMPLATES.filter(t => t.type === "quick_reply").map((t) => {
            const shortcut = `/${t.id.replace("quick_reply_", "")}`;
            return (
              <div key={t.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <t.icon className="h-4 w-4 text-amber-400" />
                    <span className="text-sm font-bold text-white">{t.title}</span>
                    <code className="rounded bg-amber-500/15 px-2 py-0.5 text-[10px] font-mono text-amber-300">{shortcut}</code>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => copy(t.body, t.id)}>
                    {copiedId === t.id ? <><Check className="h-3.5 w-3.5" /> Copiado!</> : <><Copy className="h-3.5 w-3.5" /> Copiar</>}
                  </Button>
                </div>
                <p className="text-[11px] text-zinc-500 mb-2">{t.description}</p>
                <pre className="whitespace-pre-wrap break-words rounded-lg bg-black/30 border border-white/5 p-3 text-xs text-zinc-200 font-sans leading-relaxed max-h-[300px] overflow-y-auto">{t.body}</pre>
                <div className="mt-2 text-[10px] text-zinc-500">
                  💡 Para usar: digite <code>{shortcut}</code> no chat e toque na sugestão
                </div>
              </div>
            );
          })}
        </div>
      </Widget>

      {/* === PASSO 4: Integração com site === */}
      <Widget
        title="🔗 Passo 4 — Integrar com seu site (bônus)"
        icon={<FileText className="h-4 w-4 text-emerald-400" />}
        className="mb-4"
      >
        <p className="text-xs text-zinc-300 mb-3">
          Configurações extras pra integrar WhatsApp Business com seu site:
        </p>
        <div className="space-y-2 text-xs text-zinc-300">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400 shrink-0" />
            <div>
              <strong>1. Link wa.me no site:</strong> Já configurado em todos os botões "WhatsApp" do site (Header, Hero, Footer, Service Pages, Quiz CTA).
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400 shrink-0" />
            <div>
              <strong>2. Catálogo visível no perfil:</strong> Quando o lead abrir seu perfil do WhatsApp Business, vai ver o catálogo de produtos completo.
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400 shrink-0" />
            <div>
              <strong>3. Mensagem pré-preenchida:</strong> Todo lead que clicar em "WhatsApp" no site vai abrir o app com mensagem já pronta. Você só responde.
            </div>
          </div>
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-400 shrink-0" />
            <div>
              <strong>4. Respostas automáticas inteligentes:</strong> O WhatsApp Business tem mensagens automáticas SIMPLES (saudação + ausência). Para respostas inteligentes (ex: "qual seu nicho?"), use o chatbot <strong>ManyChat</strong> conectado ao seu WhatsApp Business (grátis até 1000 contatos).
            </div>
          </div>
        </div>
      </Widget>

      {/* === PASSO 5: Verificação === */}
      <Widget
        title="✅ Passo 5 — Checklist de verificação"
        icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />}
        className="mb-4"
      >
        <div className="space-y-2 text-xs">
          {[
            "Catálogo com 9 produtos publicados",
            "Mensagem de saudação ativada",
            "Mensagem de ausência ativada",
            "4 respostas rápidas configuradas (/portfolio, /pricing, /demo, /books)",
            "Foto de perfil comercial (logo Clodoaldo)",
            "Horário comercial configurado",
            "Endereço comercial configurado (opcional)",
            "Etiquetas organizadas (lead, cliente, prospecção)",
          ].map((item, i) => (
            <label key={i} className="flex items-center gap-2 text-zinc-300 cursor-pointer">
              <input type="checkbox" className="rounded" />
              {item}
            </label>
          ))}
        </div>
      </Widget>

      <div className="text-[11px] text-zinc-500 text-center">
        💡 Dica: depois de configurar, faça um teste mandando mensagem do seu número pessoal pro {WHATSAPP_PHONE} e veja se as mensagens automáticas chegam.
      </div>
    </AdminShell>
  );
}
