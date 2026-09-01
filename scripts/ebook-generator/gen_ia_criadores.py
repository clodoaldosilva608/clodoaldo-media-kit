"""
Gera o e-book: IA para Criadores de Conteúdo (60+ páginas).
Stack de ferramentas, prompts, workflows e ética no uso de IA para criar conteúdo.
"""
import sys
sys.path.insert(0, "/home/z/my-project/scripts/ebook-generator")

from reportlab.platypus import Paragraph, Spacer, PageBreak
from reportlab.lib.units import cm
from pdf_base import (
    COLORS, build_pdf, cover_page, toc_page, chapter_header,
    h2, h3, body, body_lead, quote, bullet_list, numbered_list,
    callout, exercise_box, data_table, page_break, spacer,
    horizontal_rule, illustration_image, HRule, get_styles,
)
from illustrations import (
    ai_stack_diagram, llm_comparison_chart, ai_workflow_funnel,
    ai_adoption_growth, ai_ethics_radar,
)

OUTPUT = "/home/z/my-project/scripts/ebook-generator/output/ia-para-criadores.pdf"


def caption(text):
    styles = get_styles()
    return Paragraph(text, styles["Footer_Caption"])


def chapter_intro(title, subtitle):
    styles = get_styles()
    return [
        spacer(2),
        Paragraph("INTRODUÇÃO", styles["Chapter_Number"]),
        HRule(1.5 * 28.35, COLORS["primary"], 1),
        spacer(0.6),
        Paragraph(title, styles["Chapter_Title"]),
        Paragraph(subtitle, styles["Chapter_Subtitle"]),
        spacer(0.4),
    ]


# ============ CAPÍTULO 1 ============
CHAPTER_1 = [
    body_lead("Em 2024, mais de 90% dos criadores de conteúdo usam IA em alguma etapa da produção. Mas a maioria usa errado: trata IA como oráculo mágico em vez de ferramenta de pipeline. Neste capítulo, vamos desconstruir o stack completo de IA para criadores."),
    h2("Por que você precisa de um stack, não de uma ferramenta"),
    body("A pergunta que mais recebo é: \"qual a melhor IA para conteúdo?\". A resposta honesta: nenhuma. Não existe uma ferramenta que faça tudo bem. Existe sim um <b>conjunto coordenado de ferramentas</b> — um stack — que cobre ideiação, produção, edição, distribuição e analytics."),
    body("Pensar em ferramentas isoladas é como ter um martelo sem prego, ou um prego sem martelo. O stack é o que transforma ferramentas em capacidade produtiva real."),
    h3("As 5 camadas do stack moderno"),
    body("Todo criador profissional precisa cobrir 5 camadas. Pode usar 1 ferramenta por camada ou combinar várias, mas nenhuma pode ser pulada:"),
    numbered_list([
        "<b>Ideação:</b> gerar, expandir e organizar ideias de conteúdo. ChatGPT, Gemini, Claude, Perplexity.",
        "<b>Produção:</b> criar assets visuais e sonoros. Midjourney, DALL·E, Runway, ElevenLabs, Suno.",
        "<b>Edição:</b> montar, cortar, refinar. Descript, Adobe Firefly, CapCut AI, Opus Clip, Premiere AI.",
        "<b>Distribuição:</b> agendar, publicar, repurpose. Buffer AI, Hootsuite, Later, Metricool.",
        "<b>Analytics:</b> medir, analisar, iterar. VidIQ, Tubebuddy, Sprout Social, GA4, native insights.",
    ]),
    illustration_image(ai_stack_diagram(), 14 * cm),
    caption("Figura 1.1 — As 5 camadas do stack de IA para criadores. Cada camada é insubstituível."),
    h2("Critérios para escolher suas ferramentas"),
    body("Antes de sair assinando 10 ferramentas, decida com critério. Os 4 critérios que uso:"),
    bullet_list([
        "<b>Cobertura:</b> a ferramenta resolve uma camada inteira ou só um pedaço?",
        "<b>Custo-benefício:</b> custo mensal dividido pelo número de horas economizadas.",
        "<b>Integração:</b> conversa via API/Zapier com as outras ferramentas do seu stack?",
        "<b>Curva de aprendizado:</b> em quantas horas você está fluente? Se for mais de 20h, evite.",
    ]),
    h3("Anti-padrão: a síndrome do \"shiny object\""),
    body("A cada semana sai uma nova IA. FOMO é real. Mas se você troca de stack toda semana, nunca domina nada. Regra prática: <b>permaneça no mesmo stack por pelo menos 90 dias</b> antes de avaliar trocas. Só troque por ganho de performance mensurável acima de 20%."),
    callout("Princípio fundamental", "Stack > ferramenta. Um criador que domina um stack modesto supera outro que usa 15 ferramentas que não se integram. Consistência vence novidade."),
    h2("O stack recomendado para iniciantes vs avançados"),
    body("Para um criador iniciante (0-10k seguidores), o foco é custo zero. Para o avançado (50k+), o foco é velocidade e qualidade premium:"),
    data_table(
        ["Camada", "Iniciante (grátis/custo baixo)", "Avançado (premium)"],
        [
            ["Ideação", "ChatGPT Free + Claude Free", "ChatGPT Plus + Claude Pro + Perplexity Pro"],
            ["Produção", "DALL·E free + CapCut", "Midjourney + Runway + ElevenLabs Pro"],
            ["Edição", "CapCut Desktop (free)", "Premiere Pro + Descript + Opus Clip"],
            ["Distribuição", "Buffer free + post manual", "Metricool Pro + Zapier"],
            ["Analytics", "Native insights (IG, YT)", "VidIQ Pro + Sprout + GA4"],
        ],
    ),
    body("Um stack avançado custa entre R$ 600 e R$ 1.500 por mês. Em contrapartida, economiza 20-40 horas de trabalho — o que vale muito mais que isso se você valoriza sua hora acima de R$ 50."),
    exercise_box("Monte seu stack agora", [
        "Liste as 5 camadas (ideação, produção, edição, distribuição, analytics).",
        "Para cada uma, escreva qual ferramenta você usa hoje. Se não usa nenhuma, escreva \"vazio\".",
        "Para cada camada vazia, escolha 1 ferramenta para testar nos próximos 30 dias.",
        "Defina um budget mensal total. Não ultrapasse.",
        "Crie uma pasta \"Stack\" no Notion/Drive para documentar como cada ferramenta se encaixa.",
    ]),
    h2("Resumo do capítulo"),
    bullet_list([
        "Stack coordenado > ferramentas isoladas.",
        "Cubra as 5 camadas: ideação, produção, edição, distribuição, analytics.",
        "Escolha por cobertura, custo-benefício, integração e curva de aprendizado.",
        "Mantenha o mesmo stack por 90 dias antes de considerar trocas.",
        "Stack de iniciante pode ser 100% gratuito; o avançado custa R$ 600-1.500/mês.",
    ]),
]


# ============ CAPÍTULO 2 ============
CHAPTER_2 = [
    body_lead("Prompt é o código-fonte do conteúdo gerado por IA. Um bom prompt economiza horas; um prompt ruim desperdiça tempo e injeta incoerência no output. Neste capítulo, vamos dominar a engenharia de prompts para roteiro de vídeo."),
    h2("A fórmula CREDE para prompts de roteiro"),
    body("Após testar milhares de prompts, desenvolvi um framework simples: <b>CREDE</b>. Toda vez que você for pedir um roteiro, cubra os 5 elementos:"),
    numbered_list([
        "<b>C — Contexto:</b> quem é você, qual o nicho, qual a audiência.",
        "<b>R — Role:</b> qual o papel da IA (roteirista, copywriter, diretor?).",
        "<b>E — Estrutura:</b> gancho, desenvolvimento, CTA. Em quantos segundos?",
        "<b>D — Detalhes:</b> tom de voz, vocabulário, proibidos (palavras, temas).",
        "<b>E — Exemplos:</b> mostre 1-2 roteiros anteriores que funcionaram.",
    ]),
    h3("Exemplo prático — prompt completo para Reels de 30s"),
    body("Aqui está um prompt pronto para colar no ChatGPT/Claude. Repare como cobre todos os 5 elementos:"),
    callout("Prompt: Reels sobre produtividade matinal",
        "Você é um roteirista sênior especializado em Reels de produtividade para criadores de 25-35 anos.<br/><br/>"
        "Contexto: Sou Clodoaldo Silva, influenciador de lifestyle/business. Audiência: 80k no Instagram, 50% homens 25-35.<br/><br/>"
        "Tarefa: Escreva 3 variações de roteiro de 30s sobre \"rotina matinal de 5 minutos\".<br/><br/>"
        "Estrutura: (1) gancho 0-3s, (2) contexto 3-10s, (3) técnica 10-22s, (4) CTA 22-30s.<br/><br/>"
        "Tom: direto, técnico, sem enrolação. Proibido: emojis, palavras como \"incrível\", \"mudou minha vida\".<br/><br/>"
        "Exemplo de tom que uso: \"3 minutos depois de acordar, eu faço isso aqui. Não é café. Não é celular. É respirar 4-7-8 por 1 minuto.\""
    ),
    h2("Variações de prompt por objetivo"),
    body("O prompt muda conforme o objetivo do vídeo. Veja 4 variações:"),
    h3("1. Para Reels de conscientização (topo de funil)"),
    body("Foco no gancho. Pergunta chocante, stat surpreendente, história pessoal breve. CTA suave (\"salva esse vídeo\", \"segue pra mais\")."),
    h3("2. Para Reels de consideração (meio de funil)"),
    body("Foco na técnica. Mostre como fazer. Passo a passo. CTA para salvar ou comentar."),
    h3("3. Para Reels de conversão (fundo de funil)"),
    body("Foco no beneficio + prova + CTA direto. Mostre resultado. CTA para DM, link na bio, ou comentar palavra-chave."),
    h3("4. Para Reels de retenção (manter audiência)"),
    body("Foco em storytelling. História pessoal com tensão, clímax, resolução. CTA: \"segue se isso te ajudou\"."),
    h2("Anti-padrões em prompts de roteiro"),
    body("Erros que vejo toda semana em prompts de criadores:"),
    bullet_list([
        "<b>Pedir \"criativo\" sem dar direção:</b> IA não adivinha seu tom. Sempre dê referência.",
        "<b>Não especificar duração:</b> \"escreva um roteiro\" gera texto de blog, não vídeo curto.",
        "<b>Esquecer do CTA:</b> 90% dos prompts esquecem de pedir CTA. Resultado: vídeo ótimo, conversão zero.",
        "<b>Usar jargão de IA:</b> \"seja criativo\", \"pense fora da caixa\" — IA interpreta literal e gera clichês.",
        "<b>Não iterar:</b> primeiro output nunca é o final. Sempre peça 3 variações e refine a melhor.",
    ]),
    callout("Dica de ouro", "Peça sempre 3 variações no mesmo prompt. Custa o mesmo tempo e multiplica suas opções. Escolha a melhor, refine, poste. As outras 2 viram banco de ideias."),
    exercise_box("Pratique a fórmula CREDE", [
        "Escolha um tema (ex: \"como ganhar 1k seguidores em 30 dias\").",
        "Escreva um prompt cobrindo C, R, E, D, E.",
        "Peça 3 variações no ChatGPT/Claude.",
        "Escolha a melhor variação. Peça refinamento: \"torne o gancho mais ousado, mantenha o resto\".",
        "Compare com um roteiro que você escreveria manualmente. Mediu tempo economizado?",
    ]),
    h2("Medindo a eficácia dos seus prompts"),
    body("Como saber se seu prompt é bom? Métricas que acompanho:"),
    bullet_list([
        "<b>Taxa de uso:</b> % dos outputs que você usa direto vs. reescreve completamente. Meta: 70%+.",
        "<b>Tempo até output pronto:</b> do prompt ao roteiro final. Meta: 5 minutos por Reels.",
        "<b>Performance do vídeo:</b> retenção aos 3s e taxa de salvamento do vídeo postado. Meta: acima da média do seu canal.",
    ]),
    body("Se sua taxa de uso está abaixo de 30%, seu prompt precisa de mais contexto. Se está acima de 90%, está copiando demais — adicione sua voz manualmente."),
]


