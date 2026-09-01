# Plataforma comercial: trilhas, Desenvolvimento Web e Quiz-Funil

Escopo aprovado: Fases 1–7 completas, preços de Desenvolvimento Web como "sob consulta", papéis de admin criados sem promover ninguém automaticamente, persistência somente no backend próprio (webhook externo apenas preparado, desativado).

Nada é removido: Biblioteca, Knowledge Hub, Apps, Cases, Métricas, FAQ, Sobre, Contato, Serviços de influência, Ghost Services e a fila de espera continuam intactos. A identidade visual (fundo escuro, tipografia editorial, dourado, cards discretos) é preservada.

## Fase 1 — Posicionamento e navegação

- Hero: mantém "Transformando conhecimento em patrimônio" e ganha subtítulo que inclui sites, landing pages, páginas de campanha e produtos digitais; kicker de identidade "Estrategista digital, creator e desenvolvedor de experiências digitais".
- CTA primário "Descubra a solução ideal" → `/quiz`; secundário "Ver serviços" → `#servicos`.
- Nova seção logo abaixo do hero com três cards de trilha: "Quero divulgar minha marca", "Quero melhorar meu conteúdo", "Quero criar minha presença digital". Cada card abre o quiz já com o objetivo pré-selecionado (`/quiz?trilha=...`).
- Header: agrupa serviços em um menu "Serviços" (Influência, Ghost Services, Desenvolvimento Web) mantendo os demais links; CTA "Descubra a solução ideal" fica visível também no mobile.
- Home fica mais curta: blocos longos de Desenvolvimento Web e detalhes de oferta vivem em páginas próprias, com links de aprofundamento.

## Fase 2 — Desenvolvimento Web

Nova rota `/desenvolvimento-web` com as quatro ofertas: Site Institucional, Landing Page de Conversão, Facepage / Página de Campanha (com explicação do termo na interface) e Projeto Sob Medida.

Cada oferta traz: problema resolvido, para quem é, entregáveis, o que não está incluído, prazo estimado, revisões incluídas, investimento "sob consulta", FAQ curto e CTA próprio. Nenhum depoimento, cliente ou resultado inventado; campos sem informação usam placeholder honesto e editável em um catálogo de dados.

CTAs levam a briefing (formulário) ou WhatsApp — não a checkout automático.

## Fase 3 — Quiz-Funil `/quiz`

Interface premium, sem recarregar página, com progresso "Pergunta X de 6", voltar sem perder respostas, rascunho salvo localmente e retomada após abandono.

Abertura com o título e subtítulo pedidos, aviso de que não há resposta certa e botão "Começar diagnóstico". As 6 perguntas seguem exatamente as opções especificadas (objetivo, estágio, gargalo, urgência, faixa de investimento, canal preferido).

Antes do resultado completo: nome, e-mail e WhatsApp, com consentimento em checkbox separado (desmarcado), link para a política de privacidade e validação de e-mail. Um resumo gratuito aparece antes do cadastro.

Regras de recomendação em dados (não espalhadas na UI), com pontuação ponderada: objetivo+gargalo 40%, estágio 25%, investimento 20%, urgência 15%. Resultado com uma recomendação principal e no máximo uma alternativa, seguindo os mapeamentos indicados (Combo Completo, Roteiro Estratégico, Edição Viral, Auditoria de Perfil, Site Institucional, Landing Page, Facepage, Projeto Sob Medida, produtos de entrada da Biblioteca, Ecossistema de Apps).

Página de resultado: perfil com nome amigável, recomendação, explicação baseada nas respostas, para quem é, entregáveis, faixa de investimento ou "sob consulta", CTA principal contextual (contratar / briefing / WhatsApp / explorar), CTA secundário de menor investimento, compartilhar sem dados pessoais e link para refazer.

## Fase 4 — Backend, painel e eventos

Novas tabelas: `quiz_sessions`, `quiz_answers`, `quiz_results`, `quiz_leads`, `quiz_rules`, `offers`, `service_requests`, `analytics_events`, além de `user_roles` + função `has_role`.

