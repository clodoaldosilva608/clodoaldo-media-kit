/**
 * Catálogo de objeções comuns em prospecção B2B + quebras prontas.
 * Cada objeção tem: id, category, objection, break, contextTags, priority.
 */

export interface Objection {
  id: string;
  category: "preco" | "tempo" | "valor_percebido" | "concorrencia" | "tecnologia" | "resultado" | "confianca";
  objection: string;
  break: string;
  contextTags: string[];
  priority: 1 | 2 | 3;
}

export const OBJECTIONS: Objection[] = [
  {
    id: "conc-1",
    category: "concorrencia",
    objection: "Não preciso de site, meus clientes já me conhecem.",
    break: `Entendo perfeitamente — seus clientes fiéis já te conhecem. Mas um estudo do Google mostra que 76% das pessoas pesquisam online ANTES de escolher onde comprar, inclusive para restaurantes e serviços locais.

Seu concorrente direto aqui na cidade (que tem site + Google Meu Negócio otimizado) está aparecendo primeiro nessas buscas e ganhando os clientes que ESTARIAM indo até você.

Se tiver interesse em saber mais, é só me chamar no WhatsApp: 📱 (81) 92005-1068`,
    contextTags: ["sem_site", "todos"],
    priority: 1,
  },
  {
    id: "conc-2",
    category: "concorrencia",
    objection: "Meu concorrente tem site mas não vejo diferença.",
    break: `Boa observação! Ter site não é mágico — mas ter site + SEO + Google Meu Negócio otimizado é o que faz a diferença.

Cada clique no concorrente = um cliente que poderia ser seu. São em média 150-400 buscas por mês SÓ na sua região para o seu nicho.

Se tiver interesse em saber mais, é só me chamar no WhatsApp: 📱 (81) 92005-1068`,
    contextTags: ["sem_site", "todos"],
    priority: 1,
  },
  {
    id: "conc-3",
    category: "concorrencia",
    objection: "Já tenho muitos clientes, não preciso de mais.",
    break: `Que excelente notícia! Clientela fiel é o sonho de qualquer negócio. Mas me diz uma coisa: e quando 1 em cada 5 desses clientes se muda, viaja, ou experimenta o concorrente — como você repõe?

Negócio que para de atrair cliente novo está em decadência silenciosa.

Se tiver interesse em saber como garantir fila de cliente novo sem depender só de indicação, me chame no WhatsApp: 📱 (81) 92005-1068`,
    contextTags: ["todos"],
    priority: 2,
  },
  {
    id: "preco-1",
    category: "preco",
    objection: "Está caro, não tenho orçamento agora.",
    break: `Entendo — investimento precisa fazer sentido. Mas me responde uma coisa sincera: se eu te dissesse que a cada R$ 1 investido em presença digital você volta R$ 5 em cliente novo, ainda seria caro?

Site profissional + Google Meu Negócio otimizado custa menos que 1 mês de aluguel da sua loja. E diferente do aluguel (que você paga pra sempre), o site você paga uma vez e ele trabalha 24/7 por você por anos.

Posso montar um plano em 3x que cabe no fluxo de caixa. Sem fidelidade — você pode cancelar a recorrência quando quiser. Se quiser entender melhor, me chama no WhatsApp: 📱 (81) 92005-1068`,
    contextTags: ["todos"],
    priority: 1,
  },
  {
    id: "preco-2",
    category: "preco",
    objection: "O concorrente cobrou mais barato.",
    break: `Faz sentido comparar preço — eu faria o mesmo. Mas me permite uma pergunta: esse concorrente mais barato oferece:
✅ Site responsivo (funciona no celular)?
✅ SEO local (aparece nas buscas da cidade)?
✅ Integração com WhatsApp?
✅ Google Meu Negócio otimizado?
✅ Suporte pós-venda?

Eu entrego tudo isso. Cobrança única, sem mensalidade escondida.

Se quiser ver exemplos reais, me chama no WhatsApp: 📱 (81) 92005-1068`,
    contextTags: ["todos"],
    priority: 2,
  },
  {
    id: "tempo-1",
    category: "tempo",
    objection: "Estou muito ocupado agora, me liga mês que vem.",
    break: `Perfeito — você estar ocupado é ótimo sinal de que o negócio tá rodando! Mas me diz uma coisa: mês que vem você vai estar menos ocupado? Provavelmente não, né.

O problema de adiar é que a cada mês seu concorrente ganha 30-50 clientes novos que poderiam ser seus. Em 6 meses, são 200+ clientes que foram pro lado dele.

Não precisa de 1 hora da sua vida. É só me chamar no WhatsApp quando tiver um tempinho — a gente conversa por mensagem mesmo, sem pressão. 📱 (81) 92005-1068`,
    contextTags: ["todos"],
    priority: 1,
  },
  {
    id: "tempo-2",
    category: "tempo",
    objection: "Não tenho tempo para cuidar de site.",
    break: `Totalmente compreensível — você precisa cuidar do seu negócio, não de site! É por isso que minha entrega é "chave na mão":

✅ Eu cuido de tudo: design, conteúdo, fotos, SEO, publicação
✅ Você só precisa aprovar o resultado final (5 minutinhos)
✅ Depois de pronto, atualização é só me mandar mensagem no WhatsApp

Site profissional não é mais um trabalho pra você — é uma ferramenta que trabalha POR você 24/7.`,
    contextTags: ["todos"],
    priority: 2,
  },
  {
    id: "valor-1",
    category: "valor_percebido",
    objection: "Não vejo necessidade de ter site.",
    break: `Faz sentido pensar assim se você nunca teve um site que funcionou. Mas pensa comigo:

Quando você precisa de um produto ou serviço, o que você faz? Provavelmente abre o Google, né? 87% dos consumidores fazem o mesmo. Se você não está no Google com um site profissional, você está INVISÍVEL para esses 87%.

É como ter uma loja linda, mas com a porta fechada e sem placa na rua.

Não é sobre "ter site" — é sobre estar acessível onde seu cliente procura. Se quiser entender melhor como funciona pro seu caso, me chama no WhatsApp: 📱 (81) 92005-1068`,
    contextTags: ["sem_site", "todos"],
    priority: 1,
  },
  {
    id: "valor-2",
    category: "valor_percebido",
    objection: "Tenho Instagram/Facebook, não preciso de site.",
    break: `Excelente que você já tem Instagram! Mas sabe o que falta? O Google é onde 70% das buscas por negócio local acontecem — Instagram responde por só 15%.

Diferenças práticas:
• Instagram = cliente que JÁ te segue (você precisa atrair primeiro)
• Site + Google = cliente NOVO te achando sozinho

Site não substitui o Instagram — complementa. É como ter 2 portas de entrada em vez de 1.

Se quiser ver exemplos reais, me chama no WhatsApp: 📱 (81) 92005-1068`,
    contextTags: ["sem_site", "todos"],
    priority: 1,
  },
  {
    id: "tech-1",
    category: "tecnologia",
    objection: "Não sei mexer com tecnologia.",
    break: `Perfeito — você não precisa saber! Eu cuido de 100% da parte técnica. Você só precisa:

1. Me passar suas fotos, horário, cardápio/serviços (5 min)
2. Aprovar o site pronto quando eu enviar (2 min)
3. Receber cliente novo pelo WhatsApp (você já sabe usar!)

Se amanhã você quiser mudar um preço, uma foto, ou adicionar promoção, é só me mandar WhatsApp. Eu faço.`,
    contextTags: ["todos"],
    priority: 2,
  },
  {
    id: "res-1",
    category: "resultado",
    objection: "Já paguei por site antes e não trouxe resultado.",
    break: `Entendo totalmente sua frustração — infelizmente muitos "web designers" entregam site bonito mas que não aparece no Google e não converte visita em cliente.

A diferença do meu trabalho:
❌ Site bonito que ninguém vê = R$ desperdiçado
✅ Site bonito + SEO local + otimização para conversão = investimento que se paga

Posso te mostrar cases reais da sua região. Sem fidelidade — você pode cancelar a recorrência quando quiser, sem multa.

Você não está pagando por um site. Está pagando por cliente novo. Se quiser ver os cases, me chama no WhatsApp: 📱 (81) 92005-1068`,
    contextTags: ["tem_site", "todos"],
    priority: 1,
  },
  {
    id: "res-2",
    category: "resultado",
    objection: "Como sei que vai funcionar para o meu nicho?",
    break: `Pergunta certeira! Cada nicho tem características próprias, mas a base é a mesma: as pessoas pesquisam no Google antes de comprar.

Já trabalhei com restaurantes, barbearias, clínicas, advogados, lojas — em TODOS os casos o cliente novo que chega via Google tem ticket médio MAIOR que o cliente via indicação.

Posso te mostrar números reais: em média, meus clientes veem +30% a +120% de aumento em pedidos via WhatsApp nos primeiros 3 meses. Caso queira entender como isso funciona pro seu nicho, me chama no WhatsApp: 📱 (81) 92005-1068`,
    contextTags: ["todos"],
    priority: 2,
  },
  {
    id: "conf-1",
    category: "confianca",
    objection: "Nunca ouvi falar de você, como sei que é confiável?",
    break: `Justo! Confiança é tudo num negócio. Deixa eu compartilhar 3 coisas sobre mim:

1. Meu nome é Clodoaldo Silva, você pode me achar em qualquer rede — não sou anônimo
2. Tenho portfólio público com cases reais de clientes da região — você pode verificar tudo direto no meu site: 🌐 clodoaldo.vercel.app
3. O pagamento é em 3x — você só paga a última parcela se o site estiver pronto e funcionando

Qualquer dúvida, é só me chamar no WhatsApp: 📱 (81) 92005-1068. Se não fizer sentido pra você, a gente encerra amigável.`,
    contextTags: ["todos"],
    priority: 2,
  },
];

