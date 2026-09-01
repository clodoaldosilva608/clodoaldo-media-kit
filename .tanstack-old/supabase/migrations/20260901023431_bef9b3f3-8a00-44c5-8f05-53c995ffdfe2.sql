-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "users read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "admins read all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Offers catalog
CREATE TABLE public.offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'geral',
  price_label text NOT NULL DEFAULT 'Sob consulta',
  description text NOT NULL DEFAULT '',
  cta_label text NOT NULL DEFAULT 'Saber mais',
  cta_href text NOT NULL DEFAULT '/#contato',
  audience text NOT NULL DEFAULT '',
  deliverables jsonb NOT NULL DEFAULT '[]'::jsonb,
  entry_level integer NOT NULL DEFAULT 3,
  active boolean NOT NULL DEFAULT true,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.offers TO anon, authenticated;
GRANT ALL ON public.offers TO service_role;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "active offers are public" ON public.offers
  FOR SELECT USING (active = true);
CREATE POLICY "admins manage offers" ON public.offers
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Quiz rules
CREATE TABLE public.quiz_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id text NOT NULL,
  answer_value text NOT NULL,
  offer_slug text NOT NULL,
  weight numeric NOT NULL DEFAULT 1,
  priority integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX quiz_rules_lookup_idx ON public.quiz_rules (question_id, answer_value);

GRANT SELECT ON public.quiz_rules TO anon, authenticated;
GRANT ALL ON public.quiz_rules TO service_role;
ALTER TABLE public.quiz_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "active rules are public" ON public.quiz_rules
  FOR SELECT USING (active = true);
CREATE POLICY "admins manage rules" ON public.quiz_rules
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Quiz sessions
CREATE TABLE public.quiz_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  source text NOT NULL DEFAULT 'site',
  track text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  device_type text NOT NULL DEFAULT 'unknown'
);

GRANT ALL ON public.quiz_sessions TO service_role;
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read sessions" ON public.quiz_sessions
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.quiz_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
  question_id text NOT NULL,
  answer_value text NOT NULL,
  answer_label text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, question_id)
);

