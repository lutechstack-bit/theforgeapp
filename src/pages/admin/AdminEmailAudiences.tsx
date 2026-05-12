import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase as supabaseTyped } from '@/integrations/supabase/client';
const supabase = supabaseTyped as any;
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Users, Plus, Edit, Copy, Trash2, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Audience {
  id: string;
  name: string;
  description: string | null;
  filter_criteria: Record<string, any>;
  created_at: string;
}

// Fetch live count for a single audience via resolve-audience edge function
function useAudienceCount(audienceId: string, filterCriteria: Record<string, any>) {
  return useQuery({
    queryKey: ['audience-count', audienceId, JSON.stringify(filterCriteria)],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('resolve-audience', {
        body: { filter_criteria: filterCriteria, count_only: true },
      });
      if (error) throw error;
      return (data?.count ?? 0) as number;
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

function AudienceCountBadge({ audience }: { audience: Audience }) {
  const { data: count, isLoading, isError, refetch } = useAudienceCount(
    audience.id,
    audience.filter_criteria
  );

  if (isLoading) {
    return (
      <Badge variant="outline" className="gap-1 text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        Loading…
      </Badge>
    );
  }
  if (isError) {
    return (
      <Badge
        variant="outline"
        className="gap-1 text-destructive border-destructive/40 cursor-pointer"
        onClick={() => refetch()}
      >
        <RefreshCw className="h-3 w-3" /> Retry
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="gap-1">
      <Users className="h-3 w-3" />
      {count} student{count === 1 ? '' : 's'}
    </Badge>
  );
}

function FilterSummary({ criteria }: { criteria: Record<string, any> }) {
  const parts: string[] = [];
  if (criteria.edition_ids?.length) parts.push(`${criteria.edition_ids.length} edition(s)`);
  if (criteria.cohort_types?.length) parts.push(criteria.cohort_types.join(', '));
  if (criteria.forge_modes?.length) parts.push(criteria.forge_modes.map((m: string) => m.replace('_FORGE', '').toLowerCase()).join(', ') + ' mode');
  if (criteria.onboarding_completed === true) parts.push('onboarding ✓');
  if (criteria.onboarding_completed === false) parts.push('onboarding ✗');
  if (criteria.ky_completed === true) parts.push('KY ✓');
  if (criteria.ky_completed === false) parts.push('KY ✗');
  if (criteria.has_photo === true) parts.push('has photo');
  if (criteria.has_photo === false) parts.push('no photo');
  if (criteria.cities?.length) parts.push(criteria.cities.join(', '));

  if (parts.length === 0) return <span className="text-muted-foreground text-xs italic">No filters</span>;
  return <span className="text-xs text-muted-foreground">{parts.join(' · ')}</span>;
}

export default function AdminEmailAudiences() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: audiences = [], isLoading } = useQuery({
    queryKey: ['admin-email-audiences'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_audiences')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Audience[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('email_audiences').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-email-audiences'] });
      toast.success('Audience deleted');
      setDeleteId(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const duplicateMutation = useMutation({
    mutationFn: async (audience: Audience) => {
      const { error } = await supabase.from('email_audiences').insert({
        name: `${audience.name} (copy)`,
        description: audience.description,
        filter_criteria: audience.filter_criteria,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-email-audiences'] });
      toast.success('Audience duplicated');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="p-6 space-y-5 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> Audiences
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Saved recipient segments for reuse across email sends.
          </p>
        </div>
        <Button onClick={() => navigate('/admin/email/audiences/new')} className="gap-2">
          <Plus className="h-4 w-4" /> New Audience
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading audiences…
        </div>
      ) : audiences.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-muted-foreground">No audiences yet.</p>
            <Button
              variant="outline"
              className="mt-4 gap-2"
              onClick={() => navigate('/admin/email/audiences/new')}
            >
              <Plus className="h-4 w-4" /> Create your first audience
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {audiences.map((audience) => (
            <Card key={audience.id} className="hover:bg-muted/10 transition-colors">
              <CardContent className="py-4 px-5 flex items-center gap-4">
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{audience.name}</span>
                    <AudienceCountBadge audience={audience} />
                  </div>
                  {audience.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {audience.description}
                    </p>
                  )}
                  <div className="mt-1">
                    <FilterSummary criteria={audience.filter_criteria} />
                  </div>
                </div>

                {/* Date */}
                <span className="text-xs text-muted-foreground whitespace-nowrap hidden sm:block">
                  {format(new Date(audience.created_at), 'MMM d, yyyy')}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title="Edit"
                    onClick={() => navigate(`/admin/email/audiences/${audience.id}/edit`)}
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title="Duplicate"
                    disabled={duplicateMutation.isPending}
                    onClick={() => duplicateMutation.mutate(audience)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    title="Delete"
                    onClick={() => setDeleteId(audience.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete audience?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. Any scheduled or draft sends that reference this
              audience will need to be updated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
