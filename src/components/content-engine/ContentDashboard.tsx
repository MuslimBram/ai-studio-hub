import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useScheduledPosts, usePublishedPosts, useSocialAccounts, useContentSuggestions } from "@/hooks/useContentEngine";
import { CalendarDays, FileText, TrendingUp, Users, Zap, BarChart3 } from "lucide-react";

export function ContentDashboard() {
  const { data: scheduled = [] } = useScheduledPosts();
  const { data: published = [] } = usePublishedPosts();
  const { data: accounts = [] } = useSocialAccounts();
  const { data: suggestions = [] } = useContentSuggestions();

  const upcomingPosts = scheduled.filter((p) => p.status === "scheduled");
  const totalEngagement = published.reduce(
    (sum, p) => sum + (p.engagement_likes || 0) + (p.engagement_comments || 0) + (p.engagement_shares || 0),
    0
  );

  const stats = [
    { label: "Kanale të lidhura", value: accounts.filter((a) => a.is_connected).length, icon: Users, color: "text-primary" },
    { label: "Postime të planifikuara", value: upcomingPosts.length, icon: CalendarDays, color: "text-accent" },
    { label: "Postime të publikuara", value: published.length, icon: FileText, color: "text-emerald-500" },
    { label: "Sugjerime AI", value: suggestions.length, icon: Zap, color: "text-amber-500" },
    { label: "Engagement total", value: totalEngagement, icon: TrendingUp, color: "text-rose-500" },
    { label: "Draft", value: scheduled.filter((p) => p.status === "draft").length, icon: BarChart3, color: "text-muted-foreground" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{s.label}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              <s.icon className={`h-5 w-5 ${s.color}`} />
              <span className="text-2xl font-bold">{s.value}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Postimet e ardhshme</CardTitle></CardHeader>
          <CardContent>
            {upcomingPosts.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nuk ka postime të planifikuara.</p>
            ) : (
              <div className="space-y-3">
                {upcomingPosts.slice(0, 5).map((post) => (
                  <div key={post.id} className="flex items-start gap-3 border-b pb-3 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{post.content.slice(0, 80)}...</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-secondary px-2 py-0.5 rounded">{post.platform}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(post.scheduled_at).toLocaleDateString("sq-AL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Postimet e fundit</CardTitle></CardHeader>
          <CardContent>
            {published.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nuk ka postime të publikuara ende.</p>
            ) : (
              <div className="space-y-3">
                {published.slice(0, 5).map((post) => (
                  <div key={post.id} className="flex items-start gap-3 border-b pb-3 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{post.content.slice(0, 80)}...</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-secondary px-2 py-0.5 rounded">{post.platform}</span>
                        <span className="text-xs text-muted-foreground">
                          ❤️ {post.engagement_likes} 💬 {post.engagement_comments} 🔁 {post.engagement_shares}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
