import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePublishedPosts } from "@/hooks/useContentEngine";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp } from "lucide-react";

export function PerformanceAnalytics() {
  const { data: posts = [], isLoading } = usePublishedPosts();

  if (isLoading) return <p className="text-muted-foreground">Duke ngarkuar...</p>;

  if (posts.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Nuk ka postime të publikuara ende. Publiko disa postime për të parë analitikën.
        </CardContent>
      </Card>
    );
  }

  // Engagement by platform
  const platformData = posts.reduce<Record<string, { likes: number; comments: number; shares: number; clicks: number; count: number }>>((acc, p) => {
    const pl = p.platform || "unknown";
    if (!acc[pl]) acc[pl] = { likes: 0, comments: 0, shares: 0, clicks: 0, count: 0 };
    acc[pl].likes += p.engagement_likes || 0;
    acc[pl].comments += p.engagement_comments || 0;
    acc[pl].shares += p.engagement_shares || 0;
    acc[pl].clicks += p.engagement_clicks || 0;
    acc[pl].count += 1;
    return acc;
  }, {});

  const barData = Object.entries(platformData).map(([platform, data]) => ({
    platform,
    likes: data.likes,
    comments: data.comments,
    shares: data.shares,
    clicks: data.clicks,
  }));

  const pieData = Object.entries(platformData).map(([name, data]) => ({
    name,
    value: data.count,
  }));

  const COLORS = ["hsl(225, 65%, 52%)", "hsl(262, 60%, 55%)", "hsl(160, 55%, 42%)", "hsl(30, 90%, 55%)"];

  // Best performing posts
  const bestPosts = [...posts]
    .sort((a, b) => {
      const engA = (a.engagement_likes || 0) + (a.engagement_comments || 0) + (a.engagement_shares || 0);
      const engB = (b.engagement_likes || 0) + (b.engagement_comments || 0) + (b.engagement_shares || 0);
      return engB - engA;
    })
    .slice(0, 5);

  // Best time analysis
  const hourData = posts.reduce<Record<number, number>>((acc, p) => {
    const hour = new Date(p.published_at).getHours();
    acc[hour] = (acc[hour] || 0) + ((p.engagement_likes || 0) + (p.engagement_comments || 0) + (p.engagement_shares || 0));
    return acc;
  }, {});

  const timeData = Object.entries(hourData)
    .map(([hour, engagement]) => ({ hour: `${hour}:00`, engagement }))
    .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Engagement sipas platformës</CardTitle></CardHeader>
          <CardContent>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="platform" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="likes" fill="hsl(225, 65%, 52%)" name="Likes" />
                  <Bar dataKey="comments" fill="hsl(262, 60%, 55%)" name="Comments" />
                  <Bar dataKey="shares" fill="hsl(160, 55%, 42%)" name="Shares" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-sm">Nuk ka të dhëna.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Shpërndarja e postimeve</CardTitle></CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-sm">Nuk ka të dhëna.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {timeData.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Koha më e mirë për postim</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={timeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="engagement" fill="hsl(262, 60%, 55%)" name="Engagement" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5" /> Postimet më të mira
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {bestPosts.map((post, i) => (
              <div key={post.id} className="flex items-start gap-3 border-b pb-3 last:border-0">
                <span className="text-lg font-bold text-muted-foreground">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{post.content.slice(0, 100)}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{post.platform}</span>
                    <span>❤️ {post.engagement_likes}</span>
                    <span>💬 {post.engagement_comments}</span>
                    <span>🔁 {post.engagement_shares}</span>
                    <span>🔗 {post.engagement_clicks}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
