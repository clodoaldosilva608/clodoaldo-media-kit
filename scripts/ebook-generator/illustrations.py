"""
Gerador de ilustrações matplotlib para os e-books.
Cada função retorna um caminho de arquivo PNG.
"""
import os
from typing import Dict
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Circle, Rectangle, Wedge
import numpy as np
from pdf_base import COLORS, save_illustration, configure_matplotlib

configure_matplotlib()
ILLUST_DIR = "/home/z/my-project/scripts/ebook-generator/illustrations"
os.makedirs(ILLUST_DIR, exist_ok=True)


def three_act_structure() -> str:
    """Estrutura de 3 atos aplicada a Reels."""
    fig, ax = plt.subplots(figsize=(10, 5.5))
    
    acts = [
        ("Ato 1 — Setup", "Gancho + Contexto\n0-3s", "#C8A062", 0),
        ("Ato 2 — Confronto", "Tensão + Desenvolvimento\n3-12s", "#9B7A45", 1),
        ("Ato 3 — Resolução", "CTA + Payoff\n12-15s", "#D4A574", 2),
    ]
    
    for label, sub, color, i in acts:
        rect = FancyBboxPatch(
            (i * 3.3, 1), 3, 2.5,
            boxstyle="round,pad=0.1",
            facecolor=color, edgecolor="#F5EFE0", linewidth=1.5, alpha=0.85,
        )
        ax.add_patch(rect)
        ax.text(i * 3.3 + 1.5, 3.4, label, ha="center", va="bottom",
                fontsize=12, fontweight="bold", color="#F5EFE0")
        ax.text(i * 3.3 + 1.5, 2.25, sub, ha="center", va="center",
                fontsize=10, color="#1F1A14")
    
    # Linha do tempo embaixo
    ax.annotate("", xy=(10, 0.5), xytext=(0, 0.5),
                arrowprops=dict(arrowstyle="->", color="#A39684", lw=1.5))
    ax.text(5, 0.1, "Tempo do vídeo", ha="center", fontsize=9, color="#A39684", style="italic")
    
    ax.set_xlim(-0.5, 10)
    ax.set_ylim(0, 4.5)
    ax.set_aspect("equal")
    ax.axis("off")
    plt.tight_layout()
    return save_illustration(fig, "three_act_structure")


def narrative_arc() -> str:
    """Arco narrativo: começa baixo, sobe para climax, desce para resolução."""
    fig, ax = plt.subplots(figsize=(10, 5))
    
    x = np.linspace(0, 10, 200)
    # Curva em sino (clímax no meio)
    y = 4 * np.exp(-((x - 5) ** 2) / 8) + 0.3
    
    ax.fill_between(x, 0, y, color="#C8A062", alpha=0.2)
    ax.plot(x, y, color="#D4A574", linewidth=3)
    
    # Marcadores de estágios
    stages = [
        (1, 0.7, "Incidente\nGatilho"),
        (3.5, 2.5, "Tensão\nCrescente"),
        (5, 4.3, "Clímax"),
        (6.5, 2.5, "Ação\nDecisiva"),
        (9, 0.7, "Resolução"),
    ]
    
    for sx, sy, label in stages:
        ax.plot(sx, sy, "o", color="#F5EFE0", markersize=10, markeredgecolor="#C8A062", markeredgewidth=2)
        ax.annotate(label, (sx, sy), xytext=(sx, sy + 0.4 if sy < 4 else sy - 0.7),
                    ha="center", fontsize=9, color="#F5EFE0", fontweight="bold")
    
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 5.5)
    ax.set_xlabel("Progressão da narrativa", fontsize=10, color="#A39684")
    ax.set_ylabel("Tensão / Engajamento", fontsize=10, color="#A39684")
    ax.set_title("Arco Narrativo Clássico", pad=15, color="#D9B885")
    ax.grid(True, alpha=0.15, color="#A39684")
    ax.axis("off")
    plt.tight_layout()
    return save_illustration(fig, "narrative_arc")


def emotional_hooks_wheel() -> str:
    """Roda de ganchos emocionais."""
    fig, ax = plt.subplots(figsize=(8, 8))
    
    emotions = [
        ("Curiosidade", "#C8A062"),
        ("Surpresa", "#D9B885"),
        ("Medo/Urgência", "#C97064"),
        ("Raiva", "#9B7A45"),
        ("Tristeza", "#7B6A5A"),
        ("Alegria", "#D4A574"),
        ("Aspiração", "#C8A062"),
        ("Pertencimento", "#B8945A"),
    ]
    
    n = len(emotions)
    angles = np.linspace(0, 2 * np.pi, n, endpoint=False)
    
    for i, (label, color) in enumerate(emotions):
        angle = angles[i]
        wedge = Wedge((0, 0), 1, np.degrees(angle), np.degrees(angles[(i + 1) % n]),
                      facecolor=color, edgecolor="#1F1A14", linewidth=2, alpha=0.85)
        ax.add_patch(wedge)
        
        mid_angle = (angle + angles[(i + 1) % n]) / 2
        x = 0.7 * np.cos(mid_angle)
        y = 0.7 * np.sin(mid_angle)
        ax.text(x, y, label, ha="center", va="center",
                fontsize=11, fontweight="bold", color="#1F1A14")
    
    # Círculo central
    central = Circle((0, 0), 0.25, facecolor="#1F1A14", edgecolor="#C8A062", linewidth=2)
    ax.add_patch(central)
    ax.text(0, 0, "Ganchos\nEmocionais", ha="center", va="center",
            fontsize=11, fontweight="bold", color="#C8A062")
    
    ax.set_xlim(-1.3, 1.3)
    ax.set_ylim(-1.3, 1.3)
    ax.set_aspect("equal")
    ax.axis("off")
    ax.set_title("8 Ganchos Emocionais Universais", pad=20, color="#D9B885", fontsize=13)
    plt.tight_layout()
    return save_illustration(fig, "emotional_hooks_wheel")