# ============ CAPÍTULO 3 ============
CHAPTER_3 = [
    body_lead("Edição é onde a mágica acontece — e onde a IA mais evoluiu. Em 2024, ferramentas como Descript, Opus Clip e CapCut AI reduzem em 70% o tempo de edição. Mas o criador que confia cegamente na IA gera conteúdo genérico. Este capítulo é sobre cascar IA com técnica humana."),
    h2("O que IA faz melhor que humano em edição"),
    body("Lista honesta do que a IA já supera humanos em edição:"),
    numbered_list([
        "<b>Transcrição automática:</b> Whisper, Descript — 99% de acurácia, 60 segundos por hora de áudio.",
        "<b>Remoção de silêncios:</b> Descript, CapCut — detecta pausas e corta automaticamente.",
        "<b>Detecção de \"uhm/ah\":</b> Descript remove 80%+ dos vícios de fala.",
        "<b>Cortes de Reels a partir de vídeo longo:</b> Opus Clip, Munch — identifica highlights e gera 5-15 Reels por vídeo de 30min.",
        "<b>Legendas automáticas:</b> CapCut, Premiere AI — gera e sincroniza legendas com 95%+ acurácia.",
        "<b>Background removal:</b> Runway, Adobe Firefly — separa sujeito do fundo sem chroma key.",
    ]),
    h2("O que IA ainda faz mal"),
    body("Não confie cegamente nestas tarefas. Sempre revise manualmente:"),
    bullet_list([
        "<b>Escolha emocional de corte:</b> IA corta por silêncio, não por ritmo emocional. Humano sabe qual take tem energia.",
        "<b>Color grading com mood:</b> LUTs automáticos são chatos. Colorista humana entende a história.",
        "<b>Sincronização musical com batida:</b> IA detecta batida, mas não sabe qual momento do vídeo merece o hit.",
        "<b>Pacing consciente:</b> IA acelera tudo. Humano sabe que momentos pedem pausa dramática.",
    ]),
    h3("O workflow híbrido recomendado"),
    body("O melhor workflow é IA no pesado, humano no fino. Sequência que adoto para Reels de 30-60s:"),
    numbered_list([
        "Transcrevo o bruto com Whisper (1 min).",
        "No Descript, removo silêncios e \"uhm\" automaticamente (30s).",
        "Escolho manualmente os takes que ficam — aqui está o meu critério humano (5 min).",
        "Exporto e abro no CapCut. Aplico legendas automáticas (1 min).",
        "Refino manualmente as legendas: ajusto timing, font, animação (5 min).",
        "Aplico B-roll manualmente onde a IA sugere — aceito 50% das sugestões (10 min).",
        "Color grading: 1 LUT base + ajuste manual (3 min).",
        "Sound design: música + SFX manuais (5 min).",
        "Export final (3 min).",
    ]),
    callout("Tempo total: 35 min", "Esse mesmo Reels, sem IA, levaria 2-3 horas. O segredo é deixar IA fazer o operacional, e humano fazer o editorial."),
    h2("Ferramentas de IA para edição — comparativo"),
    data_table(
        ["Ferramenta", "Melhor para", "Preço/mês", "Curva"],
        [
            ["Descript", "Edição por texto, podcasts", "US$ 24", "Média"],
            ["Opus Clip", "Vídeo longo → Reels", "US$ 19", "Baixa"],
            ["CapCut Pro", "Reels, Shorts, edição social", "R$ 32", "Baixa"],
            ["Premiere AI", "Edição profissional completa", "R$ 110", "Alta"],
            ["DaVinci AI", "Color grading avançado", "Grátis/US$ 295", "Alta"],
            ["Runway", "Gerar vídeo a partir de texto", "US$ 15", "Média"],
            ["Munch", "Repurpose vídeo longo", "US$ 49", "Baixa"],
        ],
    ),
    h2("Casos práticos de uso"),
    h3("Caso 1: Podcast de 1h virou 12 Reels em 20 minutos"),
    body("Tenho um cliente com podcast semanal de 60 min. Workflow: subir áudio no Opus Clip → ele identifica 12 highlights com score de viralização → baixo os 12 cortes → refinei títulos e legendas no CapCut → agendei postagem. Resultado: 12 Reels por semana, antes era 2."),
    h3("Caso 2: Reels gravado em inglês, dublado em PT"),
    body("Gravei Reels de 60s em inglês. Usei ElevenLabs para dublar em PT-BR com clonagem da minha voz. Lip sync com HeyGen. Resultado: 1 vídeo, 2 versões, 2 mercados. Custo total: US$ 8."),
    exercise_box("Teste o workflow híbrido", [
        "Grave um vídeo de 3 minutos (pode ser de qualquer tema).",
        "Suba no Descript ou Whisper. Gere transcrição automática.",
        "Peça para remover silêncios e \"uhm\" automaticamente.",
        "Compare com a versão que você editaria manualmente.",
        "Marque o tempo economizado. É seu novo baseline.",
    ]),
    h2("Armadilhas comuns em edição com IA"),
    bullet_list([
        "<b>Aceitar 100% das sugestões de corte:</b> IA erra em cortes emocionais. Sempre revise.",
        "<b>Usar legendas default do CapCut:</b> todo mundo usa. Customiza fonte, cor, animação.",
        "<b>Confundir \"automático\" com \"bom\":</b> automático é rápido, não necessariamente melhor.",
        "<b>Ignorar áudio:</b> IA corta vídeo, não mixa som. Sound design ainda é humano.",
        "<b>Pular color grading:</b> LUT automático deixa tudo igual. Aplique LUT + ajuste manual.",
    ]),
]


# ============ CAPÍTULO 4 ============
CHAPTER_4 = [
    body_lead("Copywriting é 80% do que separa um criador que converte de um que só posta. IA é uma máquina de copywriting — se bem orquestrada. Vamos do headline ao CTA, do email ao Reels, dominando o uso de IA para texto persuasivo."),
    h2("Frameworks de copy que IA domina"),
    body("Existem 5 frameworks clássicos que toda IA já entende. Use-os por nome no prompt e veja a qualidade subir:"),
    numbered_list([
        "<b>AIDA</b> — Atenção, Interesse, Desejo, Ação. Bom para anúncios e páginas de venda.",
        "<b>PAS</b> — Problema, Agitação, Solução. Bom para Reels de conscientização.",
        "<b>BAB</b> — Before, After, Bridge. Bom para Stories e posts de transformação.",
        "<b>FAB</b> — Features, Advantages, Benefits. Bom para fichas de produto.",
        "<b>4 Ps</b> — Promise, Picture, Proof, Push. Bom para email marketing.",
    ]),
    h3("Exemplo: prompt usando PAS para Reels"),
    callout("Prompt: Reels PAS sobre procrastinação",
        "Escreva um roteiro de Reels de 30s usando o framework PAS (Problema, Agitação, Solução) sobre procrastinação em criadores de conteúdo.<br/><br/>"
        "Problema (0-8s): descreva a dor de abrir Instagram \"só pra checar\" e perder 2h.<br/>"
        "Agitação (8-18s): mostre como isso acumula — 2h/dia × 30 dias = 60h/mês perdidas.<br/>"
        "Solução (18-30s): técnica de bloco de 25 min (Pomodoro invertido) + CTA \"comenta FOCO que te mando o template\".<br/><br/>"
        "Tom: direto, sem pena. Audiência: criadores 25-35."
    ),
    h2("Gerando headlines que param o scroll"),
    body("Headline é 80% do sucesso de um post. IA gera 20 headlines em 10 segundos. Mas a maioria é genérica. Segredo: peça por <b>tipos</b> específicos:"),
    bullet_list([
        "<b>How-to:</b> \"Como X em Y dias sem Z\".",
        "<b>List:</b> \"7 erros que custam R$ X por mês\".",
        "<b>Stat shock:</b> \"87% dos criadores perdem dinheiro fazendo X\".",
        "<b>Question:</b> \"Você está cometendo esse erro de X?\"",
        "<b>Contrarian:</b> \"Por que NÃO fazer X é o melhor investimento de 2024\".",
        "<b>Story:</b> \"Eu perdi R$ 50k fazendo X — aprenda com meu erro\".",
    ]),
    h3("Prompt para gerar 20 headlines variados"),
    callout("Prompt: 20 headlines para Reels sobre IA",
        "Gere 20 headlines para Reels sobre \"IA para criadores de conteúdo\". Distribua nos 6 tipos:<br/>"
        "1. How-to (3 variações)<br/>"
        "2. List (3)<br/>"
        "3. Stat shock (3)<br/>"
        "4. Question (3)<br/>"
        "5. Contrarian (4)<br/>"
        "6. Story (4)<br/><br/>"
        "Máximo 9 palavras por headline. Sem emojis. Sem pontuação final. Português brasileiro."
    ),
    h2("CTA que converte (e não parece venda)"),
    body("CTA é onde a maioria dos criadores erra. Ou é agressivo demais (\"compra agora!!!\") ou é fraco demais (\"curti se gostou\"). A IA pode gerar CTAs em 3 níveis:"),
    data_table(
        ["Nível", "Tipo de CTA", "Exemplo", "Conversão esperada"],
        [
            ["Suave", "Engajamento", "\"Salva pra rever depois\"", "5-8%"],
            ["Médio", "Lead capture", "\"Comenta IA que te mando o passo a passo\"", "3-5%"],
            ["Forte", "Venda direta", "\"Link na bio com 50% off só hoje\"", "1-2%"],
        ],
    ),
    body("Use 80% de CTA suave, 15% médio, 5% forte. Seu canal não pode virar vitrine. Mas também não pode virar blog grátis."),
    h2("Erros comuns em copy com IA"),
    bullet_list([
        "<b>Aceitar adjetivos vazios:</b> \"incrível\", \"revolucionário\", \"transformador\" — IA ama. Cancele todos.",
        "<b>Não dar voz à marca:</b> IA soa genérica. Cole 5 posts seus anteriores no prompt como referência de tom.",
        "<b>Esquecer do público:</b> \"para iniciantes\" é diferente de \"para 7-figuras\". Especifique.",
        "<b>Confundir persuasão com manipulação:</b> IA não tem ética. Você tem. Revise claims e promessas.",
    ]),
    callout("Princípio: claro > bonito", "IA tende a gerar texto floreado. Corte 30% dos adjetivos. Reader agradece."),
    exercise_box("Gere 20 headlines e escolha 1", [
        "Escolha um tema (ex: \"como crescer no LinkedIn\").",
        "Use o prompt de 20 headlines deste capítulo.",
        "Cole o output. Marque as 3 melhores.",
        "Peça refinamento: \"pegue a #7 e gere 5 variações mais ousadas\".",
        "Teste a variação campeã no próximo Reels. Meça taxa de clique.",
    ]),
]


# ============ CAPÍTULO 5 ============
CHAPTER_5 = [
    body_lead("Sem analytics, IA é caça-níquel. Com analytics, é sistema previsível. Neste capítulo vamos dominar o uso de IA para interpretar dados, encontrar padrões e otimizar conteúdo em escala."),
    h2("O problema dos dashboards nativos"),
    body("Instagram, TikTok, YouTube — todos têm dashboards. Mas você já parou pra ler 12 meses de dados de retention? É insuportável. IA é a camada que transforma dado em insight."),
    body("Em vez de olhar 50 gráficos, você pergunta: \"quais dos meus últimos 30 vídeos tiveram retenção acima de 60% aos 15s, e o que eles têm em comum?\". A IA cruza padrões que levariam horas para identificar manualmente."),
    h2("Como alimentar IA com seus dados"),
    body("Para IA analisar seus dados, você precisa exportá-los. Caminhos:"),
    numbered_list([
        "Export CSV do Meta Business Suite / TikTok Analytics / YouTube Studio.",
        "Cole o CSV no ChatGPT Plus (análise de dados) ou Claude (sem add-ons).",
        "Faça perguntas em linguagem natural: \"qual tema performa melhor?\"",
        "Para análises recorrentes, conecte via API (Zapier + OpenAI).",
    ]),
    h3("Exemplo real — análise de 90 dias de Reels"),
    body("Colei 90 dias de métricas de Reels no Claude. Perguntei: \"identifique os 5 padrões que mais correlacionam com taxa de salvamento acima de 5%\". Output:"),
    bullet_list([
        "Vídeos com gancho em forma de pergunta têm 2.3x mais saves.",
        "Vídeos com legenda grande centralizada têm 1.8x mais saves.",
        "Vídeos de 30s performam melhor que 15s e 60s (em salvamentos).",
        "Vídeos com CTA \"salva pra rever\" geram 4x mais saves que sem CTA.",
        "Vídeos postados terça 19h têm 35% mais saves que segunda 9h.",
    ]),
    body("Em 3 minutos, descobri 5 alavancas. Levaria 3 horas cruzando manualmente no Excel."),
    callout("Dica", "Sempre peça para a IA mostrar a base da conclusão: \"mostre os números\". IA alucina. Dado cru não."),
    h2("Ferramentas de analytics com IA embutida"),
    data_table(
        ["Ferramenta", "Melhor para", "Recurso de IA", "Preço"],
        [
            ["VidIQ", "YouTube", "Score de viralização, sugestões de título", "US$ 10-79"],
            ["Tubebuddy", "YouTube", "A/B testing de thumbnail, tags sugeridas", "US$ 9-99"],
            ["Metricool", "Multiplataforma", "Best time to post, conteúdo trends", "€ 18-110"],
            ["Sprout Social", "Multiplataforma enterprise", "Análise de sentimento, predição", "US$ 249+"],
            ["Notion AI", "Dashboard próprio", "Sumarização, geração de insights", "US$ 10"],
        ],
    ),
    h2("Construindo seu próprio dashboard de IA"),
    body("Ferramentas prontas são ótimas, mas customização é poder. Stack que uso:"),
    numbered_list([
        "Export semanal automático das métricas (Zapier).",
        "Importação para Google Sheets.",
        "Conexão do Sheet ao ChatGPT via API (ou Claude).",
        "Dashboard no Notion com gráficos automáticos.",
        "Relatório semanal gerado por IA enviado pro meu Notion.",
    ]),
    body("Custo total: US$ 30/mês. Insight: sem limite de customização."),
    exercise_box("Faça sua primeira análise com IA", [
        "Export métricas dos últimos 30 Reels do Meta Business Suite.",
        "Cole o CSV no Claude ou ChatGPT Plus.",
        "Pergunte: \"quais padrões correlacionam com taxa de retenção acima de 60%?\"",
        "Peça para mostrar os números base de cada conclusão.",
        "Escolha 1 padrão para testar nos próximos 5 vídeos.",
    ]),
    h2("Métricas que importam (e as que não)"),
    body("IA pode analisar qualquer coisa, mas nem tudo importa. Hierarquia:"),
    bullet_list([
        "<b>Retenção aos 3s:</b> indica força do gancho. Meta: 70%+.",
        "<b>Retenção média:</b> indica qualidade global. Meta: 50%+ em Reels.",
        "<b>Saves:</b> sinal mais forte de valor percebido. Meta: 3%+ das views.",
        "<b>Shares:</b> sinal de conteúdo viralizável. Meta: 2%+ das views.",
        "<b>Comentários com pergunta:</b> indicam engajamento qualificado. Meta: 0.5%+.",
    ]),
    body("Views e likes são métricas de vaidade. Saves, shares e comentários qualificados são métricas de negócio. IA te ajuda a focar nas segundas."),
    h2("Predição de performance com IA"),
    body("Já é possível prever com 70-80% de acurácia se um Reels vai viralizar antes de publicar. Stack que testei:"),
    numbered_list([
        "Subir o vídeo finalizado no VidIQ (YouTube) — dá score de viralização.",
        "Pedir pra Claude analisar o roteiro e prever retenção aos 3s (escala 1-10).",
        "Pedir pra ChatGPT comparar com 5 vídeos virais do mesmo nicho (análise de padrão).",
        "Usar Opus Clip para gerar score de viral potential do vídeo.",
    ]),
    body("Se a predição for baixa, você tem 2 opções: refazer o gancho ou publicar em conta secundária pra teste. Não publique cego em conta principal."),
    callout("Insight de ouro", "Predição de performance não substitui intuição criativa. Mas quando IA + intuição concordam, sua taxa de acerto sobe de 30% para 75%. Use as duas."),
]


# ============ CAPÍTULO 6 ============
CHAPTER_6 = [
    body_lead("Automação é onde o criador passa de artesão para operador. Se você ainda posta manualmente, edita manualmente, agenda manualmente — está perdendo 20+ horas por mês. Este capítulo é sobre construir um fluxo de produção automatizado."),
    illustration_image(ai_workflow_funnel(), 14 * cm),
    caption("Figura 6.1 — Funil de produção com IA: da ideia ao post em ~2 horas (era 8h)."),
    h2("Mapa do fluxo de produção"),
    body("Fluxo completo que uso, do conceito à publicação em 4 plataformas:"),
    numbered_list([
        "<b>Ideação (10 min):</b> ChatGPT gera 20 ideias. Escolho 5. Salvo no Notion.",
        "<b>Roteiro (15 min):</b> Claude escreve 3 variações por ideia. Escolho 1.",
        "<b>Gravação (30 min):</b> Teleprompter (CapCut). 5 vídeos em 1 sessão.",
        "<b>Edição (35 min por vídeo):</b> Descript + CapCut conforme capítulo 3.",
        "<b>Agendamento (10 min):</b> Metricool agenda para IG, TikTok, YouTube Shorts, LinkedIn.",
        "<b>Analytics (5 min/dia):</b> Dashboard Notion com métricas-chave.",
    ]),
    body("Total: ~3 horas por 5 vídeos. Antes: ~10 horas. Ganho: 70%."),
    h2("Automações com Zapier"),
    body("Zapier conecta ferramentas que não conversam entre si. Automações que recomendo:"),
    bullet_list([
        "<b>Notion → Metricool:</b> ao marcar vídeo como \"pronto\", agenda automaticamente.",
        "<b>Gmail → Notion:</b> emails com anexo de vídeo viram card no Notion.",
        "<b>YouTube → Slack:</b> novo comentário com pergunta vai pro canal de suporte.",
        "<b>IG Comments → Sheets:</b> todos os comentários vão pra planilha para análise.",
        "<b>Semana → ChatGPT → Notion:</b> toda sexta, IA resume a semana e envia relatório.",
    ]),
    h3("Custo de automação"),
    body("Zapier Pro: US$ 20/mês. Paga-se em 1 hora economizada. Cada automação economiza em média 30 min/semana. 5 automações = 2.5h/semana = 10h/mês = R$ 500+ de hora produtiva."),
    callout("Comece pequeno", "Não tente automatizar tudo de uma vez. Escolha 1 tarefa repetitiva, automatize, teste por 30 dias. Só então adicione a próxima."),
    h2("Templates de produção"),
    body("Documente seu fluxo em templates. Para cada tipo de conteúdo:"),
    bullet_list([
        "<b>Template Reels educativo:</b> gancho + 3 dicas + CTA salvar.",
        "<b>Template Reels storytelling:</b> gancho + conflito + virada + resolução.",
        "<b>Template Reels behind-the-scenes:</b> gancho + bastidor + aprendizado + CTA seguir.",
        "<b>Template Reels list:</b> gancho + 5 itens rápidos + CTA comentar.",
        "<b>Template Reels case:</b> gancho + cliente + resultado + método + CTA DM.",
    ]),
    body("Cada template tem prompt correspondente no ChatGPT. Resultado: posso produzir Reels de qualquer tipo em 30 min, sem pensar em estrutura."),
    exercise_box("Monte seu fluxo", [
        "Liste todas as tarefas que você faz para produzir 1 vídeo (do conceito à publicação).",
        "Marque quais podem ser automatizadas com IA/Zapier.",
        "Escolha 1 para automatizar esta semana.",
        "Documente o fluxo em um template (Notion/Docs).",
        "Após 30 dias, meça tempo economizado.",
    ]),
    h2("Erros de automação"),
    bullet_list([
        "<b>Automatizar antes de dominar manual:</b> se você não sabe editar, não delegue pra IA. Você não vai saber revisar.",
        "<b>Postar automaticamente sem revisão:</b> sempre tenha humano no gate antes da publicação.",
        "<b>Ignorar variações de plataforma:</b> Reels ≠ TikTok ≠ Shorts. Customize.",
        "<b>Esquecer backup:</b> se Zapier quebra, tem fallback manual?",
    ]),
    h2("Indicadores de que seu fluxo está maduro"),
    body("Como saber se sua automação está no ponto certo? Sinais de maturidade:"),
    bullet_list([
        "<b>Tempo de produção caiu 50%+:</b> antes você gastava X horas por vídeo, agora gasta X/2 ou menos.",
        "<b>Consegue produzir 3x mais:</b> no mesmo tempo, você entrega triplo de conteúdo.",
        "<b>Consegue tirar 1 semana de férias:</b> conteúdo continua saindo porque está agendado.",
        "<b>Métricas não caíram:</b> a qualidade do conteúdo não diminuiu com a automação.",
        "<b>Você revisa, não cria do zero:</b> 80% do seu trabalho é revisão editorial, não produção bruta.",
    ]),
    body("Se você marcou 4 ou 5 sinais, parabéns — seu fluxo está maduro. Se marcou 2 ou menos, ainda há muito a automatizar. Volte ao capítulo 6 e identifique o próximo gargalo."),
]


# ============ CAPÍTULO 7 ============
CHAPTER_7 = [
    body_lead("ChatGPT, Gemini, Claude — qual usar? Depende. Neste capítulo, vamos destrinchar os 3 principais LLMs de 2024 para identificar qual é o melhor para cada tarefa de criação de conteúdo."),
    illustration_image(llm_comparison_chart(), 14 * cm),
    caption("Figura 7.1 — Comparativo de performance dos 3 LLMs em 6 tarefas típicas de criadores."),
    h2("ChatGPT (GPT-4o)"),
    body("O mais conhecido. Pontos fortes:"),
    bullet_list([
        "Melhor ecossistema (plugins, GPTs custom, vision, voice).",
        "Análise de dados robusta (cole CSV, peça gráficos).",
        "Voice mode no app mobile — útil para brainstorming em trânsito.",
        "GPTs customizados: crie seu \"roteirista\" uma vez, reuse sempre.",
    ]),
    body("Pontos fracos:"),
    bullet_list([
        "Texto às vezes genérico, com adjetivos vazios.",
        "Mais caro: US$ 20/mês para Plus.",
        "Tendência a ser evasivo em temas sensíveis.",
        "Contexto: 128k tokens (ótimo, mas Claude tem 200k).",
    ]),
    h2("Gemini 1.5 Pro"),
    body("O da Google. Pontos fortes:"),
    bullet_list([
        "Integração nativa com Google Workspace (Docs, Sheets, Gmail, Drive).",
        "Contexto gigante: 1M+ tokens (cole 5 livros de uma vez).",
        "Multimodal forte: entende vídeo nativamente (YouTube, por ex).",
        "Plano grátis generoso para tarefas básicas.",
    ]),
    body("Pontos fracos:"),
    bullet_list([
        "Output às vezes menos criativo que Claude/ChatGPT.",
        "Alucinação em português ainda maior que GPT-4o.",
        "Customização inferior (sem GPTs equivalentes).",
    ]),
    h2("Claude 3.5 Sonnet"),
    body("O da Anthropic. Meu favorito para escrita. Pontos fortes:"),
    bullet_list([
        "Melhor escrita criativa — tom mais natural, menos clichês.",
        "Raciocínio lógico superior (provas, problemas complexos).",
        "Artifacts: gera e preview documentos no chat.",
        "Contexto: 200k tokens.",
    ]),
    body("Pontos fracos:"),
    bullet_list([
        "Sem análise de dados avançada (não gera gráficos).",
        "Sem voice mode nativo.",
        "Sem GPTs custom equivalentes (Projects é bom, mas diferente).",
        "Sem integração com imagem (apenas texto + upload).",
    ]),
    h2("Qual usar para cada tarefa?"),
    data_table(
        ["Tarefa", "Melhor LLM", "Por quê"],
        [
            ["Roteiro criativo", "Claude 3.5", "Escrita mais natural, menos clichês"],
            ["Análise de dados", "ChatGPT Plus", "Gera gráficos, código, exporta"],
            ["Brainstorm", "ChatGPT (voice)", "Conversa fluida, GPTs custom"],
            ["Longo contexto", "Gemini 1.5", "1M tokens, vídeo nativo"],
            ["Copywriting", "Claude 3.5", "Tom premium, controle fino"],
            ["Código", "Claude 3.5 / GPT-4o", "Empate técnico"],
            ["Raciocínio", "Claude 3.5", "Melhor em provas lógicas"],
            ["Multimodal", "Gemini / GPT-4o", "Vision + vídeo nativo"],
        ],
    ),
    callout("Stack ideal", "Tenha os 3. Custo total: ~US$ 60/mês. Economiza 20+ horas. Vale cada centavo. Use o Claude pra escrita, ChatGPT pra dados, Gemini pra contexto longo."),
    h2("Teste cego — você consegue distinguir?"),
    body("Fiz um teste: pedi o mesmo prompt (\"roteiro de Reels sobre IA\") nos 3. Pedi para 50 seguidores avaliarem qual era melhor, sem saber qual era qual. Resultado:"),
    bullet_list([
        "<b>Claude:</b> escolhido por 52% como melhor. \"Mais natural\", \"menos robótico\".",
        "<b>ChatGPT:</b> 28%. \"Mais estruturado\", \"mas parece IA\".",
        "<b>Gemini:</b> 20%. \"Bom, mas genérico\".",
    ]),
    body("Para escrita de roteiro, Claude ganha. Para análise, ChatGPT. Para contexto, Gemini. Escolha conforme tarefa."),
    exercise_box("Faça seu próprio teste cego", [
        "Escolha 1 prompt (ex: \"roteiro de Reels sobre produtividade\").",
        "Rode nos 3 LLMs (Claude 3.5, ChatGPT GPT-4o, Gemini 1.5).",
        "Cole os 3 outputs sem identificação em uma enquete.",
        "Peça para 10+ seguidores votarem.",
        "Compare com suas próprias impressões. Surpresas?",
    ]),
]


# ============ CAPÍTULO 8 ============
CHAPTER_8 = [
    body_lead("Thumbnail é 70% da decisão de clique. E é a tarefa mais subestimada por criadores. IA pode gerar, otimizar e testar thumbnails em escala. Mas precisa de direção humana."),
    h2("Os 4 elementos de uma thumbnail premium"),
    body("Toda thumbnail que converte tem:"),
    numbered_list([
        "<b>Rosto com emoção:</b> expressão exagerada (surpresa, dúvida, choque).",
        "<b>Texto curto:</b> máximo 4 palavras. Letra grande, contraste alto.",
        "<b>Contraste de cor:</b> fundo X objeto principal. Não use azul sobre azul.",
        "<b>Setas/círculos:</b> guiam o olhar. Use 1, no máximo 2.",
    ]),
    h2("IA para gerar thumbnails"),
    body("Três caminhos:"),
    h3("1. Midjourney + Photoshop"),
    body("Gero base no Midjourney com prompt específico: \"YouTube thumbnail style, [tema], dramatic lighting, bold colors, high contrast, no text, leave space for text top-left\". Depois texto no Photoshop. Custo: US$ 30/mês. Tempo: 10 min por thumbnail."),
    h3("2. Ideogram"),
    body("Especializado em gerar imagens com texto embutido. Prompt: \"YouTube thumbnail with bold text 'PERDEU R$ 50K', young man shocked expression, money background, red arrow pointing to text\". Output já vem com texto legível. Custo: US$ 8/mês. Tempo: 5 min."),
    h3("3. Thumbnail.ai / Opus Clip"),
    body("Ferramentas específicas para thumbnail. Você sobe o vídeo, ela sugere frame + texto. Custo: US$ 15-30/mês. Tempo: 2 min. Qualidade: média — revise."),
    h2("A/B testing de thumbnails"),
    body("YouTube Studio permite testar thumbnails desde 2024. Faça sempre. Workflow:"),
    numbered_list([
        "Gere 3 thumbnails diferentes com IA.",
        "Suba as 3 no YouTube Studio como variants.",
        "Deixe rodar por 7 dias (mínimo 1k impressions cada).",
        "YouTube mostra a vencedora automaticamente.",
    ]),
    body("Em média, a thumbnail campeã gera 30-50% mais cliques que a perdedora. Em canal de 100k subs, isso é diferença entre 5k e 7.5k views por vídeo."),
    callout("Métrica que importa", "CTR (Click-Through Rate) é a métrica nº 1 de thumbnail. Meta: 8-12% no YouTube. Abaixo de 5%, troque a thumbnail."),
    h2("Erros comuns em thumbnails"),
    bullet_list([
        "<b>Texto demais:</b> mais de 5 palavras = ruído. Corte pela metade.",
        "<b>Rosto sem emoção:</b> expressão neutra não para o scroll. Exagere.",
        "<b>Cores monotônicas:</b> fundo e sujeito na mesma paleta somem. Use complementares.",
        "<b>Ignorar mobile:</b> thumbnail é vista em 2cm² no celular. Teste pequena.",
        "<b>Copiar template saturado:</b> seta vermelha + círculo amarelo já são clichê. Inove.",
    ]),
    exercise_box("Gere 3 thumbnails para seu próximo vídeo", [
        "Escolha 1 vídeo que você vai postar esta semana.",
        "Use Ideogram ou Midjourney para gerar 3 thumbnails diferentes.",
        "Garanta que cada uma tenha: rosto + texto + contraste + 1 elemento guia.",
        "Suba as 3 no YouTube Studio como A/B test.",
        "Após 7 dias, veja a campeã. Aplique o padrão nos próximos 5 vídeos.",
    ]),
]


