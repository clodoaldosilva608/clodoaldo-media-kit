/**
 * Templates específicos por nicho.
 *
 * Cada nicho tem 4 templates visualmente distintos:
 * - Template A: Hero split (foto + texto lado a lado)
 * - Template B: Hero centered (foto fullscreen + overlay)
 * - Template C: Hero card (foto em card flutuante)
 * - Template D: Hero minimal (sem foto, tipografia focada)
 *
 * Os 4 templates compartilham o conteúdo do nicho (features, depoimentos, etc.)
 * mas têm layouts, paletas e estruturas visualmente diferentes.
 */

import { NicheConfig, StyleContext } from "./preview-styles";
import { getNichePhotos } from "./niche-photos";

// =====================================================
// TEMPLATE A: HERO SPLIT (foto + texto lado a lado)
// =====================================================
export function renderTemplateA(cfg: NicheConfig, ctx: StyleContext): string {
  const { lead, wa, maps, embed, n, city } = ctx;
  const c = cfg.colors;
  const photos = getNichePhotos(n);
  const features = cfg.features.map((f,i)=>`<div class="fc"><div class="fi" style="background-image:url('${photos.features[i]||photos.features[0]}')"></div><div class="fb"><span class="ft">${f.tag}</span><h3>${f.title}</h3><p>${f.desc}</p></div></div>`).join("");
  const pills = cfg.categoryPills.map((p,i)=>`<div class="cp ${i===0?"a":""}">${p}</div>`).join("");
  const tests = cfg.testimonials.map(t=>`<div class="ts"><div class="tss">${"★".repeat(t.rating)}</div><p>"${t.text}"</p><div class="tsa">— ${t.name}</div></div>`).join("");
  const gallery = cfg.galleryEmojis.map((e,i)=>`<div class="gi" style="background-image:url('${photos.gallery[i]||photos.gallery[0]}')"></div>`).join("");

  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${lead.name} | ${n} em ${city}</title><link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet"><style>
*{margin:0;padding:0;box-sizing:border-box}body{background:${c.dark};color:#fff;font-family:'Inter',sans-serif;overflow-x:hidden}a{text-decoration:none;color:inherit}h1,h2,h3{font-family:'Space Grotesk',sans-serif}
.nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:0 40px;height:72px;display:flex;align-items:center;justify-content:space-between;background:rgba(10,10,10,.8);backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,.06)}
.nl{font-family:'Space Grotesk';font-size:1.3rem;font-weight:700}.nl span{color:${c.primary}}
.nlinks{display:flex;gap:32px;align-items:center}.nlinks a{color:rgba(255,255,255,.7);font-size:.85rem}.nlinks a:hover{color:#fff}
.nc{background:${c.primary};color:${c.dark};padding:10px 22px;border-radius:999px;font-weight:700;font-size:.85rem}
.hero{min-height:100vh;display:grid;grid-template-columns:1fr 1fr;align-items:center}
.hero-text{padding:120px 60px 80px}
.hb{display:inline-block;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);padding:8px 20px;border-radius:999px;font-size:.7rem;font-weight:600;text-transform:uppercase;letter-spacing:3px;color:${c.primary};margin-bottom:32px}
.hero h1{font-size:clamp(2.5rem,5vw,4rem);font-weight:700;letter-spacing:-2px;line-height:1;margin-bottom:20px}
.hero .sub{font-size:1.2rem;color:rgba(255,255,255,.6);margin-bottom:32px;font-weight:300}
.hr{display:inline-flex;align-items:center;gap:10px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);padding:12px 24px;border-radius:999px;margin-bottom:32px}.hr .stars{color:#FFD700;letter-spacing:2px}
.hbtns{display:flex;flex-wrap:wrap;gap:14px}
.bp{padding:16px 40px;border-radius:999px;background:${c.primary};color:${c.dark};font-weight:700;font-size:1rem;box-shadow:0 10px 40px ${c.primary}55;transition:all .3s;border:none;cursor:pointer}.bp:hover{transform:translateY(-3px)}
.bo{padding:16px 36px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.2);color:#fff;font-weight:600;font-size:1rem;transition:all .3s}.bo:hover{background:rgba(255,255,255,.15)}
.hero-img{background-image:url('${photos.hero}');background-size:cover;background-position:center;min-height:100vh;position:relative}
.hero-img::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,${c.dark},transparent 30%)}
.cats{padding:32px 40px;max-width:1200px;margin:0 auto}.cps{display:flex;flex-wrap:wrap;gap:10px;justify-content:center}
.cp{padding:10px 22px;border-radius:999px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);color:rgba(255,255,255,.7);font-size:.8rem;font-weight:600;cursor:pointer;transition:all .2s}.cp:hover,.cp.a{background:${c.primary};border-color:${c.primary};color:${c.dark}}
.sec{max-width:1200px;margin:0 auto;padding:100px 40px}
.sl{font-size:.7rem;font-weight:600;text-transform:uppercase;letter-spacing:4px;color:${c.primary};margin-bottom:16px}
.st{font-size:clamp(2rem,5vw,3rem);font-weight:700;letter-spacing:-1px;margin-bottom:16px}
.ss{color:rgba(255,255,255,.4);font-size:1.05rem;margin-bottom:48px;font-weight:300}
.fg{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px}
.fc{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:24px;overflow:hidden;transition:all .3s}.fc:hover{border-color:${c.primary}66;transform:translateY(-6px);box-shadow:0 20px 40px rgba(0,0,0,.3)}
.fi{height:200px;background-size:cover;background-position:center}
.fb{padding:24px}.ft{display:inline-block;background:${c.primary}22;color:${c.primary};padding:4px 12px;border-radius:999px;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px}
.fb h3{font-size:1.2rem;font-weight:700;margin-bottom:8px}.fb p{color:rgba(255,255,255,.5);font-size:.9rem;line-height:1.7}
.about{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}
.ai{height:400px;border-radius:24px;background-image:url('${photos.about}');background-size:cover;background-position:center}
.ac p{color:rgba(255,255,255,.7);font-size:1.1rem;line-height:1.8;margin-bottom:24px;font-weight:300}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:16px;text-align:center;margin-top:32px}
.stat{padding:24px 20px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:16px}.stat .num{font-family:'Space Grotesk';font-size:2.5rem;font-weight:700;color:${c.primary}}.stat .label{font-size:.7rem;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:2px;margin-top:8px}
.tss{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px}
.ts{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:24px;padding:32px}.tss2{color:#FFD700;font-size:1.1rem;margin-bottom:18px;letter-spacing:3px}.ts p{color:rgba(255,255,255,.8);font-size:.95rem;line-height:1.7;margin-bottom:18px;font-style:italic}.tsa{color:${c.primary};font-size:.9rem;font-weight:600}
.gal{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.gi{aspect-ratio:1;background-size:cover;background-position:center;border-radius:20px;border:1px solid rgba(255,255,255,.06);transition:all .3s}.gi:hover{transform:scale(1.05)}
.mc{border-radius:24px;overflow:hidden;border:1px solid rgba(255,255,255,.06);margin-top:24px}.mc iframe{width:100%;height:400px;border:0;display:block;filter:grayscale(.3) invert(.9)}.mi2{padding:24px;background:rgba(255,255,255,.03)}.mi2 p{color:rgba(255,255,255,.6);font-size:.95rem;margin-bottom:6px}
.cta{text-align:center;padding:120px 40px;background:linear-gradient(135deg,${c.primary}11,${c.accent}06)}.cta h2{font-size:clamp(2rem,5vw,3.2rem);font-weight:700;margin-bottom:20px}.cta p{color:rgba(255,255,255,.5);font-size:1.15rem;margin-bottom:40px;font-weight:300}
footer{background:${c.dark};border-top:1px solid rgba(255,255,255,.06);padding:48px 40px;text-align:center}
footer .brand{font-family:'Space Grotesk';font-size:1.3rem;font-weight:700;margin-bottom:12px}footer .brand span{color:${c.primary}}
footer p{color:rgba(255,255,255,.4);font-size:.85rem;margin-bottom:6px}
footer .credit{margin-top:24px;padding-top:24px;border-top:1px solid rgba(255,255,255,.06)}footer .credit a{color:${c.primary};font-weight:600}
footer .social{display:flex;gap:14px;justify-content:center;margin-top:20px}footer .social a{width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);display:inline-flex;align-items:center;justify-content:center;font-size:1.2rem;transition:all .2s}footer .social a:hover{background:${c.primary};color:${c.dark}}
@media(max-width:768px){.hero{grid-template-columns:1fr}.hero-img{min-height:300px;order:-1}.hero-text{padding:60px 40px}.nlinks{display:none}.gal{grid-template-columns:repeat(2,1fr)}.about{grid-template-columns:1fr;gap:40px}.ai{height:300px}}
</style></head><body>
<nav class="nav"><a href="#" class="nl">${lead.name.split(" ")[0]}<span>${lead.name.split(" ").slice(1).join(" ")||""}</span></a><div class="nlinks"><a href="#destaques">${cfg.sectionTitle}</a><a href="#sobre">Sobre</a><a href="#depoimentos">Depoimentos</a><a href="#contato">Contato</a>${wa?`<a href="https://wa.me/${wa}" class="nc" target="_blank">WhatsApp</a>`:""}</div></nav>
<section class="hero" id="inicio"><div class="hero-text"><div class="hb">${cfg.heroBadge}</div><h1>${cfg.heroTitle(lead.name)}</h1><p class="sub">${cfg.heroSubtitle(city)}</p>${lead.rating?`<div class="hr"><span class="stars">★★★★★</span> ${lead.rating} · ${lead.user_ratings_total||0} avaliações</div>`:""}<div class="hbtns">${wa?`<a href="https://wa.me/${wa}" class="bp" target="_blank">${cfg.ctaButton}</a>`:""}<a href="${maps}" class="bo" target="_blank">Como Chegar</a></div></div><div class="hero-img"></div></section>
<div class="cats"><div class="cps">${pills}</div></div>
<section class="sec" id="destaques"><div class="sl">${cfg.heroBadge.replace(/^[^\\w]+\\s*/,"")}</div><h2 class="st">${cfg.sectionTitle}</h2><p class="ss">${cfg.sectionSub}</p><div class="fg">${features}</div></section>
<section class="sec" id="sobre"><div class="about"><div class="ai"></div><div class="ac"><div class="sl">Nossa História</div><h2 class="st">Sobre Nós</h2><p>${cfg.aboutText(lead.name,n,city,lead.rating,lead.user_ratings_total)}</p><div class="stats">${lead.rating?`<div class="stat"><div class="num">${lead.rating}★</div><div class="label">Avaliação</div></div>`:""}${lead.user_ratings_total?`<div class="stat"><div class="num">${lead.user_ratings_total}+</div><div class="label">Clientes</div></div>`:""}<div class="stat"><div class="num">100%</div><div class="label">Qualidade</div></div></div></div></div></section>
<section class="sec" id="depoimentos" style="background:rgba(255,255,255,.02)"><div class="sl">O que dizem</div><h2 class="st">Depoimentos</h2><p class="ss">A satisfação de quem confia em nós</p><div class="tss">${tests}</div></section>
<section class="sec"><div class="sl">Veja mais</div><h2 class="st">Galeria</h2><p class="ss">Um pouquinho do nosso dia a dia</p><div class="gal">${gallery}</div></section>
<section class="sec" id="contato"><div class="sl">Visite-nos</div><h2 class="st">Como Chegar</h2><div class="mc"><iframe src="${embed}" loading="lazy"></iframe><div class="mi2"><p>📍 ${lead.formatted_address||city||""}</p>${lead.phone?`<p>📞 ${lead.phone}</p>`:""}</div></div><div style="display:flex;gap:14px;justify-content:center;margin-top:28px">${wa?`<a href="https://wa.me/${wa}" class="bp" target="_blank">💬 WhatsApp</a>`:""}<a href="${maps}" class="bo" target="_blank">Abrir no Maps</a></div></section>
<section class="cta"><h2>${cfg.ctaTitle}</h2><p>${cfg.ctaSubtitle}</p>${wa?`<a href="https://wa.me/${wa}" class="bp" target="_blank">${cfg.ctaButton}</a>`:""}</section>
<footer><div class="brand">${lead.name.split(" ")[0]}<span> ${lead.name.split(" ").slice(1).join(" ")||""}</span></div><p>${lead.formatted_address||city||""}</p>${lead.phone?`<p>${lead.phone}</p>`:""}<div class="social">${lead.instagram?`<a href="${lead.instagram}" target="_blank">📷</a>`:""}${lead.facebook?`<a href="${lead.facebook}" target="_blank">👍</a>`:""}${wa?`<a href="https://wa.me/${wa}" target="_blank">💬</a>`:""}</div><div class="credit"><p>© ${new Date().getFullYear()} ${lead.name}. Todos os direitos reservados.</p><p style="margin-top:6px">Site criado por <a href="https://clodoaldo.vercel.app" target="_blank">Clodoaldo Silva</a></p></div></footer>
</body></html>`;
}

// =====================================================
// TEMPLATE B: HERO CENTERED (foto fullscreen + overlay)
// =====================================================
export function renderTemplateB(cfg: NicheConfig, ctx: StyleContext): string {
  const { lead, wa, maps, embed, n, city } = ctx;
  const c = cfg.colors;
  const photos = getNichePhotos(n);
  const features = cfg.features.map((f,i)=>`<div class="fc"><div class="fi" style="background-image:url('${photos.features[i]||photos.features[0]}')"><div class="fio"></div></div><div class="fb"><span class="ft">${f.tag}</span><h3>${f.title}</h3><p>${f.desc}</p></div></div>`).join("");
  const pills = cfg.categoryPills.map((p,i)=>`<div class="cp ${i===0?"a":""}">${p}</div>`).join("");
  const tests = cfg.testimonials.map(t=>`<div class="ts"><div class="tss">${"★".repeat(t.rating)}</div><p>"${t.text}"</p><div class="tsa">— ${t.name}</div></div>`).join("");
  const gallery = cfg.galleryEmojis.map((e,i)=>`<div class="gi" style="background-image:url('${photos.gallery[i]||photos.gallery[0]}')"></div>`).join("");

  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${lead.name} | ${n} em ${city}</title><link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet"><style>
*{margin:0;padding:0;box-sizing:border-box}body{background:${c.dark};color:#fff;font-family:'Inter',sans-serif;overflow-x:hidden}a{text-decoration:none;color:inherit}h1,h2,h3{font-family:'Sora',sans-serif}
.nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:0 40px;height:72px;display:flex;align-items:center;justify-content:space-between;background:rgba(0,0,0,.3);backdrop-filter:blur(20px)}
.nl{font-family:'Sora';font-size:1.3rem;font-weight:800}.nl span{color:${c.primary}}
.nlinks{display:flex;gap:32px;align-items:center}.nlinks a{color:rgba(255,255,255,.8);font-size:.85rem}.nlinks a:hover{color:#fff}
.nc{background:${c.primary};color:#fff;padding:10px 22px;border-radius:999px;font-weight:700;font-size:.85rem}
.hero{min-height:100vh;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;text-align:center}
.hbg{position:absolute;inset:0;background-image:url('${photos.hero}');background-size:cover;background-position:center;filter:brightness(.4)}.hbg::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,${c.dark}88,${c.dark}44 50%,${c.dark})}
.hc{position:relative;z-index:1;max-width:800px;padding:120px 40px 80px}
.hb{display:inline-block;background:rgba(255,255,255,.1);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.2);padding:8px 24px;border-radius:999px;font-size:.7rem;font-weight:600;text-transform:uppercase;letter-spacing:3px;color:${c.primary};margin-bottom:32px}
.hero h1{font-size:clamp(3rem,8vw,6rem);font-weight:800;letter-spacing:-3px;line-height:1;margin-bottom:24px;text-shadow:0 4px 40px rgba(0,0,0,.7)}
.hero .sub{font-size:1.3rem;color:rgba(255,255,255,.7);margin-bottom:40px;font-weight:300}
.hr{display:inline-flex;align-items:center;gap:10px;background:rgba(255,255,255,.1);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.15);padding:14px 32px;border-radius:999px;margin-bottom:40px}.hr .stars{color:#FFD700;letter-spacing:2px}
.hbtns{display:flex;flex-wrap:wrap;gap:16px;justify-content:center}
.bp{padding:20px 48px;border-radius:999px;background:${c.primary};color:#fff;font-weight:800;font-size:1.1rem;box-shadow:0 10px 40px ${c.primary}55;transition:all .3s;border:none;cursor:pointer}.bp:hover{transform:translateY(-4px);box-shadow:0 20px 60px ${c.primary}77}
.bo{padding:20px 40px;border-radius:999px;background:rgba(255,255,255,.1);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.25);color:#fff;font-weight:600;font-size:1.05rem;transition:all .3s}.bo:hover{background:rgba(255,255,255,.2)}
.cats{padding:40px;max-width:1200px;margin:0 auto}.cps{display:flex;flex-wrap:wrap;gap:10px;justify-content:center}
.cp{padding:12px 24px;border-radius:999px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);color:rgba(255,255,255,.7);font-size:.8rem;font-weight:600;cursor:pointer;transition:all .2s}.cp:hover,.cp.a{background:${c.primary};border-color:${c.primary};color:#fff}
.sec{max-width:1200px;margin:0 auto;padding:100px 40px;text-align:center}
.sl{font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:4px;color:${c.primary};margin-bottom:16px}
.st{font-size:clamp(2rem,5vw,3rem);font-weight:800;letter-spacing:-1px;margin-bottom:16px}
.ss{color:rgba(255,255,255,.4);font-size:1.05rem;margin-bottom:48px;font-weight:300}
.fg{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;text-align:left}
.fc{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:24px;overflow:hidden;transition:all .3s}.fc:hover{border-color:${c.primary}66;transform:translateY(-6px)}
.fi{height:220px;background-size:cover;background-position:center;position:relative}.fio{position:absolute;inset:0;background:linear-gradient(180deg,transparent 50%,rgba(0,0,0,.5))}
.fb{padding:28px}.ft{display:inline-block;background:${c.primary}22;color:${c.primary};padding:4px 14px;border-radius:999px;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px}
.fb h3{font-size:1.3rem;font-weight:700;margin-bottom:8px}.fb p{color:rgba(255,255,255,.5);font-size:.9rem;line-height:1.7}
.about{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center;text-align:left}
.ai{height:450px;border-radius:24px;background-image:url('${photos.about}');background-size:cover;background-position:center}
.ac p{color:rgba(255,255,255,.7);font-size:1.1rem;line-height:1.8;margin-bottom:24px;font-weight:300}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:16px;text-align:center;margin-top:32px}
.stat{padding:28px 20px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:16px}.stat .num{font-family:'Sora';font-size:3rem;font-weight:800;color:${c.primary}}.stat .label{font-size:.75rem;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:2px;margin-top:8px}
.tss{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px;text-align:left}
.ts{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:24px;padding:32px}.tss2{color:#FFD700;font-size:1.2rem;margin-bottom:18px;letter-spacing:3px}.ts p{color:rgba(255,255,255,.8);font-size:1rem;line-height:1.7;margin-bottom:18px;font-style:italic}.tsa{color:${c.primary};font-size:.9rem;font-weight:600}
.gal{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.gi{aspect-ratio:1;background-size:cover;background-position:center;border-radius:20px;border:1px solid rgba(255,255,255,.06);transition:all .3s}.gi:hover{transform:scale(1.05)}
.mc{border-radius:24px;overflow:hidden;border:1px solid rgba(255,255,255,.06);margin-top:24px;max-width:1000px;margin-left:auto;margin-right:auto}.mc iframe{width:100%;height:400px;border:0;display:block;filter:grayscale(.3) invert(.9)}.mi2{padding:24px;background:rgba(255,255,255,.03)}.mi2 p{color:rgba(255,255,255,.6);font-size:.95rem;margin-bottom:6px}
.cta{padding:140px 40px;background-image:url('${photos.hero}');background-size:cover;background-position:center;text-align:center;position:relative}.cta::before{content:"";position:absolute;inset:0;background:${c.dark};opacity:.85}.cta>*{position:relative;z-index:1}
.cta h2{font-size:clamp(2rem,5vw,3.2rem);font-weight:800;margin-bottom:20px}.cta p{color:rgba(255,255,255,.5);font-size:1.15rem;margin-bottom:40px;font-weight:300}
footer{background:${c.dark};border-top:1px solid rgba(255,255,255,.06);padding:48px 40px;text-align:center}
footer .brand{font-family:'Sora';font-size:1.3rem;font-weight:800;margin-bottom:12px}footer .brand span{color:${c.primary}}
footer p{color:rgba(255,255,255,.4);font-size:.85rem;margin-bottom:6px}
footer .credit{margin-top:24px;padding-top:24px;border-top:1px solid rgba(255,255,255,.06)}footer .credit a{color:${c.primary};font-weight:600}
footer .social{display:flex;gap:14px;justify-content:center;margin-top:20px}footer .social a{width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);display:inline-flex;align-items:center;justify-content:center;font-size:1.2rem;transition:all .2s}footer .social a:hover{background:${c.primary}}
@media(max-width:768px){.hero h1{font-size:2.5rem}.nlinks{display:none}.gal{grid-template-columns:repeat(2,1fr)}.about{grid-template-columns:1fr;gap:40px}.ai{height:300px}}
</style></head><body>
<nav class="nav"><a href="#" class="nl">${lead.name.split(" ")[0]}<span>${lead.name.split(" ").slice(1).join(" ")||""}</span></a><div class="nlinks"><a href="#destaques">${cfg.sectionTitle}</a><a href="#sobre">Sobre</a><a href="#depoimentos">Depoimentos</a><a href="#contato">Contato</a>${wa?`<a href="https://wa.me/${wa}" class="nc" target="_blank">WhatsApp</a>`:""}</div></nav>
<section class="hero" id="inicio"><div class="hbg"></div><div class="hc"><div class="hb">${cfg.heroBadge}</div><h1>${cfg.heroTitle(lead.name)}</h1><p class="sub">${cfg.heroSubtitle(city)}</p>${lead.rating?`<div class="hr"><span class="stars">★★★★★</span> ${lead.rating} · ${lead.user_ratings_total||0} avaliações</div>`:""}<div class="hbtns">${wa?`<a href="https://wa.me/${wa}" class="bp" target="_blank">${cfg.ctaButton}</a>`:""}<a href="${maps}" class="bo" target="_blank">Como Chegar</a></div></div></section>
<div class="cats"><div class="cps">${pills}</div></div>
<section class="sec" id="destaques"><div class="sl">${cfg.heroBadge.replace(/^[^\\w]+\\s*/,"")}</div><h2 class="st">${cfg.sectionTitle}</h2><p class="ss">${cfg.sectionSub}</p><div class="fg">${features}</div></section>
<section class="sec" id="sobre"><div class="about"><div class="ai"></div><div class="ac"><div class="sl" style="text-align:left">Nossa História</div><h2 class="st" style="text-align:left">Sobre Nós</h2><p>${cfg.aboutText(lead.name,n,city,lead.rating,lead.user_ratings_total)}</p><div class="stats">${lead.rating?`<div class="stat"><div class="num">${lead.rating}★</div><div class="label">Avaliação</div></div>`:""}${lead.user_ratings_total?`<div class="stat"><div class="num">${lead.user_ratings_total}+</div><div class="label">Clientes</div></div>`:""}<div class="stat"><div class="num">100%</div><div class="label">Qualidade</div></div></div></div></div></section>
<section class="sec" id="depoimentos" style="background:rgba(255,255,255,.02)"><div class="sl">O que dizem</div><h2 class="st">Depoimentos</h2><p class="ss">A satisfação de quem confia em nós</p><div class="tss">${tests}</div></section>
<section class="sec"><div class="sl">Veja mais</div><h2 class="st">Galeria</h2><p class="ss">Um pouquinho do nosso dia a dia</p><div class="gal">${gallery}</div></section>
<section class="sec" id="contato"><div class="sl">Visite-nos</div><h2 class="st">Como Chegar</h2><div class="mc"><iframe src="${embed}" loading="lazy"></iframe><div class="mi2"><p>📍 ${lead.formatted_address||city||""}</p>${lead.phone?`<p>📞 ${lead.phone}</p>`:""}</div></div><div style="display:flex;gap:14px;justify-content:center;margin-top:28px">${wa?`<a href="https://wa.me/${wa}" class="bp" target="_blank">💬 WhatsApp</a>`:""}<a href="${maps}" class="bo" target="_blank">Abrir no Maps</a></div></section>
<section class="cta"><h2>${cfg.ctaTitle}</h2><p>${cfg.ctaSubtitle}</p>${wa?`<a href="https://wa.me/${wa}" class="bp" target="_blank">${cfg.ctaButton}</a>`:""}</section>
<footer><div class="brand">${lead.name.split(" ")[0]}<span> ${lead.name.split(" ").slice(1).join(" ")||""}</span></div><p>${lead.formatted_address||city||""}</p>${lead.phone?`<p>${lead.phone}</p>`:""}<div class="social">${lead.instagram?`<a href="${lead.instagram}" target="_blank">📷</a>`:""}${lead.facebook?`<a href="${lead.facebook}" target="_blank">👍</a>`:""}${wa?`<a href="https://wa.me/${wa}" target="_blank">💬</a>`:""}</div><div class="credit"><p>© ${new Date().getFullYear()} ${lead.name}. Todos os direitos reservados.</p><p style="margin-top:6px">Site criado por <a href="https://clodoaldo.vercel.app" target="_blank">Clodoaldo Silva</a></p></div></footer>
</body></html>`;
}

