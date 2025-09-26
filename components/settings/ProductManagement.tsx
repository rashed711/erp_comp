import React, { useState, useEffect, useMemo } from 'react';
import { Product } from '../../types';
import * as Icons from '../icons/ModuleIcons';
import { formatCurrencySAR } from '../../utils/formatters';
import AddProductModal from './AddProductModal';
import ConfirmationModal from '../shared/ConfirmationModal';
import { getProducts as getMockProducts } from '../../services/mockApi';
import { API_BASE_URL } from '../../services/api';


const ProductManagement: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<React.ReactNode | null>(null);
    const [isUsingMockData, setIsUsingMockData] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [productToEdit, setProductToEdit] = useState<Product | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const ITEMS_PER_PAGE = 10;

    const fetchProducts = async () => {
        setIsLoading(true);
        setError(null);
        setIsUsingMockData(false);
        try {
            const response = await fetch(`${API_BASE_URL}products.php`, {
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
            setProducts(data.sort((a: Product, b: Product) => a.name.localeCompare(b.name, 'ar')));
        } catch (err: any) {
            console.error("Fetch Error:", err);
            
            let detailedError: React.ReactNode;
            
            if (err.message === 'HOSTING_SECURITY_CHALLENGE') {
                 detailedError = (
                    <div>
                        <p className="font-bold">فشل الاتصال بسبب نظام أمان الاستضافة. يتم الآن عرض بيانات تجريبية.</p>
                        <p className="mt-2"><strong>لحل المشكلة نهائياً، اذهب إلى صفحة "تشخيص الاتصال"</strong> واتبع التعليمات.</p>
                    </div>
                );
            } else if (err instanceof SyntaxError) {
                  detailedError = (
                    <div>
                        <p className="font-bold">فشل تحليل استجابة الخادم (Invalid JSON). يتم الآن عرض بيانات تجريبية.</p>
                        <p className="mt-2">هذا يعني غالبًا وجود خطأ برمجي (Fatal Error) في ملف PHP.</p>
                        <p className="mt-3 font-semibold">اذهب إلى صفحة "تشخيص الاتصال" لتحديد المشكلة بدقة.</p>
                    </div>
                );
            } else {
                detailedError = (
                    <div>
                        <p className="font-bold text-lg mb-2">فشل الاتصال بالخادم (خطأ في الشبكة)</p>
                        <p className="mb-3">حاول متصفحك طلب البيانات من الخادم، لكن الخادم رفض الاتصال. هذه المشكلة <strong>ليست خطأً في برمجة التطبيق</strong>، بل هي مشكلة في إعدادات الخادم.</p>
                        <p className="mb-3">يتم الآن عرض <strong>بيانات تجريبية للقراءة فقط</strong> كحل بديل مؤقت.</p>
                        
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
                        <p className="mt-1">اذهب إلى صفحة <strong className="text-emerald-600">"تشخيص الاتصال"</strong> من القائمة الجانبية لتحديد المشكلة بدقة.</p>
                    </div>
                );
            }
            
            setError(detailedError);
            setProducts(getMockProducts().sort((a, b) => a.name.localeCompare(b.name, 'ar')));
            setIsUsingMockData(true);
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchProducts();
    }, []);

    const filteredProducts = useMemo(() => {
        setCurrentPage(1);
        if (!searchTerm) {
            return products;
        }
        return products.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.sku.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, products]);

    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [currentPage, filteredProducts]);

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

    const handleSaveProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'sku' | 'stockQuantity'>, id: string | null) => {
        setIsSaving(true);
        setSaveError(null);
        try {
            const isEdit = !!id;
            const url = `${API_BASE_URL}products.php`;
            const method = isEdit ? 'PUT' : 'POST';
            const body = isEdit ? JSON.stringify({ ...productData, id }) : JSON.stringify(productData);
            
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
            if (result.error) {
                throw new Error(result.error);
            }

            await fetchProducts(); // Refetch all products
            handleCloseModal();
        } catch (err) {
            const errorMessage = err instanceof Error ? `فشل الطلب. تحقق من اتصالك ومن تبويب "Network" في أدوات المطور. التفاصيل: ${err.message}` : 'حدث خطأ غير متوقع.';
            setSaveError(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    const handleOpenAddModal = () => {
        setProductToEdit(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (product: Product) => {
        setProductToEdit(product);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setProductToEdit(null);
        setSaveError(null);
    };
    
    const handleOpenDeleteModal = (product: Product) => {
        setProductToDelete(product);
        setIsDeleteModalOpen(true);
    };

    const handleCloseDeleteModal = () => {
        setProductToDelete(null);
        setIsDeleteModalOpen(false);
    };

    const handleDeleteProduct = async () => {
        if (productToDelete) {
             try {
                const response = await fetch(`${API_BASE_URL}products.php`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({ id: productToDelete.id }),
                    cache: 'no-cache'
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`فشل الطلب من الخادم (HTTP ${response.status}). التفاصيل: ${errorText}`);
                }

                const result = await response.json();
                if (result.error) {
                    throw new Error(result.error);
                }
                setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
                handleCloseDeleteModal();
            } catch (err) {
                const errorMessage = err instanceof Error ? `فشل الطلب. تحقق من اتصالك ومن تبويب "Network" في أدوات المطور. التفاصيل: ${err.message}` : 'حدث خطأ غير متوقع.';
                alert(`خطأ في حذف المنتج: ${errorMessage}`);
                handleCloseDeleteModal();
            }
        }
    };

    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow-md w-full">
                 <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <div className="w-full sm:w-auto">
                        <h2 className="text-xl font-bold text-gray-800">إدارة المنتجات</h2>
                        <p className="text-sm text-gray-500 mt-1">إضافة وتعديل المنتجات والخدمات في النظام.</p>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="relative w-full sm:w-64">
                            <input
                                type="text"
                                placeholder="بحث بالاسم, الوصف..."
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
                        <button 
                            onClick={handleOpenAddModal}
                            disabled={isUsingMockData}
                            className="flex-shrink-0 flex items-center bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-px text-sm disabled:bg-gray-400 disabled:cursor-not-allowed">
                            <Icons.PlusIcon className="w-5 h-5 ml-2" />
                            <span>إضافة منتج</span>
                        </button>
                    </div>
                </div>

                {error && (
                     <div className='bg-red-50 border-red-400 text-red-800 border-l-4 p-4 mb-6 text-sm' role="alert">
                         {error}
                     </div>
                )}
                
                <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b text-gray-600 uppercase text-xs">
                                <th className="p-3 font-semibold text-right">الصورة</th>
                                <th className="p-3 font-semibold text-right">اسم المنتج</th>
                                <th className="p-3 font-semibold text-right hidden lg:table-cell">الوصف</th>
                                <th className="p-3 font-semibold text-right hidden md:table-cell">التصنيف</th>
                                <th className="p-3 font-semibold text-right hidden sm:table-cell">الوحدة</th>
                                <th className="p-3 font-semibold text-right">السعر</th>
                                <th className="p-3 font-semibold text-center">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                             {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-gray-500">
                                        <div className="flex justify-center items-center">
                                            <svg className="animate-spin h-5 w-5 text-emerald-500 ml-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            جاري تحميل البيانات...
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedProducts.length > 0 ? (
                                paginatedProducts.map((product) => (
                                    <tr key={product.id} className="border-b hover:bg-gray-50 transition-colors">
                                        <td className="p-3">
                                            <img src={product.imageUrl} alt={product.name} className="w-12 h-12 rounded-md object-cover" />
                                        </td>
                                        <td className="p-3 font-medium text-gray-800 align-middle">
                                            {product.name}
                                        </td>
                                        <td className="p-3 hidden lg:table-cell align-middle max-w-sm">
                                            <p className="truncate text-gray-600">{product.description || '-'}</p>
                                        </td>
                                        <td className="p-3 hidden md:table-cell align-middle">{product.category}</td>
                                        <td className="p-3 hidden sm:table-cell align-middle">{product.unit || '-'}</td>
                                        <td className="p-3 align-middle">{formatCurrencySAR(product.price)}</td>
                                        <td className="p-3 align-middle">
                                            <div className="flex items-center justify-center space-x-2 space-x-reverse">
                                                <button onClick={() => handleOpenEditModal(product)} disabled={isUsingMockData} className="p-2 text-gray-400 hover:text-yellow-500 rounded-full hover:bg-gray-100 transition-colors disabled:text-gray-300 disabled:cursor-not-allowed"><Icons.PencilIcon className="w-5 h-5" /></button>
                                                <button onClick={() => handleOpenDeleteModal(product)} disabled={isUsingMockData} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 transition-colors disabled:text-gray-300 disabled:cursor-not-allowed"><Icons.TrashIcon className="w-5 h-5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-gray-500">
                                        لم يتم العثور على منتجات مطابقة.
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
            <AddProductModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveProduct}
                productToEdit={productToEdit}
                isSaving={isSaving}
                error={saveError}
            />
             <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={handleCloseDeleteModal}
                onConfirm={handleDeleteProduct}
                title="تأكيد حذف المنتج"
                message={`هل أنت متأكد من رغبتك في حذف منتج "${productToDelete?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
            />
        </>
    );
};

export default ProductManagement;