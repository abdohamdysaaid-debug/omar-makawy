const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const featuresDir = path.join(__dirname, 'public', 'assets', 'features');

async function processImage(inputName, outputName) {
  const inputPath = path.join(featuresDir, inputName);
  const outputPath = path.join(featuresDir, outputName);

  if (!fs.existsSync(inputPath)) {
    console.error(`File not found: ${inputPath}`);
    return;
  }

  // Load image into raw buffer to manipulate black pixels
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixelData = Buffer.from(data);

  // Iterate over pixels (r, g, b, a)
  for (let i = 0; i < pixelData.length; i += 4) {
    const r = pixelData[i];
    const g = pixelData[i + 1];
    const b = pixelData[i + 2];

    // If black or near-black background (r, g, b <= 22)
    if (r <= 22 && g <= 22 && b <= 22) {
      pixelData[i + 3] = 0; // Set alpha to 0 (Transparent)
    }
  }

  // Save modified raw buffer as PNG
  await sharp(pixelData, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4
    }
  })
  .png({ quality: 100 })
  .toFile(outputPath);

  console.log(`Processed transparent cutout -> ${outputName}`);
}

async function main() {
  await processImage('feature-1.jpg', 'feature-1-cutout.png');
  await processImage('feature-2.jpg', 'feature-2-cutout.png');
  await processImage('feature-3.jpg', 'feature-3-cutout.png');
  await processImage('feature-4.png', 'feature-4-cutout.png');
}

main().catch(err => console.error(err));
