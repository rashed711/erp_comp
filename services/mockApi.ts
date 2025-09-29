import { Kpi, SalesData, SalesInvoice, Customer, Supplier, SupplierInvoice, Quotation, AccountStatement, Receipt, PaymentVoucher, User, Role, QuotationSettingsConfig, SalesInvoiceSettingsConfig, SupplierInvoiceSettingsConfig, ReceiptSettingsConfig, PaymentVoucherSettingsConfig, AccountStatementSettingsConfig, CompanySettingsConfig, Product, ContactInfo, CurrencySettingsConfig, Currency, DocumentItem, AccountStatementEntry } from '../types';

export const getDashboardKpis = (currencySymbol: string): Kpi[] => {
  return [
    {
      id: 1,
      title: 'kpi.totalSales',
      value: `${(750000).toLocaleString('en-US')} ${currencySymbol}`,
      change: { value: '12%', type: 'increase' },
      icon: 'ShoppingCartIcon',
      color: 'text-emerald-500'
    },
    {
      id: 2,
      title: 'kpi.netProfit',
      value: `${(120000).toLocaleString('en-US')} ${currencySymbol}`,
      change: { value: '8%', type: 'increase' },
      icon: 'DollarSignIcon',
      color: 'text-green-500'
    },
    {
      id: 3,
      title: 'kpi.newCustomers',
      value: '250',
      change: { value: '5%', type: 'decrease' },
      icon: 'UsersIcon',
      color: 'text-cyan-500'
    },
    {
      id: 4,
      title: 'kpi.productsSold',
      value: '1,200',
      change: { value: '15%', type: 'increase' },
      icon: 'PackageIcon',
      color: 'text-sky-500'
    },
    {
      id: 5,
      title: 'kpi.pendingOrders',
      value: '15',
      change: { value: '3%', type: 'increase' },
      icon: 'ClockIcon',
      color: 'text-amber-500'
    },
    {
      id: 6,
      title: 'kpi.inventoryValue',
      value: `${(1250000).toLocaleString('en-US')} ${currencySymbol}`,
      change: { value: '2%', type: 'decrease' },
      icon: 'PackageIcon',
      color: 'text-orange-500'
    },
    {
      id: 7,
      title: 'kpi.customerSatisfaction',
      value: '92%',
      change: { value: '1.5%', type: 'increase' },
      icon: 'SmileIcon',
      color: 'text-teal-500'
    },
  ];
};

export const getSalesData = (): SalesData[] => {
  return [
    { month: 'month.jan', sales: 4000, purchases: 2400 },
    { month: 'month.feb', sales: 3000, purchases: 1398 },
    { month: 'month.mar', sales: 2000, purchases: 9800 },
    { month: 'month.apr', sales: 2780, purchases: 3908 },
    { month: 'month.may', sales: 1890, purchases: 4800 },
    { month: 'month.jun', sales: 2390, purchases: 3800 },
    { month: 'month.jul', sales: 3490, purchases: 4300 },
  ];
};

const customersData: Customer[] = [
    { id: 'CUST-001', name: 'خالد عبد العزيز', email: 'khalid.a@example.com', phone: '0501234567', address: '123 شارع الملك فهد، الرياض', createdAt: '2024-05-10 02:45 م' },
    { id: 'CUST-002', name: 'فاطمة محمد', email: 'fatima.m@example.com', phone: '0559876543', address: '456 طريق الأمير سلطان، جدة', createdAt: '2024-05-12 10:10 ص' },
    { id: 'CUST-003', name: 'شركة التقنية المبتكرة', email: 'contact@tech-innovate.com', phone: '0112345678', address: '789 برج المملكة، الرياض', createdAt: '2024-06-01 11:00 ص' },
    { id: 'CUST-004', name: 'سارة عبد الله', email: 'sara.a@example.com', phone: '0533445566', address: '101 شارع التحلية، الدمام', createdAt: '2024-06-15 05:00 م' },
    { id: 'CUST-005', name: 'مؤسسة النجاح التجارية', email: 'info@al-najah.com', phone: '0126543210', address: '212 حي الحمراء، جدة', createdAt: '2024-07-02 09:30 ص' },
    { id: 'CUST-006', name: 'شركة المشاريع الحديثة', email: 'contact@modern.sa', phone: '011-234-5678', address: '123 شارع الملك فهد، الرياض', createdAt: '2024-07-20 08:00 ص' },
    { id: 'CUST-007', name: 'مؤسسة البناء المتكامل', email: 'info@binaa.sa', phone: '012-345-6789', address: '456 طريق الملك عبدالله، جدة', createdAt: '2024-07-18 09:00 ص' },
    { id: 'CUST-008', name: 'متجر التكنولوجيا الأول', email: 'sales@techone.com', phone: '011-987-6543', address: '789 برج المملكة، الرياض', createdAt: '2024-07-15 10:00 ص' },
    { id: 'CUST-009', name: 'الخدمات اللوجستية السريعة', email: 'info@fastlog.sa', phone: '013-123-4567', address: '101 شارع التحلية، الدمام', createdAt: '2024-07-12 11:00 ص' },
];
export const getCustomers = (): Customer[] => customersData;

