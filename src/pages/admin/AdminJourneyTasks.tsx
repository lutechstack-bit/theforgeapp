import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Save, X, GripVertical, ChevronRight } from 'lucide-react';

interface JourneyStage {
  id: string;
  stage_key: string;
  title: string;
  order_index: number;
}

interface JourneyTask {
  id: string;
  stage_id: string;
  title: string;
  description: string | null;
  cohort_types: string[];
  auto_complete_field: string | null;
  deep_link: string | null;
  order_index: number;
  is_required: boolean;
  is_active: boolean;
}

const cohortOptions = [
  { value: 'FORGE', label: 'Forge Filmmaking' },
  { value: 'FORGE_WRITING', label: 'Forge Writing' },
  { value: 'FORGE_CREATORS', label: 'Forge Creators' },
];

const autoCompleteOptions = [
  { value: '', label: 'Manual completion only' },
  { value: 'ky_form_completed', label: 'KY Form completed' },
  { value: 'profile_setup_completed', label: 'Profile setup completed' },
  { value: 'payment_status', label: 'Balance paid' },
  { value: 'instagram_handle', label: 'Instagram connected' },
  { value: 'community_intro', label: 'Community intro posted' },
];

const deepLinkOptions = [
  { value: '', label: 'No link' },
  { value: '/kyf', label: 'KY Form' },
  { value: '/profile', label: 'Profile' },
  { value: '/community', label: 'Community' },
  { value: '/learn', label: 'Learn' },
  { value: '/events', label: 'Events' },
  { value: '/roadmap', label: 'Roadmap' },
  { value: '/roadmap/prep', label: 'Prep Checklist' },
];

