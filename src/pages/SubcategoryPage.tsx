import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { SearchBar } from '@/components/SearchBar';
import { FilterSidebar } from '@/components/FilterSidebar';
import { ToolCard } from '@/components/ToolCard';
import { getCategoryBySlug, getSubcategoryBySlug, filterTools } from '@/data/helpers';
import { categoryIcons } from '@/data/icons';
import { ChevronRight } from 'lucide-react';

export default function SubcategoryPage() {
  const { categorySlug, subcategorySlug } = useParams<{ categorySlug: string; subcategorySlug: string }>();
  const category = getCategoryBySlug(categorySlug || '');
  const subcategory = getSubcategoryBySlug(categorySlug || '', subcategorySlug || '');

  const [query, setQuery] = useState('');
  const [pricing, setPricing] = useState('');
  const [provider, setProvider] = useState('');

  if (!category || !subcategory) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground">Nënkategoria nuk u gjet</h1>
          <Link to="/" className="mt-4 text-primary hover:underline">Kthehu në kryefaqje</Link>
        </div>
      </div>
    );
  }

  const filteredTools = filterTools({
    subcategoryId: subcategory.id,
    pricingType: pricing || undefined,
    provider: provider || undefined,
    query: query || undefined,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container pt-6">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">Kryefaqja</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to={`/tools/${category.slug}`} className="hover:text-foreground transition-colors">{category.name}</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">{subcategory.name}</span>
        </nav>
      </div>

      <div className="container py-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">{subcategory.name}</h1>
        <p className="text-muted-foreground mb-6">{subcategory.description}</p>
        <SearchBar value={query} onChange={setQuery} placeholder={`Kërko në ${subcategory.name}...`} className="max-w-md mb-8" />
      </div>

      <div className="container pb-20">
        <div className="flex gap-8">
          <div className="hidden lg:block w-56 shrink-0">
            <FilterSidebar
              selectedPricing={pricing}
              onPricingChange={setPricing}
              selectedProvider={provider}
              onProviderChange={setProvider}
            />
          </div>
          <div className="flex-1">
            <div className="mb-4 text-sm text-muted-foreground">{filteredTools.length} mjete</div>
            {filteredTools.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filteredTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground py-10 text-center">Nuk ka mjete në këtë nënkategori.</p>
            )}
          </div>
        </div>
      </div>

      <footer className="border-t bg-card py-8">
        <div className="container text-center text-sm text-muted-foreground">
          © 2024 AI Tools Hub. Të gjitha të drejtat e rezervuara.
        </div>
      </footer>
    </div>
  );
}
