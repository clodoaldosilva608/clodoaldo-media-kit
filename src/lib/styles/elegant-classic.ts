import { NicheConfig, StyleContext } from "../preview-styles";
import { getNichePhotos } from "../niche-photos";

export function renderElegantClassic(cfg: NicheConfig, ctx: StyleContext): string {
  const { lead, wa, maps, embed, n, city } = ctx;
  const c = cfg.colors;
  const photos = getNichePhotos(n);
  const features = cfg.features.map(f=>`<div class="fc"><div class="fe" style="background-image:url('${photos.features[cfg.features.indexOf(f)]||photos.features[0]}')"></div><div class="fco"><span class="ft">${f.tag}</span><h3>${f.title}</h3><p>${f.desc}</p></div></div>`).join("");
  const pills = cfg.categoryPills.map((p,i)=>`<div class="cp ${i===0?"a":""}">${p}</div>`).join("");
  const tests = cfg.testimonials.map(t=>`<div class="ts"><div class="tss">${"★".repeat(t.rating)}</div><p class="tq">"${t.text}"</p><div class="tsa">— ${t.name}</div></div>`).join("");
  const gallery = cfg.galleryEmojis.map((e,i)=>`<div class="gi" style="background-image:url('${photos.gallery[i]||photos.gallery[0]}')"><div class="go">${e}</div></div>`).join("");

  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${lead.name} | ${n} em ${city}</title><meta name="theme-color" content="#1a1410"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet"><style>
*{margin:0;padding:0;box-sizing:border-box}body{background:#1a1410;color:#f5f0e8;overflow-x:hidden;font-family:'Inter',sans-serif}a{text-decoration:none;color:inherit}.serif{font-family:'Playfair Display',serif}
.nav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(26,20,16,.92);backdrop-filter:blur(20px);border-bottom:1px solid rgba(184,154,106,.2)}
.ni{max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;padding:0 40px;height:80px}
.nl{font-family:'Playfair Display';font-size:1.5rem;font-weight:700;letter-spacing:.5px;color:#f5f0e8}.nl span{color:${c.primary}}
.nlinks{display:flex;align-items:center;gap:36px}.nlinks a{color:rgba(245,240,232,.7);font-size:.85rem;font-weight:400;letter-spacing:1px;text-transform:uppercase}.nlinks a:hover{color:${c.primary}}
.nc{border:1px solid ${c.primary};color:${c.primary};padding:10px 24px;font-size:.8rem;letter-spacing:2px;text-transform:uppercase;transition:all .3s}.nc:hover{background:${c.primary};color:#1a1410}
.hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;padding:120px 40px 80px;text-align:center;overflow:hidden}
.hbg{position:absolute;inset:0;background-image:url('${photos.hero}');background-size:cover;background-position:center;filter:brightness(.3) sepia(.3)}.hbg::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(26,20,16,.7),rgba(26,20,16,.9))}
.hc{position:relative;z-index:1;max-width:800px}
.hb{display:inline-flex;align-items:center;gap:12px;font-size:.75rem;font-weight:400;letter-spacing:4px;text-transform:uppercase;color:${c.primary};margin-bottom:40px}.hb::before,.hb::after{content:"";width:40px;height:1px;background:${c.primary}}
.hero h1{font-family:'Playfair Display';font-size:clamp(3rem,8vw,6rem);font-weight:700;line-height:1.05;margin-bottom:24px;color:#f5f0e8;letter-spacing:-1px}
.hero .sub{font-family:'Playfair Display';font-size:1.4rem;font-style:italic;color:rgba(245,240,232,.6);margin-bottom:48px;font-weight:400}
.hr{display:inline-flex;align-items:center;gap:14px;border:1px solid rgba(184,154,106,.3);padding:14px 32px;margin-bottom:48px}.hr .stars{color:${c.primary};letter-spacing:3px;font-size:1.1rem}.hr .sep{color:rgba(184,154,106,.4)}
.hbtns{display:flex;flex-wrap:wrap;gap:20px;justify-content:center}
.bp{padding:18px 44px;background:${c.primary};color:#1a1410;font-weight:600;font-size:.85rem;letter-spacing:3px;text-transform:uppercase;border:1px solid ${c.primary};transition:all .3s}.bp:hover{background:transparent;color:${c.primary}}
.bo{padding:18px 40px;background:transparent;color:#f5f0e8;border:1px solid rgba(245,240,232,.3);font-weight:500;font-size:.85rem;letter-spacing:3px;text-transform:uppercase;transition:all .3s}.bo:hover{border-color:${c.primary};color:${c.primary}}
.div{display:flex;align-items:center;justify-content:center;gap:20px;margin:80px 0}.div::before,.div::after{content:"";width:80px;height:1px;background:rgba(184,154,106,.3)}.div-i{color:${c.primary};font-size:1.2rem}
.cats{padding:40px;max-width:1200px;margin:0 auto}.cps{display:flex;flex-wrap:wrap;gap:12px;justify-content:center}
.cp{padding:10px 24px;border:1px solid rgba(184,154,106,.2);color:rgba(245,240,232,.7);font-size:.8rem;letter-spacing:2px;text-transform:uppercase;cursor:pointer;transition:all .3s}.cp:hover,.cp.a{background:${c.primary};color:#1a1410;border-color:${c.primary}}
.sec{max-width:1200px;margin:0 auto;padding:100px 40px}
.sl{font-size:.75rem;font-weight:400;letter-spacing:5px;text-transform:uppercase;color:${c.primary};margin-bottom:20px;text-align:center}
.st{font-family:'Playfair Display';font-size:clamp(2.2rem,5vw,3.5rem);font-weight:700;margin-bottom:20px;text-align:center;letter-spacing:-.5px}
.ss{font-family:'Playfair Display';font-style:italic;color:rgba(245,240,232,.5);font-size:1.2rem;margin-bottom:60px;text-align:center;font-weight:400}
.fg{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:40px}
.fc{display:flex;gap:24px;padding:32px;border:1px solid rgba(184,154,106,.15);transition:all .3s}.fc:hover{border-color:${c.primary};background:rgba(184,154,106,.03)}
.fe{width:100px;height:100px;border-radius:50%;background-size:cover;background-position:center;flex-shrink:0;border:1px solid rgba(184,154,106,.2)}
.ft{display:inline-block;color:${c.primary};font-size:.7rem;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px}
.fc h3{font-family:'Playfair Display';font-size:1.4rem;font-weight:700;margin-bottom:12px}.fc p{color:rgba(245,240,232,.6);font-size:.95rem;line-height:1.7}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:0;border:1px solid rgba(184,154,106,.2);max-width:900px;margin:60px auto 0}
.stat{padding:48px 32px;text-align:center;border-right:1px solid rgba(184,154,106,.2)}.stat:last-child{border-right:none}
.stat .num{font-family:'Playfair Display';font-size:3.5rem;font-weight:700;color:${c.primary};line-height:1;margin-bottom:12px}.stat .label{font-size:.75rem;color:rgba(245,240,232,.5);text-transform:uppercase;letter-spacing:3px}
.tss{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:32px}
.ts{padding:40px 32px;border:1px solid rgba(184,154,106,.15);text-align:center;transition:all .3s}.ts:hover{border-color:${c.primary};background:rgba(184,154,106,.03)}
.tss2{color:${c.primary};font-size:1.2rem;margin-bottom:24px;letter-spacing:4px}
.tq{font-family:'Playfair Display';font-style:italic;font-size:1.15rem;line-height:1.7;color:rgba(245,240,232,.8);margin-bottom:24px}
.tsa{color:${c.primary};font-size:.85rem;letter-spacing:2px;text-transform:uppercase}
.gal{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;max-width:900px;margin:0 auto}
.gi{aspect-ratio:1;background-size:cover;background-position:center;border:1px solid rgba(184,154,106,.15);transition:all .3s;position:relative;overflow:hidden}.gi:hover{border-color:${c.primary}}
.go{position:absolute;inset:0;background:rgba(26,20,16,.6);display:flex;align-items:center;justify-content:center;font-size:3rem;opacity:0;transition:opacity .3s}.gi:hover .go{opacity:1}
.mc{border:1px solid rgba(184,154,106,.2);max-width:1000px;margin:0 auto}.mc iframe{width:100%;height:400px;border:0;display:block;filter:sepia(.3)}.mi2{padding:32px;text-align:center;border-top:1px solid rgba(184,154,106,.2)}.mi2 p{color:rgba(245,240,232,.6);font-size:.95rem;margin-bottom:8px}
.cta{text-align:center;padding:120px 40px;background-image:url('${photos.hero}');background-size:cover;background-position:center;position:relative}.cta::before{content:"";position:absolute;inset:0;background:rgba(26,20,16,.85)}.cta>*{position:relative;z-index:1}
.cta h2{font-family:'Playfair Display';font-size:clamp(2.2rem,5vw,3.5rem);font-weight:700;margin-bottom:24px}.cta p{font-family:'Playfair Display';font-style:italic;color:rgba(245,240,232,.6);font-size:1.3rem;margin-bottom:48px}
footer{background:#1a1410;padding:60px 40px 40px;text-align:center;border-top:1px solid rgba(184,154,106,.2)}
footer .brand{font-family:'Playfair Display';font-size:1.6rem;font-weight:700;margin-bottom:16px}footer .brand span{color:${c.primary}}
footer p{color:rgba(245,240,232,.5);font-size:.85rem;margin-bottom:6px}
footer .credit{margin-top:24px;padding-top:24px;border-top:1px solid rgba(184,154,106,.15)}footer .credit a{color:${c.primary};font-weight:500}
footer .social{display:flex;gap:16px;justify-content:center;margin-top:20px}footer .social a{width:44px;height:44px;border:1px solid rgba(184,154,106,.2);display:inline-flex;align-items:center;justify-content:center;font-size:1.2rem;transition:all .3s}footer .social a:hover{border-color:${c.primary};color:${c.primary}}
@media(max-width:768px){.hero h1{font-size:2.5rem}.nlinks{display:none}.gal{grid-template-columns:repeat(2,1fr)}.stats{grid-template-columns:repeat(2,1fr)}.stat:nth-child(2){border-right:none}.fc{flex-direction:column}.fe{width:80px;height:80px}}
</style></head><body>
<nav class="nav"><div class="ni"><a href="#" class="nl">${lead.name.split(" ")[0]}<span> ${lead.name.split(" ").slice(1).join(" ")||""}</span></a><div class="nlinks"><a href="#inicio">Início</a><a href="#sobre">Sobre</a><a href="#destaques">${cfg.sectionTitle}</a><a href="#depoimentos">Depoimentos</a><a href="#contato">Contato</a>${wa?`<a href="https://wa.me/${wa}" class="nc" target="_blank">WhatsApp</a>`:""}</div></div></nav>
<section class="hero" id="inicio"><div class="hbg"></div><div class="hc"><div class="hb">${cfg.heroBadge}</div><h1>${cfg.heroTitle(lead.name)}</h1><p class="sub">${cfg.heroSubtitle(city)}</p>${lead.rating?`<div class="hr"><span class="stars">★★★★★</span> <span class="sep">·</span> ${lead.rating} <span class="sep">·</span> ${lead.user_ratings_total||0} avaliações</div>`:""}<div class="hbtns">${wa?`<a href="https://wa.me/${wa}" class="bp" target="_blank">${cfg.ctaButton}</a>`:""}<a href="${maps}" class="bo" target="_blank">Como Chegar</a></div></div></section>
<div class="div"><span class="div-i">✦</span></div>
<div class="cats"><div class="cps">${pills}</div></div>
<section class="sec" id="destaques"><div class="sl">${cfg.heroBadge.replace(/^[^\\w]+\\s*/,"")}</div><h2 class="st">${cfg.sectionTitle}</h2><p class="ss">${cfg.sectionSub}</p><div class="fg">${features}</div></section>
<section class="sec" id="sobre"><div class="sl">Nossa História</div><h2 class="st">Sobre Nós</h2><p class="ss">Conheça nossa história</p><div style="max-width:700px;margin:0 auto;line-height:1.9;color:rgba(245,240,232,.7);font-size:1.1rem;text-align:center"><p>${cfg.aboutText(lead.name,n,city,lead.rating,lead.user_ratings_total)}</p></div><div class="stats">${lead.rating?`<div class="stat"><div class="num">${lead.rating}</div><div class="label">Estrelas Google</div></div>`:""}${lead.user_ratings_total?`<div class="stat"><div class="num">${lead.user_ratings_total}+</div><div class="label">Clientes</div></div>`:""}<div class="stat"><div class="num">100%</div><div class="label">Qualidade</div></div><div class="stat"><div class="num">24/7</div><div class="label">Atendimento</div></div></div></section>
<div class="div"><span class="div-i">✦</span></div>
<section class="sec" id="depoimentos"><div class="sl">O que dizem</div><h2 class="st">Depoimentos</h2><p class="ss">A satisfação de quem confia em nós</p><div class="tss">${tests}</div></section>
<section class="sec"><div class="sl">Veja mais</div><h2 class="st">Galeria</h2><p class="ss">Um pouquinho do nosso dia a dia</p><div class="gal">${gallery}</div></section>
<div class="div"><span class="div-i">✦</span></div>
<section class="sec" id="contato"><div class="sl">Visite-nos</div><h2 class="st">Como Chegar</h2><p class="ss">Venha nos visitar</p><div class="mc"><iframe src="${embed}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe><div class="mi2"><p>📍 ${lead.formatted_address||city||""}</p>${lead.phone?`<p>📞 ${lead.phone}</p>`:""}</div></div><div style="display:flex;flex-wrap:wrap;gap:16px;justify-content:center;margin-top:36px">${wa?`<a href="https://wa.me/${wa}" class="bp" target="_blank">💬 WhatsApp</a>`:""}<a href="${maps}" class="bo" target="_blank">Abrir no Maps</a></div></section>
<section class="cta"><h2>${cfg.ctaTitle}</h2><p>${cfg.ctaSubtitle}</p>${wa?`<a href="https://wa.me/${wa}" class="bp" target="_blank">${cfg.ctaButton}</a>`:""}</section>
<footer><div class="brand">${lead.name.split(" ")[0]}<span> ${lead.name.split(" ").slice(1).join(" ")||""}</span></div><p>${lead.formatted_address||city||""}</p>${lead.phone?`<p>${lead.phone}</p>`:""}<div class="social">${lead.instagram?`<a href="${lead.instagram}" target="_blank" title="Instagram">📷</a>`:""}${lead.facebook?`<a href="${lead.facebook}" target="_blank" title="Facebook">👍</a>`:""}${wa?`<a href="https://wa.me/${wa}" target="_blank" title="WhatsApp">💬</a>`:""}</div><div class="credit"><p>© ${new Date().getFullYear()} ${lead.name}. Todos os direitos reservados.</p><p style="margin-top:6px">Site criado por <a href="https://clodoaldo.vercel.app" target="_blank">Clodoaldo Silva</a></p></div></footer>
</body></html>`;
}
