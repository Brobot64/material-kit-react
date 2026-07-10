export type TimelinePeriod = 'week' | 'month' | 'year' | 'custom';

export type TimelineRangeValue = {
  period: TimelinePeriod;
  year: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
};

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function toDateInputValue(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function startOfWeek(reference = new Date()): Date {
  const date = new Date(reference);
  const day = date.getDay();
  const mondayOffset = day === 0 ? 6 : day - 1;
  date.setDate(date.getDate() - mondayOffset);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function fullYearRange(year: number): { startDate: string; endDate: string } {
  return {
    startDate: `${year}-01-01`,
    endDate: `${year}-12-31`,
  };
}

export function createDefaultTimelineRange(
  period: TimelinePeriod = 'month',
  year = new Date().getFullYear()
): TimelineRangeValue {
  const now = new Date();

  if (period === 'week') {
    return {
      period,
      year: now.getFullYear(),
      startDate: toDateInputValue(startOfWeek(now)),
      endDate: toDateInputValue(now),
    };
  }

  if (period === 'year') {
    const range = fullYearRange(year);
    return {
      period,
      year,
      startDate: range.startDate,
      endDate: range.endDate,
    };
  }

  if (period === 'custom') {
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
      period,
      year: now.getFullYear(),
      startDate: toDateInputValue(firstOfMonth),
      endDate: toDateInputValue(now),
    };
  }

  // month
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return {
    period: 'month',
    year: now.getFullYear(),
    startDate: toDateInputValue(firstOfMonth),
    endDate: toDateInputValue(now),
  };
}

export function applyTimelinePeriod(
  current: TimelineRangeValue,
  period: TimelinePeriod
): TimelineRangeValue {
  if (period === 'custom') {
    return { ...current, period: 'custom' };
  }

  return createDefaultTimelineRange(period, current.year);
}

export function applyTimelineYear(current: TimelineRangeValue, year: number): TimelineRangeValue {
  const range = fullYearRange(year);
  return {
    period: 'year',
    year,
    startDate: range.startDate,
    endDate: range.endDate,
  };
}

/** Query params for reporting APIs */
export function timelineRangeToQuery(range: TimelineRangeValue): {
  period: TimelinePeriod;
  year?: number;
  startDate: string;
  endDate: string;
} {
  if (range.period === 'year') {
    return {
      period: 'year',
      year: range.year,
      startDate: range.startDate,
      endDate: range.endDate,
    };
  }

  return {
    period: range.period,
    startDate: range.startDate,
    endDate: range.endDate,
  };
}

export function availableTimelineYears(span = 6): number[] {
  const current = new Date().getFullYear();
  return Array.from({ length: span }, (_, index) => current - index);
}
