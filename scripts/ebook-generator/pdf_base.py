"""
Framework base para geração de e-books PDF profissionais.
Paleta bronze/escuro OKLCH igual ao site.
"""
import os
import io
from typing import Optional, List, Dict, Any, Union
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm, mm
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    PageBreak,
    Image as RLImage,
    Table,
    TableStyle,
    KeepTogether,
    ListFlowable,
    ListItem,
    Flowable,
    HRFlowable,
)
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import matplotlib.font_manager as fm

# === PALETA DE CORES (igual ao site OKLCH convertido para HEX aproximado) ===
# background: oklch(0.15 0.004 60) → grafite escuro
# foreground: oklch(0.96 0.006 80) → off-white
# primary:    oklch(0.75 0.088 62) → bronze desaturated
# gradient-orange: linear-gradient(180deg, oklch(0.78 0.082 64), oklch(0.73 0.09 60))

COLORS = {
    "background": "#1F1A14",       # grafite bronze escuro
    "background_alt": "#2A231C",   # card
    "foreground": "#F5EFE0",       # off-white quente
    "muted": "#A39684",            # muted-foreground
    "primary": "#C8A062",          # bronze desaturated
    "primary_light": "#D9B885",    # bronze claro
    "primary_dark": "#9B7A45",     # bronze escuro
    "accent_orange": "#D4A574",    # laranja bronze
    "border": "#3A332A",           # borda
    "success": "#7BB081",          # verde sucesso
    "warning": "#D4A574",          # ambar
    "danger": "#C97064",           # vermelho terroso
}

# === FONTES ===
# Usa fontes built-in do ReportLab para evitar problemas de registro
# Helvetica = sans-serif, Times-Roman = serif (equivalentes a Arial/Times)
FONTS_REGISTERED = False  # Mantém False para usar built-in

def register_fonts():
    global FONTS_REGISTERED
    # Tenta registrar DejaVu para ter Unicode completo (acentos)
    try:
        from reportlab.pdfbase.ttfonts import TTFont
        from reportlab.pdfbase.pdfmetrics import registerFontFamily
        
        dejavu_paths = {
            "Body": "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "Body-Bold": "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "Body-Italic": "/usr/share/fonts/truetype/dejavu/DejaVuSans-Oblique.ttf",
            "Body-BoldItalic": "/usr/share/fonts/truetype/dejavu/DejaVuSans-BoldOblique.ttf",
            "Display": "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf",
            "Display-Bold": "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf",
            "Display-Italic": "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Italic.ttf",
            "Display-BoldItalic": "/usr/share/fonts/truetype/dejavu/DejaVuSerif-BoldItalic.ttf",
            "Mono": "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
        }
        
        import os
        all_ok = True
        for family, path in dejavu_paths.items():
            if os.path.exists(path):
                try:
                    pdfmetrics.registerFont(TTFont(family, path))
                except Exception:
                    all_ok = False
            else:
                all_ok = False
        
        if all_ok:
            registerFontFamily("Body",
                normal="Body", bold="Body-Bold",
                italic="Body-Italic", boldItalic="Body-BoldItalic")
            registerFontFamily("Display",
                normal="Display", bold="Display-Bold",
                italic="Display-Italic", boldItalic="Display-BoldItalic")
            FONTS_REGISTERED = True
    except Exception:
        FONTS_REGISTERED = False


