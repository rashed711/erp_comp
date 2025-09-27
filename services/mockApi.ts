import { Kpi, SalesData, SalesInvoice, Customer, Supplier, SupplierInvoice, Quotation, AccountStatement, Receipt, PaymentVoucher, User, Role, QuotationSettingsConfig, SalesInvoiceSettingsConfig, SupplierInvoiceSettingsConfig, ReceiptSettingsConfig, PaymentVoucherSettingsConfig, AccountStatementSettingsConfig, CompanySettingsConfig, Product, ContactInfo } from '../types';

export const getDashboardKpis = (): Kpi[] => {
  return [
    {
      id: 1,
      title: 'إجمالي المبيعات',
      value: '750,000 ريال',
      change: { value: '12%', type: 'increase' },
      icon: 'ShoppingCartIcon',
      color: 'text-emerald-500'
    },
    {
      id: 2,
      title: 'الأرباح الصافية',
      value: '120,000 ريال',
      change: { value: '8%', type: 'increase' },
      icon: 'DollarSignIcon',
      color: 'text-green-500'
    },
    {
      id: 3,
      title: 'عملاء جدد',
      value: '250',
      change: { value: '5%', type: 'decrease' },
      icon: 'UsersIcon',
      color: 'text-cyan-500'
    },
    {
      id: 4,
      title: 'المنتجات المباعة',
      value: '1,200',
      change: { value: '15%', type: 'increase' },
      icon: 'PackageIcon',
      color: 'text-sky-500'
    },
    {
      id: 5,
      title: 'طلبات قيد الإنتظار',
      value: '15',
      change: { value: '3%', type: 'increase' },
      icon: 'ClockIcon',
      color: 'text-amber-500'
    },
    {
      id: 6,
      title: 'قيمة المخزون',
      value: '1,250,000 ريال',
      change: { value: '2%', type: 'decrease' },
      icon: 'PackageIcon',
      color: 'text-orange-500'
    },
    {
      id: 7,
      title: 'رضا العملاء',
      value: '92%',
      change: { value: '1.5%', type: 'increase' },
      icon: 'SmileIcon',
      color: 'text-teal-500'
    },
  ];
};

export const getSalesData = (): SalesData[] => {
  return [
    { month: 'يناير', sales: 4000, purchases: 2400 },
    { month: 'فبراير', sales: 3000, purchases: 1398 },
    { month: 'مارس', sales: 2000, purchases: 9800 },
    { month: 'أبريل', sales: 2780, purchases: 3908 },
    { month: 'مايو', sales: 1890, purchases: 4800 },
    { month: 'يونيو', sales: 2390, purchases: 3800 },
    { month: 'يوليو', sales: 3490, purchases: 4300 },
  ];
};

const customersData: Customer[] = [
  { id: 'CUST-001', name: 'خالد عبد العزيز', email: 'khalid.a@example.com', phone: '0501234567', address: '123 شارع الملك فهد، الرياض', createdAt: '2024-05-10 02:45 م' },
  { id: 'CUST-002', name: 'فاطمة محمد', email: 'fatima.m@example.com', phone: '0559876543', address: '456 طريق الأمير سلطان، جدة', createdAt: '2024-05-12 10:10 ص' },
  { id: 'CUST-003', name: 'شركة التقنية المبتكرة', email: 'contact@tech-innovate.com', phone: '0112345678', address: '789 برج المملكة، الرياض', createdAt: '2024-06-01 11:00 ص' },
  { id: 'CUST-004', name: 'سارة عبد الله', email: 'sara.a@example.com', phone: '0533445566', address: '101 شارع التحلية، الدمام', createdAt: '2024-06-15 05:00 م' },
  { id: 'CUST-005', name: 'مؤسسة النجاح التجارية', email: 'info@al-najah.com', phone: '0126543210', address: '212 حي الحمراء، جدة', createdAt: '2024-07-02 09:30 ص' },
  // Customers from invoices/quotations to ensure data consistency
  { id: 'CUST-006', name: 'شركة المشاريع الحديثة', email: 'contact@modern.sa', phone: '011-234-5678', address: '123 شارع الملك فهد، الرياض', createdAt: '2024-07-20 08:00 ص' },
  { id: 'CUST-007', name: 'مؤسسة البناء المتكامل', email: 'info@binaa.sa', phone: '012-345-6789', address: '456 طريق الملك عبدالله، جدة', createdAt: '2024-07-18 09:00 ص' },
  { id: 'CUST-008', name: 'متجر التكنولوجيا الأول', email: 'sales@techone.com', phone: '011-987-6543', address: '789 برج المملكة، الرياض', createdAt: '2024-07-15 10:00 ص' },
  { id: 'CUST-009', name: 'الخدمات اللوجستية السريعة', email: 'info@fastlog.sa', phone: '013-123-4567', address: '101 شارع التحلية، الدمام', createdAt: '2024-07-12 11:00 ص' },
  { id: 'CUST-010', name: 'شركة الأغذية الصحية', email: 'contact@healthyfoods.sa', phone: '012-987-6543', address: '213 شارع الأمير سلطان، جدة', createdAt: '2024-07-10 12:00 م' },
];

