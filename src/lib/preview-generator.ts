/**
 * Gerador de preview de site para prospects.
 * Design rico inspirado em deliverybr.lovable.app:
 * - Hero com gradiente + overlay
 * - Cards de categorias
 * - Grid de produtos/destaques
 * - Seção sobre com stats
 * - Galeria
 * - Mapa com Google Maps embed
 * - CTA WhatsApp + Como Chegar
 * - Footer com "Criado por Clodoaldo Silva"
 * - PWA meta tags com logo
 */

export interface PreviewLead {
  name: string;
  niche?: string;
  category?: string;
  formatted_address?: string;
  city?: string;
  phone?: string | null;
  whatsapp?: string | null;
  website?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  rating?: number | null;
  user_ratings_total?: number | null;
  lat?: number;
  lng?: number;
}

export function generatePreviewHTML(lead: PreviewLead): string {
  const wa = (lead.whatsapp || lead.phone || "").replace(/\D/g, "");
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.name + " " + (lead.formatted_address || lead.city || ""))}`;
  const embed = `https://www.google.com/maps?q=${lead.lat || 0},${lead.lng || 0}&z=16&output=embed`;
  const n = lead.niche || lead.category || "estabelecimento";
  const city = lead.city || "";

  const colors: Record<string, { primary: string; accent: string; dark: string }> = {
    restaurante: { primary: "#FE7B02", accent: "#FE3F21", dark: "#1b1b1b" },
    pizzaria: { primary: "#E65100", accent: "#FF6F00", dark: "#1b1b1b" },
    hamburgueria: { primary: "#FFC107", accent: "#5D4037", dark: "#1b1b1b" },
    cafeteria: { primary: "#8D6E63", accent: "#4E342E", dark: "#1b1b1b" },
    barbearia: { primary: "#FFD600", accent: "#263238", dark: "#1b1b1b" },
    academia: { primary: "#00C853", accent: "#1B5E20", dark: "#1b1b1b" },
    "salao de beleza": { primary: "#E91E63", accent: "#880E4F", dark: "#1b1b1b" },
    farmacia: { primary: "#42A5F5", accent: "#0D47A1", dark: "#1b1b1b" },
    "pet shop": { primary: "#66BB6A", accent: "#2E7D32", dark: "#1b1b1b" },
  };
  const c = colors[(n || "").toLowerCase()] || { primary: "#FE7B02", accent: "#FE3F21", dark: "#1b1b1b" };

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${lead.name} | ${n} em ${city}</title>
<meta name="description" content="${lead.name} — ${n} em ${city}.${lead.rating ? ' ' + lead.rating + ' estrelas no Google.' : ''} Peça pelo WhatsApp!">
<!-- PWA -->
<meta name="theme-color" content="${c.dark}">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="${lead.name}">
<link rel="icon" href="https://clodoaldo.vercel.app/assets/clodoaldo-logo.png">
<link rel="apple-touch-icon" href="https://clodoaldo.vercel.app/assets/clodoaldo-logo.png">
<!-- Open Graph -->
<meta property="og:title" content="${lead.name} | ${n} em ${city}">
<meta property="og:description" content="${lead.rating ? lead.rating + ' estrelas no Google. ' : ''}Peça pelo WhatsApp!">
<meta property="og:image" content="https://clodoaldo.vercel.app/assets/clodoaldo-logo.png">
<meta property="og:type" content="website">
<style>
:root{--primary:${c.primary};--accent:${c.accent};--dark:${c.dark};--gold:#FFD700}
*{margin:0;padding:0;box-sizing:border-box;font-family:'Inter',-apple-system,system-ui,sans-serif}
body{background:${c.dark};color:#fff;overflow-x:hidden}

/* NAVBAR */
.nav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(${parseInt(c.dark.slice(1,3),16)},${parseInt(c.dark.slice(3,5),16)},${parseInt(c.dark.slice(5,7),16)},0.85);backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,0.06)}
.nav-inner{max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;padding:0 20px;height:64px}
.nav-logo{font-size:1.3rem;font-weight:800;letter-spacing:-0.5px;color:#fff;text-decoration:none}
.nav-logo span{color:var(--primary)}
.nav-links{display:flex;align-items:center;gap:24px}
.nav-links a{color:rgba(255,255,255,0.7);text-decoration:none;font-size:.9rem;font-weight:500;transition:color .2s}
.nav-links a:hover{color:#fff}
.nav-cta{display:inline-flex;align-items:center;gap:6px;background:var(--primary);color:#fff;padding:8px 18px;border-radius:10px;font-size:.85rem;font-weight:700;text-decoration:none;transition:all .2s}
.nav-cta:hover{transform:translateY(-1px);box-shadow:0 6px 20px var(--primary)44}

/* HERO */
.hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;padding:80px 20px 60px;text-align:center}
.hero-bg{position:absolute;inset:0;background:radial-gradient(ellipse at top,${c.primary}22 0%,transparent 60%),radial-gradient(ellipse at bottom,${c.accent}11 0%,transparent 50%),${c.dark};z-index:0}
.hero-content{position:relative;z-index:1;max-width:700px}
.hero-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,0.08);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.12);padding:6px 16px;border-radius:30px;font-size:.75rem;font-weight:600;text-transform:uppercase;letter-spacing:2px;color:var(--primary);margin-bottom:24px}
.hero h1{font-size:3rem;font-weight:900;letter-spacing:-1.5px;line-height:1;margin-bottom:12px;text-shadow:0 4px 30px rgba(0,0,0,0.5)}
.hero .sub{font-size:1.1rem;color:rgba(255,255,255,0.7);margin-bottom:28px;font-weight:400}
.hero .rating{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);padding:10px 24px;border-radius:40px;margin-bottom:32px;font-size:1rem;font-weight:600}
.hero .rating .stars{color:var(--gold)}
.hero-buttons{display:flex;flex-wrap:wrap;gap:12px;justify-content:center}
.btn-primary{display:inline-flex;align-items:center;gap:8px;padding:16px 40px;border-radius:14px;background:var(--primary);color:#fff;text-decoration:none;font-weight:800;font-size:1.05rem;box-shadow:0 10px 40px var(--primary)55;transition:all .25s;border:none;cursor:pointer}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 14px 50px var(--primary)77}
.btn-outline{display:inline-flex;align-items:center;gap:8px;padding:16px 32px;border-radius:14px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);color:#fff;text-decoration:none;font-weight:600;font-size:1rem;transition:all .25s}
.btn-outline:hover{background:rgba(255,255,255,0.12);border-color:rgba(255,255,255,0.3)}

/* SEARCH BAR */
.search-bar{max-width:500px;margin:0 auto 40px;display:flex;align-items:center;gap:10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:16px;padding:12px 18px}
.search-bar input{flex:1;background:transparent;border:none;color:#fff;font-size:.95rem;outline:none}
.search-bar input::placeholder{color:rgba(255,255,255,0.4)}
.search-bar svg{color:rgba(255,255,255,0.4);flex-shrink:0}

/* CATEGORIES */
.categories{padding:20px;max-width:1200px;margin:0 auto}
.cat-pills{display:flex;flex-wrap:wrap;gap:10px;justify-content:center}
.cat-pill{display:inline-flex;align-items:center;gap:6px;padding:10px 20px;border-radius:40px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);color:rgba(255,255,255,0.7);font-size:.85rem;font-weight:600;cursor:pointer;transition:all .2s}
.cat-pill:hover,.cat-pill.active{background:var(--primary);border-color:var(--primary);color:#fff}

/* SECTION */
.section{max-width:1200px;margin:0 auto;padding:60px 20px}
.section-title{font-size:1.8rem;font-weight:800;margin-bottom:8px;letter-spacing:-0.5px}
.section-sub{color:rgba(255,255,255,0.5);font-size:.95rem;margin-bottom:32px}

/* FEATURE CARDS */
.feature-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}
.feature-card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:20px;overflow:hidden;transition:all .3s}
.feature-card:hover{border-color:var(--primary)44;transform:translateY(-4px);box-shadow:0 20px 40px rgba(0,0,0,0.3)}
.feature-img{height:200px;background:linear-gradient(135deg,var(--primary)22,var(--accent)11);display:flex;align-items:center;justify-content:center;font-size:3rem}
.feature-body{padding:20px}
.feature-body h3{font-size:1.1rem;font-weight:700;margin-bottom:6px}
.feature-body p{color:rgba(255,255,255,0.5);font-size:.85rem;line-height:1.5}
.feature-tag{display:inline-block;background:var(--primary)22;color:var(--primary);padding:4px 12px;border-radius:20px;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px}

