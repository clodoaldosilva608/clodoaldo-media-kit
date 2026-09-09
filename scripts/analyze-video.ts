import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';

async function analyzeLocalVideo() {
  const zai = await ZAI.create();
  const videoPath = '/home/z/my-project/upload/9885c2861f20eb36eab2eb6494e06146.mp4';
  const videoBuffer = fs.readFileSync(videoPath);
  const base64Video = videoBuffer.toString('base64');
  const dataUrl = `data:video/mp4;base64,${base64Video}`;

  console.log(`Video size: ${(videoBuffer.length / 1024 / 1024).toFixed(2)} MB`);
  console.log('Sending to API...');

  const prompt = `Analise este vídeo em detalhes. O usuário quer implementar uma página de "aprovação de projetos/edições" para clientes. Descreva:

1. O que está sendo demonstrado na tela (interface, página, sistema)
2. Quais funcionalidades são apresentadas
3. O fluxo de interação do usuário
4. Textos visíveis em português (transcreva)
5. Botões e elementos de UI presentes
6. Se parece ser um sistema de aprovação de projetos/edições para clientes
7. Como o cliente solicita mudanças
8. Se há indicação de custo adicional para mudanças
9. Layout/estrutura visual da página

Seja MUITO detalhado sobre cada tela mostrada no vídeo.`;

  try {
    const response = await zai.chat.completions.createVision({
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'video_url', video_url: { url: dataUrl } }
          ]
        }
      ],
      thinking: { type: 'enabled' }
    });

    console.log('\n=== ANÁLISE DO VÍDEO ===\n');
    console.log(response.choices[0]?.message?.content);
    console.log('\n=== FIM ===\n');
  } catch (error: any) {
    console.error('Erro:', error.message);
    if (error.stack) console.error(error.stack);
  }
}

analyzeLocalVideo();
