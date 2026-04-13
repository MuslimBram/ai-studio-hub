import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type Status = "processing" | "success" | "error";

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("processing");
  const [message, setMessage] = useState("");
  const [accountName, setAccountName] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    const stateB64 = searchParams.get("state");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      setStatus("error");
      setMessage(searchParams.get("error_description") || "Autorizimi u refuzua.");
      return;
    }

    if (!code || !stateB64) {
      setStatus("error");
      setMessage("Parametra të pavlefshme në callback URL.");
      return;
    }

    exchangeCode(code, stateB64);
  }, []);

  const exchangeCode = async (code: string, stateB64: string) => {
    try {
      const redirectUri = `${window.location.origin}/oauth/callback`;
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      if (!token) {
        throw new Error("Nuk je i kyçur. Kyçu dhe provo përsëri.");
      }

      // Determine which function to call based on state
      let platform = "facebook";
      try {
        const stateData = JSON.parse(atob(stateB64));
        platform = stateData.platform || "facebook";
      } catch {}

      // Route to the correct edge function
      let functionName: string;
      if (["facebook", "instagram", "threads"].includes(platform)) {
        functionName = "meta-oauth";
      } else if (platform === "linkedin") {
        functionName = "linkedin-oauth";
      } else {
        functionName = `${platform}-oauth`;
      }

      const fnUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${functionName}?action=callback`;
      const res = await fetch(fnUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ code, redirectUri, state: stateB64 }),
      });

      const result = await res.json();

      if (!res.ok || result.error) {
        throw new Error(result.error || "Token exchange dështoi");
      }

      setAccountName(result.accountName || "");
      setStatus("success");
      setMessage(`${result.platform || "Kanali"} u lidh me sukses!`);

      if (window.opener && !window.opener.closed) {
        window.opener.postMessage({
          type: "social-oauth-result",
          status: "success",
          platform: result.platform,
          accountName: result.accountName || "",
          message: `${result.platform || "Kanali"} u lidh me sukses!`,
        }, window.location.origin);
        window.close();
      }
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Gabim gjatë lidhjes së kanalit.");

      if (window.opener && !window.opener.closed) {
        window.opener.postMessage({
          type: "social-oauth-result",
          status: "error",
          message: err.message || "Gabim gjatë lidhjes së kanalit.",
        }, window.location.origin);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {status === "processing" && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <h1 className="text-xl font-semibold text-foreground">Duke përpunuar autorizimin...</h1>
            <p className="text-muted-foreground">Mos e mbyll këtë dritare.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mx-auto">
              <CheckCircle2 className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">{message}</h1>
            {accountName && (
              <p className="text-muted-foreground">Llogaria: <strong>{accountName}</strong></p>
            )}
            <Button onClick={() => navigate("/content-engine")} className="mt-4">
              Kthehu te Content Engine
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mx-auto">
              <XCircle className="h-7 w-7 text-destructive" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">Lidhja dështoi</h1>
            <p className="text-muted-foreground">{message}</p>
            <div className="flex gap-3 justify-center mt-4">
              <Button variant="outline" onClick={() => navigate("/content-engine")}>
                Kthehu
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
