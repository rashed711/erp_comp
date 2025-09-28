import React, { useState, useEffect, useMemo } from 'react';
import { SupplierInvoice, ContactInfo } from '../../types';
import * as Icons from '../icons/ModuleIcons';
import { formatCurrency, extractTime } from '../../utils/formatters';
import ConfirmationModal from '../shared/ConfirmationModal';
import { API_BASE_URL } from '../../services/api';
import { useI18n } from '../../i18n/I18nProvider';

interface SupplierInvoicesProps {
    onNavigate: (route: { page: string; id?: string }) => void;
}

const SupplierInvoices: React.FC<SupplierInvoicesProps> = ({ onNavigate }) => {
    const { t, language } = useI18n();
    const [invoices, setInvoices] = useState<SupplierInvoice[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<React.ReactNode | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
         const fetchInvoices = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_BASE_URL}supplier_invoices.php`, {
                    cache: 'no-cache',
                    headers: { 'Accept': 'application/json' }
                });

                const text = await response.text();
                
                if (text.includes('aes.js') && text.includes('document.cookie')) {
                    throw new Error('HOSTING_SECURITY_CHALLENGE');
                }
    
                if (!response.ok) {
                    throw new Error(`فشل الجلب. استجاب الخادم بحالة ${response.status}.`);
                }
                
                const data = JSON.parse(text);

                if (data.error) {
                    throw new Error(data.error);
                }
                // FIX: Correctly map the incoming data to the SupplierInvoice type.
                const formattedData: SupplierInvoice[] = data.map((inv: any) => ({
                    id: String(inv.id),
                    supplierId: String(inv.supplier_id),
                    supplierInvoiceNumber: inv.supplier_invoice_number,
                    status: inv.status,
                    invoiceDate: inv.invoice_date,
                    dueDate: inv.due_date,
                    createdAt: inv.created_at,
                    supplier: { name: inv.supplier_name } as ContactInfo,
                    total: parseFloat(inv.total),
                    items: [],
                    subtotal: 0, tax: {rate: 0, amount: 0}, discount: {type: 'fixed', value: 0, amount: 0},
                    currency: { code: inv.currency_code || 'SAR', symbol: inv.currency_symbol || 'ر.س' },
                }));
                setInvoices(formattedData);
            } catch (err: any) {
                console.error("Fetch Error:", err);
                let detailedError: React.ReactNode;
                
                if (err.message === 'HOSTING_SECURITY_CHALLENGE') {
                    detailedError = (
                        <div>
                            <p className="font-bold">تم اكتشاف المشكلة: نظام أمان الاستضافة يمنع الوصول.</p>
                            <p className="mt-2">يقوم خادم الاستضافة الخاص بك بإرجاع "صفحة تحقق JavaScript" بدلاً من البيانات المطلوبة. هذا الإجراء الأمني هو السبب المباشر لخطأ "Invalid JSON response" ويجب تعطيله لواجهة API لكي يعمل التطبيق.</p>
                            <p className="mt-3 font-semibold text-red-700">الحل النهائي (يرجى إرساله للدعم الفني):</p>
                            <p>تواصل مع الدعم الفني لشركة الاستضافة فورًا وأرسل لهم هذه الرسالة (باللغة الإنجليزية لضمان الوضوح):</p>
                             <pre className="mt-2 p-3 bg-gray-100 text-gray-800 rounded-md text-xs text-left" dir="ltr">
                                {`Hello,\n\nMy frontend application is making API requests to my PHP scripts in the /api/ directory. Your server's security system (e.g., WAF, Anti-Bot) is blocking these requests by returning a JavaScript challenge page.\n\nThis is preventing my application from functioning correctly. Please whitelist my /api/ directory and disable the "JavaScript Challenge" / "Bot Protection" security feature for that specific path.\n\nThank you.`}
                             </pre>
                             <p className="mt-2">بعد أن يقوموا بتعطيل هذه الميزة، ستُحل المشكلة نهائياً.</p>
                        </div>
                    );
                } else if (err instanceof SyntaxError) {
                     detailedError = (
                        <div>
                            <p className="font-bold">فشل تحليل استجابة الخادم (Invalid JSON).</p>
                            <p className="mt-2">هذا يعني غالبًا وجود خطأ برمجي (Fatal Error) في ملف PHP يمنعه من إخراج بيانات JSON صحيحة.</p>
                            <p className="mt-3 font-semibold">اذهب إلى صفحة "تشخيص الاتصال" لتحديد المشكلة بدقة.</p>
                        </div>
                    );
                } else {
                    detailedError = (
                        <div>
                            <p className="font-bold text-lg mb-2">فشل الاتصال بالخادم (خطأ في الشبكة)</p>
                            <p className="mb-3">حاول متصفحك طلب البيانات من الخادم، لكن الخادم رفض الاتصال. هذه المشكلة <strong>ليست خطأً في برمجة التطبيق</strong>، بل هي مشكلة في إعدادات الخادم الذي تستضيف عليه ملفات PHP.</p>
                            
                            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                                <p className="font-semibold text-red-800">السبب الأكثر شيوعاً: مشكلة CORS</p>
                                <p className="text-sm mt-1">يمنع الخادم الخاص بك هذا الموقع من الوصول إلى بياناته كإجراء أمني افتراضي.</p>
                            </div>
                
                            <p className="mt-4 font-semibold text-gray-800">الحل المضمون (لإرساله للدعم الفني):</p>
                            <p className="text-sm mt-1">تواصل مع الدعم الفني لشركة الاستضافة وأرسل لهم هذه الرسالة (يفضل باللغة الإنجليزية):</p>
                            <pre className="mt-2 p-3 bg-gray-100 text-gray-800 rounded-md text-xs text-left leading-relaxed" dir="ltr">
                                {`Subject: Urgent - CORS Policy Blocking API Access\n\nHello Support Team,\n\nMy frontend application, hosted at [Your Website URL], cannot access my PHP API located in the /api/ directory on my server.\n\nThe browser's console shows a "Cross-Origin Resource Sharing (CORS)" error, which means the server is blocking the requests.\n\nPlease add the following HTTP header to the configuration for the /api/ directory to resolve this issue:\n\nAccess-Control-Allow-Origin: *\n\nThis will allow my application to function correctly. Thank you.`}
                            </pre>
                            <p className="text-xs mt-1 text-gray-500">ملاحظة: استبدل [Your Website URL] برابط موقعك الفعلي.</p>
                
                            <p className="mt-4 font-semibold text-gray-800">لتشخيص إضافي:</p>
                            <button onClick={() => onNavigate({ page: 'serverTest' })} className="mt-2 w-full text-center bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors font-semibold flex items-center justify-center">
                                <Icons.AdjustmentsHorizontalIcon className="w-5 h-5 inline-block ml-2" />
                                انقر هنا لتشغيل أداة تشخيص الخادم
                            </button>
                        </div>
                    );
                }
                setError(detailedError);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInvoices();
    }, [onNavigate]);

    const filteredInvoices = useMemo(() => {
        setCurrentPage(1);
        if (!searchTerm) {
            return invoices;
        }
        return invoices.filter(inv =>
            inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (inv.supplierInvoiceNumber && inv.supplierInvoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [searchTerm, invoices]);

    const paginatedInvoices = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredInvoices.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [currentPage, filteredInvoices]);

    const totalPages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE);

    const getStatusBadgeClasses = (status: SupplierInvoice['status']) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-800';
            case 'unpaid': return 'bg-yellow-100 text-yellow-800';
            case 'overdue': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    
    const getStatusText = (status: SupplierInvoice['status']) => {
        const statusMap = { paid: t('status.paid'), unpaid: t('status.unpaid'), overdue: t('status.overdue') };
        return statusMap[status];
    }

    const handleOpenDeleteModal = (id: string) => {
        setInvoiceToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleCloseDeleteModal = () => {
        setInvoiceToDelete(null);
        setIsDeleteModalOpen(false);
    };

    const handleDeleteInvoice = async () => {
        if (invoiceToDelete) {
           alert("ميزة الحذف قيد التطوير.");
           handleCloseDeleteModal();
        }
    };

    const handleEditInvoice = (id: string) => {
        alert(`ميزة التعديل لهذه الصفحة قيد التطوير حاليًا.`);
    };

    return (
        <>
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">{t('supplierInvoices.title')}</h1>
                    <p className="text-gray-500">{t('supplierInvoices.description')}</p>
                </div>

                {error && (
                    <div className={'bg-red-50 border-red-400 text-red-800 border-l-4 p-4 mb-6'} role="alert">
                        <div className="text-sm">{error}</div>
                    </div>
                )}
                
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md w-full">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                        <h2 className="text-xl font-semibold text-gray-800 w-full sm:w-auto">{t('supplierInvoices.listTitle')}</h2>
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div className="relative w-full sm:w-64">
                                <input
                                    type="text"
                                    placeholder={t('supplierInvoices.searchPlaceholder')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                                </div>
                            </div>
                            <button 
                                onClick={() => onNavigate({ page: 'createSupplierInvoice' })}
                                className="flex-shrink-0 flex items-center bg-emerald-600 text-white py-2 px-3 sm:px-4 rounded-lg hover:bg-emerald-700 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-px text-sm sm:text-base">
                                <Icons.PlusIcon className="w-5 h-5 sm:ml-2" />
                                <span className="hidden sm:inline mr-2">{t('supplierInvoices.create')}</span>
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b text-xs sm:text-sm text-gray-600">
                                    <th className="p-3 font-semibold text-right hidden sm:table-cell">{t('common.time')}</th>
                                    <th className="p-3 font-semibold text-right">{t('common.date')}</th>
                                    <th className="p-3 font-semibold text-right">{t('supplierInvoices.table.number')}</th>
                                    <th className="p-3 font-semibold text-right">{t('supplierInvoices.table.supplier')}</th>
                                    <th className="p-3 font-semibold text-right">{t('common.total')}</th>
                                    <th className="p-3 font-semibold text-center">{t('common.status')}</th>
                                    <th className="p-3 font-semibold text-center">{t('common.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-700">
                                 {isLoading ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-8 text-gray-500">
                                            <div className="flex justify-center items-center">
                                                <svg className="animate-spin h-5 w-5 text-emerald-500 ml-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                {t('common.loading')}
                                            </div>
                                        </td>
                                    </tr>
                                ) : paginatedInvoices.length > 0 ? (
                                    paginatedInvoices.map((invoice) => (
                                        <tr 
                                            key={invoice.id} 
                                            className="border-b hover:bg-gray-50 transition-colors cursor-pointer"
                                            onClick={() => onNavigate({ page: 'supplierInvoiceDetail', id: invoice.id })}
                                        >
                                            <td className="p-3 hidden sm:table-cell">{extractTime(invoice.createdAt, language)}</td>
                                            <td className="p-3">{invoice.invoiceDate}</td>
                                            <td className="p-3 font-medium text-emerald-600">{invoice.id}</td>
                                            <td className="p-3">{invoice.supplier.name}</td>
                                            <td className="p-3">{formatCurrency(invoice.total, invoice.currency.symbol)}</td>
                                            <td className="p-3 text-center">
                                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClasses(invoice.status)}`}>{getStatusText(invoice.status)}</span>
                                            </td>
                                            <td className="p-3">
                                                <div className="flex items-center justify-center space-x-2 space-x-reverse">
                                                <button onClick={(e) => { e.stopPropagation(); handleEditInvoice(invoice.id); }} className="p-2 text-gray-400 hover:text-yellow-500 rounded-full hover:bg-gray-100 transition-colors" aria-label={t('common.edit')}><Icons.PencilIcon className="w-5 h-5" /></button>
                                                <button onClick={(e) => { e.stopPropagation(); handleOpenDeleteModal(invoice.id); }} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 transition-colors" aria-label={t('common.delete')}><Icons.TrashIcon className="w-5 h-5" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="text-center py-8 text-gray-500">
                                            {error ? t('listPage.noDataApiError') : t('supplierInvoices.notFound')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {totalPages > 1 && (
                        <div className="flex justify-between items-center mt-6">
                            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                                {t('common.previous')}
                            </button>
                            <span className="text-sm text-gray-600">{t('common.page')} {currentPage} {t('common.of')} {totalPages}</span>
                            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                                {t('common.next')}
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={handleCloseDeleteModal}
                onConfirm={handleDeleteInvoice}
                title={t('supplierInvoices.delete.title')}
                message={t('supplierInvoices.delete.message', { id: invoiceToDelete || '' })}
            />
        </>
    );
};

export default SupplierInvoices;