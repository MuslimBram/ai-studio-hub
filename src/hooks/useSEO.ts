import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  jsonLd?: Record<string, any> | Record<string, any>[];
}

const BASE_TITLE = 'AI Tools Hub';
const SITE_URL = 'https://hubinai.lovable.app';

function upsertMeta(selector: string, attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function useSEO({ title, description, canonical, jsonLd }: SEOProps = {}) {
  const location = useLocation();

  useEffect(() => {
    const fullTitle = title ? `${title} — ${BASE_TITLE}` : `${BASE_TITLE} — Zbulo Mjetet Më të Mira AI`;
    document.title = fullTitle;

    const path = canonical && canonical.startsWith('http')
      ? canonical
      : `${SITE_URL}${canonical ?? location.pathname}`;

    if (description) {
      upsertMeta('meta[name="description"]', 'name', 'description', description);
      upsertMeta('meta[property="og:description"]', 'property', 'og:description', description);
      upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    }

    upsertMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
    upsertMeta('meta[property="og:url"]', 'property', 'og:url', path);

    let canonicalEl = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.rel = 'canonical';
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.href = path;

    // Per-route JSON-LD
    const tagId = 'route-jsonld';
    const existing = document.getElementById(tagId);
    if (existing) existing.remove();
    if (jsonLd) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = tagId;
      script.text = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }
  }, [title, description, canonical, location.pathname, JSON.stringify(jsonLd ?? null)]);
}
