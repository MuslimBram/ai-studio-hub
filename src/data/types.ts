export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  order: number;
  colorClass: string;
  bgColorClass: string;
}

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
}

export interface Tool {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  categoryId: string;
  subcategoryId: string;
  provider: string;
  modelType: string;
  imageUrl: string;
  badge?: 'new' | 'popular' | 'featured' | 'official';
  pricingType: 'free' | 'freemium' | 'paid' | 'enterprise';
  pricingText: string;
  isFeatured: boolean;
  isOfficial: boolean;
  isPopular: boolean;
  createdAt: string;
  features: string[];
  examples: { mediaUrl: string; mediaType: 'image' | 'video' }[];
  tags: string[];
  inputTypes: string[];
  outputTypes: string[];
  useCases: string[];
}
