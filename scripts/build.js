const { build } = require('esbuild');
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const outdir = path.join(root, 'dist');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const f of fs.readdirSync(src)) copyRecursive(path.join(src, f), path.join(dest, f));
  } else {
    fs.copyFileSync(src, dest);
  }
}

async function run(dev) {
  if (fs.existsSync(outdir)) {
    fs.rmSync(outdir, { recursive: true, force: true });
  }
  fs.mkdirSync(outdir, { recursive: true });

  const entryPoints = [];
  // bundle all js files under js/
  const jsDir = path.join(root, 'js');
  if (fs.existsSync(jsDir)) {
    const entries = fs.readdirSync(jsDir).filter((f) => f.endsWith('.js'));
    for (const entry of entries) {
      entryPoints.push(path.join(jsDir, entry));
    }
  }
  // bundle all css files under css/
  const cssDir = path.join(root, 'css');
  if (fs.existsSync(cssDir)) {
    const entries = fs.readdirSync(cssDir).filter((f) => f.endsWith('.css'));
    for (const entry of entries) {
      entryPoints.push(path.join(cssDir, entry));
    }
  }

  await build({
    entryPoints: entryPoints,
    bundle: true,
    minify: !dev,
    sourcemap: dev,
    outdir: outdir,
    splitting: true,
    format: 'esm'
  });

  // Copy static assets
  const staticPaths = ['html', 'icons', '_locales', 'manifest.json', 'LICENSE', 'README.md'];
  for (const p of staticPaths) {
    const src = path.join(root, p);
    const dest = path.join(outdir, p);
    copyRecursive(src, dest);
  }

  console.log('Build complete ->', outdir);
}

const dev = process.argv.includes('--dev');
run(dev).catch((err) => {
  console.error(err);
  process.exit(1);
});
