import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { getMeucorreJwt } from "@/lib/meucorre-db";

/**
 * POST /api/admin/prospect/search
 * Busca estabelecimentos por nicho + localização.
 *
 * Fontes (em ordem de prioridade):
 * 1. Google Places API (se NEXT_PUBLIC_GOOGLE_MAPS_API_KEY configurada)
 * 2. Proxy via meucorre.vercel.app API (usa Google Maps do meucorre)
 * 3. OpenStreetMap Overpass API (fallback 100% gratuito, sem key)
 * 4. Demo leads (último recurso)
 *
 * Inspirado no meucorre.vercel.app/admin/parceiros
 */

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

// Proxy JWT for meucorre admin API (allows using their Google Maps quota)

// Map clodoaldo niches to meucorre categories
const MEUCORRE_CATEGORIES: Record<string, string> = {
  restaurante: "restaurant",
  pizzaria: "restaurant",
  hamburgueria: "fast_food",
  cafeteria: "cafe",
  farmácia: "pharmacy",
  "loja de conveniência": "convenience",
  supermercado: "supermarket",
  // Other niches map to restaurant as fallback (meucorre only supports 6 categories)
};

const OSM_CATEGORIES: Record<string, string> = {
  restaurante: "amenity=restaurant",
  barbearia: "shop=hairdresser",
  academia: "leisure=fitness_centre",
  "salão de beleza": "shop=beauty",
  "clínica estética": "shop=beauty",
  "escritório de advocacia": "office=lawyer",
  "consultório odontológico": "amenity=dentist",
  "loja de roupas": "shop=clothes",
  papelaria: "shop=stationery",
  farmácia: "amenity=pharmacy",
  "pet shop": "shop=pet",
  "estética automotiva": "shop=car_repair",
  pizzaria: "amenity=restaurant",
  hamburgueria: "amenity=fast_food",
  cafeteria: "amenity=cafe",
  "loja de conveniência": "shop=convenience",
  imobiliária: "office=estate_agent",
  contabilidade: "office=accountant",
  "agência de marketing": "office=marketing",
  "estúdio de pilates": "leisure=sports_centre",
};

const GOOGLE_CATEGORIES: Record<string, string> = {
  restaurante: "restaurant",
  barbearia: "hair_care",
  academia: "gym",
  "salão de beleza": "beauty_salon",
  "clínica estética": "beauty_salon",
  "escritório de advocacia": "lawyer",
  "consultório odontológico": "dentist",
  "loja de roupas": "clothing_store",
  papelaria: "store",
  farmácia: "pharmacy",
  "pet shop": "pet_store",
  "estética automotiva": "car_repair",
  pizzaria: "restaurant",
  hamburgueria: "meal_takeaway",
  cafeteria: "cafe",
  "loja de conveniência": "convenience_store",
  imobiliária: "real_estate_agency",
  contabilidade: "accounting",
  "agência de marketing": "advertising_agency",
  "estúdio de pilates": "gym",
};

// === Niche validation rules ===
// For each niche, define:
//   - keywords: words that should appear in the place name (any of them)
//   - allowedTypes: Google place_types that confirm the niche (any of them)
//   - blockedTypes: Google place_types that DISQUALIFY the lead (e.g., gas_station in restaurante)
//   - blockedKeywords: words that DISQUALIFY (e.g., "posto" in restaurante)
interface NicheRule {
  keywords: string[];
  allowedTypes: string[];
  blockedTypes?: string[];
  blockedKeywords?: string[];
}

