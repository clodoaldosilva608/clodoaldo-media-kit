const { createClient } = require('/home/z/my-project/node_modules/@supabase/supabase-js');
const sb = createClient('https://jckkbsluvbejioyrlcfo.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impja2tic2x1dmJlamlveXJsY2ZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODIzMDI1OSwiZXhwIjoyMTAzODA2MjU5fQ.tj40ph8vsTCt10-knSs7-wdlsROwZCBXgaQUaAiVWeg');

// Mapeamento por slug: prazo indicativo, exclusions, bonus
const OFFER_DATA = {
  'combo-completo': {
    indicative_timeline: '15-30 dias (conforme escopo completo)',
    exclusions: [
      'Tráfego pago (Google/Meta Ads) — pode ser orçado à parte',
      'Produção de conteúdo orgânico contínuo após o lançamento',
      'Manutenção mensal do site/aplicativo (fora do período de garantia)',
    ],
    bonus: [
      'Auditoria completa do seu digital atual (valor R$350)',
      '1 mês de suporte WhatsApp após lançamento',
      'Acesso à Biblioteca Digital premium por 30 dias',
    ],
  },
  'video-dedicado': {
    indicative_timeline: '7-10 dias úteis',
    exclusions: [
      'Locação de estúdio ou equipamento extra (se necessário)',
      'Ator/modelo profissional (pode ser orçado à parte)',
      'Edição de versões alternativas além das combinadas',
    ],
    bonus: [
      '2 versões cortadas pra Reels + Stories',
      'Legenda automática inclusa',
      '1 rodada de ajuste sem custo',
    ],
  },
  'mencoes-patrocinadas': {
    indicative_timeline: '5-7 dias úteis',
    exclusions: [
      'Veiculação paga (Boost/Meta Ads) — é por sua conta',
      'Garantia de alcance específico (depende do algoritmo)',
      'Repost no seu perfil (precisa de aprovação prévia)',
    ],
    bonus: [
      'Story com link swipe-up (se perfil elegível)',
      'Preview pra aprovação antes de publicar',
      'Arquivo original em alta resolução',
    ],
  },
  'serie-stories': {
    indicative_timeline: '3-5 dias úteis',
    exclusions: [
      'Veiculação paga (Stories Ads)',
      'Produção de vídeo ao vivo (precisa de agenda)',
      'Edição após publicação ( Stories somem em 24h)',
    ],
    bonus: [
      '1 Story extra de bônus',
      'Cards estáticos pra feed inclusos',
      'Roteiro escrito pra você reaproveitar',
    ],
  },
  'roteiro-estrategico': {
    indicative_timeline: '3-5 dias úteis',
    exclusions: [
      'Gravação do vídeo (só roteiro, não inclui filmagem)',
      'Edição do conteúdo final',
      'Implementação da estratégia (você executa ou contrata edição à parte)',
    ],
    bonus: [
      '3 variações de gancho pra testar',
      'Lista de ideias pra próximos 5 vídeos',
      '1 revisão de roteiro pra ajustar tom',
    ],
  },
  'edicao-viral': {
    indicative_timeline: '2-4 dias úteis por vídeo',
    exclusions: [
      'Filmagem do material bruto (vê deve enviar)',
      'Locução profissional (pode ser orçado à parte)',
      'Legendas em outros idiomas (inglês/espanhol = orçamento extra)',
    ],
    bonus: [
      'Versão cortada pra Reels (9:16) inclusa',
      'Legenda automática em português',
      '1 rodada de ajuste por vídeo',
    ],
  },
  'auditoria-de-perfil': {
    indicative_timeline: '2-3 dias úteis',
    exclusions: [
      'Implementação das mudanças (auditoria é diagnóstico, não execução)',
      'Análise de concorrentes específicos (orçado à parte)',
      'Gestão da conta após entrega do relatório',
    ],
    bonus: [
      'Plano de ação priorizado (o que fazer primeiro)',
      '5 ideias de conteúdo pra começar hoje',
      '1 call de 15min pra tirar dúvidas do relatório',
    ],
  },
  'pack-criativos': {
    indicative_timeline: '5-7 dias úteis',
    exclusions: [
      'Veiculação paga (Meta/Google Ads)',
      'Variações além das combinadas (cada extra = orçamento à parte)',
      'Vídeo animado complexo (motion design avançado = extra)',
    ],
    bonus: [
      '1 criativo extra de bônus',
      'Arquivos em 3 formatos (feed, story, banner)',
      'Versão editável (PSD/Canva) inclusa',
    ],
  },
  'biblioteca-digital': {
    indicative_timeline: 'Acesso imediato após confirmação',
    exclusions: [
      'Mentoria individual (disponível em planos superiores)',
      'Atualizações de e-books já adquiridos (cada versão é única)',
      'Direito de revenda ou distribuição (uso pessoal apenas)',
    ],
    bonus: [
      'Acesso a atualizações por 12 meses',
      'Templates editáveis em Canva',
      'Grupo no WhatsApp pra dúvidas',
    ],
  },
  'ecossistema-apps': {
    indicative_timeline: 'Acesso imediato (apps gratuitos) / 1-3 dias (assinatura)',
    exclusions: [
      'Personalização de código-fonte (apps são usados como estão)',
      'Hospedagem própria (incluída apenas em planos pagos)',
      'Suporte 24/7 (suporte é por WhatsApp, horário comercial)',
    ],
    bonus: [
      '1 mês grátis em planos de assinatura',
      'Acesso a novos apps antes do público',
      'Tutorial de uso incluso',
    ],
  },
  'site-institucional': {
    indicative_timeline: '10-15 dias úteis',
    exclusions: [
      'Manutenção mensal (fora do período de garantia de 15 dias)',
      'Hospedagem e domínio após o 1º ano',
      'Integração com sistemas internos (ERP/CRM = orçamento extra)',
    ],
    bonus: [
      '1º ano de hospedagem grátis',
      'SEO local básico configurado',
      'Treinamento de 30min pra você editar conteúdo',
    ],
  },
  'landing-page-conversao': {
    indicative_timeline: '5-7 dias úteis',
    exclusions: [
      'Tráfego pago (Meta/Google Ads) — orçado à parte',
      'Copywriting avançado (pode ser contratado como extra)',
      'A/B testing contínuo (1 versão inclusa, testes extras = orçamento)',
    ],
    bonus: [
      'Pixel de conversão configurado (Meta/Google)',
      '1 rodada de ajuste pós-lançamento',
      'Guia de como rodar tráfego pago na página',
    ],
  },
  'facepage-campanha': {
    indicative_timeline: '5-8 dias úteis',
    exclusions: [
      'Gestão da campanha paga (orçamento de mídia é por sua conta)',
      'Manutenção após o período de campanha',
      'Design de peças extras além das combinadas',
    ],
    bonus: [
      '1 variação de criativo pra teste A/B',
      'Pixel de conversão configurado',
      'Relatório simples de performance pós-campanha',
    ],
  },
  'projeto-sob-medida': {
    indicative_timeline: 'A definir após diagnóstico (geralmente 15-45 dias)',
    exclusions: [
      'Escopo não definido no diagnóstico (cada extra = orçamento à parte)',
      'Manutenção após garantia de 15 dias',
      'Integrações com sistemas proprietários (orçadas separadamente)',
    ],
    bonus: [
      'Diagnóstico gratuito de 30min',
      'Documentação técnica completa entregue',
      '1 mês de suporte WhatsApp pós-lançamento',
    ],
  },
};

async function populateOffers() {
  console.log('Populando 14 ofertas com exclusions, indicative_timeline e bonus...\n');

  for (const [slug, data] of Object.entries(OFFER_DATA)) {
    const { error } = await sb.from('offers').update({
      indicative_timeline: data.indicative_timeline,
      exclusions: data.exclusions,
      bonus: data.bonus,
    }).eq('slug', slug);

    if (error) {
      console.log(`✗ ${slug}: ${error.message}`);
    } else {
      console.log(`✓ ${slug}`);
      console.log(`  prazo: ${data.indicative_timeline}`);
      console.log(`  exclusions: ${data.exclusions.length} itens`);
      console.log(`  bonus: ${data.bonus.length} itens`);
    }
  }

  // Verificação final
  console.log('\n--- Verificação ---');
  const { data: verify } = await sb.from('offers')
    .select('slug, name, indicative_timeline')
    .eq('active', true)
    .order('order_index', { ascending: true });

  const populated = (verify || []).filter(o => o.indicative_timeline).length;
  console.log(`\n${populated} de ${verify?.length || 0} ofertas com dados preenchidos`);
}

populateOffers().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