const suppliersData: Supplier[] = [
  { id: 'SUP-001', name: 'شركة التوريدات العالمية', email: 'sales@global-supplies.com', phone: '011-555-1234', address: 'المنطقة الصناعية، الرياض', createdAt: '2024-04-15 08:00 ص' },
  { id: 'SUP-002', name: 'مجموعة الصناعات المتقدمة', email: 'info@adv-industries.com', phone: '012-555-5678', address: 'المدينة الصناعية الثانية، جدة', createdAt: '2024-04-20 12:20 م' },
  { id: 'SUP-003', name: 'الموردون المتحدون', email: 'contact@united-suppliers.net', phone: '013-555-8765', address: 'طريق الميناء، الدمام', createdAt: '2024-05-01 10:15 ص' },
  { id: 'SUP-004', name: 'شركة الحلول التقنية', email: 'support@tech-solutions.sa', phone: '011-555-4321', address: 'وادي التقنية، الرياض', createdAt: '2024-05-05 03:00 م' },
  { id: 'SUP-005', name: 'مؤسسة المواد الخام', email: 'orders@raw-materials.co', phone: '014-555-9900', address: 'ينبع الصناعية', createdAt: '2024-06-10 11:45 ص' },
];

const salesInvoices: SalesInvoice[] = [
  { id: 'INV-2024-001', customerId: 'CUST-006', customer: { name: 'شركة المشاريع الحديثة', address: '123 شارع الملك فهد، الرياض', email: 'contact@modern.sa', phone: '011-234-5678' }, date: '2024-07-20', dueDate: '2024-08-19', total: 17250, status: 'unpaid', createdAt: '2024-07-20 09:15 ص', items: [{id: 1, description: 'استشارات إدارية', quantity: 15, unitPrice: 1000, total: 15000}], subtotal: 15000, tax: {rate: 15, amount: 2250}, discount: {type: 'fixed', value: 0, amount: 0}, terms: 'الدفع خلال 30 يوم.' },
  { id: 'INV-2024-002', customerId: 'CUST-007', customer: { name: 'مؤسسة البناء المتكامل', address: '456 طريق الملك عبدالله، جدة', email: 'info@binaa.sa', phone: '012-345-6789' }, date: '2024-07-18', dueDate: '2024-07-18', total: 8500, status: 'paid', createdAt: '2024-07-18 11:30 ص', items: [{id: 1, description: 'مواد بناء متنوعة', quantity: 1, unitPrice: 8500, total: 8500}], subtotal: 8500, tax: {rate: 0, amount: 0}, discount: {type: 'fixed', value: 0, amount: 0} },
  { id: 'INV-2024-003', customerId: 'CUST-008', customer: { name: 'متجر التكنولوجيا الأول', address: '789 برج المملكة، الرياض', email: 'sales@techone.com', phone: '011-987-6543' }, date: '2024-07-15', dueDate: '2024-07-30', total: 25300, status: 'overdue', createdAt: '2024-07-15 04:00 م', items: [{id: 1, description: 'أجهزة حاسوب محمولة', quantity: 2, unitPrice: 11000, total: 22000}], subtotal: 22000, tax: {rate: 15, amount: 3300}, discount: {type: 'fixed', value: 0, amount: 0} },
  { id: 'INV-2024-004', customerId: 'CUST-009', customer: { name: 'الخدمات اللوجستية السريعة', address: '101 شارع التحلية، الدمام', email: 'info@fastlog.sa', phone: '013-123-4567' }, date: '2024-07-12', dueDate: '2024-07-12', total: 5000, status: 'paid', createdAt: '2024-07-12 10:00 ص', items: [{id: 1, description: 'خدمات شحن', quantity: 10, unitPrice: 500, total: 5000}], subtotal: 5000, tax: {rate: 0, amount: 0}, discount: {type: 'fixed', value: 0, amount: 0} },
  { id: 'INV-2024-005', customerId: 'CUST-010', customer: { name: 'شركة الأغذية الصحية', address: '213 شارع الأمير سلطان، جدة', email: 'contact@healthyfoods.sa', phone: '012-987-6543' }, date: '2024-07-10', dueDate: '2024-08-09', total: 14375, status: 'unpaid', createdAt: '2024-07-10 01:20 م', items: [{id: 1, description: 'منتجات عضوية', quantity: 1, unitPrice: 12500, total: 12500}], subtotal: 12500, tax: {rate: 15, amount: 1875}, discount: {type: 'fixed', value: 0, amount: 0} },
];

