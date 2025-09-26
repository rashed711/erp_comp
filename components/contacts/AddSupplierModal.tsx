import React, { useState, useEffect, useRef } from 'react';
import * as Icons from '../icons/ModuleIcons';
import { Supplier } from '../../types';

interface AddSupplierModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (supplierData: Omit<Supplier, 'id' | 'createdAt'>, id: string | null) => void;
    supplierToEdit: Supplier | null;
    isSaving: boolean;
    error: string | null;
}

const AddSupplierModal: React.FC<AddSupplierModalProps> = ({ isOpen, onClose, onSave, supplierToEdit, isSaving, error }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');

    const modalRef = useRef<HTMLDivElement>(null);
    const isEditMode = !!supplierToEdit;

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
                setName(supplierToEdit.name);
                setEmail(supplierToEdit.email);
                setPhone(supplierToEdit.phone);
                setAddress(supplierToEdit.address);
            } else {
                setName('');
                setEmail('');
                setPhone('');
                setAddress('');
            }
        }
    }, [isOpen, supplierToEdit, isEditMode]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, email, phone, address }, isEditMode ? supplierToEdit.id : null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300 animate-fade-in">
            <div ref={modalRef} className="bg-white rounded-lg shadow-xl w-full max-w-lg transform transition-all duration-300" style={{ animation: 'fadeInUp 0.3s ease-out forwards' }}>
                <div className="flex justify-between items-center p-5 border-b">
                    <h3 className="text-xl font-bold text-gray-800">{isEditMode ? 'تعديل بيانات المورد' : 'إضافة مورد جديد'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <Icons.XIcon className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div>
                            <label htmlFor="supplier-name" className="block text-sm font-medium text-gray-700">اسم المورد*</label>
                            <input type="text" id="supplier-name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="supplier-email" className="block text-sm font-medium text-gray-700">البريد الإلكتروني</label>
                            <input type="email" id="supplier-email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="supplier-phone" className="block text-sm font-medium text-gray-700">رقم الهاتف</label>
                            <input type="tel" id="supplier-phone" value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="supplier-address" className="block text-sm font-medium text-gray-700">العنوان</label>
                            <textarea id="supplier-address" value={address} onChange={e => setAddress(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"></textarea>
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
                        <button type="submit" disabled={isSaving} className="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-emerald-400 disabled:cursor-not-allowed transition-colors min-w-[100px]">
                            {isSaving ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                isEditMode ? 'حفظ التغييرات' : 'حفظ المورد'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddSupplierModal;