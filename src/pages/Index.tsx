import { useState } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { CategoryCard } from '@/components/CategoryCard';
import { ToolSection } from '@/components/ToolSection';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ToolCard } from '@/components/ToolCard';
import { Sparkles } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { useTools, useSearchTools } from '@/hooks/useTools';
import { Skeleton } from '@/components/ui/skeleton';
import { useSEO } from '@/hooks/useSEO';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Index() {
  const [query, setQuery] = useState('');
  const { data: categories = [], isLoading: catsLoading } = useCategories();
  const { data: searchResults = [] } = useSearchTools(query);
  const { data: featuredTools = [] } = useTools({ featured: true });
  const { data: popularTools = [] } = useTools({ popular: true });
  const { data: newTools = [] } = useTools({ orderByCreated: true, limit: 8 });
  const { data: officialTools = [] } = useTools({ official: true });
  const { t } = useLanguage();

  useSEO({ description: t('hero_subtitle') });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 gradient-hero opacity-5" />
        <div className="container relative text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            {t('hero_badge')}
          </div>
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-foreground md:text-6xl">
            {t('hero_title_1')}{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t('hero_title_2')}
            </span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            {t('hero_subtitle')}
          </p>
          <div className="mx-auto max-w-xl">
            <SearchBar value={query} onChange={setQuery} placeholder={t('search_placeholder')} className="shadow-hero" />
          </div>
        </div>
      </section>

      <main className="container pb-20 flex-1">
        {query.length > 1 && (
          <section className="py-8">
            <h2 className="mb-4 text-xl font-bold text-foreground">
              {t('search_results_for')} "{query}" ({searchResults.length})
            </h2>
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {searchResults.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">{t('search_no_results')}</p>
            )}
          </section>
        )}

        {!query && (
          <>
            <section className="py-8">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">{t('categories_title')}</h2>
              </div>
              {catsLoading ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-48 rounded-xl" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {categories.map((cat) => (
                    <CategoryCard key={cat.id} category={cat} />
                  ))}
                </div>
              )}
            </section>

            <ToolSection title={t('featured_tools')} tools={featuredTools} />
            <ToolSection title={t('popular_tools')} tools={popularTools} />
            <ToolSection title={t('new_tools')} tools={newTools} />
            <ToolSection title={t('official_tools')} tools={officialTools} />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
