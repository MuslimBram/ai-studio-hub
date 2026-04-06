import { useState, useCallback, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChannelCard, RequestChannelCard, type ChannelStatus } from "./ChannelCard";
import { channels, type ChannelDefinition, type ModeDefinition, hasMultipleModes } from "./channels-config";
import { ModeComparisonStep } from "./ModeComparisonStep";
import { CredentialsStep } from "./CredentialsStep";
import { useSocialAccounts } from "@/hooks/useContentEngine";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Search, HelpCircle } from "lucide-react";
import { openOAuthPopup, startSocialOAuth } from "@/lib/social-oauth";

interface ConnectChannelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "select" | "modeCompare" | "connect";

export function ConnectChannelModal({ open, onOpenChange }: ConnectChannelModalProps) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: accounts = [] } = useSocialAccounts();

  const [step, setStep] = useState<Step>("select");
  const [selectedChannel, setSelectedChannel] = useState<ChannelDefinition | null>(null);
  const [selectedMode, setSelectedMode] = useState<ModeDefinition | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [search, setSearch] = useState("");

  // Listen for OAuth popup result messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== "social-oauth-result") return;

      setConnecting(false);

      if (event.data.status === "success") {
        toast.success(event.data.message || "Kanali u lidh me sukses!");
        qc.invalidateQueries({ queryKey: ["social-accounts"] });
        resetAndClose();
      } else {
        toast.error(event.data.message || "Lidhja dështoi.");
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [qc]);

  const getStatus = useCallback(
    (platform: string): ChannelStatus => {
      const accs = accounts.filter((a) => a.platform === platform && (a as any).status !== "deleted");
      if (accs.length === 0) return "not_connected";
      if (accs.some((a) => a.is_connected && !!a.access_token)) return "connected";
      return "reconnect_required";
    },
    [accounts],
  );

  const filteredChannels = useMemo(() => {
    if (!search.trim()) return channels;
    const q = search.toLowerCase();
    return channels.filter((c) => c.name.toLowerCase().includes(q) || c.subtitle.toLowerCase().includes(q));
  }, [search]);

  const handleSelectChannel = (ch: ChannelDefinition) => {
    setSelectedChannel(ch);
    setSelectedMode(null);

    if (hasMultipleModes(ch)) {
      setStep("modeCompare");
    } else {
      const singleMode = ch.modes[0];
      handleModeSelected(ch, singleMode);
    }
  };

  const handleModeSelected = (ch: ChannelDefinition, mode: ModeDefinition) => {
    setSelectedMode(mode);

    if (mode.connectionMethod === "oauth") {
      void initiateOAuth(ch, mode);
    } else {
      setStep("connect");
    }
  };

  const initiateOAuth = async (ch: ChannelDefinition, mode: ModeDefinition) => {
    setConnecting(true);
    const popup = openOAuthPopup(ch.name);

    try {
      await startSocialOAuth({ channel: ch, mode, popup });
      // Don't close modal yet - wait for postMessage from popup
    } catch (err: any) {
      popup?.close();
      toast.error(err.message || "Gabim gjatë nisjes së autorizimit");
      setConnecting(false);
    }
  };

  const handleCredentialConnect = async (formData: Record<string, string>) => {
    if (!selectedChannel || !selectedMode || !user) return;

    const accountName = formData.account_name?.trim();
    const accountId = formData.account_id?.trim();
    if (!accountName || !accountId) {
      toast.error("Plotëso të gjitha fushat.");
      return;
    }

    setConnecting(true);
    try {
      // For credential-based channels (email, website, custom), use a sentinel token
      // so they aren't treated as "disconnected" by cleanup logic
      const { error } = await supabase.from("social_accounts").insert({
        user_id: user.id,
        platform: selectedChannel.platform,
        account_name: accountName,
        account_id: accountId,
        access_token: "credential-based",
        is_connected: true,
        connection_mode: selectedMode.mode,
        account_type: selectedMode.accountTypes[0] || "unknown",
        capabilities: selectedMode.capabilities,
        provider: selectedChannel.platform,
        channel_type: selectedChannel.platform,
        display_name: accountName,
        external_account_id: accountId,
        handle_or_address: accountId,
        status: "connected",
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
    setSelectedMode(null);
    setSearch("");
    setConnecting(false);
    onOpenChange(false);
  };

  const goBack = () => {
    if (step === "connect" && selectedChannel && hasMultipleModes(selectedChannel)) {
      setStep("modeCompare");
      setSelectedMode(null);
    } else {
      setStep("select");
      setSelectedChannel(null);
      setSelectedMode(null);
    }
  };

  const stepTitle = () => {
    if (step === "select") return "Lidh një kanal të ri";
    if (step === "modeCompare") return `Zgjidh modalitetin — ${selectedChannel?.name}`;
    return `Lidh ${selectedChannel?.name}`;
  };

  const stepDescription = () => {
    if (step === "select") return "Zgjidh kanalin që dëshiron të lidhësh.";
    if (step === "modeCompare") return "Krahaso veçoritë dhe zgjidh mënyrën e lidhjes.";
    return `Vendos kredencialet për ${selectedChannel?.name}.`;
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? onOpenChange(v) : resetAndClose())}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            {step !== "select" && (
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={goBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div>
              <DialogTitle className="text-xl">{stepTitle()}</DialogTitle>
              <DialogDescription className="mt-1">{stepDescription()}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {step === "select" && (
          <div className="flex flex-col overflow-hidden">
            <div className="px-6 pt-4 pb-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Kërko kanal..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
            </div>
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
                </div>
              )}
              <div className="mt-4 text-center">
                <button className="text-xs text-muted-foreground hover:text-primary transition-colors underline underline-offset-2">
                  Nuk e gjen kanalin? Na kontakto për ta shtuar.
                </button>
              </div>
            </ScrollArea>
          </div>
        )}

        {step === "modeCompare" && selectedChannel && (
          <ScrollArea style={{ maxHeight: "calc(85vh - 120px)" }}>
            <ModeComparisonStep
              channel={selectedChannel}
              onSelectMode={(mode) => handleModeSelected(selectedChannel, mode)}
              connecting={connecting}
            />
          </ScrollArea>
        )}

        {step === "connect" && selectedChannel && selectedMode && (
          <ScrollArea style={{ maxHeight: "calc(85vh - 120px)" }}>
            <CredentialsStep
              channel={selectedChannel}
              selectedMode={selectedMode}
              onConnect={handleCredentialConnect}
              connecting={connecting}
            />
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
