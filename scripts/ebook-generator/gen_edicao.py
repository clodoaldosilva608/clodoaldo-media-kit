"""
Gera o e-book: Manual da Edição Premium (60+ páginas)
14 capítulos + capa + sumário + recursos.
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
    editing_workflow_diagram, retention_dropoff_chart,
    tool_comparison_table, color_grading_wheel, pacing_chart,
    narrative_arc, three_act_structure,
)

OUTPUT = "/home/z/my-project/scripts/ebook-generator/output/manual-edicao-premium.pdf"


def caption(text):
    styles = get_styles()
    return Paragraph(text, styles["Footer_Caption"])


def intro_header(title, subtitle):
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


# ============================================================
# CAPÍTULO 1: FUNDAMENTOS DA EDIÇÃO PREMIUM
# ============================================================
CHAPTER_1 = [
    body_lead("Edição premium não é sobre efeitos caros. É sobre ritmo, pacing e timing. Antes de tocar em qualquer software, você precisa entender os três pilares que separam um vídeo amador de um vídeo que prende atenção do primeiro ao último segundo."),
    h2("Ritmo: a batida invisível do seu vídeo"),
    body("Todo vídeo tem ritmo — mesmo que você não perceba. Ritmo é a <b>cadência de cortes</b>, a velocidade das transições, a relação entre fala e imagem. Um vídeo com ritmo acelerado gera tensão. Um vídeo com ritmo lento gera reflexão. A maioria dos criadores iniciantes erra ao usar <b>um único ritmo</b> do início ao fim — ou tudo rápido demais (caótico) ou tudo lento demais (entediante)."),
    body("Edição premium varia o ritmo como música varia andamento. Imagine uma música com a mesma batida por 3 minutos — você desliga. O mesmo vale para vídeo. O segredo é criar <b>micro-variações</b>: ritmo rápido no gancho (primeiros 3s), médio no desenvolvimento, lento no payoff emocional."),
    callout(
        "Regra do ritmo variável",
        "Nenhum plano deve durar mais de 3-4 segundos em Reels curtos. Mas também não corte a cada 0,5s sem motivo — vira estética ADHD. Varie: 1s, 2s, 3s, 1s, 4s. Crie musicalidade.",
    ),
    h2("Pacing: a densidade de informação por segundo"),
    body("Pacing é diferente de ritmo. Ritmo é sobre <b>quando cortar</b>. Pacing é sobre <b>quanta informação entregar por segundo</b>. Um vídeo pode ter cortes rápidos mas pacing lento (pouca informação por corte). Ou cortes lentos com pacing alto (muita informação em cada plano)."),
    body("Para retenção em Reels, o pacing ideal é <b>alto mas sustentável</b>: uma ideia nova a cada 3-5 segundos. Pacing baixo = espectador rola. Pacing altíssimo sem respiração = espectador se perde. O truque é inserir <b>micro-respirações</b> — momentos de 1-2s com menos informação, antes de um novo bloco de conteúdo."),
    illustration_image(pacing_chart(), width=15*cm),
    caption("Pacing ideal: picos de informação intercalados com micro-respirações"),
    h2("Timing: a arte de cortar no momento certo"),
    body("Timing é o pilar mais sutil — e o que separa editores premium de amadores. Timing é <b>quando</b> cortar. Não em segundos absolutos, mas em relação ao conteúdo: à fala, à música, à emoção. Um corte no momento certo parece invisível. Um corte no momento errado salta aos olhos."),
    body("Os três princípios do timing premium:"),
    numbered_list([
        "<b>Corte na batida musical</b>: transições alinhadas com acentos da trilha sonora parecem orgânicas. Cortes fora da batida parecem amadores.",
        "<b>Corte na respiração da fala</b>: cortar entre frases (não no meio) preserva fluidez. Cortes no meio de palavra soam truncados.",
        "<b>Corte na emoção</b>: segure um plano 0,5s além do óbvio quando a emoção é forte. Corte antes do esperado quando a tensão é alta.",
    ]),
    body("Edição premium respeita esses três timings simultaneamente. Quando música, fala e emoção se alinham em um corte, o espectador sente — sem saber por quê — que o vídeo é &ldquo;bem feito&rdquo;."),
    h2("A diferença entre edição técnica e edição premium"),
    body("Edição técnica é saber usar o software: cortar, adicionar transição, aplicar efeito. Edição premium é saber <b>quando não usar</b>. A maioria dos editores iniciantes comete o erro de usar todos os recursos disponíveis — transições chamativas, efeitos 3D, texturas. Premium é o oposto: cada recurso é intencional. Cada corte tem motivo. Cada efeito tem função."),
    callout(
        "Princípio da intencionalidade",
        "Antes de adicionar qualquer elemento (transição, efeito, texto, música), pergunte: <b>isso serve ao conteúdo ou ao meu ego?</b> Se a resposta for &ldquo;ao ego&rdquo;, remova. Premium é o que sobra quando você remove tudo o que é desnecessário.",
    ),
    body("Este livro vai te levar dos fundamentos (ritmo, pacing, timing) até monetização. Cada capítulo é uma camada. Não pule. Edição premium é construção — não atalho."),
    exercise_box("Exercício do Capítulo 1", [
        "Pegue um dos seus últimos 3 vídeos. Marque cada corte no timeline.",
        "Para cada corte, anote: (a) duração do plano anterior, (b) se estava alinhado com a batida musical, (c) se estava alinhado com a respiração da fala.",
        "Identifique o padrão de erro. É ritmo (sem variação)? Pacing (informação mal distribuída)? Timing (cortes fora de lugar)?",
        "Refaça o vídeo corrigindo apenas o erro principal. Compare retenção.",
    ]),
]


# ============================================================
# CAPÍTULO 2: CORTES QUE PRENDEM ATENÇÃO
# ============================================================
CHAPTER_2 = [
    body_lead("O corte é o átomo da edição. Tudo o que você faz — narrativa, ritmo, pacing — acontece através de cortes. E não existe corte &ldquo;neutro&rdquo;. Cada corte comunica algo. Saber o que cada tipo de corte diz é a diferença entre edição premium e edição amadora."),
    h2("O corte seco (hard cut)"),
    body("O corte seco — transição direta de um plano para outro, sem efeito — é o mais usado e o mais subestimado. Iniciantes acham que corte seco é &ldquo;corte sem criatividade&rdquo;. Premium é o oposto: corte seco bem colocado é mais elegante que qualquer transição."),
    body("Use corte seco quando: (1) há continuidade de ação, (2) a mudança de plano reforça a fala, (3) você quer velocidade. O corte seco é a base do ritmo rápido em Reels."),
    h3("Quando o corte seco funciona"),
    body("Corte seco funciona em 90% das situações. A regra premium é: <b>use corte seco por padrão</b>. Transições são exceção, não regra. Se você está usando transição a cada corte, está decorando — não editando."),
    h2("Jump cut"),
    body("Jump cut é o corte seco usado para <b>comprimir tempo</b> dentro do mesmo plano. Você grava uma tomada longa, corta pedaços do meio, junta. Resultado: o espectador vê a essência, sem respirações mortas."),
    body("Jump cut é essencial em Reels falados — elimina &ldquo;ééé&rdquo;, &ldquo;mmm&rdquo;, pausas, engasgos. Mas cuidado: jump cut em excesso parece robótico. A regra é cortar pausas maiores que 0,3s e deixar pausas naturais que dão ritmo à fala."),
    callout(
        "Jump cut premium",
        "Corte em &ldquo;J&rdquo; — audio do próximo plano entra 0,3-0,5s antes do vídeo. Isso elimina o &ldquo;clique&rdquo; do jump cut e mantém fluidez. Use sempre que possível.",
    ),
    h2("Match cut"),
    body("Match cut é o corte mais elegante da edição. Você conecta dois planos por <b>similaridade visual</b>: mesma posição de objeto, mesma cor, mesmo movimento. O cérebro do espectador percebe a conexão — mesmo sem perceber que percebeu."),
    body("Exemplo clássico: plano de um café sendo derramado corta para plano de areia escorrendo. Mesmo movimento, contexto diferente. Match cut premium cria <b>continuidade narrativa</b> mesmo sem continuidade temporal."),
    body("Em Reels, match cut pode ser usado em: mudança de ambiente (mesma ação, lugar diferente), transformação (mesmo quadro, conteúdo diferente), ou metáfora visual (objeto A representa conceito B)."),
    h2("Smash cut"),
    body("Smash cut é o corte de <b>contraste máximo</b>: de plano calmo para plano intenso, de silêncio para som alto, de close para plano aberto. Smash cut gera impacto emocional. Use em momentos de virada narrativa — quando você quer que o espectador <b>sinta</b> a mudança."),
    body("Exemplo: você fala calmamente sobre um problema, então smash cut para a solução com música alta. O contraste reforça a virada. Premium não é só sobre fluidez — é sobre impacto controlado."),
    h2("Cut on action (corte na ação)"),
    body("Cortar durante um movimento — não antes nem depois — esconde o corte. O cérebro está focado na ação, não na transição. Use quando você tem a mesma ação gravada de ângulos diferentes (ex: você abre uma porta em close, corta para plano aberto da porta abrindo)."),
    body("Cut on action é o segredo dos vídeos de bastidores que parecem profissionais. Você grava a mesma ação 3-4 vezes de ângulos diferentes, corta durante o movimento. Resultado: vídeo dinâmico sem cortes percebidos."),
    illustration_image(retention_dropoff_chart(), width=15*cm),
    caption("Curva de retenção: onde os espectadores desistem (e como cortes podem reter)"),
    h2("A regra dos 3 segundos"),
    body("Em Reels e Stories, nenhum plano deve durar mais que 3-4 segundos. Em YouTube, pode chegar a 6-8s. Em vídeos longos, 10-12s. Mais que isso, o cérebro moderno perde interesse. A atenção humana encolheu — e a edição precisa acompanhar."),
    body("Mas a regra dos 3 segundos não é absoluta. Planos com <b>alta densidade visual</b> (muita informação, movimento, texto) podem durar mais. Planos com baixa densidade (pessoa parada falando) precisam de cortes mais frequentes."),
    exercise_box("Exercício do Capítulo 2", [
        "Pegue 5 vídeos de criadores que você admira. Marque cada corte no timeline.",
        "Classifique cada corte: seco, jump, match, smash, cut on action.",
        "Identifique o tipo de corte mais usado por cada criador. Por que esse tipo combina com o estilo?",
        "Escolha um corte que você nunca usou. Grave um Reel usando-o intencionalmente.",
    ]),
]


# ============================================================
# CAPÍTULO 3: TRANSIÇÕES PROFISSIONAIS
# ============================================================
CHAPTER_3 = [
    body_lead("Transições são as pontes entre planos. Bem usadas, são invisíveis — o espectador nem percebe que existiu corte. Mal usadas, viram ornamentação que distrai. Neste capítulo, você vai dominar as 4 transições que 90% dos vídeos premium usam."),
    h2("J-cut: o áudio vem antes do vídeo"),
    body("J-cut é quando o áudio do próximo plano entra <b>antes</b> do vídeo. Visualmente, o formato no timeline lembra a letra J. O efeito é suave: o espectador ouve algo novo enquanto ainda vê a imagem antiga, criando antecipação."),
    body("Use J-cut quando: (1) você quer criar expectativa (&ldquo;e aí ele disse algo que mudou tudo&rdquo; — você ouve a frase antes de ver a pessoa), (2) está introduzindo novo tópico, (3) quer suavizar transição temporal."),
    h3("Como fazer J-cut no CapCut/Premiere"),
    body("Separe as trilhas de áudio e vídeo do clipe B. Arraste o áudio 0,3-0,5s para a esquerda (antes do corte de vídeo). O espectador ouvirá a próxima fala/ambiente enquanto ainda vê o plano atual. Ajuste a sobreposição para o ritmo do vídeo."),
    h2("L-cut: o vídeo vem antes do áudio"),
    body("L-cut é o oposto: o vídeo do próximo plano entra antes, mas o áudio do plano anterior continua. Visualmente, lembra a letra L. Efeito: continuidade sonora sobre nova imagem, criando reflexão."),
    body("Use L-cut quando: (1) você quer que uma frase ressoe sobre nova imagem (&ldquo;e foi assim que tudo mudou&rdquo; — você vê a mudança enquanto a frase ressoa), (2) faz transição de cena mantendo contexto, (3) quer dar peso emocional a uma fala."),
    callout(
        "J-cut e L-cut: a base da edição premium",
        "Estas duas transições representam 70% das transições em filmes profissionais. Por quê? Porque respeitam a natureza do áudio — que tem continuidade própria, diferente do vídeo. Master J e L antes de qualquer outra transição.",
    ),
    h2("Match cut: a transição narrativa"),
    body("Já vimos match cut como corte. Como transição, match cut conecta dois planos por similaridade visual — mas com crossfade sutil de 0,2-0,3s. O resultado é uma passagem fluida que mantém a conexão visual."),
    body("Exemplo premium: você fala sobre &ldquo;crescer como criador&rdquo;. Plano A: você no quarto pequeno. Match cut para Plano B: você no estúdio. Mesmo enquadramento, contexto diferente. Crossfade curto. O espectador sente a transformação."),
    h2("Jump cut estilizado"),
    body("Diferente do jump cut técnico (capítulo 2), o jump cut estilizado usa o corte repetido como <b>estética</b>. Você corta a mesma cena 3-4 vezes em rápida sucessão, criando efeito de &ldquo;stutter&rdquo;. Use em momentos de tensão ou revelação."),
    body("Exemplo: você está prestes a revelar algo. Jump cuts estilizados: você começa a frase, corta, repete início, corta, completa. O efeito gera antecipação. Mas cuidado: jump cut estilizado em excesso vira clichê de TikTok."),
    h2("Transições que você deve EVITAR"),
    body("Agora que você conhece as transições premium, aqui estão as que você deve evitar como criador profissional:"),
    bullet_list([
        "<b>Crossfade padrão (dissolve)</b>: usado por padrão em softwares, parece amador. Use apenas em flashbacks ou passagem de tempo longa.",
        "<b>Transições 3D</b> (cubos, portas, flips): pertencem a 2010. Não use. Exceto se o conteúdo for propositalmente retrô.",
        "<b>Zoom in/out</b>: efeito de câmera barata. Se precisa de zoom, use push-in digital com motion blur suave.",
        "<b>Glitch</b>: era legal em 2018. Hoje, saturou. Use só se o tema for tecnologia/cyberpunk e com intenção clara.",
    ]),
    body("Premium é sobre <b>controle</b>. Você pode usar qualquer transição — desde que possa justificar <b>por que</b>. Transição &ldquo;porque ficou bonito&rdquo; é amador. Transição &ldquo;porque reforça a emoção&rdquo; é premium."),
    callout(
        "Teste da transição",
        "Para cada transição no seu vídeo, pergunte: <b>se eu substituísse por corte seco, perderia algo?</b> Se a resposta for &ldquo;não&rdquo;, troque por corte seco. Premium é o que sobra quando você remove o desnecessário.",
    ),
    exercise_box("Exercício do Capítulo 3", [
        "Pegue um vídeo que você gravou com 2 ângulos diferentes da mesma ação.",
        "Edite 4 versões: (a) corte seco, (b) J-cut, (c) L-cut, (d) match cut.",
        "Mostre as 4 versões para 3 amigos (sem dizer qual é qual). Pergunte qual parece mais profissional.",
        "Anote os resultados. A versão escolhida é a transição ideal para seu estilo.",
    ]),
]


# ============================================================
# CAPÍTULO 4: COLOR GRADING PARA INICIANTES
# ============================================================
CHAPTER_4 = [
    body_lead("Color grading é a alma visual do vídeo. É o que separa &ldquo;filmes&rdquo; de &ldquo;vídeos&rdquo;. Mas a maioria dos criadores iniciantes pula essa etapa — ou pior, aplica LUTs prontos sem entender. Neste capítulo, você vai aprender os fundamentos de cor que transformam qualquer footage em algo premium."),
    h2("Color correction vs Color grading"),
    body("Primeiro, a distinção essencial. <b>Color correction</b> é técnico: você corrige balanço de branco, exposição, contraste, para que o vídeo pareça &ldquo;real&rdquo;. <b>Color grading</b> é artístico: você aplica estilização para criar mood. Sempre corrija antes de gradear."),
    body("Sequência: (1) Corrija exposição (highlights, shadows, midtones), (2) Corrija balanco de branco (temperatura e tint), (3) Ajuste contraste, (4) Aplique grading (look cinematográfico)."),
    h2("A roda de cores: HSL"),
    illustration_image(color_grading_wheel(), width=12*cm),
    caption("Roda HSL: Hue (tonalidade), Saturation (saturação), Luminance (luminância)"),
    body("Toda cor é definida por 3 parâmetros: <b>H</b>ue (qual cor — vermelho, azul, verde), <b>S</b>aturation (intensidade — do cinza ao vivo), <b>L</b>uminance (claridade — do preto ao branco). Entender HSL é entender como manipular mood."),
    body("Exemplo: para um vídeo melancólico, diminua saturação geral (+20% dessaturação) e empurre shadows para azul. Para um vídeo energético, aumente saturação e empurre highlights para laranja. Mood é cor + saturação + luminância."),
    h2("Os 3 estilos básicos de grading"),
    h3("1. Look natural (premium realista)"),
    body("Saturação média, contraste médio-alto, temperatura neutra. Parece &ldquo;real mas melhor&rdquo;. É o estilo de YouTubers premium e documentários. Use quando seu conteúdo é sobre <b>autenticidade</b>."),
    h3("2. Look cinematográfico (premium dramático)"),
    body("Shadows empurradas para azul/teal, highlights para laranja (técnica &ldquo;orange and teal&rdquo;), contraste alto, saturação ligeiramente reduzida. Estilo de Hollywood. Use em storytimes e conteúdo narrativo."),
    h3("3. Look minimalista (premium moderno)"),
    body("Baixa saturação, contraste baixo-médio, temperatura neutra-fria. Estética clean de marcas premium e tech. Use em conteúdo de negócios, tech, lifestyle minimal."),
    callout(
        "Regra do único look",
        "Escolha <b>um look</b> por vídeo (ou por conta inteira). Misturar estilos dentro do mesmo vídeo é amador. Consistência visual é sinal de profissionalismo.",
    ),
    h2("LUTs: como e quando usar"),
    body("LUTs (Look-Up Tables) são presets de cor que aplicam uma estilização completa com um clique. Úteis? Sim. Perigosos? Também. LUTs prontos foram criados para outros footages — aplicar diretamente no seu raramente funciona bem. Use LUT como <b>ponto de partida</b>, ajuste em seguida."),
    body("Workflow premium com LUTs: (1) faça color correction primeiro, (2) aplique LUT com intensidade reduzida (50-70%), (3) ajuste exposure/saturation após o LUT, (4) salve seu próprio LUT personalizado para reutilizar."),
    h2("Erros comuns em color grading"),
    bullet_list([
        "<b>Saturação exagerada</b>: cores vivas demais parecem Instagram filter de 2015. Menos é mais.",
        "<b>Contraste alto demais</b>: perde detalhe em shadows e highlights. Contraste premium é médio-alto, não máximo.",
        "<b>Branco muito quente ou muito frio</b>: branco precisa ser branco. Teste: pause em uma parede branca. Está amarelada? Ajuste temperatura.",
        "<b>Skin tones erradas</b>: pele é a referência. Se a pele parecer bronzeada artificial ou doente, ajuste.",
        "<b>Grade sem correção</b>: aplicar LUT sem corrigir balanço de branco primeiro = resultado imprevisível.",
    ]),
    exercise_box("Exercício do Capítulo 4", [
        "Grave 3 tomadas em locais com iluminação diferente (janela, artificial, mista).",
        "Faça color correction em cada uma separadamente até todas parecerem consistentes.",
        "Aplique um look cinematográfico em todas. Ajuste para que o look seja idêntico entre as tomadas.",
        "Compare com a versão original. Anote as 3 maiores diferenças perceptuais.",
    ]),
]


# ============================================================
# CAPÍTULO 5: SOUND DESIGN
# ============================================================
CHAPTER_5 = [
    body_lead("Som é 50% do vídeo — mas recebe 5% da atenção do editor iniciante. Edição premium trata som com a mesma seriedade que imagem. Neste capítulo, você vai dominar música, efeitos e o instrumento mais subestimado: o silêncio."),
    h2("Camadas de som em vídeo premium"),
    body("Vídeos premium têm <b>5 camadas sonoras</b>. Amadores têm 1 (só a fala). Entenda as camadas:"),
    numbered_list([
        "<b>Voz principal</b>: sua fala. A camada mais importante. Deve ser limpa, equalizada, com volume consistente.",
        "<b>Música de fundo</b>: define mood. Volume 15-25% abaixo da voz. Deve complementar, não competir.",
        "<b>SFX (sound effects)</b>: efeitos que reforçam ações (whoosh em transição, pop em texto, impact em corte).",
        "<b>Ambiente</b>: som do local (trânsito, pássaros, conversa). Dá realismo. Use sutil, 10-15% do volume.",
        "<b>Bed musical</b>: camada sutil de baixa frequência que conecta tudo. Como o &ldquo;hum&rdquo; de um filme.",
    ]),
    h2("Música: como escolher e dosar"),
    body("Música errada destrói vídeo. Música certa invisibiliza-se. Critérios para escolher:"),
    bullet_list([
        "<b>Tempo</b>: BPM da música deve casar com ritmo de cortes. Reels rápidos: 110-130 BPM. Storytimes: 70-90 BPM.",
        "<b>Mood</b>: emoção da música deve reforçar emoção do conteúdo. Não use música alegre em storytime triste.",
        "<b>Instrumentação</b>: evite vocais na música se você também fala — competem pela atenção. Use instrumental.",
        "<b>Estrutura</b>: prefira músicas com build-up. Use o clímax da música alinhado com o clímax do vídeo.",
    ]),
    callout(
        "Regra de volume premium",
        "Música de fundo deve estar 15-25dB abaixo da voz. Teste: assista ao vídeo com volume médio. Você consegue entender cada palavra sem esforço? Se não, abaixe a música.",
    ),
    h2("Ducking: a técnica essencial"),
    body("Ducking é <b>reduzir automaticamente o volume da música quando alguém fala</b>. Softwares premium (Premiere, DaVinci) fazem isso com sidechain compression. CapCut faz manualmente: você ajusta keyframes de volume da música ao redor das falas."),
    body("Ducking é o que separa vídeos &ldquo;fala em cima de música&rdquo; de vídeos &ldquo;música e fala conversam&rdquo;. Sem ducking, a música compete. Com ducking, ela apoia."),
    h2("SFX: o tempero da edição"),
    body("SFX (sound effects) são como sal: sem nada, fica sem graça; com demais, fica intragável. Use SFX para <b>reforçar cortes e ações</b>. Quemosh em transição rápida, pop em aparição de texto, whoosh em movimento de câmera."),
    body("Bibliotecas gratuitas de SFX: YouTube Audio Library, Freesound.org, Pixabay. Para premium pago: Artlist, Epidemic Sound. Invista em uma biblioteca — é diferencial competitivo."),
    h3("Onde NÃO usar SFX"),
    body("Não use SFX em cada corte. Vira piada. Não use SFX em storytimes sérios — distrai. Não use SFX de comédia (boing, risada) em conteúdo profissional — destrói autoridade."),
    h2("O poder do silêncio"),
    body("Silêncio é o SFX mais poderoso. Em um feed de áudios saturados, <b>1-2 segundos de silêncio absoluto</b> prendem atenção mais que qualquer música. Use silêncio antes de revelações, depois de frases de impacto, em transições emocionais."),
    body("Premium não é sobre adicionar. É sobre escolher. E silêncio é uma escolha que a maioria dos editores não faz. Use-a."),
    callout(
        "Técnica do drop",
        "Antes de uma revelação forte, reduza música a zero por 1-2s. Silêncio total. Depois, música volta com intensidade. Esse contraste sonoro cria tensão emocional que prende o espectador.",
    ),
    exercise_box("Exercício do Capítulo 5", [
        "Pegue um vídeo seu atual. Mapeie as 5 camadas sonoras. Provavelmente você tem 1-2.",
        "Adicione música de fundo com ducking. Adicione 3-5 SFX em transições importantes.",
        "Em uma revelação, aplique a técnica do drop (1-2s de silêncio).",
        "Compare retenção do vídeo antes/depois. O som premium aumenta retenção média em 15-30%.",
    ]),
]


# ============================================================
# CAPÍTULO 6: TEXTO E MOTION GRAPHICS
# ============================================================
CHAPTER_6 = [
    body_lead("Texto em vídeo é arma de duplo fio. Bem usado, reforça a mensagem e prende atenção. Mal usado, distrai e parece amador. Neste capítulo, você vai dominar tipografia, motion graphics e a regra de ouro: menos é mais."),
    h2("Tipografia para vídeo: regras básicas"),
    body("Texto em vídeo não é texto em papel. O espectador tem segundos para ler — não minutos. Regras essenciais:"),
    bullet_list([
        "<b>Tamanho mínimo</b>: 32pt para texto de apoio, 48pt+ para headlines. Se não dá para ler no celular, é pequeno demais.",
        "<b>Contraste</b>: texto deve ter contraste alto com fundo. Use sombra, outline ou caixa atrás se fundo é variável.",
        "<b>Fontes</b>: máximo 2 fontes por vídeo. Uma para título (display), uma para corpo (sans-serif limpa).",
        "<b>Duração</b>: texto na tela deve durar o tempo de leitura + 0,5s. Para frase curta: 2-3s. Para frase média: 4-5s.",
        "<b>Animação</b>: todo texto deve ter animação de entrada (fade, slide, pop). Texto estático parece slide de PowerPoint.",
    ]),
    h2("Hierarquia visual do texto"),
    body("Em cada momento do vídeo, o espectador deve saber <b>onde olhar primeiro</b>. Hierarquia visual responde isso. Use tamanho, cor e posição para guiar o olhar:"),
    numbered_list([
        "<b>Headline (topo)</b>: a frase principal do vídeo. Tamanho grande, cor de destaque. Persistente nos primeiros 3s.",
        "<b>Subtitle (abaixo)</b>: contexto ou reforço. Tamanho médio, cor secundária.",
        "<b>Caption (rodapé)</b>: legendas da fala. Tamanho pequeno-médio, alta legibilidade. Persistente durante toda a fala.",
        "<b>Highlight</b>: palavra-chave destacada. Cor contrastante, animação. Usado para reforçar termos importantes.",
    ]),
    callout(
        "Regra do 1-3-1",
        "Em qualquer momento do vídeo, máximo 1 headline + 3 linhas de caption + 1 highlight. Mais que isso, vira poluição. Menos é premium.",
    ),
    h2("Motion graphics: animação intencional"),
    body("Motion graphics são elementos gráficos animados: formas, ícones, setas, números. Use para <b>reforçar visualmente o que está sendo dito</b>. Exemplo: você fala &ldquo;aumentou 300%&rdquo; — número 300% aparece animado na tela."),
    body("Princípios do motion premium:"),
    bullet_list([
        "<b>Ease in/out</b>: animações premium desaceleram no final (ease out). Movimento linear parece robótico.",
        "<b>Duração curta</b>: animações de 0,3-0,5s. Mais longas distraem. Mais curtas parecem glitch.",
        "<b>Consistência</b>: use o mesmo tipo de animação em todo o vídeo. Misturar estilos é amador.",
        "<b>Propósito</b>: cada motion graphic deve reforçar conteúdo. Não decore com motion.",
    ]),
    h2("Legendas: obrigatório em Reels"),
    body("80% dos espectadores assistem Reels sem som. Sem legendas, você perde 80% da audiência. Legendar é obrigatório. Mas legendar <b>mal</b> também perde audiência."),
    body("Regras para legendas premium:"),
    numbered_list([
        "<b>Quebra por sentido</b>: não legende frase inteira de uma vez. Quebre em pedaços de 3-5 palavras.",
        "<b>Highlight de palavra-chave</b>: em cada pedaço, destaque a palavra mais importante (cor ou animação).",
        "<b>Posição</b>: terço inferior da tela, mas acima da barra do Instagram. Deixe espaço para UI da plataforma.",
        "<b>Fonte</b>: sans-serif bold, alta legibilidade. Evite fontes decorativas em legendas.",
        "<b>Sincronia</b>: legenda deve aparecer 0,1s antes da fala começar. Cria antecipação.",
    ]),
    body("Ferramentas para legendar: CapCut (gratuito, automático com IA), Premiere Pro (manual mas preciso), Submagic (pago, automático premium). CapCut resolve 90% dos casos."),
    h2("Lower thirds e cards"),
    body("Lower thirds são aquelas barras com nome/cargo de quem aparece. Cards são telas cheias com informação (quote, estatística). Use ambos para reforçar autoridade e pontos-chave."),
    body("Premium lower third: fundo semi-transparente com blur, texto branco, linha colorida à esquerda, animação de slide-in. Premium card: fundo sólido (cor da marca), texto centralizado, animação de fade com scale."),
    exercise_box("Exercício do Capítulo 6", [
        "Pegue um vídeo seu sem texto. Adicione: headline nos primeiros 3s, legendas sincronizadas, 1 highlight por ponto-chave.",
        "Aplique animação consistente em todos os elementos (ex: fade-up).",
        "Aplique a regra do 1-3-1. Se passou, refaça com menos.",
        "Compare retenção do vídeo antes/depois. Texto bem feito aumenta retenção em 20-40%.",
    ]),
]


# ============================================================
# CAPÍTULO 7: ESTRUTURA DE RETENÇÃO EM VÍDEO
# ============================================================
CHAPTER_7 = [
    body_lead("Edição premium não é estética. É retenção. Todo corte, transição, efeito existe para uma coisa: manter o espectador assistindo. Neste capítulo, você vai conhecer a anatomia da retenção e como construir vídeos que prendem do primeiro ao último segundo."),
    h2("A curva de retenção"),
    body("Todo vídeo tem uma curva de retenção — gráfico que mostra quantos espectadores continuam a cada segundo. Curvas saudáveis têm formato específico: <b>queda inicial íngreme (segundos 1-3), estabilização (3-Xs), queda suave no meio, micro-pico no payoff final</b>."),
    illustration_image(narrative_arc(), width=14*cm),
    caption("Curva de retenção ideal: queda inicial controlada, estabilização, pico no payoff"),
    body("Se sua curva tem queda acentuada no meio, o problema é pacing. Se tem queda no início, o problema é gancho. Se não tem pico final, o problema é payoff. Diagnóstico pela curva é mais preciso que achismo."),
    h2("Os 4 estágios da retenção"),
    h3("Estágio 1 — Gancho (0-3s)"),
    body("Aqui você ganha ou perde. 80% da audiência decide nos primeiros 3 segundos. Use edição para reforçar o gancho: cortes rápidos, texto imediato, som de impacto. Não perca tempo com introduções. Vá direto ao conflito."),
    h3("Estágio 2 — Desenvolvimento (3-Xs)"),
    body("Aqui você mantém. Pacing alto, informação nova a cada 3-5s. Micro-variações de ritmo. Cada bloco de 5-10s deve ter um mini-payoff (insight, surpresa, virada). Sem mini-payoffs, o espectador perde interesse."),
    h3("Estágio 3 — Auge (clímax)"),
    body("O momento de maior tensão ou revelação. Edição premium aqui: <b>desacelera</b>. Corte mais lento, silêncio antes da revelação, hold em plano chave. O contraste com o ritmo anterior amplifica o impacto."),
    h3("Estágio 4 — Payoff (final)"),
    body("A resolução. Aqui o espectador deve sentir que valeu a pena ter assistido. Edição premium: ritmo médio, CTA claro, micro-loop (última frase conecta com a primeira). O payoff determina se o espectador vai comentar, salvar ou compartilhar."),
    h2("Micro-hooks: a técnica de retenção contínua"),
    body("Gancho não é só nos primeiros 3 segundos. <b>Micro-hooks</b> são pequenas promessas espalhadas pelo vídeo que mantêm curiosidade. Exemplos:"),
    bullet_list([
        "&ldquo;E no final eu te mostro como evitar isso&rdquo; (no segundo 5)",
        "&ldquo;Mas o terceiro erro é o pior&rdquo; (no segundo 15)",
        "&ldquo;Wait for it&rdquo; (antes de uma demonstração)",
        "&ldquo;A resposta vai te surpreender&rdquo; (antes de uma estatística)",
    ]),
    body("Microhooks criam <b>lacunas cognitivas</b> que o espectador precisa fechar. Cada microhook adiciona 3-5s de retenção. Vídeos premium têm 3-5 microhooks espalhados estrategicamente."),
    h2("Padrões de retenção por formato"),
    h3("Reels curtos (15s)"),
    body("Estrutura: 1s gancho + 12s desenvolvimento + 2s payoff. Pacing altíssimo. Microhook único no segundo 8. Loop forte no final."),
    h3("Reels médios (30-60s)"),
    body("Estrutura: 3s gancho + 25-55s desenvolvimento + 2s payoff. Pacing médio-alto. 2-3 microhooks. Mini-virada no segundo 20."),
    h3("YouTube curtos (até 3min)"),
    body("Estrutura: 10s gancho + desenvolvimento com 3 atos + 15s payoff + CTA. Pacing médio. Microhooks a cada 30s."),
    callout(
        "A regra do payoff escalado",
        "Cada 30s de vídeo precisa de 1 mini-payoff. Vídeo de 60s = 2 mini-payoffs. Vídeo de 3min = 6 mini-payoffs. Sem mini-payoffs, retenção despenca. Com eles, mantém-se estável.",
    ),
    exercise_box("Exercício do Capítulo 7", [
        "Abra o Instagram Studio (ou YouTube Studio) e olhe a curva de retenção dos seus últimos 5 vídeos.",
        "Identifique: (a) onde a queda é mais acentuada, (b) onde tem picos (momentos de alta retenção).",
        "Para cada vídeo, anote 1 mudança que faria para melhorar a curva.",
        "Aplique 1 mudança por vídeo nos próximos 5 vídeos. Compare curvas antes/depois.",
    ]),
]


# ============================================================
# CAPÍTULO 8: EDIÇÃO PARA REELS VS YOUTUBE VS STORIES
# ============================================================
CHAPTER_8 = [
    body_lead("Mesmo conteúdo, plataformas diferentes, edições diferentes. Edição premium entende que Reels, YouTube e Stories têm regras próprias. Editar igual para os três é desperdício. Neste capítulo, você vai dominar cada plataforma."),
    h2("Reels: a arte da compressão"),
    body("Reels são vídeos curtos (15-90s) no feed do Instagram. Características: público frio (não te conhece), scroll rápido, som opcional. Estratégia de edição: <b>compressão máxima</b>."),
    bullet_list([
        "<b>Duração ideal</b>: 15-30s para alcance, 60-90s para conexão.",
        "<b>Cortes</b>: a cada 1-2s nos primeiros 5s, depois a cada 2-3s.",
        "<b>Texto</b>: headline grande nos primeiros 3s, legendas em toda a fala.",
        "<b>Música</b>: alta energia, com build-up. Trending audio quando relevante.",
        "<b>CTA</b>: visual e verbal nos últimos 2s. &ldquo;Segue para mais.&rdquo;",
    ]),
    h2("YouTube: a arte da profundidade"),
    body("YouTube é vídeo longo (5-20min), público morno (escolheu assistir), som ligado. Estratégia: <b>profundidade com ritmo</b>. Diferente de Reels, você tem tempo — mas precisa manter atenção por mais tempo."),
    bullet_list([
        "<b>Duração ideal</b>: 8-12min para retenção, 15-20min para autoridade.",
        "<b>Cortes</b>: a cada 3-5s. Jump cuts para limpar fala. B-roll para variar.",
        "<b>Texto</b>: lower thirds para nomes, cards para estatísticas, highlights em pontos-chave.",
        "<b>Música</b>: baixa intensidade, mudança de música para mudar seção.",
        "<b>CTA</b>: cards e end-screen. Menção verbal no início e final.",
    ]),
    callout(
        "Diferença essencial",
        "Reels = captura atenção de quem não quer te assistir. YouTube = mantém atenção de quem escolheu te assistir. Por isso Reels é mais agressivo, YouTube é mais paciente.",
    ),
    h2("Stories: a arte da sequência"),
    body("Stories são sequências de vídeos curtos (15s cada), público morno (seus seguidores), alta interatividade (enquetes, perguntas). Estratégia: <b>sequência narrativa com ganchos de continuação</b>."),
    bullet_list([
        "<b>Duração</b>: 3-7 stories por sequência, 15s cada. Mais que isso, perde-se engajamento.",
        "<b>Estrutura</b>: story 1 = gancho, stories 2-5 = desenvolvimento, story final = CTA.",
        "<b>Texto</b>: grande, central, com perguntas para gerar resposta.",
        "<b>Stickers</b>: enquete, perguntas, slider. Use 1 por story para gerar interação.",
        "<b>Continuidade</b>: cada story deve terminar com gancho para o próximo. &ldquo;E o pior está por vir...&rdquo;",
    ]),
    h2("Adaptação cross-platform"),
    body("Você gravou um conteúdo. Como adaptar para as 3 plataformas? Workflow premium:"),
    numbered_list([
        "<b>Grave o longo (YouTube) primeiro</b>: 8-12min, conteúdo completo.",
        "<b>Extraia 3-5 Reels</b>: cada um com um gancho diferente, usando trechos do longo.",
        "<b>Adapte 5-7 Stories</b>: resumo do longo com ganchos de continuação.",
        "<b>Mantenha consistência visual</b>: mesma paleta de cor, mesma fonte, mesmo logo.",
        "<b>Personalize CTA</b>: cada plataforma tem CTA ideal (segue, inscreve, responde).",
    ]),
    h2("Erros comuns de adaptação"),
    body("Erros que destróem cross-platform:"),
    bullet_list([
        "<b>Cortar YouTube em 4 e postar como Reels</b>: cortes aleatórios sem re-gancho. Cada Reel precisa de abertura própria.",
        "<b>Postar Reels como Stories</b>: Reels tem 16:9, Stories tem 9:16. Formato errado destrói experiência.",
        "<b>Usar mesma legenda em tudo</b>: YouTube aceita parágrafos. Reels precisa de hashtag estratégica. Stories não usa hashtag.",
        "<b>Ignorar CTA da plataforma</b>: &ldquo;segue&rdquo; no YouTube deveria ser &ldquo;inscreve&rdquo;. Detalhe que perde conversão.",
    ]),
    exercise_box("Exercício do Capítulo 8", [
        "Grave 1 vídeo longo (8-12min) sobre tema do seu nicho.",
        "Edite a versão YouTube completa.",
        "Extraia 3 Reels com ganchos próprios (não cortes aleatórios).",
        "Adapte para 5 Stories com sequência narrativa e ganchos de continuação.",
        "Publique nas 3 plataformas. Compare retenção e engajamento cruzado.",
    ]),
]


# ============================================================
# CAPÍTULO 9: WORKFLOW DE PRODUÇÃO
# ============================================================
CHAPTER_9 = [
    body_lead("Edição premium não é sobre talento. É sobre processo. Editores profissionais editam mais rápido e melhor não porque são mais criativos — mas porque têm workflow. Neste capítulo, você vai construir o seu."),
    h2("O workflow premium de 7 etapas"),
    illustration_image(editing_workflow_diagram(), width=15*cm),
    caption("Workflow de edição premium: do raw ao publicado"),
    body("Todo vídeo premium passa por 7 etapas. Pular qualquer uma gera vídeo amador. Vamos a elas:"),
    h3("Etapa 1 — Organização (pré-edição)"),
    body("Antes de abrir o software: organize footage. Crie pastas (raw, áudio, gráficos, export). Renomeie clipes importantes. Marque os melhores takes. Tempo gasto aqui economiza 3x no final."),
    h3("Etapa 2 — Seleção (rough cut)"),
    body("Puxe todos os clipes para o timeline. Sem edição fina. Apenas selecione o que entra e o que sai. Resultado: vídeo &ldquo;cru&rdquo; com 80% do conteúdo final. Não se preocupe com cortes precisos aqui — apenas com a estrutura."),
    h3("Etapa 3 — Trim (fine cut)"),
    body("Agora refine cada corte. Elimine pausas, &ldquo;ééé&rdquo;, respirações longas. Ajuste timing. Resultado: vídeo no ritmo certo, com 95% do conteúdo final. Esta é a etapa que mais consome tempo — e que mais diferencia amador de premium."),
    h3("Etapa 4 — Áudio"),
    body("Equilibre volumes. Aplique ducking. Adicione música, SFX, ambiente. Masterize a voz (compressão, EQ, de-noise). Áudio premium faz vídeo parecer 50% mais profissional."),
    h3("Etapa 5 — Cor"),
    body("Color correction primeiro (por clipe). Depois color grading (look consistente). Aplique LUT se necessário. Verifique consistência entre clipes. Premium tem cor uniforme — não muda a cada corte."),
    h3("Etapa 6 — Gráficos"),
    body("Adicione texto, legendas, motion graphics, lower thirds. Hierarquia visual clara. Animações consistentes. Não decore — cada elemento deve ter propósito."),
    h3("Etapa 7 — Review e export"),
    body("Assista ao vídeo 3x: (1) sem som, (2) sem vídeo (só áudio), (3) completo. Corrija o que pular. Exporte em resolução máxima. Teste em celular antes de publicar."),
    h2("Atalhos de teclado: o segredo da velocidade"),
    body("Editores premium usam atalhos para tudo. Mouse é para posicionamento — não para comandos. Aprenda os 10 atalhos essenciais:"),
    data_table(
        ["Atalho", "Função", "Frequência"],
        [
            ["Espaço", "Play/Pause", "100x/dia"],
            ["J/K/L", "Reverse/Pause/Forward", "50x/dia"],
            ["I/O", "Mark In/Out", "30x/dia"],
            ["C/V", "Razor/Select", "40x/dia"],
            ["Cmd+K", "Cortar no playhead", "30x/dia"],
            ["Cmd+Z", "Desfazer", "20x/dia"],
            ["A/S", "Trim anterior/posterior", "20x/dia"],
            ["Q/W", "Ripple delete anterior/posterior", "15x/dia"],
            ["Cmd+S", "Salvar", "5min"],
            ["M", "Adicionar marcador", "10x/dia"],
        ],
    ),
    body("Aprenda 1 atalho por dia. Em 2 semanas, sua velocidade de edição dobra. Em 1 mês, triplica. Premium é velocidade + qualidade — não só qualidade."),
    h2("Versionamento e backup"),
    body("Nunca edite sobre o mesmo arquivo. Use versionamento: v1_rough, v2_trim, v3_color, v4_final. Se algo quebrar, você volta à versão anterior. Salve a cada 10 minutos. Faça backup diário em nuvem (Google Drive, Dropbox)."),
    callout(
        "Regra do 3-2-1",
        "3 cópias de cada projeto, em 2 mídias diferentes (HD + nuvem), com 1 cópia offsite. Vídeo perdido é cliente perdido. Premium é também confiabilidade.",
    ),
    exercise_box("Exercício do Capítulo 9", [
        "Mapeie seu workflow atual. Quantas das 7 etapas você faz?",
        "Identifique a etapa que mais pula. Provavelmente é áudio ou cor.",
        "No próximo vídeo, faça as 7 etapas na ordem. Cronometre cada uma.",
        "Anote o tempo total. Compare com seu tempo anterior (provavelmente era mais lento por falta de processo).",
    ]),
]


# ============================================================
# CAPÍTULO 10: FERRAMENTAS
# ============================================================
CHAPTER_10 = [
    body_lead("Software não faz editor premium. Mas escolher o errado atrapalha. Neste capítulo, você vai conhecer as 3 ferramentas dominantes — CapCut, Premiere, DaVinci Resolve — e qual escolher para cada momento da sua carreira."),
    h2("CapCut: o rei dos Reels"),
    body("CapCut (gratuito com plano Pro) é a ferramenta padrão para criadores de Reels e TikTok. Razões: <b>templates, legendas automáticas com IA, biblioteca de músicas trending, interface móvel</b>. Para 80% dos criadores, CapCut resolve."),
    h3("Quando usar CapCut"),
    bullet_list([
        "Reels e TikToks curtos (até 60s).",
        "Edição no celular (rápida, on-the-go).",
        "Legendas automáticas (a IA do CapCut é a melhor do mercado gratuito).",
        "Templates trending (use com cuidado — não virou trending por ser bom).",
    ]),
    h3("Limitações do CapCut"),
    bullet_list([
        "Color grading limitado (sem controles HSL avançados).",
        "Sound design básico (sem ducking automático real).",
        "Motion graphics limitados (sem keyframes complexos).",
        "Não ideal para vídeos longos ou projetos complexos.",
    ]),
    h2("Premiere Pro: o padrão da indústria"),
    body("Premiere Pro (Adobe, pago por assinatura) é o padrão da indústria audiovisual. Integra com After Effects, Photoshop, Audition. É a ferramenta para quem leva edição a sério. Curva de aprendizado íngreme, mas capacidades ilimitadas."),
    h3("Quando usar Premiere"),
    bullet_list([
        "Vídeos longos (YouTube, cursos, documentários).",
        "Projetos complexos com múltiplas câmeras e fontes.",
        "Integração com After Effects para motion graphics avançados.",
        "Workflows profissionais com equipe.",
    ]),
    h3("Limitações do Premiere"),
    bullet_list([
        "Custo: R$ 100-200/mês (plano completo Adobe).",
        "Curva de aprendizado de 3-6 meses para fluência.",
        "Requer hardware robusto (mínimo 16GB RAM, SSD, GPU dedicada).",
        "Excesso de funcionalidades pode paralisar iniciantes.",
    ]),
    h2("DaVinci Resolve: o premium gratuito"),
    body("DaVinci Resolve (gratuito com plano Studio) é o melhor custo-benefício do mercado. Color grading de nível Hollywood (foi feito para isso), edição completa, sound design (Fairlight), motion graphics (Fusion). Tudo em um."),
    h3("Quando usar DaVinci"),
    bullet_list([
        "Você quer color grading premium sem pagar Adobe.",
        "Você quer uma ferramenta completa gratuita para aprender.",
        "Você planeja profissionalizar edição sem custo de software.",
        "Seu foco é correção de cor cinematográfica.",
    ]),
    h3("Limitações do DaVinci"),
    bullet_list([
        "Curva de aprendizado ainda mais íngreme que Premiere.",
        "Fusion (motion graphics) é menos intuitivo que After Effects.",
        "Hardware ainda mais exigente que Premiere.",
        "Menos tutorials em português comparado a Premiere/CapCut.",
    ]),
    h2("Comparação direta"),
    illustration_image(tool_comparison_table(), width=15*cm),
    caption("Comparação das 3 ferramentas: CapCut, Premiere, DaVinci"),
    h2("Stack recomendado por nível"),
    h3("Iniciante (até 10k seguidores)"),
    body("CapCut no celular. Foque em conteúdo, não em software. Aprenda ritmo, pacing, storytelling. Software não salva conteúdo ruim."),
    h3("Intermediário (10k-100k seguidores)"),
    body("CapCut no desktop (mais recursos) OU DaVinci Resolve gratuito. Comece a aprender atalhos, color grading, sound design. Hora de profissionalizar."),
    h3("Avançado (100k+ seguidores ou profissional)"),
    body("Premiere Pro + After Effects OU DaVinci Studio. Stack completa. Possivelmente contrate editor. Foque em estratégia e direção criativa."),
    callout(
        "Princípio da ferramenta certa",
        "Não mude de software até sentir que a ferramenta atual está te limitando. CapCut não limita iniciantes — limita editores avançados. Muito criador muda para Premiere antes de dominar CapCut e piora a edição (mais recursos, menos foco).",
    ),
    exercise_box("Exercício do Capítulo 10", [
        "Avalie seu nível atual: iniciante, intermediário, avançado.",
        "Liste 3 limitações que você sente no software atual.",
        "Se as limitações são reais (não falta de habilidade), considere migrar.",
        "Antes de migrar, assista a 5 tutoriais da ferramenta nova para validar curva de aprendizado.",
    ]),
]


# ============================================================
# CAPÍTULO 11: ERROS COMUNS QUE DESTROEM RETENÇÃO
# ============================================================
CHAPTER_11 = [
    body_lead("90% dos vídeos que perdem retenção cometem os mesmos 7 erros. Neste capítulo, você vai conhecê-los — e, mais importante, aprender a corrigi-los. Identificar e eliminar erros é mais eficaz que adicionar técnicas."),
    h2("Erro 1 — Abertura longa demais"),
    body("O erro #1. Vídeo abre com &ldquo;E aí pessoal, tudo bem? Aqui é o [nome] e hoje eu vou falar sobre...&rdquo;. Em 5 segundos, 70% rolou. Abertura premium vai direto ao conflito. &ldquo;Você está fazendo isso errado&rdquo; em 1 segundo. Apresentação vem depois, contextualizada."),
    body("Correção: comece pelo gancho. Apresentação (se necessária) vem após o gancho ter prendido atenção. Quem assiste aos 3 primeiros segundos decide assistir aos próximos 30 — não precisa saber seu nome para isso."),
    h2("Erro 2 — Pacing monótono"),
    body("Vídeo inteiro com mesma velocidade de cortes, mesma densidade de informação, mesmo tom de voz. Resultado: espectador sabe o que vem a seguir e perde interesse. Premium varia: rápido no início, médio no desenvolvimento, lento no clímax."),
    body("Correção: mapeie seu vídeo por blocos de 5s. Cada bloco deve ter ritmo diferente do anterior. Se 2 blocos consecutivos têm mesma velocidade, um deles precisa mudar."),
    h2("Erro 3 — Sem microhooks"),
    body("Vídeo tem 1 gancho no início e 0 microhooks no meio. Resultado: espectador assiste 10s, sente que já entendeu, rola. Microhooks são promessas espalhadas que mantêm curiosidade."),
    body("Correção: para cada 30s de vídeo, adicione 1 microhook. &ldquo;E no final eu te mostro&rdquo;, &ldquo;mas o pior está por vir&rdquo;, &ldquo;a resposta vai te surpreender&rdquo;. Microhooks custam 2s e rendem 30s de retenção."),
    h2("Erro 4 — Áudio mal mixado"),
    body("Música alta competindo com voz. SFX sem propósito. Silêncios mortos entre frases. Espectador sente &ldquo;algo está errado&rdquo; mas não sabe o quê. Áudio mal mixado é a causa #1 de &ldquo;parece amador&rdquo; mesmo com boa imagem."),
    body("Correção: aplique ducking. Música 15-25dB abaixo da voz. Adicione SFX apenas em cortes importantes. Use silêncio intencional antes de revelações. Áudio premium é invisível — você só percebe quando falta."),
    callout(
        "Teste do áudio",
        "Feche os olhos e assista ao vídeo apenas pelo som. Você entende tudo? A emoção está clara? Se sim, áudio está bom. Se não, áudio precisa de trabalho.",
    ),
    h2("Erro 5 — Texto poluindo"),
    body("Texto demais na tela. Múltiplas fontes. Animações inconsistentes. Cores que não conversam com a paleta. Texto que compete com a fala em vez de reforçar. Poluição visual é o segundo maior sintoma de edição amadora (atrás só de áudio ruim)."),
    body("Correção: aplique a regra do 1-3-1 (1 headline + 3 linhas de caption + 1 highlight por vez). Máximo 2 fontes. Animação consistente em todo o vídeo. Se texto não reforça conteúdo, remova."),
    h2("Erro 6 — Falta de B-roll"),
    body("Vídeo inteiro é você falando para a câmera. Plano único. Resultado: cansa visualmente após 10s. Premium usa B-roll — imagens de apoio que ilustram o que está sendo dito. Sem B-roll, vídeo parece transmissão ao vivo, não conteúdo editado."),
    body("Correção: para cada 10s de fala, tenha 1-2 clipes de B-roll. Pode ser: mãos fazendo ação, produto sendo usado, paisagem, texto na tela, gravação de tela. B-roll quebra monotonia e mantém atenção."),
    h2("Erro 7 — Payoff fraco"),
    body("Vídeo prende atenção por 30s, mas o final é &ldquo;então é isso, espero que tenham gostado, segue aí&rdquo;. Anticlímax. Espectador sente que desperdiçou 30s. Não compartilha, não salva, não comenta. Payoff fraco destrói todo o trabalho anterior."),
    body("Correção: o payoff deve ser o momento mais forte do vídeo. Insight principal, virada emocional, revelação. CTA vem <b>depois</b> do payoff, não no lugar dele. Estrutura: 80% conteúdo + 15% payoff + 5% CTA."),
    h2("Checklist de erro: use antes de publicar"),
    bullet_list([
        "☐ Abertura vai direto ao gancho (sem apresentação longa)?",
        "☐ Ritmo varia em blocos de 5s?",
        "☐ Tenho 1+ microhook(s) a cada 30s?",
        "☐ Áudio está mixado (música abaixo da voz, SFX intencional)?",
        "☐ Texto segue regra 1-3-1?",
        "☐ Tenho B-roll a cada 10s?",
        "☐ Payoff é o momento mais forte do vídeo?",
    ]),
    body("Se todos os 7 itens estão OK, seu vídeo tem base premium. Se algum falha, corrija antes de publicar. Publicar vídeo com erro conhecido é sabotagem."),
    exercise_box("Exercício do Capítulo 11", [
        "Pegue 3 vídeos seus que performaram abaixo da média.",
        "Para cada, identifique qual dos 7 erros está presente (provavelmente mais de 1).",
        "Escolha 1 vídeo e refaça corrigindo TODOS os erros identificados.",
        "Republique (ou poste versão similar com correções). Compare retenção.",
    ]),
]


# ============================================================
# CAPÍTULO 12: EDIÇÃO COM IA
# ============================================================
CHAPTER_12 = [
    body_lead("IA não vai substituir editores. Mas editores que usam IA vão substituir os que não usam. Neste capítulo, você vai conhecer o stack de IA para edição — e como integrá-lo sem perder o toque humano que faz premium."),
    h2("O que IA faz bem em edição"),
    body("IA é excelente em tarefas repetitivas e análises que humanos fazem mal. Em edição, isso significa:"),
    bullet_list([
        "<b>Legendas automáticas</b>: CapCut, Submagic, Premiere geram legendas com 95%+ de precisão. Tempo economizado: 80% por vídeo.",
        "<b>Remoção de silêncio</b>: IA detecta pausas e corta automaticamente. Tempo economizado: 60% em jump cuts.",
        "<b>Remoção de fundo</b>: IA separa sujeito do fundo sem chroma key. Útil para B-roll e composições.",
        "<b>Color match</b>: IA iguala cor entre clipes. Útil para multi-câmera.",
        "<b>Upscaling</b>: IA aumenta resolução de footage antigo. 720p para 4K com qualidade aceitável.",
        "<b>Áudio cleanup</b>: IA remove ruído de fundo, equaliza voz. Adobe Podcast AI é referência gratuita.",
    ]),
    h2("O que IA faz mal (ainda)"),
    body("IA é péssima em decisões criativas e contextuais. Não confie nela para:"),
    bullet_list([
        "<b>Escolha de cortes narrativos</b>: IA não entende qual corte reforça a história. Use-a para sugerir, decida você.",
        "<b>Color grading artístico</b>: IA pode equalizar cor, mas look cinematográfico exige olho humano.",
        "<b>Sound design</b>: escolha de música, posicionamento de SFX, timing de silêncio — tudo criativo.",
        "<b>Storytelling</b>: IA não sabe qual payoff funciona, qual gancho retém. Você decide.",
        "<b>Final review</b>: sempre revise o resultado da IA. Ela erra em momentos críticos.",
    ]),
    h2("Stack de IA para edição premium"),
    h3("CapCut (legendas + corte automático)"),
    body("CapCut gera legendas automáticas com 95% de precisão. Detecta silêncios e sugere cortes. Templates IA adaptam vídeo a trending audio. Para 80% dos criadores, é suficiente."),
    h3("Descript (edição por texto)"),
    body("Descript transcreve seu vídeo e permite editar como se fosse texto: delete uma palavra no texto, ela some do vídeo. Revolucionário para podcasts e vídeos falados. Remove &ldquo;ééé&rdquo; automaticamente."),
    h3("Adobe Podcast AI (áudio cleanup)"),
    body("Gratuito. Transforma áudio com ruído em áudio de estúdio. Use em todo vídeo onde a gravação não foi ideal. Reduz barulho de fundo, equaliza voz, adiciona presença."),
    h3("Runway ML (geração de vídeo)"),
    body("Geração de B-roll com IA a partir de texto. Útil quando você precisa de imagem específica que não gravou. Cuidado: ainda perceptível como IA — use com moderação."),
    h3("Topaz Video AI (upscale)"),
    body("Pago. Aumenta resolução de footage antigo. 1080p para 4K com qualidade real. Use para reutilizar conteúdo antigo em padrões modernos."),
    h2("Workflow premium com IA"),
    body("Como integrar IA sem perder controle criativo:"),
    numbered_list([
        "<b>Transcrição automática</b>: use IA para transcrever (CapCut, Descript).",
        "<b>Corte de silêncios</b>: use IA para detectar e cortar pausas.",
        "<b>Áudio cleanup</b>: passe voz por Adobe Podcast AI ou similar.",
        "<b>Legendas</b>: gere com IA, revise manualmente (especialmente números e nomes).",
        "<b>B-roll</b>: gere com IA apenas quando necessário. Prefira gravação real.",
        "<b>Color e sound design</b>: faça manualmente. IA aqui ainda não substitui olho/ouvido humano.",
        "<b>Review final</b>: sempre humano. Assista ao vídeo completo antes de publicar.",
    ]),
    callout(
        "Regra do 80/20 da IA",
        "Use IA para 80% das tarefas repetitivas (transcrição, silêncios, cleanup, legendas). Reserve 20% do tempo para o que IA não faz: criatividade, timing, contexto. Esse 20% é o que torna premium.",
    ),
    h2("O futuro próximo: IA generativa em vídeo"),
    body("Ferramentas como Sora (OpenAI) e Runway Gen-3 prometem gerar vídeos completos a partir de texto. Para criadores: use para B-roll e experimentação. Não substitui gravação real para conteúdo autoral. Espectador percebe IA — e premium tem autenticidade que IA não tem."),
    body("Estratégia premium: domine gravação real. Use IA como complemento, não substituto. Em 5 anos, o que vai diferenciar editores premium não é quem usa mais IA — é quem tem visão criativa que IA não tem."),
    exercise_box("Exercício do Capítulo 12", [
        "Liste 5 tarefas repetitivas que você faz em cada edição (legenda, corte de silêncio, etc).",
        "Para cada, encontre uma ferramenta de IA que automatize.",
        "Aplique 1 ferramenta nova no próximo vídeo. Meça tempo economizado.",
        "Use o tempo economizado para revisar criativamente o vídeo. É aí que está o premium.",
    ]),
]


# ============================================================
# CAPÍTULO 13: MONETIZAÇÃO ATRAVÉS DE EDIÇÃO
# ============================================================
CHAPTER_13 = [
    body_lead("Edição premium não é só estética. É dinheiro. Criadores com edição premium faturam 3-5x mais que criadores com mesmo conteúdo mas edição amadora. Neste capítulo, você vai transformar habilidade técnica em receita."),
    h2("Por que edição premium aumenta receita"),
    body("Edição premium impacta receita em 4 frentes:"),
    bullet_list([
        "<b>Retenção → alcance</b>: vídeos com retenção premium viralizam mais. Mais alcance = mais audiência = mais oportunidades de monetização.",
        "<b>Percepção de valor</b>: vídeo premium parece &ldquo;caro&rdquo;. Marcas pagam mais para aparecer em conteúdo que parece premium. CPM de parcerias sobe 50-200%.",
        "<b>Conversão de produto</b>: vídeos de venda bem editados convertem 2-3x mais que vídeos amadores. Edição é parte do copywriting visual.",
        "<b>Serviço de edição</b>: você pode vender edição como serviço. Mercado paga R$ 50-500 por vídeo editado, dependendo do nível.",
    ]),
    h2("Modelos de monetização"),
    h3("Modelo 1 — Crescimento de audiência"),
    body("Edição premium aumenta retenção → alcance → seguidores. Mais seguidores = mais receita por: AdSense (YouTube), programa de criadores (Instagram), parcerias, vendas de produto próprio. Investir em edição é investir em distribuição."),
    h3("Modelo 2 — Parcerias e patrocínios"),
    body("Marcas pagam para aparecer em conteúdo premium. Faixa de preço por Reel patrocinado: R$ 200 (10k seguidores) a R$ 50.000+ (1M+ seguidores). Edição premium é o que diferencia quem cobra R$ 200 de quem cobra R$ 2.000 no mesmo tamanho de conta."),
    h3("Modelo 3 — Venda de produto próprio"),
    body("Curso, mentoria, e-book, assinatura. Vídeo de venda bem editado converte mais. Edição premium em vídeo de venda: <b>2-3x mais conversão</b> que vídeo amador. Investir em edição é investir em CRO (conversion rate optimization)."),
    h3("Modelo 4 — Serviço de edição para outros"),
    body("Venda edição como serviço. Tabela de preço típica (Brasil, 2024):"),
    data_table(
        ["Tipo de edição", "Duração", "Preço (R$)"],
        [
            ["Reels curtos", "15-30s", "50-150"],
            ["Reels médios", "30-60s", "150-400"],
            ["YouTube curto", "5-10min", "400-1.500"],
            ["YouTube longo", "10-30min", "1.500-5.000"],
            ["Edição premium + motion", "qualquer", "+50-100%"],
        ],
    ),
    body("Para editar 5 vídeos/semana a R$ 200 cada = R$ 4.000/mês. Para editar 5 vídeos premium/semana a R$ 500 cada = R$ 10.000/mês. Premium multiplica receita."),
    h2("Como cobrar por edição"),
    body("Estratégia de preço para editores:"),
    numbered_list([
        "<b>Defina preço base</b>: hora trabalhada × valor/hora desejado. Ex: R$ 50/h × 6h por vídeo = R$ 300/vídeo.",
        "<b>Adicione valor por complexidade</b>: +50% para color grading avançado, +100% para motion graphics complexos.",
        "<b>Cobre por projeto, não por hora</b>: cliente não quer saber quanto tempo levou. Quer saber quanto custa.",
        "<b>Ofereça pacotes</b>: 4 vídeos/mês por R$ 1.500 (mais barato por vídeo, mas garante receita recorrente).",
        "<b>Aumente preço a cada 3 meses</b>: conforme portfólio cresce, valor aumenta. Não tenha medo de cobrar caro.",
    ]),
    callout(
        "O erro do preço baixo",
        "Editores iniciantes cobram barato para &ldquo;conseguir cliente&rdquo;. Resultado: atraem clientes ruins, trabalham muito por pouco, não têm tempo para evoluir. Cobrar caro atrai clientes que respeitam seu trabalho e pagam por valor.",
    ),
    h2("Construindo portfólio premium"),
    body("Cliente paga pelo que vê. Sem portfólio, você é apenas promessa. Construa portfólio:"),
    bullet_list([
        "<b>Edite seu próprio conteúdo</b>: seus Reels são seu portfólio. Cada vídeo é demonstração de skill.",
        "<b>Faça edições gratuitas estratégicas</b>: edite 3 vídeos para criadores estabelecidos em troca de crédito. Vira case.",
        "<b>Crie um reel de portfólio</b>: 30s com seus melhores cortes, transições, color grading. Poste no Instagram e LinkedIn.",
        "<b>Documente transformações</b>: &ldquo;antes/depois&rdquo; de edição. Mostra seu valor em 5 segundos.",
        "<b>Pediu referência</b>: peça a clientes satisfeitos. 80% dos novos clientes vêm de indicação.",
    ]),
    h2("Negociação com marcas"),
    body("Quando uma marca te procura para parceria:"),
    numbered_list([
        "<b>Não aceite o primeiro valor</b>: marcas sempre abrem baixo. Peça 50-100% a mais.",
        "<b>Vende valor, não views</b>: &ldquo;Meus vídeos retêm 60% da audiência até o final. Isso significa que sua marca terá 3x mais exposição real que com criador de mesmo tamanho mas baixa retenção.&rdquo;",
        "<b>Inclua edição no briefing</b>: se a marca quiser produto destacado, motion graphics, etc — cobre adicional.",
        "<b>Garanta direito de usar no portfólio</b>: parceria premium vira case premium.",
        "<b>Entregue além do combinado</b>: 1 versão principal + 1 versão cortada para Stories + 1 teaser. Cliente percebe cuidado.",
    ]),
    exercise_box("Exercício do Capítulo 13", [
        "Calcule seu preço base atual (horas × valor/hora). Provavelmente está baixo.",
        "Defina preço premium (50-100% acima do atual).",
        "Crie 1 reel de portfólio com seus melhores 30s de edição.",
        "Poste no LinkedIn e Instagram. Marque criadores que admira. Comece a atrair clientes.",
    ]),
]


# ============================================================
# CAPÍTULO 14: CONCLUSÃO + CHECKLIST
# ============================================================
CHAPTER_14 = [
    body_lead("Você chegou ao fim do Manual da Edição Premium. Mas aqui está a verdade desconfortável: ler sobre edição não te torna melhor editor. Editar, medir, iterar — sim. Por isso, em vez de uma conclusão tradicional, vou te deixar com um plano de 30 dias e um checklist definitivo."),
    h2("O que você aprendeu"),
    body("Recapitulando os 13 capítulos anteriores:"),
    bullet_list([
        "<b>Fundamentos</b>: ritmo, pacing, timing — os 3 pilares da edição premium.",
        "<b>Cortes</b>: seco, jump, match, smash, cut on action — quando usar cada um.",
        "<b>Transições</b>: J-cut, L-cut, match, jump estilizado — as 4 essenciais.",
        "<b>Color grading</b>: correção, HSL, 3 estilos básicos, LUTs.",
        "<b>Sound design</b>: 5 camadas sonoras, ducking, SFX, silêncio.",
        "<b>Texto e motion</b>: tipografia, hierarquia, legendas, motion graphics.",
        "<b>Retenção</b>: curva, 4 estágios, microhooks, padrões por formato.",
        "<b>Plataformas</b>: Reels vs YouTube vs Stories — adaptação cross-platform.",
        "<b>Workflow</b>: 7 etapas, atalhos, versionamento.",
        "<b>Ferramentas</b>: CapCut vs Premiere vs DaVinci — escolha por nível.",
        "<b>Erros</b>: 7 erros que destroem retenção e como corrigi-los.",
        "<b>IA</b>: o que IA faz bem, o que faz mal, stack premium com IA.",
        "<b>Monetização</b>: 4 modelos de receita com edição premium.",
    ]),
    h2("Plano de 30 dias para evoluir"),
    h3("Semana 1 — Diagnóstico e fundamentos"),
    body("Pegue seus últimos 5 vídeos. Para cada, identifique: ritmo, pacing, timing, som, cor. Marque os erros do capítulo 11. Refaça 1 vídeo corrigindo TODOS os erros identificados."),
    h3("Semana 2 — Técnicas novas"),
    body("Escolha 3 técnicas que você nunca usou (ex: J-cut, ducking, match cut). Aplique 1 técnica por vídeo em 3 vídeos novos. Meça retenção comparada com média anterior."),
    h3("Semana 3 — Stack premium"),
    body("Aplique o workflow de 7 etapas em 1 vídeo completo. Use as 5 camadas sonoras. Faça color grading com consistência. Adicione motion graphics com propósito."),
    h3("Semana 4 — Cross-platform"),
    body("Grave 1 conteúdo longo (5-10min). Adapte para: 1 YouTube + 3 Reels + 5 Stories. Aplique edição específica para cada plataforma. Publique tudo. Compare retenção entre formatos."),
    h2("Checklist definitivo de edição premium"),
    body("Use este checklist em TODOS os vídeos antes de publicar. Se algum item falha, corrija."),
    h3("Pré-edição"),
    bullet_list([
        "☐ Footage organizado em pastas (raw, áudio, gráficos, export)",
        "☐ Melhores takes marcados",
        "☐ Roteiro/estrutura definidos antes de abrir o software",
    ]),
    h3("Estrutura"),
    bullet_list([
        "☐ Abertura vai direto ao gancho (sem &ldquo;e aí pessoal&rdquo;)",
        "☐ Pacing varia em blocos de 5s",
        "☐ 1+ microhook(s) a cada 30s",
        "☐ Payoff é o momento mais forte do vídeo",
        "☐ CTA após o payoff (não no lugar dele)",
    ]),
    h3("Cortes e transições"),
    bullet_list([
        "☐ Cortes alinhados com batida musical",
        "☐ Cortes alinhados com respiração da fala",
        "☐ Jump cuts eliminam pausas mortas",
        "☐ Transições só quando reforçam narrativa",
        "☐ Sem transições 3D/clichês",
    ]),
    h3("Áudio"),
    bullet_list([
        "☐ Voz limpa (compressão + EQ + de-noise)",
        "☐ Música 15-25dB abaixo da voz",
        "☐ Ducking aplicado",
        "☐ SFX em cortes importantes",
        "☐ Silêncio intencional antes de revelações",
    ]),
    h3("Cor"),
    bullet_list([
        "☐ Color correction em cada clipe",
        "☐ Color grading consistente em todo o vídeo",
        "☐ Skin tones naturais",
        "☐ Branco é branco (não amarelo/azul)",
        "☐ Mesmo look em todos os clipes",
    ]),
    h3("Texto e gráficos"),
    bullet_list([
        "☐ Máximo 2 fontes por vídeo",
        "☐ Hierarquia visual clara (headline/subtitle/caption/highlight)",
        "☐ Regra 1-3-1 respeitada",
        "☐ Legendas sincronizadas e highlight em palavra-chave",
        "☐ Animação consistente em todo o vídeo",
    ]),
    h3("Final"),
    bullet_list([
        "☐ Vídeo assistido 3x (sem som, sem vídeo, completo)",
        "☐ Testado em celular antes de publicar",
        "☐ Versões adaptadas para cada plataforma",
        "☐ Backup do projeto salvo",
    ]),
    callout(
        "A regra final",
        "Premium não é perfeição. É intencionalidade. Cada elemento do vídeo deve ter motivo. Se você não consegue justificar um corte, transição ou efeito, remova. Premium é o que sobra quando você remove o desnecessário.",
    ),
    h2("Última palavra"),
    body("Edição premium é uma habilidade. Habilidades se constroem com prática deliberada. Não com leitura. Não com tutorials. Com prática. Os próximos 30 dias vão definir se você é um leitor de e-books sobre edição ou um editor premium."),
    body("Escolha certa. Edite."),
    spacer(0.5),
    *quote("A diferença entre o amador e o profissional não é talento. É repetição com intenção.", "Clodoaldo Silva"),
    spacer(0.5),
    body("Se este e-book te ajudou, compartilhe com 1 criador que precisa ler. Conteúdo bom merece ser espalhado."),
    spacer(0.5),
    HRule(2*28.35, COLORS["primary"], 1),
    spacer(0.4),
    Paragraph("© Clodoaldo Silva. Todos os direitos reservados. Parte do Knowledge Hub Premium.", get_styles()["Footer_Caption"]),
]


# ============================================================
# APÊNDICE A — GLOSSÁRIO DE TERMOS DE EDIÇÃO
# ============================================================
APPENDIX_A = [
    body_lead("Domine o vocabulário da edição premium. Cada termo que você conhece é uma ferramenta a mais no seu arsenal. Este glossário cobre os 40 termos essenciais que todo editor premium precisa dominar."),
    h2("Termos de corte e transição"),
    data_table(
        ["Termo", "Definição"],
        [
            ["Hard cut", "Corte seco entre dois planos, sem transição."],
            ["Jump cut", "Cortes dentro do mesmo plano para comprimir tempo."],
            ["Match cut", "Corte entre planos com similaridade visual."],
            ["Smash cut", "Corte de contraste máximo (calmo → intenso)."],
            ["Cut on action", "Cortar durante um movimento para esconder a transição."],
            ["J-cut", "Áudio do próximo plano entra antes do vídeo."],
            ["L-cut", "Vídeo do próximo plano entra antes do áudio."],
            ["Crossfade / dissolve", "Transição suave onde um plano fade out enquanto outro fade in."],
            ["Whip pan", "Transição rápida com movimento de câmera."],
            ["Match cut visual", "Conexão visual entre dois planos (cor, forma, movimento)."],
        ],
    ),
    h2("Termos de áudio"),
    data_table(
        ["Termo", "Definição"],
        [
            ["Ducking", "Reduzir volume da música automaticamente quando há fala."],
            ["Sidechain", "Técnica que usa um sinal para controlar outro (base do ducking)."],
            ["EQ (equalização)", "Ajuste de frequências do áudio (graves, médios, agudos)."],
            ["Compressor", "Reduz diferença entre partes altas e baixas do áudio."],
            ["De-noise", "Remove ruído de fundo da gravação."],
            ["SFX", "Sound effects — efeitos sonoros pontuais (whoosh, pop, impact)."],
            ["Bed", "Camada sonora sutil de fundo que conecta o vídeo todo."],
            ["Foley", "SFX gravados em sincronia com a imagem (passos, portas, etc)."],
            ["Loudness", "Medida de volume percebido (em LUFS). YouTube: -14 LUFS."],
            ["Masterização", "Ajuste final de volume e EQ do áudio completo."],
        ],
    ),
    h2("Termos de cor"),
    data_table(
        ["Termo", "Definição"],
        [
            ["Color correction", "Ajuste técnico (exposição, balanço de branco) para imagem real."],
            ["Color grading", "Estilização artística para criar mood."],
            ["LUT (Look-Up Table)", "Preset de cor que aplica estilização completa."],
            ["HSL", "Hue (tonalidade), Saturation (saturação), Luminance (luminância)."],
            ["Highlights", "Partes mais claras da imagem."],
            ["Shadows", "Partes mais escuras da imagem."],
            ["Midtones", "Tons médios entre highlights e shadows."],
            ["Balanço de branco", "Ajuste de temperatura para branco parecer branco."],
            ["Skin tones", "Tons de pele — referência para correção natural."],
            ["Orange and teal", "Look popular: shadows empurradas para azul, highlights para laranja."],
        ],
    ),
    h2("Termos de produção e workflow"),
    data_table(
        ["Termo", "Definição"],
        [
            ["B-roll", "Imagens de apoio que ilustram o que está sendo dito."],
            ["A-roll", "Footage principal (geralmente a fala à câmera)."],
            ["Footage", "Material bruto gravado, antes da edição."],
            ["Rough cut", "Primeira versão do vídeo, sem refinamento."],
            ["Fine cut", "Versão refinada, com cortes precisos."],
            ["Picture lock", "Versão final da edição — sem mais mudanças no vídeo."],
            ["Render / export", "Processo de gerar o arquivo final de vídeo."],
            ["Codec", "Algoritmo de compressão de vídeo (H.264, H.265, ProRes)."],
            ["Bitrate", "Quantidade de dados por segundo — quanto maior, mais qualidade."],
            ["Frame rate (FPS)", "Quadros por segundo. 24 = cinema, 30 = TV, 60 = esporte/gaming."],
        ],
    ),
    spacer(0.3),
    callout(
        "Como usar o glossário",
        "Volte a este glossário sempre que encontrar um termo desconhecido em tutorial ou documentação. Vocabulário técnico é a base para aprender técnicas avançadas — sem ele, você fica preso ao básico.",
    ),
]


# ============================================================
# APÊNDICE B — TEMPLATES DE WORKFLOW
# ============================================================
APPENDIX_B = [
    body_lead("Templates são pontos de partida. Não são regras absolutas — são frameworks que aceleram sua edição. Adapte ao seu estilo. Aqui estão 5 templates que cobrem 90% dos casos de edição premium."),
    h2("Template 1 — Reel educativo (30s)"),
    body("Estrutura para Reels de dica, tutorial curto ou lista."),
    numbered_list([
        "<b>0-1s — Gancho visual</b>: headline grande + take impactante. Sem introdução.",
        "<b>1-3s — Promessa</b>: &ldquo;Em 30s você vai entender X&rdquo; + microhook.",
        "<b>3-25s — Desenvolvimento</b>: 3-5 pontos com cortes a cada 2-3s. B-roll a cada 5s.",
        "<b>25-28s — Payoff</b>: insight principal. Hold em plano. Silêncio antes da frase.",
        "<b>28-30s — CTA + loop</b>: &ldquo;segue para mais&rdquo; conectando com a frase de abertura.",
    ]),
    h2("Template 2 — Reel storytime (45-60s)"),
    body("Estrutura para histórias pessoais com transformação."),
    numbered_list([
        "<b>0-3s — Cena dramática</b>: começa no meio da ação. Frase de impacto.",
        "<b>3-10s — Contexto</b>: onde/ quando/ com quem. B-roll do ambiente.",
        "<b>10-40s — Conflito</b>: o problema, a tentativa, o fracasso. Cortes mais lentos.",
        "<b>40-50s — Virada</b>: a decisão/ descoberta. Auge emocional. Música cresce.",
        "<b>50-60s — Insight + CTA</b>: o aprendizado. Conexão com espectador.",
    ]),
    h2("Template 3 — YouTube longo (8-12min)"),
    body("Estrutura para vídeos aprofundados."),
    numbered_list([
        "<b>0-30s — Cold open</b>: melhor momento do vídeo como amostra. Garante clique.",
        "<b>30s-1min — Intro curta</b>: apresentação + promessa do vídeo.",
        "<b>1-2min — Contexto</b>: por que esse assunto importa.",
        "<b>2-9min — Desenvolvimento</b>: 3-5 seções com B-roll e cards. Mini-payoff a cada 2 min.",
        "<b>9-11min — Payoff principal</b>: insight central, demonstração final.",
        "<b>11-12min — Conclusão + CTA</b>: recap + próximo vídeo + inscrição.",
    ]),
    h2("Template 4 — Story sequência (5 cards)"),
    body("Estrutura para Stories com narrativa."),
    numbered_list([
        "<b>Story 1 — Gancho</b>: pergunta ou cliffhanger. Poll para gerar interação.",
        "<b>Story 2 — Contexto</b>: resposta do gancho. Quem/ quando/ onde.",
        "<b>Story 3-4 — Desenvolvimento</b>: 1 ideia por story. Perguntas para engajamento.",
        "<b>Story 5 — Payoff + CTA</b>: insight final + &ldquo;responde com dúvida&rdquo;.",
    ]),
    h2("Template 5 — Vídeo de venda (3-5min)"),
    body("Estrutura para vender produto/serviço."),
    numbered_list([
        "<b>0-30s — Hook de problema</b>: &ldquo;Você está fazendo X errado&rdquo;. Identificação.",
        "<b>30s-2min — Agitação</b>: por que esse erro custa caro. Evidências. História de dor.",
        "<b>2-3min — Solução</b>: apresentação do método/produto. Demonstração.",
        "<b>3-4min — Prova</b>: depoimentos, números, transformações reais.",
        "<b>4-5min — Oferta + CTA</b>: preço, bônus, garantia, prazo. Chamada clara para ação.",
    ]),
    callout(
        "Templates vs criatividade",
        "Templates não matam criatividade — liberam. Quando você não precisa pensar em estrutura, pode focar em conteúdo, ângulo, storytelling. Use templates como esqueleto; o que importa é a carne que você coloca.",
    ),
]


# ============================================================
# APÊNDICE C — RECURSOS E BIBLIOGRAFIA
# ============================================================
APPENDIX_C = [
    body_lead("Continue sua jornada. Estes são os recursos que recomendo para aprofundar em cada área abordada neste manual."),
    h2("Canais e cursos recomendados"),
    h3("YouTube (gratuito)"),
    bullet_list([
        "<b>Wondrium</b> — tutoriais avançados de Premiere e DaVinci.",
        "<b>Casey Faris</b> — DaVinci Resolve do básico ao avançado.",
        "<b>Premiere Gal</b> — dicas rápidas e efeitos para Premiere.",
        "<b>Indy Mogul</b> — produção de vídeo independente, filmmaking acessível.",
        "<b>DistroIan</b> — áudio para vídeo, mixing e masterização.",
    ]),
    h3("Cursos pagos"),
    bullet_list([
        "<b>Color Grading Central</b> — cursos de color grading por profissionais.",
        "<b>MZED</b> — plataforma de cursos de filmmakers consagrados.",
        "<b>Motion Design School</b> — motion graphics para After Effects.",
        "<b>Skillshare</b> — cursos curtos de edição específica.",
    ]),
    h2("Bibliotecas e assets"),
    h3("Música e SFX"),
    bullet_list([
        "<b>Epidemic Sound</b> (pago) — biblioteca premium sem copyright.",
        "<b>Artlist</b> (pago) — música e SFX por assinatura.",
        "<b>YouTube Audio Library</b> (gratuito) — música e SFX livres.",
        "<b>Freesound.org</b> (gratuito) — SFX colaborativo.",
        "<b>Pixabay Music</b> (gratuito) — música sem copyright.",
    ]),
    h3("LUTs e ferramentas"),
    bullet_list([
        "<b>Lutify.me</b> — pacotes de LUTs cinematográficos.",
        "<b>GroundControl</b> — LUTs gratuitos de qualidade.",
        "<b>Adobe Color</b> — criação de paletas de cor.",
        "<b>Coolors.co</b> — gerador de paletas de cor.",
    ]),
    h3("Footage e B-roll"),
    bullet_list([
        "<b>Pexels</b> (gratuito) — vídeos e fotos livres.",
        "<b>Pixabay</b> (gratuito) — vídeos e fotos.",
        "<b>Coverr</b> (gratuito) — vídeos para uso comercial.",
        "<b>Artgrid</b> (pago) — footage premium de qualidade cinematográfica.",
    ]),
    h2("Livros recomendados"),
    body("Para aprofundar em storytelling, edição e criatividade:"),
    numbered_list([
        "<b>In the Blink of an Eye</b> — Walter Murch. Filosofia da edição por um editor vencedor do Oscar. Essencial.",
        "<b>The Conversação</b> — Walter Murch. Continuação do anterior, mais técnico.",
        "<b>On Film Editing</b> — Edward Dmytryk. Princípios clássicos da edição.",
        "<b>The Film Editing Room Handbook</b> — Steve Cohen. Workflow de produção profissional.",
        "<b>Color Correction Handbook</b> — Alexis Van Hurkman. Bíblia do color grading.",
        "<b>The Sound Effects Bible</b> — Ric Viers. Sound design do zero ao avançado.",
        "<b>Made to Stick</b> — Chip e Dan Heath. Storytelling que cola na memória.",
        "<b>Story</b> — Robert McKee. Estrutura narrativa aplicada a qualquer formato.",
    ]),
    h2("Conecte-se"),
    body("Para continuar a conversa:"),
    bullet_list([
        "<b>Instagram:</b> @clodoaldo_c_silva",
        "<b>TikTok:</b> @clodoald_c_silva",
        "<b>YouTube:</b> @clodoaldosilvaa",
        "<b>E-mail:</b> clodoaldosilva608@gmail.com",
        "<b>Site:</b> clodoaldo.vercel.app",
    ]),
    h2("Outros materiais do ecossistema"),
    bullet_list([
        "<b>Storytelling Magnético</b> — Como criar histórias que prendem atenção e convertem.",
        "<b>30 Ganchos para Reels</b> — Arsenal de aberturas prontas para uso imediato.",
        "<b>IA para Criadores de Conteúdo</b> — Stack completo de ferramentas e prompts para escalar.",
        "<b>Pack de Prompts Premium</b> — 100+ prompts validados para ChatGPT, Gemini e Claude.",
    ]),
    spacer(0.5),
    *quote("A edição nunca termina. Ela apenas atinge um ponto onde você decide publicar. Continue editando — a si mesmo, não só aos vídeos.", "Clodoaldo Silva"),
    spacer(0.5),
    HRule(2*28.35, COLORS["primary"], 1),
    spacer(0.4),
    Paragraph("© Clodoaldo Silva. Todos os direitos reservados. Parte do Knowledge Hub Premium.", get_styles()["Footer_Caption"]),
]


# ============================================================
# APÊNDICE D — FAQ
# ============================================================
APPENDIX_D = [
    body_lead("As 12 perguntas mais comuns que recebo de editores em formação. Se você tem uma dessas dúvidas, não está sozinho — e a resposta está aqui."),
    h2("1. Qual o melhor software para começar?"),
    body("CapCut. Sem dúvida. É gratuito, intuitivo, tem legendas automáticas excelentes e templates que aceleram o aprendizado. Não mude de software até sentir que o CapCut está te limitando — e isso vai demorar 6-12 meses. A maioria dos iniciantes muda cedo demais e piora a edição."),
    h2("2. Quanto tempo leva para editar um Reel premium?"),
    body("Para iniciante: 2-4 horas para um Reel de 30s. Para intermediário: 1-2 horas. Para avançado: 30-60 minutos. Para profissional: 15-30 minutos. A velocidade vem com prática deliberada — editar 1 vídeo por dia durante 90 dias transforma 4 horas em 1 hora."),
    h2("3. Preciso de computador potente para editar?"),
    body("Para CapCut no celular: qualquer smartphone dos últimos 3 anos resolve. Para CapCut desktop ou DaVinci: notebook com 16GB RAM, SSD e GPU dedicada. Para Premiere: ideal 32GB RAM e GPU dedicada. Mas não espere ter o computador perfeito para começar — comece com o que tem."),
    h2("4. Como melhorar a qualidade do áudio sem microfone caro?"),
    body("Adobe Podcast AI (gratuito) transforma áudio mediano em áudio de estúdio. Grave em ambiente silencioso, perto do microfone (15-20cm), e passe por essa ferramenta. Resultado premium sem investimento. Quando puder, invista em microfone de lapela (R$ 100-200) ou shotgun (R$ 300-500)."),
    h2("5. Quantos cortes por minuto é o ideal?"),
    body("Depende do formato. Reels curtos: 20-40 cortes por minuto (1 corte a cada 1,5-3s). Reels médios: 15-25 cortes por minuto. YouTube curto: 10-15 cortes por minuto. YouTube longo: 8-12 cortes por minuto. Mais importante que número é a <b>variação</b> — não corte no mesmo ritmo o vídeo todo."),
    h2("6. Como escolher música certa para o vídeo?"),
    body("3 critérios: (1) BPM alinhado com ritmo dos cortes — vídeos rápidos pedem 110-130 BPM, lentos pedem 70-90 BPM; (2) Mood alinhado com emoção do conteúdo — música triste para storytime triste, energética para tutorial; (3) Sem vocais que competam com sua fala. Prefira instrumental. Bibliotecas: YouTube Audio Library (gratuito), Epidemic Sound (pago)."),
    h2("7. Qual a diferença entre LUT e preset?"),
    body("LUT é arquivo de cor que aplica estilização completa (look cinematográfico). Preset é configuração salva no software — pode incluir cor mas também áudio, efeitos, texto. LUT é universal (funciona em qualquer software). Preset é específico do software. Use LUTs para cor, presets para acelerar workflow completo."),
    h2("8. Como faço B-roll sem equipe?"),
    body("3 opções: (1) grave você mesmo com smartphone em tripod — B-roll de mãos, ações, ambiente; (2) use bibliotecas gratuitas como Pexels, Pixabay, Coverr — busque por palavra-chave; (3) gere com IA (Runway, Pika) para conceitos específicos. Combine as 3 para máximo resultado com mínimo esforço."),
    h2("9. Vale a pena pagar por Premiere ou DaVinci?"),
    body("Depende do momento. Iniciante: não. CapCut gratuito resolve. Intermediário: DaVinci Resolve gratuito é melhor que Premiere pago para a maioria dos casos. Avançado/profissional: avalie. Se trabalha em equipe ou integra com After Effects, Premiere. Se foco é color grading e custo-benefício, DaVinci Studio (pago uma vez, sem assinatura)."),
    h2("10. Como cobrar primeiro cliente de edição?"),
    body("Estratégia para primeiro cliente: (1) faça 3 edições gratuitas para criadores locais em troca de depoimento e indicação; (2) crie portfólio com 5-10 vídeos seus; (3) cobre primeiro projeto entre R$ 100-200 (abaixo do mercado para entrar); (4) após 3 clientes satisfeitos, dobre o preço; (5) a cada 3 meses, aumente 30-50%. Premium se cobra premium."),
    h2("11. IA vai substituir editores?"),
    body("Não. Mas editores que usam IA vão substituir os que não usam. IA automatiza tarefas repetitivas (legendas, corte de silêncio, cleanup de áudio), mas não substitui decisão criativa (qual corte reforça a história, qual mood a música cria, qual payoff funciona). Use IA para acelerar o mecânico. Use seu cérebro para o criativo. Premium é o criativo."),
    h2("12. Como sair do platô de edição?"),
    body("Todo editor atinge platô. Para sair: (1) analise vídeos de editores melhores que você — pause e pergunte &ldquo;por que esse corte?&rdquo;; (2) aprenda 1 técnica nova por semana (J-cut, ducking, color grading, motion); (3) refaça vídeos antigos com técnicas novas — compare; (4) peça feedback honesto de editores avançados; (5) ensine o que aprende — ensinar força domínio. Platô se quebra com prática deliberada, não com repetição."),
    callout(
        "Regra final do FAQ",
        "Toda dúvida que você tem foi dúvida de alguém antes de você. Não tenha vergonha de perguntar, pesquisar, errar. Premium não é não ter dúvidas — é ter menos dúvidas a cada mês.",
    ),
    spacer(0.5),
    HRule(2*28.35, COLORS["primary"], 1),
    spacer(0.4),
    Paragraph("Fim do Manual da Edição Premium. © Clodoaldo Silva. Todos os direitos reservados.", get_styles()["Footer_Caption"]),
]


# ============================================================
# BUILD DO E-BOOK
# ============================================================
def build():
    story = []
    
    # ============ CAPA ============
    story += cover_page(
        title="Manual da Edição Premium",
        subtitle="Eleve a Qualidade das Suas Edições e Venda Mais com Vídeo",
        author="Clodoaldo Silva",
        site="clodoaldo.vercel.app",
        eyebrow="E-BOOK PREMIUM",
    )
    
    # ============ SUMÁRIO ============
    toc_items = [
        {"title": "Introdução — Por que edição premium importa", "page": "3", "level": 1},
        {"title": "Parte 1 — Fundamentos", "page": "5", "level": 1},
        {"title": "Cap. 1 — Fundamentos da Edição Premium", "page": "5", "level": 2},
        {"title": "Cap. 2 — Cortes que Prendem Atenção", "page": "9", "level": 2},
        {"title": "Cap. 3 — Transições Profissionais", "page": "13", "level": 2},
        {"title": "Parte 2 — Camadas Premium", "page": "17", "level": 1},
        {"title": "Cap. 4 — Color Grading para Iniciantes", "page": "17", "level": 2},
        {"title": "Cap. 5 — Sound Design", "page": "21", "level": 2},
        {"title": "Cap. 6 — Texto e Motion Graphics", "page": "25", "level": 2},
        {"title": "Parte 3 — Estratégia e Plataformas", "page": "29", "level": 1},
        {"title": "Cap. 7 — Estrutura de Retenção em Vídeo", "page": "29", "level": 2},
        {"title": "Cap. 8 — Reels vs YouTube vs Stories", "page": "33", "level": 2},
        {"title": "Cap. 9 — Workflow de Produção", "page": "37", "level": 2},
        {"title": "Cap. 10 — Ferramentas: CapCut, Premiere, DaVinci", "page": "41", "level": 2},
        {"title": "Parte 4 — Domínio e Monetização", "page": "45", "level": 1},
        {"title": "Cap. 11 — Erros Comuns que Destroem Retenção", "page": "45", "level": 2},
        {"title": "Cap. 12 — Edição com IA", "page": "49", "level": 2},
        {"title": "Cap. 13 — Monetização através de Edição", "page": "53", "level": 2},
        {"title": "Cap. 14 — Conclusão + Checklist", "page": "57", "level": 2},
        {"title": "Apêndices", "page": "61", "level": 1},
        {"title": "A — Glossário de Termos de Edição", "page": "61", "level": 2},
        {"title": "B — Templates de Workflow", "page": "64", "level": 2},
        {"title": "C — Recursos e Bibliografia", "page": "67", "level": 2},
        {"title": "D — FAQ — Perguntas Frequentes", "page": "70", "level": 2},
    ]
    story += toc_page(toc_items)
    
    # ============ INTRODUÇÃO ============
    story += intro_header(
        "Por que edição premium importa",
        "O que separa criadores que viralizam dos que somem no algoritmo",
    )
    story.append(body_lead("Você gravou o vídeo perfeito. Roteiro impecável, iluminação cinema, áudio limpo. Publicou. E recebeu 47 views. O que aconteceu?"))
    story.append(body("Provável: edição amadora. Você pode ter o melhor conteúdo do mundo — se a edição não prender atenção nos primeiros 3 segundos, nada mais importa. Edição não é detalhe. É fundação."))
    story.append(h2("Edição premium não é estética — é estratégia"))
    story.append(body("Quando pensamos em edição premium, imaginamos efeitos caros, transições 3D, motion graphics complexos. Falso. Edição premium é sobre <b>retenção</b>. Todo corte, transição, efeito existe para uma coisa: fazer o espectador assistir ao próximo segundo. E o próximo. E o próximo. Até o final."))
    story.append(body("Criadores com mesma qualidade de conteúdo mas edição diferente têm resultados radicalmente diferentes. Edição amadora: 30% de retenção aos 5s. Edição premium: 70%+ de retenção aos 5s. Essa diferença <b>multiplica alcance por 10</b> — porque o algoritmo do Instagram (e de qualquer plataforma) prioriza conteúdo com alta retenção."))
    story.append(h2("O que você vai aprender neste manual"))
    story.append(body("Este e-book é o manual completo de edição premium para criadores de conteúdo. Vai te levar dos fundamentos (ritmo, pacing, timing) até monetização. Não é teoria. É arsenal. Cada capítulo tem exercício prático. Cada técnica tem exemplo. Cada erro tem correção."))
    story.append(body("Se você aplicar 1 capítulo por dia, em 2 semanas sua edição terá evoluído mais do que em 1 ano de tentativa e erro. Vamos começar."))
    
    # ============ CAPÍTULOS ============
    CHAPTERS = [
        ("1", "Fundamentos da Edição Premium", "Ritmo, pacing, timing — os 3 pilares que separam amador de premium", CHAPTER_1),
        ("2", "Cortes que Prendem Atenção", "Domine os 5 cortes que 90% dos vídeos premium usam", CHAPTER_2),
        ("3", "Transições Profissionais", "J-cut, L-cut, match cut, jump cut — quando e como usar", CHAPTER_3),
        ("4", "Color Grading para Iniciantes", "A alma visual do vídeo — do raw ao cinematográfico", CHAPTER_4),
        ("5", "Sound Design", "Som é 50% do vídeo — mas recebe 5% da atenção", CHAPTER_5),
        ("6", "Texto e Motion Graphics", "Menos é mais — tipografia e animação intencional", CHAPTER_6),
        ("7", "Estrutura de Retenção em Vídeo", "Anatomia da curva de retenção e microhooks", CHAPTER_7),
        ("8", "Edição para Reels vs YouTube vs Stories", "Mesmo conteúdo, plataformas diferentes, edições diferentes", CHAPTER_8),
        ("9", "Workflow de Produção", "Do raw ao publicado — o processo premium de 7 etapas", CHAPTER_9),
        ("10", "Ferramentas: CapCut, Premiere, DaVinci Resolve", "Qual escolher para cada momento da carreira", CHAPTER_10),
        ("11", "Erros Comuns que Destroem Retenção", "Os 7 erros que 90% dos vídeos cometem — e como corrigi-los", CHAPTER_11),
        ("12", "Edição com IA", "Stack de IA para editar mais rápido sem perder o toque humano", CHAPTER_12),
        ("13", "Monetização através de Edição", "Como transformar habilidade técnica em receita", CHAPTER_13),
        ("14", "Conclusão + Checklist", "Plano de 30 dias e checklist definitivo de edição premium", CHAPTER_14),
    ]
    
    for num, title, subtitle, content in CHAPTERS:
        story += chapter_header(num, title, subtitle)
        story.extend(content)
    
    # ============ APÊNDICES ============
    story += chapter_header("A", "Glossário de Termos de Edição", "Vocabulário essencial que todo editor premium domina")
    story.extend(APPENDIX_A)
    
    story += chapter_header("B", "Templates de Workflow", "Estruturas prontas para acelerar sua edição nos 5 formatos mais comuns")
    story.extend(APPENDIX_B)
    
    story += chapter_header("C", "Recursos e Bibliografia", "Continue sua jornada — ferramentas, cursos, livros e canais")
    story.extend(APPENDIX_C)
    
    story += chapter_header("D", "FAQ — Perguntas Frequentes", "As 12 dúvidas mais comuns de editores em formação")
    story.extend(APPENDIX_D)
    
    return story


if __name__ == "__main__":
    print("Gerando manual-edicao-premium.pdf...")
    story = build()
    build_pdf(OUTPUT, story, title="Manual da Edição Premium — Clodoaldo Silva")
    
    import os
    size = os.path.getsize(OUTPUT)
    print(f"✅ Gerado: {OUTPUT}")
    print(f"   Tamanho: {size:,} bytes ({size/1024:.1f} KB)")
    
    import pypdf
    reader = pypdf.PdfReader(OUTPUT)
    print(f"   Páginas: {len(reader.pages)}")
