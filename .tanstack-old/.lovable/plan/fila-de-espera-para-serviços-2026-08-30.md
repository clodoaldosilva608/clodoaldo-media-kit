# Fila de espera para serviços

Serviços de aparição (Vídeo Dedicado, Menção Patrocinada, Série de Stories) e todos os Ghost Services passam a ter verificação de disponibilidade. Ao clicar em contratar, o cliente vai para uma página de fila, vê o número dele na fila e, abaixo, o botão para seguir ao checkout.

## Como vai funcionar

1. Nos cards de serviço, o botão passa a levar para `/fila/{servico}`.
2. A página da fila exige login. Visitante vê um aviso claro "Entre para reservar sua posição" com botão de acesso e volta para a fila depois de autenticar.
3. A página mostra:
   - Vagas do mês para aquele serviço (ex.: 4 de 4 ocupadas).
   - Posição do cliente na fila (ou "vaga disponível agora" quando ainda há espaço no mês).
   - Estimativa de início com base nas vagas mensais.
   - Botão "Continuar para o checkout" que abre o fluxo atual `/checkout/{servico}` com briefing, upsell e pagamento.
4. Cada cliente tem uma única posição por serviço: ao voltar à página, ele vê a mesma posição, não uma nova.
5. Depois do pagamento aprovado, a inscrição na fila é marcada como confirmada (via webhook do Stripe, ligando pedido e posição).

## Capacidade

Cada serviço tem um limite de vagas por mês, configurável no banco (valor inicial sugerido: Vídeo Dedicado 4, Menção Patrocinada 8, Série de Stories 6, Ghost Services 20 cada). A posição na fila é calculada contando as inscrições ativas do mês corrente daquele serviço criadas antes da do cliente.

## Detalhes técnicos

Banco (migração):
- `service_capacity`: `service_slug` (PK), `monthly_slots`, `active`, timestamps. Leitura pública (`anon`/`authenticated`), escrita apenas `service_role`.
- `service_queue`: `id`, `service_slug`, `user_id`, `cycle_month` (date, primeiro dia do mês), `position`, `status` (`waiting` | `checkout_started` | `paid` | `cancelled`), `order_id` nullable, timestamps. Índice único `(service_slug, user_id, cycle_month)`.
- RLS: `SELECT`/`INSERT` apenas do próprio `user_id`; `UPDATE` de status só por `service_role`. GRANTs explícitos para `authenticated` e `service_role`.
- Função security definer `service_queue_join(_slug text)`: insere ou retorna a linha existente do usuário no ciclo atual, calcula `position` de forma atômica e devolve `{ position, monthly_slots, taken, available_now }`.

Backend:
- `src/lib/queue.functions.ts` com `joinServiceQueue` (protegida por `requireSupabaseAuth`, chama a RPC) e `getQueueStatus` para leitura.
- `checkout.functions.ts`: aceita `queue_id` opcional, valida que pertence ao usuário/serviço e grava `order_id` na fila, marcando `checkout_started`.
- Webhook Stripe: ao confirmar pagamento de um pedido com fila vinculada, atualiza o status para `paid`.

Frontend:
- Nova rota pública `src/routes/fila.$service.tsx` (head próprio, `noindex`), com estados: carregando, não autenticado, posição confirmada, serviço sem fila.
- `services.tsx` e demais CTAs de serviço apontam para `/fila/$service`; e-books e packs continuam indo direto ao checkout.
- `/checkout/$service` aceita `?queue=<id>` e o repassa na criação da sessão; sem fila válida para serviço que exige fila, redireciona de volta a `/fila/$service`.
