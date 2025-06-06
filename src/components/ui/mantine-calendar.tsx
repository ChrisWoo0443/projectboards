import React from 'react';
import { Calendar as MantineCalendar } from '@mantine/dates';
import { MantineProvider, createTheme } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

interface CalendarProps {
  mode?: "single";
  selected?: Date | undefined;
  onSelect?: (date: Date | null) => void;
  className?: string;
  initialFocus?: boolean;
}

// Create a theme that matches your existing design
const theme = createTheme({
  primaryColor: 'violet',
  fontFamily: 'inherit',
});

function Calendar({
  selected,
  onSelect,
  className,
  ...props
}: CalendarProps) {
  const handleDateChange = (date: Date | null) => {
    if (onSelect) {
      onSelect(date);
    }
  };

  return (
    <MantineProvider theme={theme}>
      <div className={className}>
        <MantineCalendar
          value={selected || null}
          onChange={handleDateChange}
          size="sm"
          getDayProps={(date) => {
            // Ensure date is treated as a Date object
            const dateObj = typeof date === 'string' ? new Date(date) : date;
            
            // Compare dates by year, month, and day only
            const isSelected = selected ? (
              dateObj.getFullYear() === selected.getFullYear() &&
              dateObj.getMonth() === selected.getMonth() &&
              dateObj.getDate() === selected.getDate()
            ) : false;
            
            return {
              selected: isSelected,
              onClick: () => {
                // Use the date directly from Mantine, just set time to noon to avoid timezone issues
                const clickedDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), 12, 0, 0, 0);
                handleDateChange(clickedDate);
              },
            };
          }}
          classNames={{
            calendarHeader: 'bg-transparent',
            calendarHeaderControl: 'text-inherit hover:bg-violet-100',
            calendarHeaderLevel: 'text-inherit font-medium',
            weekday: 'text-slate-500 text-xs font-normal',
            day: 'text-inherit hover:bg-violet-100 data-[selected]:bg-violet-600 data-[selected]:text-white data-[today]:bg-violet-100 data-[today]:text-violet-600 data-[today]:font-medium',
          }}
          {...(props as any)}
        />
      </div>
    </MantineProvider>
  );
}

Calendar.displayName = "Calendar";

export { Calendar };