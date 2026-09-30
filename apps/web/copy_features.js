const fs = require('fs');
const path = require('path');

const srcFiles = [
  'C:/Users/ABDELRHMAN/.gemini/antigravity/brain/513a68dc-9854-4bd5-a954-bb3f0d45b15b/.user_uploaded/media_1790797302749.jpg',
  'C:/Users/ABDELRHMAN/.gemini/antigravity/brain/513a68dc-9854-4bd5-a954-bb3f0d45b15b/.user_uploaded/media_1790797305078.jpg',
  'C:/Users/ABDELRHMAN/.gemini/antigravity/brain/513a68dc-9854-4bd5-a954-bb3f0d45b15b/.user_uploaded/media_1790797305562.jpg',
  'C:/Users/ABDELRHMAN/.gemini/antigravity/brain/513a68dc-9854-4bd5-a954-bb3f0d45b15b/.user_uploaded/media_1790797308578.png'
];

const destDir = path.join(__dirname, 'public', 'assets', 'features');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

srcFiles.forEach((src, idx) => {
  const ext = path.extname(src);
  const destName = `feature-${idx + 1}${ext}`;
  const destPath = path.join(destDir, destName);
  fs.copyFileSync(src, destPath);
  console.log(`Copied ${destName}`);
});
