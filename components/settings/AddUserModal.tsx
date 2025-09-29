import React, { useState, useEffect, useRef } from 'react';
import { User, Role } from '../../types';
import { getRoles } from '../../services/mockApi';
import { API_BASE_URL } from '../../services/api';
import { useI18n } from '../../i18n/I18nProvider';
import { TranslationKey } from '../../i18n/translations';
import Modal from '../shared/Modal';

// A generic, embedded SVG placeholder for users without an avatar.
const DEFAULT_PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2NkZTVmYSI+PHBhdGggZD0iTTIgMjB2LTJjMC0yLjIgMy42LTQgOC00czggMS44IDggNHYySDJ6bTQtMmgxMHYtLjZjMC0xLjMtMi43LTEuOS02LTEuOS0zLjMgMC02IC42LTYgMS45VjE4em02LTljMy4zIDAgNi0yLjcgNi02cy0yLjctNi02LTZzLTYgMi43LTYgNnMyLjcgNiA2IDZ6bTAtMmMyLjIgMCA0LTEuOCA0LTRzLTEuOC00LTQtNC00IDEuOC00IDRzMS44IDQgNCA0eiIvPjwvc3ZnPg==';

interface AddUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (payload: FormData, id: string | null) => void;
    userToEdit: User | null;
    isSaving: boolean;
    error: string | null;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onSave, userToEdit, isSaving, error }) => {
    const { t } = useI18n();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');
    const [status, setStatus] = useState<'active' | 'inactive'>('active');
    const [roles, setRoles] = useState<Role[]>([]);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const isEditMode = !!userToEdit;
    
    useEffect(() => {
        const availableRoles = getRoles();
        setRoles(availableRoles);
        if (availableRoles.length > 0 && !isEditMode) {
            setRole(availableRoles[0].name);
        }
    }, [isEditMode]);

    useEffect(() => {
        if (isOpen) {
            if (isEditMode) {
                const siteRoot = API_BASE_URL.replace('/api/', '/');
                const isExternalUrl = (url: string) => url.startsWith('http://') || url.startsWith('https://');
                const avatarUrl = userToEdit.avatar 
                    ? (isExternalUrl(userToEdit.avatar) ? userToEdit.avatar : `${siteRoot}${userToEdit.avatar}`) 
                    : null;

                setName(userToEdit.name);
                setEmail(userToEdit.email);
                setRole(userToEdit.role);
                setStatus(userToEdit.status);
                setImagePreview(avatarUrl);
            } else {
                setName('');
                setEmail('');
                setRole(roles.length > 0 ? roles[0].name : '');
                setStatus('active');
                setImagePreview(null);
            }
            // Reset password fields and errors regardless
            setPassword('');
            setConfirmPassword('');
            setPasswordError('');
            setSelectedFile(null);
        }
    }, [isOpen, userToEdit, isEditMode, roles]);

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

    const handleSaveClick = () => {
        setPasswordError('');
        if (!isEditMode && !password) {
            setPasswordError(t('addEditModal.user.passwordRequired'));
            return;
        }
        if (password !== confirmPassword) {
            setPasswordError(t('addEditModal.user.passwordsMismatch'));
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('role', role);
        formData.append('status', status);

        if (password) {
            formData.append('password', password);
        }

        if (selectedFile) {
            formData.append('avatar', selectedFile);
        }
        
        const idToSave = isEditMode ? userToEdit!.id : null;
        
        if (isEditMode) {
            formData.append('id', userToEdit!.id);
            if (userToEdit?.avatar && !imagePreview) {
                 formData.append('remove_avatar', '1');
            }
        }
        
        onSave(formData, idToSave);
    };

    const footer = (
        <>
            <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors">
                {t('common.cancel')}
            </button>
            <button type="button" onClick={handleSaveClick} disabled={isSaving} className="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-emerald-400 disabled:cursor-not-allowed transition-colors min-w-[120px]">
                {isSaving ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (
                    isEditMode ? t('addEditModal.saveChanges') : t('addEditModal.user.saveButton')
                )}
            </button>
        </>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditMode ? t('addEditModal.user.editTitle') : t('addEditModal.user.addTitle')}
            footer={footer}
            size="2xl"
        >
            <form onSubmit={(e) => { e.preventDefault(); handleSaveClick(); }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="user-name" className="block text-sm font-medium text-gray-700">{t('addEditModal.user.nameLabel')}</label>
                        <input type="text" id="user-name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="user-email" className="block text-sm font-medium text-gray-700">{t('addEditModal.user.emailLabel')}</label>
                        <input type="email" id="user-email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                    </div>
                     <div>
                        <label htmlFor="user-password" className="block text-sm font-medium text-gray-700">{isEditMode ? t('addEditModal.user.newPasswordLabel') : t('addEditModal.user.passwordLabel')}</label>
                        <input type="password" id="user-password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                        {isEditMode && <p className="mt-1 text-xs text-gray-500">{t('addEditModal.user.passwordHint')}</p>}
                    </div>
                    <div>
                        <label htmlFor="user-confirm-password">{t('addEditModal.user.confirmPasswordLabel')}</label>
                        <input type="password" id="user-confirm-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                    </div>
                    {passwordError && <p className="md:col-span-2 text-sm text-red-600">{passwordError}</p>}
                    <div>
                        <label htmlFor="user-role" className="block text-sm font-medium text-gray-700">{t('addEditModal.user.roleLabel')}</label>
                        <select id="user-role" value={role} onChange={e => setRole(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm">
                            {roles.map(r => <option key={r.id} value={r.name}>{t(r.name as TranslationKey)}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="user-status" className="block text-sm font-medium text-gray-700">{t('addEditModal.user.statusLabel')}</label>
                        <select id="user-status" value={status} onChange={e => setStatus(e.target.value as any)} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm">
                            <option value="active">{t('status.active')}</option>
                            <option value="inactive">{t('status.inactive')}</option>
                        </select>
                    </div>
                        <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">{t('addEditModal.user.avatarLabel')}</label>
                            <div className="mt-2 flex items-center gap-4">
                                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border">
                                <img src={imagePreview || DEFAULT_PLACEHOLDER_IMAGE} alt={t('settings.doc.previewAlt')} className="w-full h-full object-cover" />
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
                                        {imagePreview ? t('addEditModal.product.changeImage') : t('addEditModal.product.chooseImage')}
                                    </button>
                                    {imagePreview && (
                                        <button type="button" onClick={() => { setImagePreview(null); setSelectedFile(null); if(fileInputRef.current) fileInputRef.current.value = ''; }} className="text-sm text-red-600 hover:text-red-800 transition-colors text-right">
                                            {t('addEditModal.product.removeImage')}
                                        </button>
                                    )}
                                </div>
                            </div>
                    </div>
                </div>
                    {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 mt-4 text-sm" role="alert">
                        <p className="font-bold">{t('common.error')}</p>
                        <p>{error}</p>
                    </div>
                )}
            </form>
        </Modal>
    );
};

export default AddUserModal;