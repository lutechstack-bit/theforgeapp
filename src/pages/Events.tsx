import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Video, Clock, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  imageUrl: string;
  isVirtual: boolean;
}

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Pre-Forge Mixer',
    description: 'Meet your cohort in an informal setting before the big event. Network, share ideas, and build connections.',
    date: new Date('2025-01-28T18:00:00'),
    location: 'Mumbai',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format',
    isVirtual: false,
  },
  {
    id: '2',
    title: 'Weekly Community Call',
    description: 'Join our regular community session for updates, Q&A, and creator spotlights.',
    date: new Date('2025-01-10T18:00:00'),
    location: 'Online',
    imageUrl: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&auto=format',
    isVirtual: true,
  },
  {
    id: '3',
    title: 'Forge Day 1: Orientation',
    description: 'The beginning of your intensive Forge experience. Get ready for an unforgettable journey.',
    date: new Date('2025-02-15T09:00:00'),
    location: 'Mumbai',
    imageUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format',
    isVirtual: false,
  },
  {
    id: '4',
    title: 'Alumni Masterclass',
    description: 'Learn from creators who have been through Forge and are now making waves in the industry.',
    date: new Date('2025-01-20T19:00:00'),
    location: 'Online',
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format',
    isVirtual: true,
  },
];

const Events: React.FC = () => {
  const upcomingEvents = mockEvents.sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Events</h1>
        <p className="text-muted-foreground">Upcoming sessions and gatherings</p>
      </div>

      <div className="space-y-4">
        {upcomingEvents.map((event, index) => (
          <div
            key={event.id}
            className="group relative overflow-hidden rounded-xl border border-border/50 bg-card transition-all hover:border-primary/30 hover:shadow-glow animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex flex-col md:flex-row">
              {/* Image */}
              <div className="relative w-full md:w-48 h-40 md:h-auto overflow-hidden shrink-0">
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/50 hidden md:block" />
                <div className="absolute top-3 left-3">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                    event.isVirtual 
                      ? 'bg-secondary/90 text-foreground'
                      : 'bg-primary/90 text-primary-foreground'
                  }`}>
                    {event.isVirtual ? (
                      <>
                        <Video className="h-3 w-3" />
                        Virtual
                      </>
                    ) : (
                      <>
                        <MapPin className="h-3 w-3" />
                        In-Person
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-4 md:p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Date Badge */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex flex-col items-center px-3 py-2 rounded-lg bg-primary/10 min-w-[50px]">
                        <span className="text-xs font-medium text-primary uppercase">
                          {format(event.date, 'MMM')}
                        </span>
                        <span className="text-xl font-bold text-foreground">
                          {format(event.date, 'd')}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {event.title}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {format(event.date, 'h:mm a')}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {event.location}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {event.description}
                    </p>

                    <Button variant="outline" size="sm" className="group/btn">
                      View Details
                      <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Calendar CTA */}
      <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-card to-secondary border border-border/50 text-center">
        <div className="mx-auto w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
          <Calendar className="h-7 w-7 text-primary" />
        </div>
        <h3 className="font-semibold text-foreground mb-2">Never Miss an Event</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
          Sync your calendar with LevelUp events to stay on top of all upcoming sessions and gatherings.
        </p>
        <Button variant="premium" size="sm">
          Sync Calendar
        </Button>
      </div>
    </div>
  );
};

export default Events;
