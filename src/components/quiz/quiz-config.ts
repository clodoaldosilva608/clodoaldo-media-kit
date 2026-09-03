// Quiz configuration — questions and answer options.
// The answers map to quiz_rules in the database (question_id + answer_value).

export interface QuizQuestion {
  id: string;
  emoji: string;
  title: string;
  subtitle?: string;
  options: QuizOption[];
}

export interface QuizOption {
  value: string;
  emoji: string;
  label: string;
  description?: string;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "objetivo",
    emoji: "🎯",
    title: "Qual é o seu maior objetivo agora?",
    subtitle: "Escolha a opção que mais combina com seu momento",
    options: [
      { value: "divulgar-marca", emoji: "📣", label: "Divulgar minha marca" },
      { value: "vender-produto", emoji: "💸", label: "Vender um produto" },
      { value: "melhorar-conteudo", emoji: "✨", label: "Melhorar meu conteúdo" },
      { value: "criar-site", emoji: "🌐", label: "Criar um site/página" },
      { value: "captar-leads", emoji: "🧲", label: "Captar leads" },
      { value: "lancar-produto-digital", emoji: "🚀", label: "Lançar produto digital" },
      { value: "explorar-apps", emoji: "📱", label: "Explorar apps do ecossistema" },
    ],
  },
  {
    id: "estagio",
    emoji: "📍",
    title: "Em que estágio você está?",
    subtitle: "Não existe resposta certa — apenas a verdadeira",
    options: [
      { value: "apenas-ideia", emoji: "💡", label: "Tenho apenas a ideia" },
      { value: "oferta-sem-pagina", emoji: "📄", label: "Tenho oferta, mas sem página" },
      { value: "pagina-converte-pouco", emoji: "📉", label: "Página existe, mas converte pouco" },
      { value: "publico-conteudo", emoji: "📹", label: "Já publico conteúdo" },
      { value: "tenho-audiencia", emoji: "👥", label: "Tenho audiência formada" },
      { value: "trafego-pago", emoji: "💰", label: "Rodo tráfego pago" },
      { value: "operacao-funcionando", emoji: "⚙️", label: "Operação funcionando" },
    ],
  },
  {
    id: "gargalo",
    emoji: "🧩",
    title: "Qual é o seu maior gargalo?",
    subtitle: "O que está te segurando agora?",
    options: [
      { value: "falta-clareza", emoji: "🌫️", label: "Falta clareza na oferta" },
      { value: "falta-autoridade", emoji: "👤", label: "Falta autoridade" },
      { value: "pouco-alcance", emoji: "📡", label: "Pouco alcance" },
      { value: "baixa-conversao", emoji: "🔄", label: "Baixa conversão" },
      { value: "falta-conteudo", emoji: "🎬", label: "Falta conteúdo" },
      { value: "falta-estrutura-tecnica", emoji: "🛠️", label: "Falta estrutura técnica" },
      { value: "falta-tempo", emoji: "⏰", label: "Falta tempo" },
      { value: "orcamento-limitado", emoji: "💳", label: "Orçamento limitado" },
    ],
  },
  {
    id: "urgencia",
    emoji: "⏱️",
    title: "Quando você quer resolver isso?",
    subtitle: "Seja honesto — isso ajuda a calibrar a recomendação",
    options: [
      { value: "o-quanto-antes", emoji: "🔥", label: "O quanto antes" },
      { value: "ate-30-dias", emoji: "📅", label: "Em até 30 dias" },
      { value: "1-a-3-meses", emoji: "🗓️", label: "De 1 a 3 meses" },
      { value: "pesquisando", emoji: "🔍", label: "Apenas pesquisando" },
    ],
  },
  {
    id: "investimento",
    emoji: "💼",
    title: "Quanto você pode investir?",
    subtitle: "Faixa de investimento disponível agora",
    options: [
      { value: "ate-300", emoji: "🌱", label: "Até R$ 300" },
      { value: "301-1000", emoji: "🌿", label: "R$ 301 a R$ 1.000" },
      { value: "1001-3000", emoji: "🌳", label: "R$ 1.001 a R$ 3.000" },
      { value: "acima-3000", emoji: "🚀", label: "Acima de R$ 3.000" },
    ],
  },
];

export const TOTAL_STEPS = QUIZ_QUESTIONS.length;
