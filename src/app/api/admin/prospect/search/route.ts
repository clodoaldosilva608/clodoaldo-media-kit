import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

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
const MEUCORRE_ADMIN_JWT = process.env.MEUCORRE_ADMIN_JWT || "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoic3VwZXJfYWRtaW4iLCJzb3VyY2UiOiJlbnYiLCJzdWIiOiJjbG9kb2FsZG82MDhAZ21haWwuY29tIiwianRpIjoiMWE5ZmM2MGEtOTc5YS00ZTRmLWFmNzMtZTcwYTc4NTZlNjAyIiwiaWF0IjoxNzg4NDk2MTk5LCJleHAiOjE3ODkxMDA5OTl9.DzzXx3vo0kKjY37Nx_HcfDzr9DQy0Vk0AWYp82qzUfA";

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

    // Tentativa 1: Google Places API (se API key configurada)
    if (GOOGLE_MAPS_API_KEY) {
      leads = await searchGoogleMaps(niche, location, lat, lng, radius, limit);
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
        Cookie: `meucorre_admin=${MEUCORRE_ADMIN_JWT}`,
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
async function searchGoogleMaps(niche: string, location: string, lat: number, lng: number, radius: number, limit: number): Promise<Lead[]> {
  const googleType = GOOGLE_CATEGORIES[niche] || "restaurant";
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${googleType}&language=pt-BR&key=${GOOGLE_MAPS_API_KEY}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") return [];

    const places = (data.results || []).slice(0, limit);
    const leads: Lead[] = [];

    for (const place of places) {
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
    }

    return leads;
  } catch {
    return [];
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
            } as Lead;
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
