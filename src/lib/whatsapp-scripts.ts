/**
 * Roteiros de prospecção WhatsApp — Método Gabriel Miranda + Neurociência Comportamental.
 *
 * 3 variantes por tipo (tem site / sem site), cada uma enfatizando uma técnica
 * diferente de persuasão comportamental:
 *
 * Técnicas usadas:
 *   - Loss aversion: dor de perder é 2x mais forte que prazer de ganhar
 *   - Curiosity gap: criar pergunta que o cérebro PRECISA responder
 *   - Reciprocity: dar valor primeiro gera obrigação de retribuir
 *   - Social proof: mostrar que outros como ele já fizeram
 *   - Authority: credenciais + portfólio público
 *   - Scarcity: oportunidade limitada no tempo
 *   - Pattern interrupt: quebrar o padrão esperado de "vendedor chato"
 *   - Commitment & consistency: CTA de baixo compromisso ("só ver")
 *   - Anchoring: referência de valor
 *   - Personalization: nome + nicho + cidade específicos
 */

export interface ScriptVars {
  nome: string;        // Nome do lead / empresa
  nicho: string;       // ex: "barbearia", "restaurante"
  cidade: string;      // ex: "Recife, PE"
  demoUrl: string;     // URL do site demo gerado
  whatsapp?: string;   // Número para resposta
}

export interface Script {
  id: string;
  variant: "A" | "B" | "C" | "L";
  technique: string;
  description: string;
  body: string;
}

const formatNicho = (nicho: string): string => {
  // "barbearia" → "barbearia", "clinica estetica" → "clínica estética"
  const map: Record<string, string> = {
    "marca": "marca",
    "creator": "criador de conteúdo",
    "empresa": "empresa",
    "suporte": "negócio",
  };
  return map[nicho.toLowerCase()] || nicho;
};

// =====================================================
// ROTEIROS "TEM SITE" — 3 variantes
// =====================================================
export function getTemSiteScripts(vars: ScriptVars): Script[] {
  const { nome, nicho, cidade, demoUrl } = vars;
  const nichoFmt = formatNicho(nicho);

  return [
    {
      id: "tem-site-A",
      variant: "A",
      technique: "Loss Aversion + Curiosity Gap",
      description: "Foca na dor de perder clientes + pergunta que o cérebro precisa responder",
      body: `Oi ${nome}! Tudo bem?

Pesquisei "${nichoFmt} em ${cidade}" no Google e encontrei 2 problemas no seu site que estão fazendo você perder clientes TODA SEMANA. Sério — não é exagero.

Já criei uma versão nova corrigindo tudo. Quer ver em 30 segundos, sem compromisso?

${demoUrl}`,
    },
    {
      id: "tem-site-B",
      variant: "B",
      technique: "Reciprocity + Authority",
      description: "Dá valor primeiro (site grátis pra ver) + credenciais + portfólio público",
      body: `Oi ${nome}!

Sou o Clodoaldo, criador de sites aqui de ${cidade}. Pesquisei ${nichoFmt} na região e notei que seu site tem alguns problemas técnicos que afastam cliente novo.

Como já trabalhei com ${nichoFmt} antes, aproveitei e criei uma versão nova pra você — grátis, pra você ver meu trabalho. Sem compromisso de contratar.

Quer dar uma olhada? Leva 30 segundos:

${demoUrl}

(clodoaldo.vercel.app — meu portfólio público)`,
    },
    {
      id: "tem-site-C",
      variant: "C",
      technique: "Pattern Interrupt + Scarcity",
      description: "Quebra padrão com pergunta direta + oportunidade limitada",
      body: `Oi ${nome} — pergunta direta:

Quantos clientes você acha que perdeu esse mês por causa do seu site?

Pesquisei ${nichoFmt} em ${cidade} e o seu tem 2 problemas técnicos que afastam cliente. Já criei uma versão nova corrigindo.

Tenho capacidade pra 2 projetos esse mês. Quer ser um deles? Sem compromisso de fechar — só ver:

${demoUrl}`,
    },
  ];
}

// =====================================================
// ROTEIROS "SEM SITE" — 3 variantes
// =====================================================
export function getSemSiteScripts(vars: ScriptVars): Script[] {
  const { nome, nicho, cidade, demoUrl } = vars;
  const nichoFmt = formatNicho(nicho);

  return [
    {
      id: "sem-site-A",
      variant: "A",
      technique: "Loss Aversion + Concreteness",
      description: "Número concreto de clientes perdidos/mês + site já pronto",
      body: `Oi ${nome}! Tudo bem?

Te procurei no Google como "${nichoFmt} em ${cidade}" e não encontrei nenhum site. Isso = 150-400 pessoas/mês buscando ${nichoFmt} na sua região e indo direto pro concorrente.

Já criei um site profissional pra você. Quer ver em 30 segundos, sem compromisso?

${demoUrl}`,
    },
    {
      id: "sem-site-B",
      variant: "B",
      technique: "Reciprocity + Social Proof",
      description: "Site grátis pra ver (reciprocidade) + referência a outros negócios da região",
      body: `Oi ${nome}!

Sou o Clodoaldo, criador de sites aqui de ${cidade}. Notei que vocês não têm site — então os clientes que pesquisam ${nichoFmt} online acabam indo pro concorrente.

Já criei um site profissional pra você. Sem custo pra ver, sem compromisso de fechar. É o jeito que eu trabalho — mostro o resultado primeiro.

Quer dar uma olhada? 30 segundos:

${demoUrl}

(clodoaldo-media-kit.vercel.app — veja cases de outros ${nichoFmt}s da região)`,
    },
    {
      id: "sem-site-C",
      variant: "C",
      technique: "Pattern Interrupt + Scarcity",
      description: "Pergunta direta quebra padrão + escassez de vagas",
      body: `Oi ${nome} — pergunta direta:

Por que vocês ainda não têm site?

150-400 pessoas/mês buscam ${nichoFmt} em ${cidade} no Google. Sem site, todas vão pro concorrente.

Já criei um site profissional pra você. Tenho capacidade pra 2 projetos esse mês — quer ser um deles? Só ver, sem compromisso:

${demoUrl}`,
    },
  ];
}

