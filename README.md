# Clodoaldo Silva — Media Kit 2026

Site oficial do Media Kit do Clodoaldo Silva: parcerias, Ghost Services, e-books e ecossistema de apps.

## Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Linguagem**: TypeScript 5
- **UI**: [Tailwind CSS 4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com/) + [lucide-react](https://lucide.dev/)
- **Carousel**: [embla-carousel-react](https://www.embla-carousel.com/) + autoplay
- **Fonts**: [Newsreader](https://fonts.google.com/specimen/Newsreader) (display) + [Inter Tight](https://fonts.google.com/specimen/Inter+Tight) (sans)
- **Database**: Supabase (projeto `jwcijrezydupifcdtvqh`)
- **Payments**: Stripe (BRL, mode test)

## Começando

```bash
# Instalar dependências
bun install

# Rodar em desenvolvimento (porta 3000)
bun run dev

# Build de produção
bun run build

# Lint
bun run lint
```

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

```bash
cp .env.example .env.local
```

| Variável | Onde obter |
|---|---|
| `SUPABASE_PUBLISHABLE_KEY` | Supabase Dashboard → Project Settings → API → `anon` `public` key |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API keys → `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Rodar `stripe listen --forward to localhost:3000/api/stripe-webhook` (imprime `whsec_...`) |

## Estrutura

```
src/
├── app/                          # App Router (Next.js 16)
│   ├── layout.tsx                # Layout raiz (PT-BR, fonts, metadata)
│   ├── page.tsx                  # Home (Media Kit completo)
│   ├── globals.css               # Tailwind 4 + paleta bronze OKLCH + utilities
│   └── api/                      # API routes (a portar)
├── components/
│   ├── media-kit/                # 14 seções da home
│   ├── apps/                     # Carousel + preview modal de apps
│   └── ui/                       # shadcn/ui components
├── hooks/
│   └── use-reveal.ts             # Reveal on scroll com IntersectionObserver
└── lib/
    ├── services-catalog.ts       # 16 serviços (4 parcerias + 4 ghost + 8 e-books)
    ├── apps-catalog.ts           # 50 apps em 8 categorias
    └── asset-urls.ts             # Mapeamento slug → URL pública (auto-gerado)

public/assets/                    # 89 assets estáticos (logos, capas, PDFs, ZIP)
```

## Seções da home

1. **Hero** — retrato + headline animada em 3 linhas
2. **Métricas** — 4 KPIs com count-up
3. **Audiência** — gênero, faixa etária, interesses
4. **Serviços** — 8 cards (parcerias + ghost services)
5. **Biblioteca preview** — 4 e-books em destaque
6. **Ecossistema** — 50 apps em 8 categorias + carousel premium
7. **Cases** — 3 cases de sucesso
8. **YouTube** — CTA para canal
9. **Pricing** — 8 formatos com preços
10. **Contato** — form mailto + redes sociais

## Paleta

Editorial dark em OKLCH:

- `--background`: `oklch(0.15 0.004 60)` (graphite matte)
- `--foreground`: `oklch(0.96 0.006 80)` (off-white)
- `--primary`: `oklch(0.75 0.088 62)` (bronze desaturated)
- `--gradient-orange`: gradient bronze para CTAs
- `--shadow-glow`: inset highlight para botões

## Rotas pendentes (a portar do TanStack original)

- `/sobre`, `/termos`, `/privacidade`, `/faq`
- `/auth`
- `/biblioteca`, `/apps`, `/knowledge`, `/knowledge/[slug]`, `/knowledge/[slug]/[chapter]`
- `/fila/[service]`, `/checkout/[service]`, `/checkout/sucesso`, `/checkout/cancelado`
- `/apoiar/[app]`, `/criadores-parceiros`
- `/sitemap.xml`
- `POST /api/stripe-webhook`
- `GET /api/public/downloads/pack-imagens-premium.zip`

## Licença

Código privado — © Clodoaldo Silva. Todos os direitos reservados.