let quotations: Quotation[] = [
  { 
    id: 'QT-2024-001', 
    customer: { name: 'شركة المشاريع الحديثة', address: '123 شارع الملك فهد، الرياض', email: 'contact@modern.sa', phone: '011-234-5678' },
    date: '2024-07-22',
    expiryDate: '2024-08-21', 
    status: 'sent',
    createdAt: '2024-07-22 11:00 ص',
    projectName: 'تطوير النظام المالي',
    contactPerson: 'أ. خالد الغامدي',
    items: [
      { id: 1, description: 'تصميم وتطوير موقع إلكتروني', quantity: 1, unitPrice: 18000, total: 18000 },
      { id: 2, description: 'خدمات استضافة لمدة عام', quantity: 1, unitPrice: 2000, total: 2000 },
      { id: 3, description: 'تصميم شعار وهوية بصرية', quantity: 1, unitPrice: 5000, total: 5000 },
    ],
    subtotal: 25000,
    tax: { rate: 15, amount: 3750 },
    discount: { type: 'fixed', value: 0, amount: 0 },
    total: 28750,
    terms: 'يتم دفع 50% مقدماً والباقي عند التسليم. العرض سارٍ لمدة 30 يوماً.',
  },
  { 
    id: 'QT-2024-002', 
    customer: { name: 'متجر التكنولوجيا الأول', address: '789 برج المملكة، الرياض', email: 'sales@techone.com', phone: '011-987-6543' },
    date: '2024-07-21', 
    expiryDate: '2024-08-20',
    status: 'approved',
    createdAt: '2024-07-21 02:30 م',
    projectName: 'توريد أجهزة مكتبية',
    contactPerson: 'أ. سارة الحسن',
    items: [
      { id: 1, description: 'جهاز لابتوب Dell XPS 15', quantity: 5, unitPrice: 8000, total: 40000 },
      { id: 2, description: 'حقيبة لابتوب فاخرة', quantity: 5, unitPrice: 300, total: 1500 },
    ],
    subtotal: 41500,
    tax: { rate: 15, amount: 6225 },
    discount: { type: 'percentage', value: 5, amount: 2075 },
    total: 45650,
    notes: 'سيتم تسليم الأجهزة خلال 3 أيام عمل.',
    terms: 'الدفع عند الاستلام. ضمان لمدة عامين على الأجهزة.',
  },
  { 
    id: 'QT-2024-003', 
    customer: { name: 'الخدمات اللوجستية السريعة', address: '101 شارع التحلية، الدمام', email: 'info@fastlog.sa', phone: '013-123-4567' },
    date: '2024-07-20', 
    expiryDate: '2024-08-19',
    status: 'draft',
    createdAt: '2024-07-20 09:45 ص',
    projectName: 'عقد صيانة سنوي',
    contactPerson: 'مدير العمليات',
    items: [
      { id: 1, description: 'اشتراك سنوي في نظام تتبع الشحنات', quantity: 1, unitPrice: 9000, total: 9000 },
    ],
    subtotal: 9000,
    tax: { rate: 15, amount: 1350 },
    discount: { type: 'fixed', value: 0, amount: 0 },
    total: 10350,
  },
];