// =====================================================
// ROTEIROS DE FOLLOW-UP (depois de 3-7 dias sem resposta)
// =====================================================
export function getFollowUpScripts(vars: ScriptVars): Script[] {
  const { nome, demoUrl } = vars;

  return [
    {
      id: "followup-A",
      variant: "A",
      technique: "Loss Aversion + Soft Follow-up",
      description: "Lembrar do demo + perda implícita de não responder",
      body: `Oi ${nome}, tudo bem?

Enviei um site demo pra vocês alguns dias atrás. Como sei que a rotina é corrida, estou voltando pra garantir que você viu.

O demo está pronto pra visualização aqui:

${demoUrl}

Se não faz sentido agora, sem problema — me avisa que eu não incomodo mais. Mas se fizer sentido, é só responder este WhatsApp.`,
    },
    {
      id: "followup-B",
      variant: "B",
      technique: "Reciprocity + Curiosity",
      description: "Pergunta direta sobre o que achou do demo",
      body: `Oi ${nome}!

Quase esqueci de te perguntar — chegou a ver o site que eu criei pra vocês?

${demoUrl}

Se viu, me fala o que achou — mesmo crítica é feedback. Se não viu ainda, dá uma olhada, leva 30 segundos.`,
    },
  ];
}

// =====================================================
// ROTEIRO LONG FORM — Método Gabriel Miranda completo
// (usa catálogo de produtos dinamicamente)
// =====================================================
export function getLongFormScript(vars: ScriptVars, products: Array<{
  name: string;
  description: string | null;
  price_label: string | null;
  icon: string | null;
  is_recurring: boolean;
}>): Script {
  const { nome, nicho, cidade, demoUrl } = vars;
  const nichoFmt = formatNicho(nicho);

  // Filtra produtos ativos e formata lista
  const productList = products
    .filter(p => p && p.name)
    .map(p => `${p.icon || "✅"} ${p.name}${p.description ? ` — ${p.description}` : ""}${p.price_label ? ` (${p.price_label})` : ""}`)
    .join("\n");

  const body = `Assunto: ${nome} — como atrair 30-50 clientes novos por mês (sem depender de indicação)

Olá, ${nome}!
Meu nome é Clodoaldo Silva, sou especialista em marketing digital local aqui da região.

Vi sua avaliação no Google Maps — parabéns pelo trabalho bem feito!

Cheguei até vocês pesquisando "${nichoFmt} perto de mim" no Google. Notei que vocês ainda NÃO têm um site profissional — e isso está custando clientes todos os meses. Deixa eu explicar o que está acontecendo:

1. 🔍 Pesquisando "${nichoFmt} em ${cidade}", seus concorrentes aparecem em primeiro — e estão ganhando os clientes que poderiam estar vindo até vocês. São 150-400 buscas/mês só na região.

2. 📱 87% das pessoas pesquisam online ANTES de decidir onde comprar. Sem presença digital forte, vocês estão invisíveis para esse público.

3. 📉 A cada mês sem isso = 30-50 clientes novos indo direto pro concorrente. Em 6 meses, são 200+ clientes que poderiam ser de vocês.

Mais que um site, eu ofereço um ecossistema completo para o ${nome} crescer:

${productList}

💰 Custo-benefício que faz sentido: um único site profissional custa menos que 1 mês de aluguel da loja. E diferente do aluguel (que se paga pra sempre), o site é de vocês, trabalha 24/7 por anos.

✅ Sem fidelidade — vocês podem cancelar a recorrência quando quiserem.
✅ Sem trabalho pra vocês — eu cuido de tudo (design, conteúdo, publicação). Vocês só aprovam o resultado final.

Sei que provavelmente estão ocupados — todo mundo que tem negócio próprio está. Por isso não precisa de reunião interminável: me chama no WhatsApp, a gente conversa por mensagem mesmo, e em 5 minutinhos eu mostro exatamente o que dá pra fazer.

👉 Posso enviar um preview gratuito do site que eu criaria pra vocês? É só responder "sim" no WhatsApp.

📱 (81) 92005-1068
🌐 ${demoUrl}

Abraço,
Clodoaldo Silva`;

  return {
    id: "long-form",
    variant: "L",
    technique: "Storytelling + Value Stack + Reciprocity",
    description: "Roteiro completo do método Gabriel Miranda — lista todos os produtos do catálogo com preço. Use quando lead mostrar interesse inicial.",
    body,
  };
}

// =====================================================
// Helper: pegar scripts por tipo
// =====================================================
export function getScriptsForLead(vars: ScriptVars, hasWebsite: boolean | null): {
  primary: Script[];
  followup: Script[];
} {
  if (hasWebsite === true) {
    return {
      primary: getTemSiteScripts(vars),
      followup: getFollowUpScripts(vars),
    };
  }
  return {
    primary: getSemSiteScripts(vars),
    followup: getFollowUpScripts(vars),
  };
}
