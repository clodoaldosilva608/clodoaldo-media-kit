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
    }


if __name__ == "__main__":
    paths = generate_all()
    print(f"✅ {len(paths)} ilustrações geradas:")
    for name, path in paths.items():
        print(f"  • {name}: {path}")
