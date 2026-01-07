import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Member {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  city: string | null;
  specialty: string | null;
}

interface MemberModalProps {
  member: Member | null;
  isOnline: boolean;
  onClose: () => void;
}

export const MemberModal: React.FC<MemberModalProps> = ({
  member,
  isOnline,
  onClose,
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!member) return null;

  return (
    <Sheet open={!!member} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl h-auto max-h-[70vh]">
        <SheetHeader className="text-center pb-4">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-background shadow-xl">
                <AvatarImage src={member.avatar_url || undefined} alt={member.full_name || ''} />
                <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">
                  {getInitials(member.full_name || 'U')}
                </AvatarFallback>
              </Avatar>
              <span
                className={cn(
                  "absolute bottom-1 right-1 w-6 h-6 rounded-full border-4 border-background",
                  isOnline ? "bg-green-500" : "bg-muted"
                )}
              />
            </div>
            <div>
              <SheetTitle className="text-xl">{member.full_name || 'Member'}</SheetTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {isOnline ? 'Online now' : 'Offline'}
              </p>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-4 pb-8">
          {member.city && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50">
              <MapPin className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="font-medium">{member.city}</p>
              </div>
            </div>
          )}

          {member.specialty && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50">
              <Briefcase className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Specialty</p>
                <p className="font-medium">{member.specialty}</p>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
