const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://evavanhh.fr';
const DIR = __dirname;

const EXCLUDE_DIRS = ['.git', '.claude', 'node_modules'];

const PRIORITIES = {
  'index.html': { priority: '1.0', changefreq: 'monthly' },
  'lettre.html': { priority: '0.7', changefreq: 'yearly' },
};
const DEFAULT = { priority: '0.7', changefreq: 'yearly' };

function getLastMod(filePath) {
  return fs.statSync(filePath).mtime.toISOString().split('T')[0];
}

function buildUrl(filePath) {
  const rel = path.relative(DIR, filePath).replace(/\\/g, '/');
  const isIndex = path.basename(rel) === 'index.html';
  const slug = isIndex ? path.dirname(rel).replace(/^\.$/, '') : rel;
  const loc = slug ? `${BASE_URL}/${slug}/`.replace(/\/+$/, '/') : `${BASE_URL}/`;
  const { priority, changefreq } = PRIORITIES[path.basename(rel)] ?? DEFAULT;
  const lastmod = getLastMod(filePath);
  return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

function collectHtml(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!EXCLUDE_DIRS.includes(entry.name)) collectHtml(path.join(dir, entry.name), files);
    } else if (entry.name.endsWith('.html')) {
      files.push(path.join(dir, entry.name));
    }
  }
  return files;
}

const htmlFiles = collectHtml(DIR).sort((a, b) => {
  const aRel = path.relative(DIR, a);
  const bRel = path.relative(DIR, b);
  if (aRel === 'index.html') return -1;
  if (bRel === 'index.html') return 1;
  return aRel.localeCompare(bRel);
});

const urls = htmlFiles.map(buildUrl).join('\n');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

fs.writeFileSync(path.join(DIR, 'sitemap.xml'), sitemap, 'utf-8');
console.log(`Sitemap généré avec ${htmlFiles.length} page(s) :`);
htmlFiles.forEach(f => console.log(`  - ${path.relative(DIR, f)}`));
