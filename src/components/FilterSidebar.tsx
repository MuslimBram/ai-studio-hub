import { useProviders } from '@/hooks/useTools';
import { Badge } from '@/components/ui/badge';

interface FilterSidebarProps {
  selectedPricing: string;
  onPricingChange: (v: string) => void;
  selectedProvider: string;
  onProviderChange: (v: string) => void;
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
}

const pricingOptions = [
  { value: '', label: 'Të gjitha' },
  { value: 'free', label: '🆓 Falas' },
  { value: 'freemium', label: '⭐ Freemium' },
  { value: 'paid', label: '💰 Me pagesë' },
];

const tagFilters = [
  { value: 'open-source', label: 'Open Source', emoji: '🔓' },
  { value: 'official', label: 'Zyrtar', emoji: '✅' },
  { value: 'api', label: 'API', emoji: '🔌' },
  { value: 'no-code', label: 'No-Code', emoji: '🧩' },
];

export function FilterSidebar({
  selectedPricing,
  onPricingChange,
  selectedProvider,
  onProviderChange,
  selectedTags,
  onTagToggle,
}: FilterSidebarProps) {
  const { data: providers = [] } = useProviders();

  return (
    <aside className="space-y-6">
      {/* Pricing filter */}
      <div>
        <h4 className="mb-3 text-sm font-semibold text-foreground">Çmimi</h4>
        <div className="space-y-1.5">
          {pricingOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onPricingChange(opt.value)}
              className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                selectedPricing === opt.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tag filters */}
      <div>
        <h4 className="mb-3 text-sm font-semibold text-foreground">Lloji</h4>
        <div className="flex flex-wrap gap-2">
          {tagFilters.map((tag) => {
            const active = selectedTags.includes(tag.value);
            return (
              <button
                key={tag.value}
                onClick={() => onTagToggle(tag.value)}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
              >
                <Badge
                  variant={active ? 'default' : 'outline'}
                  className="cursor-pointer text-xs gap-1 hover:bg-primary/10 transition-colors"
                >
                  {tag.emoji} {tag.label}
                </Badge>
              </button>
            );
          })}
        </div>
      </div>

      {/* Provider filter */}
      <div>
        <h4 className="mb-3 text-sm font-semibold text-foreground">Provider</h4>
        <div className="space-y-1.5 max-h-60 overflow-y-auto">
          <button
            onClick={() => onProviderChange('')}
            className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
              selectedProvider === ''
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            Të gjithë
          </button>
          {providers.map((p) => (
            <button
              key={p}
              onClick={() => onProviderChange(p)}
              className={`block w-full rounded-lg px-3 py-2 text-left text-sm truncate transition-colors ${
                selectedProvider === p
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
