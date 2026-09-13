"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Widget, Button } from "@/components/admin/ui";
import { Sparkles, Save, Trash2, Plus, AlertCircle, CheckCircle2, Mic, MessageSquare } from "lucide-react";

interface VoiceProfile {
  greeting_style?: string;
  closing_style?: string;
  tone?: string;
  formality_level?: string;
  emoji_usage?: string;
  sentence_length?: string;
  rhythm?: string;
  vocabulary_tics?: string;
  punctuation_style?: string;
  preferred_contact_cta?: string;
  avoid_patterns?: string;
  summary?: string;
  example_generated?: string;
  _meta?: { sample_count: number; created_at: string; model: string };
}

export default function VozPage() {
  const [messages, setMessages] = useState<string[]>(["", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<VoiceProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    setLoadingProfile(true);
    try {
      const r = await fetch("/api/admin/voice-profile");
      const j = await r.json();
      if (j.exists) setProfile(j.profile);
    } catch (e: any) {
      console.warn(e.message);
    } finally {
      setLoadingProfile(false);
    }
  }

  async function analyze() {
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      const valid = messages.filter(m => m.trim().length > 10);
      if (valid.length < 3) {
        setError("Cole pelo menos 3 mensagens reais com 10+ caracteres cada.");
        setLoading(false);
        return;
      }
      const r = await fetch("/api/admin/voice-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: valid }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Falha");
      setProfile(j.profile);
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function addMessage() {
    setMessages([...messages, ""]);
  }

  function removeMessage(i: number) {
    if (messages.length <= 1) return;
    setMessages(messages.filter((_, idx) => idx !== i));
  }

  function updateMessage(i: number, value: string) {
    setMessages(messages.map((m, idx) => idx === i ? value : m));
  }

  return (
    <AdminShell title="Voz do Clodoaldo">
      <div className="mb-6 rounded-xl border border-violet-500/20 bg-violet-500/[0.04] p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-violet-500/15 p-2">
            <Mic className="h-5 w-5 text-violet-300" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold text-violet-200 mb-1">
              Treine a IA pra escrever como você
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Cole abaixo 5 a 10 mensagens WhatsApp <strong className="text-zinc-300">reais que você já enviou pra leads</strong>.
              A IA (Gemini) analisa seu padrão de escrita — cumprimento, tom, ritmo, emojis, gírias —
              e cria um <strong className="text-zinc-300">perfil de voz</strong>. A partir daí, os roteiros WhatsApp gerados pela IA
              vão soar como você escrevendo, não como um robô corporativo.
            </p>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-zinc-500">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>Dica: cole mensagens variadas — primeira abordagem, follow-up, resposta a objeção, fechamento. Quanto mais diversificado, melhor o perfil.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile atual */}
      {loadingProfile ? (
        <Widget title="Perfil atual" loading />
      ) : profile ? (
        <Widget title="Perfil de voz atual" icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />}>
          <div className="space-y-3">
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.04] p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 mb-1">Resumo (usado pela IA)</div>
              <p className="text-sm text-zinc-200">{profile.summary || "—"}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Cumprimento" value={profile.greeting_style} />
              <Field label="Encerramento" value={profile.closing_style} />
              <Field label="Tom" value={profile.tone} />
              <Field label="Formalidade" value={profile.formality_level} />
              <Field label="Uso de emojis" value={profile.emoji_usage} />
              <Field label="Tamanho de frase" value={profile.sentence_length} />
              <Field label="Ritmo" value={profile.rhythm} />
              <Field label="Tics de vocabulário" value={profile.vocabulary_tics} />
              <Field label="Pontuação" value={profile.punctuation_style} />
              <Field label="CTA preferido" value={profile.preferred_contact_cta} />
              <Field label="O que evitar" value={profile.avoid_patterns} full />
            </div>

            {profile.example_generated && (
              <div className="rounded-lg border border-violet-500/20 bg-violet-500/[0.04] p-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-violet-300 mb-1">Exemplo gerado no seu estilo</div>
                <p className="text-sm text-zinc-200 italic">"{profile.example_generated}"</p>
              </div>
            )}

            {profile._meta && (
              <div className="text-[10px] text-zinc-500">
                Criado em {new Date(profile._meta.created_at).toLocaleString("pt-BR")} · {profile._meta.sample_count} amostras · {profile._meta.model}
              </div>
            )}
          </div>
        </Widget>
      ) : (
        <Widget title="Nenhum perfil de voz ainda" icon={<Sparkles className="h-4 w-4 text-amber-400" />}>
          <p className="text-sm text-zinc-400">
            Cole suas mensagens abaixo e clique em <strong className="text-zinc-300">Analisar e salvar perfil</strong>.
            A primeira análise leva ~10 segundos.
          </p>
        </Widget>
      )}

      {/* Form de mensagens */}
      <Widget title="Mensagens reais para análise" icon={<MessageSquare className="h-4 w-4 text-blue-400" />}>
        <div className="space-y-3">
          {messages.map((m, i) => (
            <div key={i} className="flex gap-2">
              <div className="flex-shrink-0 mt-2 w-6 text-right">
                <span className="text-[10px] font-bold text-zinc-500">{i + 1}</span>
              </div>
              <textarea
                value={m}
                onChange={(e) => updateMessage(i, e.target.value)}
                rows={2}
                placeholder="Cole aqui uma mensagem WhatsApp real que você enviou pra um lead..."
                className="flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500/50 focus:outline-none"
              />
              {messages.length > 1 && (
                <button
                  onClick={() => removeMessage(i)}
                  className="flex-shrink-0 mt-1 rounded-lg p-2 text-rose-400 hover:bg-rose-500/10"
                  title="Remover"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}

          <button
            onClick={addMessage}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-white/10"
          >
            <Plus className="h-3.5 w-3.5" /> Adicionar mensagem
          </button>

          {error && (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/[0.06] p-3 text-sm text-rose-200">
              <AlertCircle className="inline h-4 w-4 mr-1.5" />
              {error}
            </div>
          )}

          {saved && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/[0.06] p-3 text-sm text-emerald-200">
              <CheckCircle2 className="inline h-4 w-4 mr-1.5" />
              Perfil de voz salvo! Próximos roteiros IA vão usar seu estilo.
            </div>
          )}

          <div className="flex justify-end pt-2 border-t border-white/5">
            <Button onClick={analyze} disabled={loading}>
              {loading ? (
                <><Sparkles className="h-3.5 w-3.5 animate-spin" /> Analisando...</>
              ) : (
                <><Save className="h-3.5 w-3.5" /> Analisar e salvar perfil</>
              )}
            </Button>
          </div>
        </div>
      </Widget>

      <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.06] p-3 text-[11px] text-amber-200/80">
        💡 <strong>Como funciona:</strong> O Gemini 3.6 Flash analisa suas mensagens e extrai padrões (cumprimento, tom, ritmo, emojis, gírias).
        O perfil fica salvo em <code className="rounded bg-black/30 px-1">app_settings.voice_profile</code> e é carregado automaticamente
        quando a IA gera novos roteiros WhatsApp. Custo: R$ 0 (free tier, 1500/dia).
      </div>
    </AdminShell>
  );
}

function Field({ label, value, full }: { label: string; value?: string; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-0.5">{label}</div>
      <div className="text-sm text-zinc-200">{value || <span className="text-zinc-600 italic">—</span>}</div>
    </div>
  );
}