const suppliersData: Supplier[] = [
    { id: 'SUP-001', name: 'الموردون المتحدون', email: 'contact@united-suppliers.com', phone: '011-555-1234', address: 'المنطقة الصناعية، الرياض', createdAt: '2024-01-15 09:00 ص' },
    { id: 'SUP-002', name: 'شركة التجهيزات العالمية', email: 'sales@global-supplies.net', phone: '012-555-5678', address: 'ميناء جدة، جدة', createdAt: '2024-02-20 11:30 ص' },
];
export const getSuppliers = (): Supplier[] => suppliersData;

const productsData: Product[] = [
    { id: 'PROD-001', name: 'لابتوب ديل XPS 15', description: 'لابتوب عالي الأداء بشاشة 4K', category: 'إلكترونيات', unit: 'No', averagePurchasePrice: 4500, averageSalePrice: 5200, stockQuantity: 50, imageUrl: 'https://picsum.photos/seed/laptop/200/200', createdAt: '2024-01-10 10:00 ص' },
    { id: 'PROD-002', name: 'اسمنت مقاوم', description: 'اسمنت بورتلاندي مقاوم للكبريتات', category: 'مواد بناء', unit: 'Tone', averagePurchasePrice: 250, averageSalePrice: 280, stockQuantity: 1000, imageUrl: 'https://picsum.photos/seed/cement/200/200', createdAt: '2024-02-05 03:00 م' },
];
export const getProducts = (): Product[] => productsData;

const currencySettingsData: CurrencySettingsConfig = {
    defaultCurrency: 'EGP',
    currencies: [
        { code: 'SAR', name: 'currency.sarName', symbol: 'currency.sarSymbol', taxRate: 15 },
        { code: 'EGP', name: 'currency.egpName', symbol: 'currency.egpSymbol', taxRate: 14 },
        { code: 'USD', name: 'currency.usdName', symbol: 'currency.usdSymbol', taxRate: 0 },
    ]
};
export const getCurrencySettings = (): CurrencySettingsConfig => currencySettingsData;

const companySettingsData: CompanySettingsConfig = {
    systemName: 'mock.company.systemName.eg',
    companyName: 'mock.company.name.eg',
    address: 'mock.company.address.eg',
    phone: '+20 2 123 4567',
    email: 'info@egy-tech.com',
    website: 'www.egy-tech.com'
};
export const getCompanySettings = (): CompanySettingsConfig => companySettingsData;

const rolesData: Role[] = [
    { id: '1', name: 'mock.roles.admin.name', description: 'mock.roles.admin.description', userCount: 1 },
    { id: '2', name: 'mock.roles.sales.name', description: 'mock.roles.sales.description', userCount: 5 },
    { id: '3', name: 'mock.roles.accountant.name', description: 'mock.roles.accountant.description', userCount: 2 },
];
export const getRoles = (): Role[] => rolesData;

const usersData: User[] = [
    { id: 'USR-001', name: 'أحمد الرئيسي', email: 'ahmed.manager@example.com', role: 'mock.roles.admin.name', status: 'active', avatar: 'https://picsum.photos/seed/user1/128/128' },
    { id: 'USR-002', name: 'محمد الصالح', email: 'mohammed.sales@example.com', role: 'mock.roles.sales.name', status: 'active', avatar: 'https://picsum.photos/seed/user2/128/128' },
    { id: 'USR-003', name: 'علي المحاسب', email: 'ali.acc@example.com', role: 'mock.roles.accountant.name', status: 'inactive', avatar: 'https://picsum.photos/seed/user3/128/128' },
];
export const getUsers = (): User[] => usersData;

