import { ASSETS } from "@/lib/asset-urls";

export function Logo({
  className,
  loading = "eager",
}: {
  className?: string;
  loading?: "eager" | "lazy";
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={ASSETS.clodoaldoLogo}
      alt="Clodoaldo Silva"
      className={className}
      width={512}
      height={512}
      loading={loading}
      decoding="async"
    />
  );
}
