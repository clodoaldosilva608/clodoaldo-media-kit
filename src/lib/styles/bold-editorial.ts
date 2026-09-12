import { NicheConfig, StyleContext } from "../preview-styles";
import { getNichePhotos } from "../niche-photos";

export function renderBoldEditorial(cfg: NicheConfig, ctx: StyleContext): string {
  const { lead, wa, maps, embed, n, city } = ctx;
  const c = cfg.colors;
  const photos = getNichePhotos(n);
  const features = cfg.features.map((f,i)=>`<div class="fc" style="${i%2===1?"margin-top:60px":""}"><div class="fn">0${i+1}</div><div class="fe" style="background-image:url('${photos.features[i]||photos.features[0]}')"></div><span class="ft">${f.tag}</span><h3>${f.title}</h3><p>${f.desc}</p></div>`).join("");
  const pills = cfg.categoryPills.map((p,i)=>`<div class="cp ${i===0?"a":""}">${p}</div>`).join("");
  const tests = cfg.testimonials.map(t=>`<div class="ts"><div class="tss">${"★".repeat(t.rating)}</div><p>${t.text}</p><div class="tsa">${t.name}</div></div>`).join("");
  const gallery = cfg.galleryEmojis.map((e,i)=>`<div class="gi" style="background-image:url('${photos.gallery[i]||photos.gallery[0]}')"><div class="go">${e}</div></div>`).join("");

  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${lead.name} | ${n} em ${city}</title><meta name="theme-color" content="${c.dark}"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Inter:wght@300;400;500;600;700;900&display=swap" rel="stylesheet"><style>
*{margin:0;padding:0;box-sizing:border-box}body{background:${c.dark};color:#fff;overflow-x:hidden;font-family:'Inter',sans-serif}a{text-decoration:none;color:inherit}h1,h2,h3{font-family:'Space Grotesk',sans-serif}
.nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:24px 40px;display:flex;align-items:center;justify-content:space-between;mix-blend-mode:difference}
.nl{font-size:1.5rem;font-weight:700;color:#fff;letter-spacing:-1px}.nlinks{display:flex;gap:32px;align-items:center}.nlinks a{color:#fff;font-size:.95rem;font-weight:600;text-transform:uppercase;letter-spacing:2px}
.hero{min-height:100vh;display:flex;flex-direction:column;justify-content:center;padding:120px 40px 60px;position:relative;background-image:url('${photos.hero}');background-size:cover;background-position:center}
.hero::before{content:"";position:absolute;inset:0;background:${c.primary};opacity:.85}
.hero>*{position:relative;z-index:1}
.hb{display:inline-block;background:${c.dark};color:#fff;padding:8px 20px;font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:3px;margin-bottom:32px;align-self:flex-start}
.hero h1{font-size:clamp(3rem,12vw,9rem);font-weight:700;letter-spacing:-4px;line-height:.9;color:${c.dark};margin-bottom:24px}
.hero .sub{font-size:clamp(1.1rem,2.5vw,1.8rem);color:${c.dark};opacity:.7;margin-bottom:40px;font-weight:500;max-width:600px}
.hr{display:inline-flex;align-items:center;gap:10px;background:${c.dark};color:#fff;padding:12px 24px;margin-bottom:40px;align-self:flex-start}.hr .stars{color:${c.primary};letter-spacing:2px}
.hbtns{display:flex;flex-wrap:wrap;gap:16px}
.bp{padding:20px 40px;background:${c.dark};color:#fff;font-weight:700;font-size:1.05rem;text-transform:uppercase;letter-spacing:2px;border:none;cursor:pointer;transition:all .2s}.bp:hover{background:${c.accent};transform:translate(-4px,-4px);box-shadow:8px 8px 0 ${c.dark}}
.bo{padding:20px 36px;background:transparent;color:${c.dark};border:2px solid ${c.dark};font-weight:700;font-size:1.05rem;text-transform:uppercase;letter-spacing:2px;transition:all .2s}.bo:hover{background:${c.dark};color:#fff}
.mq{overflow:hidden;padding:20px 0;background:${c.accent};border-top:4px solid ${c.dark};border-bottom:4px solid ${c.dark}}
.mqt{display:flex;gap:32px;white-space:nowrap;animation:mq 25s linear infinite}.mi{font-size:1.5rem;font-weight:700;color:${c.dark};text-transform:uppercase;letter-spacing:2px}.md{color:${c.dark};opacity:.3;font-size:2rem}
@keyframes mq{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
.cats{padding:60px 40px;background:${c.dark}}.cps{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;max-width:1100px;margin:0 auto}
.cp{padding:14px 28px;background:transparent;border:2px solid #fff;color:#fff;font-size:.85rem;font-weight:700;text-transform:uppercase;letter-spacing:2px;cursor:pointer;transition:all .2s}.cp:hover,.cp.a{background:${c.primary};border-color:${c.primary};color:${c.dark}}
.sec{padding:120px 40px;max-width:1200px;margin:0 auto}
.sl{font-size:1rem;font-weight:700;color:${c.primary};text-transform:uppercase;letter-spacing:4px;margin-bottom:24px}
.st{font-size:clamp(2.5rem,7vw,5rem);font-weight:700;letter-spacing:-3px;line-height:.95;margin-bottom:24px}
.ss{font-size:1.2rem;color:rgba(255,255,255,.5);margin-bottom:80px;font-weight:300;max-width:600px}
.fg{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:32px}
.fc{padding:0;background:transparent;border:2px solid rgba(255,255,255,.1);transition:all .3s;position:relative;overflow:hidden}.fc:hover{border-color:${c.primary};background:${c.primary}08}
.fn{position:absolute;top:20px;right:24px;font-size:1rem;font-weight:700;color:${c.primary};opacity:.5;z-index:2}
.fe{height:200px;background-size:cover;background-position:center;opacity:.6;transition:opacity .3s}.fc:hover .fe{opacity:.9}
.ft{display:inline-block;background:${c.primary};color:${c.dark};padding:4px 14px;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:2px;margin:20px 24px 16px}
.fc h3{font-size:1.8rem;font-weight:700;letter-spacing:-1px;margin:0 24px 16px}.fc p{color:rgba(255,255,255,.6);font-size:1rem;line-height:1.6;margin:0 24px 24px}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:0;border:2px solid rgba(255,255,255,.1);margin-top:80px}
.stat{padding:48px 32px;text-align:center;border-right:2px solid rgba(255,255,255,.1)}.stat:last-child{border-right:none}
.stat .num{font-size:4rem;font-weight:700;color:${c.primary};line-height:1;margin-bottom:12px;letter-spacing:-2px}.stat .label{font-size:.85rem;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:3px;font-weight:600}
.tss{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:0}
.ts{padding:48px 36px;border:2px solid rgba(255,255,255,.1);border-right:none}.ts:last-child{border-right:2px solid rgba(255,255,255,.1)}
.tss2{color:${c.primary};font-size:1.5rem;margin-bottom:24px;letter-spacing:4px}.ts p{color:#fff;font-size:1.2rem;line-height:1.5;margin-bottom:24px;font-weight:500}.tsa{color:${c.primary};font-size:1rem;font-weight:700;text-transform:uppercase;letter-spacing:2px}
.gal{display:grid;grid-template-columns:repeat(3,1fr);gap:0;border:2px solid ${c.dark}}
.gi{aspect-ratio:1;background-size:cover;background-position:center;border:2px solid ${c.dark};transition:all .3s;position:relative}.gi:hover{transform:scale(1.05)}
.go{position:absolute;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;font-size:4rem;opacity:0;transition:opacity .3s}.gi:hover .go{opacity:1}
.mc{border:2px solid rgba(255,255,255,.1);margin-top:40px}.mc iframe{width:100%;height:400px;border:0;display:block;filter:grayscale(.5)}.mi2{padding:32px;background:transparent;border-top:2px solid rgba(255,255,255,.1)}.mi2 p{color:rgba(255,255,255,.7);font-size:1rem;margin-bottom:8px}
.cta{padding:140px 40px;background-image:url('${photos.hero}');background-size:cover;background-position:center;text-align:center;position:relative}.cta::before{content:"";position:absolute;inset:0;background:${c.primary};opacity:.9}.cta>*{position:relative;z-index:1}
.cta h2{font-size:clamp(2.5rem,7vw,5rem);font-weight:700;letter-spacing:-3px;line-height:.95;color:${c.dark};margin-bottom:24px}.cta p{color:${c.dark};opacity:.7;font-size:1.3rem;margin-bottom:48px;font-weight:500}
footer{background:${c.dark};padding:60px 40px 40px;text-align:center;border-top:4px solid ${c.primary}}
footer .brand{font-size:1.8rem;font-weight:700;margin-bottom:16px;letter-spacing:-1px}footer .brand span{color:${c.primary}}
footer p{color:rgba(255,255,255,.5);font-size:.9rem;margin-bottom:6px}
footer .credit{margin-top:24px;padding-top:24px;border-top:1px solid rgba(255,255,255,.1)}footer .credit a{color:${c.primary};font-weight:700}
footer .social{display:flex;gap:16px;justify-content:center;margin-top:20px}footer .social a{width:48px;height:48px;border:2px solid rgba(255,255,255,.2);display:inline-flex;align-items:center;justify-content:center;font-size:1.3rem;transition:all .2s}footer .social a:hover{background:${c.primary};border-color:${c.primary};color:${c.dark}}
@media(max-width:768px){.hero h1{font-size:3rem}.nlinks{display:none}.gal{grid-template-columns:repeat(2,1fr)}.stats{grid-template-columns:repeat(2,1fr)}.stat:nth-child(2){border-right:none}.ts{border-right:2px solid rgba(255,255,255,.1)}}
</style></head><body>
<nav class="nav"><a href="#" class="nl">${lead.name.split(" ")[0]}</a><div class="nlinks"><a href="#destaques">${cfg.sectionTitle}</a><a href="#depoimentos">Depoimentos</a><a href="#contato">Contato</a>${wa?`<a href="https://wa.me/${wa}" target="_blank">WhatsApp ↗</a>`:""}</div></nav>
<section class="hero" id="inicio"><div class="hb">${cfg.heroBadge}</div><h1>${cfg.heroTitle(lead.name)}</h1><p class="sub">${cfg.heroSubtitle(city)}</p>${lead.rating?`<div class="hr"><span class="stars">★★★★★</span> ${lead.rating} · ${lead.user_ratings_total||0} avaliações</div>`:""}<div class="hbtns">${wa?`<a href="https://wa.me/${wa}" class="bp" target="_blank">${cfg.ctaButton}</a>`:""}<a href="${maps}" class="bo" target="_blank">Como Chegar</a></div></section>
<div class="mq"><div class="mqt">${[...cfg.marqueeWords,...cfg.marqueeWords].map(w=>`<span class="mi">${w}</span><span class="md">/</span>`).join("")}</div></div>
<div class="cats"><div class="cps">${pills}</div></div>
<section class="sec" id="destaques"><div class="sl">${cfg.heroBadge.replace(/^[^\\w]+\\s*/,"")}</div><h2 class="st">${cfg.sectionTitle}.</h2><p class="ss">${cfg.sectionSub}</p><div class="fg">${features}</div></section>
<section class="sec" id="sobre" style="background:${c.accent}11"><div class="sl">Nossa História</div><h2 class="st">Sobre Nós.</h2><p class="ss">Conheça nossa história</p><div style="max-width:700px;line-height:1.7;color:rgba(255,255,255,.7);font-size:1.2rem;font-weight:300"><p>${cfg.aboutText(lead.name,n,city,lead.rating,lead.user_ratings_total)}</p></div><div class="stats">${lead.rating?`<div class="stat"><div class="num">${lead.rating}</div><div class="label">Estrelas</div></div>`:""}${lead.user_ratings_total?`<div class="stat"><div class="num">${lead.user_ratings_total}+</div><div class="label">Clientes</div></div>`:""}<div class="stat"><div class="num">100%</div><div class="label">Qualidade</div></div><div class="stat"><div class="num">24/7</div><div class="label">Atendimento</div></div></div></section>
<section class="sec" id="depoimentos"><div class="sl">O que dizem</div><h2 class="st">Depoimentos.</h2><p class="ss">A satisfação de quem confia em nós</p><div class="tss">${tests}</div></section>
<section class="sec"><div class="sl">Veja mais</div><h2 class="st">Galeria.</h2><div class="gal" style="margin-top:60px">${gallery}</div></section>
<section class="sec" id="contato"><div class="sl">Visite-nos</div><h2 class="st">Como Chegar.</h2><div class="mc"><iframe src="${embed}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe><div class="mi2"><p>📍 ${lead.formatted_address||city||""}</p>${lead.phone?`<p>📞 ${lead.phone}</p>`:""}</div></div><div style="display:flex;flex-wrap:wrap;gap:16px;margin-top:32px">${wa?`<a href="https://wa.me/${wa}" class="bp" target="_blank">💬 WhatsApp</a>`:""}<a href="${maps}" class="bo" target="_blank">Abrir no Maps</a></div></section>
<section class="cta"><h2>${cfg.ctaTitle}</h2><p>${cfg.ctaSubtitle}</p>${wa?`<a href="https://wa.me/${wa}" class="bp" target="_blank" style="background:${c.dark};color:#fff">${cfg.ctaButton}</a>`:""}</section>
<footer><div class="brand">${lead.name.split(" ")[0]}<span> ${lead.name.split(" ").slice(1).join(" ")||""}</span></div><p>${lead.formatted_address||city||""}</p>${lead.phone?`<p>${lead.phone}</p>`:""}<div class="social">${lead.instagram?`<a href="${lead.instagram}" target="_blank" title="Instagram">📷</a>`:""}${lead.facebook?`<a href="${lead.facebook}" target="_blank" title="Facebook">👍</a>`:""}${wa?`<a href="https://wa.me/${wa}" target="_blank" title="WhatsApp">💬</a>`:""}</div><div class="credit"><p>© ${new Date().getFullYear()} ${lead.name}. Todos os direitos reservados.</p><p style="margin-top:6px">Site criado por <a href="https://clodoaldo-media-kit.vercel.app" target="_blank">Clodoaldo Silva</a></p></div></footer>
</body></html>`;
}
