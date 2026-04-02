import { useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { useTools } from '@/hooks/useTools';
import { useCategories, useSubcategories } from '@/hooks/useCategories';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export default function AdminTools() {
  const { data: tools = [], isLoading } = useTools({});
  const { data: categories = [] } = useCategories();
  const { data: subcategories = [] } = useSubcategories();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    title: '',
    slug: '',
    short_description: '',
    full_description: '',
    provider: '',
    model_type: '',
    category_id: '',
    subcategory_id: '',
    pricing_type: 'free',
    pricing_text: 'Falas',
    features: '',
    tags: '',
    input_types: '',
    output_types: '',
    use_cases: '',
  });

  const resetForm = () => {
    setForm({
      title: '', slug: '', short_description: '', full_description: '',
      provider: '', model_type: '', category_id: '', subcategory_id: '',
      pricing_type: 'free', pricing_text: 'Falas', features: '', tags: '',
      input_types: '', output_types: '', use_cases: '',
    });
    setEditingId(null);
  };

  const openEdit = (tool: any) => {
    setForm({
      title: tool.title,
      slug: tool.slug,
      short_description: tool.short_description || tool.shortDescription,
      full_description: tool.full_description || tool.fullDescription,
      provider: tool.provider,
      model_type: tool.model_type || tool.modelType,
      category_id: tool.category_id || tool.categoryId,
      subcategory_id: tool.subcategory_id || tool.subcategoryId,
      pricing_type: tool.pricing_type || tool.pricingType,
      pricing_text: tool.pricing_text || tool.pricingText,
      features: (tool.features || []).join(', '),
      tags: (tool.tags || []).join(', '),
      input_types: (tool.input_types || tool.inputTypes || []).join(', '),
      output_types: (tool.output_types || tool.outputTypes || []).join(', '),
      use_cases: (tool.use_cases || tool.useCases || []).join(', '),
    });
    setEditingId(tool.id);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.slug || !form.category_id || !form.subcategory_id) {
      toast({ title: 'Gabim', description: 'Plotëso fushat e detyrueshme.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const toArray = (s: string) => s.split(',').map(x => x.trim()).filter(Boolean);

    const payload = {
      title: form.title,
      slug: form.slug,
      short_description: form.short_description,
      full_description: form.full_description,
      provider: form.provider,
      model_type: form.model_type,
      category_id: form.category_id,
      subcategory_id: form.subcategory_id,
      pricing_type: form.pricing_type,
      pricing_text: form.pricing_text,
      features: toArray(form.features),
      tags: toArray(form.tags),
      input_types: toArray(form.input_types),
      output_types: toArray(form.output_types),
      use_cases: toArray(form.use_cases),
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from('tools').update(payload).eq('id', editingId));
    } else {
      ({ error } = await supabase.from('tools').insert({ id: crypto.randomUUID(), ...payload }));
    }

    setSaving(false);
    if (error) {
      toast({ title: 'Gabim', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'U ruajt', description: editingId ? 'Mjeti u përditësua.' : 'Mjeti u shtua.' });
      queryClient.invalidateQueries({ queryKey: ['tools'] });
      setDialogOpen(false);
      resetForm();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Jeni i sigurt që dëshironi ta fshini këtë mjet?')) return;
    setDeleting(id);
    const { error } = await supabase.from('tools').delete().eq('id', id);
    setDeleting(null);
    if (error) {
      toast({ title: 'Gabim', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'U fshi', description: 'Mjeti u fshi me sukses.' });
      queryClient.invalidateQueries({ queryKey: ['tools'] });
    }
  };

  const filteredSubs = subcategories.filter(s => s.categoryId === form.category_id);

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Menaxho Mjetet</h1>
        <Dialog open={dialogOpen} onOpenChange={(v) => { setDialogOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Shto Mjet</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Ndrysho Mjetin' : 'Shto Mjet të Ri'}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <Label>Titulli *</Label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <Label>Slug *</Label>
                <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
              </div>
              <div className="col-span-2">
                <Label>Përshkrim i shkurtër</Label>
                <Input value={form.short_description} onChange={e => setForm(f => ({ ...f, short_description: e.target.value }))} />
              </div>
              <div className="col-span-2">
                <Label>Përshkrim i plotë</Label>
                <Textarea value={form.full_description} onChange={e => setForm(f => ({ ...f, full_description: e.target.value }))} rows={3} />
              </div>
              <div>
                <Label>Provider</Label>
                <Input value={form.provider} onChange={e => setForm(f => ({ ...f, provider: e.target.value }))} />
              </div>
              <div>
                <Label>Model Type</Label>
                <Input value={form.model_type} onChange={e => setForm(f => ({ ...f, model_type: e.target.value }))} />
              </div>
              <div>
                <Label>Kategoria *</Label>
                <Select value={form.category_id} onValueChange={v => setForm(f => ({ ...f, category_id: v, subcategory_id: '' }))}>
                  <SelectTrigger><SelectValue placeholder="Zgjidh..." /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Nënkategoria *</Label>
                <Select value={form.subcategory_id} onValueChange={v => setForm(f => ({ ...f, subcategory_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Zgjidh..." /></SelectTrigger>
                  <SelectContent>
                    {filteredSubs.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Lloji i çmimit</Label>
                <Select value={form.pricing_type} onValueChange={v => setForm(f => ({ ...f, pricing_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Falas</SelectItem>
                    <SelectItem value="freemium">Freemium</SelectItem>
                    <SelectItem value="paid">Me pagesë</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Teksti i çmimit</Label>
                <Input value={form.pricing_text} onChange={e => setForm(f => ({ ...f, pricing_text: e.target.value }))} />
              </div>
              <div className="col-span-2">
                <Label>Veçori (ndarë me presje)</Label>
                <Input value={form.features} onChange={e => setForm(f => ({ ...f, features: e.target.value }))} placeholder="Veçori 1, Veçori 2, ..." />
              </div>
              <div>
                <Label>Input Types (presje)</Label>
                <Input value={form.input_types} onChange={e => setForm(f => ({ ...f, input_types: e.target.value }))} placeholder="Tekst, Foto, ..." />
              </div>
              <div>
                <Label>Output Types (presje)</Label>
                <Input value={form.output_types} onChange={e => setForm(f => ({ ...f, output_types: e.target.value }))} placeholder="Tekst, Foto, ..." />
              </div>
              <div className="col-span-2">
                <Label>Përdorime (presje)</Label>
                <Input value={form.use_cases} onChange={e => setForm(f => ({ ...f, use_cases: e.target.value }))} placeholder="Marketing, Dizajn, ..." />
              </div>
              <div className="col-span-2">
                <Label>Tags (presje)</Label>
                <Input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="ai, photo, ..." />
              </div>
              <div className="col-span-2 flex justify-end gap-2 mt-2">
                <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>Anulo</Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingId ? 'Ruaj Ndryshimet' : 'Shto Mjetin'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tools table */}
      <div className="rounded-xl border bg-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3 font-medium text-muted-foreground">Titulli</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Provider</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Çmimi</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Badge</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Veprime</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tools.map((tool) => (
                <tr key={tool.id} className="hover:bg-muted/50">
                  <td className="p-3">
                    <div className="font-medium text-foreground">{tool.title}</div>
                    <div className="text-xs text-muted-foreground">{tool.slug}</div>
                  </td>
                  <td className="p-3 text-muted-foreground">{tool.provider}</td>
                  <td className="p-3">
                    <Badge variant="outline">{tool.pricingType}</Badge>
                  </td>
                  <td className="p-3">
                    {tool.badge && <Badge>{tool.badge}</Badge>}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(tool)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(tool.id)}
                        disabled={deleting === tool.id}
                      >
                        {deleting === tool.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {tools.length === 0 && !isLoading && (
          <div className="p-8 text-center text-muted-foreground">Nuk ka mjete ende.</div>
        )}
      </div>
    </AdminLayout>
  );
}
