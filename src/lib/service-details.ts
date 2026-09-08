/**
 * Metadata estendida de cada serviço — complementa o services-catalog.ts.
 */

export interface ServiceDetail {
  slug: string;
  problem: string;
  audience: string;
  deliverables: string[];
  notIncluded: string[];
  estimatedDays: string;
  revisions: string;
  hiringProcess: string[];
  refundPolicy: string;
  faq: Array<{ q: string; a: string }>;
}

export const SERVICE_DETAILS: Record<string, ServiceDetail> = {
  "video-dedicado": {
    slug: "video-dedicado",
    problem: "Sua marca precisa aparecer em formato vertical (TikTok/Reels) com produção profissional, mas não tem tempo ou expertise interna para roteirizar, gravar e editar com qualidade commercial.",
    audience: "Marcas que querem anunciar em canais verticais (TikTok, Reels, Shorts) com narrativa própria.",
    deliverables: [
      "1 vídeo vertical (9:16) com até 60 segundos",
      "Roteiro estratégico focado em conversão",
      "Edição premium com cortes, legendas e trilha",
      "CTA otimizado para o objetivo da campanha",
      "Publicação em TikTok e Reels",
      "Versão sem legenda para uso em ads",
    ],
    notIncluded: [
      "Tráfego pago (mídia paga) — pode ser contratado à parte",
      "Criação de produto digital para entregar no vídeo",
      "Substituições ilimitadas de take (1 rodada de gravação)",
    ],
    estimatedDays: "5 a 10 dias úteis após briefing aprovado",
    revisions: "2 rodadas de revisão na edição",
    hiringProcess: [
      "Escolha o formato e avance para o checkout",
      "Preencha o briefing (marca, produto, público, tom, referências)",
      "Pagamento seguro via Kiwify",
      "Recebo o briefing e devolvo o roteiro em até 48h",
      "Você aprova ou pede ajustes no roteiro",
      "Gravação + edição (5-10 dias úteis)",
      "Entrega da versão final + publicação",
    ],
    refundPolicy: "100% de reembolso se cancelado antes do início da produção do roteiro. Após início, reembolso parcial proporcional ao trabalho já executado. Após entrega da versão final, não há reembolso.",
    faq: [
      { q: "Posso escolher o tema do vídeo?", a: "Sim. Você descreve o produto/serviço no briefing e eu construo o roteiro em torno disso." },
      { q: "Quantos vídeos estão inclusos?", a: "O valor é para 1 vídeo dedicado. Para pacotes com múltiplos vídeos, consulte 'Combo Completo'." },
      { q: "Posso usar o vídeo em anúncios pagos?", a: "Sim. Você recebe a versão final e uma versão sem legenda para uso em ads." },
      { q: "E se eu não gostar do resultado?", a: "Você tem 2 rodadas de revisão. Se ainda assim não atender, conversamos sobre refação." },
    ],
  },
  "roteiro-estrategico": {
    slug: "roteiro-estrategico",
    problem: "Você quer gravar seu próprio conteúdo mas trava na hora de escrever — não sabe o que dizer, em que ordem, nem como terminar com um CTA que converte.",
    audience: "Creators e marcas que gravam próprio conteúdo mas perdem tempo decidindo o que falar, ou cujos vídeos não convertem por falta de estrutura narrativa.",
    deliverables: [
      "3 roteiros estratégicos para vídeo vertical",
      "Estrutura completa (gancho, desenvolvimento, CTA)",
      "Sugestão de ângulos e gatilhos por vídeo",
      "Lista de B-roll e elementos visuais por cena",
      "Guia de gravação (posição, tom, ritmo)",
    ],
    notIncluded: [
      "Edição do vídeo (pode ser contratada à parte como 'Edição Viral')",
      "Gravação — você grava com base no roteiro",
    ],
    estimatedDays: "3 a 5 dias úteis após briefing aprovado",
    revisions: "1 rodada de revisão nos 3 roteiros",
    hiringProcess: [
      "Checkout + preenchimento do briefing",
      "Recebo contexto (seu nicho, público, objetivo, exemplos)",
      "Devolvo os 3 roteiros em até 72h",
      "Você pede ajustes ou aprova",
      "Versão final entregue + guia de gravação",
    ],
    refundPolicy: "Reembolso integral até 24h após pagamento. Após início da escrita, reembolso de 50%. Após entrega, não há reembolso.",
    faq: [
      { q: "Os roteiros são genéricos ou personalizados?", a: "100% personalizados para seu nicho, público e objetivo — não é template." },
      { q: "Funciona para qualquer nicho?", a: "Sim, mas alguns nichos mais técnicos (médico, jurídico, financeiro) podem precisar de você revisar jargão específico." },
      { q: "Quantos roteiros vem?", a: "3 roteiros por contratação. Para volumes maiores, contrate múltiplas vezes." },
      { q: "Posso pedir para mudar tudo depois de pronto?", a: "Você tem 1 rodada de revisão. Se quiser refazer do zero com conceito diferente, pode ter custo adicional." },
    ],
  },
  "edicao-viral": {
    slug: "edicao-viral",
    problem: "Você já gravou seu conteúdo mas a edição não tá viralizando — faltam cortes dinâmicos, legendas, B-roll, ritmo. Vídeo cru não compete no feed.",
    audience: "Creators que gravam próprio material mas não editam (ou editam de forma básica) e querem edição premium com ritmo viral.",
    deliverables: [
      "Edição de 1 vídeo vertical (até 90s) com material seu",
      "Cortes dinâmicos, jump cuts, zoom estratégico",
      "Legendas animadas (estilo pop-up)",
      "B-roll e elementos visuais quando aplicável",
      "Trilha sonora livre de copyright",
      "Versão final em MP4 + versão para ads",
    ],
    notIncluded: [
      "Gravação — você precisa enviar o material bruto",
      "Roteirização (pode ser contratada como 'Roteiro Estratégico')",
      "Color grading avançado (cinematográfico)",
    ],
    estimatedDays: "3 a 5 dias úteis após receber o material bruto",
    revisions: "2 rodadas de ajustes na edição",
    hiringProcess: [
      "Checkout + briefing (link do material bruto)",
      "Recebo o material via Drive/Dropbox/WeTransfer",
      "Edição em 3-5 dias úteis",
      "Entrega da primeira versão para revisão",
      "Ajustes (se necessário) em 24-48h",
      "Versão final entregue",
    ],
    refundPolicy: "Reembolso integral antes de iniciar a edição. Após primeira versão entregue, reembolso de 30%. Após segunda versão, não há reembolso.",
    faq: [
      { q: "Que tipo de material bruto você precisa?", a: "Vídeos em alta resolução (1080p+), preferencialmente gravados em celular recente ou câmera. Áudio limpo ajuda muito." },
      { q: "Posso enviar áudio separado do vídeo?", a: "Sim. Inclusive recomendado para melhor qualidade." },
      { q: "Quantos minutos de material bruto você aceita?", a: "Até 30 minutos de material bruto para um vídeo de até 90s. Mais que isso, consulte valor adicional." },
      { q: "Posso pedir estilo específico?", a: "Sim, pode mandar referências. Vou adaptar ao seu material." },
    ],
  },
  "auditoria-de-perfil": {
    slug: "auditoria-de-perfil",
    problem: "Seu perfil não cresce, você não entende o porquê. Sabe que algo tá errado mas não consegue diagnosticar — e seguir criando sem diagnóstico é jogar contra o algoritmo no escuro.",
    audience: "Creators e marcas com perfil ativo há pelo menos 3 meses que sentem estagnação e querem entender o que travou.",
    deliverables: [
      "Diagnóstico completo do perfil (TikTok/Instagram/YouTube)",
      "Análise dos últimos 10-15 conteúdos",
      "Identificação de padrões (visual, narrativo, ritmo)",
      "Mapa de pontos fracos + oportunidades",
      "Plano de ação para próximos 30 dias (5-7 ações concretas)",
      "Vídeo de 15-20 min explicando o diagnóstico",
    ],
    notIncluded: [
      "Execução das ações (você implementa ou contrata separado)",
      "Gestão de mídia paga",
      "Reescrita de roteiros",
    ],
    estimatedDays: "5 a 7 dias úteis após receber acesso ao perfil",
    revisions: "1 sessão de dúvidas (30 min) sobre o diagnóstico",
    hiringProcess: [
      "Checkout + briefing (link do perfil + contexto)",
      "Recebo acesso ao perfil (público) + métricas internas (se quiser compartilhar)",
      "Análise em 5-7 dias úteis",
      "Entrega do documento + vídeo explicativo",
      "Sessão de dúvidas de 30 min (opcional)",
    ],
    refundPolicy: "Reembolso integral antes de iniciar a análise. Após entrega do diagnóstico, não há reembolso (trabalho já executado).",
    faq: [
      { q: "Preciso te passar minha senha?", a: "Não. A análise é feita com base no perfil público + métricas que você me enviar (prints do analytics, opcional)." },
      { q: "Funciona para qualquer rede?", a: "Sim — TikTok, Instagram, YouTube. Posso analisar uma ou várias." },
      { q: "Vou entender o que preciso mudar?", a: "Sim. O diagnóstico vem em linguagem clara, com exemplos seus, e o vídeo explica cada ponto." },
      { q: "E se eu discordar do diagnóstico?", a: "Tem a sessão de 30 min pra a gente discutir." },
    ],
  },
};

export const DEFAULT_SERVICE_DETAIL: ServiceDetail = {
  slug: "",
  problem: "Serviço/produto para ajudar você a avançar no seu objetivo digital.",
  audience: "Pessoas e empresas que querem executar melhor sua estratégia de conteúdo.",
  deliverables: ["Entrega conforme descrito no checkout"],
  notIncluded: ["Serviços adicionais fora do escopo"],
  estimatedDays: "Variável conforme escopo — confirmado após briefing",
  revisions: "1 rodada de revisão",
  hiringProcess: [
    "Checkout + preenchimento do briefing",
    "Confirmação do pedido",
    "Execução e entrega",
  ],
  refundPolicy: "Reembolso integral até 24h após pagamento (antes do início da produção). Após início, reembolso parcial.",
  faq: [
    { q: "Tem dúvida que não tá aqui?", a: "Me chama no WhatsApp — respondo pessoalmente: (81) 92005-1068." },
  ],
};

export function getServiceDetail(slug: string): ServiceDetail {
  return SERVICE_DETAILS[slug] ?? { ...DEFAULT_SERVICE_DETAIL, slug };
}
