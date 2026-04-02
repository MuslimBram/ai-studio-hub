import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSocialAccounts } from "@/hooks/useContentEngine";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Link2, Unlink, Plus } from "lucide-react";
import { toast } from "sonner";
import { ConnectChannelModal } from "./ConnectChannelModal";
import { channels } from "./channels-config";

export function SocialAccountsManager() {
  const qc = useQueryClient();
  const { data: accounts = [], isLoading } = useSocialAccounts();
  const [modalOpen, setModalOpen] = useState(false);

  const handleDisconnect = async (id: string) => {
    try {
      const { error } = await supabase.from("social_accounts").update({ is_connected: false }).eq("id", id);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["social-accounts"] });
      toast.success("Llogaria u shkëput!");
    } catch (e: any) {
      toast.error(e.message || "Gabim");
    }
  };

  const handleReconnect = async (id: string) => {
    try {
      const { error } = await supabase.from("social_accounts").update({ is_connected: true }).eq("id", id);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["social-accounts"] });
      toast.success("Llogaria u rilidhë!");
    } catch (e: any) {
      toast.error(e.message || "Gabim");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Kanalet e lidhura</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Menaxho llogaritë e rrjeteve sociale.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Lidh kanal të ri
        </Button>
      </div>

      {/* Connected accounts grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <p className="text-muted-foreground col-span-full">Duke ngarkuar...</p>
        ) : accounts.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-10 text-center text-muted-foreground">
              Nuk ke lidhur kanale ende. Kliko "Lidh kanal të ri" më sipër.
            </CardContent>
          </Card>
        ) : (
          accounts.map((account) => {
            const ch = channels.find((c) => c.platform === account.platform);
            const Icon = ch?.icon || Link2;
            const color = ch?.iconColor || "";
            const label = ch?.name || account.platform;

            return (
              <Card key={account.id}>
                <CardContent className="py-4 flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted shrink-0">
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-sm">{account.account_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={account.is_connected ? "default" : "secondary"} className="text-[10px]">
                        {account.is_connected ? "E lidhur" : "E shkëputur"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{label}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => account.is_connected ? handleDisconnect(account.id) : handleReconnect(account.id)}
                  >
                    {account.is_connected ? <Unlink className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
                  </Button>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Connect Channel Modal */}
      <ConnectChannelModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