const quotationSettingsData: QuotationSettingsConfig = {
    headerImage: 'https://picsum.photos/seed/header/800/150',
    footerImage: 'https://picsum.photos/seed/footer/800/100',
    fields: [
        { key: 'customerInfo', label: 'settings.doc.field.customerInfo', isEnabled: true },
        { key: 'contactPerson', label: 'settings.doc.field.contactPerson', isEnabled: true },
        { key: 'projectName', label: 'settings.doc.field.projectName', isEnabled: true },
        { key: 'quotationNumber', label: 'settings.doc.field.quotationNumber', isEnabled: true },
        { key: 'quotationType', label: 'settings.doc.field.quotationType', isEnabled: false },
        { key: 'date', label: 'settings.doc.field.date', isEnabled: true },
        { key: 'expiryDate', label: 'settings.doc.field.expiryDate', isEnabled: true },
    ],
    defaultTerms: 'settings.doc.defaultTerms.quotation'
};
export const getQuotationSettings = (): QuotationSettingsConfig => quotationSettingsData;

const salesInvoiceSettingsData: SalesInvoiceSettingsConfig = {
    headerImage: 'https://picsum.photos/seed/invheader/800/150',
    footerImage: 'https://picsum.photos/seed/invfooter/800/100',
    fields: [
        { key: 'customerInfo', label: 'settings.doc.field.invoiceTo', isEnabled: true },
        { key: 'invoiceNumber', label: 'settings.doc.field.invoiceNumber', isEnabled: true },
        { key: 'invoiceDate', label: 'settings.doc.field.invoiceDate', isEnabled: true },
        { key: 'dueDate', label: 'settings.doc.field.dueDate', isEnabled: true },
    ],
    defaultTerms: 'settings.doc.defaultTerms.salesInvoice'
};
export const getSalesInvoiceSettings = (): SalesInvoiceSettingsConfig => salesInvoiceSettingsData;

const supplierInvoiceSettingsData: SupplierInvoiceSettingsConfig = {
    headerImage: 'https://picsum.photos/seed/purheader/800/150',
    footerImage: 'https://picsum.photos/seed/purfooter/800/100',
    fields: [
        { key: 'supplierInfo', label: 'settings.doc.field.invoiceFrom', isEnabled: true },
        { key: 'supplierInvoiceNumber', label: 'settings.doc.field.supplierInvoiceNumber', isEnabled: true },
        { key: 'invoiceDate', label: 'settings.doc.field.invoiceDate', isEnabled: true },
        { key: 'dueDate', label: 'settings.doc.field.dueDate', isEnabled: true },
    ],
    defaultTerms: 'settings.doc.defaultTerms.supplierInvoice'
};
export const getSupplierInvoiceSettings = (): SupplierInvoiceSettingsConfig => supplierInvoiceSettingsData;

const receiptSettingsData: ReceiptSettingsConfig = {
    headerImage: 'https://picsum.photos/seed/recheader/800/150',
    footerImage: 'https://picsum.photos/seed/recfooter/800/100',
    fields: [
        { key: 'customerInfo', label: 'settings.doc.field.receivedFrom', isEnabled: true },
        { key: 'receiptNumber', label: 'settings.doc.field.receiptNumber', isEnabled: true },
        { key: 'date', label: 'settings.doc.field.date', isEnabled: true },
        { key: 'paymentMethod', label: 'settings.doc.field.paymentMethod', isEnabled: true },
        { key: 'amount', label: 'settings.doc.field.amount', isEnabled: true },
        { key: 'notes', label: 'settings.doc.field.description', isEnabled: true },
    ],
    defaultNotes: 'settings.doc.defaultNotes.receipt'
};
export const getReceiptSettings = (): ReceiptSettingsConfig => receiptSettingsData;

