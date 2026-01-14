import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { CleanEventCard } from '@/components/shared/CleanEventCard';
import { EventRegistrationModal } from '@/components/events/EventRegistrationModal';
import { Search, Calendar } from 'lucide-react';
import { isPast } from 'date-fns';
import { useEventRegistration } from '@/hooks/useEventRegistration';

const Events: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { userRegistrations } = useEventRegistration();

  // Fetch events
  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['events'],
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
        .order('event_date', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Filter and sort events
  const filteredEvents = events.filter((event) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        event.title.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.location?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Separate upcoming and past, then combine with upcoming first
  const upcomingEvents = filteredEvents
    .filter(e => !isPast(new Date(e.event_date)))
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
  
  const pastEvents = filteredEvents
    .filter(e => isPast(new Date(e.event_date)))
    .sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());

  const sortedEvents = [...upcomingEvents, ...pastEvents];

  const handleRegisterClick = (e: React.MouseEvent, event: any) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Events</h1>
          <p className="text-muted-foreground text-sm">
            {upcomingEvents.length} upcoming event{upcomingEvents.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card/60 border-border/50 h-11"
          />
        </div>

        {/* Events Grid */}
        {eventsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[4/3] rounded-2xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-9 w-full rounded-lg" />
              </div>
            ))}
          </div>
        ) : sortedEvents.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <div className="w-16 h-16 mx-auto bg-muted/30 rounded-full flex items-center justify-center">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <p className="text-foreground font-medium">No events found</p>
              <p className="text-muted-foreground text-sm mt-1">
                {searchQuery ? 'Try a different search term' : 'Check back soon for upcoming events'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
              <section>
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                  Upcoming
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {upcomingEvents.map((event) => (
                    <CleanEventCard
                      key={event.id}
                      id={event.id}
                      title={event.title}
                      imageUrl={event.image_url || undefined}
                      date={new Date(event.event_date)}
                      location={event.location || undefined}
                      isVirtual={event.is_virtual}
                      eventType={event.event_types?.name}
                      isFillingFast={!event.is_virtual}
                      isRegistered={userRegistrations.includes(event.id)}
                      isPastEvent={false}
                      onRegister={(e) => handleRegisterClick(e, event)}
                      onClick={() => navigate(`/events/${event.id}`)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Past Events */}
            {pastEvents.length > 0 && (
              <section>
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                  Past Events
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {pastEvents.map((event) => (
                    <CleanEventCard
                      key={event.id}
                      id={event.id}
                      title={event.title}
                      imageUrl={event.image_url || undefined}
                      date={new Date(event.event_date)}
                      location={event.location || undefined}
                      isVirtual={event.is_virtual}
                      eventType={event.event_types?.name}
                      isPastEvent={true}
                      onClick={() => navigate(`/events/${event.id}`)}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Registration Modal */}
        <EventRegistrationModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedEvent(null);
          }}
          event={selectedEvent}
        />
      </div>
    </div>
  );
};

export default Events;
