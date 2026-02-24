import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Calendar, MapPin, Clock, Video, FileText, User, ExternalLink, CheckCircle, Sparkles, Share2, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { format, isPast } from 'date-fns';
import { useEventRegistration } from '@/hooks/useEventRegistration';
import { EventRegistrationModal } from '@/components/events/EventRegistrationModal';
import { toast } from 'sonner';

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select(`*, event_types (id, name, icon)`)
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { isRegistered, isCheckingRegistration } = useEventRegistration(id);
  const isEventPast = event ? isPast(new Date(event.event_date)) : false;

  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    return url;
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: event?.title, url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 pb-24 max-w-5xl lg:max-w-6xl mx-auto">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,400px)_1fr] gap-8">
          <div className="space-y-4">
            <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        </div>
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
  const eventDate = new Date(event.event_date);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Breadcrumb Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50 px-4 py-3">
        <div className="max-w-5xl lg:max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm min-w-0">
            <button
              onClick={() => navigate('/events')}
              className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              Events
            </button>
            <span className="text-muted-foreground/50">/</span>
            <span className="text-foreground truncate font-medium">{event.title}</span>
          </div>
          <Button variant="outline" size="sm" className="gap-2 shrink-0" onClick={handleShare}>
            <Share2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Share Event</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl lg:max-w-6xl mx-auto px-4 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,380px)_1fr] gap-8">
          {/* Left Column */}
          <div className="flex flex-col gap-5">
            {/* Event Image */}
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-card/60 border border-border/50">
              {event.image_url ? (
                <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/10 to-muted/30 flex items-center justify-center">
                  <Calendar className="h-16 w-16 text-primary/30" />
                </div>
              )}
            </div>

            {/* Hosted By */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Hosted By</p>
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 border border-border/50">
                  {event.host_avatar_url ? (
                    <AvatarImage src={event.host_avatar_url} alt={event.host_name || 'Host'} />
                  ) : null}
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {(event.host_name || 'H').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-foreground">{event.host_name || 'Forge Team'}</span>
              </div>
            </div>

            {/* Register CTA */}
            {!isEventPast && (
              <Button
                className="w-full gap-2"
                size="lg"
                variant={isRegistered ? 'secondary' : 'default'}
                onClick={() => setIsModalOpen(true)}
                disabled={isCheckingRegistration}
              >
                {isRegistered ? (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    You're Registered
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Register
                  </>
                )}
              </Button>
            )}

            {isEventPast && (
              <Badge variant="outline" className="w-fit text-muted-foreground">
                Past Event
              </Badge>
            )}
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-6">
            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight">{event.title}</h1>

            {/* Date/Time Card */}
            <div className="flex items-start gap-4 bg-card/60 border border-border/50 rounded-xl p-4">
              <div className="flex flex-col items-center justify-center bg-primary/10 rounded-lg px-3 py-2 min-w-[52px]">
                <span className="text-[10px] font-bold text-primary uppercase leading-none">
                  {format(eventDate, 'MMM')}
                </span>
                <span className="text-xl font-bold text-foreground leading-tight">
                  {format(eventDate, 'd')}
                </span>
              </div>
              <div className="space-y-0.5">
                <p className="font-medium text-foreground">{format(eventDate, 'EEEE, MMMM d')}</p>
                <p className="text-sm text-muted-foreground">{format(eventDate, 'h:mm a')}</p>
              </div>
            </div>

            {/* Location / Virtual Card */}
            <div className="flex items-center gap-4 bg-card/60 border border-border/50 rounded-xl p-4">
              {event.is_virtual ? (
                <Camera className="h-5 w-5 text-primary shrink-0" />
              ) : (
                <MapPin className="h-5 w-5 text-primary shrink-0" />
              )}
              <div>
                <p className="font-medium text-foreground">
                  {event.is_virtual ? 'Virtual Meeting' : (event.location || 'Location TBD')}
                </p>
                {event.is_virtual && (
                  <p className="text-sm text-muted-foreground">Online event</p>
                )}
              </div>
            </div>

            {/* About */}
            {event.description && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">About</h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{event.description}</p>
              </div>
            )}

            {/* Recording (past events) */}
            {isEventPast && embedUrl && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
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
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => window.open(event.recording_url, '_blank')}>
                    <ExternalLink className="h-4 w-4" />
                    Open in New Tab
                  </Button>
                )}
              </div>
            )}

            {/* Notes (past events) */}
            {isEventPast && event.notes && (
              <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Event Notes
                </h3>
                <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{event.notes}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      <EventRegistrationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} event={event} />
    </div>
  );
};

export default EventDetail;
