import React, { useState } from 'react';
import * as Icons from '../icons/ModuleIcons';
import UserManagement from './UserManagement';
import RoleManagement from './RoleManagement';
import CompanySettings from './CompanySettings';
import QuotationSettings from './QuotationSettings';
import SalesInvoiceSettings from './SalesInvoiceSettings';
import SupplierInvoiceSettings from './SupplierInvoiceSettings';
import ReceiptSettings from './ReceiptSettings';
import PaymentVoucherSettings from './PaymentVoucherSettings';
import CustomerAccountStatementSettings from './CustomerAccountStatementSettings';
import SupplierAccountStatementSettings from './SupplierAccountStatementSettings';
import ProductManagement from './ProductManagement';


type SettingsTab = 'users' | 'roles' | 'company' | 'products' | 'quotations' | 'salesInvoices' | 'purchaseInvoices' | 'receipts' | 'payments' | 'customerStatements' | 'supplierStatements';

const PlaceholderSettings: React.FC<{title: string}> = ({title}) => (
    <div className="bg-white p-6 rounded-lg shadow-md w-full">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        <p className="text-sm text-gray-500 mt-1">هذه الإعدادات قيد الإنشاء.</p>
    </div>
);

const SettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<SettingsTab>('users');

    const renderContent = () => {
        switch (activeTab) {
            case 'users':
                return <UserManagement />;
            case 'roles':
                return <RoleManagement />;
            case 'company':
                return <CompanySettings />;
            case 'products':
                return <ProductManagement />;
            case 'quotations':
                return <QuotationSettings />;
            case 'salesInvoices':
                 return <SalesInvoiceSettings />;
            case 'purchaseInvoices':
                 return <SupplierInvoiceSettings />;
            case 'receipts':
                 return <ReceiptSettings />;
            case 'payments':
                 return <PaymentVoucherSettings />;
            case 'customerStatements':
                 return <CustomerAccountStatementSettings />;
            case 'supplierStatements':
                 return <SupplierAccountStatementSettings />;
            default:
                return null;
        }
    };

    const NavItem: React.FC<{ tabId: SettingsTab; title: string; icon: React.FC<{className?: string}>; }> = ({ tabId, title, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`w-full flex items-center text-right p-3 rounded-lg transition-colors duration-200 ${
                activeTab === tabId
                    ? 'bg-emerald-100 text-emerald-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-100'
            }`}
        >
            <Icon className={`w-5 h-5 ml-3 ${activeTab === tabId ? 'text-emerald-600' : 'text-gray-400'}`} />
            <span>{title}</span>
        </button>
    );

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">الإعدادات</h1>
                <p className="text-gray-500">إدارة إعدادات النظام والمستخدمين والأدوار.</p>
            </div>
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <aside className="w-full md:w-64 lg:w-72 bg-white p-4 rounded-lg shadow-md">
                    <nav className="space-y-2">
                        <h3 className="px-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">عام</h3>
                        <NavItem tabId="users" title="إدارة المستخدمين" icon={Icons.UserGroupIcon} />
                        <NavItem tabId="roles" title="إدارة الأدوار" icon={Icons.ShieldCheckIcon} />
                        <NavItem tabId="company" title="بيانات الشركة" icon={Icons.BuildingOfficeIcon} />
                        
                        <div className="pt-4">
                            <h3 className="px-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">إعدادات التطبيق</h3>
                            <div className="mt-2 space-y-2">
                                <NavItem tabId="products" title="إدارة المنتجات" icon={Icons.ArchiveIcon} />
                                <NavItem tabId="quotations" title="عروض الاسعار" icon={Icons.DocumentTextIcon} />
                                <NavItem tabId="salesInvoices" title="فواتير المبيعات" icon={Icons.DocumentTextIcon} />
                                <NavItem tabId="purchaseInvoices" title="فواتير المشتريات" icon={Icons.DocumentTextIcon} />
                                <NavItem tabId="receipts" title="سندات القبض" icon={Icons.DocumentTextIcon} />
                                <NavItem tabId="payments" title="سندات الصرف" icon={Icons.DocumentTextIcon} />
                                <NavItem tabId="customerStatements" title="كشوف حساب العملاء" icon={Icons.BookOpenIcon} />
                                <NavItem tabId="supplierStatements" title="كشوف حساب الموردين" icon={Icons.BookOpenIcon} />
                            </div>
                        </div>
                    </nav>
                </aside>
                <main className="flex-1 w-full">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default SettingsPage;