import React from 'react';

export type IconComponent = React.FC<{ className?: string }>;

export interface NavItem {
  name: string;
  pageId?: string;
  icon: IconComponent;
  children?: NavItem[];
}

export interface Kpi {
  id: number;
  title: string;
  value: string;
  change: {
    value: string;
    type: 'increase' | 'decrease';
  };
  icon: string;
  color: string;
}

export interface SalesData {
    month: string;
    sales: number;
    purchases: number;
}

export interface Currency {
    code: 'EGP' | 'SAR' | 'USD';
    name: string;
    symbol: string;
    taxRate: number;
}

export interface CurrencySettingsConfig {
    defaultCurrency: 'EGP' | 'SAR' | 'USD';
    currencies: Currency[];
}

export interface DocumentItem {
  id: number; // Frontend-only ID for React keys
  productId?: string; // Actual product ID for the backend
  productName?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  unit?: string;
}

export interface ContactInfo {
  name: string;
  address: string;
  email: string;
  phone: string;
}

interface DocumentTotals {
  subtotal: number;
  tax: {
    rate: number;
    amount: number;
  };
  discount: {
    type: 'percentage' | 'fixed';
    value: number;
    amount: number;
  };
  total: number;
  currency: {
      code: string;
      symbol: string;
  }
}

export interface Quotation extends DocumentTotals {
  id: string;
  status: 'approved' | 'sent' | 'draft';
  date: string;
  expiryDate: string;
  createdAt: string;
  customer: ContactInfo;
  items: DocumentItem[];
  notes?: string;
  terms?: string;
  projectName?: string;
  contactPerson?: string;
}

export interface SalesInvoice extends DocumentTotals {
  id: string;
  customerId: string;
  status: 'paid' | 'unpaid' | 'overdue';
  date: string;
  dueDate: string;
  createdAt: string;
  customer: ContactInfo;
  items: DocumentItem[];
  notes?: string;
  terms?: string;
}

export interface SupplierInvoice extends DocumentTotals {
  id: string;
  supplierId: string;
  supplierInvoiceNumber?: string;
  status: 'paid' | 'unpaid' | 'overdue';
  invoiceDate: string;
  dueDate: string;
  createdAt: string;
  supplier: ContactInfo;
  items: DocumentItem[];
  notes?: string;
  terms?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt?: string;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt?: string;
}

// New type for Receipt Voucher
export interface Receipt {
  id: string;
  status: 'posted' | 'draft';
  date: string;
  createdAt: string;
  customer: ContactInfo;
  total: number;
  paymentMethod: string;
  notes?: string;
  currency: {
    code: string;
    symbol: string;
  };
}

// New type for Payment Voucher
export interface PaymentVoucher {
  id: string;
  status: 'posted' | 'draft';
  date: string;
  createdAt: string;
  supplier: ContactInfo;
  total: number;
  paymentMethod: string;
  notes?: string;
  currency: {
    code: string;
    symbol: string;
  };
}

// New types for Account Statement
export interface AccountStatementEntry {
  date: string;
  transactionId: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface AccountStatement {
  contactId: string;
  contactName: string;
  contactDetails: {
    address: string;
    email: string;
    phone: string;
  };
  statementDate: string;
  openingBalance: number;
  closingBalance: number;
  entries: AccountStatementEntry[];
  currency: {
      code: string;
      symbol: string;
  };
}

// Types for Settings

export interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  unit?: 'No' | 'Tone' | 'Kg' | 'MT';
  averagePurchasePrice: number;
  averageSalePrice: number;
  stockQuantity: number;
  imageUrl: string;
  createdAt: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    status: 'active' | 'inactive';
    avatar: string;
}

export interface Role {
    id: string;
    name: string;
    description: string;
    userCount: number;
}

export interface CompanySettingsConfig {
  systemName: string;
  companyName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
}

export interface QuotationFieldConfig {
    key: 'customerInfo' | 'contactPerson' | 'projectName' | 'quotationNumber' | 'quotationType' | 'date' | 'expiryDate';
    label: string;
    isEnabled: boolean;
}

export interface QuotationSettingsConfig {
    headerImage: string | null;
    footerImage: string | null;
    fields: QuotationFieldConfig[];
    defaultTerms: string;
}

export interface SalesInvoiceFieldConfig {
    key: 'customerInfo' | 'invoiceNumber' | 'invoiceDate' | 'dueDate';
    label: string;
    isEnabled: boolean;
}

export interface SalesInvoiceSettingsConfig {
    headerImage: string | null;
    footerImage: string | null;
    fields: SalesInvoiceFieldConfig[];
    defaultTerms: string;
}

export interface SupplierInvoiceFieldConfig {
    key: 'supplierInfo' | 'supplierInvoiceNumber' | 'invoiceDate' | 'dueDate';
    label: string;
    isEnabled: boolean;
}

export interface SupplierInvoiceSettingsConfig {
    headerImage: string | null;
    footerImage: string | null;
    fields: SupplierInvoiceFieldConfig[];
    defaultTerms: string;
}

export interface ReceiptFieldConfig {
    key: 'customerInfo' | 'receiptNumber' | 'date' | 'paymentMethod' | 'amount' | 'notes';
    label: string;
    isEnabled: boolean;
}

export interface ReceiptSettingsConfig {
    headerImage: string | null;
    footerImage: string | null;
    fields: ReceiptFieldConfig[];
    defaultNotes: string;
}

export interface PaymentVoucherFieldConfig {
    key: 'supplierInfo' | 'voucherNumber' | 'date' | 'paymentMethod' | 'amount' | 'notes';
    label: string;
    isEnabled: boolean;
}

export interface PaymentVoucherSettingsConfig {
    headerImage: string | null;
    footerImage: string | null;
    fields: PaymentVoucherFieldConfig[];
    defaultNotes: string;
}

export interface AccountStatementFieldConfig {
    key: 'contactInfo' | 'statementDate' | 'openingBalance' | 'totalDebit' | 'totalCredit' | 'closingBalance' | 'ourCompanyInfo';
    label: string;
    isEnabled: boolean;
}

export interface AccountStatementSettingsConfig {
    headerImage: string | null;
    footerImage: string | null;
    fields: AccountStatementFieldConfig[];
    defaultNotes: string;
}