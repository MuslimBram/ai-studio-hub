import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSocialAccounts } from "@/hooks/useContentEngine";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { Facebook, Instagram, Linkedin, Link2, Unlink, Loader2 } from "lucide-react";
import { toast } from "sonner";

const platformConfig = {
  facebook: { label: "Facebook Page", icon: Facebook, color: "text-blue-600" },
  instagram: { label: "Instagram", icon: Instagram, color: "text-pink-500" },
  linkedin: { label: "LinkedIn", icon: Linkedin, color: "text-blue-700" },
};

export function SocialAccountsManager() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: accounts = [], isLoading } = useSocialAccounts();
  const [connecting, setConnecting] = useState<string | null>(null);
  const [accountName, setAccountName] = useState("");
  const [accountId, setAccountId] = useState("");

  const handleConnect = async (platform: string) => {
    if (!accountName.trim()) {
      toast.error("Vendos emrin e llogarisë");
      return;
    }
    setConnecting(platform);
    try {
      const { error } = await supabase.from("social_accounts").insert({
        user_id: user!.id,
        platform,
        account_name: accountName,
        account_id: accountId || accountName,
        is_connected: true,
      });
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["social-accounts"] });
      setAccountName("");
      setAccountId("");
      toast.success(`${platform} u lidh me sukses!`);
    } catch (e: any) {
      toast.error(e.message || "Gabim");
    } finally {
      setConnecting(null);
    }
  };

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
      <Card>
        <CardHeader><CardTitle>Lidh një kanal të ri</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <Input placeholder="Emri i llogarisë / faqes" value={accountName} onChange={(e) => setAccountName(e.target.value)} className="flex-1" />
            <Input placeholder="ID e llogarisë (opsionale)" value={accountId} onChange={(e) => setAccountId(e.target.value)} className="flex-1" />
          </div>
          <div className="flex flex-wrap gap-3">
            {(Object.entries(platformConfig) as [string, typeof platformConfig.facebook][]).map(([key, config]) => (
              <Button key={key} variant="outline" onClick={() => handleConnect(key)} disabled={connecting === key}>
                {connecting === key ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <config.icon className={`h-4 w-4 mr-2 ${config.color}`} />}
                Lidh {config.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <p className="text-muted-foreground col-span-full">Duke ngarkuar...</p>
        ) : accounts.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-10 text-center text-muted-foreground">
              Nuk ke lidhur kanale ende. Shto një llogari sociale më sipër.
            </CardContent>
          </Card>
        ) : (
          accounts.map((account) => {
            const config = platformConfig[account.platform as keyof typeof platformConfig] || { label: account.platform, icon: Link2, color: "" };
            return (
              <Card key={account.id}>
                <CardContent className="py-4 flex items-center gap-4">
                  <config.icon className={`h-8 w-8 ${config.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{account.account_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={account.is_connected ? "default" : "secondary"}>
                        {account.is_connected ? "E lidhur" : "E shkëputur"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{config.label}</span>
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
    </div>
  );
}
