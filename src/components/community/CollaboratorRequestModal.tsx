import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FloatingTextarea } from '@/components/ui/floating-textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2, Send } from 'lucide-react';

interface CollaboratorRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientId: string;
  recipientName: string;
}

export const CollaboratorRequestModal: React.FC<CollaboratorRequestModalProps> = ({
  open,
  onOpenChange,
  recipientId,
  recipientName,
}) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!user || !message.trim()) return;
    setSending(true);

    try {
      const { error } = await supabase.from('collaboration_requests').insert({
        from_user_id: user.id,
        to_user_id: recipientId,
        message: message.trim(),
      });

      if (error) throw error;
      toast.success(`Request sent to ${recipientName}`);
      setMessage('');
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to send request');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Contact {recipientName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <FloatingTextarea
            label="Your message"
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, 500))}
            className="min-h-[120px]"
          />
          <p className="text-xs text-muted-foreground text-right">{message.length}/500</p>
          <Button onClick={handleSend} disabled={sending || !message.trim()} className="w-full gap-2">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Send Request
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