def hook_performance_chart() -> str:
    """Gráfico de performance de ganchos por taxa de retenção."""
    fig, ax = plt.subplots(figsize=(10, 5))
    
    hooks = [
        "Pergunta\naberta",
        "Stat\nchocante",
        "História\npessoal",
        "Promessa\n Clara",
        "Conflito\nexplícito",
        "Mistério\n/ enigma",
        "CTA\ninverso",
        "Quebra de\npadrão",
    ]
    retention = [78, 85, 92, 88, 81, 90, 75, 87]
    
    bars = ax.barh(hooks, retention, color="#C8A062", edgecolor="#F5EFE0", linewidth=0.5)
    
    # Destaque o maior
    max_idx = retention.index(max(retention))
    bars[max_idx].set_color("#D4A574")
    
    for bar, val in zip(bars, retention):
        ax.text(val + 1, bar.get_y() + bar.get_height() / 2, f"{val}%",
                va="center", fontsize=10, color="#F5EFE0", fontweight="bold")
    
    ax.set_xlim(0, 100)
    ax.set_xlabel("Taxa de retenção aos 3 segundos (%)", fontsize=10, color="#A39684")
    ax.set_title("Performance de Ganchos por Taxa de Retenção",
                 pad=15, color="#D9B885", fontsize=12)
    ax.invert_yaxis()
    ax.grid(True, axis="x", alpha=0.2, color="#A39684")
    ax.set_axisbelow(True)
    plt.tight_layout()
    return save_illustration(fig, "hook_performance_chart")


def content_framework_diagram() -> str:
    """Diagrama: Framework de Conteúdo (Estrutura → Gancho → Entrega → CTA)."""
    fig, ax = plt.subplots(figsize=(10, 6))
    
    steps = [
        ("1. Estrutura", "Defina o arco\n(3 atos, 5 estágios)", "#C8A062"),
        ("2. Gancho", "Capture atenção\nem 3 segundos", "#D9B885"),
        ("3. Entrega", "Cumpra a promessa\ncom valor real", "#9B7A45"),
        ("4. CTA", "Direcione a ação\ncom clareza", "#D4A574"),
    ]
    
    for i, (title, sub, color) in enumerate(steps):
        x = i * 2.5
        
        # Caixa
        rect = FancyBboxPatch(
            (x, 2), 2, 2,
            boxstyle="round,pad=0.1",
            facecolor=color, edgecolor="#F5EFE0", linewidth=1.5, alpha=0.85,
        )
        ax.add_patch(rect)
        ax.text(x + 1, 3.4, title, ha="center", va="center",
                fontsize=12, fontweight="bold", color="#1F1A14")
        ax.text(x + 1, 2.7, sub, ha="center", va="center",
                fontsize=9, color="#1F1A14")
        
        # Seta para o próximo
        if i < len(steps) - 1:
            ax.annotate("", xy=(x + 2.3, 3), xytext=(x + 2, 3),
                        arrowprops=dict(arrowstyle="->", color="#F5EFE0", lw=2))
    
    # Loop feedback
    ax.annotate("", xy=(0, 1.5), xytext=(8, 1.5),
                arrowprops=dict(arrowstyle="->", color="#A39684", lw=1.5,
                                connectionstyle="arc3,rad=-0.3"))
    ax.text(4, 0.7, "Loop de iteração: analise métricas → ajuste",
            ha="center", fontsize=10, color="#A39684", style="italic")
    
    ax.set_xlim(-0.5, 10)
    ax.set_ylim(0, 5)
    ax.set_aspect("equal")
    ax.axis("off")
    plt.tight_layout()
    return save_illustration(fig, "content_framework_diagram")


def audience_archetypes() -> str:
    """Mapa de arquétipos de audiência."""
    fig, ax = plt.subplots(figsize=(10, 6))
    
    archetypes = [
        ("O Explorador", "Busca novidade\nAprender primeiro", 1, 4, "#C8A062"),
        ("O Realizador", "Quer resultado\nPrático e rápido", 4, 4, "#D9B885"),
        ("O Sábio", "Valoriza autoridade\nConteúdo profundo", 7, 4, "#9B7A45"),
        ("O Caregiver", "Ajuda os outros\nConteúdo útil", 1, 1.5, "#D4A574"),
        ("O Líber", "Quer liberdade\nIndependência", 4, 1.5, "#B8945A"),
        ("O Bobo da Corte", "Vive o presente\nHumor e leveza", 7, 1.5, "#C8A062"),
    ]
    
    for name, desc, x, y, color in archetypes:
        circle = Circle((x, y), 0.9, facecolor=color, edgecolor="#F5EFE0", linewidth=2, alpha=0.85)
        ax.add_patch(circle)
        ax.text(x, y + 0.15, name, ha="center", va="center",
                fontsize=11, fontweight="bold", color="#1F1A14")
        ax.text(x, y - 0.35, desc, ha="center", va="center",
                fontsize=8, color="#1F1A14")
    
    ax.set_xlim(-0.5, 9)
    ax.set_ylim(0, 6)
    ax.set_aspect("equal")
    ax.axis("off")
    ax.set_title("6 Arquétipos de Audiência para Storytelling",
                 pad=15, color="#D9B885", fontsize=12)
    plt.tight_layout()
    return save_illustration(fig, "audience_archetypes")


def story_vs_pitch_comparison() -> str:
    """Comparação visual: Story vs Pitch."""
    fig, ax = plt.subplots(figsize=(10, 5))
    
    # Lado esquerdo: Story
    rect1 = FancyBboxPatch((0, 1), 4, 3, boxstyle="round,pad=0.1",
                           facecolor="#C8A062", edgecolor="#F5EFE0", linewidth=2, alpha=0.85)
    ax.add_patch(rect1)
    ax.text(2, 3.7, "STORY", ha="center", fontsize=14, fontweight="bold", color="#1F1A14")
    ax.text(2, 3.2, "Começa com pessoa\n→ problema → jornada\n→ transformação → CTA natural",
            ha="center", va="center", fontsize=10, color="#1F1A14")
    ax.text(2, 1.4, "Retenção: ~70%", ha="center", fontsize=11,
            fontweight="bold", color="#1F1A14")
    
    # Seta
    ax.annotate("", xy=(6, 2.5), xytext=(4.3, 2.5),
                arrowprops=dict(arrowstyle="->", color="#F5EFE0", lw=2.5))
    ax.text(5.15, 2.7, "VS", ha="center", fontsize=12, color="#A39684", fontweight="bold")
    
    # Lado direito: Pitch
    rect2 = FancyBboxPatch((6, 1), 4, 3, boxstyle="round,pad=0.1",
                           facecolor="#3A332A", edgecolor="#C97064", linewidth=2, alpha=0.85)
    ax.add_patch(rect2)
    ax.text(8, 3.7, "PITCH", ha="center", fontsize=14, fontweight="bold", color="#C97064")
    ax.text(8, 3.2, "Começa com produto\n→ features → preço\n→ desconto → CTA agressivo",
            ha="center", va="center", fontsize=10, color="#F5EFE0")
    ax.text(8, 1.4, "Retenção: ~25%", ha="center", fontsize=11,
            fontweight="bold", color="#C97064")
    
    ax.set_xlim(-0.5, 10.5)
    ax.set_ylim(0, 5)
    ax.set_aspect("equal")
    ax.axis("off")
    plt.tight_layout()
    return save_illustration(fig, "story_vs_pitch_comparison")


