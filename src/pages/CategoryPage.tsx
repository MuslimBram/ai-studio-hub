import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SearchBar } from '@/components/SearchBar';
import { FilterSidebar } from '@/components/FilterSidebar';
import { ToolCard } from '@/components/ToolCard';
import { useCategoryBySlug, useSubcategories } from '@/hooks/useCategories';
import { useTools } from '@/hooks/useTools';
import { categoryIcons } from '@/data/icons';
import { ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useSEO } from '@/hooks/useSEO';

export default function CategoryPage() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const { data: category, isLoading: catLoading } = useCategoryBySlug(categorySlug || '');
  const { data: subcategories = [] } = useSubcategories(category?.id);

  const [query, setQuery] = useState('');
  const [pricing, setPricing] = useState('');
  const [provider, setProvider] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  const { data: filteredTools = [], isLoading: toolsLoading } = useTools({
    categoryId: category?.id,
    pricingType: pricing || undefined,
    provider: provider || undefined,
    query: query || undefined,
    tags: selectedTags.length ? selectedTags : undefined,
  });

  useSEO({
    title: category?.name,
    description: category?.description || undefined,
  });

  if (catLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-6 w-96" />
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground">Kategoria nuk u gjet</h1>
          <Link to="/" className="mt-4 text-primary hover:underline">Kthehu në kryefaqje</Link>
        </div>
      </div>
    );
  }

  const Icon = categoryIcons[category.icon];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="container pt-6">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">Kryefaqja</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">{category.name}</span>
        </nav>
      </div>

      <div className="container py-8">
        <div className="flex items-center gap-4 mb-4">
          <div className={`inline-flex items-center justify-center rounded-lg p-3 ${category.bgColorClass}`}>
            {Icon && <Icon className={`h-6 w-6 ${category.colorClass}`} />}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{category.name}</h1>
            <p className="text-muted-foreground">{category.description}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {subcategories.map((sub) => (
            <Link
              key={sub.id}
              to={`/tools/${category.slug}/${sub.slug}`}
              className="rounded-full border bg-card px-4 py-1.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              {sub.name}
            </Link>
          ))}
        </div>

        <SearchBar value={query} onChange={setQuery} placeholder={`Kërko në ${category.name}...`} className="max-w-md mb-8" />
      </div>

      <div className="container pb-20 flex-1">
        <div className="flex gap-8">
          <div className="hidden lg:block w-56 shrink-0">
            <FilterSidebar
              selectedPricing={pricing}
              onPricingChange={setPricing}
              selectedProvider={provider}
              onProviderChange={setProvider}
              selectedTags={selectedTags}
              onTagToggle={handleTagToggle}
            />
          </div>
          <div className="flex-1">
            <div className="mb-4 text-sm text-muted-foreground">{filteredTools.length} mjete</div>
            {toolsLoading ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-xl" />
                ))}
              </div>
            ) : filteredTools.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filteredTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground py-10 text-center">Nuk ka mjete me këto filtra.</p>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
