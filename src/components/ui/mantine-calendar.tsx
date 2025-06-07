import React, { useState } from 'react';
import { Label } from './label';
import { Button } from './button';
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
        // Always set time to midnight (00:00:00)
        date.setHours(0, 0, 0, 0);
        if (onSelect) {
          onSelect(date);
        }
      }
    } else {
      if (onSelect) {
        onSelect(null);
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

  return (
    <div className={className}>
      <div className="space-y-3">
        <div>
          <Label htmlFor="date-input" className="text-sm font-medium">
            Pick a date
          </Label>
          <div className="mt-1">
            <input
              id="date-input"
              type="date"
              value={formatDateForInput(selected)}
              onChange={handleDateChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>
        
        {selected && (
          <div className="p-3 rounded-md bg-muted border border-border">
            <div className="text-sm font-medium text-foreground">
              Selected: {format(selected, 'PPP')}
            </div>
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