// Generates public/sitemap.xml when run manually.
import { writeFileSync } from 'fs';
import { resolve } from 'path';

const BASE_URL = process.env.VITE_SITE_URL || 'https://ai.mso.pm';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

interface SitemapEntry {
  path: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: string;
}

async function fetchRows(table: string, select: string): Promise<any[]> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return [];
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${select}`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
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
      '  <url>',
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      '  </url>',
    ]
      .filter(Boolean)
      .join('\n')
  );
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
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
  for (const category of categories) {
    if (category.slug) {
      entries.push({ path: `/tools/${category.slug}`, changefreq: 'weekly', priority: '0.8' });
    }
  }

  const subcategories = await fetchRows('subcategories', 'slug,categories(slug)');
  for (const subcategory of subcategories) {
    const categorySlug = subcategory.categories?.slug;
    if (categorySlug && subcategory.slug) {
      entries.push({
        path: `/tools/${categorySlug}/${subcategory.slug}`,
        changefreq: 'weekly',
        priority: '0.7',
      });
    }
  }

  const tools = await fetchRows('tools', 'slug');
  for (const tool of tools) {
    if (tool.slug) {
      entries.push({ path: `/tool/${tool.slug}`, changefreq: 'weekly', priority: '0.7' });
    }
  }

  writeFileSync(resolve('public/sitemap.xml'), build(entries));
  console.log(`sitemap.xml written (${entries.length} entries)`);
})();
