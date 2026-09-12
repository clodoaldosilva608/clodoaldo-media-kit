/**
 * Templates transacionais padrão (auditoria P1-3).
 *
 * 7 fluxos mínimos:
 *   1. welcome             — confirmação de recebimento de lead
 *   2. briefing_received   — confirmação de briefing
 *   3. abandoned_cart      — recuperação de checkout abandonado
 *   4. purchase_confirmed  — confirmação de compra
 *   5. digital_delivery    — entrega de produto digital
 *   6. status_update       — aviso de mudança de status
 *   7. lead_no_response   — recuperação de lead sem resposta (7 dias)
 *
 * Variáveis suportadas (substituídas em {{ }}):
 *   {{nome}} {{email}} {{servico}} {{valor}} {{link}} {{briefing_id}} {{status}}
 *   {{prazo}} {{dias_sem_resposta}} {{checkout_url}} {{cliente}}
 */

export interface EmailTemplate {
  trigger: string;
  name: string;
  subject: string;
  preheader: string;
  body_html: string;
  active: boolean;
}

export const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    trigger: "welcome",
    name: "Boas-vindas (novo lead)",
    subject: "Recebemos seu contato, {{nome}}! 🎉",
    preheader: "Obrigado pelo interesse — em breve entrarei em contato.",
    body_html: `<div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
<p>Olá <strong>{{nome}}</strong>,</p>
<p>Obrigado pelo seu interesse em meus serviços de criação de sites e presença digital. Recebi seus dados e em até <strong>24 horas úteis</strong> entrarei em contato pelo WhatsApp para entender melhor seu projeto.</p>
<p>Enquanto isso, fique à vontade para:</p>
<ul>
  <li>Conhecer meu trabalho em <a href="https://clodoaldo-media-kit.vercel.app">clodoaldo-media-kit.vercel.app</a></li>
  <li>Ver os cases publicados na <a href="https://clodoaldo-media-kit.vercel.app/biblioteca">biblioteca</a></li>
  <li>Responder este email com qualquer dúvida</li>
</ul>
<p>Abraço,<br/><strong>Clodoaldo Silva</strong></p>
</div>`,
    active: true,
  },
  {
    trigger: "briefing_received",
    name: "Confirmação de briefing",
    subject: "Briefing recebido! (#{{briefing_id}})",
    preheader: "Seu briefing foi registrado — vou analisar e responder em breve.",
    body_html: `<div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
<p>Olá <strong>{{nome}}</strong>,</p>
<p>Confirmei o recebimento do seu briefing (<strong>#{{briefing_id}}</strong>). Estou analisando os detalhes e em até <strong>48 horas</strong> envio uma proposta personalizada com escopo, prazo e valor.</p>
<p>Se precisar complementar algo antes disso, basta responder este email.</p>
<p>Abraço,<br/><strong>Clodoaldo Silva</strong></p>
</div>`,
    active: true,
  },
  {
    trigger: "abandoned_cart",
    name: "Carrinho abandonado",
    subject: "{{nome}}, seu carrinho ainda está salvo 🛒",
    preheader: "Finalize em 5 minutos e garanta seu serviço.",
    body_html: `<div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
<p>Olá <strong>{{nome}}</strong>,</p>
<p>Notei que você iniciou o checkout do serviço <strong>{{servico}}</strong> mas não finalizou. Algum problema técnico ou dúvida sobre o pagamento?</p>
<p>Seu carrinho está salvo — você pode retomar exatamente de onde parou:</p>
<p style="text-align:center;margin:24px 0;">
  <a href="{{checkout_url}}" style="background:#10b981;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">Retomar checkout →</a>
</p>
<p>Se preferir, responda este email ou me chame no WhatsApp que eu ajudo a finalizar.</p>
<p>Abraço,<br/><strong>Clodoaldo Silva</strong></p>
</div>`,
    active: true,
  },
  {
    trigger: "purchase_confirmed",
    name: "Confirmação de compra",
    subject: "Pagamento confirmado! 🎉 (#{{order_id}})",
    preheader: "Recebemos seu pagamento para {{servico}}.",
    body_html: `<div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
<p>Olá <strong>{{nome}}</strong>,</p>
<p>Confirmamos o recebimento do seu pagamento de <strong>{{valor}}</strong> para o serviço <strong>{{servico}}</strong>.</p>
<p><strong>Próximos passos:</strong></p>
<ul>
  <li>Você receberá um link de briefing para preencher em até 1h</li>
  <li>Após o briefing, envio uma proposta em 48h</li>
  <li>Prazo de entrega típico: 7-15 dias úteis após aprovação</li>
</ul>
<p>Qualquer dúvida, estou à disposição.</p>
<p>Abraço,<br/><strong>Clodoaldo Silva</strong></p>
</div>`,
    active: true,
  },
  {
    trigger: "digital_delivery",
    name: "Entrega de produto digital",
    subject: "Seu acesso está liberado! 📚",
    preheader: "Download/links para {{servico}}.",
    body_html: `<div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
<p>Olá <strong>{{nome}}</strong>,</p>
<p>Seu produto digital <strong>{{servico}}</strong> está disponível! Use os links abaixo para acessar:</p>
<p style="text-align:center;margin:24px 0;">
  <a href="{{link}}" style="background:#10b981;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">Acessar conteúdo →</a>
</p>
<p>💡 <strong>Importante:</strong> salve este email — o link de acesso é pessoal e intransferível.</p>
<p>Em caso de problemas técnicos, responda este email.</p>
<p>Abraço,<br/><strong>Clodoaldo Silva</strong></p>
</div>`,
    active: true,
  },
  {
    trigger: "status_update",
    name: "Mudança de status",
    subject: "Atualização do seu projeto: {{status}}",
    preheader: "O status do seu serviço foi atualizado.",
    body_html: `<div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
<p>Olá <strong>{{nome}}</strong>,</p>
<p>Uma atualização sobre seu projeto <strong>{{servico}}</strong>:</p>
<p style="background:#f5f5f5;padding:16px;border-radius:8px;text-align:center;font-weight:bold;font-size:18px;color:#10b981;">
  Status atual: {{status}}
</p>
<p>{{mensagem_status}}</p>
<p>Próximo marco previsto: <strong>{{proximo_marco}}</strong>.</p>
<p>Abraço,<br/><strong>Clodoaldo Silva</strong></p>
</div>`,
    active: true,
  },
  {
    trigger: "lead_no_response",
    name: "Lead sem resposta (7 dias)",
    subject: "Ainda posso te ajudar, {{nome}}? 💬",
    preheader: "Faz {{dias_sem_resposta}} dias que não falamos.",
    body_html: `<div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
<p>Olá <strong>{{nome}}</strong>,</p>
<p>Faz <strong>{{dias_sem_resposta}} dias</strong> que não temos contato. Imagino que pode ter ficado sem tempo de responder, ou talvez o momento não seja o ideal.</p>
<p>Se quiser retomar a conversa, é só responder este email ou me chamar no WhatsApp. Se preferir aguardar um momento melhor, sem problema — guardo seu contato para o futuro.</p>
<p>Abraço,<br/><strong>Clodoaldo Silva</strong></p>
</div>`,
    active: true,
  },
];

export function renderTemplate(html: string, vars: Record<string, string | number | undefined>): string {
  return html.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const v = vars[key];
    return v === undefined || v === null ? "" : String(v);
  });
}
