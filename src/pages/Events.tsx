import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PremiumEventCard } from '@/components/shared/PremiumEventCard';
import { CityCard } from '@/components/shared/CityCard';
import { Search, Calendar, Video, MapPin, CheckCircle, History, ArrowRight } from 'lucide-react';

// City images for the filter carousel
const cities = [
  { name: 'Bengaluru', imageUrl: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=400&auto=format' },
  { name: 'Mumbai', imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&auto=format' },
  { name: 'New Delhi', imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&auto=format' },
  { name: 'Chennai', imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400&auto=format' },
  { name: 'Hyderabad', imageUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&auto=format' },
  { name: 'Pune', imageUrl: 'https://images.unsplash.com/photo-1609947017136-9daf32a25e91?w=400&auto=format' },
];

type FilterType = 'all' | 'virtual' | 'in-person' | 'registered' | 'past';

const filterTabs: { id: FilterType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'all', label: 'All events', icon: Calendar },
  { id: 'virtual', label: 'Virtual', icon: Video },
  { id: 'in-person', label: 'In person', icon: MapPin },
  { id: 'registered', label: 'Registered', icon: CheckCircle },
  { id: 'past', label: 'Past events', icon: History },
];

const Events: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // Fetch events from database
  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  // Filter events based on search, city, and active filter
  const filteredEvents = events?.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCity = !selectedCity || event.location?.toLowerCase().includes(selectedCity.toLowerCase());
    
    const now = new Date();
    const eventDate = new Date(event.event_date);
    
    let matchesFilter = true;
    switch (activeFilter) {
      case 'virtual':
        matchesFilter = event.is_virtual;
        break;
      case 'in-person':
        matchesFilter = !event.is_virtual;
        break;
      case 'past':
        matchesFilter = eventDate < now;
        break;
      case 'all':
      default:
        matchesFilter = eventDate >= now;
        break;
    }
    
    return matchesSearch && matchesCity && matchesFilter;
  }) || [];

  const upcomingEvents = filteredEvents.filter(e => new Date(e.event_date) >= new Date());

  return (
    <div className="min-h-screen">
      <div className="container py-8 space-y-8">
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 rounded-xl bg-card border-border/50 text-base"
            />
          </div>
        </div>

        {/* Cities Carousel */}
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Cities
          </h3>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
            {cities.map((city) => (
              <CityCard
                key={city.name}
                name={city.name}
                imageUrl={city.imageUrl}
                isSelected={selectedCity === city.name}
                onClick={() => setSelectedCity(selectedCity === city.name ? null : city.name)}
              />
            ))}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {filterTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeFilter === tab.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter(tab.id)}
                className="flex items-center gap-2 rounded-full whitespace-nowrap"
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </Button>
            );
          })}
        </div>

        {/* Events Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              {activeFilter === 'past' ? 'Past events' : 'Upcoming events'}
            </h2>
            {events && events.length > 6 && (
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                View all events
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[4/5] rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No events found</h3>
              <p className="text-muted-foreground">
                {searchQuery || selectedCity
                  ? 'Try adjusting your search or filters'
                  : 'Check back soon for upcoming events'}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event, index) => (
                <PremiumEventCard
                  key={event.id}
                  id={event.id}
                  title={event.title}
                  imageUrl={event.image_url || undefined}
                  date={new Date(event.event_date)}
                  location={event.location || 'TBA'}
                  isVirtual={event.is_virtual}
                  hostName="LevelUp"
                  isFillingFast={index < 2 && upcomingEvents.includes(event)}
                  onClick={() => console.log('View event:', event.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Calendar CTA */}
        <div className="mt-8 p-8 rounded-2xl bg-gradient-to-br from-card to-secondary border border-border/50 text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
            <Calendar className="h-8 w-8 text-primary" />
          </div>
          <h3 className="font-bold text-foreground text-xl mb-2">Never Miss an Event</h3>
          <p className="text-muted-foreground mb-5 max-w-md mx-auto">
            Sync your calendar with LevelUp events to stay on top of all upcoming sessions and gatherings.
          </p>
          <Button variant="default" size="lg" className="rounded-full">
            Sync Calendar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Events;
