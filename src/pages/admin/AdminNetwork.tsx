import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { FloatingInput } from '@/components/ui/floating-input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Trash2, Users, Briefcase, MessageSquare, Search } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// ===== Occupations Tab =====
function OccupationsTab() {
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);

  const { data: occupations = [], isLoading } = useQuery({
    queryKey: ['admin-occupations'],
    queryFn: async () => {
      const { data, error } = await supabase.from('collaborator_occupations').select('*').order('order_index');
      if (error) throw error;
      return data;
    },
  });

  const addOccupation = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    const maxOrder = Math.max(0, ...occupations.map(o => o.order_index));
    const { error } = await supabase.from('collaborator_occupations').insert({ name: newName.trim(), order_index: maxOrder + 1 });
    if (error) toast.error(error.message);
    else { toast.success('Added'); setNewName(''); queryClient.invalidateQueries({ queryKey: ['admin-occupations'] }); }
    setAdding(false);
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('collaborator_occupations').update({ is_active: !current }).eq('id', id);
    queryClient.invalidateQueries({ queryKey: ['admin-occupations'] });
  };

  const deleteOccupation = async (id: string) => {
    if (!confirm('Delete this occupation?')) return;
    await supabase.from('collaborator_occupations').delete().eq('id', id);
    queryClient.invalidateQueries({ queryKey: ['admin-occupations'] });
    toast.success('Deleted');
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <FloatingInput label="New occupation name" value={newName} onChange={(e) => setNewName(e.target.value)} className="flex-1" />
        <Button onClick={addOccupation} disabled={adding || !newName.trim()} className="gap-1 shrink-0">
          <Plus className="w-4 h-4" /> Add
        </Button>
      </div>
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow><TableHead>Name</TableHead><TableHead>Order</TableHead><TableHead>Active</TableHead><TableHead></TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
            ) : occupations.map((occ) => (
              <TableRow key={occ.id}>
                <TableCell className="font-medium">{occ.name}</TableCell>
                <TableCell className="text-muted-foreground">{occ.order_index}</TableCell>
                <TableCell><Switch checked={occ.is_active} onCheckedChange={() => toggleActive(occ.id, occ.is_active)} /></TableCell>
                <TableCell><Button variant="ghost" size="icon" onClick={() => deleteOccupation(occ.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ===== Profiles Tab =====
function ProfilesTab() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['admin-collab-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('collaborator_profiles').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      const userIds = (data || []).map(p => p.user_id);
      if (!userIds.length) return [];
      const { data: userProfiles } = await supabase.from('profiles').select('id, full_name, city').in('id', userIds);
      const profileMap = new Map((userProfiles || []).map(p => [p.id, p]));
      const { data: worksData } = await supabase.from('collaborator_works').select('user_id').in('user_id', userIds);
      const worksMap = new Map<string, number>();
      (worksData || []).forEach(w => worksMap.set(w.user_id, (worksMap.get(w.user_id) || 0) + 1));
      return (data || []).map(cp => ({
        ...cp,
        full_name: profileMap.get(cp.user_id)?.full_name || 'Unknown',
        city: profileMap.get(cp.user_id)?.city || '',
        works_count: worksMap.get(cp.user_id) || 0,
      }));
    },
  });

  const togglePublish = async (userId: string, current: boolean) => {
    await supabase.from('collaborator_profiles').update({ is_published: !current }).eq('user_id', userId);
    queryClient.invalidateQueries({ queryKey: ['admin-collab-profiles'] });
    toast.success(!current ? 'Published' : 'Unpublished');
  };

  const deleteProfile = async (userId: string) => {
    if (!confirm('Delete this collaborator profile? This cannot be undone.')) return;
    await supabase.from('collaborator_works').delete().eq('user_id', userId);
    await supabase.from('collaborator_profiles').delete().eq('user_id', userId);
    queryClient.invalidateQueries({ queryKey: ['admin-collab-profiles'] });
    toast.success('Profile deleted');
  };

  const filtered = profiles.filter(p =>
    !search.trim() ||
    p.full_name.toLowerCase().includes(search.toLowerCase()) ||
    (p.occupations || []).some((o: string) => o.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search profiles..."
          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border/50 bg-card/30 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
        />
      </div>
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead><TableHead>Occupations</TableHead><TableHead>City</TableHead>
              <TableHead>Works</TableHead><TableHead>Published</TableHead><TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
            ) : filtered.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.full_name}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {(p.occupations || []).slice(0, 3).map((o: string) => (
                      <Badge key={o} variant="outline" className="text-[10px]">{o}</Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{p.city || '—'}</TableCell>
                <TableCell>{p.works_count}</TableCell>
                <TableCell><Switch checked={p.is_published} onCheckedChange={() => togglePublish(p.user_id, p.is_published)} /></TableCell>
                <TableCell><Button variant="ghost" size="icon" onClick={() => deleteProfile(p.user_id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ===== Requests Tab =====
function RequestsTab() {
  const [filter, setFilter] = useState('all');

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['admin-collab-requests'],
    queryFn: async () => {
      const { data, error } = await supabase.from('collaboration_requests').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      const allIds = [...new Set((data || []).flatMap(r => [r.from_user_id, r.to_user_id]))];
      if (!allIds.length) return [];
      const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', allIds);
      const nameMap = new Map((profiles || []).map(p => [p.id, p.full_name || 'Unknown']));
      return (data || []).map(r => ({
        ...r,
        from_name: nameMap.get(r.from_user_id) || 'Unknown',
        to_name: nameMap.get(r.to_user_id) || 'Unknown',
      }));
    },
  });

  const queryClient = useQueryClient();

  const deleteRequest = async (id: string) => {
    if (!confirm('Delete this request?')) return;
    await supabase.from('collaboration_requests').delete().eq('id', id);
    queryClient.invalidateQueries({ queryKey: ['admin-collab-requests'] });
    toast.success('Deleted');
  };

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);
  const stats = {
    total: requests.length,
    accepted: requests.filter(r => r.status === 'accepted').length,
    rate: requests.length ? Math.round((requests.filter(r => r.status === 'accepted').length / requests.length) * 100) : 0,
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-card/60 border-border/40"><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </CardContent></Card>
        <Card className="bg-card/60 border-border/40"><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{stats.accepted}</p>
          <p className="text-xs text-muted-foreground">Accepted</p>
        </CardContent></Card>
        <Card className="bg-card/60 border-border/40"><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{stats.rate}%</p>
          <p className="text-xs text-muted-foreground">Accept Rate</p>
        </CardContent></Card>
      </div>

      <div className="flex gap-1.5">
        {['all', 'unread', 'read', 'accepted', 'declined'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn('px-3 py-1.5 rounded-full text-xs font-medium border transition-all capitalize',
              filter === f ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/30 text-muted-foreground border-border/50'
            )}>{f}</button>
        ))}
      </div>

      <div className="rounded-xl border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow><TableHead>From</TableHead><TableHead>To</TableHead><TableHead>Message</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead></TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
            ) : filtered.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium text-sm">{r.from_name}</TableCell>
                <TableCell className="text-sm">{r.to_name}</TableCell>
                <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{r.message}</TableCell>
                <TableCell><Badge variant="outline" className="text-[10px] capitalize">{r.status}</Badge></TableCell>
                <TableCell className="text-xs text-muted-foreground">{format(new Date(r.created_at), 'MMM d')}</TableCell>
                <TableCell><Button variant="ghost" size="icon" onClick={() => deleteRequest(r.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ===== Main Component =====
export default function AdminNetwork() {
  return (
    <div className="p-4 md:p-8 max-w-[1200px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Creative Network</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage collaborator profiles, occupations, and requests</p>
      </div>

      <Tabs defaultValue="occupations" className="space-y-4">
        <TabsList className="bg-muted/30">
          <TabsTrigger value="occupations" className="gap-1.5"><Briefcase className="w-3.5 h-3.5" /> Occupations</TabsTrigger>
          <TabsTrigger value="profiles" className="gap-1.5"><Users className="w-3.5 h-3.5" /> Profiles</TabsTrigger>
          <TabsTrigger value="requests" className="gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> Requests</TabsTrigger>
        </TabsList>
        <TabsContent value="occupations"><OccupationsTab /></TabsContent>
        <TabsContent value="profiles"><ProfilesTab /></TabsContent>
        <TabsContent value="requests"><RequestsTab /></TabsContent>
      </Tabs>
    </div>
  );
}
