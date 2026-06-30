import { useState } from 'react';

import Box from '@mui/material/Box';
import Step from '@mui/material/Step';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Dialog from '@mui/material/Dialog';
import Stepper from '@mui/material/Stepper';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import StepLabel from '@mui/material/StepLabel';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import OutlinedInput from '@mui/material/OutlinedInput';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { formatError } from 'src/utils/format-error';

import { api } from 'src/services/api';
import { useAuth } from 'src/contexts/auth-context';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const STEPS = ['Upload File', 'Map Columns', 'Result'];

const PRODUCT_FIELDS = [
  { key: 'sku', label: 'SKU (Stock Keeping Unit)' },
  { key: 'name', label: 'Product Name' },
  { key: 'unit', label: 'Unit' },
  { key: 'sellingPrice', label: 'Selling Price' },
  { key: 'currentCost', label: 'Cost Price' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'category', label: 'Category' },
  { key: 'description', label: 'Description' },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ProductUploadDialog({ open, onClose, onSuccess }: Props) {
  const { appData, outlets } = useAuth();
  const businessId = appData?.businessId;

  const [activeStep, setActiveStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [selectedOutletId, setSelectedOutletId] = useState(appData?.outletId || '');
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [detailsMapping, setDetailsMapping] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ imported: number; errors: any[] } | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleNext = async () => {
    if (activeStep === 0) {
      if (!file) {
        setError('Please select a CSV file.');
        return;
      }
      if (!selectedOutletId) {
        setError('Please select an outlet.');
        return;
      }
      try {
        setLoading(true);
        const res: any = await api.getProductUploadHeaders(file);
        const fetchedHeaders = Array.isArray(res)
          ? res
          : (Array.isArray(res?.headers)
              ? res.headers
              : (Array.isArray(res?.data) ? res.data : []));
        setHeaders(fetchedHeaders);
        setActiveStep(1);
        setError(null);
      } catch (err: any) {
        setError(formatError(err));
      } finally {
        setLoading(false);
      }
    } else if (activeStep === 1) {
      if (!file) {
        setError('Please select a CSV file.');
        return;
      }
      try {
        setLoading(true);
        const finalMapping = {
          ...mapping,
          details: detailsMapping,
        };
        const res = await api.executeProductUpload({
          businessId,
          outletId: selectedOutletId,
          mapping: finalMapping,
          file,
        });
        setResult(res);
        setActiveStep(2);
        if (res.imported > 0) {
          onSuccess();
        }
      } catch (err: any) {
        setError(formatError(err));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setError(null);
  };

  const handleReset = () => {
    setActiveStep(0);
    setFile(null);
    setHeaders([]);
    setMapping({});
    setDetailsMapping([]);
    setResult(null);
    setError(null);
  };

  const handleClose = () => {
    onClose();
    setTimeout(handleReset, 500);
  };

  const renderStep0 = (
    <Box sx={{ py: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box
        sx={{
          p: 5,
          border: '2px dashed',
          borderColor: 'divider',
          borderRadius: 2,
          textAlign: 'center',
          bgcolor: 'background.neutral',
          cursor: 'pointer',
          '&:hover': { bgcolor: 'action.hover' },
          position: 'relative',
        }}
        onClick={() => document.getElementById('csv-input')?.click()}
      >
        <input
          id="csv-input"
          type="file"
          accept=".csv"
          hidden
          onChange={handleFileChange}
        />
        <Iconify icon="eva:cloud-upload-fill" width={48} sx={{ color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6">
          {file ? file.name : 'Click to select or drag CSV file'}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Only CSV files are supported
        </Typography>
      </Box>

      <FormControl fullWidth>
        <InputLabel>Select Outlet</InputLabel>
        <Select
          value={selectedOutletId}
          label="Select Outlet"
          onChange={(e) => setSelectedOutletId(e.target.value)}
        >
          {outlets?.map((outlet: any) => (
            <MenuItem key={outlet._id} value={outlet._id}>
              {outlet.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );

  const renderStep1 = (
    <Box sx={{ py: 3 }}>
      <Typography variant="subtitle2" sx={{ mb: 2 }}>
        Map your CSV columns to product fields
      </Typography>
      <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Product Field</TableCell>
              <TableCell>CSV Column</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {PRODUCT_FIELDS.map((field) => (
              <TableRow key={field.key}>
                <TableCell sx={{ fontWeight: 'bold' }}>{field.label}</TableCell>
                <TableCell>
                  <Select
                    fullWidth
                    size="small"
                    value={mapping[field.key] || ''}
                    onChange={(e) => setMapping({ ...mapping, [field.key]: e.target.value })}
                    displayEmpty
                  >
                    <MenuItem value="">
                      <em>Ignore</em>
                    </MenuItem>
                    {headers.map((header) => (
                      <MenuItem key={header} value={header}>
                        {header}
                      </MenuItem>
                    ))}
                  </Select>
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Additional Details (JSON)</TableCell>
              <TableCell>
                <Select
                  multiple
                  fullWidth
                  size="small"
                  value={detailsMapping}
                  onChange={(e) => setDetailsMapping(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                  input={<OutlinedInput label="Details" />}
                  renderValue={(selected) => selected.join(', ')}
                >
                  {headers.map((header) => (
                    <MenuItem key={header} value={header}>
                      <Checkbox checked={detailsMapping.indexOf(header) > -1} />
                      <ListItemText primary={header} />
                    </MenuItem>
                  ))}
                </Select>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  // Build a reverse map: CSV column name -> system field label
  const csvColumnToLabel = Object.entries(mapping).reduce<Record<string, string>>((acc, [fieldKey, csvColumn]) => {
    const field = PRODUCT_FIELDS.find((f) => f.key === fieldKey);
    if (field && csvColumn) {
      acc[csvColumn] = field.label;
    }
    return acc;
  }, {});

  // Replaces any raw CSV column names in the error message with their mapped labels
  const humanizeErrorMessage = (message: any) => {
    if (typeof message !== 'string') return String(message || '');
    return Object.entries(csvColumnToLabel).reduce(
      (msg, [csvCol, label]) => msg.replaceAll(csvCol, label),
      message
    );
  };

  const renderStep2 = (
    <Box sx={{ py: 3, textAlign: 'center' }}>
      {result && (
        <>
          <Iconify
            icon={result.imported > 0 ? "eva:checkmark-circle-2-fill" : "eva:info-fill"}
            width={64}
            sx={{ color: result.imported > 0 ? 'success.main' : 'warning.main', mb: 2 }}
          />
          <Typography variant="h5">Import Finished</Typography>
          <Typography variant="body1" sx={{ mt: 1, color: 'text.secondary' }}>
            Successfully imported <strong>{result.imported}</strong> products.
          </Typography>
          {result.errors && result.errors.length > 0 && (
            <Box sx={{ mt: 3, textAlign: 'left' }}>
              <Typography variant="subtitle2" color="error" gutterBottom>
                Errors ({result.errors.length}):
              </Typography>
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'error.lighter',
                  borderRadius: 1,
                  maxHeight: 200,
                  overflow: 'auto',
                }}
              >
                {result.errors.map((err, idx) => (
                  <Typography key={idx} variant="caption" display="block" color="error.darker">
                    Row {err.row}: {humanizeErrorMessage(err.message)}
                  </Typography>
                ))}
              </Box>
            </Box>
          )}
        </>
      )}
    </Box>
  );

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Import Products
        <IconButton onClick={handleClose}>
          <Iconify icon="eva:close-fill" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ pt: 3, pb: 2 }}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {activeStep === 0 && renderStep0}
        {activeStep === 1 && renderStep1}
        {activeStep === 2 && renderStep2}
      </DialogContent>

      <DialogActions>
        {activeStep < 2 ? (
          <>
            <Button color="inherit" onClick={handleClose}>
              Cancel
            </Button>
            {activeStep === 1 && (
              <Button color="inherit" onClick={handleBack}>
                Back
              </Button>
            )}
            <Button
              variant="contained"
              disabled={loading}
              onClick={handleNext}
              startIcon={loading && <CircularProgress size={20} />}
            >
              {activeStep === 0 ? 'Next' : 'Import'}
            </Button>
          </>
        ) : (
          <Button variant="contained" onClick={handleClose}>
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
