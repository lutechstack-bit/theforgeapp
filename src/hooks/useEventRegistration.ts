import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useEventRegistration = (eventId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if user is registered for a specific event
  const { data: isRegistered, isLoading: isCheckingRegistration } = useQuery({
    queryKey: ['event-registration', eventId, user?.id],
    queryFn: async () => {
      if (!user || !eventId) return false;
      
      const { data, error } = await supabase
        .from('event_registrations')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return !!data;
    },
    enabled: !!user && !!eventId,
  });

  // Get all user's event registrations
  const { data: userRegistrations = [] } = useQuery({
    queryKey: ['user-event-registrations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('event_registrations')
        .select('event_id')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data.map(r => r.event_id);
    },
    enabled: !!user,
  });

  // Register for an event
  const registerMutation = useMutation({
    mutationFn: async (eventId: string) => {
      if (!user) throw new Error('Must be logged in to register');
      
      const { error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: eventId,
          user_id: user.id,
        });
      
      if (error) throw error;
    },
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: ['event-registration', eventId] });
      queryClient.invalidateQueries({ queryKey: ['user-event-registrations'] });
      toast({
        title: "You're in! 🎉",
        description: "We've saved your spot. See you there!",
      });
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        toast({
          title: "Already registered",
          description: "You've already registered for this event.",
        });
      } else {
        toast({
          title: "Registration failed",
          description: error.message || "Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  // Cancel registration
  const cancelMutation = useMutation({
    mutationFn: async (eventId: string) => {
      if (!user) throw new Error('Must be logged in');
      
      const { error } = await supabase
        .from('event_registrations')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: ['event-registration', eventId] });
      queryClient.invalidateQueries({ queryKey: ['user-event-registrations'] });
      toast({
        title: "Registration cancelled",
        description: "Your spot has been released.",
      });
    },
  });

  return {
    isRegistered: isRegistered ?? false,
    isCheckingRegistration,
    userRegistrations,
    register: registerMutation.mutate,
    cancel: cancelMutation.mutate,
    isRegistering: registerMutation.isPending,
    isCancelling: cancelMutation.isPending,
  };
};
