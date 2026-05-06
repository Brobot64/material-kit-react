export interface BusinessSettings {
  _id?: string;
  businessId: string;
  displayName?: string;
  logoUrl?: string;
  faviconUrl?: string;
  brandPrimaryColor: string;
  brandSecondaryColor: string;
  posWelcomeMessage?: string;
  timezone: string;
  currency: string;
  currencySymbol: string;
  defaultOutletId?: string;
  features: {
    enableBarcode: boolean;
    enableReceiptPrinting: boolean;
    enableLowStockAlerts: boolean;
    lowStockThreshold: number;
  };
}

export interface ReceiptTemplate {
  _id?: string;
  businessId: string;
  outletId?: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  watermarkText?: string;
  headerText?: string;
  footerText?: string;
  showBarcode: boolean;
  showTaxBreakdown: boolean;
  sections: {
    showCustomerInfo: boolean;
    showSaleNumber: boolean;
    showCashierName: boolean;
    showItemCosts: boolean;
  };
}