GRANT ALL ON public.quiz_answers TO service_role;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read answers" ON public.quiz_answers
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.quiz_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL UNIQUE REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
  profile_key text NOT NULL DEFAULT 'geral',
  profile_label text NOT NULL DEFAULT '',
  primary_offer_slug text NOT NULL,
  secondary_offer_slug text,
  score_breakdown jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.quiz_results TO service_role;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read results" ON public.quiz_results
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Quiz leads
CREATE TABLE public.quiz_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.quiz_sessions(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  consent_contact boolean NOT NULL DEFAULT false,
  consent_at timestamptz,
  preferred_channel text NOT NULL DEFAULT 'email',
  source text NOT NULL DEFAULT 'quiz',
  recommended_offer_slug text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX quiz_leads_email_session_idx
  ON public.quiz_leads (lower(email), COALESCE(session_id, '00000000-0000-0000-0000-000000000000'::uuid));

GRANT ALL ON public.quiz_leads TO service_role;
ALTER TABLE public.quiz_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read quiz leads" ON public.quiz_leads
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Service requests (briefings)
CREATE TABLE public.service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES public.quiz_leads(id) ON DELETE SET NULL,
  session_id uuid REFERENCES public.quiz_sessions(id) ON DELETE SET NULL,
  offer_slug text NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  company text,
  current_url text,
  goal text NOT NULL DEFAULT '',
  budget_range text,
  deadline text,
  notes text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.service_requests TO service_role;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read service requests" ON public.service_requests
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update service requests" ON public.service_requests
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Analytics events
CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name text NOT NULL,
  session_id uuid REFERENCES public.quiz_sessions(id) ON DELETE SET NULL,
  offer_slug text,
  path text,
  props jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX analytics_events_name_idx ON public.analytics_events (event_name, created_at DESC);

GRANT ALL ON public.analytics_events TO service_role;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read analytics" ON public.analytics_events
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- updated_at triggers (reuse existing helper)
CREATE TRIGGER offers_touch BEFORE UPDATE ON public.offers
  FOR EACH ROW EXECUTE FUNCTION public.knowledge_touch_updated_at();
CREATE TRIGGER quiz_rules_touch BEFORE UPDATE ON public.quiz_rules
  FOR EACH ROW EXECUTE FUNCTION public.knowledge_touch_updated_at();
CREATE TRIGGER quiz_sessions_touch BEFORE UPDATE ON public.quiz_sessions
  FOR EACH ROW EXECUTE FUNCTION public.knowledge_touch_updated_at();
CREATE TRIGGER quiz_answers_touch BEFORE UPDATE ON public.quiz_answers
  FOR EACH ROW EXECUTE FUNCTION public.knowledge_touch_updated_at();
CREATE TRIGGER quiz_results_touch BEFORE UPDATE ON public.quiz_results
  FOR EACH ROW EXECUTE FUNCTION public.knowledge_touch_updated_at();
CREATE TRIGGER quiz_leads_touch BEFORE UPDATE ON public.quiz_leads
  FOR EACH ROW EXECUTE FUNCTION public.knowledge_touch_updated_at();
CREATE TRIGGER service_requests_touch BEFORE UPDATE ON public.service_requests
  FOR EACH ROW EXECUTE FUNCTION public.knowledge_touch_updated_at();

-- Seed offers
INSERT INTO public.offers (slug, name, category, price_label, description, cta_label, cta_href, audience, deliverables, entry_level, order_index) VALUES
('combo-completo','Combo Completo','influencia','A partir de R$ 2.500','Pacote de divulgação com vídeo dedicado, menção e stories para campanhas de alcance e autoridade.','Contratar este serviço','/checkout/combo-completo','Marcas que precisam de alcance, autoridade e volume de impressões','["Vídeo dedicado","Menção patrocinada","Série de stories","Relatório de performance"]'::jsonb,5,10),
('video-dedicado','Vídeo Dedicado','influencia','A partir de R$ 1.200','Vídeo exclusivo sobre a sua marca, com roteiro alinhado ao posicionamento.','Contratar este serviço','/fila/video-dedicado','Marcas que precisam de apresentação profunda do produto','["Roteiro","Gravação","Edição","Publicação"]'::jsonb,4,20),
('mencoes-patrocinadas','Menção Patrocinada','influencia','A partir de R$ 600','Inserção da marca em conteúdo já planejado, com contexto natural.','Contratar este serviço','/fila/mencoes-patrocinadas','Marcas buscando presença recorrente com investimento moderado','["Menção em vídeo","Link na descrição"]'::jsonb,3,30),
('serie-stories','Série de Stories','influencia','A partir de R$ 500','Sequência de stories com narrativa de descoberta, prova e chamada para ação.','Contratar este serviço','/fila/serie-stories','Campanhas de conversão rápida e lançamentos curtos','["Sequência de stories","CTA com link"]'::jsonb,3,40),
('roteiro-estrategico','Roteiro Estratégico','ghost','A partir de R$ 300','Roteiro construído para o seu tema, formato e objetivo de conteúdo.','Contratar este serviço','/checkout/roteiro-estrategico','Creators que gravam o próprio conteúdo e precisam de direção','["Roteiro completo","Ganchos alternativos","Orientações de gravação"]'::jsonb,2,50),
('edicao-viral','Edição Viral','ghost','A partir de R$ 400','Edição de vídeos brutos com ritmo, legendas e cortes de retenção.','Contratar este serviço','/checkout/edicao-viral','Creators com material gravado e pouca disponibilidade para editar','["Edição","Legendas","Trilha e efeitos"]'::jsonb,2,60),
('auditoria-de-perfil','Auditoria de Perfil','ghost','A partir de R$ 350','Diagnóstico de bio, oferta, posicionamento e consistência de conteúdo.','Contratar este serviço','/fila/auditoria-de-perfil','Perfis com baixa clareza, autoridade ou conversão','["Análise de perfil","Plano de ajustes","Recomendações de conteúdo"]'::jsonb,2,70),
('pack-criativos','Pack de Criativos','ghost','A partir de R$ 250','Conjunto de criativos prontos para anúncios e publicações.','Contratar este serviço','/checkout/pack-criativos','Quem precisa começar com investimento baixo','["Criativos editáveis","Variações de copy"]'::jsonb,1,80),
('biblioteca-digital','Biblioteca Digital','produto','Gratuito e pago','E-books e materiais para quem quer aprender e executar por conta própria.','Explorar a biblioteca','/biblioteca','Orçamento inicial e intenção de aprender','["E-books","Packs de prompts","Checklists"]'::jsonb,1,90),
('ecossistema-apps','Ecossistema de Apps','produto','Gratuito e assinatura','Aplicativos próprios para testar, usar e apoiar.','Explorar os apps','/apps','Quem quer conhecer ou apoiar produtos digitais','["Acesso aos apps","Demonstrações","Apoio ao desenvolvimento"]'::jsonb,1,100),
('site-institucional','Site Institucional','web','Sob consulta','Site de autoridade com arquitetura clara, copy objetiva e publicação assistida.','Quero um site profissional','/briefing?oferta=site-institucional','Profissionais, empresas e marcas que precisam de presença digital','["Arquitetura de páginas","Copy orientada a clareza","Design responsivo","SEO básico","Formulário de contato","Integração com WhatsApp","Publicação e orientação inicial"]'::jsonb,4,110),
('landing-page-conversao','Landing Page de Conversão','web','Sob consulta','Página focada em uma única ação, construída para converter tráfego em contato ou venda.','Quero uma página que converta','/briefing?oferta=landing-page-conversao','Serviços, produtos digitais, lançamentos e campanhas','["Headline e proposta de valor","Benefícios e prova","Tratamento de objeções","CTA e formulário","Integração com WhatsApp","Analytics","Publicação"]'::jsonb,4,120),
('facepage-campanha','Facepage / Página de Campanha','web','Sob consulta','Página enxuta de campanha, pensada para tráfego pago e oferta direta.','Quero estruturar minha campanha','/briefing?oferta=facepage-campanha','Campanhas com tráfego pago ou oferta direta','["Estrutura enxuta","Copy de campanha","Blocos de conversão","Pixel e analytics","Captura de lead","Integração com canal de atendimento"]'::jsonb,4,130),
('projeto-sob-medida','Projeto Sob Medida','web','Sob consulta','Desenvolvimento de área logada, painel, automação, MVP ou aplicativo.','Falar sobre meu projeto','/briefing?oferta=projeto-sob-medida','Empresas que precisam de produto digital próprio','["Diagnóstico","Escopo técnico","Protótipo","Desenvolvimento","Testes","Publicação","Suporte inicial"]'::jsonb,5,140);

-- Seed quiz rules
INSERT INTO public.quiz_rules (question_id, answer_value, offer_slug, weight, priority) VALUES
('objetivo','divulgar-marca','combo-completo',1.0,10),
('objetivo','divulgar-marca','video-dedicado',0.8,9),
('objetivo','divulgar-marca','mencoes-patrocinadas',0.6,8),
('objetivo','divulgar-marca','serie-stories',0.6,8),
('objetivo','vender-produto','landing-page-conversao',1.0,10),
('objetivo','vender-produto','combo-completo',0.5,5),
('objetivo','melhorar-conteudo','roteiro-estrategico',1.0,10),
('objetivo','melhorar-conteudo','edicao-viral',0.8,9),
('objetivo','melhorar-conteudo','auditoria-de-perfil',0.6,7),
('objetivo','criar-site','site-institucional',1.0,10),
('objetivo','criar-site','landing-page-conversao',0.5,6),
('objetivo','captar-leads','facepage-campanha',1.0,10),
('objetivo','captar-leads','landing-page-conversao',0.9,9),
('objetivo','lancar-produto-digital','landing-page-conversao',0.9,9),
('objetivo','lancar-produto-digital','projeto-sob-medida',0.8,8),
('objetivo','explorar-apps','ecossistema-apps',1.0,10),
('estagio','apenas-ideia','projeto-sob-medida',0.7,6),
('estagio','apenas-ideia','biblioteca-digital',0.6,5),
('estagio','oferta-sem-pagina','landing-page-conversao',1.0,10),
('estagio','pagina-converte-pouco','landing-page-conversao',0.9,9),
('estagio','pagina-converte-pouco','facepage-campanha',0.6,6),
('estagio','publico-conteudo','roteiro-estrategico',0.8,8),
('estagio','publico-conteudo','edicao-viral',0.7,7),
('estagio','tenho-audiencia','combo-completo',0.7,7),
('estagio','trafego-pago','facepage-campanha',1.0,10),
('estagio','operacao-funcionando','projeto-sob-medida',0.8,8),
('estagio','operacao-funcionando','combo-completo',0.6,6),
('gargalo','falta-clareza','auditoria-de-perfil',1.0,10),
('gargalo','falta-clareza','site-institucional',0.5,5),
('gargalo','falta-autoridade','site-institucional',0.9,9),
('gargalo','falta-autoridade','auditoria-de-perfil',0.7,7),
('gargalo','pouco-alcance','combo-completo',1.0,10),
('gargalo','pouco-alcance','video-dedicado',0.7,7),
('gargalo','baixa-conversao','landing-page-conversao',1.0,10),
('gargalo','baixa-conversao','facepage-campanha',0.7,7),
('gargalo','falta-conteudo','edicao-viral',0.9,9),
('gargalo','falta-conteudo','roteiro-estrategico',0.9,9),
('gargalo','falta-estrutura-tecnica','projeto-sob-medida',1.0,10),
('gargalo','falta-estrutura-tecnica','site-institucional',0.7,7),
('gargalo','falta-tempo','edicao-viral',0.8,8),
('gargalo','falta-tempo','projeto-sob-medida',0.5,5),
('gargalo','orcamento-limitado','biblioteca-digital',1.0,10),
('gargalo','orcamento-limitado','pack-criativos',0.9,9),
('urgencia','o-quanto-antes','landing-page-conversao',0.5,5),
('urgencia','o-quanto-antes','facepage-campanha',0.5,5),
('urgencia','ate-30-dias','site-institucional',0.4,4),
('urgencia','1-a-3-meses','projeto-sob-medida',0.5,5),
('urgencia','pesquisando','biblioteca-digital',0.6,6),
('investimento','ate-300','biblioteca-digital',1.0,10),
('investimento','ate-300','pack-criativos',0.9,9),
('investimento','301-1000','roteiro-estrategico',0.9,9),
('investimento','301-1000','edicao-viral',0.8,8),
('investimento','301-1000','auditoria-de-perfil',0.8,8),
('investimento','1001-3000','landing-page-conversao',0.9,9),
('investimento','1001-3000','site-institucional',0.8,8),
('investimento','1001-3000','video-dedicado',0.7,7),
('investimento','acima-3000','combo-completo',1.0,10),
('investimento','acima-3000','projeto-sob-medida',0.9,9);