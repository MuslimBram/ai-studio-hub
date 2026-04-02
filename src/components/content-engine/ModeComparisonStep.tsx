import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle2, XCircle } from "lucide-react";
import { type ChannelDefinition, type ModeDefinition, type Capability, capabilityLabels } from "./channels-config";

interface ModeComparisonStepProps {
  channel: ChannelDefinition;
  onSelectMode: (mode: ModeDefinition) => void;
  connecting: boolean;
}

/** All capabilities to compare across modes */
const compareCapabilities: Capability[] = [
  "auto_post",
  "manual_post",
  "scheduling",
  "analytics",
  "comments",
  "messaging",
  "inbox",
  "stories",
  "reels",
  "notifications",
];

export function ModeComparisonStep({ channel, onSelectMode, connecting }: ModeComparisonStepProps) {
  const Icon = channel.icon;
  const modes = channel.modes;
  const relevantCaps = compareCapabilities.filter((cap) =>
    modes.some((m) => m.capabilities.includes(cap)),
  );

  return (
    <div className="space-y-5 px-6 py-6">
      {/* Channel header */}
      <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background">
          <Icon className={`h-5 w-5 ${channel.iconColor}`} />
        </div>
        <div>
          <p className="font-medium text-sm">{channel.name}</p>
          <p className="text-xs text-muted-foreground">{channel.subtitle}</p>
        </div>
      </div>

      {/* Security note */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
        <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground">
          Lidhja bëhet përmes autorizimit zyrtar të platformës. Nuk ruajmë fjalëkalimin tënd.
        </p>
      </div>

      {/* Feature comparison table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="grid" style={{ gridTemplateColumns: `1fr ${modes.map(() => "1fr").join(" ")}` }}>
          {/* Header row */}
          <div className="p-3 bg-muted/30 border-b text-xs font-medium text-muted-foreground">
            Veçoria
          </div>
          {modes.map((m) => (
            <div key={m.mode} className="p-3 bg-muted/30 border-b border-l text-center">
              <p className="text-xs font-semibold">{m.label}</p>
            </div>
          ))}

          {/* Capability rows */}
          {relevantCaps.map((cap) => (
            <div key={cap} className="contents">
              <div className="p-3 border-b text-sm text-foreground flex items-center">
                {capabilityLabels[cap]}
              </div>
              {modes.map((m) => {
                const has = m.capabilities.includes(cap);
                return (
                  <div key={m.mode} className="p-3 border-b border-l flex items-center justify-center">
                    {has ? (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground/40" />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Mode selection buttons */}
      <div className="grid gap-3" style={{ gridTemplateColumns: modes.length > 1 ? "1fr 1fr" : "1fr" }}>
        {modes.map((m) => (
          <Button
            key={m.mode}
            onClick={() => onSelectMode(m)}
            disabled={connecting}
            variant={m.mode === "professional" ? "default" : "outline"}
            size="lg"
            className="w-full flex flex-col h-auto py-4 gap-1"
          >
            <span className="font-semibold">{m.label}</span>
            <span className="text-[11px] opacity-80 font-normal leading-tight">
              {m.capabilities.length} veçori
            </span>
          </Button>
        ))}
      </div>

      {modes.length > 1 && (
        <p className="text-[11px] text-muted-foreground text-center">
          Mund të ndryshosh modalitetin më vonë duke u rilidhur.
        </p>
      )}
    </div>
  );
}