def get_styles() -> Dict[str, ParagraphStyle]:
    """Retorna estilos para diferentes elementos do e-book."""
    register_fonts()
    
    body_font = "Body" if FONTS_REGISTERED else "Helvetica"
    body_bold = "Body-Bold" if FONTS_REGISTERED else "Helvetica-Bold"
    display = "Display" if FONTS_REGISTERED else "Times-Roman"
    display_bold = "Display-Bold" if FONTS_REGISTERED else "Times-Bold"
    mono = "Mono" if FONTS_REGISTERED else "Courier"
    
    styles = {
        "Cover_Eyebrow": ParagraphStyle(
            "Cover_Eyebrow", fontName=body_bold, fontSize=11, textColor=COLORS["primary"],
            alignment=TA_CENTER, spaceAfter=20, leading=14, letterSpacing=2,
        ),
        "Cover_Title": ParagraphStyle(
            "Cover_Title", fontName=display_bold, fontSize=44, textColor=COLORS["foreground"],
            alignment=TA_CENTER, leading=52, spaceAfter=12,
        ),
        "Cover_Subtitle": ParagraphStyle(
            "Cover_Subtitle", fontName=display, fontSize=18, textColor=COLORS["primary_light"],
            alignment=TA_CENTER, leading=24, spaceAfter=24, fontStyle="italic",
        ),
        "Cover_Author": ParagraphStyle(
            "Cover_Author", fontName=body_bold, fontSize=14, textColor=COLORS["muted"],
            alignment=TA_CENTER, leading=18, spaceAfter=8,
        ),
        "Cover_Site": ParagraphStyle(
            "Cover_Site", fontName=body_font, fontSize=11, textColor=COLORS["muted"],
            alignment=TA_CENTER, leading=14,
        ),
        
        "TOC_Title": ParagraphStyle(
            "TOC_Title", fontName=display_bold, fontSize=28, textColor=COLORS["primary"],
            alignment=TA_LEFT, spaceAfter=24, leading=34,
        ),
        "TOC_Item": ParagraphStyle(
            "TOC_Item", fontName=body_font, fontSize=12, textColor=COLORS["foreground"],
            alignment=TA_LEFT, leading=22, leftIndent=12, spaceAfter=2,
        ),
        "TOC_Item_H2": ParagraphStyle(
            "TOC_Item_H2", fontName=body_font, fontSize=10, textColor=COLORS["muted"],
            alignment=TA_LEFT, leading=16, leftIndent=28, spaceAfter=1,
        ),
        
        "Chapter_Number": ParagraphStyle(
            "Chapter_Number", fontName=body_bold, fontSize=11, textColor=COLORS["primary"],
            alignment=TA_LEFT, letterSpacing=3, spaceAfter=12, leading=14,
        ),
        "Chapter_Title": ParagraphStyle(
            "Chapter_Title", fontName=display_bold, fontSize=32, textColor=COLORS["foreground"],
            alignment=TA_LEFT, leading=40, spaceAfter=16,
        ),
        "Chapter_Subtitle": ParagraphStyle(
            "Chapter_Subtitle", fontName=display, fontSize=14, textColor=COLORS["primary_light"],
            alignment=TA_LEFT, leading=20, spaceAfter=24, fontStyle="italic",
        ),
        
        "H2": ParagraphStyle(
            "H2", fontName=display_bold, fontSize=20, textColor=COLORS["primary"],
            alignment=TA_LEFT, leading=26, spaceBefore=18, spaceAfter=10,
        ),
        "H3": ParagraphStyle(
            "H3", fontName=body_bold, fontSize=14, textColor=COLORS["foreground"],
            alignment=TA_LEFT, leading=20, spaceBefore=14, spaceAfter=6,
        ),
        "Body": ParagraphStyle(
            "Body", fontName=body_font, fontSize=11, textColor=COLORS["foreground"],
            alignment=TA_JUSTIFY, leading=18, spaceAfter=10,
        ),
        "Body_Lead": ParagraphStyle(
            "Body_Lead", fontName=body_font, fontSize=13, textColor=COLORS["foreground"],
            alignment=TA_JUSTIFY, leading=20, spaceAfter=12,
        ),
        "Quote": ParagraphStyle(
            "Quote", fontName=display, fontSize=14, textColor=COLORS["primary_light"],
            alignment=TA_LEFT, leading=22, leftIndent=24, rightIndent=24,
            spaceBefore=12, spaceAfter=12, fontStyle="italic",
        ),
        "Quote_Attribution": ParagraphStyle(
            "Quote_Attribution", fontName=body_bold, fontSize=10, textColor=COLORS["muted"],
            alignment=TA_RIGHT, leading=14, spaceAfter=12,
        ),
        "List_Item": ParagraphStyle(
            "List_Item", fontName=body_font, fontSize=11, textColor=COLORS["foreground"],
            alignment=TA_LEFT, leading=18, spaceAfter=4,
        ),
        "Code": ParagraphStyle(
            "Code", fontName=mono, fontSize=9, textColor=COLORS["primary_light"],
            alignment=TA_LEFT, leading=14, leftIndent=16, rightIndent=16,
            backColor=COLORS["background_alt"], borderPadding=8, spaceAfter=10,
        ),
        "Callout_Title": ParagraphStyle(
            "Callout_Title", fontName=body_bold, fontSize=11, textColor=COLORS["primary"],
            alignment=TA_LEFT, leading=14, spaceAfter=6, letterSpacing=1,
        ),
        "Callout_Body": ParagraphStyle(
            "Callout_Body", fontName=body_font, fontSize=10, textColor=COLORS["foreground"],
            alignment=TA_LEFT, leading=16, spaceAfter=6,
        ),
        "Exercise_Title": ParagraphStyle(
            "Exercise_Title", fontName=body_bold, fontSize=12, textColor=COLORS["primary"],
            alignment=TA_LEFT, leading=16, spaceAfter=8,
        ),
        "Exercise_Body": ParagraphStyle(
            "Exercise_Body", fontName=body_font, fontSize=10, textColor=COLORS["foreground"],
            alignment=TA_LEFT, leading=16, spaceAfter=4,
        ),
        "Footer_Caption": ParagraphStyle(
            "Footer_Caption", fontName=body_font, fontSize=9, textColor=COLORS["muted"],
            alignment=TA_CENTER, leading=12, spaceBefore=6,
        ),
    }
    
    return styles


