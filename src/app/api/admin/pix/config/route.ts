import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

/**
 * GET /api/admin/pix/config
 * Returns: { keys: PixKey[], defaultKey: string }
 *
 * PixKey:
 *   { id, label, type: "phone"|"email"|"cpf"|"random"|"brcode", value, merchantName, merchantCity }
 *   - type "brcode" = BR Code completo (PIX Copia e Cola) — value contém o código completo
 *   - type "phone"|"email"|"cpf"|"random" = chave simples — value contém apenas a chave
 */
export async function GET() {
  try {
    const supabase = getSupabaseServer();
    const { data } = await (supabase.from("app_settings") as any)
      .select("*")
      .eq("key", "pix_keys")
      .maybeSingle();

    const keys = data?.value?.keys || [];
    const defaultKeyId = data?.value?.defaultKeyId || (keys[0]?.id || null);

    // Also check old pix_config for migration
    if (keys.length === 0) {
      const oldConfig = await (supabase.from("app_settings") as any)
        .select("value")
        .eq("key", "pix_config")
        .maybeSingle();

      if (oldConfig.data?.value?.pixKey) {
        const migratedKey = {
          id: "migrated_1",
          label: "Chave principal (migrada)",
          type: "phone",
          value: oldConfig.data.value.pixKey,
          merchantName: oldConfig.data.value.merchantName || "Clodoaldo Silva",
          merchantCity: oldConfig.data.value.merchantCity || "Recife",
        };
        return NextResponse.json({
          keys: [migratedKey],
          defaultKeyId: migratedKey.id,
        });
      }
    }

    return NextResponse.json({ keys, defaultKeyId });
  } catch (e: any) {
    return NextResponse.json({ keys: [], defaultKeyId: null, error: e.message });
  }
}

/**
 * POST /api/admin/pix/config
 * Body: { action: "add"|"remove"|"setDefault", key?: PixKey, keyId?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, key, keyId } = body;

    const supabase = getSupabaseServer();

    // Get current keys
    const { data: existing } = await (supabase.from("app_settings") as any)
      .select("*")
      .eq("key", "pix_keys")
      .maybeSingle();

    let keys: any[] = existing?.value?.keys || [];
    let defaultKeyId = existing?.value?.defaultKeyId || keys[0]?.id || null;

    if (action === "add" && key) {
      const newKey = {
        id: `key_${Date.now()}`,
        label: key.label || "Chave PIX",
        type: key.type || "phone",
        value: key.value,
        merchantName: (key.merchantName || "Clodoaldo Silva").slice(0, 25),
        merchantCity: (key.merchantCity || "Recife").slice(0, 15),
      };
      keys.push(newKey);
      if (!defaultKeyId) defaultKeyId = newKey.id;
    } else if (action === "remove" && keyId) {
      keys = keys.filter((k) => k.id !== keyId);
      if (defaultKeyId === keyId) {
        defaultKeyId = keys[0]?.id || null;
      }
    } else if (action === "setDefault" && keyId) {
      defaultKeyId = keyId;
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const config = { keys, defaultKeyId };

    if (existing?.data) {
      await (supabase.from("app_settings") as any)
        .update({ value: config, updated_at: new Date().toISOString() })
        .eq("key", "pix_keys");
    } else {
      await (supabase.from("app_settings") as any)
        .insert({ key: "pix_keys", value: config });
    }

    return NextResponse.json({ ok: true, keys, defaultKeyId });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