const NICHE_RULES: Record<string, NicheRule> = {
  restaurante: {
    keywords: ["restaurante", "restaurante", "restaurant", "comida", "cozinha", "sabor", "panela", "fogão", "chef", "gastronomia", "buffet", "self service", "self-service", "comida caseira", "marmita"],
    allowedTypes: ["restaurant", "meal_takeaway", "meal_delivery", "food"],
    blockedTypes: ["gas_station", "car_wash", "car_repair", "parking", "atm", "bank", "pharmacy", "hospital", "doctor", "veterinary_care", "school", "church", "city_hall", "police", "fire_station"],
    blockedKeywords: ["posto", "combustível", "gasolina", "alcool", "alcohol", "farmácia", "pharmacy", "banco", "bank", "escola", "school", "igreja", "church"],
  },
  pizzaria: {
    keywords: ["pizza", "pizzaria", "pizzas", "pizza"],
    allowedTypes: ["restaurant", "meal_takeaway", "meal_delivery", "food"],
    blockedTypes: ["gas_station", "pharmacy", "bank"],
    blockedKeywords: ["posto", "farmácia", "banco"],
  },
  hamburgueria: {
    keywords: ["burger", "hamburguer", "hambúrguer", "hamburgueria", "burger", "smash", "lanchonete", "lanche", "burger"],
    allowedTypes: ["restaurant", "meal_takeaway", "meal_delivery", "food"],
    blockedTypes: ["gas_station", "pharmacy", "bank"],
    blockedKeywords: ["posto", "farmácia", "banco"],
  },
  barbearia: {
    keywords: ["barbearia", "barbeiro", "barberos", "barber", "corte", "cabelo", "navalha", "bigode", "barba"],
    allowedTypes: ["hair_care", "beauty_salon", "spa"],
    blockedTypes: ["gas_station", "pharmacy", "bank", "veterinary_care", "car_repair"],
    blockedKeywords: ["posto", "farmácia", "banco", "veterinário", "mecânica", "posto"],
  },
  academia: {
    keywords: ["academia", "gym", "fitness", "musculação", "crossfit", "treino", "ginástica", "personal", "pilates", "spinning"],
    allowedTypes: ["gym", "spa", "stadium"],
    blockedTypes: ["gas_station", "pharmacy", "bank"],
    blockedKeywords: ["posto", "farmácia", "banco"],
  },
  "salão de beleza": {
    keywords: ["salão", "salon", "beleza", "beauty", "cabelo", "cabeleireiro", "manicure", "pedicure", "escova", "corte", "maquiagem", "makeup", "estética"],
    allowedTypes: ["beauty_salon", "hair_care", "spa"],
    blockedTypes: ["gas_station", "pharmacy", "bank", "veterinary_care", "car_repair"],
    blockedKeywords: ["posto", "farmácia", "banco", "veterinário", "mecânica"],
  },
  "clínica estética": {
    keywords: ["estética", "estetic", "botox", "preenchimento", "laser", "depilação", "massagem", "esteticista", "clinica", "clínica"],
    allowedTypes: ["beauty_salon", "spa", "health", "doctor"],
    blockedTypes: ["gas_station", "veterinary_care"],
    blockedKeywords: ["posto", "veterinário"],
  },
  "escritório de advocacia": {
    keywords: ["advocacia", "advogado", "advocacia", "lawyer", "law office", "jurídico", "juridico", "direito", "law", "tribunal", "justiça"],
    allowedTypes: ["lawyer"],
    blockedTypes: ["gas_station", "pharmacy", "bank", "restaurant"],
    blockedKeywords: ["posto", "farmácia", "restaurante"],
  },
  "consultório odontológico": {
    keywords: ["odontolog", "dentista", "dentista", "dente", "dental", "sorriso", "consultório dent", "implante dent", "ortodontia"],
    allowedTypes: ["dentist", "health", "doctor"],
    blockedTypes: ["gas_station", "pharmacy", "veterinary_care"],
    blockedKeywords: ["posto", "veterinário"],
  },
  "loja de roupas": {
    keywords: ["roupa", "roupas", "clothing", "moda", "fashion", "boutique", "vestuário", "vestuario", "camiseta", "calça", "vestido", "loja de roupas", "butique"],
    allowedTypes: ["clothing_store", "shoe_store", "store"],
    blockedTypes: ["gas_station", "pharmacy", "bank", "restaurant"],
    blockedKeywords: ["posto", "farmácia", "restaurante"],
  },
  papelaria: {
    keywords: ["papelaria", "papel", "papelaria", "escritório", "material escolar", "escolar", "caneta", "lápis", "caderno", "cartolina"],
    allowedTypes: ["store", "book_store"],
    blockedTypes: ["gas_station", "pharmacy", "bank"],
    blockedKeywords: ["posto", "farmácia", "banco"],
  },
  farmácia: {
    keywords: ["farmácia", "farmacia", "pharmacy", "drogaria", "droga", "medicamento", "remédio", "remedios", "manipulação"],
    allowedTypes: ["pharmacy", "health"],
    blockedTypes: ["gas_station", "restaurant", "bank"],
    blockedKeywords: ["posto", "restaurante", "banco"],
  },
  "pet shop": {
    keywords: ["pet", "pet shop", "petshop", "animais", "cão", "cachorro", "gato", "veterinário", "ração", "pet", "aquário", "veterinaria"],
    allowedTypes: ["pet_store", "veterinary_care", "store"],
    blockedTypes: ["gas_station", "restaurant"],
    blockedKeywords: ["posto", "restaurante"],
  },
  "estética automotiva": {
    keywords: ["estética automotiva", "automotiva", "auto", "carro", "lavagem", "lava-jato", "lava jato", "polimento", "vitificação", "estetica auto", "auto center", "auto center"],
    allowedTypes: ["car_repair", "car_wash"],
    blockedTypes: ["gas_station", "restaurant", "pharmacy"],
    blockedKeywords: ["posto de gasolina", "restaurante", "farmácia"],
  },
  cafeteria: {
    keywords: ["café", "cafe", "cafeteria", "coffee", "coffee shop", "cafeteria", "padaria", "confeitaria", "pão", "pao"],
    allowedTypes: ["cafe", "bakery", "restaurant", "meal_takeaway"],
    blockedTypes: ["gas_station", "pharmacy", "bank"],
    blockedKeywords: ["posto", "farmácia", "banco"],
  },
  "loja de conveniência": {
    keywords: ["conveniência", "conveniencia", "convenience", "loja de conveniência", "minimercado", "mini mercado", "7eleven", "lojinha"],
    allowedTypes: ["convenience_store", "store"],
    blockedTypes: ["gas_station", "pharmacy"],
    blockedKeywords: ["posto de gasolina", "farmácia"],
  },
  imobiliária: {
    keywords: ["imobiliária", "imobiliaria", "imóveis", "imoveis", "real estate", "realty", "apartamento", "casa", "aluguel", "venda de imóveis"],
    allowedTypes: ["real_estate_agency"],
    blockedTypes: ["gas_station", "restaurant"],
    blockedKeywords: ["posto", "restaurante"],
  },
  contabilidade: {
    keywords: ["contabilidade", "contabil", "contador", "contadora", "contábil", "escritório de contabilidade", "assessoria contábil", "fiscal"],
    allowedTypes: ["accounting", "finance"],
    blockedTypes: ["gas_station", "restaurant", "pharmacy"],
    blockedKeywords: ["posto", "restaurante", "farmácia"],
  },
  "agência de marketing": {
    keywords: ["marketing", "publicidade", "propaganda", "agência", "agencia", "advertising", "digital", "tráfego", "trafego", "mídia", "midia", "social media", "agência digital"],
    allowedTypes: ["advertising_agency", "marketing_agency"],
    blockedTypes: ["gas_station", "restaurant"],
    blockedKeywords: ["posto", "restaurante"],
  },
  "estúdio de pilates": {
    keywords: ["pilates", "estúdio", "estudio", "studio", "core", "alongamento", "postura"],
    allowedTypes: ["gym", "spa", "health"],
    blockedTypes: ["gas_station", "restaurant"],
    blockedKeywords: ["posto", "restaurante"],
  },
};