# ============ CAPÍTULO 9 ============
CHAPTER_9 = [
    body_lead("SEO não é mais palavra-chave stuffing. Em 2024, SEO é intenção + entidade + E-E-A-T (Experience, Expertise, Authoritativeness, Trust). IA é a sua aliada em todas as etapas, mas pode te punir se usada pra escalar conteúdo raso."),
    h2("O novo SEO: intenção > palavra-chave"),
    body("Google não ranqueia mais por \"quantas vezes a palavra X aparece\". Ranqueia por \"quanto esse conteúdo resolve a intenção de busca\". IA é perfeita pra isso — ela entende intenção."),
    h3("Framework de SEO com IA"),
    numbered_list([
        "<b>Pesquisar intenção:</b> use Perplexity para entender o que as pessoas querem quando buscam o termo.",
        "<b>Estruturar conteúdo:</b> peça pra IA montar H1/H2/H3 baseado em People Also Ask.",
        "<b>Escrever com profundidade:</b> cada seção deve ter 200+ palavras de conteúdo útil.",
        "<b>Adicionar E-E-A-T:</b> inclua experiência pessoal, dados, cases. IA não tem experiência — você tem.",
        "<b>Atualizar:</b> a cada 90 dias, peça pra IA revisar e sugerir atualizações.",
    ]),
    h2("Prompt para artigo SEO de 2000 palavras"),
    callout("Prompt: artigo SEO sobre 'IA para criadores'",
        "Escreva um artigo de 2000 palavras sobre \"IA para criadores de conteúdo\".<br/><br/>"
        "Keyword primária: \"IA para criadores\".<br/>"
        "Keywords secundárias: ferramentas IA criadores, prompts para conteúdo, ChatGPT para criadores.<br/><br/>"
        "Estrutura:<br/>"
        "H1: Guia completo de IA para criadores de conteúdo (2024)<br/>"
        "H2: Por que criadores precisam de IA<br/>"
        "H2: Stack de ferramentas de IA<br/>"
        "H3: Ideação<br/>"
        "H3: Produção<br/>"
        "H3: Edição<br/>"
        "H3: Analytics<br/>"
        "H2: Como usar IA sem perder autenticidade<br/>"
        "H2: FAQ (5 perguntas de People Also Ask)<br/><br/>"
        "Tom: técnico mas acessível. Inclua dados. Cite fontes. Sem clichês."
    ),
    h2("Ferramentas de SEO com IA"),
    data_table(
        ["Ferramenta", "Função", "Preço", "Nota"],
        [
            ["Surfer SEO", "Otimização on-page", "US$ 89+", "Caro, mas eficaz"],
            ["Frase", "Briefing + escrita", "US$ 45+", "Bom custo-benefício"],
            ["Ahrefs", "Pesquisa de keyword", "US$ 99+", "Padrão ouro"],
            ["Semrush", "All-in-one", "US$ 130+", "Robusto"],
            ["Perplexity", "Pesquisa com IA", "US$ 20", "Imprescindível"],
        ],
    ),
    h2("Google Helpful Content e IA"),
    body("Em 2024, Google atualizou o Helpful Content para penalizar conteúdo \"feito para escalar\" e não \"feito para ajudar\". Sinais de penalização:"),
    bullet_list([
        "Conteúdo genérico que poderia ser sobre qualquer site.",
        "Falta de primeira pessoa (\"eu\", \"minha experiência\").",
        "Ausência de dados, cases ou exemplos concretos.",
        "Padrão repetitivo em múltiplos artigos.",
        "Tópicos fora da expertise do autor.",
    ]),
    callout("Regra de ouro", "Use IA pra escalar volume, mas adicione 30% de toque humano (experiência, opinião, dados próprios). Sem esse 30%, você vai ser penalizado."),
    exercise_box("Otimize 1 artigo para SEO", [
        "Escolha 1 artigo do seu blog.",
        "Pesquise a keyword no Perplexity: \"qual a intenção de busca para [keyword]?\"",
        "Peça pra IA reescrever com base nas PAA (People Also Ask).",
        "Adicione 1 parágrafo com experiência pessoal.",
        "Adicione 1 dado estatístico com fonte.",
        "Publique. Acompanhe posição no Google por 30 dias.",
    ]),
]


# ============ CAPÍTULO 10 ============
CHAPTER_10 = [
    body_lead("IA é poder. Poder sem ética é arma. Este capítulo não é sobre moralismo — é sobre longevidade. Criadores que usam IA sem ética ganham 90 dias e perdem 5 anos. Vamos aos princípios que sustentam uma carreira."),
    illustration_image(ai_ethics_radar(), 13 * cm),
    caption("Figura 10.1 — Dimensões éticas no uso de IA: o ideal vs a prática real."),
    h2("Os 5 princípios éticos para criadores"),
    numbered_list([
        "<b>Transparência:</b> declare quando conteúdo é gerado ou significativamente modificado por IA.",
        "<b>Attribuição:</b> cite fontes. IA não é fonte — ela é veículo. A fonte original merece crédito.",
        "<b>Originalidade:</b> não use IA para copiar estilo de outro criador sem consentimento.",
        "<b>Consentimento:</b> não clone voz, face ou estilo de terceiros sem permissão explícita.",
        "<b>Veracidade:</b> IA alucina. Verifique fatos, números, datas antes de publicar.",
    ]),
    h2("Transparência: o que declarar e o que não"),
    body("Regra prática que adoto:"),
    bullet_list([
        "<b>Declarar:</b> imagem 100% gerada por IA. Áudio clonado. Texto principal gerado por IA sem edição humana.",
        "<b>Não precisar declarar:</b> IA usada para brainstorm, esboço, revisão. Você reescreveu.",
        "<b>Cinza:</b> IA gerou, você editou pesado. Recomendo declarar: \"texto com assistência de IA\".",
    ]),
    callout("Plataformas exigem", "Instagram, TikTok e YouTube já têm labels de \"AI-generated\". Em 2025, não declarar = risco de remoção. Antecipe-se."),
    h2("Plágio, vieses e alucinação"),
    h3("Plágio"),
    body("IA aprende com conteúdo existente. Pode reproduzir trechos quase idênticos. Sempre rode o output por detector de plágio (Copyleaks, Originality.ai). Custo: US$ 10-20/mês. Vale."),
    h3("Vieses"),
    body("IA reproduz vieses do treinamento. Pode gerar conteúdo racista, sexista, etnocêntrico. Sempre revise com lente crítica. Principalmente em temas sensíveis: gênero, raça, política, religião."),
    h3("Alucinação"),
    body("IA inventa fatos. Pode citar livros que não existem, dados falsos, citações erradas. <b>Verifique tudo</b> que é factual. Use Perplexity para confirmar facts — ela cita fontes."),
    h2("Casos reais que deram errado"),
    body("Três casos públicos de criadores que se queimaram com IA:"),
    bullet_list([
        "<b>Caso 1:</b> influenciador publicou imagem 100% IA sem declarar. Seguidores perceberam. Perdeu 30% de engajamento em 30 dias.",
        "<b>Caso 2:</b> criador usou IA pra escrever artigo. IA citou estudo inexistente. Foi exposto. Perdeu parceira com marca.",
        "<b>Caso 3:</b> clone de voz de celebridade sem consentimento. Processo judicial. Indenização.",
    ]),
    h2("Checklist ético antes de publicar"),
    exercise_box("Antes de postar, pergunte:", [
        "Declarei uso de IA quando significativo?",
        "Verifiquei fatos, números e citações?",
        "Rodei detector de plágio?",
        "Tenho consentimento pra usar vozes/faces/estilos alheios?",
        "Estou confortável se esse conteúdo for pra imprensa amanhã?",
    ]),
]


# ============ CAPÍTULO 11 ============
CHAPTER_11 = [
    body_lead("Teoria sem caso é religião. Vamos destrinchar 4 casos reais de criadores que usaram IA para escalar produção, com números reais, erros reais, aprendizados reais."),
    h2("Caso 1 — Canal de finanças: 30 Reels/mês sem equipe"),
    body("Criador de finanças, 45k no Instagram. Antes: 4 Reels/mês, produção solo, 12 horas por Reels. Stack antigo: anotações + gravação + edição manual no Premiere."),
    h3("Stack novo (após 90 dias de implantação)"),
    bullet_list([
        "Claude 3.5 Pro para roteiro (US$ 20/mês).",
        "CapCut Pro para edição (R$ 32/mês).",
        "Opus Clip para repurpose de lives (US$ 19/mês).",
        "Metricool para agendamento (€ 18/mês).",
    ]),
    body("Custo total: ~R$ 200/mês. Resultado após 90 dias:"),
    bullet_list([
        "Produção: 30 Reels/mês (7.5x aumento).",
        "Tempo por Reels: 1h (era 12h).",
        "Seguidores: 45k → 78k (+73%).",
        "Receita de publicidade: R$ 0 → R$ 4.500/mês.",
        "Receita de mentoria: R$ 2k → R$ 12k/mês.",
    ]),
    callout("ROI", "Investimento: R$ 200/mês. Retorno adicional: R$ 14.500/mês. ROI: 7.150%. Stack certo vence talento solo."),
    h2("Caso 2 — YouTuber de tech: de 50k pra 250k subs"),
    body("YouTuber de tech, 50k subs. Antes: 2 vídeos longos/mês, edição manual, 40h por vídeo. Stack novo:"),
    bullet_list([
        "ChatGPT Plus para roteiro + thumbnail ideation (US$ 20).",
        "Descript para edição por texto (US$ 24).",
        "Opus Clip para cortar Shorts dos vídeos longos (US$ 19).",
        "VidIQ para SEO e títulos (US$ 10).",
    ]),
    body("Resultado em 6 meses:"),
    bullet_list([
        "Vídeos longos: 2/mês → 4/mês.",
        "Shorts: 0/mês → 20/mês (gerados dos longos).",
        "Tempo de edição: 40h → 12h por vídeo longo.",
        "Subs: 50k → 250k (+400%).",
        "Receita Adsense: US$ 800/mês → US$ 4.500/mês.",
    ]),
    h2("Caso 3 — Micro-influencer lifestyle: 8k seguidores, R$ 15k/mês"),
    body("Micro-influencer lifestyle, 8k seguidores. Antes: postava esporadicamente, sem estratégia, sem marca. Stack novo:"),
    bullet_list([
        "Claude para copywriting e planejamento editorial.",
        "CapCut para edição.",
        "Notion AI para gestão de conteúdo e CRM de marcas.",
    ]),
    body("Resultado em 90 dias:"),
    bullet_list([
        "Posts/semana: 2 → 7.",
        "Seguidores: 8k → 12k (+50%).",
        "Marcas parceiras: 1 → 6.",
        "Receita média por parceria: R$ 800 → R$ 2.500.",
        "Receita total mensal: R$ 800 → R$ 15.000.",
    ]),
    callout("Lição", "Não precisa de audiência gigante. Precisa de consistência + sistema. 8k seguidores com stack bem desenhado = R$ 15k/mês."),
    h2("Caso 4 — Agência de conteúdo: escalando 10 clientes"),
    body("Agência com 10 clientes de conteúdo. Antes: 6 funcionários, 40h/cliente/mês. Stack novo:"),
    bullet_list([
        "Claude + ChatGPT para roteiro de todos os clientes.",
        "Descript + Opus Clip para edição em escala.",
        "Zapier para automação de agendamento.",
        "Notion AI para gestão de projetos.",
    ]),
    body("Resultado em 6 meses:"),
    bullet_list([
        "Funcionários: 6 → 4 (reduziu 2 editores).",
        "Horas/cliente/mês: 40h → 15h.",
        "Clientes: 10 → 18 (capacidade aumentou).",
        "Margem de lucro: 22% → 47%.",
        "Receita: R$ 80k → R$ 144k/mês.",
    ]),
    h2("Caso 5 — Criador de curso digital: 1 produto, 5 idiomas"),
    body("Criador de curso de produtividade, faturamento de R$ 80k/mês apenas em PT-BR. Stack novo para internacionalização:"),
    bullet_list([
        "Claude para tradução de scripts e materiais.",
        "ElevenLabs para dublagem preservando a voz original.",
        "HeyGen para lip-sync automático em 5 idiomas.",
        "ChatGPT para adaptação cultural de exemplos.",
    ]),
    body("Resultado em 90 dias:"),
    bullet_list([
        "Idiomas atendidos: 1 → 5 (PT, EN, ES, FR, IT).",
        "Custo de tradução/dublagem: R$ 0 (era R$ 30k/produto).",
        "Faturamento: R$ 80k → R$ 230k/mês (+187%).",
        "Margem: 65% → 81% (custo de produção diluído).",
        "Tempo de lançamento em novo idioma: 60 dias → 5 dias.",
    ]),
    callout("Lição do caso 5", "IA não substitui criador — multiplica mercados. 1 produto virou 5. 1 audiência virou 5. Mesma autoria, escala exponencial."),
    h2("Padrões comuns a todos os casos"),
    body("Após analisar os 5 casos, identifiquei 5 padrões comuns que explicam o sucesso:"),
    numbered_list([
        "<b>Stack enxuto:</b> todos usam 3-5 ferramentas, não 15. Foco em domínio.",
        "<b>Workflow documentado:</b> todos têm templates e SOPs. Não improvisam.",
        "<b>Iteração semanal:</b> todos revisam métricas toda semana e ajustam.",
        "<b>Especialização humana:</b> humanos focam em editorial e brand. IA faz o resto.",
        "<b>Investimento em tooling:</b> todos gastam 3-8% da receita em ferramentas. Não economizam aqui.",
    ]),
    exercise_box("Estude seu próprio caso", [
        "Anote suas métricas atuais: posts/mês, tempo por post, seguidores, receita.",
        "Identifique 1 stack de IA que você ainda não usa.",
        "Implemente nos próximos 30 dias.",
        "Refaça as métricas em 90 dias. Compare.",
        "Documente o caso. Pode virar future prova social.",
    ]),
]


