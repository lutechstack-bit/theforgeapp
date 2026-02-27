import { format } from 'date-fns';

export interface CalendarEvent {
  title: string;
  description?: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  isVirtual?: boolean;
}

// Format date for Google Calendar URL (YYYYMMDDTHHmmssZ)
const formatGoogleDate = (date: Date): string => {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

// Generate Google Calendar add event URL
export const generateGoogleCalendarUrl = (event: CalendarEvent): string => {
  const endDate = event.endDate || new Date(event.startDate.getTime() + 60 * 60 * 1000);
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatGoogleDate(event.startDate)}/${formatGoogleDate(endDate)}`,
    details: event.description || '',
    location: event.isVirtual ? 'Online / Virtual' : (event.location || ''),
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

// Generate Outlook Web Calendar URL
export const generateOutlookCalendarUrl = (event: CalendarEvent): string => {
  const endDate = event.endDate || new Date(event.startDate.getTime() + 60 * 60 * 1000);
  const location = event.isVirtual ? 'Online / Virtual' : (event.location || '');

  const params = new URLSearchParams({
    rru: 'addevent',
    subject: event.title,
    startdt: event.startDate.toISOString(),
    enddt: endDate.toISOString(),
    body: event.description || '',
    location,
    path: '/calendar/action/compose',
  });

  return `https://outlook.live.com/calendar/0/action/compose?${params.toString()}`;
};

// Generate Yahoo Calendar URL
export const generateYahooCalendarUrl = (event: CalendarEvent): string => {
  const endDate = event.endDate || new Date(event.startDate.getTime() + 60 * 60 * 1000);
  const location = event.isVirtual ? 'Online / Virtual' : (event.location || '');

  // Yahoo uses YYYYMMDDTHHmmssZ format
  const st = formatGoogleDate(event.startDate);
  const et = formatGoogleDate(endDate);

  const params = new URLSearchParams({
    v: '60',
    title: event.title,
    st,
    et,
    desc: event.description || '',
    in_loc: location,
  });

  return `https://calendar.yahoo.com/?${params.toString()}`;
};

// Generate Apple Calendar webcal:// URL via edge function
export const generateAppleCalendarUrl = (event: CalendarEvent): string => {
  const endDate = event.endDate || new Date(event.startDate.getTime() + 60 * 60 * 1000);
  const location = event.isVirtual ? 'Online / Virtual' : (event.location || '');

  const startFormatted = formatGoogleDate(event.startDate);
  const endFormatted = formatGoogleDate(endDate);

  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'tprvyhzpecopryylxznm';
  const baseUrl = `${projectId}.supabase.co/functions/v1/calendar-event`;

  const params = new URLSearchParams({
    title: event.title,
    description: event.description || '',
    start: startFormatted,
    end: endFormatted,
    location,
  });

  return `webcal://${baseUrl}?${params.toString()}`;
};

// Generate ICS file content for Apple Calendar / other calendar apps
export const generateICSContent = (event: CalendarEvent): string => {
  const endDate = event.endDate || new Date(event.startDate.getTime() + 60 * 60 * 1000);
  
  const formatICSDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const escapeText = (text: string): string => {
    return text.replace(/[,;\\]/g, '\\$&').replace(/\n/g, '\\n');
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//LevelUp//Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `DTSTART:${formatICSDate(event.startDate)}`,
    `DTEND:${formatICSDate(endDate)}`,
    `SUMMARY:${escapeText(event.title)}`,
    event.description ? `DESCRIPTION:${escapeText(event.description)}` : '',
    `LOCATION:${escapeText(event.isVirtual ? 'Online / Virtual' : (event.location || ''))}`,
    `UID:${Date.now()}@levelup.events`,
    `DTSTAMP:${formatICSDate(new Date())}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean).join('\r\n');

  return icsContent;
};

// Download ICS file for Apple Calendar
export const downloadICSFile = (event: CalendarEvent): void => {
  const icsContent = generateICSContent(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Open ICS file directly in native calendar app (no download)
export const openICSFile = (event: CalendarEvent): void => {
  const icsContent = generateICSContent(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 5000);
};

// Generate ICS content for multiple events (for subscription feed)
export const generateICSFeed = (events: CalendarEvent[]): string => {
  const formatICSDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const escapeText = (text: string): string => {
    return text.replace(/[,;\\]/g, '\\$&').replace(/\n/g, '\\n');
  };

  const eventBlocks = events.map((event, index) => {
    const endDate = event.endDate || new Date(event.startDate.getTime() + 60 * 60 * 1000);
    return [
      'BEGIN:VEVENT',
      `DTSTART:${formatICSDate(event.startDate)}`,
      `DTEND:${formatICSDate(endDate)}`,
      `SUMMARY:${escapeText(event.title)}`,
      event.description ? `DESCRIPTION:${escapeText(event.description)}` : '',
      `LOCATION:${escapeText(event.isVirtual ? 'Online / Virtual' : (event.location || ''))}`,
      `UID:event-${index}-${Date.now()}@levelup.events`,
      `DTSTAMP:${formatICSDate(new Date())}`,
      'END:VEVENT',
    ].filter(Boolean).join('\r\n');
  });

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//LevelUp//Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:LevelUp Events',
    ...eventBlocks,
    'END:VCALENDAR',
  ].join('\r\n');
};

// Download all events as ICS
export const downloadAllEventsICS = (events: CalendarEvent[]): void => {
  const icsContent = generateICSFeed(events);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = 'levelup-events.ics';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