const supplierInvoices: SupplierInvoice[] = [
  { id: 'INV-S-2024-001', supplierId: 'SUP-001', supplier: { name: 'شركة التوريدات العالمية', address: 'المنطقة الصناعية، الرياض', email: 'sales@global-supplies.com', phone: '011-555-1234' }, invoiceDate: '2024-07-19', dueDate: '2024-08-18', total: 8625, status: 'unpaid', createdAt: '2024-07-19 03:20 م', items: [{id: 1, description: 'مواد خام - دفعة يوليو', quantity: 1, unitPrice: 7500, total: 7500}], subtotal: 7500, tax: {rate: 15, amount: 1125}, discount: {type: 'fixed', value: 0, amount: 0} },
  { id: 'INV-S-2024-002', supplierId: 'SUP-002', supplier: { name: 'مجموعة الصناعات المتقدمة', address: 'المدينة الصناعية الثانية، جدة', email: 'info@adv-industries.com', phone: '012-555-5678' }, invoiceDate: '2024-07-15', dueDate: '2024-08-14', total: 12000, status: 'paid', createdAt: '2024-07-15 09:00 ص', items: [{id: 1, description: 'قطع غيار ماكينات', quantity: 20, unitPrice: 600, total: 12000}], subtotal: 12000, tax: {rate: 0, amount: 0}, discount: {type: 'fixed', value: 0, amount: 0} },
  { id: 'INV-S-2024-003', supplierId: 'SUP-003', supplier: { name: 'الموردون المتحدون', address: 'طريق الميناء، الدمام', email: 'contact@united-suppliers.net', phone: '013-555-8765' }, invoiceDate: '2024-06-25', dueDate: '2024-07-25', total: 5500, status: 'paid', createdAt: '2024-06-25 02:10 م', items: [{id: 1, description: 'خدمات لوجستية', quantity: 1, unitPrice: 5500, total: 5500}], subtotal: 5500, tax: {rate: 0, amount: 0}, discount: {type: 'fixed', value: 0, amount: 0} },
  { id: 'INV-S-2024-004', supplierId: 'SUP-004', supplier: { name: 'شركة الحلول التقنية', address: 'وادي التقنية، الرياض', email: 'support@tech-solutions.sa', phone: '011-555-4321' }, invoiceDate: '2024-06-10', dueDate: '2024-07-10', total: 10580, status: 'overdue', createdAt: '2024-06-10 10:00 ص', items: [{id: 1, description: 'تراخيص برامج', quantity: 4, unitPrice: 2300, total: 9200}], subtotal: 9200, tax: {rate: 15, amount: 1380}, discount: {type: 'fixed', value: 0, amount: 0} },
  { id: 'INV-S-2024-005', supplierId: 'SUP-005', supplier: { name: 'مؤسسة المواد الخام', address: 'ينبع الصناعية', email: 'orders@raw-materials.co', phone: '014-555-9900' }, invoiceDate: '2024-07-22', dueDate: '2024-08-21', total: 20700, status: 'unpaid', createdAt: '2024-07-22 11:50 ص', items: [{id: 1, description: 'بوليمرات صناعية', quantity: 5, unitPrice: 3600, total: 18000}], subtotal: 18000, tax: {rate: 15, amount: 2700}, discount: {type: 'fixed', value: 0, amount: 0} },
];