export function getRelevantObjections(leadInfo: {
  niche?: string;
  hasWebsite?: boolean;
}): Objection[] {
  const tags: string[] = ["todos"];
  if (leadInfo.hasWebsite) tags.push("tem_site");
  else tags.push("sem_site");
  if (leadInfo.niche) tags.push(leadInfo.niche.toLowerCase());

  return OBJECTIONS.filter((o) => o.contextTags.some((t) => tags.includes(t)))
    .sort((a, b) => a.priority - b.priority);
}

export function getUrgencyHooks(leadInfo: {
  name: string;
  niche?: string;
  hasWebsite?: boolean;
  rating?: number | null;
}): string[] {
  const hooks: string[] = [];
  const niche = leadInfo.niche || "estabelecimento";

  if (!leadInfo.hasWebsite) {
    hooks.push(
      `Notei que vocês ainda não têm site profissional. Pesquisando "${niche} perto de mim" no Google, seu concorrente direto aparece em primeiro — e está ganhando os clientes que poderiam estar vindo até vocês. São em média 150-400 buscas/mês só na sua região.`,
    );
  } else {
    hooks.push(
      `Notei que seu site poderia ter melhor desempenho no Google. Pesquisando "${niche} perto de mim", seus concorrentes aparecem acima de você — o que significa cliente novo indo pra eles todo dia.`,
    );
  }

  if (leadInfo.rating && leadInfo.rating >= 4.5) {
    hooks.push(
      `Sua avaliação de ${leadInfo.rating} estrelas é excelente! Mas avaliações boas SEM presença digital forte = cliente que pesquisaria você acaba indo pro concorrente que aparece primeiro no Google.`,
    );
  }

  hooks.push(
    `87% dos consumidores pesquisam online antes de decidir onde comprar. Sem presença digital otimizada, você está invisível para esses 87% — e cada mês que passa são 30-50 clientes novos indo pro concorrente.`,
  );

  return hooks;
}

export function formatObjectionForDisplay(obj: Objection) {
  const categoryLabels: Record<Objection["category"], string> = {
    preco: "💵 Preço",
    tempo: "⏰ Tempo",
    valor_percebido: "💡 Valor percebido",
    concorrencia: "⚔️ Concorrência",
    tecnologia: "🔧 Tecnologia",
    resultado: "📈 Resultado",
    confianca: "🤝 Confiança",
  };
  return {
    objectionLabel: `${categoryLabels[obj.category]} — "${obj.objection}"`,
    objectionText: obj.objection,
    breakLabel: "Sua resposta:",
    breakText: obj.break,
  };
}
