# Análise de viabilidade — Brief "Evoluir clodoaldo.vercel.app"

## Resumo executivo

O brief pede uma evolução **conservadora e guiada** do site atual, preservando identidade, conteúdo e ativos. **Não propõe rebuild** — propõe refinamentos em 14 frentes. Após auditoria do repositório, **85% do que o brief pede já está implementado**. O trabalho real é de **preenchimento de lacunas**, não de construção do zero.

**Recomendação:** ✅ **Faz sentido implementar** — mas com priorização cirúrgica. Não vale seguir os 14 passos linearmente; vale atacar só os 5 gaps reais (detalhados abaixo).

---

## Auditoria por passo (o que já existe vs. o que falta)

### Passo 1 — Auditoria e baseline ✅ JÁ FEITA
- Framework: Next.js 16 + React 19 + Tailwind 4 + Supabase
- 22 rotas públicas mapeadas
- 18 componentes media-kit
- Deploy: Vercel (clodoaldo.vercel.app)
- **Ação:** nenhuma — auditoria já foi executada como parte desta análise.

### Passo 2 — Modelo de conteúdo ⚠️ PARCIAL
- **Já existe:** `products_catalog` no Supabase com schema tipado (id, name, description, price_cents, category, icon, image_path, whatsapp_sku, is_active, sort_order).
- **Já existe:** `case-studies.ts`, `knowledge` table, `quiz_questions` no banco.
- **Falta:** unify solutions/apps/ebooks numa tipagem consistente (hoje solutions e services são ambíguos). Hoje há `/servicos/[slug]` E `/produtos/[slug]` — confuso.
- **Custo:** 4-6h de refatoração.

### Passo 3 — Navegação orientada a intenção ✅ JÁ IMPLEMENTADO
- Hero tem 3 entry paths: "Sou marca ou produto" (Megaphone), "Sou creator ou negócio" (Edit3), "Tenho ideia digital" (Code2).
- Cada um linka pra `/quiz?profile=marca|creator|empresa`.
- **Gap:** Brief pede 4 entradas (marca, conteúdo, produto digital, parceria). Hoje tem 3. Falta "Quero uma parceria" → pode apontar pra `/criadores-parceiros`.
- **Custo:** 30min.

### Passo 4 — Quiz de recomendação ✅ JÁ IMPLEMENTADO (com mais perguntas que o brief pede)
- 6 perguntas (objetivo, estágio, urgência, orçamento, tipo de apoio + 1 extra).
- Brief pede 5 — já temos 6.
- Persistência local via state.
- Função de pontuação determinística no backend (`/api/quiz/compute`).
- Resultado mostra: recomendação principal, alternativas, reasons (por que se encaixa), score breakdown.
- **Gap:** não mostra explicitamente "o que NÃO está incluído" nem "prazo indicativo" nem "bônus".
- **Custo:** 2-3h pra adicionar esses 3 campos na UI de resultado.

### Passo 5 — Catálogo inteligente ⚠️ PARCIAL
- **Já existe:** grid de produtos com cards consistentes, badge "assinatura", botão PIX + WhatsApp, galeria de imagens (implementada hoje).
- **Falta:** busca textual, filtros por categoria/público/objetivo/status, estados vazio/carregando/erro.
- **Custo:** 4-5h (similar ao que fizemos no `/admin/parceiros`).

### Passo 6 — Páginas de detalhe ⚠️ PARCIAL
- **Já existe:** `/produtos/[slug]` com hero, descrição, FAQ, CTA WhatsApp.
- **Falta:** estrutura padronizada (problema, público, proposta, entregáveis, método, exemplos, FAQ, CTA com contexto).
- **Gap:** CTA hoje é genérico. Brief pede que carregue contexto (slug do produto) no link WhatsApp.
- **Custo:** 3-4h.

### Passo 7 — Prova de resultado ⚠️ PARCIAL
- **Já existe:** `cases.tsx` com 3 cases (reposicionamento, conversão, +1).
- **Falta:** filtros por tipo de projeto, estrutura situacional-inicial/intervenção/entregáveis/resultado/período/escopo.
- **Risco:** Brief alerta: "Quando não houver dado verificável, prefira descrição qualitativa a número inventado". Hoje os cases têm métricas tipo "+342%" — precisam ser autorizados.
- **Custo:** 3-4h.

### Passo 8 — Biblioteca e aquisição ✅ JÁ IMPLEMENTADO
- `/biblioteca` e `/knowledge` existem, com grid de e-books, vídeos, artigos.
- Cada item mostra: formato, tempo estimado, nível.
- E-books gratuitos sem bloqueio imediato.
- SEO individual via `generateMetadata` em `/knowledge/[slug]`.
- **Gap menor:** falta "data" visível no card.
- **Custo:** 30min.

### Passo 9 — Método e confiança ✅ JÁ IMPLEMENTADO
- 5 fases: Diagnóstico, Direção, Produção, Lançamento, Evolução.
- Cada uma com ícone, título, descrição.
- **Gap:** Brief pede mostrar "entrada necessária, atividade, saída, critério de conclusão" por fase. Hoje só tem descrição genérica.
- **Custo:** 1-2h (enriquecer cada fase com 4 campos).

