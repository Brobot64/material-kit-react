'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';

import { printThermalReceipt } from 'src/utils/print-thermal-receipt';
import { formatNgn, toTitleCase, formatReceiptAddress } from 'src/utils/receipt-format';

import { api } from 'src/services/api';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

interface ReceiptPreviewModalProps {
  open: boolean;
  onClose: () => void;
  saleId: string;
  businessId: string;
}

function numberToWords(n: number): string {
  if (n === 0) return 'Zero Naira Only';
  const ones = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];
  const tens = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
  ];

  function below1000(num: number): string {
    if (num < 20) return ones[num];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ` ${ones[num % 10]}` : '');
    return `${ones[Math.floor(num / 100)]} Hundred${num % 100 ? ` ${below1000(num % 100)}` : ''}`;
  }

  const kobo = Math.round((n % 1) * 100);
  const naira = Math.floor(n);

  const billions = Math.floor(naira / 1_000_000_000);
  const millions = Math.floor((naira % 1_000_000_000) / 1_000_000);
  const thousands = Math.floor((naira % 1_000_000) / 1_000);
  const remainder = naira % 1_000;

  let result = '';
  if (billions) result += `${below1000(billions)} Billion `;
  if (millions) result += `${below1000(millions)} Million `;
  if (thousands) result += `${below1000(thousands)} Thousand `;
  if (remainder) result += below1000(remainder);

  result = `${result.trim()} Naira`;
  if (kobo > 0) result += ` and ${below1000(kobo)} Kobo`;
  result += ' Only';
  return result;
}

