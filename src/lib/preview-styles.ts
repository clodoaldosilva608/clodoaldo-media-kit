/**
 * Estilos de design premium para previews de site.
 *
 * 4 estilos originais criados do zero (não copiados de nenhum marketplace):
 * 1. "dark" — Dark Premium (glassmorphism, gradientes, sombras)
 * 2. "light" — Light Minimal (fundo claro, tipografia grande, whitespace)
 * 3. "bold" — Bold Editorial (cores vibrantes, tipografia gigante, assimétrico)
 * 4. "elegant" — Elegant Classic (serifas, paleta sofisticada, elegante)
 *
 * Cada estilo recebe:
 *  - cfg: NicheConfig (conteúdo do nicho)
 *  - ctx: { lead, wa, maps, embed, n, city } (dados do lead)
 *
 * Cada estilo retorna HTML completo (<!DOCTYPE html>...</html>).
 */

export interface StyleContext {
  lead: {
    name: string;
    formatted_address?: string;
    phone?: string | null;
    whatsapp?: string | null;
    instagram?: string | null;
    facebook?: string | null;
    rating?: number | null;
    user_ratings_total?: number | null;
    lat?: number;
    lng?: number;
  };
  wa: string;
  maps: string;
  embed: string;
  n: string;
  city: string;
}

export interface NicheConfig {
  colors: { primary: string; accent: string; dark: string; light: string };
  heroBadge: string;
  heroTitle: (name: string) => string;
  heroSubtitle: (city: string) => string;
  searchPlaceholder: string;
  marqueeWords: string[];
  categoryPills: string[];
  sectionTitle: string;
  sectionSub: string;
  features: { emoji: string; tag: string; title: string; desc: string }[];
  testimonials: { name: string; text: string; rating: number }[];
  aboutText: (name: string, niche: string, city: string, rating?: number | null, total?: number | null) => string;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButton: string;
  galleryEmojis: string[];
}

export interface PreviewStyle {
  id: string;
  name: string;
  description: string;
  emoji: string;
  render: (cfg: NicheConfig, ctx: StyleContext) => string;
}

