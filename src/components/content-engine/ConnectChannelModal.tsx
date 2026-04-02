import { useState, useCallback, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ChannelCard, type ChannelStatus } from "./ChannelCard";
import { channels, type ChannelDefinition } from "./channels-config";
import { useSocialAccounts } from "@/hooks/useContentEngine";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Loader2, CheckCircle2, Search, HelpCircle } from "lucide-react";

interface ConnectChannelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "select" | "connect";

// Fields per channel type
const channelFields: Record<string, { label: string; key: string; type?: string; placeholder: string }[]> = {
  facebook: [
    { label: "Emri i Faqes", key: "account_name", placeholder: "p.sh. Biznesi Im" },
    { label: "Page ID", key: "account_id", placeholder: "Facebook Page ID" },
  ],
  instagram: [
    { label: "Username", key: "account_name", placeholder: "@username" },
    { label: "Account ID", key: "account_id", placeholder: "Instagram Business Account ID" },
  ],
  linkedin: [
    { label: "Emri i Profilit / Kompanisë", key: "account_name", placeholder: "p.sh. Kompania Ime" },
    { label: "LinkedIn ID", key: "account_id", placeholder: "LinkedIn Organization ID" },
  ],
  telegram: [
    { label: "Emri i Botit", key: "account_name", placeholder: "p.sh. MyBot" },
    { label: "Bot Token", key: "account_id", placeholder: "123456:ABC-DEF..." },
  ],
  whatsapp: [
    { label: "Numri i Biznesit", key: "account_name", placeholder: "+355..." },
    { label: "WhatsApp Business API ID", key: "account_id", placeholder: "Phone Number ID" },
  ],
  email: [
    { label: "Emri i llogarisë", key: "account_name", placeholder: "Newsletter" },
    { label: "Email / SMTP", key: "account_id", placeholder: "info@biznesi.com" },
  ],
  custom: [
    { label: "Emri i kanalit", key: "account_name", placeholder: "Kanali im" },
    { label: "Webhook URL", key: "account_id", placeholder: "https://..." },
  ],
};

export function ConnectChannelModal({ open, onOpenChange }: ConnectChannelModalProps) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: accounts = [] } = useSocialAccounts();

  const [step, setStep] = useState<Step>("select");
  const [selectedChannel, setSelectedChannel] = useState<ChannelDefinition | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [connecting, setConnecting] = useState(false);
  const [search, setSearch] = useState("");

  const getStatus = useCallback((platform: string): ChannelStatus => {
    const acc = accounts.find((a) => a.platform === platform);
    if (!acc) return "not_connected";
    if (acc.is_connected) return "connected";
    return "reconnect_required";
  }, [accounts]);

  const filteredChannels = useMemo(() => {
    if (!search.trim()) return channels;
    const q = search.toLowerCase();
    return channels.filter((c) => c.name.toLowerCase().includes(q) || c.subtitle.toLowerCase().includes(q));
  }, [search]);

  const handleSelectChannel = (ch: ChannelDefinition) => {
    const status = getStatus(ch.platform);
    if (status === "connected") {
      toast.info(`${ch.name} është tashmë e lidhur.`);
      return;
    }
    setSelectedChannel(ch);
    setFormData({});
    setStep("connect");
  };

  const handleConnect = async () => {
    if (!selectedChannel || !user) return;
    const fields = channelFields[selectedChannel.platform] || channelFields.custom;
    for (const f of fields) {
      if (!formData[f.key]?.trim()) {
        toast.error(`Plotëso fushën: ${f.label}`);
        return;
      }
    }

    setConnecting(true);
    try {
      const { error } = await supabase.from("social_accounts").insert({
        user_id: user.id,
        platform: selectedChannel.platform,
        account_name: formData.account_name || "",
        account_id: formData.account_id || "",
        is_connected: true,
      });
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["social-accounts"] });
      toast.success(`${selectedChannel.name} u lidh me sukses!`);
      resetAndClose();
    } catch (e: any) {
      toast.error(e.message || "Gabim gjatë lidhjes");
    } finally {
      setConnecting(false);
    }
  };

  const resetAndClose = () => {
    setStep("select");
    setSelectedChannel(null);
    setFormData({});
    setSearch("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetAndClose(); else onOpenChange(v); }}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            {step === "connect" && (
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setStep("select")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div>
              <DialogTitle className="text-xl">
                {step === "select" ? "Lidh një kanal të ri" : `Lidh ${selectedChannel?.name}`}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {step === "select"
                  ? "Zgjidh kanalin që dëshiron të lidhësh me llogarinë tënde."
                  : `Vendos kredencialet për ${selectedChannel?.name} për të aktivizuar postimin automatik.`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {step === "select" ? (
          <div className="flex flex-col overflow-hidden">
            {/* Search */}
            <div className="px-6 pt-4 pb-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Kërko kanal..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Channel Grid */}
            <ScrollArea className="flex-1 px-6 pb-6" style={{ maxHeight: "calc(85vh - 180px)" }}>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
                {filteredChannels.map((ch) => (
                  <ChannelCard
                    key={ch.id}
                    name={ch.name}
                    subtitle={ch.subtitle}
                    icon={ch.icon}
                    iconColor={ch.iconColor}
                    status={getStatus(ch.platform)}
                    supported={ch.supported}
                    onClick={() => handleSelectChannel(ch)}
                  />
                ))}
              </div>

              {filteredChannels.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">
                  <HelpCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="font-medium">Nuk u gjet asnjë kanal</p>
                  <p className="text-sm mt-1">Provo me fjalë kyçe të ndryshme.</p>
                </div>
              )}

              {/* Request channel */}
              <div className="mt-4 text-center">
                <button className="text-xs text-muted-foreground hover:text-primary transition-colors underline underline-offset-2">
                  Nuk e gjen kanalin? Na kontakto për ta shtuar.
                </button>
              </div>
            </ScrollArea>
          </div>
        ) : (
          /* Connect Form */
          <ScrollArea className="px-6 py-6" style={{ maxHeight: "calc(85vh - 160px)" }}>
            <div className="space-y-5">
              {/* Channel header */}
              {selectedChannel && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background">
                    <selectedChannel.icon className={`h-5 w-5 ${selectedChannel.iconColor}`} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{selectedChannel.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedChannel.subtitle}</p>
                  </div>
                </div>
              )}

              {/* Form fields */}
              {(channelFields[selectedChannel?.platform || ""] || channelFields.custom).map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={field.key}>{field.label}</Label>
                  <Input
                    id={field.key}
                    type={field.type || "text"}
                    placeholder={field.placeholder}
                    value={formData[field.key] || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    disabled={connecting}
                  />
                </div>
              ))}

              {/* Submit */}
              <Button onClick={handleConnect} disabled={connecting} className="w-full" size="lg">
                {connecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Duke u lidhur...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Lidh {selectedChannel?.name}
                  </>
                )}
              </Button>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