const receiptsData: Receipt[] = [
  { id: 'REC-2024-001', customer: { name: 'خالد عبد العزيز', address: '123 شارع الملك فهد، الرياض', email: 'khalid.a@example.com', phone: '0501234567' }, date: '2024-07-25', createdAt: '2024-07-25 10:00 ص', total: 5000, status: 'posted', paymentMethod: 'تحويل بنكي', notes: 'دفعة من فاتورة INV-2024-001' },
  { id: 'REC-2024-002', customer: { name: 'فاطمة محمد', address: '456 طريق الأمير سلطان، جدة', email: 'fatima.m@example.com', phone: '0559876543' }, date: '2024-07-24', createdAt: '2024-07-24 03:15 م', total: 10000, status: 'posted', paymentMethod: 'نقداً', notes: 'دفعة مقدمة لمشروع جديد' },
  { id: 'REC-2024-003', customer: { name: 'شركة التقنية المبتكرة', address: '789 برج المملكة، الرياض', email: 'contact@tech-innovate.com', phone: '0112345678' }, date: '2024-07-23', createdAt: '2024-07-23 11:45 ص', total: 15000, status: 'draft', paymentMethod: 'شيك', notes: 'تسوية حساب' },
];

const paymentVouchersData: PaymentVoucher[] = [
    { id: 'PV-2024-001', supplier: { name: 'شركة التوريدات العالمية', address: 'المنطقة الصناعية، الرياض', email: 'sales@global-supplies.com', phone: '011-555-1234' }, date: '2024-07-26', createdAt: '2024-07-26 09:30 ص', total: 8625, status: 'posted', paymentMethod: 'تحويل بنكي', notes: 'سداد فاتورة INV-S-2024-001' },
    { id: 'PV-2024-002', supplier: { name: 'شركة الحلول التقنية', address: 'وادي التقنية، الرياض', email: 'support@tech-solutions.sa', phone: '011-555-4321' }, date: '2024-07-25', createdAt: '2024-07-25 01:00 م', total: 5000, status: 'posted', paymentMethod: 'شيك', notes: 'دفعة من فاتورة INV-S-2024-004' },
    { id: 'PV-2024-003', supplier: { name: 'الموردون المتحدون', address: 'طريق الميناء، الدمام', email: 'contact@united-suppliers.net', phone: '013-555-8765' }, date: '2024-07-24', createdAt: '2024-07-24 04:00 م', total: 2000, status: 'draft', paymentMethod: 'نقداً', notes: 'مصاريف نثرية' },
];

const customerAccountStatements: { [key: string]: AccountStatement } = {
    'CUST-003': {
        contactId: 'CUST-003',
        contactName: 'شركة التقنية المبتكرة',
        contactDetails: { address: '789 برج المملكة، الرياض', email: 'contact@tech-innovate.com', phone: '0112345678' },
        statementDate: new Date().toISOString().split('T')[0],
        openingBalance: 5000,
        closingBalance: 18800,
        entries: [
            { date: '2024-06-20', transactionId: 'PAY-0051', description: 'دفعة مقدمة', debit: 0, credit: 5000, balance: 0 },
            { date: '2024-07-05', transactionId: 'INV-2024-002', description: 'فاتورة مبيعات', debit: 12000, credit: 0, balance: 12000 },
            { date: '2024-07-10', transactionId: 'INV-2024-003', description: 'فاتورة مبيعات', debit: 11800, credit: 0, balance: 23800 },
            { date: '2024-07-15', transactionId: 'PAY-0058', description: 'دفعة من الحساب', debit: 0, credit: 10000, balance: 13800 },
            { date: '2024-07-25', transactionId: 'INV-2024-009', description: 'فاتورة مبيعات', debit: 5000, credit: 0, balance: 18800 },
        ]
    }
};

const productsData: Product[] = [];

const usersData: User[] = [
    { id: 'USR-001', name: 'أحمد الرئيسي', email: 'ahmed.manager@example.com', role: 'مدير النظام', status: 'active', avatar: 'https://picsum.photos/id/1005/100/100' },
    { id: 'USR-002', name: 'محمد المحاسب', email: 'mohammed.accountant@example.com', role: 'محاسب', status: 'active', avatar: 'https://picsum.photos/id/1011/100/100' },
    { id: 'USR-003', name: 'علي مندوب', email: 'ali.sales@example.com', role: 'مندوب مبيعات', status: 'inactive', avatar: 'https://picsum.photos/id/1025/100/100' },
    { id: 'USR-004', name: 'نورة الدعم', email: 'noura.support@example.com', role: 'دعم فني', status: 'active', avatar: 'https://picsum.photos/id/1027/100/100' },
];

