"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { KnowledgeCard, type KnowledgeCardData } from "./knowledge-card";

export function KnowledgeGrid({ items }: { items: KnowledgeCardData[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [type, setType] = useState<string>("all");

  const categories = useMemo(() => Array.from(new Set(items.map((i) => i.category))).sort(), [items]);
  const types = useMemo(() => Array.from(new Set(items.map((i) => i.type))).sort(), [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((i) => {
      if (category !== "all" && i.category !== category) return false;
      if (type !== "all" && i.type !== type) return false;
      if (q && !`${i.title} ${i.description}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [items, query, category, type]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por título ou descrição"
            className="w-full rounded-full border border-border bg-card/60 pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-full border border-border bg-card/60 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">Todas categorias</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-full border border-border bg-card/60 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">Todos tipos</option>
          {types.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          Nenhum conteúdo encontrado com esses filtros.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((i) => <KnowledgeCard key={i.slug} item={i} />)}
        </div>
      )}
    </div>
  );
}
