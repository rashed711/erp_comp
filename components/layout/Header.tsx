import React from 'react';
import * as Icons from '../icons/ModuleIcons';

interface HeaderProps {
    onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
    return (
        <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-20" style={{ direction: 'rtl' }}>
            <div className="flex items-center">
                <button id="open-sidebar-btn" onClick={onToggleSidebar} className="text-gray-500 hover:text-gray-700 lg:hidden ml-4">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
                <div className="relative hidden md:block">
                    <input type="text" placeholder="بحث..." className="bg-gray-100 rounded-full py-2 pr-10 pl-4 focus:outline-none focus:ring-2 focus:ring-emerald-400 w-64" />
                    <div className="absolute top-0 right-0 mt-2 mr-3 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                </div>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
                <button className="text-gray-500 hover:text-gray-700 relative">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                </button>
            </div>
        </header>
    );
};

export default Header;