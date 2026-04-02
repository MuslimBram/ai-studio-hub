import { useState } from 'react';
import { Heart, Coffee, Sparkles, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateDonation } from '@/hooks/useDonations';
import { useAuth } from '@/contexts/AuthContext';

const presetAmounts = [
  { value: 3, label: '☕ 3€', desc: 'Një kafe' },
  { value: 5, label: '🍕 5€', desc: 'Një pica' },
  { value: 10, label: '💎 10€', desc: 'Mbështetje e madhe' },
  { value: 25, label: '🚀 25€', desc: 'Super mbështetës' },
];

export function DonationCard() {
  const [selectedAmount, setSelectedAmount] = useState<number>(5);
  const [customAmount, setCustomAmount] = useState('');
  const [message, setMessage] = useState('');
  const [donorName, setDonorName] = useState('');
  const { user } = useAuth();
  const createDonation = useCreateDonation();

  const amount = customAmount ? Number(customAmount) : selectedAmount;

  const handleDonate = async () => {
    if (!amount || amount < 1) return;

    const baseUrl = window.location.origin;
    const result = await createDonation.mutateAsync({
      amount,
      currency: 'EUR',
      message,
      donor_name: donorName,
      return_url: `${baseUrl}/donate?status=success`,
      cancel_url: `${baseUrl}/donate?status=cancelled`,
    });

    if (result.approvalUrl) {
      window.location.href = result.approvalUrl;
    }
  };

  return (
    <div className="rounded-xl border bg-card p-6 shadow-card space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Heart className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-foreground">Na mbështetni</h3>
          <p className="text-sm text-muted-foreground">Ndihmoni rritjen e platformës</p>
        </div>
      </div>

      {/* Preset amounts */}
      <div className="grid grid-cols-2 gap-2">
        {presetAmounts.map((preset) => (
          <button
            key={preset.value}
            onClick={() => { setSelectedAmount(preset.value); setCustomAmount(''); }}
            className={`rounded-lg border p-3 text-left transition-all ${
              !customAmount && selectedAmount === preset.value
                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <span className="text-sm font-medium text-foreground">{preset.label}</span>
            <p className="text-xs text-muted-foreground">{preset.desc}</p>
          </button>
        ))}
      </div>

      {/* Custom amount */}
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Shumë e personalizuar (€)</label>
        <Input
          type="number"
          min="1"
          max="10000"
          placeholder="Fut shumën..."
          value={customAmount}
          onChange={(e) => { setCustomAmount(e.target.value); }}
        />
      </div>

      {/* Donor name */}
      {!user && (
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Emri juaj (opsional)</label>
          <Input
            placeholder="Anonim"
            value={donorName}
            onChange={(e) => setDonorName(e.target.value)}
            maxLength={100}
          />
        </div>
      )}

      {/* Message */}
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Mesazh (opsional)</label>
        <Input
          placeholder="Një mesazh i shkurtër..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={500}
        />
      </div>

      {/* Donate button */}
      <Button
        className="w-full"
        size="lg"
        onClick={handleDonate}
        disabled={createDonation.isPending || !amount || amount < 1}
      >
        {createDonation.isPending ? (
          'Duke procesuar...'
        ) : (
          <>
            <Gift className="h-4 w-4 mr-2" />
            Dhuro {amount}€ me PayPal
          </>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Pagesa e sigurt përmes PayPal. Faleminderit për mbështetjen! 💙
      </p>
    </div>
  );
}
