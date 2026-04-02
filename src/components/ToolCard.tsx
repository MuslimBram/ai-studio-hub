import { Link } from 'react-router-dom';
import { Tool } from '@/data/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Star, Award, Shield } from 'lucide-react';

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

export function ToolCard({ tool }: ToolCardProps) {
  const badge = tool.badge ? badgeConfig[tool.badge] : null;

  return (
    <Link
      to={`/tool/${tool.slug}`}
      className="group flex flex-col rounded-xl border bg-card shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 overflow-hidden"
    >
      {/* Thumbnail area */}
      <div className="relative h-40 bg-secondary flex items-center justify-center overflow-hidden">
        <div className="text-4xl font-bold text-muted-foreground/20">{tool.title.slice(0, 2)}</div>
        {badge && (
          <div className={`absolute top-3 right-3 flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}>
            {badge.icon}
            {badge.label}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 flex items-center gap-2">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{tool.title}</h3>
        </div>
        <p className="mb-3 text-sm text-muted-foreground line-clamp-2">{tool.shortDescription}</p>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">{tool.provider}</span>
            <span className={`text-xs font-medium ${pricingColors[tool.pricingType]}`}>{tool.pricingText}</span>
          </div>
          <Button size="sm" variant="outline" className="text-xs">
            Provo
          </Button>
        </div>
      </div>
    </Link>
  );
}
