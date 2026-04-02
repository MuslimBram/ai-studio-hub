import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import type { LucideIcon } from "lucide-react";

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
        "group relative flex flex-col items-center gap-3 rounded-xl border bg-card p-5 text-center transition-all duration-200",
        "hover:shadow-md hover:border-primary/40 hover:scale-[1.02]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none",
        status === "connected" && "border-primary/50 bg-primary/5",
        status === "failed" && "border-destructive/40",
      )}
      aria-label={`${supported ? "Lidh" : "Së shpejti"}: ${name}`}
    >
      {!supported && (
        <Badge variant="secondary" className="absolute top-2 right-2 text-[10px]">
          Së shpejti
        </Badge>
      )}

      <div className={cn("flex h-12 w-12 items-center justify-center rounded-lg bg-muted transition-colors group-hover:bg-primary/10")}>
        <Icon className={cn("h-6 w-6", iconColor || "text-foreground")} />
      </div>

      <div className="space-y-0.5">
        <p className="font-medium text-sm text-foreground">{name}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>

      {status !== "not_connected" && (
        <Badge variant={cfg.variant} className="text-[10px] gap-1">
          {StatusIcon && <StatusIcon className={cn("h-3 w-3", status === "connecting" && "animate-spin")} />}
          {cfg.label}
        </Badge>
      )}
    </button>
  );
}
