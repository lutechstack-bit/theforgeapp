import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

export interface DocVersion {
  id: string;
  version: string;
  title: string;
  changelog: string | null;
  release_notes: string | null;
  content_snapshot: Json;
  created_by: string | null;
  created_at: string;
  is_current: boolean;
  creator_name?: string;
}

export interface CreateDocVersionInput {
  version: string;
  title: string;
  changelog?: string;
  release_notes?: string;
  content_snapshot: Json;
  is_current?: boolean;
}

export const useDocVersions = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: versions = [], isLoading, error } = useQuery({
    queryKey: ['doc-versions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_doc_versions')
        .select(`
          *,
          profiles:created_by (full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((v: any) => ({
        ...v,
        creator_name: v.profiles?.full_name || 'Unknown'
      })) as DocVersion[];
    },
  });

  const currentVersion = versions.find(v => v.is_current) || versions[0];

  const createVersion = useMutation({
    mutationFn: async (input: CreateDocVersionInput) => {
      const { data, error } = await supabase
        .from('app_doc_versions')
        .insert([{
          version: input.version,
          title: input.title,
          changelog: input.changelog || null,
          release_notes: input.release_notes || null,
          content_snapshot: input.content_snapshot,
          created_by: user?.id || null,
          is_current: input.is_current ?? true,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doc-versions'] });
      toast.success('Documentation version created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create version: ${error.message}`);
    },
  });

  const setCurrentVersion = useMutation({
    mutationFn: async (versionId: string) => {
      const { error } = await supabase
        .from('app_doc_versions')
        .update({ is_current: true })
        .eq('id', versionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doc-versions'] });
      toast.success('Current version updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update version: ${error.message}`);
    },
  });

  const deleteVersion = useMutation({
    mutationFn: async (versionId: string) => {
      const { error } = await supabase
        .from('app_doc_versions')
        .delete()
        .eq('id', versionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doc-versions'] });
      toast.success('Version deleted');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete version: ${error.message}`);
    },
  });

  const suggestNextVersion = (type: 'major' | 'minor' | 'patch'): string => {
    if (versions.length === 0) return '1.0.0';
    
    const latestVersion = versions[0].version;
    const parts = latestVersion.split('.').map(Number);
    
    if (parts.length !== 3) return '1.0.0';
    
    switch (type) {
      case 'major':
        return `${parts[0] + 1}.0.0`;
      case 'minor':
        return `${parts[0]}.${parts[1] + 1}.0`;
      case 'patch':
        return `${parts[0]}.${parts[1]}.${parts[2] + 1}`;
      default:
        return latestVersion;
    }
  };

  return {
    versions,
    currentVersion,
    isLoading,
    error,
    createVersion,
    setCurrentVersion,
    deleteVersion,
    suggestNextVersion,
  };
};
