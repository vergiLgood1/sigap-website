"use client"

import React, { useEffect, useState } from 'react';

interface DigitalClockProps {
    timeZone: string;
    className?: string;
    format?: '12h' | '24h';
    showSeconds?: boolean;
}

export default function DigitalClock({
    timeZone,
    className = "",
    format = '24h',
    showSeconds = false
}: DigitalClockProps) {
    const [time, setTime] = useState<string>("");

    useEffect(() => {
      function updateTime() {
          const now = new Date();
          const options: Intl.DateTimeFormatOptions = {
              hour: '2-digit',
              minute: '2-digit',
              second: showSeconds ? '2-digit' : undefined,
              hour12: format === '12h',
              timeZone
          };
          setTime(now.toLocaleTimeString('id-ID', options));
    }

      // Update immediately, then every second
      updateTime();
      const interval = setInterval(updateTime, 1000);
      return () => clearInterval(interval);
  }, [timeZone, format, showSeconds]);

    return (
      <span className={className}>{time}</span>
  );
}
