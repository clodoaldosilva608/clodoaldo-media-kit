"""
Gera o e-book: 30 Ganchos para Reels (65+ páginas)
Estrutura: capa + sumário + introdução (3 págs) + 30 ganchos (2 págs cada) + conclusão (2 págs)
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
    hook_categories_grid, hook_retention_curve, hook_performance_chart,
)

OUTPUT = "/home/z/my-project/scripts/ebook-generator/output/30-ganchos-reels.pdf"


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


def conclusion_header(title, subtitle):
    styles = get_styles()
    return [
        page_break(),
        spacer(2),
        Paragraph("CONCLUSÃO", styles["Chapter_Number"]),
        HRule(1.5 * 28.35, COLORS["primary"], 1),
        spacer(0.6),
        Paragraph(title, styles["Chapter_Title"]),
        Paragraph(subtitle, styles["Chapter_Subtitle"]),
        spacer(0.4),
    ]


# ============================================================
# DADOS DOS 30 GANCHOS
# ============================================================
GANCHOS = [
    {
        "num": "01",
        "nome": "Pergunta provocativa",
        "subtitle": "Faça o espectador responder mentalmente antes de rolar",
        "psychology": "O cérebro humano é uma máquina de responder perguntas. Quando ouve uma pergunta, ele automaticamente formula uma resposta — mesmo que não queira. Isso é chamado de <b>reflexo cognitivo</b>. A pergunta certa não apenas prende atenção nos 3 primeiros segundos: ela cria uma lacuna que o espectador precisa fechar assistindo até o final. O segredo está em perguntar algo que o espectador <i>não saiba</i> responder de imediato, mas que ele <i>queira</i> saber a resposta.",
        "exemplos": [
            "<b>Exemplo:</b> &ldquo;Você sabia que está perdendo 70% da sua audiência nos primeiros 3 segundos — e não faz ideia do porquê?&rdquo;",
            "<b>Exemplo:</b> &ldquo;Por que alguns Reels viralizam com 200 contas e outros morrem com 50 mil seguidores? A resposta vai contra tudo que você ouviu.&rdquo;",
            "<b>Exemplo:</b> &ldquo;E se eu te dissesse que o erro que está matando seu alcance é exatamente o que você mais treina?&rdquo;",
        ],
        "quando_usar": "Quando você tem uma resposta inesperada para entregar. Funciona melhor em conteúdo educativo, mitos e demonstrações.",
        "quando_nao": "Nunca faça pergunta retórica com resposta óbvia (&ldquo;Quer ganhar mais dinheiro?&rdquo;). Quebra a confiança e soa como anúncio barato.",
        "exercicio": "Escreva 5 perguntas provocativas para o tema do seu próximo vídeo. Teste cada uma com um amigo em 5 segundos: se ele não ficar curioso, descarte.",
    },
    {
        "num": "02",
        "nome": "Stat chocante",
        "subtitle": "Um número inesperado quebra o padrão mental e abre atenção",
        "psychology": "O cérebro humano é programado para notar anomalias. Números absurdos ou contraintuitivos ativam a <b>amígdala</b> — região responsável por detecção de ameaças e novidade. Quando você abre com uma estatística que contraria o senso comum, o espectador para para processar. A chave é usar números <b>específicos</b> (47% vira melhor que &ldquo;quase metade&rdquo;) e números que tenham <b>contraste embutido</b> com a expectativa.",
        "exemplos": [
            "<b>Exemplo:</b> &ldquo;90% dos criadores perdem mais da metade da audiência antes do segundo 3. Os 10% que retêm usam uma técnica que vou te mostrar agora.&rdquo;",
            "<b>Exemplo:</b> &ldquo;R$ 0,47. Foi o quanto eu ganhei no meu primeiro mês como criador. Hoje, 18 meses depois, é o que eu ganho por minuto assistido.&rdquo;",
            "<b>Exemplo:</b> &ldquo;1 em cada 3 Reels com mais de 1 milhão de views tem algo em comum. Não é o que você pensa. Vem comigo.&rdquo;",
        ],
        "quando_usar": "Quando você tem um número real (próprio ou de pesquisa) que gera tensão cognitiva. Ideal para vídeos de autoridade e demonstrações de transformação.",
        "quando_nao": "Nunca invente estatísticas. Se for pego em número falso, perde autoridade para sempre. Sempre cite fonte quando possível (&ldquo;segundo estudo da Stanford&rdquo;).",
        "exercicio": "Liste 5 números da sua jornada ou do seu nicho que sejam surpreendentes. Para cada, escreva uma frase de abertura usando o número nos primeiros 5 segundos.",
    },
    {
        "num": "03",
        "nome": "Storytime pessoal",
        "subtitle": "O cérebro foi feito para ouvir histórias — use a sua",
        "psychology": "Histórias ativam múltiplas áreas do cérebro simultaneamente (córtex sensorial, motor, límbico), criando âncoras de memória que dados isolados não conseguem. Quando você abre um Reel com &ldquo;storytime&rdquo;, o cérebro do espectador entra em <b>modo narrativo</b> — estado de atenção relaxada e receptiva. A vulnerabilidade pessoal ativa neurônios-espelho e libera oxitocina, criando conexão imediata. O segredo é começar <i>no meio da ação</i>, não com background.",
        "exemplos": [
            "<b>Exemplo:</b> &ldquo;Storytime: como eu perdi R$ 14 mil em 6 horas tentando escalar uma campanha de ads — e o que aprendi com isso.&rdquo;",
            "<b>Exemplo:</b> &ldquo;Eu estava no banheiro do escritório, com o telefone na mão, quando descobri que tinha sido demitido pelo LinkedIn. Foi aí que tudo mudou.&rdquo;",
            "<b>Exemplo:</b> &ldquo;Em 2021, eu dormi 4 horas por noite durante 90 dias para lançar meu produto. Funcionou. E quase me matou. Vem comigo.&rdquo;",
        ],
        "quando_usar": "Sempre que tiver uma história real com transformação. Especialmente forte para construir conexão, autoridade e em momentos de pivô de marca.",
        "quando_nao": "Evite histórias longas demais para Reels curtos. Se não couber em 30 segundos, grave um YouTube. Não use storytime fake — o público detecta e pune.",
        "exercicio": "Escolha uma história sua com começo, meio e fim. Escreva em 3 frases: (1) o gatilho, (2) o conflito, (3) a virada. Use a frase 1 como abertura do próximo Reel.",
    },
    {
        "num": "04",
        "nome": "Contradição",
        "subtitle": "Diga algo que parece errado — e explique por que está certo",
        "psychology": "O cérebro humano tem um sistema de <b>detecção de inconsistências</b> extremamente sensível. Quando você ouve algo que contradiz sua crença, há um micro-disparo de cortisol — sinal de alerta. Esse disparo prende atenção porque o cérebro precisa resolver a contradição. Use para desafiar senso comum. Mas cuidado: a contradição precisa ser <b>verdadeira</b> após explicação. Contradição falsa vira clickbait e destrói confiança.",
        "exemplos": [
            "<b>Exemplo:</b> &ldquo;Postar todo dia está destruindo seu alcance. Postar 2x por semana vai te dar mais views. Te explico em 30 segundos.&rdquo;",
            "<b>Exemplo:</b> &ldquo;Quanto mais você tenta vender, menos você vende. Pare de fazer isso — e veja sua conversão triplicar.&rdquo;",
            "<b>Exemplo:</b> &ldquo;O melhor horário para postar Reels não é 19h. É 4h da manhã. E a razão vai mudar sua estratégia.&rdquo;",
        ],
        "quando_usar": "Quando você tem uma verdade contraintuitiva com lastro. Excelente para conteúdo de autoridade, mitos e reposicionamento.",
        "quando_nao": "Se a contradição for só estética (&ldquo;trabalhe menos, ganhe mais&rdquo;) sem explicação real, vira clichê. O público cansou de falsas polêmicas.",
        "exercicio": "Pense em uma crença comum do seu nicho que você discorda. Escreva a abertura contrariando-a — e tenha a explicação real pronta para os 30 segundos seguintes.",
    },
    {
        "num": "05",
        "nome": "Lista numerada",
        "subtitle": "O cérebro adora estrutura — prometa uma lista e entregue",
        "psychology": "Listas ativam a <b>cortex parietal</b>, região que processa sequências e categorias. Quando o cérebro ouve &ldquo;5 razões&rdquo;, ele automaticamente começa a prever os itens — e fica até o final para confirmar se a previsão está certa. Esse mecanismo de previsão e validação é viciante. O segredo: use números ímpares (3, 5, 7) — research mostra que têm maior taxa de cliques. E nunca entregue menos do que prometeu.",
        "exemplos": [
            "<b>Exemplo:</b> &ldquo;3 erros que estão matando seus Reels — e você provavelmente comete os 3. Vem comigo.&rdquo;",
            "<b>Exemplo:</b> &ldquo;5 ferramentas gratuitas que substituem CapCut Pro. A número 4 vai te surpreender.&rdquo;",
            "<b>Exemplo:</b> &ldquo;7 gatilhos mentais que todo criador deveria usar. Anota aí, porque o 7 mudou meu negócio.&rdquo;",
        ],
        "quando_usar": "Quando o conteúdo é naturalmente enumerável (erros, dicas, ferramentas, passos). Funciona bem em qualquer nicho e formato.",
        "quando_nao": "Não force lista onde não tem. &ldquo;3 razões para amar café&rdquo; soa artificial. Use lista quando os itens realmente merecem ser separados.",
        "exercicio": "Pegue um tema que você domina e crie 3 versões: 3 itens, 5 itens, 7 itens. Veja qual gera mais tensão cognitiva e use no próximo vídeo.",
    },
    {
        "num": "06",
        "nome": "“Ninguém te conta”",
        "subtitle": "Crie a sensação de acesso a informação secreta",
        "psychology": "O <b>viés de escassez de informação</b> é um dos mais fortes gatilhos humanos. Quando algo parece secreto ou proibido, o cérebro atribui automaticamente mais valor a essa informação. A frase &ldquo;ninguém te conta&rdquo; ativa esse viés — sugere que existe uma conspiração do silêncio (mesmo que inconsciente) e que você está prestes a revelar. Use com cuidado: precisa realmente entregar algo que a maioria não sabe. Caso contrário, vira clichê oco.",
        "exemplos": [
            "<b>Exemplo:</b> &ldquo;Ninguém te conta que o algoritmo do Instagram não premia postagem diária — premia uma métrica que quase ninguém olha.&rdquo;",
            "<b>Exemplo:</b> &ldquo;Ninguém te conta que os criadores grandes não escrevem os próprios roteiros. Tem um método por trás.&rdquo;",
            "<b>Exemplo:</b> &ldquo;Ninguém te conta que vender barato no começo é a pior estratégia. Vem entender por quê.&rdquo;",
        ],
        "quando_usar": "Quando você tem uma informação realmente pouco difundida no nicho. Excelente para conteúdo &ldquo;bastidores&rdquo; e quebra de paradigmas.",
        "quando_nao": "Se a &ldquo;revelação&rdquo; for algo que qualquer Google search traz, você perde credibilidade. Não use para conteúdo básico disfarçado de segredo.",
        "exercicio": "Liste 5 verdades do seu nicho que poucas pessoas falam abertamente. Escolha a mais impactante e construa um Reel em torno dela.",
    },
    {
        "num": "07",
        "nome": "Antes e depois",
        "subtitle": "Mostre a transformação — e o cérebro fica até o final",
        "psychology": "O cérebro humano é obcecado por <b>transformações</b>. Estudos de neurociência mostram que ver um &ldquo;antes e depois&rdquo; ativa o circuito de recompensa: o espectador projeta a própria transformação e fica até o final para ver &ldquo;como&rdquo;. Quanto maior o contraste entre antes e depois, mais forte o gancho. Mas atenção: o &ldquo;depois&rdquo; precisa parecer alcançável. Se parecer inatingível, o cérebro desiste.",
        "exemplos": [
            "<b>Exemplo:</b> &ldquo;Há 8 meses eu tinha 47 seguidores e R$ 0 de receita. Hoje: 14 mil seguidores e R$ 11 mil/mês. Vou te mostrar o que mudou.&rdquo;",
            "<b>Exemplo:</b> &ldquo;Isso aqui era meu quarto em 2022 (foto). Aqui é hoje (foto). A diferença não foi sorte — foi um método.&rdquo;",
            "<b>Exemplo:</b> &ldquo;Antes: 12h/dia trabalhando, R$ 2 mil/mês. Depois: 4h/dia, R$ 9 mil/mês. A virada foi uma decisão. Vem comigo.&rdquo;",
        ],
        "quando_usar": "Sempre que tiver uma transformação visível e mensurável. Funciona para qualquer nicho: fitness, finanças, estética, negócios, skill-building.",
        "quando_nao": "Cuidado com antes-e-depois irreais ou manipulados. Se o público desconfiar de edição ou timing, perde credibilidade. Documente de verdade.",
        "exercicio": "Documente seu ponto A atual (foto, número, métrica). Estabeleça um ponto B com prazo. Use o &ldquo;antes&rdquo; no próximo Reel — o &ldquo;depois&rdquo; vem depois.",
    },
    {
        "num": "08",
        "nome": "Erro caro",
        "subtitle": "Diga quanto um erro te custou — e o espectador fica",
        "psychology": "O <b>viés de aversão à perda</b> (Kahneman & Tversky) demonstra que humanos sentem o dobro de dor ao perder algo do que prazer ao ganhar o equivalente. Quando você abre contando um erro com custo real (em dinheiro, tempo, oportunidade), o cérebro do espectador aciona esse viés — ele quer evitar a mesma perda. Esse gancho é poderoso porque combina vulnerabilidade (conexão) com utilidade prática (atenção sustentada).",
        "exemplos": [
            "<b>Exemplo:</b> &ldquo;Esse erro me custou R$ 23 mil em 2023. Se você faz isso, pare agora. Te mostro como corrigir.&rdquo;",
            "<b>Exemplo:</b> &ldquo;Eu perdi 18 meses de crescimento por causa de uma única decisão. Não cometa o mesmo erro.&rdquo;",
            "<b>Exemplo:</b> &ldquo;R$ 4.700 em ads queimados em 7 dias. A lição que aprendi vale mais que o prejuízo.&rdquo;",
        ],
        "quando_usar": "Quando você tem um erro real com custo mensurável. Excelente para construir autoridade através de vulnerabilidade — e ensinar evitando o erro do outro.",
        "quando_nao": "Não invente erros para parecer vulnerável. O público detecta. E não use se a &ldquo;solução&rdquo; for só comprar seu curso — vira comercial, não conteúdo.",
        "exercicio": "Liste 3 erros caros que você cometeu (em dinheiro, tempo ou relação). Escolha o mais didático e construa um Reel com a lição aprendida.",
    },
    {
        "num": "09",
        "nome": "Mito desconstruído",
        "subtitle": "Ataque uma crença popular e proponha a verdade real",
        "psychology": "O cérebro humano defende crenças como defende território. Quando você ataca uma crença, gera <b>dissonância cognitiva</b> — estado desconfortável que o espectador precisa resolver. Se sua argumentação for sólida, a crença se reorganiza e o espectador sente alívio (e gratidão). Se for fraca, ele rejeita você. Use mitos difundidos que você pode realmente desconstruir com evidência.",
        "exemplos": [
            "<b>Exemplo:</b> &ldquo;Mito: postar todo dia aumenta alcance. Verdade: o Instagram pune conta que post todo dia se a retenção for baixa. Te mostro a métrica que importa.&rdquo;",
            "<b>Exemplo:</b> &ldquo;&lsquo;Preciso de equipamento caro para viralizar.&rsquo; Falso. Meu Reel de 800k views foi gravado com celular de R$ 1.500. Vem entender o que realmente importa.&rdquo;",
            "<b>Exemplo:</b> &ldquo;Mito: storytelling é para marcas grandes. Verdade: storytelling é o que transforma marcas pequenas em grandes. E qualquer um pode aplicar.&rdquo;",
        ],
        "quando_usar": "Quando você identifica um mito forte no nicho e tem argumentos sólidos para desconstruir. Excelente para construir autoridade.",
        "quando_nao": "Não ataque mitos que você não consegue refutar com evidência. E não ataque crenças emocionalmente carregadas (religião, política) — você perde mais do que ganha.",
        "exercicio": "Liste 5 mitos do seu nicho. Para cada, escreva a &ldquo;verdade&rdquo; com uma evidência. Escolha o mito mais difundido e grave o Reel.",
    },
    {
        "num": "10",
        "nome": "Promessa de tempo",
        "subtitle": "Comprometa-se com um tempo curto e específico",
        "psychology": "O <b>viés de aversão ao compromisso</b> faz o espectador relutar em iniciar vídeos longos. Quando você promete &ldquo;em 30 segundos&rdquo; ou &ldquo;no próximo minuto&rdquo;, reduz a fricção psicológica de iniciar. O cérebro calcula: &ldquo;posso aguentar 30 segundos&rdquo;. Mas uma vez iniciado, o viés de continuidade faz com que fique além. Cuidado: a promessa precisa ser cumprida. Quebrar a promessa de tempo quebra a confiança para sempre.",
        "exemplos": [
            "<b>Exemplo:</b> &ldquo;Em 45 segundos eu vou te ensinar a editar um Reel que retém 80%. Cronômetro ligado.&rdquo;",
            "<b>Exemplo:</b> &ldquo;30 segundos para entender por que seu Reel morre no segundo 4. Anota aí.&rdquo;",
            "<b>Exemplo:</b> &ldquo;Se você não tem 60 segundos para mudar seu negócio, pula esse vídeo. Mas se tem, vem comigo.&rdquo;",
        ],
        "quando_usar": "Quando o conteúdo é realmente curto e direto. Excelente para tutoriais rápidos, dicas e demonstrações enxutas.",
        "quando_nao": "Não prometa 30s e entregue 3 minutos. O espectador sente engano e pune com scroll. Promessa de tempo é contrato — cumpra.",
        "exercicio": "Escolha um tutorial que você normalmente faria em 2 minutos. Comprima para 45 segundos reais. Use a promessa de tempo como gancho. Meça retenção.",
    },
    {
        "num": "11",
        "nome": "Citação de autoridade",
        "subtitle": "Empreste credibilidade de alguém que o público respeita",
        "psychology": "O <b>viés de autoridade</b> (Cialdini) demonstra que humanos atribuem mais peso a informações vindas de figuras percebidas como autoridades. Quando você abre um Reel citando alguém que o espectador respeita (especialista, autor, figura pública), &ldquo;empresta&rdquo; a autoridade dessa pessoa para a sua mensagem. Funciona melhor quando a citação é <b>específica</b> (não &ldquo;segundo pesquisadores&rdquo;) e <b>surpreendente</b> (não óbvia).",
        "exemplos": [
            "<b>Exemplo:</b> &ldquo;Seth Godin disse: &lsquo;As pessoas não compram produtos, compram histórias.&rsquo; A maioria dos criadores ignora isso. Veja o que acontece quando você aplica.&rdquo;",
            "<b>Exemplo:</b> &ldquo;Naval Ravikant escreveu: &lsquo;Não alugue seu tempo, construa ativos.&rsquo; Foi o que mudou meu negócio em 2022. Vem comigo.&rdquo;",
            "<b>Exemplo:</b> &ldquo;Simon Sinek disse que as pessoas não compram o que você faz, compram o porquê. Apliquei isso em 3 Reels e dobrei minha conversão.&rdquo;",
        ],
        "quando_usar": "Quando você tem uma citação real e relevante de uma figura reconhecida pelo seu público. Excelente para conteúdo filosófico e estratégico.",
        "quando_nao": "Não invente citações. Não cite alguém que seu público não conhece. E não use citações batidas (&ldquo;se você pode sonhar, pode realizar&rdquo;) — perde o efeito.",
        "exercicio": "Liste 5 figuras que seu público admira. Para cada, encontre uma citação que conecte com seu conteúdo. Escolha a mais impactante e construa o Reel.",
    },
    {
        "num": "12",
        "nome": "Cena dramática",
        "subtitle": "Comece no meio da ação — sem contexto, sem introdução",
        "psychology": "O cérebro humano é viciado em <b>padrões narrativos</b>. Quando um vídeo começa no meio da ação (chamado de <i>in media res</i>), o cérebro precisa reconstruir o contexto mentalmente — e isso prende atenção. A ausência de introdução cria uma lacuna que o espectador quer fechar. Funciona melhor com cenas visuais fortes e sons marcantes. Quanto menos você explica, mais o cérebro do espectador se envolve.",
        "exemplos": [
            "<b>Exemplo:</b> (cena de você correndo com celular na mão) &ldquo;Eu tinha 4 minutos para salvar o lançamento. Eu fiz. Te conto o que aconteceu.&rdquo;",
            "<b>Exemplo:</b> (cena de você olhando para notebook com cara de choque) &ldquo;Foi aí que eu entendi que tudo que eu sabia sobre Instagram estava errado.&rdquo;",
            "<b>Exemplo:</b> (cena de você desligando o telefone com expressão séria) &ldquo;Não era para ter acontecido. Mas aconteceu. E mudou tudo.&rdquo;",
        ],
        "quando_usar": "Quando você tem uma história visual com momento de tensão clara. Excelente para storytimes, bastidores e viradas de carreira.",
        "quando_nao": "Não use cena dramática sem payoff. Se o &ldquo;clímax&rdquo; for fraco, o espectador se sente manipulado. A cena precisa ter uma revelação de verdade.",
        "exercicio": "Pense no momento mais tenso de uma história sua. Filme esse momento (mesmo que recriado) como abertura. Revele a história nos 30s seguintes.",
    },
    {
        "num": "13",
        "nome": "“Eu era como você”",
        "subtitle": "Crie identificação imediata com o espectador",
        "psychology": "O <b>viés de similaridade</b> mostra que humanos confiam mais em quem percebem como parecidos consigo mesmos. Quando você abre dizendo &ldquo;eu era como você&rdquo;, ativa dois mecanismos: identificação (&ldquo;ele me entende&rdquo;) e esperança (&ldquo;se ele saiu dessa, eu também posso&rdquo;). Esse gancho cria conexão instantânea porque promete uma ponte entre o estado atual do espectador e o estado desejado. A chave é ser <b>específico</b> sobre como era você.",
        "exemplos": [
            "<b>Exemplo:</b> &ldquo;Há 2 anos eu trabalhava 12h/dia como CLT, odiava segunda-feira e achava que era normal. Hoje faço R$ 11 mil/mês no digital. Vem comigo.&rdquo;",
            "<b>Exemplo:</b> &ldquo;Eu era exatamente como você: postava todo dia, recebia 30 views e achava que o algoritmo me odiava. Não era o algoritmo. Era isso aqui.&rdquo;",
            "<b>Exemplo:</b> &ldquo;Eu conhecia alguém que passava horas escrevendo roteiros que ninguém via. Era eu. Até descobrir uma coisa que mudou tudo.&rdquo;",
        ],
        "quando_usar": "Quando você tem uma transformação clara do &ldquo;estado do espectador&rdquo; para o &ldquo;seu estado atual&rdquo;. Excelente para nichos de transformação (finanças, fitness, carreira).",
        "quando_nao": "Não use se a transformação não for real ou se o &ldquo;antes&rdquo; não tiver similaridade com seu público. Vibração falsa é detectada rapidamente.",
        "exercicio": "Escreva em 1 frase como você era 2-3 anos atrás — usando palavras que descrevem seu público atual. Use essa frase como abertura do próximo Reel.",
    },
    {
        "num": "14",
        "nome": "Revelação progressiva",
        "subtitle": "Prometa uma revelação final — e entregue aos poucos",
        "psychology": "O <b>efeito Zeigarnik</b> demonstra que o cérebro lembra melhor de tarefas incompletas que completas. Quando você promete uma revelação no final do vídeo, cria uma &ldquo;tarefa mental incompleta&rdquo; — o cérebro fica até o final para fechar a lacuna. O segredo é entregar <b>pequenas recompensas</b> ao longo do caminho (não segure tudo até o fim), mantendo a tensão pela revelação principal. Sem pequenos payoffs, o espectador desiste antes.",
        "exemplos": [
            "<b>Exemplo:</b> &ldquo;Existe uma palavra que faz seu Reel reter 3x mais. Vou te mostrar nos próximos 30s — mas antes, você precisa entender 3 coisas.&rdquo;",
            "<b>Exemplo:</b> &ldquo;Descobri um padrão em 50 Reels virais. Tem 3 elementos em comum. Vou revelar um por um — o terceiro é o mais chocante.&rdquo;",
            "<b>Exemplo:</b> &ldquo;Tem um erro que 80% dos criadores cometem nos primeiros 3s. Vou te mostrar qual é — mas antes, preciso te explicar uma coisa.&rdquo;",
        ],
        "quando_usar": "Quando o conteúdo tem uma revelação forte no final. Funciona bem para análises, descobertas e &ldquo;segredos&rdquo;.",
        "quando_nao": "Não segure a revelação por tempo demais. Se o espectador sentir que está sendo enrolado, pula. Revele algo a cada 5-7 segundos para manter engajamento.",
        "exercicio": "Escolha uma revelação que você quer fazer. Estruture o vídeo em 3 micro-revelações + 1 final. Use a promessa da revelação como gancho.",
    },
    {
        "num": "15",
        "nome": "Desafio ao espectador",
        "subtitle": "Provocação direta ativa defesa — e curiosidade",
        "psychology": "Quando você desafia diretamente o espectador (&ldquo;aposto que você não consegue&rdquo;), ativa o <b>sistema de defesa do ego</b>. O cérebro precisa provar que está certo — e fica até o final para argumentar (ou concordar). Esse gancho é arriscado: pode gerar polêmica, mas também rejeição. Use quando você tem um argumento sólido que converte a provocação inicial em concordância final.",
        "exemplos": [
            "<b>Exemplo:</b> &ldquo;Aposto que você comete esse erro nos seus Reels. Se não comete, me chama nos comentários. Mas antes, veja se eu tô certo.&rdquo;",
            "<b>Exemplo:</b> &ldquo;Você acha que sabe editar vídeo? Aposto que está cometendo 3 dos 5 erros que vou mostrar. Vamos verificar?&rdquo;",
            "<b>Exemplo:</b> &ldquo;Desafio: assista esse vídeo até o final sem mudar de ideia. Eu duvido. Vem comigo.&rdquo;",
        ],
        "quando_usar": "Quando você tem conteúdo controverso mas defensável. Excelente para gerar comentários (engajamento) e demonstrar autoridade.",
        "quando_nao": "Não use desafio agressivo (&ldquo;seu idiota&rdquo;) — gera rejeição. Desafio intelectual funciona; desafio pessoal não. Mantenha o tom respeitoso.",
        "exercicio": "Escreva um desafio que você pode fazer a seu público sobre o tema do próximo vídeo. Mantenha o tom provocativo mas respeitoso. Teste retenção.",
    },
    {
        "num": "16",
        "nome": "Comparação visual",
        "subtitle": "Justaposição de imagens cria tensão instantânea",
        "psychology": "O cérebro humano processa imagens em 13 milissegundos — 60x mais rápido que texto. Quando você abre um Reel com <b>comparação visual</b> (antes/depois, bom/ruim, seu/concorrente), o impacto é imediato. A justaposição cria <b>dissonância visual</b> que prende atenção antes mesmo de uma palavra ser dita. Funciona melhor quando as duas imagens têm contexto claro e diferença dramática.",
        "exemplos": [
            "<b>Exemplo:</b> (duas telas lado a lado) &ldquo;Esse Reel fez 14k views. Esse fez 800k. Diferença? Uma única coisa. Te mostro.&rdquo;",
            "<b>Exemplo:</b> (foto sua há 2 anos / foto atual) &ldquo;Mesma pessoa, 24 meses de diferença. O que mudou não foi sorte. Foi uma decisão.&rdquo;",
            "<b>Exemplo:</b> (vídeo mal editado / vídeo bem editado) &ldquo;Qual dos dois você assiste até o final? Pois é. A diferença é uma técnica de 30 segundos.&rdquo;",
        ],
        "quando_usar": "Quando você tem duas versões visuais com diferença clara. Excelente para tutoriais de edição, fitness, design e comparações de produto.",
        "quando_nao": "Não use comparação manipulada (edição que distorce a realidade). O público detecta e pune. Comparação precisa ser honesta para gerar confiança.",
        "exercicio": "Encontre 2 imagens suas (ou do seu trabalho) com diferença dramática. Justaponha-as como abertura do próximo vídeo. Conte a história da transformação.",
    },
    {
        "num": "17",
        "nome": "“Pare de fazer isso”",
        "subtitle": "Comando direto quebra o padrão de passividade",
        "psychology": "A maioria dos Reels começa com &ldquo;olha, dica&rdquo; ou &ldquo;vem comigo&rdquo;. Comandos diretos negativos (&ldquo;pare de fazer isso&rdquo;) quebram esse padrão e ativam o <b>sistema de alerta reticular</b> — a parte do cérebro que filtra estímulos importantes. O comando negativo também aciona leve ansiedade (&ldquo;estou fazendo isso?&rdquo;) que prende atenção. Use quando você tem algo que a maioria faz errado — e a correção é simples.",
        "exemplos": [
            "<b>Exemplo:</b> &ldquo;Pare de usar hook com &lsquo;olha só&rsquo;. Isso está matando seus Reels. Te mostro o que usar no lugar.&rdquo;",
            "<b>Exemplo:</b> &ldquo;Pare de postar todo dia se você quer crescer. Estratégia de volume sem qualidade é suicídio de conta.&rdquo;",
            "<b>Exemplo:</b> &ldquo;Pare de editar seus Reels assim (mostra tela). Esse é o erro que mais mata retenção. Vem corrigir.&rdquo;",
        ],
        "quando_usar": "Quando você identifica um padrão comum errado e tem a correção. Excelente para conteúdo de autoridade e quebra de hábitos ruins.",
        "quando_nao": "Não use comando negativo sem oferecer alternativa. &ldquo;Pare de fazer X&rdquo; sem mostrar o &ldquo;fazer Y&rdquo; frustra o espectador. Sempre acompanhe da solução.",
        "exercicio": "Liste 5 coisas que seu público faz (e você acha que está errado). Escolha a mais impactante e grave o Reel com comando direto e solução clara.",
    },
    {
        "num": "18",
        "nome": "Bastidor / Behind the scenes",
        "subtitle": "Mostre como é feito — o público adora o processo",
        "psychology": "O cérebro humano tem fascínio por <b>processos</b>. Ver como algo é feito ativa o circuito de curiosidade epistêmica — a necessidade de entender causa e efeito. Bastidores também humanizam: mostram que por trás do conteúdo polido existe trabalho, erro, decisões. Isso gera conexão (oxitocina) e mantém atenção. Funciona melhor quando o processo tem <b>momentos de tensão ou surpresa</b>, não só execução linear.",
        "exemplos": [
            "<b>Exemplo:</b> &ldquo;Esse Reel de 800k views demorou 6 horas para editar. Te mostro o processo completo em 60 segundos.&rdquo;",
            "<b>Exemplo:</b> &ldquo;Como é gravar um Reel viral: 47 tomadas, 3 refilmagens e um café derramado. Vem comigo.&rdquo;",
            "<b>Exemplo:</b> &ldquo;Bastidor: o que acontece antes de eu postar. Spoiler: 90% é planejamento, 10% é gravação.&rdquo;",
        ],
        "quando_usar": "Quando você tem um processo interessante (criativo, de produção, de decisão). Excelente para humanizar marca e mostrar autoridade real.",
        "quando_nao": "Não mostre bastidor que não agrega (rolar feed, tomar café). Bastidor precisa ter tensão, decisão ou aprendizado. Sem isso, vira diário chato.",
        "exercicio": "Documente o processo completo de criar seu próximo Reel (do roteiro à publicação). Edite em 60s. Mostre os momentos de decisão, não só execução.",
    },
    {
        "num": "19",
        "nome": "Polêmica controlada",
        "subtitle": "Tomada de posição clara atrai engajamento (e haters)",
        "psychology": "O <b>algoritmo do Instagram</b> (e qualquer plataforma) prioriza conteúdo que gera comentários. Tomar posição clara em debate polarizado é a forma mais rápida de gerar discussão. Mas polêmica tem custo: você vai perder seguidores que discordam. A questão é: <b>você quer muitos seguidores genéricos ou uma audiência engajada que concorda com sua visão?</b> Polêmica controlada não é ofender — é ter opinião clara.",
        "exemplos": [
            "<b>Exemplo:</b> &ldquo;IA não vai substituir criadores. Mas criadores que usam IA vão substituir os que não usam. E quem discordar, me chama nos comentários.&rdquo;",
            "<b>Exemplo:</b> &ldquo;Curso de R$ 5 mil para aprender a viralizar é golpe. Se a pessoa soubesse viralizar, não estaria vendendo curso.&rdquo;",
            "<b>Exemplo:</b> &ldquo;Storytelling é mais importante que qualidade de imagem. Posicionamento claro é mais valioso que câmera de R$ 10 mil.&rdquo;",
        ],
        "quando_usar": "Quando você tem uma posição clara em debate real do nicho. Excelente para gerar engajamento e atrair audiência alinhada com sua visão.",
        "quando_nao": "Não crie polêmica por polêmica. Não ataque pessoas. Não entre em debates emocionalmente carregados (religião, política partidária) sem propósito.",
        "exercicio": "Liste 3 opiniões fortes que você tem sobre seu nicho (que a maioria discorda). Escolha uma, estruture argumento sólido, grave o Reel.",
    },
    {
        "num": "20",
        "nome": "FAQ surpresa",
        "subtitle": "Responda pergunta comum com resposta inesperada",
        "psychology": "Perguntas frequentes (FAQs) têm vantagem: o público já tem a pergunta em mente. Mas se você responder com o óbvio, perde atenção. O truque é <b>subverter a expectativa de resposta</b>. Quando o cérebro espera resposta A e ouve B, há micro-surpresa que prende atenção. Use perguntas que seu público sempre faz — e tenha uma resposta contraintuitiva, mas verdadeira.",
        "exemplos": [
            "<b>Exemplo:</b> &ldquo;&lsquo;Qual o melhor horário para postar?&rsquo; A resposta real: depende de uma métrica que você nunca ouviu. Te mostro em 30s.&rdquo;",
            "<b>Exemplo:</b> &ldquo;&lsquo;Quantos Reels postar por semana?&rsquo; A maioria diz 5. Eu digo 2. E explico por que menos é mais.&rdquo;",
            "<b>Exemplo:</b> &ldquo;&lsquo;Preciso de equipamento caro?&rsquo; Não. Mas precisa de uma coisa que ninguém fala — e que custa R$ 0.&rdquo;",
        ],
        "quando_usar": "Quando você tem uma pergunta frequente com resposta inesperada. Excelente para conteúdo educativo e autoridade.",
        "quando_nao": "Não use FAQ se a resposta for a esperada. &ldquo;Qual o melhor horário? 19h.&rdquo; — boring. Sem surpresa, sem retenção.",
        "exercicio": "Liste 5 perguntas que mais recebe nos comentários. Para cada, pense em uma resposta contraintuitiva (mas verdadeira). Escolha a melhor e grave.",
    },
    {
        "num": "21",
        "nome": "Demo ao vivo",
        "subtitle": "Mostre, não fale — o poder da demonstração imediata",
        "psychology": "O cérebro humano aprende mais por <b>observação</b> do que por explicação. Estudos de neurônios-espelho mostram que ver alguém fazer algo ativa no observador as mesmas áreas motoras — como se ele mesmo estivesse fazendo. Demo ao vivo cria imersão imediata: o espectador &ldquo;faz&rdquo; junto. Use quando o conteúdo é procedural (tutorial, técnica, manipulação). Funciona melhor quando a demo tem <b>resultado visível no final</b>.",
        "exemplos": [
            "<b>Exemplo:</b> (cena de você editando vídeo em tempo real) &ldquo;Watch me transformar esse Reel medíocre em algo que retém 80% — em 60 segundos.&rdquo;",
            "<b>Exemplo:</b> (cena de você aplicando técnica em cliente) &ldquo;Ao vivo: como eu aplico storytelling em um Reel do zero. Cronômetro ligado.&rdquo;",
            "<b>Exemplo:</b> (cena de você escrevendo roteiro) &ldquo;Vou escrever um hook que retém 3x mais — ao vivo, em 30 segundos. Presta atenção.&rdquo;",
        ],
        "quando_usar": "Quando você tem uma habilidade procedural demonstrável. Excelente para tutoriais, técnicas e prova de autoridade.",
        "quando_nao": "Não use demo sem contexto. Se o espectador não entende o que você está fazendo, perde interesse. Diga o objetivo antes de iniciar a demo.",
        "exercicio": "Escolha uma técnica que você domina. Filme-se executando-a em tempo real (com cronômetro visível). Use a demo como abertura e explique depois.",
    },
    {
        "num": "22",
        "nome": "Transformação rápida",
        "subtitle": "Mostre mudança em segundos — o público fica hipnotizado",
        "psychology": "O <b>viés de completude</b> faz o cérebro querer ver o resultado final de qualquer processo iniciado. Quando você abre mostrando uma transformação rápida (antes → depois em 3 segundos), o cérebro quer entender &ldquo;como&rdquo;. Quanto mais dramática a transformação e mais rápida a apresentação, mais forte o gancho. Use quando você tem uma transformação visível e o método é o conteúdo do vídeo.",
        "exemplos": [
            "<b>Exemplo:</b> (antes → depois em 3s) &ldquo;Foi assim que saí de 47 seguidores para 14 mil em 8 meses. Te mostro o passo a passo.&rdquo;",
            "<b>Exemplo:</b> (corte de vídeo mal editado → bem editado) &ldquo;30 segundos de edição mudaram tudo. Vou te mostrar a técnica.&rdquo;",
            "<b>Exemplo:</b> (foto antiga → foto atual) &ldquo;18 meses. 23 kg. Zero academia. Te conto o método completo.&rdquo;",
        ],
        "quando_usar": "Quando você tem uma transformação visível e o método é replicável. Excelente para fitness, finanças, estética, design, edição.",
        "quando_nao": "Não use transformação manipulada (filtros, ângulos, iluminação diferente). O público detecta e pune. Honestidade > espetáculo.",
        "exercicio": "Documente uma transformação sua (foto, número, métrica). Apresente antes → depois em 3 segundos. Revele o método nos 30s seguintes.",
    },
    {
        "num": "23",
        "nome": "Número surpreendente",
        "subtitle": "Um número isolado e absurdo desperta curiosidade",
        "psychology": "Diferente do &ldquo;stat chocante&rdquo; (que tem contexto), o <b>número surpreendente</b> é apresentado isolado — sem explicação inicial. Isso cria máxima lacuna cognitiva: o cérebro não consegue processar o número sem contexto, então fica para descobrir. Use números pessoais (sua jornada), de mercado, ou de pesquisa. Quanto mais isolado e absurdo, mais forte o gancho.",
        "exemplos": [
            "<b>Exemplo:</b> &ldquo;R$ 47.300. Foi o que eu ganhei em 90 dias com um único Reel viral. Te conto como.&rdquo;",
            "<b>Exemplo:</b> &ldquo;312 rejeições. Foi o que precisei ouvir até minha primeira venda de R$ 1.000. A lição vale ouro.&rdquo;",
            "<b>Exemplo:</b> &ldquo;0. Foi o número de seguidores que eu tinha quando comecei. Hoje são 14 mil. Veja o que mudou.&rdquo;",
        ],
        "quando_usar": "Quando você tem um número real com história por trás. Excelente para conteúdo de transformação, bastidores e autoridade.",
        "quando_nao": "Não use número inflacionado ou falso. Se questionado, tenha prova (print, comprovante). Número mentiroso destrói marca.",
        "exercicio": "Liste 5 números da sua jornada (ganho, perda, tempo, rejeição). Escolha o mais impactante. Use como abertura isolada do próximo Reel.",
    },
    {
        "num": "24",
        "nome": "“Eu descobri”",
        "subtitle": "Posicione-se como descobridor de algo valioso",
        "psychology": "O <b>viés de novidade</b> faz o cérebro priorizar informações novas. Quando você abre com &ldquo;eu descobri&rdquo;, posiciona o conteúdo como novidade — algo que o espectador ainda não sabe. Isso ativa curiosidade epistêmica (necessidade de saber). A chave é que a descoberta pareça <b>acessível</b> (não inalcançável) e <b>aplicável</b> (não teórica). Caso contrário, vira orgulho vazio.",
        "exemplos": [
            "<b>Exemplo:</b> &ldquo;Descobri que existe uma palavra que, quando usada no primeiro segundo do Reel, aumenta retenção em 40%. Vou te mostrar qual é.&rdquo;",
            "<b>Exemplo:</b> &ldquo;Descobri, depois de analisar 200 Reels virais, um padrão que ninguém comentou. Vem comigo.&rdquo;",
            "<b>Exemplo:</b> &ldquo;Descobri que o erro que matava meus Reels não era o gancho. Era o segundo 4. Te explico.&rdquo;",
        ],
        "quando_usar": "Quando você tem uma descoberta real (própria ou de pesquisa). Excelente para conteúdo de análise, autoridade e quebra de paradigma.",
        "quando_nao": "Não use &ldquo;descobri&rdquo; para o óbvio. &ldquo;Descobri que é preciso postar todo dia&rdquo; — isso não é descoberta, é clichê.",
        "exercicio": "Liste 5 descobertas reais que você fez no último mês (sobre seu nicho, sobre seu processo, sobre sua audiência). Escolha a mais impactante e grave.",
    },
    {
        "num": "25",
        "nome": "Contraste de mundos",
        "subtitle": "Compare duas realidades para criar tensão narrativa",
        "psychology": "O cérebro humano entende o mundo por <b>comparação</b>. Não sabemos o que é &ldquo;claro&rdquo; sem &ldquo;escuro&rdquo;, &ldquo;rápido&rdquo; sem &ldquo;lento&rdquo;. Quando você abre contrastando dois mundos (rico/pobre, CLT/empreendedor, antes/depois), ativa esse mecanismo de compreensão por oposição. A tensão entre os dois mundos prende atenção. Funciona melhor quando os dois mundos são <b>específicos</b> e <b>concretos</b>, não abstratos.",
        "exemplos": [
            "<b>Exemplo:</b> &ldquo;De um lado: criador que acorda 6h, posta 3 Reels, recebe 80 views. Do outro: criador que posta 1x/semana e faz 50k views. A diferença não é sorte.&rdquo;",
            "<b>Exemplo:</b> &ldquo;Mundo A: R$ 2 mil/mês, 12h/dia, sem tempo para família. Mundo B: R$ 9 mil/mês, 4h/dia, finais de semana livres. Eu vivi os dois. Veja como mudei.&rdquo;",
            "<b>Exemplo:</b> &ldquo;O criador que vende curso por R$ 97 e o que vende por R$ 997. Ambos entregam o mesmo conteúdo. A diferença é uma decisão. Vem entender.&rdquo;",
        ],
        "quando_usar": "Quando você tem dois cenários contrastantes com lição embutida. Excelente para conteúdo de posicionamento, decisão e estratégia.",
        "quando_nao": "Não use contraste simplista (&ldquo;pobre vs rico&rdquo;) sem nuance. O público rejeita narrativa maniqueísta. Contraste precisa ter profundidade.",
        "exercicio": "Pense em duas versões da sua jornada (ou do seu nicho). Descreva cada uma em 1 frase. Use o contraste como abertura do próximo vídeo.",
    },
    {
        "num": "26",
        "nome": "Hipérbole",
        "subtitle": "Exagero controlado cria impacto memorável",
        "psychology": "O <b>viés de extrema memorabilidade</b> mostra que o cérebro lembra melhor de estímulos exagerados. Hipérbole (desde que claramente hiperbólica) cria impacto porque quebra o padrão de fala cotidiana. O segredo é que o espectador entenda que é exagero — não mentira. Use para gerar impacto emocional, não para distorcer fatos. Hipérbole é ferramenta retórica; mentira é manipulação.",
        "exemplos": [
            "<b>Exemplo:</b> &ldquo;Esse erro está destruindo o alcance de 90% dos criadores. Literalmente. Veja se você comete.&rdquo;",
            "<b>Exemplo:</b> &ldquo;Postar todo dia é o suicídio algorítmico do Instagram. Te mostro a alternativa que cresce 10x mais rápido.&rdquo;",
            "<b>Exemplo:</b> &ldquo;Esse hook é tão forte que eu testaria contra qualquer outro. Spoiler: ganha sempre.&rdquo;",
        ],
        "quando_usar": "Quando você quer gerar impacto emocional e o argumento é sólido por trás. Excelente para conteúdo de autoridade com tom inflamado.",
        "quando_nao": "Não use hipérbole para esconder falta de conteúdo. Exagero sem lastro vira clickbait. O público pune quando o payoff não justifica o hype.",
        "exercicio": "Escreva 3 frases exageradas sobre um tema que você domina. Teste com amigo: se ele ri ou concorda, é hipérbole boa. Se duvida, refine.",
    },
    {
        "num": "27",
        "nome": "Silêncio dramático",
        "subtitle": "Ausência de fala nos primeiros segundos cria tensão",
        "psychology": "Em um feed de áudios altos e falas rápidas, o <b>silêncio</b> é o estímulo mais disruptivo. Quando um Reel começa com 1-2 segundos de silêncio (ou só som ambiente), o cérebro do espectador pausa para entender — &ldquo;algo está diferente&rdquo;. Esse micro-choque de atenção é poderoso. Use silêncio seguido de fala intensa ou visual impactante. Não use silêncio longo demais — vira estranho.",
        "exemplos": [
            "<b>Exemplo:</b> (1s de silêncio, olhando para câmera, depois fala) &ldquo;Você está fazendo isso errado. Te mostro o certo em 30 segundos.&rdquo;",
            "<b>Exemplo:</b> (som de respiração funda por 2s) &ldquo;Essa foi minha reação quando descobri que meu Reel de 14k views tinha um padrão escondido.&rdquo;",
            "<b>Exemplo:</b> (cena muda de barulho para silêncio abrupto) &ldquo;Preste atenção. O que eu vou te dizer muda como você edita Reels.&rdquo;",
        ],
        "quando_usar": "Quando você tem uma revelação forte após o silêncio. Excelente para conteúdo dramático, storytime e momento &ldquo;aha&rdquo;.",
        "quando_nao": "Não use silêncio sem payoff. Silêncio promete que algo grande vem. Se vier algo fraco, frustra. Use silêncio só quando a frase seguinte é impactante.",
        "exercicio": "Escolha a frase mais impactante do seu próximo vídeo. Adicione 1-2s de silêncio antes dela. Teste a retenção comparada com a versão sem silêncio.",
    },
    {
        "num": "28",
        "nome": "Trend hijack",
        "subtitle": "Aproveite trend do momento para ganhar alcance",
        "psychology": "Trends são picos de <b>atenção coletiva</b>. O algoritmo prioriza conteúdo que usa áudios e formatos em alta porque o público demonstra interesse. Quando você &ldquo;sequestra&rdquo; uma trend (usa o áudio/formato mas entrega seu conteúdo), pega carona nessa atenção. A chave é que o conteúdo seja <b>relevante</b> — não use trend só por usar. Trend sem substância vira clichê e o público detecta.",
        "exemplos": [
            "<b>Exemplo:</b> (usando áudio em trend) &ldquo;Esse som está em trend. Mas vou usar para te mostrar 3 erros de edição que você provavelmente comete.&rdquo;",
            "<b>Exemplo:</b> (formato &ldquo;day in the life&rdquo;) &ldquo;Day in the life de um criador de conteúdo que fatura 5 dígitos por mês. Spoiler: não é o que você pensa.&rdquo;",
            "<b>Exemplo:</b> (usando trend de áudio) &ldquo;Todo mundo usando esse som para dancinha. Eu vou usar para te ensinar uma técnica que muda seus Reels.&rdquo;",
        ],
        "quando_usar": "Quando você identifica trend alinhada com seu conteúdo. Excelente para ganhar alcance rápido e atingir público fora da bolha.",
        "quando_nao": "Não use trend desalinhada com seu nicho. Forçar trend parece desesperado. E não use trends em declínio — o algoritmo pune.",
        "exercicio": "Identifique 3 trends atuais do seu nicho. Para cada, escreva um ângulo de conteúdo que se conecte organicamente. Escolha a melhor e grave hoje.",
    },
    {
        "num": "29",
        "nome": "“Você está fazendo errado”",
        "subtitle": "Provocação direta que gera ansiedade e atenção",
        "psychology": "A frase &ldquo;você está fazendo errado&rdquo; ativa o <b>sistema de ameaça ao ego</b>. O cérebro precisa verificar se está realmente errado — e se for, corrigir. Esse mecanismo de auto-preservação prende atenção. Use quando você tem um padrão comum errado e a correção é o conteúdo do vídeo. Cuidado com o tom: agressivo demais gera rejeição; gentil demais perde impacto. Equilíbrio é essencial.",
        "exemplos": [
            "<b>Exemplo:</b> &ldquo;Você está fazendo a abertura dos seus Reels errada. Veja como corrigir em 30 segundos.&rdquo;",
            "<b>Exemplo:</b> &ldquo;Você está usando a hashtag errada — e o Instagram está punindo sua conta. Vem corrigir.&rdquo;",
            "<b>Exemplo:</b> &ldquo;Você está editando vídeo assim (mostra erro). Isso destrói retenção. Te mostro o certo.&rdquo;",
        ],
        "quando_usar": "Quando você identifica erro comum e tem a correção. Excelente para conteúdo educativo e de autoridade.",
        "quando_nao": "Não use sem alternativa. &ldquo;Você está errado&rdquo; sem &ldquo;fazer assim&rdquo; frustra. Sempre acompanhe da solução concreta.",
        "exercicio": "Liste 5 erros comuns do seu público. Escolha o que mais impacto tem. Use &ldquo;você está fazendo X errado&rdquo; como abertura e entregue a correção.",
    },
    {
        "num": "30",
        "nome": "Loop infinito",
        "subtitle": "Crie um Reel que se repete — e o público assiste de novo",
        "psychology": "O <b>loop</b> é o gancho mais poderoso para retenção porque engana o algoritmo: cada repetição conta como nova visualização. Quando o final do vídeo conecta perfeitamente com o início, o espectador assiste 2-3x sem perceber. Isso dispara retenção alta e sinaliza ao algoritmo que o conteúdo é excelente. A chave é que a <b>última frase</b> do vídeo conecte logicamente com a <b>primeira frase</b>, criando ciclo narrativo.",
        "exemplos": [
            "<b>Exemplo:</b> &ldquo;(início) 30 ganchos para Reels que vão mudar seu alcance... (final) ...e é por isso que você precisa conhecer os 30 ganchos para Reels.&rdquo;",
            "<b>Exemplo:</b> &ldquo;(início) Se você assistiu até aqui, parabéns. (final) ...então presta atenção, porque isso aqui é para quem assistiu até aqui.&rdquo;",
            "<b>Exemplo:</b> &ldquo;(início) Existe um erro que mata seus Reels... (final) ...e esse erro começa justamente quando você não conhece o erro que mata seus Reels.&rdquo;",
        ],
        "quando_usar": "Quando o conteúdo permite ciclagem narrativa. Excelente para listas, definições e conteúdo curto (até 15s).",
        "quando_nao": "Não force loop se não houver conexão lógica. Loop artificial confunde e o espectador percebe. A última frase precisa fazer sentido como continuação.",
        "exercicio": "Escreva a primeira frase do seu próximo Reel. Agora escreva a última frase de forma que conecte logicamente com a primeira. Teste: leia em sequência — faz sentido?",
    },
]


# ============================================================
# RENDER DE UM GANCHO (2 páginas)
# ============================================================
def render_gancho(g):
    """Renderiza um capítulo de gancho em exatamente ~2 páginas."""
    story = []
    # Cabeçalho do capítulo (página nova)
    story += chapter_header(g["num"], g["nome"], g["subtitle"])
    # h2 com nome e número
    story.append(h2(f"Gancho {g['num']} — {g['nome']}"))
    # Corpo: psicologia por trás
    story.append(body(g["psychology"]))
    # 3 variações (body_lead)
    story.append(h3("3 variações para usar hoje"))
    for ex in g["exemplos"]:
        story.append(body_lead(ex))
    # callout: quando usar / não usar
    story.append(callout(
        "Quando usar  ·  Quando NÃO usar",
        f"<b>Quando usar:</b> {g['quando_usar']}<br/><br/><b>Quando NÃO usar:</b> {g['quando_nao']}",
    ))
    # exercício
    story.append(exercise_box("Exercício prático", [g["exercicio"]]))
    return story


# ============================================================
# BUILD DO E-BOOK
# ============================================================
def build():
    story = []
    
    # ============ CAPA ============
    story += cover_page(
        title="30 Ganchos para Reels",
        subtitle="Capture a Atenção nos Primeiros Segundos e Converta",
        author="Clodoaldo Silva",
        site="clodoaldo.vercel.app",
        eyebrow="E-BOOK PREMIUM",
    )
    
    # ============ SUMÁRIO ============
    toc_items = [
        {"title": "Introdução — A ciência dos 3 segundos", "page": "3", "level": 1},
        {"title": "Parte 1 — Os 30 Ganchos", "page": "6", "level": 1},
    ]
    # Listar os 30 ganchos no sumário
    for g in GANCHOS:
        page = 6 + (int(g["num"]) - 1) * 2
        toc_items.append({"title": f"{g['num']}. {g['nome']}", "page": str(page), "level": 2})
    toc_items.append({"title": "Conclusão — Como escolher seu gancho ideal", "page": "66", "level": 1})
    story += toc_page(toc_items)
    
    # ============ INTRODUÇÃO (3 páginas) ============
    story += intro_header(
        "A ciência dos 3 segundos",
        "Por que os primeiros momentos definem o sucesso ou o fracasso do seu Reel",
    )
    story.append(body_lead("Você tem 3 segundos. Talvez menos. É nesse tempo — menos do que uma respiração profunda — que o espectador decide se fica ou rola. E essa decisão não é consciente. É neural."))
    story.append(h2("Por que 3 segundos importam tanto"))
    story.append(body("Quando o feed do Instagram rola, o cérebro do espectador está em <b>modo de triagem rápida</b>: processando dezenas de estímulos por segundo, decidindo em milissegundos o que merece atenção. Esse processo é chamado de <i>atenção seletiva</i> — e ele é brutalmente eficiente. Apenas 1 em cada 5 vídeos passa do segundo 3. Os outros 80% morrem ali."))
    story.append(body("Por isso, o gancho não é um detalhe. É <b>tudo</b>. Um vídeo excelente com gancho fraco tem o mesmo destino de um vídeo ruim com gancho fraco: ninguém assiste. Já um vídeo mediano com gancho excelente pode viralizar — porque tem chance de ser visto."))
    story.append(illustration_image(hook_retention_curve(), width=15*cm))
    story.append(caption("Curva de retenção típica: 80% da audiência some antes do segundo 5"))
    
    story.append(page_break())
    story.append(h2("O que torna um gancho magnético"))
    story.append(body("Ganchos que retêm têm 3 ingredientes. Não são opcionais — são estruturais. Sem um deles, o gancho falha."))
    story.append(numbered_list([
        "<b>Tensão cognitiva:</b> o cérebro precisa sentir que algo não fecha — uma lacuna, uma contradição, uma promessa não cumprida. Essa tensão vira curiosidade.",
        "<b>Especificidade:</b> números, nomes, momentos. &ldquo;Eu perdi R$ 14 mil&rdquo; é 10x mais forte que &ldquo;eu perdi muito dinheiro&rdquo;.",
        "<b>Promessa implícita:</b> o espectador precisa sentir que ficar vai valer a pena. Não diga &ldquo;fica que eu explico&rdquo; — mostre que tem algo valioso vindo.",
    ]))
    story.append(callout(
        "A fórmula do gancho perfeito",
        "<b>Tensão + Especificidade + Promessa = Gancho magnético</b><br/><br/>Use essa fórmula como checklist antes de publicar qualquer Reel. Se faltar um dos três, refaça.",
    ))
    story.append(body("Ao longo dos próximos 30 capítulos, você vai conhecer 30 tipos de ganchos — cada um com psicologia, 3 variações prontas, quando usar/não usar e exercício. Não é teoria. É arsenal."))
    story.append(illustration_image(hook_categories_grid(), width=15*cm))
    story.append(caption("As 6 categorias de ganchos cobertas neste e-book"))
    
    story.append(page_break())
    story.append(h2("Como usar este e-book"))
    story.append(body("Não leia os 30 ganchos de uma vez e tente lembrar de todos. Isso não funciona. O cérebro não aprende por exposição — aprende por <b>aplicação repetida</b>."))
    story.append(body("Em vez disso, faça assim:"))
    story.append(numbered_list([
        "Escolha <b>1 gancho por dia</b> e grave um Reel usando-o.",
        "Faça o exercício prático do capítulo antes de gravar.",
        "Teste o gancho em 3 vídeos na semana.",
        "Meça retenção aos 3 segundos e taxa de salvamento.",
        "Identifique os 3 ganchos que mais performam para seu nicho.",
        "Crie um &ldquo;playbook&rdquo; pessoal com esses 3 ganchos.",
    ]))
    story.append(callout(
        "Compromisso",
        "Se você aplicar 1 gancho por dia durante 30 dias, terá 30 Reels publicados, 30 dados de retenção e uma clareza que 99% dos criadores não têm. Em 30 dias, sua capacidade de prender atenção terá evoluído mais do que em 1 ano de tentativa e erro.",
    ))
    story.append(body("Vamos começar."))
    
    # ============ OS 30 GANCHOS ============
    story.append(illustration_image(hook_performance_chart(), width=15*cm))
    story.append(caption("Performance média por categoria de gancho (base: 500 Reels analisados)"))
    for g in GANCHOS:
        story += render_gancho(g)
    
    # ============ CONCLUSÃO (2 páginas) ============
    story += conclusion_header(
        "Como escolher seu gancho ideal",
        "Um framework prático para selecionar o gancho certo para cada vídeo",
    )
    story.append(body_lead("Você chegou aos 30 ganchos. Parabéns — mas aqui está a verdade: conhecer 30 ganchos não te torna melhor em ganchos. Aplicar repetidamente, medir e iterar — sim."))
    story.append(body("A pergunta que fica é: <b>como escolher o gancho certo para cada vídeo?</b> Não existe resposta única. Existe um framework."))
    story.append(h2("Framework de seleção de ganchos"))
    story.append(numbered_list([
        "<b>Qual o objetivo do vídeo?</b> Educar → listas, FAQ, demo. Conectar → storytime, antes-e-depois, &ldquo;eu era como você&rdquo;. Provocar → contradição, polêmica, &ldquo;pare de fazer isso&rdquo;.",
        "<b>Qual o público-alvo?</b> Iniciantes → mitos, erros caros, &ldquo;ninguém te conta&rdquo;. Avançados → polêmica, contradição, desafio. Indefinido → stat chocante, número surpreendente, cena dramática.",
        "<b>Qual a emoção que você quer gerar?</b> Curiosidade → revelação progressiva, &ldquo;eu descobri&rdquo;. Urgência → erro caro, &ldquo;pare de fazer isso&rdquo;. Inspiração → antes-e-depois, &ldquo;eu era como você&rdquo;.",
        "<b>Qual o formato do conteúdo?</b> Curto (até 15s) → loop, hipérbole, stat chocante. Médio (15-30s) → lista, FAQ, demo. Longo (30s+) → storytime, contraste de mundos, bastidores.",
    ]))
    story.append(callout(
        "A regra de ouro",
        "O melhor gancho é aquele que <b>você consegue entregar</b>. Ganchos sofisticados com payoff fraco são piores que ganchos simples com payoff forte. Comece pelo simples, evolua para o sofisticado.",
    ))
    
    story.append(page_break())
    story.append(h2("Plano de 30 dias para dominar ganchos"))
    story.append(h3("Semana 1 — Fundação"))
    story.append(bullet_list([
        "Dia 1-3: aplique 1 gancho por dia dos 10 primeiros. Meça retenção aos 3s.",
        "Dia 4-7: identifique os 2 ganchos com melhor performance. Repita variações.",
    ]))
    story.append(h3("Semana 2 — Expansão"))
    story.append(bullet_list([
        "Dia 8-14: aplique 1 gancho por dia dos ganchos 11-20. Mantenha os 2 campeões da semana 1 como comparação.",
        "No fim da semana, você terá 7 vídeos novos + 7 vídeos com ganchos campeões.",
    ]))
    story.append(h3("Semana 3 — Sofisticação"))
    story.append(bullet_list([
        "Dia 15-21: aplique ganchos 21-30. Combine 2 ganchos em um único vídeo (ex: stat chocante + loop).",
        "Identifique o seu &ldquo;gancho-assinatura&rdquo; — o que mais combina com seu estilo.",
    ]))
    story.append(h3("Semana 4 — Consolidação"))
    story.append(bullet_list([
        "Crie um &ldquo;playbook&rdquo; pessoal: seus 3 ganchos mais fortes, com 5 variações cada.",
        "Use o playbook para os próximos 90 dias. Refine mensalmente.",
    ]))
    story.append(spacer(0.5))
    story += quote("O gancho é o contrato. Se você cumprir, o espectador fica. Se não cumprir, ele rola — e merecidamente.", "Clodoaldo Silva")
    story.append(spacer(0.5))
    story.append(body("Se este e-book te ajudou, compartilhe com 1 criador que precisa ler. Conteúdo bom merece ser espalhado."))
    story.append(spacer(0.5))
    story.append(HRule(2*28.35, COLORS["primary"], 1))
    story.append(spacer(0.4))
    styles = get_styles()
    story.append(Paragraph("© Clodoaldo Silva. Todos os direitos reservados. Parte do Knowledge Hub Premium.", styles["Footer_Caption"]))
    
    return story


if __name__ == "__main__":
    print("Gerando 30-ganchos-reels.pdf...")
    story = build()
    build_pdf(OUTPUT, story, title="30 Ganchos para Reels — Clodoaldo Silva")
    
    import os
    size = os.path.getsize(OUTPUT)
    print(f"✅ Gerado: {OUTPUT}")
    print(f"   Tamanho: {size:,} bytes ({size/1024:.1f} KB)")
    
    import pypdf
    reader = pypdf.PdfReader(OUTPUT)
    print(f"   Páginas: {len(reader.pages)}")
