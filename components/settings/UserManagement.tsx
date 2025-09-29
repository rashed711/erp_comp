import React, { useState, useEffect, useMemo } from 'react';
import { User } from '../../types';
import * as Icons from '../icons/ModuleIcons';
import ConfirmationModal from '../shared/ConfirmationModal';
import AddUserModal from './AddUserModal';
import { API_BASE_URL } from '../../services/api';
import { useI18n } from '../../i18n/I18nProvider';
import { TranslationKey } from '../../i18n/translations';

// A generic, embedded SVG placeholder for users without an avatar.
const DEFAULT_PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2NkZTVmYSI+PHBhdGggZD0iTTIgMjB2LTJjMC0yLjIgMy42LTQgOC00czggMS44IDggNHYySDJ6bTQtMmgxMHYtLjZjMC0xLjMtMi43LTEuOS02LTEuOS0zLjMgMC02IC42LTYgMS45VjE4em02LTljMy4zIDAgNi0yLjcgNi02cy0yLjctNi02LTZzLTYgMi43LTYgNnMyLjcgNiA2IDZ6bTAtMmMyLjIgMCA0LTEuOCA0LTRzLTEuOC00LTQtNC00IDEuOC00IDRzMS44IDQgNCA0eiIvPjwvc3ZnPg==';

