import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAnalyticsSnapshots, usePostMetrics } from "@/hooks/useAnalytics";
import { useSocialAccounts } from "@/hooks/useContentEngine";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { TrendingUp, TrendingDown, Users, Eye, MousePointerClick, Heart, MessageCircle, Share2, Activity } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const COLORS = ["hsl(225, 65%, 52%)", "hsl(262, 60%, 55%)", "hsl(160, 55%, 42%)", "hsl(30, 90%, 55%)", "hsl(340, 65%, 50%)"];

function MetricCard({ title, value, icon: Icon, change, color }: { title: string; value: string | number; icon: any; change?: number; color?: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{typeof value === "number" ? value.toLocaleString() : value}</p>
            {change !== undefined && (
              <div className={`flex items-center gap-1 mt-1 text-xs ${change >= 0 ? "text-green-600" : "text-red-500"}`}>
                {change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span>{change >= 0 ? "+" : ""}{change.toFixed(1)}%</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full bg-primary/10 ${color || "text-primary"}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AnalyticsDashboard() {
  const { t } = useLanguage();
  const { data: accounts = [] } = useSocialAccounts();
  const [selectedAccount, setSelectedAccount] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("30");

  const connectedAccounts = accounts.filter((a) => a.is_connected && (a as any).status !== "deleted");
  const accountId = selectedAccount === "all" ? undefined : selectedAccount;

  const { data: snapshots = [], isLoading } = useAnalyticsSnapshots(accountId, parseInt(dateRange));
  const { data: postMetrics = [] } = usePostMetrics(selectedAccount === "all" ? undefined : connectedAccounts.find(a => a.id === selectedAccount)?.platform);

  // Aggregate latest metrics
  const latestByAccount = useMemo(() => {
    const map: Record<string, typeof snapshots[0]> = {};
    for (const s of snapshots) {
      const key = (s as any).social_account_id;
      if (!map[key] || s.snapshot_date > map[key].snapshot_date) {
        map[key] = s;
      }
    }
    return Object.values(map);
  }, [snapshots]);

  const totals = useMemo(() => {
    return latestByAccount.reduce(
      (acc, s) => ({
        followers: acc.followers + (s.followers || 0),
        reach: acc.reach + (s.reach || 0),
        impressions: acc.impressions + (s.impressions || 0),
        engagement: acc.engagement + (s.engagement || 0),
        clicks: acc.clicks + (s.clicks || 0),
        likes: acc.likes + (s.likes || 0),
        comments: acc.comments + (s.comments || 0),
        shares: acc.shares + (s.shares || 0),
      }),
      { followers: 0, reach: 0, impressions: 0, engagement: 0, clicks: 0, likes: 0, comments: 0, shares: 0 }
    );
  }, [latestByAccount]);

  // Growth chart data
  const growthData = useMemo(() => {
    const byDate: Record<string, { date: string; followers: number; reach: number; engagement: number }> = {};
    for (const s of snapshots) {
      const d = s.snapshot_date;
      if (!byDate[d]) byDate[d] = { date: d, followers: 0, reach: 0, engagement: 0 };
      byDate[d].followers += s.followers || 0;
      byDate[d].reach += s.reach || 0;
      byDate[d].engagement += s.engagement || 0;
    }
    return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
  }, [snapshots]);

  // Platform distribution
  const platformDist = useMemo(() => {
    const map: Record<string, number> = {};
    for (const s of latestByAccount) {
      map[s.platform] = (map[s.platform] || 0) + (s.followers || 0);
    }
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [latestByAccount]);

  // Best posts
  const bestPosts = useMemo(() => {
    return [...postMetrics]
      .sort((a, b) => {
        const engA = (a.likes || 0) + (a.comments || 0) + (a.shares || 0);
        const engB = (b.likes || 0) + (b.comments || 0) + (b.shares || 0);
        return engB - engA;
      })
      .slice(0, 5);
  }, [postMetrics]);

  if (isLoading) return <p className="text-muted-foreground">Duke ngarkuar analitikën...</p>;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={selectedAccount} onValueChange={setSelectedAccount}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Të gjitha kanalet" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Të gjitha kanalet</SelectItem>
            {connectedAccounts.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.account_name || a.platform} ({a.platform})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 ditë</SelectItem>
            <SelectItem value="14">14 ditë</SelectItem>
            <SelectItem value="30">30 ditë</SelectItem>
            <SelectItem value="90">90 ditë</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Ndjekës" value={totals.followers} icon={Users} />
        <MetricCard title="Reach" value={totals.reach} icon={Eye} />
        <MetricCard title="Impressions" value={totals.impressions} icon={Activity} />
        <MetricCard title="Engagement" value={totals.engagement} icon={Heart} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Clicks" value={totals.clicks} icon={MousePointerClick} />
        <MetricCard title="Likes" value={totals.likes} icon={Heart} color="text-red-500" />
        <MetricCard title="Komente" value={totals.comments} icon={MessageCircle} color="text-blue-500" />
        <MetricCard title="Shares" value={totals.shares} icon={Share2} color="text-green-500" />
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Rritja e ndjekësve</CardTitle></CardHeader>
          <CardContent>
            {growthData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="followers" stroke="hsl(225, 65%, 52%)" fill="hsl(225, 65%, 52%)" fillOpacity={0.2} name="Ndjekës" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">Nuk ka të dhëna ende. Lidh kanale dhe prit sync-in.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Shpërndarja sipas platformës</CardTitle></CardHeader>
          <CardContent>
            {platformDist.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={platformDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {platformDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">Nuk ka të dhëna.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Engagement Over Time */}
      {growthData.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Reach & Engagement në kohë</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="reach" stroke="hsl(262, 60%, 55%)" name="Reach" />
                <Line type="monotone" dataKey="engagement" stroke="hsl(160, 55%, 42%)" name="Engagement" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Best Posts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5" /> Postimet më të mira
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bestPosts.length > 0 ? (
            <div className="space-y-3">
              {bestPosts.map((post, i) => (
                <div key={post.id} className="flex items-start gap-3 border-b pb-3 last:border-0">
                  <span className="text-lg font-bold text-muted-foreground">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{post.content_preview.slice(0, 100) || "Pa përmbajtje"}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{post.platform}</span>
                      <span>❤️ {post.likes}</span>
                      <span>💬 {post.comments}</span>
                      <span>🔁 {post.shares}</span>
                      <span>🔗 {post.clicks}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">Nuk ka metrika postimesh ende.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
