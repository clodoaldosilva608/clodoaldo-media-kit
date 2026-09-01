import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Trash2 } from "lucide-react";
import { deleteNote, upsertNote } from "@/lib/knowledge.functions";

interface Note {
  id: string;
  content: string;
  anchor: string | null;
  updated_at: string;
}

interface Props {
  knowledgeId: string;
  chapterId: string;
  initialNotes: Note[];
}

export function NotesPanel({ knowledgeId, chapterId, initialNotes }: Props) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const saveFn = useServerFn(upsertNote);
  const delFn = useServerFn(deleteNote);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editingId = useRef<string | null>(null);

  useEffect(() => setNotes(initialNotes), [initialNotes, chapterId]);

  function scheduleSave(text: string) {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const trimmed = text.trim();
      if (!trimmed) return;
      setSaving(true);
      try {
        const res = await saveFn({
          data: {
            id: editingId.current ?? undefined,
            knowledge_id: knowledgeId,
            chapter_id: chapterId,
            content: trimmed,
          },
        });
        if (!editingId.current) {
          editingId.current = res.id;
          setNotes((prev) => [
            { id: res.id, content: trimmed, anchor: null, updated_at: new Date().toISOString() },
            ...prev,
          ]);
        } else {
          setNotes((prev) => prev.map((n) => (n.id === res.id ? { ...n, content: trimmed } : n)));
        }
      } finally {
        setSaving(false);
      }
    }, 800);
  }

  async function remove(id: string) {
    await delFn({ data: { id } });
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (editingId.current === id) {
      editingId.current = null;
      setDraft("");
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card/40 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Anotações</h3>
        {saving && <span className="text-[10px] text-muted-foreground">Salvando…</span>}
      </div>
      <textarea
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          scheduleSave(e.target.value);
        }}
        onBlur={() => {
          if (!draft.trim()) return;
          editingId.current = null;
          setDraft("");
        }}
        placeholder="Escreva uma nota..."
        rows={3}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary resize-y"
      />
      <ul className="mt-4 space-y-2">
        {notes.map((n) => (
          <li key={n.id} className="group rounded-lg border border-border bg-background/60 p-3 text-sm">
            <div className="flex items-start justify-between gap-2">
              <p className="whitespace-pre-wrap flex-1">{n.content}</p>
              <button
                onClick={() => remove(n.id)}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition"
                aria-label="Remover nota"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
