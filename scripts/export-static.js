const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const outDir = path.join(rootDir, 'out');
const nextDir = path.join(rootDir, '.next');
const staticDir = path.join(nextDir, 'static');
const publicDir = path.join(rootDir, 'public');

// 1. Ensure outDir exists
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 2. Add .nojekyll so GitHub Pages serves _next directory assets
fs.writeFileSync(path.join(outDir, '.nojekyll'), '');
console.log('✓ Created .nojekyll in out/');

// 3. Ensure _next/static is copied to out/_next/static
const outStaticDir = path.join(outDir, '_next', 'static');
if (fs.existsSync(staticDir)) {
  fs.mkdirSync(outStaticDir, { recursive: true });
  fs.cpSync(staticDir, outStaticDir, { recursive: true });
  console.log('✓ Copied .next/static to out/_next/static');
}

// 4. Ensure public files (images, favicon, etc.) are copied to out/
if (fs.existsSync(publicDir)) {
  fs.cpSync(publicDir, outDir, { recursive: true });
  console.log('✓ Copied public/ to out/');
}

// 5. Look for any HTML files generated in .next/server/app or .next/export
const candidateDirs = [
  path.join(nextDir, 'export'),
  path.join(nextDir, 'server', 'app'),
  path.join(nextDir, 'server', 'pages'),
];

function copyHtmlFiles(srcDir, base = '') {
  if (!fs.existsSync(srcDir)) return;
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(srcDir, entry.name);
    const relPath = path.join(base, entry.name);
    if (entry.isDirectory()) {
      copyHtmlFiles(fullPath, relPath);
    } else if (entry.name.endsWith('.html') || entry.name.endsWith('.rsc') || entry.name.endsWith('.txt')) {
      // Determine destination in outDir
      let targetPath;
      if (entry.name === 'index.html' || entry.name === '404.html' || entry.name === '500.html') {
        targetPath = path.join(outDir, relPath);
      } else if (entry.name.endsWith('.html')) {
        const routeName = relPath.replace(/\.html$/, '');
        if (routeName === 'page') {
          targetPath = path.join(outDir, 'index.html');
        } else if (routeName.endsWith('\\page') || routeName.endsWith('/page')) {
          const cleanRoute = routeName.replace(/[\\/]page$/, '');
          targetPath = path.join(outDir, cleanRoute, 'index.html');
        } else {
          targetPath = path.join(outDir, routeName, 'index.html');
        }
      } else {
        targetPath = path.join(outDir, relPath);
      }

      const targetDir = path.dirname(targetPath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      fs.copyFileSync(fullPath, targetPath);
    }
  }
}

for (const dir of candidateDirs) {
  copyHtmlFiles(dir);
}

// 6. If out/index.html doesn't exist yet, check out/404.html or fallback
if (!fs.existsSync(path.join(outDir, 'index.html')) && fs.existsSync(path.join(outDir, '404.html'))) {
  fs.copyFileSync(path.join(outDir, '404.html'), path.join(outDir, 'index.html'));
  console.log('✓ Used fallback for out/index.html');
}

console.log('✓ Static export preparation complete.');
