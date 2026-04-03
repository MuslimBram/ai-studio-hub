import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useScheduledPosts, useCreateScheduledPost, useDeleteScheduledPost, useUpdateScheduledPost, useSocialAccounts } from "@/hooks/useContentEngine";
import { CalendarIcon, Plus, Trash2, Edit, Clock, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function PostScheduler() {
  const { data: posts = [], isLoading } = useScheduledPosts();
  const { data: accounts = [] } = useSocialAccounts();
  const createPost = useCreateScheduledPost();
  const deletePost = useDeleteScheduledPost();
  const updatePost = useUpdateScheduledPost();

  const [open, setOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [content, setContent] = useState("");
  const [platform, setPlatform] = useState("");
  const [socialAccountId, setSocialAccountId] = useState("");
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("12:00");
  const [hashtags, setHashtags] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [recurrenceRule, setRecurrenceRule] = useState("weekly");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Only show connected accounts with real tokens
  const connectedAccounts = useMemo(() =>
    accounts.filter((a: any) => a.is_connected && a.status === "connected" && a.access_token),
    [accounts]
  );

  const selectableAccounts = useMemo(() => {
    if (!editingId) return connectedAccounts;

    const byId = new Map<string, any>();
    accounts
      .filter((a: any) => a.status !== "deleted")
      .forEach((account: any) => byId.set(account.id, account));

    return Array.from(byId.values());
  }, [accounts, connectedAccounts, editingId]);

  useEffect(() => {
    if (!open || editingId || socialAccountId || connectedAccounts.length !== 1) return;
    handleAccountChange(connectedAccounts[0].id);
  }, [open, editingId, socialAccountId, connectedAccounts]);

  // When account is selected, auto-set platform
  const handleAccountChange = (accountId: string) => {
    setSocialAccountId(accountId);
    const acct = connectedAccounts.find((a: any) => a.id === accountId);
    if (acct) setPlatform(acct.platform);
  };

  const resetForm = () => {
    setContent(""); setPlatform(""); setSocialAccountId(""); setDate(undefined); setTime("12:00");
    setHashtags(""); setRecurring(false); setRecurrenceRule("weekly"); setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!content.trim() || !date) {
      toast.error("Plotëso përmbajtjen dhe datën.");
      return;
    }
    if (!socialAccountId) {
      toast.error("Zgjidh llogarinë sociale për postim.");
      return;
    }

    const selectedAccount = accounts.find((account: any) => account.id === socialAccountId);
    if (!selectedAccount) {
      toast.error("Llogaria sociale nuk u gjet.");
      return;
    }

    if (!(selectedAccount.is_connected && selectedAccount.status === "connected" && selectedAccount.access_token)) {
      toast.error("Kjo llogari nuk ka token të vlefshëm. Rilidhe përmes OAuth para publikimit.");
      return;
    }

    const scheduledAt = new Date(date);
    const [h, m] = time.split(":").map(Number);
    scheduledAt.setHours(h, m, 0, 0);

    const payload = {
      content,
      platform: selectedAccount.platform,
      social_account_id: socialAccountId,
      scheduled_at: scheduledAt.toISOString(),
      hashtags: hashtags.split(",").map((h) => h.trim()).filter(Boolean),
      is_recurring: recurring,
      recurrence_rule: recurring ? recurrenceRule : "",
      status: "scheduled" as const,
    };

    try {
      if (editingId) {
        await updatePost.mutateAsync({ id: editingId, ...payload });
        toast.success("Postimi u përditësua!");
      } else {
        await createPost.mutateAsync(payload);
        toast.success("Postimi u planifikua!");
      }
      resetForm();
      setOpen(false);
    } catch (e: any) {
      toast.error(e.message || "Gabim");
    }
  };

  const handleEdit = (post: any) => {
    const fallbackAccount = !post.social_account_id && connectedAccounts.length === 1 ? connectedAccounts[0] : null;

    setEditingId(post.id);
    setContent(post.content);
    setPlatform(fallbackAccount?.platform || post.platform);
    setSocialAccountId(post.social_account_id || fallbackAccount?.id || "");
    setDate(new Date(post.scheduled_at));
    setTime(format(new Date(post.scheduled_at), "HH:mm"));
    setHashtags((post.hashtags || []).join(", "));
    setRecurring(post.is_recurring || false);
    setRecurrenceRule(post.recurrence_rule || "weekly");
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePost.mutateAsync(id);
      toast.success("Postimi u fshi!");
    } catch (e: any) {
      toast.error(e.message || "Gabim");
    }
  };

  const statusColor: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    scheduled: "bg-primary/10 text-primary",
    publishing: "bg-amber-500/10 text-amber-600",
    published: "bg-emerald-500/10 text-emerald-600",
    failed: "bg-destructive/10 text-destructive",
  };

  const statusLabel: Record<string, string> = {
    draft: "Skicë",
    scheduled: "Planifikuar",
    publishing: "Duke publikuar...",
    published: "Publikuar",
    failed: "Dështoi",
  };

  const postsByDate = posts.reduce<Record<string, typeof posts>>((acc, p) => {
    const key = format(new Date(p.scheduled_at), "yyyy-MM-dd");
    (acc[key] = acc[key] || []).push(p);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* No connected accounts warning */}
      {connectedAccounts.length === 0 && (
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardContent className="py-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
            <div>
              <p className="font-medium text-sm">Nuk ke llogari të lidhura me token të vlefshëm</p>
              <p className="text-xs text-muted-foreground">Lidh një kanal përmes OAuth për të mundësuar postimin automatik.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
            Lista
          </Button>
          <Button variant={viewMode === "calendar" ? "default" : "outline"} size="sm" onClick={() => setViewMode("calendar")}>
            Kalendar
          </Button>
        </div>

        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button disabled={connectedAccounts.length === 0}>
              <Plus className="h-4 w-4 mr-2" /> Postim i ri
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingId ? "Ndrysho postimin" : "Postim i ri"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Account selector - REQUIRED */}
              <div className="space-y-1">
                <label className="text-sm font-medium">Llogaria sociale *</label>
                <Select value={socialAccountId} onValueChange={handleAccountChange}>
                  <SelectTrigger><SelectValue placeholder="Zgjidh llogarinë..." /></SelectTrigger>
                  <SelectContent>
                      {selectableAccounts.map((a: any) => (
                      <SelectItem key={a.id} value={a.id}>
                          {a.display_name || a.account_name} ({a.platform}){!(a.is_connected && a.status === "connected" && a.access_token) ? " — kërkon rilidhje" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Textarea placeholder="Shkruaj përmbajtjen e postimit..." value={content} onChange={(e) => setContent(e.target.value)} rows={5} />

              <Input placeholder="Hashtags (ndarë me presje)" value={hashtags} onChange={(e) => setHashtags(e.target.value)} />

              <div className="flex gap-4 items-end">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-[200px] justify-start text-left", !date && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Zgjidh datën"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={date} onSelect={setDate} className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-[130px]" />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} className="rounded" />
                  Përsëritës
                </label>
                {recurring && (
                  <Select value={recurrenceRule} onValueChange={setRecurrenceRule}>
                    <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Ditor</SelectItem>
                      <SelectItem value="weekly">Javor</SelectItem>
                      <SelectItem value="monthly">Mujor</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setOpen(false); resetForm(); }}>Anulo</Button>
                <Button onClick={handleSubmit} disabled={createPost.isPending || updatePost.isPending}>
                  {editingId ? "Ruaj ndryshimet" : "Planifiko"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {viewMode === "list" ? (
        <div className="space-y-3">
          {isLoading ? (
            <p className="text-muted-foreground">Duke ngarkuar...</p>
          ) : posts.length === 0 ? (
            <Card><CardContent className="py-10 text-center text-muted-foreground">Nuk ka postime të planifikuara ende.</CardContent></Card>
          ) : (
            posts.map((post) => {
              const acct = accounts.find((a: any) => a.id === post.social_account_id);
              return (
                <Card key={post.id}>
                  <CardContent className="py-4 flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{post.content.slice(0, 150)}{post.content.length > 150 ? "..." : ""}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Badge variant="outline">{post.platform}</Badge>
                        <Badge className={statusColor[post.status] || ""}>{statusLabel[post.status] || post.status}</Badge>
                        {acct && <Badge variant="secondary" className="text-[10px]">{(acct as any).display_name || (acct as any).account_name}</Badge>}
                        {!post.social_account_id && <Badge variant="destructive" className="text-[10px]">Pa llogari!</Badge>}
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(post.scheduled_at), "dd MMM yyyy, HH:mm")}
                        </span>
                        {post.is_recurring && <Badge variant="secondary">🔁 {post.recurrence_rule}</Badge>}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(post)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(post.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="py-4">
            <Calendar
              mode="single"
              className="p-3 pointer-events-auto"
              modifiers={{ hasPost: Object.keys(postsByDate).map((d) => new Date(d)) }}
              modifiersStyles={{ hasPost: { fontWeight: "bold", backgroundColor: "hsl(var(--primary) / 0.15)" } }}
              onDayClick={(day) => {
                const key = format(day, "yyyy-MM-dd");
                const dayPosts = postsByDate[key];
                if (dayPosts?.length) {
                  toast.info(`${dayPosts.length} postime: ${dayPosts.map((p) => p.content.slice(0, 30)).join(", ")}`);
                }
              }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