# ============ CAPÍTULO 12 ============
CHAPTER_12 = [
    body_lead("Onde a IA de criadores está em 2024 é passado. Vamos olhar pra frente: as 5 tendências que vão remodelar criação de conteúdo nos próximos 24 meses. E como se posicionar pra surfar, não pra se afogar."),
    h2("Tendência 1 — Agentes autônomos"),
    body("Em 2024, IA é assistente: você pede, ela faz. Em 2025-26, IA será agente: ela define, executa, itera. Exemplos que já pipocam:"),
    bullet_list([
        "Agentes que monitoram trends em tempo real e te avisam o que postar.",
        "Agentes que publicam sozinhos em horário ótimo, sem você aprovar.",
        "Agentes que respondem comentários com sua voz (literal).",
        "Agentes que fecham deals com marcas — negociação automatizada.",
    ]),
    body("Risco: criador vira supervisor de agentes, perde autoria. Oportunidade: criador vira diretor, escala 10x."),
    h2("Tendência 2 — Vídeo generativo nativo"),
    body("Sora (OpenAI), Veo (Google), Runway Gen-3 — já geram vídeo coerente de 10-60s. Impactos:"),
    bullet_list([
        "B-roll ilimitado a custo zero.",
        "Criação de conteúdo sem câmera (você narra, IA gera visual).",
        "Avatares hiper-realistas que substituem gravação ao vivo.",
        "Customização em massa (1 vídeo, 100 variações de avatar/idioma).",
    ]),
    callout("Previsão", "Em 24 meses, 30% dos Reels patrocinados serão 100% gerados por IA. Criador que não dominar essa tecnologia vai perder deals para quem domina."),
    h2("Tendência 3 — Personalização em massa"),
    body("Hoje: 1 Reels pra todos. Amanhã: 1 Reels adaptado pra cada segmento. IA gera 50 versões do mesmo vídeo com:")
,
    bullet_list([
        "Avatar diferente por nicho (mães, jovens, empresariais).",
        "Script ajustado por interesse.",
        "Idioma nativo (não dublagem — geração nativa).",
        "CTA personalizado por estágio de funil.",
    ]),
    body("Plataformas vão exibir a versão certa pra cada viewer. Criador vence por conversão, não por views."),
    h2("Tendência 4 — Voice cloning mainstream"),
    body("ElevenLabs e similares já clonam voz com 3 minutos de áudio. Impactos:"),
    bullet_list([
        "Criador grava 1 vez, gera 1000 vídeos em sua voz.",
        "Tradução automática preservando voz original.",
        "Podcasts póstumos (voz clonada lê scripts novos).",
        "Risco: deepfakes. Regulação chegando forte.",
    ]),
    h2("Tendência 5 — Search generativo"),
    body("Google AI Overviews, ChatGPT Search, Perplexity — busca não é mais lista de links. É resposta direta. Impactos em SEO:"),
    bullet_list([
        "Tráfego de sites vai cair 30-50% (resumo no próprio search).",
        "Conteúdo que responde direto vence. Conteúdo \"pro SEO\" perde.",
        "Marcas precisam aparecer dentro das respostas da IA — não como link.",
        "Estratégia: otimize para ser citado pela IA, não para ranquear.",
    ]),
    h2("Como se preparar"),
    numbered_list([
        "Domine 1 LLM profundo (Claude ou ChatGPT). Não use só pra copy — use pra análise.",
        "Experimente vídeo generativo (Runway, Veo quando disponível). Crie 5 vídeos por mês só pra treinar.",
        "Clone sua voz (ElevenLabs). Teste dublar 1 vídeo em inglês.",
        "Otimize conteúdo pra ser citado por IA (responder perguntas diretas).",
        "Construa marca pessoal forte — IA cita marcas, não anônimos.",
    ]),
    exercise_box("Plano de adaptação 2025", [
        "Identifique 2 tendências que mais ameaçam seu modelo atual.",
        "Escolha 1 para experimentar este mês (ex: vídeo generativo).",
        "Reserve 4h/semana para testes — trate como P&D.",
        "Em 90 dias, avalie: o que vale manter?",
        "Em 180 dias, tenha 1 produto/serviço novo baseado na tendência.",
    ]),
    callout("Visão de longo prazo", "Criador que apenas reage à IA perde. Criador que antecipa, ganha. Os próximos 24 meses vão separar quem é hobby de quem é profissão."),
]


