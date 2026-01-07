import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Calendar, MapPin, Clock, Video, FileText, User, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format, isPast } from 'date-fns';

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          event_types (
            id,
            name,
            icon
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const isEventPast = event ? isPast(new Date(event.event_date)) : false;

  // Extract video embed URL
  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    
    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    
    return url;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 pb-24">
        <Skeleton className="h-10 w-32 mb-6" />
        <Skeleton className="h-48 w-full rounded-2xl mb-6" />
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-4 w-1/2 mb-2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background p-4 flex flex-col items-center justify-center">
        <p className="text-muted-foreground mb-4">Event not found</p>
        <Button onClick={() => navigate('/events')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>
      </div>
    );
  }

  const embedUrl = event.recording_url ? getEmbedUrl(event.recording_url) : null;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50 p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/events')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Button>
      </div>

      <div className="p-4 space-y-6">
        {/* Hero Image */}
        {event.image_url && (
          <div className="relative aspect-video rounded-2xl overflow-hidden">
            <img
              src={event.image_url}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
          </div>
        )}

        {/* Event Info */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {event.event_types && (
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {event.event_types.name}
              </Badge>
            )}
            {isEventPast && (
              <Badge variant="outline" className="text-muted-foreground">
                Past Event
              </Badge>
            )}
            {event.is_virtual && (
              <Badge variant="outline">Virtual</Badge>
            )}
          </div>

          <h1 className="text-2xl font-bold text-foreground">{event.title}</h1>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span>{format(new Date(event.event_date), 'EEEE, MMMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span>{format(new Date(event.event_date), 'h:mm a')}</span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{event.is_virtual ? 'Virtual Event' : event.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-4">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              About this Event
            </h3>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {event.description}
            </p>
          </div>
        )}

        {/* Recording Section - Only for past events */}
        {isEventPast && embedUrl && (
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Video className="h-4 w-4 text-primary" />
              Event Recording
            </h3>
            <div className="aspect-video rounded-xl overflow-hidden bg-card/60 border border-border/50">
              <iframe
                src={embedUrl}
                title={`${event.title} Recording`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            {event.recording_url && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => window.open(event.recording_url, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
                Open in New Tab
              </Button>
            )}
          </div>
        )}

        {/* Notes Section - Only for past events */}
        {isEventPast && event.notes && (
          <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-4 space-y-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Event Notes
            </h3>
            <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {event.notes}
            </div>
          </div>
        )}

        {/* CTA for upcoming events */}
        {!isEventPast && (
          <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
            <Button className="w-full" size="lg">
              Register for Event
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetail;
