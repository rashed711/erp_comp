import React, { useState, useEffect } from 'react';
import { Supplier } from '../../types';
import { useI18n } from '../../i18n/I18nProvider';
import Modal from '../shared/Modal';

interface AddSupplierModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (supplierData: Omit<Supplier, 'id' | 'createdAt'>, id: string | null) => void;
    supplierToEdit: Supplier | null;
    isSaving: boolean;
    error: string | null;
}

const AddSupplierModal: React.FC<AddSupplierModalProps> = ({ isOpen, onClose, onSave, supplierToEdit, isSaving, error }) => {
    const { t } = useI18n();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');

    const isEditMode = !!supplierToEdit;

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

    const handleSaveClick = () => {
        onSave({ name, email, phone, address }, isEditMode ? supplierToEdit.id : null);
    };

    const footer = (
        <>
            <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors">
                {t('common.cancel')}
            </button>
            <button type="button" onClick={handleSaveClick} disabled={isSaving} className="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-emerald-400 disabled:cursor-not-allowed transition-colors min-w-[100px]">
                {isSaving ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (
                    isEditMode ? t('addEditModal.saveChanges') : t('addEditModal.supplier.saveButton')
                )}
            </button>
        </>
    );

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={isEditMode ? t('addEditModal.supplier.editTitle') : t('addEditModal.supplier.addTitle')} 
            footer={footer}
        >
             <form onSubmit={(e) => { e.preventDefault(); handleSaveClick(); }} className="space-y-4">
                <div>
                    <label htmlFor="supplier-name" className="block text-sm font-medium text-gray-700">{t('addEditModal.supplier.nameLabel')}</label>
                    <input type="text" id="supplier-name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="supplier-email" className="block text-sm font-medium text-gray-700">{t('addEditModal.customer.emailLabel')}</label>
                    <input type="email" id="supplier-email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="supplier-phone" className="block text-sm font-medium text-gray-700">{t('addEditModal.customer.phoneLabel')}</label>
                    <input type="tel" id="supplier-phone" value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="supplier-address" className="block text-sm font-medium text-gray-700">{t('addEditModal.customer.addressLabel')}</label>
                    <textarea id="supplier-address" value={address} onChange={e => setAddress(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"></textarea>
                </div>
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 mt-4" role="alert">
                        <p className="font-bold">{t('common.error')}</p>
                        <p>{error}</p>
                    </div>
                )}
            </form>
        </Modal>
    );
};

export default AddSupplierModal;
