import React, { useState, useEffect, useMemo } from 'react';
import { Receipt, ContactInfo } from '../../types';
import * as Icons from '../icons/ModuleIcons';
import { formatCurrencySAR, extractTime } from '../../utils/formatters';
import ConfirmationModal from '../shared/ConfirmationModal';
import { API_BASE_URL } from '../../services/api';

interface ReceiptsProps {
    onNavigate: (route: { page: string; id?: string }) => void;
}

const Receipts: React.FC<ReceiptsProps> = ({ onNavigate }) => {
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<React.ReactNode | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [receiptToDelete, setReceiptToDelete] = useState<string | null>(null);
    const ITEMS_PER_PAGE = 10;

    const fetchReceipts = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}receipts.php`, { cache: 'no-cache' });
            if (!response.ok) throw new Error(`Server responded with status ${response.status}`);
            
            const text = await response.text();
            if (text.includes('aes.js')) {
                throw new Error('Hosting security challenge detected.');
            }
            const data = JSON.parse(text);

            if (data.error) throw new Error(data.error);

            const formattedData: Receipt[] = data.map((r: any) => ({
                id: String(r.id),
                status: r.status,
                date: r.date,
                createdAt: r.created_at,
                customer: { name: r.customer_name } as ContactInfo,
                total: parseFloat(r.total),
                paymentMethod: r.payment_method,
                notes: r.notes,
            }));
            setReceipts(formattedData);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
            setError(`فشل في جلب سندات القبض. يرجى التحقق من اتصالك أو حالة الخادم. الخطأ: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReceipts();
    }, []);

    const filteredReceipts = useMemo(() => {
        setCurrentPage(1);
        if (!searchTerm) return receipts;
        return receipts.filter(r =>
            r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, receipts]);

    const paginatedReceipts = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredReceipts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [currentPage, filteredReceipts]);

    const totalPages = Math.ceil(filteredReceipts.length / ITEMS_PER_PAGE);

    const getStatusBadgeClasses = (status: Receipt['status']) => {
        switch (status) {
            case 'posted': return 'bg-green-100 text-green-800';
            case 'draft': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    
    const getStatusText = (status: Receipt['status']) => {
        const statusMap = { posted: 'مرحل', draft: 'مسودة' };
        return statusMap[status];
    }

    const handleOpenDeleteModal = (id: string) => {
        setReceiptToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleCloseDeleteModal = () => {
        setReceiptToDelete(null);
        setIsDeleteModalOpen(false);
    };

    const handleDeleteReceipt = async () => {
        if (receiptToDelete) {
            try {
                const response = await fetch(`${API_BASE_URL}receipts.php`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: receiptToDelete })
                });
                if (!response.ok) throw new Error('Failed to delete.');
                const result = await response.json();
                if (!result.success) throw new Error(result.error);
                setReceipts(prev => prev.filter(r => r.id !== receiptToDelete));
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
                alert(`خطأ في حذف السند: ${errorMessage}`);
            } finally {
                handleCloseDeleteModal();
            }
        }
    };

    const handleEditReceipt = (id: string) => {
        onNavigate({ page: 'editReceipt', id });
    };

    return (
        <>
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">سندات القبض</h1>
                    <p className="text-gray-500">إدارة وإنشاء سندات القبض الخاصة بك.</p>
                </div>

                {error && (
                    <div className={'bg-red-50 border-red-400 text-red-800 border-l-4 p-4 mb-6'} role="alert">
                        <div className="text-sm">{error}</div>
                    </div>
                )}

                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md w-full">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                        <h2 className="text-xl font-semibold text-gray-800 w-full sm:w-auto">قائمة سندات القبض</h2>
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div className="relative w-full sm:w-64">
                                <input
                                    type="text"
                                    placeholder="بحث بالرقم أو العميل..."
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
                            <button onClick={() => onNavigate({ page: 'createReceipt'})} className="flex-shrink-0 flex items-center bg-emerald-600 text-white py-2 px-3 sm:px-4 rounded-lg hover:bg-emerald-700 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-px text-sm sm:text-base">
                                <Icons.PlusIcon className="w-5 h-5 sm:ml-2" />
                                <span className="hidden sm:inline mr-2">إنشاء سند قبض</span>
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b text-xs sm:text-sm text-gray-600">
                                    <th className="p-3 font-semibold text-right hidden sm:table-cell">الوقت</th>
                                    <th className="p-3 font-semibold text-right">التاريخ</th>
                                    <th className="p-3 font-semibold text-right">رقم السند</th>
                                    <th className="p-3 font-semibold text-right">العميل</th>
                                    <th className="p-3 font-semibold text-right">المبلغ</th>
                                    <th className="p-3 font-semibold text-center">الحالة</th>
                                    <th className="p-3 font-semibold text-center">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-700">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-8 text-gray-500">
                                            جاري تحميل البيانات...
                                        </td>
                                    </tr>
                                ) : paginatedReceipts.length > 0 ? (
                                    paginatedReceipts.map((r) => (
                                        <tr 
                                            key={r.id} 
                                            className="border-b hover:bg-gray-50 transition-colors cursor-pointer"
                                            onClick={() => onNavigate({ page: 'receiptDetail', id: r.id })}
                                        >
                                            <td className="p-3 hidden sm:table-cell">{extractTime(r.createdAt)}</td>
                                            <td className="p-3">{r.date}</td>
                                            <td className="p-3 font-medium text-emerald-600">{r.id}</td>
                                            <td className="p-3">{r.customer.name}</td>
                                            <td className="p-3">{formatCurrencySAR(r.total)}</td>
                                            <td className="p-3 text-center">
                                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClasses(r.status)}`}>
                                                    {getStatusText(r.status)}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <div className="flex items-center justify-center space-x-2 space-x-reverse">
                                                <button onClick={(e) => { e.stopPropagation(); handleEditReceipt(r.id); }} className="p-2 text-gray-400 hover:text-yellow-500 rounded-full hover:bg-gray-100 transition-colors" aria-label="تعديل"><Icons.PencilIcon className="w-5 h-5" /></button>
                                                <button onClick={(e) => { e.stopPropagation(); handleOpenDeleteModal(r.id); }} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 transition-colors" aria-label="حذف"><Icons.TrashIcon className="w-5 h-5" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="text-center py-8 text-gray-500">
                                           {error ? 'لا يمكن عرض البيانات حالياً.' : 'لم يتم العثور على سندات مطابقة.'}
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
                                السابق
                            </button>
                            <span className="text-sm text-gray-600">
                                صفحة {currentPage} من {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                التالي
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={handleCloseDeleteModal}
                onConfirm={handleDeleteReceipt}
                title="تأكيد حذف سند القبض"
                message={`هل أنت متأكد من رغبتك في حذف سند القبض رقم ${receiptToDelete}؟ لا يمكن التراجع عن هذا الإجراء.`}
            />
        </>
    );
};

export default Receipts;
