import { getAllProviders } from '@/data/helpers';

interface FilterSidebarProps {
  selectedPricing: string;
  onPricingChange: (v: string) => void;
  selectedProvider: string;
  onProviderChange: (v: string) => void;
}

const pricingOptions = [
  { value: '', label: 'Të gjitha' },
  { value: 'free', label: 'Falas' },
  { value: 'freemium', label: 'Freemium' },
  { value: 'paid', label: 'Me pagesë' },
  { value: 'enterprise', label: 'Enterprise' },
];

export function FilterSidebar({ selectedPricing, onPricingChange, selectedProvider, onProviderChange }: FilterSidebarProps) {
  const providers = getAllProviders();

  return (
    <aside className="space-y-6">
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

      <div>
        <h4 className="mb-3 text-sm font-semibold text-foreground">Provider</h4>
        <div className="space-y-1.5">
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
              className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
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