// === Validation function ===
// Returns { valid: boolean, reason?: string }
function validateNicheMatch(
  niche: string,
  placeName: string,
  placeTypes: string[] = []
): { valid: boolean; reason?: string } {
  const rule = NICHE_RULES[niche];
  if (!rule) return { valid: true }; // unknown niche → accept (no rule)

  const name = (placeName || "").toLowerCase();
  const types = placeTypes.map(t => t.toLowerCase());

  // 1. Check blocked types — instant disqualification
  if (rule.blockedTypes) {
    for (const bt of rule.blockedTypes) {
      if (types.includes(bt.toLowerCase())) {
        return { valid: false, reason: `blocked_type:${bt}` };
      }
    }
  }

  // 2. Check blocked keywords — instant disqualification
  if (rule.blockedKeywords) {
    for (const bk of rule.blockedKeywords) {
      if (name.includes(bk.toLowerCase())) {
        return { valid: false, reason: `blocked_keyword:${bk}` };
      }
    }
  }

  // 3. Check name contains ANY of the keywords
  const nameMatch = rule.keywords.some(k => name.includes(k.toLowerCase()));
  if (nameMatch) return { valid: true };

  // 4. If name doesn't match, check if types match allowed types
  const typeMatch = rule.allowedTypes.some(t => types.includes(t.toLowerCase()));
  if (typeMatch) return { valid: true };

  // 5. Neither name nor type matches — reject
  return { valid: false, reason: "no_match" };
}

