import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, AlertCircle, RefreshCw, Info } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export type ChannelStatus = "not_connected" | "connecting" | "connected" | "failed" | "reconnect_required";

interface ChannelCardProps {
  name: string;
  subtitle: string;
  icon: LucideIcon;
  iconColor?: string;
  status: ChannelStatus;
  supported: boolean;
  onClick: () => void;
}

const statusConfig: Record<ChannelStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon?: LucideIcon }> = {
  not_connected: { label: "", variant: "outline" },
  connecting: { label: "Duke u lidhur...", variant: "secondary", icon: Loader2 },
  connected: { label: "E lidhur", variant: "default", icon: CheckCircle2 },
  failed: { label: "Dështoi", variant: "destructive", icon: AlertCircle },
  reconnect_required: { label: "Rilidhu", variant: "destructive", icon: RefreshCw },
};

export function ChannelCard({ name, subtitle, icon: Icon, iconColor, status, supported, onClick }: ChannelCardProps) {
  const cfg = statusConfig[status];
  const StatusIcon = cfg.icon;

  return (
    <button
      onClick={onClick}
      disabled={!supported || status === "connecting"}
      className={cn(
        "group relative flex flex-col items-center gap-2.5 rounded-xl border bg-card p-4 text-center transition-all duration-200",
        "hover:shadow-md hover:border-primary/40 hover:scale-[1.02]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none",
        status === "connected" && "border-primary/50 bg-primary/5",
        status === "failed" && "border-destructive/40",
      )}
      aria-label={`${supported ? "Lidh" : "Së shpejti"}: ${name}`}
    >
      {/* Info tooltip */}
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className="absolute top-2 right-2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <Info className="h-3.5 w-3.5" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs max-w-[200px]">
          {supported ? "Kliko për të lidhur" : "Së shpejti — kërko këtë kanal"}
        </TooltipContent>
      </Tooltip>

      {/* Channel icon — large, colored per-platform */}
      <Icon className={cn("h-7 w-7", iconColor || "text-foreground")} />

      {/* Channel name + subtitle */}
      <div className="space-y-0.5">
        <h4 className="font-semibold text-sm text-foreground leading-tight">{name}</h4>
        <p className="text-[11px] text-muted-foreground leading-tight">{subtitle}</p>
      </div>

      {/* Status badge */}
      {status !== "not_connected" && (
        <Badge variant={cfg.variant} className="text-[10px] gap-1 mt-auto">
          {StatusIcon && <StatusIcon className={cn("h-3 w-3", status === "connecting" && "animate-spin")} />}
          {cfg.label}
        </Badge>
      )}

      {!supported && status === "not_connected" && (
        <span className="text-[10px] text-muted-foreground/70 mt-auto">Së shpejti</span>
      )}
    </button>
  );
}

/** Special "Request a channel" card */
export function RequestChannelCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-card p-4 text-center transition-all duration-200",
        "hover:shadow-sm hover:border-primary/30 hover:bg-primary/5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      )}
      aria-label="Kërko një kanal"
    >
      <span className="text-2xl text-muted-foreground/60 group-hover:text-primary transition-colors">+</span>
      <div className="space-y-0.5">
        <h4 className="font-semibold text-sm text-foreground leading-tight">Nuk e gjen?</h4>
        <p className="text-[11px] text-muted-foreground leading-tight">Kërko një kanal</p>
      </div>
    </button>
  );
}
