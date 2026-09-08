#!/usr/bin/env bash
# Screenshot + convert 14 empty app covers + 3 empty premium covers
set -e

OUT=/home/z/my-project/download/_app_screenshots
mkdir -p "$OUT"

# 14 regular apps (slug|url)
apps=(
  "app-calc-trabalhista|https://rescisaotrabalhista.lovable.app/"
  "app-catholic-hub|https://versiculododiaa.lovable.app/"
  "app-dinoworld|https://dinossauroplay.lovable.app/"
  "app-doculens|https://docseguro.lovable.app/"
  "app-ego-drop|https://inner-self-lens.lovable.app/"
  "app-farmaapp|https://farmaapp.lovable.app/"
  "app-feedlytics|https://feedlyticss.lovable.app/"
  "app-freelance-free|https://freelancee.lovable.app/"
  "app-lifesynth|https://life-story-synth.lovable.app/"
  "app-soulmap|https://inner-world-atlas.lovable.app/"
  "app-storyverse-kids|https://storyverse-kids-hero.lovable.app/"
  "app-strategy-game-lab|https://logic-arena-lab.lovable.app/"
  "app-timecapsule|https://memory-keepers-engine.lovable.app/"
  "app-voicepaper|https://voice-brain-organizer.lovable.app/"
)

# 3 premium covers (filename|url)
premiums=(
  "capa-ai-self-sync|https://ai-self-sync.lovable.app/"
  "capa-amor-financas|https://amorefinancas.lovable.app/"
  "capa-centro-sobrevivencia|https://centrodesobrevivencia.lovable.app/"
)

agent-browser set viewport 1280 720 2>&1 | tail -1

i=0
total=$((${#apps[@]} + ${#premiums[@]}))

for entry in "${apps[@]}"; do
  IFS='|' read -r filename url <<< "$entry"
  i=$((i+1))
  echo "[$i/$total] $filename"
  agent-browser open "$url" 2>&1 | tail -1
  agent-browser wait 4000 2>&1 | tail -1
  agent-browser screenshot "$OUT/$filename.png" 2>&1 | tail -1
done

for entry in "${premiums[@]}"; do
  IFS='|' read -r filename url <<< "$entry"
  i=$((i+1))
  echo "[$i/$total] $filename (premium)"
  agent-browser open "$url" 2>&1 | tail -1
  agent-browser wait 5000 2>&1 | tail -1
  agent-browser screenshot "$OUT/$filename.png" 2>&1 | tail -1
done

echo ""
echo "=== Converting to optimized JPG/PNG ==="
cd /home/z/my-project
node -e "
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const SRC = '$OUT';
const DST_APPS = 'public/assets/apps';
const DST_PREMIUM = 'public/assets/apps/premium';

const targets = [
  ['app-calc-trabalhista.png', 'app-calc-trabalhista.jpg', DST_APPS, 640, 360, 'jpg'],
  ['app-catholic-hub.png', 'app-catholic-hub.jpg', DST_APPS, 640, 360, 'jpg'],
  ['app-dinoworld.png', 'app-dinoworld.jpg', DST_APPS, 640, 360, 'jpg'],
  ['app-doculens.png', 'app-doculens.jpg', DST_APPS, 640, 360, 'jpg'],
  ['app-ego-drop.png', 'app-ego-drop.jpg', DST_APPS, 640, 360, 'jpg'],
  ['app-farmaapp.png', 'app-farmaapp.jpg', DST_APPS, 640, 360, 'jpg'],
  ['app-feedlytics.png', 'app-feedlytics.jpg', DST_APPS, 640, 360, 'jpg'],
  ['app-freelance-free.png', 'app-freelance-free.jpg', DST_APPS, 640, 360, 'jpg'],
  ['app-lifesynth.png', 'app-lifesynth.jpg', DST_APPS, 640, 360, 'jpg'],
  ['app-soulmap.png', 'app-soulmap.jpg', DST_APPS, 640, 360, 'jpg'],
  ['app-storyverse-kids.png', 'app-storyverse-kids.jpg', DST_APPS, 640, 360, 'jpg'],
  ['app-strategy-game-lab.png', 'app-strategy-game-lab.jpg', DST_APPS, 640, 360, 'jpg'],
  ['app-timecapsule.png', 'app-timecapsule.jpg', DST_APPS, 640, 360, 'jpg'],
  ['app-voicepaper.png', 'app-voicepaper.jpg', DST_APPS, 640, 360, 'jpg'],
  ['capa-ai-self-sync.png', 'capa-ai-self-sync.png', DST_PREMIUM, 800, 450, 'png'],
  ['capa-amor-financas.png', 'capa-amor-financas.png', DST_PREMIUM, 800, 450, 'png'],
  ['capa-centro-sobrevivencia.png', 'capa-centro-sobrevivencia.png', DST_PREMIUM, 800, 450, 'png'],
];

(async () => {
  let ok = 0, fail = 0;
  for (const [src, dst, dir, w, h, fmt] of targets) {
    const srcPath = path.join(SRC, src);
    const dstPath = path.join(dir, dst);
    try {
      const stats = fs.statSync(srcPath);
      if (stats.size === 0) throw new Error('source empty');
      if (fmt === 'jpg') {
        await sharp(srcPath).resize(w, h, { fit: 'cover', position: 'top' }).jpeg({ quality: 85, progressive: true }).toFile(dstPath);
      } else {
        await sharp(srcPath).resize(w, h, { fit: 'cover', position: 'top' }).png({ quality: 85, compressionLevel: 9 }).toFile(dstPath);
      }
      const s = fs.statSync(dstPath);
      console.log('✓ ' + dst + ' (' + (s.size/1024).toFixed(1) + ' KB)');
      ok++;
    } catch (e) {
      console.error('✗ ' + src + ': ' + e.message);
      fail++;
    }
  }
  console.log('\n' + ok + ' OK, ' + fail + ' failed');
})();
"

echo ""
echo "=== Verify no more empty files ==="
find /home/z/my-project/public/assets/apps -size 0 | wc -l
echo " empty files remaining"