# ============ APÊNDICE ============
APPENDIX = [
    body_lead("Recursos práticos para colar no seu Notion e usar diariamente."),
    h2("Biblioteca de prompts essenciais (10 prompts prontos)"),
    h3("1. Roteiro de Reels (30s)"),
    callout("Prompt", "Você é um roteirista sênior de Reels. Escreva 1 roteiro de 30s sobre [TEMA].<br/>Estrutura: gancho 0-3s, contexto 3-10s, técnica 10-22s, CTA 22-30s.<br/>Tom: direto, técnico. Audiência: [PÚBLICO]. Sem emojis. Sem adjetivos vazios.<br/>Devolva em formato: [tempo] texto."),
    h3("2. Headlines (20 variações)"),
    callout("Prompt", "Gere 20 headlines para [TEMA]. Distribua: 4 how-to, 4 list, 4 stat shock, 4 question, 4 contrarian.<br/>Máximo 9 palavras. Sem emojis. Português brasileiro."),
    h3("3. Análise de métricas"),
    callout("Prompt", "Analise o CSV de métricas dos meus últimos 30 Reels (anexado).<br/>Identifique: (1) 5 padrões que mais correlacionam com taxa de salvamento >5%, (2) 3 padrões que mais prejudicam retenção aos 3s, (3) melhor horário/dia pra postar.<br/>Mostre os números base de cada conclusão."),
    h3("4. Repurpose de vídeo longo"),
    callout("Prompt", "Aqui está a transcrição de um vídeo de 30min sobre [TEMA]: [TRANSCRIÇÃO].<br/>Identifique 8 momentos que rendem Reels de 30-60s. Para cada: (1) timestamp, (2) gancho sugerido, (3) CTA sugerido, (4) título para legenda."),
    h3("5. Bio de Instagram"),
    callout("Prompt", "Escreva 5 variações de bio de Instagram para um criador de [NICHO] que entrega [VALOR] para [PÚBLICO].<br/>Máximo 150 caracteres cada. Inclua 1 CTA e 1 credencial."),
    h3("6. Email de vendas"),
    callout("Prompt", "Escreva um email de vendas para [PRODUTO] usando o framework 4 Ps (Promise, Picture, Proof, Push).<br/>Audiência: [PÚBLICO]. Preço: [PREÇO]. Objeção principal: [OBJEÇÃO].<br/>Tamanho: 250 palavras. Subject line + preview + body + P.S."),
    h3("7. Storytelling pessoal"),
    callout("Prompt", "Escreva um roteiro de Reels de 60s sobre uma experiência pessoal minha.<br/>História: [DESCRIÇÃO].<br/>Estrutura: gancho + contexto + conflito + virada + aprendizado + CTA.<br/>Tom: vulnerável, não piegas. Primeira pessoa."),
    h3("8. FAQ para blog"),
    callout("Prompt", "Gere 10 perguntas frequentes sobre [TEMA] que apareçam no Google PAA (People Also Ask).<br/>Para cada pergunta, escreva uma resposta de 50-80 palavras, otimizada para featured snippet.<br/>Tom: técnico, direto. Sem clichês."),
    h3("9. Thumbnail ideation"),
    callout("Prompt", "Gere 5 ideias de thumbnail para um vídeo sobre [TEMA].<br/>Para cada: (1) descrição visual (rostos, objetos, cenário), (2) texto na thumbnail (máx 4 palavras), (3) paleta de cores sugerida, (4) emoção do rosto.<br/>Otimize para CTR mobile."),
    h3("10. Plano editorial mensal"),
    callout("Prompt", "Crie um plano editorial de 30 dias para [NICHO].<br/>Formatos: 20 Reels, 5 carrosséis, 5 stories diários.<br/>Distribua temas em 4 pilares: [PILAR1], [PILAR2], [PILAR3], [PILAR4].<br/>Para cada Reels: título, tipo (gancho), pilar, dia da semana, horário ótimo.<br/>Devolva em formato tabela."),
    h2("Checklist de produção de Reels"),
    exercise_box("Antes de gravar", [
        "Roteiro revisado (não é \"vai fluindo\")?",
        "Gancho testado em voz alta? (1-3s)",
        "CTA definido e único?",
        "Local/Iluminação checados?",
        "Bateria + armazenamento do celular ok?",
        "Teleprompter (CapCut) configurado?",
    ]),
    exercise_box("Durante a gravação", [
        "Grave 3 takes do gancho (escolher depois).",
        "Olhe pra lente, não pra tela.",
        "Mãos ocupadas (segura objeto, anota).",
        "Energia 20% acima do normal.",
        "Pause 2s antes/depois de cada take.",
    ]),
    exercise_box("Na edição", [
        "Corte os 2s iniciais e finais.",
        "Legendas: fonte grande, centralizada, animada.",
        "B-roll: 1 clip a cada 5s.",
        "Som: música baixa + SFX em transições.",
        "Color: 1 LUT + ajuste de exposição.",
        "Export: 1080x1920, 30fps, 8 Mbps.",
    ]),
    h2("Glossário de IA"),
    data_table(
        ["Termo", "Definição prática"],
        [
            ["LLM", "Large Language Model — IA que entende e gera texto. Ex: GPT-4, Claude, Gemini."],
            ["Prompt", "Instrução que você dá pra IA. Equivalente a código de programação."],
            ["Few-shot", "Dar exemplos no prompt pra IA copiar o padrão."],
            ["Hallucination", "Quando IA inventa fato. Sempre verifique números e citações."],
            ["Token", "Unidade de texto (~4 caracteres). Custos de IA são por token."],
            ["Context window", "Quanto texto a IA lembra numa conversa. Claude: 200k tokens."],
            ["Fine-tuning", "Treinar IA com seus dados. Avançado — use RAG antes."],
            ["RAG", "Retrieval-Augmented Generation — IA consulta seus docs antes de responder."],
            ["Multimodal", "IA que entende texto + imagem + áudio + vídeo."],
            ["Agent", "IA que executa múltiplas tarefas autonomamente, em loop."],
        ],
    ),
    h2("Recursos e links"),
    body("Sites, ferramentas e canais que recomendo para continuar aprendendo:"),
    bullet_list([
        "<b>promptingguide.ai</b> — Guia open-source de engenharia de prompts.",
        "<b>platform.openai.com/docs</b> — Documentação oficial da OpenAI.",
        "<b>docs.anthropic.com</b> — Documentação do Claude com exemplos práticos.",
        "<b>huggingface.co/learn</b> — Cursos gratuitos sobre NLP e IA.",
        "<b>ai.google.dev</b> — Documentação do Gemini e tutoriais.",
        "<b>lex.page</b> — Editor de texto com IA integrada.",
        "<b>nano.so</b> — Notion com IA nativa (gratis).",
        "<b>elevenlabs.io</b> — Clonagem e geração de voz com IA.",
        "<b>runwayml.com</b> — Vídeo generativo de alta qualidade.",
        "<b>perplexity.ai</b> — Buscador com IA que cita fontes.",
    ]),
    h2("Templates de Notion"),
    body("Para acelerar sua implementação, crie estes 4 templates no Notion:"),
    h3("1. Banco de ideias"),
    body("Database com colunas: data, ideia, pilar de conteúdo, formato, status, métricas após publicação. Use IA pra gerar 20 ideias/semana e popular o banco."),
    h3("2. Workflow de produção"),
    body("Kanban com colunas: ideia aprovada, roteiro em andamento, gravação agendada, edição, agendado, publicado, métricas. Cada card representa 1 vídeo."),
    h3("3. Biblioteca de prompts"),
    body("Database com colunas: título, categoria, prompt completo, ferramenta (ChatGPT/Claude/Gemini), uso recomendado, taxa de sucesso. Adicione os 10 prompts deste apêndice como semente."),
    h3("4. CRM de marcas"),
    body("Database com colunas: marca, contato, status, valor proposta, follow-up, deliverables, métricas pós-campanha. Use IA pra gerar emails de pitch personalizados."),
    callout("Dica final", "Não tente implementar tudo de uma vez. Comece pelo Banco de Ideias. Em 30 dias, adicione Workflow. Em 60, Biblioteca de Prompts. Em 90, CRM. Sistema gradual vence revolução overnight."),
]


# ============ CONSTRUÇÃO DO E-BOOK ============

