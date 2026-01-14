import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, Sparkles, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useEventRegistration } from '@/hooks/useEventRegistration';

interface EventRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: {
    id: string;
    title: string;
    event_date: string;
    location?: string;
    is_virtual?: boolean;
    image_url?: string;
  } | null;
}

export const EventRegistrationModal: React.FC<EventRegistrationModalProps> = ({
  isOpen,
  onClose,
  event,
}) => {
  const { user, profile } = useAuth();
  const { register, isRegistering, isRegistered } = useEventRegistration(event?.id);

  if (!event) return null;

  const eventDate = new Date(event.event_date);
  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  const handleConfirm = () => {
    register(event.id, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-primary" />
            Confirm Attendance
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Event Image Preview */}
          {event.image_url && (
            <div className="relative aspect-[16/9] rounded-xl overflow-hidden">
              <img
                src={event.image_url}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            </div>
          )}

          {/* Event Details */}
          <div className="space-y-3">
            <h3 className="font-bold text-lg text-foreground line-clamp-2">
              {event.title}
            </h3>

            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span>{format(eventDate, 'EEEE, MMMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>{format(eventDate, 'h:mm a')}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{event.is_virtual ? 'Virtual Event' : event.location || 'TBA'}</span>
              </div>
            </div>
          </div>

          {/* Personalized Message */}
          <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
            <p className="text-sm text-foreground">
              Hey <span className="font-semibold text-primary">{firstName}</span>! Ready to join?
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              We'll use your profile info for registration.
            </p>
          </div>

          {/* Already Registered State */}
          {isRegistered && (
            <div className="flex items-center gap-2 text-sm text-green-500 bg-green-500/10 rounded-lg p-3">
              <CheckCircle className="h-4 w-4" />
              <span>You're already registered for this event!</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isRegistering || isRegistered || !user}
            className="flex-1 gap-2"
          >
            {isRegistering ? (
              'Registering...'
            ) : isRegistered ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Registered
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Confirm & Register
              </>
            )}
          </Button>
        </div>

        {!user && (
          <p className="text-xs text-muted-foreground text-center">
            Please log in to register for events
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};
