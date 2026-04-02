import { useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { useCategories, useSubcategories } from '@/hooks/useCategories';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export default function AdminCategories() {
  const { data: categories = [] } = useCategories();
  const { data: subcategories = [] } = useSubcategories();
  const queryClient = useQueryClient();
  const [catDialog, setCatDialog] = useState(false);
  const [subDialog, setSubDialog] = useState(false);
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editingSub, setEditingSub] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [catForm, setCatForm] = useState({ name: '', slug: '', description: '', icon: '', display_order: 0 });
  const [subForm, setSubForm] = useState({ name: '', slug: '', description: '', category_id: '' });

  const resetCatForm = () => { setCatForm({ name: '', slug: '', description: '', icon: '', display_order: 0 }); setEditingCat(null); };
  const resetSubForm = () => { setSubForm({ name: '', slug: '', description: '', category_id: '' }); setEditingSub(null); };

  const saveCat = async () => {
    if (!catForm.name || !catForm.slug) { toast({ title: 'Gabim', description: 'Plotëso emrin dhe slug.', variant: 'destructive' }); return; }
    setSaving(true);
    const payload = { ...catForm };
    let error;
    if (editingCat) {
      ({ error } = await supabase.from('categories').update(payload).eq('id', editingCat));
    } else {
      ({ error } = await supabase.from('categories').insert({ id: crypto.randomUUID(), ...payload }));
    }
    setSaving(false);
    if (error) { toast({ title: 'Gabim', description: error.message, variant: 'destructive' }); }
    else {
      toast({ title: 'U ruajt' });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setCatDialog(false); resetCatForm();
    }
  };

  const saveSub = async () => {
    if (!subForm.name || !subForm.slug || !subForm.category_id) { toast({ title: 'Gabim', description: 'Plotëso fushat.', variant: 'destructive' }); return; }
    setSaving(true);
    let error;
    if (editingSub) {
      ({ error } = await supabase.from('subcategories').update({ name: subForm.name, slug: subForm.slug, description: subForm.description, category_id: subForm.category_id }).eq('id', editingSub));
    } else {
      ({ error } = await supabase.from('subcategories').insert({ id: crypto.randomUUID(), ...subForm }));
    }
    setSaving(false);
    if (error) { toast({ title: 'Gabim', description: error.message, variant: 'destructive' }); }
    else {
      toast({ title: 'U ruajt' });
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
      setSubDialog(false); resetSubForm();
    }
  };

  const deleteCat = async (id: string) => {
    if (!confirm('Fshi kategorinë?')) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) toast({ title: 'Gabim', description: error.message, variant: 'destructive' });
    else { toast({ title: 'U fshi' }); queryClient.invalidateQueries({ queryKey: ['categories'] }); }
  };

  const deleteSub = async (id: string) => {
    if (!confirm('Fshi nënkategorinë?')) return;
    const { error } = await supabase.from('subcategories').delete().eq('id', id);
    if (error) toast({ title: 'Gabim', description: error.message, variant: 'destructive' });
    else { toast({ title: 'U fshi' }); queryClient.invalidateQueries({ queryKey: ['subcategories'] }); }
  };

  return (
    <AdminLayout>
      {/* Categories */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-foreground">Kategoritë</h1>
        <Dialog open={catDialog} onOpenChange={v => { setCatDialog(v); if (!v) resetCatForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Shto Kategori</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingCat ? 'Ndrysho' : 'Kategori e re'}</DialogTitle></DialogHeader>
            <div className="space-y-3 mt-4">
              <div><Label>Emri</Label><Input value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div><Label>Slug</Label><Input value={catForm.slug} onChange={e => setCatForm(f => ({ ...f, slug: e.target.value }))} /></div>
              <div><Label>Përshkrimi</Label><Input value={catForm.description} onChange={e => setCatForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div><Label>Ikona</Label><Input value={catForm.icon} onChange={e => setCatForm(f => ({ ...f, icon: e.target.value }))} /></div>
              <div><Label>Rendi</Label><Input type="number" value={catForm.display_order} onChange={e => setCatForm(f => ({ ...f, display_order: Number(e.target.value) }))} /></div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setCatDialog(false); resetCatForm(); }}>Anulo</Button>
                <Button onClick={saveCat} disabled={saving}>{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Ruaj</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border bg-card shadow-card overflow-hidden mb-10">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3 font-medium text-muted-foreground">Emri</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Slug</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Rendi</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Veprime</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {categories.map(cat => (
              <tr key={cat.id} className="hover:bg-muted/50">
                <td className="p-3 font-medium text-foreground">{cat.name}</td>
                <td className="p-3 text-muted-foreground">{cat.slug}</td>
                <td className="p-3 text-muted-foreground">{cat.order}</td>
                <td className="p-3 text-right">
                  <Button variant="ghost" size="icon" onClick={() => {
                    setCatForm({ name: cat.name, slug: cat.slug, description: cat.description, icon: cat.icon, display_order: cat.order });
                    setEditingCat(cat.id); setCatDialog(true);
                  }}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteCat(cat.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Subcategories */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">Nënkategoritë</h2>
        <Dialog open={subDialog} onOpenChange={v => { setSubDialog(v); if (!v) resetSubForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Shto Nënkategori</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingSub ? 'Ndrysho' : 'Nënkategori e re'}</DialogTitle></DialogHeader>
            <div className="space-y-3 mt-4">
              <div><Label>Emri</Label><Input value={subForm.name} onChange={e => setSubForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div><Label>Slug</Label><Input value={subForm.slug} onChange={e => setSubForm(f => ({ ...f, slug: e.target.value }))} /></div>
              <div><Label>Përshkrimi</Label><Input value={subForm.description} onChange={e => setSubForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div>
                <Label>Kategoria</Label>
                <Select value={subForm.category_id} onValueChange={v => setSubForm(f => ({ ...f, category_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Zgjidh..." /></SelectTrigger>
                  <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setSubDialog(false); resetSubForm(); }}>Anulo</Button>
                <Button onClick={saveSub} disabled={saving}>{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Ruaj</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border bg-card shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3 font-medium text-muted-foreground">Emri</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Slug</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Kategoria</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Veprime</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {subcategories.map(sub => {
              const parentCat = categories.find(c => c.id === sub.categoryId);
              return (
                <tr key={sub.id} className="hover:bg-muted/50">
                  <td className="p-3 font-medium text-foreground">{sub.name}</td>
                  <td className="p-3 text-muted-foreground">{sub.slug}</td>
                  <td className="p-3 text-muted-foreground">{parentCat?.name || '—'}</td>
                  <td className="p-3 text-right">
                    <Button variant="ghost" size="icon" onClick={() => {
                      setSubForm({ name: sub.name, slug: sub.slug, description: sub.description, category_id: sub.categoryId });
                      setEditingSub(sub.id); setSubDialog(true);
                    }}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteSub(sub.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
