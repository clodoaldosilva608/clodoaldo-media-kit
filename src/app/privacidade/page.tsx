import type { Metadata } from "next";
import { Header } from "@/components/media-kit/header";
import { Footer } from "@/components/media-kit/footer";

export const metadata: Metadata = {
  title: "Política de Privacidade (LGPD) | Clodoaldo Silva",
  description: "Como coletamos, usamos e protegemos seus dados pessoais conforme a LGPD.",
  alternates: { canonical: "https://clodoaldo-silva.lovable.app/privacidade" },
  openGraph: {
    title: "Política de Privacidade | Clodoaldo Silva",
    url: "https://clodoaldo-silva.lovable.app/privacidade",
  },
};

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="mx-auto max-w-3xl px-5 sm:px-8 pt-28 sm:pt-32 pb-20 flex-1">
        <div className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-primary">
          Institucional
        </div>
        <h1 className="mt-3 font-display font-medium text-3xl sm:text-5xl">
          Política de Privacidade
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Em conformidade com a Lei Geral de Proteção de Dados (Lei nº
          13.709/2018) · Última atualização: 28 de junho de 2026
        </p>

        <div className="mt-10 space-y-8 text-base text-foreground/90 leading-relaxed">
          <section>
            <h2 className="font-display font-medium text-xl mb-3">1. Controlador dos Dados</h2>
            <p>
              <strong>Clodoaldo Silva</strong>, responsável pelo site e pelos
              serviços oferecidos. Contato:{" "}
              <a
                href="mailto:clodoaldosilva608@gmail.com"
                className="text-primary underline"
              >
                clodoaldosilva608@gmail.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-display font-medium text-xl mb-3">2. Dados Coletados</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Dados de contato:</strong> nome e e-mail informados no
                processo de contratação.
              </li>
              <li>
                <strong>Dados de pagamento:</strong> processados diretamente pela
                Kiwify. Não armazenamos números de cartão.
              </li>
              <li>
                <strong>Dados de campanha:</strong> informações fornecidas no
                briefing (marca, produto, público-alvo, etc.).
              </li>
              <li>
                <strong>Dados de navegação:</strong> cookies técnicos e
                analytics anônimos para funcionamento e melhoria do site.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-medium text-xl mb-3">3. Finalidade do Tratamento</h2>
            <p>Utilizamos seus dados para:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Executar o serviço contratado</li>
              <li>Emitir nota fiscal</li>
              <li>Comunicação sobre o pedido</li>
              <li>Cumprimento de obrigações legais e contratuais</li>
              <li>Melhoria contínua do site e dos serviços</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-medium text-xl mb-3">4. Base Legal</h2>
            <p>
              O tratamento é realizado com base em: (i) execução de contrato;
              (ii) cumprimento de obrigação legal; e (iii) legítimo interesse,
              sempre respeitando os direitos do titular.
            </p>
          </section>

          <section>
            <h2 className="font-display font-medium text-xl mb-3">5. Compartilhamento</h2>
            <p>
              Compartilhamos dados apenas com provedores essenciais à operação:
              Kiwify (pagamentos), Vercel (hospedagem) e Supabase (banco de dados) e
              eventualmente contadores para emissão de nota fiscal. Não vendemos
              dados a terceiros.
            </p>
          </section>

          <section>
            <h2 className="font-display font-medium text-xl mb-3">6. Retenção</h2>
            <p>
              Mantemos seus dados pelo tempo necessário ao cumprimento das
              finalidades acima, observados os prazos legais (mínimo 5 anos para
              dados fiscais).
            </p>
          </section>

          <section>
            <h2 className="font-display font-medium text-xl mb-3">7. Seus Direitos (LGPD)</h2>
            <p>Você pode, a qualquer momento:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Confirmar a existência de tratamento</li>
              <li>Acessar seus dados</li>
              <li>Corrigir dados incompletos ou desatualizados</li>
              <li>Solicitar anonimização, bloqueio ou eliminação</li>
              <li>Solicitar portabilidade</li>
              <li>Revogar consentimento</li>
            </ul>
            <p className="mt-3">
              Basta enviar um e-mail para{" "}
              <a href="mailto:clodoaldosilva608@gmail.com" className="text-primary underline">
                clodoaldosilva608@gmail.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-display font-medium text-xl mb-3">8. Segurança</h2>
            <p>
              Adotamos medidas técnicas e organizacionais para proteger seus
              dados contra acesso não autorizado, perda ou alteração, incluindo
              criptografia em trânsito (HTTPS) e controle de acesso à base de
              dados.
            </p>
          </section>

          <section>
            <h2 className="font-display font-medium text-xl mb-3">9. Cookies</h2>
            <p>
              Utilizamos apenas cookies essenciais ao funcionamento do site e
              cookies analíticos anônimos. Você pode desativar cookies nas
              configurações do seu navegador.
            </p>
          </section>

          <section>
            <h2 className="font-display font-medium text-xl mb-3">10. Alterações</h2>
            <p>
              Esta política pode ser atualizada periodicamente. A data da última
              revisão aparece no topo desta página.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
