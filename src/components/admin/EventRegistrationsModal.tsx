import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Download, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface EventRegistrationsModalProps {
  eventId: string | null;
  eventTitle: string;
  onClose: () => void;
}

interface Registration {
  id: string;
  registered_at: string;
  profiles: {
    full_name: string | null;
    email: string | null;
    phone: string | null;
    city: string | null;
  } | null;
}

export const EventRegistrationsModal: React.FC<EventRegistrationsModalProps> = ({
  eventId,
  eventTitle,
  onClose,
}) => {
  const { data: registrations = [], isLoading } = useQuery({
    queryKey: ['event-registrations', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      
      const { data, error } = await supabase
        .from('event_registrations')
        .select(`
          id,
          registered_at,
          user_id
        `)
        .eq('event_id', eventId)
        .order('registered_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles separately to avoid join issues
      const userIds = data.map(r => r.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, city')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Map profiles to registrations
      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      return data.map(r => ({
        id: r.id,
        registered_at: r.registered_at,
        profiles: profilesMap.get(r.user_id) || null,
      })) as Registration[];
    },
    enabled: !!eventId,
  });

  const downloadCSV = () => {
    if (!registrations.length) return;

    const headers = ['Name', 'Email', 'Phone', 'City', 'Registered At'];
    const rows = registrations.map(r => [
      r.profiles?.full_name || '',
      r.profiles?.email || '',
      r.profiles?.phone || '',
      r.profiles?.city || '',
      format(new Date(r.registered_at), 'yyyy-MM-dd HH:mm'),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${eventTitle.replace(/[^a-z0-9]/gi, '-')}-registrations.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={!!eventId} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Registrations for "{eventTitle}"
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between py-3 border-b border-border/50">
          <span className="text-sm text-muted-foreground">
            {registrations.length} {registrations.length === 1 ? 'person' : 'people'} registered
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadCSV}
            disabled={registrations.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Download CSV
          </Button>
        </div>

        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading registrations...</div>
          ) : registrations.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No registrations yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Registered At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrations.map((reg) => (
                  <TableRow key={reg.id}>
                    <TableCell className="font-medium">
                      {reg.profiles?.full_name || '-'}
                    </TableCell>
                    <TableCell>{reg.profiles?.email || '-'}</TableCell>
                    <TableCell>{reg.profiles?.phone || '-'}</TableCell>
                    <TableCell>{reg.profiles?.city || '-'}</TableCell>
                    <TableCell>
                      {format(new Date(reg.registered_at), 'MMM d, yyyy h:mm a')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