/* STATS */
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:20px;text-align:center}
.stat{padding:30px 20px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:20px}
.stat .num{font-size:2.5rem;font-weight:900;color:var(--primary);line-height:1}
.stat .label{font-size:.85rem;color:rgba(255,255,255,0.5);margin-top:8px;text-transform:uppercase;letter-spacing:1px}

/* MAP */
.map-container{border-radius:20px;overflow:hidden;border:1px solid rgba(255,255,255,0.06);margin-top:20px}
.map-container iframe{width:100%;height:380px;border:0;display:block}
.map-info{padding:20px;background:rgba(255,255,255,0.03)}
.map-info p{color:rgba(255,255,255,0.6);font-size:.9rem;margin-bottom:4px}

/* CTA SECTION */
.cta-section{text-align:center;padding:80px 20px;background:linear-gradient(135deg,var(--primary)11,var(--accent)06)}
.cta-section h2{font-size:2.2rem;font-weight:900;margin-bottom:12px}
.cta-section p{color:rgba(255,255,255,0.6);font-size:1.1rem;margin-bottom:32px}

/* FOOTER */
footer{background:${c.dark};border-top:1px solid rgba(255,255,255,0.06);padding:40px 20px;text-align:center}
footer .brand{font-size:1.2rem;font-weight:800;margin-bottom:8px}
footer .brand span{color:var(--primary)}
footer p{color:rgba(255,255,255,0.4);font-size:.85rem;margin-bottom:4px}
footer .credit{margin-top:20px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.06)}
footer .credit a{color:var(--primary);text-decoration:none;font-weight:600}
footer .social{display:flex;gap:12px;justify-content:center;margin-top:16px}
footer .social a{display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);color:rgba(255,255,255,0.6);text-decoration:none;font-size:1.2rem;transition:all .2s}
footer .social a:hover{background:var(--primary);color:#fff;border-color:var(--primary)}

@media(max-width:600px){
  .hero h1{font-size:2rem}
  .nav-links{display:none}
  .section-title{font-size:1.4rem}
  .btn-primary{padding:14px 30px;font-size:.95rem}
}
</style>
</head>
<body>

<!-- NAVBAR -->
<nav class="nav">
  <div class="nav-inner">
    <a href="#" class="nav-logo">${lead.name.split(" ")[0]}<span>${lead.name.split(" ").slice(1).join(" ") || ""}</span></a>
    <div class="nav-links">
      <a href="#inicio">Início</a>
      <a href="#sobre">Sobre</a>
      <a href="#destaques">Destaques</a>
      <a href="#contato">Contato</a>
      ${wa ? `<a href="https://wa.me/${wa}" class="nav-cta" target="_blank">📱 WhatsApp</a>` : ""}
    </div>
  </div>
</nav>

<!-- HERO -->
<section class="hero" id="inicio">
  <div class="hero-bg"></div>
  <div class="hero-content">
    <div class="hero-badge">🔥 Em alta · ${n}</div>
    <h1>${lead.name}</h1>
    <p class="sub">${n} em ${city}</p>
    ${lead.rating ? `<div class="rating"><span class="stars">★★★★★</span> ${lead.rating} · ${lead.user_ratings_total || 0} avaliações no Google</div>` : ""}
    <div class="hero-buttons">
      ${wa ? `<a href="https://wa.me/${wa}" class="btn-primary" target="_blank">📱 Pedir pelo WhatsApp</a>` : ""}
      <a href="${maps}" class="btn-outline" target="_blank">🗺️ Como Chegar</a>
    </div>
    <div style="margin-top:30px;max-width:500px;margin-left:auto;margin-right:auto">
      <div class="search-bar">
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input type="text" placeholder="Buscar produtos, pratos, serviços..." readonly>
      </div>
    </div>
  </div>
</section>

<!-- CATEGORIES -->
<div class="categories">
  <div class="cat-pills">
    <div class="cat-pill active">⭐ Destaques</div>
    <div class="cat-pill">🔥 Mais pedidos</div>
    <div class="cat-pill">🆕 Novidades</div>
    <div class="cat-pill">💰 Promoções</div>
    <div class="cat-pill">📍 Localização</div>
  </div>
</div>

<!-- DESTAQUES -->
<section class="section" id="destaques">
  <h2 class="section-title">Destaques</h2>
  <p class="section-sub">Os favoritos dos nossos clientes</p>
  <div class="feature-grid">
    <div class="feature-card">
      <div class="feature-img">🍽️</div>
      <div class="feature-body">
        <span class="feature-tag">Mais pedido</span>
        <h3>Especial da Casa</h3>
        <p>Nosso prato mais famoso, preparado com ingredientes selecionados e muito amor.</p>
      </div>
    </div>
    <div class="feature-card">
      <div class="feature-img">🥗</div>
      <div class="feature-body">
        <span class="feature-tag">Saudável</span>
        <h3>Opção Fitness</h3>
        <p>Para quem busca sabor com equilíbrio. Fresco, leve e nutritivo.</p>
      </div>
    </div>
    <div class="feature-card">
      <div class="feature-img">🥤</div>
      <div class="feature-body">
        <span class="feature-tag">Combo</span>
        <h3>Bebidas & Sobremesas</h3>
        <p>Complete sua experiência com nossa seleção de bebidas e sobremesas.</p>
      </div>
    </div>
  </div>
</section>

<!-- SOBRE -->
<section class="section" id="sobre" style="background:rgba(255,255,255,0.02);border-top:1px solid rgba(255,255,255,0.04);border-bottom:1px solid rgba(255,255,255,0.04)">
  <h2 class="section-title">Sobre Nós</h2>
  <p class="section-sub">Conheça nossa história</p>
  <div style="max-width:700px;margin:0 auto;line-height:1.8;color:rgba(255,255,255,0.7);font-size:1.05rem;text-align:center">
    <p>Bem-vindo ao <strong style="color:#fff">${lead.name}</strong>! Somos referência em ${n} em ${city}.
    ${lead.rating ? `Com ${lead.rating} estrelas no Google e ${lead.user_ratings_total || 0} avaliações de clientes satisfeitos, ` : ""}
    oferecemos qualidade excepcional, atendimento dedicado e uma experiência que vai superar suas expectativas.</p>
  </div>
  <div class="stats" style="margin-top:40px">
    ${lead.rating ? `<div class="stat"><div class="num">${lead.rating}★</div><div class="label">Avaliação Google</div></div>` : ""}
    ${lead.user_ratings_total ? `<div class="stat"><div class="num">${lead.user_ratings_total}+</div><div class="label">Clientes satisfeitos</div></div>` : ""}
    <div class="stat"><div class="num">100%</div><div class="label">Qualidade garantida</div></div>
    <div class="stat"><div class="num">24/7</div><div class="label">Pedidos via WhatsApp</div></div>
  </div>
</section>

<!-- MAPA -->
<section class="section" id="contato">
  <h2 class="section-title">Como Chegar</h2>
  <p class="section-sub">Venha nos visitar</p>
  <div class="map-container">
    <iframe src="${embed}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
    <div class="map-info">
      <p>📍 ${lead.formatted_address || city || ""}</p>
      ${lead.phone ? `<p>📞 ${lead.phone}</p>` : ""}
    </div>
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin-top:24px">
    <a href="${maps}" class="btn-outline" target="_blank">🗺️ Abrir no Maps</a>
    ${wa ? `<a href="tel:${wa}" class="btn-outline">📞 Ligar agora</a>` : ""}
    ${wa ? `<a href="https://wa.me/${wa}" class="btn-primary" target="_blank">💬 WhatsApp</a>` : ""}
  </div>
</section>

<!-- CTA FINAL -->
<section class="cta-section">
  <h2>Pronto para experimentar?</h2>
  <p>Peça agora mesmo pelo WhatsApp e receba em casa</p>
  ${wa ? `<a href="https://wa.me/${wa}" class="btn-primary" target="_blank">📱 Fazer Pedido</a>` : `<a href="${maps}" class="btn-primary" target="_blank">🗺️ Visitar</a>`}
</section>

<!-- FOOTER -->
<footer>
  <div class="brand">${lead.name.split(" ")[0]}<span> ${lead.name.split(" ").slice(1).join(" ") || ""}</span></div>
  <p>${lead.formatted_address || city || ""}</p>
  ${lead.phone ? `<p>${lead.phone}</p>` : ""}
  <div class="social">
    ${lead.instagram ? `<a href="${lead.instagram}" target="_blank" title="Instagram">📷</a>` : ""}
    ${lead.facebook ? `<a href="${lead.facebook}" target="_blank" title="Facebook">👍</a>` : ""}
    ${wa ? `<a href="https://wa.me/${wa}" target="_blank" title="WhatsApp">💬</a>` : ""}
  </div>
  <div class="credit">
    <p>© ${new Date().getFullYear()} ${lead.name}. Todos os direitos reservados.</p>
    <p style="margin-top:6px">Site criado por <a href="https://clodoaldo.vercel.app" target="_blank">Clodoaldo Silva</a></p>
  </div>
</footer>

</body>
</html>`;
}