const paymentVoucherSettingsData: PaymentVoucherSettingsConfig = {
    headerImage: 'https://picsum.photos/seed/payheader/800/150',
    footerImage: 'https://picsum.photos/seed/payfooter/800/100',
    fields: [
        { key: 'supplierInfo', label: 'settings.doc.field.paidTo', isEnabled: true },
        { key: 'voucherNumber', label: 'settings.doc.field.voucherNumber', isEnabled: true },
        { key: 'date', label: 'settings.doc.field.date', isEnabled: true },
        { key: 'paymentMethod', label: 'settings.doc.field.paymentMethod', isEnabled: true },
        { key: 'amount', label: 'settings.doc.field.amount', isEnabled: true },
        { key: 'notes', label: 'settings.doc.field.description', isEnabled: true },
    ],
    defaultNotes: 'settings.doc.defaultNotes.payment'
};
export const getPaymentVoucherSettings = (): PaymentVoucherSettingsConfig => paymentVoucherSettingsData;

const customerAccountStatementSettingsData: AccountStatementSettingsConfig = {
    headerImage: 'https://picsum.photos/seed/custstmt-header/800/150',
    footerImage: 'https://picsum.photos/seed/custstmt-footer/800/100',
    fields: [
        { key: 'contactInfo', label: 'settings.doc.field.customerData', isEnabled: true },
        { key: 'statementDate', label: 'settings.doc.field.statementDate', isEnabled: true },
        { key: 'openingBalance', label: 'settings.doc.field.openingBalance', isEnabled: true },
        { key: 'totalDebit', label: 'settings.doc.field.totalDebit', isEnabled: true },
        { key: 'totalCredit', label: 'settings.doc.field.totalCredit', isEnabled: true },
        { key: 'closingBalance', label: 'settings.doc.field.closingBalance', isEnabled: true },
        { key: 'ourCompanyInfo', label: 'settings.doc.field.companyData', isEnabled: true },
    ],
    defaultNotes: 'settings.doc.defaultNotes.customerStatement'
};
export const getCustomerAccountStatementSettings = (): AccountStatementSettingsConfig => customerAccountStatementSettingsData;

const supplierAccountStatementSettingsData: AccountStatementSettingsConfig = {
    headerImage: 'https://picsum.photos/seed/supstmt-header/800/150',
    footerImage: 'https://picsum.photos/seed/supstmt-footer/800/100',
    fields: [
        { key: 'contactInfo', label: 'settings.doc.field.supplierData', isEnabled: true },
        { key: 'statementDate', label: 'settings.doc.field.statementDate', isEnabled: true },
        { key: 'openingBalance', label: 'settings.doc.field.openingBalance', isEnabled: true },
        { key: 'totalDebit', label: 'settings.doc.field.totalDebitSupplier', isEnabled: true },
        { key: 'totalCredit', label: 'settings.doc.field.totalCredit', isEnabled: true },
        { key: 'closingBalance', label: 'settings.doc.field.closingBalance', isEnabled: true },
        { key: 'ourCompanyInfo', label: 'settings.doc.field.companyData', isEnabled: true },
    ],
    defaultNotes: 'settings.doc.defaultNotes.supplierStatement'
};
export const getSupplierAccountStatementSettings = (): AccountStatementSettingsConfig => supplierAccountStatementSettingsData;

// Mock Data for individual items and lists
const quotationsData: Quotation[] = [
    {
        id: 'Q-2024-001', status: 'sent', date: '2024-07-20', expiryDate: '2024-08-19', createdAt: '2024-07-20 10:00 ص',
        customer: customersData[0],
        items: [{ id: 1, productId: 'PROD-001', description: 'لابتوب ديل XPS 15', quantity: 2, unitPrice: 5200, total: 10400, unit: 'No' }],
        subtotal: 10400,
        tax: { rate: 15, amount: 1560 },
        discount: { type: 'fixed', value: 0, amount: 0 },
        total: 11960,
        currency: { code: 'SAR', symbol: 'currency.sarSymbol' },
        projectName: 'تحديث أجهزة الشركة',
        contactPerson: 'أحمد',
    }
];
export const getQuotationById = (id: string): Quotation | undefined => quotationsData.find(q => q.id === id);