const AdminJourneyTasks: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<JourneyTask>>({});
  const [createForm, setCreateForm] = useState<Partial<JourneyTask>>({
    cohort_types: ['FORGE', 'FORGE_WRITING', 'FORGE_CREATORS'],
    is_required: true,
    is_active: true,
  });

  const { data: stages } = useQuery({
    queryKey: ['admin_journey_stages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('journey_stages')
        .select('id, stage_key, title, order_index')
        .order('order_index', { ascending: true });
      if (error) throw error;
      return data as JourneyStage[];
    },
  });

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['admin_journey_tasks', selectedStageId],
    queryFn: async () => {
      let query = supabase
        .from('journey_tasks')
        .select('*')
        .order('order_index', { ascending: true });
      
      if (selectedStageId) {
        query = query.eq('stage_id', selectedStageId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as JourneyTask[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (task: Partial<JourneyTask>) => {
      const maxOrder = tasks?.reduce((max, t) => Math.max(max, t.order_index), -1) ?? -1;
      const { error } = await supabase
        .from('journey_tasks')
        .insert({
          stage_id: task.stage_id!,
          title: task.title!,
          description: task.description || null,
          cohort_types: task.cohort_types || ['FORGE', 'FORGE_WRITING', 'FORGE_CREATORS'],
          auto_complete_field: task.auto_complete_field || null,
          deep_link: task.deep_link || null,
          is_required: task.is_required ?? true,
          is_active: task.is_active ?? true,
          order_index: maxOrder + 1,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_journey_tasks'] });
      toast.success('Task created successfully');
      setIsCreateOpen(false);
      setCreateForm({
        cohort_types: ['FORGE', 'FORGE_WRITING', 'FORGE_CREATORS'],
        is_required: true,
        is_active: true,
      });
    },
    onError: () => {
      toast.error('Failed to create task');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (task: Partial<JourneyTask> & { id: string }) => {
      const { id, ...updates } = task;
      const { error } = await supabase
        .from('journey_tasks')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_journey_tasks'] });
      toast.success('Task updated successfully');
      setEditingId(null);
      setEditForm({});
    },
    onError: () => {
      toast.error('Failed to update task');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('journey_tasks')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_journey_tasks'] });
      toast.success('Task deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete task');
    },
  });

  const handleCohortChange = (cohort: string, checked: boolean, isCreate: boolean) => {
    const form = isCreate ? createForm : editForm;
    const setForm = isCreate ? setCreateForm : setEditForm;
    const currentCohorts = form.cohort_types || [];
    
    if (checked) {
      setForm({ ...form, cohort_types: [...currentCohorts, cohort] });
    } else {
      setForm({ ...form, cohort_types: currentCohorts.filter(c => c !== cohort) });
    }
  };

  const getStageTitle = (stageId: string) => {
    return stages?.find(s => s.id === stageId)?.title || 'Unknown';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Journey Tasks</h1>
          <p className="text-muted-foreground">
            Manage tasks for each stage of the student journey
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Stage</Label>
                <Select
                  value={createForm.stage_id || ''}
                  onValueChange={(value) => setCreateForm({ ...createForm, stage_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {stages?.map(stage => (
                      <SelectItem key={stage.id} value={stage.id}>
                        {stage.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={createForm.title || ''}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  placeholder="Enter task title"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={createForm.description || ''}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Brief helper text"
                />
              </div>
              <div className="space-y-2">
                <Label>Cohorts</Label>
                <div className="flex gap-4">
                  {cohortOptions.map(cohort => (
                    <label key={cohort.value} className="flex items-center gap-2">
                      <Checkbox
                        checked={createForm.cohort_types?.includes(cohort.value)}
                        onCheckedChange={(checked) => handleCohortChange(cohort.value, !!checked, true)}
                      />
                      <span className="text-sm">{cohort.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Auto-Complete</Label>
                  <Select
                    value={createForm.auto_complete_field || ''}
                    onValueChange={(value) => setCreateForm({ ...createForm, auto_complete_field: value || null })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select trigger" />
                    </SelectTrigger>
                    <SelectContent>
                      {autoCompleteOptions.map(opt => (
                        <SelectItem key={opt.value || 'none'} value={opt.value || 'none'}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Deep Link</Label>
                  <Select
                    value={createForm.deep_link || ''}
                    onValueChange={(value) => setCreateForm({ ...createForm, deep_link: value || null })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select link" />
                    </SelectTrigger>
                    <SelectContent>
                      {deepLinkOptions.map(opt => (
                        <SelectItem key={opt.value || 'none'} value={opt.value || 'none'}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={createForm.is_required}
                    onCheckedChange={(checked) => setCreateForm({ ...createForm, is_required: !!checked })}
                  />
                  <span className="text-sm">Required</span>
                </label>
              </div>
              <Button
                onClick={() => createMutation.mutate(createForm)}
                disabled={!createForm.stage_id || !createForm.title}
                className="w-full"
              >
                Create Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stage filter */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={selectedStageId === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedStageId(null)}
        >
          All Stages
        </Button>
        {stages?.map(stage => (
          <Button
            key={stage.id}
            variant={selectedStageId === stage.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStageId(stage.id)}
          >
            {stage.title}
          </Button>
        ))}
      </div>

      {/* Tasks list */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-muted rounded-lg" />
            ))}
          </div>
        ) : tasks?.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No tasks found. Create your first task!</p>
          </Card>
        ) : (
          tasks?.map((task) => (
            <Card key={task.id}>
              <CardContent className="p-4">
                {editingId === task.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          value={editForm.title || ''}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Stage</Label>
                        <Select
                          value={editForm.stage_id || ''}
                          onValueChange={(value) => setEditForm({ ...editForm, stage_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {stages?.map(stage => (
                              <SelectItem key={stage.id} value={stage.id}>
                                {stage.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={editForm.description || ''}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Cohorts</Label>
                      <div className="flex gap-4">
                        {cohortOptions.map(cohort => (
                          <label key={cohort.value} className="flex items-center gap-2">
                            <Checkbox
                              checked={editForm.cohort_types?.includes(cohort.value)}
                              onCheckedChange={(checked) => handleCohortChange(cohort.value, !!checked, false)}
                            />
                            <span className="text-sm">{cohort.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Auto-Complete</Label>
                        <Select
                          value={editForm.auto_complete_field || 'none'}
                          onValueChange={(value) => setEditForm({ 
                            ...editForm, 
                            auto_complete_field: value === 'none' ? null : value 
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {autoCompleteOptions.map(opt => (
                              <SelectItem key={opt.value || 'none'} value={opt.value || 'none'}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Deep Link</Label>
                        <Select
                          value={editForm.deep_link || 'none'}
                          onValueChange={(value) => setEditForm({ 
                            ...editForm, 
                            deep_link: value === 'none' ? null : value 
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {deepLinkOptions.map(opt => (
                              <SelectItem key={opt.value || 'none'} value={opt.value || 'none'}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2">
                        <Checkbox
                          checked={editForm.is_required}
                          onCheckedChange={(checked) => setEditForm({ ...editForm, is_required: !!checked })}
                        />
                        <span className="text-sm">Required</span>
                      </label>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => updateMutation.mutate({ ...editForm, id: task.id } as any)}>
                          <Save className="w-4 h-4 mr-1" /> Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => { setEditingId(null); setEditForm({}); }}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{task.title}</span>
                          {task.deep_link && (
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{getStageTitle(task.stage_id)}</span>
                          <span>•</span>
                          <span>{task.cohort_types?.length || 0} cohorts</span>
                          {task.auto_complete_field && (
                            <>
                              <span>•</span>
                              <span className="text-amber-600">Auto-complete</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={task.is_active}
                        onCheckedChange={(checked) => updateMutation.mutate({ id: task.id, is_active: checked })}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setEditingId(task.id); setEditForm(task); }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (confirm('Delete this task?')) {
                            deleteMutation.mutate(task.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminJourneyTasks;
