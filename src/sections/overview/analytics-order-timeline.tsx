import type { CardProps } from '@mui/material/Card';
import type { TimelineItemProps } from '@mui/lab/TimelineItem';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Timeline from '@mui/lab/Timeline';
import Button from '@mui/material/Button';
import TimelineDot from '@mui/lab/TimelineDot';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';

import { fDateTime } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = CardProps & {
  title?: string;
  subheader?: string;
  list: {
    id: string;
    type: string;
    title: string;
    performer?: string;
    time: string | number | null;
  }[];
};

export function AnalyticsOrderTimeline({ title, subheader, list, sx, ...other }: Props) {
  return (
    <Card sx={sx} {...other}>
      <CardHeader title={title} subheader={subheader} />

      <Timeline
        sx={{ m: 0, p: 3, [`& .${timelineItemClasses.root}:before`]: { flex: 0, padding: 0 } }}
      >
        {list.map((item, index) => (
          <Item key={item.id} item={item} lastItem={index === list.length - 1} />
        ))}
      </Timeline>

      <Box sx={{ p: 2, textAlign: 'right' }}>
        <Button
          size="small"
          color="inherit"
          endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={18} sx={{ ml: -0.5 }} />}
        >
          See all
        </Button>
      </Box>
    </Card>
  );
}

// ----------------------------------------------------------------------

type ItemProps = TimelineItemProps & {
  lastItem: boolean;
  item: Props['list'][number];
};

function Item({ item, lastItem, ...other }: ItemProps) {
  const rawFirstName = item.performer?.split(' ')[0] || '';
  const firstName = rawFirstName
    ? rawFirstName.charAt(0).toUpperCase() + rawFirstName.slice(1).toLowerCase()
    : '';

  return (
    <TimelineItem {...other}>
      <TimelineSeparator>
        <TimelineDot
          color={
            (item.type === 'order1' && 'primary') ||
            (item.type === 'order2' && 'success') ||
            (item.type === 'order3' && 'info') ||
            (item.type === 'order4' && 'warning') ||
            'error'
          }
        />
        {lastItem ? null : <TimelineConnector />}
      </TimelineSeparator>

      <TimelineContent>
        <Typography variant="subtitle2">{item.title}</Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            {fDateTime(item.time)}
          </Typography>
          {firstName && (
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              &nbsp; by • {firstName}
            </Typography>
          )}
        </Box>
      </TimelineContent>
    </TimelineItem>
  );
}
