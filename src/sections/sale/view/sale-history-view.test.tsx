import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { it, vi, expect, describe, beforeEach } from 'vitest';
// @ts-ignore
import { render, screen, waitFor } from '@testing-library/react';

import { api } from 'src/services/api';
import { ThemeProvider } from 'src/theme';
import { AuthProvider } from 'src/contexts/auth-context';

import { SaleHistoryView } from './sale-history-view';

// Mock the api module
vi.mock('src/services/api', () => ({
  api: {
    getSalesHistory: vi.fn(),
    addSalePayment: vi.fn(),
  },
}));

// Mock the auth context
vi.mock('src/contexts/auth-context', async () => {
  const actual = await vi.importActual('src/contexts/auth-context');
  return {
    ...actual,
    useAuth: () => ({
      outlets: [{ _id: '1', name: 'Main Outlet' }],
    }),
  };
});

const mockSales = {
  data: [
    {
      _id: '69a158f2d55e565d65e2c307',
      businessId: '69628a1cae0d0cf6477cf660',
      outletId: '1',
      cashierId: '69a158f2d55e565d65e2c306',
      subtotal: 3700000,
      discountTotal: 0,
      taxTotal: 0,
      total: 3700000,
      amountPaid: 3700000,
      amountPending: 0,
      paymentMethod: 'cash',
      status: 'completed',
      isReturn: false,
      notes: '',
      createdAt: '2026-02-27T08:42:26.415Z',
      updatedAt: '2026-02-27T08:42:26.415Z',
      __v: 0,
    },
  ],
  pagination: {
    page: 1,
    limit: 10,
    total: 20, // Example total
    totalPages: 2,
    hasNextPage: true,
    hasPrevPage: false,
  },
};

