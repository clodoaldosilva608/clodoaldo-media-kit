# Redesign editorial premium + endurecimento do webhook Stripe

Dois blocos independentes: (1) redesign visual completo da home com estética editorial de alto nível e animações de scroll refinadas; (2) rastreabilidade e testes do fluxo de pagamento/entitlement.

## 1. Nova identidade visual (referências reais)

Pesquisa obrigatória em styles.refero.design e no ecossistema Framer (templates/componentes gratuitos de designers de elite) para extrair padrões concretos de: grid editorial assimétrico, hierarquia tipográfica, tratamento de imagem cinematográfico e micro-interações de botão.

Direção escolhida (ajustável): **Dark Mode executivo** — fundo chumbo fosco quase preto, superfícies em grafite, texto off-white, um único tom de destaque sóbrio (âmbar dessaturado/bronze derivado da logo, sem gradiente colorido). Zero gradiente arco-íris, zero glow.

Tipografia: display serifada elegante nos títulos (ex. Instrument Serif / Newsreader) + sans-serif refinada no corpo (ex. Geist / Inter Tight), com tracking negativo nos títulos grandes e muito whitespace.

Tokens: reescrita das variáveis em `src/styles.css` (background, surface, foreground, hairline border, accent) removendo `--gradient-orange`/`--shadow-glow` do uso visual dominante, mantendo compatibilidade das utilities existentes para não quebrar outras rotas.

## 2. Seções da home

- **Hero assimétrico**: coluna esquerda com eyebrow discreto, título serif "Transformando conhecimento em patrimônio" revelado linha por linha, subtítulo limpo (Lifestyle · Business · Vision) e CTA "Solicitar Orçamento" como proposta de parceria exclusiva (borda fina, preenchimento no hover, seta com deslocamento). Coluna direita com a foto atual em tratamento cinematográfico (grade sutil, vinheta, leve parallax no scroll).
- **Faixa de autoridade**: números/pilares em linha fina com separadores hairline, sem cards coloridos.
- **Pilares (Business, IA, Produtividade, Visão)**: cards minimalistas de borda 1px, hover com elevação de contraste e revelação de link.
- **Métricas, Audiência, Serviços, Biblioteca, Ecossistema, Cases, YouTube, Valores, Contato**: mantêm conteúdo e links atuais, mas repaginados no novo sistema (tipografia editorial, hairlines, numeração de seção tipo `01 —`).
- **Header/Footer**: header minimalista com hairline no scroll; nav reduzida e agrupada para caber sem poluir; footer editorial em colunas.

## 3. Animações de scroll

- Motion for React para reveals (fade-in up ~16–24px, stagger de 60–90ms), reveal de título por linha, parallax leve (≤8%) na imagem do hero e foco progressivo em cards.
- `prefers-reduced-motion` respeitado; conteúdo sempre legível mesmo sem observer/JS (mantém o comportamento à prova de falha já corrigido em `use-reveal`).
- Sem animação em elementos above-the-fold críticos ao LCP.

## 4. Webhook Stripe — logs estruturados e rastreáveis

Em `src/routes/api/public/stripe-webhook.ts`:
- Logger com payload JSON único por evento contendo `event_id`, `event_type`, `idempotency_key`, `session_id`, `kind`, `outcome` e `deny_reason`.
- Motivos de negação explícitos e padronizados: `signature_invalid`, `payment_not_paid`, `entitlement_not_found`, `entitlement_user_mismatch`, `entitlement_product_mismatch`, `amount_mismatch`, `replay_ignored`.
- Nenhum dado sensível (e-mail, tokens) nos logs.

## 5. Testes E2E

Em `tests/e2e/`:
- **Entitlement incorreto**: evento de checkout cujo `entitlement_id` pertence a outro usuário/outro produto → webhook nega, entitlement continua inativo, capítulo premium segue bloqueado e o paywall exibe mensagem clara.
- **Replay**: mesmo `event.id` reenviado 3x → entitlement ativado uma única vez, sem duplicar linhas nem liberar download extra.
- **Suíte completa Knowledge Hub + Biblioteca**: vitrine → detalhe → paywall → login → checkout → retorno → download do ZIP com validação de tamanho/hash.
- Execução via `bun run ci:security` + `bun run test:e2e` no ambiente de CI, com relatório dos resultados.

## Notas técnicas

- Sem alteração de rotas, autenticação, Stripe checkout ou schema além do que já existe (`stripe_webhook_events` já criado).
- Fontes carregadas por `<link>` no `__root.tsx` (nunca `@import` remoto no CSS).
- Head/SEO da home preservado; apenas ajustes de conteúdo textual se o copy mudar.
- Testes que dependem de sessão real usam a sessão gerenciada disponível; sem ela, falham de forma explícita em vez de skip silencioso.