# =====================================================
# ILUSTRAÇÕES — IA PARA CRIADORES DE CONTEÚDO
# =====================================================

def ai_stack_diagram() -> str:
    """Diagrama do stack de ferramentas de IA para criadores."""
    fig, ax = plt.subplots(figsize=(10, 6))
    
    layers = [
        ("IDEAÇÃO", "ChatGPT · Gemini · Claude · Perplexity", "#C8A062", 5),
        ("PRODUÇÃO", "Midjourney · DALL·E · Runway · ElevenLabs", "#D9B885", 4),
        ("EDIÇÃO", "Descript · Adobe Firefly · CapCut AI · Opus Clip", "#9B7A45", 3),
        ("DISTRIBUIÇÃO", "Buffer AI · Hootsuite · Later · Metricool", "#D4A574", 2),
        ("ANALYTICS", "VidIQ · Tubebuddy · Sprout Social · GA4", "#B8945A", 1),
    ]
    
    for label, tools, color, y in layers:
        rect = FancyBboxPatch(
            (1, y), 8, 0.8,
            boxstyle="round,pad=0.05",
            facecolor=color, edgecolor="#F5EFE0", linewidth=1.5, alpha=0.88,
        )
        ax.add_patch(rect)
        ax.text(1.3, y + 0.4, label, ha="left", va="center",
                fontsize=11, fontweight="bold", color="#1F1A14")
        ax.text(5, y + 0.4, tools, ha="center", va="center",
                fontsize=9, color="#1F1A14")
    
    # Seta vertical de pipeline
    ax.annotate("", xy=(0.5, 1), xytext=(0.5, 5.8),
                arrowprops=dict(arrowstyle="->", color="#A39684", lw=2))
    ax.text(0.25, 3.3, "Pipeline", ha="center", va="center", rotation=90,
            fontsize=10, color="#A39684", fontweight="bold")
    
    ax.set_xlim(0, 10)
    ax.set_ylim(0.5, 6.2)
    ax.axis("off")
    ax.set_title("Stack Completo de IA para Criadores", pad=15, color="#D9B885", fontsize=13)
    plt.tight_layout()
    return save_illustration(fig, "ai_stack_diagram")


def llm_comparison_chart() -> str:
    """Gráfico comparativo: ChatGPT vs Gemini vs Claude em diferentes tarefas."""
    fig, ax = plt.subplots(figsize=(10, 5.5))
    
    tasks = ["Roteiro\ncriativo", "Análise\nde dados", "Copywriting", "Código\nlongo", "Raciocínio\nlógico", "Visão\n(multimodal)"]
    chatgpt = [8.5, 7.8, 8.9, 9.0, 8.7, 8.0]
    gemini = [8.0, 8.6, 8.0, 7.5, 8.2, 9.1]
    claude = [9.2, 8.0, 9.1, 9.2, 9.3, 7.5]
    
    x = np.arange(len(tasks))
    w = 0.27
    
    ax.bar(x - w, chatgpt, w, label="ChatGPT (GPT-4o)", color="#C8A062", edgecolor="#F5EFE0", linewidth=0.5)
    ax.bar(x, gemini, w, label="Gemini 1.5 Pro", color="#D9B885", edgecolor="#F5EFE0", linewidth=0.5)
    ax.bar(x + w, claude, w, label="Claude 3.5 Sonnet", color="#9B7A45", edgecolor="#F5EFE0", linewidth=0.5)
    
    ax.set_xticks(x)
    ax.set_xticklabels(tasks, fontsize=9)
    ax.set_ylim(0, 10.5)
    ax.set_ylabel("Score (0-10)", fontsize=10, color="#A39684")
    ax.set_title("ChatGPT vs Gemini vs Claude — Performance por Tarefa",
                 pad=15, color="#D9B885", fontsize=12)
    ax.legend(loc="lower right", fontsize=9)
    ax.grid(True, axis="y", alpha=0.2, color="#A39684")
    ax.set_axisbelow(True)
    plt.tight_layout()
    return save_illustration(fig, "llm_comparison_chart")


def ai_workflow_funnel() -> str:
    """Funil de produtividade com IA — da ideia ao post."""
    fig, ax = plt.subplots(figsize=(10, 5.5))
    
    stages = [
        ("Ideação", "20 ideias em 10 min", 8.5, "#C8A062"),
        ("Roteiro", "Roteiro completo em 15 min", 7.0, "#D9B885"),
        ("Gravação", "Teleprompter + IA prompt", 5.5, "#9B7A45"),
        ("Edição", "Cortes automáticos + IA", 4.0, "#D4A574"),
        ("Distribuição", "Auto-post em 5 plataformas", 2.5, "#B8945A"),
    ]
    
    for i, (label, sub, width, color) in enumerate(stages):
        y = 4 - i
        x_left = (10 - width) / 2
        rect = FancyBboxPatch(
            (x_left, y - 0.4), width, 0.8,
            boxstyle="round,pad=0.05",
            facecolor=color, edgecolor="#F5EFE0", linewidth=1.5, alpha=0.88,
        )
        ax.add_patch(rect)
        ax.text(5, y + 0.15, label, ha="center", va="center",
                fontsize=11, fontweight="bold", color="#1F1A14")
        ax.text(5, y - 0.18, sub, ha="center", va="center",
                fontsize=9, color="#1F1A14", style="italic")
    
    # Tempo total
    ax.text(5, -0.6, "Tempo total: ~2 horas (era 8 horas sem IA)",
            ha="center", fontsize=11, color="#D9B885", fontweight="bold")
    
    ax.set_xlim(-0.5, 10.5)
    ax.set_ylim(-1.2, 5)
    ax.axis("off")
    ax.set_title("Funil de Produção com IA — Ideia → Post", pad=15, color="#D9B885", fontsize=13)
    plt.tight_layout()
    return save_illustration(fig, "ai_workflow_funnel")