// =====================================================
// ESTILO 1: DARK PREMIUM
// Glassmorphism, gradientes, sombras profundas
// =====================================================
const styleDark: PreviewStyle = {
  id: "dark",
  name: "Dark Premium",
  description: "Fundo escuro com glassmorphism e gradientes",
  emoji: "🌙",
  render: (cfg, ctx) => {
    const { lead, wa, maps, embed, n, city } = ctx;
    const c = cfg.colors;
    const featuresHtml = cfg.features.map(f => `
      <div class="feature-card">
        <div class="feature-img">${f.emoji}</div>
        <div class="feature-body">
          <span class="feature-tag">${f.tag}</span>
          <h3>${f.title}</h3>
          <p>${f.desc}</p>
        </div>
      </div>`).join("");
    const pillsHtml = cfg.categoryPills.map((p, i) => `<div class="cat-pill ${i===0?"active":""}">${p}</div>`).join("");
    const marqueeHtml = [...cfg.marqueeWords, ...cfg.marqueeWords].map(w => `<span class="marquee-item">${w}</span><span class="marquee-dot">•</span>`).join("");
    const testimonialsHtml = cfg.testimonials.map(t => `<div class="testimonial"><div class="testimonial-stars">${"★".repeat(t.rating)}${"☆".repeat(5-t.rating)}</div><p>"${t.text}"</p><div class="testimonial-author">— ${t.name}</div></div>`).join("");
    const galleryHtml = cfg.galleryEmojis.map(e => `<div class="gallery-item">${e}</div>`).join("");

    return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${lead.name} | ${n} em ${city}</title><meta name="theme-color" content="${c.dark}"><style>
*{margin:0;padding:0;box-sizing:border-box;font-family:'Inter',-apple-system,system-ui,sans-serif}
body{background:${c.dark};color:#fff;overflow-x:hidden}
a{text-decoration:none;color:inherit}
.nav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(10,10,10,0.7);backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,0.06)}
.nav-inner{max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;padding:0 24px;height:72px}
.nav-logo{font-size:1.4rem;font-weight:800;letter-spacing:-0.5px}
.nav-logo span{color:${c.primary}}
.nav-links{display:flex;align-items:center;gap:28px}
.nav-links a{color:rgba(255,255,255,0.7);font-size:.9rem;font-weight:500;transition:color .2s}
.nav-links a:hover{color:#fff}
.nav-cta{background:${c.primary};color:#fff;padding:10px 20px;border-radius:12px;font-weight:700;font-size:.85rem;transition:transform .2s}
.nav-cta:hover{transform:translateY(-1px)}
.hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;padding:100px 24px 80px;text-align:center}
.hero-bg{position:absolute;inset:0;background:radial-gradient(ellipse at top,${c.primary}33 0%,transparent 60%),radial-gradient(ellipse at bottom right,${c.accent}22 0%,transparent 50%),${c.dark};z-index:0}
.hero-bg::after{content:"";position:absolute;inset:0;background-image:radial-gradient(circle at 20% 30%,rgba(255,255,255,0.04) 1px,transparent 1px),radial-gradient(circle at 70% 60%,rgba(255,255,255,0.03) 1px,transparent 1px);background-size:40px 40px,60px 60px}
.hero-content{position:relative;z-index:1;max-width:760px}
.hero-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,0.08);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.15);padding:8px 20px;border-radius:30px;font-size:.7rem;font-weight:600;text-transform:uppercase;letter-spacing:3px;color:${c.primary};margin-bottom:32px}
.hero h1{font-size:clamp(2.5rem,6vw,4.5rem);font-weight:900;letter-spacing:-2px;line-height:1;margin-bottom:16px;text-shadow:0 4px 30px rgba(0,0,0,0.5)}
.hero .sub{font-size:1.2rem;color:rgba(255,255,255,0.6);margin-bottom:32px;font-weight:300}
.hero .rating{display:inline-flex;align-items:center;gap:10px;background:rgba(255,255,255,0.05);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.1);padding:12px 28px;border-radius:40px;margin-bottom:40px}
.hero .rating .stars{color:#FFD700;letter-spacing:2px}
.hero-buttons{display:flex;flex-wrap:wrap;gap:14px;justify-content:center}
.btn-primary{display:inline-flex;align-items:center;gap:10px;padding:18px 44px;border-radius:16px;background:linear-gradient(135deg,${c.primary},${c.accent});color:#fff;font-weight:800;font-size:1.05rem;box-shadow:0 10px 40px ${c.primary}55;transition:all .3s;border:none;cursor:pointer}
.btn-primary:hover{transform:translateY(-3px);box-shadow:0 20px 60px ${c.primary}77}
.btn-outline{display:inline-flex;align-items:center;gap:10px;padding:18px 36px;border-radius:16px;background:rgba(255,255,255,0.05);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.15);color:#fff;font-weight:600;font-size:1rem;transition:all .3s}
.btn-outline:hover{background:rgba(255,255,255,0.12);border-color:rgba(255,255,255,0.3)}
.marquee{overflow:hidden;padding:24px 0;background:linear-gradient(90deg,${c.primary},${c.accent});border-top:1px solid rgba(255,255,255,0.1);border-bottom:1px solid rgba(255,255,255,0.1)}
.marquee-track{display:flex;align-items:center;gap:28px;white-space:nowrap;animation:marquee 30s linear infinite}
.marquee-item{font-size:1rem;font-weight:800;letter-spacing:3px;color:${c.dark};text-transform:uppercase}
.marquee-dot{color:${c.dark};opacity:0.4;font-size:1.5rem}
@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
.categories{padding:32px 24px;max-width:1200px;margin:0 auto}
.cat-pills{display:flex;flex-wrap:wrap;gap:12px;justify-content:center}
.cat-pill{display:inline-flex;align-items:center;gap:6px;padding:12px 24px;border-radius:40px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);color:rgba(255,255,255,0.7);font-size:.85rem;font-weight:600;cursor:pointer;transition:all .2s}
.cat-pill:hover,.cat-pill.active{background:${c.primary};border-color:${c.primary};color:${c.dark}}
.section{max-width:1200px;margin:0 auto;padding:80px 24px}
.section-label{font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:4px;color:${c.primary};margin-bottom:12px}
.section-title{font-size:clamp(1.8rem,4vw,2.5rem);font-weight:900;margin-bottom:12px;letter-spacing:-0.5px}
.section-sub{color:rgba(255,255,255,0.4);font-size:1rem;margin-bottom:40px}
.feature-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px}
.feature-card{background:rgba(255,255,255,0.03);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.06);border-radius:24px;overflow:hidden;transition:all .4s}
.feature-card:hover{border-color:${c.primary}66;transform:translateY(-8px);box-shadow:0 30px 60px rgba(0,0,0,0.4)}
.feature-img{height:220px;background:linear-gradient(135deg,${c.primary}33,${c.accent}22);display:flex;align-items:center;justify-content:center;font-size:4rem}
.feature-body{padding:24px}
.feature-body h3{font-size:1.2rem;font-weight:700;margin-bottom:8px}
.feature-body p{color:rgba(255,255,255,0.5);font-size:.9rem;line-height:1.6}
.feature-tag{display:inline-block;background:${c.primary}22;color:${c.primary};padding:4px 14px;border-radius:20px;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:20px;text-align:center}
.stat{padding:36px 24px;background:rgba(255,255,255,0.03);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.06);border-radius:24px}
.stat .num{font-size:3rem;font-weight:900;color:${c.primary};line-height:1}
.stat .label{font-size:.75rem;color:rgba(255,255,255,0.4);margin-top:10px;text-transform:uppercase;letter-spacing:2px}
.testimonials{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px}
.testimonial{background:rgba(255,255,255,0.03);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.06);border-radius:24px;padding:28px}
.testimonial-stars{color:#FFD700;font-size:1.1rem;margin-bottom:16px;letter-spacing:3px}
.testimonial p{color:rgba(255,255,255,0.8);font-size:.95rem;line-height:1.7;margin-bottom:16px;font-style:italic}
.testimonial-author{color:${c.primary};font-size:.9rem;font-weight:600}
.gallery{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.gallery-item{aspect-ratio:1;background:linear-gradient(135deg,${c.primary}33,${c.accent}22);border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:3rem;border:1px solid rgba(255,255,255,0.06);transition:all .3s}
.gallery-item:hover{transform:scale(1.05);border-color:${c.primary}66;box-shadow:0 20px 40px rgba(0,0,0,0.3)}
.map-container{border-radius:24px;overflow:hidden;border:1px solid rgba(255,255,255,0.06);margin-top:24px}
.map-container iframe{width:100%;height:400px;border:0;display:block}
.map-info{padding:24px;background:rgba(255,255,255,0.03);backdrop-filter:blur(10px)}
.map-info p{color:rgba(255,255,255,0.6);font-size:.9rem;margin-bottom:6px}
.cta-section{text-align:center;padding:100px 24px;background:linear-gradient(135deg,${c.primary}11,${c.accent}06)}
.cta-section h2{font-size:clamp(2rem,5vw,3rem);font-weight:900;margin-bottom:16px}
.cta-section p{color:rgba(255,255,255,0.5);font-size:1.15rem;margin-bottom:40px}
footer{background:${c.dark};border-top:1px solid rgba(255,255,255,0.06);padding:48px 24px;text-align:center}
footer .brand{font-size:1.3rem;font-weight:800;margin-bottom:10px}
footer .brand span{color:${c.primary}}
footer p{color:rgba(255,255,255,0.4);font-size:.85rem;margin-bottom:6px}
footer .credit{margin-top:24px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.06)}
footer .credit a{color:${c.primary};font-weight:600}
footer .social{display:flex;gap:14px;justify-content:center;margin-top:20px}
footer .social a{display:inline-flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:14px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);color:rgba(255,255,255,0.6);font-size:1.3rem;transition:all .2s}
footer .social a:hover{background:${c.primary};color:${c.dark};border-color:${c.primary}}
@media(max-width:600px){.hero h1{font-size:2.2rem}.nav-links{display:none}.gallery{grid-template-columns:repeat(2,1fr)}}
</style></head><body>
<nav class="nav"><div class="nav-inner"><a href="#" class="nav-logo">${lead.name.split(" ")[0]}<span>${lead.name.split(" ").slice(1).join(" ")||""}</span></a><div class="nav-links"><a href="#inicio">Início</a><a href="#sobre">Sobre</a><a href="#destaques">${cfg.sectionTitle}</a><a href="#depoimentos">Depoimentos</a><a href="#contato">Contato</a>${wa?`<a href="https://wa.me/${wa}" class="nav-cta" target="_blank">📱 WhatsApp</a>`:""}</div></div></nav>
<section class="hero" id="inicio"><div class="hero-bg"></div><div class="hero-content"><div class="hero-badge">${cfg.heroBadge}</div><h1>${cfg.heroTitle(lead.name)}</h1><p class="sub">${cfg.heroSubtitle(city)}</p>${lead.rating?`<div class="rating"><span class="stars">★★★★★</span> ${lead.rating} · ${lead.user_ratings_total||0} avaliações</div>`:""}<div class="hero-buttons">${wa?`<a href="https://wa.me/${wa}" class="btn-primary" target="_blank">${cfg.ctaButton}</a>`:""}<a href="${maps}" class="btn-outline" target="_blank">🗺️ Como Chegar</a></div></div></section>
<div class="marquee"><div class="marquee-track">${marqueeHtml}</div></div>
<div class="categories"><div class="cat-pills">${pillsHtml}</div></div>
<section class="section" id="destaques"><div class="section-label">${cfg.heroBadge.replace(/^[^\w]+\s*/,"")}</div><h2 class="section-title">${cfg.sectionTitle}</h2><p class="section-sub">${cfg.sectionSub}</p><div class="feature-grid">${featuresHtml}</div></section>
<section class="section" id="sobre" style="background:rgba(255,255,255,0.02);border-top:1px solid rgba(255,255,255,0.04);border-bottom:1px solid rgba(255,255,255,0.04)"><div class="section-label">Nossa História</div><h2 class="section-title">Sobre Nós</h2><p class="section-sub">Conheça nossa história</p><div style="max-width:700px;margin:0 auto;line-height:1.8;color:rgba(255,255,255,0.7);font-size:1.05rem;text-align:center"><p>${cfg.aboutText(lead.name,n,city,lead.rating,lead.user_ratings_total)}</p></div><div class="stats" style="margin-top:48px">${lead.rating?`<div class="stat"><div class="num">${lead.rating}★</div><div class="label">Avaliação Google</div></div>`:""}${lead.user_ratings_total?`<div class="stat"><div class="num">${lead.user_ratings_total}+</div><div class="label">Clientes</div></div>`:""}<div class="stat"><div class="num">100%</div><div class="label">Qualidade</div></div><div class="stat"><div class="num">24/7</div><div class="label">Atendimento</div></div></div></section>
<section class="section" id="depoimentos"><div class="section-label">O que dizem</div><h2 class="section-title">Depoimentos</h2><p class="section-sub">A satisfação de quem confia em nós</p><div class="testimonials">${testimonialsHtml}</div></section>
<section class="section" style="background:rgba(255,255,255,0.02);border-top:1px solid rgba(255,255,255,0.04);border-bottom:1px solid rgba(255,255,255,0.04)"><div class="section-label">Veja mais</div><h2 class="section-title">Galeria</h2><p class="section-sub">Um pouquinho do nosso dia a dia</p><div class="gallery">${galleryHtml}</div></section>
<section class="section" id="contato"><div class="section-label">Visite-nos</div><h2 class="section-title">Como Chegar</h2><p class="section-sub">Venha nos visitar</p><div class="map-container"><iframe src="${embed}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe><div class="map-info"><p>📍 ${lead.formatted_address||city||""}</p>${lead.phone?`<p>📞 ${lead.phone}</p>`:""}</div></div><div style="display:flex;flex-wrap:wrap;gap:14px;justify-content:center;margin-top:28px"><a href="${maps}" class="btn-outline" target="_blank">🗺️ Abrir no Maps</a>${wa?`<a href="tel:${wa}" class="btn-outline">📞 Ligar</a>`:""}${wa?`<a href="https://wa.me/${wa}" class="btn-primary" target="_blank">💬 WhatsApp</a>`:""}</div></section>
<section class="cta-section"><h2>${cfg.ctaTitle}</h2><p>${cfg.ctaSubtitle}</p>${wa?`<a href="https://wa.me/${wa}" class="btn-primary" target="_blank">${cfg.ctaButton}</a>`:`<a href="${maps}" class="btn-primary" target="_blank">🗺️ Visitar</a>`}</section>
<footer><div class="brand">${lead.name.split(" ")[0]}<span> ${lead.name.split(" ").slice(1).join(" ")||""}</span></div><p>${lead.formatted_address||city||""}</p>${lead.phone?`<p>${lead.phone}</p>`:""}<div class="social">${lead.instagram?`<a href="${lead.instagram}" target="_blank" title="Instagram">📷</a>`:""}${lead.facebook?`<a href="${lead.facebook}" target="_blank" title="Facebook">👍</a>`:""}${wa?`<a href="https://wa.me/${wa}" target="_blank" title="WhatsApp">💬</a>`:""}</div><div class="credit"><p>© ${new Date().getFullYear()} ${lead.name}. Todos os direitos reservados.</p><p style="margin-top:6px">Site criado por <a href="https://clodoaldo.vercel.app" target="_blank">Clodoaldo Silva</a></p></div></footer>
</body></html>`;
  },
};

// =====================================================
// ESTILO 2: LIGHT MINIMAL
// Fundo claro, tipografia grande, muito whitespace
// =====================================================
const styleLight: PreviewStyle = {
  id: "light",
  name: "Light Minimal",
  description: "Fundo claro, tipografia grande, whitespace generoso",
  emoji: "☀️",
  render: (cfg, ctx) => {
    const { lead, wa, maps, embed, n, city } = ctx;
    const c = cfg.colors;
    const featuresHtml = cfg.features.map(f => `<div class="feature-card"><div class="feature-emoji">${f.emoji}</div><span class="feature-tag">${f.tag}</span><h3>${f.title}</h3><p>${f.desc}</p></div>`).join("");
    const pillsHtml = cfg.categoryPills.map((p,i)=>`<div class="cat-pill ${i===0?"active":""}">${p}</div>`).join("");
    const testimonialsHtml = cfg.testimonials.map(t=>`<div class="testimonial"><div class="testimonial-stars">${"★".repeat(t.rating)}</div><p>"${t.text}"</p><div class="testimonial-author">— ${t.name}</div></div>`).join("");
    const galleryHtml = cfg.galleryEmojis.map(e=>`<div class="gallery-item">${e}</div>`).join("");

    return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${lead.name} | ${n} em ${city}</title><meta name="theme-color" content="#ffffff"><style>
*{margin:0;padding:0;box-sizing:border-box;font-family:'Inter',-apple-system,system-ui,sans-serif}
body{background:#fafafa;color:#0a0a0a;overflow-x:hidden}
a{text-decoration:none;color:inherit}
.nav{position:sticky;top:0;z-index:100;background:rgba(255,255,255,0.9);backdrop-filter:blur(20px);border-bottom:1px solid #eee}
.nav-inner{max-width:1100px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;padding:0 32px;height:80px}
.nav-logo{font-size:1.4rem;font-weight:800;letter-spacing:-0.5px}
.nav-logo span{color:${c.primary}}
.nav-links{display:flex;align-items:center;gap:32px}
.nav-links a{color:#666;font-size:.95rem;font-weight:500;transition:color .2s}
.nav-links a:hover{color:#0a0a0a}
.nav-cta{background:#0a0a0a;color:#fff;padding:12px 24px;border-radius:999px;font-weight:600;font-size:.85rem;transition:transform .2s}
.nav-cta:hover{transform:translateY(-1px)}
.hero{max-width:1100px;margin:0 auto;padding:100px 32px 80px;text-align:center}
.hero-badge{display:inline-block;background:${c.primary}11;color:${c.primary};padding:8px 20px;border-radius:999px;font-size:.75rem;font-weight:600;text-transform:uppercase;letter-spacing:2px;margin-bottom:32px}
.hero h1{font-size:clamp(2.8rem,7vw,5rem);font-weight:900;letter-spacing:-3px;line-height:1;margin-bottom:24px;color:#0a0a0a}
.hero .sub{font-size:1.3rem;color:#666;margin-bottom:40px;font-weight:300;max-width:600px;margin-left:auto;margin-right:auto}
.hero .rating{display:inline-flex;align-items:center;gap:10px;background:#fff;border:1px solid #eee;padding:12px 28px;border-radius:999px;margin-bottom:40px;box-shadow:0 4px 20px rgba(0,0,0,0.04)}
.hero .rating .stars{color:${c.primary};letter-spacing:2px}
.hero-buttons{display:flex;flex-wrap:wrap;gap:14px;justify-content:center}
.btn-primary{display:inline-flex;align-items:center;gap:10px;padding:18px 40px;border-radius:999px;background:#0a0a0a;color:#fff;font-weight:700;font-size:1rem;transition:all .2s;border:none;cursor:pointer}
.btn-primary:hover{background:${c.primary};transform:translateY(-2px)}
.btn-outline{display:inline-flex;align-items:center;gap:10px;padding:18px 36px;border-radius:999px;background:#fff;border:1px solid #ddd;color:#0a0a0a;font-weight:600;font-size:1rem;transition:all .2s}
.btn-outline:hover{border-color:#0a0a0a}
.categories{max-width:1100px;margin:0 auto;padding:0 32px 60px}
.cat-pills{display:flex;flex-wrap:wrap;gap:10px;justify-content:center}
.cat-pill{padding:10px 22px;border-radius:999px;background:#fff;border:1px solid #eee;color:#666;font-size:.85rem;font-weight:500;cursor:pointer;transition:all .2s}
.cat-pill:hover,.cat-pill.active{background:#0a0a0a;color:#fff;border-color:#0a0a0a}
.section{max-width:1100px;margin:0 auto;padding:100px 32px}
.section-label{font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:3px;color:${c.primary};margin-bottom:16px;text-align:center}
.section-title{font-size:clamp(2rem,5vw,3rem);font-weight:900;letter-spacing:-1px;margin-bottom:16px;text-align:center}
.section-sub{color:#999;font-size:1.1rem;margin-bottom:60px;text-align:center;font-weight:300}
.feature-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:40px}
.feature-card{text-align:center;padding:40px 28px;background:#fff;border-radius:24px;border:1px solid #eee;transition:all .3s}
.feature-card:hover{transform:translateY(-6px);box-shadow:0 20px 40px rgba(0,0,0,0.06);border-color:${c.primary}33}
.feature-emoji{font-size:3.5rem;margin-bottom:20px}
.feature-tag{display:inline-block;background:${c.primary}11;color:${c.primary};padding:4px 14px;border-radius:999px;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:16px}
.feature-card h3{font-size:1.3rem;font-weight:700;margin-bottom:12px}
.feature-card p{color:#666;font-size:.95rem;line-height:1.7}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:40px;text-align:center;max-width:800px;margin:0 auto}
.stat .num{font-size:3.5rem;font-weight:900;color:${c.primary};line-height:1;margin-bottom:10px}
.stat .label{font-size:.85rem;color:#999;text-transform:uppercase;letter-spacing:2px;font-weight:500}
.testimonials{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:32px}
.testimonial{padding:36px 28px;background:#fff;border-radius:24px;border:1px solid #eee}
.testimonial-stars{color:${c.primary};font-size:1.2rem;margin-bottom:20px;letter-spacing:3px}
.testimonial p{color:#333;font-size:1rem;line-height:1.8;margin-bottom:20px}
.testimonial-author{color:#999;font-size:.9rem;font-weight:600}
.gallery{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;max-width:800px;margin:0 auto}
.gallery-item{aspect-ratio:1;background:${c.primary}08;border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:3rem;border:1px solid #eee;transition:all .3s}
.gallery-item:hover{transform:scale(1.05);box-shadow:0 16px 32px rgba(0,0,0,0.06)}
.map-container{border-radius:24px;overflow:hidden;border:1px solid #eee;max-width:900px;margin:0 auto;box-shadow:0 10px 40px rgba(0,0,0,0.04)}
.map-container iframe{width:100%;height:400px;border:0;display:block}
.map-info{padding:24px;background:#fff;text-align:center}
.map-info p{color:#666;font-size:.95rem;margin-bottom:6px}
.cta-section{text-align:center;padding:120px 32px;background:#0a0a0a;color:#fff;border-radius:40px;max-width:1100px;margin:60px auto}
.cta-section h2{font-size:clamp(2rem,5vw,3.2rem);font-weight:900;margin-bottom:20px;letter-spacing:-1px}
.cta-section p{color:rgba(255,255,255,0.6);font-size:1.2rem;margin-bottom:40px;font-weight:300}
footer{background:#0a0a0a;color:#fff;padding:60px 32px 40px;text-align:center}
footer .brand{font-size:1.4rem;font-weight:800;margin-bottom:12px}
footer .brand span{color:${c.primary}}
footer p{color:rgba(255,255,255,0.5);font-size:.85rem;margin-bottom:6px}
footer .credit{margin-top:24px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.1)}
footer .credit a{color:${c.primary};font-weight:600}
footer .social{display:flex;gap:14px;justify-content:center;margin-top:20px}
footer .social a{width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.08);display:inline-flex;align-items:center;justify-content:center;font-size:1.2rem;transition:all .2s}
footer .social a:hover{background:${c.primary}}
@media(max-width:600px){.hero h1{font-size:2.5rem}.nav-links{display:none}.gallery{grid-template-columns:repeat(2,1fr)}.cta-section{border-radius:24px}}
</style></head><body>
<nav class="nav"><div class="nav-inner"><a href="#" class="nav-logo">${lead.name.split(" ")[0]}<span>${lead.name.split(" ").slice(1).join(" ")||""}</span></a><div class="nav-links"><a href="#inicio">Início</a><a href="#sobre">Sobre</a><a href="#destaques">${cfg.sectionTitle}</a><a href="#depoimentos">Depoimentos</a>${wa?`<a href="https://wa.me/${wa}" class="nav-cta" target="_blank">WhatsApp</a>`:""}</div></div></nav>
<section class="hero" id="inicio"><div class="hero-badge">${cfg.heroBadge}</div><h1>${cfg.heroTitle(lead.name)}</h1><p class="sub">${cfg.heroSubtitle(city)}</p>${lead.rating?`<div class="rating"><span class="stars">★★★★★</span> ${lead.rating} · ${lead.user_ratings_total||0} avaliações</div>`:""}<div class="hero-buttons">${wa?`<a href="https://wa.me/${wa}" class="btn-primary" target="_blank">${cfg.ctaButton}</a>`:""}<a href="${maps}" class="btn-outline" target="_blank">Como Chegar →</a></div></section>
<div class="categories"><div class="cat-pills">${pillsHtml}</div></div>
<section class="section" id="destaques"><div class="section-label">${cfg.heroBadge.replace(/^[^\w]+\s*/,"")}</div><h2 class="section-title">${cfg.sectionTitle}</h2><p class="section-sub">${cfg.sectionSub}</p><div class="feature-grid">${featuresHtml}</div></section>
<section class="section" id="sobre" style="background:#fff;border-top:1px solid #eee;border-bottom:1px solid #eee"><div class="section-label">Nossa História</div><h2 class="section-title">Sobre Nós</h2><p class="section-sub">Conheça nossa história</p><div style="max-width:700px;margin:0 auto;line-height:1.9;color:#555;font-size:1.1rem;text-align:center;font-weight:300"><p>${cfg.aboutText(lead.name,n,city,lead.rating,lead.user_ratings_total)}</p></div><div class="stats" style="margin-top:60px">${lead.rating?`<div class="stat"><div class="num">${lead.rating}★</div><div class="label">Avaliação Google</div></div>`:""}${lead.user_ratings_total?`<div class="stat"><div class="num">${lead.user_ratings_total}+</div><div class="label">Clientes</div></div>`:""}<div class="stat"><div class="num">100%</div><div class="label">Qualidade</div></div><div class="stat"><div class="num">24/7</div><div class="label">Atendimento</div></div></div></section>
<section class="section" id="depoimentos"><div class="section-label">O que dizem</div><h2 class="section-title">Depoimentos</h2><p class="section-sub">A satisfação de quem confia em nós</p><div class="testimonials">${testimonialsHtml}</div></section>
<section class="section" style="background:#fff;border-top:1px solid #eee;border-bottom:1px solid #eee"><div class="section-label">Veja mais</div><h2 class="section-title">Galeria</h2><p class="section-sub">Um pouquinho do nosso dia a dia</p><div class="gallery">${galleryHtml}</div></section>
<section class="section" id="contato"><div class="section-label">Visite-nos</div><h2 class="section-title">Como Chegar</h2><p class="section-sub">Venha nos visitar</p><div class="map-container"><iframe src="${embed}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe><div class="map-info"><p>📍 ${lead.formatted_address||city||""}</p>${lead.phone?`<p>📞 ${lead.phone}</p>`:""}</div></div><div style="display:flex;flex-wrap:wrap;gap:14px;justify-content:center;margin-top:32px">${wa?`<a href="https://wa.me/${wa}" class="btn-primary" target="_blank">💬 WhatsApp</a>`:""}<a href="${maps}" class="btn-outline" target="_blank">Abrir no Maps →</a></div></section>
<section class="cta-section"><h2>${cfg.ctaTitle}</h2><p>${cfg.ctaSubtitle}</p>${wa?`<a href="https://wa.me/${wa}" class="btn-primary" target="_blank" style="background:${c.primary}">${cfg.ctaButton}</a>`:""}</section>
<footer><div class="brand">${lead.name.split(" ")[0]}<span> ${lead.name.split(" ").slice(1).join(" ")||""}</span></div><p>${lead.formatted_address||city||""}</p>${lead.phone?`<p>${lead.phone}</p>`:""}<div class="social">${lead.instagram?`<a href="${lead.instagram}" target="_blank" title="Instagram">📷</a>`:""}${lead.facebook?`<a href="${lead.facebook}" target="_blank" title="Facebook">👍</a>`:""}${wa?`<a href="https://wa.me/${wa}" target="_blank" title="WhatsApp">💬</a>`:""}</div><div class="credit"><p>© ${new Date().getFullYear()} ${lead.name}. Todos os direitos reservados.</p><p style="margin-top:6px">Site criado por <a href="https://clodoaldo.vercel.app" target="_blank">Clodoaldo Silva</a></p></div></footer>
</body></html>`;
  },
};