const rolesData: Role[] = [
    { id: 'ROLE-01', name: 'مدير النظام', description: 'يمتلك جميع الصلاحيات على النظام.', userCount: 1 },
    { id: 'ROLE-02', name: 'محاسب', description: 'صلاحيات على الحسابات والفواتير والسندات.', userCount: 3 },
    { id: 'ROLE-03', name: 'مندوب مبيعات', description: 'صلاحيات على عروض الأسعار وفواتير المبيعات.', userCount: 5 },
    { id: 'ROLE-04', name: 'دعم فني', description: 'صلاحيات محدودة لعرض البيانات.', userCount: 2 },
];

const companySettingsData: CompanySettingsConfig = {
  systemName: 'نظام ERP',
  companyName: 'شركتنا',
  address: '١٢٣ الشارع الرئيسي، مدينة، دولة',
  phone: '920012345',
  email: 'info@ourcompany.com',
  website: 'www.ourcompany.com'
};

const quotationSettingsData: QuotationSettingsConfig = {
    headerImage: "https://picsum.photos/seed/header/800/150",
    footerImage: "https://picsum.photos/seed/footer/800/100",
    defaultTerms: "يتم دفع 50% مقدماً والباقي عند التسليم. العرض سارٍ لمدة 30 يوماً.",
    fields: [
        { key: 'customerInfo', label: 'مقدم إلى', isEnabled: true },
        { key: 'contactPerson', label: 'اسم المسؤول', isEnabled: true },
        { key: 'projectName', label: 'المشروع', isEnabled: true },
        { key: 'quotationNumber', label: 'رقم العرض', isEnabled: true },
        { key: 'quotationType', label: 'نوع العرض', isEnabled: false },
        { key: 'date', label: 'التاريخ', isEnabled: true },
        { key: 'expiryDate', label: 'تاريخ الانتهاء', isEnabled: true },
    ]
};

const salesInvoiceSettingsData: SalesInvoiceSettingsConfig = {
    headerImage: "https://picsum.photos/seed/invheader/800/150",
    footerImage: "https://picsum.photos/seed/invfooter/800/100",
    defaultTerms: "يجب سداد هذه الفاتورة في غضون 30 يومًا من تاريخ الإصدار. سيتم تطبيق رسوم تأخير بنسبة 1.5% شهريًا على الأرصدة غير المدفوعة.",
    fields: [
        { key: 'customerInfo', label: 'فاتورة إلى', isEnabled: true },
        { key: 'invoiceNumber', label: 'رقم الفاتورة', isEnabled: true },
        { key: 'invoiceDate', label: 'تاريخ الفاتورة', isEnabled: true },
        { key: 'dueDate', label: 'تاريخ الاستحقاق', isEnabled: true },
    ]
};

const supplierInvoiceSettingsData: SupplierInvoiceSettingsConfig = {
    headerImage: "https://picsum.photos/seed/purheader/800/150",
    footerImage: "https://picsum.photos/seed/purfooter/800/100",
    defaultTerms: "يتم الدفع لهذه الفاتورة وفقاً لشروط العقد المبرم. يرجى مراجعة قسم الحسابات لأية استفسارات.",
    fields: [
        { key: 'supplierInfo', label: 'فاتورة من', isEnabled: true },
        { key: 'supplierInvoiceNumber', label: 'رقم فاتورة المورد', isEnabled: true },
        { key: 'invoiceDate', label: 'تاريخ الفاتورة', isEnabled: true },
        { key: 'dueDate', label: 'تاريخ الاستحقاق', isEnabled: true },
    ]
};

