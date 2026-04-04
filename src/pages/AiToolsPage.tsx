import { useState, useMemo } from "react";
import { useAiTools, useTrackToolClick, useSubmitAiTool, type AiTool } from "@/hooks/useAiTools";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ExternalLink, Star, Plus, Sparkles, Globe, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSEO } from "@/hooks/useSEO";

const categoryColors: Record<string, string> = {
  "Foto AI": "bg-pink-500/10 text-pink-700 dark:text-pink-400",
  "Video AI": "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  "Audio AI": "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  "Tekst & Chat": "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  "Lojra & Kreativitet": "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  "Biznes & Marketing": "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  "3D / 360° AI": "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400",
  "Coding AI": "bg-violet-500/10 text-violet-700 dark:text-violet-400",
  "Data & Analytics": "bg-rose-500/10 text-rose-700 dark:text-rose-400",
  "Website Builders": "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
  "Avatarë AI": "bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-400",
  "Transkriptim AI": "bg-teal-500/10 text-teal-700 dark:text-teal-400",
  "Edukim AI": "bg-lime-500/10 text-lime-700 dark:text-lime-400",
  "Prezantime AI": "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  "SEO AI": "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  "Automatizim AI": "bg-green-500/10 text-green-700 dark:text-green-400",
  "Dizajn AI": "bg-red-500/10 text-red-700 dark:text-red-400",
  "Produktivitet": "bg-slate-500/10 text-slate-700 dark:text-slate-400",
  "Research AI": "bg-stone-500/10 text-stone-700 dark:text-stone-400",
  "Marketing AI": "bg-zinc-500/10 text-zinc-700 dark:text-zinc-400",
};