# === ILUSTRAÇÕES MATPLOTLIB ===

def configure_matplotlib():
    """Configura matplotlib para usar paleta bronze do site."""
    fm.fontManager.addfont("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf")
    fm.fontManager.addfont("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf")
    plt.rcParams.update({
        "font.family": "DejaVu Sans",
        "font.size": 10,
        "axes.facecolor": COLORS["background_alt"],
        "axes.edgecolor": COLORS["border"],
        "axes.labelcolor": COLORS["foreground"],
        "axes.titlecolor": COLORS["primary_light"],
        "axes.titleweight": "bold",
        "axes.titlesize": 12,
        "axes.labelsize": 10,
        "xtick.color": COLORS["muted"],
        "ytick.color": COLORS["muted"],
        "xtick.labelsize": 9,
        "ytick.labelsize": 9,
        "legend.facecolor": COLORS["background_alt"],
        "legend.edgecolor": COLORS["border"],
        "legend.labelcolor": COLORS["foreground"],
        "figure.facecolor": COLORS["background"],
        "figure.edgecolor": COLORS["background"],
        "savefig.facecolor": COLORS["background"],
        "savefig.edgecolor": COLORS["background"],
        "axes.spines.top": False,
        "axes.spines.right": False,
    })


def save_illustration(fig, name: str, output_dir: str = "/home/z/my-project/scripts/ebook-generator/illustrations") -> str:
    """Salva figura matplotlib como PNG de alta resolução."""
    os.makedirs(output_dir, exist_ok=True)
    path = os.path.join(output_dir, f"{name}.png")
    fig.savefig(path, dpi=200, bbox_inches="tight", facecolor=COLORS["background"])
    plt.close(fig)
    return path


def illustration_image(path: str, width: float = 14 * cm) -> RLImage:
    """Cria uma Image do ReportLab a partir de um arquivo de imagem."""
    img = RLImage(path)
    # Mantém proporção
    aspect = img.imageHeight / img.imageWidth
    img.drawWidth = width
    img.drawHeight = width * aspect
    return img


# === FLOWABLES CUSTOMIZADOS ===

