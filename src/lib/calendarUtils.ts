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
