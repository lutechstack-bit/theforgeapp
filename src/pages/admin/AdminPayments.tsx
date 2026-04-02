import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Search, Edit, Loader2, Settings, Users as UsersIcon, Gift } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';

interface PaymentConfig {
  id: string;
  user_id: string;
  programme_total: number;
  deposit_paid: number;
  deposit_label: string;
  balance_due: number;
  payment_deadline: string | null;
  payment_link: string | null;
  installment_link: string | null;
  is_deposit_verified: boolean;
  notes: string | null;
}

interface PaymentDefault {
  id: string;
  edition_id: string;
  programme_total: number;
  default_deposit: number;
  deposit_label: string;
  default_deadline: string | null;
  payment_link: string | null;
  installment_link: string | null;
}

export default function AdminPayments() {
  const [searchParams] = useSearchParams();
  const highlightUserId = searchParams.get('user');
  const [searchQuery, setSearchQuery] = useState('');
  const [editionFilter, setEditionFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingPayment, setEditingPayment] = useState<any>(null);
  const [showDefaultsDialog, setShowDefaultsDialog] = useState(false);
  const [selectedDefaultEdition, setSelectedDefaultEdition] = useState<string>('');
  const [defaultForm, setDefaultForm] = useState({
    programme_total: '50000',
    default_deposit: '15000',
    deposit_label: 'Slot confirmation fee',
    default_deadline: '',
    payment_link: '',
    installment_link: '',
  });
  const [editForm, setEditForm] = useState({
    programme_total: '',
    deposit_paid: '',
    deposit_label: '',
    payment_deadline: '',
    payment_link: '',
    installment_link: '',
    is_deposit_verified: true,
    notes: '',
  });
  const queryClient = useQueryClient();

  // Fetch users with profiles
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-payment-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, edition_id, payment_status, city')
        .order('full_name', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Fetch payment configs
  const { data: paymentConfigs, isLoading: configsLoading } = useQuery({
    queryKey: ['payment-configs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_config')
        .select('*');
      if (error) throw error;
      return data as PaymentConfig[];
    },
  });

  // Fetch editions
  const { data: editions } = useQuery({
    queryKey: ['editions-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('editions')
        .select('*')
        .order('forge_start_date', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch payment defaults
  const { data: paymentDefaults } = useQuery({
    queryKey: ['payment-defaults'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_defaults')
        .select('*');
      if (error) throw error;
      return data as PaymentDefault[];
    },
  });

  // Config map for quick lookup
  const configMap = new Map<string, PaymentConfig>();
  paymentConfigs?.forEach(c => configMap.set(c.user_id, c));

  // Defaults map by edition_id
  const defaultsMap = useMemo(() => {
    const m = new Map<string, PaymentDefault>();
    paymentDefaults?.forEach(d => m.set(d.edition_id, d));
    return m;
  }, [paymentDefaults]);

  // Grant helpers
  const getGrantAmount = (user: any): number => {
    const config = configMap.get(user.id);
    if (!config || !user.edition_id) return 0;
    const def = defaultsMap.get(user.edition_id);
    if (!def) return 0;
    const diff = def.programme_total - config.programme_total;
    return diff > 0 ? diff : 0;
  };

  const getEditionName = (editionId: string | null) => {
    if (!editionId) return 'No Edition';
    return editions?.find(e => e.id === editionId)?.name || 'Unknown';
  };

  // Save/update payment config
  const saveMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: any }) => {
      const existing = configMap.get(userId);
      if (existing) {
        const { error } = await supabase
          .from('payment_config')
          .update(data)
          .eq('user_id', userId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('payment_config')
          .insert({ user_id: userId, ...data });
        if (error) throw error;
      }

      // Auto-update payment_status if fully paid
      if (Number(data.deposit_paid) >= Number(data.programme_total)) {
        await supabase
          .from('profiles')
          .update({ payment_status: 'BALANCE_PAID' })
          .eq('id', userId);
      }
    },
    onSuccess: () => {
      toast.success('Payment config saved');
      queryClient.invalidateQueries({ queryKey: ['payment-configs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-payment-users'] });
      setEditingPayment(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Save edition defaults
  const saveDefaultsMutation = useMutation({
    mutationFn: async () => {
      if (!selectedDefaultEdition) throw new Error('Select an edition');
      const payload = {
        edition_id: selectedDefaultEdition,
        programme_total: Number(defaultForm.programme_total),
        default_deposit: Number(defaultForm.default_deposit),
        deposit_label: defaultForm.deposit_label,
        default_deadline: defaultForm.default_deadline || null,
        payment_link: defaultForm.payment_link || null,
        installment_link: defaultForm.installment_link || null,
      };
      const existing = paymentDefaults?.find(d => d.edition_id === selectedDefaultEdition);
      if (existing) {
        const { error } = await supabase
          .from('payment_defaults')
          .update(payload)
          .eq('edition_id', selectedDefaultEdition);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('payment_defaults')
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success('Edition defaults saved');
      queryClient.invalidateQueries({ queryKey: ['payment-defaults'] });
      setShowDefaultsDialog(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Bulk apply defaults
  const bulkApplyMutation = useMutation({
    mutationFn: async () => {
      if (!selectedDefaultEdition) throw new Error('Select an edition');
      const defaults = paymentDefaults?.find(d => d.edition_id === selectedDefaultEdition);
      if (!defaults) throw new Error('No defaults set for this edition');

      const editionUsers = users?.filter(u => u.edition_id === selectedDefaultEdition) || [];
      if (editionUsers.length === 0) throw new Error('No users in this edition');

      let success = 0;
      for (const user of editionUsers) {
        const existing = configMap.get(user.id);
        const payload = {
          user_id: user.id,
          programme_total: defaults.programme_total,
          deposit_paid: defaults.default_deposit,
          deposit_label: defaults.deposit_label,
          payment_deadline: defaults.default_deadline,
          payment_link: defaults.payment_link,
          installment_link: defaults.installment_link,
        };
        if (existing) {
          const { error } = await supabase.from('payment_config').update(payload).eq('user_id', user.id);
          if (!error) success++;
        } else {
          const { error } = await supabase.from('payment_config').insert(payload);
          if (!error) success++;
        }
      }
      return { success, total: editionUsers.length };
    },
    onSuccess: (data) => {
      toast.success(`Applied defaults to ${data.success}/${data.total} users`);
      queryClient.invalidateQueries({ queryKey: ['payment-configs'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openEditDialog = (user: any) => {
    const config = configMap.get(user.id);
    setEditForm({
      programme_total: String(config?.programme_total || 50000),
      deposit_paid: String(config?.deposit_paid || 15000),
      deposit_label: config?.deposit_label || 'Slot confirmation fee',
      payment_deadline: config?.payment_deadline || '',
      payment_link: config?.payment_link || '',
      installment_link: config?.installment_link || '',
      is_deposit_verified: config?.is_deposit_verified ?? true,
      notes: config?.notes || '',
    });
    setEditingPayment(user);
  };

  const handleSave = () => {
    if (!editingPayment) return;
    saveMutation.mutate({
      userId: editingPayment.id,
      data: {
        programme_total: Number(editForm.programme_total),
        deposit_paid: Number(editForm.deposit_paid),
        deposit_label: editForm.deposit_label,
        payment_deadline: editForm.payment_deadline || null,
        payment_link: editForm.payment_link || null,
        installment_link: editForm.installment_link || null,
        is_deposit_verified: editForm.is_deposit_verified,
        notes: editForm.notes || null,
      },
    });
  };

  const loadDefaultsForEdition = (editionId: string) => {
    setSelectedDefaultEdition(editionId);
    const existing = paymentDefaults?.find(d => d.edition_id === editionId);
    if (existing) {
      setDefaultForm({
        programme_total: String(existing.programme_total),
        default_deposit: String(existing.default_deposit),
        deposit_label: existing.deposit_label,
        default_deadline: existing.default_deadline || '',
        payment_link: existing.payment_link || '',
        installment_link: existing.installment_link || '',
      });
    } else {
      setDefaultForm({
        programme_total: '50000',
        default_deposit: '15000',
        deposit_label: 'Slot confirmation fee',
        default_deadline: '',
        payment_link: '',
        installment_link: '',
      });
    }
  };

  // Filtering
  const filteredUsers = users?.filter(user => {
    const matchesSearch = !searchQuery ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEdition = editionFilter === 'all' || user.edition_id === editionFilter;
    const config = configMap.get(user.id);
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'configured' && config) ||
      (statusFilter === 'unconfigured' && !config) ||
      (statusFilter === 'fully_paid' && config && config.balance_due <= 0) ||
      (statusFilter === 'pending' && config && config.balance_due > 0) ||
      (statusFilter === 'with_grant' && getGrantAmount(user) > 0) ||
      (statusFilter === 'no_grant' && config && getGrantAmount(user) === 0);
    return matchesSearch && matchesEdition && matchesStatus;
  });

  // Stats
  const totalConfigured = paymentConfigs?.length || 0;
  const totalPending = paymentConfigs?.filter(c => c.balance_due > 0).length || 0;
  const totalFullyPaid = paymentConfigs?.filter(c => c.balance_due <= 0).length || 0;
  const totalWithGrant = users?.filter(u => getGrantAmount(u) > 0).length || 0;
  const totalNoGrant = users?.filter(u => {
    const config = configMap.get(u.id);
    return config && getGrantAmount(u) === 0;
  }).length || 0;

  const isLoading = usersLoading || configsLoading;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payment Management</h1>
          <p className="text-muted-foreground text-sm">Manage per-user payment configs and edition defaults</p>
        </div>
        <Button variant="outline" onClick={() => setShowDefaultsDialog(true)}>
          <Settings className="w-4 h-4 mr-2" />
          Edition Defaults
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Total Users</p>
            <p className="text-2xl font-bold">{users?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Configured</p>
            <p className="text-2xl font-bold text-primary">{totalConfigured}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Balance Pending</p>
            <p className="text-2xl font-bold text-amber-500">{totalPending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Fully Paid</p>
            <p className="text-2xl font-bold text-emerald-500">{totalFullyPaid}</p>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/20">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5 text-emerald-500" />
              <p className="text-xs text-muted-foreground">With Grant</p>
            </div>
            <p className="text-2xl font-bold text-emerald-500">{totalWithGrant}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">No Grant</p>
            <p className="text-2xl font-bold">{totalNoGrant}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={editionFilter} onValueChange={setEditionFilter}>
          <SelectTrigger className="w-[220px] bg-card/50">
            <SelectValue placeholder="All Editions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Editions</SelectItem>
            {editions?.map(e => (
              <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-card/50">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="configured">Configured</SelectItem>
            <SelectItem value="unconfigured">Not Configured</SelectItem>
            <SelectItem value="fully_paid">Fully Paid</SelectItem>
            <SelectItem value="pending">Balance Pending</SelectItem>
            <SelectItem value="with_grant">With Grant</SelectItem>
            <SelectItem value="no_grant">No Grant</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card/50"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border/50 bg-card/30">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Edition</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-center">Grant</TableHead>
              <TableHead className="text-right">Paid</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : filteredUsers?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">No users found</TableCell>
              </TableRow>
            ) : (
              filteredUsers?.map(user => {
                const config = configMap.get(user.id);
                const isHighlighted = highlightUserId === user.id;
                const grantAmt = getGrantAmount(user);
                return (
                  <TableRow key={user.id} className={isHighlighted ? 'bg-primary/10 ring-1 ring-primary/30' : undefined}>
                    <TableCell className="font-medium">{user.full_name || '-'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{user.email || '-'}</TableCell>
                    <TableCell className="text-sm">{getEditionName(user.edition_id)}</TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {config ? `₹${config.programme_total.toLocaleString('en-IN')}` : '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      {grantAmt > 0 ? (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                          <Gift className="w-3 h-3 mr-1" />
                          ₹{grantAmt.toLocaleString('en-IN')}
                        </Badge>
                      ) : config ? (
                        <span className="text-muted-foreground text-sm">—</span>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {config ? `₹${config.deposit_paid.toLocaleString('en-IN')}` : '-'}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm font-semibold">
                      {config ? (
                        <span className={config.balance_due > 0 ? 'text-amber-500' : 'text-emerald-500'}>
                          ₹{config.balance_due.toLocaleString('en-IN')}
                        </span>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {config?.payment_deadline ? new Date(config.payment_deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                    </TableCell>
                    <TableCell>
                      {config ? (
                        config.balance_due <= 0 ? (
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Paid</Badge>
                        ) : (
                          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Pending</Badge>
                        )
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">Not Set</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(user)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Payment Dialog */}
      <Dialog open={!!editingPayment} onOpenChange={() => setEditingPayment(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Payment Config — {editingPayment?.full_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Programme Total (₹)</Label>
                <Input type="number" value={editForm.programme_total} onChange={e => setEditForm(f => ({ ...f, programme_total: e.target.value }))} />
              </div>
              <div>
                <Label>Deposit Paid (₹)</Label>
                <Input type="number" value={editForm.deposit_paid} onChange={e => setEditForm(f => ({ ...f, deposit_paid: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Deposit Label</Label>
              <Input value={editForm.deposit_label} onChange={e => setEditForm(f => ({ ...f, deposit_label: e.target.value }))} />
            </div>
            <div>
              <Label>Payment Deadline</Label>
              <Input type="date" value={editForm.payment_deadline} onChange={e => setEditForm(f => ({ ...f, payment_deadline: e.target.value }))} />
            </div>
            <div>
              <Label>Razorpay Payment Link</Label>
              <Input placeholder="https://razorpay.com/..." value={editForm.payment_link} onChange={e => setEditForm(f => ({ ...f, payment_link: e.target.value }))} />
            </div>
            <div>
              <Label>Installment Link (optional)</Label>
              <Input placeholder="https://..." value={editForm.installment_link} onChange={e => setEditForm(f => ({ ...f, installment_link: e.target.value }))} />
            </div>
            <div>
              <Label>Admin Notes</Label>
              <Input value={editForm.notes} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} placeholder="Internal notes..." />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editForm.is_deposit_verified}
                onChange={e => setEditForm(f => ({ ...f, is_deposit_verified: e.target.checked }))}
                className="rounded"
              />
              <Label className="cursor-pointer">Deposit Verified</Label>
            </div>
            {editForm.programme_total && editForm.deposit_paid && (
              <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
                <div>
                  <span className="text-muted-foreground">Balance Due: </span>
                  <span className="font-bold text-foreground">
                    ₹{(Number(editForm.programme_total) - Number(editForm.deposit_paid)).toLocaleString('en-IN')}
                  </span>
                  {Number(editForm.deposit_paid) >= Number(editForm.programme_total) && (
                    <span className="ml-2 text-emerald-500 text-xs">(Will auto-mark as BALANCE_PAID)</span>
                  )}
                </div>
                {editingPayment && (() => {
                  const grantAmt = getGrantAmount(editingPayment);
                  if (grantAmt > 0) {
                    return (
                      <div className="flex items-center gap-1.5">
                        <Gift className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-muted-foreground">Grant Applied: </span>
                        <span className="font-bold text-emerald-500">₹{grantAmt.toLocaleString('en-IN')}</span>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPayment(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edition Defaults Dialog */}
      <Dialog open={showDefaultsDialog} onOpenChange={setShowDefaultsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edition Payment Defaults</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Edition</Label>
              <Select value={selectedDefaultEdition} onValueChange={loadDefaultsForEdition}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose edition..." />
                </SelectTrigger>
                <SelectContent>
                  {editions?.map(e => (
                    <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedDefaultEdition && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Programme Total (₹)</Label>
                    <Input type="number" value={defaultForm.programme_total} onChange={e => setDefaultForm(f => ({ ...f, programme_total: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Default Deposit (₹)</Label>
                    <Input type="number" value={defaultForm.default_deposit} onChange={e => setDefaultForm(f => ({ ...f, default_deposit: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <Label>Deposit Label</Label>
                  <Input value={defaultForm.deposit_label} onChange={e => setDefaultForm(f => ({ ...f, deposit_label: e.target.value }))} />
                </div>
                <div>
                  <Label>Default Deadline</Label>
                  <Input type="date" value={defaultForm.default_deadline} onChange={e => setDefaultForm(f => ({ ...f, default_deadline: e.target.value }))} />
                </div>
                <div>
                  <Label>Default Razorpay Link</Label>
                  <Input placeholder="https://razorpay.com/..." value={defaultForm.payment_link} onChange={e => setDefaultForm(f => ({ ...f, payment_link: e.target.value }))} />
                </div>
                <div>
                  <Label>Default Installment Link</Label>
                  <Input placeholder="https://..." value={defaultForm.installment_link} onChange={e => setDefaultForm(f => ({ ...f, installment_link: e.target.value }))} />
                </div>
              </>
            )}
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            {selectedDefaultEdition && (
              <Button
                variant="outline"
                className="text-amber-500 border-amber-500/30 hover:bg-amber-500/10"
                onClick={() => bulkApplyMutation.mutate()}
                disabled={bulkApplyMutation.isPending}
              >
                {bulkApplyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UsersIcon className="w-4 h-4 mr-2" />}
                Apply to All Users in Edition
              </Button>
            )}
            <Button
              onClick={() => saveDefaultsMutation.mutate()}
              disabled={!selectedDefaultEdition || saveDefaultsMutation.isPending}
            >
              {saveDefaultsMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save Defaults
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
