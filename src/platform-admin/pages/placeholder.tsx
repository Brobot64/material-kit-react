import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

export default function PlatformPlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {description}
      </Typography>
      <Alert severity="info">Coming in a later phase of the platform admin console.</Alert>
    </Box>
  );
}
