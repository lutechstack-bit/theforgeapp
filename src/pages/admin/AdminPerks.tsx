import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Gift, FileText, Users, Download } from 'lucide-react';

interface Perk {
  id: string;
  name: string;
  headline: string;
  logo_url: string | null;
  banner_url: string | null;
  banner_color: string | null;
  about: string | null;
  offer_details: string | null;
  how_to_avail: string | null;
  notes: string | null;
  claim_url: string | null;
  category: string | null;
  is_active: boolean;
  is_coming_soon: boolean;
  order_index: number;
}

interface FormField {
  id: string;
  perk_id: string;
  label: string;
  field_type: string;
  placeholder: string | null;
  is_required: boolean;
  order_index: number;
}

const emptyPerk: Partial<Perk> = {
  name: '', headline: '', logo_url: '', banner_url: '', banner_color: '#1a1a2e',
  about: '', offer_details: '', how_to_avail: '', notes: '', claim_url: '',
  category: 'Equipment', is_active: true, is_coming_soon: false, order_index: 0,
};

const AdminPerks: React.FC = () => {
  const qc = useQueryClient();
  const [editPerk, setEditPerk] = useState<Partial<Perk> | null>(null);
  const [fieldsModal, setFieldsModal] = useState<string | null>(null);
  const [newField, setNewField] = useState({ label: '', field_type: 'text', placeholder: '', is_required: true });
  const [claimsTab, setClaimsTab] = useState('all');

  const { data: perks } = useQuery({
    queryKey: ['admin-perks'],
    queryFn: async () => {
      const { data, error } = await supabase.from('perks').select('*').order('order_index');
      if (error) throw error;
      return data as Perk[];
    },
  });

  const { data: fields } = useQuery({
    queryKey: ['admin-perk-fields', fieldsModal],
    queryFn: async () => {
      if (!fieldsModal) return [];
      const { data, error } = await supabase.from('perk_form_fields').select('*').eq('perk_id', fieldsModal).order('order_index');
      if (error) throw error;
      return data as FormField[];
    },
    enabled: !!fieldsModal,
  });

  // Fetch ALL claims for the inline section
  const { data: allClaims } = useQuery({
    queryKey: ['admin-all-perk-claims'],
    queryFn: async () => {
      const { data, error } = await supabase.from('perk_claims').select('*, perks(name)').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filteredClaims = useMemo(() => {
    if (!allClaims) return [];
    if (claimsTab === 'all') return allClaims;
    return allClaims.filter((c: any) => c.perk_id === claimsTab);
  }, [allClaims, claimsTab]);

  const downloadCSV = () => {
    if (!filteredClaims.length) return;
    // Collect all unique form_data keys
    const allKeys = new Set<string>();
    filteredClaims.forEach((c: any) => {
      if (c.form_data) Object.keys(c.form_data).forEach(k => allKeys.add(k));
    });
    const keys = Array.from(allKeys);
    const header = ['Date', 'Perk', ...keys].join(',');
    const rows = filteredClaims.map((c: any) => {
      const perkName = (c as any).perks?.name || '';
      const date = new Date(c.created_at).toLocaleDateString();
      const fields = keys.map(k => `"${((c.form_data as any)?.[k] || '').toString().replace(/"/g, '""')}"`);
      return [`"${date}"`, `"${perkName}"`, ...fields].join(',');
    });
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const label = claimsTab === 'all' ? 'all-perks' : (perks?.find(p => p.id === claimsTab)?.name || 'perk');
    a.href = url;
    a.download = `perk-claims-${label.toLowerCase().replace(/\s+/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const savePerk = useMutation({
    mutationFn: async (perk: Partial<Perk>) => {
      if (perk.id) {
        const { error } = await supabase.from('perks').update(perk).eq('id', perk.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('perks').insert(perk as any);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-perks'] }); setEditPerk(null); toast.success('Perk saved'); },
    onError: (e: any) => toast.error(e.message),
  });

  const deletePerk = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('perks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-perks'] }); toast.success('Perk deleted'); },
    onError: (e: any) => toast.error(e.message),
  });

  const addField = useMutation({
    mutationFn: async () => {
      if (!fieldsModal || !newField.label.trim()) return;
      const { error } = await supabase.from('perk_form_fields').insert({
        perk_id: fieldsModal,
        label: newField.label,
        field_type: newField.field_type,
        placeholder: newField.placeholder,
        is_required: newField.is_required,
        order_index: (fields?.length || 0),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-perk-fields', fieldsModal] });
      setNewField({ label: '', field_type: 'text', placeholder: '', is_required: true });
      toast.success('Field added');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteField = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('perk_form_fields').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-perk-fields', fieldsModal] }); toast.success('Field removed'); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="p-4 md:p-6 max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Gift className="h-6 w-6 text-primary" />
          <h1 className="text-xl md:text-2xl font-bold">Manage Perks</h1>
        </div>
        <Button onClick={() => setEditPerk(emptyPerk)} className="gap-2">
          <Plus className="h-4 w-4" /> Add Perk
        </Button>
      </div>

      {/* Perks Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Headline</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {perks?.map(p => (
            <TableRow key={p.id}>
              <TableCell className="font-medium">{p.name}</TableCell>
              <TableCell className="max-w-xs truncate text-sm text-muted-foreground">{p.headline}</TableCell>
              <TableCell><Badge variant="outline">{p.category}</Badge></TableCell>
              <TableCell>
                {p.is_coming_soon ? <Badge variant="secondary">Coming Soon</Badge> : p.is_active ? <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Active</Badge> : <Badge variant="secondary">Inactive</Badge>}
              </TableCell>
              <TableCell className="text-right space-x-1">
                <Button size="icon" variant="ghost" onClick={() => setEditPerk(p)}><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => setFieldsModal(p.id)}><FileText className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => { if (confirm('Delete this perk?')) deletePerk.mutate(p.id); }}><Trash2 className="h-4 w-4" /></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Claims Section — Inline with Tabs */}
      <div className="border border-border/50 rounded-2xl bg-card p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">Perk Claims</h2>
            <Badge variant="secondary" className="ml-1">{filteredClaims.length}</Badge>
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={downloadCSV} disabled={!filteredClaims.length}>
            <Download className="h-4 w-4" /> Download CSV
          </Button>
        </div>

        <Tabs value={claimsTab} onValueChange={setClaimsTab}>
          <TabsList className="mb-4 flex-wrap h-auto gap-1">
            <TabsTrigger value="all">All Claims</TabsTrigger>
            {perks?.filter(p => !p.is_coming_soon).map(p => (
              <TabsTrigger key={p.id} value={p.id}>{p.name}</TabsTrigger>
            ))}
          </TabsList>

          <div className="overflow-x-auto">
            {filteredClaims.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    {claimsTab === 'all' && <TableHead>Perk</TableHead>}
                    <TableHead>Form Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClaims.map((c: any) => (
                    <TableRow key={c.id}>
                      <TableCell className="whitespace-nowrap text-sm">{new Date(c.created_at).toLocaleDateString()}</TableCell>
                      {claimsTab === 'all' && (
                        <TableCell className="text-sm font-medium">{(c as any).perks?.name || '—'}</TableCell>
                      )}
                      <TableCell>
                        <div className="space-y-0.5">
                          {c.form_data && Object.entries(c.form_data as Record<string, string>).map(([key, val]) => (
                            <div key={key} className="text-sm">
                              <span className="font-medium text-foreground">{key}: </span>
                              <span className="text-muted-foreground">{val}</span>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No claims yet</p>
            )}
          </div>
        </Tabs>
      </div>

      {/* Edit/Create Perk Dialog */}
      <Dialog open={!!editPerk} onOpenChange={(o) => !o && setEditPerk(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editPerk?.id ? 'Edit Perk' : 'New Perk'}</DialogTitle></DialogHeader>
          {editPerk && (
            <div className="space-y-4">
              <div><Label>Name</Label><Input value={editPerk.name || ''} onChange={e => setEditPerk({...editPerk, name: e.target.value})} maxLength={100} /></div>
              <div><Label>Headline</Label><Input value={editPerk.headline || ''} onChange={e => setEditPerk({...editPerk, headline: e.target.value})} maxLength={200} /></div>
              <div><Label>Logo URL</Label><Input value={editPerk.logo_url || ''} onChange={e => setEditPerk({...editPerk, logo_url: e.target.value})} /></div>
              <div><Label>Banner URL</Label><Input value={editPerk.banner_url || ''} onChange={e => setEditPerk({...editPerk, banner_url: e.target.value})} /></div>
              <div><Label>Banner Color</Label><Input type="color" value={editPerk.banner_color || '#1a1a2e'} onChange={e => setEditPerk({...editPerk, banner_color: e.target.value})} /></div>
              <div><Label>Category</Label><Input value={editPerk.category || ''} onChange={e => setEditPerk({...editPerk, category: e.target.value})} maxLength={50} /></div>
              <div><Label>About</Label><Textarea value={editPerk.about || ''} onChange={e => setEditPerk({...editPerk, about: e.target.value})} maxLength={2000} /></div>
              <div><Label>Offer Details</Label><Textarea value={editPerk.offer_details || ''} onChange={e => setEditPerk({...editPerk, offer_details: e.target.value})} maxLength={2000} /></div>
              <div><Label>How to Avail</Label><Textarea value={editPerk.how_to_avail || ''} onChange={e => setEditPerk({...editPerk, how_to_avail: e.target.value})} maxLength={2000} /></div>
              <div><Label>Notes</Label><Textarea value={editPerk.notes || ''} onChange={e => setEditPerk({...editPerk, notes: e.target.value})} maxLength={2000} /></div>
              <div><Label>Order Index</Label><Input type="number" value={editPerk.order_index || 0} onChange={e => setEditPerk({...editPerk, order_index: parseInt(e.target.value) || 0})} /></div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2"><Switch checked={editPerk.is_active ?? true} onCheckedChange={v => setEditPerk({...editPerk, is_active: v})} /><Label>Active</Label></div>
                <div className="flex items-center gap-2"><Switch checked={editPerk.is_coming_soon ?? false} onCheckedChange={v => setEditPerk({...editPerk, is_coming_soon: v})} /><Label>Coming Soon</Label></div>
              </div>
              <Button className="w-full" onClick={() => savePerk.mutate(editPerk)} disabled={savePerk.isPending}>
                {savePerk.isPending ? 'Saving...' : 'Save Perk'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Form Fields Dialog */}
      <Dialog open={!!fieldsModal} onOpenChange={(o) => !o && setFieldsModal(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Form Fields</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {fields?.map(f => (
              <div key={f.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                <div>
                  <p className="text-sm font-medium">{f.label}</p>
                  <p className="text-xs text-muted-foreground">{f.field_type} • {f.is_required ? 'Required' : 'Optional'}</p>
                </div>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteField.mutate(f.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>
          <div className="border-t border-border/50 pt-4 space-y-3">
            <h3 className="text-sm font-semibold">Add Field</h3>
            <Input placeholder="Field label" value={newField.label} onChange={e => setNewField({...newField, label: e.target.value})} maxLength={100} />
            <div className="flex gap-2">
              <select className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm" value={newField.field_type} onChange={e => setNewField({...newField, field_type: e.target.value})}>
                <option value="text">Text</option>
                <option value="textarea">Textarea</option>
                <option value="email">Email</option>
                <option value="phone">Phone</option>
              </select>
              <div className="flex items-center gap-1.5">
                <Switch checked={newField.is_required} onCheckedChange={v => setNewField({...newField, is_required: v})} />
                <span className="text-xs">Req</span>
              </div>
            </div>
            <Input placeholder="Placeholder text" value={newField.placeholder} onChange={e => setNewField({...newField, placeholder: e.target.value})} maxLength={200} />
            <Button className="w-full" onClick={() => addField.mutate()} disabled={addField.isPending || !newField.label.trim()}>Add Field</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPerks;