// =====================================================
// ESTILO 3: BOLD EDITORIAL
// Cores vibrantes, tipografia gigante, layout assimétrico
// =====================================================
const styleBold: PreviewStyle = {
  id: "bold",
  name: "Bold Editorial",
  description: "Tipografia gigante, cores vibrantes, layout ousado",
  emoji: "🔥",
  render: (cfg, ctx) => {
    const { lead, wa, maps, embed, n, city } = ctx;
    const c = cfg.colors;
    const featuresHtml = cfg.features.map((f,i)=>`<div class="feature-card" style="${i%2===1?"margin-top:60px":""}"><div class="feature-num">0${i+1}</div><div class="feature-emoji">${f.emoji}</div><span class="feature-tag">${f.tag}</span><h3>${f.title}</h3><p>${f.desc}</p></div>`).join("");
    const pillsHtml = cfg.categoryPills.map((p,i)=>`<div class="cat-pill ${i===0?"active":""}">${p}</div>`).join("");
    const testimonialsHtml = cfg.testimonials.map(t=>`<div class="testimonial"><div class="testimonial-stars">${"★".repeat(t.rating)}</div><p>${t.text}</p><div class="testimonial-author">${t.name}</div></div>`).join("");
    const galleryHtml = cfg.galleryEmojis.map((e,i)=>`<div class="gallery-item" style="${i%2===0?`background:${c.primary}`:`background:${c.accent}`};color:${c.dark}">${e}</div>`).join("");

    return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${lead.name} | ${n} em ${city}</title><meta name="theme-color" content="${c.dark}"><style>
*{margin:0;padding:0;box-sizing:border-box;font-family:'Inter',-apple-system,system-ui,sans-serif}
body{background:${c.dark};color:#fff;overflow-x:hidden}
a{text-decoration:none;color:inherit}
.nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:24px 32px;display:flex;align-items:center;justify-content:space-between;mix-blend-mode:difference}
.nav-logo{font-size:1.5rem;font-weight:900;color:#fff;letter-spacing:-1px}
.nav-links{display:flex;gap:32px;align-items:center}
.nav-links a{color:#fff;font-size:.95rem;font-weight:600;text-transform:uppercase;letter-spacing:2px}
.hero{min-height:100vh;display:flex;flex-direction:column;justify-content:center;padding:120px 32px 60px;position:relative;background:${c.primary}}
.hero h1{font-size:clamp(3rem,12vw,9rem);font-weight:900;letter-spacing:-4px;line-height:.9;color:${c.dark};margin-bottom:24px}
.hero .sub{font-size:clamp(1.1rem,2.5vw,1.8rem);color:${c.dark};opacity:.7;margin-bottom:40px;font-weight:500;max-width:600px}
.hero-badge{display:inline-block;background:${c.dark};color:#fff;padding:8px 20px;border-radius:0;font-size:.75rem;font-weight:800;text-transform:uppercase;letter-spacing:3px;margin-bottom:32px;align-self:flex-start}
.hero .rating{display:inline-flex;align-items:center;gap:10px;background:${c.dark};color:#fff;padding:12px 24px;margin-bottom:40px;align-self:flex-start}
.hero .rating .stars{color:${c.primary};letter-spacing:2px}
.hero-buttons{display:flex;flex-wrap:wrap;gap:16px}
.btn-primary{padding:20px 40px;background:${c.dark};color:#fff;font-weight:800;font-size:1.05rem;text-transform:uppercase;letter-spacing:2px;border:none;cursor:pointer;transition:all .2s}
.btn-primary:hover{background:${c.accent};transform:translate(-4px,-4px);box-shadow:8px 8px 0 ${c.dark}}
.btn-outline{padding:20px 36px;background:transparent;color:${c.dark};border:2px solid ${c.dark};font-weight:800;font-size:1.05rem;text-transform:uppercase;letter-spacing:2px;transition:all .2s}
.btn-outline:hover{background:${c.dark};color:#fff}
.marquee{overflow:hidden;padding:20px 0;background:${c.accent};border-top:4px solid ${c.dark};border-bottom:4px solid ${c.dark}}
.marquee-track{display:flex;gap:32px;white-space:nowrap;animation:marquee 25s linear infinite}
.marquee-item{font-size:1.5rem;font-weight:900;color:${c.dark};text-transform:uppercase;letter-spacing:2px}
.marquee-dot{color:${c.dark};opacity:.3;font-size:2rem}
@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
.categories{padding:60px 32px;background:${c.dark}}
.cat-pills{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;max-width:1100px;margin:0 auto}
.cat-pill{padding:14px 28px;background:transparent;border:2px solid #fff;color:#fff;font-size:.85rem;font-weight:700;text-transform:uppercase;letter-spacing:2px;cursor:pointer;transition:all .2s}
.cat-pill:hover,.cat-pill.active{background:${c.primary};border-color:${c.primary};color:${c.dark}}
.section{padding:120px 32px;max-width:1200px;margin:0 auto}
.section-label{font-size:1rem;font-weight:900;color:${c.primary};text-transform:uppercase;letter-spacing:4px;margin-bottom:24px}
.section-title{font-size:clamp(2.5rem,7vw,5rem);font-weight:900;letter-spacing:-3px;line-height:.95;margin-bottom:24px}
.section-sub{font-size:1.2rem;color:rgba(255,255,255,0.5);margin-bottom:80px;font-weight:300;max-width:600px}
.feature-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:32px}
.feature-card{padding:40px 32px;background:transparent;border:2px solid rgba(255,255,255,0.1);transition:all .3s;position:relative}
.feature-card:hover{border-color:${c.primary};background:${c.primary}08}
.feature-num{position:absolute;top:20px;right:24px;font-size:1rem;font-weight:900;color:${c.primary};opacity:.5}
.feature-emoji{font-size:4rem;margin-bottom:24px}
.feature-tag{display:inline-block;background:${c.primary};color:${c.dark};padding:4px 14px;font-size:.7rem;font-weight:800;text-transform:uppercase;letter-spacing:2px;margin-bottom:16px}
.feature-card h3{font-size:1.8rem;font-weight:900;letter-spacing:-1px;margin-bottom:16px}
.feature-card p{color:rgba(255,255,255,0.6);font-size:1rem;line-height:1.6}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:0;border:2px solid rgba(255,255,255,0.1);margin-top:80px}
.stat{padding:48px 32px;text-align:center;border-right:2px solid rgba(255,255,255,0.1)}
.stat:last-child{border-right:none}
.stat .num{font-size:4rem;font-weight:900;color:${c.primary};line-height:1;margin-bottom:12px;letter-spacing:-2px}
.stat .label{font-size:.85rem;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:3px;font-weight:600}
.testimonials{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:0}
.testimonial{padding:48px 36px;border:2px solid rgba(255,255,255,0.1);border-right:none}
.testimonial:last-child{border-right:2px solid rgba(255,255,255,0.1)}
.testimonial-stars{color:${c.primary};font-size:1.5rem;margin-bottom:24px;letter-spacing:4px}
.testimonial p{color:#fff;font-size:1.2rem;line-height:1.5;margin-bottom:24px;font-weight:500}
.testimonial-author{color:${c.primary};font-size:1rem;font-weight:800;text-transform:uppercase;letter-spacing:2px}
.gallery{display:grid;grid-template-columns:repeat(3,1fr);gap:0;border:2px solid ${c.dark}}
.gallery-item{aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:4rem;border:2px solid ${c.dark};transition:all .3s}
.gallery-item:hover{transform:scale(1.05)}
.map-container{border:2px solid rgba(255,255,255,0.1);margin-top:40px}
.map-container iframe{width:100%;height:400px;border:0;display:block}
.map-info{padding:32px;background:transparent;border-top:2px solid rgba(255,255,255,0.1)}
.map-info p{color:rgba(255,255,255,0.7);font-size:1rem;margin-bottom:8px}
.cta-section{padding:140px 32px;background:${c.primary};text-align:center}
.cta-section h2{font-size:clamp(2.5rem,7vw,5rem);font-weight:900;letter-spacing:-3px;line-height:.95;color:${c.dark};margin-bottom:24px}
.cta-section p{color:${c.dark};opacity:.7;font-size:1.3rem;margin-bottom:48px;font-weight:500}
footer{background:${c.dark};padding:60px 32px 40px;text-align:center;border-top:4px solid ${c.primary}}
footer .brand{font-size:1.8rem;font-weight:900;margin-bottom:16px;letter-spacing:-1px}
footer .brand span{color:${c.primary}}
footer p{color:rgba(255,255,255,0.5);font-size:.9rem;margin-bottom:6px}
footer .credit{margin-top:24px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.1)}
footer .credit a{color:${c.primary};font-weight:700}
footer .social{display:flex;gap:16px;justify-content:center;margin-top:20px}
footer .social a{width:48px;height:48px;border:2px solid rgba(255,255,255,0.2);display:inline-flex;align-items:center;justify-content:center;font-size:1.3rem;transition:all .2s}
footer .social a:hover{background:${c.primary};border-color:${c.primary};color:${c.dark}}
@media(max-width:600px){.hero h1{font-size:3rem}.nav-links{display:none}.gallery{grid-template-columns:repeat(2,1fr)}.stats{grid-template-columns:repeat(2,1fr)}.stat:nth-child(2){border-right:none}.testimonial{border-right:2px solid rgba(255,255,255,0.1)}}
</style></head><body>
<nav class="nav"><a href="#" class="nav-logo">${lead.name.split(" ")[0]}</a><div class="nav-links"><a href="#destaques">${cfg.sectionTitle}</a><a href="#depoimentos">Depoimentos</a><a href="#contato">Contato</a>${wa?`<a href="https://wa.me/${wa}" target="_blank">WhatsApp ↗</a>`:""}</div></nav>
<section class="hero" id="inicio"><div class="hero-badge">${cfg.heroBadge}</div><h1>${cfg.heroTitle(lead.name)}</h1><p class="sub">${cfg.heroSubtitle(city)}</p>${lead.rating?`<div class="rating"><span class="stars">★★★★★</span> ${lead.rating} · ${lead.user_ratings_total||0} avaliações</div>`:""}<div class="hero-buttons">${wa?`<a href="https://wa.me/${wa}" class="btn-primary" target="_blank">${cfg.ctaButton}</a>`:""}<a href="${maps}" class="btn-outline" target="_blank">Como Chegar</a></div></section>
<div class="marquee"><div class="marquee-track">${[...cfg.marqueeWords,...cfg.marqueeWords].map(w=>`<span class="marquee-item">${w}</span><span class="marquee-dot">/</span>`).join("")}</div></div>
<div class="categories"><div class="cat-pills">${pillsHtml}</div></div>
<section class="section" id="destaques"><div class="section-label">${cfg.heroBadge.replace(/^[^\w]+\s*/,"")}</div><h2 class="section-title">${cfg.sectionTitle}.</h2><p class="section-sub">${cfg.sectionSub}</p><div class="feature-grid">${featuresHtml}</div></section>
<section class="section" id="sobre" style="background:${c.accent}11"><div class="section-label">Nossa História</div><h2 class="section-title">Sobre Nós.</h2><p class="section-sub">Conheça nossa história</p><div style="max-width:700px;line-height:1.7;color:rgba(255,255,255,0.7);font-size:1.2rem;font-weight:300"><p>${cfg.aboutText(lead.name,n,city,lead.rating,lead.user_ratings_total)}</p></div><div class="stats">${lead.rating?`<div class="stat"><div class="num">${lead.rating}</div><div class="label">Estrelas</div></div>`:""}${lead.user_ratings_total?`<div class="stat"><div class="num">${lead.user_ratings_total}+</div><div class="label">Clientes</div></div>`:""}<div class="stat"><div class="num">100%</div><div class="label">Qualidade</div></div><div class="stat"><div class="num">24/7</div><div class="label">Atendimento</div></div></div></section>
<section class="section" id="depoimentos"><div class="section-label">O que dizem</div><h2 class="section-title">Depoimentos.</h2><p class="section-sub">A satisfação de quem confia em nós</p><div class="testimonials">${testimonialsHtml}</div></section>
<section class="section"><div class="section-label">Veja mais</div><h2 class="section-title">Galeria.</h2><div class="gallery" style="margin-top:60px">${galleryHtml}</div></section>
<section class="section" id="contato"><div class="section-label">Visite-nos</div><h2 class="section-title">Como Chegar.</h2><div class="map-container"><iframe src="${embed}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe><div class="map-info"><p>📍 ${lead.formatted_address||city||""}</p>${lead.phone?`<p>📞 ${lead.phone}</p>`:""}</div></div><div style="display:flex;flex-wrap:wrap;gap:16px;margin-top:32px">${wa?`<a href="https://wa.me/${wa}" class="btn-primary" target="_blank">💬 WhatsApp</a>`:""}<a href="${maps}" class="btn-outline" target="_blank">Abrir no Maps</a></div></section>
<section class="cta-section"><h2>${cfg.ctaTitle}</h2><p>${cfg.ctaSubtitle}</p>${wa?`<a href="https://wa.me/${wa}" class="btn-primary" target="_blank" style="background:${c.dark};color:#fff">${cfg.ctaButton}</a>`:""}</section>
<footer><div class="brand">${lead.name.split(" ")[0]}<span> ${lead.name.split(" ").slice(1).join(" ")||""}</span></div><p>${lead.formatted_address||city||""}</p>${lead.phone?`<p>${lead.phone}</p>`:""}<div class="social">${lead.instagram?`<a href="${lead.instagram}" target="_blank" title="Instagram">📷</a>`:""}${lead.facebook?`<a href="${lead.facebook}" target="_blank" title="Facebook">👍</a>`:""}${wa?`<a href="https://wa.me/${wa}" target="_blank" title="WhatsApp">💬</a>`:""}</div><div class="credit"><p>© ${new Date().getFullYear()} ${lead.name}. Todos os direitos reservados.</p><p style="margin-top:6px">Site criado por <a href="https://clodoaldo.vercel.app" target="_blank">Clodoaldo Silva</a></p></div></footer>
</body></html>`;
  },
};

// =====================================================
// ESTILO 4: ELEGANT CLASSIC
// Serifas, paleta sofisticada, elegante
// =====================================================
const styleElegant: PreviewStyle = {
  id: "elegant",
  name: "Elegant Classic",
  description: "Tipografia serif, paleta sofisticada, elegante",
  emoji: "🎩",
  render: (cfg, ctx) => {
    const { lead, wa, maps, embed, n, city } = ctx;
    const c = cfg.colors;
    const featuresHtml = cfg.features.map(f=>`<div class="feature-card"><div class="feature-emoji">${f.emoji}</div><div class="feature-content"><span class="feature-tag">${f.tag}</span><h3>${f.title}</h3><p>${f.desc}</p></div></div>`).join("");
    const pillsHtml = cfg.categoryPills.map((p,i)=>`<div class="cat-pill ${i===0?"active":""}">${p}</div>`).join("");
    const testimonialsHtml = cfg.testimonials.map(t=>`<div class="testimonial"><div class="testimonial-stars">${"★".repeat(t.rating)}</div><p class="testimonial-quote">"${t.text}"</p><div class="testimonial-author">— ${t.name}</div></div>`).join("");
    const galleryHtml = cfg.galleryEmojis.map(e=>`<div class="gallery-item">${e}</div>`).join("");

    return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${lead.name} | ${n} em ${city}</title><meta name="theme-color" content="#1a1410"><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet"><style>
*{margin:0;padding:0;box-sizing:border-box;font-family:'Inter',sans-serif}
body{background:#1a1410;color:#f5f0e8;overflow-x:hidden}
a{text-decoration:none;color:inherit}
.serif{font-family:'Playfair Display',serif}
.nav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(26,20,16,0.92);backdrop-filter:blur(20px);border-bottom:1px solid rgba(184,154,106,0.2)}
.nav-inner{max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;padding:0 40px;height:80px}
.nav-logo{font-family:'Playfair Display',serif;font-size:1.5rem;font-weight:700;letter-spacing:.5px;color:#f5f0e8}
.nav-logo span{color:${c.primary}}
.nav-links{display:flex;align-items:center;gap:36px}
.nav-links a{color:rgba(245,240,232,0.7);font-size:.85rem;font-weight:400;letter-spacing:1px;text-transform:uppercase;transition:color .2s}
.nav-links a:hover{color:${c.primary}}
.nav-cta{border:1px solid ${c.primary};color:${c.primary};padding:10px 24px;font-size:.8rem;letter-spacing:2px;text-transform:uppercase;transition:all .3s}
.nav-cta:hover{background:${c.primary};color:#1a1410}
.hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;padding:120px 40px 80px;text-align:center}
.hero-bg{position:absolute;inset:0;background:radial-gradient(ellipse at center,${c.primary}0a 0%,transparent 70%);z-index:0}
.hero-bg::before{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(184,154,106,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(184,154,106,0.04) 1px,transparent 1px);background-size:60px 60px}
.hero-content{position:relative;z-index:1;max-width:800px}
.hero-badge{display:inline-flex;align-items:center;gap:12px;font-size:.75rem;font-weight:400;letter-spacing:4px;text-transform:uppercase;color:${c.primary};margin-bottom:40px}
.hero-badge::before,.hero-badge::after{content:"";width:40px;height:1px;background:${c.primary}}
.hero h1{font-family:'Playfair Display',serif;font-size:clamp(3rem,8vw,6rem);font-weight:700;line-height:1.05;margin-bottom:24px;color:#f5f0e8;letter-spacing:-1px}
.hero .sub{font-family:'Playfair Display',serif;font-size:1.4rem;font-style:italic;color:rgba(245,240,232,0.6);margin-bottom:48px;font-weight:400}
.hero .rating{display:inline-flex;align-items:center;gap:14px;border:1px solid rgba(184,154,106,0.3);padding:14px 32px;margin-bottom:48px}
.hero .rating .stars{color:${c.primary};letter-spacing:3px;font-size:1.1rem}
.hero .rating .sep{color:rgba(184,154,106,0.4)}
.hero-buttons{display:flex;flex-wrap:wrap;gap:20px;justify-content:center}
.btn-primary{padding:18px 44px;background:${c.primary};color:#1a1410;font-weight:600;font-size:.85rem;letter-spacing:3px;text-transform:uppercase;border:1px solid ${c.primary};transition:all .3s}
.btn-primary:hover{background:transparent;color:${c.primary}}
.btn-outline{padding:18px 40px;background:transparent;color:#f5f0e8;border:1px solid rgba(245,240,232,0.3);font-weight:500;font-size:.85rem;letter-spacing:3px;text-transform:uppercase;transition:all .3s}
.btn-outline:hover{border-color:${c.primary};color:${c.primary}}
.divider{display:flex;align-items:center;justify-content:center;gap:20px;margin:80px 0}
.divider::before,.divider::after{content:"";width:80px;height:1px;background:rgba(184,154,106,0.3)}
.divider-icon{color:${c.primary};font-size:1.2rem}
.categories{padding:40px;max-width:1200px;margin:0 auto}
.cat-pills{display:flex;flex-wrap:wrap;gap:12px;justify-content:center}
.cat-pill{padding:10px 24px;border:1px solid rgba(184,154,106,0.2);color:rgba(245,240,232,0.7);font-size:.8rem;letter-spacing:2px;text-transform:uppercase;cursor:pointer;transition:all .3s}
.cat-pill:hover,.cat-pill.active{background:${c.primary};color:#1a1410;border-color:${c.primary}}
.section{max-width:1200px;margin:0 auto;padding:100px 40px}
.section-label{font-size:.75rem;font-weight:400;letter-spacing:5px;text-transform:uppercase;color:${c.primary};margin-bottom:20px;text-align:center}
.section-title{font-family:'Playfair Display',serif;font-size:clamp(2.2rem,5vw,3.5rem);font-weight:700;margin-bottom:20px;text-align:center;letter-spacing:-0.5px}
.section-sub{font-family:'Playfair Display',serif;font-style:italic;color:rgba(245,240,232,0.5);font-size:1.2rem;margin-bottom:60px;text-align:center;font-weight:400}
.feature-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:40px}
.feature-card{display:flex;gap:24px;padding:32px;border:1px solid rgba(184,154,106,0.15);transition:all .3s}
.feature-card:hover{border-color:${c.primary};background:rgba(184,154,106,0.03)}
.feature-emoji{font-size:3rem;flex-shrink:0}
.feature-tag{display:inline-block;color:${c.primary};font-size:.7rem;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px}
.feature-card h3{font-family:'Playfair Display',serif;font-size:1.4rem;font-weight:700;margin-bottom:12px}
.feature-card p{color:rgba(245,240,232,0.6);font-size:.95rem;line-height:1.7}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:0;border:1px solid rgba(184,154,106,0.2);max-width:900px;margin:0 auto}
.stat{padding:48px 32px;text-align:center;border-right:1px solid rgba(184,154,106,0.2)}
.stat:last-child{border-right:none}
.stat .num{font-family:'Playfair Display',serif;font-size:3.5rem;font-weight:700;color:${c.primary};line-height:1;margin-bottom:12px}
.stat .label{font-size:.75rem;color:rgba(245,240,232,0.5);text-transform:uppercase;letter-spacing:3px}
.testimonials{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:32px}
.testimonial{padding:40px 32px;border:1px solid rgba(184,154,106,0.15);text-align:center}
.testimonial-stars{color:${c.primary};font-size:1.2rem;margin-bottom:24px;letter-spacing:4px}
.testimonial-quote{font-family:'Playfair Display',serif;font-style:italic;font-size:1.15rem;line-height:1.7;color:rgba(245,240,232,0.8);margin-bottom:24px}
.testimonial-author{color:${c.primary};font-size:.85rem;letter-spacing:2px;text-transform:uppercase}
.gallery{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;max-width:900px;margin:0 auto}
.gallery-item{aspect-ratio:1;background:rgba(184,154,106,0.05);border:1px solid rgba(184,154,106,0.15);display:flex;align-items:center;justify-content:center;font-size:3rem;transition:all .3s}
.gallery-item:hover{border-color:${c.primary};background:rgba(184,154,106,0.1)}
.map-container{border:1px solid rgba(184,154,106,0.2);max-width:1000px;margin:0 auto}
.map-container iframe{width:100%;height:400px;border:0;display:block;filter:grayscale(.3)}
.map-info{padding:32px;text-align:center;border-top:1px solid rgba(184,154,106,0.2)}
.map-info p{color:rgba(245,240,232,0.6);font-size:.95rem;margin-bottom:8px}
.cta-section{text-align:center;padding:120px 40px;background:linear-gradient(180deg,transparent,${c.primary}0a);border-top:1px solid rgba(184,154,106,0.2);border-bottom:1px solid rgba(184,154,106,0.2)}
.cta-section h2{font-family:'Playfair Display',serif;font-size:clamp(2.2rem,5vw,3.5rem);font-weight:700;margin-bottom:24px}
.cta-section p{font-family:'Playfair Display',serif;font-style:italic;color:rgba(245,240,232,0.6);font-size:1.3rem;margin-bottom:48px}
footer{background:#1a1410;padding:60px 40px 40px;text-align:center;border-top:1px solid rgba(184,154,106,0.2)}
footer .brand{font-family:'Playfair Display',serif;font-size:1.6rem;font-weight:700;margin-bottom:16px}
footer .brand span{color:${c.primary}}
footer p{color:rgba(245,240,232,0.5);font-size:.85rem;margin-bottom:6px}
footer .credit{margin-top:24px;padding-top:24px;border-top:1px solid rgba(184,154,106,0.15)}
footer .credit a{color:${c.primary};font-weight:500}
footer .social{display:flex;gap:16px;justify-content:center;margin-top:20px}
footer .social a{width:44px;height:44px;border:1px solid rgba(184,154,106,0.2);display:inline-flex;align-items:center;justify-content:center;font-size:1.2rem;transition:all .3s}
footer .social a:hover{border-color:${c.primary};color:${c.primary}}
@media(max-width:600px){.hero h1{font-size:2.5rem}.nav-links{display:none}.gallery{grid-template-columns:repeat(2,1fr)}.stats{grid-template-columns:repeat(2,1fr)}.stat:nth-child(2){border-right:none}}
</style></head><body>
<nav class="nav"><div class="nav-inner"><a href="#" class="nav-logo">${lead.name.split(" ")[0]}<span> ${lead.name.split(" ").slice(1).join(" ")||""}</span></a><div class="nav-links"><a href="#inicio">Início</a><a href="#sobre">Sobre</a><a href="#destaques">${cfg.sectionTitle}</a><a href="#depoimentos">Depoimentos</a><a href="#contato">Contato</a>${wa?`<a href="https://wa.me/${wa}" class="nav-cta" target="_blank">WhatsApp</a>`:""}</div></div></nav>
<section class="hero" id="inicio"><div class="hero-bg"></div><div class="hero-content"><div class="hero-badge">${cfg.heroBadge}</div><h1>${cfg.heroTitle(lead.name)}</h1><p class="sub">${cfg.heroSubtitle(city)}</p>${lead.rating?`<div class="rating"><span class="stars">★★★★★</span> <span class="sep">·</span> ${lead.rating} <span class="sep">·</span> ${lead.user_ratings_total||0} avaliações</div>`:""}<div class="hero-buttons">${wa?`<a href="https://wa.me/${wa}" class="btn-primary" target="_blank">${cfg.ctaButton}</a>`:""}<a href="${maps}" class="btn-outline" target="_blank">Como Chegar</a></div></div></section>
<div class="divider"><span class="divider-icon">✦</span></div>
<div class="categories"><div class="cat-pills">${pillsHtml}</div></div>
<section class="section" id="destaques"><div class="section-label">${cfg.heroBadge.replace(/^[^\w]+\s*/,"")}</div><h2 class="section-title">${cfg.sectionTitle}</h2><p class="section-sub">${cfg.sectionSub}</p><div class="feature-grid">${featuresHtml}</div></section>
<section class="section" id="sobre"><div class="section-label">Nossa História</div><h2 class="section-title">Sobre Nós</h2><p class="section-sub">Conheça nossa história</p><div style="max-width:700px;margin:0 auto;line-height:1.9;color:rgba(245,240,232,0.7);font-size:1.1rem;text-align:center"><p>${cfg.aboutText(lead.name,n,city,lead.rating,lead.user_ratings_total)}</p></div><div class="stats" style="margin-top:60px">${lead.rating?`<div class="stat"><div class="num">${lead.rating}</div><div class="label">Estrelas Google</div></div>`:""}${lead.user_ratings_total?`<div class="stat"><div class="num">${lead.user_ratings_total}+</div><div class="label">Clientes</div></div>`:""}<div class="stat"><div class="num">100%</div><div class="label">Qualidade</div></div><div class="stat"><div class="num">24/7</div><div class="label">Atendimento</div></div></div></section>
<div class="divider"><span class="divider-icon">✦</span></div>
<section class="section" id="depoimentos"><div class="section-label">O que dizem</div><h2 class="section-title">Depoimentos</h2><p class="section-sub">A satisfação de quem confia em nós</p><div class="testimonials">${testimonialsHtml}</div></section>
<section class="section"><div class="section-label">Veja mais</div><h2 class="section-title">Galeria</h2><p class="section-sub">Um pouquinho do nosso dia a dia</p><div class="gallery">${galleryHtml}</div></section>
<div class="divider"><span class="divider-icon">✦</span></div>
<section class="section" id="contato"><div class="section-label">Visite-nos</div><h2 class="section-title">Como Chegar</h2><p class="section-sub">Venha nos visitar</p><div class="map-container"><iframe src="${embed}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe><div class="map-info"><p>📍 ${lead.formatted_address||city||""}</p>${lead.phone?`<p>📞 ${lead.phone}</p>`:""}</div></div><div style="display:flex;flex-wrap:wrap;gap:16px;justify-content:center;margin-top:36px">${wa?`<a href="https://wa.me/${wa}" class="btn-primary" target="_blank">💬 WhatsApp</a>`:""}<a href="${maps}" class="btn-outline" target="_blank">Abrir no Maps</a></div></section>
<section class="cta-section"><h2>${cfg.ctaTitle}</h2><p>${cfg.ctaSubtitle}</p>${wa?`<a href="https://wa.me/${wa}" class="btn-primary" target="_blank">${cfg.ctaButton}</a>`:""}</section>
<footer><div class="brand">${lead.name.split(" ")[0]}<span> ${lead.name.split(" ").slice(1).join(" ")||""}</span></div><p>${lead.formatted_address||city||""}</p>${lead.phone?`<p>${lead.phone}</p>`:""}<div class="social">${lead.instagram?`<a href="${lead.instagram}" target="_blank" title="Instagram">📷</a>`:""}${lead.facebook?`<a href="${lead.facebook}" target="_blank" title="Facebook">👍</a>`:""}${wa?`<a href="https://wa.me/${wa}" target="_blank" title="WhatsApp">💬</a>`:""}</div><div class="credit"><p>© ${new Date().getFullYear()} ${lead.name}. Todos os direitos reservados.</p><p style="margin-top:6px">Site criado por <a href="https://clodoaldo.vercel.app" target="_blank">Clodoaldo Silva</a></p></div></footer>
</body></html>`;
  },
};

// =====================================================
// EXPORTS
// =====================================================
export const PREVIEW_STYLES: PreviewStyle[] = [styleDark, styleLight, styleBold, styleElegant];

export function getStyleById(id: string): PreviewStyle {
  return PREVIEW_STYLES.find(s => s.id === id) || PREVIEW_STYLES[0];
}
