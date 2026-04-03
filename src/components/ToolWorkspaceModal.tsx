import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Loader2, Copy, ExternalLink } from "lucide-react";
import { useGenerateContent } from "@/hooks/useContentEngine";
import { useAiAction } from "@/hooks/useAiAction";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface ToolWorkspaceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tool: {
    title: string;
    shortDescription: string;
    provider: string;
    modelType: string;
    website_url?: string;
    tags: string[];
  };
}

export function ToolWorkspaceModal({ open, onOpenChange, tool }: ToolWorkspaceModalProps) {
  const [prompt, setPrompt] = useState("");
  const [platform, setPlatform] = useState("facebook");
  const [result, setResult] = useState<any>(null);
  const { t } = useLanguage();

  const generate = useGenerateContent();
  const aiAction = useAiAction();
  const { canPerformAction, isAdmin } = usePlanLimits();

  const handleGenerate = async () => {
    if (!prompt.trim()) { toast.error(t('workspace_empty_prompt')); return; }
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
        type: "caption", platform, tone: "professional",
        keywords: prompt.split(" ").filter(Boolean).slice(0, 10),
        businessDescription: prompt,
      });
      setResult(res.data);
    } catch (e: any) { toast.error(e.message || t('workspace_generate_error')); }
  };

  const copyText = (text: string) => { navigator.clipboard.writeText(text); toast.success(t('workspace_copied')); };
  const isPending = generate.isPending || aiAction.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-xl flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {tool.title}
          </DialogTitle>
          <DialogDescription>{tool.shortDescription}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1" style={{ maxHeight: "calc(85vh - 120px)" }}>
          <div className="p-6 space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{tool.provider}</Badge>
              <Badge variant="outline">{tool.modelType}</Badge>
              {tool.tags.slice(0, 3).map((tag, i) => <Badge key={i} variant="secondary">#{tag}</Badge>)}
            </div>
            <Textarea placeholder={t('workspace_prompt_placeholder')} value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4} className="resize-none" />
            <div className="flex gap-2">
              <Button onClick={handleGenerate} disabled={isPending} className="flex-1">
                {isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t('workspace_generating')}</> : <><Sparkles className="h-4 w-4 mr-2" /> {t('workspace_generate')}</>}
              </Button>
              {tool.website_url && (
                <Button variant="outline" size="icon" asChild title={t('tool_visit_original')}>
                  <a href={tool.website_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /></a>
                </Button>
              )}
            </div>
            {result && (
              <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
                <h4 className="text-sm font-semibold">{t('workspace_results')}</h4>
                {result.captions?.map((c: any, i: number) => (
                  <div key={i} className="border rounded-lg p-3 bg-background space-y-2">
                    <p className="text-sm">{c.text}</p>
                    {c.hashtags?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {c.hashtags.map((h: string, j: number) => <Badge key={j} variant="secondary" className="text-[10px]">#{h}</Badge>)}
                      </div>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => copyText(c.text)}>
                      <Copy className="h-3 w-3 mr-1" /> {t('workspace_copy')}
                    </Button>
                  </div>
                ))}
                {result.raw && <pre className="text-sm bg-muted p-3 rounded whitespace-pre-wrap">{result.raw}</pre>}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
