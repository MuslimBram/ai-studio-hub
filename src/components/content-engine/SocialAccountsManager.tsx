import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useSocialAccounts } from "@/hooks/useContentEngine";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Link2, Unlink, Plus, RefreshCw, Trash2, Star, Pencil, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import { ConnectChannelModal } from "./ConnectChannelModal";
import { channels, capabilityLabels, type Capability } from "./channels-config";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

interface EditFormData {
  display_name: string;
  handle_or_address: string;
  account_name: string;
}

export function SocialAccountsManager() {
  const qc = useQueryClient();
  const { data: accounts = [], isLoading } = useSocialAccounts();
  const [modalOpen, setModalOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<EditFormData>({ display_name: "", handle_or_address: "", account_name: "" });
  const [deleteAccount, setDeleteAccount] = useState<any | null>(null);
  const [busy, setBusy] = useState(false);

  const handleDisconnect = async (id: string) => {
    setBusy(true);
    try {
      const { error } = await supabase.from("social_accounts").update({ is_connected: false, status: "disconnected" }).eq("id", id);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["social-accounts"] });
      toast.success("Llogaria u shkëput!");
    } catch (e: any) {
      toast.error(e.message || "Gabim");
    } finally {
      setBusy(false);
    }
  };

  const handleReconnect = async (id: string) => {
    setBusy(true);
    try {
      const { error } = await supabase.from("social_accounts").update({ is_connected: true, status: "connected" }).eq("id", id);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["social-accounts"] });
      toast.success("Llogaria u rilidhë!");
    } catch (e: any) {
      toast.error(e.message || "Gabim");
    } finally {
      setBusy(false);
    }
  };

  const handleSetPrimary = async (id: string) => {
    setBusy(true);
    try {
      const { error } = await supabase.from("social_accounts").update({ is_primary: true }).eq("id", id);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["social-accounts"] });
      toast.success("Llogaria u vendos si kryesore!");
    } catch (e: any) {
      toast.error(e.message || "Gabim");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteAccount) return;
    setBusy(true);
    try {
      const { error } = await supabase.from("social_accounts").update({ status: "deleted", is_connected: false, is_primary: false }).eq("id", deleteAccount.id);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["social-accounts"] });
      toast.success("Llogaria u fshi!");
      setDeleteAccount(null);
    } catch (e: any) {
      toast.error(e.message || "Gabim");
    } finally {
      setBusy(false);
    }
  };

  const openEdit = (account: any) => {
    setEditAccount(account);
    setEditForm({
      display_name: account.display_name || account.account_name || "",
      handle_or_address: account.handle_or_address || "",
      account_name: account.account_name || "",
    });
  };

  const handleEditSave = async () => {
    if (!editAccount) return;
    setBusy(true);
    try {
      const { error } = await supabase.from("social_accounts").update({
        display_name: editForm.display_name,
        handle_or_address: editForm.handle_or_address,
        account_name: editForm.account_name,
      }).eq("id", editAccount.id);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["social-accounts"] });
      toast.success("Llogaria u përditësua!");
      setEditAccount(null);
    } catch (e: any) {
      toast.error(e.message || "Gabim");
    } finally {
      setBusy(false);
    }
  };

  // Filter out deleted accounts
  const visibleAccounts = accounts.filter((a: any) => a.status !== "deleted");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Kanalet e lidhura</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Menaxho llogaritë e rrjeteve sociale. Mund të lidhësh shumë llogari për të njëjtin kanal.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Lidh kanal të ri
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <p className="text-muted-foreground col-span-full">Duke ngarkuar...</p>
        ) : visibleAccounts.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-10 text-center text-muted-foreground">
              Nuk ke lidhur kanale ende. Kliko "Lidh kanal të ri" më sipër.
            </CardContent>
          </Card>
        ) : (
          visibleAccounts.map((account: any) => {
            const ch = channels.find((c) => c.platform === account.platform);
            const Icon = ch?.icon || Link2;
            const color = ch?.iconColor || "";
            const label = ch?.name || account.platform;
            const mode = account.connection_mode as string | undefined;
            const caps = (account.capabilities || []) as Capability[];
            const isPrimary = account.is_primary;
            const isConnected = account.is_connected;
            const status = account.status || (isConnected ? "connected" : "disconnected");

            const statusLabel: Record<string, string> = {
              connected: "E lidhur",
              disconnected: "E shkëputur",
              reconnect_required: "Kërkon rilidhje",
              failed: "Dështoi",
              pending: "Në pritje",
            };

            const statusVariant = isConnected ? "default" as const : "secondary" as const;

            return (
              <Card key={account.id} className={isPrimary ? "ring-2 ring-primary/50" : ""}>
                <CardContent className="py-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted shrink-0">
                      <Icon className={`h-5 w-5 ${color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-medium truncate text-sm">
                          {account.display_name || account.account_name}
                        </p>
                        {isPrimary && <Star className="h-3.5 w-3.5 text-primary fill-primary shrink-0" />}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={statusVariant} className="text-[10px]">
                          {statusLabel[status] || status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{label}</span>
                      </div>
                      {account.handle_or_address && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{account.handle_or_address}</p>
                      )}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(account)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Ndrysho
                        </DropdownMenuItem>
                        {isConnected ? (
                          <DropdownMenuItem onClick={() => handleDisconnect(account.id)} disabled={busy}>
                            <Unlink className="h-4 w-4 mr-2" />
                            Shkëput
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleReconnect(account.id)} disabled={busy}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Rilidh
                          </DropdownMenuItem>
                        )}
                        {!isPrimary && isConnected && (
                          <DropdownMenuItem onClick={() => handleSetPrimary(account.id)} disabled={busy}>
                            <Star className="h-4 w-4 mr-2" />
                            Vendos si kryesore
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => setDeleteAccount(account)} disabled={busy}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Fshi
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Mode & capabilities */}
                  <div className="flex flex-wrap gap-1.5">
                    {mode && (
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {mode === "professional" ? "Professional" : "Personal"}
                      </Badge>
                    )}
                    {caps.slice(0, 4).map((cap) => (
                      <Badge key={cap} variant="secondary" className="text-[10px]">
                        {capabilityLabels[cap] || cap}
                      </Badge>
                    ))}
                    {caps.length > 4 && (
                      <Badge variant="secondary" className="text-[10px]">
                        +{caps.length - 4}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <ConnectChannelModal open={modalOpen} onOpenChange={setModalOpen} />

      {/* Edit Dialog */}
      <Dialog open={!!editAccount} onOpenChange={(v) => !v && setEditAccount(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ndrysho llogarinë</DialogTitle>
            <DialogDescription>Përditëso të dhënat e kësaj llogarie.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Emri i shfaqur</Label>
              <Input value={editForm.display_name} onChange={(e) => setEditForm((p) => ({ ...p, display_name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Emri i llogarisë</Label>
              <Input value={editForm.account_name} onChange={(e) => setEditForm((p) => ({ ...p, account_name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Adresa / Handle</Label>
              <Input value={editForm.handle_or_address} onChange={(e) => setEditForm((p) => ({ ...p, handle_or_address: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditAccount(null)}>Anulo</Button>
            <Button onClick={handleEditSave} disabled={busy}>Ruaj ndryshimet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteAccount} onOpenChange={(v) => !v && setDeleteAccount(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fshi llogarinë</DialogTitle>
            <DialogDescription>
              Je i sigurt që dëshiron të fshish "{deleteAccount?.display_name || deleteAccount?.account_name}"? Kjo veprim nuk mund të kthehet mbrapsht.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteAccount(null)}>Anulo</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={busy}>Fshi përfundimisht</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
