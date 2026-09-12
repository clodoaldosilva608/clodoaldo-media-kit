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
  variant: "A" | "B" | "C";
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

(clodoaldo.vercel.app — veja cases de outros ${nichoFmt}s da região)`,
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
