import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { mapCategory, mapSubcategory, type Category, type Subcategory } from '@/data/types';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order');
      if (error) throw error;
      return (data || []).map(mapCategory);
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCategoryBySlug(slug: string) {
  return useQuery({
    queryKey: ['category', slug],
    queryFn: async (): Promise<Category | null> => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      if (error) throw error;
      return data ? mapCategory(data) : null;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSubcategories(categoryId?: string) {
  return useQuery({
    queryKey: ['subcategories', categoryId],
    queryFn: async (): Promise<Subcategory[]> => {
      let query = supabase.from('subcategories').select('*');
      if (categoryId) query = query.eq('category_id', categoryId);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(mapSubcategory);
    },
    enabled: categoryId === undefined || !!categoryId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSubcategoryBySlug(categorySlug: string, subSlug: string) {
  const { data: category } = useCategoryBySlug(categorySlug);
  
  return useQuery({
    queryKey: ['subcategory', categorySlug, subSlug],
    queryFn: async (): Promise<Subcategory | null> => {
      const { data, error } = await supabase
        .from('subcategories')
        .select('*')
        .eq('category_id', category!.id)
        .eq('slug', subSlug)
        .maybeSingle();
      if (error) throw error;
      return data ? mapSubcategory(data) : null;
    },
    enabled: !!category && !!subSlug,
    staleTime: 5 * 60 * 1000,
  });
}
