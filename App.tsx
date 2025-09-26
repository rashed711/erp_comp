import React, { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './components/dashboard/Dashboard';
import SalesInvoices from './components/sales/SalesInvoices';
import Customers from './components/contacts/Customers';
import SupplierInvoices from './components/purchases/SupplierInvoices';
import Suppliers from './components/contacts/Suppliers';
import Quotations from './components/sales/Quotations';
import CreateQuotation from './components/sales/CreateQuotation';
import CreateSalesInvoice from './components/sales/CreateSalesInvoice';
import CreateSupplierInvoice from './components/purchases/CreateSupplierInvoice';
import QuotationDetail from './components/sales/QuotationDetail';
import SalesInvoiceDetail from './components/sales/SalesInvoiceDetail';
import SupplierInvoiceDetail from './components/purchases/SupplierInvoiceDetail';
import CustomerAccountStatement from './components/contacts/CustomerAccountStatement';
import SupplierAccountStatement from './components/contacts/SupplierAccountStatement';
import Receipts from './components/financials/Receipts';
import ReceiptDetail from './components/financials/ReceiptDetail';
import PaymentVouchers from './components/financials/PaymentVouchers';
import PaymentVoucherDetail from './components/financials/PaymentVoucherDetail';
import ProfilePage from './components/profile/ProfilePage';
import SettingsPage from './components/settings/SettingsPage';
import Login from './components/auth/Login';
import ServerTest from './components/shared/ServerTest';

type Route = {
  page: string;
  id?: string;
}

const PlaceholderPage: React.FC<{title: string}> = ({title}) => (
    <div className="p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{title}</h1>
        <p className="text-gray-500">هذه الصفحة قيد الإنشاء.</p>
    </div>
);

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem('isLoggedIn') === 'true');
  const [route, setRoute] = useState<Route>({ page: 'dashboard' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const handleLoginSuccess = () => {
    sessionStorage.setItem('isLoggedIn', 'true');
    setIsAuthenticated(true);
    setRoute({ page: 'dashboard' });
  };

  const handleLogout = () => {
    sessionStorage.removeItem('isLoggedIn');
    setIsAuthenticated(false);
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  const handleNavigate = (newRoute: Route | string) => {
    if (typeof newRoute === 'string') {
      setRoute({ page: newRoute });
    } else {
      setRoute(newRoute);
    }
    // Close sidebar on navigation on smaller screens
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const renderPage = () => {
    switch (route.page) {
      case 'quotations':
        return <Quotations onNavigate={handleNavigate} />;
      case 'createQuotation':
        return <CreateQuotation onBack={() => handleNavigate('quotations')} />;
      case 'editQuotation':
        return <CreateQuotation onBack={() => handleNavigate('quotations')} quotationId={route.id} />;
      case 'quotationDetail':
        return route.id ? <QuotationDetail quotationId={route.id} onBack={() => handleNavigate('quotations')} onNavigate={handleNavigate} /> : <Quotations onNavigate={handleNavigate} />;
      case 'salesInvoices':
        return <SalesInvoices onNavigate={handleNavigate} />;
      case 'createSalesInvoice':
        return <CreateSalesInvoice onBack={() => handleNavigate('salesInvoices')} />;
      case 'salesInvoiceDetail':
        return route.id ? <SalesInvoiceDetail invoiceId={route.id} onBack={() => handleNavigate('salesInvoices')} /> : <SalesInvoices onNavigate={handleNavigate} />;
      case 'receipts':
        return <Receipts onNavigate={handleNavigate} />;
      case 'receiptDetail':
        return route.id ? <ReceiptDetail receiptId={route.id} onBack={() => handleNavigate('receipts')} /> : <Receipts onNavigate={handleNavigate} />;
      case 'paymentVouchers':
        return <PaymentVouchers onNavigate={handleNavigate} />;
      case 'paymentVoucherDetail':
        return route.id ? <PaymentVoucherDetail voucherId={route.id} onBack={() => handleNavigate('paymentVouchers')} /> : <PaymentVouchers onNavigate={handleNavigate} />;
      case 'customers':
        return <Customers onNavigate={handleNavigate} />;
      case 'customerAccountStatement':
        return route.id ? <CustomerAccountStatement customerId={route.id} onBack={() => handleNavigate('customers')} /> : <Customers onNavigate={handleNavigate} />;
      case 'supplierInvoices':
        return <SupplierInvoices onNavigate={handleNavigate} />;
      case 'createSupplierInvoice':
        return <CreateSupplierInvoice onBack={() => handleNavigate('supplierInvoices')} />;
      case 'supplierInvoiceDetail':
        return route.id ? <SupplierInvoiceDetail invoiceId={route.id} onBack={() => handleNavigate('supplierInvoices')} /> : <SupplierInvoices onNavigate={handleNavigate} />;
      case 'suppliers':
        return <Suppliers onNavigate={handleNavigate} />;
      case 'supplierAccountStatement':
        return route.id ? <SupplierAccountStatement supplierId={route.id} onBack={() => handleNavigate('suppliers')} /> : <Suppliers onNavigate={handleNavigate} />;
      case 'reports':
        return <PlaceholderPage title="التقارير" />;
      case 'settings':
        return <SettingsPage />;
      case 'serverTest':
        return <ServerTest onBack={() => handleNavigate('dashboard')} />;
      case 'profile':
        return <ProfilePage onLogout={handleLogout} />;
      case 'dashboard':
      default:
        return <Dashboard />;
    }
  };

  const isDetailPage = [
    'createQuotation',
    'editQuotation',
    'createSalesInvoice',
    'createSupplierInvoice',
    'quotationDetail', 
    'salesInvoiceDetail', 
    'supplierInvoiceDetail', 
    'customerAccountStatement', 
    'supplierAccountStatement',
    'receiptDetail',
    'paymentVoucherDetail',
    'serverTest'
  ].includes(route.page);

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="bg-gray-100 min-h-screen" style={{ direction: 'rtl' }}>
      <Sidebar onNavigate={handleNavigate} currentPage={route.page} isSidebarOpen={isSidebarOpen} onToggleSidebar={handleToggleSidebar} />
      
      {/* Animated backdrop */}
      <div 
        className={`fixed inset-0 bg-black z-30 lg:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'}`}
        onClick={handleToggleSidebar}
        aria-hidden={!isSidebarOpen}
      ></div>

      <div className="flex-1 flex flex-col lg:mr-64 transition-all duration-300">
        {!isDetailPage && <Header onToggleSidebar={handleToggleSidebar} />}
        <main 
            key={route.page + (route.id || '')} 
            className={`flex-1 animate-fade-in ${!isDetailPage ? 'p-4 sm:p-6 lg:p-8' : ''}`}
        >
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default App;