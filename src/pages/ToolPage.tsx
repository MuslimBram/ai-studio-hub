import { useParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { useToolBySlug } from '@/hooks/useTools';
import { useCategoryById, useSubcategoryById } from '@/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronRight, ExternalLink, Sparkles, Star, Award, Shield, CheckCircle, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const badgeConfig: Record<string, { label: string; icon: React.ReactNode }> = {
  new: { label: 'I ri', icon: <Sparkles className="h-3 w-3" /> },
  popular: { label: 'Popullor', icon: <Star className="h-3 w-3" /> },
  featured: { label: 'I veçantë', icon: <Award className="h-3 w-3" /> },
  official: { label: 'Zyrtar', icon: <Shield className="h-3 w-3" /> },
};

export default function ToolPage() {
  const { toolSlug } = useParams<{ toolSlug: string }>();
  const { data: tool, isLoading } = useToolBySlug(toolSlug || '');
  const { data: category } = useCategoryById(tool?.categoryId);
  const { data: subcategory } = useSubcategoryById(tool?.subcategoryId);

  const handleTryNow = () => {
    toast({
      title: 'Së shpejti!',
      description: `Integrimi me ${tool?.provider || 'këtë mjet'} do të jetë i disponueshëm së shpejti.`,
    });
  };

  const handleLearnMore = () => {
    toast({
      title: 'Së shpejti!',
      description: 'Dokumentacioni i detajuar do të shtohet së shpejti.',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-6 w-96 mb-8" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground">Mjeti nuk u gjet</h1>
          <Link to="/" className="mt-4 text-primary hover:underline">Kthehu në kryefaqje</Link>
        </div>
      </div>
    );
  }

  const badge = tool.badge ? badgeConfig[tool.badge] : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container pt-6">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">Kryefaqja</Link>
          <ChevronRight className="h-3 w-3" />
          {category ? (
            <Link to={`/tools/${category.slug}`} className="hover:text-foreground transition-colors">{category.name}</Link>
          ) : (
            <Skeleton className="h-4 w-16" />
          )}
          {subcategory && (
            <>
              <ChevronRight className="h-3 w-3" />
              <Link to={`/tools/${category?.slug}/${subcategory.slug}`} className="hover:text-foreground transition-colors">{subcategory.name}</Link>
            </>
          )}
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">{tool.title}</span>
        </nav>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <div className="rounded-xl border bg-card p-8 shadow-card">
              <div className="flex items-start gap-4 mb-6">
                <div className="h-16 w-16 rounded-xl bg-secondary flex items-center justify-center text-2xl font-bold text-muted-foreground/30">
                  {tool.title.slice(0, 2)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl font-bold text-foreground">{tool.title}</h1>
                    {badge && (
                      <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                        {badge.icon} {badge.label}
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground">{tool.shortDescription}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="outline">{tool.provider}</Badge>
                <Badge variant="outline">{tool.modelType}</Badge>
              </div>

              <p className="text-foreground leading-relaxed">{tool.fullDescription}</p>
            </div>

            {tool.features.length > 0 && (
              <div className="rounded-xl border bg-card p-8 shadow-card">
                <h2 className="text-xl font-bold text-foreground mb-4">Veçoritë</h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {tool.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-sm text-foreground">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tool.useCases.length > 0 && (
              <div className="rounded-xl border bg-card p-8 shadow-card">
                <h2 className="text-xl font-bold text-foreground mb-4">Përdorime</h2>
                <div className="flex flex-wrap gap-2">
                  {tool.useCases.map((uc, i) => (
                    <span key={i} className="rounded-full bg-secondary px-3 py-1.5 text-sm text-foreground">{uc}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-xl border bg-card p-8 shadow-card">
              <h2 className="text-xl font-bold text-foreground mb-4">Input / Output</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">Input</h3>
                  <div className="flex flex-wrap gap-2">
                    {tool.inputTypes.map((t, i) => <Badge key={i} variant="outline">{t}</Badge>)}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">Output</h3>
                  <div className="flex flex-wrap gap-2">
                    {tool.outputTypes.map((t, i) => <Badge key={i} variant="outline">{t}</Badge>)}
                  </div>
                </div>
              </div>
            </div>

            {tool.tags.length > 0 && (
              <div className="rounded-xl border bg-card p-8 shadow-card">
                <h2 className="text-xl font-bold text-foreground mb-4">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {tool.tags.map((tag, i) => (
                    <span key={i} className="rounded-md bg-muted px-2.5 py-1 text-xs text-muted-foreground">#{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-xl border bg-card p-6 shadow-card">
                <div className="mb-4">
                  <span className="text-sm text-muted-foreground">Çmimi</span>
                  <div className="text-xl font-bold text-foreground">{tool.pricingText}</div>
                  <span className="text-xs text-muted-foreground capitalize">{tool.pricingType}</span>
                </div>
                <Button className="w-full mb-3" size="lg" onClick={handleTryNow}>
                  <Clock className="h-4 w-4 mr-2" />
                  Së Shpejti
                </Button>
                <Button variant="outline" className="w-full" size="lg" onClick={handleLearnMore}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Mëso Më Shumë
                </Button>
              </div>

              <div className="rounded-xl border bg-card p-6 shadow-card space-y-4">
                <div>
                  <span className="text-xs text-muted-foreground">Provider</span>
                  <div className="text-sm font-medium text-foreground">{tool.provider}</div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Model</span>
                  <div className="text-sm font-medium text-foreground">{tool.modelType}</div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Kategoria</span>
                  <div className="text-sm font-medium text-foreground">{category?.name || '...'}</div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Nënkategoria</span>
                  <div className="text-sm font-medium text-foreground">{subcategory?.name || '...'}</div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Shtuar më</span>
                  <div className="text-sm font-medium text-foreground">{new Date(tool.created_at).toLocaleDateString('sq-AL')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t bg-card py-8 mt-10">
        <div className="container text-center text-sm text-muted-foreground">
          © 2024 AI Tools Hub. Të gjitha të drejtat e rezervuara.
        </div>
      </footer>
    </div>
  );
}
