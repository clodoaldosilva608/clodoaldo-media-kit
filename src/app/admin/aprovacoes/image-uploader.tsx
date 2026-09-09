"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";

interface ImageUploaderProps {
  /** Lista atual de URLs de imagens */
  images: string[];
  /** Callback quando imagens mudam (URLs) */
  onChange: (images: string[]) => void;
  /** ID do projeto (para organizar pastas no storage) */
  projectId?: string;
  /** Máximo de imagens permitidas (default 20) */
  max?: number;
}

export function ImageUploader({ images, onChange, projectId = "general", max = 20 }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (images.length + files.length > max) {
      setError(`Máximo de ${max} imagens.`);
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const newUrls: string[] = [];
      for (const file of Array.from(files)) {
        // Validações
        if (!file.type.startsWith("image/")) {
          setError(`"${file.name}" não é imagem.`);
          continue;
        }
        if (file.size > 10 * 1024 * 1024) {
          setError(`"${file.name}" excede 10MB.`);
          continue;
        }
        const formData = new FormData();
        formData.append("file", file);
        formData.append("project_id", projectId);
        const r = await fetch("/api/admin/approvals/upload", {
          method: "POST",
          body: formData,
        });
        const json = await r.json();
        if (r.ok && json.url) {
          newUrls.push(json.url);
        } else {
          setError(json.error || `Erro ao subir ${file.name}`);
        }
      }
      if (newUrls.length > 0) {
        onChange([...images, ...newUrls]);
      }
    } catch (e: any) {
      setError(e.message || "Erro no upload");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removeImage(idx: number) {
    onChange(images.filter((_, i) => i !== idx));
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {images.length > 0 && (
        <div className="mb-2 grid grid-cols-3 sm:grid-cols-4 gap-2">
          {images.map((url, i) => (
            <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-white/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Imagem ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 rounded-full bg-rose-500/80 p-1 text-white opacity-0 group-hover:opacity-100 transition"
                aria-label="Remover"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading || images.length >= max}
        className="w-full rounded-lg border border-dashed border-white/15 bg-white/[0.02] py-4 text-xs text-zinc-400 hover:bg-white/[0.04] hover:border-emerald-500/40 transition inline-flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {uploading ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
        ) : (
          <><Upload className="h-4 w-4" /> Adicionar imagens (PNG/JPG/WebP, máx 10MB cada)</>
        )}
      </button>

      {error && <p className="mt-2 text-[10px] text-rose-300">{error}</p>}

      <p className="mt-1 text-[10px] text-zinc-500">
        {images.length}/{max} imagens. Aceita PNG, JPG, WebP, GIF.
      </p>
    </div>
  );
}