def ai_adoption_growth() -> str:
    """Crescimento de adoção de IA por criadores."""
    fig, ax = plt.subplots(figsize=(10, 5))
    
    months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
    adoption = [12, 18, 27, 38, 49, 58, 67, 74, 81, 86, 90, 93]
    
    ax.fill_between(months, adoption, color="#C8A062", alpha=0.25)
    ax.plot(months, adoption, color="#D9B885", linewidth=3, marker="o",
            markerfacecolor="#C8A062", markeredgecolor="#F5EFE0", markersize=8)
    
    for i, (m, v) in enumerate(zip(months, adoption)):
        if i % 2 == 0 or i == len(months) - 1:
            ax.annotate(f"{v}%", (i, v), xytext=(0, 12), textcoords="offset points",
                        ha="center", fontsize=9, color="#F5EFE0", fontweight="bold")
    
    ax.set_ylim(0, 105)
    ax.set_ylabel("% de criadores que usam IA", fontsize=10, color="#A39684")
    ax.set_title("Crescimento da Adoção de IA entre Criadores (2024)",
                 pad=15, color="#D9B885", fontsize=12)
    ax.grid(True, alpha=0.2, color="#A39684")
    ax.set_axisbelow(True)
    plt.tight_layout()
    return save_illustration(fig, "ai_adoption_growth")


def ai_ethics_radar() -> str:
    """Radar de dimensões éticas no uso de IA."""
    fig, ax = plt.subplots(figsize=(8, 8), subplot_kw=dict(projection="polar"))
    
    categories = ["Transparência", "Originalidade", "Vieses", "Privacidade",
                  "Attribuição", "Qualidade", "Consentimento", "Sustentabilidade"]
    ideal = [9, 8, 9, 10, 8, 9, 9, 7]
    real = [5, 6, 4, 6, 4, 7, 5, 3]
    
    angles = np.linspace(0, 2 * np.pi, len(categories), endpoint=False).tolist()
    ideal += ideal[:1]
    real += real[:1]
    angles += angles[:1]
    
    ax.plot(angles, ideal, color="#7BB081", linewidth=2, label="Ideal")
    ax.fill(angles, ideal, color="#7BB081", alpha=0.15)
    ax.plot(angles, real, color="#C97064", linewidth=2, label="Prática real (média)")
    ax.fill(angles, real, color="#C97064", alpha=0.2)
    
    ax.set_xticks(angles[:-1])
    ax.set_xticklabels(categories, fontsize=10, color="#F5EFE0")
    ax.set_ylim(0, 10)
    ax.set_yticks([2, 4, 6, 8, 10])
    ax.set_yticklabels(["2", "4", "6", "8", "10"], fontsize=8, color="#A39684")
    ax.set_title("Dimensões Éticas no Uso de IA",
                 pad=25, color="#D9B885", fontsize=13, fontweight="bold")
    ax.legend(loc="upper right", bbox_to_anchor=(1.25, 1.10), fontsize=9)
    ax.grid(True, color="#A39684", alpha=0.3)
    plt.tight_layout()
    return save_illustration(fig, "ai_ethics_radar")


# =====================================================
# ILUSTRAÇÕES — PACK DE PROMPTS PREMIUM
# =====================================================

def prompt_anatomy() -> str:
    """Anatomia de um prompt eficaz — 5 componentes."""
    fig, ax = plt.subplots(figsize=(10, 5.5))
    
    parts = [
        ("CONTEXTO\nQuem é você?", "Ex: \"Você é um copywriter\nsênior com 10 anos...\"", "#C8A062"),
        ("TAREFA\nO que fazer?", "Ex: \"Escreva 5 headlines\npara um Reels sobre...\"", "#D9B885"),
        ("RESTRIÇÕES\nLimites?", "Ex: \"Máx 8 palavras,\nsem emojis, tom ousado\"", "#9B7A45"),
        ("FORMATO\nComo entregar?", "Ex: \"Liste em formato\nde tabela com 3 cols\"", "#D4A574"),
        ("EXEMPLO\nFew-shot?", "Ex: \"Use este padrão:\n[exemplo de ref.]\"", "#B8945A"),
    ]
    
    for i, (label, sub, color) in enumerate(parts):
        x = i * 2
        rect = FancyBboxPatch(
            (x, 2), 1.8, 2.5,
            boxstyle="round,pad=0.1",
            facecolor=color, edgecolor="#F5EFE0", linewidth=1.5, alpha=0.88,
        )
        ax.add_patch(rect)
        ax.text(x + 0.9, 3.9, label, ha="center", va="center",
                fontsize=10, fontweight="bold", color="#1F1A14")
        ax.text(x + 0.9, 2.7, sub, ha="center", va="center",
                fontsize=8, color="#1F1A14", style="italic")
        
        if i < len(parts) - 1:
            ax.annotate("", xy=(x + 1.95, 3.25), xytext=(x + 1.8, 3.25),
                        arrowprops=dict(arrowstyle="->", color="#F5EFE0", lw=2))
    
    ax.set_xlim(-0.3, 10.3)
    ax.set_ylim(1.5, 5)
    ax.axis("off")
    ax.set_title("Anatomia de um Prompt Eficaz — 5 Componentes",
                 pad=15, color="#D9B885", fontsize=13)
    plt.tight_layout()
    return save_illustration(fig, "prompt_anatomy")


def prompt_quality_curve() -> str:
    """Curva: qualidade do output vs especificidade do prompt."""
    fig, ax = plt.subplots(figsize=(10, 5))
    
    x = np.linspace(0, 10, 200)
    # Curva logarítmica: ganhos rápidos no início, saturação
    y = 9 * (1 - np.exp(-x / 3))
    
    ax.fill_between(x, 0, y, color="#C8A062", alpha=0.2)
    ax.plot(x, y, color="#D9B885", linewidth=3)
    
    # Zonas
    zones = [
        (0, 2.5, "Prompts\nvagos", "#C97064"),
        (2.5, 6, "Prompts\nbons", "#D4A574"),
        (6, 10, "Prompts\nmaster", "#7BB081"),
    ]
    for x1, x2, label, color in zones:
        ax.axvspan(x1, x2, alpha=0.08, color=color)
        ax.text((x1 + x2) / 2, 1, label, ha="center", va="center",
                fontsize=10, color=color, fontweight="bold")
    
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10)
    ax.set_xlabel("Especificidade do prompt →", fontsize=10, color="#A39684")
    ax.set_ylabel("Qualidade do output →", fontsize=10, color="#A39684")
    ax.set_title("Curva de Especificidade: quanto mais detalhe, melhor o resultado (até saturar)",
                 pad=15, color="#D9B885", fontsize=11)
    ax.grid(True, alpha=0.2, color="#A39684")
    ax.set_axisbelow(True)
    plt.tight_layout()
    return save_illustration(fig, "prompt_quality_curve")