class GradientBackground(Flowable):
    """Desenha um background gradiente bronze para a capa."""
    def __init__(self, width: float, height: float):
        Flowable.__init__(self)
        self.width = width
        self.height = height
    
    def draw(self):
        c = self.canv
        # Fundo escuro
        c.setFillColor(colors.HexColor(COLORS["background"]))
        c.rect(0, 0, self.width, self.height, fill=1, stroke=0)
        
        # Gradiente bronze radial no topo
        from reportlab.lib.colors import HexColor
        steps = 60
        for i in range(steps):
            t = i / steps
            # Interpola de primary para background
            r1, g1, b1 = 0xC8, 0xA0, 0x62  # primary
            r2, g2, b2 = 0x1F, 0x1A, 0x14  # background
            r = int(r1 * (1-t) + r2 * t)
            g = int(g1 * (1-t) + g2 * t)
            b = int(b1 * (1-t) + b2 * t)
            c.setFillColorRGB(r/255, g/255, b/255, alpha=1 - t*0.7)
            # Círculo concêntrico do topo
            radius = (1 - t) * self.width * 0.6
            center_x = self.width * 0.5
            center_y = self.height * 0.85
            c.circle(center_x, center_y, radius, fill=1, stroke=0)


class HRule(Flowable):
    """Linha horizontal decorativa."""
    def __init__(self, width: float, color: str = None, thickness: float = 1):
        Flowable.__init__(self)
        self.width = width
        self.color = color or COLORS["primary"]
        self.thickness = thickness
        self.height = thickness + 4
    
    def draw(self):
        c = self.canv
        c.setStrokeColor(colors.HexColor(self.color))
        c.setLineWidth(self.thickness)
        c.line(0, 2, self.width, 2)


# === PAGE TEMPLATES COM HEADER/FOOTER ===

class EbookCanvas(canvas.Canvas):
    """Canvas customizado para numerar páginas e adicionar footer."""
    
    def __init__(self, *args, **kwargs):
        canvas.Canvas.__init__(self, *args, **kwargs)
        self._saved_page_states = []
    
    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()
    
    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)
    
    def draw_page_number(self, page_count: int):
        # Não numera capa (página 1) nem sumário (página 2)
        page_num = self._pageNumber
        if page_num <= 2:
            return
        
        c = self
        w, h = A4
        
        # Footer line
        c.setStrokeColor(colors.HexColor(COLORS["border"]))
        c.setLineWidth(0.5)
        c.line(2*cm, 1.5*cm, w - 2*cm, 1.5*cm)
        
        # Page number (right)
        c.setFillColor(colors.HexColor(COLORS["muted"]))
        c.setFont("Body" if FONTS_REGISTERED else "Helvetica", 9)
        c.drawRightString(w - 2*cm, 1*cm, f"pág. {page_num - 1}")
        
        # Author/site (left)
        c.setFillColor(colors.HexColor(COLORS["muted"]))
        c.setFont("Body" if FONTS_REGISTERED else "Helvetica", 9)
        c.drawString(2*cm, 1*cm, "Clodoaldo Silva  ·  clodoaldo.vercel.app")


def build_pdf(filename: str, story: List, title: str = "E-book") -> str:
    """Monta o PDF final a partir de uma story (lista de flowables)."""
    register_fonts()
    
    # Fundo escuro em todas as páginas
    def on_page(c, doc):
        c.saveState()
        c.setFillColor(colors.HexColor(COLORS["background"]))
        c.rect(0, 0, A4[0], A4[1], fill=1, stroke=0)
        c.restoreState()
    
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=2.2*cm,
        rightMargin=2.2*cm,
        topMargin=2.5*cm,
        bottomMargin=2.5*cm,
        title=title,
        author="Clodoaldo Silva",
        subject="E-book Premium",
    )
    
    doc.build(story, onFirstPage=on_page, onLaterPages=on_page, canvasmaker=EbookCanvas)
    return filename


