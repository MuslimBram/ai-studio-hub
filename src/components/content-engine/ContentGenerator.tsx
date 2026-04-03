import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useGenerateContent, useSaveContentSuggestion } from "@/hooks/useContentEngine";
import { useAiAction } from "@/hooks/useAiAction";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { PlanUpgradePrompt } from "@/components/PlanUpgradePrompt";
import { AiUsageMeter } from "@/components/AiUsageMeter";
import { Sparkles, Copy, CalendarPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

export function ContentGenerator() {
  const [type, setType] = useState("caption");
  const [platform, setPlatform] = useState("facebook");
  const [tone, setTone] = useState("professional");
  const [keywords, setKeywords] = useState("");
  const [businessDesc, setBusinessDesc] = useState("");
  const [result, setResult] = useState<any>(null);
  const { t } = useLanguage();

  const generate = useGenerateContent();
  const saveSuggestion = useSaveContentSuggestion();
  const aiAction = useAiAction();
  const { canPerformAction, isAdmin } = usePlanLimits();

  const handleGenerate = async () => {
    if (!isAdmin) {
      const check = canPerformAction("text_generation", "content");
      if (!check.allowed) { toast.error(check.reason); return; }
      try {
        const usageResult = await aiAction.mutateAsync({ actionType: "text_generation", category: "content" });
        if (!usageResult.allowed) { toast.error(usageResult.reason || t('workspace_ai_limit')); return; }
      } catch { toast.error(t('workspace_ai_error')); return; }
    }
    try {
      const res = await generate.mutateAsync({
        type, platform, tone,
        keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
        businessDescription: businessDesc || undefined,
      });
      setResult(res.data);
    } catch (e: any) { toast.error(e.message || t('workspace_generate_error')); }
  };

  const copyToClipboard = (text: string) => { navigator.clipboard.writeText(text); toast.success(t('workspace_copied')); };

  const saveCaption = async (caption: any) => {
    try {
      await saveSuggestion.mutateAsync({
        suggestion_type: "caption", content: caption.text, tone,
        keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
        platform, score: caption.engagementScore || 0,
      });
      toast.success(t('cg_saved'));
    } catch (e: any) { toast.error(e.message || t('common_error')); }
  };

  const isPending = generate.isPending || aiAction.isPending;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            {t('cg_title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="caption">{t('cg_captions')}</SelectItem>
                <SelectItem value="hashtags">{t('cg_hashtags')}</SelectItem>
                <SelectItem value="content_plan">{t('cg_weekly_plan')}</SelectItem>
                <SelectItem value="seo_optimize">{t('cg_seo')}</SelectItem>
                <SelectItem value="competitor_analysis">{t('cg_competitor_analysis')}</SelectItem>
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
                <SelectItem value="professional">{t('cg_professional')}</SelectItem>
                <SelectItem value="casual">{t('cg_casual')}</SelectItem>
                <SelectItem value="sales">{t('cg_sales')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Input placeholder={t('cg_keywords_placeholder')} value={keywords} onChange={(e) => setKeywords(e.target.value)} />
          <Textarea placeholder={t('cg_business_placeholder')} value={businessDesc} onChange={(e) => setBusinessDesc(e.target.value)} rows={3} />
          <Button onClick={handleGenerate} disabled={isPending} className="w-full">
            {isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t('cg_generating')}</> : <><Sparkles className="h-4 w-4 mr-2" /> {t('cg_generate')}</>}
          </Button>
          <AiUsageMeter compact />
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader><CardTitle>{t('cg_results')}</CardTitle></CardHeader>
          <CardContent>
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
                    {c.engagementScore && <Badge variant="outline">{t('cg_engagement')}: {c.engagementScore}/10</Badge>}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(c.text)}>
                        <Copy className="h-3 w-3 mr-1" /> {t('cg_copy')}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => saveCaption(c)}>
                        <CalendarPlus className="h-3 w-3 mr-1" /> {t('cg_save')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {result.hashtags && (
              <div className="space-y-4">
                {Object.entries(result.hashtags).map(([group, tags]: [string, any]) => (
                  <div key={group}>
                    <h4 className="text-sm font-medium mb-2 capitalize">{group} reach</h4>
                    <div className="flex flex-wrap gap-1">
                      {(tags as string[]).map((tag, i) => (
                        <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => copyToClipboard(`#${tag}`)}>#{tag}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {result.plan && (
              <div className="space-y-3">
                {result.plan.map((day: any) => (
                  <div key={day.day} className="border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge>{t('cg_day')} {day.day}</Badge>
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
            {result.optimized && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-primary">{result.optimized.readabilityScore}/10</p>
                    <p className="text-xs text-muted-foreground">{t('cg_readability')}</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-accent capitalize">{result.optimized.engagementPrediction}</p>
                    <p className="text-xs text-muted-foreground">{t('cg_engagement')}</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold">{result.optimized.suggestedKeywords?.length || 0}</p>
                    <p className="text-xs text-muted-foreground">{t('cg_keywords_count')}</p>
                  </div>
                </div>
                {result.optimized.improvements?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">{t('cg_improvements')}</h4>
                    <ul className="space-y-1">
                      {result.optimized.improvements.map((imp: string, i: number) => (
                        <li key={i} className="text-sm text-muted-foreground">• {imp}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            {result.analysis && (
              <div className="space-y-4">
                {result.analysis.themes?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">{t('cg_main_themes')}</h4>
                    <div className="flex flex-wrap gap-1">{result.analysis.themes.map((tt: string, i: number) => <Badge key={i}>{tt}</Badge>)}</div>
                  </div>
                )}
                {result.analysis.keywordGaps?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">{t('cg_keyword_gaps')}</h4>
                    <div className="flex flex-wrap gap-1">{result.analysis.keywordGaps.map((g: string, i: number) => <Badge key={i} variant="destructive">{g}</Badge>)}</div>
                  </div>
                )}
                {result.analysis.suggestedTopics?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">{t('cg_suggested_topics')}</h4>
                    <div className="flex flex-wrap gap-1">{result.analysis.suggestedTopics.map((tt: string, i: number) => <Badge key={i} variant="secondary">{tt}</Badge>)}</div>
                  </div>
                )}
              </div>
            )}
            {result.raw && <pre className="text-sm bg-muted p-4 rounded-lg whitespace-pre-wrap">{result.raw}</pre>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