def prompt_categories_pie() -> str:
    """Pizza: distribuição de prompts por categoria."""
    fig, ax = plt.subplots(figsize=(8, 8))
    
    cats = [
        ("Copywriting", 22, "#C8A062"),
        ("Roteiro de Reels", 18, "#D9B885"),
        ("SEO / Blog", 14, "#9B7A45"),
        ("Social Media", 12, "#D4A574"),
        ("Email Marketing", 10, "#B8945A"),
        ("Brainstorming", 9, "#C8A062"),
        ("Análise de Dados", 8, "#7B6A5A"),
        ("Criativos Avançados", 7, "#D9B885"),
    ]
    
    labels = [f"{c[0]}\n{c[1]} prompts" for c in cats]
    sizes = [c[1] for c in cats]
    colors_list = [c[2] for c in cats]
    
    wedges, texts, autotexts = ax.pie(
        sizes, labels=labels, colors=colors_list,
        autopct="%1.0f%%", startangle=90,
        wedgeprops=dict(edgecolor="#1F1A14", linewidth=2),
        textprops=dict(fontsize=9, color="#F5EFE0"),
    )
    for at in autotexts:
        at.set_color("#1F1A14")
        at.set_fontweight("bold")
        at.set_fontsize(9)
    
    ax.set_title("100+ Prompts por Categoria — Distribuição",
                 pad=20, color="#D9B885", fontsize=13, fontweight="bold")
    plt.tight_layout()
    return save_illustration(fig, "prompt_categories_pie")


def prompt_iteration_cycle() -> str:
    """Ciclo de iteração: prompt → output → análise → refinamento."""
    fig, ax = plt.subplots(figsize=(8, 8))
    
    steps = [
        ("1. PRIMEIRO\nPROMPT", "Versão inicial\nsimples", "#C8A062", 0),
        ("2. AVALIAR\nOUTPUT", "Pontuar em\n5 critérios", "#D9B885", 1),
        ("3. IDENTIFICAR\nGAPS", "O que faltou?\nO que sobrou?", "#9B7A45", 2),
        ("4. REFINAR\nPROMPT", "Adicionar contexto,\nexemplos, restrições", "#D4A574", 3),
    ]
    
    positions = [
        (0, 3), (3, 0), (0, -3), (-3, 0)
    ]
    
    for (label, sub, color, _), (x, y) in zip(steps, positions):
        circle = Circle((x, y), 1.4, facecolor=color, edgecolor="#F5EFE0", linewidth=2, alpha=0.88)
        ax.add_patch(circle)
        ax.text(x, y + 0.3, label, ha="center", va="center",
                fontsize=10, fontweight="bold", color="#1F1A14")
        ax.text(x, y - 0.5, sub, ha="center", va="center",
                fontsize=8, color="#1F1A14", style="italic")
    
    # Setas circulares
    arrow_pairs = [((1.4, 3), (3, 1.4)), ((3, -1.4), (1.4, -3)),
                   ((-1.4, -3), (-3, -1.4)), ((-3, 1.4), (-1.4, 3))]
    for (x1, y1), (x2, y2) in arrow_pairs:
        ax.annotate("", xy=(x2, y2), xytext=(x1, y1),
                    arrowprops=dict(arrowstyle="->", color="#A39684", lw=2,
                                    connectionstyle="arc3,rad=0.2"))
    
    # Centro
    central = Circle((0, 0), 0.7, facecolor="#1F1A14", edgecolor="#C8A062", linewidth=2)
    ax.add_patch(central)
    ax.text(0, 0, "CICLO\nDE IA", ha="center", va="center",
            fontsize=10, fontweight="bold", color="#C8A062")
    
    ax.set_xlim(-5.5, 5.5)
    ax.set_ylim(-5.5, 5.5)
    ax.set_aspect("equal")
    ax.axis("off")
    ax.set_title("Ciclo de Iteração de Prompts — 4 Estágios",
                 pad=15, color="#D9B885", fontsize=13)
    plt.tight_layout()
    return save_illustration(fig, "prompt_iteration_cycle")


# =====================================================
# ILUSTRAÇÕES — 30 GANCHOS PARA REELS
# =====================================================

def hook_retention_curve() -> str:
    """Curva de retenção: comparando gancho forte vs fraco."""
    fig, ax = plt.subplots(figsize=(10, 5))
    
    t = np.linspace(0, 15, 100)
    # Gancho forte: alta retenção inicial, queda suave
    strong = 100 * np.exp(-t / 25) * (1 - 0.3 * (t / 15))
    # Gancho fraco: queda acentuada logo no início
    weak = 100 * np.exp(-t / 4) * (1 - 0.1 * (t / 15))
    
    ax.plot(t, strong, color="#7BB081", linewidth=3, label="Gancho forte (top 10%)")
    ax.fill_between(t, 0, strong, color="#7BB081", alpha=0.15)
    ax.plot(t, weak, color="#C97064", linewidth=3, label="Gancho fraco (bottom 25%)")
    ax.fill_between(t, 0, weak, color="#C97064", alpha=0.15)
    
    # Linha crítica dos 3 segundos
    ax.axvline(x=3, color="#D9B885", linewidth=1.5, linestyle="--", alpha=0.7)
    ax.text(3.2, 95, "3s — decisão\nde continuar", fontsize=9, color="#D9B885",
            fontweight="bold")
    
    ax.set_xlim(0, 15)
    ax.set_ylim(0, 105)
    ax.set_xlabel("Segundos", fontsize=10, color="#A39684")
    ax.set_ylabel("% da audiência assistindo", fontsize=10, color="#A39684")
    ax.set_title("Curva de Retenção: Gancho Forte vs Fraco",
                 pad=15, color="#D9B885", fontsize=12)
    ax.legend(loc="upper right", fontsize=9)
    ax.grid(True, alpha=0.2, color="#A39684")
    ax.set_axisbelow(True)
    plt.tight_layout()
    return save_illustration(fig, "hook_retention_curve")