# === COMPONENTES REUTILIZÁVEIS ===

def cover_page(title: str, subtitle: str, author: str = "Clodoaldo Silva",
               site: str = "clodoaldo.vercel.app", eyebrow: str = "E-BOOK PREMIUM") -> List:
    """Cria a página de capa."""
    styles = get_styles()
    story = []
    # Espaço para o topo
    story.append(Spacer(1, 4*cm))
    story.append(Paragraph(eyebrow, styles["Cover_Eyebrow"]))
    story.append(Spacer(1, 1*cm))
    
    # Linha decorativa
    story.append(HRule(4*cm, COLORS["primary"], 1))
    story.append(Spacer(1, 1.5*cm))
    
    story.append(Paragraph(title, styles["Cover_Title"]))
    story.append(Spacer(1, 0.4*cm))
    story.append(Paragraph(subtitle, styles["Cover_Subtitle"]))
    
    story.append(Spacer(1, 3*cm))
    story.append(HRule(3*cm, COLORS["primary"], 1))
    story.append(Spacer(1, 0.8*cm))
    story.append(Paragraph(f"por {author}", styles["Cover_Author"]))
    story.append(Paragraph(site, styles["Cover_Site"]))
    
    story.append(PageBreak())
    return story


def toc_page(items: List[Dict[str, Any]]) -> List:
    """Cria a página de sumário.
    items: [{"title": "Capítulo 1", "page": "3", "subtitle": "...", "level": 1}]
    """
    styles = get_styles()
    story = []
    story.append(Paragraph("Sumário", styles["TOC_Title"]))
    story.append(HRule(2*cm, COLORS["primary"], 1))
    story.append(Spacer(1, 0.8*cm))
    
    for item in items:
        title = item["title"]
        page = item.get("page", "")
        level = item.get("level", 1)
        
        if level == 1:
            # Capítulo — alinha à esquerda
            line = f'<font color="#C8A062">{title}</font>'
            if page:
                line += f' <font color="#A39684">· {page}</font>'
            story.append(Paragraph(line, styles["TOC_Item"]))
        else:
            story.append(Paragraph(title, styles["TOC_Item_H2"]))
    
    story.append(PageBreak())
    return story


def chapter_header(number: str, title: str, subtitle: str = "") -> List:
    """Cria cabeçalho de capítulo (página nova)."""
    styles = get_styles()
    story = []
    story.append(PageBreak())
    story.append(Spacer(1, 2*cm))
    story.append(Paragraph(f"CAPÍTULO {number}", styles["Chapter_Number"]))
    story.append(HRule(1.5*cm, COLORS["primary"], 1))
    story.append(Spacer(1, 0.6*cm))
    story.append(Paragraph(title, styles["Chapter_Title"]))
    if subtitle:
        story.append(Paragraph(subtitle, styles["Chapter_Subtitle"]))
    story.append(Spacer(1, 0.4*cm))
    return story


def h2(text: str) -> Paragraph:
    styles = get_styles()
    return Paragraph(text, styles["H2"])


def h3(text: str) -> Paragraph:
    styles = get_styles()
    return Paragraph(text, styles["H3"])


def body(text: str) -> Paragraph:
    styles = get_styles()
    return Paragraph(text, styles["Body"])


def body_lead(text: str) -> Paragraph:
    styles = get_styles()
    return Paragraph(text, styles["Body_Lead"])


def quote(text: str, attribution: str = "") -> List:
    styles = get_styles()
    out = [Paragraph(f"&ldquo;{text}&rdquo;", styles["Quote"])]
    if attribution:
        out.append(Paragraph(f"— {attribution}", styles["Quote_Attribution"]))
    return out


def bullet_list(items: List[str], style_key: str = "List_Item") -> ListFlowable:
    styles = get_styles()
    items_flow = [Paragraph(item, styles[style_key]) for item in items]
    return ListFlowable(
        [ListItem(it, leftIndent=20, bulletColor=colors.HexColor(COLORS["primary"])) for it in items_flow],
        bulletType="bullet",
        bulletFontName="Body-Bold" if FONTS_REGISTERED else "Helvetica-Bold",
        bulletFontSize=10,
        leftIndent=20,
        bulletColor=colors.HexColor(COLORS["primary"]),
    )


