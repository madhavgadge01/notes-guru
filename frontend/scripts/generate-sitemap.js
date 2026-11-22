import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAllIgnouRoutes } from '../src/data/ignouData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://genznotes.in';

const staticRoutes = [
  {
    path: '/',
    priority: '1.0',
    changefreq: 'daily',
  },
  {
    path: '/ignou/',
    priority: '0.95',
    changefreq: 'weekly',
  },
  {
    path: '/available-subjects',
    priority: '0.7',
    changefreq: 'weekly',
  },
  {
    path: '/explore',
    priority: '0.7',
    changefreq: 'weekly',
  },
];

const generateSitemap = () => {
  const ignouRoutes = getAllIgnouRoutes();

  // Combine unique routes
  const combinedMap = new Map();

  for (const r of staticRoutes) {
    combinedMap.set(r.path, r);
  }

  for (const r of ignouRoutes) {
    if (!combinedMap.has(r.path)) {
      combinedMap.set(r.path, r);
    }
  }

  const allRoutes = Array.from(combinedMap.values());
  const today = new Date().toISOString().split('T')[0];

  const xmlEntries = allRoutes
    .map((route) => {
      const loc = `${BASE_URL}${route.path.startsWith('/') ? route.path : `/${route.path}`}`;
      return `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq || 'weekly'}</changefreq>
    <priority>${route.priority || '0.7'}</priority>
  </url>`;
    })
    .join('\n');

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlEntries}
</urlset>
`;

  // Write to public/sitemap.xml
  const publicDir = path.resolve(__dirname, '../public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  const publicPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(publicPath, sitemapXml, 'utf-8');
  console.log(`[Sitemap] Generated public/sitemap.xml with ${allRoutes.length} URLs`);

  // If dist exists, also copy to dist/sitemap.xml
  const distDir = path.resolve(__dirname, '../dist');
  if (fs.existsSync(distDir)) {
    const distPath = path.join(distDir, 'sitemap.xml');
    fs.writeFileSync(distPath, sitemapXml, 'utf-8');
    console.log(`[Sitemap] Copied to dist/sitemap.xml`);
  }
};

generateSitemap();
