import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

/**
 * POST /api/admin/prospect/search
 * Busca estabelecimentos por nicho + localização usando Google Places API.
 * Se GOOGLE_MAPS_API_KEY não estiver configurada, retorna erro com instruções.
 *
 * Body: {
 *   niche: string,        // ex: "restaurante", "academia", "barbearia"
 *   location: string,     // ex: "São Paulo, SP" ou "Recife, PE"
 *   radius?: number,      // raio em metros (default 5000)
 *   limit?: number,       // max resultados (default 20)
 * }
 */

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { niche, location, radius = 5000, limit = 20 } = body;

    if (!niche || !location) {
      return NextResponse.json(
        { error: "Nicho e localização são obrigatórios" },
        { status: 400 }
      );
    }

    if (!GOOGLE_MAPS_API_KEY) {
      return NextResponse.json(
        {
          error: "GOOGLE_MAPS_API_KEY não configurada",
          instructions:
            "Para usar a prospecção via Google Maps, configure a variável GOOGLE_MAPS_API_KEY no .env.local com uma chave da Google Maps Platform (Places API enabled). Obtenha em: https://console.cloud.google.com/google/maps-apis",
          fallback: "Use a busca manual adicionando prospects um a um.",
        },
        { status: 503 }
      );
    }

    // Step 1: Geocode the location to lat/lng
    const geocodeResp = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        location + ", Brasil"
      )}&key=${GOOGLE_MAPS_API_KEY}`
    );
    const geocodeData = await geocodeResp.json();

    if (!geocodeData.results || geocodeData.results.length === 0) {
      return NextResponse.json(
        { error: `Localização não encontrada: ${location}` },
        { status: 404 }
      );
    }

    const { lat, lng } = geocodeData.results[0].geometry.location;
    const formattedAddress = geocodeData.results[0].formatted_address;

    // Step 2: Search nearby places by keyword
    const placesResp = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&keyword=${encodeURIComponent(
        niche
      )}&language=pt-BR&key=${GOOGLE_MAPS_API_KEY}`
    );
    const placesData = await placesResp.json();

    if (placesData.status !== "OK" && placesData.status !== "ZERO_RESULTS") {
      return NextResponse.json(
        { error: `Google Places API error: ${placesData.status}` },
        { status: 502 }
      );
    }

    const results = (placesData.results || []).slice(0, limit).map((place: any) => ({
      place_id: place.place_id,
      name: place.name,
      category: place.types?.[0] || niche,
      formatted_address: place.vicinity || place.formatted_address,
      lat: place.geometry?.location?.lat,
      lng: place.geometry?.location?.lng,
      phone: place.formatted_phone_number || null,
      rating: place.rating || null,
      user_ratings_total: place.user_ratings_total || 0,
      open_now: place.opening_hours?.open_now,
      niche,
      search_location: location,
      source: "google_maps",
    }));

    // Step 3: Get details (phone, website) for top results
    const detailedResults = await Promise.all(
      results.slice(0, Math.min(results.length, 10)).map(async (r: any) => {
        try {
          const detailsResp = await fetch(
            `https://maps.googleapis.com/maps/api/place/details/json?place_id=${r.place_id}&fields=formatted_phone_number,international_phone_number,website,formatted_address,opening_hours&key=${GOOGLE_MAPS_API_KEY}`
          );
          const details = await detailsResp.json();
          if (details.result) {
            return {
              ...r,
              phone: details.result.formatted_phone_number || r.phone,
              whatsapp: details.result.international_phone_number?.replace(/[^\d+]/g, "") || null,
              website: details.result.website || null,
              formatted_address: details.result.formatted_address || r.formatted_address,
            };
          }
          return r;
        } catch {
          return r;
        }
      })
    );

    return NextResponse.json({
      results: detailedResults,
      search_meta: {
        niche,
        location,
        formatted_address: formattedAddress,
        lat,
        lng,
        radius,
        total: detailedResults.length,
      },
    });
  } catch (e: any) {
    console.error("[prospect/search] error:", e);
    return NextResponse.json(
      { error: e.message || "Server error" },
      { status: 500 }
    );
  }
}
