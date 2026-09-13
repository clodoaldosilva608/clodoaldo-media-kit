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

// =====================================================
// TEMPLATE E: MAGAZINE (layout de revista, grid assimétrico)
// =====================================================
export function renderTemplateE(cfg: NicheConfig, ctx: StyleContext): string {
  const { lead, wa, maps, embed, n, city } = ctx;
  const c = cfg.colors;
  const photos = getNichePhotos(n);
  const features = cfg.features.map((f,i)=>`<div class="fc ${i===0?"big":""}" ${i===0?`style="background-image:url('${photos.features[0]}')"`:""}><${i===0?"div":"div"} class="fco">${i===0?`<span class="ft">${f.tag}</span><h3>${f.title}</h3><p>${f.desc}</p>`:`<span class="fn">0${i+1}</span><div><span class="ft">${f.tag}</span><h3>${f.title}</h3><p>${f.desc}</p></div>`}</div></div>`).join("");
  const pills = cfg.categoryPills.map((p,i)=>`<div class="cp ${i===0?"a":""}">${p}</div>`).join("");
  const tests = cfg.testimonials.map(t=>`<div class="ts"><div class="tss">${"★".repeat(t.rating)}</div><p>"${t.text}"</p><div class="tsa">— ${t.name}</div></div>`).join("");
  const gallery = cfg.galleryEmojis.map((e,i)=>`<div class="gi" style="background-image:url('${photos.gallery[i]||photos.gallery[0]}')"></div>`).join("");

  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${lead.name} | ${n} em ${city}</title><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet"><style>
*{margin:0;padding:0;box-sizing:border-box}body{background:#0a0a0a;color:#fff;font-family:'Inter',sans-serif;overflow-x:hidden}a{text-decoration:none;color:inherit}h1,h2,h3{font-family:'Playfair Display',serif}
.nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:0 48px;height:80px;display:flex;align-items:center;justify-content:space-between;background:rgba(10,10,10,.9);backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,.08)}
.nl{font-family:'Playfair Display';font-size:1.5rem;font-weight:900;letter-spacing:-.5px}.nl span{color:${c.primary};font-style:italic}
.nlinks{display:flex;gap:36px;align-items:center}.nlinks a{color:rgba(255,255,255,.6);font-size:.8rem;letter-spacing:2px;text-transform:uppercase;font-weight:500}.nlinks a:hover{color:#fff}
.nc{background:${c.primary};color:#0a0a0a;padding:12px 28px;font-weight:700;font-size:.8rem;letter-spacing:2px;text-transform:uppercase}
.hero{min-height:100vh;display:grid;grid-template-columns:1.2fr 1fr;gap:0;align-items:stretch}
.hero-left{padding:140px 48px 80px;display:flex;flex-direction:column;justify-content:center}
.hb{font-size:.7rem;font-weight:700;letter-spacing:5px;text-transform:uppercase;color:${c.primary};margin-bottom:32px;border-left:3px solid ${c.primary};padding-left:16px}
.hero h1{font-size:clamp(3rem,6vw,5.5rem);font-weight:900;line-height:.95;letter-spacing:-2px;margin-bottom:24px}
.hero h1 em{font-style:italic;color:${c.primary}}
.hero .sub{font-size:1.2rem;color:rgba(255,255,255,.5);margin-bottom:40px;font-weight:300;line-height:1.6;max-width:500px}
.hr{display:inline-flex;align-items:center;gap:12px;margin-bottom:40px}.hr .stars{color:${c.primary};letter-spacing:2px;font-size:1.1rem}.hr .txt{color:rgba(255,255,255,.5);font-size:.9rem}
.hbtns{display:flex;flex-wrap:wrap;gap:12px}
.bp{padding:16px 40px;background:${c.primary};color:#0a0a0a;font-weight:700;font-size:.85rem;letter-spacing:2px;text-transform:uppercase;transition:all .3s}.bp:hover{transform:translateY(-2px);box-shadow:0 10px 30px ${c.primary}44}
.bo{padding:16px 36px;background:transparent;color:#fff;border:1px solid rgba(255,255,255,.2);font-weight:600;font-size:.85rem;letter-spacing:2px;text-transform:uppercase;transition:all .3s}.bo:hover{border-color:#fff}
.hero-right{background-image:url('${photos.hero}');background-size:cover;background-position:center;position:relative}
.hero-right::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,#0a0a0a,transparent 20%)}
.hero-quote{position:absolute;bottom:40px;right:40px;max-width:300px;text-align:right}
.hero-quote p{font-family:'Playfair Display';font-size:1.3rem;font-style:italic;color:rgba(255,255,255,.9);line-height:1.5}
.hero-quote span{display:block;margin-top:12px;font-size:.75rem;color:${c.primary};letter-spacing:2px;text-transform:uppercase}
.cats{padding:40px 48px;border-top:1px solid rgba(255,255,255,.08);border-bottom:1px solid rgba(255,255,255,.08)}.cps{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
.cp{padding:8px 20px;border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.6);font-size:.75rem;letter-spacing:2px;text-transform:uppercase;cursor:pointer;transition:all .2s}.cp:hover,.cp.a{background:${c.primary};color:#0a0a0a;border-color:${c.primary}}
.sec{max-width:1200px;margin:0 auto;padding:100px 48px}
.sl{font-size:.7rem;font-weight:700;letter-spacing:5px;text-transform:uppercase;color:${c.primary};margin-bottom:16px}
.st{font-size:clamp(2.5rem,5vw,4rem);font-weight:900;letter-spacing:-1px;margin-bottom:16px;line-height:1}.st em{font-style:italic;color:${c.primary}}
.ss{font-family:'Playfair Display';font-style:italic;color:rgba(255,255,255,.4);font-size:1.2rem;margin-bottom:60px}
.fg{display:grid;grid-template-columns:2fr 1fr;gap:24px}
.fc{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:0;transition:all .3s;overflow:hidden;position:relative}.fc:hover{border-color:${c.primary}44}
.fc.big{min-height:400px;background-size:cover;background-position:center;display:flex;align-items:flex-end}.fc.big:hover{transform:scale(1.01)}
.fco{padding:32px}.fc.big .fco{background:linear-gradient(0deg,rgba(0,0,0,.9),transparent);width:100%}
.fn{font-family:'Playfair Display';font-size:2rem;font-weight:900;color:${c.primary};opacity:.3;margin-bottom:12px}
.ft{display:inline-block;background:${c.primary};color:#0a0a0a;padding:3px 12px;font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px}
.fc h3{font-size:1.5rem;font-weight:700;margin-bottom:10px}.fc.big h3{font-size:2rem}.fc p{color:rgba(255,255,255,.5);font-size:.9rem;line-height:1.6}
.about{display:grid;grid-template-columns:1fr 1.5fr;gap:48px;align-items:start}
.ai{height:500px;background-image:url('${photos.about}');background-size:cover;background-position:center}
.ac p{color:rgba(255,255,255,.6);font-size:1.15rem;line-height:1.9;margin-bottom:24px;font-weight:300}
.stats{display:grid;grid-template-columns:repeat(2,1fr);gap:0;margin-top:40px;border-top:1px solid rgba(255,255,255,.1);border-left:1px solid rgba(255,255,255,.1)}
.stat{padding:32px;border-right:1px solid rgba(255,255,255,.1);border-bottom:1px solid rgba(255,255,255,.1)}
.stat .num{font-family:'Playfair Display';font-size:3rem;font-weight:900;color:${c.primary};line-height:1;margin-bottom:8px}.stat .label{font-size:.7rem;color:rgba(255,255,255,.4);letter-spacing:3px;text-transform:uppercase}
.tss{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px}
.ts{padding:36px;border:1px solid rgba(255,255,255,.06);transition:all .3s}.ts:hover{border-color:${c.primary}44}
.tss2{color:${c.primary};font-size:1.1rem;margin-bottom:20px;letter-spacing:3px}.ts p{font-family:'Playfair Display';font-style:italic;color:rgba(255,255,255,.8);font-size:1.1rem;line-height:1.7;margin-bottom:20px}.tsa{color:${c.primary};font-size:.8rem;letter-spacing:2px;text-transform:uppercase;font-weight:600}
.gal{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.gi{aspect-ratio:1;background-size:cover;background-position:center;transition:all .3s}.gi:hover{transform:scale(1.05);z-index:1}
.mc{margin-top:32px;border:1px solid rgba(255,255,255,.06)}.mc iframe{width:100%;height:400px;border:0;display:block;filter:grayscale(.4)}.mi2{padding:28px;border-top:1px solid rgba(255,255,255,.06)}.mi2 p{color:rgba(255,255,255,.5);font-size:.9rem;margin-bottom:6px}
.cta{text-align:center;padding:140px 48px;background:${c.primary};color:#0a0a0a}
.cta h2{font-size:clamp(2.5rem,6vw,4.5rem);font-weight:900;letter-spacing:-2px;line-height:1;margin-bottom:24px}.cta h2 em{font-style:italic}.cta p{font-family:'Playfair Display';font-style:italic;font-size:1.3rem;margin-bottom:48px;opacity:.7}
footer{background:#0a0a0a;border-top:1px solid rgba(255,255,255,.08);padding:48px;text-align:center}
footer .brand{font-family:'Playfair Display';font-size:1.6rem;font-weight:900;margin-bottom:12px}footer .brand span{color:${c.primary};font-style:italic}
footer p{color:rgba(255,255,255,.4);font-size:.85rem;margin-bottom:6px}
footer .credit{margin-top:24px;padding-top:24px;border-top:1px solid rgba(255,255,255,.06)}footer .credit a{color:${c.primary}}
footer .social{display:flex;gap:12px;justify-content:center;margin-top:20px}footer .social a{width:40px;height:40px;border:1px solid rgba(255,255,255,.1);display:inline-flex;align-items:center;justify-content:center;font-size:1.1rem;transition:all .2s}footer .social a:hover{background:${c.primary};color:#0a0a0a;border-color:${c.primary}}
@media(max-width:768px){.hero{grid-template-columns:1fr}.hero-right{min-height:300px}.hero h1{font-size:2.5rem}.nlinks{display:none}.fg{grid-template-columns:1fr}.about{grid-template-columns:1fr}.gal{grid-template-columns:repeat(2,1fr)}.stats{grid-template-columns:1fr}}
</style></head><body>
<nav class="nav"><a href="#" class="nl">${lead.name.split(" ")[0]}<span>${lead.name.split(" ").slice(1).join(" ")||""}</span></a><div class="nlinks"><a href="#destaques">Destaques</a><a href="#sobre">Sobre</a><a href="#depoimentos">Depoimentos</a><a href="#contato">Contato</a>${wa?`<a href="https://wa.me/${wa}" class="nc" target="_blank">WhatsApp</a>`:""}</div></nav>
<section class="hero" id="inicio"><div class="hero-left"><div class="hb">${cfg.heroBadge}</div><h1>${cfg.heroTitle(lead.name).split(" ").slice(0,-1).join(" ")} <em>${cfg.heroTitle(lead.name).split(" ").slice(-1)}</em></h1><p class="sub">${cfg.heroSubtitle(city)}</p>${lead.rating?`<div class="hr"><span class="stars">${"★".repeat(5)}</span><span class="txt">${lead.rating} · ${lead.user_ratings_total||0} avaliações no Google</span></div>`:""}<div class="hbtns">${wa?`<a href="https://wa.me/${wa}" class="bp" target="_blank">${cfg.ctaButton}</a>`:""}<a href="${maps}" class="bo" target="_blank">Como Chegar</a></div></div><div class="hero-right"><div class="hero-quote"><p>"${cfg.testimonials[0]?.text.slice(0,80)||cfg.aboutText(lead.name,n,city,lead.rating,lead.user_ratings_total).slice(0,80)}..."</p><span>— ${cfg.testimonials[0]?.name||"Cliente"}</span></div></div></section>
<div class="cats"><div class="cps">${pills}</div></div>
<section class="sec" id="destaques"><div class="sl">Em Destaque</div><h2 class="st">${cfg.sectionTitle} <em>curated</em></h2><p class="ss">${cfg.sectionSub}</p><div class="fg">${features}</div></section>
<section class="sec" id="sobre" style="background:rgba(255,255,255,.02)"><div class="about"><div class="ai"></div><div class="ac"><div class="sl">Nossa História</div><h2 class="st">Sobre <em>Nós</em></h2><p>${cfg.aboutText(lead.name,n,city,lead.rating,lead.user_ratings_total)}</p><div class="stats">${lead.rating?`<div class="stat"><div class="num">${lead.rating}</div><div class="label">Estrelas</div></div>`:""}${lead.user_ratings_total?`<div class="stat"><div class="num">${lead.user_ratings_total}+</div><div class="label">Clientes</div></div>`:""}<div class="stat"><div class="num">100%</div><div class="label">Qualidade</div></div><div class="stat"><div class="num">24/7</div><div class="label">Atendimento</div></div></div></div></div></section>
<section class="sec" id="depoimentos"><div class="sl">O que dizem</div><h2 class="st"><em>Depoimentos</em></h2><p class="ss">A satisfação de quem confia em nós</p><div class="tss">${tests}</div></section>
<section class="sec" style="background:rgba(255,255,255,.02)"><div class="sl">Galeria</div><h2 class="st"><em>Galeria</em></h2><div class="gal" style="margin-top:40px">${gallery}</div></section>
<section class="sec" id="contato"><div class="sl">Visite-nos</div><h2 class="st">Como <em>Chegar</em></h2><div class="mc"><iframe src="${embed}" loading="lazy"></iframe><div class="mi2"><p>📍 ${lead.formatted_address||city||""}</p>${lead.phone?`<p>📞 ${lead.phone}</p>`:""}</div></div><div style="display:flex;gap:12px;justify-content:center;margin-top:28px">${wa?`<a href="https://wa.me/${wa}" class="bp" target="_blank">💬 WhatsApp</a>`:""}<a href="${maps}" class="bo" target="_blank">Abrir no Maps</a></div></section>
<section class="cta"><h2>${cfg.ctaTitle} <em>hoje</em></h2><p>${cfg.ctaSubtitle}</p>${wa?`<a href="https://wa.me/${wa}" class="bp" target="_blank" style="background:#0a0a0a;color:${c.primary}">${cfg.ctaButton}</a>`:""}</section>
<footer><div class="brand">${lead.name.split(" ")[0]}<span> ${lead.name.split(" ").slice(1).join(" ")||""}</span></div><p>${lead.formatted_address||city||""}</p>${lead.phone?`<p>${lead.phone}</p>`:""}<div class="social">${lead.instagram?`<a href="${lead.instagram}" target="_blank">📷</a>`:""}${lead.facebook?`<a href="${lead.facebook}" target="_blank">👍</a>`:""}${wa?`<a href="https://wa.me/${wa}" target="_blank">💬</a>`:""}</div><div class="credit"><p>© ${new Date().getFullYear()} ${lead.name}. Todos os direitos reservados.</p><p style="margin-top:6px">Site criado por <a href="https://clodoaldo.vercel.app" target="_blank">Clodoaldo Silva</a></p></div></footer>
</body></html>`;
}

// =====================================================
// TEMPLATE F: SHOWCASE (hero com grid de fotos mosaico)
// =====================================================
export function renderTemplateF(cfg: NicheConfig, ctx: StyleContext): string {
  const { lead, wa, maps, embed, n, city } = ctx;
  const c = cfg.colors;
  const photos = getNichePhotos(n);
  const features = cfg.features.map((f,i)=>`<div class="fc"><div class="fi" style="background-image:url('${photos.features[i]||photos.features[0]}')"></div><div class="fb"><h3>${f.title}</h3><span class="ft">${f.tag}</span><p>${f.desc}</p></div></div>`).join("");
  const pills = cfg.categoryPills.map((p,i)=>`<div class="cp ${i===0?"a":""}">${p}</div>`).join("");
  const tests = cfg.testimonials.map(t=>`<div class="ts"><div class="tss">${"★".repeat(t.rating)}</div><p>"${t.text}"</p><div class="tsa">— ${t.name}</div></div>`).join("");
  const gallery = cfg.galleryEmojis.map((e,i)=>`<div class="gi" style="background-image:url('${photos.gallery[i]||photos.gallery[0]}')"><div class="go">${e}</div></div>`).join("");
  const mosaic = [photos.hero,photos.gallery[0],photos.gallery[1],photos.about].map((p,i)=>`<div class="m${i===0?" big":""}" style="background-image:url('${p}')"></div>`).join("");

  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${lead.name} | ${n} em ${city}</title><link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet"><style>
*{margin:0;padding:0;box-sizing:border-box}body{background:${c.dark};color:#fff;font-family:'Inter',sans-serif;overflow-x:hidden}a{text-decoration:none;color:inherit}h1,h2,h3{font-family:'Space Grotesk',sans-serif}
.nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:0 32px;height:64px;display:flex;align-items:center;justify-content:space-between;background:rgba(10,10,10,.7);backdrop-filter:blur(20px)}
.nl{font-size:1.2rem;font-weight:700}.nl span{color:${c.primary}}
.nlinks{display:flex;gap:28px;align-items:center}.nlinks a{color:rgba(255,255,255,.6);font-size:.85rem}.nlinks a:hover{color:#fff}
.nc{background:${c.primary};color:${c.dark};padding:8px 20px;border-radius:8px;font-weight:700;font-size:.8rem}
.hero{min-height:100vh;display:grid;grid-template-columns:1fr 1fr;gap:0}
.hero-left{display:flex;flex-direction:column;justify-content:center;padding:100px 40px;background:${c.dark}}
.hb{display:inline-block;background:${c.primary}22;color:${c.primary};padding:6px 16px;border-radius:0;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:3px;margin-bottom:28px;align-self:flex-start}
.hero h1{font-size:clamp(2.5rem,5vw,4rem);font-weight:700;letter-spacing:-1.5px;line-height:1;margin-bottom:20px}
.hero .sub{font-size:1.1rem;color:rgba(255,255,255,.5);margin-bottom:32px;font-weight:300}
.hr{display:inline-flex;align-items:center;gap:8px;margin-bottom:32px}.hr .stars{color:#FFD700;letter-spacing:2px}.hr .txt{color:rgba(255,255,255,.4);font-size:.85rem}
.hbtns{display:flex;flex-wrap:wrap;gap:12px}
.bp{padding:14px 36px;background:${c.primary};color:${c.dark};font-weight:700;font-size:.95rem;border:none;cursor:pointer;transition:all .2s}.bp:hover{transform:translateY(-2px);box-shadow:0 8px 30px ${c.primary}44}
.bo{padding:14px 32px;background:transparent;color:#fff;border:1px solid rgba(255,255,255,.2);font-weight:600;font-size:.95rem;transition:all .2s}.bo:hover{border-color:#fff}
.hero-right{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:2px;background:${c.dark}}
.m{background-size:cover;background-position:center;transition:all .5s}.m.big{grid-row:1/3}.m:hover{transform:scale(1.03)}
.cats{padding:32px;max-width:1200px;margin:0 auto}.cps{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
.cp{padding:8px 18px;border-radius:0;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);color:rgba(255,255,255,.6);font-size:.75rem;font-weight:600;cursor:pointer;transition:all .2s;text-transform:uppercase;letter-spacing:1px}.cp:hover,.cp.a{background:${c.primary};border-color:${c.primary};color:${c.dark}}
.sec{max-width:1200px;margin:0 auto;padding:80px 32px}
.sl{font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:4px;color:${c.primary};margin-bottom:12px}
.st{font-size:clamp(1.8rem,4vw,2.8rem);font-weight:700;letter-spacing:-1px;margin-bottom:12px}
.ss{color:rgba(255,255,255,.4);font-size:1rem;margin-bottom:40px}
.fg{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}
.fc{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);transition:all .3s;overflow:hidden}.fc:hover{border-color:${c.primary}44;transform:translateY(-4px)}
.fi{height:200px;background-size:cover;background-position:center}
.fb{padding:24px}.ft{display:inline-block;background:${c.primary}22;color:${c.primary};padding:3px 10px;font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px}
.fb h3{font-size:1.2rem;font-weight:700;margin-bottom:8px}.fb p{color:rgba(255,255,255,.5);font-size:.85rem;line-height:1.6}
.about{text-align:center;max-width:700px;margin:0 auto}
.about p{color:rgba(255,255,255,.6);font-size:1.1rem;line-height:1.8;font-weight:300}
.stats{display:flex;justify-content:center;gap:48px;margin-top:40px;flex-wrap:wrap}
.stat{text-align:center}.stat .num{font-size:2.5rem;font-weight:700;color:${c.primary}}.stat .label{font-size:.75rem;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:2px;margin-top:4px}
.tss{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}
.ts{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);padding:28px;transition:all .3s}.ts:hover{border-color:${c.primary}44}
.tss2{color:#FFD700;font-size:1rem;margin-bottom:16px;letter-spacing:2px}.ts p{color:rgba(255,255,255,.8);font-size:.9rem;line-height:1.6;margin-bottom:16px;font-style:italic}.tsa{color:${c.primary};font-size:.85rem;font-weight:600}
.gal{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.gi{aspect-ratio:1;background-size:cover;background-position:center;transition:all .3s;position:relative;overflow:hidden}.gi:hover{transform:scale(1.05)}
.go{position:absolute;inset:0;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;font-size:2.5rem;opacity:0;transition:opacity .3s}.gi:hover .go{opacity:1}
.mc{border:1px solid rgba(255,255,255,.06);margin-top:24px}.mc iframe{width:100%;height:400px;border:0;display:block;filter:grayscale(.3)}.mi2{padding:24px;background:rgba(255,255,255,.02)}.mi2 p{color:rgba(255,255,255,.5);font-size:.9rem;margin-bottom:6px}
.cta{text-align:center;padding:100px 32px;background:linear-gradient(135deg,${c.primary}11,${c.accent}06)}.cta h2{font-size:clamp(1.8rem,4vw,2.8rem);font-weight:700;margin-bottom:16px}.cta p{color:rgba(255,255,255,.4);font-size:1.1rem;margin-bottom:36px}
footer{background:${c.dark};border-top:1px solid rgba(255,255,255,.06);padding:40px 32px;text-align:center}
footer .brand{font-size:1.2rem;font-weight:700;margin-bottom:10px}footer .brand span{color:${c.primary}}
footer p{color:rgba(255,255,255,.3);font-size:.8rem;margin-bottom:4px}
footer .credit{margin-top:20px;padding-top:20px;border-top:1px solid rgba(255,255,255,.06)}footer .credit a{color:${c.primary};font-weight:600}
footer .social{display:flex;gap:12px;justify-content:center;margin-top:16px}footer .social a{width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.04);display:inline-flex;align-items:center;justify-content:center;font-size:1.1rem;transition:all .2s}footer .social a:hover{background:${c.primary};color:${c.dark}}
@media(max-width:768px){.hero{grid-template-columns:1fr}.hero-right{grid-template-columns:1fr 1fr;min-height:300px}.hero h1{font-size:2rem}.nlinks{display:none}.gal{grid-template-columns:repeat(2,1fr)}}
</style></head><body>
<nav class="nav"><a href="#" class="nl">${lead.name.split(" ")[0]}<span>${lead.name.split(" ").slice(1).join(" ")||""}</span></a><div class="nlinks"><a href="#destaques">Destaques</a><a href="#sobre">Sobre</a><a href="#depoimentos">Depoimentos</a><a href="#contato">Contato</a>${wa?`<a href="https://wa.me/${wa}" class="nc" target="_blank">WhatsApp</a>`:""}</div></nav>
<section class="hero" id="inicio"><div class="hero-left"><div class="hb">${cfg.heroBadge}</div><h1>${cfg.heroTitle(lead.name)}</h1><p class="sub">${cfg.heroSubtitle(city)}</p>${lead.rating?`<div class="hr"><span class="stars">★★★★★</span><span class="txt">${lead.rating} · ${lead.user_ratings_total||0} avaliações</span></div>`:""}<div class="hbtns">${wa?`<a href="https://wa.me/${wa}" class="bp" target="_blank">${cfg.ctaButton}</a>`:""}<a href="${maps}" class="bo" target="_blank">Como Chegar</a></div></div><div class="hero-right">${mosaic}</div></section>
<div class="cats"><div class="cps">${pills}</div></div>
<section class="sec" id="destaques"><div class="sl">${cfg.heroBadge.replace(/^[^\\w]+\\s*/,"")}</div><h2 class="st">${cfg.sectionTitle}</h2><p class="ss">${cfg.sectionSub}</p><div class="fg">${features}</div></section>
<section class="sec" id="sobre" style="background:rgba(255,255,255,.02)"><div class="sl">Nossa História</div><h2 class="st">Sobre Nós</h2><div class="about"><p>${cfg.aboutText(lead.name,n,city,lead.rating,lead.user_ratings_total)}</p><div class="stats">${lead.rating?`<div class="stat"><div class="num">${lead.rating}★</div><div class="label">Avaliação</div></div>`:""}${lead.user_ratings_total?`<div class="stat"><div class="num">${lead.user_ratings_total}+</div><div class="label">Clientes</div></div>`:""}<div class="stat"><div class="num">100%</div><div class="label">Qualidade</div></div></div></div></section>
<section class="sec" id="depoimentos"><div class="sl">O que dizem</div><h2 class="st">Depoimentos</h2><p class="ss">A satisfação de quem confia em nós</p><div class="tss">${tests}</div></section>
<section class="sec" style="background:rgba(255,255,255,.02)"><div class="sl">Veja mais</div><h2 class="st">Galeria</h2><p class="ss">Um pouquinho do nosso dia a dia</p><div class="gal">${gallery}</div></section>
<section class="sec" id="contato"><div class="sl">Visite-nos</div><h2 class="st">Como Chegar</h2><div class="mc"><iframe src="${embed}" loading="lazy"></iframe><div class="mi2"><p>📍 ${lead.formatted_address||city||""}</p>${lead.phone?`<p>📞 ${lead.phone}</p>`:""}</div></div><div style="display:flex;gap:12px;justify-content:center;margin-top:24px">${wa?`<a href="https://wa.me/${wa}" class="bp" target="_blank">💬 WhatsApp</a>`:""}<a href="${maps}" class="bo" target="_blank">Abrir no Maps</a></div></section>
<section class="cta"><h2>${cfg.ctaTitle}</h2><p>${cfg.ctaSubtitle}</p>${wa?`<a href="https://wa.me/${wa}" class="bp" target="_blank">${cfg.ctaButton}</a>`:""}</section>
<footer><div class="brand">${lead.name.split(" ")[0]}<span> ${lead.name.split(" ").slice(1).join(" ")||""}</span></div><p>${lead.formatted_address||city||""}</p>${lead.phone?`<p>${lead.phone}</p>`:""}<div class="social">${lead.instagram?`<a href="${lead.instagram}" target="_blank">📷</a>`:""}${lead.facebook?`<a href="${lead.facebook}" target="_blank">👍</a>`:""}${wa?`<a href="https://wa.me/${wa}" target="_blank">💬</a>`:""}</div><div class="credit"><p>© ${new Date().getFullYear()} ${lead.name}. Todos os direitos reservados.</p><p style="margin-top:6px">Site criado por <a href="https://clodoaldo.vercel.app" target="_blank">Clodoaldo Silva</a></p></div></footer>
</body></html>`;
}

// =====================================================
// TEMPLATE G: SIDEBAR (sidebar lateral fixa + conteúdo)
// =====================================================
export function renderTemplateG(cfg: NicheConfig, ctx: StyleContext): string {
  const { lead, wa, maps, embed, n, city } = ctx;
  const c = cfg.colors;
  const photos = getNichePhotos(n);
  const features = cfg.features.map((f,i)=>`<div class="fc"><span class="fn">${i+1}</span><div><span class="ft">${f.tag}</span><h3>${f.title}</h3><p>${f.desc}</p></div></div>`).join("");
  const pills = cfg.categoryPills.map((p,i)=>`<div class="cp ${i===0?"a":""}">${p}</div>`).join("");
  const tests = cfg.testimonials.map(t=>`<div class="ts"><div class="tss">${"★".repeat(t.rating)}</div><p>"${t.text}"</p><div class="tsa">— ${t.name}</div></div>`).join("");
  const gallery = cfg.galleryEmojis.map((e,i)=>`<div class="gi" style="background-image:url('${photos.gallery[i]||photos.gallery[0]}')"></div>`).join("");

  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${lead.name} | ${n} em ${city}</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&display=swap" rel="stylesheet"><style>
*{margin:0;padding:0;box-sizing:border-box}body{background:${c.dark};color:#fff;font-family:'Inter',sans-serif;overflow-x:hidden}a{text-decoration:none;color:inherit}
.layout{display:grid;grid-template-columns:280px 1fr;min-height:100vh}
.sidebar{position:fixed;left:0;top:0;bottom:0;width:280px;background:${c.accent};padding:40px 32px;display:flex;flex-direction:column;justify-content:space-between;z-index:100;border-right:1px solid rgba(255,255,255,.1)}
.sb-logo{font-size:1.2rem;font-weight:900;letter-spacing:-.5px;margin-bottom:40px}.sb-logo span{color:${c.primary}}
.sb-nav{display:flex;flex-direction:column;gap:16px}.sb-nav a{color:rgba(255,255,255,.6);font-size:.9rem;font-weight:500;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05);transition:all .2s}.sb-nav a:hover{color:${c.primary};border-color:${c.primary}}
.sb-bottom{margin-top:auto}
.sb-info{font-size:.8rem;color:rgba(255,255,255,.4);margin-bottom:20px;line-height:1.6}
.sb-social{display:flex;gap:10px}.sb-social a{width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.05);display:inline-flex;align-items:center;justify-content:center;font-size:1rem;transition:all .2s}.sb-social a:hover{background:${c.primary};color:${c.accent}}
.main{margin-left:280px;padding:0}
.hero{min-height:100vh;display:flex;align-items:center;padding:80px 60px;position:relative;overflow:hidden}
.hero-bg{position:absolute;inset:0;background-image:url('${photos.hero}');background-size:cover;background-position:center;filter:brightness(.3)}.hero-bg::after{content:"";position:absolute;inset:0;background:linear-gradient(135deg,${c.dark}cc,transparent)}
.hc{position:relative;z-index:1;max-width:700px}
.hb{display:inline-block;background:${c.primary};color:${c.dark};padding:6px 16px;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:3px;margin-bottom:32px}
.hero h1{font-size:clamp(2.5rem,5vw,4rem);font-weight:900;letter-spacing:-1.5px;line-height:1;margin-bottom:20px}
.hero .sub{font-size:1.2rem;color:rgba(255,255,255,.5);margin-bottom:32px;font-weight:300}
.hr{display:inline-flex;align-items:center;gap:8px;margin-bottom:36px}.hr .stars{color:${c.primary};letter-spacing:2px}.hr .txt{color:rgba(255,255,255,.4);font-size:.85rem}
.hbtns{display:flex;flex-wrap:wrap;gap:12px}
.bp{padding:16px 36px;background:${c.primary};color:${c.dark};font-weight:700;font-size:.95rem;border:none;cursor:pointer;transition:all .2s}.bp:hover{transform:translateY(-2px);box-shadow:0 8px 30px ${c.primary}44}
.bo{padding:16px 32px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.2);color:#fff;font-weight:600;font-size:.95rem;transition:all .2s}.bo:hover{background:rgba(255,255,255,.15)}
.cats{padding:32px 60px}.cps{display:flex;flex-wrap:wrap;gap:8px}
.cp{padding:8px 18px;border-radius:8px;background:rgba(255,255,255,.04);color:rgba(255,255,255,.6);font-size:.75rem;font-weight:600;cursor:pointer;transition:all .2s}.cp:hover,.cp.a{background:${c.primary};color:${c.dark}}
.sec{padding:80px 60px;max-width:1000px}
.sl{font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:4px;color:${c.primary};margin-bottom:12px}
.st{font-size:clamp(1.8rem,4vw,2.5rem);font-weight:900;letter-spacing:-1px;margin-bottom:12px}
.ss{color:rgba(255,255,255,.4);font-size:1rem;margin-bottom:40px}
.fg{display:flex;flex-direction:column;gap:20px}
.fc{display:flex;gap:24px;padding:24px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);border-radius:16px;transition:all .3s}.fc:hover{border-color:${c.primary}44;transform:translateX(8px)}
.fn{font-size:2rem;font-weight:900;color:${c.primary};opacity:.4;flex-shrink:0;width:40px}
.ft{display:inline-block;background:${c.primary}22;color:${c.primary};padding:3px 10px;border-radius:6px;font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px}
.fc h3{font-size:1.3rem;font-weight:700;margin-bottom:8px}.fc p{color:rgba(255,255,255,.5);font-size:.9rem;line-height:1.6}
.about{display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:center}
.ai{height:350px;border-radius:16px;background-image:url('${photos.about}');background-size:cover;background-position:center}
.ac p{color:rgba(255,255,255,.6);font-size:1.05rem;line-height:1.8;margin-bottom:24px}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.stat{text-align:center;padding:20px;background:rgba(255,255,255,.02);border-radius:12px}.stat .num{font-size:2rem;font-weight:900;color:${c.primary}}.stat .label{font-size:.7rem;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:1px;margin-top:4px}
.tss{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}
.ts{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);border-radius:16px;padding:28px}.tss2{color:${c.primary};font-size:1rem;margin-bottom:16px;letter-spacing:2px}.ts p{color:rgba(255,255,255,.8);font-size:.9rem;line-height:1.6;margin-bottom:16px;font-style:italic}.tsa{color:${c.primary};font-size:.85rem;font-weight:600}
.gal{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.gi{aspect-ratio:1;background-size:cover;background-position:center;border-radius:12px;transition:all .3s}.gi:hover{transform:scale(1.05)}
.mc{border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,.06);margin-top:24px}.mc iframe{width:100%;height:400px;border:0;display:block;filter:grayscale(.3)}.mi2{padding:24px;background:rgba(255,255,255,.02)}.mi2 p{color:rgba(255,255,255,.5);font-size:.9rem;margin-bottom:6px}
.cta{text-align:center;padding:100px 60px;background:${c.primary}11}.cta h2{font-size:clamp(1.8rem,4vw,2.5rem);font-weight:900;margin-bottom:16px}.cta p{color:rgba(255,255,255,.4);font-size:1.1rem;margin-bottom:36px}
.sb-credit{font-size:.7rem;color:rgba(255,255,255,.2);margin-top:16px}.sb-credit a{color:${c.primary}}
@media(max-width:900px){.layout{grid-template-columns:1fr}.sidebar{position:relative;width:100%;height:auto;flex-direction:row;justify-content:space-between;padding:20px}.sb-nav{flex-direction:row;gap:16px}.sb-nav a{border:none}.sb-bottom{margin-top:0}.main{margin-left:0}.hero{padding:60px 32px}.sec{padding:60px 32px}.about{grid-template-columns:1fr}.gal{grid-template-columns:repeat(2,1fr)}}
</style></head><body>
<div class="layout">
<aside class="sidebar"><div><div class="sb-logo">${lead.name.split(" ")[0]}<span>${lead.name.split(" ").slice(1).join(" ")||""}</span></div><nav class="sb-nav"><a href="#inicio">Início</a><a href="#destaques">${cfg.sectionTitle}</a><a href="#sobre">Sobre</a><a href="#depoimentos">Depoimentos</a><a href="#contato">Contato</a></nav></div><div class="sb-bottom"><div class="sb-info">📍 ${lead.formatted_address||city||""}<br>${lead.phone?`📞 ${lead.phone}<br>`:""}${wa?`💬 WhatsApp disponível`:""}</div><div class="sb-social">${lead.instagram?`<a href="${lead.instagram}" target="_blank">📷</a>`:""}${lead.facebook?`<a href="${lead.facebook}" target="_blank">👍</a>`:""}${wa?`<a href="https://wa.me/${wa}" target="_blank">💬</a>`:""}</div><div class="sb-credit">© ${new Date().getFullYear()}<br>Site por <a href="https://clodoaldo.vercel.app" target="_blank">Clodoaldo Silva</a></div></div></aside>
<div class="main">
<section class="hero" id="inicio"><div class="hero-bg"></div><div class="hc"><div class="hb">${cfg.heroBadge}</div><h1>${cfg.heroTitle(lead.name)}</h1><p class="sub">${cfg.heroSubtitle(city)}</p>${lead.rating?`<div class="hr"><span class="stars">★★★★★</span><span class="txt">${lead.rating} · ${lead.user_ratings_total||0} avaliações</span></div>`:""}<div class="hbtns">${wa?`<a href="https://wa.me/${wa}" class="bp" target="_blank">${cfg.ctaButton}</a>`:""}<a href="${maps}" class="bo" target="_blank">Como Chegar</a></div></div></section>
<div class="cats"><div class="cps">${pills}</div></div>
<section class="sec" id="destaques"><div class="sl">${cfg.heroBadge.replace(/^[^\\w]+\\s*/,"")}</div><h2 class="st">${cfg.sectionTitle}</h2><p class="ss">${cfg.sectionSub}</p><div class="fg">${features}</div></section>
<section class="sec" id="sobre"><div class="about"><div class="ai"></div><div class="ac"><div class="sl">Nossa História</div><h2 class="st">Sobre Nós</h2><p>${cfg.aboutText(lead.name,n,city,lead.rating,lead.user_ratings_total)}</p><div class="stats">${lead.rating?`<div class="stat"><div class="num">${lead.rating}★</div><div class="label">Avaliação</div></div>`:""}${lead.user_ratings_total?`<div class="stat"><div class="num">${lead.user_ratings_total}+</div><div class="label">Clientes</div></div>`:""}<div class="stat"><div class="num">100%</div><div class="label">Qualidade</div></div></div></div></div></section>
<section class="sec" id="depoimentos" style="background:rgba(255,255,255,.02)"><div class="sl">O que dizem</div><h2 class="st">Depoimentos</h2><p class="ss">A satisfação de quem confia em nós</p><div class="tss">${tests}</div></section>
<section class="sec"><div class="sl">Veja mais</div><h2 class="st">Galeria</h2><div class="gal" style="margin-top:32px">${gallery}</div></section>
<section class="sec" id="contato"><div class="sl">Visite-nos</div><h2 class="st">Como Chegar</h2><div class="mc"><iframe src="${embed}" loading="lazy"></iframe><div class="mi2"><p>📍 ${lead.formatted_address||city||""}</p>${lead.phone?`<p>📞 ${lead.phone}</p>`:""}</div></div><div style="display:flex;gap:12px;margin-top:24px">${wa?`<a href="https://wa.me/${wa}" class="bp" target="_blank">💬 WhatsApp</a>`:""}<a href="${maps}" class="bo" target="_blank">Abrir no Maps</a></div></section>
<section class="cta"><h2>${cfg.ctaTitle}</h2><p>${cfg.ctaSubtitle}</p>${wa?`<a href="https://wa.me/${wa}" class="bp" target="_blank">${cfg.ctaButton}</a>`:""}</section>
</div>
</div>
</body></html>`;
}

// =====================================================
// TEMPLATE H: HERO VIDEO-STYLE (hero escuro + features em cards 3D)
// =====================================================
export function renderTemplateH(cfg: NicheConfig, ctx: StyleContext): string {
  const { lead, wa, maps, embed, n, city } = ctx;
  const c = cfg.colors;
  const photos = getNichePhotos(n);
  const features = cfg.features.map((f,i)=>`<div class="fc" style="transform:perspective(1000px) rotateY(${i===1?0:i===0?-2:2}deg)"><div class="fi" style="background-image:url('${photos.features[i]||photos.features[0]}')"></div><div class="fb"><span class="ft">${f.tag}</span><h3>${f.title}</h3><p>${f.desc}</p></div></div>`).join("");
  const pills = cfg.categoryPills.map((p,i)=>`<div class="cp ${i===0?"a":""}">${p}</div>`).join("");
  const tests = cfg.testimonials.map(t=>`<div class="ts"><div class="tss">${"★".repeat(t.rating)}</div><p>"${t.text}"</p><div class="tsa">— ${t.name}</div></div>`).join("");
  const gallery = cfg.galleryEmojis.map((e,i)=>`<div class="gi" style="background-image:url('${photos.gallery[i]||photos.gallery[0]}')"><div class="go">${e}</div></div>`).join("");

  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${lead.name} | ${n} em ${city}</title><link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet"><style>
*{margin:0;padding:0;box-sizing:border-box}body{background:linear-gradient(135deg,${c.dark},${c.accent});color:#fff;font-family:'Inter',sans-serif;overflow-x:hidden;min-height:100vh}a{text-decoration:none;color:inherit}h1,h2,h3{font-family:'Sora',sans-serif}
body::before{content:"";position:fixed;inset:0;background-image:radial-gradient(circle at 20% 20%,${c.primary}22,transparent 40%),radial-gradient(circle at 80% 80%,${c.accent}33,transparent 40%);z-index:-1}
.nav{position:fixed;top:24px;left:50%;transform:translateX(-50%);z-index:100;padding:0 32px;height:56px;display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,.05);backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,.1);border-radius:999px;min-width:600px}
.nl{font-size:1.1rem;font-weight:800}.nl span{color:${c.primary}}
.nlinks{display:flex;gap:24px;align-items:center}.nlinks a{color:rgba(255,255,255,.7);font-size:.8rem;font-weight:500}.nlinks a:hover{color:#fff}
.nc{background:${c.primary};color:${c.dark};padding:8px 20px;border-radius:999px;font-weight:700;font-size:.8rem}
.hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:120px 40px 80px;position:relative}
.hbg{position:absolute;inset:0;background-image:url('${photos.hero}');background-size:cover;background-position:center;filter:blur(20px) brightness(.2);transform:scale(1.1)}
.hc{position:relative;z-index:1;max-width:800px}
.hb{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.1);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.2);padding:8px 24px;border-radius:999px;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:3px;color:${c.primary};margin-bottom:32px}
.hero h1{font-size:clamp(3rem,8vw,6rem);font-weight:800;letter-spacing:-3px;line-height:1;margin-bottom:24px;text-shadow:0 4px 40px rgba(0,0,0,.5)}
.hero .sub{font-size:1.3rem;color:rgba(255,255,255,.6);margin-bottom:40px;font-weight:300}
.hr{display:inline-flex;align-items:center;gap:12px;background:rgba(255,255,255,.08);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.12);padding:14px 32px;border-radius:999px;margin-bottom:40px}.hr .stars{color:#FFD700;letter-spacing:2px}
.hbtns{display:flex;flex-wrap:wrap;gap:16px;justify-content:center}
.bp{padding:20px 48px;border-radius:999px;background:linear-gradient(135deg,${c.primary},${c.accent});color:#fff;font-weight:800;font-size:1.1rem;box-shadow:0 10px 40px ${c.primary}55;transition:all .3s;border:none;cursor:pointer}.bp:hover{transform:translateY(-4px) scale(1.02);box-shadow:0 20px 60px ${c.primary}77}
.bo{padding:20px 40px;border-radius:999px;background:rgba(255,255,255,.08);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.2);color:#fff;font-weight:600;font-size:1.05rem;transition:all .3s}.bo:hover{background:rgba(255,255,255,.15)}
.cats{padding:40px;text-align:center}.cps{display:flex;flex-wrap:wrap;gap:10px;justify-content:center}
.cp{padding:10px 22px;border-radius:999px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.7);font-size:.8rem;font-weight:600;cursor:pointer;transition:all .2s}.cp:hover,.cp.a{background:${c.primary};border-color:${c.primary};color:${c.dark}}
.sec{max-width:1200px;margin:0 auto;padding:100px 40px;text-align:center}
.sl{font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:4px;color:${c.primary};margin-bottom:16px}
.st{font-size:clamp(2rem,5vw,3rem);font-weight:800;letter-spacing:-1px;margin-bottom:16px}
.ss{color:rgba(255,255,255,.4);font-size:1.05rem;margin-bottom:48px;font-weight:300}
.fg{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;text-align:left}
.fc{background:rgba(255,255,255,.05);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.1);border-radius:24px;overflow:hidden;transition:all .4s;box-shadow:0 20px 40px rgba(0,0,0,.2)}.fc:hover{border-color:${c.primary}66;transform:translateY(-8px) perspective(1000px) rotateY(0deg);box-shadow:0 30px 60px rgba(0,0,0,.4)}
.fi{height:200px;background-size:cover;background-position:center}
.fb{padding:28px}.ft{display:inline-block;background:${c.primary}22;color:${c.primary};padding:4px 14px;border-radius:999px;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px}
.fb h3{font-size:1.3rem;font-weight:700;margin-bottom:8px}.fb p{color:rgba(255,255,255,.5);font-size:.9rem;line-height:1.7}
.about{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center;text-align:left}
.ai{height:450px;border-radius:24px;background-image:url('${photos.about}');background-size:cover;background-position:center;box-shadow:0 20px 60px rgba(0,0,0,.3)}
.ac p{color:rgba(255,255,255,.6);font-size:1.1rem;line-height:1.8;margin-bottom:24px;font-weight:300}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:16px;text-align:center;margin-top:32px}
.stat{padding:28px 20px;background:rgba(255,255,255,.05);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.08);border-radius:20px}.stat .num{font-family:'Sora';font-size:2.5rem;font-weight:800;color:${c.primary}}.stat .label{font-size:.75rem;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:2px;margin-top:8px}
.tss{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px;text-align:left}
.ts{background:rgba(255,255,255,.05);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.08);border-radius:24px;padding:32px;transition:all .3s}.ts:hover{border-color:${c.primary}44;transform:translateY(-4px)}
.tss2{color:#FFD700;font-size:1.1rem;margin-bottom:18px;letter-spacing:3px}.ts p{color:rgba(255,255,255,.8);font-size:.95rem;line-height:1.7;margin-bottom:18px;font-style:italic}.tsa{color:${c.primary};font-size:.9rem;font-weight:600}
.gal{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.gi{aspect-ratio:1;background-size:cover;background-position:center;border-radius:20px;border:1px solid rgba(255,255,255,.1);transition:all .3s;position:relative;overflow:hidden}.gi:hover{transform:scale(1.05);box-shadow:0 20px 40px rgba(0,0,0,.3)}
.go{position:absolute;inset:0;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;font-size:2.5rem;opacity:0;transition:opacity .3s}.gi:hover .go{opacity:1}
.mc{border-radius:24px;overflow:hidden;border:1px solid rgba(255,255,255,.1);margin-top:24px;max-width:1000px;margin-left:auto;margin-right:auto}.mc iframe{width:100%;height:400px;border:0;display:block;filter:grayscale(.3)}.mi2{padding:24px;background:rgba(255,255,255,.05);backdrop-filter:blur(16px)}.mi2 p{color:rgba(255,255,255,.6);font-size:.95rem;margin-bottom:6px}
.cta{text-align:center;padding:140px 40px;position:relative;overflow:hidden}.cta::before{content:"";position:absolute;inset:0;background-image:url('${photos.hero}');background-size:cover;background-position:center;filter:blur(8px) brightness(.2)}.cta::after{content:"";position:absolute;inset:0;background:linear-gradient(135deg,${c.primary}33,${c.accent}22)}
.cta h2{font-size:clamp(2rem,5vw,3.2rem);font-weight:800;margin-bottom:20px;position:relative;z-index:1}.cta p{color:rgba(255,255,255,.5);font-size:1.15rem;margin-bottom:40px;position:relative;z-index:1;font-weight:300}
footer{background:${c.dark};border-top:1px solid rgba(255,255,255,.06);padding:48px 40px;text-align:center}
footer .brand{font-family:'Sora';font-size:1.3rem;font-weight:800;margin-bottom:12px}footer .brand span{color:${c.primary}}
footer p{color:rgba(255,255,255,.4);font-size:.85rem;margin-bottom:6px}
footer .credit{margin-top:24px;padding-top:24px;border-top:1px solid rgba(255,255,255,.06)}footer .credit a{color:${c.primary};font-weight:600}
footer .social{display:flex;gap:14px;justify-content:center;margin-top:20px}footer .social a{width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);display:inline-flex;align-items:center;justify-content:center;font-size:1.2rem;transition:all .2s}footer .social a:hover{background:${c.primary};color:${c.dark}}
@media(max-width:768px){.nav{min-width:auto;left:16px;right:16px;transform:none;padding:0 16px}.nlinks{display:none}.hero h1{font-size:2.5rem}.gal{grid-template-columns:repeat(2,1fr)}.about{grid-template-columns:1fr;gap:40px}.ai{height:300px}}
</style></head><body>
<nav class="nav"><a href="#" class="nl">${lead.name.split(" ")[0]}<span>${lead.name.split(" ").slice(1).join(" ")||""}</span></a><div class="nlinks"><a href="#destaques">Destaques</a><a href="#sobre">Sobre</a><a href="#depoimentos">Depoimentos</a><a href="#contato">Contato</a>${wa?`<a href="https://wa.me/${wa}" class="nc" target="_blank">WhatsApp</a>`:""}</div></nav>
<section class="hero" id="inicio"><div class="hbg"></div><div class="hc"><div class="hb">${cfg.heroBadge}</div><h1>${cfg.heroTitle(lead.name)}</h1><p class="sub">${cfg.heroSubtitle(city)}</p>${lead.rating?`<div class="hr"><span class="stars">★★★★★</span> ${lead.rating} · ${lead.user_ratings_total||0} avaliações</div>`:""}<div class="hbtns">${wa?`<a href="https://wa.me/${wa}" class="bp" target="_blank">${cfg.ctaButton}</a>`:""}<a href="${maps}" class="bo" target="_blank">Como Chegar</a></div></div></section>
<div class="cats"><div class="cps">${pills}</div></div>
<section class="sec" id="destaques"><div class="sl">${cfg.heroBadge.replace(/^[^\\w]+\\s*/,"")}</div><h2 class="st">${cfg.sectionTitle}</h2><p class="ss">${cfg.sectionSub}</p><div class="fg">${features}</div></section>
<section class="sec" id="sobre"><div class="about"><div class="ai"></div><div class="ac"><div class="sl" style="text-align:left">Nossa História</div><h2 class="st" style="text-align:left">Sobre Nós</h2><p>${cfg.aboutText(lead.name,n,city,lead.rating,lead.user_ratings_total)}</p><div class="stats">${lead.rating?`<div class="stat"><div class="num">${lead.rating}★</div><div class="label">Avaliação</div></div>`:""}${lead.user_ratings_total?`<div class="stat"><div class="num">${lead.user_ratings_total}+</div><div class="label">Clientes</div></div>`:""}<div class="stat"><div class="num">100%</div><div class="label">Qualidade</div></div></div></div></div></section>
<section class="sec" id="depoimentos"><div class="sl">O que dizem</div><h2 class="st">Depoimentos</h2><p class="ss">A satisfação de quem confia em nós</p><div class="tss">${tests}</div></section>
<section class="sec"><div class="sl">Veja mais</div><h2 class="st">Galeria</h2><p class="ss">Um pouquinho do nosso dia a dia</p><div class="gal">${gallery}</div></section>
<section class="sec" id="contato"><div class="sl">Visite-nos</div><h2 class="st">Como Chegar</h2><div class="mc"><iframe src="${embed}" loading="lazy"></iframe><div class="mi2"><p>📍 ${lead.formatted_address||city||""}</p>${lead.phone?`<p>📞 ${lead.phone}</p>`:""}</div></div><div style="display:flex;gap:14px;justify-content:center;margin-top:28px;position:relative;z-index:1">${wa?`<a href="https://wa.me/${wa}" class="bp" target="_blank">💬 WhatsApp</a>`:""}<a href="${maps}" class="bo" target="_blank">Abrir no Maps</a></div></section>
<section class="cta"><h2>${cfg.ctaTitle}</h2><p>${cfg.ctaSubtitle}</p>${wa?`<a href="https://wa.me/${wa}" class="bp" target="_blank">${cfg.ctaButton}</a>`:""}</section>
<footer><div class="brand">${lead.name.split(" ")[0]}<span> ${lead.name.split(" ").slice(1).join(" ")||""}</span></div><p>${lead.formatted_address||city||""}</p>${lead.phone?`<p>${lead.phone}</p>`:""}<div class="social">${lead.instagram?`<a href="${lead.instagram}" target="_blank">📷</a>`:""}${lead.facebook?`<a href="${lead.facebook}" target="_blank">👍</a>`:""}${wa?`<a href="https://wa.me/${wa}" target="_blank">💬</a>`:""}</div><div class="credit"><p>© ${new Date().getFullYear()} ${lead.name}. Todos os direitos reservados.</p><p style="margin-top:6px">Site criado por <a href="https://clodoaldo.vercel.app" target="_blank">Clodoaldo Silva</a></p></div></footer>
</body></html>`;
}
