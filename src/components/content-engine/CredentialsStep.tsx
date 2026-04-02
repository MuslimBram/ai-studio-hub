import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2 } from "lucide-react";
import { type ChannelDefinition, type ModeDefinition, capabilityLabels } from "./channels-config";

interface CredentialsStepProps {
  channel: ChannelDefinition;
  selectedMode: ModeDefinition;
  onConnect: (formData: Record<string, string>) => void;
  connecting: boolean;
}

const channelFields: Record<string, { label: string; key: string; type?: string; placeholder: string }[]> = {
  linkedin: [
    { label: "Emri i Profilit / Kompanisë", key: "account_name", placeholder: "p.sh. Kompania Ime" },
    { label: "LinkedIn ID", key: "account_id", placeholder: "LinkedIn Organization ID" },
  ],
  telegram: [
    { label: "Emri i Botit", key: "account_name", placeholder: "p.sh. MyBot" },
    { label: "Bot Token", key: "account_id", placeholder: "123456:ABC-DEF..." },
  ],
  whatsapp: [
    { label: "Numri i Biznesit", key: "account_name", placeholder: "+355..." },
    { label: "WhatsApp Business API ID", key: "account_id", placeholder: "Phone Number ID" },
  ],
  email: [
    { label: "Emri i llogarisë", key: "account_name", placeholder: "Newsletter" },
    { label: "Email / SMTP", key: "account_id", placeholder: "info@biznesi.com" },
  ],
  custom: [
    { label: "Emri i kanalit", key: "account_name", placeholder: "Kanali im" },
    { label: "Webhook URL", key: "account_id", placeholder: "https://..." },
  ],
};

export function CredentialsStep({ channel, selectedMode, onConnect, connecting }: CredentialsStepProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const Icon = channel.icon;
  const fields = channelFields[channel.platform] || channelFields.custom;

  return (
    <div className="space-y-5 px-6 py-6">
      {/* Channel + mode header */}
      <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background">
          <Icon className={`h-5 w-5 ${channel.iconColor}`} />
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">{channel.name}</p>
          <p className="text-xs text-muted-foreground">{selectedMode.label}</p>
        </div>
        <Badge variant="outline" className="text-[10px]">
          {selectedMode.capabilities.length} veçori
        </Badge>
      </div>

      {/* Capabilities summary */}
      <div className="flex flex-wrap gap-1.5">
        {selectedMode.capabilities.map((cap) => (
          <Badge key={cap} variant="secondary" className="text-[10px]">
            {capabilityLabels[cap]}
          </Badge>
        ))}
      </div>

      {/* Credential fields */}
      {fields.map((field) => (
        <div key={field.key} className="space-y-2">
          <Label htmlFor={field.key}>{field.label}</Label>
          <Input
            id={field.key}
            type={field.type || "text"}
            placeholder={field.placeholder}
            value={formData[field.key] || ""}
            onChange={(e) => setFormData((prev) => ({ ...prev, [field.key]: e.target.value }))}
            disabled={connecting}
          />
        </div>
      ))}

      <Button onClick={() => onConnect(formData)} disabled={connecting} className="w-full" size="lg">
        {connecting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Duke u lidhur...
          </>
        ) : (
          <>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Lidh {channel.name}
          </>
        )}
      </Button>
    </div>
  );
}