function formatDate(d: string | Date) {
  return new Date(d).toLocaleDateString('en-NG', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function getStatusLabel(amountPaid: number, total: number): { label: string; color: string } {
  if (amountPaid >= total) return { label: 'PAID', color: '#16a34a' };
  if (amountPaid > 0) return { label: 'PARTIAL', color: '#d97706' };
  return { label: 'UNPAID', color: '#dc2626' };
}

// ----------------------------------------------------------------------

function ReceiptDocument({ data }: { data: any }) {
  const primary = data.template?.primaryColor || '#1a1a2e';
  const status = getStatusLabel(data.amountPaid, data.total);
  const change = Math.max(0, data.amountPaid - data.total);
  const balance = Math.max(0, data.total - data.amountPaid);

  const outletName = toTitleCase(data.outlet?.name || 'Store');
  const cashierName = toTitleCase(data.cashier?.name || data.cashier?.fullName || 'Staff');
  const customerName = data.customer
    ? toTitleCase(data.customer.name || data.customer.fullName)
    : 'Walk-In Customer';
  const paymentMethod = toTitleCase(data.paymentMethod || 'Cash');

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 680,
        mx: 'auto',
        bgcolor: '#fff',
        fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
        fontSize: '13px',
        color: '#1a1a2e',
        border: '1px solid #e5e7eb',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {/* ── Header ── */}
      <Box
        sx={{
          bgcolor: primary,
          px: 3,
          py: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          {data.template?.logoUrl ? (
            <Box
              component="img"
              src={data.template.logoUrl}
              alt="logo"
              sx={{
                height: 44,
                width: 44,
                objectFit: 'contain',
                borderRadius: 1,
                bgcolor: 'white',
                p: 0.5,
              }}
            />
          ) : (
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 1,
                bgcolor: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 900,
                fontSize: 20,
              }}
            >
              {outletName.charAt(0).toUpperCase()}
            </Box>
          )}
          <Box>
            <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '16px', lineHeight: 1.2 }}>
              {outletName}
            </Typography>
            {data.outlet?.address && (
              <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '11px', mt: 0.2 }}>
                {formatReceiptAddress(data.outlet.address)}
              </Typography>
            )}
            {data.outlet?.phone && (
              <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '11px' }}>
                {data.outlet.phone}
              </Typography>
            )}
          </Box>
        </Stack>

        <Box sx={{ textAlign: 'right' }}>
          <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '22px', letterSpacing: '-0.5px' }}>
            {status.label}
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', fontWeight: 600 }}>
            #{data.receiptNumber}
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontSize: '11px', mt: 0.5 }}>
            {formatDate(data.timestamp)}
          </Typography>
        </Box>
      </Box>

      {/* ── Divider banner ── */}
      <Box sx={{ bgcolor: '#f8fafc', borderBottom: '1px solid #e5e7eb', px: 3, py: 1 }}>
        <Typography
          sx={{
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            color: '#6b7280',
            textTransform: 'uppercase',
          }}
        >
          Official Cash Sales Invoice
        </Typography>
      </Box>

      {/* ── Store & Customer ── */}
      <Box
        sx={{
          px: 3,
          py: 2.5,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 3,
          borderBottom: '1px solid #f3f4f6',
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#9ca3af',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              mb: 0.5,
            }}
          >
            Invoice From
          </Typography>
          <Typography sx={{ fontWeight: 700, color: primary, fontSize: '13px' }}>{outletName}</Typography>
          {data.outlet?.address && (
            <Typography sx={{ fontSize: '12px', color: '#4b5563', mt: 0.25 }}>
              {formatReceiptAddress(data.outlet.address)}
            </Typography>
          )}
          {data.outlet?.phone && (
            <Typography sx={{ fontSize: '12px', color: '#4b5563' }}>{data.outlet.phone}</Typography>
          )}
          {data.template?.sections?.showCashierName !== false && (
            <Typography sx={{ fontSize: '12px', color: '#4b5563', mt: 0.5 }}>
              Cashier: <strong>{cashierName}</strong>
            </Typography>
          )}
        </Box>

        <Box>
          <Typography
            sx={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#9ca3af',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              mb: 0.5,
            }}
          >
            Invoice To
          </Typography>
          {data.template?.sections?.showCustomerInfo !== false && data.customer ? (
            <>
              <Typography sx={{ fontWeight: 700, color: primary, fontSize: '13px' }}>
                {customerName}
              </Typography>
              {data.customer.phone && (
                <Typography sx={{ fontSize: '12px', color: '#4b5563', mt: 0.25 }}>
                  {data.customer.phone}
                </Typography>
              )}
            </>
          ) : (
            <Typography sx={{ fontWeight: 700, color: '#374151', fontSize: '13px' }}>
              Walk-In Customer
            </Typography>
          )}
          <Box sx={{ mt: 1.5 }}>
            <Typography
              sx={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#9ca3af',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Date
            </Typography>
            <Typography sx={{ fontSize: '12px', color: '#374151', fontWeight: 600 }}>
              {formatDate(data.timestamp)}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── Items Table ── */}
      <Box sx={{ px: 3, py: 2 }}>
        <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#374151', mb: 1.5 }}>
          Invoice Details
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '32px 1fr 64px 100px 100px',
            gap: 1,
            px: 1.5,
            py: 1,
            bgcolor: '#f8fafc',
            borderRadius: '6px 6px 0 0',
            borderBottom: `2px solid ${primary}`,
          }}
        >
          {['#', 'Description', 'Qty', 'Unit Price', 'Total'].map((h, i) => (
            <Typography
              key={h}
              sx={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                textAlign: i > 1 ? 'right' : 'left',
              }}
            >
              {h}
            </Typography>
          ))}
        </Box>

        {(data.items ?? []).map((item: any, i: number) => (
          <Box
            key={i}
            sx={{
              display: 'grid',
              gridTemplateColumns: '32px 1fr 64px 100px 100px',
              gap: 1,
              px: 1.5,
              py: 1.5,
              borderBottom: '1px solid #f3f4f6',
              '&:hover': { bgcolor: '#fafafa' },
              alignItems: 'start',
            }}
          >
            <Typography sx={{ fontSize: '12px', color: '#9ca3af', fontWeight: 600, pt: 0.2 }}>
              {i + 1}
            </Typography>
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>
                {toTitleCase(item.name)}
              </Typography>
              {item.sku && (
                <Typography sx={{ fontSize: '11px', color: '#9ca3af', mt: 0.2 }}>
                  SKU: {item.sku}
                </Typography>
              )}
            </Box>
            <Typography
              sx={{ fontSize: '13px', color: primary, fontWeight: 700, textAlign: 'right', pt: 0.2 }}
            >
              {item.qty}
            </Typography>
            <Typography sx={{ fontSize: '13px', color: '#374151', textAlign: 'right', pt: 0.2 }}>
              {formatNgn(item.unitPrice)}
            </Typography>
            <Typography
              sx={{ fontSize: '13px', color: '#111827', fontWeight: 600, textAlign: 'right', pt: 0.2 }}
            >
              {formatNgn(item.lineTotal)}
            </Typography>
          </Box>
        ))}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
          <Box sx={{ width: 260 }}>
            {[
              {
                label: 'Subtotal',
                value: data.subtotal,
                show: data.discountTotal > 0 || data.taxTotal > 0,
              },
              {
                label: 'Discount',
                value: -data.discountTotal,
                show: data.discountTotal > 0,
                color: '#dc2626',
              },
              {
                label: 'Tax (7.5% VAT)',
                value: data.taxTotal,
                show: data.template?.showTaxBreakdown && data.taxTotal > 0,
              },
            ]
              .filter((r) => r.show)
              .map((row) => (
                <Box
                  key={row.label}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    py: 0.5,
                    borderBottom: '1px solid #f3f4f6',
                  }}
                >
                  <Typography sx={{ fontSize: '13px', color: '#6b7280' }}>{row.label}</Typography>
                  <Typography sx={{ fontSize: '13px', color: (row as any).color || '#374151' }}>
                    {row.label === 'Discount' ? `-${formatNgn(data.discountTotal)}` : formatNgn(row.value)}
                  </Typography>
                </Box>
              ))}

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                py: 1,
                mt: 0.5,
                borderTop: `2px solid ${primary}`,
              }}
            >
              <Typography sx={{ fontSize: '15px', fontWeight: 800, color: '#111827' }}>Total</Typography>
              <Typography sx={{ fontSize: '15px', fontWeight: 800, color: primary }}>
                {formatNgn(data.total)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── Payment section ── */}
      <Box
        sx={{
          px: 3,
          py: 2,
          bgcolor: '#f8fafc',
          borderTop: '1px solid #e5e7eb',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <Box>
            <Typography
              sx={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#9ca3af',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                mb: 0.5,
              }}
            >
              Payment Method
            </Typography>
            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
              {paymentMethod}
            </Typography>
          </Box>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography sx={{ fontSize: '12px', color: '#6b7280' }}>Amount Paid</Typography>
              <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#16a34a' }}>
                {formatNgn(data.amountPaid)}
              </Typography>
            </Box>
            {balance > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography sx={{ fontSize: '12px', color: '#6b7280' }}>Balance Due</Typography>
                <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#dc2626' }}>
                  {formatNgn(balance)}
                </Typography>
              </Box>
            )}
            {change > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '12px', color: '#6b7280' }}>Change Given</Typography>
                <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>
                  {formatNgn(change)}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px dashed #d1d5db' }}>
          <Typography
            sx={{
              fontSize: '11px',
              color: '#9ca3af',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Amount in Words
          </Typography>
          <Typography sx={{ fontSize: '12px', color: '#374151', fontStyle: 'italic', mt: 0.25 }}>
            {numberToWords(data.total)}
          </Typography>
        </Box>
      </Box>

      {data.template?.footerText && (
        <Box sx={{ px: 3, py: 1.5, borderBottom: '1px solid #f3f4f6' }}>
          <Typography sx={{ fontSize: '11px', color: '#6b7280', lineHeight: 1.6 }}>
            {data.template.footerText}
          </Typography>
        </Box>
      )}

      <Box sx={{ px: 3, py: 2, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
        <Box>
          <Box sx={{ borderTop: '1px solid #374151', pt: 0.75, mt: 4 }}>
            <Typography sx={{ fontSize: '11px', color: '#6b7280', fontWeight: 600 }}>
              Customer Signature
            </Typography>
          </Box>
        </Box>
        <Box>
          <Box sx={{ borderTop: '1px solid #374151', pt: 0.75, mt: 4 }}>
            <Typography sx={{ fontSize: '11px', color: '#6b7280', fontWeight: 600 }}>
              For: {outletName}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ bgcolor: primary, px: 3, py: 1.5, textAlign: 'center' }}>
        <Typography
          sx={{
            color: '#fff',
            fontWeight: 800,
            fontSize: '13px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          Thanks for your patronage
        </Typography>
        {data.template?.watermarkText && (
          <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', mt: 0.25 }}>
            {data.template.watermarkText}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

// ----------------------------------------------------------------------

export function ReceiptPreviewModal({
  open,
  onClose,
  saleId,
  businessId,
}: ReceiptPreviewModalProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

  const fetchReceipt = useCallback(async () => {
    if (!saleId || !businessId) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.getReceiptData(saleId, businessId);
      setData((res as any)?.data ?? res);
    } catch (e: any) {
      setError(e.message || 'Failed to load receipt');
    } finally {
      setLoading(false);
    }
  }, [saleId, businessId]);

  useEffect(() => {
    if (open) fetchReceipt();
    else setData(null);
  }, [open, fetchReceipt]);

  const handlePrint = () => {
    if (!data) return;
    try {
      const cashierName =
        data.cashier?.name ||
        data.cashier?.fullName ||
        (typeof data.cashier === 'string' ? data.cashier : '');
      const customerName =
        data.customer?.name ||
        data.customer?.fullName ||
        (typeof data.customer === 'string' ? data.customer : undefined);

      printThermalReceipt({
        receiptNumber: data.receiptNumber,
        saleId: data.saleId || saleId,
        status: data.status || getStatusLabel(data.amountPaid ?? 0, data.total ?? 0).label,
        outlet: {
          ...data.outlet,
          name: toTitleCase(data.outlet?.name || 'Store'),
          address: data.outlet?.address,
        },
        cashier: cashierName ? { name: toTitleCase(cashierName) } : undefined,
        customer: customerName
          ? { name: toTitleCase(customerName), phone: data.customer?.phone }
          : null,
        items: (data.items ?? []).map((item: any) => ({
          ...item,
          name: toTitleCase(item.name),
          category: item.categoryName || item.category || undefined,
        })),
        subtotal: data.subtotal,
        discountTotal: data.discountTotal,
        taxTotal: data.taxTotal,
        total: data.total,
        amountPaid: data.amountPaid,
        amountPending: data.amountPending,
        changeGiven: data.changeGiven,
        paymentMethod: toTitleCase(data.paymentMethod || 'cash'),
        timestamp: data.timestamp,
        template: data.template,
      });
    } catch (e: any) {
      setError(e.message || 'Failed to open print dialog');
    }
  };

  /** Export the exact preview DOM so PDF matches on-screen receipt (incl. ₦). */
  const handleDownloadPdf = async () => {
    if (!printRef.current || !data) return;
    setDownloading(true);
    setError('');
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 12;
      const usableWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * usableWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = margin;

      pdf.addImage(imgData, 'PNG', margin, position, usableWidth, imgHeight);
      heightLeft -= pageHeight - margin * 2;

      while (heightLeft > 0) {
        position = margin - (imgHeight - heightLeft);
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position, usableWidth, imgHeight);
        heightLeft -= pageHeight - margin * 2;
      }

      const fileNo = data.receiptNumber || saleId.slice(-8).toUpperCase();
      pdf.save(`receipt-${fileNo}.pdf`);
    } catch (e: any) {
      setError(e.message || 'Failed to download PDF');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2, maxHeight: '92vh' } }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2.5,
          py: 1.5,
          borderBottom: '1px solid #f3f4f6',
          position: 'sticky',
          top: 0,
          bgcolor: '#fff',
          zIndex: 10,
        }}
      >
        <Typography variant="subtitle1" fontWeight={700}>
          Receipt Preview
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            size="small"
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon="solar:receipt-bold" />}
            onClick={handlePrint}
            disabled={!data}
          >
            Print Receipt
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={downloading ? undefined : <Iconify icon="eva:arrow-ios-downward-fill" />}
            onClick={handleDownloadPdf}
            disabled={!data || downloading}
          >
            {downloading ? 'Downloading…' : 'Download PDF'}
          </Button>
          <IconButton size="small" onClick={onClose}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </Stack>
      </Box>

      <DialogContent sx={{ bgcolor: '#f3f4f6', p: 3 }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        )}
        {error && (
          <Typography color="error" variant="body2" sx={{ py: 2, textAlign: 'center' }}>
            {error}
          </Typography>
        )}
        {data && !loading && (
          <Box ref={printRef}>
            <ReceiptDocument data={data} />
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
