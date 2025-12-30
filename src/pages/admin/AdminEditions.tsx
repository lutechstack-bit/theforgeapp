import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Loader2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import type { Database } from '@/integrations/supabase/types';

type Edition = Database['public']['Tables']['editions']['Row'];

export default function AdminEditions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isDialogOpen, setIsDialogOpen] = useState(searchParams.get('action') === 'create');
  const [editingEdition, setEditingEdition] = useState<Edition | null>(null);
  const [deletingEdition, setDeletingEdition] = useState<Edition | null>(null);
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

  // Create edition mutation
  const createMutation = useMutation({
    mutationFn: async (data: { name: string; city: string; forge_start_date?: string; forge_end_date?: string }) => {
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
    mutationFn: async ({ id, ...data }: { id: string; name: string; city: string; forge_start_date?: string; forge_end_date?: string }) => {
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

  // Delete edition mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('editions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Edition deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-editions'] });
      setDeletingEdition(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

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

      {/* Editions Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : editions?.length === 0 ? (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="py-12 text-center text-muted-foreground">
            No editions yet. Create your first edition to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {editions?.map((edition) => (
            <Card key={edition.id} className="bg-card/50 border-border/50">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{edition.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{edition.city}</p>
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
                    onClick={() => setDeletingEdition(edition)}
                  >
                    <Trash2 className="w-4 h-4" />
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

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingEdition} onOpenChange={() => setDeletingEdition(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Edition?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deletingEdition?.name}". Users assigned to this edition will need to be reassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingEdition && deleteMutation.mutate(deletingEdition.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

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
  onSubmit: (data: { name: string; city: string; forge_start_date?: string; forge_end_date?: string }) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    forge_start_date: '',
    forge_end_date: ''
  });

  React.useEffect(() => {
    if (edition) {
      setFormData({
        name: edition.name,
        city: edition.city,
        forge_start_date: edition.forge_start_date ? format(new Date(edition.forge_start_date), 'yyyy-MM-dd') : '',
        forge_end_date: edition.forge_end_date ? format(new Date(edition.forge_end_date), 'yyyy-MM-dd') : ''
      });
    } else {
      setFormData({ name: '', city: '', forge_start_date: '', forge_end_date: '' });
    }
  }, [edition, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      city: formData.city,
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
