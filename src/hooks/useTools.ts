import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { mapTool, type Tool } from '@/data/types';

export function useTools(opts?: {
  categoryId?: string;
  subcategoryId?: string;
  pricingType?: string;
  provider?: string;
  query?: string;
  featured?: boolean;
  popular?: boolean;
  official?: boolean;
  tags?: string[];
  limit?: number;
  orderByCreated?: boolean;
}) {
  return useQuery({
    queryKey: ['tools', opts],
    queryFn: async (): Promise<Tool[]> => {
      let q = supabase.from('tools').select('*');
      
      if (opts?.categoryId) q = q.eq('category_id', opts.categoryId);
      if (opts?.subcategoryId) q = q.eq('subcategory_id', opts.subcategoryId);
      if (opts?.pricingType) q = q.eq('pricing_type', opts.pricingType);
      if (opts?.provider) q = q.eq('provider', opts.provider);
      if (opts?.featured) q = q.eq('is_featured', true);
      if (opts?.popular) q = q.eq('is_popular', true);
      if (opts?.official) q = q.eq('is_official', true);
      if (opts?.tags?.length) {
        q = q.contains('tags', opts.tags);
      }
      if (opts?.query) {
        const search = `%${opts.query}%`;
        q = q.or(`title.ilike.${search},short_description.ilike.${search},provider.ilike.${search},tags.cs.{${opts.query.toLowerCase()}}`);
      }
      if (opts?.orderByCreated) q = q.order('created_at', { ascending: false });
      if (opts?.limit) q = q.limit(opts.limit);
      
      const { data, error } = await q;
      if (error) throw error;
      return (data || []).map(mapTool);
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useToolBySlug(slug: string) {
  return useQuery({
    queryKey: ['tool', slug],
    queryFn: async (): Promise<Tool | null> => {
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      if (error) throw error;
      return data ? mapTool(data) : null;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSearchTools(query: string) {
  return useQuery({
    queryKey: ['search-tools', query],
    queryFn: async (): Promise<Tool[]> => {
      if (query.length < 2) return [];
      const search = `%${query}%`;
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .or(`title.ilike.${search},short_description.ilike.${search},provider.ilike.${search},tags.cs.{${query.toLowerCase()}}`);
      if (error) throw error;
      return (data || []).map(mapTool);
    },
    enabled: query.length >= 2,
    staleTime: 30 * 1000,
  });
}

export function useProviders() {
  return useQuery({
    queryKey: ['providers'],
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from('tools')
        .select('provider');
      if (error) throw error;
      const unique = [...new Set((data || []).map(d => d.provider).filter(Boolean))].sort();
      return unique;
    },
    staleTime: 5 * 60 * 1000,
  });
}
