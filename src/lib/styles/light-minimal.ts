import { NicheConfig, StyleContext } from "../preview-styles";
import { getNichePhotos } from "../niche-photos";

export function renderLightMinimal(cfg: NicheConfig, ctx: StyleContext): string {
  const { lead, wa, maps, embed, n, city } = ctx;
  const c = cfg.colors;
  const photos = getNichePhotos(n);
  const features = cfg.features.map((f,i)=>`<div class="fc"><div class="fe">${f.emoji}</div><span class="ft">${f.tag}</span><h3>${f.title}</h3><p>${f.desc}</p></div>`).join("");
  const pills = cfg.categoryPills.map((p,i)=>`<div class="cp ${i===0?"a":""}">${p}</div>`).join("");
  const tests = cfg.testimonials.map(t=>`<div class="ts"><div class="tss">${"★".repeat(t.rating)}</div><p>"${t.text}"</p><div class="tsa">— ${t.name}</div></div>`).join("");
  const gallery = cfg.galleryEmojis.map((e,i)=>`<div class="gi" style="background-image:url('${photos.gallery[i]||photos.gallery[0]}')"></div>`).join("");

  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${lead.name} | ${n} em ${city}</title><meta name="theme-color" content="#fafafa"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet"><style>
*{margin:0;padding:0;box-sizing:border-box}body{background:#fafafa;color:#0a0a0a;overflow-x:hidden;font-family:'Inter',sans-serif}a{text-decoration:none;color:inherit}h1,h2,h3{font-family:'Sora',sans-serif}
.nav{position:sticky;top:0;z-index:100;background:rgba(255,255,255,.85);backdrop-filter:blur(20px);border-bottom:1px solid #eee}
.ni{max-width:1100px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;padding:0 40px;height:80px}
.nl{font-family:'Sora';font-size:1.4rem;font-weight:800;letter-spacing:-.5px}.nl span{color:${c.primary}}
.nlinks{display:flex;gap:32px;align-items:center}.nlinks a{color:#666;font-size:.95rem;font-weight:500}.nlinks a:hover{color:#0a0a0a}
.nc{background:#0a0a0a;color:#fff;padding:12px 24px;border-radius:999px;font-weight:600;font-size:.85rem}
.hero{max-width:1100px;margin:0 auto;padding:120px 40px 80px;text-align:center}
.hb{display:inline-block;background:${c.primary}11;color:${c.primary};padding:8px 20px;border-radius:999px;font-size:.75rem;font-weight:600;text-transform:uppercase;letter-spacing:2px;margin-bottom:32px}
.hero h1{font-size:clamp(2.8rem,7vw,5rem);font-weight:800;letter-spacing:-3px;line-height:1;margin-bottom:24px}
.hero .sub{font-size:1.3rem;color:#666;margin-bottom:40px;font-weight:300;max-width:600px;margin-left:auto;margin-right:auto}
.hr{display:inline-flex;align-items:center;gap:10px;background:#fff;border:1px solid #eee;padding:12px 28px;border-radius:999px;margin-bottom:40px;box-shadow:0 4px 20px rgba(0,0,0,.04)}.hr .stars{color:${c.primary};letter-spacing:2px}
.hbtns{display:flex;flex-wrap:wrap;gap:14px;justify-content:center}
.bp{padding:18px 40px;border-radius:999px;background:#0a0a0a;color:#fff;font-weight:700;font-size:1rem;transition:all .2s;border:none;cursor:pointer}.bp:hover{background:${c.primary};transform:translateY(-2px)}
.bo{padding:18px 36px;border-radius:999px;background:#fff;border:1px solid #ddd;color:#0a0a0a;font-weight:600;font-size:1rem;transition:all .2s}.bo:hover{border-color:#0a0a0a}
.cats{max-width:1100px;margin:0 auto;padding:0 40px 60px}.cps{display:flex;flex-wrap:wrap;gap:10px;justify-content:center}
.cp{padding:10px 22px;border-radius:999px;background:#fff;border:1px solid #eee;color:#666;font-size:.85rem;font-weight:500;cursor:pointer;transition:all .2s}.cp:hover,.cp.a{background:#0a0a0a;color:#fff;border-color:#0a0a0a}
.sec{max-width:1100px;margin:0 auto;padding:100px 40px}
.sl{font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:3px;color:${c.primary};margin-bottom:16px;text-align:center}
.st{font-size:clamp(2rem,5vw,3rem);font-weight:800;letter-spacing:-1px;margin-bottom:16px;text-align:center}
.ss{color:#999;font-size:1.1rem;margin-bottom:60px;text-align:center;font-weight:300}
.fg{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:40px}
.fc{text-align:center;padding:40px 28px;background:#fff;border-radius:24px;border:1px solid #eee;transition:all .3s}.fc:hover{transform:translateY(-6px);box-shadow:0 20px 40px rgba(0,0,0,.06);border-color:${c.primary}33}
.fe{font-size:3.5rem;margin-bottom:20px}
.ft{display:inline-block;background:${c.primary}11;color:${c.primary};padding:4px 14px;border-radius:999px;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:16px}
.fc h3{font-size:1.3rem;font-weight:700;margin-bottom:12px}.fc p{color:#666;font-size:.95rem;line-height:1.7}
.about{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center;max-width:1100px;margin:0 auto}
.ai{height:500px;border-radius:24px;background-image:url('${photos.about}');background-size:cover;background-position:center;box-shadow:0 20px 60px rgba(0,0,0,.08)}
.ac p{color:#555;font-size:1.1rem;line-height:1.9;margin-bottom:24px;font-weight:300}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:32px;text-align:center;margin-top:40px}
.stat .num{font-family:'Sora';font-size:3rem;font-weight:800;color:${c.primary};line-height:1;margin-bottom:10px}.stat .label{font-size:.85rem;color:#999;text-transform:uppercase;letter-spacing:2px;font-weight:500}
.tss{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:32px}
.ts{padding:36px 28px;background:#fff;border-radius:24px;border:1px solid #eee;transition:all .3s}.ts:hover{transform:translateY(-4px);box-shadow:0 16px 32px rgba(0,0,0,.06)}
.tss2{color:${c.primary};font-size:1.2rem;margin-bottom:20px;letter-spacing:3px}.ts p{color:#333;font-size:1rem;line-height:1.8;margin-bottom:20px}.tsa{color:#999;font-size:.9rem;font-weight:600}
.gal{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;max-width:800px;margin:0 auto}
.gi{aspect-ratio:1;background-size:cover;background-position:center;border-radius:20px;border:1px solid #eee;transition:all .3s}.gi:hover{transform:scale(1.05);box-shadow:0 16px 32px rgba(0,0,0,.08)}
.mc{border-radius:24px;overflow:hidden;border:1px solid #eee;max-width:900px;margin:0 auto;box-shadow:0 10px 40px rgba(0,0,0,.04)}.mc iframe{width:100%;height:400px;border:0;display:block}.mi2{padding:24px;background:#fff;text-align:center}.mi2 p{color:#666;font-size:.95rem;margin-bottom:6px}
.cta{text-align:center;padding:120px 40px;background:#0a0a0a;color:#fff;border-radius:40px;max-width:1100px;margin:60px auto}
.cta h2{font-size:clamp(2rem,5vw,3.2rem);font-weight:800;margin-bottom:20px;letter-spacing:-1px}.cta p{color:rgba(255,255,255,.6);font-size:1.2rem;margin-bottom:40px;font-weight:300}
footer{background:#0a0a0a;color:#fff;padding:60px 40px 40px;text-align:center}
footer .brand{font-family:'Sora';font-size:1.4rem;font-weight:800;margin-bottom:12px}footer .brand span{color:${c.primary}}
footer p{color:rgba(255,255,255,.5);font-size:.85rem;margin-bottom:6px}
footer .credit{margin-top:24px;padding-top:24px;border-top:1px solid rgba(255,255,255,.1)}footer .credit a{color:${c.primary};font-weight:600}
footer .social{display:flex;gap:14px;justify-content:center;margin-top:20px}footer .social a{width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.08);display:inline-flex;align-items:center;justify-content:center;font-size:1.2rem;transition:all .2s}footer .social a:hover{background:${c.primary}}
@media(max-width:768px){.hero h1{font-size:2.5rem}.nlinks{display:none}.gal{grid-template-columns:repeat(2,1fr)}.about{grid-template-columns:1fr;gap:40px}.ai{height:300px}.cta{border-radius:24px}}
</style></head><body>
<nav class="nav"><div class="ni"><a href="#" class="nl">${lead.name.split(" ")[0]}<span>${lead.name.split(" ").slice(1).join(" ")||""}</span></a><div class="nlinks"><a href="#inicio">Início</a><a href="#sobre">Sobre</a><a href="#destaques">${cfg.sectionTitle}</a><a href="#depoimentos">Depoimentos</a>${wa?`<a href="https://wa.me/${wa}" class="nc" target="_blank">WhatsApp</a>`:""}</div></div></nav>
<section class="hero" id="inicio"><div class="hb">${cfg.heroBadge}</div><h1>${cfg.heroTitle(lead.name)}</h1><p class="sub">${cfg.heroSubtitle(city)}</p>${lead.rating?`<div class="hr"><span class="stars">★★★★★</span> ${lead.rating} · ${lead.user_ratings_total||0} avaliações</div>`:""}<div class="hbtns">${wa?`<a href="https://wa.me/${wa}" class="bp" target="_blank">${cfg.ctaButton}</a>`:""}<a href="${maps}" class="bo" target="_blank">Como Chegar →</a></div></section>
<div class="cats"><div class="cps">${pills}</div></div>
<section class="sec" id="destaques"><div class="sl">${cfg.heroBadge.replace(/^[^\\w]+\\s*/,"")}</div><h2 class="st">${cfg.sectionTitle}</h2><p class="ss">${cfg.sectionSub}</p><div class="fg">${features}</div></section>
<section class="sec" id="sobre" style="background:#fff;border-top:1px solid #eee;border-bottom:1px solid #eee"><div class="about"><div class="ai"></div><div class="ac"><div class="sl" style="text-align:left">Nossa História</div><h2 class="st" style="text-align:left">Sobre Nós</h2><p>${cfg.aboutText(lead.name,n,city,lead.rating,lead.user_ratings_total)}</p><div class="stats">${lead.rating?`<div class="stat"><div class="num">${lead.rating}★</div><div class="label">Avaliação</div></div>`:""}${lead.user_ratings_total?`<div class="stat"><div class="num">${lead.user_ratings_total}+</div><div class="label">Clientes</div></div>`:""}<div class="stat"><div class="num">100%</div><div class="label">Qualidade</div></div></div></div></div></section>
<section class="sec" id="depoimentos"><div class="sl">O que dizem</div><h2 class="st">Depoimentos</h2><p class="ss">A satisfação de quem confia em nós</p><div class="tss">${tests}</div></section>
<section class="sec" style="background:#fff;border-top:1px solid #eee;border-bottom:1px solid #eee"><div class="sl">Veja mais</div><h2 class="st">Galeria</h2><p class="ss">Um pouquinho do nosso dia a dia</p><div class="gal">${gallery}</div></section>
<section class="sec" id="contato"><div class="sl">Visite-nos</div><h2 class="st">Como Chegar</h2><p class="ss">Venha nos visitar</p><div class="mc"><iframe src="${embed}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe><div class="mi2"><p>📍 ${lead.formatted_address||city||""}</p>${lead.phone?`<p>📞 ${lead.phone}</p>`:""}</div></div><div style="display:flex;flex-wrap:wrap;gap:14px;justify-content:center;margin-top:32px">${wa?`<a href="https://wa.me/${wa}" class="bp" target="_blank">💬 WhatsApp</a>`:""}<a href="${maps}" class="bo" target="_blank">Abrir no Maps →</a></div></section>
<section class="cta"><h2>${cfg.ctaTitle}</h2><p>${cfg.ctaSubtitle}</p>${wa?`<a href="https://wa.me/${wa}" class="bp" target="_blank" style="background:${c.primary}">${cfg.ctaButton}</a>`:""}</section>
<footer><div class="brand">${lead.name.split(" ")[0]}<span> ${lead.name.split(" ").slice(1).join(" ")||""}</span></div><p>${lead.formatted_address||city||""}</p>${lead.phone?`<p>${lead.phone}</p>`:""}<div class="social">${lead.instagram?`<a href="${lead.instagram}" target="_blank" title="Instagram">📷</a>`:""}${lead.facebook?`<a href="${lead.facebook}" target="_blank" title="Facebook">👍</a>`:""}${wa?`<a href="https://wa.me/${wa}" target="_blank" title="WhatsApp">💬</a>`:""}</div><div class="credit"><p>© ${new Date().getFullYear()} ${lead.name}. Todos os direitos reservados.</p><p style="margin-top:6px">Site criado por <a href="https://clodoaldo-media-kit.vercel.app" target="_blank">Clodoaldo Silva</a></p></div></footer>
</body></html>`;
}
