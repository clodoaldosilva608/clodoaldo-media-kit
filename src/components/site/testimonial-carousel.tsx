"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-browser";
import { Star, Quote } from "lucide-react";

interface Testimonial {
  id: string;
  author_name: string;
  author_handle: string | null;
  author_avatar: string | null;
  role: string;
  content: string;
  rating: number;
  product_slug: string | null;
  featured: boolean;
}

export function TestimonialCarousel({ limit = 6 }: { limit?: number }) {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase
        .from("testimonials")
        .select("id, author_name, author_handle, author_avatar, role, content, rating, product_slug, featured")
        .eq("active", true)
        .order("featured", { ascending: false })
        .order("position", { ascending: true })
        .limit(limit);
      if (mounted) setItems(data || []);
    })();
    return () => {
      mounted = false;
    };
  }, [limit]);

  useEffect(() => {
    if (items.length === 0) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % items.length), 5000);
    return () => clearInterval(t);
  }, [items.length]);

  if (items.length === 0) return null;

  const t = items[idx];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-6 sm:p-10">
      <Quote className="absolute right-6 top-6 h-12 w-12 text-white/5" />
      <div className="relative">
        <div className="mb-4 flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${i < t.rating ? "fill-amber-400 text-amber-400" : "fill-zinc-700 text-zinc-700"}`}
            />
          ))}
        </div>
        <blockquote className="mb-6 text-lg font-medium leading-relaxed text-white sm:text-xl">"{t.content}"</blockquote>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-sm font-bold text-emerald-950">
            {t.author_avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={t.author_avatar} alt={t.author_name} className="h-full w-full rounded-full object-cover" />
            ) : (
              t.author_name[0]?.toUpperCase()
            )}
          </div>
          <div>
            <div className="text-sm font-semibold text-white">{t.author_name}</div>
            <div className="text-xs text-zinc-400">{t.author_handle || t.role}</div>
          </div>
        </div>
        {items.length > 1 && (
          <div className="mt-6 flex items-center gap-1.5">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === idx ? "w-6 bg-emerald-400" : "w-1.5 bg-white/20 hover:bg-white/40"
                }`}
                aria-label={`Depoimento ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
