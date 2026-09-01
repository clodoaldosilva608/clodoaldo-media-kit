import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("install-dismissed")) return;
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!deferred || hidden) return null;

  return (
    <div
      role="dialog"
      aria-label="Instalar aplicativo"
      className="fixed z-40 bottom-20 right-5 left-5 sm:left-auto sm:max-w-sm rounded-2xl border border-primary/40 bg-card/95 backdrop-blur shadow-card p-4 flex items-start gap-3"
    >
      <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-orange grid place-items-center text-primary-foreground">
        <Download size={18} aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-display font-bold text-sm">Instalar aplicativo</div>
        <p className="text-xs text-muted-foreground mt-0.5">
          Adicione o Media Kit à sua tela inicial para acesso rápido.
        </p>
        <div className="mt-3 flex gap-2">
          <button
            onClick={async () => {
              await deferred.prompt();
              await deferred.userChoice;
              setDeferred(null);
            }}
            className="rounded-full bg-gradient-orange px-4 py-2 min-h-9 text-xs font-semibold text-primary-foreground"
          >
            Instalar
          </button>
          <button
            onClick={() => {
              sessionStorage.setItem("install-dismissed", "1");
              setHidden(true);
            }}
            className="rounded-full border border-border px-4 py-2 min-h-9 text-xs font-semibold"
          >
            Agora não
          </button>
        </div>
      </div>
      <button
        onClick={() => {
          sessionStorage.setItem("install-dismissed", "1");
          setHidden(true);
        }}
        aria-label="Dispensar"
        className="h-8 w-8 rounded-full grid place-items-center hover:bg-muted shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  );
}
