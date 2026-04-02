import { categories, subcategories } from './categories';
import { tools } from './tools';
import { Category, Subcategory, Tool } from './types';

export function getAllCategories(): Category[] {
  return categories.sort((a, b) => a.order - b.order);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getSubcategoriesByCategoryId(categoryId: string): Subcategory[] {
  return subcategories.filter((s) => s.categoryId === categoryId);
}

export function getSubcategoryBySlug(categorySlug: string, subSlug: string): Subcategory | undefined {
  const cat = getCategoryBySlug(categorySlug);
  if (!cat) return undefined;
  return subcategories.find((s) => s.categoryId === cat.id && s.slug === subSlug);
}

export function getToolsByCategory(categoryId: string): Tool[] {
  return tools.filter((t) => t.categoryId === categoryId);
}

export function getToolsBySubcategory(subcategoryId: string): Tool[] {
  return tools.filter((t) => t.subcategoryId === subcategoryId);
}

export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}

export function getFeaturedTools(): Tool[] {
  return tools.filter((t) => t.isFeatured);
}

export function getPopularTools(): Tool[] {
  return tools.filter((t) => t.isPopular);
}

export function getOfficialTools(): Tool[] {
  return tools.filter((t) => t.isOfficial);
}

export function getNewTools(): Tool[] {
  return [...tools].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8);
}

export function searchTools(query: string): Tool[] {
  const q = query.toLowerCase();
  return tools.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.shortDescription.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
      t.provider.toLowerCase().includes(q)
  );
}

export function filterTools(opts: {
  categoryId?: string;
  subcategoryId?: string;
  pricingType?: string;
  provider?: string;
  query?: string;
}): Tool[] {
  let result = [...tools];
  if (opts.categoryId) result = result.filter((t) => t.categoryId === opts.categoryId);
  if (opts.subcategoryId) result = result.filter((t) => t.subcategoryId === opts.subcategoryId);
  if (opts.pricingType) result = result.filter((t) => t.pricingType === opts.pricingType);
  if (opts.provider) result = result.filter((t) => t.provider === opts.provider);
  if (opts.query) {
    const q = opts.query.toLowerCase();
    result = result.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.shortDescription.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }
  return result;
}

export function getAllProviders(): string[] {
  return [...new Set(tools.map((t) => t.provider))].sort();
}

export function getAllTags(): string[] {
  return [...new Set(tools.flatMap((t) => t.tags))].sort();
}