const receiptSettingsData: ReceiptSettingsConfig = {
    headerImage: "https://picsum.photos/seed/recheader/800/150",
    footerImage: "https://picsum.photos/seed/recfooter/800/100",
    defaultNotes: "هذا السند بمثابة إيصال استلام للمبلغ المذكور أعلاه.",
    fields: [
        { key: 'customerInfo', label: 'استلمنا من السيد/السادة', isEnabled: true },
        { key: 'receiptNumber', label: 'رقم السند', isEnabled: true },
        { key: 'date', label: 'التاريخ', isEnabled: true },
        { key: 'paymentMethod', label: 'طريقة الدفع', isEnabled: true },
        { key: 'amount', label: 'مبلغاً وقدره', isEnabled: true },
        { key: 'notes', label: 'وذلك عن', isEnabled: true },
    ]
};

const paymentVoucherSettingsData: PaymentVoucherSettingsConfig = {
    headerImage: "https://picsum.photos/seed/payheader/800/150",
    footerImage: "https://picsum.photos/seed/payfooter/800/100",
    defaultNotes: "هذا السند بمثابة إيصال دفع للمبلغ المذكور أعلاه.",
    fields: [
        { key: 'supplierInfo', label: 'صرف إلى السيد/السادة', isEnabled: true },
        { key: 'voucherNumber', label: 'رقم السند', isEnabled: true },
        { key: 'date', label: 'التاريخ', isEnabled: true },
        { key: 'paymentMethod', label: 'طريقة الدفع', isEnabled: true },
        { key: 'amount', label: 'مبلغاً وقدره', isEnabled: true },
        { key: 'notes', label: 'وذلك عن', isEnabled: true },
    ]
};

const customerAccountStatementSettingsData: AccountStatementSettingsConfig = {
    headerImage: "https://picsum.photos/seed/custstmt-header/800/150",
    footerImage: "https://picsum.photos/seed/custstmt-footer/800/100",
    defaultNotes: "نشكر لكم حسن تعاملكم معنا. يرجى مراجعة قسم الحسابات في حال وجود أي استفسار.",
    fields: [
        { key: 'contactInfo', label: 'بيانات العميل', isEnabled: true },
        { key: 'statementDate', label: 'تاريخ الكشف', isEnabled: true },
        { key: 'openingBalance', label: 'الرصيد الافتتاحي', isEnabled: true },
        { key: 'totalDebit', label: 'إجمالي المستحقات (مدين)', isEnabled: true },
        { key: 'totalCredit', label: 'إجمالي المدفوعات (دائن)', isEnabled: true },
        { key: 'closingBalance', label: 'الرصيد الختامي', isEnabled: true },
        { key: 'ourCompanyInfo', label: 'بيانات الشركة', isEnabled: true },
    ]
};

const supplierAccountStatementSettingsData: AccountStatementSettingsConfig = {
    headerImage: "https://picsum.photos/seed/supstmt-header/800/150",
    footerImage: "https://picsum.photos/seed/supstmt-footer/800/100",
    defaultNotes: "يرجى مراجعة قسم الحسابات في حال وجود أي استفسار حول هذا الكشف.",
    fields: [
        { key: 'contactInfo', label: 'بيانات المورد', isEnabled: true },
        { key: 'statementDate', label: 'تاريخ الكشف', isEnabled: true },
        { key: 'openingBalance', label: 'الرصيد الافتتاحي', isEnabled: true },
        { key: 'totalDebit', label: 'إجمالي الفواتير (مدين)', isEnabled: true },
        { key: 'totalCredit', label: 'إجمالي المدفوعات (دائن)', isEnabled: true },
        { key: 'closingBalance', label: 'الرصيد الختامي', isEnabled: true },
        { key: 'ourCompanyInfo', label: 'بيانات الشركة', isEnabled: true },
    ]
};


export const getSalesInvoices = (): SalesInvoice[] => salesInvoices;
export const getSalesInvoiceById = (id: string): SalesInvoice | undefined => salesInvoices.find(inv => inv.id === id);

export const getQuotations = (): Quotation[] => quotations;
export const getQuotationById = (id: string): Quotation | undefined => quotations.find(q => q.id === id);

