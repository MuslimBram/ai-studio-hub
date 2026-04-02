import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useCompetitorData, useAddCompetitor, useGenerateContent } from "@/hooks/useContentEngine";
import { Search, Plus, Loader2, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export function CompetitorAnalysis() {
  const { data: competitors = [], isLoading } = useCompetitorData();
  const addCompetitor = useAddCompetitor();
  const generateContent = useGenerateContent();

  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [platform, setPlatform] = useState("facebook");
  const [analyzing, setAnalyzing] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!name.trim()) { toast.error("Vendos emrin e konkurentit"); return; }
    try {
      await addCompetitor.mutateAsync({ competitor_name: name, competitor_url: url, platform });
      setName(""); setUrl("");
      toast.success("Konkurenti u shtua!");
    } catch (e: any) {
      toast.error(e.message || "Gabim");
    }
  };

  const handleAnalyze = async (competitor: any) => {
    setAnalyzing(competitor.id);
    try {
      const res = await generateContent.mutateAsync({
        type: "competitor_analysis",
        platform: competitor.platform,
        keywords: [competitor.competitor_name, competitor.competitor_url].filter(Boolean),
        competitorContext: `Competitor: ${competitor.competitor_name} (${competitor.competitor_url})`,
      });
      // The result is shown in the content generator tab but we could also update competitor_data
      toast.success("Analiza u përfundua! Shiko rezultatet në tab-in AI Content.");
    } catch (e: any) {
      toast.error(e.message || "Gabim");
    } finally {
      setAnalyzing(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Search className="h-5 w-5" /> Shto konkurent</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-3">
            <Input placeholder="Emri i konkurentit" value={name} onChange={(e) => setName(e.target.value)} className="flex-1" />
            <Input placeholder="URL (opsionale)" value={url} onChange={(e) => setUrl(e.target.value)} className="flex-1" />
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleAdd} disabled={addCompetitor.isPending}>
              <Plus className="h-4 w-4 mr-1" /> Shto
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <p className="text-muted-foreground">Duke ngarkuar...</p>
      ) : competitors.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-muted-foreground">Nuk ke shtuar konkurentë ende.</CardContent></Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {competitors.map((comp) => (
            <Card key={comp.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>{comp.competitor_name}</span>
                  <Badge variant="outline">{comp.platform}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {comp.competitor_url && (
                  <p className="text-xs text-muted-foreground truncate">{comp.competitor_url}</p>
                )}

                {comp.keywords?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium mb-1">Fjalë kyçe</p>
                    <div className="flex flex-wrap gap-1">
                      {comp.keywords.map((k, i) => <Badge key={i} variant="secondary" className="text-xs">{k}</Badge>)}
                    </div>
                  </div>
                )}

                {comp.content_gaps?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium mb-1">Mungesat</p>
                    <div className="flex flex-wrap gap-1">
                      {comp.content_gaps.map((g, i) => <Badge key={i} variant="destructive" className="text-xs">{g}</Badge>)}
                    </div>
                  </div>
                )}

                {comp.suggested_topics?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium mb-1">Tema të sugjeruara</p>
                    <div className="flex flex-wrap gap-1">
                      {comp.suggested_topics.map((t, i) => <Badge key={i} className="text-xs">{t}</Badge>)}
                    </div>
                  </div>
                )}

                <Button variant="outline" size="sm" className="w-full" onClick={() => handleAnalyze(comp)} disabled={analyzing === comp.id}>
                  {analyzing === comp.id ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Duke analizuar...</> : <><TrendingUp className="h-3 w-3 mr-1" /> Analizo me AI</>}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
