import { Link } from 'react-router-dom';
import { Tool } from '@/data/types';
import { Sparkles, Star, Award, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

interface ToolCardProps {
  tool: Tool;
}

const badgeConfig: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  new: { label: 'I ri', icon: <Sparkles className="h-3 w-3" />, className: 'bg-primary text-primary-foreground' },
  popular: { label: 'Popullor', icon: <Star className="h-3 w-3" />, className: 'bg-accent text-accent-foreground' },
  featured: { label: 'I veçantë', icon: <Award className="h-3 w-3" />, className: 'bg-cat-games/20 text-cat-games' },
  official: { label: 'Zyrtar', icon: <Shield className="h-3 w-3" />, className: 'bg-cat-text/20 text-cat-text' },
};

const pricingBadgeConfig: Record<string, { label: string; className: string }> = {
  free: { label: 'Falas', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  freemium: { label: 'Freemium', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  paid: { label: 'Me pagesë', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
};

const categoryFallbacks: Record<string, string> = {
  image: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=400&h=300&fit=crop',
  video: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=400&h=300&fit=crop',
  audio: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=300&fit=crop',
  text: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=300&fit=crop',
  games: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop',
  business: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
  '3d-360': 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=400&h=300&fit=crop',
  coding: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop',
  research: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
  productivity: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=300&fit=crop',
  design: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
  marketing: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=400&h=300&fit=crop',
  seo: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=400&h=300&fit=crop',
  data: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
  automation: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop',
  avatars: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=400&h=300&fit=crop',
  transcription: 'https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=400&h=300&fit=crop',
  education: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop',
  presentation: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop',
  'website-builder': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
};

export function ToolCard({ tool }: ToolCardProps) {
  const badge = tool.badge ? badgeConfig[tool.badge] : null;
  const [imgError, setImgError] = useState(false);
  const fallback = categoryFallbacks[tool.categoryId] || categoryFallbacks['image'];
  const imgSrc = (!imgError && tool.imageUrl) ? tool.imageUrl : fallback;
  const pricingBadge = pricingBadgeConfig[tool.pricingType];
  const tags = (tool as any).tags as string[] | undefined;
  const isOpenSource = tags?.includes('open-source');
  const hasApi = tags?.includes('api');
  const isOfficial = tool.isOfficial;

  return (
    <Link
      to={`/tool/${tool.slug}`}
      className="group flex flex-col rounded-xl border bg-card shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 overflow-hidden"
    >
      {/* Thumbnail */}
      <div className="relative h-40 bg-secondary overflow-hidden">
        <img
          src={imgSrc}
          alt={tool.title}
          loading="lazy"
          onError={() => setImgError(true)}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {badge && (
          <div className={`absolute top-3 right-3 flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}>
            {badge.icon}
            {badge.label}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="mb-1 font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">{tool.title}</h3>
        <p className="mb-3 text-sm text-muted-foreground line-clamp-2">{tool.shortDescription}</p>

        {/* Badges row */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {pricingBadge && (
            <Badge variant="secondary" className={`text-[10px] ${pricingBadge.className}`}>
              {pricingBadge.label}
            </Badge>
          )}
          {isOfficial && (
            <Badge variant="secondary" className="text-[10px] bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
              ✅ Zyrtar
            </Badge>
          )}
          {isOpenSource && (
            <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              🔓 Open Source
            </Badge>
          )}
          {hasApi && (
            <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400">
              🔌 API
            </Badge>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{tool.provider}</span>
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            Shiko →
          </span>
        </div>
      </div>
    </Link>
  );
}