describe('SaleHistoryView', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  it('fetches sales and renders them correctly (completed status)', async () => {
    // @ts-expect-error: 'description'
    api.getSalesHistory.mockResolvedValue(mockSales);

    render(
      <MemoryRouter>
        <ThemeProvider>
          <AuthProvider>
            <SaleHistoryView />
          </AuthProvider>
        </ThemeProvider>
      </MemoryRouter>
    );

    // Check for loading state
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Wait for the API call to resolve and the component to re-render
    await waitFor(() => {
      expect(api.getSalesHistory).toHaveBeenCalledWith({ outletId: '1', page: 1, limit: 10 });
    });

    // Check if the sales data is rendered
    expect(screen.getByText('E2C307')).toBeInTheDocument(); // Sale ID
    expect(screen.getByText('$3,700,000.00')).toBeInTheDocument(); // Total
    expect(screen.getByText('COMPLETED')).toBeInTheDocument(); // Status
  });

  it('renders partially paid status correctly', async () => {
    const partiallyPaidSale = {
      ...mockSales.data[0],
      _id: '69a158f2d55e565d65e2c308',
      total: 3700000,
      amountPaid: 1000000,
      status: 'pending', // Backend status, should be overridden by client logic
    };
    // @ts-expect-error: 'description'
    api.getSalesHistory.mockResolvedValue({ data: [partiallyPaidSale], pagination: { total: 1, page: 1, limit: 10 } });

    render(
      <MemoryRouter>
        <ThemeProvider>
          <AuthProvider>
            <SaleHistoryView />
          </AuthProvider>
        </ThemeProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('PARTIALLY PAID')).toBeInTheDocument();
      expect(screen.getByText('$2,700,000.00')).toBeInTheDocument(); // Balance
    });
  });

  it('renders not paid status correctly', async () => {
    const notPaidSale = {
      ...mockSales.data[0],
      _id: '69a158f2d55e565d65e2c309',
      total: 3700000,
      amountPaid: 0,
      status: 'pending', // Backend status, should be overridden by client logic
    };
    // @ts-expect-error: 'description'
    api.getSalesHistory.mockResolvedValue({ data: [notPaidSale], pagination: { total: 1, page: 1, limit: 10 } });

    render(
      <MemoryRouter>
        <ThemeProvider>
          <AuthProvider>
            <SaleHistoryView />
          </AuthProvider>
        </ThemeProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('NOT PAID')).toBeInTheDocument();
      expect(screen.getByText('$3,700,000.00')).toBeInTheDocument(); // Balance
    });
  });

  it('shows "No sales found" message when there are no sales', async () => {
    // @ts-expect-error: 'description'
    api.getSalesHistory.mockResolvedValue({ data: [], pagination: { total: 0, page: 1, limit: 10 } });

    render(
      <MemoryRouter>
        <ThemeProvider>
          <AuthProvider>
            <SaleHistoryView />
          </AuthProvider>
        </ThemeProvider>
      </MemoryRouter>
    );

    // Wait for the API call to resolve and the component to re-render
    await waitFor(() => {
      expect(screen.getByText('No sales found')).toBeInTheDocument();
    });
  });

  it('handles API fetch error', async () => {
    // @ts-expect-error: 'description'
    api.getSalesHistory.mockRejectedValue(new Error('Failed to fetch'));

    render(
      <MemoryRouter>
        <ThemeProvider>
          <AuthProvider>
            <SaleHistoryView />
          </AuthProvider>
        </ThemeProvider>
      </MemoryRouter>
    );

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch sales history')).toBeInTheDocument();
    });
  });

  it('opens and closes the sale details modal', async () => {
    // @ts-expect-error: 'description'
    api.getSalesHistory.mockResolvedValue(mockSales);

    render(
      <MemoryRouter>
        <ThemeProvider>
          <AuthProvider>
            <SaleHistoryView />
          </AuthProvider>
        </ThemeProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('E2C307')).toBeInTheDocument();
    });

    // Open details modal (button now has aria-label 'view details')
    const eyeButton = screen.getByRole('button', { name: /view details/i });
    await userEvent.click(eyeButton);

    expect(screen.getByText(/Sale Details #E2C307/i)).toBeInTheDocument();

    // Close details modal
    const closeButton = screen.getByRole('button', { name: /close/i });
    await userEvent.click(closeButton);

    expect(screen.queryByText(/Sale Details #E2C307/i)).not.toBeInTheDocument();
  });

  it('opens payment modal from sale details modal if balance is not zero', async () => {
    const notFullyPaidSale = {
      ...mockSales.data[0],
      _id: '69a158f2d55e565d65e2c310',
      total: 3700000,
      amountPaid: 1000000,
    };
    // @ts-expect-error: 'description'
    api.getSalesHistory.mockResolvedValue({ data: [notFullyPaidSale], pagination: { total: 1, page: 1, limit: 10 } });

    render(
      <MemoryRouter>
        <ThemeProvider>
          <AuthProvider>
            <SaleHistoryView />
          </AuthProvider>
        </ThemeProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('E2C310')).toBeInTheDocument();
    });

    // Open details modal
    const eyeButton = screen.getByRole('button', { name: /view details/i });
    await userEvent.click(eyeButton);

    expect(screen.getByText(/Sale Details #E2C310/i)).toBeInTheDocument();

    // Click "Complete Payment" button
    const completePaymentButton = screen.getByRole('button', { name: /complete payment/i });
    await userEvent.click(completePaymentButton);

    // Verify payment modal is open
    expect(screen.getByText(/Record Payment/i)).toBeInTheDocument();
    expect(screen.queryByText(/Sale Details #E2C310/i)).not.toBeInTheDocument(); // Details modal should be closed
  });

  it('opens payment modal directly from row when clicking Pay button', async () => {
    const partialSale = {
      ...mockSales.data[0],
      _id: '69a158f2d55e565d65e2c311',
      total: 500000,
      amountPaid: 100000,
    };
    // @ts-expect-error: 'description'
    api.getSalesHistory.mockResolvedValue({ data: [partialSale], pagination: { total: 1, page: 1, limit: 10 } });

    render(
      <MemoryRouter>
        <ThemeProvider>
          <AuthProvider>
            <SaleHistoryView />
          </AuthProvider>
        </ThemeProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('E2C311')).toBeInTheDocument();
    });

    // Click the Pay button in the table row
    const payButton = screen.getByRole('button', { name: /pay/i });
    await userEvent.click(payButton);

    // The payment modal should appear
    expect(screen.getByText(/Record Payment/i)).toBeInTheDocument();
  });

  it('submits payment through API and closes modal', async () => {
    const partialSale = {
      ...mockSales.data[0],
      _id: '69a158f2d55e565d65e2c312',
      total: 1000,
      amountPaid: 0,
    };
    // @ts-expect-error: 'description'
    api.getSalesHistory.mockResolvedValue({ data: [partialSale], pagination: { total: 1, page: 1, limit: 10 } });
    // @ts-expect-error: 'description'
    api.addSalePayment.mockResolvedValue({});

    render(
      <MemoryRouter>
        <ThemeProvider>
          <AuthProvider>
            <SaleHistoryView />
          </AuthProvider>
        </ThemeProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('E2C312')).toBeInTheDocument();
    });

    const payButton = screen.getByRole('button', { name: /pay/i });
    await userEvent.click(payButton);

    // Enter a payment amount
    const amountInput = screen.getByLabelText(/Amount/i);
    await userEvent.clear(amountInput);
    await userEvent.type(amountInput, '1000');

    const recordButton = screen.getByRole('button', { name: /Record Payment/i });
    await userEvent.click(recordButton);

    await waitFor(() => {
      expect(api.addSalePayment).toHaveBeenCalledWith(partialSale._id, expect.objectContaining({ amount: 1000 }));
      expect(screen.queryByText(/Record Payment/i)).not.toBeInTheDocument(); // modal should close
    });
  });

  it('navigates to next page correctly', async () => {
    const mockSalesPage1 = {
      data: [{ ...mockSales.data[0], _id: 'page1sale1' }],
      pagination: { total: 20, page: 1, limit: 10, totalPages: 2, hasNextPage: true, hasPrevPage: false },
    };
    const mockSalesPage2 = {
      data: [{ ...mockSales.data[0], _id: 'page2sale1' }],
      pagination: { total: 20, page: 2, limit: 10, totalPages: 2, hasNextPage: false, hasPrevPage: true },
    };

    // @ts-expect-error: 'description'
    api.getSalesHistory.mockResolvedValueOnce(mockSalesPage1);

    render(
      <MemoryRouter>
        <ThemeProvider>
          <AuthProvider>
            <SaleHistoryView />
          </AuthProvider>
        </ThemeProvider>
      </MemoryRouter>
    );

    // Wait for initial render and data from page 1
    await waitFor(() => {
      expect(screen.getByText('page1sale1'.slice(-6).toUpperCase())).toBeInTheDocument();
      expect(api.getSalesHistory).toHaveBeenCalledWith({ outletId: '1', page: 1, limit: 10 });
    });

    // Mock fetch for page 2
    // @ts-expect-error: 'description'
    api.getSalesHistory.mockResolvedValueOnce(mockSalesPage2);

    // Click next page button
    const nextPageButton = screen.getByRole('button', { name: /Next page/i });
    await userEvent.click(nextPageButton);

    // Expect API to be called for page 2 and data to update
    await waitFor(() => {
      expect(screen.getByText('page2sale1'.slice(-6).toUpperCase())).toBeInTheDocument();
      expect(api.getSalesHistory).toHaveBeenCalledWith({ outletId: '1', page: 2, limit: 10 });
    });
  });

  it('changes rows per page correctly', async () => {
    const mockSalesLimit5 = {
      data: Array.from({ length: 5 }, (_, i) => ({ ...mockSales.data[0], _id: `limit5sale${i}` })),
      pagination: { total: 10, page: 1, limit: 5, totalPages: 2, hasNextPage: true, hasPrevPage: false },
    };

    // Initial fetch
    // @ts-expect-error: 'description'
    api.getSalesHistory.mockResolvedValueOnce(mockSalesLimit5);

    render(
      <MemoryRouter>
        <ThemeProvider>
          <AuthProvider>
            <SaleHistoryView />
          </AuthProvider>
        </ThemeProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(api.getSalesHistory).toHaveBeenCalledWith({ outletId: '1', page: 1, limit: 10 }); // Initial call with default limit
    });

    // Change rows per page to 5
    // @ts-expect-error: 'description'
    api.getSalesHistory.mockResolvedValueOnce(mockSalesLimit5);
    const rowsPerPageSelect = screen.getByRole('combobox', { name: /Rows per page:/i });
    await userEvent.click(rowsPerPageSelect);
    await userEvent.click(screen.getByRole('option', { name: '5' }));

    await waitFor(() => {
      expect(api.getSalesHistory).toHaveBeenCalledWith({ outletId: '1', page: 1, limit: 5 }); // Page should reset to 1 (0-indexed)
      expect(screen.getByText('limit5sale0'.slice(-6).toUpperCase())).toBeInTheDocument();
      expect(screen.queryByText('limit5sale6'.slice(-6).toUpperCase())).not.toBeInTheDocument(); // Should not see elements beyond new limit
    });
  });
});
