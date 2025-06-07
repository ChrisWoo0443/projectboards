import React, { useState } from 'react';
import { Label } from './label';
import { Button } from './button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface CalendarProps {
  mode?: "single";
  selected?: Date | undefined;
  onSelect?: (date: Date | null) => void;
  className?: string;
  initialFocus?: boolean;
  withTime?: boolean;
}

function Calendar({
  selected,
  onSelect,
  className,
  withTime = false,
  ...props
}: CalendarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value) {
      // Parse date in local timezone to avoid off-by-one issues
      let date: Date;
      
      // Check if it's in YYYY-MM-DD format (from date input)
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [year, month, day] = value.split('-').map(Number);
        date = new Date(year, month - 1, day); // month is 0-indexed
      } else {
        // For other formats, try parsing normally but adjust for timezone
        date = new Date(value);
        // If the date seems to be off by timezone, adjust it
        if (!isNaN(date.getTime())) {
          const timezoneOffset = date.getTimezoneOffset();
          date = new Date(date.getTime() + (timezoneOffset * 60000));
        }
      }
      
      if (!isNaN(date.getTime())) {
        // If we have an existing selected date with time, preserve the time
        if (selected && withTime) {
          const newDate = new Date(date);
          newDate.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
          if (onSelect) {
            onSelect(newDate);
          }
        } else {
          if (onSelect) {
            onSelect(date);
          }
        }
      }
    } else {
      if (onSelect) {
        onSelect(null);
      }
    }
  };

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const timeValue = event.target.value;
    if (selected && timeValue) {
      const [hours, minutes] = timeValue.split(':').map(Number);
      const newDate = new Date(selected);
      newDate.setHours(hours, minutes, 0, 0);
      if (onSelect) {
        onSelect(newDate);
      }
    }
  };

  const formatDateForInput = (date: Date | undefined) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return '';
    }
    // Use local date formatting to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatTimeForInput = (date: Date | undefined) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return '';
    }
    return format(date, 'HH:mm');
  };

  return (
    <div className={className}>
      <div className="space-y-3">
        <div>
          <Label htmlFor="date-input" className="text-sm font-medium">
            {withTime ? 'Pick date and time' : 'Pick a date'}
          </Label>
          <div className="mt-1">
            <input
              id="date-input"
              type="date"
              value={formatDateForInput(selected)}
              onChange={handleDateChange}
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 hover:border-gray-300 text-sm font-medium"
            />
          </div>
        </div>
        
        {withTime && (
          <div>
            <Label htmlFor="time-input" className="text-sm font-medium">
              Time
            </Label>
            <div className="mt-1">
              <input
                id="time-input"
                type="time"
                value={formatTimeForInput(selected)}
                onChange={handleTimeChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-sm"
              />
            </div>
          </div>
        )}
        
        {selected && (
          <div className="text-sm text-gray-600">
            Selected: {withTime ? format(selected, 'PPP p') : format(selected, 'PPP')}
          </div>
        )}
        
        {selected && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onSelect && onSelect(null)}
            className="text-sm"
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}

Calendar.displayName = "Calendar";

export { Calendar };