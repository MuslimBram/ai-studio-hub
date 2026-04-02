import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useCaptureToolPurchase } from '@/hooks/useToolPurchase';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ToolAccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const capturePurchase = useCaptureToolPurchase();

  const status = searchParams.get('status');
  const token = searchParams.get('token');

  useEffect(() => {
    if (token && status === 'success' && !capturePurchase.isSuccess && !capturePurchase.isPending) {
      capturePurchase.mutate(token);
    }
  }, [token, status]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="container flex-1 flex items-center justify-center py-20">
        <div className="rounded-xl border bg-card p-8 shadow-card max-w-md w-full text-center">
          {capturePurchase.isPending && (
            <>
              <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-4" />
              <h2 className="text-lg font-bold text-foreground">Duke konfirmuar pagesën...</h2>
              <p className="text-sm text-muted-foreground mt-2">Ju lutemi prisni.</p>
            </>
          )}

          {capturePurchase.isSuccess && (
            <>
              <CheckCircle className="h-10 w-10 text-primary mx-auto mb-4" />
              <h2 className="text-lg font-bold text-foreground">Pagesa u krye me sukses! 🎉</h2>
              <p className="text-sm text-muted-foreground mt-2">Tani keni akses të plotë te mjeti.</p>
              <Button className="mt-4" onClick={() => navigate(-1)}>
                Kthehu te Mjeti
              </Button>
            </>
          )}

          {capturePurchase.isError && (
            <>
              <XCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
              <h2 className="text-lg font-bold text-foreground">Pagesa dështoi</h2>
              <p className="text-sm text-muted-foreground mt-2">Diçka shkoi gabim. Provo përsëri.</p>
              <Button className="mt-4" variant="outline" onClick={() => navigate('/')}>
                Kthehu në Kryefaqje
              </Button>
            </>
          )}

          {status === 'cancelled' && !capturePurchase.isPending && !capturePurchase.isSuccess && (
            <>
              <XCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-lg font-bold text-foreground">Pagesa u anulua</h2>
              <p className="text-sm text-muted-foreground mt-2">Nuk u bë asnjë pagesë.</p>
              <Button className="mt-4" variant="outline" onClick={() => navigate(-1)}>
                Kthehu
              </Button>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