export const createQuotation = (quotationData: Omit<Quotation, 'id' | 'createdAt'>): Quotation => {
    const newQuotation: Quotation = {
        ...quotationData,
        id: `QT-2024-${String(quotations.length + 5).padStart(3, '0')}`,
        createdAt: new Date().toLocaleString('en-CA', { hour12: true, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', ''),
    };
    quotations.unshift(newQuotation);
    return newQuotation;
};

export const updateQuotation = (id: string, updatedData: Quotation): Quotation | undefined => {
    const index = quotations.findIndex(q => q.id === id);
    if (index !== -1) {
        quotations[index] = updatedData;
        return quotations[index];
    }
    return undefined;
};


export const getReceipts = (): Receipt[] => receiptsData;
export const getReceiptById = (id: string): Receipt | undefined => receiptsData.find(r => r.id === id);

export const getPaymentVouchers = (): PaymentVoucher[] => paymentVouchersData;
export const getPaymentVoucherById = (id: string): PaymentVoucher | undefined => paymentVouchersData.find(v => v.id === id);

export const getCustomers = (): Customer[] => customersData;
export const getCustomerById = (id: string): Customer | undefined => customersData.find(c => c.id === id);
export const getCustomerAccountStatement = (customerId: string): AccountStatement | undefined => {
    // Return a default/generated statement if no specific one exists
    if (customerAccountStatements[customerId]) {
        return customerAccountStatements[customerId];
    }
    const customer = getCustomerById(customerId);
    if (!customer) return undefined;
    return {
        contactId: customer.id,
        contactName: customer.name,
        contactDetails: { address: customer.address, email: customer.email, phone: customer.phone },
        statementDate: new Date().toISOString().split('T')[0],
        openingBalance: 0,
        closingBalance: 0,
        entries: []
    }
};

export const getSuppliers = (): Supplier[] => suppliersData;
export const getSupplierById = (id: string): Supplier | undefined => suppliersData.find(s => s.id === id);
export const getSupplierAccountStatement = (supplierId: string): AccountStatement | undefined => {
    // Generate a default statement for any supplier for demonstration
    const supplier = getSupplierById(supplierId);
    if (!supplier) return undefined;
    const opening = Math.random() * 2000;
    const closing = opening + 15000;
    return {
        contactId: supplier.id,
        contactName: supplier.name,
        contactDetails: { address: supplier.address, email: supplier.email, phone: supplier.phone },
        statementDate: new Date().toISOString().split('T')[0],
        openingBalance: opening,
        closingBalance: closing,
        entries: [
            { date: '2024-07-01', transactionId: 'INV-S-080', description: 'فاتورة مشتريات', debit: 10000, credit: 0, balance: opening + 10000 },
            { date: '2024-07-15', transactionId: 'PAY-V-091', description: 'سند صرف', debit: 0, credit: 10000, balance: opening },
            { date: '2024-07-20', transactionId: 'INV-S-088', description: 'فاتورة مشتريات', debit: 15000, credit: 0, balance: closing },
        ]
    }
};


export const getSupplierInvoices = (): SupplierInvoice[] => supplierInvoices;
export const getSupplierInvoiceById = (id: string): SupplierInvoice | undefined => supplierInvoices.find(inv => inv.id === id);

export const getProducts = (): Product[] => productsData;

// Settings
export const getUsers = (): User[] => usersData;
export const getRoles = (): Role[] => rolesData;
export const getCompanySettings = (): CompanySettingsConfig => companySettingsData;
export const getQuotationSettings = (): QuotationSettingsConfig => quotationSettingsData;
export const getSalesInvoiceSettings = (): SalesInvoiceSettingsConfig => salesInvoiceSettingsData;
export const getSupplierInvoiceSettings = (): SupplierInvoiceSettingsConfig => supplierInvoiceSettingsData;
export const getReceiptSettings = (): ReceiptSettingsConfig => receiptSettingsData;
export const getPaymentVoucherSettings = (): PaymentVoucherSettingsConfig => paymentVoucherSettingsData;
export const getCustomerAccountStatementSettings = (): AccountStatementSettingsConfig => customerAccountStatementSettingsData;
export const getSupplierAccountStatementSettings = (): AccountStatementSettingsConfig => supplierAccountStatementSettingsData;