const UserManagement: React.FC = () => {
    const { t } = useI18n();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<React.ReactNode | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const ITEMS_PER_PAGE = 5;

    const fetchUsers = async () => {
        setIsLoading(true);
        setError(null);
        let responseText = '';
        try {
            const response = await fetch(`${API_BASE_URL}users.php`, { 
                cache: 'no-cache',
                headers: { 'Accept': 'application/json' }
            });
            
            responseText = await response.text();
            
            if (responseText.includes('aes.js') && responseText.includes('document.cookie')) {
                throw new Error('HOSTING_SECURITY_CHALLENGE');
            }
            
            if (!response.ok) {
                throw new Error(`NETWORK_ERROR::${response.status}`);
            }
            
            const data = JSON.parse(responseText);
            if (typeof data === 'object' && data !== null && data.error) {
                // This catches JSON errors from db.php or other handled PHP errors
                throw new Error(`PHP_ERROR::${data.error}`);
            }
            setUsers(data);
        } catch (err: any) {
            console.error("Fetch Error:", err);
            let detailedError: React.ReactNode;
            
            if (err.message.startsWith('PHP_ERROR')) {
                const phpError = err.message.replace('PHP_ERROR::', '');
                if (phpError.includes('Base table or view not found') && phpError.includes('users')) {
                     detailedError = (
                        <div>
                            <p className="font-bold text-lg mb-2">تم تشخيص المشكلة: جدول `users` مفقود</p>
                            <p className="mb-3">
                                تعذر على الخادم العثور على جدول `users` في قاعدة البيانات. هذا يعني أن الجدول لم يتم إنشاؤه.
                            </p>
                            <p className="mt-4 font-semibold text-gray-800">الحل:</p>
                            <ol className="list-decimal list-inside space-y-2 mt-2 text-sm">
                                <li>اذهب إلى <strong>phpMyAdmin</strong>.</li>
                                <li>اختر قاعدة البيانات الخاصة بالمشروع.</li>
                                <li>اضغط على <strong>"Import"</strong> وقم باستيراد ملف <strong>`api/setup.sql`</strong> لإنشاء جميع الجداول المطلوبة.</li>
                            </ol>
                        </div>
                    );
                } else {
                     detailedError = (
                        <div>
                            <p className="font-bold text-lg mb-2">خطأ في الخادم (PHP)</p>
                            <pre className="mt-2 p-3 bg-gray-100 text-red-800 rounded-md text-xs text-left leading-relaxed" dir="ltr">
                                {phpError}
                            </pre>
                        </div>
                     );
                }
            } else if (err instanceof SyntaxError) {
                 detailedError = (
                    <div>
                        <p className="font-bold">فشل تحليل استجابة الخادم (Invalid JSON).</p>
                        <p className="mt-2">هذا يعني غالبًا وجود خطأ برمجي (Fatal Error) في ملف `users.php`. رسالة الخطأ من الخادم:</p>
                        <pre className="mt-2 p-2 bg-gray-200 text-red-900 rounded-md text-xs text-left" dir="ltr">{responseText}</pre>
                    </div>
                );
            } else {
                 detailedError = (
                     <div>
                        <p className="font-bold text-lg mb-2">فشل الاتصال بالخادم</p>
                        <p className="mb-3">حدث خطأ غير متوقع. يرجى مراجعة تفاصيل الخطأ أدناه:</p>
                        <pre className="mt-2 p-3 bg-gray-100 text-gray-800 rounded-md text-xs text-left leading-relaxed" dir="ltr">
                            {err.message}
                        </pre>
                    </div>
                );
            }
            setError(detailedError);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        setCurrentPage(1);
        if (!searchTerm) {
            return users;
        }
        return users.filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t(user.role as TranslationKey).toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, users, t]);
    
    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [currentPage, filteredUsers]);

    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

    const getStatusBadgeClasses = (status: User['status']) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'inactive':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: User['status']) => {
        const statusMap = {
            active: t('status.active'),
            inactive: t('status.inactive')
        };
        return statusMap[status];
    };

    const handleOpenDeleteModal = (user: User) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };

    const handleCloseDeleteModal = () => {
        setUserToDelete(null);
        setIsDeleteModalOpen(false);
    };

    const handleDeleteUser = async () => {
        if (userToDelete) {
             try {
                const response = await fetch(`${API_BASE_URL}users.php`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({ id: userToDelete.id }),
                    cache: 'no-cache'
                });

                const responseText = await response.text();
                if (!response.ok) throw new Error(`HTTP Error ${response.status}: ${responseText}`);
                
                const result = JSON.parse(responseText);
                if (!result.success) throw new Error(result.error || 'Failed to delete user.');

                await fetchUsers(); // Refetch users to update the list
            } catch (err) {
                 const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
                alert(`Error deleting user: ${errorMessage}`);
            } finally {
                handleCloseDeleteModal();
            }
        }
    };

    const handleOpenAddModal = () => {
        setUserToEdit(null);
        setSaveError(null);
        setIsAddEditModalOpen(true);
    };

    const handleOpenEditModal = (user: User) => {
        setUserToEdit(user);
        setSaveError(null);
        setIsAddEditModalOpen(true);
    };

    const handleCloseAddEditModal = () => {
        setIsAddEditModalOpen(false);
        setUserToEdit(null);
    };

    const handleSaveUser = async (data: FormData, id: string | null) => {
        setIsSaving(true);
        setSaveError(null);
        try {
            const isEdit = !!id;
            const url = isEdit ? `${API_BASE_URL}users.php?id=${id}` : `${API_BASE_URL}users.php`;

            const response = await fetch(url, {
                method: 'POST', // Using POST for both create and update with multipart/form-data
                body: data,
                cache: 'no-cache'
            });
            
            const responseText = await response.text();
            if (!response.ok) {
                try {
                    const errorJson = JSON.parse(responseText);
                    throw new Error(errorJson.error || `فشل الطلب من الخادم (HTTP ${response.status}).`);
                } catch {
                    throw new Error(`فشل الطلب من الخادم (HTTP ${response.status}). التفاصيل: ${responseText}`);
                }
            }
            
            const result = JSON.parse(responseText);
            if (result.success === false || result.error) {
                throw new Error(result.error || `فشل في ${isEdit ? 'تحديث' : 'إضافة'} المستخدم.`);
            }
            
            await fetchUsers();
            handleCloseAddEditModal();

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع.';
            setSaveError(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };
    
    const siteRoot = API_BASE_URL.replace('/api/', '/');
    const isExternalUrl = (url: string) => url.startsWith('http://') || url.startsWith('https://');

    const getAvatarUrl = (dbUrl: string | null | undefined): string => {
        if (!dbUrl) {
            return DEFAULT_PLACEHOLDER_IMAGE;
        }
        if (isExternalUrl(dbUrl)) {
            return dbUrl;
        }
        return `${siteRoot}${dbUrl}`;
    };

    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow-md w-full">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <div className="w-full sm:w-auto">
                        <h2 className="text-xl font-bold text-gray-800">{t('settings.users.title')}</h2>
                        <p className="text-sm text-gray-500 mt-1">{t('settings.users.description')}</p>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="relative w-full sm:w-64">
                            <input
                                type="text"
                                placeholder={t('settings.users.searchPlaceholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        <button onClick={handleOpenAddModal} className="flex-shrink-0 flex items-center bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-px text-sm">
                            <Icons.PlusIcon className="w-5 h-5 ml-2" />
                            <span>{t('settings.users.add')}</span>
                        </button>
                    </div>
                </div>
                 {error && <div className='bg-red-50 border-red-400 text-red-800 border-l-4 p-4 mb-6 text-sm' role="alert">{error}</div>}
                <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b text-gray-600">
                                <th className="p-3 font-semibold text-right">{t('settings.users.table.user')}</th>
                                <th className="p-3 font-semibold text-right">{t('addEditModal.user.roleLabel')}</th>
                                <th className="p-3 font-semibold text-center">{t('addEditModal.user.statusLabel')}</th>
                                <th className="p-3 font-semibold text-center">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                             {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-8 text-gray-500">{t('common.loading')}</td>
                                </tr>
                            ) : paginatedUsers.length > 0 ? (
                                paginatedUsers.map((user) => (
                                    <tr key={user.id} className="border-b hover:bg-gray-50 transition-colors">
                                        <td className="p-3">
                                            <div className="flex items-center">
                                                <img src={getAvatarUrl(user.avatar)} alt={user.name} className="w-10 h-10 rounded-full object-cover ml-4" />
                                                <div>
                                                    <p className="font-semibold text-gray-800">{user.name}</p>
                                                    <p className="text-xs text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3">{t(user.role as TranslationKey)}</td>
                                        <td className="p-3 text-center">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClasses(user.status)}`}>
                                                {getStatusText(user.status)}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center justify-center space-x-2 space-x-reverse">
                                                <button onClick={() => handleOpenEditModal(user)} className="p-2 text-gray-400 hover:text-yellow-500 rounded-full hover:bg-gray-100 transition-colors" aria-label={t('common.edit')}><Icons.PencilIcon className="w-5 h-5" /></button>
                                                <button onClick={() => handleOpenDeleteModal(user)} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 transition-colors" aria-label={t('common.delete')}><Icons.TrashIcon className="w-5 h-5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-8 text-gray-500">
                                        {t('settings.users.notFound')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
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
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={handleCloseDeleteModal}
                onConfirm={handleDeleteUser}
                title={t('settings.users.delete.title')}
                message={t('settings.users.delete.message', { name: userToDelete?.name || ''})}
            />
            <AddUserModal
                isOpen={isAddEditModalOpen}
                onClose={handleCloseAddEditModal}
                onSave={handleSaveUser}
                userToEdit={userToEdit}
                isSaving={isSaving}
                error={saveError}
            />
        </>
    );
};

export default UserManagement;