const { build } = require('esbuild');
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const outdir = path.join(root, 'dist');

/**
 * Recursively copies files and directories
 * @param {string} src - Source path
 * @param {string} dest - Destination path
 */
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

/**
 * Validates the build output
 * @param {string} distPath - Path to dist directory
 */
function validateBuild(distPath) {
  const requiredFiles = [
    'manifest.json',
    'js/background.js',
    'js/popup.js',
    'js/options.js',
    'js/i18n.js',
    'html/popup.html',
    'html/options.html',
    'css/popup.css',
    'css/options.css',
    'css/variables.css',
    'css/base.css',
    'icons/icon128.png',
  ];

  const missingFiles = requiredFiles.filter((file) => !fs.existsSync(path.join(distPath, file)));

  if (missingFiles.length > 0) {
    // Missing required files
    process.exit(1);
  }

  // Build validation passed
}

/**
 * Generates build information
 * @param {boolean} isDev - Whether this is a development build
 */
function generateBuildInfo(isDev) {
  const buildInfo = {
    timestamp: new Date().toISOString(),
    version: require('../package.json').version,
    environment: isDev ? 'development' : 'production',
    nodeVersion: process.version,
  };

  fs.writeFileSync(path.join(outdir, 'build-info.json'), JSON.stringify(buildInfo, null, 2));
}

/**
 * Main build function
 * @param {boolean} dev - Whether this is a development build
 */
async function run(dev) {
  // Starting build process

  // Clean output directory
  if (fs.existsSync(outdir)) {
    fs.rmSync(outdir, { recursive: true, force: true });
  }
  fs.mkdirSync(outdir, { recursive: true });

  try {
    // Bundle all JS files under js/
    const jsDir = path.join(root, 'js');
    if (fs.existsSync(jsDir)) {
      const entries = fs.readdirSync(jsDir).filter((f) => f.endsWith('.js'));
      // Bundling JavaScript files

      for (const entry of entries) {
        const entryPath = path.join(jsDir, entry);
        // Processing file

        await build({
          entryPoints: [entryPath],
          bundle: true,
          minify: !dev,
          sourcemap: dev,
          outfile: path.join(outdir, 'js', entry),
          target: 'es2020',
          format: 'esm',
          platform: 'browser',
          external: [], // Bundle everything for Chrome extension
        });
      }
    }

    // Copy static assets
    // Copying static assets
    const staticPaths = [
      'html',
      'css',
      'icons',
      '_locales',
      'manifest.json',
      'LICENSE',
      'README.md',
    ];
    for (const p of staticPaths) {
      const src = path.join(root, p);
      const dest = path.join(outdir, p);
      if (fs.existsSync(src)) {
        copyRecursive(src, dest);
        // Copied file
      }
    }

    // Generate build info
    generateBuildInfo(dev);

    // Validate build
    validateBuild(outdir);

    // Build complete

    if (dev) {
      // Development build - source maps enabled, minification disabled
    } else {
      // Production build - minified and optimized
    }

  } catch (error) {
    // Build failed
    process.exit(1);
  }
}

const dev = process.argv.includes('--dev');
run(dev).catch((_err) => {
  process.exit(1);
});