/**
 * Migration script: fixes existing phone numbers in clodoaldo_prospects
 * that are missing the "55" country code prefix.
 *
 * Run: node /home/z/my-project/scripts/fix-phone-numbers.js
 */
const { Client } = require('/home/z/my-project/node_modules/pg');

function normalizeBrazilianPhone(phone) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 0) return null;

  if (digits.startsWith("55")) {
    if (digits.length === 12 || digits.length === 13) return digits;
    if (digits.length === 10 || digits.length === 11) return "55" + digits;
    return digits;
  }

  if (digits.length === 10 || digits.length === 11) {
    return "55" + digits;
  }

  return digits;
}

(async () => {
  const client = new Client({
    connectionString: "postgresql://postgres.pjetmhsevohaqtqfbxrr:Silva88677488@aws-0-sa-east-1.pooler.supabase.com:6543/postgres"
  });
  await client.connect();

  // Get all prospects with phone or whatsapp
  const result = await client.query(
    "SELECT id, name, phone, whatsapp FROM clodoaldo_prospects WHERE phone IS NOT NULL OR whatsapp IS NOT NULL"
  );

  console.log(`Found ${result.rows.length} prospects with phone numbers`);

  let fixed = 0;
  let skipped = 0;
  let alreadyCorrect = 0;

  for (const row of result.rows) {
    const oldWhatsapp = row.whatsapp;
    const oldPhone = row.phone;

    const newWhatsapp = normalizeBrazilianPhone(oldWhatsapp) || normalizeBrazilianPhone(oldPhone);

    if (newWhatsapp === oldWhatsapp) {
      alreadyCorrect++;
      continue;
    }

    if (!newWhatsapp) {
      skipped++;
      continue;
    }

    await client.query(
      "UPDATE clodoaldo_prospects SET whatsapp = $1, updated_at = now() WHERE id = $2",
      [newWhatsapp, row.id]
    );
    fixed++;
    console.log(`  ✓ ${row.name}: "${oldWhatsapp}" → "${newWhatsapp}"`);
  }

  console.log(`\n=== Summary ===`);
  console.log(`Total: ${result.rows.length}`);
  console.log(`Fixed: ${fixed}`);
  console.log(`Already correct: ${alreadyCorrect}`);
  console.log(`Skipped (no valid number): ${skipped}`);

  await client.end();
})().catch(e => { console.error(e.message); process.exit(1); });
