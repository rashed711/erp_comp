import React, { useState, useEffect, useRef } from 'react';
import * as Icons from '../icons/ModuleIcons';
import { Product } from '../../types';

interface AddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (productData: Omit<Product, 'id' | 'createdAt' | 'sku' | 'stockQuantity'>, id: string | null) => void;
    productToEdit: Product | null;
    isSaving: boolean;
    error: string | null;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, onSave, productToEdit, isSaving, error }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Duct Accessories');
    const [unit, setUnit] = useState<'No' | 'Tone' | 'Kg' | 'MT'>('No');
    const [price, setPrice] = useState('');
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const modalRef = useRef<HTMLDivElement>(null);
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
                setName(productToEdit.name);
                setDescription(productToEdit.description || '');
                setCategory(productToEdit.category);
                setUnit(productToEdit.unit || 'No');
                setPrice(String(productToEdit.price));
                setImageUrl(productToEdit.imageUrl);
            } else {
                // Reset form for new product
                setName('');
                setDescription('');
                setCategory('Duct Accessories');
                setUnit('No');
                setPrice('');
                setImageUrl(null);
            }
        }
    }, [isOpen, productToEdit, isEditMode]);


    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImageUrl(event.target?.result as string);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            name,
            description,
            category,
            unit,
            price: parseFloat(price) || 0,
            imageUrl: imageUrl || `https://picsum.photos/seed/${name || 'default'}/100/100`,
        }, isEditMode ? productToEdit.id : null);
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
                        {/* Image Uploader */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">صورة المنتج</label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                    {imageUrl ? (
                                        <img src={imageUrl} alt="معاينة المنتج" className="mx-auto h-24 w-24 object-cover rounded-md" />
                                    ) : (
                                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                    <div className="flex text-sm text-gray-600 justify-center">
                                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-emerald-600 hover:text-emerald-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-emerald-500">
                                            <span>تحميل ملف</span>
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                                </div>
                            </div>
                        </div>

                        {/* Form Fields */}
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
                                <select id="product-category" value={category} onChange={e => setCategory(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm">
                                    <option>Duct Accessories</option>
                                    <option>Air Outlets</option>
                                    <option>Cable Tray</option>
                                </select>
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
                            
                            <div className="md:col-span-2">
                                <label htmlFor="product-price" className="block text-sm font-medium text-gray-700">السعر</label>
                                <input type="number" id="product-price" value={price} onChange={e => setPrice(e.target.value)} step="0.01" placeholder="0.00" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                            </div>
                        </div>

                         {error && (
                            <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 mt-4" role="alert">
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