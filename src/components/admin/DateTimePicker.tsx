import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DateTimePickerProps {
  value: string; // ISO string
  onChange: (isoString: string) => void;
  className?: string;
}

// Generate time slots from 6:00 AM to 11:45 PM in 15-minute intervals
const generateTimeSlots = () => {
  const slots: { value: string; label: string }[] = [];
  for (let hour = 6; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const h = String(hour).padStart(2, "0");
      const m = String(minute).padStart(2, "0");
      const value = `${h}:${m}`;
      
      // Format for display (12-hour with AM/PM)
      const hour12 = hour % 12 || 12;
      const ampm = hour < 12 ? "AM" : "PM";
      const label = `${hour12}:${m} ${ampm}`;
      
      slots.push({ value, label });
    }
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

const parseIsoToDateAndTime = (
  iso: string
): { date: Date | undefined; time: string } => {
  if (!iso) return { date: undefined, time: "10:00" };
  const d = new Date(iso);
  if (isNaN(d.getTime())) return { date: undefined, time: "10:00" };
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(Math.floor(d.getMinutes() / 15) * 15).padStart(2, "0"); // Round to nearest 15
  return { date: d, time: `${hours}:${minutes}` };
};

const combineDateAndTimeToIso = (
  date: Date | undefined,
  time: string
): string => {
  if (!date) return "";
  const [hours, minutes] = time.split(":").map(Number);
  const combined = new Date(date);
  combined.setHours(hours, minutes, 0, 0);
  return combined.toISOString();
};

export function DateTimePicker({
  value,
  onChange,
  className,
}: DateTimePickerProps) {
  const { date: initialDate, time: initialTime } = parseIsoToDateAndTime(value);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    initialDate
  );
  const [selectedTime, setSelectedTime] = React.useState<string>(initialTime);
  const [calendarOpen, setCalendarOpen] = React.useState(false);

  // Sync internal state when value prop changes
  React.useEffect(() => {
    const { date, time } = parseIsoToDateAndTime(value);
    setSelectedDate(date);
    setSelectedTime(time);
  }, [value]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setCalendarOpen(false);
    const iso = combineDateAndTimeToIso(date, selectedTime);
    onChange(iso);
  };

  const handleTimeChange = (time: string) => {
    setSelectedTime(time);
    const iso = combineDateAndTimeToIso(selectedDate, time);
    onChange(iso);
  };

  return (
    <div className={cn("flex gap-2", className)}>
      {/* Date Picker */}
      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "flex-1 justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? format(selectedDate, "PPP") : <span>Pick date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            initialFocus
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>

      {/* Time Picker */}
      <Select value={selectedTime} onValueChange={handleTimeChange}>
        <SelectTrigger className="w-[130px]">
          <Clock className="mr-2 h-4 w-4" />
          <SelectValue placeholder="Time" />
        </SelectTrigger>
        <SelectContent className="max-h-[200px]">
          {TIME_SLOTS.map((slot) => (
            <SelectItem key={slot.value} value={slot.value}>
              {slot.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
