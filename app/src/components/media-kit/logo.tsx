import logoAsset from "@/assets/clodoaldo-logo.png.asset.json";

export function Logo({
  className,
  loading = "eager",
}: {
  className?: string;
  loading?: "eager" | "lazy";
}) {
  return (
    <img
      src={logoAsset.url}
      alt="Clodoaldo Silva"
      className={className}
      width={512}
      height={512}
      loading={loading}
      decoding="async"
    />
  );
}