Regras de acesso: visitante pode criar sessão, respostas, resultado e lead, mas não lê dados de ninguém; `offers` e `quiz_rules` são públicos apenas para leitura; somente admin lê sessões, leads, resultados e solicitações. A gravação passa por funções de servidor com validação, sem chaves secretas no frontend.

Painel `/admin/quiz` protegido por papel admin: sessões iniciadas e concluídas, taxa de conclusão, resultados por oferta, cliques em WhatsApp e checkout, leads recentes, exportação CSV e edição de ofertas e regras.

Eventos registrados: `quiz_started`, `quiz_question_answered`, `quiz_completed`, `result_viewed`, `result_cta_clicked`, `whatsapp_clicked`, `checkout_started`.

Stripe continua apenas nas ofertas de compra imediata já existentes; Projeto Sob Medida e serviços web geram `service_requests` (briefing), nunca checkout automático. Um ponto de saída para webhook externo (n8n) fica implementado mas desligado por falta de URL configurada.

## Fase 5 — UX, SEO e acessibilidade

Mobile-first, alvos de toque confortáveis, cards que não quebram em telas pequenas; labels reais, foco visível, navegação por teclado, erros associados aos campos e `aria-live` para progresso e validações; métricas com valor final já no HTML e animação apenas como melhoria progressiva; metadata, Open Graph, Twitter card, canonical e headings próprios em cada rota nova; schema.org de Service e FAQPage apenas com dados verdadeiros; estados de carregando, vazio, erro, sucesso e nova tentativa no quiz, briefing, contato e checkout; contato com confirmação de sucesso, proteção contra envio duplicado e prazo de resposta informado.

## Fase 6 — Conteúdo e prova

Nenhuma métrica, depoimento ou case inventado. Os cases passam a aceitar desafio, solução, entregáveis, antes/depois, resultado, imagem, link e autorização de uso, exibindo apenas o que estiver preenchido.

## Fase 7 — Testes e entrega

Rotas antigas e novas verificadas no navegador em desktop e mobile; quiz testado em pelo menos oito combinações de respostas; voltar, recarregar, abandonar e retomar; validação de e-mail, consentimento e lead duplicado; visitante anônimo e admin; tentativa de leitura indevida para confirmar as regras de acesso; console sem erros e CTAs no destino correto. README documentando variáveis de ambiente, migrações, seed de ofertas, regras de recomendação e configuração de pagamentos e automação.

## Detalhes técnicos

- Rotas novas: `/quiz`, `/quiz/resultado`, `/desenvolvimento-web`, `/desenvolvimento-web/$oferta`, `/briefing`, `/admin/quiz` (sob layout autenticado), todas incluídas no `sitemap.xml`.
- Catálogos de dados: `src/lib/web-services-catalog.ts` (ofertas web) e `src/lib/quiz-config.ts` (perguntas, pesos, mapeamentos) com seed correspondente em `offers` e `quiz_rules`.
- Funções de servidor: `src/lib/quiz.functions.ts` (criar sessão, salvar resposta, calcular e persistir resultado, registrar lead), `src/lib/analytics.functions.ts`, `src/lib/admin-quiz.functions.ts` (verifica `has_role` antes de qualquer leitura privilegiada), `src/lib/briefing.functions.ts`.
- O cálculo da recomendação roda no servidor a partir de `quiz_rules`, para o resultado persistido não depender do cliente.
- `leads` atual (e-books) não é alterada; leads do quiz ficam em `quiz_leads` com deduplicação por e-mail.
- Papéis: enum `app_role`, tabela `user_roles` e função `has_role` security definer; nenhum usuário é promovido automaticamente — a promoção é feita depois por você.
- Ordem de execução: migração e seed primeiro, depois catálogos e funções, então quiz e páginas web, painel, e por fim SEO/acessibilidade e a rodada de testes.
