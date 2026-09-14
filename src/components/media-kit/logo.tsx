import { ASSETS } from "@/lib/asset-urls";

/**
 * Logo — imagem branca com detalhes laranja (clara por design).
 *
 * Em modo ESCURO: a logo aparece naturalmente (branco sobre fundo escuro).
 * Em modo CLARO: adiciona um background escuro arredondado pra garantir contraste.
 *
 * O fundo escuro só aparece em modo claro via CSS `html.light .logo-wrap`.
 */
export function Logo({
  className,
  loading = "eager",
}: {
  className?: string;
  loading?: "eager" | "lazy";
}) {
  return (
    <span
      className="logo-wrap inline-flex items-center justify-center rounded-lg"
      style={{ lineHeight: 0 }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ASSETS.clodoaldoLogo}
        alt="Clodoaldo Silva"
        className={className}
        width={512}
        height={512}
        loading={loading}
        decoding="async"
      />
    </span>
  );
}
