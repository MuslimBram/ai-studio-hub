import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useGenerateContent, useSaveContentSuggestion } from "@/hooks/useContentEngine";
import { Sparkles, Copy, CalendarPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function ContentGenerator() {
  const [type, setType] = useState("caption");
  const [platform, setPlatform] = useState("facebook");
  const [tone, setTone] = useState("professional");
  const [keywords, setKeywords] = useState("");
  const [businessDesc, setBusinessDesc] = useState("");
  const [result, setResult] = useState<any>(null);

  const generate = useGenerateContent();
  const saveSuggestion = useSaveContentSuggestion();

  const handleGenerate = async () => {
    try {
      const res = await generate.mutateAsync({
        type,
        platform,
        tone,
        keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
        businessDescription: businessDesc || undefined,
      });
      setResult(res.data);
    } catch (e: any) {
      toast.error(e.message || "Gabim gjatë gjenerimit");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("U kopjua!");
  };

  const saveCaption = async (caption: any) => {
    try {
      await saveSuggestion.mutateAsync({
        suggestion_type: "caption",
        content: caption.text,
        tone,
        keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
        platform,
        score: caption.engagementScore || 0,
      });
      toast.success("Sugjerimi u ruajt!");
    } catch (e: any) {
      toast.error(e.message || "Gabim");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            Gjenero përmbajtje me AI
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="caption">Captions</SelectItem>
                <SelectItem value="hashtags">Hashtags</SelectItem>
                <SelectItem value="content_plan">Plan Javor</SelectItem>
                <SelectItem value="seo_optimize">SEO Optimizim</SelectItem>
                <SelectItem value="competitor_analysis">Analiza Konkurencës</SelectItem>
              </SelectContent>
            </Select>

            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
              </SelectContent>
            </Select>

            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Profesional</SelectItem>
                <SelectItem value="casual">Miqësor</SelectItem>
                <SelectItem value="sales">Shitje</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Input placeholder="Fjalë kyçe (ndarë me presje)" value={keywords} onChange={(e) => setKeywords(e.target.value)} />

          <Textarea placeholder="Përshkrimi i biznesit (opsionale)" value={businessDesc} onChange={(e) => setBusinessDesc(e.target.value)} rows={3} />

          <Button onClick={handleGenerate} disabled={generate.isPending} className="w-full">
            {generate.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Duke gjeneruar...</> : <><Sparkles className="h-4 w-4 mr-2" /> Gjenero</>}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader><CardTitle>Rezultatet</CardTitle></CardHeader>
          <CardContent>
            {/* Captions */}
            {result.captions && (
              <div className="space-y-4">
                {result.captions.map((c: any, i: number) => (
                  <div key={i} className="border rounded-lg p-4 space-y-2">
                    <p className="text-sm">{c.text}</p>
                    {c.hashtags?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {c.hashtags.map((h: string, j: number) => <Badge key={j} variant="secondary">#{h}</Badge>)}
                      </div>
                    )}
                    {c.cta && <p className="text-xs text-accent font-medium">CTA: {c.cta}</p>}
                    {c.engagementScore && (
                      <Badge variant="outline">Engagement: {c.engagementScore}/10</Badge>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(c.text)}>
                        <Copy className="h-3 w-3 mr-1" /> Kopjo
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => saveCaption(c)}>
                        <CalendarPlus className="h-3 w-3 mr-1" /> Ruaj
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Hashtags */}
            {result.hashtags && (
              <div className="space-y-4">
                {Object.entries(result.hashtags).map(([group, tags]: [string, any]) => (
                  <div key={group}>
                    <h4 className="text-sm font-medium mb-2 capitalize">{group} reach</h4>
                    <div className="flex flex-wrap gap-1">
                      {(tags as string[]).map((tag, i) => (
                        <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => copyToClipboard(`#${tag}`)}>
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Content plan */}
            {result.plan && (
              <div className="space-y-3">
                {result.plan.map((day: any) => (
                  <div key={day.day} className="border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge>Dita {day.day}</Badge>
                      <Badge variant="outline">{day.contentType}</Badge>
                      <span className="text-xs text-muted-foreground">🕐 {day.bestTime}</span>
                    </div>
                    <p className="text-sm font-medium">{day.topic}</p>
                    <p className="text-sm text-muted-foreground mt-1">{day.caption}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {day.hashtags?.map((h: string, i: number) => <span key={i} className="text-xs text-primary">#{h}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* SEO */}
            {result.optimized && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-primary">{result.optimized.readabilityScore}/10</p>
                    <p className="text-xs text-muted-foreground">Lexueshmëria</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-accent capitalize">{result.optimized.engagementPrediction}</p>
                    <p className="text-xs text-muted-foreground">Engagement</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold">{result.optimized.suggestedKeywords?.length || 0}</p>
                    <p className="text-xs text-muted-foreground">Fjalë kyçe</p>
                  </div>
                </div>
                {result.optimized.improvements?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Përmirësime</h4>
                    <ul className="space-y-1">
                      {result.optimized.improvements.map((imp: string, i: number) => (
                        <li key={i} className="text-sm text-muted-foreground">• {imp}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Competitor analysis */}
            {result.analysis && (
              <div className="space-y-4">
                {result.analysis.themes?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Temat kryesore</h4>
                    <div className="flex flex-wrap gap-1">{result.analysis.themes.map((t: string, i: number) => <Badge key={i}>{t}</Badge>)}</div>
                  </div>
                )}
                {result.analysis.keywordGaps?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Mungesat në fjalë kyçe</h4>
                    <div className="flex flex-wrap gap-1">{result.analysis.keywordGaps.map((g: string, i: number) => <Badge key={i} variant="destructive">{g}</Badge>)}</div>
                  </div>
                )}
                {result.analysis.suggestedTopics?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Tema të sugjeruara</h4>
                    <div className="flex flex-wrap gap-1">{result.analysis.suggestedTopics.map((t: string, i: number) => <Badge key={i} variant="secondary">{t}</Badge>)}</div>
                  </div>
                )}
              </div>
            )}

            {/* Raw fallback */}
            {result.raw && <pre className="text-sm bg-muted p-4 rounded-lg whitespace-pre-wrap">{result.raw}</pre>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
