import React, { useState, useEffect, useMemo } from 'react';
import { Customer } from '../../types';
import * as Icons from '../icons/ModuleIcons';
import { extractTime, extractDate } from '../../utils/formatters';
import ConfirmationModal from '../shared/ConfirmationModal';
import AddCustomerModal from './AddCustomerModal';
import { API_BASE_URL } from '../../services/api';

interface CustomersProps {
    onNavigate: (route: { page: string; id?: string }) => void;
}

const Customers: React.FC<CustomersProps> = ({ onNavigate }) => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<React.ReactNode | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const ITEMS_PER_PAGE = 10;
    
    const fetchCustomers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}customers.php`, { 
                cache: 'no-cache',
                headers: { 'Accept': 'application/json' }
            });
            
            const text = await response.text();
            
            // NEW: Detect hosting security challenge
            if (text.includes('aes.js') && text.includes('document.cookie')) {
                throw new Error('HOSTING_SECURITY_CHALLENGE');
            }
            
            if (!response.ok) {
                throw new Error(`Failed to fetch. Server responded with status ${response.status}.`);
            }
            
            const data = JSON.parse(text);
            if (typeof data === 'object' && data !== null && data.error) {
                throw new Error(data.error);
            }
            setCustomers(data);
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

    useEffect(() => {
        fetchCustomers();
    }, []);

    const filteredCustomers = useMemo(() => {
        setCurrentPage(1);
        if (!searchTerm) {
            return customers;
        }
        return customers.filter(customer =>
            customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (customer.phone && customer.phone.includes(searchTerm))
        );
    }, [searchTerm, customers]);

    const paginatedCustomers = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredCustomers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [currentPage, filteredCustomers]);

    const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);

    const handleOpenDeleteModal = (customer: Customer) => {
        setCustomerToDelete(customer);
        setIsDeleteModalOpen(true);
    };

    const handleCloseDeleteModal = () => {
        setCustomerToDelete(null);
        setIsDeleteModalOpen(false);
    };

    const handleDeleteCustomer = async () => {
        if (customerToDelete) {
            try {
                const response = await fetch(`${API_BASE_URL}customers.php`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({ id: customerToDelete.id }),
                    cache: 'no-cache',
                });
                
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`فشل الطلب من الخادم (HTTP ${response.status}). التفاصيل: ${errorText}`);
                }
                
                const result = await response.json();

                if (result.success) {
                    setCustomers(prev => prev.filter(c => c.id !== customerToDelete.id));
                } else {
                    throw new Error(result.error || 'فشل حذف العميل.');
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? `فشل الطلب. تحقق من اتصالك ومن تبويب "Network" في أدوات المطور. التفاصيل: ${err.message}` : 'حدث خطأ غير متوقع.';
                alert(`خطأ في حذف العميل: ${errorMessage}`);
            } finally {
                handleCloseDeleteModal();
            }
        }
    };

    const handleOpenAddModal = () => {
        setCustomerToEdit(null);
        setSaveError(null);
        setIsAddEditModalOpen(true);
    };

    const handleOpenEditModal = (customer: Customer) => {
        setCustomerToEdit(customer);
        setSaveError(null);
        setIsAddEditModalOpen(true);
    };

    const handleCloseAddEditModal = () => {
        setIsAddEditModalOpen(false);
        setCustomerToEdit(null);
    };

    const handleSaveCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt'>, id: string | null) => {
        setIsSaving(true);
        setSaveError(null);
        
        try {
            const isEdit = !!id;
            const url = `${API_BASE_URL}customers.php`;
            const method = isEdit ? 'PUT' : 'POST';
            const body = isEdit ? JSON.stringify({ ...customerData, id }) : JSON.stringify(customerData);

            const response = await fetch(url, { 
                method, 
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, 
                body, 
                cache: 'no-cache' 
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`فشل الطلب من الخادم (HTTP ${response.status}). التفاصيل: ${errorText}`);
            }
            
            const result = await response.json();

            if (response.ok && result.success !== false) {
                 await fetchCustomers(); // Refetch all customers for consistency
                 handleCloseAddEditModal();
            } else {
                throw new Error(result.error || `فشل في ${isEdit ? 'تحديث' : 'إضافة'} العميل.`);
            }

        } catch (err) {
             const errorMessage = err instanceof Error ? `فشل الطلب. تحقق من اتصالك ومن تبويب "Network" في أدوات المطور. التفاصيل: ${err.message}` : 'حدث خطأ غير متوقع أثناء الاتصال بالخادم.';
             setSaveError(errorMessage);
             console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">العملاء</h1>
                    <p className="text-gray-500">إدارة وعرض قائمة العملاء.</p>
                </div>

                {error && (
                     <div className='bg-red-50 border-red-400 text-red-800 border-l-4 p-4 mb-6' role="alert">
                         {error}
                     </div>
                )}


                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md w-full">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                        <h2 className="text-xl font-semibold text-gray-800 w-full sm:w-auto">قائمة العملاء</h2>
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div className="relative w-full sm:w-64">
                                <input
                                    type="text"
                                    placeholder="بحث بالاسم, البريد, الهاتف..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                                </div>
                            </div>
                            <button onClick={handleOpenAddModal} className="flex-shrink-0 flex items-center bg-emerald-600 text-white py-2 px-3 sm:px-4 rounded-lg hover:bg-emerald-700 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-px text-sm sm:text-base">
                                <Icons.PlusIcon className="w-5 h-5 sm:ml-2" />
                                <span className="hidden sm:inline mr-2">إضافة عميل جديد</span>
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b text-xs sm:text-sm text-gray-600">
                                    <th className="p-3 font-semibold text-right hidden sm:table-cell">الوقت</th>
                                    <th className="p-3 font-semibold text-right">تاريخ الإنشاء</th>
                                    <th className="p-3 font-semibold text-right">الاسم</th>
                                    <th className="p-3 font-semibold text-right">البريد الإلكتروني</th>
                                    <th className="p-3 font-semibold text-right">الهاتف</th>
                                    <th className="p-3 font-semibold text-right hidden md:table-cell">العنوان</th>
                                    <th className="p-3 font-semibold text-center">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-700">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-8 text-gray-500">
                                            <div className="flex justify-center items-center">
                                                <svg className="animate-spin h-5 w-5 text-emerald-500 ml-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                جاري تحميل البيانات...
                                            </div>
                                        </td>
                                    </tr>
                                ) : paginatedCustomers.length > 0 ? (
                                    paginatedCustomers.map((customer) => (
                                        <tr 
                                            key={customer.id} 
                                            className="border-b hover:bg-gray-50 transition-colors cursor-pointer"
                                            onClick={() => onNavigate({ page: 'customerAccountStatement', id: customer.id })}
                                        >
                                            <td className="p-3 hidden sm:table-cell">{customer.createdAt ? extractTime(customer.createdAt) : '-'}</td>
                                            <td className="p-3">{customer.createdAt ? extractDate(customer.createdAt) : '-'}</td>
                                            <td className="p-3 font-medium text-gray-800">{customer.name}</td>
                                            <td className="p-3">{customer.email}</td>
                                            <td className="p-3">{customer.phone}</td>
                                            <td className="p-3 hidden md:table-cell">{customer.address}</td>
                                            <td className="p-3">
                                                <div className="flex items-center justify-center space-x-2 space-x-reverse">
                                                <button onClick={(e) => { e.stopPropagation(); handleOpenEditModal(customer); }} className="p-2 text-gray-400 hover:text-yellow-500 rounded-full hover:bg-gray-100 transition-colors" aria-label="تعديل"><Icons.PencilIcon className="w-5 h-5" /></button>
                                                <button onClick={(e) => { e.stopPropagation(); handleOpenDeleteModal(customer); }} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 transition-colors" aria-label="حذف"><Icons.TrashIcon className="w-5 h-5" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="text-center py-8 text-gray-500">
                                            {error ? 'لا يمكن عرض البيانات حالياً.' : 'لا يوجد عملاء في قاعدة البيانات. يمكنك إضافة عميل جديد.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {totalPages > 1 && !isLoading && paginatedCustomers.length > 0 && (
                        <div className="flex justify-between items-center mt-6">
                            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                                السابق
                            </button>
                            <span className="text-sm text-gray-600">صفحة {currentPage} من {totalPages}</span>
                            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                                التالي
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={handleCloseDeleteModal}
                onConfirm={handleDeleteCustomer}
                title="تأكيد حذف العميل"
                message={`هل أنت متأكد من رغبتك في حذف العميل "${customerToDelete?.name}"؟ سيتم حذف جميع البيانات المرتبطة به.`}
            />
            <AddCustomerModal
                isOpen={isAddEditModalOpen}
                onClose={handleCloseAddEditModal}
                onSave={handleSaveCustomer}
                customerToEdit={customerToEdit}
                isSaving={isSaving}
                error={saveError}
            />
        </>
    );
};

export default Customers;