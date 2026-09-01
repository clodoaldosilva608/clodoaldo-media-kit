#!/usr/bin/env python3
"""
Baixa todos os assets do Lovable para /home/z/my-project/public/assets
e gera um mapeamento slug -> URL local para ser usado no Next.js.

Estratégia:
- Lê cada .asset.json
- Baixa a imagem da URL `https://clodoaldo-silva.lovable.app{url}`
- Salva em public/assets/<slug><ext>
- Gera /home/z/my-project/src/lib/asset-urls.ts com todos os mapeamentos
"""
import json
import os
import re
import sys
import urllib.request
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

ASSET_DIR = Path("/home/z/my-project/upload/codigo-01/src/assets")
PUBLIC_DIR = Path("/home/z/my-project/public")
OUT_DIR = PUBLIC_DIR / "assets"
OUT_DIR.mkdir(parents=True, exist_ok=True)

LOVABLE_BASE = "https://clodoaldo-silva.lovable.app"

# Coleta todos os .asset.json
asset_files = sorted(ASSET_DIR.rglob("*.asset.json"))
print(f"Encontrados {len(asset_files)} assets")

# Mapeia asset_id -> { original_path_in_src, dest_url_in_public }
mapping = {}

def download_one(asset_file: Path) -> tuple[str, dict]:
    with open(asset_file, "r") as f:
        data = json.load(f)
    url = data["url"]  # ex: /__l5e/assets-v1/.../clodoaldo-hero.png
    asset_id = data["asset_id"]
    original_filename = data["original_filename"]
    
    # Determina subpath relativo (preserva apps/, premium/, etc.)
    rel = asset_file.relative_to(ASSET_DIR)
    sub_dir = rel.parent
    
    # Nome único de destino: usa o original_filename, sem repetição
    # Se for de apps/, prefixa com apps/
    if str(sub_dir) == ".":
        dest_name = original_filename
    else:
        # apps/soulmap.jpg.asset.json -> apps/soulmap.jpg
        dest_name = str(sub_dir / original_filename)
    
    dest_path = OUT_DIR / dest_name
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    
    # URL pública dentro do Next.js
    public_url = f"/assets/{dest_name}"
    
    # Baixa se não existir
    if not dest_path.exists() or dest_path.stat().st_size == 0:
        try:
            full_url = LOVABLE_BASE + url
            req = urllib.request.Request(full_url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=30) as resp:
                with open(dest_path, "wb") as out:
                    out.write(resp.read())
            size = os.path.getsize(dest_path)
            return (original_filename, {"ok": True, "size": size, "public_url": public_url, "dest": str(dest_path)})
        except Exception as e:
            return (original_filename, {"ok": False, "err": str(e), "public_url": public_url, "dest": str(dest_path)})
    else:
        size = os.path.getsize(dest_path)
        return (original_filename, {"ok": True, "size": size, "public_url": public_url, "dest": str(dest_path), "cached": True})

# Download em paralelo
results = {}
with ThreadPoolExecutor(max_workers=8) as ex:
    futures = {ex.submit(download_one, af): af for af in asset_files}
    for fut in as_completed(futures):
        name, res = fut.result()
        results[name] = res
        if res.get("ok"):
            tag = "OK" if not res.get("cached") else "CACHED"
            print(f"  [{tag}] {name} -> {res['public_url']} ({res['size']:,} bytes)")
        else:
            print(f"  [ERR] {name} -> {res.get('err')}")

# Gera mapeamento TypeScript
# Para cada .asset.json, gera uma entrada <slug-var> = "<public_url>"
# O slug precisa ser válido em TS. Usa o caminho relativo sem extensão, com hifens.

print("\n=== Gerando src/lib/asset-urls.ts ===")
out_ts = Path("/home/z/my-project/src/lib/asset-urls.ts")
out_ts.parent.mkdir(parents=True, exist_ok=True)

def slug_for(rel: Path) -> str:
    """Gera slug em TS a partir do caminho relativo do asset_file."""
    # apps/soulmap.jpg.asset.json -> appsSoulmapJpg? Não, mais simples: usa path com hifens
    # soulmap.jpg.asset.json -> soulmapJpg
    # Apps premium/flashctb.png.asset.json -> appsPremiumFlashctbPng
    parts = list(rel.parts)  # não use with_suffix — quero remover .asset.json inteiro
    # remove o nome do último: e.g. "30-ganchos-reels.pdf.asset.json" -> "30-ganchos-reels.pdf"
    parts[-1] = parts[-1][:-len(".asset.json")]
    # parts: ["apps", "soulmap.jpg"] or ["apps", "premium", "flashctb.png"] or ["clodoaldo-hero.png"]
    # Sanitiza: remove .png/.jpg/.webp final e converte para camelCase
    cleaned = []
    for i, p in enumerate(parts):
        # remove a extensão do último
        if i == len(parts) - 1:
            p = re.sub(r"\.asset\.json$", "", p, flags=re.I)
            p = re.sub(r"\.(png|jpg|jpeg|webp|zip|pdf)$", "", p, flags=re.I)
        # Converte kebab/snake para camelCase
        tokens = re.split(r"[-_]", p)
        # Garante que o primeiro token não comece com dígito
        if tokens[0] and tokens[0][0].isdigit():
            tokens[0] = "_" + tokens[0]
        if i == 0:
            cleaned.append(tokens[0].lower() + "".join(t.capitalize() for t in tokens[1:]))
        else:
            cleaned.append("".join(t.capitalize() for t in tokens))
    return "".join(cleaned)

lines = ["// Mapeamento de assets locais — gerado por scripts/download-assets.py",
         "// NÃO editar à mão; rode: python3 /home/z/my-project/scripts/download-assets.py",
         ""]
lines.append("export const ASSETS = {")
ok_count = 0
err_count = 0
for af in asset_files:
    rel = af.relative_to(ASSET_DIR)
    slug = slug_for(rel)
    data = json.loads(af.read_text())
    name = data["original_filename"]
    res = results.get(name, {})
    if res.get("ok"):
        lines.append(f"  {slug}: \"{res['public_url']}\",")
        ok_count += 1
    else:
        err_count += 1
        lines.append(f"  // {slug}: ERROR -> {res.get('err')}")
lines.append("} as const;")
lines.append("")
lines.append(f"// Total: {ok_count} OK, {err_count} ERRO")

out_ts.write_text("\n".join(lines))
print(f"  Escrito: {out_ts}")
print(f"  OK: {ok_count} / ERRO: {err_count}")
print(f"  Total de arquivos em /public/assets: {sum(1 for _ in OUT_DIR.rglob('*') if _.is_file())}")
