import React, { useState, useEffect } from 'react';
import * as Icons from '../icons/ModuleIcons';
import { NavItem, CompanySettingsConfig } from '../../types';
import { getCompanySettings } from '../../services/mockApi';

const navItems: NavItem[] = [
    { name: 'الرئيسية', pageId: 'dashboard', icon: Icons.HomeIcon },
    { name: 'عروض الاسعار', pageId: 'quotations', icon: Icons.DocumentTextIcon },
    { 
        name: 'الحسابات', 
        icon: Icons.BookOpenIcon, 
        children: [
            { 
                name: 'الفواتير', 
                icon: Icons.DocumentIcon,
                children: [
                    { name: 'فواتير المبيعات', pageId: 'salesInvoices', icon: Icons.DocumentTextIcon },
                    { name: 'فواتير المشتريات', pageId: 'supplierInvoices', icon: Icons.DocumentTextIcon },
                ]
            },
            {
                name: 'السندات',
                icon: Icons.DocumentIcon,
                children: [
                    { name: 'سندات القبض', pageId: 'receipts', icon: Icons.DocumentTextIcon },
                    { name: 'سندات الصرف', pageId: 'paymentVouchers', icon: Icons.DocumentTextIcon },
                ]
            },
            {
                name: 'جهات الاتصال',
                icon: Icons.UsersIcon,
                children: [
                    { name: 'العملاء', pageId: 'customers', icon: Icons.UserGroupIcon },
                    { name: 'الموردين', pageId: 'suppliers', icon: Icons.BuildingOfficeIcon },
                ]
            }
        ]
    },
    { name: 'التقارير', pageId: 'reports', icon: Icons.ChartBarIcon },
    { name: 'الإعدادات', pageId: 'settings', icon: Icons.CogIcon },
    { name: 'تشخيص الاتصال', pageId: 'serverTest', icon: Icons.AdjustmentsHorizontalIcon },
    { name: 'الملف الشخصي', pageId: 'profile', icon: Icons.UserCircleIcon },
];


interface NavLinkProps {
    item: NavItem;
    level?: number;
    onNavigate: (route: { page: string }) => void;
    currentPage: string;
}

const NavLink: React.FC<NavLinkProps> = ({ item, level = 0, onNavigate, currentPage }) => {
    const [isOpen, setIsOpen] = React.useState(false);

    const levelPaddings: { [key: number]: string } = {
        0: 'px-6',
        1: 'pr-10 pl-6',
        2: 'pr-14 pl-6',
    };
    const paddingClass = levelPaddings[level] || 'pr-16 pl-6';

    if (item.children) {
        return (
            <div>
                <button onClick={() => setIsOpen(!isOpen)} className={`w-full flex justify-between items-center text-right py-3 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 focus:outline-none transition-colors duration-200 ${paddingClass}`}>
                    <div className="flex items-center">
                        <item.icon className="w-5 h-5" />
                        <span className="mr-4">{item.name}</span>
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
            <span className="mr-4">{item.name}</span>
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
  const [settings, setSettings] = useState<CompanySettingsConfig | null>(null);

  useEffect(() => {
    setSettings(getCompanySettings());
  }, []);

  return (
    <aside id="sidebar" className={`bg-white w-64 min-h-screen shadow-lg fixed top-0 right-0 transform lg:translate-x-0 transition-transform duration-300 ease-in-out z-40 flex flex-col ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`} style={{ direction: 'rtl' }}>
      <div className="p-6 flex items-center justify-between border-b">
        <h1 className="text-2xl font-bold text-emerald-600">{settings?.systemName || 'نظام ERP'}</h1>
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