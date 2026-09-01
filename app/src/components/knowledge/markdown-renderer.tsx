import { useMemo, useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Clipboard } from "lucide-react";
import { checklistKey } from "@/lib/knowledge-markdown";

interface Props {
  chapterSlug: string;
  markdown: string;
  checklist: Record<string, boolean>;
  onToggleChecklist: (key: string, checked: boolean) => void;
}

function CopyButton({ text, label = "Copiar" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch { /* noop */ }
      }}
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background/70 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-background transition"
    >
      {copied ? <Check size={12} /> : <Clipboard size={12} />}
      {copied ? "Copiado" : label}
    </button>
  );
}

// Parse triple-colon blocks (:::prompt / :::template / :::info / :::warn / :::success)
// into a normalized token stream. We handle them at the source-string level.
type Block = { kind: "md"; text: string } | { kind: "callout"; type: string; text: string };

function tokenize(source: string): Block[] {
  const blocks: Block[] = [];
  const regex = /^:::([a-z]+)\s*\n([\s\S]*?)\n:::\s*$/gm;
  let last = 0;
  for (const m of source.matchAll(regex)) {
    if (m.index !== undefined && m.index > last) {
      blocks.push({ kind: "md", text: source.slice(last, m.index) });
    }
    blocks.push({ kind: "callout", type: m[1], text: m[2] });
    last = (m.index ?? 0) + m[0].length;
  }
  if (last < source.length) blocks.push({ kind: "md", text: source.slice(last) });
  return blocks;
}

function Callout({ type, text }: { type: string; text: string }) {
  const isPrompt = type === "prompt";
  const isTemplate = type === "template";
  const isCopyable = isPrompt || isTemplate;

  const palette: Record<string, string> = {
    prompt: "border-primary/40 bg-primary/5",
    template: "border-emerald-500/40 bg-emerald-500/5",
    info: "border-sky-500/40 bg-sky-500/5",
    warn: "border-amber-500/40 bg-amber-500/5",
    success: "border-emerald-500/40 bg-emerald-500/5",
  };
  const label: Record<string, string> = {
    prompt: "Prompt",
    template: "Template",
    info: "Nota",
    warn: "Atenção",
    success: "Dica",
  };

  return (
    <div className={`my-6 rounded-xl border p-4 ${palette[type] ?? "border-border bg-card/40"}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label[type] ?? type}
        </span>
        {isCopyable && <CopyButton text={text} />}
      </div>
      {isCopyable ? (
        <pre className="whitespace-pre-wrap break-words font-mono text-sm text-foreground/90">{text}</pre>
      ) : (
        <div className="prose prose-invert max-w-none prose-p:my-2 text-sm">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}

export function MarkdownRenderer({ chapterSlug, markdown, checklist, onToggleChecklist }: Props) {
  const blocks = useMemo(() => tokenize(markdown), [markdown]);

  let checklistIdx = 0;

  const components: Components = {
    code(props) {
      const { className, children, ...rest } = props as { className?: string; children?: React.ReactNode; inline?: boolean };
      const inline = (props as { inline?: boolean }).inline;
      const text = String(children ?? "").replace(/\n$/, "");
      if (inline) {
        return <code className="rounded bg-muted px-1.5 py-0.5 text-[0.9em] font-mono" {...rest}>{children}</code>;
      }
      return (
        <div className="my-5 rounded-lg border border-border bg-card/60 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border">
            <span className="text-xs font-mono uppercase text-muted-foreground">{className?.replace("language-", "") || "code"}</span>
            <CopyButton text={text} />
          </div>
          <pre className="overflow-x-auto p-4 text-sm font-mono leading-relaxed"><code>{text}</code></pre>
        </div>
      );
    },
    li({ children, ...rest }) {
      // Task list item support (via remark-gfm)
      const arr = Array.isArray(children) ? children : [children];
      const first = arr[0] as unknown as { props?: { type?: string; checked?: boolean } } | undefined;
      const isTask = first && typeof first === "object" && "props" in first && first.props?.type === "checkbox";
      if (isTask) {
        const idx = checklistIdx++;
        const rest2 = arr.slice(1);
        const text = String(
          rest2
            .map((n) => (typeof n === "string" ? n : ""))
            .join("")
            .trim() || `item-${idx}`,
        );
        const key = checklistKey(chapterSlug, idx, text);
        const checked = checklist[key] ?? Boolean(first.props?.checked);
        return (
          <li className="list-none flex items-start gap-2 my-1.5" {...rest}>
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => onToggleChecklist(key, e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-border accent-primary"
            />
            <span className={checked ? "line-through text-muted-foreground" : ""}>{rest2}</span>
          </li>
        );
      }
      return <li {...rest}>{children}</li>;
    },
    img({ src, alt }) {
      return <img src={src as string} alt={alt ?? ""} loading="lazy" className="rounded-lg border border-border my-6" />;
    },
    a({ href, children }) {
      const isValidatedDownload = typeof href === "string" && href.startsWith("/api/public/downloads/");
      return (
        <a
          href={href}
          target={isValidatedDownload ? undefined : "_blank"}
          rel={isValidatedDownload ? undefined : "noopener noreferrer"}
          download={isValidatedDownload ? true : undefined}
          className="text-primary underline"
        >
          {children}
        </a>
      );
    },
  };

  return (
    <div className="prose prose-invert max-w-none prose-headings:font-display prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:leading-relaxed prose-p:text-foreground/90 prose-strong:text-foreground prose-blockquote:border-primary/60 prose-blockquote:text-foreground/80">
      {blocks.map((b, i) =>
        b.kind === "callout" ? (
          <Callout key={i} type={b.type} text={b.text} />
        ) : (
          <ReactMarkdown key={i} remarkPlugins={[remarkGfm]} components={components}>
            {b.text}
          </ReactMarkdown>
        ),
      )}
    </div>
  );
}