def hook_categories_grid() -> str:
    """Grid 6x5 de 30 ganchos agrupados por categoria."""
    fig, ax = plt.subplots(figsize=(11, 7))
    
    cats = [
        ("PERGUNTA", "#C8A062", ["1. Pergunta aberta", "2. Pergunta polarizante",
                                  "3. Pergunta sim/não", "4. Pergunta retórica",
                                  "5. Pergunta hipotética"]),
        ("STAT", "#D9B885", ["6. Stat chocante", "7. Stat contraditória",
                              "8. Stat negada", "9. Stat localizada",
                              "10. Stat + tempo"]),
        ("HISTÓRIA", "#9B7A45", ["11. Antes/depois", "12. Story pessoal",
                                  "13. Bastidor", "14. Confissão",
                                  "15. Falha pública"]),
        ("PROMESSA", "#D4A574", ["16. Promessa clara", "17. Lista numerada",
                                  "18. Resultado em X dias", "19. Solução secreta",
                                  "20. Comparativo direto"]),
        ("CONFLITO", "#B8945A", ["21. Polêmica declarada", "22. Mito vs verdade",
                                  "23. Erro comum exposto", "24. Contra senso comum",
                                  "25. Pegadinha revelada"]),
        ("CURIOSIDADE", "#7B6A5A", ["26. Mistério parcial", "27. Plot twist",
                                     "28. Quase revela", "29. Enigma",
                                     "30. CTA inverso"]),
    ]
    
    for i, (cat_name, color, hooks) in enumerate(cats):
        col = i % 3
        row = i // 3
        x0 = col * 3.4
        y0 = (1 - row) * 3.4
        
        # Cabeçalho da categoria
        rect = FancyBboxPatch((x0, y0 + 2.5), 3.2, 0.7,
                              boxstyle="round,pad=0.05",
                              facecolor=color, edgecolor="#F5EFE0",
                              linewidth=1.2, alpha=0.9)
        ax.add_patch(rect)
        ax.text(x0 + 1.6, y0 + 2.85, cat_name, ha="center", va="center",
                fontsize=10, fontweight="bold", color="#1F1A14")
        
        # Hooks da categoria
        for j, h in enumerate(hooks):
            ax.text(x0 + 0.1, y0 + 2.2 - j * 0.4, h, ha="left", va="center",
                    fontsize=8, color="#F5EFE0")
    
    ax.set_xlim(-0.3, 10.3)
    ax.set_ylim(-0.3, 7)
    ax.axis("off")
    ax.set_title("30 Ganchos Agrupados por Categoria (6 famílias × 5 ganchos)",
                 pad=15, color="#D9B885", fontsize=12)
    plt.tight_layout()
    return save_illustration(fig, "hook_categories_grid")


def hook_decision_tree() -> str:
    """Árvore de decisão: qual gancho usar para qual objetivo."""
    fig, ax = plt.subplots(figsize=(10, 6))
    
    # Nó raiz
    root = FancyBboxPatch((4, 5), 2.5, 0.8, boxstyle="round,pad=0.05",
                          facecolor="#C8A062", edgecolor="#F5EFE0", linewidth=1.5)
    ax.add_patch(root)
    ax.text(5.25, 5.4, "Qual seu objetivo?", ha="center", va="center",
            fontsize=11, fontweight="bold", color="#1F1A14")
    
    # Nós filhos nível 1
    nodes_l1 = [
        ("Conscientizar", 1, 3.5, "#D9B885"),
        ("Vender", 4, 3.5, "#9B7A45"),
        ("Educar", 7, 3.5, "#D4A574"),
        ("Entreter", 10, 3.5, "#B8945A"),
    ]
    for label, x, y, color in nodes_l1:
        rect = FancyBboxPatch((x - 0.2, y), 1.8, 0.7, boxstyle="round,pad=0.05",
                              facecolor=color, edgecolor="#F5EFE0", linewidth=1.2, alpha=0.88)
        ax.add_patch(rect)
        ax.text(x + 0.7, y + 0.35, label, ha="center", va="center",
                fontsize=9, fontweight="bold", color="#1F1A14")
        ax.annotate("", xy=(x + 0.7, y + 0.7), xytext=(5.25, 5),
                    arrowprops=dict(arrowstyle="->", color="#A39684", lw=1.2))
    
    # Nós folha (ganchos recomendados)
    leaves = [
        (1, 2, "Stat chocante\nou Pergunta"),
        (4, 2, "Promessa clara\nou Resultado"),
        (7, 2, "Lista numerada\nou Pergunta retórica"),
        (10, 2, "Plot twist\nou Story pessoal"),
    ]
    for x, y, label in leaves:
        ax.text(x + 0.7, y - 0.3, label, ha="center", va="center",
                fontsize=9, color="#F5EFE0", style="italic",
                bbox=dict(boxstyle="round,pad=0.3", facecolor="#2A231C",
                          edgecolor="#C8A062", linewidth=1))
        ax.annotate("", xy=(x + 0.7, y + 0.1), xytext=(x + 0.7, y + 0.6),
                    arrowprops=dict(arrowstyle="->", color="#A39684", lw=1.2))
    
    ax.set_xlim(0, 12)
    ax.set_ylim(0.5, 6.2)
    ax.axis("off")
    ax.set_title("Árvore de Decisão — Qual Gancho Usar?",
                 pad=15, color="#D9B885", fontsize=13)
    plt.tight_layout()
    return save_illustration(fig, "hook_decision_tree")


def hook_timing_chart() -> str:
    """Tempo ideal de gancho por plataforma."""
    fig, ax = plt.subplots(figsize=(10, 5))
    
    platforms = ["Instagram\nReels", "TikTok", "YouTube\nShorts", "YouTube\nLongo", "LinkedIn"]
    ideal_time = [1.5, 1.0, 1.8, 8.0, 4.0]  # segundos
    max_retain = [85, 90, 82, 65, 70]  # % 
    
    x = np.arange(len(platforms))
    
    ax2 = ax.twinx()
    bars = ax.bar(x, ideal_time, color="#C8A062", edgecolor="#F5EFE0",
                  linewidth=0.5, alpha=0.85, label="Tempo ideal do gancho (s)")
    ax2.plot(x, max_retain, color="#D9B885", linewidth=3, marker="o",
             markersize=10, markerfacecolor="#9B7A45",
             markeredgecolor="#F5EFE0", label="Retenção máxima (%)")
    
    for bar, v in zip(bars, ideal_time):
        ax.text(bar.get_x() + bar.get_width() / 2, v + 0.2, f"{v}s",
                ha="center", fontsize=10, color="#F5EFE0", fontweight="bold")
    for xi, v in zip(x, max_retain):
        ax2.text(xi, v + 2, f"{v}%", ha="center", fontsize=10,
                 color="#D9B885", fontweight="bold")
    
    ax.set_xticks(x)
    ax.set_xticklabels(platforms, fontsize=9)
    ax.set_ylim(0, 10)
    ax2.set_ylim(0, 100)
    ax.set_ylabel("Tempo ideal (segundos)", fontsize=10, color="#A39684")
    ax2.set_ylabel("Retenção máxima (%)", fontsize=10, color="#A39684")
    ax.set_title("Tempo Ideal do Gancho por Plataforma",
                 pad=15, color="#D9B885", fontsize=12)
    ax.grid(True, alpha=0.2, color="#A39684", axis="y")
    ax.set_axisbelow(True)
    
    lines1, labels1 = ax.get_legend_handles_labels()
    lines2, labels2 = ax2.get_legend_handles_labels()
    ax.legend(lines1 + lines2, labels1 + labels2, loc="upper left", fontsize=9)
    plt.tight_layout()
    return save_illustration(fig, "hook_timing_chart")


