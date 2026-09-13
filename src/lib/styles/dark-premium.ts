import { NicheConfig, StyleContext } from "../preview-styles";
import { getNichePhotos } from "../niche-photos";

export function renderDarkPremium(cfg: NicheConfig, ctx: StyleContext): string {
  const { lead, wa, maps, embed, n, city } = ctx;
  const c = cfg.colors;
  const photos = getNichePhotos(n);
  const features = cfg.features.map((f,i)=>`<div class="fc" style="animation-delay:${i*.1}s"><div class="fi" style="background-image:url('${photos.features[i]||photos.features[0]}')"><div class="fio"></div><span class="ft">${f.tag}</span></div><div class="fb"><h3>${f.title}</h3><p>${f.desc}</p></div></div>`).join("");
  const pills = cfg.categoryPills.map((p,i)=>`<div class="cp ${i===0?"a":""}">${p}</div>`).join("");
  const marquee = [...cfg.marqueeWords,...cfg.marqueeWords].map(w=>`<span class="mi">${w}</span><span class="md">•</span>`).join("");
  const tests = cfg.testimonials.map(t=>`<div class="ts"><div class="tss">${"★".repeat(t.rating)}</div><p>"${t.text}"</p><div class="tsa">— ${t.name}</div></div>`).join("");
  const gallery = cfg.galleryEmojis.map((e,i)=>`<div class="gi" style="background-image:url('${photos.gallery[i]||photos.gallery[0]}')"><div class="go">${e}</div></div>`).join("");

  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${lead.name} | ${n} em ${city}</title><meta name="theme-color" content="${c.dark}"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Inter:wght@300;400;500;600;700;900&display=swap" rel="stylesheet"><style>
*{margin:0;padding:0;box-sizing:border-box}body{background:${c.dark};color:#fff;overflow-x:hidden;font-family:'Inter',sans-serif}a{text-decoration:none;color:inherit}h1,h2,h3{font-family:'Space Grotesk',sans-serif}
.nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:0 40px;height:72px;display:flex;align-items:center;justify-content:space-between;background:rgba(10,10,10,.6);backdrop-filter:blur(24px);border-bottom:1px solid rgba(255,255,255,.06)}
.nl{font-family:'Space Grotesk';font-size:1.3rem;font-weight:700;letter-spacing:-.5px}.nl span{color:${c.primary}}
.nlinks{display:flex;gap:32px;align-items:center}.nlinks a{color:rgba(255,255,255,.7);font-size:.85rem;font-weight:500}.nlinks a:hover{color:#fff}
.nc{background:${c.primary};color:${c.dark};padding:10px 22px;border-radius:999px;font-weight:700;font-size:.85rem}
.hero{min-height:100vh;position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden}
.hbg{position:absolute;inset:0;background-image:url('${photos.hero}');background-size:cover;background-position:center;filter:brightness(.35) saturate(1.2)}.hbg::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,${c.dark}cc,${c.dark}66 50%,${c.dark})}
.hc{position:relative;z-index:1;max-width:800px;text-align:center;padding:120px 40px 80px;animation:fiu 1s ease}
.hb{display:inline-flex;gap:8px;background:rgba(255,255,255,.08);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.15);padding:8px 20px;border-radius:999px;font-size:.7rem;font-weight:600;text-transform:uppercase;letter-spacing:3px;color:${c.primary};margin-bottom:32px}
.hero h1{font-size:clamp(2.8rem,7vw,5rem);font-weight:700;letter-spacing:-2px;line-height:1;margin-bottom:20px;text-shadow:0 4px 40px rgba(0,0,0,.6)}
.hero .sub{font-size:clamp(1rem,2vw,1.3rem);color:rgba(255,255,255,.7);margin-bottom:36px;font-weight:300}
.hr{display:inline-flex;align-items:center;gap:10px;background:rgba(255,255,255,.08);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.12);padding:12px 28px;border-radius:999px;margin-bottom:40px}.hr .stars{color:#FFD700;letter-spacing:2px}
.hbtns{display:flex;flex-wrap:wrap;gap:14px;justify-content:center}
.bp{display:inline-flex;align-items:center;gap:10px;padding:18px 44px;border-radius:999px;background:${c.primary};color:${c.dark};font-weight:700;font-size:1rem;box-shadow:0 10px 40px ${c.primary}55;transition:all .3s;border:none;cursor:pointer}.bp:hover{transform:translateY(-3px);box-shadow:0 20px 60px ${c.primary}77}
.bo{display:inline-flex;align-items:center;gap:10px;padding:18px 36px;border-radius:999px;background:rgba(255,255,255,.08);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.2);color:#fff;font-weight:600;font-size:1rem;transition:all .3s}.bo:hover{background:rgba(255,255,255,.15);transform:translateY(-2px)}
.mq{overflow:hidden;padding:28px 0;background:${c.primary}}.mqt{display:flex;align-items:center;gap:32px;white-space:nowrap;animation:mq 30s linear infinite}
.mi{font-family:'Space Grotesk';font-size:1.1rem;font-weight:700;letter-spacing:3px;color:${c.dark};text-transform:uppercase}.md{color:${c.dark};opacity:.4;font-size:1.5rem}
@keyframes mq{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
.cats{padding:40px;max-width:1200px;margin:0 auto}.cps{display:flex;flex-wrap:wrap;gap:10px;justify-content:center}
.cp{padding:10px 22px;border-radius:999px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);color:rgba(255,255,255,.7);font-size:.8rem;font-weight:600;cursor:pointer;transition:all .2s}.cp:hover,.cp.a{background:${c.primary};border-color:${c.primary};color:${c.dark}}
.sec{max-width:1200px;margin:0 auto;padding:100px 40px}
.sl{font-size:.7rem;font-weight:600;text-transform:uppercase;letter-spacing:4px;color:${c.primary};margin-bottom:16px}
.st{font-size:clamp(2rem,5vw,3rem);font-weight:700;letter-spacing:-1px;margin-bottom:16px}
.ss{color:rgba(255,255,255,.4);font-size:1.05rem;margin-bottom:48px;font-weight:300}
.fg{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px}
.fc{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:24px;overflow:hidden;transition:all .4s;opacity:0;animation:fiu .8s ease forwards}.fc:hover{border-color:${c.primary}66;transform:translateY(-8px);box-shadow:0 30px 60px rgba(0,0,0,.4)}
.fi{height:240px;background-size:cover;background-position:center;position:relative}.fio{position:absolute;inset:0;background:linear-gradient(180deg,transparent 40%,rgba(0,0,0,.7))}
.ft{position:absolute;top:16px;left:16px;background:rgba(0,0,0,.6);backdrop-filter:blur(10px);color:${c.primary};padding:6px 14px;border-radius:999px;font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:1px}
.fb{padding:28px}.fb h3{font-size:1.3rem;font-weight:700;margin-bottom:10px}.fb p{color:rgba(255,255,255,.5);font-size:.9rem;line-height:1.7}
.about{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}
.ai{height:500px;border-radius:24px;background-image:url('${photos.about}');background-size:cover;background-position:center;border:1px solid rgba(255,255,255,.06)}
.ac p{color:rgba(255,255,255,.7);font-size:1.1rem;line-height:1.8;margin-bottom:24px;font-weight:300}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:16px;text-align:center;margin-top:32px}
.stat{padding:28px 20px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:16px}.stat .num{font-family:'Space Grotesk';font-size:2.5rem;font-weight:700;color:${c.primary};line-height:1;margin-bottom:8px}.stat .label{font-size:.7rem;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:2px}
.tss{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px}
.ts{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:24px;padding:32px;transition:all .3s}.ts:hover{border-color:${c.primary}44;transform:translateY(-4px)}
.tss2{color:#FFD700;font-size:1.1rem;margin-bottom:18px;letter-spacing:3px}.ts p{color:rgba(255,255,255,.8);font-size:.95rem;line-height:1.7;margin-bottom:18px;font-style:italic}.tsa{color:${c.primary};font-size:.9rem;font-weight:600}
.gal{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.gi{aspect-ratio:1;background-size:cover;background-position:center;border-radius:20px;border:1px solid rgba(255,255,255,.06);transition:all .4s;position:relative;overflow:hidden}.gi:hover{transform:scale(1.05);box-shadow:0 20px 40px rgba(0,0,0,.4)}
.go{position:absolute;inset:0;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;font-size:2.5rem;opacity:0;transition:opacity .3s}.gi:hover .go{opacity:1}
.mc{border-radius:24px;overflow:hidden;border:1px solid rgba(255,255,255,.06);margin-top:24px}.mc iframe{width:100%;height:400px;border:0;display:block;filter:grayscale(.3) invert(.9)}.mi2{padding:24px;background:rgba(255,255,255,.03)}.mi2 p{color:rgba(255,255,255,.6);font-size:.95rem;margin-bottom:6px}
.cta{text-align:center;padding:120px 40px;background:linear-gradient(135deg,${c.primary}11,${c.accent}06);position:relative;overflow:hidden}.cta::before{content:"";position:absolute;inset:0;background-image:url('${photos.hero}');background-size:cover;background-position:center;opacity:.1;filter:blur(2px)}.cta h2{font-size:clamp(2rem,5vw,3.2rem);font-weight:700;margin-bottom:20px;position:relative}.cta p{color:rgba(255,255,255,.5);font-size:1.15rem;margin-bottom:40px;position:relative;font-weight:300}
footer{background:${c.dark};border-top:1px solid rgba(255,255,255,.06);padding:48px 40px;text-align:center}
footer .brand{font-family:'Space Grotesk';font-size:1.3rem;font-weight:700;margin-bottom:12px}footer .brand span{color:${c.primary}}
footer p{color:rgba(255,255,255,.4);font-size:.85rem;margin-bottom:6px}
footer .credit{margin-top:24px;padding-top:24px;border-top:1px solid rgba(255,255,255,.06)}footer .credit a{color:${c.primary};font-weight:600}
footer .social{display:flex;gap:14px;justify-content:center;margin-top:20px}footer .social a{width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);display:inline-flex;align-items:center;justify-content:center;font-size:1.2rem;transition:all .2s}footer .social a:hover{background:${c.primary};color:${c.dark};border-color:${c.primary}}
@keyframes fiu{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
@media(max-width:768px){.hero h1{font-size:2.5rem}.nlinks{display:none}.gal{grid-template-columns:repeat(2,1fr)}.about{grid-template-columns:1fr;gap:40px}.ai{height:300px}}
</style></head><body>
<nav class="nav"><a href="#" class="nl">${lead.name.split(" ")[0]}<span>${lead.name.split(" ").slice(1).join(" ")||""}</span></a><div class="nlinks"><a href="#inicio">Início</a><a href="#sobre">Sobre</a><a href="#destaques">${cfg.sectionTitle}</a><a href="#depoimentos">Depoimentos</a><a href="#contato">Contato</a>${wa?`<a href="https://wa.me/${wa}" class="nc" target="_blank">WhatsApp</a>`:""}</div></nav>
<section class="hero" id="inicio"><div class="hbg"></div><div class="hc"><div class="hb">${cfg.heroBadge}</div><h1>${cfg.heroTitle(lead.name)}</h1><p class="sub">${cfg.heroSubtitle(city)}</p>${lead.rating?`<div class="hr"><span class="stars">★★★★★</span> ${lead.rating} · ${lead.user_ratings_total||0} avaliações</div>`:""}<div class="hbtns">${wa?`<a href="https://wa.me/${wa}" class="bp" target="_blank">${cfg.ctaButton}</a>`:""}<a href="${maps}" class="bo" target="_blank">Como Chegar</a></div></div></section>
<div class="mq"><div class="mqt">${marquee}</div></div>
<div class="cats"><div class="cps">${pills}</div></div>
<section class="sec" id="destaques"><div class="sl">${cfg.heroBadge.replace(/^[^\\w]+\\s*/,"")}</div><h2 class="st">${cfg.sectionTitle}</h2><p class="ss">${cfg.sectionSub}</p><div class="fg">${features}</div></section>
<section class="sec" id="sobre"><div class="about"><div class="ai"></div><div class="ac"><div class="sl">Nossa História</div><h2 class="st">Sobre Nós</h2><p>${cfg.aboutText(lead.name,n,city,lead.rating,lead.user_ratings_total)}</p><div class="stats">${lead.rating?`<div class="stat"><div class="num">${lead.rating}★</div><div class="label">Avaliação</div></div>`:""}${lead.user_ratings_total?`<div class="stat"><div class="num">${lead.user_ratings_total}+</div><div class="label">Clientes</div></div>`:""}<div class="stat"><div class="num">100%</div><div class="label">Qualidade</div></div></div></div></div></section>
<section class="sec" id="depoimentos" style="background:rgba(255,255,255,.02)"><div class="sl">O que dizem</div><h2 class="st">Depoimentos</h2><p class="ss">A satisfação de quem confia em nós</p><div class="tss">${tests}</div></section>
<section class="sec"><div class="sl">Veja mais</div><h2 class="st">Galeria</h2><p class="ss">Um pouquinho do nosso dia a dia</p><div class="gal">${gallery}</div></section>
<section class="sec" id="contato"><div class="sl">Visite-nos</div><h2 class="st">Como Chegar</h2><p class="ss">Venha nos visitar</p><div class="mc"><iframe src="${embed}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe><div class="mi2"><p>📍 ${lead.formatted_address||city||""}</p>${lead.phone?`<p>📞 ${lead.phone}</p>`:""}</div></div><div style="display:flex;flex-wrap:wrap;gap:14px;justify-content:center;margin-top:28px">${wa?`<a href="https://wa.me/${wa}" class="bp" target="_blank">💬 WhatsApp</a>`:""}<a href="${maps}" class="bo" target="_blank">Abrir no Maps</a></div></section>
<section class="cta"><h2>${cfg.ctaTitle}</h2><p>${cfg.ctaSubtitle}</p>${wa?`<a href="https://wa.me/${wa}" class="bp" target="_blank">${cfg.ctaButton}</a>`:""}</section>
<footer><div class="brand">${lead.name.split(" ")[0]}<span> ${lead.name.split(" ").slice(1).join(" ")||""}</span></div><p>${lead.formatted_address||city||""}</p>${lead.phone?`<p>${lead.phone}</p>`:""}<div class="social">${lead.instagram?`<a href="${lead.instagram}" target="_blank" title="Instagram">📷</a>`:""}${lead.facebook?`<a href="${lead.facebook}" target="_blank" title="Facebook">👍</a>`:""}${wa?`<a href="https://wa.me/${wa}" target="_blank" title="WhatsApp">💬</a>`:""}</div><div class="credit"><p>© ${new Date().getFullYear()} ${lead.name}. Todos os direitos reservados.</p><p style="margin-top:6px">Site criado por <a href="https://clodoaldo.vercel.app" target="_blank">Clodoaldo Silva</a></p></div></footer>
</body></html>`;
}
