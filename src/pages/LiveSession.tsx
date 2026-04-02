import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format, isPast, isFuture, differenceInSeconds } from 'date-fns';
import { Video, Clock, User, Calendar, ArrowLeft, ExternalLink, Play, Radio, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingScreen } from '@/components/shared/LoadingScreen';
import { useIsMobile } from '@/hooks/use-mobile';

const LiveSession: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const zoomContainerRef = useRef<HTMLDivElement>(null);
  const [zoomClient, setZoomClient] = useState<any>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [zoomError, setZoomError] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());

  // Tick every second for countdown
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const { data: session, isLoading, error } = useQuery({
    queryKey: ['live-session', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('live_sessions')
        .select('*')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const getSessionState = useCallback(() => {
    if (!session) return 'loading';
    if (session.status === 'cancelled') return 'cancelled';
    if (session.status === 'ended' || isPast(new Date(session.end_at))) {
      if (session.recording_status === 'ready' && session.learn_content_id) return 'recording_ready';
      if (session.recording_status === 'processing') return 'recording_processing';
      return 'ended';
    }
    const startAt = new Date(session.start_at);
    const endAt = new Date(session.end_at);
    if (now >= startAt && now <= endAt) return 'live';
    // Allow joining 5 minutes early
    const earlyJoinWindow = new Date(startAt.getTime() - 5 * 60 * 1000);
    if (now >= earlyJoinWindow && now < startAt) return 'live';
    return 'upcoming';
  }, [session, now]);

  const sessionState = getSessionState();

  const handleJoinZoom = async () => {
    if (!session || !user) return;

    const cleanMeetingNumber = session.zoom_meeting_number.replace(/\D/g, '');

    if (isMobile) {
      const zoomUrl = `https://zoom.us/j/${cleanMeetingNumber}${session.zoom_passcode ? `?pwd=${session.zoom_passcode}` : ''}`;
      window.open(zoomUrl, '_blank');
      return;
    }

    setIsJoining(true);
    setZoomError(null);

    try {
      // Get signature from edge function
      const { data: sigData, error: sigError } = await supabase.functions.invoke('zoom-signature', {
        body: { meetingNumber: cleanMeetingNumber, role: 0 },
      });

      if (sigError || !sigData?.signature) {
        throw new Error(sigError?.message || 'Failed to get Zoom signature');
      }

      console.log('[Zoom] Signature obtained, sdkKey:', sigData.sdkKey?.substring(0, 8) + '...');

      // Dynamic import of Zoom SDK
      const ZoomMtgEmbedded = (await import('@zoom/meetingsdk/embedded')).default;
      const client = ZoomMtgEmbedded.createClient();

      const container = zoomContainerRef.current || document.getElementById('zoom-meeting-container');
      if (!container) throw new Error('Zoom container not found');

      await client.init({
        zoomAppRoot: container,
        language: 'en-US',
        patchJsMedia: true,
        leaveOnPageUnload: true,
      });

      // Listen for connection state changes to surface real error codes
      client.on('connection-change', (payload: any) => {
        console.log('[Zoom] connection-change:', payload);
        if (payload.state === 'Fail') {
          const code = payload.errorCode || payload.code || 'unknown';
          const reason = payload.reason || 'Unknown error';
          console.error('[Zoom] Join failed:', { code, reason, payload });
          setZoomError(`Zoom error ${code}: ${reason}`);
          setZoomClient(null);
        }
      });

      console.log('[Zoom] Joining meeting:', cleanMeetingNumber);

      await client.join({
        sdkKey: sigData.sdkKey,
        signature: sigData.signature,
        meetingNumber: cleanMeetingNumber,
        password: session.zoom_passcode || '',
        userName: user.user_metadata?.full_name || user.email || 'Forge Student',
      });

      setZoomClient(client);
    } catch (err: any) {
      console.error('[Zoom] Join error:', err);
      const msg = err.message || 'Failed to join meeting';
      // Surface Zoom-specific error codes if available
      const code = err.errorCode || err.code || '';
      setZoomError(code ? `Zoom error ${code}: ${msg}` : msg);
    } finally {
      setIsJoining(false);
    }
  };

  const handleRetryZoom = () => {
    if (zoomClient) {
      try { zoomClient.leaveMeeting(); } catch {}
    }
    setZoomClient(null);
    setZoomError(null);
    handleJoinZoom();
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (zoomClient) {
        try { zoomClient.leaveMeeting(); } catch {}
      }
    };
  }, [zoomClient]);

  if (isLoading) return <LoadingScreen />;

  if (error || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <Video className="w-12 h-12 text-muted-foreground mx-auto" />
            <h2 className="text-xl font-semibold">Session not found</h2>
            <p className="text-muted-foreground text-sm">This session may not exist or you don't have access.</p>
            <Button onClick={() => navigate('/')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const startAt = new Date(session.start_at);
  const endAt = new Date(session.end_at);
  const secondsUntilStart = differenceInSeconds(startAt, now);

  const formatCountdown = (totalSeconds: number) => {
    if (totalSeconds <= 0) return null;
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    return `${minutes}m ${secs}s`;
  };

  const statusConfig: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
    upcoming: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'Upcoming', icon: <Clock className="w-3 h-3" /> },
    live: { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Live Now', icon: <Radio className="w-3 h-3 animate-pulse" /> },
    ended: { color: 'bg-muted text-muted-foreground border-border', label: 'Ended', icon: <CheckCircle2 className="w-3 h-3" /> },
    cancelled: { color: 'bg-muted text-muted-foreground border-border', label: 'Cancelled', icon: null },
    recording_processing: { color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', label: 'Recording Processing', icon: <Loader2 className="w-3 h-3 animate-spin" /> },
    recording_ready: { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', label: 'Recording Available', icon: <Play className="w-3 h-3" /> },
  };

  const status = statusConfig[sessionState] || statusConfig.upcoming;

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="page-container max-w-4xl mx-auto space-y-6">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors pt-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Session Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="outline" className={`${status.color} gap-1.5`}>
              {status.icon} {status.label}
            </Badge>
            {session.cohort_type && (
              <Badge variant="secondary" className="text-xs">{session.cohort_type}</Badge>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{session.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {session.mentor_name && (
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" /> {session.mentor_name}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" /> {format(startAt, 'MMM d, yyyy')}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> {format(startAt, 'h:mm a')} – {format(endAt, 'h:mm a')}
            </span>
          </div>

          {session.description && (
            <p className="text-muted-foreground leading-relaxed">{session.description}</p>
          )}
        </div>

        {/* State-based Content */}
        {sessionState === 'upcoming' && (
          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto">
                <Clock className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">Session starts in</p>
                <p className="text-3xl font-bold text-blue-400 font-mono mt-2">
                  {formatCountdown(secondsUntilStart) || 'Starting soon...'}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                You'll be able to join 5 minutes before the session starts.
              </p>
            </CardContent>
          </Card>
        )}

        {sessionState === 'live' && !zoomClient && (
          <Card className="border-red-500/20 bg-red-500/5">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
                <Radio className="w-8 h-8 text-red-400 animate-pulse" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">Session is Live!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {isMobile ? 'Join via the Zoom app' : 'Join the session right here in the app'}
                </p>
              </div>
              {zoomError && (
                <div className="space-y-2">
                  <p className="text-sm text-destructive">{zoomError}</p>
                  <Button size="sm" variant="outline" onClick={handleRetryZoom}>
                    Retry
                  </Button>
                </div>
              )}
              <Button
                size="lg"
                onClick={handleJoinZoom}
                disabled={isJoining}
                className="gap-2"
              >
                {isJoining ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isMobile ? (
                  <ExternalLink className="w-4 h-4" />
                ) : (
                  <Video className="w-4 h-4" />
                )}
                {isJoining ? 'Connecting...' : isMobile ? 'Open in Zoom' : 'Join Session'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Zoom Embed Container — always mounted so ref is stable */}
        <div
          ref={zoomContainerRef}
          id="zoom-meeting-container"
          className={`w-full ${zoomClient ? 'min-h-[500px] rounded-xl overflow-hidden border border-border' : ''}`}
        />

        {sessionState === 'ended' && (
          <Card>
            <CardContent className="pt-6 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto" />
              <p className="text-lg font-semibold">This session has ended</p>
              <p className="text-sm text-muted-foreground">Recording will be available soon if applicable.</p>
            </CardContent>
          </Card>
        )}

        {sessionState === 'recording_processing' && (
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardContent className="pt-6 text-center space-y-3">
              <Loader2 className="w-12 h-12 text-amber-400 animate-spin mx-auto" />
              <p className="text-lg font-semibold">Recording is being processed</p>
              <p className="text-sm text-muted-foreground">Check back soon — it'll appear in Learn when ready.</p>
            </CardContent>
          </Card>
        )}

        {sessionState === 'recording_ready' && session.learn_content_id && (
          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardContent className="pt-6 text-center space-y-4">
              <Play className="w-12 h-12 text-emerald-400 mx-auto" />
              <p className="text-lg font-semibold">Recording is available!</p>
              <Button onClick={() => navigate(`/learn/${session.learn_content_id}`)} className="gap-2">
                <Play className="w-4 h-4" /> Watch Recording
              </Button>
            </CardContent>
          </Card>
        )}

        {sessionState === 'cancelled' && (
          <Card>
            <CardContent className="pt-6 text-center space-y-3">
              <Video className="w-12 h-12 text-muted-foreground mx-auto" />
              <p className="text-lg font-semibold">This session has been cancelled</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LiveSession;