# =====================================================
# ILUSTRAÇÕES — MANUAL DA EDIÇÃO PREMIUM
# =====================================================

def editing_workflow_diagram() -> str:
    """Diagrama do workflow de edição premium."""
    fig, ax = plt.subplots(figsize=(10, 6))
    
    steps = [
        ("1. INGEST", "Importar\nfootage bruto", "#C8A062", 0),
        ("2. SELEÇÃO", "Pick best takes\norganizar por cena", "#D9B885", 1),
        ("3. ROUGH CUT", "Montagem inicial\nsequência lógica", "#9B7A45", 2),
        ("4. REFINO", "Cortes finos\nritmo e pacing", "#D4A574", 3),
        ("5. COLOR", "Color grading\nLUTs + ajuste", "#B8945A", 4),
        ("6. SOUND", "Sound design\nmix + master", "#C8A062", 5),
        ("7. GRAPHICS", "Texto + motion\n+ títulos", "#D9B885", 6),
        ("8. EXPORT", "Render final\nmultiplataforma", "#9B7A45", 7),
    ]
    
    # Layout em zig-zag
    positions = []
    for i in range(len(steps)):
        if i < 4:
            positions.append((i * 2.5, 4))
        else:
            positions.append(((7 - i) * 2.5, 1.5))
    
    for (label, sub, color, idx), (x, y) in zip(steps, positions):
        rect = FancyBboxPatch(
            (x, y), 2.2, 1.3,
            boxstyle="round,pad=0.08",
            facecolor=color, edgecolor="#F5EFE0", linewidth=1.5, alpha=0.88,
        )
        ax.add_patch(rect)
        ax.text(x + 1.1, y + 1, label, ha="center", va="center",
                fontsize=10, fontweight="bold", color="#1F1A14")
        ax.text(x + 1.1, y + 0.4, sub, ha="center", va="center",
                fontsize=8, color="#1F1A14")
    
    # Setas
    for i in range(len(positions) - 1):
        x1, y1 = positions[i]
        x2, y2 = positions[i + 1]
        # Ajusta para sair da direita e entrar na esquerda da próxima
        if i == 3:
            # Seta vertical descendo
            ax.annotate("", xy=(x2 + 1.1, y2 + 1.4), xytext=(x1 + 1.1, y1),
                        arrowprops=dict(arrowstyle="->", color="#A39684", lw=2,
                                        connectionstyle="arc3,rad=0"))
        else:
            ax.annotate("", xy=(x2, y2 + 0.65), xytext=(x1 + 2.2, y1 + 0.65),
                        arrowprops=dict(arrowstyle="->", color="#A39684", lw=2))
    
    ax.set_xlim(-0.5, 10.5)
    ax.set_ylim(0.5, 6)
    ax.axis("off")
    ax.set_title("Workflow de Edição Premium — 8 Estágios",
                 pad=15, color="#D9B885", fontsize=13)
    plt.tight_layout()
    return save_illustration(fig, "editing_workflow_diagram")


def pacing_chart() -> str:
    """Gráfico de pacing: cortes por minuto ao longo de formatos."""
    fig, ax = plt.subplots(figsize=(10, 5))
    
    formats = ["Reels 15s", "Reels 30s", "Reels 60s", "Shorts 60s", "YouTube\nLongo 10min", "Podcast\nclip"]
    cuts_per_min = [40, 32, 22, 18, 12, 8]
    
    bars = ax.bar(formats, cuts_per_min, color=["#C8A062", "#D9B885", "#9B7A45",
                                                  "#D4A574", "#B8945A", "#7B6A5A"],
                  edgecolor="#F5EFE0", linewidth=0.5)
    
    for bar, v in zip(bars, cuts_per_min):
        ax.text(bar.get_x() + bar.get_width() / 2, v + 0.8, f"{v}/min",
                ha="center", fontsize=10, color="#F5EFE0", fontweight="bold")
    
    ax.set_ylim(0, 50)
    ax.set_ylabel("Cortes por minuto", fontsize=10, color="#A39684")
    ax.set_title("Pacing Ideal por Formato — Cortes por Minuto",
                 pad=15, color="#D9B885", fontsize=12)
    ax.grid(True, axis="y", alpha=0.2, color="#A39684")
    ax.set_axisbelow(True)
    plt.tight_layout()
    return save_illustration(fig, "pacing_chart")


def color_grading_wheel() -> str:
    """Roda de color grading — looks populares."""
    fig, ax = plt.subplots(figsize=(9, 8))
    
    looks = [
        ("Teal & Orange", "#1F5A6E", "#D4762A", "Cinema clássico\nSombras frias / pele quente"),
        ("Bronze Warm", "#9B7A45", "#F5EFE0", "Tom premium\nMarca pessoal"),
        ("Noir B&W", "#2A231C", "#F5EFE0", "Dramático\nAlto contraste"),
        ("Vintage Film", "#7B5A3E", "#E8C99B", "Nostálgico\nGrão + fade"),
        ("Cyber Neon", "#3A1F4E", "#D9A574", "Futurista\nHightlights saturados"),
        ("Documentário", "#5A4E3A", "#E8DCC4", "Natural\nMinimalista"),
    ]
    
    n = len(looks)
    angles = np.linspace(0, 2 * np.pi, n, endpoint=False)
    
    for i, (name, c1, c2, desc) in enumerate(looks):
        angle = angles[i]
        mid = angle + (2 * np.pi / n) / 2
        
        # Wedge com gradiente simulado
        wedge = Wedge((0, 0), 1.2, np.degrees(angle), np.degrees(angles[(i + 1) % n]),
                      facecolor=c1, edgecolor="#1F1A14", linewidth=2, alpha=0.85)
        ax.add_patch(wedge)
        
        x = 0.85 * np.cos(mid)
        y = 0.85 * np.sin(mid)
        ax.text(x, y, name, ha="center", va="center",
                fontsize=10, fontweight="bold", color=c2)
        
        x2 = 1.5 * np.cos(mid)
        y2 = 1.5 * np.sin(mid)
        ax.text(x2, y2, desc, ha="center", va="center",
                fontsize=8, color="#F5EFE0", style="italic")
    
    # Centro
    central = Circle((0, 0), 0.35, facecolor="#1F1A14", edgecolor="#C8A062", linewidth=2)
    ax.add_patch(central)
    ax.text(0, 0, "Color\nGrading", ha="center", va="center",
            fontsize=10, fontweight="bold", color="#C8A062")
    
    ax.set_xlim(-2.2, 2.2)
    ax.set_ylim(-2.2, 2.2)
    ax.set_aspect("equal")
    ax.axis("off")
    ax.set_title("6 Looks de Color Grading Populares",
                 pad=15, color="#D9B885", fontsize=13, fontweight="bold")
    plt.tight_layout()
    return save_illustration(fig, "color_grading_wheel")


