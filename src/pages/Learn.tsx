import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UnlockModal } from '@/components/shared/UnlockModal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Clock, Lock, Sparkles, Users } from 'lucide-react';

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  category: string;
  isPremium: boolean;
}

const mockVideos: Video[] = [
  {
    id: '1',
    title: 'Finding Your Creative Voice',
    description: 'Learn how to develop a unique perspective that sets your work apart',
    thumbnail: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&auto=format',
    duration: '28 min',
    category: 'Community Sessions',
    isPremium: false,
  },
  {
    id: '2',
    title: 'The Art of Storytelling',
    description: 'Master narrative techniques used by industry professionals',
    thumbnail: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&auto=format',
    duration: '42 min',
    category: 'Community Sessions',
    isPremium: false,
  },
  {
    id: '3',
    title: 'Building Your First Project',
    description: 'A step-by-step guide to bringing your creative vision to life',
    thumbnail: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&auto=format',
    duration: '1h 15min',
    category: 'BFP',
    isPremium: true,
  },
  {
    id: '4',
    title: 'Advanced Editing Techniques',
    description: 'Professional editing workflows and creative effects',
    thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format',
    duration: '55 min',
    category: 'BFP',
    isPremium: true,
  },
  {
    id: '5',
    title: 'Mentorship Session: Industry Insights',
    description: 'Exclusive Q&A with top industry professionals',
    thumbnail: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format',
    duration: '1h 30min',
    category: 'Premium',
    isPremium: true,
  },
  {
    id: '6',
    title: 'Monetizing Your Craft',
    description: 'Turn your passion into a sustainable career',
    thumbnail: 'https://images.unsplash.com/photo-1553484771-371a605b060b?w=800&auto=format',
    duration: '48 min',
    category: 'Premium',
    isPremium: true,
  },
];

const Learn: React.FC = () => {
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const { isFullAccess } = useAuth();

  const handlePlayVideo = (video: Video) => {
    if (video.isPremium && !isFullAccess) {
      setSelectedVideo(video);
      setShowUnlockModal(true);
      return;
    }
    // Play video logic here
    console.log('Playing video:', video.title);
  };

  const categories = ['All', 'Community Sessions', 'BFP', 'Premium'];

  const VideoCard: React.FC<{ video: Video }> = ({ video }) => (
    <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-card transition-all hover:border-primary/30 hover:shadow-glow">
      <div className="relative aspect-video overflow-hidden">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        
        {video.isPremium && !isFullAccess && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-primary/90 text-primary-foreground text-xs font-medium flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Premium
          </div>
        )}

        <button
          onClick={() => handlePlayVideo(video)}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${
            video.isPremium && !isFullAccess
              ? 'bg-muted/90'
              : 'gradient-primary shadow-glow'
          }`}>
            {video.isPremium && !isFullAccess ? (
              <Lock className="h-6 w-6 text-muted-foreground" />
            ) : (
              <Play className="h-6 w-6 text-primary-foreground ml-1" />
            )}
          </div>
        </button>

        <div className="absolute bottom-3 left-3 flex items-center gap-2 text-foreground text-sm">
          <Clock className="h-4 w-4" />
          {video.duration}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-primary">{video.category}</span>
        </div>
        <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
          {video.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {video.description}
        </p>
      </div>
    </div>
  );

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Learn</h1>
        <p className="text-muted-foreground">Access exclusive content and grow your craft</p>
      </div>

      <Tabs defaultValue="All" className="space-y-6">
        <TabsList className="w-full bg-secondary/50 flex-wrap h-auto p-1">
          {categories.map((category) => (
            <TabsTrigger
              key={category}
              value={category}
              className="flex-1 min-w-[80px]"
            >
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category} className="mt-0">
            <div className="grid gap-4 md:grid-cols-2">
              {mockVideos
                .filter((v) => category === 'All' || v.category === category)
                .map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Upcoming Session Banner */}
      <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-card to-secondary border border-border/50">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <span className="text-xs font-medium text-primary mb-1 block">Live Session</span>
            <h3 className="font-semibold text-foreground mb-1">Weekly Community Call</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Join fellow creators every Friday at 6 PM IST for discussions, Q&A, and networking.
            </p>
            <Button variant="outline" size="sm">
              Add to Calendar
            </Button>
          </div>
        </div>
      </div>

      <UnlockModal
        open={showUnlockModal}
        onOpenChange={setShowUnlockModal}
        title="Unlock Premium Content"
        description="This content is available to fully onboarded members. Complete your balance payment to access all exclusive videos, sessions, and mentorship content."
      />
    </div>
  );
};

export default Learn;
