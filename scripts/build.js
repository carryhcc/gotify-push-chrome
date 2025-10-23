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

  // bundle all js files under js/
  const jsDir = path.join(root, 'js');
  if (fs.existsSync(jsDir)) {
    const entries = fs.readdirSync(jsDir).filter((f) => f.endsWith('.js'));
    for (const entry of entries) {
      const entryPath = path.join(jsDir, entry);
      await build({
        entryPoints: [entryPath],
        bundle: true,
        minify: !dev,
        sourcemap: dev,
        outfile: path.join(outdir, 'js', entry),
      });
    }
  }

  // Copy static assets
  const staticPaths = ['html', 'css', 'icons', '_locales', 'manifest.json', 'LICENSE', 'README.md'];
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