def retention_dropoff_chart() -> str:
    """Gráfico: onde a audiência abandona o vídeo."""
    fig, ax = plt.subplots(figsize=(10, 5))
    
    t = np.linspace(0, 60, 100)
    # Retenção típica de Reels de 60s
    base = 100 * np.exp(-t / 35)
    # Adiciona o "death valley" entre 15-25s
    valley = -15 * np.exp(-((t - 20) ** 2) / 30)
    # Boost no final com CTA
    boost = 8 * np.exp(-((t - 55) ** 2) / 30)
    retention = base + valley + boost
    retention = np.clip(retention, 0, 100)
    
    ax.fill_between(t, 0, retention, color="#C8A062", alpha=0.2)
    ax.plot(t, retention, color="#D9B885", linewidth=3)
    
    # Anotações das zonas críticas
    ax.annotate("Gancho\n0-3s", xy=(1.5, retention[2]), xytext=(3, 95),
                fontsize=9, color="#7BB081", fontweight="bold",
                arrowprops=dict(arrowstyle="->", color="#7BB081"))
    ax.annotate("Death valley\n15-25s", xy=(20, retention[33]), xytext=(28, 75),
                fontsize=9, color="#C97064", fontweight="bold",
                arrowprops=dict(arrowstyle="->", color="#C97064"))
    ax.annotate("Boost CTA\n55-60s", xy=(56, retention[93]), xytext=(38, 55),
                fontsize=9, color="#D9B885", fontweight="bold",
                arrowprops=dict(arrowstyle="->", color="#D9B885"))
    
    ax.set_xlim(0, 60)
    ax.set_ylim(0, 105)
    ax.set_xlabel("Segundos", fontsize=10, color="#A39684")
    ax.set_ylabel("% da audiência", fontsize=10, color="#A39684")
    ax.set_title("Curva de Retenção — Zonas Críticas de Abandono",
                 pad=15, color="#D9B885", fontsize=12)
    ax.grid(True, alpha=0.2, color="#A39684")
    ax.set_axisbelow(True)
    plt.tight_layout()
    return save_illustration(fig, "retention_dropoff_chart")


def tool_comparison_table() -> str:
    """Comparação visual de CapCut, Premiere, DaVinci."""
    fig, ax = plt.subplots(figsize=(10, 5.5))
    
    tools = ["CapCut", "Premiere Pro", "DaVinci Resolve"]
    metrics = ["Curva de\naprendizado", "Recursos\npremium", "Color grading", "Performance", "Custo-benefício"]
    # Scores 0-10
    scores = [
        [9.0, 6.5, 5.5, 8.5, 9.5],   # CapCut
        [7.0, 9.0, 7.5, 7.0, 5.5],   # Premiere
        [5.5, 9.5, 9.5, 8.0, 9.0],   # DaVinci
    ]
    colors_tools = ["#C8A062", "#D9B885", "#9B7A45"]
    
    x = np.arange(len(metrics))
    w = 0.27
    
    for i, (tool, sc, color) in enumerate(zip(tools, scores, colors_tools)):
        offset = (i - 1) * w
        bars = ax.bar(x + offset, sc, w, label=tool, color=color,
                      edgecolor="#F5EFE0", linewidth=0.5)
        for bar, v in zip(bars, sc):
            ax.text(bar.get_x() + bar.get_width() / 2, v + 0.15, f"{v}",
                    ha="center", fontsize=8, color="#F5EFE0", fontweight="bold")
    
    ax.set_xticks(x)
    ax.set_xticklabels(metrics, fontsize=9)
    ax.set_ylim(0, 11)
    ax.set_ylabel("Score (0-10)", fontsize=10, color="#A39684")
    ax.set_title("CapCut vs Premiere vs DaVinci — Comparativo",
                 pad=15, color="#D9B885", fontsize=12)
    ax.legend(loc="lower right", fontsize=9)
    ax.grid(True, axis="y", alpha=0.2, color="#A39684")
    ax.set_axisbelow(True)
    plt.tight_layout()
    return save_illustration(fig, "tool_comparison_table")


def generate_all() -> Dict[str, str]:
    """Gera todas as ilustrações e retorna dict name→path."""
    return {
        "three_act_structure": three_act_structure(),
        "narrative_arc": narrative_arc(),
        "emotional_hooks_wheel": emotional_hooks_wheel(),
        "hook_performance_chart": hook_performance_chart(),
        "content_framework_diagram": content_framework_diagram(),
        "audience_archetypes": audience_archetypes(),
        "story_vs_pitch_comparison": story_vs_pitch_comparison(),
        # IA para criadores
        "ai_stack_diagram": ai_stack_diagram(),
        "llm_comparison_chart": llm_comparison_chart(),
        "ai_workflow_funnel": ai_workflow_funnel(),
        "ai_adoption_growth": ai_adoption_growth(),
        "ai_ethics_radar": ai_ethics_radar(),
        # Prompts premium
        "prompt_anatomy": prompt_anatomy(),
        "prompt_quality_curve": prompt_quality_curve(),
        "prompt_categories_pie": prompt_categories_pie(),
        "prompt_iteration_cycle": prompt_iteration_cycle(),
        # 30 ganchos
        "hook_retention_curve": hook_retention_curve(),
        "hook_categories_grid": hook_categories_grid(),
        "hook_decision_tree": hook_decision_tree(),
        "hook_timing_chart": hook_timing_chart(),
        # Manual edição
        "editing_workflow_diagram": editing_workflow_diagram(),
        "pacing_chart": pacing_chart(),
        "color_grading_wheel": color_grading_wheel(),
        "retention_dropoff_chart": retention_dropoff_chart(),
        "tool_comparison_table": tool_comparison_table(),
    }


if __name__ == "__main__":
    paths = generate_all()
    print(f"✅ {len(paths)} ilustrações geradas:")
    for name, path in paths.items():
        print(f"  • {name}: {path}")
