import React, { useState, useEffect } from 'react';
import * as Icons from '../icons/ModuleIcons';
import { NavItem, CompanySettingsConfig } from '../../types';
import { getCompanySettings } from '../../services/mockApi';
import { useI18n } from '../../i18n/I18nProvider';
import { TranslationKey } from '../../i18n/translations';


const getNavItems = (t: (key: TranslationKey) => string): NavItem[] => [
    { name: t('sidebar.main'), pageId: 'dashboard', icon: Icons.HomeIcon },
    { name: t('sidebar.quotations'), pageId: 'quotations', icon: Icons.DocumentTextIcon },
    { 
        name: t('sidebar.accounts'), 
        icon: Icons.BookOpenIcon, 
        children: [
            { 
                name: t('sidebar.invoices'), 
                icon: Icons.DocumentIcon,
                children: [
                    { name: t('sidebar.salesInvoices'), pageId: 'salesInvoices', icon: Icons.DocumentTextIcon },
                    { name: t('sidebar.purchaseInvoices'), pageId: 'supplierInvoices', icon: Icons.DocumentTextIcon },
                ]
            },
            {
                name: t('sidebar.vouchers'),
                icon: Icons.DocumentIcon,
                children: [
                    { name: t('sidebar.receipts'), pageId: 'receipts', icon: Icons.DocumentTextIcon },
                    { name: t('sidebar.paymentVouchers'), pageId: 'paymentVouchers', icon: Icons.DocumentTextIcon },
                ]
            },
            {
                name: t('sidebar.contacts'),
                icon: Icons.UsersIcon,
                children: [
                    { name: t('sidebar.customers'), pageId: 'customers', icon: Icons.UserGroupIcon },
                    { name: t('sidebar.suppliers'), pageId: 'suppliers', icon: Icons.BuildingOfficeIcon },
                ]
            }
        ]
    },
    { name: t('sidebar.reports'), pageId: 'reports', icon: Icons.ChartBarIcon },
    { name: t('sidebar.settings'), pageId: 'settings', icon: Icons.CogIcon },
    { name: t('sidebar.serverTest'), pageId: 'serverTest', icon: Icons.AdjustmentsHorizontalIcon },
    { name: t('sidebar.profile'), pageId: 'profile', icon: Icons.UserCircleIcon },
];


interface NavLinkProps {
    item: NavItem;
    level?: number;
    onNavigate: (route: { page: string }) => void;
    currentPage: string;
}

const NavLink: React.FC<NavLinkProps> = ({ item, level = 0, onNavigate, currentPage }) => {
    const { direction } = useI18n();
    const [isOpen, setIsOpen] = React.useState(false);
    
    const isRTL = direction === 'rtl';

    const levelPaddings: { [key: number]: string } = {
        0: 'px-6',
        1: isRTL ? 'pr-10 pl-6' : 'pl-10 pr-6',
        2: isRTL ? 'pr-14 pl-6' : 'pl-14 pr-6',
    };
    const paddingClass = levelPaddings[level] || (isRTL ? 'pr-16 pl-6' : 'pl-16 pr-6');
    const marginClass = isRTL ? 'mr-4' : 'ml-4';

    if (item.children) {
        return (
            <div>
                <button onClick={() => setIsOpen(!isOpen)} className={`w-full flex justify-between items-center text-right py-3 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 focus:outline-none transition-colors duration-200 ${paddingClass}`}>
                    <div className="flex items-center">
                        <item.icon className="w-5 h-5" />
                        <span className={marginClass}>{item.name}</span>
                    </div>
                    <Icons.ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                    <div className="bg-gray-50/50">
                        {item.children.map(child => <NavLink key={child.name} item={child} level={level + 1} onNavigate={onNavigate} currentPage={currentPage} />)}
                    </div>
                )}
            </div>
        );
    }

    const isActive = currentPage === item.pageId;
    const activeClasses = 'bg-emerald-100 text-emerald-600 font-semibold';

    return (
        <a href="#" onClick={(e) => {
            e.preventDefault();
            if (item.pageId) onNavigate({ page: item.pageId });
        }} className={`flex items-center text-right py-3 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors duration-200 ${paddingClass} ${isActive ? activeClasses : ''}`}>
            <item.icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : ''}`} />
            <span className={marginClass}>{item.name}</span>
        </a>
    );
};

interface SidebarProps {
    onNavigate: (route: { page: string }) => void;
    currentPage: string;
    isSidebarOpen: boolean;
    onToggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onNavigate, currentPage, isSidebarOpen, onToggleSidebar }) => {
  const { direction, t } = useI18n();
  const [settings, setSettings] = useState<CompanySettingsConfig | null>(null);

  useEffect(() => {
    setSettings(getCompanySettings());
  }, []);
  
  const navItems = getNavItems(t);
  
  const positionClass = direction === 'rtl' ? 'right-0' : 'left-0';
  let transformClass = '';
  if (direction === 'rtl') {
    transformClass = isSidebarOpen ? 'translate-x-0' : 'translate-x-full';
  } else {
    transformClass = isSidebarOpen ? 'translate-x-0' : '-translate-x-full';
  }
  
  const systemName = settings?.systemName ? t(settings.systemName as TranslationKey) : 'ERP System';

  return (
    <aside id="sidebar" className={`bg-white w-64 min-h-screen shadow-lg fixed top-0 ${positionClass} transform lg:translate-x-0 transition-transform duration-300 ease-in-out z-40 flex flex-col ${transformClass}`}>
      <div className="p-6 flex items-center justify-between border-b">
        <h1 className="text-2xl font-bold text-emerald-600">{systemName}</h1>
        <button id="close-sidebar-btn" onClick={onToggleSidebar} className="lg:hidden text-gray-500 hover:text-gray-800">
           <Icons.XIcon className="w-6 h-6" />
        </button>
      </div>
      <nav className="mt-4 flex-1">
        {navItems.map(item => <NavLink key={item.name} item={item} onNavigate={onNavigate} currentPage={currentPage} />)}
      </nav>
    </aside>
  );
};

export default Sidebar;
