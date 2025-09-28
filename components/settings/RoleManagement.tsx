import React, { useState, useEffect, useMemo } from 'react';
import { getRoles } from '../../services/mockApi';
import { Role } from '../../types';
import * as Icons from '../icons/ModuleIcons';
import { useI18n } from '../../i18n/I18nProvider';
import { TranslationKey } from '../../i18n/translations';

const RoleManagement: React.FC = () => {
    const { t, direction } = useI18n();
    const [roles, setRoles] = useState<Role[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 6;

    useEffect(() => {
        setRoles(getRoles());
    }, []);

    const filteredRoles = useMemo(() => {
        setCurrentPage(1);
        const translatedRoles = roles.map(role => ({
            ...role,
            name: t(role.name as TranslationKey),
            description: t(role.description as TranslationKey)
        }));
        
        if (!searchTerm) {
            return translatedRoles;
        }
        return translatedRoles.filter(role =>
            role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            role.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, roles, t]);

    const paginatedRoles = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredRoles.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [currentPage, filteredRoles]);

    const totalPages = Math.ceil(filteredRoles.length / ITEMS_PER_PAGE);
    const marginClass = direction === 'rtl' ? 'ml-2' : 'mr-2';

    return (
        <div className="bg-white p-6 rounded-lg shadow-md w-full">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <div className="w-full sm:w-auto">
                    <h2 className="text-xl font-bold text-gray-800">{t('settings.roles.title')}</h2>
                    <p className="text-sm text-gray-500 mt-1">{t('settings.roles.description')}</p>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <input
                            type="text"
                            placeholder={t('settings.roles.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full ${direction === 'rtl' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm`}
                        />
                        <div className={`absolute inset-y-0 ${direction === 'rtl' ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                    <button className="flex-shrink-0 flex items-center bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-px text-sm">
                        <Icons.PlusIcon className={`w-5 h-5 ${marginClass}`} />
                        <span>{t('settings.roles.add')}</span>
                    </button>
                </div>
            </div>
            {paginatedRoles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedRoles.map((role) => (
                        <div key={role.id} className="border bg-gray-50/50 rounded-lg p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">{role.name}</h3>
                                <p className="text-sm text-gray-500 mt-2 min-h-[40px]">{role.description}</p>
                                <div className="flex items-center mt-4 text-sm text-gray-600">
                                    <Icons.UserGroupIcon className={`w-4 h-4 ${marginClass} text-gray-400`} />
                                    <span>{role.userCount} {t('settings.roles.users')}</span>
                                </div>
                            </div>
                            <div className="mt-5">
                                <button className="w-full text-center text-sm font-semibold text-emerald-600 bg-emerald-100 hover:bg-emerald-200 py-2 px-4 rounded-md transition-all duration-200 hover:scale-105">
                                    {t('settings.roles.editPermissions')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                 <div className="text-center py-16 text-gray-500">
                    <p>{t('settings.roles.notFound')}</p>
                </div>
            )}
             {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                        {t('common.previous')}
                    </button>
                    <span className="text-sm text-gray-600">
                        {t('common.page')} {currentPage} {t('common.of')} {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                        {t('common.next')}
                    </button>
                </div>
            )}
        </div>
    );
};

export default RoleManagement;
