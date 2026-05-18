import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase as supabaseTyped } from '@/integrations/supabase/client';
const supabase = supabaseTyped as any;
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, Plus, Pencil, Trash2, ArrowLeftRight, PackageSearch } from 'lucide-react';
import { toast } from 'sonner';

// ── Constants ──────────────────────────────────────────────────────────────────

const PRODUCT_OPTIONS = ['FFM', 'FC', 'FW', 'FAI', 'FORGE CREATORS', 'FORGE WRITING', 'FORGE AI'];

// ── Types ──────────────────────────────────────────────────────────────────────

interface ProductMapping {
  product: string;
  edition_id: string;
  edition_name: string;
  cohort_type: string;
  is_active: boolean;
}

interface Edition {
  id: string;
  name: string;
  cohort_type: string;
}

const EMPTY_FORM = { product: '', customProduct: '', edition_id: '', is_active: true };
type FormState = typeof EMPTY_FORM;

// ── Helpers ────────────────────────────────────────────────────────────────────

const cohortColor: Record<string, string> = {
  FORGE: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
  CREATORS: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  WRITING: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
};

function CohortBadge({ type }: { type: string }) {
  return (
    <Badge variant="outline" className={`text-[10px] ${cohortColor[type] ?? 'text-muted-foreground'}`}>
      {type}
    </Badge>
  );
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function AdminAutomationProductMapping() {
  const queryClient = useQueryClient();

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [useCustomProduct, setUseCustomProduct] = useState(false);

  // Delete confirmation
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  // ── Queries ────────────────────────────────────────────────────────────

  const { data: mappings = [], isLoading: loadingMappings } = useQuery<ProductMapping[]>({
    queryKey: ['automation-product-mappings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('onboarding_automation_config')
        .select('product_mappings')
        .single();
      if (error) throw error;
      return (data?.product_mappings || []) as ProductMapping[];
    },
  });

  const { data: editions = [], isLoading: loadingEditions } = useQuery<Edition[]>({
    queryKey: ['admin-editions-simple'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('editions')
        .select('id, name, cohort_type')
        .order('name');
      if (error) throw error;
      return data || [];
    },
  });

  // ── Shared save helper — writes the full mappings array back to config ──

  const saveMappings = async (updated: ProductMapping[]) => {
    const { data: cfg, error: cfgErr } = await supabase
      .from('onboarding_automation_config')
      .select('id')
      .single();
    if (cfgErr) throw cfgErr;

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('onboarding_automation_config')
      .update({
        product_mappings: updated,
        updated_at: new Date().toISOString(),
        updated_by: user?.id ?? null,
      })
      .eq('id', cfg.id);
    if (error) throw error;
  };

  // ── Mutation: add / update ─────────────────────────────────────────────

  const saveMutation = useMutation({
    mutationFn: async () => {
      const productCode = (useCustomProduct ? form.customProduct : form.product).trim().toUpperCase();
      if (!productCode) throw new Error('Product code is required');
      if (!form.edition_id) throw new Error('Edition is required');

      const edition = editions.find((e) => e.id === form.edition_id);
      if (!edition) throw new Error('Selected edition not found');

      const newMapping: ProductMapping = {
        product: productCode,
        edition_id: edition.id,
        edition_name: edition.name,
        cohort_type: edition.cohort_type,
        is_active: form.is_active,
      };

      const updated = [...mappings];

      if (editingIndex !== null) {
        updated[editingIndex] = newMapping;
      } else {
        // Duplicate guard (skip if we're editing to the same code)
        if (mappings.some((m) => m.product === productCode)) {
          throw new Error(`A mapping for "${productCode}" already exists`);
        }
        updated.push(newMapping);
      }

      await saveMappings(updated);
    },
    onSuccess: () => {
      toast.success(editingIndex !== null ? 'Mapping updated' : 'Mapping added');
      queryClient.invalidateQueries({ queryKey: ['automation-product-mappings'] });
      closeModal();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // ── Mutation: toggle active ────────────────────────────────────────────

  const toggleMutation = useMutation({
    mutationFn: async ({ index, next }: { index: number; next: boolean }) => {
      const updated = mappings.map((m, i) => i === index ? { ...m, is_active: next } : m);
      await saveMappings(updated);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['automation-product-mappings'] }),
    onError: (e: Error) => toast.error(e.message),
  });

  // ── Mutation: delete ───────────────────────────────────────────────────

  const deleteMutation = useMutation({
    mutationFn: async (index: number) => {
      const updated = mappings.filter((_, i) => i !== index);
      await saveMappings(updated);
    },
    onSuccess: () => {
      toast.success('Mapping deleted');
      queryClient.invalidateQueries({ queryKey: ['automation-product-mappings'] });
      setDeleteIndex(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // ── Modal helpers ──────────────────────────────────────────────────────

  const openAdd = () => {
    setEditingIndex(null);
    setForm(EMPTY_FORM);
    setUseCustomProduct(false);
    setShowModal(true);
  };

  const openEdit = (index: number) => {
    const m = mappings[index];
    const isCustom = !PRODUCT_OPTIONS.includes(m.product);
    setEditingIndex(index);
    setUseCustomProduct(isCustom);
    setForm({
      product: isCustom ? '' : m.product,
      customProduct: isCustom ? m.product : '',
      edition_id: m.edition_id,
      is_active: m.is_active,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingIndex(null);
    setForm(EMPTY_FORM);
    setUseCustomProduct(false);
  };

  const isLoading = loadingMappings || loadingEditions;

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-5 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ArrowLeftRight className="h-6 w-6 text-primary" />
            Product → Edition Mapping
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Maps Google Sheet product codes to Forge editions for auto-onboarding.
          </p>
        </div>
        <Button onClick={openAdd} className="gap-1.5 shrink-0">
          <Plus className="h-4 w-4" /> Add Mapping
        </Button>
      </div>

      {/* Table card */}
      <Card>
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Configured Mappings</CardTitle>
            <Badge variant="outline" className="text-[11px]">
              {mappings.length} mapping{mappings.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Active mappings are used by the edge function. Inactive ones are ignored without being deleted.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : mappings.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-14 text-muted-foreground">
              <PackageSearch className="h-10 w-10 opacity-30" />
              <p className="font-medium">No product mappings configured yet.</p>
              <p className="text-sm">Click "Add Mapping" to create your first mapping.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[110px]">Product</TableHead>
                  <TableHead>Edition</TableHead>
                  <TableHead className="w-[110px]">Cohort</TableHead>
                  <TableHead className="w-[90px]">Active</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mappings.map((m, i) => (
                  <TableRow key={`${m.product}-${i}`} className={!m.is_active ? 'opacity-50' : ''}>
                    <TableCell>
                      <span className="font-mono font-semibold text-sm">{m.product}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{m.edition_name}</span>
                    </TableCell>
                    <TableCell>
                      <CohortBadge type={m.cohort_type} />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={m.is_active}
                        disabled={toggleMutation.isPending}
                        onCheckedChange={(v) => toggleMutation.mutate({ index: i, next: v })}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => openEdit(i)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => setDeleteIndex(i)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ── Add / Edit Modal ───────────────────────────────────────────── */}
      <Dialog open={showModal} onOpenChange={(o) => { if (!o) closeModal(); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null ? 'Edit Mapping' : 'Add Product Mapping'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-1">
            {/* Product code */}
            <div className="space-y-1.5">
              <Label>Product code *</Label>

              {!useCustomProduct ? (
                <Select
                  value={form.product}
                  onValueChange={(v) => setForm((f) => ({ ...f, product: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product…" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_OPTIONS.map((p) => (
                      <SelectItem key={p} value={p} className="font-mono">
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={form.customProduct}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, customProduct: e.target.value.toUpperCase() }))
                  }
                  placeholder="e.g. MYPRODUCT"
                  className="font-mono"
                />
              )}

              <button
                type="button"
                onClick={() => {
                  setUseCustomProduct((v) => !v);
                  setForm((f) => ({ ...f, product: '', customProduct: '' }));
                }}
                className="text-[11px] text-primary hover:underline"
              >
                {useCustomProduct ? '← Use predefined codes' : 'Enter a custom product code →'}
              </button>
            </div>

            {/* Edition */}
            <div className="space-y-1.5">
              <Label>Edition *</Label>
              <Select
                value={form.edition_id}
                onValueChange={(v) => setForm((f) => ({ ...f, edition_id: v }))}
                disabled={loadingEditions}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingEditions ? 'Loading…' : 'Select edition…'} />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {editions.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      <span>{e.name}</span>
                      <span className="ml-2 text-[10px] text-muted-foreground">{e.cohort_type}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Active toggle */}
            <div className="flex items-center gap-2.5">
              <Checkbox
                id="mapping-active"
                checked={form.is_active}
                onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: Boolean(v) }))}
              />
              <Label htmlFor="mapping-active" className="cursor-pointer font-normal">
                Active — include in onboarding lookups
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeModal} disabled={saveMutation.isPending}>
              Cancel
            </Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editingIndex !== null ? 'Update mapping' : 'Add mapping'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete confirmation ────────────────────────────────────────── */}
      <AlertDialog
        open={deleteIndex !== null}
        onOpenChange={(o) => { if (!o) setDeleteIndex(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete mapping?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteIndex !== null && (
                <>
                  This will remove the{' '}
                  <span className="font-mono font-semibold">
                    {mappings[deleteIndex]?.product}
                  </span>{' '}
                  → <span className="font-medium">{mappings[deleteIndex]?.edition_name}</span>{' '}
                  mapping. Future sheet imports for this product will be skipped.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteIndex !== null && deleteMutation.mutate(deleteIndex)}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