// =====================================================
// TEMPLATE C: HERO CARD (foto em card flutuante)
// =====================================================
export function renderTemplateC(cfg: NicheConfig, ctx: StyleContext): string {
  const { lead, wa, maps, embed, n, city } = ctx;
  const c = cfg.colors;
  const photos = getNichePhotos(n);
  const features = cfg.features.map((f,i)=>`<div class="fc"><span class="fe">${f.emoji}</span><span class="ft">${f.tag}</span><h3>${f.title}</h3><p>${f.desc}</p></div>`).join("");
  const pills = cfg.categoryPills.map((p,i)=>`<div class="cp ${i===0?"a":""}">${p}</div>`).join("");
  const tests = cfg.testimonials.map(t=>`<div class="ts"><div class="tss">${"★".repeat(t.rating)}</div><p>"${t.text}"</p><div class="tsa">— ${t.name}</div></div>`).join("");
  const gallery = cfg.galleryEmojis.map((e,i)=>`<div class="gi" style="background-image:url('${photos.gallery[i]||photos.gallery[0]}')"></div>`).join("");

  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${lead.name} | ${n} em ${city}</title><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet"><style>
*{margin:0;padding:0;box-sizing:border-box}body{background:#f5f0e8;color:#1a1410;font-family:'Inter',sans-serif;overflow-x:hidden}a{text-decoration:none;color:inherit}h1,h2,h3{font-family:'Playfair Display',serif}
.nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:0 40px;height:80px;display:flex;align-items:center;justify-content:space-between;background:rgba(245,240,232,.92);backdrop-filter:blur(20px);border-bottom:1px solid rgba(184,154,106,.2)}
.nl{font-family:'Playfair Display';font-size:1.5rem;font-weight:700}.nl span{color:${c.primary}}
.nlinks{display:flex;gap:36px;align-items:center}.nlinks a{color:rgba(26,20,16,.7);font-size:.85rem;letter-spacing:1px;text-transform:uppercase}.nlinks a:hover{color:${c.primary}}
.nc{border:1px solid ${c.primary};color:${c.primary};padding:10px 24px;font-size:.8rem;letter-spacing:2px;text-transform:uppercase;transition:all .3s}.nc:hover{background:${c.primary};color:#f5f0e8}
.hero{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:120px 40px;position:relative}
.hero::before{content:"";position:absolute;inset:0;background:radial-gradient(ellipse at top,${c.primary}11,transparent 60%)}
.hc{position:relative;z-index:1;display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center;max-width:1100px}
.htext{text-align:left}
.hb{display:inline-flex;align-items:center;gap:12px;font-size:.75rem;letter-spacing:4px;text-transform:uppercase;color:${c.primary};margin-bottom:32px}.hb::before{content:"";width:40px;height:1px;background:${c.primary}}
.hero h1{font-size:clamp(2.5rem,5vw,4rem);font-weight:700;line-height:1.1;margin-bottom:24px}
.hero .sub{font-family:'Playfair Display';font-size:1.3rem;font-style:italic;color:rgba(26,20,16,.6);margin-bottom:32px}
.hr{display:inline-flex;align-items:center;gap:14px;border:1px solid rgba(184,154,106,.3);padding:12px 28px;margin-bottom:32px}.hr .stars{color:${c.primary};letter-spacing:3px}
.hbtns{display:flex;flex-wrap:wrap;gap:16px}
.bp{padding:16px 40px;background:${c.primary};color:#f5f0e8;font-weight:600;font-size:.85rem;letter-spacing:3px;text-transform:uppercase;border:1px solid ${c.primary};transition:all .3s}.bp:hover{background:transparent;color:${c.primary}}
.bo{padding:16px 36px;background:transparent;color:#1a1410;border:1px solid rgba(26,20,16,.2);font-weight:500;font-size:.85rem;letter-spacing:3px;text-transform:uppercase;transition:all .3s}.bo:hover{border-color:${c.primary};color:${c.primary}}
.hcard{position:relative}
.hcard-img{aspect-ratio:3/4;border-radius:200px 200px 24px 24px;background-image:url('${photos.hero}');background-size:cover;background-position:center;box-shadow:0 40px 80px rgba(26,20,16,.15);border:1px solid rgba(184,154,106,.2)}
.hcard-badge{position:absolute;bottom:-20px;left:-20px;background:${c.primary};color:#f5f0e8;padding:20px 32px;border-radius:16px;text-align:center;box-shadow:0 20px 40px rgba(0,0,0,.1)}
.hcard-badge .num{font-family:'Playfair Display';font-size:2rem;font-weight:700;line-height:1}.hcard-badge .label{font-size:.7rem;letter-spacing:2px;text-transform:uppercase;margin-top:4px}
.cats{padding:40px;max-width:1200px;margin:0 auto}.cps{display:flex;flex-wrap:wrap;gap:12px;justify-content:center}
.cp{padding:10px 24px;border:1px solid rgba(184,154,106,.2);color:rgba(26,20,16,.7);font-size:.8rem;letter-spacing:2px;text-transform:uppercase;cursor:pointer;transition:all .3s}.cp:hover,.cp.a{background:${c.primary};color:#f5f0e8;border-color:${c.primary}}
.sec{max-width:1200px;margin:0 auto;padding:100px 40px}
.sl{font-size:.75rem;font-weight:400;letter-spacing:5px;text-transform:uppercase;color:${c.primary};margin-bottom:20px;text-align:center}
.st{font-size:clamp(2.2rem,5vw,3.5rem);font-weight:700;margin-bottom:20px;text-align:center}
.ss{font-family:'Playfair Display';font-style:italic;color:rgba(26,20,16,.5);font-size:1.2rem;margin-bottom:60px;text-align:center}
.fg{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:32px}
.fc{text-align:center;padding:40px 32px;background:#fff;border-radius:24px;box-shadow:0 10px 40px rgba(26,20,16,.04);transition:all .3s}.fc:hover{transform:translateY(-6px);box-shadow:0 20px 60px rgba(26,20,16,.08)}
.fe{font-size:3rem;display:block;margin-bottom:20px}
.ft{display:inline-block;color:${c.primary};font-size:.7rem;letter-spacing:2px;text-transform:uppercase;margin-bottom:16px}
.fc h3{font-size:1.4rem;font-weight:700;margin-bottom:12px}.fc p{color:rgba(26,20,16,.6);font-size:.95rem;line-height:1.7}
.about{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}
.ai{height:450px;border-radius:24px;background-image:url('${photos.about}');background-size:cover;background-position:center;box-shadow:0 20px 60px rgba(26,20,16,.08)}
.ac p{color:rgba(26,20,16,.6);font-size:1.1rem;line-height:1.9;margin-bottom:24px}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:0;border:1px solid rgba(184,154,106,.2);margin-top:40px}
.stat{padding:36px 24px;text-align:center;border-right:1px solid rgba(184,154,106,.2)}.stat:last-child{border-right:none}
.stat .num{font-family:'Playfair Display';font-size:3rem;font-weight:700;color:${c.primary};margin-bottom:8px}.stat .label{font-size:.75rem;color:rgba(26,20,16,.5);text-transform:uppercase;letter-spacing:3px}
.tss{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:32px}
.ts{padding:40px 32px;background:#fff;border-radius:24px;text-align:center;box-shadow:0 10px 40px rgba(26,20,16,.04)}
.tss2{color:${c.primary};font-size:1.2rem;margin-bottom:24px;letter-spacing:4px}.ts p{font-family:'Playfair Display';font-style:italic;font-size:1.1rem;line-height:1.7;color:rgba(26,20,16,.7);margin-bottom:24px}.tsa{color:${c.primary};font-size:.85rem;letter-spacing:2px;text-transform:uppercase}
.gal{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;max-width:900px;margin:0 auto}
.gi{aspect-ratio:1;background-size:cover;background-position:center;border-radius:20px;border:1px solid rgba(184,154,106,.15);transition:all .3s}.gi:hover{transform:scale(1.05)}
.mc{border:1px solid rgba(184,154,106,.2);max-width:1000px;margin:0 auto;border-radius:24px;overflow:hidden;box-shadow:0 10px 40px rgba(26,20,16,.04)}.mc iframe{width:100%;height:400px;border:0;display:block;filter:sepia(.2)}.mi2{padding:32px;text-align:center;border-top:1px solid rgba(184,154,106,.2)}.mi2 p{color:rgba(26,20,16,.6);font-size:.95rem;margin-bottom:8px}
.cta{text-align:center;padding:120px 40px;background:${c.primary};color:#f5f0e8;border-radius:40px;max-width:1100px;margin:60px auto}
.cta h2{font-size:clamp(2.2rem,5vw,3.5rem);font-weight:700;margin-bottom:24px}.cta p{font-family:'Playfair Display';font-style:italic;font-size:1.3rem;margin-bottom:48px;opacity:.7}
footer{background:#1a1410;color:#f5f0e8;padding:60px 40px 40px;text-align:center;border-top:4px solid ${c.primary}}
footer .brand{font-family:'Playfair Display';font-size:1.6rem;font-weight:700;margin-bottom:16px}footer .brand span{color:${c.primary}}
footer p{color:rgba(245,240,232,.5);font-size:.85rem;margin-bottom:6px}
footer .credit{margin-top:24px;padding-top:24px;border-top:1px solid rgba(184,154,106,.15)}footer .credit a{color:${c.primary};font-weight:500}
footer .social{display:flex;gap:16px;justify-content:center;margin-top:20px}footer .social a{width:44px;height:44px;border:1px solid rgba(184,154,106,.2);display:inline-flex;align-items:center;justify-content:center;font-size:1.2rem;transition:all .3s}footer .social a:hover{border-color:${c.primary};color:${c.primary}}
@media(max-width:768px){.hc{grid-template-columns:1fr;gap:40px}.hero h1{font-size:2rem}.nlinks{display:none}.gal{grid-template-columns:repeat(2,1fr)}.about{grid-template-columns:1fr;gap:40px}.ai{height:300px}.hcard-badge{position:relative;bottom:0;left:0;margin-top:20px}}
</style></head><body>
<nav class="nav"><a href="#" class="nl">${lead.name.split(" ")[0]}<span> ${lead.name.split(" ").slice(1).join(" ")||""}</span></a><div class="nlinks"><a href="#destaques">${cfg.sectionTitle}</a><a href="#sobre">Sobre</a><a href="#depoimentos">Depoimentos</a><a href="#contato">Contato</a>${wa?`<a href="https://wa.me/${wa}" class="nc" target="_blank">WhatsApp</a>`:""}</div></nav>
<section class="hero" id="inicio"><div class="hc"><div class="htext"><div class="hb">${cfg.heroBadge}</div><h1>${cfg.heroTitle(lead.name)}</h1><p class="sub">${cfg.heroSubtitle(city)}</p>${lead.rating?`<div class="hr"><span class="stars">★★★★★</span> ${lead.rating} · ${lead.user_ratings_total||0} avaliações</div>`:""}<div class="hbtns">${wa?`<a href="https://wa.me/${wa}" class="bp" target="_blank">${cfg.ctaButton}</a>`:""}<a href="${maps}" class="bo" target="_blank">Como Chegar</a></div></div><div class="hcard"><div class="hcard-img"></div>${lead.rating?`<div class="hcard-badge"><div class="num">${lead.rating}★</div><div class="label">Google</div></div>`:""}</div></div></section>
<div class="cats"><div class="cps">${pills}</div></div>
<section class="sec" id="destaques"><div class="sl">${cfg.heroBadge.replace(/^[^\\w]+\\s*/,"")}</div><h2 class="st">${cfg.sectionTitle}</h2><p class="ss">${cfg.sectionSub}</p><div class="fg">${features}</div></section>
<section class="sec" id="sobre" style="background:#fff;border-top:1px solid rgba(184,154,106,.1);border-bottom:1px solid rgba(184,154,106,.1)"><div class="about"><div class="ai"></div><div class="ac"><div class="sl" style="text-align:left">Nossa História</div><h2 class="st" style="text-align:left">Sobre Nós</h2><p>${cfg.aboutText(lead.name,n,city,lead.rating,lead.user_ratings_total)}</p><div class="stats">${lead.rating?`<div class="stat"><div class="num">${lead.rating}</div><div class="label">Estrelas</div></div>`:""}${lead.user_ratings_total?`<div class="stat"><div class="num">${lead.user_ratings_total}+</div><div class="label">Clientes</div></div>`:""}<div class="stat"><div class="num">100%</div><div class="label">Qualidade</div></div></div></div></div></section>
<section class="sec" id="depoimentos"><div class="sl">O que dizem</div><h2 class="st">Depoimentos</h2><p class="ss">A satisfação de quem confia em nós</p><div class="tss">${tests}</div></section>
<section class="sec" style="background:#fff;border-top:1px solid rgba(184,154,106,.1);border-bottom:1px solid rgba(184,154,106,.1)"><div class="sl">Veja mais</div><h2 class="st">Galeria</h2><p class="ss">Um pouquinho do nosso dia a dia</p><div class="gal">${gallery}</div></section>
<section class="sec" id="contato"><div class="sl">Visite-nos</div><h2 class="st">Como Chegar</h2><p class="ss">Venha nos visitar</p><div class="mc"><iframe src="${embed}" loading="lazy"></iframe><div class="mi2"><p>📍 ${lead.formatted_address||city||""}</p>${lead.phone?`<p>📞 ${lead.phone}</p>`:""}</div></div><div style="display:flex;gap:16px;justify-content:center;margin-top:36px">${wa?`<a href="https://wa.me/${wa}" class="bp" target="_blank">💬 WhatsApp</a>`:""}<a href="${maps}" class="bo" target="_blank">Abrir no Maps</a></div></section>
<section class="cta"><h2>${cfg.ctaTitle}</h2><p>${cfg.ctaSubtitle}</p>${wa?`<a href="https://wa.me/${wa}" class="bp" target="_blank" style="background:#1a1410;color:#f5f0e8;border-color:#1a1410">${cfg.ctaButton}</a>`:""}</section>
<footer><div class="brand">${lead.name.split(" ")[0]}<span> ${lead.name.split(" ").slice(1).join(" ")||""}</span></div><p>${lead.formatted_address||city||""}</p>${lead.phone?`<p>${lead.phone}</p>`:""}<div class="social">${lead.instagram?`<a href="${lead.instagram}" target="_blank">📷</a>`:""}${lead.facebook?`<a href="${lead.facebook}" target="_blank">👍</a>`:""}${wa?`<a href="https://wa.me/${wa}" target="_blank">💬</a>`:""}</div><div class="credit"><p>© ${new Date().getFullYear()} ${lead.name}. Todos os direitos reservados.</p><p style="margin-top:6px">Site criado por <a href="https://clodoaldo.vercel.app" target="_blank">Clodoaldo Silva</a></p></div></footer>
</body></html>`;
}

// =====================================================
// TEMPLATE D: HERO MINIMAL (sem foto, tipografia focada)
// =====================================================
export function renderTemplateD(cfg: NicheConfig, ctx: StyleContext): string {
  const { lead, wa, maps, embed, n, city } = ctx;
  const c = cfg.colors;
  const photos = getNichePhotos(n);
  const features = cfg.features.map((f,i)=>`<div class="fc"><div class="fn">0${i+1}</div><div class="fb"><span class="ft">${f.tag}</span><h3>${f.title}</h3><p>${f.desc}</p></div></div>`).join("");
  const pills = cfg.categoryPills.map((p,i)=>`<div class="cp ${i===0?"a":""}">${p}</div>`).join("");
  const tests = cfg.testimonials.map(t=>`<div class="ts"><div class="tss">${"★".repeat(t.rating)}</div><p>${t.text}</p><div class="tsa">${t.name}</div></div>`).join("");
  const gallery = cfg.galleryEmojis.map((e,i)=>`<div class="gi" style="background-image:url('${photos.gallery[i]||photos.gallery[0]}')"><div class="go">${e}</div></div>`).join("");

  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${lead.name} | ${n} em ${city}</title><link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Inter:wght@300;400;500;600;700;900&display=swap" rel="stylesheet"><style>
*{margin:0;padding:0;box-sizing:border-box}body{background:${c.dark};color:#fff;font-family:'Inter',sans-serif;overflow-x:hidden}a{text-decoration:none;color:inherit}h1,h2,h3{font-family:'Space Grotesk',sans-serif}
.nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:24px 40px;display:flex;align-items:center;justify-content:space-between;mix-blend-mode:difference}
.nl{font-size:1.5rem;font-weight:700;color:#fff;letter-spacing:-1px}.nlinks{display:flex;gap:32px;align-items:center}.nlinks a{color:#fff;font-size:.95rem;font-weight:600;text-transform:uppercase;letter-spacing:2px}
.hero{min-height:100vh;display:flex;flex-direction:column;justify-content:center;padding:120px 40px 60px;background:${c.primary}}
.hb{display:inline-block;background:${c.dark};color:#fff;padding:8px 20px;font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:3px;margin-bottom:32px;align-self:flex-start}
.hero h1{font-size:clamp(3rem,12vw,9rem);font-weight:700;letter-spacing:-4px;line-height:.9;color:${c.dark};margin-bottom:24px}
.hero .sub{font-size:clamp(1.1rem,2.5vw,1.8rem);color:${c.dark};opacity:.7;margin-bottom:40px;font-weight:500;max-width:600px}
.hr{display:inline-flex;align-items:center;gap:10px;background:${c.dark};color:#fff;padding:12px 24px;margin-bottom:40px;align-self:flex-start}.hr .stars{color:${c.primary};letter-spacing:2px}
.hbtns{display:flex;flex-wrap:wrap;gap:16px}
.bp{padding:20px 40px;background:${c.dark};color:#fff;font-weight:700;font-size:1.05rem;text-transform:uppercase;letter-spacing:2px;border:none;cursor:pointer;transition:all .2s}.bp:hover{background:${c.accent};transform:translate(-4px,-4px);box-shadow:8px 8px 0 ${c.dark}}
.bo{padding:20px 36px;background:transparent;color:${c.dark};border:2px solid ${c.dark};font-weight:700;font-size:1.05rem;text-transform:uppercase;letter-spacing:2px;transition:all .2s}.bo:hover{background:${c.dark};color:#fff}
.mq{overflow:hidden;padding:20px 0;background:${c.accent};border-top:4px solid ${c.dark};border-bottom:4px solid ${c.dark}}.mqt{display:flex;gap:32px;white-space:nowrap;animation:mq 25s linear infinite}.mi{font-size:1.5rem;font-weight:700;color:${c.dark};text-transform:uppercase;letter-spacing:2px}.md{color:${c.dark};opacity:.3;font-size:2rem}
@keyframes mq{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
.cats{padding:60px 40px;background:${c.dark}}.cps{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;max-width:1100px;margin:0 auto}
.cp{padding:14px 28px;background:transparent;border:2px solid #fff;color:#fff;font-size:.85rem;font-weight:700;text-transform:uppercase;letter-spacing:2px;cursor:pointer;transition:all .2s}.cp:hover,.cp.a{background:${c.primary};border-color:${c.primary};color:${c.dark}}
.sec{padding:120px 40px;max-width:1200px;margin:0 auto}
.sl{font-size:1rem;font-weight:700;color:${c.primary};text-transform:uppercase;letter-spacing:4px;margin-bottom:24px}
.st{font-size:clamp(2.5rem,7vw,5rem);font-weight:700;letter-spacing:-3px;line-height:.95;margin-bottom:24px}
.ss{font-size:1.2rem;color:rgba(255,255,255,.5);margin-bottom:80px;font-weight:300;max-width:600px}
.fg{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:32px}
.fc{display:flex;gap:24px;padding:0;border:2px solid rgba(255,255,255,.1);transition:all .3s;position:relative;overflow:hidden}.fc:hover{border-color:${c.primary};background:${c.primary}08}
.fn{font-size:3rem;font-weight:700;color:${c.primary};opacity:.5;padding:32px 0 32px 32px;flex-shrink:0}
.fb{padding:32px 32px 32px 0}.ft{display:inline-block;background:${c.primary};color:${c.dark};padding:4px 14px;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:2px;margin-bottom:16px}
.fb h3{font-size:1.8rem;font-weight:700;letter-spacing:-1px;margin-bottom:16px}.fb p{color:rgba(255,255,255,.6);font-size:1rem;line-height:1.6}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:0;border:2px solid rgba(255,255,255,.1);margin-top:80px}
.stat{padding:48px 32px;text-align:center;border-right:2px solid rgba(255,255,255,.1)}.stat:last-child{border-right:none}
.stat .num{font-size:4rem;font-weight:700;color:${c.primary};line-height:1;margin-bottom:12px;letter-spacing:-2px}.stat .label{font-size:.85rem;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:3px;font-weight:600}
.about{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}
.ai{height:450px;background-image:url('${photos.about}');background-size:cover;background-position:center;border:4px solid ${c.dark}}
.ac p{color:rgba(255,255,255,.7);font-size:1.2rem;line-height:1.7;margin-bottom:24px;font-weight:300}
.tss{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:0}
.ts{padding:48px 36px;border:2px solid rgba(255,255,255,.1);border-right:none}.ts:last-child{border-right:2px solid rgba(255,255,255,.1)}
.tss2{color:${c.primary};font-size:1.5rem;margin-bottom:24px;letter-spacing:4px}.ts p{color:#fff;font-size:1.2rem;line-height:1.5;margin-bottom:24px;font-weight:500}.tsa{color:${c.primary};font-size:1rem;font-weight:700;text-transform:uppercase;letter-spacing:2px}
.gal{display:grid;grid-template-columns:repeat(3,1fr);gap:0;border:2px solid ${c.dark}}
.gi{aspect-ratio:1;background-size:cover;background-position:center;border:2px solid ${c.dark};transition:all .3s;position:relative}.gi:hover{transform:scale(1.05)}
.go{position:absolute;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;font-size:4rem;opacity:0;transition:opacity .3s}.gi:hover .go{opacity:1}
.mc{border:2px solid rgba(255,255,255,.1);margin-top:40px}.mc iframe{width:100%;height:400px;border:0;display:block;filter:grayscale(.5)}.mi2{padding:32px;border-top:2px solid rgba(255,255,255,.1)}.mi2 p{color:rgba(255,255,255,.7);font-size:1rem;margin-bottom:8px}
.cta{padding:140px 40px;background:${c.primary};text-align:center}
.cta h2{font-size:clamp(2.5rem,7vw,5rem);font-weight:700;letter-spacing:-3px;line-height:.95;color:${c.dark};margin-bottom:24px}.cta p{color:${c.dark};opacity:.7;font-size:1.3rem;margin-bottom:48px;font-weight:500}
footer{background:${c.dark};padding:60px 40px 40px;text-align:center;border-top:4px solid ${c.primary}}
footer .brand{font-size:1.8rem;font-weight:700;margin-bottom:16px;letter-spacing:-1px}footer .brand span{color:${c.primary}}
footer p{color:rgba(255,255,255,.5);font-size:.9rem;margin-bottom:6px}
footer .credit{margin-top:24px;padding-top:24px;border-top:1px solid rgba(255,255,255,.1)}footer .credit a{color:${c.primary};font-weight:700}
footer .social{display:flex;gap:16px;justify-center:center;margin-top:20px}footer .social a{width:48px;height:48px;border:2px solid rgba(255,255,255,.2);display:inline-flex;align-items:center;justify-content:center;font-size:1.3rem;transition:all .2s}footer .social a:hover{background:${c.primary};border-color:${c.primary};color:${c.dark}}
@media(max-width:768px){.hero h1{font-size:3rem}.nlinks{display:none}.gal{grid-template-columns:repeat(2,1fr)}.stats{grid-template-columns:repeat(2,1fr)}.stat:nth-child(2){border-right:none}.ts{border-right:2px solid rgba(255,255,255,.1)}.about{grid-template-columns:1fr;gap:40px}.ai{height:300px}.fc{flex-direction:column}.fn{padding:24px 0 0 24px}}
</style></head><body>
<nav class="nav"><a href="#" class="nl">${lead.name.split(" ")[0]}</a><div class="nlinks"><a href="#destaques">${cfg.sectionTitle}</a><a href="#depoimentos">Depoimentos</a><a href="#contato">Contato</a>${wa?`<a href="https://wa.me/${wa}" target="_blank">WhatsApp ↗</a>`:""}</div></nav>
<section class="hero" id="inicio"><div class="hb">${cfg.heroBadge}</div><h1>${cfg.heroTitle(lead.name)}</h1><p class="sub">${cfg.heroSubtitle(city)}</p>${lead.rating?`<div class="hr"><span class="stars">★★★★★</span> ${lead.rating} · ${lead.user_ratings_total||0} avaliações</div>`:""}<div class="hbtns">${wa?`<a href="https://wa.me/${wa}" class="bp" target="_blank">${cfg.ctaButton}</a>`:""}<a href="${maps}" class="bo" target="_blank">Como Chegar</a></div></section>
<div class="mq"><div class="mqt">${[...cfg.marqueeWords,...cfg.marqueeWords].map(w=>`<span class="mi">${w}</span><span class="md">/</span>`).join("")}</div></div>
<div class="cats"><div class="cps">${pills}</div></div>
<section class="sec" id="destaques"><div class="sl">${cfg.heroBadge.replace(/^[^\\w]+\\s*/,"")}</div><h2 class="st">${cfg.sectionTitle}.</h2><p class="ss">${cfg.sectionSub}</p><div class="fg">${features}</div></section>
<section class="sec" id="sobre" style="background:${c.accent}11"><div class="sl">Nossa História</div><h2 class="st">Sobre Nós.</h2><div class="about"><div class="ai"></div><div class="ac"><p>${cfg.aboutText(lead.name,n,city,lead.rating,lead.user_ratings_total)}</p><div class="stats">${lead.rating?`<div class="stat"><div class="num">${lead.rating}</div><div class="label">Estrelas</div></div>`:""}${lead.user_ratings_total?`<div class="stat"><div class="num">${lead.user_ratings_total}+</div><div class="label">Clientes</div></div>`:""}<div class="stat"><div class="num">100%</div><div class="label">Qualidade</div></div><div class="stat"><div class="num">24/7</div><div class="label">Atendimento</div></div></div></div></div></section>
<section class="sec" id="depoimentos"><div class="sl">O que dizem</div><h2 class="st">Depoimentos.</h2><p class="ss">A satisfação de quem confia em nós</p><div class="tss">${tests}</div></section>
<section class="sec"><div class="sl">Veja mais</div><h2 class="st">Galeria.</h2><div class="gal" style="margin-top:60px">${gallery}</div></section>
<section class="sec" id="contato"><div class="sl">Visite-nos</div><h2 class="st">Como Chegar.</h2><div class="mc"><iframe src="${embed}" loading="lazy"></iframe><div class="mi2"><p>📍 ${lead.formatted_address||city||""}</p>${lead.phone?`<p>📞 ${lead.phone}</p>`:""}</div></div><div style="display:flex;flex-wrap:wrap;gap:16px;margin-top:32px">${wa?`<a href="https://wa.me/${wa}" class="bp" target="_blank">💬 WhatsApp</a>`:""}<a href="${maps}" class="bo" target="_blank">Abrir no Maps</a></div></section>
<section class="cta"><h2>${cfg.ctaTitle}</h2><p>${cfg.ctaSubtitle}</p>${wa?`<a href="https://wa.me/${wa}" class="bp" target="_blank" style="background:${c.dark};color:#fff">${cfg.ctaButton}</a>`:""}</section>
<footer><div class="brand">${lead.name.split(" ")[0]}<span> ${lead.name.split(" ").slice(1).join(" ")||""}</span></div><p>${lead.formatted_address||city||""}</p>${lead.phone?`<p>${lead.phone}</p>`:""}<div class="social">${lead.instagram?`<a href="${lead.instagram}" target="_blank">📷</a>`:""}${lead.facebook?`<a href="${lead.facebook}" target="_blank">👍</a>`:""}${wa?`<a href="https://wa.me/${wa}" target="_blank">💬</a>`:""}</div><div class="credit"><p>© ${new Date().getFullYear()} ${lead.name}. Todos os direitos reservados.</p><p style="margin-top:6px">Site criado por <a href="https://clodoaldo.vercel.app" target="_blank">Clodoaldo Silva</a></p></div></footer>
</body></html>`;
}