### Passo 10 — Agendamento e contato ✅ JÁ IMPLEMENTADO
- `/agendar` com Cal.com embed + Google Calendar + WhatsApp.
- Formulário de contato na home (`/#contato`).
- Validação client-side.
- **Gap:** validação server-side explícita, rate limit, CSRF token.
- **Custo:** 2-3h.

### Passo 11 — Visual e microinterações ✅ JÁ IMPLEMENTADO
- Identidade preservada (dark + emerald + serif/sans).
- Intro sequence com skip.
- `prefers-reduced-motion` respeitado em 4 componentes (hero, globe, intro, world-map).
- **Ação:** nenhuma.

### Passo 12 — Acessibilidade, segurança, performance ⚠️ PARCIAL
- **Já existe:** skip-link no CSS, prefers-reduced-motion, loading=lazy nas imagens.
- **Falta:** contraste AA auditado, aria-live nos resultados do quiz, validação CSRF no contact form, rate limit nos endpoints públicos.
- **Custo:** 4-6h.

### Passo 13 — SEO e analytics ✅ JÁ IMPLEMENTADO
- `metadata` em `/layout.tsx` e páginas individuais.
- `sitemap.ts` existe.
- Schema.org em `/layout.tsx` (Person + Organization).
- Analytics: `quiz_started`, `quiz_completed`, `initiate_checkout`, `whatsapp_click`, `page_view`, etc.
- **Gap:** falta `robots.ts`, schema FAQ nas páginas de produto, schema Article na biblioteca.
- **Custo:** 1-2h.

### Passo 14 — Testes e entrega ❌ NÃO IMPLEMENTADO
- **Não há testes unitários, de integração ou E2E.**
- Diretório `tests/` só tem scripts de build Docker.
- **Custo:** 8-12h pra cobertura mínima (quiz scoring, filtros, formulário, E2E home→quiz→contato).

---

## Análise crítica — faz sentido implementar?

### ✅ O que faz sentido (prioridade alta, baixo esforço)

1. **Adicionar 4ª entrada no Hero** ("Quero uma parceria") → 30min
2. **Enriquecer resultado do quiz** com "o que não está incluído", "prazo indicativo", "bônus" → 3h
3. **Catálogo com busca e filtros** (igual já fizemos no admin) → 5h
4. **Enriquecer as 5 fases do Método** com entrada/atividade/saída/critério → 2h
5. **robots.ts + schema FAQ nos produtos** → 1h

**Total: ~11h de trabalho concentrado.**

### ⚠️ O que faz sentido MAS exige cautela

6. **Unificar solutions/apps/ebooks** (Passo 2) — refatoração de dados que pode quebrar rotas existentes. Só fazer se houver motivo real (hoje funciona, mesmo que redundante).
7. **Cases com estrutura rica** (Passo 7) — só depois de validar que as métricas atuais (+342%, +6,2%) são reais e autorizadas.
8. **Acessibilidade AA + CSRF + rate limit** (Passo 12) — importante mas invisível pro usuário. Vale fazer mas não é urgente.

### ❌ O que NÃO faz sentido agora

9. **Testes E2E completos** (Passo 14) — projeto é solo, sem CI configurado, sem regressões recorrentes. Custo alto (8-12h), benefício baixo no curto prazo. Fazer só quando o projeto crescer.
10. **Refatorar tipagem de conteúdo** (Passo 2 completo) — o brief pede mas hoje o sistema funciona. Refatoração é débito técnico invisível.
11. **Páginas de detalhe padronizadas** (Passo 6 completo) — `/produtos/[slug]` já é bom o suficiente. Melhorar só se analytics mostrar drop-off nessas páginas.

---

## Recomendação final

**Implementar SIM, mas só os 5 itens de alta prioridade** (~11h de trabalho).

### Justificativa

O brief foi escrito como se o site fosse um portal genérico que precisa ser "transformado em experiência guiada". **A realidade é que o site JÁ É uma experiência guiada** — tem hero com 3 entradas, quiz com 6 perguntas, método em 5 fases, catálogo com galeria, biblioteca, cases, agendamento. 

O brief é um **checklist de boas práticas** mais do que um plano de ação. Os 14 passos descrevem o "estado ideal" — e o projeto já está em ~85% desse estado.

### O que NÃO fazer

- **Não refazer arquitetura**: o brief menciona "separar conteúdo de apresentação" mas hoje já usamos Supabase como CMS.
- **Não adicionar 4ª entrada no hero se não tiver destino real**: "Quero uma parceria" só faz sentido se `/criadores-parceiros` tiver conteúdo. Já tem? Sim. Então vale.
- **Não implementar testes E2E agora**: sem CI, sem time, sem regressões. É over-engineering.

### Plano de execução sugerido

**Sprint único (1 dia de trabalho):**
1. Hero: adicionar 4ª entrada "Quero uma parceria" → 30min
2. Quiz resultado: adicionar campos "não incluído", "prazo", "bônus" → 3h
3. Catálogo: adicionar busca + 3 filtros + estados vazios → 5h
4. Método: enriquecer 5 fases com entrada/saída → 2h
5. SEO: robots.ts + schema FAQ → 1h

**Opcional (sprint 2, se validar métricas):**
6. Cases: estrutura rica + filtros → 4h
7. Acessibilidade AA + CSRF → 5h
