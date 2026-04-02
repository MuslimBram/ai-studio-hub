import { Link } from 'react-router-dom';
import { Tool } from '@/data/types';
import { Sparkles, Star, Award, Shield } from 'lucide-react';
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

const pricingColors: Record<string, string> = {
  free: 'text-cat-text',
  freemium: 'text-primary',
  paid: 'text-cat-audio',
  enterprise: 'text-cat-business',
};

const categoryFallbacks: Record<string, string> = {
  image: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=400&h=300&fit=crop',
  video: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=400&h=300&fit=crop',
  audio: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=300&fit=crop',
  text: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=300&fit=crop',
  games: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop',
  business: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
  '3d-360': 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=400&h=300&fit=crop',
};

export function ToolCard({ tool }: ToolCardProps) {
  const badge = tool.badge ? badgeConfig[tool.badge] : null;
  const [imgError, setImgError] = useState(false);
  const fallback = categoryFallbacks[tool.categoryId] || categoryFallbacks['image'];
  const imgSrc = (!imgError && tool.imageUrl) ? tool.imageUrl : fallback;

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

        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">{tool.provider}</span>
            <span className={`text-xs font-medium ${pricingColors[tool.pricingType]}`}>{tool.pricingText}</span>
          </div>
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            Shiko →
          </span>
        </div>
      </div>
    </Link>
  );
}