const salesInvoicesData: SalesInvoice[] = [
    {
        id: 'INV-2024-001', customerId: 'CUST-001', status: 'unpaid', date: '2024-07-22', dueDate: '2024-08-21', createdAt: '2024-07-22 11:00 ص',
        customer: customersData[0],
        items: [{ id: 1, productId: 'PROD-001', description: 'لابتوب ديل XPS 15', quantity: 2, unitPrice: 5200, total: 10400, unit: 'No' }],
        subtotal: 10400, tax: { rate: 15, amount: 1560 }, discount: { type: 'fixed', value: 0, amount: 0 }, total: 11960, currency: { code: 'SAR', symbol: 'currency.sarSymbol' }
    }
];
export const getSalesInvoiceById = (id: string): SalesInvoice | undefined => salesInvoicesData.find(i => i.id === id);

const supplierInvoicesData: SupplierInvoice[] = [
    {
        id: 'INV-S-2024-001', supplierId: 'SUP-001', supplierInvoiceNumber: 'SI-5566', status: 'paid', invoiceDate: '2024-07-15', dueDate: '2024-08-14', createdAt: '2024-07-15 02:00 م',
        supplier: suppliersData[0],
        items: [{ id: 1, productId: 'PROD-001', description: 'لابتوب ديل XPS 15', quantity: 10, unitPrice: 4500, total: 45000, unit: 'No' }],
        subtotal: 45000, tax: { rate: 15, amount: 6750 }, discount: { type: 'fixed', value: 0, amount: 0 }, total: 51750, currency: { code: 'SAR', symbol: 'currency.sarSymbol' }
    }
];
export const getSupplierInvoiceById = (id: string): SupplierInvoice | undefined => supplierInvoicesData.find(i => i.id === id);

const receiptsData: Receipt[] = [
    { id: 'REC-2024-001', status: 'posted', date: '2024-07-25', createdAt: '2024-07-25 01:00 م', customer: customersData[0], total: 5000, paymentMethod: 'تحويل بنكي', currency: { code: 'SAR', symbol: 'currency.sarSymbol' } }
];
export const getReceiptById = (id: string): Receipt | undefined => receiptsData.find(r => r.id === id);

const paymentVouchersData: PaymentVoucher[] = [
    { id: 'PAY-2024-001', status: 'posted', date: '2024-07-26', createdAt: '2024-07-26 03:00 م', supplier: suppliersData[0], total: 51750, paymentMethod: 'تحويل بنكي', currency: { code: 'SAR', symbol: 'currency.sarSymbol' } }
];
export const getPaymentVoucherById = (id: string): PaymentVoucher | undefined => paymentVouchersData.find(v => v.id === id);

export const getCustomerAccountStatement = (customerId: string): AccountStatement | undefined => {
    const customer = customersData.find(c => c.id === customerId);
    if (!customer) return undefined;
    return {
        contactId: customerId, contactName: customer.name, contactDetails: { address: customer.address, email: customer.email, phone: customer.phone }, statementDate: new Date().toISOString().split('T')[0],
        openingBalance: 1000, closingBalance: 7960,
        entries: [
            { date: '2024-07-22', transactionId: 'INV-2024-001', description: 'فاتورة مبيعات', debit: 11960, credit: 0, balance: 12960 },
            { date: '2024-07-25', transactionId: 'REC-2024-001', description: 'سند قبض', debit: 0, credit: 5000, balance: 7960 },
        ],
        currency: { code: 'SAR', symbol: 'currency.sarSymbol' }
    }
};

export const getSupplierAccountStatement = (supplierId: string): AccountStatement | undefined => {
    const supplier = suppliersData.find(c => c.id === supplierId);
    if (!supplier) return undefined;
    return {
        contactId: supplierId, contactName: supplier.name, contactDetails: { address: supplier.address, email: supplier.email, phone: supplier.phone }, statementDate: new Date().toISOString().split('T')[0],
        openingBalance: 0, closingBalance: 0,
        entries: [
            { date: '2024-07-15', transactionId: 'INV-S-2024-001', description: 'فاتورة مشتريات', debit: 51750, credit: 0, balance: 51750 },
            { date: '2024-07-26', transactionId: 'PAY-2024-001', description: 'سند صرف', debit: 0, credit: 51750, balance: 0 },
        ],
        currency: { code: 'SAR', symbol: 'currency.sarSymbol' }
    }
};