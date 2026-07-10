/**
 * 80mm thermal / terminal POS receipt print helpers.
 * Uses a hidden iframe so printing is not blocked by pop-up policies.
 */

export type ThermalReceiptItem = {
  name: string;
  sku?: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
};

export type ThermalReceiptData = {
  receiptNumber?: string;
  status?: string;
  outlet?: { name?: string; address?: string | Record<string, unknown>; phone?: string };
  cashier?: { name?: string };
  customer?: { name?: string; phone?: string } | null;
  items?: ThermalReceiptItem[];
  subtotal?: number;
  discountTotal?: number;
  taxTotal?: number;
  total?: number;
  amountPaid?: number;
  amountPending?: number;
  changeGiven?: number;
  paymentMethod?: string;
  timestamp?: string | Date;
  template?: {
    footerText?: string;
    showTaxBreakdown?: boolean;
    sections?: {
      showCustomerInfo?: boolean;
      showCashierName?: boolean;
    };
  };
};

function fmtNgn(n: number) {
  const abs = Math.abs(n ?? 0);
  return `₦${abs.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatAddress(address: unknown): string {
  if (!address) return '';
  if (typeof address === 'string') return address;
  const a = address as Record<string, string>;
  return [a.street, a.city, a.state, a.country].filter(Boolean).join(', ');
}

function formatDateTime(d?: string | Date) {
  if (!d) return '';
  return new Date(d).toLocaleString('en-NG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function dashLine(char = '-', width = 32) {
  return char.repeat(width);
}

function padRow(left: string, right: string, width = 32) {
  const l = String(left);
  const r = String(right);
  const space = Math.max(1, width - l.length - r.length);
  return `${l}${' '.repeat(space)}${r}`;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Build monospace thermal receipt HTML (80mm). */
export function buildThermalReceiptHtml(data: ThermalReceiptData): string {
  const outletName = data.outlet?.name || 'Store';
  const address = formatAddress(data.outlet?.address);
  const phone = data.outlet?.phone || '';
  const receiptNo = data.receiptNumber || '';
  const status = (data.status || '').toUpperCase();
  const items = data.items ?? [];
  const total = data.total ?? 0;
  const amountPaid = data.amountPaid ?? 0;
  const change =
    data.changeGiven != null ? data.changeGiven : Math.max(0, amountPaid - total);
  const balance =
    data.amountPending != null ? data.amountPending : Math.max(0, total - amountPaid);
  const showCustomer = data.template?.sections?.showCustomerInfo !== false;
  const showCashier = data.template?.sections?.showCashierName !== false;
  const showTax = data.template?.showTaxBreakdown && (data.taxTotal ?? 0) > 0;

  const itemLines = items
    .map((item) => {
      const name = escapeHtml(item.name || 'Item');
      const sku = item.sku ? `<div class="muted">SKU: ${escapeHtml(item.sku)}</div>` : '';
      const qtyLine = escapeHtml(
        padRow(`${item.qty} x ${fmtNgn(item.unitPrice)}`, fmtNgn(item.lineTotal))
      );
      return `<div class="item"><div class="item-name">${name}</div>${sku}<div class="mono">${qtyLine}</div></div>`;
    })
    .join('');

  const totals: string[] = [];
  if ((data.discountTotal ?? 0) > 0 || (data.taxTotal ?? 0) > 0) {
    totals.push(
      `<div class="mono">${escapeHtml(padRow('Subtotal', fmtNgn(data.subtotal ?? 0)))}</div>`
    );
  }
  if ((data.discountTotal ?? 0) > 0) {
    totals.push(
      `<div class="mono">${escapeHtml(padRow('Discount', `-${fmtNgn(data.discountTotal!)}`))}</div>`
    );
  }
  if (showTax) {
    totals.push(`<div class="mono">${escapeHtml(padRow('VAT', fmtNgn(data.taxTotal!)))}</div>`);
  }
  totals.push(`<div class="mono total">${escapeHtml(padRow('TOTAL', fmtNgn(total)))}</div>`);
  totals.push(`<div class="mono">${escapeHtml(padRow('Paid', fmtNgn(amountPaid)))}</div>`);
  if (balance > 0) {
    totals.push(`<div class="mono">${escapeHtml(padRow('Balance', fmtNgn(balance)))}</div>`);
  }
  if (change > 0) {
    totals.push(`<div class="mono">${escapeHtml(padRow('Change', fmtNgn(change)))}</div>`);
  }

  const customerBlock =
    showCustomer && data.customer?.name
      ? `<div class="section">Customer: ${escapeHtml(data.customer.name)}${
          data.customer.phone ? `<br/>${escapeHtml(data.customer.phone)}` : ''
        }</div>`
      : `<div class="section">Customer: Walk-in</div>`;

  const cashierBlock =
    showCashier && data.cashier?.name
      ? `<div>Cashier: ${escapeHtml(data.cashier.name)}</div>`
      : '';

  const footer = data.template?.footerText
    ? `<div class="footer">${escapeHtml(data.template.footerText)}</div>`
    : `<div class="footer">Thank you for your patronage</div>`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Receipt #${escapeHtml(receiptNo)}</title>
  <style>
    @page { size: 80mm auto; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: "Courier New", Courier, monospace;
      font-size: 12px;
      line-height: 1.35;
      color: #000;
      background: #fff;
      width: 80mm;
      max-width: 80mm;
      margin: 0 auto;
      padding: 4mm 3mm;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .center { text-align: center; }
    .store { font-size: 14px; font-weight: 700; text-transform: uppercase; }
    .muted { color: #333; font-size: 11px; }
    .rule { margin: 6px 0; white-space: pre; letter-spacing: 0; }
    .mono { white-space: pre; font-family: "Courier New", Courier, monospace; }
    .item { margin-bottom: 6px; }
    .item-name { font-weight: 700; word-break: break-word; }
    .section { margin: 6px 0; }
    .total { font-weight: 700; font-size: 13px; margin-top: 4px; }
    .status { font-weight: 700; letter-spacing: 0.08em; }
    .footer { text-align: center; margin-top: 10px; font-size: 11px; }
    @media print {
      html, body { width: 80mm; margin: 0; padding: 2mm; }
    }
  </style>
</head>
<body>
  <div class="center">
    <div class="store">${escapeHtml(outletName)}</div>
    ${address ? `<div class="muted">${escapeHtml(address)}</div>` : ''}
    ${phone ? `<div class="muted">${escapeHtml(phone)}</div>` : ''}
  </div>
  <div class="rule mono">${dashLine()}</div>
  <div class="center status">${escapeHtml(status || 'SALE')}</div>
  <div class="mono">${escapeHtml(padRow('Receipt', `#${receiptNo}`))}</div>
  <div class="mono">${escapeHtml(padRow('Date', formatDateTime(data.timestamp)))}</div>
  ${cashierBlock ? `<div class="section">${cashierBlock}</div>` : ''}
  ${customerBlock}
  <div class="mono">${escapeHtml(padRow('Pay', String(data.paymentMethod || 'cash').toUpperCase()))}</div>
  <div class="rule mono">${dashLine()}</div>
  ${itemLines || '<div class="muted">No items</div>'}
  <div class="rule mono">${dashLine('=')}</div>
  ${totals.join('')}
  <div class="rule mono">${dashLine()}</div>
  ${footer}
  <div class="center muted" style="margin-top:8px">*** END OF RECEIPT ***</div>
</body>
</html>`;
}

function cleanupPrintFrame(frame: HTMLIFrameElement) {
  try {
    frame.remove();
  } catch {
    /* ignore */
  }
}

/**
 * Print thermal POS receipt via a hidden iframe (no pop-up).
 * Falls back to a same-tab blob window if iframe print is unavailable.
 */
export function printThermalReceipt(data: ThermalReceiptData): void {
  const html = buildThermalReceiptHtml(data);

  const frame = document.createElement('iframe');
  frame.setAttribute('title', 'Print receipt');
  frame.setAttribute('aria-hidden', 'true');
  Object.assign(frame.style, {
    position: 'fixed',
    left: '0',
    top: '0',
    width: '80mm',
    height: '100vh',
    border: '0',
    opacity: '0',
    pointerEvents: 'none',
    zIndex: '-1',
  });

  document.body.appendChild(frame);

  const doc = frame.contentDocument || frame.contentWindow?.document;
  if (!doc) {
    cleanupPrintFrame(frame);
    // Fallback: blob URL window (still avoid noopener so we keep the handle)
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, '_blank', 'width=360,height=720');
    if (!w) {
      URL.revokeObjectURL(url);
      throw new Error('Unable to open print view. Allow pop-ups for this site and try again.');
    }
    const revoke = () => URL.revokeObjectURL(url);
    w.addEventListener('load', () => {
      try {
        w.focus();
        w.print();
      } finally {
        setTimeout(revoke, 1000);
      }
    });
    // Some browsers won't fire load for blob docs — force print shortly after
    setTimeout(() => {
      try {
        w.focus();
        w.print();
      } catch {
        /* ignore */
      }
    }, 400);
    return;
  }

  doc.open();
  doc.write(html);
  doc.close();

  const win = frame.contentWindow;
  if (!win) {
    cleanupPrintFrame(frame);
    throw new Error('Unable to access print frame.');
  }

  const runPrint = () => {
    try {
      win.focus();
      win.print();
    } finally {
      // Keep frame briefly so the print dialog can read content, then remove
      setTimeout(() => cleanupPrintFrame(frame), 1000);
    }
  };

  // Wait a tick so layout/styles apply before print
  if (typeof win.requestAnimationFrame === 'function') {
    win.requestAnimationFrame(() => setTimeout(runPrint, 50));
  } else {
    setTimeout(runPrint, 100);
  }
}
