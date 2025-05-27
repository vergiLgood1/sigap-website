import { format, formatDistanceToNow } from 'date-fns';

/**
 * Calculate the average time of day from a list of timestamps
 */
export function calculateAverageTimeOfDay(timestamps: Date[]) {
  if (!timestamps.length) {
    return {
      hour: 0,
      minute: 0,
      formattedTime: '00:00',
      description: 'No data',
      timeOfDay: 'unknown',
      earliest: new Date(),
      latest: new Date(),
      mostFrequentHour: 0,
    };
  }

  // Extract hours and minutes, convert to minutes since midnight
  let totalMinutes = 0;
  const minutesArray: number[] = [];
  const hours: number[] = new Array(24).fill(0); // For hour frequency

  let earliest = new Date(timestamps[0]);
  let latest = new Date(timestamps[0]);

  timestamps.forEach((timestamp) => {
    const date = new Date(timestamp);

    // Update earliest and latest
    if (date < earliest) earliest = new Date(date);
    if (date > latest) latest = new Date(date);

    const hour = date.getHours();
    const minute = date.getMinutes();

    // Track hour frequency
    hours[hour]++;

    // Convert to minutes since midnight
    const minutesSinceMidnight = hour * 60 + minute;
    minutesArray.push(minutesSinceMidnight);
    totalMinutes += minutesSinceMidnight;
  });

  // Find most frequent hour
  let mostFrequentHour = 0;
  let maxFrequency = 0;
  hours.forEach((freq, hour) => {
    if (freq > maxFrequency) {
      mostFrequentHour = hour;
      maxFrequency = freq;
    }
  });

  // Need to handle the circular nature of time
  // (e.g., average of 23:00 and 01:00 should be around midnight, not noon)
  minutesArray.sort((a, b) => a - b);

  // Check if we have times spanning across midnight
  let useSortedMedian = false;
  for (let i = 0; i < minutesArray.length - 1; i++) {
    if (minutesArray[i + 1] - minutesArray[i] > 720) {
      // More than 12 hours apart
      useSortedMedian = true;
      break;
    }
  }

  let avgMinutesSinceMidnight;

  if (useSortedMedian) {
    // Use median to avoid the midnight crossing issue
    const mid = Math.floor(minutesArray.length / 2);
    avgMinutesSinceMidnight =
      minutesArray.length % 2 === 0
        ? (minutesArray[mid - 1] + minutesArray[mid]) / 2
        : minutesArray[mid];
  } else {
    // Simple average works when times are clustered
    avgMinutesSinceMidnight = totalMinutes / timestamps.length;
  }

  // Convert back to hours and minutes
  const avgHour = Math.floor(avgMinutesSinceMidnight / 60) % 24;
  const avgMinute = Math.floor(avgMinutesSinceMidnight % 60);

  // Format time nicely
  const formattedTime = `${avgHour.toString().padStart(2, '0')}:${avgMinute.toString().padStart(2, '0')}`;

  // Determine time of day
  let timeOfDay: string;
  let description: string;

  if (avgHour >= 5 && avgHour < 12) {
    timeOfDay = 'morning';
    description = 'Morning';
  } else if (avgHour >= 12 && avgHour < 17) {
    timeOfDay = 'afternoon';
    description = 'Afternoon';
  } else if (avgHour >= 17 && avgHour < 21) {
    timeOfDay = 'evening';
    description = 'Evening';
  } else {
    timeOfDay = 'night';
    description = 'Night';
  }

  return {
    hour: avgHour,
    minute: avgMinute,
    formattedTime,
    description,
    timeOfDay,
    earliest,
    latest,
    mostFrequentHour,
  };
}

/**
 * Format a timestamp as a relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(timestamp: Date | string | number): string {
  try {
    const date = new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (e) {
    return 'Invalid date';
  }
}

/**
 * Group timestamps by hour of day
 */
export function getHourDistribution(timestamps: Date[]): number[] {
  const hours = new Array(24).fill(0);

  timestamps.forEach((timestamp) => {
    const date = new Date(timestamp);
    const hour = date.getHours();
    hours[hour]++;
  });

  return hours;
}

/**
 * Get color for time of day visualization
 */
export function getTimeColor(hour: number): string {
  if (hour >= 5 && hour < 12) return '#FFEB3B'; // morning - yellow
  if (hour >= 12 && hour < 17) return '#FF9800'; // afternoon - orange
  if (hour >= 17 && hour < 21) return '#3F51B5'; // evening - indigo
  return '#263238'; // night - dark blue-grey
}
