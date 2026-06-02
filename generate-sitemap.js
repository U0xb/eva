const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://evavanhh.fr';
const DIR = __dirname;

// Pages à exclure (ex: pages privées)
const EXCLUDE = [];

// Priorités personnalisées par page
const PRIORITIES = {
  'index.html': { priority: '1.0', changefreq: 'monthly' },
  'lettre.html': { priority: '0.8', changefreq: 'yearly' },
};
const DEFAULT = { priority: '0.7', changefreq: 'yearly' };

function getLastMod(filePath) {
  const stat = fs.statSync(filePath);
  return stat.mtime.toISOString().split('T')[0];
}

function buildUrl(file) {
  const slug = file === 'index.html' ? '' : file;
  const loc = slug ? `${BASE_URL}/${slug}` : `${BASE_URL}/`;
  const { priority, changefreq } = PRIORITIES[file] ?? DEFAULT;
  const lastmod = getLastMod(path.join(DIR, file));
  return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

const htmlFiles = fs.readdirSync(DIR)
  .filter(f => f.endsWith('.html') && !EXCLUDE.includes(f))
  .sort((a, b) => {
    // index.html en premier
    if (a === 'index.html') return -1;
    if (b === 'index.html') return 1;
    return a.localeCompare(b);
  });

const urls = htmlFiles.map(buildUrl).join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

fs.writeFileSync(path.join(DIR, 'sitemap.xml'), sitemap, 'utf-8');
console.log(`Sitemap généré avec ${htmlFiles.length} page(s) :`);
htmlFiles.forEach(f => console.log(`  - ${f}`));
