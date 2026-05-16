// Runs before `vite dev` and `vite build`; writes public/sitemap.xml.
import { writeFileSync } from 'fs';
import { resolve } from 'path';

const BASE_URL = 'https://hubinai.lovable.app';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://qmzwiydiszucoasepjgo.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtendpeWRpc3p1Y29hc2VwamdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMjUyNDYsImV4cCI6MjA5MDcwMTI0Nn0.wyhKp1C2WUBuaKGTsVMEx4XZvVgi0xh2RCmeddkzXzc';

interface SitemapEntry {
  path: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: string;
}

async function fetchRows(table: string, select: string): Promise<any[]> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${select}`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

function build(entries: SitemapEntry[]) {
  const urls = entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join('\n')
  );
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join('\n');
}

(async () => {
  const entries: SitemapEntry[] = [
    { path: '/', changefreq: 'weekly', priority: '1.0' },
    { path: '/ai-tools', changefreq: 'weekly', priority: '0.9' },
    { path: '/donate', changefreq: 'monthly', priority: '0.5' },
    { path: '/login', changefreq: 'yearly', priority: '0.3' },
    { path: '/signup', changefreq: 'yearly', priority: '0.3' },
  ];

  const categories = await fetchRows('categories', 'slug');
  for (const c of categories) {
    if (c.slug) entries.push({ path: `/tools/${c.slug}`, changefreq: 'weekly', priority: '0.8' });
  }

  const subcats = await fetchRows('subcategories', 'slug,category_id');
  const catById = new Map(categories.map((c: any) => [c.id ?? c.slug, c.slug]));
  // subcategories table likely stores category_id as slug or uuid; try fetch with relation
  const subWithCat = await fetchRows('subcategories', 'slug,categories(slug)');
  for (const s of subWithCat) {
    const catSlug = s.categories?.slug;
    if (catSlug && s.slug) entries.push({ path: `/tools/${catSlug}/${s.slug}`, changefreq: 'weekly', priority: '0.7' });
  }

  const tools = await fetchRows('tools', 'slug');
  for (const t of tools) {
    if (t.slug) entries.push({ path: `/tool/${t.slug}`, changefreq: 'weekly', priority: '0.7' });
  }

  writeFileSync(resolve('public/sitemap.xml'), build(entries));
  console.log(`sitemap.xml written (${entries.length} entries)`);
})();
