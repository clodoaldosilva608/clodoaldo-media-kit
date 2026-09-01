"""
Gera o e-book: Pack de Prompts Premium (60+ páginas).
100+ prompts prontos para uso, organizados por categoria e objetivo.
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
    prompt_anatomy, prompt_quality_curve, prompt_categories_pie,
    prompt_iteration_cycle,
)

OUTPUT = "/home/z/my-project/scripts/ebook-generator/output/pack-prompts-premium.pdf"


def caption(text):
    styles = get_styles()
    return Paragraph(text, styles["Footer_Caption"])


def prompt_block(title, prompt_text):
    """Cria um bloco de prompt com título e o prompt em destaque."""
    styles = get_styles()
    from reportlab.platypus import Table, TableStyle
    from reportlab.lib import colors
    
    title_p = Paragraph(f"<b>► {title}</b>", styles["Callout_Title"])
    # Wrap prompt text — usar Preformatted-style com quebras manuais
    # Replace \n with <br/> for ReportLab paragraphs
    formatted = prompt_text.replace("\n", "<br/>")
    prompt_p = Paragraph(formatted, styles["Code"])
    
    inner = [[title_p], [prompt_p]]
    t = Table(inner, colWidths=[15 * cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor(COLORS["background_alt"])),
        ("BOX", (0, 0), (-1, -1), 1, colors.HexColor(COLORS["primary"])),
        ("LEFTPADDING", (0, 0), (-1, -1), 14),
        ("RIGHTPADDING", (0, 0), (-1, -1), 14),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("LINEBEFORE", (0, 0), (0, -1), 3, colors.HexColor(COLORS["accent_orange"])),
    ]))
    return t


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
    body_lead("Um prompt é um contrato. Você especifica o que quer, a IA executa. Mas 90% dos criadores escrevem prompts como quem murmura pra si mesmo — vagos, incompletos, contraditórios. Resultado: outputs genéricos que ninguém usa. Neste capítulo, vamos dominar o básico que 90% erram."),
    illustration_image(prompt_anatomy(), 14 * cm),
    caption("Figura 1.1 — Anatomia de um prompt eficaz: 5 componentes que multiplicam a qualidade do output."),
    h2("O que é um prompt, realmente?"),
    body("Prompt é a instrução que você dá a um modelo de linguagem. Pense nela como briefing de agência: quanto mais claro, mais o resultado vai na direção certa. Quanto mais vago, mais a IA adivinha — e erra."),
    body("A diferença entre \"escreve um roteiro\" e \"escreva um roteiro de Reels de 30s sobre produtividade matinal para criadores de 25-35 anos, com gancho nos primeiros 3 segundos e CTA para salvar\" é a diferença entre desperdício e produtividade."),
    h2("Os 5 componentes de um prompt eficaz"),
    body("Todo prompt premium tem 5 partes. Memorize:"),
    numbered_list([
        "<b>Contexto:</b> quem é você, qual o projeto, qual a audiência.",
        "<b>Papel (Role):</b> que persona a IA deve assumir (roteirista, copywriter, analista).",
        "<b>Tarefa (Task):</b> o que exatamente ela deve fazer, em verbo de ação.",
        "<b>Restrições (Constraints):</b> tamanho, formato, tom, proibições.",
        "<b>Exemplos (Few-shot):</b> 1-2 amostras de referência do tom esperado.",
    ]),
    h3("Exemplo: prompt vago vs prompt premium"),
    body("Veja a diferença na prática:"),
    prompt_block("PROMPT VAGO (não faça isso)",
        "Escreve um roteiro sobre produtividade."),
    spacer(0.4),
    prompt_block("PROMPT PREMIUM (faça assim)",
        "Você é um roteirista sênior de Reels focado em produtividade para criadores.\n\n"
        "Contexto: Sou Clodoaldo, influenciador de lifestyle/business. Audiência: 80k no IG, 50% homens 25-35.\n\n"
        "Tarefa: Escreva 3 variações de roteiro de 30s sobre \"rotina matinal de 5 minutos\".\n\n"
        "Estrutura: (1) gancho 0-3s, (2) contexto 3-10s, (3) técnica 10-22s, (4) CTA 22-30s.\n\n"
        "Tom: direto, técnico, sem enrolação. Proibido: emojis, palavras como \"incrível\", \"mudou minha vida\".\n\n"
        "Exemplo de tom que uso: \"3 minutos depois de acordar, eu faço isso aqui. Não é café. Não é celular. É respirar 4-7-8 por 1 minuto.\""),
    h2("Por que a maioria dos prompts falha"),
    body("Os 5 erros mais comuns que destroem a qualidade do output:"),
    bullet_list([
        "<b>Falta de contexto:</b> a IA não sabe quem é você nem pra quem é o conteúdo. Genericidade garantida.",
        "<b>Tarefa ambígua:</b> \"escreve algo bom\" não é tarefa. \"Escreva 5 headlines de máx 8 palavras\" é.",
        "<b>Ausência de restrições:</b> sem limite de tamanho/tom, a IA enche de adjetivos vazios.",
        "<b>Sem exemplos:</b> sem referência de tom, a IA usa o tom default — genérico.",
        "<b>Pedir uma coisa só:</b> peça sempre 3-5 variações. Custa o mesmo, multiplica opções.",
    ]),
    callout("Princípio fundamental", "Trate a IA como estagiário brilhante mas sem contexto. Dê tudo: quem é você, o que quer, em que formato, com quais limites. Quanto mais explícito, melhor o output."),
    h2("O framework CREDE"),
    body("Para nunca esquecer os 5 componentes, use o acrônimo <b>CREDE</b>:"),
    numbered_list([
        "<b>C</b>ontexto — quem, quando, onde, pra quem.",
        "<b>R</b>ole — que persona a IA assume.",
        "<b>E</b>strutura — como organizar o output.",
        "<b>D</b>etalhes — restrições, proibições, preferências.",
        "<b>E</b>xemplos — referências de tom e estilo.",
    ]),
    body("Antes de enviar qualquer prompt, releia e verifique: cobri os 5? Se não, complete. Isso sozinho já dobra a qualidade dos seus outputs."),
    exercise_box("Aplique CREDE agora", [
        "Pegue um prompt que você usou recentemente (qualquer um).",
        "Identifique quais dos 5 componentes CREDE ele cobre.",
        "Reescreva o prompt completo, cobrindo os 5.",
        "Rode as duas versões. Compare outputs.",
        "Adote CREDE como padrão pra todos os próximos prompts.",
    ]),
]


# ============ CAPÍTULO 2 ============
CHAPTER_2 = [
    body_lead("Prompt bom é arquitetura. Não é sorte nem inspiração. Neste capítulo, vamos estruturar prompts como projetos — com seções, hierarquia e clareza que multiplicam a qualidade do output."),
    illustration_image(prompt_quality_curve(), 14 * cm),
    caption("Figura 2.1 — Curva de especificidade: mais detalhe sempre ajuda, até o ponto de saturação."),
    h2("A estrutura ideal de um prompt"),
    body("Um prompt premium não é um parágrafo solto. É um documento estruturado com seções. Template que uso:"),
    prompt_block("TEMPLATE DE PROMPT PREMIUM",
        "# CONTEXTO\n"
        "[Quem é você, qual o projeto, qual a audiência]\n\n"
        "# PAPEL\n"
        "[Que persona a IA deve assumir]\n\n"
        "# TAREFA\n"
        "[Verbo de ação + o que exatamente fazer]\n\n"
        "# RESTRIÇÕES\n"
        "[Tamanho, formato, tom, proibições]\n\n"
        "# EXEMPLOS\n"
        "[1-2 amostras de referência]\n\n"
        "# FORMATO DE SAÍDA\n"
        "[Como entregar o resultado]"),
    body("Esse template leva 2 minutos a mais pra escrever. Mas economiza 20 minutos de iteração. Vale sempre."),
    h2("Técnicas avançadas de prompting"),
    h3("1. Chain-of-Thought (CoT)"),
    body("Peça pra IA pensar passo a passo antes de responder. Reduz alucinação em problemas complexos. Adicione ao final do prompt: \"Antes de responder, pense passo a passo e explique seu raciocínio.\""),
    h3("2. Few-shot prompting"),
    body("Forneça 3-5 exemplos no prompt. A IA copia o padrão. Funciona melhor que descrever o tom. Estruture: \"Exemplo 1: [input] → [output]. Exemplo 2: [input] → [output]. Agora faça para: [novo input]\"."),
    h3("3. Role-play"),
    body("Dê um papel específico: \"Você é um roteirista de Hollywood com 20 anos de experiência em drama\". Output muda drasticamente. IA assume a persona."),
    h3("4. Self-critique"),
    body("Peça o output, depois peça: \"Agora critique seu próprio output como um editor exigente. Liste 3 fraquezas. Reescreva corrigindo.\" Resultado: segunda versão sempre melhor que a primeira."),
    h3("5. Decomposição"),
    body("Para tarefas complexas, divida em etapas. Ex: \"Passo 1: gere 10 ideias. Passo 2: escolha as 3 melhores e explique por quê. Passo 3: desenvolva cada uma em 200 palavras.\" Outputs mais coerentes."),
    h2("Variáveis em prompts"),
    body("Use placeholders entre colchetes pra tornar prompts reutilizáveis. Ex: \"Escreva um roteiro de Reels de [DURAÇÃO] sobre [TEMA] para [PÚBLICO]\". Salve templates no Notion. Preencha as variáveis a cada uso."),
    prompt_block("TEMPLATE COM VARIÁVEIS",
        "Você é um [PAPEL] especializado em [NICHO].\n\n"
        "Contexto: Sou [NOME], [DESCRIÇÃO]. Audiência: [PÚBLICO].\n\n"
        "Tarefa: Escreva [N] variações de [FORMATO] sobre [TEMA].\n\n"
        "Estrutura: [ESTRUTURA DETALHADA]\n\n"
        "Tom: [TOM]. Proibido: [PROIBIÇÕES].\n\n"
        "Exemplo de referência: [EXEMPLO]\n\n"
        "Formato de saída: [FORMATO]"),
    h2("Erros estruturais em prompts"),
    bullet_list([
        "<b>Prompt longo demais:</b> mais de 500 palavras sem estrutura. IA se perde. Use seções com #.",
        "<b>Instruções contraditórias:</b> \"seja criativo mas conservador\". Escolha um lado.",
        "<b>Falta de formato de saída:</b> sem especificar, IA inventa estrutura. Sempre defina.",
        "<b>Exemplos fracos:</b> exemplo ruim ensina padrão ruim. Use só seus melhores outputs como referência.",
        "<b>Não iterar:</b> primeiro output nunca é final. Sempre peça refinamento.",
    ]),
    callout("Dica de mestre", "Salve seus melhores prompts em biblioteca (Notion, Obsidian). Quando funcionar bem, documente. Em 90 dias você terá biblioteca de 50+ prompts validados."),
    exercise_box("Crie seu primeiro template premium", [
        "Escolha uma tarefa que você faz toda semana (ex: roteiro de Reels).",
        "Escreva um template CREDE com variáveis entre colchetes.",
        "Salve no Notion ou Obsidian como 'Template — Reels'.",
        "Use em 5 vídeos essa semana. Anote melhorias.",
        "Ajuste template. Em 30 dias, terá versão final.",
    ]),
]


# ============ CAPÍTULO 3 ============
CHAPTER_3 = [
    body_lead("Reels é onde a maioria dos criadores vive — e onde a maioria dos prompts falha. Roteiro de Reels é formato específico: 15-90 segundos, gancho brutal nos 3s iniciais, CTA no final. Vamos dominar prompts pra esse formato."),
    h2("Anatomia de um Reels que segura atenção"),
    body("Antes do prompt, entenda a estrutura. Reels premium tem 4 partes:"),
    numbered_list([
        "<b>Gancho (0-3s):</b> pergunta, stat ou statement quebra-padrão. 70% da decisão de assistir.",
        "<b>Contexto (3-10s):</b> por que isso importa pra você. Estabelece relevância.",
        "<b>Entrega (10-22s):</b> o conteúdo principal. Dica, técnica, história, lista.",
        "<b>CTA (22-30s):</b> direciona ação. Salvar, comentar, seguir, link na bio.",
    ]),
    h2("10 prompts para Reels (um por objetivo)"),
    h3("1. Reels educativo (topo de funil)"),
    prompt_block("PROMPT — Reels educativo",
        "Você é roteirista sênior de Reels educativos para criadores iniciantes.\n\n"
        "Tema: [TEMA — ex: produtividade matinal]\n\n"
        "Tarefa: Escreva 3 roteiros de 30s, um para cada estrutura:\n"
        "(A) Lista de 3 dicas rápidas\n"
        "(B) Tutorial passo-a-passo\n"
        "(C) Mito vs verdade\n\n"
        "Para cada roteiro, estruture:\n"
        "[0-3s] Gancho (sem pergunta, statement ousado)\n"
        "[3-10s] Contexto (por que importa)\n"
        "[10-22s] Entrega (a dica/técnica)\n"
        "[22-30s] CTA (\"salva pra rever\")\n\n"
        "Tom: direto, técnico. Proibido: 'incrível', 'mudou minha vida', emojis."),
    h3("2. Reels storytelling (meio de funil)"),
    prompt_block("PROMPT — Reels storytelling",
        "Você é roteirista especializado em histórias pessoais curtas.\n\n"
        "Contexto: Sou [NOME], criador de [NICHO]. Vou contar esta história: [DESCRIÇÃO DA HISTÓRIA REAL].\n\n"
        "Tarefa: Estruture a história em Reels de 60s seguindo o arco narrativo:\n"
        "- Incidente gatilho (0-10s): o que aconteceu\n"
        "- Tensão crescente (10-25s): o que senti/pensei\n"
        "- Clímax (25-40s): a virada ou decisão\n"
        "- Resolução + aprendizado (40-55s): como resolvi e o que aprendi\n"
        "- CTA (55-60s): pergunta pra audiência\n\n"
        "Tom: vulnerável mas não piegas. Primeira pessoa."),
    h3("3. Reels de venda (fundo de funil)"),
    prompt_block("PROMPT — Reels de venda",
        "Você é copywriter de conversão especializado em Reels.\n\n"
        "Produto: [PRODUTO]. Preço: [PREÇO]. Objeção principal: [OBJEÇÃO].\n\n"
        "Tarefa: Escreva 3 variações de Reels de 30s para venda, usando frameworks:\n"
        "(A) PAS — Problema, Agitação, Solução\n"
        "(B) AIDA — Atenção, Interesse, Desejo, Ação\n"
        "(C) BAB — Before, After, Bridge\n\n"
        "CTA: \"link na bio\" ou \"comenta [PALAVRA] que te mando link\".\n"
        "Tom: confiante, sem agressividade. Sem 'última chance', 'só hoje'."),
    h3("4. Reels de bastidor (behind-the-scenes)"),
    prompt_block("PROMPT — Reels bastidor",
        "Você é roteirista de conteúdo bastidor para criadores.\n\n"
        "Contexto: Vou mostrar [ATIVIDADE — ex: meu setup de gravação, rotina de produção, etc.]\n\n"
        "Tarefa: Roteiro de 45s dividido em:\n"
        "[0-3s] Gancho: pergunta curiosa sobre processo\n"
        "[3-15s] Mostro setup/ambiente\n"
        "[15-30s] Explico decisões (por que assim e não diferente)\n"
        "[30-40s] Dica prática para quem quer replicar\n"
        "[40-45s] CTA: 'segue pra mais bastidores'\n\n"
        "Tom: íntimo, conversacional. Como se falasse com amigo."),
    h3("5. Reels de case/cliente"),
    prompt_block("PROMPT — Reels case",
        "Você é roteirista de cases para criadores que vendem serviço.\n\n"
        "Case: Cliente [NOME] tinha [PROBLEMA]. Aplicamos [MÉTODO]. Resultado: [RESULTADO COM NÚMERO].\n\n"
        "Tarefa: Roteiro de 60s seguindo:\n"
        "[0-5s] Gancho: stat do resultado\n"
        "[5-15s] Quem era o cliente e qual dor\n"
        "[15-30s] O que fizemos diferente (método)\n"
        "[30-45s] Resultado com número + depoimento curto\n"
        "[45-55s] Como aplicar isso na vida do viewer\n"
        "[55-60s] CTA: 'comenta CASE que te mando detalhes'\n\n"
        "Tom: factual, sem hype. Números > adjetivos."),
    h3("6. Reels lista (5 dicas em 30s)"),
    prompt_block("PROMPT — Reels lista",
        "Você é roteirista de Reels-lista para [NICHO].\n\n"
        "Tema: [TEMA]. Número de itens: [3, 5 ou 7].\n\n"
        "Tarefa: Roteiro de [30 ou 45]s no formato lista:\n"
        "[0-3s] Gancho: 'X coisas que [audiência] deveria fazer mas não faz'\n"
        "[3-5s] Contexto: 'eu testei todas em [N] dias'\n"
        "[5-25s] Lista rápida — 1 frase por item, sem explicação longa\n"
        "[25-30s] CTA: 'qual você vai testar? comenta'\n\n"
        "Ritmo: cortado, sem respiração entre itens. Energia alta."),
    h3("7. Reels polêmico"),
    prompt_block("PROMPT — Reels polêmico",
        "Você é roteirista de Reels polêmicos para [NICHO].\n\n"
        "Opinião contrária ao senso comum: [OPINIÃO]. Audiência: [PÚBLICO].\n\n"
        "Tarefa: Roteiro de 45s defendendo essa posição:\n"
        "[0-3s] Gancho: a opinião em uma frase curta e ousada\n"
        "[3-15s] Por que todo mundo pensa o oposto (acknowledge)\n"
        "[15-30s] Por que estão errados — 2 argumentos concretos\n"
        "[30-40s] Condição: 'a não ser que [exceção]'\n"
        "[40-45s] CTA: 'concorda ou discorda? comenta'\n\n"
        "Tom: confiante mas não arrogante. Admita exceções."),
    h3("8. Reels de transformação"),
    prompt_block("PROMPT — Reels transformação",
        "Você é roteirista de conteúdo de transformação pessoal.\n\n"
        "Antes: [DESCRIÇÃO DO ANTES]. Depois: [DESCRIÇÃO DO DEPOIS]. Tempo: [X MESES/ANOS].\n\n"
        "Tarefa: Roteiro de 60s no framework BAB (Before-After-Bridge):\n"
        "[0-5s] Gancho: contraste antes/depois\n"
        "[5-20s] Before: como era, dor, sentimento\n"
        "[20-35s] After: como é agora, mudança, resultado\n"
        "[35-50s] Bridge: o que mudou (não foi sorte, foi X técnica)\n"
        "[50-60s] CTA: 'se você está no before, comenta BEFORE'\n\n"
        "Tom: inspirador mas realista. Sem promessa de milagre."),
    h3("9. Reels de pergunta respondida"),
    prompt_block("PROMPT — Reels Q&A",
        "Você é roteirista de Reels de Q&A para [NICHO].\n\n"
        "Pergunta recebida: [PERGUNTA]. Quem perguntou: [@USUÁRIO ou 'seguidor'].\n\n"
        "Tarefa: Roteiro de 30s respondendo diretamente:\n"
        "[0-5s] 'Pergunta do [@usuário]: [pergunta]'\n"
        "[5-10s] 'Boa pergunta — resposta curta: [sim/não/depende]'\n"
        "[10-22s] Resposta longa com 2-3 pontos\n"
        "[22-28s] Exemplo prático\n"
        "[28-30s] CTA: 'tem mais pergunta? manda nos comentários'\n\n"
        "Tom: respeitoso, didático. Sem julgar a pergunta."),
    h3("10. Reels de trend/jump on"),
    prompt_block("PROMPT — Reels trend",
        "Você é roteirista que adapta trends para nichos específicos.\n\n"
        "Trend atual: [DESCRIÇÃO DA TREND — áudio, formato, hook]. Nicho: [NICHO].\n\n"
        "Tarefa: Adapte a trend pro nicho em Reels de 15s:\n"
        "[0-3s] Gancho da trend adaptado\n"
        "[3-10s] Desenvolvimento [NICHO-específico]\n"
        "[10-15s] Twist final + CTA implícito (curtir/salvar)\n\n"
        "Restrições: máximo 30 palavras totais. Ritmo: cortado. Energy: alta.\n"
        "Formato: 3 variações diferentes do twist."),
    h2("Erros comuns em prompts de Reels"),
    bullet_list([
        "<b>Pedir Reels sem especificar duração:</b> 15s, 30s, 60s e 90s têm estruturas diferentes.",
        "<b>Esquecer o gancho:</b> 70% da retenção está nos 3s iniciais. Sempre especifique.",
        "<b>Não definir CTA:</b> Reels sem CTA é vídeo ótimo, conversão zero.",
        "<b>Misturar estruturas:</b> PAS + AIDA + BAB numa só não funciona. Escolha uma.",
        "<b>Pedir 'criativo':</b> IA interpreta literal e gera clichês. Dê direção concreta.",
    ]),
    exercise_box("Produza 5 Reels esta semana com prompts", [
        "Escolha 5 dos 10 prompts deste capítulo.",
        "Para cada, preencha as variáveis com tema real seu.",
        "Rode no Claude ou ChatGPT.",
        "Escolha o melhor output de cada (entre as variações).",
        "Grave, edite, publique. Meça retenção aos 3s vs média anterior.",
    ]),
]


# ============ CAPÍTULO 4 ============
CHAPTER_4 = [
    body_lead("Copywriting é 80% do que separa conversão de Indiferença. Neste capítulo, prompts para headlines, email marketing, anúncios, páginas de venda — o arsenal completo do copywriter moderno."),
    h2("Headlines que param o scroll"),
    body("Headline é a decisão mais importante de qualquer peça. 80% das pessoas leem só o título. Use estes 6 tipos:"),
    numbered_list([
        "<b>How-to:</b> \"Como X em Y dias sem Z\".",
        "<b>List:</b> \"7 erros que custam R$ X por mês\".",
        "<b>Stat shock:</b> \"87% dos criadores perdem dinheiro fazendo X\".",
        "<b>Question:</b> \"Você está cometendo este erro de X?\"",
        "<b>Contrarian:</b> \"Por que NÃO fazer X é o melhor investimento de 2024\".",
        "<b>Story:</b> \"Eu perdi R$ 50k fazendo X — aprenda com meu erro\".",
    ]),
    prompt_block("PROMPT — 20 headlines variadas",
        "Gere 20 headlines para Reels/Posts sobre [TEMA].\n\n"
        "Distribua nos 6 tipos:\n"
        "1. How-to (3 variações)\n"
        "2. List (3)\n"
        "3. Stat shock (3)\n"
        "4. Question (3)\n"
        "5. Contrarian (4)\n"
        "6. Story (4)\n\n"
        "Regras:\n"
        "- Máximo 9 palavras por headline\n"
        "- Sem emojis\n"
        "- Sem pontuação final\n"
        "- Português brasileiro\n"
        "- Uma ideia por headline\n"
        "- Numerar 1 a 20"),
    h2("Copy para email marketing"),
    body("Email ainda é o canal com maior ROI: R$ 42 para cada R$ 1 investido. Mas o copy tem que ser cirúrgico."),
    prompt_block("PROMPT — Email de vendas (framework 4 Ps)",
        "Você é copywriter de email marketing especializado em conversão.\n\n"
        "Produto: [PRODUTO]. Preço: [PREÇO]. Público: [PÚBLICO].\n"
        "Objeção principal: [OBJEÇÃO]. Bônus: [BÔNUS se houver].\n\n"
        "Tarefa: Escreva email de vendas usando o framework 4 Ps:\n\n"
        "1. PROMISE (promise): a promessa central do produto, em 1 linha.\n"
        "2. PICTURE (picture): pinte o cenário 'depois' — como a vida do cliente muda.\n"
        "3. PROOF (proof): 2-3 provas concretas (case, depoimento, dado).\n"
        "4. PUSH (push): CTA claro com deadline e bônus.\n\n"
        "Estrutura:\n"
        "- Subject line (máx 50 caracteres, sem clickbait)\n"
        "- Preview text (máx 90 caracteres)\n"
        "- Abertura que conecta com dor do leitor (50 palavras)\n"
        "- Promise (1 parágrafo)\n"
        "- Picture (2 parágrafos)\n"
        "- Proof (2-3 bullets)\n"
        "- Push com CTA + deadline (1 parágrafo)\n"
        "- P.S. reforçando bônus (1 linha)\n\n"
        "Tamanho total: 250-350 palavras. Tom: direto, sem hype."),
    h2("Anúncios para Facebook/Instagram Ads"),
    prompt_block("PROMPT — Anúncio FB/IG",
        "Você é copywriter de Facebook Ads com R$ 10M+ em verba gerida.\n\n"
        "Produto: [PRODUTO]. Preço: [PREÇO]. Público-alvo: [PÚBLICO].\n"
        "Ângulo: [ÂNGULO — ex: dor, aspiração, prova social, urgência].\n\n"
        "Tarefa: Escreva 3 variações de anúncio, cada uma com:\n\n"
        "- Headline (máx 40 caracteres)\n"
        "- Primary text (máx 150 palavras)\n"
        "- Description (máx 30 caracteres)\n"
        "- CTA button (texto do botão)\n\n"
        "Variações:\n"
        "(A) Foco em DOR: começa com problema que o público reconhece\n"
        "(B) Foco em ASPIRAÇÃO: começa com o cenário 'depois'\n"
        "(C) Foco em PROVA: começa com stat ou case\n\n"
        "Tom: conversacional, primeiro pessoa do produto. Sem 'compre agora'."),
    h2("Página de venda (VSL script)"),
    prompt_block("PROMPT — Roteiro de VSL (Video Sales Letter)",
        "Você é copywriter de VSL com experiência em info-produtos.\n\n"
        "Produto: [PRODUTO — curso/serviço]. Preço: [PREÇO].\n"
        "Público: [PÚBLICO]. Duração alvo: 15-20 min.\n\n"
        "Tarefa: Escreva roteiro de VSL seguindo estrutura:\n\n"
        "1. HOOK (0-2 min): promessa + stat chocante\n"
        "2. STORY (2-5 min): origem do método, dor do criador\n"
        "3. PROBLEM (5-8 min): por que soluções comuns falham\n"
        "4. SOLUTION (8-12 min): apresentação do método\n"
        "5. PROOF (12-15 min): 2-3 cases com números\n"
        "6. OFFER (15-17 min): o que está incluso, preço, bônus\n"
        "7. GUARANTEE (17-18 min): garantia incondicional\n"
        "8. SCARCITY (18-19 min): deadline ou limite\n"
        "9. CTA (19-20 min): ação final + recap\n\n"
        "Tom: conversacional, vulnerável na story, confiante na oferta. Sem hype."),
    h2("Microcopy para UX/UI"),
    body("Microcopy é o copy de botões, mensagens de erro, onboarding. Subestimado mas decisivo em conversão."),
    prompt_block("PROMPT — Microcopy de onboarding",
        "Você é UX writer especializado em onboarding de apps.\n\n"
        "App: [DESCRIÇÃO DO APP]. Funil: [ONBOARDING/CHECKOUT/RECUPERAÇÃO].\n\n"
        "Tarefa: Escreva 3 variações para cada elemento abaixo:\n\n"
        "1. Tela de boas-vindas (headline + sub + CTA)\n"
        "2. Tela de permissão (notificação, câmera, localização)\n"
        "3. Tela de paywall (3 planos, com bônus)\n"
        "4. Empty state (quando usuário não tem conteúdo)\n"
        "5. Mensagem de erro (formulário inválido)\n\n"
        "Tom: amigável, sem jargão. Máximo 8 palavras por CTA."),
    h2("CTAs em 3 níveis"),
    prompt_block("PROMPT — Gera CTAs em 3 níveis",
        "Gere CTAs para [PRODUTO/CONTEÚDO] em 3 níveis de intensidade:\n\n"
        "1. Suave (engajamento): 5 variações. Ex: 'salva pra rever', 'comenta o que achou'.\n"
        "2. Médio (lead capture): 5 variações. Ex: 'comenta [PALAVRA] que te mando o material'.\n"
        "3. Forte (venda direta): 5 variações. Ex: 'link na bio com 50% só hoje'.\n\n"
        "Regras:\n"
        "- Máximo 8 palavras\n"
        "- Verbo de ação no início\n"
        "- Sem 'clique aqui', 'saiba mais'\n"
        "- Em português brasileiro"),
    callout("Princípio de copy", "Copy bom não é o que tem mais adjetivos. É o que tem mais verbos. Corte adjetivos. Aumente verbos de ação. Conversão sobe."),
    exercise_box("Teste 3 headlines na próxima semana", [
        "Use o prompt de 20 headlines para um vídeo/email seu.",
        "Escolha as 3 melhores.",
        "Para um mesmo conteúdo, teste 3 headlines (em 3 Reels, ou 3 subjects de email).",
        "Meça CTR/open rate de cada.",
        "Padrão campeão vira seu template.",
    ]),
]


# ============ CAPÍTULO 5 ============
CHAPTER_5 = [
    body_lead("Email marketing é o canal mais subestimado e mais rentável que existe. ROI de 4.200% (R$ 42 pra cada R$ 1). Mas o copy tem que estar cirúrgico. Neste capítulo, prompts para cada tipo de email."),
    h2("Anatomia de um email que converte"),
    body("Email premium tem 5 partes. Sempre:"),
    numbered_list([
        "<b>Subject line:</b> 50 caracteres máx. Gera curiosidade sem clickbait.",
        "<b>Preview text:</b> 90 caracteres. Reforça subject, não repete.",
        "<b>Abertura:</b> 2-3 linhas que conectam com dor ou contexto do leitor.",
        "<b>Corpo:</b> 200-400 palavras. Uma ideia principal.",
        "<b>CTA:</b> 1 só. Claro, com deadline se relevante.",
    ]),
    h2("10 prompts para emails por objetivo"),
    h3("1. Email de boas-vindas (sequência)"),
    prompt_block("PROMPT — Sequência de boas-vindas (5 emails)",
        "Você é copywriter de email marketing focado em onboarding de leads.\n\n"
        "Lead capturou por: [ISCA — ex: e-book, webinar, quiz].\n"
        "Produto futuro: [PRODUTO]. Ciclo: [N] dias.\n\n"
        "Tarefa: Escreva sequência de 5 emails:\n\n"
        "Email 1 (dia 0): Entrega da isca + apresentação pessoal\n"
        "Email 2 (dia 2): Story pessoal relacionada ao nicho\n"
        "Email 3 (dia 5): Dica prática de alto valor\n"
        "Email 4 (dia 8): Case de transformação\n"
        "Email 5 (dia 11): Soft pitch do produto\n\n"
        "Para cada email:\n"
        "- Subject (máx 50 chars)\n"
        "- Preview (máx 90 chars)\n"
        "- Corpo 200-300 palavras\n"
        "- CTA único\n\n"
        "Tom: pessoal, conversacional. Sem 'caro lead', sem 'prezado'."),
    h3("2. Email de lançamento (carta de vendas em 5 emails)"),
    prompt_block("PROMPT — Sequência de lançamento",
        "Você é copywriter de lançamentos digitais.\n\n"
        "Produto: [PRODUTO]. Preço: [PREÇO]. Bônus: [BÔNUS].\n"
        "Deadline: [DATA/HORA]. Garantia: [GARANTIA].\n\n"
        "Tarefa: Sequência de 5 emails para lançamento:\n\n"
        "Email 1 (abertura): Story + promessa. Sem venda ainda.\n"
        "Email 2 (problema): Agrava dor. Mostra por que soluções comuns falham.\n"
        "Email 3 (solução): Apresenta método. Mostra transformação.\n"
        "Email 4 (prova): 3 cases com números. Remove dúvidas.\n"
        "Email 5 (última chance): Deadline + bônus expirando.\n\n"
        "Estrutura de cada: subject + preview + corpo (300-500 palavras) + CTA + P.S.\n"
        "Tom: épico mas não exagerado. Confiança > hype."),
    h3("3. Email de recuperação de carrinho"),
    prompt_block("PROMPT — Email carrinho abandonado",
        "Você é copywriter de e-commerce.\n\n"
        "Produto: [PRODUTO]. Preço: [PREÇO]. Carrinho abandonado há: [N] horas.\n\n"
        "Tarefa: 3 emails de recuperação:\n\n"
        "Email 1 (1h após): Lembrete simples + CTA 'finalizar compra'\n"
        "Email 2 (24h após): Objecao principal + bônus surpresa\n"
        "Email 3 (48h após): Última chance + desconto (10% off)\n\n"
        "Cada email: subject + preview + 100-150 palavras + CTA. Tom: útil, não ansioso."),
    h3("4. Email de newsletter semanal"),
    prompt_block("PROMPT — Newsletter semanal",
        "Você é editor de newsletter de [NICHO].\n\n"
        "Edição da semana: tema [TEMA]. Audiência: [PÚBLICO].\n\n"
        "Tarefa: Escreva newsletter semanal com:\n\n"
        "- Subject (máx 50 chars, gerando curiosidade)\n"
        "- Abertura pessoal (2-3 linhas sobre a semana)\n"
        "- Seção 'O que aconteceu essa semana' (3-4 bullets curtos)\n"
        "- Conteúdo principal: 1 ideia desenvolvida (300-500 palavras)\n"
        "- '3 links pra ler no fim de semana' (3 bullets com 1 linha cada)\n"
        "- CTA suave (seguir, compartilhar, responder)\n\n"
        "Tom: conversacional, primeiro pessoa. Sem 'caro assinante'."),
    h3("5. Email de reengajamento"),
    prompt_block("PROMPT — Email de reengajamento",
        "Você é copywriter de retenção de audiência.\n\n"
        "Lead não abre email há 60+ dias. Último assunto: [TEMA].\n\n"
        "Tarefa: 3 variações de email de reengajamento:\n\n"
        "(A) Honesto: 'Você ainda está aí?' + novidades\n"
        "(B) Story: compartilha transformação recente e convida de volta\n"
        "(C) Última chance: 'vou te tirar da lista' (com botão 'me mantém')\n\n"
        "Cada um: subject + 100-150 palavras + 1 CTA. Tom: humano, sem culpa."),
    h3("6. Email deNPS/pesquisa"),
    prompt_block("PROMPT — Email de pesquisa",
        "Você é copywriter de customer success.\n\n"
        "Pesquisa: [OBJETIVO — ex: satisfação, descobrir dor, validar ideia].\n"
        "Incentivo: [BÔNUS — ex: cupom, e-book exclusivo].\n\n"
        "Tarefa: Email convidando pra pesquisa:\n"
        "- Subject: máximo 6 palavras\n"
        "- Abertura: por que estamos pedindo\n"
        "- Tempo: '3 minutos, juro'\n"
        "- O que vamos fazer com a resposta\n"
        "- Incentivo (bônus ao final)\n"
        "- CTA: link pra pesquisa\n\n"
        "Tom: transparente. Sem 'sua opinião é muito importante'."),
    h3("7. Email de aniversário"),
    prompt_block("PROMPT — Email de aniversário",
        "Você é copywriter de relacionamento.\n\n"
        "Tipo: aniversário de cadastro OU aniversário pessoal.\n"
        "Marca: [MARCA]. Bônus: [BÔNUS].\n\n"
        "Tarefa: 3 variações de email de aniversário:\n\n"
        "(A) Emocional: story + agradecimento + bônus surpresa\n"
        "(B) Cômico: humor leve + bônus\n"
        "(C) Direto: 'presente pra você' + desconto\n\n"
        "Cada um: subject + 100-200 palavras + CTA. Tom: humano, não robótico."),
    h3("8. Email de storytelling (carta aberta)"),
    prompt_block("PROMPT — Carta aberta",
        "Você é ghostwriter de cartas abertas para criadores.\n\n"
        "Tema: [TEMA PESSOAL — ex: por que saí do emprego, erro que cometi].\n"
        "Mensagem central: [MESSAGE]. Audiência: [PÚBLICO].\n\n"
        "Tarefa: Escreva carta aberta de 500-700 palavras:\n\n"
        "- Abertura: 1 parágrafo que cria identificação\n"
        "- Story: 2-3 parágrafos contando o que aconteceu\n"
        "- Virada: o que mudou / o aprendizado\n"
        "- Conexão: como isso se aplica à vida do leitor\n"
        "- CTA: pergunta ou convite (não venda)\n\n"
        "Tom: vulnerável, em primeira pessoa. Sem moralizar."),
    h3("9. Email de up-sell"),
    prompt_block("PROMPT — Email de upsell",
        "Você é copywriter de pós-venda.\n\n"
        "Cliente comprou: [PRODUTO 1]. Upsell: [PRODUTO 2 COMPLEMENTAR].\n"
        "Pré-requisito: cliente já consumiu o produto 1.\n\n"
        "Tarefa: Email de upsell seguindo:\n\n"
        "1. Reconhecimento: 'você já fez X (consumiu o produto 1)'\n"
        "2. Próximo passo: 'agora falta Y para resultado completo'\n"
        "3. Apresentação: 'por isso temos Z (upsell)'\n"
        "4. Comprovante: bônus exclusivo para quem já é cliente\n"
        "5. CTA: link com desconto de cliente\n\n"
        "Tom: útil, não forçado. Cliente deve sentir 'isso faz sentido'."),
    h3("10. Email de despedida (churn)"),
    prompt_block("PROMPT — Email de despedida",
        "Você é copywriter de customer experience.\n\n"
        "Cliente cancelou: [SERVIÇO]. Razão provável: [RAZÃO].\n\n"
        "Tarefa: Email de despedida que mantém porta aberta:\n\n"
        "1. Confirmação: 'cancelamento confirmado'\n"
        "2. Sem culpa: 'entendemos, sem problema'\n"
        "3. Pedido de feedback: 'se puder, conta o que faltou — 1 minuto'\n"
        "4. Porta aberta: 'quando quiser voltar, [condição]'\n"
        "5. Recursos gratuitos: 'enquanto isso, segue usando [recurso free]'\n\n"
        "Tom: grato, sem desespero. Cliente deve sentir falta, não pressão."),
    h2("Erros comuns em emails"),
    bullet_list([
        "<b>Subject clickbait:</b> gera abertura, gera cancelamento. Não vale.",
        "<b>Email longo demais:</b> mais de 500 palavras = scan, não leitura.",
        "<b>Múltiplos CTAs:</b> 1 email, 1 CTA. Mais que isso dilui.",
        "<b>\"Caro lead\", \"Prezado\":</b> ninguém fala assim com amigo. Tom humano.",
        "<b>Sem preview text:</b> 30% da decisão de abrir vem do preview. Use.",
    ]),
    exercise_box("Construa sua sequência de boas-vindas", [
        "Use o prompt de sequência de boas-vindas (5 emails).",
        "Preencha variáveis com seu produto real.",
        "Rode no Claude.",
        "Edite os outputs: ajuste tom, corte adjetivos.",
        "Configure na sua ferramenta de email (Mailchimp, ConvertKit, Beehiiv).",
    ]),
]


# ============ CAPÍTULO 6 ============
CHAPTER_6 = [
    body_lead("SEO é maratona, não corrida. Mas com prompts certos, você constrói conteúdo que ranqueia em 1/3 do tempo. Neste capítulo, prompts para blog, schema, meta tags, conteúdo de autoridade."),
    h2("Como IA ajuda (e atrapalha) em SEO"),
    body("IA ajuda a escalar pesquisa, estruturação e escrita. Atrapalha quando gera conteúdo raso e genérico — Google penaliza desde 2024."),
    body("Regra de ouro: use IA pra escavar intenção e estruturar. Adicione 30% de experiência humana. Sem esses 30%, conteúdo padece."),
    h2("10 prompts para SEO"),
    h3("1. Pesquisa de intenção de busca"),
    prompt_block("PROMPT — Análise de intenção",
        "Você é especialista em SEO semântico.\n\n"
        "Keyword: [KEYWORD]. País: Brasil. Idioma: PT-BR.\n\n"
        "Tarefa: Analise a intenção de busca para essa keyword:\n\n"
        "1. Tipo de intenção (informacional, transacional, navegacional)\n"
        "2. 10 perguntas que o searcher provavelmente quer respondidas\n"
        "3. 5 ângulos/sub-temas que um artigo completo deve cobrir\n"
        "4. Formato ideal (lista, tutorial, comparativo, opinião)\n"
        "5. Tamanho recomendado (palavras)\n"
        "6. 5 entidades semânticas relacionadas (para incluir no conteúdo)\n"
        "7. Sugestões de H2 e H3 (estrutura completa)\n\n"
        "Baseie-se nos PAA (People Also Ask) do Google Brasil."),
    h3("2. Estrutura de artigo SEO"),
    prompt_block("PROMPT — Briefing de artigo SEO",
        "Você é estrategista de SEO content.\n\n"
        "Keyword primária: [KEYWORD].\n"
        "Keywords secundárias: [LISTA].\n"
        "Audiência: [PÚBLICO]. Expertise do autor: [EXPERTISE].\n\n"
        "Tarefa: Crie briefing completo de artigo SEO:\n\n"
        "1. H1 (título) — máximo 60 caracteres\n"
        "2. Meta description — máximo 155 caracteres\n"
        "3. Estrutura H2/H3 (hierarquia completa)\n"
        "4. Para cada H2: 2-3 pontos que devem ser cobertos\n"
        "5. Sugestões de tabelas/listas (Google ama formatos estruturados)\n"
        "6. 5 perguntas FAQ para final (com PAA em mente)\n"
        "7. 3 oportunidades de internal linking\n"
        "8. Schema markup recomendado (FAQ, HowTo, Article)\n"
        "9. Tamanho alvo (palavras)\n"
        "10. Tom e estilo"),
    h3("3. Escrita do artigo"),
    prompt_block("PROMPT — Artigo SEO (2000 palavras)",
        "Você é redator de SEO content sênior.\n\n"
        "Briefing:\n"
        "- H1: [H1]\n"
        "- Keyword: [KEYWORD]\n"
        "- Estrutura: [H2s E H3s DO BRIEFING]\n"
        "- Audiência: [PÚBLICO]\n\n"
        "Tarefa: Escreva artigo de 2000 palavras seguindo briefing:\n\n"
        "Regras:\n"
        "- Keyword primária no H1, primeiro parágrafo e 2-3 vezes no corpo\n"
        "- Keywords secundárias distribuídas naturalmente\n"
        "- Parágrafos curtos (2-4 linhas)\n"
        "- Listas e tabelas quando fizer sentido\n"
        "- Experiência pessoal do autor (E-E-A-T)\n"
        "- Dados/estatísticas com fontes\n"
        "- Internal links sugeridos em [colchetes]\n"
        "- FAQ no final (5 perguntas)\n\n"
        "Tom: técnico mas acessível. Sem adjetivos vazios. Sem clichês."),
    h3("4. Meta tags otimizadas"),
    prompt_block("PROMPT — Meta tags",
        "Você é especialista em CTR de SERP.\n\n"
        "Página: [URL/TÍTULO]. Keyword: [KEYWORD].\n"
        "Concorrentes no top 3: [LISTA].\n\n"
        "Tarefa: Gere 5 variações de:\n\n"
        "1. Title tag (máx 60 chars) — deve ter keyword + gancho\n"
        "2. Meta description (máx 155 chars) — deve ter keyword + CTA implícito\n\n"
        "Análise: para cada variação, explique por que pode superar concorrentes.\n"
        "Distribua variações em 3 ângulos:\n"
        "(A) Informacional direto\n"
        "(B) Com número/stat\n"
        "(C) Com pergunta\n\n"
        "Formato: tabela com Title | Meta | Ângulo | Justificativa"),
    h3("5. Schema markup (JSON-LD)"),
    prompt_block("PROMPT — Schema markup",
        "Você é desenvolvedor SEO especializado em dados estruturados.\n\n"
        "Tipo de conteúdo: [TIPO — Article, FAQPage, HowTo, Product, Review].\n"
        "Dados disponíveis: [DESCRIÇÃO DO CONTEÚDO].\n\n"
        "Tarefa: Gere JSON-LD schema markup válido e completo:\n\n"
        "1. Use schema.org correto para o tipo\n"
        "2. Inclua todas as propriedades obrigatórias\n"
        "3. Inclua propriedades recomendadas\n"
        "4. Valide sintaxe JSON\n"
        "5. Adicione comentários explicando cada bloco\n\n"
        "Formato: código pronto pra colar no <head> da página."),
    h3("6. Cluster de conteúdo"),
    prompt_block("PROMPT — Cluster de conteúdo",
        "Você é estrategista de content marketing.\n\n"
        "Pilar: [TEMA GERAL]. Ex: \"IA para criadores\".\n"
        "Marca: [SUA MARCA]. Audiência: [PÚBLICO].\n\n"
        "Tarefa: Construa cluster de conteúdo:\n\n"
        "1. Artigo pilar (definição, scope, 3000+ palavras)\n"
        "2. 8 artigos de cluster (cada um cobrindo sub-tema)\n"
        "3. Para cada cluster: título, keyword, ângulo, internal links sugeridos\n"
        "4. Estratégia de interlinking (cluster ↔ pilar, cluster ↔ cluster)\n"
        "5. Ordem de produção recomendada (prioridade por oportunidade)\n"
        "6. Calendário de publicação (8 semanas)\n\n"
        "Formato: tabela + mapa visual em texto."),
    h3("7. Atualização de conteúdo existente"),
    prompt_block("PROMPT — Atualizar artigo antigo",
        "Você é editor de SEO focado em conteúdo histórico.\n\n"
        "Artigo: [URL/TÍTULO]. Data original: [DATA].\n"
        "Conteúdo atual: [COLE O TEXTO].\n\n"
        "Tarefa: Revise e sugira atualizações:\n\n"
        "1. Informações desatualizadas (com sugestão de novo dado)\n"
        "2. Estatísticas que precisam de fonte atualizada\n"
        "3. Seções que faltam (com base em PAA atual)\n"
        "4. Formato: adicionar lista/tabela/schema\n"
        "5. Internal links que faltam\n"
        "6. CTAs que devem ser atualizados\n"
        "7. Sugestões para aumentar dwell time\n\n"
        "Formato: tabela com Seção | Problema | Sugestão"),
    h3("8. FAQ para featured snippet"),
    prompt_block("PROMPT — FAQ otimizado para snippet",
        "Você é especialista em featured snippets do Google.\n\n"
        "Tema: [TEMA]. Keyword: [KEYWORD].\n\n"
        "Tarefa: Gere 10 perguntas FAQ que podem virar featured snippet:\n\n"
        "1. Perguntas baseadas em PAA do Google\n"
        "2. Cada resposta: 40-60 palavras (tamanho ideal para snippet)\n"
        "3. Resposta começa com definição direta\n"
        "4. Use listas ou tabelas quando possível\n"
        "5. Sem links externos nas respostas (vaza SEO)\n\n"
        "Formato: <details><summary>pergunta</summary>resposta</details>"),
    h3("9. Internal linking estratégico"),
    prompt_block("PROMPT — Estratégia de internal linking",
        "Você é especialista em SEO técnico.\n\n"
        "Páginas do site (lista): [COLE LISTA DE URLs E TÍTULOS].\n"
        "Página foco (queremos ranquear): [URL].\n\n"
        "Tarefa: Sugira estratégia de internal linking:\n\n"
        "1. Top 5 páginas que devem linkar para [URL foco]\n"
        "2. Anchor text sugerido (variado, natural)\n"
        "3. Posição do link (contexto ideal)\n"
        "4. Razão pela qual cada link faz sentido\n"
        "5. Páginas que [URL foco] deve linkar (para fora)\n\n"
        "Formato: tabela com Página | Anchor sugerido | Contexto"),
    h3("10. Análise de concorrentes"),
    prompt_block("PROMPT — Análise de SERP",
        "Você é analista de SEO competitivo.\n\n"
        "Keyword: [KEYWORD]. Top 10 resultados: [COLE URLs].\n\n"
        "Tarefa: Analise o cenário competitivo:\n\n"
        "1. Para cada um dos 10: tipo de conteúdo (tutorial, lista, opinião),\n"
        "   tamanho (palavras), formato, domínio, autoridade aparente\n"
        "2. Padrões comuns: o que todos fazem\n"
        "3. Gaps: o que ninguém cobre bem\n"
        "4. Sugestão de ângulo para superar todos\n"
        "5. Diferencial que podemos criar (dados próprios, expertise, etc.)\n\n"
        "Formato: tabela + parágrafo de estratégia."),
    callout("Insight crítico", "IA não substitui expertise. IA + expertise = conteúdo que ranqueia. IA sem expertise = conteúdo que padece. Adicione os 30% de E-E-A-T sempre."),
    exercise_box("Otimize 1 artigo esta semana", [
        "Escolha 1 artigo antigo do seu blog.",
        "Use o prompt de atualização (prompt #7).",
        "Implemente 5 sugestões que a IA apontar.",
        "Republique com data atualizada.",
        "Acompanhe posição no Google por 30 dias.",
    ]),
]


# ============ CAPÍTULO 7 ============
CHAPTER_7 = [
    body_lead("Social media é volume + qualidade. Sem prompts, você se esgota. Com prompts, escala sem perder voz. Vamos dominar Instagram, LinkedIn, TikTok e X."),
    h2("Prompts para Instagram"),
    h3("1. Carrossel educativo (10 slides)"),
    prompt_block("PROMPT — Carrossel IG educativo",
        "Você é estrategista de Instagram focado em carrosséis educativos.\n\n"
        "Tema: [TEMA]. Público: [PÚBLICO].\n\n"
        "Tarefa: Estruture carrossel de 10 slides:\n\n"
        "Slide 1 (capa): headline impactante + subhead\n"
        "Slide 2: por que esse tema importa\n"
        "Slides 3-8: 6 pontos/dicas numeradas\n"
        "Slide 9: resumo em 1 parágrafo\n"
        "Slide 10: CTA (salvar, compartilhar, seguir)\n\n"
        "Para cada slide:\n"
        "- Título do slide (máx 8 palavras)\n"
        "- Texto do slide (máx 30 palavras)\n"
        "- Sugestão visual (ícone, foto, ilustração)\n\n"
        "Tom: direto. Sem emojis. Sem 'descubra', 'aprenda'."),
    h3("2. Legenda de Reels/Posts"),
    prompt_block("PROMPT — Legenda engajadora",
        "Você é copywriter de Instagram especializado em legendas que geram comentários.\n\n"
        "Conteúdo do post: [DESCRIÇÃO]. Objetivo: [ENGAJAMENTO/SALVAMENTO/DM].\n\n"
        "Tarefa: Escreva 3 variações de legenda:\n\n"
        "(A) Storytelling: começa com história pessoal\n"
        "(B) Lista: começa com promessa + bullets\n"
        "(C) Provocação: começa com opinião ousada\n\n"
        "Para cada:\n"
        "- Primeira linha que para o scroll (após 'ver mais')\n"
        "- Corpo (máx 150 palavras)\n"
        "- 5 hashtags relevantes (não genéricas)\n"
        "- CTA único\n\n"
        "Tom: conversacional, primeiro pessoa."),
    h3("3. Bio de Instagram"),
    prompt_block("PROMPT — Bio de Instagram",
        "Você é personal branding strategist.\n\n"
        "Nome: [NOME]. Nicho: [NICHO]. Proposta de valor: [VALOR].\n"
        "Credencial: [CREDENCIAL]. Audiência: [PÚBLICO].\n\n"
        "Tarefa: Gere 5 variações de bio de Instagram:\n\n"
        "Estrutura (3 linhas + CTA):\n"
        "Linha 1: quem você é + para quem\n"
        "Linha 2: o que você entrega (resultado)\n"
        "Linha 3: credencial ou prova\n"
        "Linha 4 (CTA): 'link na bio' ou 'comenta [PALAVRA]'\n\n"
        "Regras:\n"
        "- Máximo 150 caracteres totais\n"
        "- Sem emojis em excesso (máximo 2)\n"
        "- Uma ideia por linha\n"
        "- Português brasileiro"),
    h2("Prompts para LinkedIn"),
    h3("4. Post de LinkedIn (storytelling profissional)"),
    prompt_block("PROMPT — Post LinkedIn",
        "Você é ghostwriter de LinkedIn para executivos e fundadores.\n\n"
        "Autor: [NOME, CARGO, EMPRESA]. Story: [DESCRIÇÃO DA EXPERIÊNCIA].\n"
        "Aprendizado: [INSIGHT]. Audiência: [PÚBLICO PROFISSIONAL].\n\n"
        "Tarefa: Post de LinkedIn seguindo estrutura:\n\n"
        "1. Hook (1 linha que para o scroll, máx 12 palavras)\n"
        "2. Contexto (2-3 linhas)\n"
        "3. Story (3-4 parágrafos curtos, 1 linha cada)\n"
        "4. Virada (1 linha isolada)\n"
        "5. Aprendizado (3-5 bullets)\n"
        "6. Pergunta pra audiência (CTA)\n\n"
        "Tamanho: 200-300 palavras. Tom: profissional mas pessoal. Sem hashtags."),
    h3("5. Article de LinkedIn (longo)"),
    prompt_block("PROMPT — Article LinkedIn (1500 palavras)",
        "Você é editor de LinkedIn articles para thought leaders.\n\n"
        "Tema: [TEMA]. Tese: [TESE]. Audiência: [PÚBLICO].\n"
        "Dados próprios: [DADOS].\n\n"
        "Tarefa: Article de 1500 palavras:\n\n"
        "1. Headline (máx 80 chars, sem clickbait)\n"
        "2. Subhead (1 linha)\n"
        "3. Hook (2-3 linhas que geram identificação)\n"
        "4. Contexto (1 parágrafo)\n"
        "5. 3-4 seções com H2\n"
        "6. Para cada seção: dado + análise + exemplo\n"
        "7. Conclusão (1 parágrafo + CTA pra comentar)\n\n"
        "Tom: executivo, opinativo. Sem jargão corporativo. Sem 'synergy', 'paradigm'."),
    h2("Prompts para TikTok"),
    h3("6. Roteiro TikTok (15s viral)"),
    prompt_block("PROMPT — Roteiro TikTok 15s",
        "Você é criador de TikTok com 1M+ seguidores.\n\n"
        "Tema: [TEMA]. Nicho: [NICHO]. Trend atual: [TREND].\n\n"
        "Tarefa: Roteiro de 15s seguindo:\n\n"
        "[0-2s] Hook visual + verbal (sem introdução)\n"
        "[2-10s] Desenvolvimento rápido (1 ideia só)\n"
        "[10-13s] Twist ou payoff\n"
        "[13-15s] CTA implícito (curtir, salvar)\n\n"
        "Regras:\n"
        "- Máximo 35 palavras totais\n"
        "- 1 locução por segundo\n"
        "- Cortes a cada 2-3 segundos\n"
        "- Sem 'galera', 'pessoal', 'gente'\n"
        "- Energia alta do início ao fim"),
    h3("7. Série TikTok (5 partes)"),
    prompt_block("PROMPT — Série TikTok",
        "Você é estrategista de séries no TikTok.\n\n"
        "Tema: [TEMA COMPLEXO]. Audiência: [PÚBLICO].\n\n"
        "Tarefa: Crie série de 5 TikToks:\n\n"
        "Parte 1: 'O que ninguém te conta sobre [TEMA]' — provocação\n"
        "Parte 2: 'Por que isso acontece' — explicação\n"
        "Parte 3: 'Como mudar isso' — tutorial\n"
        "Parte 4: 'Erros comuns ao tentar' — armadilhas\n"
        "Parte 5: 'Resultado real (case)' — prova\n\n"
        "Para cada parte: roteiro de 20s + gancho + CTA pra próxima parte."),
    h2("Prompts para X (Twitter)"),
    h3("8. Thread viral no X"),
    prompt_block("PROMPT — Thread no X (10 tweets)",
        "Você é creator de threads no X com 100k+ seguidores.\n\n"
        "Tema: [TEMA]. Tese: [TESE]. Audiência: [PÚBLICO].\n\n"
        "Tarefa: Thread de 10 tweets:\n\n"
        "Tweet 1: Hook (máx 280 chars, gancho brutal)\n"
        "Tweet 2: Contexto (por que isso importa)\n"
        "Tweets 3-7: Conteúdo (1 ideia por tweet)\n"
        "Tweet 8: Dado/prova\n"
        "Tweet 9: Aplicação prática\n"
        "Tweet 10: CTA (segue, RT, comenta)\n\n"
        "Cada tweet: máx 280 chars. Hook de cada um na primeira linha."),
    h3("9. Tweet isolado que viraliza"),
    prompt_block("PROMPT — 10 tweets virais",
        "Você é creator de tweets virais no X.\n\n"
        "Tema: [TEMA]. Tom: [DIRETO/IRÔNICO/INSPIRADOR].\n\n"
        "Tarefa: 10 tweets que podem viralizar:\n\n"
        "Distribua:\n"
        "- 3 stat shock (número surpreendente)\n"
        "- 3 contrarian (opinião contra senso comum)\n"
        "- 2 list (formato 'X coisas que')\n"
        "- 2 question (pergunta provocativa)\n\n"
        "Cada tweet:\n"
        "- Máximo 230 caracteres (deixa espaço pra RT)\n"
        "- Sem hashtag\n"
        "- Sem link\n"
        "- Hook na primeira linha"),
    h2("Prompts para YouTube"),
    h3("10. Título + Thumbnail para YouTube"),
    prompt_block("PROMPT — Título + Thumbnail YT",
        "Você é estrategista de YouTube com foco em CTR.\n\n"
        "Vídeo: [TÍTULO/TEMA]. Duração: [N] min. Audiência: [PÚBLICO].\n\n"
        "Tarefa: Gere 10 pares de título + thumbnail:\n\n"
        "Para cada:\n"
        "1. Título (máx 70 chars, com keyword + gancho)\n"
        "2. Thumbnail: descrição visual detalhada\n"
        "   - Rosto (expressão)\n"
        "   - Texto na thumbnail (máx 4 palavras)\n"
        "   - Cores (contraste)\n"
        "   - Setas/círculos (se necessário)\n"
        "3. Justificativa (por que esse par tem potencial de CTR alto)\n\n"
        "Formato: tabela Título | Thumbnail | Justificativa"),
    callout("Insight multiplataforma", "Mesma ideia, formatos diferentes. Use o prompt #6 do capítulo 4 (Reels) e adapte para TikTok, Shorts e Stories. Repurpose > criar do zero."),
    exercise_box("Produza 1 peça por plataforma esta semana", [
        "Escolha 1 ideia central (ex: 'produtividade matinal').",
        "Use os prompts para gerar: 1 Reels, 1 carrossel IG, 1 post LinkedIn, 1 TikTok, 1 thread X.",
        "Mesma ideia, 5 formatos. Aproveite o repurpose.",
        "Publique. Meça engajamento por plataforma.",
        "Identifique plataforma campeã. Foque nela por 30 dias.",
    ]),
]


# ============ CAPÍTULO 8 ============
CHAPTER_8 = [
    body_lead("Prompt bom não tem a ver com texto. Tem a ver com análise. IA é a sua camada de inteligência sobre dados. Neste capítulo, prompts para extrair insight de planilhas, métricas, pesquisas."),
    h2("IA como analista de dados"),
    body("Você não precisa ser data scientist. IA pode cruzar dados, identificar padrões, gerar insights em segundos. O segredo é saber perguntar."),
    h2("10 prompts para análise"),
    h3("1. Análise de métricas de conteúdo"),
    prompt_block("PROMPT — Análise de Reels (CSV)",
        "Você é analista de social media focado em criadores.\n\n"
        "Métricas dos últimos 30 Reels (CSV):\n[COLE CSV AQUI]\n\n"
        "Tarefa: Analise e responda:\n\n"
        "1. Top 5 vídeos por taxa de salvamento. O que têm em comum?\n"
        "2. Bottom 5 vídeos por retenção aos 3s. O que houve?\n"
        "3. Melhor horário/dia pra postar (com base em engagement rate)\n"
        "4. Padrão de gancho que mais performa\n"
        "5. Padrão de CTA que mais converte\n"
        "6. Tamanho ideal de vídeo (segundos) para essa audiência\n"
        "7. Recomendação: 3 mudanças para próximos 10 vídeos\n\n"
        "Mostre números. Não generalize."),
    h3("2. Análise de cohort de assinantes"),
    prompt_block("PROMPT — Cohort analysis",
        "Você é analista de retention de newsletter.\n\n"
        "Dados de cohorts (CSV):\n[COLE CSV]\n\n"
        "Tarefa: Analise cohorts de assinantes:\n\n"
        "1. Retenção semanal por cohort (semana 1 a 12)\n"
        "2. Cohort com maior retenção — o que fizemos diferente naquele mês?\n"
        "3. Cohort com pior retenção — o que houve?\n"
        "4. Padrão de churn (quando as pessoas cancelam)\n"
        "5. Ação recomendada para os próximos 30 dias\n\n"
        "Formato: tabela de cohorts + insights em bullets."),
    h3("3. Análise de sentimento de comentários"),
    prompt_block("PROMPT — Sentiment analysis",
        "Você é analista de customer experience.\n\n"
        "Comentários do último vídeo (lista):\n[COLE COMENTÁRIOS]\n\n"
        "Tarefa: Faça análise de sentimento:\n\n"
        "1. Classifique cada comentário: positivo, neutro, negativo, misto\n"
        "2. Identifique 3 temas mais mencionados\n"
        "3. Identifique 3 objeções/dúvidas mais frequentes\n"
        "4. Identifique oportunidades de conteúdo (perguntas não respondidas)\n"
        "5. Identifique haters vs críticas construtivas\n"
        "6. Sugestões: 3 ideias de vídeo baseadas nos comentários\n\n"
        "Formato: tabela + insights em bullets."),
    h3("4. Análise de pesquisa com audiência"),
    prompt_block("PROMPT — Pesquisa qualitativa",
        "Você é pesquisador de mercado.\n\n"
        "Respostas da pesquisa (lista):\n[COLE RESPOSTAS]\n\n"
        "Tarefa: Analise respostas abertas:\n\n"
        "1. Codifique respostas em 5-7 temas principais\n"
        "2. Para cada tema: frequência, exemplo representativo\n"
        "3. Insights acionáveis (não descrição, mas 'o que fazer')\n"
        "4. Personas emergentes (3-5 perfis distintos)\n"
        "5. Dores não endereçadas pelo produto atual\n"
        "6. Oportunidades de novo produto/conteúdo\n\n"
        "Formato: tabela de temas + insights + recomendações."),
    h3("5. Análise de funil de vendas"),
    prompt_block("PROMPT — Funil de vendas",
        "Você é analista de growth.\n\n"
        "Dados do funil (CSV):\n[COLE]\n\n"
        "Tarefa: Analise funil de vendas:\n\n"
        "1. Para cada etapa: taxa de conversão\n"
        "2. Maior drop-off (onde mais perdemos gente)\n"
        "3. Benchmark: como está vs. mercado\n"
        "4. 3 alavancas prioritárias para melhorar\n"
        "5. Hipóteses de teste A/B para cada alavanca\n"
        "6. Previsão de impacto se cada alavanca melhorar 20%\n\n"
        "Formato: tabela de funil + insights + plano de ação."),
    h3("6. Previsão de receita"),
    prompt_block("PROMPT — Forecast de receita",
        "Você é analista financeiro de creator economy.\n\n"
        "Receita últimos 12 meses (CSV):\n[COLE]\n\n"
        "Tarefa: Forecast para próximos 6 meses:\n\n"
        "1. Tendência (crescimento/declínio/estável)\n"
        "2. Sazonalidade identificada\n"
        "3. Previsão conservadora, base, otimista\n"
        "4. Fatores que podem impactar (positivos e negativos)\n"
        "5. Recomendações para alcançar cenário otimista\n"
        "6. Alertas: o que monitorar mensalmente\n\n"
        "Formato: tabela + gráfico descrito em texto + insights."),
    h3("7. Análise de concorrentes"),
    prompt_block("PROMPT — Competitive analysis",
        "Você é estrategista competitivo.\n\n"
        "Concorrentes (lista):\n[COLE]\n\n"
        "Tarefa: Análise comparativa:\n\n"
        "1. Para cada concorrente: posicionamento, público, oferta, preço\n"
        "2. Matrix de posicionamento (eixo X: preço, Y: qualidade percebida)\n"
        "3. Gaps de mercado (o que ninguém oferece bem)\n"
        "4. Ameaças (quem pode comer seu mercado)\n"
        "5. Oportunidades (parceria, aquisição, expansão)\n"
        "6. 3 moves estratégicos recomendados\n\n"
        "Formato: tabela + matrix visual em texto + plano de ação."),
    h3("8. Análise de ROI por canal"),
    prompt_block("PROMPT — ROI por canal",
        "Você é analista de marketing attribution.\n\n"
        "Investimento e retorno por canal (CSV):\n[COLE]\n\n"
        "Tarefa: Analise ROI por canal:\n\n"
        "1. Para cada canal: custo, receita, ROI, CAC, LTV\n"
        "2. Canal com melhor ROI (e por quê)\n"
        "3. Canal com pior ROI (e por quê)\n"
        "4. Realocação recomendada (orçamento total fixo)\n"
        "5. Canais para testar (ainda não usados)\n"
        "6. Canais para pausar\n\n"
        "Formato: tabela + recomendações em bullets."),
    h3("9. Análise de texto (livros, artigos, transcripts)"),
    prompt_block("PROMPT — Análise de texto longo",
        "Você é research analyst.\n\n"
        "Texto para análise (livro, artigo, transcript):\n[COLE TEXTO]\n\n"
        "Tarefa: Extraia:\n\n"
        "1. Tese central (1 frase)\n"
        "2. 5 argumentos principais (1 linha cada)\n"
        "3. 3 dados/estatísticas mais relevantes\n"
        "4. 3 contra-argumentos possíveis\n"
        "5. Aplicações práticas para criadores de conteúdo\n"
        "6. 5 ideias de conteúdo derivadas (post, vídeo, carrossel)\n\n"
        "Formato: relatório estruturado."),
    h3("10. Geração de relatório executivo"),
    prompt_block("PROMPT — Relatório executivo",
        "Você é chief of staff de creator business.\n\n"
        "Dados da semana (múltiplas fontes):\n[COLE]\n\n"
        "Tarefa: Relatório executivo semanal:\n\n"
        "1. Resumo em 3 bullets (o que aconteceu)\n"
        "2. Métricas-chave (views, receita, novos seguidores)\n"
        "3. Variação vs semana anterior (com %)\n"
        "4. Top 3 conteúdos da semana\n"
        "5. Bottom 3 conteúdos da semana\n"
        "6. Insight: o que aprendemos\n"
        "7. Ação: 3 prioridades para próxima semana\n\n"
        "Formato: 1 página, exec-ready."),
    callout("Dica de análise", "Sempre peça pra IA mostrar números base. 'Padrão X' sem número é suspeito. 'Padrão X (87% dos vídeos)' é confiável."),
    exercise_box("Analise seu último mês", [
        "Export métricas dos últimos 30 dias (IG, YouTube, newsletter).",
        "Use o prompt #1 de análise de métricas.",
        "Identifique 3 padrões que você não sabia.",
        "Escolha 1 padrão para agir nos próximos 5 conteúdos.",
        "Refaça a análise em 30 dias. Mediu impacto?",
    ]),
]


# ============ CAPÍTULO 9 ============
CHAPTER_9 = [
    body_lead("Ideia é commodity. Boas ideias em escala são diferenciais. Neste capítulo, prompts para brainstormar topics, ângulos, séries, products — em velocidade industrial."),
    h2("Por que criadores travam na ideação"),
    body("Todo criador já sentou pra gravar e a tela estava em branco. Não é falta de criatividade — é falta de sistema. Prompts transformam ideia em processo."),
    illustration_image(prompt_iteration_cycle(), 12 * cm),
    caption("Figura 9.1 — Ciclo de iteração: prompt, avaliar, identificar gaps, refinar. Repita."),
    h2("10 prompts para brainstorming"),
    h3("1. 30 ideias de conteúdo em 5 minutos"),
    prompt_block("PROMPT — 30 ideias para Reels",
        "Você é estrategista de conteúdo de criador de [NICHO].\n\n"
        "Contexto: Sou [NOME], atuo há [N] anos em [ÁREA].\n"
        "Audiência: [PÚBLICO]. Pain points: [LISTA 3 DORES].\n\n"
        "Tarefa: Gere 30 ideias de Reels, distribuídas:\n\n"
        "10 educativos (tutorial/dica)\n"
        "5 storytelling (história pessoal)\n"
        "5 bastidores (behind-the-scenes)\n"
        "5 polêmicos (opinião contrária)\n"
        "5 lists (formato lista)\n\n"
        "Para cada ideia: 1 linha de título + 1 linha de gancho.\n"
        "Sem descrição longa. Só ideia + gancho."),
    h3("2. Repurpose de conteúdo existente"),
    prompt_block("PROMPT — Repurpose",
        "Você é estrategista de content repurposing.\n\n"
        "Conteúdo original (transcript/artigo):\n[COLE]\n\n"
        "Tarefa: Sugira 10 formas de repurpose:\n\n"
        "1. 3 Reels de 30s (com ganchos diferentes)\n"
        "2. 2 carrosséis de Instagram (8-10 slides)\n"
        "3. 2 posts de LinkedIn (200 palavras)\n"
        "4. 1 thread no X (8 tweets)\n"
        "5. 1 newsletter (500 palavras)\n"
        "6. 1 vídeo YouTube Shorts (45s)\n\n"
        "Para cada: headline/primeira linha + estrutura de 1 linha."),
    h3("3. Séries de conteúdo"),
    prompt_block("PROMPT — Série de 5 episódios",
        "Você é showrunner de séries de conteúdo digital.\n\n"
        "Tema: [TEMA]. Plataforma: [IG/TIKTOK/YT].\n"
        "Audiência: [PÚBLICO]. Objetivo: [ENGAJAMENTO/AUTORIDADE/VENDA].\n\n"
        "Tarefa: Crie série de 5 episódios:\n\n"
        "Estrutura narrativa:\n"
        "Ep 1: Estabelece problema/promessa\n"
        "Ep 2: Aprofunda contexto\n"
        "Ep 3: Virada/método\n"
        "Ep 4: Aplicação prática\n"
        "Ep 5: Resultado + CTA\n\n"
        "Para cada episódio: título, gancho, desenvolvimento (1 linha), CTA.\n"
        "Cronograma: 1 episódio por dia/semana."),
    h3("4. Ideias a partir de trends"),
    prompt_block("PROMPT — Trends do nicho",
        "Você é trend researcher para criadores.\n\n"
        "Nicho: [NICHO]. País: Brasil. Plataforma: [IG/TIKTOK/YT].\n\n"
        "Tarefa: Identifique 10 trends atuais que esse nicho pode aproveitar:\n\n"
        "1. Para cada trend: nome, descrição, por que está em alta\n"
        "2. Ângulo de adaptação para o nicho\n"
        "3. Exemplo de título/gancho\n"
        "4. Janela de oportunidade (quanto tempo antes de saturar)\n"
        "5. Risco: se errou a leitura, como recuperar\n\n"
        "Formato: tabela."),
    h3("5. Ideias de produto/serviço"),
    prompt_block("PROMPT — 10 ideias de produto",
        "Você é product strategist de creator economy.\n\n"
        "Criador: [NOME], nicho [NICHO], audiência [TAMANHO].\n"
        "Recursos: [SKILLS/TEMPO/CAPITAL].\n\n"
        "Tarefa: 10 ideias de produto/serviço para lançar:\n\n"
        "Distribuição:\n"
        "- 3 digital (e-book, curso, comunidade)\n"
        "- 3 serviço (consultoria, mentoria, done-for-you)\n"
        "- 2 físico (livro, merch)\n"
        "- 2 SaaS/app\n\n"
        "Para cada ideia: nome, proposta de valor, preço sugerido,\n"
        "esforço (1-10), potencial de receita (1-10), ROI esperado."),
    h3("6. Perguntas da audiência"),
    prompt_block("PROMPT — 50 perguntas para responder",
        "Você é pesquisador de audiência.\n\n"
        "Nicho: [NICHO]. Audiência: [PÚBLICO].\n"
        "Dores conhecidas: [LISTA].\n\n"
        "Tarefa: Liste 50 perguntas que essa audiência provavelmente tem:\n\n"
        "Distribuição:\n"
        "10 iniciante (perguntas básicas)\n"
        "15 intermediário (técnicas)\n"
        "15 avançado (estratégia)\n"
        "10 comportamental (medos, objeções)\n\n"
        "Para cada pergunta: 1 linha + nível (1-3) + ângulo de resposta."),
    h3("7. Brainstorm de hooks"),
    prompt_block("PROMPT — 20 hooks por tipo",
        "Você é copywriter de hooks para vídeos curtos.\n\n"
        "Tema: [TEMA]. Audiência: [PÚBLICO].\n\n"
        "Tarefa: 20 hooks, 4 por categoria:\n\n"
        "1. Pergunta aberta (curiosidade)\n"
        "2. Stat chocante (número surpreendente)\n"
        "3. Story pessoal (1 linha)\n"
        "4. Contrarian (opinião contra senso comum)\n"
        "5. Promessa direta (resultado em X)\n\n"
        "Cada hook: máximo 12 palavras. Sem 'descubra', 'aprenda'.\n"
        "Garantir retenção nos primeiros 3 segundos."),
    h3("8. Ideias a partir de dados próprios"),
    prompt_block("PROMPT — Conteúdo a partir de dados",
        "Você é data storyteller.\n\n"
        "Dados: [COLE — métricas, pesquisas, casos].\n\n"
        "Tarefa: Gere 10 ideias de conteúdo baseadas nesses dados:\n\n"
        "1. Para cada ideia: dado central + headline + ângulo\n"
        "2. Diferenciar formatos: Reels, carrossel, post, vídeo longo\n"
        "3. Priorizar por potencial de engajamento (alto/médio/baixo)\n"
        "4. Identificar qual dado tem maior potencial viral\n"
        "5. Sugerir visualização (gráfico, infográfico, número isolado)\n\n"
        "Formato: tabela."),
    h3("9. Brainstorm de parcerias"),
    prompt_block("PROMPT — Parcerias estratégicas",
        "Você é business development para creators.\n\n"
        "Criador: [NOME], nicho [NICHO], audiência [TAMANHO].\n\n"
        "Tarefa: Sugira 10 parcerias estratégicas:\n\n"
        "Distribuição:\n"
        "3 com creators do mesmo nicho (co-criação)\n"
        "3 com brands (sponsorship)\n"
        "2 com experts (entrevista/cross-promo)\n"
        "2 com produtos (afiliado/embaixador)\n\n"
        "Para cada: nome (se conhecido), proposta de valor mútuo,\n"
        "formato de parceria, potencial de alcance/receita."),
    h3("10. Brainstorm criativo aleatório"),
    prompt_block("PROMPT — Brainstorm criativo",
        "Você é diretor criativo que pensa fora da caixa.\n\n"
        "Nicho: [NICHO]. Audiência: [PÚBLICO].\n\n"
        "Tarefa: 15 ideias de conteúdo que NINGUÉM nesse nicho fez ainda:\n\n"
        "Regras:\n"
        "- Não vale formatos óbvios (tutorial, lista, story)\n"
        "- Misturar formatos (ex: Reels com áudio de podcast)\n"
        "- Brincar com plataforma (ex: thread de fotos no Reels)\n"
        "- ângulos insólitos (ex: produto visto pelo contrário)\n"
        "- Cada ideia deve ter elemento de surpresa\n\n"
        "Para cada: ideia (1 linha) + por que ninguém fez + risco."),
    callout("Princípio de brainstorm", "Quantidade gera qualidade. Os primeiros 10 outputs são clichês. Os próximos 10 são interessantes. Os últimos 10 são geniais. Peça sempre 20+ opções."),
    exercise_box("Faça seu banco de ideias semanal", [
        "Toda sexta, use o prompt #1 (30 ideias para Reels).",
        "Salve as 30 ideias no Notion (banco de ideias).",
        "Escolha 5 para a próxima semana.",
        "Marque as outras 25 como 'backlog'.",
        "Em 4 semanas: 120 ideias no banco. Cobre 3 meses de conteúdo.",
    ]),
]


# ============ CAPÍTULO 10 ============
CHAPTER_10 = [
    body_lead("Prompts avançados são pra quem já dominou o básico e quer extrair 10x mais dos modelos. Técnicas que profissionais de IA usam mas que criadores ainda desconhecem."),
    h2("Chain-of-Thought prompting"),
    body("Peça pra IA pensar antes de responder. Reduz alucinação em 80% em tarefas complexas."),
    prompt_block("PROMPT — Chain of thought",
        "Você é analista estratégico.\n\n"
        "Problema: [DESCRIÇÃO DO PROBLEMA COMPLEXO].\n\n"
        "Tarefa: Antes de responder, siga este processo:\n\n"
        "1. Primeiro, decomponha o problema em partes menores\n"
        "2. Liste 3 possíveis abordagens para cada parte\n"
        "3. Avalie prós e contras de cada abordagem\n"
        "4. Escolha a melhor combinação\n"
        "5. Justifique sua escolha com raciocínio explícito\n"
        "6. Só depois apresente a solução final\n\n"
        "Mostre seu raciocínio. Não pule etapas."),
    h2("Self-consistency"),
    body("Peça 3 respostas independentes e sintetize. Reduz viés e melhora qualidade."),
    prompt_block("PROMPT — Self-consistency",
        "Você é consultor estratégico.\n\n"
        "Questão: [PERGUNTA COMPLEXA].\n\n"
        "Tarefa: Gere 3 respostas independentes:\n\n"
        "Resposta 1: do ponto de vista conservador\n"
        "Resposta 2: do ponto de vista inovador\n"
        "Resposta 3: do ponto de vista analítico\n\n"
        "Depois, sintetize as 3 numa resposta final que combine os melhores\n"
        "argumentos de cada uma. Apresente a síntese com explicação de\n"
        "por que cada elemento foi incluído."),
    h2("Tree of thoughts"),
    body("Explore múltiplos caminhos em árvore. Bom pra decisões com várias variáveis."),
    prompt_block("PROMPT — Tree of thoughts",
        "Você é decisor estratégico.\n\n"
        "Decisão: [DESCRIÇÃO DA DECISÃO].\n\n"
        "Tarefa: Construa árvore de pensamentos:\n\n"
        "1. Liste 3 opções iniciais\n"
        "2. Para cada opção, liste 3 possíveis consequências (curto prazo)\n"
        "3. Para cada consequência, liste 3 desdobramentos (médio prazo)\n"
        "4. Para cada desdobramento, liste 3 cenários (longo prazo)\n"
        "5. Avalie cada caminho final: probabilidade × impacto\n"
        "6. Recomende o melhor caminho com justificativa\n\n"
        "Use notação de árvore (A.1, A.1.a, A.1.a.i, etc.)."),
    h2("Meta-prompting"),
    body("Peça pra IA gerar o prompt ideal antes de responder. Metacognição."),
    prompt_block("PROMPT — Meta-prompting",
        "Você é engenheiro de prompts sênior.\n\n"
        "Objetivo: [O QUE VOCÊ QUER ALCANÇAR].\n\n"
        "Tarefa:\n"
        "1. Primeiro, escreva o prompt ideal que eu deveria usar pra conseguir isso.\n"
        "2. Explique por que esse prompt funciona.\n"
        "3. Depois, execute o prompt você mesmo e dê a resposta.\n"
        "4. Avalie sua própria resposta: o que faltou? Como melhorar o prompt?\n"
        "5. Rode novamente com o prompt refinado.\n"
        "6. Apresente a versão final."),
    h2("Role-play com múltiplos agentes"),
    body("Simule um debate entre especialistas. Gera visões mais ricas."),
    prompt_block("PROMPT — Debate multi-agente",
        "Você vai simular um debate entre 3 especialistas.\n\n"
        "Tema: [TEMA].\n\n"
        "Agentes:\n"
        "- Especialista 1: [PERSPECTIVA A — ex: otimista de tecnologia]\n"
        "- Especialista 2: [PERSPECTIVA B — ex: crítico conservador]\n"
        "- Especialista 3: [PERSPECTIVA C — ex: pragmático de negócios]\n\n"
        "Tarefa: Conduza debate de 3 rodadas:\n\n"
        "Rodada 1: Cada especialista apresenta tese (3 parágrafos)\n"
        "Rodada 2: Cada um rebate os outros (3 parágrafos)\n"
        "Rodada 3: Cada um revisa posição (1 parágrafo)\n\n"
        "Final: Síntese dos pontos de convergência e divergência."),
    h2("Few-shot com casos próprios"),
    body("Forneça seus melhores outputs como exemplos. IA copia seu estilo."),
    prompt_block("PROMPT — Few-shot com seus cases",
        "Você é ghostwriter que aprende com exemplos.\n\n"
        "Tarefa: Aprenda com estes 3 exemplos e produza um novo no mesmo estilo.\n\n"
        "Exemplo 1:\n"
        "Input: [DESCRIÇÃO]\n"
        "Output: [SEU MELHOR OUTPUT]\n\n"
        "Exemplo 2:\n"
        "Input: [DESCRIÇÃO]\n"
        "Output: [SEU MELHOR OUTPUT]\n\n"
        "Exemplo 3:\n"
        "Input: [DESCRIÇÃO]\n"
        "Output: [SEU MELHOR OUTPUT]\n\n"
        "Agora faça:\n"
        "Input: [NOVO INPUT]\n"
        "Output: [RESPONDA NO MESMO ESTILO]"),
    h2("Constitutional prompting"),
    body("Defina princípios que a IA deve seguir. Vira guardrail ético."),
    prompt_block("PROMPT — Constitutional",
        "Você é assistente alinhado a estes princípios:\n\n"
        "1. Não usar adjetivos vazios (incrível, revolucionário, transformador)\n"
        "2. Não usar jargão corporativo (sinergia, paradigma, inovação disruptiva)\n"
        "3. Sempre citar fonte de dados/estatísticas\n"
        "4. Admitir incerteza quando não souber\n"
        "5. Não usar emojis\n"
        "6. Português brasileiro, tom direto\n"
        "7. Sempre oferecer 3 variações quando pedido\n"
        "8. Revisar próprio output antes de entregar\n\n"
        "Tarefa: [TAREFA]\n\n"
        "Antes de responder, confirme que está alinhado aos princípios."),
    h2("Reverse prompting"),
    body("Peça pra IA te fazer perguntas antes de responder. Garante briefing completo."),
    prompt_block("PROMPT — Reverse prompting",
        "Você é consultor que faz perguntas antes de propor soluções.\n\n"
        "Situação: [DESCRIÇÃO BREVE].\n\n"
        "Tarefa: Antes de propor solução, faça 7 perguntas que me ajudem a clarificar:\n\n"
        "1. Perguntas sobre objetivo\n"
        "2. Perguntas sobre restrições\n"
        "3. Perguntas sobre contexto\n"
        "4. Perguntas sobre audiência\n"
        "5. Perguntas sobre métricas\n"
        "6. Perguntas sobre prazo\n"
        "7. Perguntas sobre riscos\n\n"
        "Pergunte uma por vez. Espere resposta. Só então proponha solução."),
    h2("Prompt com schema de saída"),
    body("Defina exatamente o formato de saída em JSON, tabela, etc. Elimina retrabalho."),
    prompt_block("PROMPT — Schema JSON",
        "Você é API que retorna JSON.\n\n"
        "Tarefa: [TAREFA].\n\n"
        "Schema de saída (responda SOMENTE em JSON válido):\n\n"
        "{\n"
        "  \"titulos\": [\"string\", \"string\", \"string\"],\n"
        "  \"meta\": {\n"
        "    \"count\": 3,\n"
        "    \"tema\": \"string\",\n"
        "    \"audiencia\": \"string\"\n"
        "  },\n"
        "  \"sugestoes\": [\n"
        "    {\n"
        "      \"titulo\": \"string\",\n"
        "      \"gancho\": \"string\",\n"
        "      \"cta\": \"string\",\n"
        "      \"score_viral\": 0-10\n"
        "    }\n"
        "  ]\n"
        "}\n\n"
        "Sem texto fora do JSON. Sem markdown."),
    callout("Dica avançada", "Combine técnicas. Ex: chain-of-thought + few-shot + constitutional = output de qualidade premium. Custo: prompt mais longo, mas vale."),
    exercise_box("Teste 3 técnicas avançadas", [
        "Escolha 3 das técnicas deste capítulo (ex: chain-of-thought, meta-prompting, reverse prompting).",
        "Aplique cada uma em uma tarefa real sua (roteiro, copy, análise).",
        "Compare o output com seu prompt normal.",
        "Adote as 2 que trouxeram maior ganho.",
        "Documente no seu Notion como 'técnicas avançadas que uso'.",
    ]),
]


# ============ CAPÍTULO 11 ============
CHAPTER_11 = [
    body_lead("Biblioteca de terceiros é bom. Mas biblioteca própria é diferencial competitivo. Neste capítulo, sistema pra criar, organizar e evoluir sua própria biblioteca de prompts."),
    h2("Por que criar seus próprios prompts"),
    body("Prompts de terceiros são genéricos por definição. Não incorporam seu tom, sua audiência, seus cases. Seu próprio prompt é customizado — gera outputs que ninguém mais consegue."),
    body("Em 90 dias de disciplina, você terá biblioteca de 50+ prompts validados. Em 6 meses, 200+. Isso vira ativo. Diferencial que concorrente não compra."),
    h2("Framework para criar prompts do zero"),
    body("Processo de 5 etapas que uso pra criar qualquer novo prompt:"),
    numbered_list([
        "<b>Identificar tarefa repetitiva:</b> o que você faz 3+ vezes por semana? Dá pra virar prompt.",
        "<b>Escrever primeira versão:</b> rascunho solto, sem técnica. Só estrutura o que você quer.",
        "<b>Testar 3 vezes:</b> rodar em 3 inputs diferentes. Anotar padrões de falha.",
        "<b>Refinar com CREDE:</b> aplicar os 5 componentes do capítulo 1.",
        "<b>Documentar e versionar:</b> salvar no Notion com data, versão, exemplo de uso.",
    ]),
    h2("Template de documentação"),
    body("Cada prompt na sua biblioteca precisa de ficha. Template:"),
    prompt_block("TEMPLATE DE FICHA DE PROMPT",
        "## [NOME DO PROMPT]\n\n"
        "**Versão:** 1.0\n"
        "**Data:** [DATA]\n"
        "**Categoria:** [Categoria]\n"
        "**Objetivo:** [1 LINHA]\n"
        "**Ferramenta:** [ChatGPT/Claude/Gemini]\n"
        "**Tempo médio de execução:** [N] min\n\n"
        "### Prompt\n"
        "[PROMPT COMPLETO]\n\n"
        "### Variáveis\n"
        "- [VAR1]: descrição\n"
        "- [VAR2]: descrição\n\n"
        "### Exemplo de uso\n"
        "Input: [EXEMPLO]\n"
        "Output: [EXEMPLO]\n\n"
        "### Avaliação\n"
        "- Qualidade média do output: 8/10\n"
        "- Taxa de uso direto (sem reescrita): 70%\n"
        "- Melhorias pendentes: [LISTA]\n\n"
        "### Histórico de versões\n"
        "- v1.0: versão inicial\n"
        "- v1.1: [MELHORIA]"),
    h2("Sistema de organização"),
    body("Como organizar biblioteca pra escalar sem virar caos. Sistema em 3 níveis:"),
    h3("Nível 1: por categoria"),
    body("Pastas principais: Reels, Email, SEO, Social, Analytics, Brainstorm, Avançado. Máximo 10 categorias. Mais que isso, virou bagunça."),
    h3("Nível 2: por objetivo"),
    body("Dentro de cada categoria, sub-pastas por objetivo. Ex em Reels: Educativo, Storytelling, Venda, Bastidor. Cada sub-pasta: 5-10 prompts."),
    h3("Nível 3: por versão"),
    body("Cada prompt tem versões. Sempre mantenha a versão atual como \"[Nome]_v3.md\". Anteriores em pasta \"_archive\". Nunca apague — pode querer voltar."),
    h2("Versionamento de prompts"),
    body("Por que versionar? Por que prompts evoluem. V1 pode ser fraca. V3 é premium. Sem versionamento, você usa versão errada e não sabe."),
    body("Convenção que uso:"),
    bullet_list([
        "<b>v1.0:</b> primeira versão, ainda sem refinamento.",
        "<b>v1.1, v1.2:</b> pequenas correções (ajustes de tom, restrição).",
        "<b>v2.0:</b> reformulação (mudou estrutura, adicionou few-shot).",
        "<b>v3.0:</b> reformulação maior (mudou framework, exemplo).",
    ]),
    h2("Quando revisar prompts"),
    body("Prompts não são estáticos. Revisite a cada 90 dias. Perguntas:"),
    bullet_list([
        "Ainda uso esse prompt? Se não, arquive.",
        "Output ainda é bom? Se não, refine.",
        "Tenho exemplo melhor pra usar como few-shot? Se sim, atualize.",
        "Ferramenta mudou (ex: nova versão do Claude)? Re-teste.",
        "Audiência mudou? Atualize contexto.",
    ]),
    h2("Compartilhar biblioteca com equipe"),
    body("Se você tem equipe, biblioteca de prompts é asset coletivo. Sistema:"),
    numbered_list([
        "Notion compartilhado com database de prompts.",
        "Cada prompt tem \"owner\" (responsável).",
        "Reunião mensal: revisar prompts, sugerir melhorias, aposentar.",
        "Onboarding: novos membros leem biblioteca no primeiro dia.",
        "Métrica: prompts mais usados no mês. Indica o que está funcionando.",
    ]),
    callout("Asset de longo prazo", "Sua biblioteca de prompts é o IP da sua operação de conteúdo. Vale mais que seguidores. Vira diferencial competitivo que ninguém copia."),
    exercise_box("Crie sua biblioteca esta semana", [
        "Crie um Notion (ou Obsidian) chamado 'Biblioteca de Prompts'.",
        "Crie as 10 categorias do nível 1.",
        "Pegue os 50+ prompts deste e-book e popule a biblioteca.",
        "Adicione ficha completa para cada (use o template).",
        "Defina: toda sexta, dedique 30 min pra adicionar 1 prompt novo.",
    ]),
]


# ============ CAPÍTULO 12 ============
CHAPTER_12 = [
    body_lead("Você chegou à biblioteca. 100+ prompts organizados por categoria, prontos pra usar. Neste capítulo, índice completo e como usar."),
    illustration_image(prompt_categories_pie(), 13 * cm),
    caption("Figura 12.1 — Distribuição dos 100+ prompts por categoria. Copywriting lidera; analytics cresce."),
    h2("Índice completo de prompts"),
    body("Lista de todos os prompts deste e-book, organizados por categoria. Use como referência rápida."),
    h3("Copywriting (22 prompts)"),
    bullet_list([
        "<b>Cap. 1:</b> Prompt vago vs premium (referência).",
        "<b>Cap. 3:</b> 10 prompts para Reels (1-10).",
        "<b>Cap. 4:</b> 20 headlines variadas, email 4Ps, anúncio FB/IG, VSL, microcopy, CTAs em 3 níveis (6 prompts).",
        "<b>Cap. 7:</b> Carrossel IG, legenda, bio, post LinkedIn, article LinkedIn, TikTok 15s, série TikTok, thread X, tweet viral, título+thumbnail YT (10 prompts).",
        "<b>Cap. 8:</b> Análise de sentimento, análise de cohort (relacionados a copy).",
        "<b>Cap. 9:</b> 30 ideias Reels, repurpose, série, trends, hooks, ideias a partir de dados, brainstorm criativo (7 prompts).",
    ]),
    h3("Roteiro de Reels (18 prompts)"),
    bullet_list([
        "<b>Cap. 3:</b> Reels educativo, storytelling, venda, bastidor, case, lista, polêmico, transformação, Q&A, trend (10 prompts).",
        "<b>Cap. 4:</b> Anúncio FB/IG (relacionado).",
        "<b>Cap. 7:</b> TikTok 15s, série TikTok (2 prompts).",
        "<b>Cap. 9:</b> Hooks por tipo (1 prompt).",
        "<b>Cap. 10:</b> Few-shot com seus cases, meta-prompting (relacionados).",
    ]),
    h3("SEO / Blog (14 prompts)"),
    bullet_list([
        "<b>Cap. 6:</b> Análise de intenção, briefing de artigo, escrita de artigo, meta tags, schema markup, cluster de conteúdo, atualização de artigo, FAQ para snippet, internal linking, análise de SERP (10 prompts).",
        "<b>Cap. 8:</b> Análise de texto longo (relacionado).",
        "<b>Cap. 10:</b> Reverse prompting, constitutional prompting (relacionados).",
    ]),
    h3("Social Media (12 prompts)"),
    bullet_list([
        "<b>Cap. 7:</b> Carrossel IG, legenda, bio IG, post LinkedIn, article LinkedIn, TikTok 15s, série TikTok, thread X, tweet viral, título+thumbnail YT (10 prompts).",
        "<b>Cap. 9:</b> Hooks por tipo (1 prompt).",
        "<b>Cap. 10:</b> Self-consistency (relacionado).",
    ]),
    h3("Email Marketing (10 prompts)"),
    bullet_list([
        "<b>Cap. 5:</b> Boas-vindas sequência, lançamento, carrinho abandonado, newsletter semanal, reengajamento, NPS/pesquisa, aniversário, carta aberta, upsell, despedida (10 prompts).",
    ]),
    h3("Brainstorming (9 prompts)"),
    bullet_list([
        "<b>Cap. 9:</b> 30 ideias Reels, repurpose, série de 5 episódios, trends do nicho, ideias de produto, 50 perguntas da audiência, hooks por tipo, ideias a partir de dados, parcerias, brainstorm criativo (10 prompts).",
    ]),
    h3("Análise de Dados (8 prompts)"),
    bullet_list([
        "<b>Cap. 8:</b> Análise de métricas Reels, cohort analysis, sentiment analysis, pesquisa qualitativa, funil de vendas, forecast de receita, competitive analysis, ROI por canal, análise de texto longo, relatório executivo (10 prompts).",
    ]),
    h3("Criativos Avançados (7 prompts)"),
    bullet_list([
        "<b>Cap. 10:</b> Chain-of-thought, self-consistency, tree of thoughts, meta-prompting, debate multi-agente, few-shot com cases, constitutional, reverse prompting, schema JSON (9 prompts).",
    ]),
    h2("Como usar a biblioteca"),
    body("Três caminhos de uso, dependendo da urgência e profundidade:"),
    h3("Caminho 1: Uso rápido (substituir placeholder)"),
    body("Escolha o prompt da categoria. Substitua as variáveis [ENTRE COLCHETES] pelos seus dados. Cole no Claude/ChatGPT. Use o output. Tempo: 5 min."),
    h3("Caminho 2: Uso profissional (customizar)"),
    body("Pegue o prompt como base. Adicione 30% de contexto próprio (seus cases, seu tom, sua audiência específica). Teste 3 variações. Escolha a melhor. Tempo: 20 min."),
    h3("Caminho 3: Uso premium (tornar seu)"),
    body("Estude o prompt. Entenda a estrutura. Reescreva com seu vocabulário, seus exemplos, seu framework. Salve na sua biblioteca. Use por meses. Tempo: 1h inicial, 5 min por uso."),
    callout("Recomendação", "Para tarefas de alto valor (roteiro de Reels principal, email de lançamento), use caminho 3. Para tarefas operacionais (legenda de story, headline de teste), use caminho 1. Para tarefas estratégicas (análise, brainstorm), use caminho 2."),
    h2("Atualizações da biblioteca"),
    body("Esta biblioteca é viva. Atualizações previstas:"),
    bullet_list([
        "<b>Trimestral:</b> adicionar 10-20 novos prompts baseados em tendências.",
        "<b>Semestral:</b> revisão completa, aposentação de prompts obsoletos.",
        "<b>Anual:</b> reorganização se categorias ficarem saturadas.",
    ]),
    body("Você será avisado por email das atualizações se for cliente do Knowledge Hub Premium."),
    exercise_box("Plano de adoção de 90 dias", [
        "Semana 1-2: usar 5 prompts da categoria Copywriting (cap. 3-4).",
        "Semana 3-4: usar 5 prompts da categoria SEO (cap. 6).",
        "Semana 5-6: usar 5 prompts da categoria Email (cap. 5).",
        "Semana 7-8: criar 3 prompts próprios baseados no framework do cap. 11.",
        "Semana 9-12: refinar biblioteca, documentar casos de uso, medir impacto.",
        "Dia 90: você terá biblioteca de 50+ prompts validados. Compare métricas antes/depois.",
    ]),
]


# ============ APÊNDICE ============
APPENDIX = [
    body_lead("Recursos para referencia rápida e troubleshooting."),
    h2("Quick reference — variáveis comuns"),
    body("Variáveis que aparecem em muitos prompts. Preencha uma vez, reutilize:"),
    data_table(
        ["Variável", "Descrição", "Exemplo"],
        [
            ["[NOME]", "Seu nome ou do criador", "Clodoaldo Silva"],
            ["[NICHO]", "Sua área de atuação", "Lifestyle, Business, Vision"],
            ["[PÚBLICO]", "Quem é sua audiência", "Homens 25-35, criadores iniciantes"],
            ["[TEMA]", "Tópico do conteúdo", "Produtividade matinal"],
            ["[PRODUTO]", "O que você vende", "Mentoria de criadores"],
            ["[PREÇO]", "Preço do produto", "R$ 997"],
            ["[OBJEÇÃO]", "Maior objeção do cliente", "Não tenho tempo"],
            ["[DURAÇÃO]", "Duração do vídeo", "30s, 60s, 90s"],
            ["[TOM]", "Tom de voz", "Direto, técnico, sem enrolação"],
            ["[FORMATO]", "Formato de saída", "Lista, tabela, JSON"],
        ],
    ),
    h2("Quick reference — frameworks"),
    body("Frameworks citados nos prompts. Use por nome:"),
    data_table(
        ["Framework", "Significado", "Melhor para"],
        [
            ["CREDE", "Contexto, Role, Estrutura, Detalhes, Exemplos", "Estrutura de prompts"],
            ["AIDA", "Atenção, Interesse, Desejo, Ação", "Anúncios, páginas de venda"],
            ["PAS", "Problema, Agitação, Solução", "Reels de conscientização"],
            ["BAB", "Before, After, Bridge", "Stories e transformação"],
            ["FAB", "Features, Advantages, Benefits", "Fichas de produto"],
            ["4 Ps", "Promise, Picture, Proof, Push", "Email de vendas"],
            ["CoT", "Chain of Thought", "Tarefas analíticas complexas"],
        ],
    ),
    h2("Quick reference — modelos recomendados"),
    data_table(
        ["Tarefa", "Modelo recomendado", "Por quê"],
        [
            ["Roteiro criativo", "Claude 3.5 Sonnet", "Escrita mais natural"],
            ["Análise de dados", "ChatGPT (GPT-4o)", "Gera gráficos, código"],
            ["Contexto longo", "Gemini 1.5 Pro", "1M tokens"],
            ["Copywriting", "Claude 3.5 Sonnet", "Tom premium"],
            ["Brainstorm", "ChatGPT", "GPTs customizados"],
            ["Código/schema", "Claude 3.5 Sonnet", "Precisão técnica"],
            ["Raciocínio", "Claude 3.5 Sonnet", "Lógica superior"],
        ],
    ),
    h2("Troubleshooting — problemas comuns"),
    h3("Output genérico demais"),
    body("Causa: falta de contexto e exemplos. Solução: adicione 1 parágrafo de contexto (quem é você, audiência, projeto) e 1-2 exemplos de referência. Reflita CREDE."),
    h3("IA alucina (inventa dados)"),
    body("Causa: falta de verificação. Solução: peça \"cite fontes para cada dado\" no prompt. Verifique cada número. Use Perplexity pra confirmar fatos."),
    h3("Output muito longo"),
    body("Causa: sem restrição de tamanho. Solução: adicione \"máximo N palavras\" no prompt. Peça resumo depois."),
    h3("Output repetitivo"),
    body("Causa: sem variação exigida. Solução: peça \"3 variações com ângulos diferentes\". Especifique os ângulos."),
    h3("IA não segue formato"),
    body("Causa: formato ambíguo. Solução: forneça schema explícito (ex: \"formato JSON\" ou \"tabela com colunas X, Y, Z\")."),
    h3("Tom não é seu"),
    body("Causa: sem referência. Solução: cole 2-3 amostras de seus melhores outputs anteriores no prompt. Peça \"copie este estilo\"."),
    h2("Checklist antes de cada prompt"),
    exercise_box("Antes de enviar o prompt, verifique:", [
        "Cobri os 5 elementos CREDE?",
        "Defini formato de saída?",
        "Especifiquei restrições (tamanho, tom, proibições)?",
        "Forneço 1+ exemplo de referência?",
        "Peço 3+ variações (quando relevante)?",
        "Tenho variáveis preenchidas com dados reais?",
    ]),
    h2("Glossário"),
    data_table(
        ["Termo", "Definição"],
        [
            ["Prompt", "Instrução que você dá a um modelo de IA."],
            ["Few-shot", "Dar exemplos no prompt para guiar o output."],
            ["Zero-shot", "Pedir sem exemplos. Mais arriscado."],
            ["Chain-of-thought", "Pedir pra IA pensar passo a passo."],
            ["Hallucination", "Quando IA inventa fato."],
            ["Token", "Unidade de texto (~4 caracteres)."],
            ["Context window", "Quanto texto a IA lembra na conversa."],
            ["Fine-tuning", "Treinar IA com seus dados."],
            ["RAG", "Retrieval-Augmented Generation."],
            ["Multimodal", "IA que entende texto + imagem + áudio."],
        ],
    ),
]


# ============ CONSTRUÇÃO DO E-BOOK ============

def build():
    story = []
    
    # ============ CAPA ============
    story += cover_page(
        title="Pack de Prompts Premium",
        subtitle="Desbloqueie o Potencial da IA na Criação de Conteúdo",
        eyebrow="E-BOOK PREMIUM",
    )
    
    # ============ SUMÁRIO ============
    story += toc_page([
        {"title": "Introdução — Por que 90% dos prompts falham", "page": "5"},
        {"title": "Capítulo 1 — Introdução a Prompts", "page": "8"},
        {"title": "Capítulo 2 — Estrutura de Prompts Eficazes", "page": "12"},
        {"title": "Capítulo 3 — Prompts para Roteiro de Reels", "page": "16"},
        {"title": "Capítulo 4 — Prompts para Copywriting", "page": "22"},
        {"title": "Capítulo 5 — Prompts para Email Marketing", "page": "27"},
        {"title": "Capítulo 6 — Prompts para SEO/Blogs", "page": "33"},
        {"title": "Capítulo 7 — Prompts para Social Media", "page": "39"},
        {"title": "Capítulo 8 — Prompts para Análise de Dados", "page": "44"},
        {"title": "Capítulo 9 — Prompts para Brainstorming", "page": "50"},
        {"title": "Capítulo 10 — Prompts Criativos Avançados", "page": "55"},
        {"title": "Capítulo 11 — Como Criar Seus Próprios Prompts", "page": "60"},
        {"title": "Capítulo 12 — Biblioteca de 100+ Prompts", "page": "65"},
        {"title": "Apêndice — Quick Reference e Troubleshooting", "page": "70"},
        {"title": "Conclusão e Próximos Passos", "page": "75"},
        {"title": "Recursos Adicionais", "page": "78"},
    ])
    
    # ============ SOBRE ============
    story.append(page_break())
    story.append(spacer(3))
    styles = get_styles()
    story.append(Paragraph("SOBRE O AUTOR", styles["Chapter_Number"]))
    story.append(HRule(1.5 * 28.35, COLORS["primary"], 1))
    story.append(spacer(0.6))
    story.append(Paragraph("Clodoaldo Silva", styles["Chapter_Title"]))
    story.append(spacer(0.4))
    story.append(body_lead("Clodoaldo Silva é influenciador digital focado em Lifestyle, Business e Vision. Além de criador de conteúdo, é desenvolvedor e empreendedor tech com 50+ apps lançados."))
    story.append(body("Este e-book é a compilação de 2 anos de experimentação diária com prompts. Mais de 5.000 prompts testados, refinados, validados. Os 100+ que estão aqui são os que sobreviveram ao filtro — os que realmente geram output usável. Não é teoria. É playbook operacional."))
    story.append(spacer(1))
    story.append(h2("Licença de uso"))
    story.append(body("Este e-book é parte do Knowledge Hub Premium. A compra dá direito a uso pessoal e interno. Reprodução ou redistribuição é proibida. Para licenças comerciais, contate clodoaldosilva608@gmail.com."))
    story.append(spacer(0.5))
    story.append(callout("Aviso", "Modelos de IA mudam rápido. Alguns prompts podem precisar de ajuste conforme os modelos evoluem. Sempre teste antes de usar em produção."))
    
    # ============ INTRODUÇÃO ============
    story += chapter_intro(
        "Por que 90% dos prompts falham — e como fazer parte dos 10%",
        "Engenharia de prompts é a skill nº 1 do criador de 2025"
    )
    story.append(body_lead("Você já parou pra pensar por que seu output do ChatGPT parece genérico enquanto o do concorrente parece premium? Não é a ferramenta. É o prompt. E prompt é técnica — não talento."))
    story.append(body("Em 2 anos analisando prompts de criadores, identifiquei 5 erros que 90% cometem: não dão contexto, não especificam formato, não fornecem exemplos, não iteram, não pedem variações. Eliminar esses 5 erros dobra a qualidade dos outputs. Esse e-book é sobre eliminar esses erros — e ir além."))
    story.append(body("Mas antes de começarmos, uma verdade: este e-book não é para ler e esquecer. É para usar. Os 100+ prompts aqui não são teoria — são prompts prontos para copiar, colar, preencher variáveis e usar. Trate como biblioteca. Marque, anote, adapte. Em 90 dias, sua produtividade com IA terá triplicado."))
    story.append(h2("O que você vai encontrar neste e-book"))
    story.append(bullet_list([
        "<b>100+ prompts prontos:</b> copywriting, Reels, SEO, email, social, analytics, brainstorm, avançados.",
        "<b>Framework CREDE:</b> método para nunca mais escrever prompt ruim.",
        "<b>Técnicas avançadas:</b> chain-of-thought, few-shot, meta-prompting, multi-agente.",
        "<b>Sistema de biblioteca:</b> como organizar, versionar e evoluir seus prompts.",
        "<b>Troubleshooting:</b> resolver problemas comuns (output genérico, alucinação, formato errado).",
        "<b>Quick reference:</b> apêndice com variáveis, frameworks e modelos recomendados.",
    ]))
    story.append(h2("Como aproveitar ao máximo"))
    story.append(body("Não leia este e-book de uma vez. Faça em 3 passos:"))
    story.append(numbered_list([
        "<b>Passo 1 (hoje):</b> leia capítulos 1 e 2. Domine o framework CREDE.",
        "<b>Passo 2 (esta semana):</b> escolha 5 prompts da sua categoria prioritária. Teste em tarefas reais.",
        "<b>Passo 3 (próximos 30 dias):</b> implemente 1 prompt por dia. Construa sua biblioteca.",
    ]))
    story.append(callout("Promessa", "Ao final deste e-book você terá: (1) biblioteca de 100+ prompts prontos, (2) framework CREDE para criar novos, (3) técnicas avançadas para casos complexos, (4) sistema de organização e versionamento, (5) capacidade de resolver qualquer problema de output."))
    story.append(spacer(0.4))
    story += quote("A IA não vai substituir criadores. Mas criadores que dominam prompts vão substituir os que não dominam.", "Verdade incômoda de 2025")
    story.append(body("Essa frase resume o desafio. Não é sobre \"usar IA\" — todo mundo usa. É sobre usar bem. E usar bem é escrever prompt bem. Prompt bem é técnica que se aprende, se pratica, se domina. Este e-book é o campo de treinamento."))
    
    # ============ CAPÍTULOS ============
    story += chapter_header("1", "Introdução a Prompts", "O básico que 90% dos criadores erram")
    story.extend(CHAPTER_1)
    
    story += chapter_header("2", "Estrutura de Prompts Eficazes", "Como estruturar prompts como projetos — não como parágrafos soltos")
    story.extend(CHAPTER_2)
    
    story += chapter_header("3", "Prompts para Roteiro de Reels", "10 prompts para Reels — um por objetivo")
    story.extend(CHAPTER_3)
    
    story += chapter_header("4", "Prompts para Copywriting", "Do headline ao CTA: o arsenal completo do copywriter")
    story.extend(CHAPTER_4)
    
    story += chapter_header("5", "Prompts para Email Marketing", "ROI de 4.200%: prompts para cada tipo de email")
    story.extend(CHAPTER_5)
    
    story += chapter_header("6", "Prompts para SEO e Blogs", "Da intenção ao schema: prompts que ranqueiam")
    story.extend(CHAPTER_6)
    
    story += chapter_header("7", "Prompts para Social Media", "Instagram, LinkedIn, TikTok, X — prompts multiplataforma")
    story.extend(CHAPTER_7)
    
    story += chapter_header("8", "Prompts para Análise de Dados", "IA como seu analista pessoal: do CSV ao insight")
    story.extend(CHAPTER_8)
    
    story += chapter_header("9", "Prompts para Brainstorming", "Ideia em escala industrial: do nada a 30 ideias em 5 minutos")
    story.extend(CHAPTER_9)
    
    story += chapter_header("10", "Prompts Criativos Avançados", "Técnicas que profissionais de IA usam — e criadores ainda não")
    story.extend(CHAPTER_10)
    
    story += chapter_header("11", "Como Criar Seus Próprios Prompts", "Biblioteca própria é diferencial competitivo")
    story.extend(CHAPTER_11)
    
    story += chapter_header("12", "Biblioteca de 100+ Prompts", "Índice completo e como usar")
    story.extend(CHAPTER_12)
    
    story += chapter_header("A", "Apêndice — Quick Reference e Troubleshooting", "Recursos para consulta rápida e resolução de problemas")
    story.extend(APPENDIX)
    
    # ============ CONCLUSÃO ============
    story += chapter_header("FIM", "Conclusão e Próximos Passos", "O que fazer agora, com 100+ prompts em mãos")
    story.append(body_lead("Você chegou ao fim. Mas aqui está a verdade: ler sobre prompts não te faz melhor em prompts. Praticar, medir, iterar — sim."))
    story.append(body("Por isso, em vez de uma conclusão tradicional, vou te deixar com um plano de 30 dias. Se você seguir, em 1 mês sua capacidade com IA terá triplicado."))
    story.append(h2("Plano de 30 dias — adoção da biblioteca"))
    story.append(h3("Semana 1 — Fundação"))
    story.append(bullet_list([
        "Dia 1-2: leia capítulos 1 e 2. Domine CREDE.",
        "Dia 3: escolha 5 prompts da sua categoria prioritária.",
        "Dia 4-7: teste 1 prompt por dia em tarefa real.",
    ]))
    story.append(h3("Semana 2 — Profundidade"))
    story.append(bullet_list([
        "Use 7 prompts diferentes esta semana.",
        "Documente casos de uso (output bom, output ruim).",
        "Identifique padrões: o que funciona pra você?",
    ]))
    story.append(h3("Semana 3 — Escala"))
    story.append(bullet_list([
        "Crie sua biblioteca no Notion (cap. 11).",
        "Adicione os 30 prompts que você mais usou.",
        "Teste 3 técnicas avançadas (cap. 10).",
    ]))
    story.append(h3("Semana 4 — Domínio"))
    story.append(bullet_list([
        "Crie 5 prompts próprios baseados no framework.",
        "Documente cada um com ficha completa.",
        "Meça: tempo economizado, qualidade do output, impacto nas métricas.",
    ]))
    story.append(h2("Métricas para acompanhar"))
    story.append(bullet_list([
        "<b>Tempo economizado:</b> meta 10h/semana após 30 dias.",
        "<b>Qualidade do output:</b> meta 70%+ de uso direto (sem reescrita).",
        "<b>Volume de outputs:</b> meta 3x mais conteúdo produzido.",
        "<b>Performance do conteúdo:</b> meta +30% em engajamento.",
        "<b>Biblioteca:</b> meta 30+ prompts documentados.",
    ]))
    story.append(spacer(0.5))
    story += quote("Domínio de prompts não é sobre saber mais — é sobre praticar mais. 30 dias de prática vencem 30 horas de teoria.", "Clodoaldo Silva")
    story.append(spacer(0.5))
    story.append(body("Se este e-book te ajudou, compartilhe com 1 pessoa que precisa ler. E se você quer ir mais fundo, os materiais complementares abaixo são o próximo passo natural."))
    
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
        "<b>IA para Criadores de Conteúdo</b> — Stack completo de ferramentas para escalar produção.",
        "<b>Manual da Edição Premium</b> — Como editar vídeos que retêm atenção do primeiro ao último segundo.",
        "<b>30 Ganchos para Reels</b> — Coleção prática de aberturas prontas para uso imediato.",
        "<b>Storytelling Magnético</b> — A engenharia invisível por trás de histórias que prendem atenção.",
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
    story.append(h2("Recursos online de prompts"))
    story.append(body("Sites e comunidades para continuar aprendendo:"))
    story.append(bullet_list([
        "<b>promptingguide.ai</b> — Guia open-source de engenharia de prompts.",
        "<b>platform.openai.com/docs/guides/prompt-engineering</b> — Guia oficial da OpenAI.",
        "<b>docs.anthropic.com/en/docs/build-with-claude/prompt-engineering</b> — Guia oficial do Claude.",
        "<b>learnprompting.org</b> — Curso gratuito e abrangente.",
        "<b>reddit.com/r/PromptEngineering</b> — Comunidade ativa de prática.",
    ]))
    story.append(body("Comece por <i>promptingguide.ai</i> e <i>docs.anthropic.com</i>. São os mais práticos. Os outros vêm depois, conforme você aprofunda."))
    
    story.append(spacer(0.5))
    story.append(h2("Citação final"))
    story += quote("A diferença entre criador médio e criador premium não é talento. É sistema. Prompts são o sistema.", "Clodoaldo Silva")
    story.append(spacer(1))
    
    story.append(HRule(2 * 28.35, COLORS["primary"], 1))
    story.append(spacer(0.4))
    story.append(Paragraph("© Clodoaldo Silva. Todos os direitos reservados. Este material é parte do Knowledge Hub Premium.", styles["Footer_Caption"]))
    
    return story


if __name__ == "__main__":
    print("Gerando pack-prompts-premium.pdf...")
    story = build()
    build_pdf(OUTPUT, story, title="Pack de Prompts Premium — Clodoaldo Silva")
    
    import os
    size = os.path.getsize(OUTPUT)
    print(f"✅ Gerado: {OUTPUT}")
    print(f"   Tamanho: {size:,} bytes ({size/1024:.1f} KB)")
    
    import pypdf
    reader = pypdf.PdfReader(OUTPUT)
    print(f"   Páginas: {len(reader.pages)}")
