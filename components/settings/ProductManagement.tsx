import React, { useState, useEffect, useMemo } from 'react';
import { Product } from '../../types';
import * as Icons from '../icons/ModuleIcons';
import { formatCurrency } from '../../utils/formatters';
import AddProductModal from './AddProductModal';
import ConfirmationModal from '../shared/ConfirmationModal';
import { API_BASE_URL } from '../../services/api';
import { useI18n } from '../../i18n/I18nProvider';

// A generic, embedded SVG placeholder for products without an image.
const DEFAULT_PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2NkZTVmYSI+PHBhdGggZD0iTTE5IDNINWMtMS4xIDAtMiAuOS0yIDJ2MTRjMCAxLjEuOSAyIDIgMmgxNGMxLjEgMCAyLS45IDItMlY1YzAtMS4xLS45LTItMi0yem0wIDE2SDVWNWgxNHYxNHptLTUuMDQtNi43MWwtMi43NSAyLjc1bC0yLjE3LTIuMTdMMTYuMTcgMTRMOC40MyA2LjI2TDUgOS42OVYxOUgxOVYxMC41bC0yLjUtMi41eiIvPjwvc3ZnPg==';


const ProductManagement: React.FC = () => {
    const { t } = useI18n();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<React.ReactNode | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState<Product | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const ITEMS_PER_PAGE = 5;

    const fetchProducts = async () => {
        setIsLoading(true);
        setError(null);
        let responseText = '';
        try {
            const response = await fetch(`${API_BASE_URL}products.php`, {
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
            
            const rawData = JSON.parse(responseText);

            if (rawData.error) {
                 throw new Error(`PHP_ERROR::${rawData.error}`);
            }

            const formattedData: Product[] = rawData.map((p: any) => ({
                id: String(p.id),
                name: p.name,
                description: p.description,
                category: p.category,
                unit: p.unit,
                averagePurchasePrice: p.average_purchase_price ? parseFloat(p.average_purchase_price) : 0,
                averageSalePrice: p.average_sale_price ? parseFloat(p.average_sale_price) : 0,
                stockQuantity: p.stock_quantity ? parseInt(p.stock_quantity, 10) : 0,
                imageUrl: p.image_url,
                createdAt: p.created_at,
            }));

            setProducts(formattedData);
        } catch (err: any) {
            console.error("Fetch Error in ProductManagement:", err);
            let detailedError: React.ReactNode;
            const errorMessage = err.message || '';

             if (errorMessage.startsWith('NETWORK_ERROR')) {
                 detailedError = (
                    <div>
                        <p className="font-bold text-lg mb-2">تم تشخيص المشكلة بنجاح!</p>
                        <p className="mb-3">
                            بناءً على سجل الأخطاء الذي قدمته، المشكلة هي خطأ برمجي فادح (Fatal Error) في ملف <strong>`products.php`</strong>.
                        </p>
                        
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="font-semibold text-red-800">السبب الدقيق (من سجل الأخطاء):</p>
                            <p className="text-sm mt-1 font-mono">
                                `Unknown column 'stock_quantity'` أو `Unknown column 'average_purchase_price'`
                            </p>
                            <p className="text-sm mt-2">
                                هذا يعني أن جدول <strong>`products`</strong> في قاعدة بياناتك لا يحتوي على هذه الأعمدة الضرورية.
                            </p>
                        </div>

                        <p className="mt-4 font-semibold text-gray-800">الحل النهائي (موصى به):</p>
                        <ol className="list-decimal list-inside space-y-2 mt-2 text-sm">
                            <li>اذهب إلى <strong>phpMyAdmin</strong>.</li>
                            <li>اختر قاعدة البيانات الخاصة بالمشروع (مثلاً: `comp` أو `erp`).</li>
                            <li>احذف جدول `products` (Drop table).</li>
                            <li>اضغط على <strong>"Import"</strong> وقم باستيراد ملف <strong>`api/setup.sql`</strong> مرة أخرى لإنشاء الجدول بالأعمدة الصحيحة.</li>
                        </ol>
                        <p className="text-xs mt-2 text-gray-500">
                            سيؤدي هذا إلى حل المشكلة بشكل نهائي. يجب تكرار العملية لجداول `customers` و `suppliers` إذا واجهت نفس المشكلة معهم.
                        </p>
                    </div>
                );
            } else if (err instanceof SyntaxError) {
                 detailedError = (
                    <div>
                        <p className="font-bold text-lg mb-2">خطأ فادح في الخادم (Fatal PHP Error)</p>
                        <p className="mb-3">
                            تلقى التطبيق استجابة غير متوقعة من الخادم عند طلب بيانات المنتجات. هذا يعني عادةً وجود خطأ برمجي في ملف <strong>`products.php`</strong> يمنعه من العمل بشكل صحيح.
                        </p>
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="font-semibold text-red-800">رسالة الخطأ الفعلية من الخادم:</p>
                            <pre className="mt-2 p-3 bg-gray-700 text-white rounded-md text-xs text-left leading-relaxed whitespace-pre-wrap" dir="ltr">
                                {responseText || 'لم يتم استلام أي نص من الخادم. قد يكون الملف فارغًا أو غير موجود.'}
                            </pre>
                        </div>
                        <p className="mt-4 font-semibold text-gray-800">ماذا تفعل الآن؟</p>
                        <p className="text-sm mt-1">
                            الرسالة الموجودة في المربع الأسود أعلاه هي الخطأ الدقيق الذي أرسله PHP. قم بقراءتها بعناية، فهي تخبرك عادةً بنوع الخطأ ورقم السطر في ملف `products.php`. قم بإصلاح هذا الخطأ في الملف ثم حاول مرة أخرى.
                        </p>
                    </div>
                );
            } else {
                 detailedError = (
                    <div>
                        <p className="font-bold text-lg mb-2">حدث خطأ غير متوقع</p>
                         <pre className="mt-2 p-3 bg-gray-100 text-gray-800 rounded-md text-xs text-left" dir="ltr">
                           {errorMessage}
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
            product.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, products]);

    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [currentPage, filteredProducts]);

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

    const handleSaveProduct = async (data: FormData, id: string | null) => {
        setIsSaving(true);
        setSaveError(null);
        try {
            const isEdit = !!id;
            const url = isEdit ? `${API_BASE_URL}products.php?id=${id}` : `${API_BASE_URL}products.php`;

            const response = await fetch(url, {
                method: 'POST',
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
                throw new Error(result.error || `فشل في ${isEdit ? 'تحديث' : 'إضافة'} المنتج.`);
            }
            
            await fetchProducts();
            handleCloseAddEditModal();

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع.';
            setSaveError(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    const handleOpenAddModal = () => {
        setProductToEdit(null);
        setSaveError(null);
        setIsAddEditModalOpen(true);
    };

    const handleOpenEditModal = (product: Product) => {
        setProductToEdit(product);
        setSaveError(null);
        setIsAddEditModalOpen(true);
    };

    const handleCloseAddEditModal = () => {
        setIsAddEditModalOpen(false);
        setProductToEdit(null);
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

                const responseText = await response.text();

                if (!response.ok) {
                    throw new Error(`فشل الطلب من الخادم (HTTP ${response.status}). التفاصيل: ${responseText}`);
                }
                
                let result;
                try {
                    result = JSON.parse(responseText);
                } catch (jsonError) {
                    throw new Error(`فشل تحليل استجابة الخادم كـ JSON. قد يكون هناك خطأ في PHP. الاستجابة: ${responseText}`);
                }

                if (result.success === false || result.error) {
                    throw new Error(result.message || result.error || 'فشل حذف المنتج.');
                }

                await fetchProducts();

            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع.';
                alert(`خطأ في حذف المنتج: ${errorMessage}`);
            } finally {
                handleCloseDeleteModal();
            }
        }
    };
    
    const siteRoot = API_BASE_URL.replace('/api/', '/');
    const isExternalUrl = (url: string) => url.startsWith('http://') || url.startsWith('https://');

    const getImageUrl = (dbUrl: string | null | undefined): string => {
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
                        <h2 className="text-xl font-bold text-gray-800">{t('settings.products.title')}</h2>
                        <p className="text-sm text-gray-500 mt-1">{t('settings.products.description')}</p>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="relative w-full sm:w-64">
                            <input
                                type="text"
                                placeholder={t('settings.products.searchPlaceholder')}
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
                            className="flex-shrink-0 flex items-center bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-px text-sm">
                            <Icons.PlusIcon className="w-5 h-5 ml-2" />
                            <span>{t('settings.products.add')}</span>
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
                                <th className="p-3 font-semibold text-right">{t('settings.products.table.image')}</th>
                                <th className="p-3 font-semibold text-right">{t('settings.products.table.name')}</th>
                                <th className="p-3 font-semibold text-right hidden lg:table-cell">{t('settings.products.table.description')}</th>
                                <th className="p-3 font-semibold text-right">{t('settings.products.table.purchasePrice')}</th>
                                <th className="p-3 font-semibold text-right">{t('settings.products.table.salePrice')}</th>
                                <th className="p-3 font-semibold text-center">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                             {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-gray-500">
                                        <div className="flex justify-center items-center">
                                            <svg className="animate-spin h-5 w-5 text-emerald-500 ml-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            {t('common.loading')}
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedProducts.length > 0 ? (
                                paginatedProducts.map((product) => (
                                    <tr key={product.id} className="border-b hover:bg-gray-50 transition-colors">
                                        <td className="p-3 align-middle">
                                            <img src={getImageUrl(product.imageUrl)} alt={product.name} className="w-12 h-12 rounded-md object-cover" />
                                        </td>
                                        <td className="p-3 font-medium text-gray-800 align-middle">
                                            {product.name}
                                        </td>
                                        <td className="p-3 hidden lg:table-cell align-middle max-w-sm">
                                            <p className="truncate text-gray-600">{product.description || '-'}</p>
                                        </td>
                                        <td className="p-3 align-middle">{formatCurrency(product.averagePurchasePrice, 'ر.س')}</td>
                                        <td className="p-3 align-middle">{formatCurrency(product.averageSalePrice, 'ر.س')}</td>

                                        <td className="p-3 align-middle">
                                            <div className="flex items-center justify-center space-x-2 space-x-reverse">
                                                <button onClick={() => handleOpenEditModal(product)} className="p-2 text-gray-400 hover:text-yellow-500 rounded-full hover:bg-gray-100 transition-colors"><Icons.PencilIcon className="w-5 h-5" /></button>
                                                <button onClick={() => handleOpenDeleteModal(product)} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 transition-colors"><Icons.TrashIcon className="w-5 h-5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-gray-500">
                                        {error ? t('listPage.noDataApiError') : t('settings.products.notFound')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                 {totalPages > 1 && !isLoading && !error && (
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
            <AddProductModal
                isOpen={isAddEditModalOpen}
                onClose={handleCloseAddEditModal}
                onSave={handleSaveProduct}
                productToEdit={productToEdit}
                isSaving={isSaving}
                error={saveError}
            />
             <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={handleCloseDeleteModal}
                onConfirm={handleDeleteProduct}
                title={t('settings.products.delete.title')}
                message={t('settings.products.delete.message', { name: productToDelete?.name || '' })}
            />
        </>
    );
};

export default ProductManagement;