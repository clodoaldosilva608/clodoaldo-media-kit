/**
 * Asaas SDK — integração simplificada para PIX automático.
 *
 * Flow:
 * 1. Criar cobrança PIX no Asaas → retorna QR Code + Copia e Cola
 * 2. Cliente paga → Asaas envia webhook pra /api/webhook-asaas
 * 3. Webhook confirma pagamento → atualiza order status = 'paid'
 * 4. Dispara email de confirmação + libera acesso
 *
 * Sandbox: https://sandbox.asaas.com
 * Produção: https://www.asaas.com
 *
 * Env vars necessárias:
 * - ASAAS_API_KEY (access token do Asaas)
 * - ASAAS_WEBHOOK_TOKEN (token do webhook no painel Asaas)
 *
 * Free tier: sem mensalidade, só cobra R$ 0,99 por PIX recebido
 * (descontado do valor — você recebe valor - R$ 0,99)
 */

const ASAAS_BASE = process.env.ASAAS_API_KEY
  ? (process.env.ASAAS_API_KEY.startsWith("$aact_") ? "https://api.asaas.com/v3" : "https://sandbox.asaas.com/v3")
  : "https://sandbox.asaas.com/v3";

export interface AsaasPayment {
  id: string;
  status: string;
  value: number;
  netValue: number;
  paymentLink?: string;
  payloadLink?: string;
  bankSlipUrl?: string;
  invoiceNumber?: string;
  pixQrCode?: string;
  pixCopyPaste?: string;
  dueDate: string;
  customer: string;
}

export interface AsaasCustomer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  cpfCnpj?: string;
}

/**
 * Cria ou busca um customer no Asaas
 */
export async function createCustomer(name: string, email: string, phone?: string, cpfCnpj?: string): Promise<AsaasCustomer | null> {
  const apiKey = process.env.ASAAS_API_KEY;
  if (!apiKey) return null;

  try {
    // Busca customer existente por email
    const searchResp = await fetch(`${ASAAS_BASE}/customers?email=${encodeURIComponent(email)}`, {
      headers: { "access_token": apiKey },
    });
    const searchData = await searchResp.json();
    if (searchData?.data?.length > 0) {
      const existing = searchData.data[0];
      // Se customer existe mas não tem CPF e nós temos CPF, atualiza
      if (cpfCnpj && !existing.cpfCnpj) {
        const updateResp = await fetch(`${ASAAS_BASE}/customers/${existing.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "access_token": apiKey },
          body: JSON.stringify({ name, email, phone: phone || existing.phone, cpfCnpj }),
        });
        const updated = await updateResp.json();
        return updated.id ? updated : existing;
      }
      return existing;
    }

    // Cria novo (CPF/CNPJ é obrigatório pra cobranças)
    const body: any = { name, email };
    if (phone) body.phone = phone;
    if (cpfCnpj) body.cpfCnpj = cpfCnpj;

    const resp = await fetch(`${ASAAS_BASE}/customers`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "access_token": apiKey },
      body: JSON.stringify(body),
    });
    const data = await resp.json();
    return data;
  } catch (e) {
    console.error("[asaas] createCustomer error:", e);
    return null;
  }
}

/**
 * Cria uma cobrança PIX no Asaas
 */
export async function createPixPayment(params: {
  customer_id: string;
  value: number;
  description: string;
  external_reference?: string;
}): Promise<AsaasPayment | null> {
  const apiKey = process.env.ASAAS_API_KEY;
  if (!apiKey) return null;

  try {
    const resp = await fetch(`${ASAAS_BASE}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "access_token": apiKey },
      body: JSON.stringify({
        customer: params.customer_id,
        billingType: "PIX",
        value: params.value,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        description: params.description,
        externalReference: params.external_reference,
      }),
    });
    const data = await resp.json();
    if (data.errors) {
      const errMsg = data.errors.map((e: any) => e.description).join("; ");
      console.error("[asaas] payment error:", errMsg);
      return { error: errMsg } as any;
    }

    // Asaas não retorna o QR code na criação — precisa chamar endpoint separado
    if (data.id) {
      try {
        const qrResp = await fetch(`${ASAAS_BASE}/payments/${data.id}/pixQrCode`, {
          headers: { "access_token": apiKey },
        });
        const qrData = await qrResp.json();
        if (qrData && !qrData.errors) {
          data.pixCopyPaste = qrData.payload || null;
          data.pixQrCode = qrData.encodedImage
            ? `data:image/png;base64,${qrData.encodedImage}`
            : null;
        }
      } catch (e) {
        console.warn("[asaas] pixQrCode fetch error:", e);
      }
    }

    return data;
  } catch (e) {
    console.error("[asaas] createPixPayment error:", e);
    return null;
  }
}

/**
 * Busca status de um pagamento
 */
export async function getPaymentStatus(paymentId: string): Promise<AsaasPayment | null> {
  const apiKey = process.env.ASAAS_API_KEY;
  if (!apiKey) return null;

  try {
    const resp = await fetch(`${ASAAS_BASE}/payments/${paymentId}`, {
      headers: { "access_token": apiKey },
    });
    const data = await resp.json();
    return data;
  } catch (e) {
    console.error("[asaas] getPaymentStatus error:", e);
    return null;
  }
}

/**
 * Verifica se o webhook token é válido (segurança)
 */
export function validateWebhookToken(token: string): boolean {
  const expected = process.env.ASAAS_WEBHOOK_TOKEN;
  if (!expected) return false;
  return token === expected;
}
