import { Heart, Crown, Star } from 'lucide-react';

interface DonorBadgeProps {
  totalDonated: number;
  size?: 'sm' | 'md';
}

export function DonorBadge({ totalDonated, size = 'sm' }: DonorBadgeProps) {
  if (totalDonated <= 0) return null;

  const tier = totalDonated >= 50
    ? { label: 'Super Mbështetës', icon: Crown, className: 'bg-accent/10 text-accent' }
    : totalDonated >= 10
    ? { label: 'Mbështetës', icon: Star, className: 'bg-primary/10 text-primary' }
    : { label: 'Donator', icon: Heart, className: 'bg-destructive/10 text-destructive' };

  const Icon = tier.icon;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${tier.className} ${sizeClasses}`}>
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
      {tier.label}
    </span>
  );
}
