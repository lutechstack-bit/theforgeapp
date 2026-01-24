import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Pencil, Save, X, GripVertical } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface JourneyStage {
  id: string;
  stage_key: string;
  title: string;
  description: string | null;
  order_index: number;
  icon: string | null;
  color: string | null;
  days_before_start: number | null;
  days_after_start: number | null;
  is_active: boolean;
}

const colorOptions = [
  { value: 'emerald', label: 'Emerald', class: 'bg-emerald-500' },
  { value: 'amber', label: 'Amber', class: 'bg-amber-500' },
  { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
  { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
  { value: 'rose', label: 'Rose', class: 'bg-rose-500' },
  { value: 'primary', label: 'Gold (Primary)', class: 'bg-primary' },
];

const iconOptions = [
  'UserPlus', 'Plane', 'CheckSquare', 'Video', 'MapPin', 'Award',
  'Circle', 'Star', 'Heart', 'Flag', 'Target', 'Zap', 'Rocket',
];

const AdminJourneyStages: React.FC = () => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<JourneyStage>>({});

  const { data: stages, isLoading } = useQuery({
    queryKey: ['admin_journey_stages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('journey_stages')
        .select('*')
        .order('order_index', { ascending: true });
      if (error) throw error;
      return data as JourneyStage[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (stage: Partial<JourneyStage> & { id: string }) => {
      const { error } = await supabase
        .from('journey_stages')
        .update({
          title: stage.title,
          description: stage.description,
          icon: stage.icon,
          color: stage.color,
          days_before_start: stage.days_before_start,
          days_after_start: stage.days_after_start,
          is_active: stage.is_active,
        })
        .eq('id', stage.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_journey_stages'] });
      toast.success('Stage updated successfully');
      setEditingId(null);
      setEditForm({});
    },
    onError: () => {
      toast.error('Failed to update stage');
    },
  });

  const startEditing = (stage: JourneyStage) => {
    setEditingId(stage.id);
    setEditForm(stage);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveChanges = () => {
    if (editingId && editForm) {
      updateMutation.mutate({ ...editForm, id: editingId } as any);
    }
  };

  const getIconComponent = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName] || LucideIcons.Circle;
    return <Icon className="w-5 h-5" />;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Journey Stages</h1>
        <p className="text-muted-foreground">
          Configure the 6 stages of the student journey timeline
        </p>
      </div>

      <div className="space-y-4">
        {stages?.map((stage, index) => (
          <Card key={stage.id} className="relative">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <GripVertical className="w-4 h-4" />
                    <span className="text-sm font-medium">#{index + 1}</span>
                  </div>
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      colorOptions.find(c => c.value === stage.color)?.class || 'bg-primary'
                    }`}
                  >
                    <span className="text-white">
                      {getIconComponent(stage.icon || 'Circle')}
                    </span>
                  </div>
                  <CardTitle className="text-lg">{stage.title}</CardTitle>
                  <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                    {stage.stage_key}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={stage.is_active}
                    onCheckedChange={(checked) => {
                      updateMutation.mutate({ id: stage.id, is_active: checked });
                    }}
                  />
                  {editingId === stage.id ? (
                    <>
                      <Button size="sm" onClick={saveChanges}>
                        <Save className="w-4 h-4 mr-1" /> Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEditing}>
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => startEditing(stage)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {editingId === stage.id ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={editForm.title || ''}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Icon</Label>
                    <select
                      className="w-full px-3 py-2 rounded-md border border-input bg-background"
                      value={editForm.icon || 'Circle'}
                      onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                    >
                      {iconOptions.map(icon => (
                        <option key={icon} value={icon}>{icon}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Description</Label>
                    <Textarea
                      value={editForm.description || ''}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <div className="flex gap-2 flex-wrap">
                      {colorOptions.map(color => (
                        <button
                          key={color.value}
                          onClick={() => setEditForm({ ...editForm, color: color.value })}
                          className={`w-8 h-8 rounded-full ${color.class} ${
                            editForm.color === color.value ? 'ring-2 ring-offset-2 ring-primary' : ''
                          }`}
                          title={color.label}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Timing</Label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Input
                          type="number"
                          placeholder="Days before"
                          value={editForm.days_before_start ?? ''}
                          onChange={(e) => setEditForm({
                            ...editForm,
                            days_before_start: e.target.value ? parseInt(e.target.value) : null,
                          })}
                        />
                        <span className="text-xs text-muted-foreground">Days before start</span>
                      </div>
                      <div className="flex-1">
                        <Input
                          type="number"
                          placeholder="Days after"
                          value={editForm.days_after_start ?? ''}
                          onChange={(e) => setEditForm({
                            ...editForm,
                            days_after_start: e.target.value ? parseInt(e.target.value) : null,
                          })}
                        />
                        <span className="text-xs text-muted-foreground">Days after start</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {stage.description || 'No description'}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminJourneyStages;
