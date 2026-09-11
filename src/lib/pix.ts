/**
 * PIX payment utilities — generates BR Code (PIX Copia e Cola) and QR Code.
 *
 * Supports:
 * - Static PIX (key only)
 * - Static PIX with amount
 * - QR Code rendering via api.qrserver.com
 */

export interface PixConfig {
  pixKey: string;          // CPF, email, phone, or random key
  merchantName: string;    // Name (max 25 chars)
  merchantCity: string;    // City (max 15 chars)
}

export interface PixPayment {
  config: PixConfig;
  amount: number;          // BRL amount (e.g., 297.00)
  description?: string;    // Optional description
}

/**
 * Generates BR Code (PIX Copia e Cola string) following Banco Central do Brasil specification.
 */
export function generatePixBRCode(payment: PixPayment): string {
  const { config, amount, description } = payment;

  // Helper: TLV encoding
  function tlv(id: string, value: string): string {
    const len = value.length.toString().padStart(2, "0");
    return `${id}${len}${value}`;
  }

  // Merchant account info
  // Use PIX key as-is — banks register keys in different formats
  // Nubank: phone without 55 (81971133707)
  // Some banks: with 55 (5581971133707)
  // User should register the key exactly as shown in their bank app
  const pixKey = config.pixKey;

  const gui = tlv("00", "br.gov.bcb.pix");
  const key = tlv("01", pixKey);
  let merchantAccount = gui + key;
  if (description) {
    // PIX spec: field 02 in merchant account = transaction description
    merchantAccount += tlv("02", description.slice(0, 50));
  }
  const merchantAccountTLV = tlv("26", merchantAccount);

  // Additional data
  const additionalData = tlv("62", tlv("05", "clodoaldo"));

  // Amount
  const amountStr = amount > 0 ? tlv("54", amount.toFixed(2)) : "";

  // Build payload
  const payload =
    tlv("00", "01") +              // Payload format
    tlv("01", amount > 0 ? "12" : "11") +  // Dynamic (12) or static (11)
    merchantAccountTLV +
    tlv("52", "0000") +            // Merchant category
    tlv("53", "986") +            // Currency BRL
    amountStr +
    tlv("58", "BR") +             // Country
    tlv("59", config.merchantName.slice(0, 25)) +
    tlv("60", config.merchantCity.slice(0, 15).toUpperCase().replace(/[^A-Z ]/g, "")) +
    additionalData +
    "6304";                        // CRC placeholder

  // Calculate CRC16
  const crc = crc16(payload);
  return payload + crc;
}

/**
 * CRC16-CCITT (0x1021) — required by PIX specification.
 */
function crc16(payload: string): string {
  let crc = 0xFFFF;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
      crc &= 0xFFFF;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/**
 * Generates QR Code URL for the PIX BR Code.
 */
export function generatePixQRUrl(brCode: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=400x400&bgcolor=ffffff&color=000000&data=${encodeURIComponent(brCode)}`;
}

/**
 * Builds a WhatsApp-ready message with PIX payment info.
 */
export function buildPixMessage(payment: PixPayment): { brCode: string; qrUrl: string; amountFormatted: string; message: string } {
  const brCode = generatePixBRCode(payment);
  const qrUrl = generatePixQRUrl(brCode);
  const amountFormatted = payment.amount.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return {
    brCode,
    qrUrl,
    amountFormatted,
    message: `💰 COBRANÇA PIX

Valor: ${amountFormatted}
Chave PIX: ${payment.config.pixKey}

📋 PIX Copia e Cola:
${brCode}

📱 Ou escaneie o QR Code:
${qrUrl}

Após o pagamento, me envia o comprovante aqui no WhatsApp! 🙌`,
  };
}
