import type { Metadata } from "next";
import { Header } from "@/components/media-kit/header";
import { Footer } from "@/components/media-kit/footer";

export const metadata: Metadata = {
  title: "Termos de Serviço | Clodoaldo Silva",
  description: "Termos de uso e condições de contratação dos serviços de Clodoaldo Silva.",
  alternates: { canonical: "https://clodoaldo-silva.lovable.app/termos" },
  openGraph: {
    title: "Termos de Serviço | Clodoaldo Silva",
    url: "https://clodoaldo-silva.lovable.app/termos",
  },
};

export default function TermosPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="mx-auto max-w-3xl px-5 sm:px-8 pt-28 sm:pt-32 pb-20 flex-1">
        <div className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-primary">
          Institucional
        </div>
        <h1 className="mt-3 font-display font-medium text-3xl sm:text-5xl">
          Termos de Serviço
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Última atualização: 28 de junho de 2026
        </p>

        <div className="prose-content mt-10 space-y-8 text-base text-foreground/90 leading-relaxed">
          <section>
            <h2 className="font-display font-medium text-xl mb-3">1. Aceitação dos Termos</h2>
            <p>
              Ao contratar qualquer serviço oferecido por Clodoaldo Silva
              ("Prestador"), o contratante ("Cliente") declara ter lido,
              compreendido e aceito integralmente estes Termos de Serviço.
            </p>
          </section>

          <section>
            <h2 className="font-display font-medium text-xl mb-3">2. Serviços Oferecidos</h2>
            <p>
              O Prestador oferece serviços de marketing de influência digital,
              incluindo: vídeos dedicados (TikTok/Reels), menções patrocinadas,
              séries de stories, presença em eventos e combos personalizados,
              conforme descrito em site.
            </p>
          </section>

          <section>
            <h2 className="font-display font-medium text-xl mb-3">3. Contratação e Pagamento</h2>
            <p>
              A contratação ocorre via site, com pagamento processado pela
              plataforma Kiwify. O serviço é considerado contratado após a
              confirmação do pagamento. O Cliente é responsável pela veracidade
              das informações fornecidas no briefing.
            </p>
          </section>

          <section>
            <h2 className="font-display font-medium text-xl mb-3">4. Prazo de Entrega</h2>
            <p>
              O prazo padrão de entrega é de até <strong>72 horas úteis</strong>
              após a confirmação do pagamento e a aprovação final do briefing.
              Prazos diferenciados podem ser acordados previamente.
            </p>
          </section>

          <section>
            <h2 className="font-display font-medium text-xl mb-3">5. Alterações e Aprovação</h2>
            <p>
              Cada contratação inclui 1 (uma) rodada de ajustes gratuitos após a
              entrega inicial. Ajustes adicionais podem ser cobrados separadamente,
              mediante acordo.
            </p>
          </section>

          <section>
            <h2 className="font-display font-medium text-xl mb-3">6. Cancelamento e Reembolso</h2>
            <p>
              Cancelamentos solicitados em até 24 horas após a compra e antes do
              início da produção têm direito a reembolso integral. Após o início
              da produção, o valor pago será convertido em crédito para uso em
              campanhas futuras.
            </p>
          </section>

          <section>
            <h2 className="font-display font-medium text-xl mb-3">7. Direitos de Uso</h2>
            <p>
              O conteúdo produzido permanece publicado nas redes sociais do
              Prestador. O Cliente pode repostar o material em seus próprios
              canais, com os devidos créditos. Uso comercial em mídia paga requer
              acordo específico.
            </p>
          </section>

          <section>
            <h2 className="font-display font-medium text-xl mb-3">8. Conteúdo Restrito</h2>
            <p>
              O Prestador se reserva o direito de recusar campanhas que envolvam
              produtos/serviços ilegais, ofensivos, discriminatórios ou
              incompatíveis com seus valores.
            </p>
          </section>

          <section>
            <h2 className="font-display font-medium text-xl mb-3">9. Limitação de Responsabilidade</h2>
            <p>
              O Prestador não garante resultados específicos de vendas,
              conversões ou engajamento. O sucesso da campanha depende de
              múltiplos fatores externos ao serviço prestado.
            </p>
          </section>

          <section>
            <h2 className="font-display font-medium text-xl mb-3">10. Foro</h2>
            <p>
              Estes Termos são regidos pela legislação brasileira. Fica eleito o
              foro da comarca do domicílio do Prestador para dirimir quaisquer
              controvérsias.
            </p>
          </section>

          <section>
            <h2 className="font-display font-medium text-xl mb-3">11. Contato</h2>
            <p>
              Para dúvidas, entre em contato pelo e-mail{" "}
              <a
                href="mailto:clodoaldosilva608@gmail.com"
                className="text-primary underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              >
                clodoaldosilva608@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
