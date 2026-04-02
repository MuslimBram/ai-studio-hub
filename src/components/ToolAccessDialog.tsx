import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Lock, CreditCard, ExternalLink } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateToolPurchase } from '@/hooks/useToolPurchase';
import { useNavigate } from 'react-router-dom';

interface ToolAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tool: {
    id: string;
    title: string;
    base_price: number;
    pricingType: string;
  };
}

export function ToolAccessDialog({ open, onOpenChange, tool }: ToolAccessDialogProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const createPurchase = useCreateToolPurchase();

  const basePrice = Number(tool.base_price);
  const commission = basePrice * 0.5;
  const totalPrice = basePrice + commission;

  const handlePurchase = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    const currentUrl = window.location.href;
    const returnUrl = `${window.location.origin}/tool-access?status=success&token=`;
    const cancelUrl = `${currentUrl}?status=cancelled`;

    const result = await createPurchase.mutateAsync({
      tool_id: tool.id,
      return_url: returnUrl,
      cancel_url: cancelUrl,
    });

    if (result?.approvalUrl) {
      window.location.href = result.approvalUrl;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Akses Premium
          </DialogTitle>
          <DialogDescription>
            Për të përdorur {tool.title}, nevojitet një pagesë e njëhershme.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Çmimi bazë</span>
              <span className="text-foreground font-medium">{basePrice.toFixed(2)}€</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shërbimi i platformës</span>
              <span className="text-foreground font-medium">{commission.toFixed(2)}€</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-semibold">
              <span className="text-foreground">Total</span>
              <span className="text-primary text-lg">{totalPrice.toFixed(2)}€</span>
            </div>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            Pagesa kryhet përmes PayPal. Aksesi është i përhershëm pas blerjes.
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={handlePurchase}
            disabled={createPurchase.isPending}
          >
            {createPurchase.isPending ? (
              'Duke u procesuar...'
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Paguaj {totalPrice.toFixed(2)}€ me PayPal
              </>
            )}
          </Button>

          {!user && (
            <p className="text-xs text-center text-muted-foreground">
              Duhet të jeni i kyçur për të blerë. <button onClick={() => navigate('/login')} className="text-primary hover:underline">Kyçu</button>
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
