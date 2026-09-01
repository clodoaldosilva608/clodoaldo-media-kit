"use client";

import { useEffect, useRef } from "react";

export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reveal = () => {
      el.classList.add("is-visible");
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
      el.style.animationDelay = "0ms";
    };

    const safety = window.setTimeout(reveal, 250);

    if (typeof IntersectionObserver === "undefined") {
      reveal();
      window.clearTimeout(safety);
      return;
    }

    const rect = el.getBoundingClientRect();
    const inView =
      rect.top < (window.innerHeight || document.documentElement.clientHeight) &&
      rect.bottom > 0;
    if (inView) {
      reveal();
      window.clearTimeout(safety);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px 10% 0px" },
    );
    observer.observe(el);

    const fallback = window.setTimeout(() => {
      reveal();
      observer.disconnect();
    }, 1500);

    return () => {
      window.clearTimeout(safety);
      window.clearTimeout(fallback);
      observer.disconnect();
    };
  }, []);

  return ref;
}
