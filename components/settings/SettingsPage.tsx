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
import CurrencySettings from './CurrencySettings';
import { useI18n } from '../../i18n/I18nProvider';


type SettingsTab = 'users' | 'roles' | 'company' | 'products' | 'currencies' | 'quotations' | 'salesInvoices' | 'purchaseInvoices' | 'receipts' | 'payments' | 'customerStatements' | 'supplierStatements';

const SettingsPage: React.FC = () => {
    const { t, direction } = useI18n();
    const [activeTab, setActiveTab] = useState<SettingsTab>('users');

    const renderContent = () => {
        switch (activeTab) {
            case 'users':
                return <UserManagement />;
            case 'roles':
                return <RoleManagement />;
            case 'company':
                return <CompanySettings />;
            case 'currencies':
                return <CurrencySettings />;
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

    const NavItem: React.FC<{ tabId: SettingsTab; title: string; icon: React.FC<{className?: string}>; }> = ({ tabId, title, icon: Icon }) => {
        const marginClass = direction === 'rtl' ? 'ml-3' : 'mr-3';
        return (
            <button
                onClick={() => setActiveTab(tabId)}
                className={`w-full flex items-center text-right p-3 rounded-lg transition-colors duration-200 ${
                    activeTab === tabId
                        ? 'bg-emerald-100 text-emerald-700 font-semibold'
                        : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
                <Icon className={`w-5 h-5 ${marginClass} ${activeTab === tabId ? 'text-emerald-600' : 'text-gray-400'}`} />
                <span>{title}</span>
            </button>
        );
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">{t('settings.title')}</h1>
                <p className="text-gray-500">{t('settings.description')}</p>
            </div>
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <aside className="w-full md:w-64 lg:w-72 bg-white p-4 rounded-lg shadow-md">
                    <nav className="space-y-2">
                        <h3 className="px-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">{t('settings.general')}</h3>
                        <NavItem tabId="users" title={t('settings.users.title')} icon={Icons.UserGroupIcon} />
                        <NavItem tabId="roles" title={t('settings.roles.title')} icon={Icons.ShieldCheckIcon} />
                        <NavItem tabId="company" title={t('settings.company.title')} icon={Icons.BuildingOfficeIcon} />
                        <NavItem tabId="currencies" title={t('settings.currencies.title')} icon={Icons.DollarSignIcon} />
                        
                        <div className="pt-4">
                            <h3 className="px-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">{t('settings.application')}</h3>
                            <div className="mt-2 space-y-2">
                                <NavItem tabId="products" title={t('settings.products.title')} icon={Icons.ArchiveIcon} />
                                <NavItem tabId="quotations" title={t('sidebar.quotations')} icon={Icons.DocumentTextIcon} />
                                <NavItem tabId="salesInvoices" title={t('sidebar.salesInvoices')} icon={Icons.DocumentTextIcon} />
                                <NavItem tabId="purchaseInvoices" title={t('sidebar.purchaseInvoices')} icon={Icons.DocumentTextIcon} />
                                <NavItem tabId="receipts" title={t('sidebar.receipts')} icon={Icons.DocumentTextIcon} />
                                <NavItem tabId="payments" title={t('sidebar.paymentVouchers')} icon={Icons.DocumentTextIcon} />
                                <NavItem tabId="customerStatements" title={t('settings.customerStatements')} icon={Icons.BookOpenIcon} />
                                <NavItem tabId="supplierStatements" title={t('settings.supplierStatements')} icon={Icons.BookOpenIcon} />
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
