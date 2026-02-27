import React, { useState } from 'react';
import { Video, Copy, Check, ExternalLink, Eye, EyeOff, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { generateGoogleCalendarUrl, openICSFile } from '@/lib/calendarUtils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SessionMeetingCardProps {
  meetingUrl: string;
  meetingId?: string | null;
  meetingPasscode?: string | null;
  sessionTitle: string;
  sessionDate?: Date | null;
  sessionStartTime?: string | null;
  sessionDurationHours?: number | null;
  isLive?: boolean;
  compact?: boolean;
}

const SessionMeetingCard: React.FC<SessionMeetingCardProps> = ({
  meetingUrl,
  meetingId,
  meetingPasscode,
  sessionTitle,
  sessionDate,
  sessionStartTime,
  sessionDurationHours,
  isLive = false,
  compact = false,
}) => {
  const [showPasscode, setShowPasscode] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPasscode, setCopiedPasscode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopy = async (text: string, type: 'id' | 'passcode' | 'link') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'id') {
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
      } else if (type === 'passcode') {
        setCopiedPasscode(true);
        setTimeout(() => setCopiedPasscode(false), 2000);
      } else {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
      toast.success(`${type === 'id' ? 'Meeting ID' : type === 'passcode' ? 'Passcode' : 'Link'} copied!`);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const handleJoinMeeting = () => {
    window.open(meetingUrl, '_blank', 'noopener,noreferrer');
  };

  // Build calendar event from session data
  const getCalendarEvent = () => {
    let startDate = sessionDate ? new Date(sessionDate) : new Date();
    
    // If we have a specific start time, apply it
    if (sessionStartTime) {
      const [hours, minutes] = sessionStartTime.split(':').map(Number);
      startDate.setHours(hours, minutes, 0, 0);
    }

    const durationMs = (sessionDurationHours || 2) * 60 * 60 * 1000;
    const endDate = new Date(startDate.getTime() + durationMs);

    return {
      title: sessionTitle,
      description: `Join Zoom Meeting: ${meetingUrl}${meetingId ? `\n\nMeeting ID: ${meetingId}` : ''}${meetingPasscode ? `\nPasscode: ${meetingPasscode}` : ''}`,
      location: meetingUrl,
      startDate,
      endDate,
      isVirtual: true,
    };
  };

  const handleGoogleCalendar = () => {
    const event = getCalendarEvent();
    const url = generateGoogleCalendarUrl(event);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleAppleCalendar = () => {
    const event = getCalendarEvent();
    openICSFile(event);
  };

  // Detect platform from URL
  const getPlatformInfo = () => {
    if (meetingUrl.includes('zoom')) {
      return { name: 'Zoom', color: 'bg-blue-500' };
    }
    if (meetingUrl.includes('meet.google')) {
      return { name: 'Google Meet', color: 'bg-green-500' };
    }
    if (meetingUrl.includes('teams')) {
      return { name: 'Teams', color: 'bg-purple-500' };
    }
    return { name: 'Meeting', color: 'bg-primary' };
  };

  const platform = getPlatformInfo();

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Button
          onClick={handleJoinMeeting}
          size="sm"
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
        >
          <Video className="w-4 h-4" />
          Join Now
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              <Calendar className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleGoogleCalendar}>
              📅 Google Calendar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleAppleCalendar}>
              🍎 Apple Calendar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg ${platform.color} flex items-center justify-center`}>
            <Video className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-foreground">{platform.name}</span>
        </div>
        {isLive && (
          <Badge className="bg-red-500 text-white animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5 animate-pulse" />
            LIVE
          </Badge>
        )}
      </div>

      {/* Join Button */}
      <Button
        onClick={handleJoinMeeting}
        className="w-full gap-2 mb-4 bg-blue-600 hover:bg-blue-700 text-white shadow-lg h-12 text-base font-semibold"
      >
        <Video className="w-5 h-5" />
        Join {platform.name} Meeting
        <ExternalLink className="w-4 h-4 ml-1" />
      </Button>

      {/* Meeting Details */}
      <div className="space-y-3 mb-4">
        {/* Meeting ID */}
        {meetingId && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50">
            <div>
              <p className="text-xs text-muted-foreground">Meeting ID</p>
              <p className="text-sm font-mono text-foreground">{meetingId}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleCopy(meetingId, 'id')}
            >
              {copiedId ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        )}

        {/* Passcode */}
        {meetingPasscode && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Passcode</p>
              <p className="text-sm font-mono text-foreground">
                {showPasscode ? meetingPasscode : '••••••'}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setShowPasscode(!showPasscode)}
              >
                {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleCopy(meetingPasscode, 'passcode')}
              >
                {copiedPasscode ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        )}

        {/* Copy Link */}
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => handleCopy(meetingUrl, 'link')}
        >
          {copiedLink ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          {copiedLink ? 'Link Copied!' : 'Copy Meeting Link'}
        </Button>
      </div>

      {/* Calendar Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="secondary"
          className="gap-2 text-sm"
          onClick={handleGoogleCalendar}
        >
          📅 Google
        </Button>
        <Button
          variant="secondary"
          className="gap-2 text-sm"
          onClick={handleAppleCalendar}
        >
          🍎 Apple
        </Button>
      </div>
    </div>
  );
};

export default SessionMeetingCard;
