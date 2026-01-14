import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PremiumEventCard } from '@/components/shared/PremiumEventCard';
import { EventTypeTabs } from '@/components/events/EventTypeTabs';
import { PastProgramsCarousel } from '@/components/events/PastProgramsCarousel';
import { CalendarSyncModal } from '@/components/events/CalendarSyncModal';
import { Search, CalendarPlus, Clock, History, Video, MapPin, Sparkles } from 'lucide-react';
import { isPast } from 'date-fns';

type TimeFilter = 'upcoming' | 'past';
type LocationFilter = 'all' | 'virtual' | 'in-person';

const Events: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('upcoming');
  const [locationFilter, setLocationFilter] = useState<LocationFilter>('all');
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);

  // Fetch event types
  const { data: eventTypes = [] } = useQuery({
    queryKey: ['event-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_types')
        .select('*')
        .eq('is_active', true)
        .order('order_index');
      if (error) throw error;
      return data;
    },
  });

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

  // Fetch past programs
  const { data: pastPrograms = [] } = useQuery({
    queryKey: ['past-programs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('past_programs')
        .select('*')
        .eq('is_active', true)
        .order('completion_date', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Filter events
  const filteredEvents = events.filter((event) => {
    const eventDate = new Date(event.event_date);
    const isEventPast = isPast(eventDate);

    // Time filter
    if (timeFilter === 'upcoming' && isEventPast) return false;
    if (timeFilter === 'past' && !isEventPast) return false;

    // Location filter
    if (locationFilter === 'virtual' && !event.is_virtual) return false;
    if (locationFilter === 'in-person' && event.is_virtual) return false;

    // Type filter
    if (selectedTypeId && event.event_type_id !== selectedTypeId) return false;

    // Search filter
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

  // Sort: upcoming ascending, past descending
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const dateA = new Date(a.event_date).getTime();
    const dateB = new Date(b.event_date).getTime();
    return timeFilter === 'upcoming' ? dateA - dateB : dateB - dateA;
  });

  const timeFilters: { id: TimeFilter; label: string; icon: React.ReactNode }[] = [
    { id: 'upcoming', label: 'Upcoming', icon: <Clock className="h-3.5 w-3.5" /> },
    { id: 'past', label: 'Archive', icon: <History className="h-3.5 w-3.5" /> },
  ];

  const locationFilters: { id: LocationFilter; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All', icon: <Sparkles className="h-3.5 w-3.5" /> },
    { id: 'virtual', label: 'Virtual', icon: <Video className="h-3.5 w-3.5" /> },
    { id: 'in-person', label: 'In-Person', icon: <MapPin className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="p-3 sm:p-4 space-y-4 sm:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Events</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">Discover and join community events</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card/60 border-border/50"
          />
        </div>

        {/* Past Programs Carousel */}
        <PastProgramsCarousel
          programs={pastPrograms}
          onProgramClick={(program) => {
            if (program.recording_url) {
              window.open(program.recording_url, '_blank');
            }
          }}
        />

        {/* Event Type Tabs */}
        <EventTypeTabs
          eventTypes={eventTypes}
          selectedTypeId={selectedTypeId}
          onSelectType={setSelectedTypeId}
        />

        {/* Time & Location Filters */}
        <div className="flex flex-wrap gap-2">
          {/* Time filters */}
          <div className="flex gap-1 bg-card/40 p-1 rounded-lg">
            {timeFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setTimeFilter(filter.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  timeFilter === filter.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {filter.icon}
                {filter.label}
              </button>
            ))}
          </div>

          {/* Location filters */}
          <div className="flex gap-1 bg-card/40 p-1 rounded-lg">
            {locationFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setLocationFilter(filter.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  locationFilter === filter.id
                    ? 'bg-secondary text-secondary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {filter.icon}
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        {eventsLoading ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />
            ))}
          </div>
        ) : sortedEvents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No events found</p>
            {(searchQuery || selectedTypeId || locationFilter !== 'all') && (
              <Button
                variant="link"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTypeId(null);
                  setLocationFilter('all');
                }}
                className="mt-2"
              >
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
            {sortedEvents.map((event) => {
              const isEventPast = isPast(new Date(event.event_date));
              return (
                <PremiumEventCard
                  key={event.id}
                  id={event.id}
                  title={event.title}
                  imageUrl={event.image_url}
                  date={new Date(event.event_date)}
                  location={event.location || ''}
                  isVirtual={event.is_virtual}
                  hostName={event.event_types?.name}
                  isFillingFast={!isEventPast && !event.is_virtual}
                  hasRecording={isEventPast && !!event.recording_url}
                  hasNotes={isEventPast && !!event.notes}
                  onClick={() => navigate(`/events/${event.id}`)}
                />
              );
            })}
          </div>
        )}

        {/* Calendar Sync CTA */}
        <div 
          onClick={() => setIsCalendarModalOpen(true)}
          className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-primary/20 cursor-pointer hover:border-primary/40 transition-colors"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <CalendarPlus className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm sm:text-base">Sync to Calendar</h3>
              <p className="text-xs text-muted-foreground">Never miss an event</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 pointer-events-none text-xs sm:text-sm">
              Google Calendar
            </Button>
            <Button variant="outline" size="sm" className="flex-1 pointer-events-none text-xs sm:text-sm">
              Apple Calendar
            </Button>
          </div>
        </div>

        {/* Calendar Sync Modal */}
        <CalendarSyncModal
          isOpen={isCalendarModalOpen}
          onClose={() => setIsCalendarModalOpen(false)}
          events={events}
        />
      </div>
    </div>
  );
};

export default Events;