interface Lead {
  name: string;
  phone: string | null;
  whatsapp: string | null;
  formatted_address: string;
  city: string;
  lat: number;
  lng: number;
  category: string;
  niche: string;
  website: string | null;
  rating: number | null;
  user_ratings_total: number | null;
  source: string;
  place_id: string | null;
  search_location: string;
  hasWebsite: boolean;
  webDevOpportunity: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { niche, location, radius = 5000, limit = 20 } = body;

    if (!niche || !location) {
      return NextResponse.json({ error: "Nicho e localização são obrigatórios" }, { status: 400 });
    }

    // Step 1: Geocode the location using OpenStreetMap Nominatim (FREE, no key needed)
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location + ", Brasil")}&format=json&limit=1`;
    const geocodeResp = await fetch(geocodeUrl, {
      headers: { "User-Agent": "ClodoaldoAdmin/1.0 (contato@clodoaldo.vercel.app)" },
    });

    if (!geocodeResp.ok) {
      return NextResponse.json({ error: "Erro ao buscar localização" }, { status: 502 });
    }

    const geocodeData = await geocodeResp.json();
    if (!geocodeData || geocodeData.length === 0) {
      return NextResponse.json({ error: `Localização não encontrada: ${location}` }, { status: 404 });
    }

    const lat = parseFloat(geocodeData[0].lat);
    const lng = parseFloat(geocodeData[0].lon);
    const formattedAddress = geocodeData[0].display_name;

    let leads: Lead[] = [];
    let source = "";
    let validationStats: { rejected: number; totalFound: number; reasons: Record<string, number> } | undefined;

    // Tentativa 1: Google Places API (se API key configurada)
    if (GOOGLE_MAPS_API_KEY) {
      const result = await searchGoogleMaps(niche, location, lat, lng, radius, limit);
      leads = result.leads;
      validationStats = result.validation;
      if (leads.length > 0) source = "google_maps";
    }

    // Tentativa 2: Proxy via meucorre API (usa Google Maps do meucorre)
    if (leads.length === 0) {
      leads = await searchViaMeucorre(niche, location, lat, lng, limit);
      if (leads.length > 0) source = "google_maps";
    }

    // Tentativa 3: OpenStreetMap Overpass API (FREE fallback)
    if (leads.length === 0) {
      leads = await searchOpenStreetMap(niche, location, lat, lng, radius, limit);
      if (leads.length > 0) source = "openstreetmap";
    }

    // Tentativa 4: Demo leads (último recurso)
    if (leads.length === 0) {
      leads = generateDemoLeads(niche, location, lat, lng, limit);
      source = "demo";
    }

    return NextResponse.json({
      results: leads,
      search_meta: {
        niche,
        location,
        formatted_address: formattedAddress,
        lat,
        lng,
        radius,
        total: leads.length,
        source,
        google_maps_enabled: !!GOOGLE_MAPS_API_KEY,
        validation: validationStats,
      },
      warning: source === "demo" ? "Google Maps e OpenStreetMap indisponíveis. Mostrando leads de demonstração." : undefined,
    });
  } catch (e: any) {
    console.error("[prospect/search] error:", e);
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}

// ===== Proxy via meucorre API (usa Google Maps do meucorre) =====
async function searchViaMeucorre(niche: string, location: string, lat: number, lng: number, limit: number): Promise<Lead[]> {
  const meucorreCategory = MEUCORRE_CATEGORIES[niche] || "restaurant";
  const url = `https://meucorre.vercel.app/api/admin/parceiros/prospect?city=${encodeURIComponent(location)}&category=${meucorreCategory}&limit=${limit}`;

  try {
    const res = await fetch(url, {
      headers: {
        Cookie: `meucorre_admin=${getMeucorreJwt()}`,
      },
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) return [];
    const data = await res.json();
    if (!data.ok || !data.leads) return [];

    return (data.leads as any[]).map((l: any) => ({
      name: l.name || "Sem nome",
      phone: l.phone || null,
      whatsapp: l.whatsapp || null,
      formatted_address: l.address || "",
      city: location,
      lat: l.lat || lat,
      lng: l.lng || lng,
      category: l.category || niche,
      niche,
      website: l.website || null,
      rating: l.rating || null,
      user_ratings_total: l.reviews || 0,
      source: "google_maps",
      place_id: l.name ? `mc_${Buffer.from(l.name).toString("base64").slice(0, 20)}` : null,
      search_location: location,
      hasWebsite: !!l.website,
      webDevOpportunity: !l.website,
    }));
  } catch {
    return [];
  }
}

