import type { TimelinePeriod, TimelineRangeValue } from 'src/utils/timeline-range';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import {
  applyTimelineYear,
  applyTimelinePeriod,
  availableTimelineYears,
} from 'src/utils/timeline-range';

// ----------------------------------------------------------------------

export type TimelineFilterProps = {
  value: TimelineRangeValue;
  onChange: (next: TimelineRangeValue) => void;
  years?: number[];
};

const PERIOD_OPTIONS: { value: TimelinePeriod; label: string }[] = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
  { value: 'custom', label: 'Custom' },
];

export function TimelineFilter({ value, onChange, years }: TimelineFilterProps) {
  const yearOptions = years || availableTimelineYears();

  const handlePeriod = (_: React.MouseEvent<HTMLElement>, nextPeriod: TimelinePeriod | null) => {
    if (!nextPeriod) return;
    onChange(applyTimelinePeriod(value, nextPeriod));
  };

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={1.5}
      alignItems={{ xs: 'stretch', md: 'center' }}
      flexWrap="wrap"
      useFlexGap
    >
      <ToggleButtonGroup
        exclusive
        size="small"
        value={value.period}
        onChange={handlePeriod}
        aria-label="Timeline period"
      >
        {PERIOD_OPTIONS.map((option) => (
          <ToggleButton key={option.value} value={option.value} sx={{ px: 1.5, textTransform: 'none' }}>
            {option.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Year</InputLabel>
        <Select
          label="Year"
          value={value.year}
          onChange={(event) => onChange(applyTimelineYear(value, Number(event.target.value)))}
        >
          {yearOptions.map((year) => (
            <MenuItem key={year} value={year}>
              {year}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {value.period === 'custom' && (
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <TextField
            label="From"
            type="date"
            size="small"
            value={value.startDate}
            onChange={(event) =>
              onChange({
                ...value,
                period: 'custom',
                startDate: event.target.value,
                year: Number(event.target.value.slice(0, 4)) || value.year,
              })
            }
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="To"
            type="date"
            size="small"
            value={value.endDate}
            onChange={(event) =>
              onChange({
                ...value,
                period: 'custom',
                endDate: event.target.value,
                year: Number(event.target.value.slice(0, 4)) || value.year,
              })
            }
            InputLabelProps={{ shrink: true }}
          />
        </Box>
      )}
    </Stack>
  );
}
