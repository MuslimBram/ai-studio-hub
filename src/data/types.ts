import type { Tables } from '@/integrations/supabase/types';

export type Category = Tables<'categories'> & {
  // Alias fields for backward compat with UI components
  colorClass: string;
  bgColorClass: string;
  order: number;
};

export type Subcategory = Tables<'subcategories'> & {
  categoryId: string;
};

export type Tool = Tables<'tools'> & {
  categoryId: string;
  subcategoryId: string;
  shortDescription: string;
  fullDescription: string;
  imageUrl: string;
  pricingType: string;
  pricingText: string;
  isFeatured: boolean;
  isOfficial: boolean;
  isPopular: boolean;
  modelType: string;
  inputTypes: string[];
  outputTypes: string[];
  useCases: string[];
};

// Map DB row to app-friendly shape
export function mapCategory(row: Tables<'categories'>): Category {
  return {
    ...row,
    colorClass: row.color_class,
    bgColorClass: row.bg_color_class,
    order: row.display_order,
  };
}

export function mapSubcategory(row: Tables<'subcategories'>): Subcategory {
  return {
    ...row,
    categoryId: row.category_id,
  };
}

export function mapTool(row: Tables<'tools'>): Tool {
  return {
    ...row,
    categoryId: row.category_id,
    subcategoryId: row.subcategory_id,
    shortDescription: row.short_description,
    fullDescription: row.full_description,
    imageUrl: row.image_url,
    pricingType: row.pricing_type,
    pricingText: row.pricing_text,
    isFeatured: row.is_featured,
    isOfficial: row.is_official,
    isPopular: row.is_popular,
    modelType: row.model_type,
    inputTypes: row.input_types,
    outputTypes: row.output_types,
    useCases: row.use_cases,
  };
}
