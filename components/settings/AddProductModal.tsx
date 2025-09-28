import React, { useState, useEffect, useRef } from 'react';
import * as Icons from '../icons/ModuleIcons';
import { Product } from '../../types';
import { API_BASE_URL } from '../../services/api';

// A generic, embedded SVG placeholder for products without an image.
const DEFAULT_PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2NkZTVmYSI+PHBhdGggZD0iTTE5IDNINWMtMS4xIDAtMiAuOS0yIDJ2MTRjMCAxLjEuOSAyIDIgMmgxNGMxLjEgMCAyLS45IDItMlY1YzAtMS4xLS45LTItMi0yem0wIDE2SDVWNWgxNHYxNHptLTUuMDQtNi43MWwtMi43NSAyLjc1bC0yLjE3LTIuMTdMMTYuMTcgMTRMOC40MyA2LjI2TDUgOS42OVYxOUgxOVYxMC41bC0yLjUtMi41eiIvPjwvc3ZnPg==';

interface AddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (payload: FormData, id: string | null) => void;
    productToEdit: Product | null;
    isSaving: boolean;
    error: string | null;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, onSave, productToEdit, isSaving, error }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('General');
    const [unit, setUnit] = useState<'No' | 'Tone' | 'Kg' | 'MT'>('No');
    const [averagePurchasePrice, setAveragePurchasePrice] = useState('');
    const [averageSalePrice, setAverageSalePrice] = useState('');
    
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const modalRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isEditMode = !!productToEdit;

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleOutsideClick);
        }

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [isOpen, onClose]);
    
    useEffect(() => {
        if (isOpen) {
            if (isEditMode) {
                const siteRoot = API_BASE_URL.replace('/api/', '/');
                const isExternalUrl = (url: string) => url.startsWith('http://') || url.startsWith('https://');
                const imageUrl = productToEdit.imageUrl 
                    ? (isExternalUrl(productToEdit.imageUrl) ? productToEdit.imageUrl : `${siteRoot}${productToEdit.imageUrl}`) 
                    : null;

                setName(productToEdit.name);
                setDescription(productToEdit.description || '');
                setCategory(productToEdit.category);
                setUnit(productToEdit.unit || 'No');
                setAveragePurchasePrice(String(productToEdit.averagePurchasePrice || ''));
                setAverageSalePrice(String(productToEdit.averageSalePrice || ''));
                setImagePreview(imageUrl);
                setSelectedFile(null);
            } else {
                setName('');
                setDescription('');
                setCategory('General');
                setUnit('No');
                setAveragePurchasePrice('');
                setAverageSalePrice('');
                setImagePreview(null);
                setSelectedFile(null);
            }
        }
    }, [isOpen, productToEdit, isEditMode]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('category', category);
        formData.append('unit', unit);
        formData.append('average_purchase_price', averagePurchasePrice || '0.00');
        formData.append('average_sale_price', averageSalePrice || '0.00');
        
        if (selectedFile) {
            formData.append('image', selectedFile);
        }

        const idToSave = isEditMode ? productToEdit!.id : null;

        if (isEditMode) {
            if (productToEdit?.imageUrl && !imagePreview) {
                 formData.append('remove_image', '1');
            }
        }

        onSave(formData, idToSave);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300 animate-fade-in">
            <div ref={modalRef} className="bg-white rounded-lg shadow-xl w-full max-w-2xl transform transition-all duration-300" style={{ animation: 'fadeInUp 0.3s ease-out forwards' }}>
                <div className="flex justify-between items-center p-5 border-b">
                    <h3 className="text-xl font-bold text-gray-800">{isEditMode ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <Icons.XIcon className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label htmlFor="product-name" className="block text-sm font-medium text-gray-700">اسم المنتج*</label>
                                <input type="text" id="product-name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="product-description" className="block text-sm font-medium text-gray-700">الوصف</label>
                                <textarea id="product-description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"></textarea>
                            </div>

                            <div>
                                <label htmlFor="product-category" className="block text-sm font-medium text-gray-700">التصنيف</label>
                                <input type="text" id="product-category" value={category} onChange={e => setCategory(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />

                            </div>

                             <div>
                                <label htmlFor="product-unit" className="block text-sm font-medium text-gray-700">الوحدة</label>
                                <select id="product-unit" value={unit} onChange={e => setUnit(e.target.value as any)} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm">
                                    <option>No</option>
                                    <option>Tone</option>
                                    <option>Kg</option>
                                    <option>MT</option>
                                </select>
                            </div>
                            
                            <div>
                                <label htmlFor="average-purchase-price" className="block text-sm font-medium text-gray-700">متوسط سعر الشراء*</label>
                                <input type="number" id="average-purchase-price" value={averagePurchasePrice} onChange={e => setAveragePurchasePrice(e.target.value)} required step="0.01" placeholder="0.00" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                            </div>

                            <div>
                                <label htmlFor="average-sale-price" className="block text-sm font-medium text-gray-700">متوسط سعر البيع*</label>
                                <input type="number" id="average-sale-price" value={averageSalePrice} onChange={e => setAverageSalePrice(e.target.value)} required step="0.01" placeholder="0.00" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                            </div>
                            
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">صورة المنتج</label>
                                <div className="mt-2 flex items-center gap-4">
                                    <div className="w-20 h-20 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden border">
                                        <img src={imagePreview || DEFAULT_PLACEHOLDER_IMAGE} alt="معاينة" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            onChange={handleFileChange} 
                                            accept="image/*" 
                                            className="hidden" 
                                        />
                                        <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 transition-all duration-200">
                                            {imagePreview ? 'تغيير الصورة' : 'اختيار صورة'}
                                        </button>
                                        {imagePreview && (
                                            <button type="button" onClick={() => { setImagePreview(null); setSelectedFile(null); if(fileInputRef.current) fileInputRef.current.value = ''; }} className="text-sm text-red-600 hover:text-red-800 transition-colors text-right">
                                                إزالة الصورة
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                         {error && (
                            <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 mt-4 text-sm" role="alert">
                                <p className="font-bold">حدث خطأ</p>
                                <p>{error}</p>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end items-center p-5 border-t bg-gray-50 rounded-b-lg space-x-3 space-x-reverse">
                        <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors">
                            إلغاء
                        </button>
                        <button type="submit" disabled={isSaving} className="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-emerald-400 disabled:cursor-not-allowed transition-colors min-w-[120px]">
                            {isSaving ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                isEditMode ? 'حفظ التغييرات' : 'حفظ المنتج'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProductModal;