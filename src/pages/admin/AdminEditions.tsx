import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Loader2, Calendar, Archive, ArchiveRestore } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import type { Database } from '@/integrations/supabase/types';

type Edition = Database['public']['Tables']['editions']['Row'];
type EditionWithCount = Edition & { userCount: number };

export default function AdminEditions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isDialogOpen, setIsDialogOpen] = useState(searchParams.get('action') === 'create');
  const [editingEdition, setEditingEdition] = useState<Edition | null>(null);
  const [archivingEdition, setArchivingEdition] = useState<EditionWithCount | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const queryClient = useQueryClient();

  // Fetch editions with user counts
  const { data: editions, isLoading } = useQuery({
    queryKey: ['admin-editions'],
    queryFn: async () => {
      const { data: editionsData, error } = await supabase
        .from('editions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;

      // Get user counts for each edition
      const { data: profiles } = await supabase.from('profiles').select('edition_id');
      const userCounts = (profiles || []).reduce((acc, p) => {
        if (p.edition_id) {
          acc[p.edition_id] = (acc[p.edition_id] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      return editionsData.map(e => ({ ...e, userCount: userCounts[e.id] || 0 }));
    }
  });

  // Filter editions based on archive toggle
  const filteredEditions = editions?.filter(e => showArchived ? e.is_archived : !e.is_archived);

  // Create edition mutation
  const createMutation = useMutation({
    mutationFn: async (data: { name: string; city: string; cohort_type: 'FORGE' | 'FORGE_WRITING' | 'FORGE_CREATORS'; forge_start_date?: string; forge_end_date?: string }) => {
      const { error } = await supabase.from('editions').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Edition created successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-editions'] });
      setIsDialogOpen(false);
      setSearchParams({});
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  // Update edition mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name: string; city: string; cohort_type: 'FORGE' | 'FORGE_WRITING' | 'FORGE_CREATORS'; forge_start_date?: string; forge_end_date?: string }) => {
      const { error } = await supabase.from('editions').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Edition updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-editions'] });
      setEditingEdition(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  // Archive/Restore edition mutation
  const archiveMutation = useMutation({
    mutationFn: async ({ id, archive }: { id: string; archive: boolean }) => {
      const { error } = await supabase
        .from('editions')
        .update({ 
          is_archived: archive,
          archived_at: archive ? new Date().toISOString() : null 
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, { archive }) => {
      toast.success(archive ? 'Edition archived successfully' : 'Edition restored successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-editions'] });
      setArchivingEdition(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const archivedCount = editions?.filter(e => e.is_archived).length || 0;
  const activeCount = editions?.filter(e => !e.is_archived).length || 0;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Editions</h1>
          <p className="text-muted-foreground mt-1">Manage cohorts and Forge programs</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Edition
        </Button>
      </div>

      {/* Archive Filter Toggle */}
      <div className="flex items-center justify-between mb-6 p-4 bg-card/50 border border-border/50 rounded-lg">
        <div className="flex items-center gap-3">
          <Switch
            id="show-archived"
            checked={showArchived}
            onCheckedChange={setShowArchived}
          />
          <Label htmlFor="show-archived" className="text-sm cursor-pointer">
            {showArchived ? 'Showing archived editions' : 'Show archived editions'}
          </Label>
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>{activeCount} active</span>
          <span>{archivedCount} archived</span>
        </div>
      </div>

      {/* Editions Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : filteredEditions?.length === 0 ? (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="py-12 text-center text-muted-foreground">
            {showArchived 
              ? 'No archived editions.' 
              : 'No active editions. Create your first edition to get started.'}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEditions?.map((edition) => (
            <Card 
              key={edition.id} 
              className={`bg-card/50 border-border/50 transition-opacity ${
                edition.is_archived ? 'opacity-60' : ''
              }`}
            >
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{edition.name}</CardTitle>
                    {edition.is_archived && (
                      <Badge variant="secondary" className="bg-amber-500/20 text-amber-400 text-xs">
                        Archived
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{edition.city}</p>
                  <span className={`mt-2 inline-block px-2 py-0.5 rounded text-xs font-medium ${
                    edition.cohort_type === 'FORGE' ? 'bg-forge-yellow/20 text-forge-yellow' :
                    edition.cohort_type === 'FORGE_WRITING' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-pink-500/20 text-pink-400'
                  }`}>
                    {edition.cohort_type?.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingEdition(edition)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setArchivingEdition(edition)}
                    title={edition.is_archived ? 'Restore edition' : 'Archive edition'}
                  >
                    {edition.is_archived ? (
                      <ArchiveRestore className="w-4 h-4" />
                    ) : (
                      <Archive className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {edition.forge_start_date ? (
                      <span>
                        {format(new Date(edition.forge_start_date), 'MMM d')} - {' '}
                        {edition.forge_end_date ? format(new Date(edition.forge_end_date), 'MMM d, yyyy') : 'TBD'}
                      </span>
                    ) : (
                      <span>Dates TBD</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-primary font-medium">{edition.userCount}</span>
                    <span className="text-muted-foreground">users enrolled</span>
                  </div>
                  {edition.is_archived && edition.archived_at && (
                    <p className="text-xs text-muted-foreground">
                      Archived on {format(new Date(edition.archived_at), 'MMM d, yyyy')}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <EditionDialog
        open={isDialogOpen || !!editingEdition}
        onOpenChange={(open) => {
          if (!open) {
            setIsDialogOpen(false);
            setEditingEdition(null);
            setSearchParams({});
          }
        }}
        edition={editingEdition}
        onSubmit={(data) => {
          if (editingEdition) {
            updateMutation.mutate({ id: editingEdition.id, ...data });
          } else {
            createMutation.mutate(data);
          }
        }}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Archive/Restore Confirmation */}
      <AlertDialog open={!!archivingEdition} onOpenChange={() => setArchivingEdition(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {archivingEdition?.is_archived ? 'Restore Edition?' : 'Archive Edition?'}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              {archivingEdition?.is_archived ? (
                <span>
                  "{archivingEdition?.name}" will be restored and appear in active edition lists.
                </span>
              ) : (
                <>
                  <span>
                    "{archivingEdition?.name}" will be hidden from active lists but all data will be preserved.
                  </span>
                  {archivingEdition && archivingEdition.userCount > 0 && (
                    <span className="block mt-2 text-amber-400">
                      {archivingEdition.userCount} users will remain in this edition but it won't appear in dropdowns for new user assignments.
                    </span>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => archivingEdition && archiveMutation.mutate({ 
                id: archivingEdition.id, 
                archive: !archivingEdition.is_archived 
              })}
              className={archivingEdition?.is_archived 
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-amber-600 text-white hover:bg-amber-700'
              }
            >
              {archiveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {archivingEdition?.is_archived ? 'Restore' : 'Archive'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

type CohortType = 'FORGE' | 'FORGE_WRITING' | 'FORGE_CREATORS';

function EditionDialog({
  open,
  onOpenChange,
  edition,
  onSubmit,
  isLoading
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  edition: Edition | null;
  onSubmit: (data: { name: string; city: string; cohort_type: CohortType; forge_start_date?: string; forge_end_date?: string }) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    cohort_type: 'FORGE',
    forge_start_date: '',
    forge_end_date: ''
  });

  React.useEffect(() => {
    if (edition) {
      setFormData({
        name: edition.name,
        city: edition.city,
        cohort_type: edition.cohort_type || 'FORGE',
        forge_start_date: edition.forge_start_date ? format(new Date(edition.forge_start_date), 'yyyy-MM-dd') : '',
        forge_end_date: edition.forge_end_date ? format(new Date(edition.forge_end_date), 'yyyy-MM-dd') : ''
      });
    } else {
      setFormData({ name: '', city: '', cohort_type: 'FORGE', forge_start_date: '', forge_end_date: '' });
    }
  }, [edition, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      city: formData.city,
      cohort_type: formData.cohort_type as 'FORGE' | 'FORGE_WRITING' | 'FORGE_CREATORS',
      forge_start_date: formData.forge_start_date || undefined,
      forge_end_date: formData.forge_end_date || undefined
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{edition ? 'Edit Edition' : 'Create Edition'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input
              required
              placeholder="e.g., Forge Creators - Mumbai Jan 2025"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>City *</Label>
            <Input
              required
              placeholder="e.g., Mumbai"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Cohort Type *</Label>
            <Select
              value={formData.cohort_type}
              onValueChange={(value) => setFormData({ ...formData, cohort_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select cohort type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FORGE">Forge (Filmmaking)</SelectItem>
                <SelectItem value="FORGE_WRITING">Forge Writing</SelectItem>
                <SelectItem value="FORGE_CREATORS">Forge Creators</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Forge Start</Label>
              <Input
                type="date"
                value={formData.forge_start_date}
                onChange={(e) => setFormData({ ...formData, forge_start_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Forge End</Label>
              <Input
                type="date"
                value={formData.forge_end_date}
                onChange={(e) => setFormData({ ...formData, forge_end_date: e.target.value })}
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {edition ? 'Save Changes' : 'Create Edition'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
