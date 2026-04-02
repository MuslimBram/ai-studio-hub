import { AdminLayout } from '@/components/AdminLayout';
import { useTools } from '@/hooks/useTools';
import { useCategories, useSubcategories } from '@/hooks/useCategories';
import { useDonationStats } from '@/hooks/useDonations';
import { Wrench, FolderTree, Heart, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const { data: tools = [] } = useTools({});
  const { data: categories = [] } = useCategories();
  const { data: subcategories = [] } = useSubcategories();
  const { data: donationStats } = useDonationStats();

  const stats = [
    { label: 'Mjete', value: tools.length, icon: Wrench, color: 'text-primary' },
    { label: 'Kategori', value: categories.length, icon: FolderTree, color: 'text-accent' },
    { label: 'Nënkategori', value: subcategories.length, icon: FolderTree, color: 'text-muted-foreground' },
    { label: 'Donacione', value: donationStats?.totalCount || 0, icon: Heart, color: 'text-destructive' },
    { label: 'Total Donuar', value: `${(donationStats?.totalAmount || 0).toFixed(0)}€`, icon: TrendingUp, color: 'text-primary' },
  ];

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-foreground mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border bg-card p-5 shadow-card">
            <div className="flex items-center gap-3 mb-2">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent tools */}
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <h2 className="text-lg font-bold text-foreground mb-4">Mjetet e fundit</h2>
          <div className="space-y-3">
            {tools.slice(0, 5).map((tool) => (
              <div key={tool.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div>
                  <span className="text-sm font-medium text-foreground">{tool.title}</span>
                  <p className="text-xs text-muted-foreground">{tool.provider}</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(tool.created_at).toLocaleDateString('sq-AL')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Categories overview */}
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <h2 className="text-lg font-bold text-foreground mb-4">Kategoritë</h2>
          <div className="space-y-3">
            {categories.map((cat) => {
              const toolCount = tools.filter(t => t.categoryId === cat.id).length;
              return (
                <div key={cat.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <span className="text-sm font-medium text-foreground">{cat.name}</span>
                  <span className="text-xs text-muted-foreground">{toolCount} mjete</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
