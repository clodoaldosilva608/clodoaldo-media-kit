/**
 * A/B test variants for abandoned cart recovery messages.
 *
 * Each variant has a different psychological approach:
 *  - A (gentle_help): "Posso te ajudar com alguma dúvida?" — supportive
 *  - B (scarcity): "Sua vaga pode expirar" — urgency
 *  - C (discount): "Tenho um cupom exclusivo pra você" — incentive
 *
 * Randomization: deterministic by session_id hash, so the same cart always
 * gets the same variant (avoids sending two different messages to the same
 * user on retries). The variant is also persisted in `recovery_variant`
 * column for accurate conversion tracking.
 *
 * Conversion is tracked via:
 *  - recovered = true (user completed checkout after recovery)
 *  - recovered_order_id (links to the order that closed)
 *
 * Stats are shown in /admin/recuperacao.
 */

export interface RecoveryVariant {
  id: "A" | "B" | "C";
  name: string;
  description: string;
  template: string;
}

export const RECOVERY_VARIANTS: RecoveryVariant[] = [
  {
    id: "A",
    name: "Ajuda gentil",
    description: "Abordagem solidária — pergunta se tem dúvidas",
    template:
      `Olá {nome}! 👋 Tudo bem? Vi que você quase fechou o serviço "{servico}" no site do Clodoaldo Silva. ` +
      `Ficou alguma dúvida sobre como funciona, prazo ou entrega? Posso te ajudar agora mesmo — é só responder aqui 😊`,
  },
  {
    id: "B",
    name: "Escassez / urgência",
    description: "Cria senso de urgência — vaga pode expirar",
    template:
      `Oi {nome}, aqui é do time do Clodoaldo Silva. ⚠️ Você iniciou o checkout de "{servico}" mas não finalizou — ` +
      `sua vaga fica reservada por apenas mais 24h. Quer garantir agora ou prefere esperar a próxima turma?`,
  },
  {
    id: "C",
    name: "Incentivo (cupom)",
    description: "Oferece cupom exclusivo para converter agora",
    template:
      `Olá {nome}! 🎁 Voltei aqui porque você quase contratou "{servico}" mas não terminou. ` +
      `Tenho um cupom exclusivo de 10% OFF para você finalizar hoje: VOLTA10. Aplica no checkout e o desconto entra automático. Quer?`,
  },
];

/**
 * Deterministic variant assignment — same session_id always gets the same variant.
 * This avoids bias from random Math.random() and ensures retries don't change
 * the variant mid-recovery.
 */
export function assignVariant(sessionId: string): RecoveryVariant {
  // Simple hash → mod 3
  let hash = 0;
  for (let i = 0; i < sessionId.length; i++) {
    hash = (hash * 31 + sessionId.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(hash) % RECOVERY_VARIANTS.length;
  return RECOVERY_VARIANTS[idx];
}

export function getVariantById(id: string): RecoveryVariant | undefined {
  return RECOVERY_VARIANTS.find((v) => v.id === id);
}

/**
 * Renders a variant template with the customer's data.
 */
export function renderTemplate(
  variant: RecoveryVariant,
  data: { name: string; serviceSlug: string; recoveryLink: string },
): string {
  return variant.template
    .replace(/\{nome\}/g, data.name)
    .replace(/\{servico\}/g, data.serviceSlug.replace(/-/g, " "))
    .replace(/\{link\}/g, data.recoveryLink);
}

/**
 * Builds the wa.me link with the rendered message.
 */
export function buildWaLink(phone: string, message: string): string {
  const cleanPhone = phone.replace(/\D/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