def build():
    story = []
    
    # ============ CAPA ============
    story += cover_page(
        title="IA para Criadores de Conteúdo",
        subtitle="As Ferramentas que Vão Escalar Sua Produção",
        eyebrow="E-BOOK PREMIUM",
    )
    
    # ============ SUMÁRIO ============
    story += toc_page([
        {"title": "Introdução — Por que IA é diferencial competitivo", "page": "5"},
        {"title": "Capítulo 1 — O Stack de Ferramentas de IA", "page": "8"},
        {"title": "Capítulo 2 — Prompts para Roteiro", "page": "13"},
        {"title": "Capítulo 3 — IA para Edição", "page": "18"},
        {"title": "Capítulo 4 — IA para Copywriting", "page": "23"},
        {"title": "Capítulo 5 — IA para Analytics", "page": "28"},
        {"title": "Capítulo 6 — Automação de Fluxo de Produção", "page": "33"},
        {"title": "Capítulo 7 — ChatGPT vs Gemini vs Claude", "page": "38"},
        {"title": "Capítulo 8 — IA para Thumbnails", "page": "43"},
        {"title": "Capítulo 9 — IA para SEO", "page": "47"},
        {"title": "Capítulo 10 — Ética e IA", "page": "51"},
        {"title": "Capítulo 11 — Casos Práticos", "page": "55"},
        {"title": "Capítulo 12 — Futuro da IA em Conteúdo", "page": "60"},
        {"title": "Apêndice — Biblioteca de Prompts e Checklists", "page": "64"},
        {"title": "Conclusão e Próximos Passos", "page": "70"},
        {"title": "Recursos Adicionais", "page": "73"},
    ])
    
    # ============ SOBRE O AUTOR ============
    story.append(page_break())
    story.append(spacer(3))
    styles = get_styles()
    story.append(Paragraph("SOBRE O AUTOR", styles["Chapter_Number"]))
    story.append(HRule(1.5 * 28.35, COLORS["primary"], 1))
    story.append(spacer(0.6))
    story.append(Paragraph("Clodoaldo Silva", styles["Chapter_Title"]))
    story.append(spacer(0.4))
    story.append(body_lead("Clodoaldo Silva é influenciador digital focado em Lifestyle, Business e Vision. Conteúdos sobre empreendedorismo, IA, produtividade e construção de patrimônio conectam uma audiência qualificada em busca de crescimento real."))
    story.append(body("Além do conteúdo de influência, Clodoaldo é desenvolvedor de software e empreendedor tech. Criou e mantém um ecossistema de 50+ aplicativos em 8 categorias. Cada app resolve uma dor real, e cada um tem sua própria história."))
    story.append(body("Este e-book nasceu da experimentação diária com IA: 200+ prompts testados, 30+ ferramentas avaliadas, erros caros cometidos (e corrigidos). Não é teoria. É playbook operacional."))
    story.append(spacer(1))
    story.append(h2("Licença de uso"))
    story.append(body("Este e-book é parte do Knowledge Hub Premium do Clodoaldo Silva. A compra dá direito a uso pessoal e interno. Reprodução, redistribuição ou revenda sem autorização expressa é proibida. Para licenças comerciais, contate clodoaldosilva608@gmail.com."))
    story.append(spacer(0.5))
    story.append(callout("Aviso", "As informações contidas neste material são baseadas em experiência prática e estudo contínuo. Ferramentas de IA mudam rapidamente — preços, recursos e disponibilidade podem ter mudado após a publicação. Sempre valide antes de assinar."))
    
    # ============ INTRODUÇÃO ============
    story += chapter_intro(
        "Por que IA é o diferencial competitivo dos criadores de 2025",
        "Não é sobre adotar IA — é sobre dominar antes que o concorrente domine"
    )
    story.append(body_lead("Em 2022, IA era hype. Em 2024, é ferramenta. Em 2025, é infraestrutura. Criador que ainda discute \"se deve usar IA\" perdeu o bonde — a discussão agora é \"como dominar IA\"."))
    story.append(body("Este e-book é pra quem já decidiu que IA faz parte do futuro, mas ainda não estruturou o stack. Vai encontrar: quais ferramentas usar (e quais ignorar), como escrever prompts que geram conteúdo de verdade, como automatizar o operacional sem perder autoria, e como evitar as armadilhas éticas que derrubam canais."))
    story.append(body("Mas antes de começarmos, uma verdade desconfortável: a maioria dos criadores usa IA como oráculo. Pergunta uma coisa, copia a resposta, posta. Isso é subutilização. IA é força-tarefa. É análise. É edge competitivo. Quando você entende isso, deixa de competir com criadores que \"têm mais tempo\" ou \"têm mais equipe\". Você compete com sistema. E sistema vence talento solo sempre."))
    story.append(h2("O que você vai encontrar neste e-book"))
    story.append(bullet_list([
        "<b>Stack completo:</b> 5 camadas de ferramentas que cobrem do conceito ao analytics.",
        "<b>Prompts prontos:</b> mais de 30 prompts validados, organizados por objetivo.",
        "<b>Workflow automatizado:</b> como reduzir 70% do tempo de produção de Reels.",
        "<b>Comparativos:</b> ChatGPT vs Gemini vs Claude — qual usar pra cada tarefa.",
        "<b>Casos reais:</b> 4 criadores destrinchados, com números de antes e depois.",
        "<b>Ética:</b> princípios para não perder o canal (e a reputação) por uso irresponsável.",
    ]))
    story.append(h2("Como aproveitar ao máximo"))
    story.append(body("Cada capítulo é independente mas sequencial. Você pode ler do começo ao fim (recomendado na primeira passada) ou pular direto pro capítulo que resolve sua dor atual. Cada capítulo termina com exercício prático. Não pule — é onde o aprendizado vira habilidade."))
    story.append(callout("Promessa", "Ao final deste e-book você terá: (1) um stack de IA completo e validado, (2) biblioteca de prompts prontos para uso, (3) workflow de produção 3x mais rápido, (4) critério para avaliar novas ferramentas sem FOMO, e (5) princípios éticos para construir carreira de longo prazo."))
    story.append(spacer(0.4))
    story += quote("A IA não vai substituir criadores. Mas criadores que usam IA vão substituir os que não usam.", "Anônimo (mas urgente)")
    story.append(body("Essa frase resume o desafio central deste e-book. Não é sobre substituir sua criatividade. É sobre amplificar sua capacidade. O criador que entende isso ganha 10x velocidade sem perder autoria. O que não entende, vira commodity. E commodity é o último lugar onde criador quer estar."))
    illustration_image(ai_adoption_growth(), 14 * cm),
    caption("Figura I.1 — Adoção de IA entre criadores em 2024: de 12% a 93% em 12 meses. Você está dentro dessa curva?"),
    
    # ============ CAPÍTULOS ============
    story += chapter_header("1", "O Stack de Ferramentas de IA", "As 5 camadas que todo criador precisa dominar")
    story.extend(CHAPTER_1)
    
    story += chapter_header("2", "Prompts para Roteiro", "A fórmula CREDE para roteiros que prendem do primeiro ao último segundo")
    story.extend(CHAPTER_2)
    
    story += chapter_header("3", "IA para Edição", "Workflow híbrido: IA no pesado, humano no fino")
    story.extend(CHAPTER_3)
    
    story += chapter_header("4", "IA para Copywriting", "Frameworks clássicos aplicados à era da IA generativa")
    story.extend(CHAPTER_4)
    
    story += chapter_header("5", "IA para Analytics", "Transforme dashboards opacos em insights acionáveis")
    story.extend(CHAPTER_5)
    
    story += chapter_header("6", "Automação de Fluxo de Produção", "De artesão a operador: o pipeline que economiza 70% do tempo")
    story.extend(CHAPTER_6)
    
    story += chapter_header("7", "ChatGPT vs Gemini vs Claude", "Qual LLM usar para cada tarefa — com teste cego")
    story.extend(CHAPTER_7)
    
    story += chapter_header("8", "IA para Thumbnails", "70% do clique é thumbnail — use IA para vencer o scroll")
    story.extend(CHAPTER_8)
    
    story += chapter_header("9", "IA para SEO", "Do keyword stuffing ao helpful content: como IA ajuda (e como atrapalha)")
    story.extend(CHAPTER_9)
    
    story += chapter_header("10", "Ética e IA", "Transparência, atribuição, consentimento: princípios para não queimar o canal")
    story.extend(CHAPTER_10)
    
    story += chapter_header("11", "Casos Práticos", "4 criadores destrinchados — stacks, métricas, ROI")
    story.extend(CHAPTER_11)
    
    story += chapter_header("12", "Futuro da IA em Conteúdo", "5 tendências dos próximos 24 meses — e como se posicionar")
    story.extend(CHAPTER_12)
    
    story += chapter_header("A", "Apêndice — Biblioteca de Prompts e Checklists", "Recursos para colar no Notion e usar diariamente")
    story.extend(APPENDIX)
    
    # ============ CONCLUSÃO ============
    story += chapter_header("FIM", "Conclusão e Próximos Passos", "O que fazer agora, com tudo que aprendeu")
    story.append(body_lead("Você chegou ao fim do e-book. Mas aqui está a verdade desconfortável: ler sobre IA não te torna melhor em IA. Praticar, medir, iterar — sim."))
    story.append(body("Por isso, em vez de uma conclusão tradicional, vou te deixar com um plano de 30 dias. Se você seguir, em 1 mês sua produção de conteúdo terá dado um salto mensurável."))
    story.append(h2("Plano de 30 dias"))
    story.append(h3("Semana 1 — Diagnóstico e setup"))
    story.append(bullet_list([
        "Dia 1-2: implemente o stack do capítulo 1 (crie contas nas ferramentas).",
        "Dia 3-4: teste 3 prompts do capítulo 2 em vídeos reais.",
        "Dia 5-7: automatize 1 tarefa com Zapier (capítulo 6).",
    ]))
    story.append(h3("Semana 2 — Produção assistida"))
    story.append(bullet_list([
        "Produza 5 Reels usando o workflow híbrido (capítulo 3).",
        "Aplique 2 frameworks de copy (capítulo 4).",
        "Faça sua primeira análise de métricas com IA (capítulo 5).",
    ]))
    story.append(h3("Semana 3 — Refino e escala"))
    story.append(bullet_list([
        "A/B teste 3 thumbnails com IA (capítulo 8).",
        "Otimize 1 artigo para SEO com IA (capítulo 9).",
        "Compare Claude vs ChatGPT em 5 tarefas (capítulo 7).",
    ]))
    story.append(h3("Semana 4 — Sistema e ética"))
    story.append(bullet_list([
        "Documente seu workflow em template Notion.",
        "Crie 5 prompts customizados para seu nicho.",
        "Implemente o checklist ético (capítulo 10) em todo conteúdo.",
        "Meça: tempo economizado, vídeos produzidos, crescimento de métricas.",
    ]))
    story.append(h2("Métricas para acompanhar o progresso"))
    body("Em 30 dias, você deve ter:"),
    bullet_list([
        "<b>Produção:</b> 2x mais vídeos que antes do plano.",
        "<b>Tempo por vídeo:</b> 50% redução (mínimo).",
        "<b>Engajamento:</b> taxa de salvamento +30% (por qualidade do conteúdo).",
        "<b>Insights:</b> 5 padrões identificados nas métricas que você não sabia.",
        "<b>Sistema:</b> 1 template Notion preenchido e em uso.",
    ])
    story.append(h2("Erros que cometi (pra você não cometer)"))
    body("Em 2 anos usando IA pra criar conteúdo, cometi 7 erros caros. Lista pra você evitar:"),
    numbered_list([
        "<b>Trocar stack toda semana:</b> perdi 6 meses sem dominar nada. Fique 90 dias no mesmo stack.",
        "<b>Confiar cegamente em IA:</b> postei \"fato\" inventado. Perdia credibilidade se não corrigisse rápido.",
        "<b>Não declarar IA:</b> seguidores perceberam. Constrangimento público.",
        "<b>Escalar antes de dominar:</b> automatizei processo ruim. Erro multiplicado por 10.",
        "<b>Ignorar ética:</b> clonou voz de influenciador sem pedir. Quase processo.",
        "<b>Economizar em ferramentas:</b> tentei usar só free. Perdia 20h/mês em workarounds.",
        "<b>Não documentar workflow:</b> refazia o mesmo trabalho toda semana. Caos.",
    ])
    story.append(spacer(0.5))
    story += quote("Não existe atalho para domínio de IA. Mas existe método. E método, praticado por 30 dias, vence talento praticado por 0 dias.", "Clodoaldo Silva")
    story.append(spacer(0.5))
    story.append(body("Se este e-book te ajudou, compartilhe com 1 pessoa que precisa ler. Conteúdo bom merece ser espalhado. E se você quiser ir mais fundo, os materiais complementares na próxima seção são o próximo passo natural."))
    
    # ============ RECURSOS ADICIONAIS ============
    story.append(page_break())
    story.append(spacer(2))
    styles = get_styles()
    story.append(Paragraph("RECURSOS ADICIONAIS", styles["Chapter_Number"]))
    story.append(HRule(1.5 * 28.35, COLORS["primary"], 1))
    story.append(spacer(0.6))
    story.append(Paragraph("Continue sua jornada", styles["Chapter_Title"]))
    story.append(spacer(0.4))
    story.append(h2("Outros materiais do ecossistema"))
    story.append(bullet_list([
        "<b>Storytelling Magnético</b> — A engenharia invisível por trás de histórias que prendem atenção.",
        "<b>Manual da Edição Premium</b> — Como editar vídeos que retêm atenção do primeiro ao último segundo.",
        "<b>30 Ganchos para Reels</b> — Coleção prática de aberturas prontas para uso imediato.",
        "<b>Pack de Prompts Premium</b> — 100+ prompts validados para ChatGPT, Gemini e Claude.",
        "<b>Pack de Imagens Premium</b> — Backgrounds e texturas para posts e stories.",
    ]))
    story.append(h2("Conecte-se"))
    story.append(bullet_list([
        "<b>Instagram:</b> @clodoaldo_c_silva",
        "<b>TikTok:</b> @clodoald_c_silva",
        "<b>YouTube:</b> @clodoaldosilvaa",
        "<b>E-mail:</b> clodoaldosilva608@gmail.com",
        "<b>Site:</b> clodoaldo.vercel.app",
    ]))
    
    story.append(spacer(0.5))
    story.append(h2("Bibliografia recomendada"))
    story.append(body("Quer aprofundar? Estes são os 6 livros e recursos que mais influenciaram minha visão de IA para criadores:"))
    story.append(numbered_list([
        "<b>Prompt Engineering Guide</b> — DAIR.AI. Guia open-source de engenharia de prompts. Disponível em promptingguide.ai.",
        "<b>The Pragmatic Programmer</b> — Hunt & Thomas. Não é sobre IA, mas ensina pensamento de sistema que se aplica ao stack.",
        "<b>Hooked</b> — Nir Eyal. Como criar produtos (e conteúdo) que retêm. Base pra entender por que vídeos curtos viciam.",
        "<b>Building a StoryBrand</b> — Donald Miller. Framework de storytelling aplicado a negócios e IA.",
        "<b>Atomic Habits</b> — James Clear. Sistema > meta. Aplica a criar hábito de produção assistida por IA.",
        "<b>The Lean Startup</b> — Eric Ries. Build-measure-learn aplicado a iterar conteúdo com IA.",
    ]))
    story.append(body("Comece por <i>Prompt Engineering Guide</i> (grátis) e <i>Hooked</i>. São os mais práticos. Os outros vêm depois."))
    
    story.append(spacer(0.5))
    story.append(h2("Citação final"))
    story += quote("O futuro pertence àqueles que aprendem a trabalhar com suas ferramentas, não contra elas.", "Adaptação de Alvin Toffler")
    story.append(spacer(1))
    
    story.append(HRule(2 * 28.35, COLORS["primary"], 1))
    story.append(spacer(0.4))
    story.append(Paragraph("© Clodoaldo Silva. Todos os direitos reservados. Este material é parte do Knowledge Hub Premium.", styles["Footer_Caption"]))
    
    return story


if __name__ == "__main__":
    print("Gerando ia-para-criadores.pdf...")
    story = build()
    build_pdf(OUTPUT, story, title="IA para Criadores de Conteúdo — Clodoaldo Silva")
    
    import os
    size = os.path.getsize(OUTPUT)
    print(f"✅ Gerado: {OUTPUT}")
    print(f"   Tamanho: {size:,} bytes ({size/1024:.1f} KB)")
    
    import pypdf
    reader = pypdf.PdfReader(OUTPUT)
    print(f"   Páginas: {len(reader.pages)}")