// ===== Google Places API =====
async function searchGoogleMaps(niche: string, location: string, lat: number, lng: number, radius: number, limit: number): Promise<{ leads: Lead[]; validation: { rejected: number; totalFound: number; reasons: Record<string, number> } }> {
  const googleType = GOOGLE_CATEGORIES[niche] || "restaurant";
  // Use keyword parameter to filter by niche name in Portuguese — this dramatically
  // improves relevance (Google filters results by matching name + vicinity + category)
  const keyword = encodeURIComponent(niche);
  // Use type + keyword together: type narrows to category, keyword filters by niche
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${googleType}&keyword=${keyword}&language=pt-BR&key=${GOOGLE_MAPS_API_KEY}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return { leads: [], validation: { rejected: 0, totalFound: 0, reasons: {} } };
    const data = await res.json();
    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") return { leads: [], validation: { rejected: 0, totalFound: 0, reasons: {} } };

    const places = (data.results || []);
    const leads: Lead[] = [];
    let rejectedCount = 0;
    const rejectionReasons: Record<string, number> = {};

    for (const place of places) {
      // === Validate niche match BEFORE fetching details (saves API quota) ===
      const validation = validateNicheMatch(niche, place.name || "", place.types || []);
      if (!validation.valid) {
        rejectedCount++;
        const reason = validation.reason || "unknown";
        rejectionReasons[reason] = (rejectionReasons[reason] || 0) + 1;
        continue;
      }

      let phone: string | null = null;
      let website: string | null = null;

      try {
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=formatted_phone_number,international_phone_number,website,formatted_address&language=pt-BR&key=${GOOGLE_MAPS_API_KEY}`;
        const detailsRes = await fetch(detailsUrl);
        if (detailsRes.ok) {
          const detailsData = await detailsRes.json();
          if (detailsData.status === "OK") {
            const r = detailsData.result || {};
            phone = r.formatted_phone_number || r.international_phone_number || null;
            website = r.website || null;
          }
        }
      } catch {}

      const hasWebsite = !!website;
      leads.push({
        name: place.name || "Sem nome",
        phone,
        whatsapp: phone ? phone.replace(/\D/g, "") : null,
        formatted_address: place.vicinity || place.formatted_address || "",
        city: location,
        lat: place.geometry?.location?.lat || lat,
        lng: place.geometry?.location?.lng || lng,
        category: place.types?.[0] || niche,
        niche,
        website,
        rating: place.rating || null,
        user_ratings_total: place.user_ratings_total || 0,
        source: "google_maps",
        place_id: place.place_id || null,
        search_location: location,
        hasWebsite,
        webDevOpportunity: !hasWebsite,
      });

      // Stop when we have enough validated leads
      if (leads.length >= limit) break;
    }

    // Log validation stats for debugging
    if (rejectedCount > 0) {
      console.log(`[prospect/search] niche="${niche}" rejected ${rejectedCount}/${places.length} places. Reasons:`, rejectionReasons);
    }

    return {
      leads,
      validation: {
        rejected: rejectedCount,
        totalFound: places.length,
        reasons: rejectionReasons,
      },
    };
  } catch {
    return { leads: [], validation: { rejected: 0, totalFound: 0, reasons: {} } };
  }
}

// ===== OpenStreetMap Overpass API (FREE, no key needed) =====
async function searchOpenStreetMap(niche: string, location: string, lat: number, lng: number, radius: number, limit: number): Promise<Lead[]> {
  const osmTag = OSM_CATEGORIES[niche] || OSM_CATEGORIES.restaurante;
  const query = `[out:json][timeout:25];(${osmTag}(around:${radius},${lat},${lng}););out tags center ${limit};`;

  const servers = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
  ];

  for (const server of servers) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(server, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(query)}`,
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        const elements = data.elements || [];
        return elements
          .filter((e: any) => e.tags?.name)
          .map((e: any) => {
            const tags = e.tags || {};
            const addr = [tags["addr:street"], tags["addr:housenumber"], tags["addr:suburb"]].filter(Boolean).join(", ");
            const phone = tags.phone || tags["contact:phone"] || null;
            const website = tags.website || tags["contact:website"] || null;
            // Build a pseudo-types array from OSM tags for niche validation
            const osmTypes: string[] = [];
            if (tags.amenity) osmTypes.push(`amenity=${tags.amenity}`);
            if (tags.shop) osmTypes.push(`shop=${tags.shop}`);
            if (tags.office) osmTypes.push(`office=${tags.office}`);
            if (tags.leisure) osmTypes.push(`leisure=${tags.leisure}`);
            if (tags.healthcare) osmTypes.push(`healthcare=${tags.healthcare}`);
            if (tags.craft) osmTypes.push(`craft=${tags.craft}`);
            return {
              name: tags.name || "Sem nome",
              phone,
              whatsapp: tags["contact:whatsapp"] || (phone ? phone.replace(/\D/g, "") : null),
              formatted_address: addr || "",
              city: location,
              lat: e.lat || e.center?.lat || lat,
              lng: e.lon || e.center?.lon || lng,
              category: niche,
              niche,
              website,
              rating: null,
              user_ratings_total: 0,
              source: "openstreetmap",
              place_id: tags["osm_id"] ? `osm_${tags["osm_id"]}` : `osm_${e.id}`,
              search_location: location,
              hasWebsite: !!website,
              webDevOpportunity: !website,
              _osmTypes: osmTypes, // for validation
            } as Lead & { _osmTypes: string[] };
          })
          // === Validate niche match for OSM results ===
          .filter((item) => {
            // OSM doesn't have Google-style types; we use a simpler name-based check
            const rule = NICHE_RULES[niche];
            if (!rule) return true;
            const name = item.name.toLowerCase();
            // Check blocked keywords first
            if (rule.blockedKeywords) {
              for (const bk of rule.blockedKeywords) {
                if (name.includes(bk.toLowerCase())) return false;
              }
            }
            // Check if name contains any keyword OR any osm type contains an allowed type
            const nameMatch = rule.keywords.some(k => name.includes(k.toLowerCase()));
            if (nameMatch) return true;
            // Check OSM types loosely
            const osmTypeStr = item._osmTypes.join(" ").toLowerCase();
            const osmMatch = rule.allowedTypes.some(t => osmTypeStr.includes(t.toLowerCase().split("_")[0]));
            return osmMatch;
          })
          .slice(0, limit);
      }
    } catch {
      // try next server
    }
  }

  return [];
}

// ===== Demo leads (último recurso) =====
function generateDemoLeads(niche: string, location: string, lat: number, lng: number, limit: number): Lead[] {
  const demos = [
    { name: `${capitalize(niche)} Bom Sabor`, addr: "Centro" },
    { name: `${capitalize(niche)} do Bairro`, addr: "Zona Sul" },
    { name: `${capitalize(niche)} Aroma`, addr: "Rua das Flores" },
    { name: `${capitalize(niche)} Express`, addr: "Av. Principal" },
    { name: `${capitalize(niche)} Econômico`, addr: "BR-101" },
  ];
  return demos.slice(0, limit).map((d, i) => ({
    name: `${d.name} - ${location}`,
    phone: null,
    whatsapp: null,
    formatted_address: `${d.addr}, ${location}`,
    city: location,
    lat: lat + (i * 0.01),
    lng: lng + (i * 0.01),
    category: niche,
    niche,
    website: null,
    rating: null,
    user_ratings_total: 0,
    source: "demo",
    place_id: `demo_${i}`,
    search_location: location,
    hasWebsite: false,
    webDevOpportunity: true,
  }));
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