export default function AiToolsPage() {
  useSEO({ title: "AI Tools Directory - HubinAI", description: "Discover 100+ free AI tools organized by category." });

  const { data: tools = [], isLoading } = useAiTools();
  const trackClick = useTrackToolClick();
  const submitTool = useSubmitAiTool();

  const [search, setSearch] = useState("");
  const [freeOnly, setFreeOnly] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<AiTool | null>(null);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [submitForm, setSubmitForm] = useState({ name: "", url: "", category: "", subcategory: "", description: "", is_free: true });

  const categories = useMemo(() => {
    const cats = [...new Set(tools.map((t) => t.category))];
    return cats.sort();
  }, [tools]);

  const filtered = useMemo(() => {
    let result = tools;
    if (freeOnly) result = result.filter((t) => t.is_free);
    if (activeCategory) result = result.filter((t) => t.category === activeCategory);
    if (search.length >= 2) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
      );
    }
    return result;
  }, [tools, freeOnly, activeCategory, search]);

  const grouped = useMemo(() => {
    const map = new Map<string, Map<string, AiTool[]>>();
    for (const tool of filtered) {
      if (!map.has(tool.category)) map.set(tool.category, new Map());
      const sub = map.get(tool.category)!;
      if (!sub.has(tool.subcategory)) sub.set(tool.subcategory, []);
      sub.get(tool.subcategory)!.push(tool);
    }
    return map;
  }, [filtered]);

  const handleLaunch = (tool: AiTool) => {
    trackClick.mutate(tool.id);
    window.open(tool.url, "_blank", "noopener,noreferrer");
  };

  const handleSubmit = async () => {
    if (!submitForm.name || !submitForm.url || !submitForm.category) {
      toast.error("Plotëso emrin, URL-në dhe kategorinë.");
      return;
    }
    try {
      await submitTool.mutateAsync(submitForm);
      toast.success("Mjeti u dërgua për shqyrtim!");
      setSubmitOpen(false);
      setSubmitForm({ name: "", url: "", category: "", subcategory: "", description: "", is_free: true });
    } catch (e: any) {
      toast.error(e.message || "Gabim gjatë dërgimit.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="border-b bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4 py-12 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">AI Tools Directory</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Zbulo 100+ mjete AI falas të organizuara sipas kategorisë. Nga gjenerimi i imazheve te kodimi, gjej mjetin e duhur për çdo nevojë.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3 max-w-xl mx-auto">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Kërko mjete AI..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch id="free-only" checked={freeOnly} onCheckedChange={setFreeOnly} />
                <Label htmlFor="free-only" className="text-sm whitespace-nowrap">Vetëm falas</Label>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="lg:w-64 shrink-0">
              <div className="sticky top-20 space-y-2">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-sm text-foreground">Kategoritë</h2>
                  <Badge variant="secondary" className="text-xs">{filtered.length}</Badge>
                </div>
                <Button
                  variant={activeCategory === null ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-start text-sm"
                  onClick={() => setActiveCategory(null)}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Të gjitha
                </Button>
                <ScrollArea className="h-[calc(100vh-280px)]">
                  <div className="space-y-1 pr-3">
                    {categories.map((cat) => {
                      const count = tools.filter((t) => t.category === cat && (!freeOnly || t.is_free)).length;
                      return (
                        <Button
                          key={cat}
                          variant={activeCategory === cat ? "default" : "ghost"}
                          size="sm"
                          className="w-full justify-between text-sm"
                          onClick={() => setActiveCategory(cat)}
                        >
                          <span className="truncate">{cat}</span>
                          <Badge variant="secondary" className="text-[10px] ml-2 shrink-0">{count}</Badge>
                        </Button>
                      );
                    })}
                  </div>
                </ScrollArea>
                <Button onClick={() => setSubmitOpen(true)} variant="outline" className="w-full mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Dërgo një mjet AI
                </Button>
              </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              {isLoading ? (
                <div className="text-center py-20 text-muted-foreground">Duke ngarkuar mjetet...</div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                  Asnjë mjet nuk u gjet. Provo të ndryshosh filtrat.
                </div>
              ) : (
                Array.from(grouped.entries()).map(([category, subcats]) => (
                  <div key={category} className="mb-10">
                    <div className="flex items-center gap-3 mb-5">
                      <h2 className="text-xl font-bold text-foreground">{category}</h2>
                      <Badge className={cn("text-xs", categoryColors[category] || "bg-muted text-muted-foreground")}>
                        {Array.from(subcats.values()).reduce((a, b) => a + b.length, 0)} mjete
                      </Badge>
                    </div>
                    {Array.from(subcats.entries()).map(([subcat, subTools]) => (
                      <div key={subcat} className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          <h3 className="text-sm font-medium text-muted-foreground">{subcat}</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                          {subTools.map((tool) => (
                            <Card
                              key={tool.id}
                              className="cursor-pointer hover:shadow-md transition-shadow group"
                              onClick={() => setSelectedTool(tool)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm shrink-0">
                                    {tool.name.charAt(0)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="font-medium text-sm text-foreground truncate">{tool.name}</p>
                                      {tool.is_featured && <Star className="h-3.5 w-3.5 text-primary fill-primary shrink-0" />}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{tool.description}</p>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between mt-3">
                                  <div className="flex gap-1.5">
                                    {tool.is_free && <Badge variant="secondary" className="text-[10px]">Falas</Badge>}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => { e.stopPropagation(); setSelectedTool(tool); }}
                                  >
                                    Shiko detajet
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Tool Detail Modal */}
      <Dialog open={!!selectedTool} onOpenChange={(v) => !v && setSelectedTool(null)}>
        <DialogContent className="sm:max-w-lg">
          {selectedTool && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-lg">
                    {selectedTool.name.charAt(0)}
                  </div>
                  <div>
                    <DialogTitle className="flex items-center gap-2">
                      {selectedTool.name}
                      {selectedTool.is_featured && <Star className="h-4 w-4 text-primary fill-primary" />}
                    </DialogTitle>
                    <DialogDescription>
                      {selectedTool.category} → {selectedTool.subcategory}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <p className="text-sm text-foreground">{selectedTool.description}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge className={cn(categoryColors[selectedTool.category] || "bg-muted text-muted-foreground")}>
                    {selectedTool.category}
                  </Badge>
                  {selectedTool.is_free && <Badge variant="secondary">Falas</Badge>}
                  {selectedTool.is_featured && <Badge variant="default">I rekomanduar</Badge>}
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">URL</p>
                  <a href={selectedTool.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
                    {selectedTool.url}
                  </a>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedTool(null)}>Mbyll</Button>
                <Button onClick={() => { handleLaunch(selectedTool); setSelectedTool(null); }}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Hap mjetin
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Submit Tool Modal */}
      <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Dërgo një mjet AI</DialogTitle>
            <DialogDescription>Shto një mjet të ri AI në direktorinë tonë. Do të shqyrtohet para publikimit.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Emri *</Label>
              <Input value={submitForm.name} onChange={(e) => setSubmitForm((p) => ({ ...p, name: e.target.value }))} placeholder="p.sh. ChatGPT" />
            </div>
            <div className="space-y-1.5">
              <Label>URL *</Label>
              <Input value={submitForm.url} onChange={(e) => setSubmitForm((p) => ({ ...p, url: e.target.value }))} placeholder="https://..." />
            </div>
            <div className="space-y-1.5">
              <Label>Kategoria *</Label>
              <Select value={submitForm.category} onValueChange={(v) => setSubmitForm((p) => ({ ...p, category: v }))}>
                <SelectTrigger><SelectValue placeholder="Zgjidh kategorinë" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Nënkategoria</Label>
              <Input value={submitForm.subcategory} onChange={(e) => setSubmitForm((p) => ({ ...p, subcategory: e.target.value }))} placeholder="p.sh. Text to Image" />
            </div>
            <div className="space-y-1.5">
              <Label>Përshkrimi</Label>
              <Textarea value={submitForm.description} onChange={(e) => setSubmitForm((p) => ({ ...p, description: e.target.value }))} placeholder="Përshkrim i shkurtër..." rows={3} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={submitForm.is_free} onCheckedChange={(v) => setSubmitForm((p) => ({ ...p, is_free: v }))} />
              <Label className="text-sm">Falas</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitOpen(false)}>Anulo</Button>
            <Button onClick={handleSubmit} disabled={submitTool.isPending}>
              {submitTool.isPending ? "Duke dërguar..." : "Dërgo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
