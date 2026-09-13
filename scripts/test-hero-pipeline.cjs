// Teste end-to-end: Gemini descreve → Pollinations gera → VLM analisa
const fs = require('fs');

const GEMINI_API_KEY = 'AQ.Ab8RN6LKoQ-8TMSFZJIX6wO0ul6Z-US6BmZe2PNL8VMNOr4GJw';

const nichos = ['barbearia', 'restaurante', 'academia', 'pizzaria', 'salao de beleza'];

async function describeNiche(nicho, cidade = 'Recife', style = 'modern') {
  const styleMap = {
    modern: 'moderno, clean, com toques de neon sutil, paleta dark com accent vibrante',
    elegant: 'elegante e sofisticado, paleta neutra com dourado, iluminação cinematográfica',
    vibrant: 'vibrante e energético, cores saturadas, feeling jovem e dinâmico',
    minimal: 'minimalista, muito espaço negativo, poucos elementos, tipografia bold',
  };
  const styleHint = styleMap[style];

  const describePrompt = `Você é um diretor de arte. Descreva em UMA frase (máximo 80 palavras) uma imagem hero profissional para um site do nicho "${nicho}"${cidade ? ` em ${cidade}` : ''}.

A descrição deve:
- Ser visualmente específica (não genérica)
- Incluir elementos reais do nicho (ex: barbearia → tesoura, cadeira, espelho; restaurante → prato, ingredientes, chef)
- Mencionar iluminação, ângulo e mood
- Estilo: ${styleHint}
- NÃO incluir texto na imagem (sem logo, sem palavra)
- NÃO mencionar pessoas reais ou marcas reais
- Ser otimizada pra ser usada como prompt num modelo text-to-image

Responda APENAS com a descrição visual (sem prefixo, sem explicações).`;

  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: describePrompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 300 },
      }),
    }
  );
  const data = await resp.json();
  return (data?.candidates?.[0]?.content?.parts?.[0]?.text || '').replace(/```/g, '').replace(/^["']|["']$/g, '').trim();
}

async function generateImage(prompt, width, height) {
  const fullPrompt = `${prompt}, professional photography, high quality, 4k, sharp focus, hero banner`;
  const encodedPrompt = encodeURIComponent(fullPrompt).slice(0, 1800);
  const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true&model=flux&seed=${Date.now() % 1000000}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);
  try {
    const r = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'ClodoaldoTest/1.0' },
    });
    clearTimeout(timeout);
    if (!r.ok) return { error: `HTTP ${r.status}` };
    const ab = await r.arrayBuffer();
    return { buffer: Buffer.from(ab), url };
  } catch (e) {
    clearTimeout(timeout);
    return { error: e.message };
  }
}

async function analyzeImage(imagePath, expectedNicho) {
  // Use z-ai CLI vision to describe what's in the image
  const { execSync } = require('child_process');
  try {
    const result = execSync(
      `z-ai vision -p "Analise esta imagem e responda APENAS com JSON: {\\\"elementos_visuais\\\": [lista do que você vê], \\\"tem_barbearia_elementos\\\": true/false, \\\"tem_restaurante_elementos\\\": true/false, \\\"tem_academia_elementos\\\": true/false, \\\"tem_pizzaria_elementos\\\": true/false, \\\"tem_salao_elementos\\\": true/false, \\\"nicho_detectado\\\": \\\"barbearia|restaurante|academia|pizzaria|salao|outro\\\", \\\"confianca\\\": 0-100}" -i "${imagePath}"`,
      { encoding: 'utf-8', timeout: 60000 }
    );
    // Extract JSON from CLI output
    const match = result.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    return { raw: result.slice(0, 500) };
  } catch (e) {
    return { error: e.message };
  }
}

async function main() {
  console.log('=== Teste end-to-end: Gemini describe → Pollinations generate → VLM analyze ===\n');

  for (const nicho of nichos) {
    console.log(`\n--- Nicho: ${nicho} ---`);

    // 1. Gemini describe
    const prompt = await describeNiche(nicho);
    console.log(`Prompt Gemini: ${prompt.slice(0, 200)}...`);

    // 2. Pollinations generate
    const img = await generateImage(prompt, 1024, 512);
    if (img.error) {
      console.log(`✗ Erro ao gerar imagem: ${img.error}`);
      continue;
    }
    const filepath = `/tmp/test_${nicho.replace(/\s+/g, '_')}.jpg`;
    fs.writeFileSync(filepath, img.buffer);
    console.log(`✓ Imagem salva: ${filepath} (${(img.buffer.length / 1024).toFixed(0)} KB)`);

    // 3. VLM analyze
    const analysis = await analyzeImage(filepath, nicho);
    console.log(`Análise VLM:`, JSON.stringify(analysis, null, 2));

    // Match check
    if (analysis.nicho_detectado) {
      const detected = analysis.nicho_detectado.toLowerCase();
      const expected = nicho.toLowerCase().replace(/\s+/g, '');
      const matches = detected.includes(expected) || expected.includes(detected);
      console.log(`\n>>> Esperado: "${nicho}" | Detectado: "${analysis.nicho_detectado}" | Confiança: ${analysis.confianca || 'N/A'}%`);
      console.log(`>>> MATCH: ${matches ? '✓ SIM' : '✗ NÃO'}`);
    }
  }
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
