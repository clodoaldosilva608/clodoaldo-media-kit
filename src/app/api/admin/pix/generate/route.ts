import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { generatePixBRCode, generatePixQRUrl, PixConfig } from "@/lib/pix";

/**
 * POST /api/admin/pix/generate
 * Body: { amount: 297.00, description?: "...", keyId?: "key_xxx" }
 *
 * If keyId is provided, uses that specific key.
 * Otherwise, uses the default key.
 *
 * For "brcode" type keys, the BR Code is already in the value — just add amount.
 */
export async function POST(req: NextRequest) {
  try {
    const { amount, description, keyId } = await req.json();
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Valid amount required" }, { status: 400 });
    }

    const supabase = getSupabaseServer();

    // Get PIX keys config
    const { data } = await (supabase.from("app_settings") as any)
      .select("value")
      .eq("key", "pix_keys")
      .maybeSingle();

    let keys = data?.value?.keys || [];
    let defaultKeyId = data?.value?.defaultKeyId;

    // Migrate from old config if no keys
    if (keys.length === 0) {
      const oldConfig = await (supabase.from("app_settings") as any)
        .select("value")
        .eq("key", "pix_config")
        .maybeSingle();

      if (oldConfig.data?.value?.pixKey) {
        keys = [{
          id: "migrated_1",
          label: "Chave principal",
          type: "phone",
          value: oldConfig.data.value.pixKey,
          merchantName: oldConfig.data.value.merchantName || "Clodoaldo Silva",
          merchantCity: oldConfig.data.value.merchantCity || "Recife",
        }];
        defaultKeyId = "migrated_1";
      }
    }

    if (keys.length === 0) {
      return NextResponse.json({ error: "Nenhuma chave PIX configurada. Acesse /admin/settings." }, { status: 400 });
    }

    // Find the key to use
    const pixKey = keys.find((k: any) => k.id === (keyId || defaultKeyId)) || keys[0];

    const amountFormatted = amount.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    let brCode: string;
    let qrUrl: string;

    if (pixKey.type === "brcode") {
      // BR Code completo — o valor JÁ é o BR Code
      // Para adicionar valor, precisaríamos reescrever o TLV, mas se já tem valor, usar direto
      brCode = pixKey.value;
      qrUrl = generatePixQRUrl(brCode);
    } else {
      // Chave simples — gerar BR Code com valor
      const config: PixConfig = {
        pixKey: pixKey.value,
        merchantName: pixKey.merchantName,
        merchantCity: pixKey.merchantCity,
      };
      brCode = generatePixBRCode({ config, amount, description });
      qrUrl = generatePixQRUrl(brCode);
    }

    const message = `💰 COBRANÇA PIX

Valor: ${amountFormatted}
Chave PIX: ${pixKey.type === "brcode" ? "PIX Copia e Cola" : pixKey.value}
${pixKey.label ? `Tipo: ${pixKey.label}` : ""}

📋 PIX Copia e Cola:
${brCode}

📱 Ou escaneie o QR Code:
${qrUrl}

Após o pagamento, me envia o comprovante aqui no WhatsApp! 🙌`;

    return NextResponse.json({
      brCode,
      qrUrl,
      amountFormatted,
      message,
      keyUsed: { id: pixKey.id, label: pixKey.label, type: pixKey.type },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
