import { createFileRoute } from "@tanstack/react-router";
import zipAsset from "@/assets/pack-imagens-premium.zip.asset.json";

const EXPECTED_URL = "/__l5e/assets-v1/3439e0ed-6242-4a15-af6a-5535c23c8913/pack-imagens-premium.zip";
const EXPECTED_SIZE = 15_696_404;
const EXPECTED_SHA256 = "001b227be01f7253f6e2cdab19972788e6af1c9a05a6b21d35d905b2e02decca";
const EXPECTED_CONTENT_TYPE = "application/zip";
const DOWNLOAD_NAME = "pack-imagens-premium.zip";

async function sha256Hex(bytes: ArrayBuffer) {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function getValidatedZip(request: Request, includeBody: boolean) {
  if (zipAsset.url !== EXPECTED_URL) {
    return new Response("Download indisponível: link do pacote não confere.", { status: 500 });
  }

  if (zipAsset.size !== EXPECTED_SIZE || zipAsset.content_type !== EXPECTED_CONTENT_TYPE) {
    return new Response("Download indisponível: metadados do ZIP não conferem.", { status: 500 });
  }

  const assetUrl = new URL(zipAsset.url, request.url);
  const assetResponse = await fetch(assetUrl, { method: includeBody ? "GET" : "HEAD" });

  if (!assetResponse.ok) {
    return new Response("Download indisponível: arquivo ZIP não encontrado.", { status: 502 });
  }

  const headerSize = Number(assetResponse.headers.get("content-length") ?? "0");
  if (headerSize > 0 && headerSize !== EXPECTED_SIZE) {
    return new Response("Download indisponível: tamanho do ZIP não confere.", { status: 502 });
  }

  const headers = new Headers({
    "content-type": EXPECTED_CONTENT_TYPE,
    "content-disposition": `attachment; filename="${DOWNLOAD_NAME}"`,
    "cache-control": "public, max-age=300",
    "x-content-type-options": "nosniff",
  });

  if (!includeBody) {
    headers.set("content-length", String(EXPECTED_SIZE));
    return new Response(null, { status: 200, headers });
  }

  const bytes = await assetResponse.arrayBuffer();
  if (bytes.byteLength !== EXPECTED_SIZE) {
    return new Response("Download indisponível: tamanho do ZIP não confere.", { status: 502 });
  }

  const hash = await sha256Hex(bytes);
  if (hash !== EXPECTED_SHA256) {
    return new Response("Download indisponível: assinatura do ZIP não confere.", { status: 502 });
  }

  headers.set("content-length", String(bytes.byteLength));
  headers.set("x-content-sha256", EXPECTED_SHA256);
  return new Response(bytes, { status: 200, headers });
}

export const Route = createFileRoute("/api/public/downloads/pack-imagens-premium.zip")({
  server: {
    handlers: {
      GET: async ({ request }) => getValidatedZip(request, true),
      HEAD: async ({ request }) => getValidatedZip(request, false),
    },
  },
});