def numbered_list(items: List[str]) -> ListFlowable:
    styles = get_styles()
    items_flow = [Paragraph(item, styles["List_Item"]) for item in items]
    return ListFlowable(
        [ListItem(it, leftIndent=24) for it in items_flow],
        bulletType="1",
        bulletFontName="Body-Bold" if FONTS_REGISTERED else "Helvetica-Bold",
        bulletFontSize=10,
        bulletColor=colors.HexColor(COLORS["primary"]),
        leftIndent=24,
    )


def callout(title: str, body_text: str, color: str = None) -> Table:
    """Cria um callout com fundo bronze."""
    styles = get_styles()
    bg = color or COLORS["background_alt"]
    border_color = COLORS["primary"]
    
    inner = [
        [Paragraph(title, styles["Callout_Title"])],
        [Paragraph(body_text, styles["Callout_Body"])],
    ]
    
    t = Table(inner, colWidths=[15*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor(bg)),
        ("BOX", (0, 0), (-1, -1), 1, colors.HexColor(border_color)),
        ("LEFTPADDING", (0, 0), (-1, -1), 14),
        ("RIGHTPADDING", (0, 0), (-1, -1), 14),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("LINEBEFORE", (0, 0), (0, -1), 3, colors.HexColor(border_color)),
    ]))
    return t


def exercise_box(title: str, items: List[str]) -> Table:
    """Cria uma caixa de exercício prático."""
    styles = get_styles()
    
    content = [Paragraph(f"🎯 {title}", styles["Exercise_Title"])]
    for i, item in enumerate(items, 1):
        content.append(Paragraph(f"<b>{i}.</b> {item}", styles["Exercise_Body"]))
    
    inner = [[c] for c in content]
    t = Table(inner, colWidths=[15*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor(COLORS["background_alt"])),
        ("BOX", (0, 0), (-1, -1), 1, colors.HexColor(COLORS["success"])),
        ("LEFTPADDING", (0, 0), (-1, -1), 14),
        ("RIGHTPADDING", (0, 0), (-1, -1), 14),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("LINEBEFORE", (0, 0), (0, -1), 3, colors.HexColor(COLORS["success"])),
    ]))
    return t


def data_table(headers: List[str], rows: List[List[str]]) -> Table:
    """Cria tabela de dados com header bronze."""
    styles = get_styles()
    
    data = [headers] + rows
    header_color = COLORS["primary"]
    row_alt = COLORS["background_alt"]
    
    t = Table(data, colWidths=[None] * len(headers), repeatRows=1)
    t.setStyle(TableStyle([
        # Header
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor(header_color)),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor(COLORS["background"])),
        ("FONTNAME", (0, 0), (-1, 0), "Body-Bold" if FONTS_REGISTERED else "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 10),
        ("ALIGN", (0, 0), (-1, 0), "LEFT"),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
        ("TOPPADDING", (0, 0), (-1, 0), 8),
        # Body
        ("FONTNAME", (0, 1), (-1, -1), "Body" if FONTS_REGISTERED else "Helvetica"),
        ("FONTSIZE", (0, 1), (-1, -1), 10),
        ("TEXTCOLOR", (0, 1), (-1, -1), colors.HexColor(COLORS["foreground"])),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor(COLORS["background"]), colors.HexColor(row_alt)]),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 1), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 1), (-1, -1), 6),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor(COLORS["border"])),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    return t


def page_break() -> PageBreak:
    return PageBreak()


def spacer(height: float = 0.4) -> Spacer:
    return Spacer(1, height * cm)


def horizontal_rule(width: float = 2, color: str = None, thickness: float = 1) -> HRule:
    return HRule(width * cm, color, thickness)
